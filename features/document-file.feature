Feature: Document API using file
    As a valid user I can use the document API

    Scenario: Upload a text document
        Given I am a valid user with the uid "test"
        When I create the following document:
            | files | ./var/assets/gpl.txt |
        Then I should retrieve the document
        And  I should have "text/plain" into the document contentType
        When I delete the document
        Then I should not retrieve the document

    Scenario: Upload an image document
        Given I am a valid user with the uid "test"
        When I create the following document:
            | files | ./var/assets/oss.png |
        Then I should retrieve the document
        And  I should have "text/html" into the document contentType
        And  I should have 1 attachment(s) of "image/png" into the document
        Then I should retrieve the document 1st attachment
        When I delete the document
        Then I should not retrieve the document

    Scenario: Upload multiple file document
        Given I am a valid user with the uid "test"
        When I create the following document:
            | files | ./var/assets/gpl.html |
            | files | ./var/assets/oss.png |
        Then I should retrieve the document
        And  I should have "text/html" into the document contentType
        And  I should have 1 attachment(s) of "image/png" into the document
        Then I should retrieve the document 1st attachment
        When I delete the document
        Then I should not retrieve the document

