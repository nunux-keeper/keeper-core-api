.SILENT :

APPNAME:=telegraf
IMAGE:=telegraf:latest

root_dir:=$(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))

define RUN_CUSTOM_FLAGS
-v $(root_dir)/telegraf.conf:/etc/telegraf/telegraf.conf:ro
endef

# Include common Make tasks
makefiles:=$(root_dir)/../../makefiles
include $(makefiles)/help.Makefile
include $(makefiles)/docker.Makefile


