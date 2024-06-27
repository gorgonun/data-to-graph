import asyncio
import requests
import urllib.parse
import os
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass
from typing import Any, List, Optional
from json2graph.helpers.crawler_utils import CrawlerUtils, log


class EndpointNotFound(Exception):
    ...


class Crawler():
    @dataclass
    class Endpoint():
        name: str
        path: str
        method: str = "GET"
        custom_extension: Optional[str] = None

    endpoints: dict[str, Endpoint]

    def __init__(self, base_url: str, global_headers: Optional[dict[str, Any]]=None, root_folder: str | None=None, target_folder: str | None = None) -> None:
        self.__base_url = base_url
        self.global_headers = global_headers or {}
        self.__target_folder = target_folder
        self.__root_folder = root_folder

    @property
    def base_url(self) -> str:
        return self.__base_url

    def get_endpoints(self, endpoint_names: List[str]) -> List[Endpoint]:
        result: list[self.Endpoint] = []
        for endpoint_name in endpoint_names:
            try:
                result.append(self.endpoints[endpoint_name])
            except IndexError:
                raise EndpointNotFound(f"Could not find endpoint {endpoint_name}")

        return result or list(self.endpoints.values())

    async def get_data(self, endpoint: Endpoint, **requests_kwargs) -> requests.Response:
        requests_kwargs.setdefault("headers", {})
        requests_kwargs["headers"] = {**self.global_headers, **requests_kwargs["headers"]}
        url = urllib.parse.urljoin(self.base_url, endpoint.path)
        log.info("Getting data for url %s", url)

        return CrawlerUtils.request_with_retry(
            lambda session: getattr(session, endpoint.method.lower())(
                url,
                stream=True,
                **requests_kwargs
            )
        )
    
    def parse_data(self, data: requests.Response) -> dict[str, Any] | list[Any]:
        return data.json()
    
    async def get_parsed_data(self, endpoint: Endpoint, **requests_kwargs):
        return self.parse_data(await self.get_data(endpoint, **requests_kwargs))
    
    async def get_all_data(self, endpoints: List[Endpoint], **requests_kwargs):
        return await asyncio.wait([self.get_data(endpoint, **requests_kwargs) for endpoint in endpoints])
    
    async def get_all_parsed_data(self, endpoints: List[Endpoint], **requests_kwargs):
        return await asyncio.wait([self.get_parsed_data(endpoint, **requests_kwargs) for endpoint in endpoints])

    def save_data(self, endpoint: Endpoint, data: requests.Response) -> None:
        final_folder = os.path.join(
            self.__root_folder,
            self.__target_folder
        )

        filename = os.path.join(
            final_folder,
            f"{endpoint.name}.{endpoint.extension}"
        )

        log.info("Saving data to %s", filename)

        os.makedirs(final_folder, exist_ok=True)

        with open(filename, "wb") as open_file:
            for chunk in data.iter_content(chunk_size=8192):
                open_file.write(chunk)

    def get_and_save_all_data(self, endpoints: List[Endpoint], **requests_kwargs) -> None:
        with ThreadPoolExecutor(max_workers=len(endpoints)) as executor:
            futures = [
                executor.submit(
                    self.save_data,
                    endpoint=endpoint,
                    data=self.get_data(endpoint, **requests_kwargs)
                )
                for endpoint in endpoints
            ]

            for result in as_completed(futures):
                result.result()

    @classmethod
    def prepare_endpoints(cls, endpoints: list[Endpoint]) -> dict[str, Endpoint]:
        return {
            endpoint.name: endpoint
            for endpoint in endpoints
        }
