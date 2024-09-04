FROM python:3.10.14-slim-bullseye AS builder

ENV POETRY_HOME="/opt/poetry" \
    POETRY_VIRTUALENVS_IN_PROJECT=1 \
    POETRY_NO_INTERACTION=1

# to run poetry directly as soon as it's installed
ENV PATH="$POETRY_HOME/bin:$PATH"

# install poetry
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && curl -sSL https://install.python-poetry.org | python3 -

WORKDIR /app

# copy only pyproject.toml and poetry.lock file nothing else here
COPY poetry.lock pyproject.toml ./

# this will create the folder /app/.venv
RUN poetry install --no-root --no-ansi

# ------------------------------------------------------------------------------------------------------------------------
FROM python:3.10.14-slim-bullseye
LABEL org.opencontainers.image.source="https://github.com/gorgonun/data-to-graph"

WORKDIR /app

# copy the venv folder from builder image 
COPY --from=builder /app/.venv ./.venv

COPY src/ ./src

ENV PATH="/app/.venv/bin:${PATH}"
EXPOSE 8265 7475 8000

CMD ["sh", "-c", "ray start --head --dashboard-host 0.0.0.0 --temp-dir=/tmp/ray_tmp && python src/main.py"]
