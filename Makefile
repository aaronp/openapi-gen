CURRENT_DIR := $(shell pwd)

install:
	npm install
run: install
	npx ts-node src/index.ts ./data/example.json
format:
	npm run format
validate:
	docker run --rm -v $(CURRENT_DIR)/openapi.yaml:/local/openapi.yaml openapitools/openapi-generator-cli validate -i /local/openapi.yaml
build:
	docker build -t openapi-generator .