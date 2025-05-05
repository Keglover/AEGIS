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

load_dotenv()

ASTRA_DB_BASE_URL = os.getenv("ASTRA_DB_BASE_URL")
ASTRA_DB_APPLICATION_TOKEN = os.getenv("ASTRA_DB_APPLICATION_TOKEN")

####################
#  Helper Methods  #
####################

def run_spider(techs):
    cmd = [
        "scrapy", "crawl", "vuln_spider",
        "-a", f"techs={','.join(techs)}"
    ]
    subprocess.run(cmd, check=True)
    
    
def jl_to_json_array(jl_path="vulnerabilities.jl", json_path="vulnerabilities.json"):
    """Convert JSON-lines file into a single JSON array and return it."""
    arr = []
    with open(jl_path, "r", encoding="utf8") as f:
        for line in f:
            arr.append(json.loads(line))
    with open(json_path, "w", encoding="utf8") as f:
        json.dump(arr, f, indent=2)
    return arr

def upload_to_astra(data):
    """Insert only new records into Astra DB collection and generate vector embeddings."""
    client = DataAPIClient()
    database = client.get_database(
        ASTRA_DB_BASE_URL,
        token=ASTRA_DB_APPLICATION_TOKEN,
    )
    collection = database.get_collection("vuln_test_3")

    # Fetch existing names
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
    for item in new_records:
        # Prepare document with reserved $vectorize for automatic embeddings
        doc = {
            'tech': item['tech'],
            'cve_link': item['cve_link'],
            'name': item['name'],
            'summary': item['summary'],
            'cvss_v3_score': item['cvss_v3_score'],
            '$vectorize': item['summary']  # use summary text to generate embeddings
        }
        result = collection.insert_one(doc)
        # result.inserted_id is available
        inserted_count += 1

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
