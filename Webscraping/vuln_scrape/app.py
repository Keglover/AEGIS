import os
import json
import requests
from flask import Flask, request, jsonify
import subprocess

# Scrapy imports
from scrapy.crawler import CrawlerProcess
from scrapy import Spider
from urllib.parse import quote_plus
from vuln_scrape.spiders.spider_vuln import CveDetailsSpider as VulnSpider
from astrapy import DataAPIClient

ASTRA_DB_BASE_URL         = os.getenv("ASTRA_DB_BASE_URL")
ASTRA_DB_APPLICATION_TOKEN = os.getenv("ASTRA_DB_APPLICATION_TOKEN")
ASTRA_DB_KEYSPACE         = os.getenv("ASTRA_DB_KEYSPACE")
ASTRA_COLLECTION_NAME     = os.getenv("ASTRA_COLLECTION_NAME", "vulnerabilities")
LANGFLOW_API              = os.getenv("LANGFLOW_API_URL")
####################
#  Helper Methods  #
####################

# def run_spider(techs):
#     """Run the Scrapy spider programmatically."""
#     def _crawl():
#         proc = CrawlerProcess()
#         proc.crawl(VulnSpider, techs=",".join(techs))
#         proc.start()  # this reactor is in the child, so it won’t conflict

#     p = Process(target=_crawl)
#     p.start()
#     p.join()
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
    """Upload list of dicts to Astra DB Vector collection via astrapy."""
    # Initialize ASTRA Data API client
    client = DataAPIClient()
    database = client.get_database(
        ASTRA_DB_BASE_URL,
        token=ASTRA_DB_APPLICATION_TOKEN,
    )
    collection = database.get_collection(ASTRA_COLLECTION_NAME)

    # Bulk insert documents
    result = collection.insert_many(data)
    return result

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
    # upload_to_astra(data)
    
    #result should return 200
    return '', 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)
