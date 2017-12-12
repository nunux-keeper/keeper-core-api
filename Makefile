.SILENT :

# Image name
USERNAME:=ncarlier
APPNAME:=keeper-core-api
env?=dev

# Compose files
COMPOSE_FILES?=-f docker-compose.yml

# Database
DB?=mongodb://mongo/keeper

# Include common Make tasks
root_dir:=$(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))
makefiles:=$(root_dir)/makefiles
include $(makefiles)/help.Makefile
include $(makefiles)/docker/compose.Makefile

all: help

# Get Docker binaries version
infos:
	echo "Using $(shell docker --version)"
	echo "Using $(shell docker-compose --version)"
.PHONY: infos

## Build Docker image
build:
	docker build --rm -t $(USERNAME)/$(APPNAME) .
.PHONY: build

# Add app to the Docker stack
with-app:
	$(eval COMPOSE_FILES += -f docker-compose.app.yml)
.PHONY: with-app

## Run the container in test mode
test: with-app
	echo "Running tests..."
	make compose-wait service=elasticsearch
	CMD=test APP_DATABASE_URI=$(DB) docker-compose $(COMPOSE_FILES) up --no-deps --no-build --abort-on-container-exit --exit-code-from api api
.PHONY: test

## Using Elasticsearch as main database
with-elastic:
	echo "Using Elsaticsearch as DB..."
	$(eval DB=elasticsearch://elasticsearch:9200/keeper)
.PHONY: with-elastic

## Start required services
deploy: infos compose-up
.PHONY: up

## Stop all services
undeploy: compose-down-force
.PHONY: down

## Show services logs
logs: compose-logs
.PHONY: logs

## Install as a service (needs root privileges)
install: build
	echo "Install as a service..."
	mkdir -p /var/opt/$(APPNAME)/storage/upload
	mkdir -p /var/opt/$(APPNAME)/storage/exports
	cp etc/systemd/system/* /etc/systemd/system/
	cp etc/default/$(env).env /etc/default/$(APPNAME)
	systemctl daemon-reload
	systemctl enable $(APPNAME)
	systemctl restart $(APPNAME)
	systemctl enable keeper-core-job-worker
	systemctl restart keeper-core-job-worker
	systemctl enable keeper-data-backup.timer
	systemctl restart keeper-data-backup.timer
	$(MAKE) cleanup
.PHONY: install

## Un-install service (needs root privileges)
uninstall:
	echo "Un-install service..."
	systemctl stop keeper-data-backup.timer
	systemctl disable keeper-data-backup.timer
	systemctl stop keeper-core-job-worker
	systemctl disable keeper-core-job-worker
	systemctl stop $(APPNAME)
	systemctl disable $(APPNAME)
	rm /etc/systemd/system/keeper-core-*
	rm /etc/default/$(APPNAME)
	systemctl daemon-reload
	$(MAKE) rm clean
.PHONY: uninstall

