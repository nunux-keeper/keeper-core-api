Feature: Admin API
    As an admin user I can access the admin API

    Scenario: Access unauthorized
        Given I am a valid user with the uid "test"
        When I get all the users
        Then I should be rewarded by a 403 HTTP code

    Scenario: List users
        Given I am a valid user with the uid "system"
        When I get all the users
        Then I should find myself into the result

    Scenario: Get user details
        Given I am a valid user with the uid "system"
        When I get data of "system" user
        Then I should have "system" into the user uid
