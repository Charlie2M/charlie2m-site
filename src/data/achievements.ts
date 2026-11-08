// Shared by the server-rendered panel and the browser script. Order = display order.
export const ACHIEVEMENTS = ['konami', 'miner', 'polyglot', 'qa', 'levelup', 'hacker', 'nightowl', 'gg'] as const;
export type AchievementId = (typeof ACHIEVEMENTS)[number];
