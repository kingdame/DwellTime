# CLAUDE.md - DwellTime Project Guidelines

This file provides guidance for Claude (AI assistant) when working on this project.

## Project Overview

DwellTime is a GPS-verified detention tracking platform for trucking professionals built with:
- **React Native** (Expo SDK 54)
- **TypeScript** (strict mode)
- **Supabase** (Auth, Postgres, Edge Functions)
- **Expo Router** (file-based navigation)
- **Zustand** (client state)
- **TanStack Query** (server state)

## Development Commands

```bash
# Start development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Type check
npm run typecheck

# Lint
npm run lint

# Format code
npm run format
```

## Project Structure

```
src/
├── app/                    # Expo Router screens
│   ├── (tabs)/            # Main tab navigation
│   └── auth/              # Authentication screens
├── features/              # Feature modules
│   ├── auth/              # Authentication feature
│   ├── detention/         # Core detention tracking
│   │   ├── components/    # UI components
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # Business logic
│   │   ├── store.ts       # Zustand store
│   │   └── utils/         # Utility functions
│   └── facilities/        # Facility management
├── shared/                # Shared code
│   ├── components/        # Reusable UI components
│   ├── hooks/            # Shared hooks
│   ├── lib/              # Libraries (supabase, etc.)
│   └── stores/           # Global stores
├── constants/             # App constants (colors, typography)
└── types/                 # TypeScript types
```

## Code Style Guidelines

1. **File Size**: Keep files under 300 lines. Split into smaller modules if needed.
2. **Components**: One component per file, use function components with TypeScript interfaces.
3. **Testing**: Write tests alongside implementation. Minimum 80% coverage for utilities.
4. **Imports**: Use path aliases (`@/`) for absolute imports.
5. **Types**: Prefer explicit types over `any`. Use strict TypeScript.
6. **Error Handling**: Always handle errors gracefully with user feedback.

## Testing

```bash
# Current test status: 28 tests passing
# - geoUtils.ts: 11 tests (Haversine, geofencing)
# - timerUtils.ts: 17 tests (grace period, detention calculations)
```

Test files are colocated with source: `*.test.ts` or `__tests__/` folders.

## Key Configuration

- **Grace Period Default**: 120 minutes (2 hours)
- **Hourly Rate Default**: $75/hr
- **Geofence Radius Default**: 200 meters
- **GPS Log Interval**: 5 minutes

## Environment Variables

Required in `.env`:
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

---

# CRITICAL WORKFLOW RULES

## Plan Updates (MANDATORY)

**After EVERY git commit and push, you MUST update the implementation plan:**

1. **Location**: `docs/IMPLEMENTATION_PLAN.md`
2. **What to update**:
   - Mark completed tasks with `[x]`
   - Add any new tasks discovered during implementation
   - Update the version number if significant changes
   - Update the "Updated" date in the footer
3. **Why**: This ensures project continuity if sessions are interrupted or context is lost.

### Update Checklist

```markdown
After git push, verify:
[ ] Completed tasks marked with [x] in docs/IMPLEMENTATION_PLAN.md
[ ] Any new discovered tasks added to appropriate section
[ ] Plan file saved and committed if changed
```

## Git Workflow

1. **Before starting work**: Review `docs/IMPLEMENTATION_PLAN.md` to understand current status
2. **During work**: Use TodoWrite tool to track active tasks
3. **After completing a feature**:
   - Run tests: `npm test`
   - Check types: `npm run typecheck`
   - Commit with descriptive message
   - Push to GitHub
   - **UPDATE `docs/IMPLEMENTATION_PLAN.md`** (mark completed items)
4. **At session end**: Ensure plan reflects all completed work

## Repository

- **GitHub**: https://github.com/kingdame/DwellTime
- **Branch Strategy**: Main branch for now (single developer)

## Supabase Project

- **URL**: https://zxrnfcckzjrnbrfymlnz.supabase.co
- **Region**: (check dashboard)
- **Database**: PostgreSQL with RLS enabled

## Current Progress Summary

### Completed (Phase 1):
- Project initialization and structure
- Supabase client and auth setup
- Database schema with RLS policies
- State management (Zustand + TanStack Query)
- Navigation structure (Expo Router)
- Core UI components (Button, Input, Card, LoadingSpinner)
- Detention timer with grace period logic (17 tests)
- Geofencing utilities with Haversine distance (11 tests)
- Home screen with timer integration
- StatusCard and TimerDisplay components

### In Progress:
- Authentication flow (1.5)
- Toast notifications (1.7.7)
- Dark mode toggle (1.7.8)

### Next Up:
- GPS logging service (2.6)
- Push notifications (2.7)
- Evidence chain fields (2.9)

---

## Contact

For questions about this project, refer to the implementation plan or ask the user (project owner).
