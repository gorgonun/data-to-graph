from json2graph.crawlers.crawler import Crawler


class PortalDaTransparencia(Crawler):
    ServidoresEndpoint = Crawler.Endpoint("servidores", "api-de-dados/servidores", "GET")
    ServidoresPorOrgaoEndpoint = Crawler.Endpoint("servidores_por_orgao", "api-de-dados/servidores/por-orgao", "GET")

    endpoints = Crawler.prepare_endpoints([ServidoresEndpoint, ServidoresPorOrgaoEndpoint])

    def __init__(self, base_url: str, api_key: str) -> None:
        super().__init__(base_url, global_headers={"chave-api-dados": f"{api_key}", "accept": "*/*"})
