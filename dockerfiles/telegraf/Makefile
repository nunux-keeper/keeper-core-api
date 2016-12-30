.SILENT :

APPNAME:=telegraf
IMAGE:=telegraf:latest

ROOT_DIR:=$(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))

define RUN_CUSTOM_FLAGS
-v $(ROOT_DIR)/telegraf.conf:/etc/telegraf/telegraf.conf:ro
endef

include $(ROOT_DIR)/../common/_Makefile

