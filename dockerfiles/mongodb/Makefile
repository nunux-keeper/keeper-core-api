.SILENT :
.PHONY : client dump restore

APPNAME=mongo
IMAGE=mongo:latest

DATE:=`date +%Y-%m-%d`

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
		--entrypoint="mongo" \
		$(IMAGE) \
		$(APPNAME)/admin

## Dump database to disk
dump:
	echo "Dumping container $(APPNAME) data..."
	$(DOCKER) run --rm \
		--volumes-from $(APPNAME)_volumes \
		--entrypoint='mongodump' \
		--net=$(NETWORK) \
		$(IMAGE) \
		-h $(APPNAME) --out /var/opt/mongodb/$(DATE)

## Restore database from disk (need BACKUP_NAME)
restore:
ifndef BACKUP_NAME
	$(error BACKUP_NAME is undefined)
else
	echo "Restoring container $(APPNAME) data from backup $(BACKUP_NAME)..."
	$(DOCKER) run --rm \
		--volumes-from $(APPNAME)_volumes \
		--entrypoint='mongorestore' \
		--net=$(NETWORK) \
		$(IMAGE) \
		--host $(APPNAME) /var/opt/mongodb/$(BACKUP_NAME)
endif

