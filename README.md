# ABAP Academy

Learn SAP ABAP in your browser: short lessons, step-by-step code runs and hands-on challenges, laid out on an interactive roadmap. No SAP system or account needed.

## Features

- 60+ lessons across 8 paths, from ABAP basics to ABAP Cloud and RAP
- A built-in ABAP simulator that runs lesson code line by line and shows memory and output
- 36 essential SAP transaction codes with tips
- Progress saved in your browser, nothing sent to a server

> The simulator covers the ABAP taught in the lessons. It is not a real SAP runtime.

## Run locally

Requires Node.js 20.9+.

```bash
npm ci
npm run dev        # http://localhost:3000
```

## Build

```bash
npm run build && npm start
npm run lint && npm run typecheck
```

## Deploy

A standard Next.js app with no environment variables. Deploy it to Vercel or any Next.js host with the default settings.
