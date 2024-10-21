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
  
  const extractTaggedUserIds = (text, playersMap) => {
    const tagMatches = text.match(/@(\S+)/g);
    if (tagMatches) {
      const taggedUserIds = [];
      for (const tag of tagMatches) {
        const taggedUserName = tag.slice(1);
        const originalName = getAllUsernames(playersMap).find(name => 
          name.toLowerCase().replace(/\s+/g, '') === taggedUserName.toLowerCase()
        );
        if (originalName) {
          const taggedUser = getUserByName(originalName, playersMap);
          if (taggedUser) {
            taggedUserIds.push(taggedUser.playerSpec.id ?? taggedUser.playerSpec.agent.id);
          }
        }
      }
      return taggedUserIds.length > 0 ? taggedUserIds : null;
    }
    return null;
  };
  
  export {
    getAllUsernames,
    completer,
    getUserByName,
    extractTaggedUserIds
  };