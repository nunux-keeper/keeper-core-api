Feature: Sharing API
  As a valid user I can use the sharing API

  Scenario: Share a simple text document
    Given I am a valid user with the uid "test"
    When I create the following label:
      | label | shared  |
      | color | #f2f2f2 |
    And  I create the following document:
      | title | Document to share |
      | content | Lorem ipsum dolor sit amet |
      | contentType | text/plain; charset=utf-8 |
    And  I am waiting 1000 ms
    And  I share the label
    Then I should retrieve the sharing
    Given I am a valid user with the uid "other"
    Then I should not retrieve the document
    And  I should retrieve the shared label
    And  I should retrieve the document into the search result
    And  I should retrieve the shared document
    Given I am a valid user with the uid "test"
    When I remove the sharing
    Then I should not retrieve the sharing
    Given I am a valid user with the uid "other"
    Then I should not retrieve the document
    And  I should not retrieve the shared label
    And  I should not retrieve the shared document

  Scenario: Share a public document
    Given I am a valid user with the uid "test"
    When I create the following label:
      | label | public  |
      | color | #f2f2f2 |
    And  I create the following document:
      | title | Document to publish |
      | content | Lorem ipsum dolor sit amet |
      | contentType | text/plain; charset=utf-8 |
    And  I am waiting 1000 ms
    And  I share the label
    Then I should retrieve the sharing
    Given I am an anonymous user
    Then I should not retrieve the document
    And  I should not retrieve the shared label
    And  I should not retrieve the shared document
    And  I should not retrieve the public document
    Given I am a valid user with the uid "test"
    When I update the sharing:
      | pub | true  |
    Then I should retrieve the sharing
    Given I am an anonymous user
    Then  I should not retrieve the shared label
    And  I should not retrieve the shared document
    And  I should retrieve the public label
    And  I should retrieve the public document
    And  I should retrieve the public feed

