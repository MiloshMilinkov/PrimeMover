export const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Lower-cases a leading capital for use mid-sentence, leaving acronyms ("EZ-bar") alone. */
export const lowerFirst = (s: string) => s.replace(/^[A-Z](?=[a-z])/, (c) => c.toLowerCase());

const listFormat = new Intl.ListFormat('en-GB', { type: 'conjunction' });

/** "a, b and c" */
export const joinList = (items: string[]) => listFormat.format(items);
