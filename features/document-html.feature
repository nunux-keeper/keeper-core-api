Feature: Document API with HTML cleanup
    As a valid user I can use the document API

    Scenario: Post a not well formated HTML document
        Given I am a valid user with the uid "test"
        When I create the following html document
        """
        <p id="toclean">sample</P><img src="http://reader.nunux.org/icons/favicon.png"/>
        <img class="bad" src = "http://feeds.feedburner.com/~r/azerty" />
        <img class="bad" src = "http://doubleclick.net/azerty" />
        <img class="test" app-src="test" src = "test" alt="test" />
        """
        Then I should get the following document content
        """
        <p>sample</p><img app-src="http://reader.nunux.org/icons/favicon.png">


        <img app-src="test" alt="test">
        """
        When I update the document with:
            | content | <p>updated sample</P><img src="http://reader.nunux.org/icons/favicon.png"/> |
        Then I should get the following document:
            | content | <div><p>updated sample</p><img app-src="http://reader.nunux.org/icons/favicon.png"></div> |
        When I delete the document
        Then I should not retrieve the document

