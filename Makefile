.SILENT :
.PHONY : test up down install

APPNAME:=keeper-core-api
env?=dev

# Default links
LINK_FLAGS?=--link mongodb:mongodb --link elasticsearch:elasticsearch --link redis:redis

# Default configuration
ENV_FLAGS?=--env-file="./etc/default/$(env).env"

# Custom run flags
RUN_CUSTOM_FLAGS?=-P $(ENV_FLAGS) $(LINK_FLAGS)

# Docker configuartion regarding the system architecture
BASEIMAGE=node:5-onbuild
UNAME_M := $(shell uname -m)
ifeq ($(UNAME_M),armv7l)
	BASEIMAGE=ncarlier/nodejs-arm
endif

ROOT_DIR:=$(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))

include $(ROOT_DIR)/dockerfiles/common/_Makefile

## Run the container in test mode
test:
	echo "Running tests..."
	$(DOCKER) run $(RUN_FLAGS) $(VOLUME_FLAGS) $(IMAGE) test

## Start a complete infrastucture
up:
	echo "Starting MongoDB ..."
	make -C $(ROOT_DIR)/dockerfiles/mongodb stop rm start
	echo "Starting Elasticsearch ..."
	make -C $(ROOT_DIR)/dockerfiles/elasticsearch stop rm start
	echo "Starting Redis ..."
	make -C $(ROOT_DIR)/dockerfiles/redis stop rm start

## Stop the infrastucture
down:
	echo "Stoping MongoDB ..."
	make -C $(ROOT_DIR)/dockerfiles/mongodb stop rm
	echo "Stoping Elasticsearch ..."
	make -C $(ROOT_DIR)/dockerfiles/elasticsearch stop rm
	echo "Stoping Redis ..."
	make -C $(ROOT_DIR)/dockerfiles/redis stop rm

## Install as a service (needs root privileges)
install: build
	echo "Install as a service..."
	cp etc/systemd/system/* /etc/systemd/system/
	cp etc/default/$(env).env /etc/default/$(APPNAME)
	systemctl daemon-reload
	systemctl restart $(APPNAME)
	$(MAKE) cleanup

