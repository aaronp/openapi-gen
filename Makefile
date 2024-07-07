install:
	npm install
run: install
	npx ts-node src/index.ts ./data/example.json
format:
	npm run format