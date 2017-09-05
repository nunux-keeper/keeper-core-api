Feature: Export API
  As a valid user I can export my data

  Scenario: Export documents
    Given The system is ready
    And   I am a valid user with the uid "test"
    When I create the following document:
      | title | Simple text document |
      | content | Lorem ipsum dolor sit amet |
      | contentType | text/plain; charset=utf-8 |
    Then I should retrieve the document
    When I shedule an export
    Then I should get export status
    And  I should download the export file

