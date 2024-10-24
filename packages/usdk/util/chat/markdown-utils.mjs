import pc from 'picocolors';
import cliMd from 'cli-markdown';
import { getPlayerColor } from './color-utils.mjs';

const truncateLine = '\x1b[2K\r';

const markdownRules = [
    {
        pattern: /@(\S+)/g,
        replace: (match, username) => `@[${username}](mention)`,
        style: (text) => pc.bold(pc.cyan(text)),
    },
    // Add more rules here for other Markdown elements
    // Example:
    // {
    //   pattern: /\*\*(.*?)\*\*/g,
    //   replace: (match, text) => `**${text}**`,
    //   style: (text) => pc.bold(text)
    // },
];

export const convertToMarkdown = (text) => {
    let result = text;
    markdownRules.forEach(rule => {
        result = result.replace(rule.pattern, rule.replace);
    });
    return result;
};

export const styleMarkdown = (text) => {
    let result = text;
    markdownRules.forEach(rule => {
        result = result.replace(rule.pattern, (match, ...args) => {
            return rule.style(match);
        });
    });
    return result;
};

export const displayStyledMarkdownMessage = (sender, message) => {
    const styledMessage = styleMarkdown(message);
    const color = getPlayerColor(sender);
    const markdownMessage = cliMd(styledMessage);
    console.log(`${truncateLine}${pc.bold(color(sender))}: ${markdownMessage}`);
};