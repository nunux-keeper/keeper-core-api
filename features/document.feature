Feature: Document API
    As a valid user I can use the document API

    Scenario: Post a simple text document
        Given I am a valid user with the uid "test"
        When I create a random text document
        Then I should retrieve the document
        Given I am a valid user with the uid "other"
        Then I should not retrieve the document

    Scenario: Update a simple text document
        Given I am a valid user with the uid "test"
        When I create a random text document
        And  I update the document title with "Test title"
        Then I should retrieve the document
        And  I should have "Test title" into the document title

    Scenario: Delete a simple text document
        Given I am a valid user with the uid "test"
        When I create a random text document
        And  I delete the document
        Then I should not retrieve the document

