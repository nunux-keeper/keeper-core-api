.SILENT :
.PHONY : client dump

APPNAME:=redis
IMAGE:=redis:latest

DATE:=`date +%Y-%m-%d`

# Include common Make tasks
root_dir:=$(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))
makefiles:=$(root_dir)/../../makefiles
include $(makefiles)/help.Makefile
include $(makefiles)/docker.Makefile

## Run the container in client mode
client:
	echo "Running client of container $(APPNAME)..."
	$(DOCKER) run --rm \
		-it \
		--entrypoint="redis-cli" \
		--net=$(NETWORK) \
		$(IMAGE) \
		-h $(APPNAME)

## Dump database to disk
dump:
	echo "Dumping container $(APPNAME) data..."
	$(DOCKER) cp $(APPNAME):/var/lib/redis/dump.rdb ./dump.$DATE.rdb

