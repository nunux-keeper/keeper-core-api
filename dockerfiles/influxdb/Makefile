.SILENT :
.PHONY : client init

APPNAME:=influxdb
IMAGE:=influxdb:latest

DATABASE_NAME:=telegraf

ROOT_DIR:=$(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))

include $(ROOT_DIR)/../common/_Makefile

## Run the container in client mode
client:
	echo "Running client to container $(APPNAME)..."
	$(DOCKER) run --rm \
		-it \
		--net=$(NETWORK) \
		$(IMAGE) \
		influx -host $(APPNAME)

## Init Influx database...
init:
	echo "Init Influx database..."
	$(DOCKER) run --rm \
		-it \
		--net=$(NETWORK) \
		$(IMAGE) \
		influx -host $(APPNAME) -execute 'CREATE DATABASE $(DATABASE_NAME)'

