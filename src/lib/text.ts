export const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Lower-cases a leading capital for use mid-sentence, leaving acronyms ("EZ-bar") alone. */
export const lowerFirst = (s: string) => s.replace(/^[A-Z](?=[a-z])/, (c) => c.toLowerCase());

/** For matching search text: lower case, without accents ("čučanj" finds "cucanj"). */
export const fold = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
