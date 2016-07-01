.SILENT :
.PHONY : all help clean

KEY_LENGHT:=1024

DAYS:=1460

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

## Generate keys
%.pem:
	@echo "Generating $@ private key"
	openssl genrsa -out $*.pem $(KEY_LENGHT)
	@echo "Extracting $@ public key"
	openssl rsa -in $*.pem -pubout -out $*-pub.pem

## Generate certificate
%.crt:
	@echo "Generating $@ certificate"
	openssl req -new -key $*.pem -out $*.csr -subj '/CN=$*/'
	openssl req -x509 -sha256 -days $(DAYS) -key $*.pem -in $*.csr -out $*.crt
	rm $*.csr

