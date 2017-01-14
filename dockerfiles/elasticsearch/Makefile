.SILENT :

APPNAME:=elasticsearch
IMAGE:=elasticsearch:5

RUN_CUSTOM_FLAGS=-e ES_JAVA_OPTS="-Xms256m -Xmx256m"

# sudo sysctl -w vm.max_map_count=262144

ROOT_DIR:=$(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))

include $(ROOT_DIR)/../common/_Makefile

