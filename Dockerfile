# Nunux Keeper core API server.
#
# VERSION 2.0

FROM node:5-onbuild

MAINTAINER Nicolas Carlier <https://github.com/ncarlier>

# Ports
EXPOSE 3000 8080

# Generate documentation
RUN npm run doc

ENTRYPOINT ["/usr/local/bin/npm"]

CMD ["start"]
