Feature: Label API
    As a valid user I can use the label API

    Scenario: Post/Update/Delete/Restore a new label
        Given I am a valid user with the uid "test"
        When I create the following label:
          | label | test |
          | color | #f2f2f2 |
        And  I get my labels
        Then I should get the label "test" with "#f2f2f2" as color in my labels
        When I update the previous label with value "test_" and color "#f3f3f3"
        And  I get my labels
        Then I should not get the label "test" with "#f2f2f2" as color in my labels
        And  I should get the label "test_" with "#f3f3f3" as color in my labels
        When I delete the previous label
        And  I get my labels
        Then I should not get the label "test_" with "#f3f3f3" as color in my labels
        When I restore the previous label
        And  I get my labels
        Then I should get the label "test_" with "#f3f3f3" as color in my labels
        When I delete the previous label
        And  I get my labels
        Then I should not get the label "test_" with "#f3f3f3" as color in my labels

