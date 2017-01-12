Feature: Admin API
  As an admin user I can access the admin API

  Scenario: Access unauthorized
    Given The system is ready
    And   I am a valid user with the uid "test"
    When I get all the users
    Then I should be rewarded by a 403 HTTP code

  Scenario: List users
    Given I am a valid user with the uid "system"
    When I get all the users
    Then I should retrieve "system" into the result

  Scenario: Get user details
    Given I am a valid user with the uid "system"
    When I get data of "system" user
    Then I should have "system" into the user uid

  Scenario: Delete user
    Given I am a valid user with the uid "system"
    When I delete the user "test"
    Then I should be rewarded by a 205 HTTP code
    When I get all the users
    Then I should not retrieve "test" into the result

  Scenario: Delete myself
    Given I am a valid user with the uid "system"
    When I delete the user "system"
    Then I should be rewarded by a 400 HTTP code

