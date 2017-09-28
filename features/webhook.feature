Feature: Webhook API
    As a valid user I can use the webhook API

    Scenario: CRUD operations on webhooks
        Given I am a valid user with the uid "test"
        When I create the following webhook:
          | url    | https://httpbin.org |
          | secret | 12345979 |
          | active | false |
        Then I should retrieve the webhook
        And  I should have "https://httpbin.org" into the webhook url
        When I update the webhook with:
          | secret | 987654321 |
        Then I should retrieve the webhook
        And  I should have "987654321" into the webhook secret
        When I delete the webhook
        Then I should not retrieve the webhook

    Scenario: Search operation on webhooks
        Given I am a valid user with the uid "test"
        When I create the following webhook:
          | url    | https://httpbin.org/post?test=1 |
          | active | false |
          | events | create,update |
          | labels | 123,456,789 |
        And I create the following webhook:
          | url    | https://httpbin.org/post?test=3 |
          | events | create |
          | labels | 123,456,789 |
        And I create the following webhook:
          | url    | https://httpbin.org/post?test=2 |
          | events | create,update |
          | labels | 123 |
        Then I should retrieve 2 active webhook(s) with:
          | event | create |
          | label | 123 |
        Then I should retrieve 1 active webhook(s) with:
          | event | update |
        Then I should retrieve 0 active webhook(s) with:
          | event | update |
          | label | 456 |

