import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import pc from 'picocolors';

const packageJsonPath = './package.json';
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

// Get the current version of the sdk
export const currentSdkVersion = () => packageJson.version;

// Get the latest version of the sdk
export function latestSdkVersion() {
  try {
    const latestVersion = execSync(`npm show ${packageJson.name} version`).toString().trim();
    return latestVersion;
  } catch (error) {
    console.log(pc.red('Error checking latest usdk version on the registry.'));
  }
}

// Check if the Node.js version is equal or above the minimum required version
export function checkNodeVersion(packageJsonPath = './package.json') {
  const { engines } = JSON.parse(readFileSync(packageJsonPath, 'utf-8')) || {};
  const requiredVersion = engines?.node;

  if (!requiredVersion) {
    console.error(pc.red('Node.js version requirement is not defined in package.json.'));
    process.exit(1);
  }

  const currentMajor = +process.version.slice(1).split('.')[0];
  const requiredMajor = +requiredVersion.match(/\d+/)[0];

  if (currentMajor < requiredMajor) {
    console.error(pc.yellow(`Node.js ${requiredVersion} or higher is required. You are using ${process.version}.`));
    process.exit(1);
  }
}


