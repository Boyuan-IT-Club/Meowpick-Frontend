# Meowpick-Frontend Agents

## Key Commands

Commands must be run from the `Meowpick-Frontend` directory:
```bash
cd Meowpick-Frontend
yarn install              # Install dependencies
yarn api                  # Regenerate API types from src/swagger.json
yarn dev:mp-weixin        # Dev build (outputs to dist/dev/mp-weixin)
yarn build:mp-weixin      # Production build for WeChat Mini Program
yarn type-check           # vue-tsc type checking
yarn release              # Bump version + generate CHANGELOG (release-it)
```

CI build pipeline: `cd Meowpick-Frontend && yarn install && yarn api && yarn build:mp-weixin`

## Tech Stack

- **Framework**: uni-app (DCloud) with Vue 3 + TypeScript
- **Build tool**: Vite + @dcloudio/vite-plugin-uni
- **Package manager**: yarn (lockfile is yarn.lock, NOT package-lock.json)
- **Styling**: SCSS + Tailwind CSS + NutUI
- **State**: Pinia + pinia-plugin-unistorage (for persistence)
- **API client**: Axios (with uniapp-axios-adapter)
- **i18n**: vue-i18n

## Project Structure & Architecture

```
Meowpick-Frontend/
├── src/
│   ├── api/              # Auto-generated from swagger.json (DO NOT edit manually)
│   ├── components/       # Vue components (auto-imported globally)
│   ├── config/           # Store (Pinia), utils (http, pubsub), constants
│   ├── pages/            # Page components (course, find, home, layout, my-comments, proposal)
│   ├── wxcomponents/     # Vant WeApp components
│   └── swagger.json      # API contract (source of truth for api generation)
```

- **API Code Generation**: `yarn api` reads `src/swagger.json` and outputs modular TypeScript API clients to `src/api/`. After updating `swagger.json`, always re-run `yarn api` before making API-related changes.
  - `src/api/http-client.ts` contains the Axios-based HTTP client with interceptors.
  - `src/api/data-contracts.ts` contains TypeScript interfaces for API responses.
- **State Management**: Pinia stores are located in `src/config/store/` (e.g. Course.ts, Route.ts) and use `pinia-plugin-unistorage` for persistence.
- **Routing**: Type-based routing: cards carry a `type` field (`complaint`/`proposal`) that maps to route addresses via a lightweight strategy pattern, avoiding complex if-else chains.
- **Data Flow**: Declarative filtering: the frontend maintains an in-memory list with selected filter tags; filtering and sorting are applied client-side before rendering.
- **Component Auto-imports**: Components in `src/components/` and NutUI components are auto-imported via `unplugin-vue-components`. Do not manually import them.
- **API/Vue Auto-imports**: `vue` (ref, computed), `uni-app` lifecycle hooks (onLoad, onShow), and `pinia` are auto-imported via `unplugin-auto-import`. Do not manually import them.
- **Mock Pattern**: Search for `// Mock` or `mock` comments to find mock data fallbacks. Replace with real API calls when backend is ready.

## Code Style

- ESLint + Prettier (see `.eslintrc.js`)
- Pre-commit hook runs commit-msg lint (conventional commits format)
- Globals declared for mini-program environment: `uni`, `wx`, `UniNamespace`, `uniCloud`, `tt`, `getCurrentPages`
- Path alias: `@` maps to `./src`

## WeChat Mini Program Specifics

- Entry point configured in `project.miniapp.json` and `app.miniapp.json`
- Dev output: `dist/dev/mp-weixin/` — open with WeChat DevTools
- Prod output: `dist/build/mp-weixin/`
- Type definitions for wx API: `@types/wechat-miniprogram`
