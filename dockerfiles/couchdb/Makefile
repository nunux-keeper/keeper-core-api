.SILENT :

APPNAME=couchdb

define RUN_CUSTOM_FLAGS
-p 5984:5984
endef

SHELL_CUSTOM_FLAGS:=${RUN_CUSTOM_FLAGS}

# Include common Make tasks
root_dir:=$(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))
makefiles:=$(root_dir)/../../makefiles
include $(makefiles)/help.Makefile
include $(makefiles)/docker.Makefile

