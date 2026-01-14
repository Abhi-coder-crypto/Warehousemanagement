# Warehouse Management System (WMS)

## Overview

This is a full-stack Warehouse Management System web application built for warehouse administrators and staff. The system provides inventory management, order processing, storage rack allocation, user management, and real-time dashboard analytics. The application follows a monorepo structure with a React frontend and Express backend sharing TypeScript types and validation schemas.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state caching and synchronization
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming, extended with custom design tokens
- **Forms**: React Hook Form with Zod validation via @hookform/resolvers
- **Charts**: Recharts for dashboard visualizations (pie charts, bar charts)
- **Animations**: Framer Motion for smooth UI transitions

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful endpoints defined in `shared/routes.ts` with Zod schemas for request/response validation
- **Database ORM**: Drizzle ORM configured for PostgreSQL
- **Storage Pattern**: Interface-based storage abstraction (`IStorage`) with in-memory implementation (`MemStorage`) - easily swappable for database-backed storage
- **Session Management**: Express session with connect-pg-simple for PostgreSQL session store

### Shared Code Layer
- **Schema Definitions**: `shared/schema.ts` contains Drizzle table definitions and Zod insert schemas
- **Route Definitions**: `shared/routes.ts` defines API contracts with paths, methods, and Zod schemas for type-safe API calls
- **Path Aliases**: `@shared/*` maps to shared directory, `@/*` maps to client/src

### Build System
- **Development**: Vite dev server with HMR, proxied through Express
- **Production**: Vite builds frontend to `dist/public`, esbuild bundles server to `dist/index.cjs`
- **Database Migrations**: Drizzle Kit with `db:push` command for schema synchronization

### Key Design Patterns
- **Type-safe API contracts**: Shared Zod schemas ensure frontend and backend stay in sync
- **Repository pattern**: Storage interface abstracts data access, currently using in-memory storage with easy PostgreSQL migration path
- **Component composition**: shadcn/ui components are copied into the project for full customization control

## External Dependencies

### Database
- **PostgreSQL**: Primary database (configured via `DATABASE_URL` environment variable)
- **Drizzle ORM**: Type-safe database queries and schema management
- **connect-pg-simple**: PostgreSQL session storage

### UI/UX Libraries
- **Radix UI**: Accessible, unstyled component primitives (dialogs, dropdowns, forms, etc.)
- **Recharts**: Data visualization for dashboard charts
- **Framer Motion**: Animation library for UI transitions
- **Lucide React**: Icon library

### Development Tools
- **Vite**: Frontend build tool and dev server
- **esbuild**: Server-side bundling for production
- **TypeScript**: Type checking across the entire codebase

### Replit-specific Integrations
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay
- **@replit/vite-plugin-cartographer**: Development tooling (dev only)
- **@replit/vite-plugin-dev-banner**: Development banner (dev only)