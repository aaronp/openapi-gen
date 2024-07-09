CURRENT_DIR := $(shell pwd)
IMAGE:=kindservices/openapi-gen
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
	docker build -t $(IMAGE):latest .
runDocker:
	docker run --rm -v ./data:./data $(IMAGE):latest
buildx:
	docker buildx create --use & docker buildx build --platform linux/amd64,linux/arm64 -t $(IMAGE):latest --push .
