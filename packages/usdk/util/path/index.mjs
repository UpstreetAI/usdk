import path from 'path';
import fs from 'fs';

// function to determine the home directory in a cross-platform way
export const getHomeDirectory = () =>  {

  // determine the user's home directory using environment variables
  const homeDir = process.env.HOME || process.env.USERPROFILE || process.env.HOMEPATH;

  if (!homeDir) {
    throw new Error("Unable to determine the home directory. Please ensure your environment is set up correctly.");
  }

  return homeDir;
}

// function to create and return the log directory path
export const getLogDirectory = () => {
  const homeDir = getHomeDirectory();
  const logDirectory = path.join(homeDir, '.usdk', '_logs');

  if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory, { recursive: true });
  }

  return logDirectory;
}