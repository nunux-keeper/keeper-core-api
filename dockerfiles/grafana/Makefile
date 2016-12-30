.SILENT :

USERNAME:=grafana
APPNAME:=grafana

ROOT_DIR:=$(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))

define RUN_CUSTOM_FLAGS
-p 3001:3000
endef

include $(ROOT_DIR)/../common/_Makefile

