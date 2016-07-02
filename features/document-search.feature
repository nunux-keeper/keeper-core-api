Feature: Document search API
  As a valid user I can use the document search API

  Scenario: Retrieve a simple text document
    Given I am a valid user with the uid "test"
    When I create the following document:
      | title | Document to find |
      | content | With some keywords: foo, bar |
      | contentType | text/plain; charset=utf-8 |
    Then I should retrieve the document
    When I am waiting 1000 ms
    And I search documents with:
      | q | foo AND bar |
      | size | 5 |
    Then I should retrieve the document into the search result
    When  I update the document with:
      | content | With some keywords: foo, foo |
    And I am waiting 1000 ms
    And I search documents with:
      | q | foo AND bar |
    Then I should not retrieve the document into the search result
    When I delete the document
    And I am waiting 1000 ms
    And I search documents with:
      | q | foo AND bar |
    Then I should not retrieve the document into the search result

  Scenario: Retrieve a simple html document
    Given I am a valid user with the uid "test"
    When I create the following html document
    """
    <p>aaa, <b>bbb</b>, <i>ccc</i></p>
    """
    Then I should retrieve the document
    When I am waiting 1000 ms
    And I search documents with:
      | order | desc |
      | size | 1 |
    Then I should retrieve the document into the search result
    When I delete the document
    And I am waiting 1000 ms
    And I search documents with:
      | size | 50 |
    Then I should not retrieve the document into the search result

