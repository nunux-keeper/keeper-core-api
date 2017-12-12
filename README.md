[![Build Status](https://travis-ci.org/nunux-keeper/keeper-core-api.svg?branch=master)](https://travis-ci.org/nunux-keeper/keeper-core-api)

# Keeper core API

> Your personal content curation service.

This project is the core system of Nunux Keeper. It's an API that allow you to
collect, organize, and retrieve online documents.

## Features

* Create text or HTML documents (from scratch, from an URL or from an uploaded
  file)
* Cleaning web pages for better readability
* Edit document content
* Attach files to a document
* Full Text search on documents
* Create labels (name, color)
* Classify documents with labels
* Remove and restore documents
* Share documents with other users or publicly
* Expose public documents with RSS
* Import and Export documents of an user
* RESTFul API (with [HATOAS][hateoas] support)
* Authentication delegated to external identity provider (like
  [Keycloak][keycloak], [Auth0][auth0], ...)
* Store attachments on disk or on [S3][s3]
* Online API documentation
* Produce metrics (with [StatsD][statsd])
* Publish server event to external systems (with Webhooks, AMQP, ...)
* BDD testing (with [Cucumber][cucumber])

See `ROADMAP.md` for planned features.

## Under the hood

The project is developed with [Node.js][nodejs] and uses the [Express][express]
Framework.

The backend storage is pluggable. Documents can be stored into
[MongoDB][mongodb] or [Elasticsearch][elasticsearch]. It's planned to support
other storage backends (like CouchBase, Cassandra, ...)

The indexation engine is also pluggable, but only Elasticsearch is supported for
now.

[Redis][redis] is used as an event bus to exchange data between services.


## Installation

### Prerequisites

* [Docker][docker]
* [Docker compose][docker-compose]

### Run tests

```bash
# Start required backends (ElasticSearch, MongoDB, Redis)
# Launch tests
# Teardown backends
make build deploy test undeploy
```

You can also launch tests using Elasticsearch as main database:

```bash
make build deploy with-elastic test undeploy
```

### Start the server

> *Warning:* This is useful for testing or have a development server.
> If you want to operate the service and don't lost your data please refer
> below.

```bash
# Start required backends (ElasticSearch, MongoDB, Redis) and the API server.
# (Using dev configuration: etc/default/dev.env)
make with-app deploy logs
```

If you want to start the server with another configuration (for instance:
*staging*) you need to override the `env` variable of the `Makefile`:

```bash
make with-app deploy env=staging
```

Configuration files are located into the `etc/default` directory.
See [etc/default/dev.env](etc/default/dev.env) for development configuration
details.

Finally you can remove everything like this:

```bash
# Stop and destroy all services
make undeploy
```

### Install the server as a service

You need to have all backend services up and running with following Docker
names:

- mongodb
- elasticSearch
- redis

```bash
# Install systemd configuration (for staging env)
make install env=staging
```

> Un-install is as simple: `make uninstall`

Started services are:

- **keeper-core-api**: Core API server.
- **keeper-core-job-worker**: Job worker to process background tasks
- **keeper-data-backup**: Backup documents files (scheduler).

[hateoas]: https://en.wikipedia.org/wiki/HATEOAS
[keycloak]: http://www.keycloak.org
[auth0]: https://auth0.com/
[nodejs]: https://nodejs.org
[docker]: https://www.docker.com
[docker]: https://docs.docker.com/compose/
[mongodb]: https://www.mongodb.com
[elasticsearch]: https://www.elastic.co
[redis]: http://redis.io/
[express]: http://expressjs.com
[cucumber]: https://cucumber.io
[s3]: https://aws.amazon.com/s3
[statsd]: https://github.com/b/statsd_spec


----------------------------------------------------------------------

NUNUX Keeper

Copyright (c) 2016 Nicolas CARLIER (https://github.com/ncarlier)

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.

----------------------------------------------------------------------
