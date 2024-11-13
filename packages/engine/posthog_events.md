### Posthog Events
* new_agent
* matchmaking_button_clicked
* first_message_sent
* chat_message_sent
* payment_request_accepted
* payment_request_declined
* survey seen
* survey dismissed
* survey sent

#### Exaplanations
##### - new_agent
Data:
```
{
    new_agent: string;
    previous_agent: string;
}
```
Invoked when user gets to chat with a new agent
Agent's urls (new and old) from `agentNpcUrls`

##### - matchmaking_button_clicked
Invoked when user enters matchmaking
No extra data included

##### - first_message_sent
Data:
```
{
    timeTookToSendMessage: number;
    message_length: number;
}
```
Invoked only when the user sends a message for the first time when entering the app

##### - chat_message_sent
Data:
```
{
    timeTookToSendMessage: number;
    text: string;
    source: string; (text/voice)
    message_length: number;
}
```
Invoked when a user sends a new message either from text or voice.

##### - payment_request_accepted
Data:
```
{
    amount: number
}
```
Invoked when a user accepts a payment request

##### - payment_request_declined
Data:
```
{
    amount: number
}
```
Invoked when a user declines a payment request

##### - survey seen
Data:
```
{
    survey_id: string;
}
```
Invoked when a posthog survey is shown

##### - survey dismissed
Data:
```
{
    survey_id: string;
}
```
Invoked when the user dismisses a posthog survey

##### - survey sent
Data:
```
{
    survey_id: string;
    survey_response: number;
}
```
Invoked when the user replies to a posthog survey