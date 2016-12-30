.SILENT :
.PHONY : client dump

APPNAME:=redis
IMAGE:=redis:latest

DATE:=`date +%Y-%m-%d`

ROOT_DIR:=$(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))

include $(ROOT_DIR)/../common/_Makefile

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

