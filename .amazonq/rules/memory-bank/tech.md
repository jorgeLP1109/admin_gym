# Technology Stack

## Programming Languages
- **JavaScript (ES6+)**: Primary language for both frontend and backend
- **SQL**: Database schema and queries (PostgreSQL dialect)
- **CSS**: Styling via Tailwind CSS utility classes

## Frontend Technologies

### Core Framework
- **React 18.2.0**: UI library with hooks and functional components
- **React DOM 18.2.0**: React rendering for web

### Build Tools
- **Vite 5.0.8**: Fast build tool and dev server
- **@vitejs/plugin-react 4.2.1**: React support for Vite
- **PostCSS 8.4.32**: CSS transformation tool
- **Autoprefixer 10.4.16**: Automatic vendor prefixing

### Styling
- **Tailwind CSS 3.3.6**: Utility-first CSS framework
- **Custom Brand Colors**:
  - Primary Blue: #2B4C9F
  - Gold: #D4AF37
  - White: #FFFFFF

### Routing & State
- **React Router DOM 6.20.1**: Client-side routing
- **React Context API**: Global state management (no Redux)

### HTTP Client
- **Axios 1.6.2**: Promise-based HTTP client for API calls

### UI Components
- **Lucide React 0.294.0**: Icon library

### Type Support
- **@types/react 18.2.43**: TypeScript definitions for React
- **@types/react-dom 18.2.17**: TypeScript definitions for React DOM

## Backend Technologies

### Runtime & Framework
- **Node.js**: JavaScript runtime (ES modules enabled)
- **Express 4.18.2**: Web application framework

### Database
- **PostgreSQL**: Relational database
- **pg 8.11.3**: PostgreSQL client for Node.js
- **Supabase**: Hosted PostgreSQL database service

### Authentication & Security
- **jsonwebtoken 9.0.2**: JWT token generation and verification
- **bcryptjs 2.4.3**: Password hashing
- **cors 2.8.5**: Cross-Origin Resource Sharing middleware

### Validation
- **express-validator 7.0.1**: Request validation middleware

### Configuration
- **dotenv 16.3.1**: Environment variable management

### Development Tools
- **nodemon 3.0.2**: Auto-restart server on file changes

## Workspace Configuration

### Monorepo Setup
- **npm workspaces**: Unified dependency management
- **concurrently 8.2.2**: Run multiple npm scripts simultaneously

### Project Structure
```json
{
  "workspaces": ["frontend", "backend"],
  "type": "module"
}
```

## Development Commands

### Installation
```bash
npm run install:all          # Install all dependencies (root + workspaces)
```

### Development
```bash
npm run dev                   # Run both frontend and backend concurrently
npm run dev:frontend          # Run frontend only (Vite dev server)
npm run dev:backend           # Run backend only (nodemon)
```

### Frontend Specific
```bash
npm run dev --workspace=frontend      # Vite dev server
npm run build --workspace=frontend    # Production build
npm run preview --workspace=frontend  # Preview production build
```

### Backend Specific
```bash
npm run dev --workspace=backend       # Start with nodemon
npm run start --workspace=backend     # Start without nodemon
```

## Configuration Files

### Frontend Configuration

**vite.config.js**
- React plugin configuration
- Dev server settings
- Build optimization

**tailwind.config.js**
- Custom color palette (brand colors)
- Content paths for purging
- Theme extensions

**postcss.config.js**
- Tailwind CSS plugin
- Autoprefixer plugin

### Backend Configuration

**.env**
- Database connection (DATABASE_URL)
- JWT secret (JWT_SECRET)
- Server port (PORT)
- Environment mode (NODE_ENV)

**schema.sql**
- Complete database schema
- Table definitions with constraints
- Indexes for performance
- Default admin user

## Database Configuration

### Connection
- **Provider**: Supabase (PostgreSQL hosting)
- **Client**: pg (node-postgres)
- **Connection String**: Stored in DATABASE_URL environment variable

### Schema Features
- Serial primary keys
- Foreign key constraints with CASCADE
- JSONB for flexible data (class schedules)
- CHECK constraints for data validation
- Indexes on frequently queried columns
- Timestamps (created_at, updated_at)

## Deployment

### Frontend
- **Platform**: Vercel
- **Build Command**: `vite build`
- **Output Directory**: `dist`

### Backend
- **Platform**: Supabase (or compatible Node.js hosting)
- **Database**: Supabase PostgreSQL
- **Environment**: Production environment variables required

## API Architecture

### RESTful Endpoints
- Standard HTTP methods (GET, POST, PUT, DELETE)
- JSON request/response format
- JWT authentication via Authorization header
- Error responses with status codes

### Authentication Flow
1. Login endpoint returns JWT token
2. Token stored in client (localStorage/context)
3. Token sent in Authorization header: `Bearer <token>`
4. Middleware validates token on protected routes

## Version Control
- **Git**: Source control
- **.gitignore**: Excludes node_modules, .env, dist, build

## Module System
- **ES Modules**: `"type": "module"` in package.json
- Import/export syntax throughout codebase
- No CommonJS require/module.exports
