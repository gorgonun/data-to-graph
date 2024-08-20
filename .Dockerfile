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
RUN poetry install --no-root --no-ansi --without dev

# ------------------------------------------------------------------------------------------------------------------------
FROM python:3.10.14-slim-bullseye
LABEL org.opencontainers.image.source="https://github.com/gorgonun/data-to-graph"

ARG MONGODB_URL
ARG MONGODB_COLLECTION
ARG MONGODB_DATABASE
ARG NEO4J_URL
ARG NEO4J_USER
ARG NEO4J_PASSWORD
ARG PROMETHEUS_HOST
ARG CUSTOM_HOST

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/app/.venv/bin:$PATH" \
    MONGODB_URL=$MONGODB_URL \
    MONGODB_COLLECTION=$MONGODB_COLLECTION \
    MONGODB_DATABASE=$MONGODB_DATABASE \
    NEO4J_URL=$NEO4J_URL \
    NEO4J_USER=$NEO4J_USER \
    NEO4J_PASSWORD=$NEO4J_PASSWORD \
    PROMETHEUS_HOST=$PROMETHEUS_HOST \
    CUSTOM_HOST=$CUSTOM_HOST

WORKDIR /app
EXPOSE 5173 8265 7475

# copy the venv folder from builder image 
COPY --from=builder /app/.venv ./.venv

CMD ["python", "src/json2graph/main.py"]
