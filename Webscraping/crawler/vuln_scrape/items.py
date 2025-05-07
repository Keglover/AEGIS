# Define here the models for your scraped items
#
# See documentation in:
# https://docs.scrapy.org/en/latest/topics/items.html

import scrapy


class VulnScrapeItem(scrapy.Item):
    # define the fields for your item here like:
    # name = scrapy.Field()
    technology    = scrapy.Field()
    cve_id        = scrapy.Field()
    description   = scrapy.Field()
    cvss_score    = scrapy.Field()
    publish_date  = scrapy.Field()
    url           = scrapy.Field()
