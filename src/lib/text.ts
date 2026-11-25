export const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const listFormat = new Intl.ListFormat('en-GB', { type: 'conjunction' });

/** "a, b and c" */
export const joinList = (items: string[]) => listFormat.format(items);
