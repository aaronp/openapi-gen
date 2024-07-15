# Document Gen

This is a simple Spreadsheet app for saving the data as json and derived outputs (e.g. openapi.yaml, UI formats, etc.)

## Running

```
mkdir d8a
mkdir output
docker run -p 3000:8080 -v `pwd`/d8a:/app/data -v `pwd`/output:/app/output docker.io/kindservices/openapi-gen-ui:latest
```

# About

This repo was created as an easier way to have a 'source of truth' for business data used to develop software:

- generate OpenApi specis
- generate front-end user interfaces
- produce tests/validation
- ...

# TODO

- fix docker build / node runtime
  - be able to mount both data and output directories
- control themes
- fix weird script tab (sometimes input source gets wiped?)
- clean up UI
- fine-tune/fix script names w/ different output types (e.g. openapi.yaml.json)
