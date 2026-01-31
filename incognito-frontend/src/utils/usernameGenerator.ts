const adjectives = [
  'Silent', 'Brave', 'Mysterious', 'Curious', 'Clever', 'Swift',
  'Gentle', 'Bold', 'Witty', 'Stealthy', 'Noble', 'Wise',
  'Fierce', 'Calm', 'Bright', 'Dark', 'Hidden', 'Secret'
];

const nouns = [
  'Whale', 'Owl', 'Fox', 'Wolf', 'Eagle', 'Panther',
  'Raven', 'Bear', 'Tiger', 'Hawk', 'Lion', 'Falcon',
  'Dragon', 'Phoenix', 'Shadow', 'Ghost', 'Spirit', 'Phantom'
];

export const generateUsername = (): string => {
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  const randomNumber = Math.floor(Math.random() * 999) + 1;
  
  return `${randomAdjective}${randomNoun}${randomNumber}`;
};

export const validateUsername = (username: string): { isValid: boolean; error?: string } => {
  if (!username || username.trim().length === 0) {
    return { isValid: false, error: 'Username cannot be empty' };
  }
  
  if (username.length < 3) {
    return { isValid: false, error: 'Username must be at least 3 characters' };
  }
  
  if (username.length > 20) {
    return { isValid: false, error: 'Username must be less than 20 characters' };
  }
  
  // Only allow alphanumeric and underscores
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { isValid: false, error: 'Username can only contain letters, numbers, and underscores' };
  }
  
  return { isValid: true };
};