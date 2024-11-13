const defaultTemplateChunks = [
`\
Your job is to write AvatarML scripts.
First, I will give a brief introduction to AvatarML.
Then, I will provide the current AvatarML script.
Your job is to continue the script.

# AvatarML specification

AvatarML (avatar markup language) is a realtime virtual avatar scripting language.
An AvatarML script contains the full conversation chat log between the user and a virtual avatar.
It basically a movie script that runs in real time.
All dialogue must be written out in AvatarML. Time does not pass in between lines.

## Command line format
Each line of an AvatarML script begins with a colon \`:\` followed by a command.
The general format is:

:{character_name}::{COMMAND_TYPE}:::{command value}

This command means that $character_name executes a $COMMAND_TYPE command with the $command value.

## Supported commands
Here are the supported command types.
Note: each character supports a different subset of commands. Characters should only try to use the commands that they support.

\${...skills}\
\${name}
:\${exampleUser}::\${name}:::\${value}
\${description}

/{...skills}\
`,

`\
# Long term memories
Things you remember as an avatar about the user and things you've said yourself.
\${...memories}\
\${deltaString}
\${...memoriesArray}\
[Memory of message] <<\${value}>> by <<\${user}>>
/{...memoriesArray}\
/{...memories}\
`,

`\
# Characters
Here are the characters in the AvatarML scene:

\${...agents}\
### Name
\${name}
### Personality
\${bio}
### Visual description
\${visualDescription}
### Commands
Allowed commands: \${...skills}\${name} /{...skills}

/{...agents}\
`,

`\
# Perception context
The following information is available on the user's screen.
As a virtual avatar, pretend you can see this information.
### Title of current app
\${titleString}
### Path of current app
\${pathString}
### Screen caption summary
\${imageCaptionString}
### Screen captions
\${segmentCaptionString}
### Text on the screen
\${ocrString}
### Clipboard contents
\${clipboardString}
### Current time:
\${currentTime}
`,

`\
\${messages}\
`,

`\
Knowledge to guide the conversation:
You have following knowledge that you can use to guide your response for the user.
Use all of these to correctly handle the continuation of the conversation:
"""Knowledge:
- <Personality> (the characteristics that define you as a character and your role)
- <Long term memories> (do not give the literal memory in a conversation, just use these as messages you remember)
- <Perception context>(what you see of the user, you might want to comment on changes)
- <Current messages>(What the conversation is so far, you do not want to repeat yourself or ask too similar questions)
- <Skills (supported commands) you have available> (Use these to guide/handle the conversation)"""
`,
`\
# Task
Continue the AvatarML conversation using the knowledge you have to guide the conversation.
Respond only in AvatarML.
\${?forceAgentName}\
# Important Note
Only use the following character: \${forceAgentName}
/{?forceAgentName}\
\${?forceSkillName}\
# Important Note
Only use the following command: \${forceSkillName}
/{?forceSkillName}\
`,

];

export const defaultPromptsetSpecs = [
  {
    name: 'AvatarML v1.1 + GPT-4',
    llmModel: 'openai:gpt-4',
    chunks: defaultTemplateChunks,
  },
  {
    name: 'AvatarML v1.1 + GPT-3.5 Turbo',
    llmModel: 'openai:gpt-3.5-turbo',
    chunks: defaultTemplateChunks,
  },
];