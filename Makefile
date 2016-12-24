.SILENT :
.PHONY : test test-mongo test-elastic up down install uninstall export import

USERNAME:=nunux-keeper
APPNAME:=keeper-core-api
env?=dev

# Default links
LINK_FLAGS?=--link mongo:mongo --link elasticsearch:elasticsearch --link redis:redis

# Default configuration
ENV_FLAGS?=--env-file="./etc/default/$(env).env"

# Custom run flags
RUN_CUSTOM_FLAGS?=-p 8080:3000 $(ENV_FLAGS) $(LINK_FLAGS)

# Custom run flags
SHELL_CUSTOM_FLAGS?=-P $(ENV_FLAGS) $(LINK_FLAGS)

# Docker configuartion regarding the system architecture
BASEIMAGE=node:5-onbuild
UNAME_M := $(shell uname -m)
ifeq ($(UNAME_M),armv7l)
	BASEIMAGE=armhfbuild/node:5
endif

ROOT_DIR:=$(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))

include $(ROOT_DIR)/dockerfiles/common/_Makefile

## Run the container in test mode
test:
	echo "Running tests..."
	$(DOCKER) run --rm $(RUN_CUSTOM_FLAGS) $(VOLUME_FLAGS) $(IMAGE) test

## Run the container in test mode using MongoDB
test-mongo:
	echo "Running tests with MongoDB..."
	$(eval DB_FLAGS=-e APP_DATABASE_URI=mongodb://mongo/keeper)
	$(DOCKER) run --rm $(LINK_FLAGS) $(VOLUME_FLAGS) $(ENV_FLAGS) $(DB_FLAGS) $(IMAGE) test

## Run the container in test mode using Elasticsearch
test-elastic:
	echo "Running tests with Elasticsearch..."
	$(eval DB_FLAGS=-e APP_DATABASE_URI=elasticsearch://elasticsearch:9200/keeper)
	$(DOCKER) run --rm $(LINK_FLAGS) $(VOLUME_FLAGS) $(ENV_FLAGS) $(DB_FLAGS) $(IMAGE) test

## Start a complete infrastucture
up:
	echo "Starting MongoDB..."
	make -C $(ROOT_DIR)/dockerfiles/mongodb stop rm start
	echo "Starting Elasticsearch ..."
	make -C $(ROOT_DIR)/dockerfiles/elasticsearch stop rm start
	echo "Starting Redis ..."
	make -C $(ROOT_DIR)/dockerfiles/redis stop rm start

## Stop the infrastucture
down:
	echo "Stoping MongoDB..."
	make -C $(ROOT_DIR)/dockerfiles/mongodb stop rm
	echo "Stoping Elasticsearch ..."
	make -C $(ROOT_DIR)/dockerfiles/elasticsearch stop rm
	echo "Stoping Redis ..."
	make -C $(ROOT_DIR)/dockerfiles/redis stop rm

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
	systemctl enable keeper-core-downloader
	systemctl restart keeper-core-downloader
	systemctl enable keeper-core-ghostbuster
	systemctl restart keeper-core-ghostbuster
	systemctl enable keeper-data-backup.timer
	systemctl restart keeper-data-backup.timer
	$(MAKE) cleanup

## Un-install service (needs root privileges)
uninstall:
	echo "Un-install service..."
	systemctl stop keeper-data-backup.timer
	systemctl disable keeper-data-backup.timer
	systemctl stop keeper-core-downloader
	systemctl disable keeper-core-downloader
	systemctl stop keeper-core-ghostbuster
	systemctl disable keeper-core-ghostbuster
	systemctl stop $(APPNAME)
	systemctl disable $(APPNAME)
	rm /etc/systemd/system/keeper-core-*
	rm /etc/default/$(APPNAME)
	systemctl daemon-reload
	$(MAKE) rm clean

## Export all documents of an user (defined by $uid)
export:
ifndef uid
	$(error User not defined. You should set "uid" variable.)
else
	echo "Exporting $(uid) documents..."
	$(DOCKER) exec $(APPNAME) npm run export -- -d --user $(uid) --file /var/opt/app/storage/exports/$(uid).zip
endif

## Import documents from an archive to an user (defined by $uid)
import:
ifndef uid
	$(error User not defined. You should set "uid" variable.)
else
	echo "Exporting $(uid) documents..."
	$(DOCKER) exec $(APPNAME) npm run import -- -d --user $(uid) --file /var/opt/app/storage/exports/$(uid).zip
endif
