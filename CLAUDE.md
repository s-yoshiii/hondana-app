# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Hondana (ホンダナ) is a reading community application where users can share book reviews, manage reading lists, and follow other readers. Target audience is 30+ year-olds interested in reading.

## Development Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript 5 (strict mode)
- **UI**: React 19, Tailwind CSS 4
- **Backend (planned)**: Supabase (PostgreSQL, Auth, Storage)
- **External APIs**: Google Books API / OpenBD for book data
- **Node.js**: 25.2.1 (see .node-version)

## Architecture

This project uses Next.js App Router pattern. All routes are defined in the `/app` directory.

**Path alias**: `@/*` maps to the project root for imports.

## Project Documentation

Detailed specifications are in `/docs` (all in Japanese):

- **requirement.md**: MVP requirements, user stories, feature specifications
- **database_design.md**: Complete database schema with Supabase RLS policies, SQL scripts
- **screen_transition.md**: Screen flow diagrams, component specs, access permissions

## Key Features (MVP)

- User authentication (email/password via Supabase)
- Book search via external APIs
- Reading status tracking (want to read, reading, completed, stacked)
- 5-star rating system
- Review posting with follower-based access control
- One-way follow system (Twitter-like)
