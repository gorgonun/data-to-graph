from json2graph.crawlers.crawler import Crawler


class Nasa(Crawler):
    AsteroidsNeoEndpoint = Crawler.Endpoint("asteroids_neows", "neo/rest/v1/feed", "GET")

    endpoints = Crawler.prepare_endpoints([AsteroidsNeoEndpoint])

    def __init__(self, base_url: str) -> None:
        super().__init__(base_url)
