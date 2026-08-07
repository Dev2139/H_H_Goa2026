export const BUILDER_TITLES = [
  'AI Explorer',
  'Frontend Wizard',
  'Backend Ninja',
  'Code Alchemist',
  'Bug Hunter',
  'Open Source Hero',
  'Full Stack Hustler',
  'Cloud Architect',
  'Pixel Perfectionist',
  'Late Night Builder',
  'API Whisperer',
  'Prompt Engineer',
  'Deploy Master',
  'Database Tamer',
  'React Rockstar'
];

export function getRandomBuilderTitle() {
  const randomIndex = Math.floor(Math.random() * BUILDER_TITLES.length);
  return BUILDER_TITLES[randomIndex];
}
