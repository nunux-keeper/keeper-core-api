Feature: Document attachment API
    As a valid user I can use the attachment API

    Scenario: Remove document attachment
        Given I am a valid user with the uid "test"
        When I create the following document:
            | files | ./var/assets/oss.png |
        Then I should retrieve the document
        And  I should have "text/html" into the document contentType
        And  I should have 1 attachment(s) of "image/png" into the document
        Then I should retrieve the document 1st attachment
        When I delete the document 1st attachment
        Then I should retrieve the document
        And  I should have 0 attachment(s) of "image/png" into the document
        When I delete the document
        Then I should not retrieve the document

    Scenario: Add document attachment
        Given I am a valid user with the uid "test"
        When I create the following document:
            | files | ./var/assets/oss.png |
        Then I should retrieve the document
        And  I should have "text/html" into the document contentType
        And  I should have 1 attachment(s) of "image/png" into the document
        Then I should retrieve the document 1st attachment
        When I add attachment(s) to the document:
            | ./var/assets/logo.png |
        Then I should retrieve the document
        And  I should have 2 attachment(s) of "image/png" into the document
        Then I should retrieve the document 2nd attachment
        When I delete the document
        Then I should not retrieve the document

