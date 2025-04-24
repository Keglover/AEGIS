import scrapy
from urllib.parse import quote_plus

class CveDetailsSpider(scrapy.Spider):
    name = 'vuln_spider'
    allowed_domains = ['nist.gov']
    # List of technologies with vendor, product, and version.
    # You can add as many dictionaries as needed.
    # tech_list = [
    #     {'product': 'Spring Boot'},
    #     # Example: {'vendor': 'apache', 'product': 'struts', 'version': '2.5'},
    # ]   

    def start_requests(self):
        # Base URL template for the version search on CVEDetails.
        q = "Spring Boot"
        q = quote_plus(q)
        url = ("https://nvd.nist.gov/vuln/search/results?"
                        "form_type=Advanced&results_type=overview&query=Spring+Boot"
                        "&search_type=all&isCpeNameSearch=false&cvss_version=3")
        yield scrapy.Request(url=url, callback=self.parse)

    def parse(self, response):
        # Get metadata about the technology from meta
        #tech = response.meta.get('tech', {})

        # Locate the vulnerability table rows.
        # This example assumes that the table has a class "searchresults"
        # and that the first row is a header row.
        rows = response.css('tr[data-testid^="vuln-row-"]')
        for row in rows:
            # Extract the CVE link and name from the <a> tag in the <strong> element
            relative_link = row.css('a[data-testid^="vuln-detail-link"]::attr(href)').get()
            cve_name = row.css('a[data-testid^="vuln-detail-link"]::text').get()
            # Extract the vulnerability summary from the <p> tag
            summary = row.css('p[data-testid^="vuln-summary"]::text').get()
            # Extract the CVSS v3.x score from the <a> tag inside the span with data-testid starting with "vuln-cvss3-link"
            cvss_v3 = row.css('a[data-testid^="vuln-cvss3-link"]::text').get()

            # Join relative URL if needed
            cve_link = response.urljoin(relative_link)

            yield {
                'cve_link': cve_link,
                'name': cve_name,
                'summary': summary.strip() if summary else "",
                'cvss_v3_score': cvss_v3.strip() if cvss_v3 else ""
            }
        # if next_page:
        #     # Use response.follow to construct the full URL.
        #     yield response.follow(next_page, callback=self.parse, meta={'tech': tech})
