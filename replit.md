# E-Commerce Application

## Overview

This is a full-stack e-commerce application built with React, Express.js, and PostgreSQL. The application provides a complete online shopping experience with user authentication, product catalog, shopping cart, checkout process, order management, and administrative features.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with custom Material Design inspired color system
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: JWT-based authentication with bcrypt for password hashing
- **Session Management**: Express sessions with PostgreSQL store
- **API Design**: RESTful API with consistent error handling

### Database Architecture
- **Database**: PostgreSQL (configured for Neon serverless)
- **ORM**: Drizzle with schema-first approach
- **Migration Strategy**: Database migrations through Drizzle Kit
- **Connection**: Connection pooling with @neondatabase/serverless

## Key Components

### Authentication System
- JWT token-based authentication
- Secure password hashing with bcryptjs
- Session management for persistent login
- Role-based access control (admin/user)
- User registration and login flows

### Product Management
- Hierarchical product catalog with categories and brands
- Product variants support (size, color, etc.)
- Image management and product media
- Stock tracking and inventory management
- Search and filtering capabilities

### Shopping Cart & Checkout
- Persistent shopping cart with user sessions
- Real-time cart updates and synchronization
- Multi-step checkout process
- Order summary and pricing calculations
- Payment method selection interface

### Order Management
- Complete order lifecycle tracking
- Order status management (pending, processing, shipped, delivered)
- Order history for users
- Administrative order management

### Administrative Features
- Admin dashboard with analytics
- Product, category, and brand management
- User management and access control
- Order monitoring and status updates
- Sales analytics and reporting

### UI/UX Design
- Material Design inspired color system
- Responsive design for mobile and desktop
- Dark/light theme support infrastructure
- Consistent component library
- Accessible interface with proper ARIA labels

## Data Flow

### User Authentication Flow
1. User submits login/register form
2. Backend validates credentials and generates JWT
3. Token stored in localStorage for persistent sessions
4. API requests include Authorization header
5. Backend validates token on protected routes

### Product Catalog Flow
1. Products fetched from database with categories/brands
2. Client-side filtering and search capabilities
3. Real-time inventory updates
4. Product details loaded on-demand

### Shopping Cart Flow
1. Add to cart triggers API call with authentication
2. Cart state synchronized across browser tabs
3. Persistent cart storage in database
4. Real-time quantity and pricing updates

### Checkout Process
1. Multi-step form validation (shipping, payment)
2. Order creation with inventory checks
3. Payment processing integration ready
4. Order confirmation and email notifications

## External Dependencies

### Frontend Dependencies
- **UI Framework**: React with TypeScript support
- **UI Components**: Radix UI primitives, Lucide React icons
- **Form Handling**: React Hook Form with Hookform/resolvers
- **State Management**: TanStack React Query
- **Styling**: Tailwind CSS with class-variance-authority
- **Validation**: Zod schema validation

### Backend Dependencies
- **Web Framework**: Express.js with middleware support
- **Database**: Drizzle ORM with Neon PostgreSQL adapter
- **Authentication**: JWT, bcryptjs for security
- **Session Storage**: Connect-pg-simple for PostgreSQL sessions
- **Utilities**: Nanoid for ID generation, memoizee for caching

### Development Dependencies
- **Build Tools**: Vite with React plugin
- **TypeScript**: Full type checking and compilation
- **Development**: Replit-specific plugins for development environment

## Deployment Strategy

### Development Environment
- **Platform**: Replit with Node.js 20 runtime
- **Development Server**: Vite dev server with HMR
- **Database**: Neon PostgreSQL serverless
- **Port Configuration**: Port 5000 for development

### Production Build
- **Frontend**: Vite production build with optimization
- **Backend**: ESBuild bundling for Node.js deployment
- **Static Assets**: Served from dist/public directory
- **Environment**: Production environment variables

### Database Deployment
- **Migration System**: Drizzle migrations with version control
- **Connection**: Pooled connections for scalability
- **Environment**: DATABASE_URL environment variable required

### Replit Configuration
- **Autoscale Deployment**: Configured for automatic scaling
- **Build Command**: npm run build for production assets
- **Start Command**: npm run start for production server
- **Development**: npm run dev with port forwarding

## Changelog
- June 21, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.