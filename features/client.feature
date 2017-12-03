Feature: Client API
    As a valid user I can use the client API

    Scenario: CRUD operations on clients
        Given I am a valid user with the uid "test"
        When I create the following client:
          | name | test |
          | redirectUris | https://httpbin.org |
        Then I should retrieve the client
        And  I should have "test" into the client name
        When I update the client with:
          | name | updated |
          | redirectUris | https://httpbin.org/test |
        Then I should retrieve the client
        And  I should have "updated" into the client name
        When I delete the client
        Then I should not retrieve the client

