const getAllUsernames = (playersMap) => {
    if (!playersMap) {
      return [];
    }
    const usernames = [];
    for (let [_, user] of playersMap) {
      usernames.push(user.playerSpec.name || user.playerSpec.agent.name);
    }
    return usernames;
};
  
const completer = (line, playersMap) => {
    if (!playersMap) {
        return [[], line];
    }
    const lastWord = line.split(' ').pop();
    if (lastWord.startsWith('@')) {
        const partialName = lastWord.slice(1).toLowerCase();
        const usernames = getAllUsernames(playersMap);
        const matches = usernames.filter(name => 
        name.toLowerCase().startsWith(partialName)
        );
        const completions = matches.map(name => '@' + name.replace(/\s+/g, ''));
        return [completions, lastWord];
    }
    return [[], line];
};

const getUserByName = (name, playersMap) => {
    for (let [_, user] of playersMap) {
        const userName = user.playerSpec.name || user.playerSpec.agent.name;
        if (userName.toLowerCase() === name.toLowerCase()) {
        return user;
        }
    }
    return null;
};

const extractTaggedUsers = (text, playersMap) => {
    const taggedUserIds = [];
    const mentionRegex = /@\[([^\]]+)\]\(mention\)/g;

    const findUserByName = (username) => {
        const trimmedUsername = username.trim().toLowerCase();
        for (let player of playersMap.values()) {
            const { name, agent } = player.playerSpec;
            const agentName = agent?.name ?? name;
            const normalizedAgentName = agentName.trim().replace(/\s+/g, '').toLowerCase();
            const normalizedPlayerName = name?.trim().replace(/\s+/g, '').toLowerCase();
            if (normalizedAgentName === trimmedUsername || normalizedPlayerName === trimmedUsername) {
                return player;
            }
        }
        return null;
    };

    text.replace(mentionRegex, (match, username) => {
        const user = findUserByName(username);
        if (user) {
            const userId = user.playerSpec.id || user.playerSpec.agent.id;
            taggedUserIds.push(userId);
            return `@${username}`;
        }
        return match;
    });

    return taggedUserIds.length > 0 ? taggedUserIds : null;
};


export {
    getAllUsernames,
    completer,
    getUserByName,
    extractTaggedUsers
};