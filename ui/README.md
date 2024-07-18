# Document Gen

This is a simple Spreadsheet app for saving the data as json and derived outputs (e.g. openapi.yaml, UI formats, etc.)

## Running

The main point is the UI helps create project files.

The setting, scripts, spreadsheets, etc are all saved under '/app/data'.

The scripts which can run against the sheets are saved in '/app/output'.

This way you can choose how you want to mount the relevant directories for your repo (e.g. ./.data and ./src, for example)

```
mkdir d8a
mkdir out
mkdir latest
```

Or, if you want to mess with the port:

```
docker run -e PORT=1234 -p 8080:1234 -v `pwd`/d8a:/app/data -v `pwd`/out:/app/output docker.io/kindservices/openapi-gen-ui:latest
```

# About

This repo was created as an easier way to have a 'source of truth' for business data used to develop software:

- generate OpenApi specis
- generate front-end user interfaces
- produce tests/validation
- ...
