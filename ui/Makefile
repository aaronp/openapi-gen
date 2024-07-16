IMAGE:=kindservices/openapi-gen-ui
VERSION=1.0.2

dev: install api-gen
	npm run dev
run: 
	npm run dev
build:
	npm run build
install:
	npm i
format:
	npm run format
preview:
	npm run preview
latestNode:
	sudo n latest
	nvm use node
api-gen:
	npm run generate-api
docker-build:
	docker build -t $(IMAGE):latest .
docker-push:
	docker buildx create --use & docker buildx build  --platform linux/amd64,linux/arm64 -t $(IMAGE):$(VERSION) -t $(IMAGE):latest --push .
docker-run:
	docker run --rm -v $(CURRENT_DIR)/data:/app/data $(CURRENT_DIR)/out:/app/output $(IMAGE):latest