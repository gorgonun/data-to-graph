# Data2Graph

Data2Graph is a tool to automatically migrate data from semi-structured sources to graph databases, with current support for MongoDB and Neo4J.

## Getting Started

To get started with the project, you can use the docker images provided in the GitHub Packages or build the images yourself using the Dockerfiles provided in the repository or the docker compose file. Also, you can run the project locally using the Makefile provided in the repository.

### Prerequisites

#### To Use Docker Images

- Docker [Docker Documentation](https://docs.docker.com/get-docker/).

#### To Build Docker Images

- Docker [Docker Documentation](https://docs.docker.com/get-docker/).
- Docker Compose [Docker Compose Documentation](https://docs.docker.com/compose/install/).

#### Running Locally Without Docker Compose

- Python 3.10 or higher [Python Documentation](https://www.python.org/downloads/).
- Poetry [Poetry Documentation](https://python-poetry.org/docs/).
- Node.js 20.0.0 or higher [Node.js Documentation](https://nodejs.org/en/download/).

### Using Docker Images

To use the images provided in the GitHub Packages, you can use the following commands:

```bash
export NEO4J_URL=<neo4j url>
export NEO4J_USER=<neo4j user>
export NEO4J_PASSWORD=<neo4j password>
export PROMETHEUS_HOST=<prometheus host>

docker run -d -p 8000:8000 -p 8265:8265 -p 7475:7475 --name data2graph_backend -e NEO4J_URL=$NEO4J_URL -e NEO4J_USER=$NEO4J_USER -e NEO4J_PASSWORD=$NEO4J_PASSWORD -e PROMETHEUS_HOST=$PROMETHEUS_HOST  ghcr.io/gorgonun/data_to_graph_backend:latest

docker run -d -p 80:80 --name data2graph_frontend ghcr.io/gorgonun/data_to_graph_frontend:latest
```

The frontend image will be available at `http://localhost:80` and will make requests to the backend at `http://localhost:8000`. To change the backend URL, you can use the environment variable `VITE_API_URL` and build the image.

### Building Docker Images

To build the images yourself, you can use the following command:

```bash
make build_images
```

This will use docker compose to build the images and make them available for use. If you want to build the images individually, you can use the following commands:

```bash
export VITE_API_URL=http://localhost:8000

docker build -t data2graph_frontend --build-arg VITE_API_URL=$VITE_API_URL  ./frontend/data2graph/
docker build -t data2graph_backend .
```

### Running Locally with Docker Compose

To run the project locally, you can use the docker compose file provided in the repository. The docker compose file will start a ray cluster, some services of user choice and the frontend. You can use the following command to start the project:

```bash
make start_infra
```

#### Makefile

##### Parameters

- **profile**: The profile to be used to run the infrastructure. The options are `basic`, `full` and `load-data`.
- **clean**: If true, it will delete the previous configurations in the environment files and recreate them according to the specified configurations.
- **mongodb_database**: The name of the MongoDB database. (default: `test`)
- **mongodb_collection**: The name of the MongoDB collection. (default: `nyt`)
- **mongodb_url**: The connection URL for MongoDB. (default: `mongodb://mongodb:27017/`)
- **mongodb_data_folder**: The folder to save the MongoDB data. (default: `./data/mongodb/`)
- **neo4j_user**: The username for Neo4J. (default: `neo4j`)
- **neo4j_password**: The password for Neo4J. (default: `admin`)
- **neo4j_port**: The port for Neo4J. (default: `7687`)
- **neo4j_data_folder**: The folder to save the Neo4J data. (default: `./data/neo4j/`)
- **neo4j_host**: The host for Neo4J. (default: `neo4j`)
- **prometheus_host**: The host for Prometheus. (default: `http://prometheus`)

To run the project with the `full` profile and mongodb url, you can use the following command:

```bash
make start_infra profile=full mongodb_url=mongodb://localhost:27017/
```

##### Commands

- **write_env_values**: Writes the environment variables values to the .env files.
- **setup_env_file**: Writes the environment variables values to the .env files, deleting the old .env files if `clean = true`.
- **start_infra**: Starts the infrastructure with Docker Compose with the defined configurations.
- **stop_infra**: Stops the infrastructure with Docker Compose.
- **run**: Starts the execution of the migration script.

##### Profiles

In the Docker Compose file, two profiles are configured: `basic` and `full`. In the `basic` profile, only the essential services are configured, being the source and destination databases and the data for testing. In the `full` profile, all services from the `basic` profile are configured, with the addition of MongoExpress to facilitate the visualization and debugging of the data available in MongoDB. The `load-data` profile is used to load data into the MongoDB.

##### .env Files

To run the script and setup the environment with docker compose, some environment variables are needed. The environment variables are stored in some .env files that are created with the command **write_env_values** and with other commands that needs it. The .env files are:

- **.env**: The environment variables for the migration script.
- **.env.mongo_seed**: The environment variables for the MongoDB seed.
- **.env.mongo_express**: The environment variables for the MongoExpress.
- **.env.mongodb**: The environment variables for the MongoDB.
- **.env.neo4j**: The environment variables for the Neo4J.

### Running Locally without Docker Compose

To run the project locally, you need to install the dependencies and run the project using the Makefile provided in the repository. The Makefile will start a ray cluster and submit the main job. Also, you will need to run the frontend with Node.js 20.0.0 or higher. You can use the following command to install the poetry dependencies:

```bash
poetry install
```

and then you can choose one of the followings:

```bash
make run
```

or

```bash
make start_ray_cluster
make submit_main_job
```

To start the frontend, you can use the following commands:

```bash
cd frontend/data2graph
npm install
npm run dev
```
