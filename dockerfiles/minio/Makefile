.SILENT :
.PHONY : client

USERNAME:=minio
APPNAME:=minio

RUN_CMD=server /export

# Include common Make tasks
root_dir:=$(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))
makefiles:=$(root_dir)/../../makefiles
include $(makefiles)/help.Makefile
include $(makefiles)/docker.Makefile

## Run the container in client mode
client:
	echo "Running client to container $(APPNAME)..."
	$(DOCKER) run --rm \
		-it \
		--net=$(NETWORK) \
		--entrypoint=/bin/ash \
		$(USERNAME)/mc:edge

