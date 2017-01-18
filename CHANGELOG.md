Changelog
=========

2.0.0
-----

### Features
* Authentication delegated to external identity provider (with JWT)
* Create text or HTML documents (from scratch or from an URL)
* Edit online documents
* Search and visualize documents (also in raw mode)
* Create labels (name, color)
* Classify documents with labels
* Remove and restore documents
* Share documents with other users or publicly
* Expose public documents with RSS
* Import and Export documents of an user
* Store attachments on disk or on S3
* Index documents into ElasticSearch
* Online API documentation
* RESTFul API (with HATOAS support)
* Produce metrics (with StatsD)
* BDD testing (with Cucumber)

### Improvements
* New internal structure
* Internal event process (for decoupling and extendability)
* Multi database support (MongoDB or ElasticSearch)
* Complete separation with the frontend
