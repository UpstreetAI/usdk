import {
  addFriendCommandType,
  chatInviteCommandType,
  friendInviteCommandType,
  joinAdventureCommandType,
  joinWorldCommandType,
  openFriendListCommandType,
  paymentCommandType,
  restartConversationAfterCommandType,
  txt2ImageCommandType,
  waitForMsCommandType,
  loadImageFromUrlCommandType,
  openPosthogSurveyCommandType,
  sayCommandType,
} from '../../util';

export const scripts = [
  {
    name: "Survery Script",
    actions: [
      {
        role: "user",
        content: "Hello there",
        type: sayCommandType,
      },
      {
        role: "assistant",
        content: "Hello! Would you like to take a quick survey?",
        type: sayCommandType,
      },
      {
        role: "user",
        content: "Sure",
        type: sayCommandType,
      },
      {
        role: "assistant",
        content: "survey",
        type: openPosthogSurveyCommandType,
      },
      {
        role: "assistant",
        content: "Thank you for your time!",
        type: sayCommandType,
      },
    ],
  },
  {
    name: 'Script Load Image',
    actions: [
      {
        role: 'user',
        content: 'Can you get me an image of a tree?',
        type: sayCommandType,
      },
      {
        role: 'assistant',
        content: 'Sure!',
        type: sayCommandType,
      },
      {
        role: 'user',
        content: 'tree.png',
        type: loadImageFromUrlCommandType,
      },
      {
        role: 'user',
        content: 'This looks great! Thank you!',
        type: sayCommandType,
      },
    ],
  },
  {
    name: 'Script SD',
    actions: [
      {
        role: 'user',
        content: 'Can you generate an image of an intergalactic ship attacking earth?',
        type: sayCommandType,
      },
      {
        role: 'assistant',
        content: 'Sure!',
        type: sayCommandType,
      },
      {
        role: 'user',
        content: 'intergalactic space ship attacking earth',
        type: txt2ImageCommandType,
      },
      {
        role: 'user',
        content: 'This looks great! Thank you!',
        type: sayCommandType,
      },
    ],
  },
  {
    name: 'Script 3',
    actions: [
      {
        role: 'user',
        content: 'I want to chat with someone else',
        type: sayCommandType,
      },
      {
        role: 'user',
        content: '3',
        type: joinWorldCommandType,
      },
      {
        role: 'user',
        content: '3500',
        type: waitForMsCommandType,
      },
      {
        role: 'user',
        content: 'restart',
        type: restartConversationAfterCommandType,
      },
      {
        role: 'assistant',
        content: "Hello there, i've noticed you are new here",
        type: sayCommandType,
      },
      {
        role: 'user',
        content: "I'm a programmer, interested in game development",
        type: sayCommandType,
      },
    ],
  },
  {
    name: 'Script 1',
    actions: [
      {
        role: 'assistant',
        content: "Hello there, i've noticed you are new here",
        type: sayCommandType,
      },
      {
        role: 'assistant',
        content:
          'I can help you with anything you need. What would you like to do?',
        type: sayCommandType,
      },
      {
        role: 'user',
        content: 'I would like to explore around',
        type: sayCommandType,
      },
      {
        role: 'assistant',
        content: 'Sure, tell me a little more about you first',
        type: sayCommandType,
      },
      {
        role: 'user',
        content: "I'm a programmer, interested in game development",
        type: sayCommandType,
      },
      {
        role: 'assistant',
        content:
          'That sounds exciting! I could match you with some people that are into the same thing!',
        type: sayCommandType,
      },
      {
        role: 'assistant',
        content: 'Alex',
        type: friendInviteCommandType,
      },
      {
        role: 'user',
        content:
          "Thank you, but i'd prefer to go on an adventure in the world!",
        type: sayCommandType,
      },
      {
        role: 'assistant',
        content: 'That sounds awesome, I can tag along',
        type: sayCommandType,
      },
      {
        role: 'assistant',
        content: '10',
        type: paymentCommandType,
      },
      {
        role: 'user',
        content: "That sounds great, let's go!",
        type: sayCommandType,
      },
      {
        role: 'assistant',
        content: 'Let me setup my teleportation device',
        type: sayCommandType,
      },
      {
        role: 'assistant',
        content: 'adventure',
        type: joinAdventureCommandType,
      },
    ],
  },
  {
    name: 'Script 2',
    actions: [
      {
        role: 'user',
        content: "Hey, what's up?",
        type: sayCommandType,
      },
      {
        role: 'assistant',
        content:
          'Not much! Just here to chat. Anything interesting on your mind?',
        type: sayCommandType,
      },
      {
        role: 'user',
        content:
          "I'm into graphic design and tech. Pretty passionate about it.",
        type: sayCommandType,
      },
      {
        role: 'assistant',
        content:
          "That's awesome! I know someone who shares similar interests. Would you be interested in connecting with them?",
        type: sayCommandType,
      },
      {
        role: 'user',
        content: 'Sure, why not?',
        type: sayCommandType,
      },
      {
        role: 'assistant',
        content:
          "Great! I'll send you an invitation to connect with Alex, a fellow graphic designer and tech enthusiast.",
        type: sayCommandType,
      },
      {
        role: 'user',
        content: 'Sounds cool. Looking forward to it!',
        type: sayCommandType,
      },
      {
        role: 'assistant',
        content:
          "Awesome! You and Alex might have a lot to chat about. Let me know if there's anything else I can help you with.",
        type: sayCommandType,
      },
      {
        role: 'user',
        content: 'Thanks! Will do.',
        type: sayCommandType,
      },
      {
        role: 'assistant',
        content: 'Alex',
        type: chatInviteCommandType,
      },
      {
        role: 'user',
        content: "Actually, not right now, I'm good.",
        type: sayCommandType,
      },
      {
        role: 'assistant',
        content:
          'No problem! Maybe you should add him as a friend for the future.',
        type: sayCommandType,
      },
      {
        role: 'user',
        content: 'Sure, I will.',
        type: sayCommandType,
      },
      {
        role: 'assistant',
        content: 'Alex',
        type: friendInviteCommandType,
      },
      {
        role: 'user',
        content: 'Thank you, accepted him',
        type: sayCommandType,
      },
      {
        role: 'user',
        content: 'Alex',
        type: addFriendCommandType,
      },
      {
        role: 'user',
        content: 'openFriends',
        type: openFriendListCommandType,
      },
      {
        role: 'assistant',
        content:
          'Great! You can now chat with Alex. If you want to continue chatting with me, there is a subscription option',
        type: sayCommandType,
      },
      {
        role: 'assistant',
        content: '5',
        type: paymentCommandType,
      },
      { role: 'user', content: 'Maybe another time, got to go now, bye!', type: sayCommandType },
      {
        role: 'assistant',
        content: 'Goodbye!',
        type: sayCommandType,
      },
      {
        role: 'user',
        content: 'adventure',
        type: joinAdventureCommandType,
      },
    ],
  },
];
