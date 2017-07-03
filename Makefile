.SILENT :
.PHONY : test test-mongo test-elastic up up-metrics down down-metrics install uninstall deploy

APPNAME:=keeper-core-api
env?=dev

# Default configuration
ENV_FLAGS?=--env-file="./etc/default/$(env).env"

# Define port
PORT?=3000
PORTS_FLAGS=-p $(PORT):3000

# Custom run flags
RUN_CUSTOM_FLAGS?=$(PORTS_FLAGS) $(ENV_FLAGS)

# Docker configuration regarding the system architecture
BASEIMAGE=node:6-onbuild

# Include common Make tasks
root_dir:=$(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))
makefiles:=$(root_dir)/makefiles
include $(makefiles)/help.Makefile
include $(makefiles)/docker.Makefile

# Define dockerfiles
dockerfiles:=$(root_dir)/dockerfiles

all: help

## Run the container in test mode
test:
	echo "Running tests..."
	$(DOCKER) run --rm --net=$(NETWORK) $(VOLUME_FLAGS) $(ENV_FLAGS) $(IMAGE) test

## Run the container in test mode using MongoDB
test-mongo:
	echo "Running tests with MongoDB..."
	$(eval DB_FLAGS=-e APP_DATABASE_URI=mongodb://mongo/keeper)
	$(DOCKER) run --rm --net=$(NETWORK) $(VOLUME_FLAGS) $(ENV_FLAGS) $(DB_FLAGS) $(IMAGE) test

## Run the container in test mode using Elasticsearch
test-elastic:
	echo "Running tests with Elasticsearch..."
	$(eval DB_FLAGS=-e APP_DATABASE_URI=elasticsearch://elasticsearch:9200/keeper)
	$(DOCKER) run --rm --net=$(NETWORK) $(VOLUME_FLAGS) $(ENV_FLAGS) $(DB_FLAGS) $(IMAGE) test

## Start a complete infrastucture
up: network
	echo "Starting Redis..."
	make -C $(dockerfiles)/redis stop rm update start
	echo "Starting MongoDB..."
	make -C $(dockerfiles)/mongodb stop rm update start
	echo "Starting Elasticsearch..."
	make -C $(dockerfiles)/elasticsearch stop rm update start wait

## Start a complete metrics stack
up-metrics:
	echo "Starting InfluxDB..."
	make -C $(dockerfiles)/influxdb stop rm update start init
	echo "Starting Telegraf..."
	make -C $(dockerfiles)/telegraf stop rm update start
	echo "Starting Grafana..."
	make -C $(dockerfiles)/grafana stop rm update start

## Stop the infrastucture
down:
	echo "Stoping MongoDB..."
	make -C $(dockerfiles)/mongodb stop rm
	echo "Stoping Elasticsearch ..."
	make -C $(dockerfiles)/elasticsearch stop rm
	echo "Stoping Redis ..."
	make -C $(dockerfiles)/redis stop rm

## Stop the metrics stack
down-metrics:
	echo "Stoping Grafana..."
	make -C $(dockerfiles)/grafana stop rm
	echo "Stoping Telegraf..."
	make -C $(dockerfiles)/telegraf stop rm
	echo "Stoping InfluxDB..."
	make -C $(dockerfiles)/influxdb stop rm

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

## Deploy application
deploy:
	echo "Deploying application..."
	git push deploy

