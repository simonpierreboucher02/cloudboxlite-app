# CloudBox Lite 

## Overview

CloudBox Lite is a modern file storage and sharing application built with React, Express, and PostgreSQL. The application provides a Dropbox-like experience with secure file management, user authentication, and sharing capabilities optimized for mobile devices.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Full-Stack Monorepo Structure
The project follows a monorepo pattern with three main directories:
- `client/` - React frontend with Vite build system
- `server/` - Express.js backend API
- `shared/` - Common TypeScript schemas and types

### Technology Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, Wouter (routing), TanStack Query
- **Backend**: Express.js, TypeScript, JWT authentication, Multer (file uploads)
- **Database**: PostgreSQL with Drizzle ORM
- **UI Library**: Radix UI components with shadcn/ui styling
- **Build Tools**: Vite (frontend), ESBuild (backend), Tailwind CSS

## Key Components

### Authentication System
- **JWT-based authentication** with 7-day token expiration
- **Password security** using bcrypt with 12 salt rounds
- **Recovery key system** - unique alphanumeric keys generated at signup for password reset
- **No email dependency** - recovery relies on generated keys shown to users

### File Management
- **Multer-based file uploads** with 50MB size limit
- **Hierarchical folder structure** with parent/child relationships
- **File storage** in local filesystem organized by user ID
- **File metadata** stored in PostgreSQL (filename, size, MIME type, path)
- **File sharing** via generated tokens with optional expiration

### Database Schema
- **Users table**: id, username, password, recoveryKey, timestamps
- **Folders table**: id, userId, name, parentId, timestamps
- **Files table**: id, userId, folderId, filename, originalName, mimeType, size, path, timestamps
- **Share links table**: id, fileId, userId, token, expiresAt, isActive, timestamps

### UI/UX Design
- **Mobile-first responsive design** with bottom navigation
- **Dark/light theme support** with system preference detection
- **Grid and list view modes** for file browsing
- **Drag & drop file uploads** with progress indication
- **Modal-based interactions** for uploads, sharing, and key display

## Data Flow

### Authentication Flow
1. User signs up → password hashed → recovery key generated → JWT token issued
2. User logs in → password verified → JWT token issued
3. Protected routes verify JWT token → user data retrieved
4. Password reset → username + recovery key → new password set

### File Upload Flow
1. Client selects files → FormData created → sent to `/api/files/upload`
2. Server receives files → Multer processes → saves to user directory
3. File metadata stored in database → response sent to client
4. Client updates file list via React Query cache invalidation

### File Sharing Flow
1. User requests share link → POST `/api/files/:id/share`
2. Server generates unique token → stores with expiration
3. Share URL returned → user can copy/send link
4. Access via share link → token validated → file served

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless** - PostgreSQL database connection
- **@radix-ui/react-*** - Headless UI components
- **@tanstack/react-query** - Server state management
- **bcryptjs** - Password hashing
- **drizzle-orm** - Type-safe database queries
- **jsonwebtoken** - JWT token handling
- **multer** - File upload middleware
- **nanoid** - Unique ID generation

### Development Dependencies
- **Vite** - Development server and build tool
- **TypeScript** - Type checking and compilation
- **Tailwind CSS** - Utility-first CSS framework
- **ESBuild** - Fast JavaScript bundler for server

## Deployment Strategy

### Build Process
1. **Frontend build**: Vite compiles React app to `dist/public/`
2. **Backend build**: ESBuild bundles server code to `dist/index.js`
3. **Database migrations**: Drizzle handles schema changes

### Environment Variables
- `DATABASE_URL` - PostgreSQL connection string (required)
- `JWT_SECRET` - Secret key for JWT signing
- `NODE_ENV` - Environment mode (development/production)

### File Storage
- Files stored in `uploads/` directory organized by user ID
- Production deployment should use persistent storage volume
- File paths stored in database for retrieval

### Security Considerations
- JWT tokens expire after 7 days
- Passwords hashed with bcrypt (12 rounds)
- File access restricted to authenticated users
- Share links can have expiration dates
- Recovery keys are static per user account

The application is designed to be lightweight and performant, with a focus on mobile usability and secure file management without requiring email infrastructure.
