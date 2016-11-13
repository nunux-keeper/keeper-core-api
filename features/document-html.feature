Feature: Document API with HTML cleanup
    As a valid user I can use the document API

    Scenario: Post a not well formated HTML document
        Given I am a valid user with the uid "test"
        When I create the following html document
        """
        <p id="toclean">sample</P><img src="http://reader.nunux.org/icons/favicon.png"/>
        <img class="bad" src = "http://feeds.feedburner.com/~r/azerty" />
        <img class="bad" src = "http://doubleclick.net/azerty" />
        <img class="bad" height="1" width="1" alt="test" />
        <img src="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'/>" alt="test" class="test" />
        """
        Then I should get the following document content
        """
        <p>sample</p><img data-ref="4af6eef358b9356312aef278dee3d9b3.png">



        <img src="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'/>" alt="test">
        """
        And  I should have "text/html" into the document contentType
        And  I should have 1 attachment(s) of "image/png" into the document
        When I update the document with:
            | content | <p>updated sample</P><img src="http://reader.nunux.org/icons/favicon.png"/> |
        Then I should get the following document:
            | content | <p>updated sample</p><img data-ref="4af6eef358b9356312aef278dee3d9b3.png"> |
        And  I should have 1 attachment(s) of "image/png" into the document
        When I delete the document
        Then I should not retrieve the document

