Feature: API
    As a anonymous user I can access the base API

    Scenario: Access base API
        Given I am an anonymous user
        When I access the API "/"
        Then I should get the API infos

    Scenario: Access unauthorized API
        Given I am an anonymous user
        When I access the API "/v2/profiles/current"
        Then I should be rewarded by a 401 HTTP code

