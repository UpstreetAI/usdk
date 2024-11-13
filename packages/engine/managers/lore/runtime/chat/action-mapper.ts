export function getAction(message: string): {
  type: string;
  animation?: string;
} {
  let action = '';
  message = message.toLowerCase().trim();

  emoteActions.forEach((emote) => {
    if (emote.messages.some((msg) => message.includes(msg))) {
      action = emote.animation;
      return;
    }
  });

  const newEmoteAction = {
    type: 'emote',
    animation: action,
  };
  return newEmoteAction;
}

//split the emotions into objects for easier looping, with the message.includes in array
export const emoteActions = [
  { animation: 'alert', messages: ['hi', 'hello', 'hey'] },
  {
    animation: 'headNod',
    messages: [
      'yes',
      'yep',
      'yeah',
      'yup',
      'sure',
      'ok',
      'okay',
      'fine',
      'alright',
      'right',
      'correct',
      'indeed',
      'absolutely',
      'definitely',
      'certainly',
      'of course',
      'obviously',
    ],
  },
  {
    animation: 'headShake',
    messages: [
      'no',
      'nope',
      'nah',
      'never',
      'not',
      'not really',
      'not sure',
      'not exactly',
      'not necessarily',
      'not particularly',
    ],
  },
];
