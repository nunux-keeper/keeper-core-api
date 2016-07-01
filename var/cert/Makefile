.SILENT :
.PHONY : all help clean

KEY_LENGHT:=1024

all: help

## This help screen
help:
	printf "Available targets:\n\n"
	awk '/^[a-zA-Z\-\_0-9\.%\/@]+:/ { \
		helpMessage = match(lastLine, /^## (.*)/); \
		if (helpMessage) { \
			helpCommand = substr($$1, 0, index($$1, ":")); \
			helpMessage = substr(lastLine, RSTART + 3, RLENGTH); \
			printf "%-15s %s\n", helpCommand, helpMessage; \
		} \
	} \
	{ lastLine = $$0 }' $(MAKEFILE_LIST)

## Delete all generated certificates
clean:
	@echo "Deleting all generated files..."
	rm *.pem

## Generate key and certificate
%.pem:
	@echo "Generating $@ key and certificate"
	openssl genrsa -out $*.pem $(KEY_LENGHT)
	@echo "Generating $@ certificate"
	openssl rsa -in $*.pem -pubout -out $*-pub.pem

