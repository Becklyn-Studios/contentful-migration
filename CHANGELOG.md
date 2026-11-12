# v0.4.0

- (bug) Support TypeScript 6 when loading migrations: no deprecated `baseUrl` / `moduleResolution: "node"` for ts-node, explicit `rootDir` (fixes TS5011, TS5101, TS5107)
- (improvement) Pick ts-node's `moduleResolution` from the consumer's TypeScript version (`bundler` for TS >= 6, `node` below), TypeScript 5.x keeps working
- (internal) Build with TypeScript 6

# v0.3.0

- (bc) Require node 22
- (improvement) Update dependencies
- (internal) Improve logging
- (internal) Use new (plain) client for contentful management API

# v0.2.9

- (bug) update dependencies to fix vulnerabilities

# v0.2.8

- (bug) update dependencies to fix vulnerabilities

# v0.2.7

- (bug) add missing "noEmit: false" to tsconfig

# v0.2.6

- (bug) Fix security vulnerabilities by overriding tmp package to v0.2.4

# v0.2.5

- (bug) update dependencies
- (chore) add @becklyn/eslint and @becklyn/tsconfig to project

# v0.2.4

- (bug) Fix dependencies

# v0.2.3

- (bug) Properly load config

# v0.2.2

- (bug) Do not override env variables

# v0.2.1

- (feature) Skip migrations by config

# v0.2.0

- (feature) Execure contentful migrations
