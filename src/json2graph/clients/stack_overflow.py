from json2graph.crawlers.crawler import Crawler


class StackOverflow(Crawler):
    QuestionsEndpoint = Crawler.Endpoint("questions", "2.2/questions", "GET")

    endpoints = Crawler.prepare_endpoints([QuestionsEndpoint])

    def __init__(self, base_url: str) -> None:
        super().__init__(base_url)
