import os
import json
import requests
from flask import Flask, request, jsonify
import subprocess

# Scrapy imports
from scrapy.crawler import CrawlerProcess
from scrapy import Spider
from urllib.parse import quote_plus
from vuln_scrape.vuln_scrape.spiders.spider_vuln import CveDetailsSpider as VulnSpider
# Cassandra / Astra DB imports
from cassandra.cluster import Cluster
from cassandra.auth import PlainTextAuthProvider

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
    """Upload list of dicts to Astra DB Cassandra table `vulnerabilities`."""
    bundle_path   = os.getenv("ASTRA_DB_SECURE_BUNDLE_PATH")
    client_id     = os.getenv("ASTRA_DB_CLIENT_ID")
    client_secret = os.getenv("ASTRA_DB_CLIENT_SECRET")
    keyspace      = os.getenv("ASTRA_DB_KEYSPACE")

    cloud_config   = {'secure_connect_bundle': bundle_path}
    auth_provider  = PlainTextAuthProvider(client_id, client_secret)
    cluster        = Cluster(cloud=cloud_config, auth_provider=auth_provider)
    session        = cluster.connect(keyspace)

    # Assumes table vulnerabilities (tech text, name text, cve_link text, summary text, cvss_v3_score text)
    insert_cql = session.prepare(
        "INSERT INTO vulnerabilities (tech, name, cve_link, summary, cvss_v3_score) VALUES (?, ?, ?, ?, ?)"
    )

    for item in data:
        session.execute(insert_cql, (
            item["tech"],
            item["name"],
            item["cve_link"],
            item["summary"],
            item["cvss_v3_score"]
        ))

    cluster.shutdown()

def call_langflow(techs):
    """POST to Langflow API to get filtered vulnerabilities."""
    url = os.getenv("LANGFLOW_API_URL")
    resp = requests.post(url, json={"technologies": techs})
    resp.raise_for_status()
    return resp.json()

##############
#  Flask App #
##############

app = Flask(__name__)

@app.route("/vulns", methods=["POST"])
def vulnerabilities_endpoint():
    payload = request.get_json(force=True)
    techs   = payload.get("technologies")
    if not techs or not isinstance(techs, list):
        return jsonify({"error": "Must provide a list of technologies"}), 400

    # 1) Run the spider
    run_spider(techs)
    # 2) Convert JL → JSON array
    data = jl_to_json_array()

    # # 3) Upload to Astra DB
    # upload_to_astra(data)

    # # 4) Query Langflow and return its response
    # result = call_langflow(techs)
    result = {
        "test": "ok"
    }
    return jsonify(result)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)
