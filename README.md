# Jeremiah Gad Real Estate Website

A modern, full-featured real estate website built with React, Vite, and Supabase. This application provides a comprehensive platform for real estate services including buyer and seller academies, blog functionality, appointment booking, and administrative capabilities.

## Project Overview

This is a single-page application (SPA) that serves as a professional real estate website with the following key features:
- **Buyer and Seller Academies**: Educational content and resources
- **Blog System**: Content management with rich text editing
- **Appointment Booking**: Client scheduling system
- **Authentication & Authorization**: User accounts with admin roles
- **Responsive Design**: Mobile-first design with dark mode support

## File Structure

### Root Configuration Files

#### `package.json`
Main project configuration file containing:
- Project metadata and dependencies
- Scripts for development, building, and preview
- Dependencies including React, Supabase, Tailwind CSS, and UI libraries
- Development dependencies for building and linting

#### `vite.config.js`
Vite bundler configuration file that:
- Configures React plugin for JSX support
- Sets up development server with CORS enabled
- Includes custom error handling and logging
- Configures build optimization and chunking
- Sets up path aliases for cleaner imports

#### `tailwind.config.js`
Tailwind CSS configuration defining:
- Content paths for CSS purging
- Custom color scheme including primary, secondary, and semantic colors
- Extended theme with custom animations and keyframes
- Dark mode configuration
- Custom utility classes and components

#### `postcss.config.js`
PostCSS configuration for CSS processing:
- Integrates Tailwind CSS processing
- Enables Autoprefixer for browser compatibility
- Minimal configuration for standard CSS workflows

#### `index.html`
Main HTML template that:
- Provides the root element for React mounting
- Includes basic meta tags and viewport configuration
- References the main JavaScript entry point
- Contains minimal structure for the SPA

### Source Code Structure

#### `src/main.jsx`
Application entry point that:
- Creates the React root element
- Wraps the app in React.StrictMode
- Imports global CSS styles
- Bootstraps the entire application

#### `src/App.jsx`
Main application component containing:
- React Router configuration with all application routes
- Navigation link definitions for public and authenticated sections
- Route protection setup for admin and user areas
- Authentication provider wrapper
- Toast notification system integration

#### `src/index.css`
Global stylesheet containing:
- Tailwind CSS imports and base styles
- CSS custom properties for theming (light/dark modes)
- Custom utility classes for glassmorphism and neumorphism effects
- Typography and base element styling
- Dark mode variable definitions

### Component Architecture

#### `src/components/Layout.jsx`
Main layout wrapper providing:
- Consistent page structure with header and footer
- Navigation bar integration
- Responsive design framework
- Content area management

#### `src/components/Navbar.jsx`
Navigation component featuring:
- Responsive navigation menu
- Authentication state-aware menu items
- Mobile-friendly hamburger menu
- Dark mode toggle functionality

#### `src/components/Footer.jsx`
Footer component with:
- Contact information and social links
- Sitemap navigation
- Copyright and legal information
- Responsive layout for different screen sizes

#### `src/components/ProtectedRoute.jsx`
Authentication guard component that:
- Checks user authentication status
- Redirects unauthenticated users to login
- Protects private routes and user areas
- Integrates with the authentication context

#### `src/components/AdminProtectedRoute.jsx`
Admin-level route protection that:
- Verifies admin user privileges
- Restricts access to administrative functions
- Handles role-based authorization
- Prevents unauthorized admin access

#### `src/components/ui/`
Reusable UI component library including:
- Form components (buttons, inputs, selects)
- Layout components (cards, dialogs, sheets)
- Feedback components (toasts, alerts)
- Navigation components (tabs, dropdowns)
- All built with Radix UI primitives and Tailwind styling

#### `src/components/admin/`
Administrative interface components for:
- Content management (blog posts, academy content)
- User management and role assignment
- Dashboard widgets and analytics
- Media library for file uploads

### Page Components

#### `src/pages/HomePage.jsx`
Landing page component featuring:
- Hero section with call-to-action
- Service highlights and testimonials
- Featured blog posts and academy content
- Lead generation forms and contact information

#### `src/pages/BuyerAcademyPage.jsx`
Buyer education section containing:
- Home buying process guides
- Educational modules and resources
- Interactive content and downloads
- Integration with appointment booking

#### `src/pages/SellerAcademyPage.jsx`
Seller education section with:
- Home selling process information
- Market analysis tools and resources
- Preparation checklists and guides
- Lead capture and consultation booking

#### `src/pages/BlogPage.jsx`
Blog listing and management including:
- Paginated blog post listing
- Category filtering and search
- Featured post highlighting
- SEO-optimized content display

#### `src/pages/BlogPostPage.jsx`
Individual blog post display with:
- Rich content rendering with HTML support
- Social sharing functionality
- Related posts suggestions
- Comments and engagement features

#### `src/pages/BookAppointmentPage.jsx`
Appointment scheduling interface providing:
- Calendar-based booking system
- Service type selection
- Contact information collection
- Integration with Supabase database

#### `src/pages/AuthPage.jsx`
Authentication interface handling:
- User registration and login
- Password reset functionality
- Email verification workflows
- Integration with Supabase Auth

#### `src/pages/DashboardPage.jsx`
User dashboard containing:
- Personal account management
- Appointment history and upcoming bookings
- Downloaded resources and favorites
- Profile customization options

#### `src/pages/AdminDashboardPage.jsx`
Administrative control panel featuring:
- Content management for all site sections
- User administration and role management
- Analytics and reporting tools
- System configuration options

#### `src/pages/InstructionsPage.jsx`
Deployment and setup guide containing:
- Supabase configuration instructions
- Database schema and setup procedures
- Environment variable configuration
- Deployment guidelines for various platforms

#### `src/pages/NotFoundPage.jsx`
404 error page with:
- User-friendly error messaging
- Navigation back to main site areas
- Search functionality for finding content
- Consistent branding and design

### Utility and Configuration

#### `src/lib/supabaseClient.js`
Supabase client configuration:
- Database connection setup
- Authentication service configuration
- Storage bucket configuration
- API endpoint definitions

#### `src/lib/utils.js`
Utility functions including:
- CSS class name merging with clsx and tailwind-merge
- Common helper functions for component styling
- Shared utility functions across components

#### `src/lib/icons.jsx`
Icon mapping and management:
- Centralized icon component definitions
- Lucide React icon integration
- Consistent icon usage across the application
- Dynamic icon loading and rendering

#### `src/contexts/AuthContext.jsx`
Authentication state management:
- User session handling
- Login/logout functionality
- Role-based permissions management
- Authentication state persistence

## Technology Stack

- **Frontend Framework**: React 18 with Vite
- **Backend Service**: Supabase (Authentication, Database, Storage)
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives
- **Animations**: Framer Motion
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Rich Text Editing**: React Quill

## Development Environment

- **Node.js**: Version 18+ recommended
- **Package Manager**: npm
- **Build Tool**: Vite for fast development and optimized builds
- **CSS Processing**: PostCSS with Tailwind CSS and Autoprefixer
