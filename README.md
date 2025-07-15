# CloudBox Lite ☁️

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-404D59?style=flat&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-FF6B6B?style=flat&logo=drizzle&logoColor=white)](https://orm.drizzle.team/)

[![GitHub stars](https://img.shields.io/github/stars/simonpierreboucher02/cloudboxlite-app?style=social)](https://github.com/simonpierreboucher02/cloudboxlite-app)
[![GitHub forks](https://img.shields.io/github/forks/simonpierreboucher02/cloudboxlite-app?style=social)](https://github.com/simonpierreboucher02/cloudboxlite-app)
[![GitHub issues](https://img.shields.io/github/issues/simonpierreboucher02/cloudboxlite-app)](https://github.com/simonpierreboucher02/cloudboxlite-app/issues)
[![GitHub pull requests](https://img.shields.io/github/issues-pr/simonpierreboucher02/cloudboxlite-app)](https://github.com/simonpierreboucher02/cloudboxlite-app/pulls)

A modern, secure file storage and sharing application built with React, Express, and PostgreSQL. CloudBox Lite provides a Dropbox-like experience with advanced features like JWT authentication, file sharing, and mobile-first responsive design.

## ✨ Features

- 🔐 **Secure Authentication** - JWT-based auth with bcrypt password hashing
- 📁 **File Management** - Upload, organize, and manage files with folder structure
- 🔗 **File Sharing** - Generate shareable links with optional expiration
- 📱 **Mobile-First Design** - Responsive UI optimized for mobile devices
- 🌙 **Dark/Light Theme** - Automatic theme switching based on system preference
- 🚀 **Modern Stack** - Built with React 18, TypeScript, and Tailwind CSS
- 🗄️ **Type-Safe Database** - PostgreSQL with Drizzle ORM for robust data management
- ⚡ **Fast Development** - Vite for lightning-fast builds and hot reload

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/simonpierreboucher02/cloudboxlite-app.git
   cd cloudboxlite-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env file
   DATABASE_URL="your_postgresql_connection_string"
   JWT_SECRET="your_jwt_secret_key"
   NODE_ENV="development"
   ```

4. **Set up the database**
   ```bash
   npm run db:push
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Build for production**
   ```bash
   npm run build
   npm start
   ```

## 🏗️ Architecture

### Monorepo Structure
```
cloudboxlite-app/
├── client/          # React frontend with Vite
├── server/          # Express.js backend API
└── shared/          # Common TypeScript schemas
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React 18 + TypeScript | Modern UI with type safety |
| **Styling** | Tailwind CSS + Radix UI | Beautiful, accessible components |
| **State Management** | TanStack Query | Server state management |
| **Routing** | Wouter | Lightweight client-side routing |
| **Backend** | Express.js + TypeScript | RESTful API server |
| **Database** | PostgreSQL + Drizzle ORM | Type-safe database operations |
| **Authentication** | JWT + bcrypt | Secure user authentication |
| **File Uploads** | Multer | Multipart file handling |
| **Build Tools** | Vite + ESBuild | Fast development and production builds |

## 🔧 Key Components

### Authentication System
- **JWT-based authentication** with 7-day token expiration
- **Password security** using bcrypt with 12 salt rounds
- **Recovery key system** - unique alphanumeric keys for password reset
- **No email dependency** - recovery relies on generated keys

### File Management
- **Multer-based file uploads** with 50MB size limit
- **Hierarchical folder structure** with parent/child relationships
- **File storage** in local filesystem organized by user ID
- **File metadata** stored in PostgreSQL (filename, size, MIME type, path)
- **File sharing** via generated tokens with optional expiration

### Database Schema
```sql
-- Users table
users: id, username, password, recoveryKey, timestamps

-- Folders table  
folders: id, userId, name, parentId, timestamps

-- Files table
files: id, userId, folderId, filename, originalName, mimeType, size, path, timestamps

-- Share links table
share_links: id, fileId, userId, token, expiresAt, isActive, timestamps
```

## 📱 UI/UX Features

- **Mobile-first responsive design** with bottom navigation
- **Dark/light theme support** with system preference detection
- **Grid and list view modes** for file browsing
- **Drag & drop file uploads** with progress indication
- **Modal-based interactions** for uploads, sharing, and key display
- **Toast notifications** for user feedback
- **Skeleton loading states** for better UX

## 🔄 Data Flow

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

## 📦 Dependencies

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

## 🚀 Deployment

### Build Process
1. **Frontend build**: Vite compiles React app to `dist/public/`
2. **Backend build**: ESBuild bundles server code to `dist/index.js`
3. **Database migrations**: Drizzle handles schema changes

### Environment Variables
```bash
DATABASE_URL="postgresql://user:password@host:port/database"
JWT_SECRET="your-secret-key-here"
NODE_ENV="production"
```

### File Storage
- Files stored in `uploads/` directory organized by user ID
- Production deployment should use persistent storage volume
- File paths stored in database for retrieval

## 🔒 Security Considerations

- JWT tokens expire after 7 days
- Passwords hashed with bcrypt (12 rounds)
- File access restricted to authenticated users
- Share links can have expiration dates
- Recovery keys are static per user account
- CORS protection for API endpoints
- Input validation with Zod schemas

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Simon Pierre Boucher**
- GitHub: [@simonpierreboucher02](https://github.com/simonpierreboucher02)

---

⭐ **Star this repository if you found it helpful!**
