import {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
} from 'unique-names-generator';

// Function to generate a random username
export function randomUsername(): string {
  const name = uniqueNamesGenerator({
    dictionaries: [adjectives, animals, colors],
    separator: '',
    style: 'capital',
  });

  return name;
}
