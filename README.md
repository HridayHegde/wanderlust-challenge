# Wanderlust Debug Challenge

Welcome to the Wanderlust Debug Challenge! This is a take-home assignment designed to test your debugging and problem-solving skills in a real-world scenario.

## Overview

This project is a Next.js 15 application with App Router, TypeScript, Prisma, PostgreSQL (with pgvector), and shadcn/ui components. The application is a travel destination search platform that allows users to search for destinations and transcribe voice to text.

Unfortunately, there's a bug (or several) preventing the application from running correctly. Your mission is to identify and fix these issues.

## Your Mission (≈15 hours)

1. **Reproduce** the failure locally by running `docker compose up`.
2. **Trace & fix** the root cause(s). The issue(s) could be in API route logic, environment variable configuration, database migration, or elsewhere.
3. **Ship a clean PR** that:
   * Makes all `npm test` cases pass
   * Ensures `/api/ping` returns the expected JSON response
   * Keeps `docker compose up` reproducible on Mac, Linux, and WSL
   * Adds **one new test** proving your fix works

## Rules

* Work solo, **no questions will be answered**—show high agency; document your assumptions in the PR.
* Time-box yourself to **≈15 hours**, submit within **3 days**.
* Do **not** swap the stack; patch it.
* Keep commits atomic with clear messages.
* Update this README.md (≤1 page) explaining your diagnosis + fix path.

## Getting Started

### Prerequisites

* Node.js 18+
* Docker and Docker Compose
* Google AI Studio API key (for voice transcription)

### Setup

1. Clone this repository
2. Create a `.env` file based on `.env.example`
3. Get a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey) for the voice transcription functionality
   - The transcription functionality uses Gemini 2.5 Flash or any other multi-modal model which can process audio files
   - You'll need to update the API endpoint and request format in the code
4. Add your API key to the `.env` file
5. Start the application with Docker Compose:

```bash
docker compose up
```

6. Sync migrations with the db

```bash
npx prisma migrate deploy
```

7. Seed the DB with placeholder information
```bash
npm run db:seed
```

8. The application should be running at http://localhost:3000 (if all issues are fixed)

## API Endpoints

- `GET /api/ping` - Check API and database status
- `POST /api/search` - Search destinations
- `POST /api/transcribe` - Transcribe voice to text

## Testing

Run the tests with:

```bash
npm test
```

## Deliverables

* GitHub PR against `main`
* All tests green in CI
* Short Loom/GIF (<60 seconds) showing the app running

## Evaluation (100 points)

* Bug Fix & Tests (45 points)
* Code Clarity & Commit Hygiene (20 points)
* Docker Reproducibility (15 points)
* Problem-solving narrative (README) (10 points)
* UX check (app loads & basic flow) (10 points)

**Bonus**: If you spot *other* latent issues (performance, security) and patch them with notes.

Good luck! 🚀

## Fix Summary
- Downgraded React to version 18 and added a `package-lock.json` to ensure compatibility with Docker and CI environments.
- Added a specific version for prisma and prisma client, to fix issues when running via docker
- Made changes to the Docker file for docker to identify next properly, it would error out with a "next not found" in other instances
- Added installation of openssl into the Docker to properly instantiate the docker instance for prisma
- Fixed issues for a primary windows machine, added "linux-musl-openssl-3.0.x" to schema.prisma under binaryTargets
- Added ts-node into dev dependencies to seed the db
- Added output: 'standalone' in next config to generate a standalone
- Switched jest to use node instead of jsdom to work with nextjs [Ref](https://github.com/vercel/next.js/discussions/59041)
- Implemented the search and transcribe functions in the UI
- Issues exist with the transcribe functionality - discussed in the PR notes
- Fixed the search API to support standard requests as well as NextRequests (This shouldn't need not done but did not want to make fixes to the existing tests).
- Added query to the search schema
- Made small syntax fixes towards prisma on the ping API
- Fixed some minor schema name issues with the seed file
- Added a migration file for stability, this should not be left out
- Added things to the Readme for smoother working
- Added a setup test to test all these fixes
- Moved from Open router to Gemini and added some QOL features to the main screen
