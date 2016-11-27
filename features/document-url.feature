Feature: Document API using url
    As a valid user I can use the document API

    Scenario: Post an image URL document
        Given I am a valid user with the uid "test"
        When I create the following document:
            | origin | http://reader.nunux.org/icons/favicon.png?foo=bar |
        Then I should retrieve the document
        And  I should have "text/html" into the document contentType
        And  I should have "http://reader.nunux.org/icons/favicon.png?foo=bar" into the document origin
        And  I should have 1 attachment(s) of "image/png" into the document
        When I am waiting 1000 ms
        Then I should retrieve the document 1st attachment
        When I delete the document
        Then I should not retrieve the document

    Scenario: Post a HTML URL document
        Given I am a valid user with the uid "test"
        When I create the following document:
            | origin | https://reader.nunux.org |
        Then I should retrieve the document
        And  I should have "text/html; charset=utf-8" into the document contentType
        And  I should have "https://reader.nunux.org" into the document origin
        When I am waiting 1000 ms
        Then I should retrieve the document 1st attachment
        When I delete the document
        Then I should not retrieve the document

    Scenario: Post a bookmark URL document
        Given I am a valid user with the uid "test"
        When I create the following document:
            | origin | bookmark+https://reader.nunux.org |
        Then I should retrieve the document
        And  I should have "text/html" into the document contentType
        And  I should have 1 attachment(s) of "image/png" into the document
        And  I should have "https://reader.nunux.org" into the document origin
        When I am waiting 1000 ms
        Then I should retrieve the document 1st attachment
        When I delete the document
        Then I should not retrieve the document

