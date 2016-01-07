Feature: Document API
    As a valid user I can use the document API

    Scenario: Post a simple text document
        Given I am a valid user with the uid "test"
        When I create the following document:
            | content | Simple text document |
            | contentType | text/plain; charset=utf-8 |
        Then I should retrieve the document
        And  I should retrieve the raw document
        Given I am a valid user with the uid "other"
        Then I should not retrieve the document

    Scenario: Update a simple text document
        Given I am a valid user with the uid "test"
        When I create the following document:
            | content | Simple text document to update |
            | contentType | text/plain |
        And  I update the document with:
            | content | Simple updated text document |
        Then I should retrieve the document
        And  I should have "Simple updated text document" into the document content

    Scenario: Delete a simple text document
        Given I am a valid user with the uid "test"
        When I create the following document:
            | content | Simple text document to delete |
            | contentType | text/plain |
        And  I delete the document
        Then I should not retrieve the document
        When I restore the document
        Then I should retrieve the document
        When I delete the document
        Then I should not retrieve the document


