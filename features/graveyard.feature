Feature: Graveyard API
  As a valid user I can use the graveyard API

  Scenario: Find ghosts in the graveyard
    Given I am a valid user with the uid "test"
    When I create the following document:
      | title | Simple text document |
      | content | Lorem ipsum dolor sit amet |
      | contentType | text/plain; charset=utf-8 |
    Then I should retrieve the document
    When I delete the document
    Then I should not retrieve the document
    When I am waiting 2000 ms
    And  I get the graveyard
    Then I should retrieve the document into the graveyard
    When I delete the document from the graveyard
    And  I am waiting 1000 ms
    And  I get the graveyard
    Then I should not retrieve the document into the graveyard

  Scenario: Empty the graveyard
    Given I am a valid user with the uid "test"
    When I create the following document:
      | title | Simple text document |
      | content | Lorem ipsum dolor sit amet |
      | contentType | text/plain; charset=utf-8 |
    Then I should retrieve the document
    When I delete the document
    Then I should not retrieve the document
    When I empty the graveyard
    And  I am waiting 2000 ms
    And  I get the graveyard
    Then I should have no document into the graveyard

