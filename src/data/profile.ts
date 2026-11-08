// Language-independent data: links, stack graph, project demo output.

export const profile = {
  handle: 'Charlie2M',
  fullName: 'Carlos Alejandro Madrid Mata',
  email: 'charliesusv7@gmail.com',
  linkedin: 'https://www.linkedin.com/in/carlosmadridmata',
  github: 'https://github.com/Charlie2M',
  cv: '/CarlosMadridMata_CV.pdf',
  rateMin: 18,
  rateMax: 25,
  greetings: ['Hello', 'Hola', 'Hallo', 'Olá', 'こんにちは'],
};

export type Group = 'lang' | 'fw' | 'data' | 'qa' | 'tools';

export const stackNodes: { id: string; name: string; group: Group; detail: string; usedIn: string[] }[] = [
  { id: 'python', name: 'Python', group: 'lang', detail: 'FastAPI · SQLAlchemy · discord.py', usedIn: ['Game Stats API', 'LFGBot'] },
  { id: 'java', name: 'Java', group: 'lang', detail: 'Spring Boot · JPA', usedIn: ['StockFlow'] },
  { id: 'ts', name: 'TypeScript', group: 'lang', detail: 'Node.js · NestJS', usedIn: ['UCA'] },
  { id: 'sql', name: 'SQL', group: 'lang', detail: 'PostgreSQL · Oracle', usedIn: ['StockFlow', 'Tecnoin'] },
  { id: 'fastapi', name: 'FastAPI', group: 'fw', detail: 'REST APIs · validation', usedIn: ['Game Stats API'] },
  { id: 'spring', name: 'Spring Boot', group: 'fw', detail: 'REST APIs · JPA · Flyway', usedIn: ['StockFlow'] },
  { id: 'nest', name: 'NestJS', group: 'fw', detail: 'REST endpoints · business logic', usedIn: ['UCA'] },
  { id: 'postgres', name: 'PostgreSQL', group: 'data', detail: 'Schemas · migrations · transactions', usedIn: ['StockFlow'] },
  { id: 'oracle', name: 'Oracle', group: 'data', detail: 'Data integrity checks in DBeaver', usedIn: ['Tecnoin'] },
  { id: 'tests', name: 'JUnit · Mockito', group: 'qa', detail: 'Unit and integration tests · MockMvc', usedIn: ['StockFlow'] },
  { id: 'qa', name: 'Functional QA', group: 'qa', detail: 'Test design · regression · defect reports', usedIn: ['Tecnoin', 'Allied Global', 'Applaudo'] },
  { id: 'jira', name: 'Jira · Xray', group: 'qa', detail: 'Test cases · defect tracking · Azure DevOps', usedIn: ['Tecnoin', 'Allied Global', 'Applaudo'] },
  { id: 'docker', name: 'Docker', group: 'tools', detail: 'Containers for local and CI', usedIn: ['StockFlow'] },
  { id: 'git', name: 'Git · GitHub Actions', group: 'tools', detail: 'Version control · CI pipelines', usedIn: ['StockFlow', 'Game Stats API', 'LFGBot'] },
  { id: 'openapi', name: 'OpenAPI', group: 'tools', detail: 'Swagger docs for every API', usedIn: ['StockFlow', 'Game Stats API'] },
];

/** Edges of the stack graph (from → to). */
export const stackEdges: [string, string][] = [
  ['python', 'fastapi'], ['java', 'spring'], ['ts', 'nest'],
  ['fastapi', 'postgres'], ['spring', 'postgres'], ['nest', 'postgres'], ['sql', 'postgres'], ['sql', 'oracle'],
  ['spring', 'tests'], ['oracle', 'qa'], ['qa', 'jira'],
  ['spring', 'docker'], ['fastapi', 'openapi'], ['spring', 'openapi'], ['docker', 'git'],
];

export const projects = [
  {
    repo: 'https://github.com/Charlie2M/stockflow',
    console: [
      { t: 'cmd', s: 'POST /transfers' },
      { t: 'dim', s: '{ "from": "store-01", "to": "store-07", "sku": "MUG-42", "qty": 3 }' },
      { t: 'ok', s: '201 Created · ledger entry #1042 written' },
      { t: 'cmd', s: 'POST /transfers  (qty: 999)' },
      { t: 'err', s: '409 Conflict · application/problem+json' },
      { t: 'dim', s: '{ "title": "Insufficient stock", "detail": "Transfer rolled back" }' },
    ],
  },
  {
    repo: 'https://github.com/Charlie2M/game-stats-api',
    console: [
      { t: 'cmd', s: 'GET /leaderboard?game=valorant&limit=3' },
      { t: 'ok', s: '200 OK' },
      { t: 'dim', s: '[ { "player": "Charlie2M", "win_rate": 0.61, "kd": 1.34 },' },
      { t: 'dim', s: '  { "player": "…", "win_rate": 0.58, "kd": 1.21 }, … ]' },
    ],
  },
  {
    repo: 'https://github.com/Charlie2M/lfgbot',
    console: [
      { t: 'cmd', s: '/lfg game:Minecraft slots:4 note:"build night"' },
      { t: 'ok', s: 'Posted in #looking-for-group' },
      { t: 'ok', s: 'Thread opened: "Minecraft · build night (1/4)"' },
    ],
  },
];
