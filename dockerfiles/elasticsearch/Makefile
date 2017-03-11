.SILENT :

APPNAME:=elasticsearch
IMAGE:=elasticsearch:5

# Default configuration
ENV_FLAGS=-e ES_JAVA_OPTS="-Xms256m -Xmx256m"

# Define heathcheck command
define HEALTHCHECK_FLAGS
	--health-cmd="curl --silent --fail localhost:9200/_cluster/health || exit 1" \
	--health-interval=5s \
	--health-retries=12 \
	--health-timeout=2s
endef

# Custom run flags
RUN_CUSTOM_FLAGS?=$(HEALTHCHECK_FLAGS) $(ENV_FLAGS)

# sudo sysctl -w vm.max_map_count=262144

ROOT_DIR:=$(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))

include $(ROOT_DIR)/../common/_Makefile

