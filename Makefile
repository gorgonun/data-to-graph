SHELL := /bin/bash

.EXPORT_ALL_VARIABLES:

# basic or full
profile ?= basic

# delete saved configurations and start from scratch
clean ?= false

# mongodb

# FIXME: Cannot use user and pass with replica set (https://stackoverflow.com/questions/73222424/mongodb-badvalue-security-keyfile-is-required-when-authorization-is-enabled-wi)
# mongodb_root_username ?= root
# mongodb_root_password ?= root

mongodb_database ?= test
mongodb_collection ?= nyt
mongodb_url ?= "mongodb://mongodb:27017/"
mongodb_data_folder ?= ./data/mongodb/

# neo4j
neo4j_user ?= neo4j
neo4j_password ?= admin
neo4j_port ?= 7687
neo4j_data_folder ?= ./data/neo4j/
neo4j_host ?= 'neo4j'

# local
prometheus_host ?= 'http://prometheus'

define GLOBAL_ENV
MONGODB_DATA=$(mongodb_data_folder)
NEO4J_DATA=$(neo4j_data_folder)
MONGODB_URL=$(mongodb_url)
MONGODB_COLLECTION=$(mongodb_collection)
MONGODB_DATABASE=$(mongodb_database)
NEO4J_URL="bolt://$(neo4j_host):$(neo4j_port)"
NEO4J_USER=$(neo4j_user)
NEO4J_PASSWORD=$(neo4j_password)
PROMETHEUS_HOST=$(prometheus_host)
endef

define MONGODB_DEFAULT_ENV
MONGO_INITDB_DATABASE=$(mongodb_database)
endef

define MONGO_EXPRESS_ENV
ME_CONFIG_MONGODB_URL=$(mongodb_url)
endef

define NEO4J_DEFAULT_ENV
NEO4J_AUTH=$(neo4j_user)/$(neo4j_password)
NEO4J_dbms_security_auth__minimum__password__length=1
NEO4JLABS_PLUGINS='["apoc"]'
NEO4J_apoc_export_file_enabled='true'
endef

define MONGO_SEED_DEFAULT_ENV
MONGO_SEED_MONGODB_URL=$(mongodb_url)
MONGO_SEED_MONGODB_COLLECTION=$(mongodb_collection)
endef

write_env_values:
	@echo "$$MONGODB_DEFAULT_ENV" > .env.mongodb
	@echo "$$NEO4J_DEFAULT_ENV" > .env.neo4j
	@echo "$$MONGO_EXPRESS_ENV" > .env.mongo_express
	@echo "$$MONGO_SEED_DEFAULT_ENV" > .env.mongo_seed
	@echo "$$GLOBAL_ENV" > .env

setup_env_file:
	@if [[ "$(clean)" = "true" ]]; \
	then \
	  $(MAKE) write_env_values; \
	else \
	  test -f .env || $(MAKE) write_env_values; \
	fi

start_infra: setup_env_file
	docker-compose --profile $(profile) up -d

start_infra_force: setup_env_file
	docker-compose --profile $(profile) up -d --force-recreate

stop_infra: setup_env_file
	docker-compose --profile $(profile) down

stop_infra_remove_orphans: setup_env_file
	docker-compose --profile $(profile) down --remove-orphans

run: setup_env_file
	cd src/ && poetry run python -m python.main

start_ray_cluster:
	ray start --head --port=6379 --metrics-export-port=8080

stop_ray_cluster:
	ray stop

submit_main_job:
	ray job submit --working-dir src/ -- python main.py

submit_validation_job:
	ray job submit --working-dir src/ -- python validation.py

submit_stack_overflow_migration_job:
	# ray job submit --working-dir src/ -- python stack_overflow_migration.py
	python src/stack_overflow_migration.py
