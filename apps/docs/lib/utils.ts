import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Function to convert version requirement to a readable string
export function formatNodeVersion(versionRange: string) {
  const versionPattern = /([<>~^]=?)([\d.]+)/; // Pattern to capture the operator and version numbers
  const match = versionRange.match(versionPattern);

  if (!match) {
    return `Version ${versionRange}`; // Default if there's no operator
  }

  const [, operator, version] = match;

  // Determine the wording based on the operator
  switch (operator) {
    case '>=':
      return `Version ${version} or above`;
    case '<=':
      return `Version ${version} or below`;
    case '>':
      return `Version above ${version}`;
    case '<':
      return `Version below ${version}`;
    case '~':
      return `Version approximately ${version}`;
    case '^':
      return `Version compatible with ${version}`;
    default:
      return `Version ${version}`;
  }
}
