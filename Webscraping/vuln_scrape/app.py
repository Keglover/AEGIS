import os
import json
import requests
from dotenv import load_dotenv
from flask import Flask, request, jsonify
import subprocess

# Scrapy imports
from scrapy.crawler import CrawlerProcess
from scrapy import Spider
from urllib.parse import quote_plus
from vuln_scrape.spiders.spider_vuln import CveDetailsSpider as VulnSpider

from astrapy import DataAPIClient

from langchain.embeddings import OpenAIEmbeddings

load_dotenv()

ASTRA_DB_BASE_URL = os.getenv("ASTRA_DB_BASE_URL")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
ASTRA_DB_APPLICATION_TOKEN = os.getenv("ASTRA_DB_APPLICATION_TOKEN")
EMBEDDING_CHUNK_SIZE = 1000
ASTRA_COLLECTION_NAME = "full_vulns_test_3"
PROJECT_ROOT=os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "vuln_scrape"))
####################
#  Helper Methods  #
####################

def run_spider(techs):
    cmd = [
        "scrapy", "crawl", "vuln_spider",
        "-a", f"techs={','.join(techs)}"
    ]
    # # point at the folder containing scrapy.cfg
    project_root = os.getenv(
        "SCRAPY_PROJECT_ROOT",
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "vuln_scrape"))
    )
    subprocess.run(cmd, cwd=project_root, check=True)
    
    
def jl_to_json_array(jl_path=PROJECT_ROOT+"/vulnerabilities.jl", json_path=PROJECT_ROOT+"/vulnerabilities.json"):
    """Convert JSON-lines file into a single JSON array and return it."""
    arr = []
    with open(jl_path, "r", encoding="utf8") as f:
        for line in f:
            arr.append(json.loads(line))
    with open(json_path, "w", encoding="utf8") as f:
        json.dump(arr, f, indent=2)
    return arr

def upload_to_astra(data):
    """Insert only new records into Astra DB collection, embedding text in chunks using OpenAIEmbeddings."""
    # Initialize embeddings client
    embeddings = OpenAIEmbeddings(openai_api_key=OPENAI_API_KEY)

    client = DataAPIClient()
    database = client.get_database(
        ASTRA_DB_BASE_URL,
        token=ASTRA_DB_APPLICATION_TOKEN,
    )
    collection = database.get_collection(ASTRA_COLLECTION_NAME)

    # Identify existing records by name
    existing_docs = collection.find(
        filter={},
        projection=['name']
    )
    existing_names = {doc['name'] for doc in existing_docs}

    # Filter only new items
    new_records = [item for item in data if item['name'] not in existing_names]
    if not new_records:
        return {'inserted_count': 0, 'message': 'No new records.'}

    inserted_count = 0
    # Process in chunks for embedding
    for chunk_start in range(0, len(new_records), EMBEDDING_CHUNK_SIZE):
        chunk = new_records[chunk_start : chunk_start + EMBEDDING_CHUNK_SIZE]
        # Prepare strings to embed (combine name and summary)
        to_embed = [
            json.dumps({'name': row['name'], 'summary': row['summary']})
            for row in chunk
        ]
        # Generate embedding vectors
        embedding_vectors = embeddings.embed_documents(to_embed)

        # Build documents with embeddings
        docs_to_insert = []
        for row, vector in zip(chunk, embedding_vectors):
            page_content = json.dumps(row)
            doc = {
                '$vector': vector,
                'tech': row['tech'],
                'cve_link': row['cve_link'],
                'name': row['name'],
                'summary': row['summary'],
                'cvss_v3_score': row['cvss_v3_score'],
                'page_content': page_content,
            }
            docs_to_insert.append(doc)

        # Bulk insert this chunk
        res = collection.insert_many(docs_to_insert)
        inserted_count += len(res.inserted_ids)

    return {'inserted_count': inserted_count}

##############
#  Flask App #
##############

app = Flask(__name__)

@app.route("/vulns", methods=["POST"])
def vulnerabilities_endpoint():
    payload = request.get_json(force=True)
    techs   = payload.get("techs")
    if not techs or not isinstance(techs, list):
        return jsonify({"error": "Must provide a list of technologies"}), 400

    # 1) Run the spider
    run_spider(techs)
    # 2) Convert JL → JSON array
    data = jl_to_json_array()

    # # 3) Upload to Astra DB
    result = upload_to_astra(data)
    print(result)
    
    #result should return 200
    return '', 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)
