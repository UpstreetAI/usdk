import pc from 'picocolors';

const prefixColors = [pc.green, pc.yellow, pc.blue, pc.magenta, pc.cyan, pc.white, pc.red];

const playerColors = new Map(); // for setting unique colored chat prefix for each player

export const getPlayerColor = (playerId) => {
    if (!playerColors.has(playerId)) {
        const color = prefixColors[playerColors.size % prefixColors.length];
        playerColors.set(playerId, color);
    }
    return playerColors.get(playerId);
};

export const getStyledMessage = (sender, message) => {
    const color = getPlayerColor(sender);
    return `${pc.bold(color(sender))} ${message}`;
};
