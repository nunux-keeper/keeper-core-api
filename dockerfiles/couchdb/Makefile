.SILENT :

APPNAME=couchdb

define RUN_CUSTOM_FLAGS
-p 5984:5984
endef

SHELL_CUSTOM_FLAGS:=${RUN_CUSTOM_FLAGS}

ROOT_DIR:=$(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))
include $(ROOT_DIR)/../common/_Makefile
