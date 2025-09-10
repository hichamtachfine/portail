# UniPortal - University Community Platform

## Overview

UniPortal is a comprehensive university community platform that organizes educational content in a hierarchical structure. The system allows students, teachers, and administrators to access lessons, exercises, and educational resources organized by city, school, semester, group, and subject. Built as a full-stack application with React frontend and Express backend, it features role-based access control, file upload capabilities, and a modern, responsive user interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter for client-side navigation
- **State Management**: TanStack Query for server state management
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Authentication**: Replit Auth with OpenID Connect integration
- **Session Management**: Express sessions with PostgreSQL storage
- **File Upload**: Multer middleware for PDF file handling
- **API Design**: RESTful endpoints with role-based authorization
- **Error Handling**: Centralized error middleware with proper HTTP status codes

### Database Design
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema**: Hierarchical category structure (cities → schools → semesters → groups → subjects → content)
- **User Management**: Role-based system (student, teacher, admin)
- **Content Storage**: File metadata with PDF upload support
- **Sessions**: PostgreSQL-backed session storage for authentication

### Authentication & Authorization
- **Provider**: Replit Auth using OpenID Connect
- **Session Storage**: PostgreSQL with connect-pg-simple
- **Role System**: Three-tier access control (student, teacher, admin)
- **Route Protection**: Middleware-based authentication checks
- **User Management**: Automatic user creation/update on login

### File Management
- **Upload Strategy**: Local file system storage in uploads directory
- **File Types**: PDF files only with 50MB size limit
- **Storage Structure**: Organized by content hierarchy
- **Security**: File type validation and size restrictions

### Development Environment
- **Hot Reload**: Vite HMR for frontend development
- **TypeScript**: Full type safety across frontend and backend
- **Path Aliases**: Simplified imports using @ prefixes
- **Error Overlay**: Runtime error modal for development
- **Database Migration**: Drizzle Kit for schema management

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **wouter**: Lightweight React router

### UI and Styling
- **@radix-ui/***: Accessible UI component primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library

### Authentication
- **openid-client**: OpenID Connect authentication
- **passport**: Authentication middleware
- **express-session**: Session management
- **connect-pg-simple**: PostgreSQL session store

### File Upload
- **multer**: Multipart form data handling
- **@types/multer**: TypeScript definitions for multer

### Development Tools
- **vite**: Build tool and development server
- **typescript**: Static type checking
- **tsx**: TypeScript execution for Node.js
- **esbuild**: Fast JavaScript bundler for production