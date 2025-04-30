import scrapy
from scrapy.exceptions import CloseSpider
from urllib.parse import quote_plus
import json 

#example script to run: "$ scrapy crawl vuln_spider -a techs="spring boot, python""
class CveDetailsSpider(scrapy.Spider):
    name = 'vuln_spider'
    allowed_domains = ['nist.gov']
    custom_settings = {
        "FEEDS": {
            "vulnerabilities.jl": {
                "format": "jsonlines",
                "encoding": "utf8",
                "append": True,
            },
        },
    }
    
    def __init__(self, techs=None, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if not techs:
            raise CloseSpider("A list of technologies must be provided via the 'techs' argument")
        # Split on commas and strip whitespace
        self.techs = [t.strip() for t in techs.split(",") if t.strip()]
        if not self.techs:
            raise CloseSpider("No valid technologies found in 'techs' argument")
        
        # dedupe check in output file
        self.existing = set()
        try:
            with open("vulnerabilities.jl", "r", encoding="utf8") as f:
                for line in f:
                    record = json.loads(line)
                    self.existing.add(json.dumps(record, sort_keys=True))
        except FileNotFoundError:
            pass  # no file yet

    def start_requests(self):
        for tech in self.techs:
            q = quote_plus(tech)
            url = ("https://nvd.nist.gov/vuln/search/results?"
                    f"form_type=Advanced&results_type=overview&query={q}"
                    "&search_type=all&isCpeNameSearch=false&cvss_version=3")
            # initialize scraped count to 0
            yield scrapy.Request(url, callback=self.parse, meta={'tech': tech, 'scraped': 0})

    def parse(self, response):

        # Locate the vulnerability table rows.
        # This example assumes that the table has a class "searchresults"
        # and that the first row is a header row.
        tech    = response.meta['tech']
        scraped = response.meta['scraped']
        rows = response.css('tr[data-testid^="vuln-row-"]')
        # yield each row, incrementing our counter
        for row in rows:
            rel      = row.css('a[data-testid^="vuln-detail-link"]::attr(href)').get()
            name     = row.css('a[data-testid^="vuln-detail-link"]::text').get()
            summary  = row.css('p[data-testid^="vuln-summary"]::text').get()
            cvss_v3  = row.css('a[data-testid^="vuln-cvss3-link"]::text').get()

            item =  {
                'tech': tech,
                'cve_link': response.urljoin(rel),
                'name': name,
                'summary': summary.strip() if summary else "",
                'cvss_v3_score': cvss_v3.strip() if cvss_v3 else ""
            }
            
            # serialize with sorted keys to compare
            serialized = json.dumps(item, sort_keys=True)
            if serialized not in self.existing:
                self.existing.add(serialized)
                yield item
            
            scraped += 1
            if scraped >= 500:
                break  # stop yielding more rows on this page
        #currently limiting to 500 vulns collected for each tech
        # if we're still under 500, follow next page
        if scraped < 500:
            next_page = response.css('a[data-testid="pagination-link-page->"]::attr(href)').get()
            if next_page:
                yield response.follow(
                    next_page,
                    callback=self.parse,
                    meta={'tech': tech, 'scraped': scraped}
                )
