Feature: Profile API
    As a valid user I can use the API

    Scenario: Access my profile
        Given I am a valid user with the uid "test"
        When I get my profile
        Then I should have "test" in my profile uid

    Scenario: Access my profile with bad API key
        Given I am a valid user with the uid "test"
        And   I am using the API key
        When I access the API "/v2/profiles/current"
        Then I should be rewarded by a 401 HTTP code

    Scenario: Update profile and access profile with good API key
        Given I am a valid user with the uid "test"
        When I update my profile with:
          | resetApiKey | true |
        Then I should have an API key in my profile
        Given I am using the API key
        When I access the API "/v2/profiles/current"
        Then I should be rewarded by a 401 HTTP code
        When I create the following document:
          | title | Simple text document using API key |
          | content | Lorem ipsum dolor sit amet |
          | contentType | text/plain; charset=utf-8 |
        Then I should retrieve the document


