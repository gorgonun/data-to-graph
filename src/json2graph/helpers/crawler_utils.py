import requests
import backoff
import logging
from functools import partial
from typing import TypeVar, Callable


logging.basicConfig(level=logging.INFO)

log = logging.getLogger()
log.setLevel(logging.INFO)


T = TypeVar("T")


class CrawlerUtils():

    @classmethod
    @backoff.on_exception(backoff.expo, (requests.HTTPError, requests.ConnectionError))
    def retry_request(cls, request: Callable[[], requests.Response]) -> requests.Response:
        response = request()
        response.raise_for_status()
        return response


    @classmethod
    def request_with_retry(cls, func: Callable[[requests.Session], requests.Response], timeout=5) -> requests.Response:
        with requests.Session() as session:
            session.request = partial(session.request, timeout=timeout) # type: ignore
            return cls.retry_request(lambda: func(session))
