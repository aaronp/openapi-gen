CURRENT_DIR := $(shell pwd)

install:
	npm install
run: install
	npx ts-node src/index.ts ./data
format:
	npm run format
validate:
	docker run --rm -v $(CURRENT_DIR)/output:/local openapitools/openapi-generator-cli validate -i /local/openapi.yaml
server:
	docker run --rm -v $(CURRENT_DIR)/output:/local openapitools/openapi-generator-cli generate -i /local/openapi.yaml -g scala-cask -o /local/server
build:
	docker build -t kindservices/openapi-gen .