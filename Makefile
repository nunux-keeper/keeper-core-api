.SILENT :
.PHONY : help volume mount update build clean cleanup start debug shell test install

USERNAME:=ncarlier
APPNAME:=keeper-core-api
IMAGE:=$(USERNAME)/$(APPNAME)
env?=dev

# Default links
LINK_FLAGS?=--link mongodb:mongodb --link elasticsearch:elasticsearch
# Default configuration
ENV_FLAGS?=--env-file="./etc/default/$(env).env"

# Default Docker run flags
RUN_FLAGS?=-it --rm -h $(APPNAME) -P $(LINK_FLAGS) $(ENV_FLAGS)
# Default Docker run command
RUN_CMD?=

# Default Docker run flags for shell access
SHELL_FLAGS?=-it --rm -h $(APPNAME) -P --entrypoint="/bin/bash" $(LINK_FLAGS) $(ENV_FLAGS)
# Default Docker run command for shell access
SHELL_CMD?=-c /bin/bash

# Volume flags
VOLUME_FLAGS:=

# Docker configuartion regarding the system architecture
DOCKER=docker
DOCKERFILE=Dockerfile
BASEIMAGE_=node:5-onbuild
BASEIMAGE=node:5-onbuild
UNAME_M := $(shell uname -m)
ifeq ($(UNAME_M),armv7l)
	DOCKERFILE=Dockerfile.arm
	BASEIMAGE=ncarlier/nodejs-arm
endif

all: help

## This help screen
help:
	printf "Available targets:\n\n"
	awk '/^[a-zA-Z\-\_0-9]+:/ { \
		helpMessage = match(lastLine, /^## (.*)/); \
		if (helpMessage) { \
			helpCommand = substr($$1, 0, index($$1, ":")); \
			helpMessage = substr(lastLine, RSTART + 3, RLENGTH); \
			printf "%-15s %s\n", helpCommand, helpMessage; \
		} \
	} \
	{ lastLine = $$0 }' $(MAKEFILE_LIST)

Dockerfile.arm:
ifeq ($(UNAME_M),armv7l)
	echo "Building $(APPNAME) ARM dockerfile..."
	sed -e 's|$(BASEIMAGE_)|$(BASEIMAGE)|' Dockerfile > Dockerfile.arm
endif

## Make the volume image
volume:
	echo "Building $(APPNAME) volumes..."
	$(DOCKER) run -v $(PWD):/usr/src/app --name $(APPNAME)_volumes busybox true

## Mount volumes
mount:
	$(eval VOLUME_FLAGS += --volumes-from $(APPNAME)_volumes)
	echo "Using volumes from $(APPNAME)_volumes"

## Update base image
update:
	echo "Updating base image..."
	-$(DOCKER) pull $(BASEIMAGE)

## Build the image
build: update Dockerfile.arm
	echo "Building $(IMAGE) docker image..."
	$(DOCKER) build --rm -t $(IMAGE) -f $(DOCKERFILE) .
	$(MAKE) cleanup

## Remove the image
clean: stop rm
	echo "Removing $(IMAGE) docker image..."
	-$(DOCKER) rmi $(IMAGE)

## Remove dangling images
cleanup:
	echo "Removing dangling docker images..."
	-$(DOCKER) images -q --filter 'dangling=true' | xargs $(DOCKER) rmi

## Start the container
start:
	echo "Starting $(IMAGE) docker image..."
	$(DOCKER) run $(RUN_FLAGS) $(VOLUME_FLAGS) $(IMAGE) $(RUN_CMD)
	
## Run the container in debug mode
debug:
	echo "Running $(IMAGE) docker image in DEBUG mode..."
	$(DOCKER) run $(RUN_FLAGS) $(VOLUME_FLAGS) -p 3333:8080 $(IMAGE) run debug

## Run the container with shell access
shell:
	echo "Running $(IMAGE) docker image with shell access..."
	$(DOCKER) run $(SHELL_FLAGS) $(VOLUME_FLAGS) $(IMAGE) $(SHELL_CMD)

## Run the container in test mode
test:
	echo "Running tests..."
	$(DOCKER) run $(RUN_FLAGS) $(VOLUME_FLAGS) $(IMAGE) test

## Install as a service (needs root privileges)
install: build
	echo "Install as a service..."
	cp etc/systemd/system/* /etc/systemd/system/
	cp etc/default/$(env).env /etc/default/$(APPNAME)
	systemctl daemon-reload
	systemctl restart $(APPNAME)
	$(MAKE) cleanup

