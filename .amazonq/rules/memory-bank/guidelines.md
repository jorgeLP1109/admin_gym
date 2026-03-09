# Development Guidelines

## Code Quality Standards

### File Naming Conventions
- **React Components**: PascalCase (e.g., `AuthContext.jsx`, `Dashboard.jsx`, `Navbar.jsx`)
- **Configuration Files**: lowercase with dots (e.g., `vite.config.js`, `tailwind.config.js`, `postcss.config.js`)
- **Backend Files**: camelCase (e.g., `authController.js`, `estudiantesController.js`)
- **Routes**: lowercase (e.g., `auth.js`, `estudiantes.js`, `clases.js`)
- **SQL Files**: lowercase with hyphens (e.g., `schema.sql`, `update-schema.sql`)

### Code Formatting
- **Indentation**: 2 spaces (consistent across all files)
- **Semicolons**: Used consistently in backend, optional in frontend
- **Quotes**: Single quotes preferred for strings
- **Trailing Commas**: Used in objects and arrays
- **Line Length**: Keep reasonable, break long lines for readability

### Import Organization
- **ES Modules**: Always use `import/export` syntax (never CommonJS)
- **Import Order**:
  1. External dependencies (React, Express, etc.)
  2. Internal modules (routes, controllers, services)
  3. Configuration files
  4. Styles (CSS imports last)

**Example (Frontend)**:
```javascript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import './index.css';
```

**Example (Backend)**:
```javascript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import estudiantesRoutes from './routes/estudiantes.js';
```

### File Extensions
- **React Components**: `.jsx` extension (not `.js`)
- **Backend Files**: `.js` extension with ES modules
- **Configuration**: `.js` extension
- **Always include `.js` extension in imports** (ES module requirement)

## Structural Conventions

### Frontend Architecture

**Component Structure**
- Functional components only (no class components)
- Hooks-based state management
- Custom hooks for reusable logic (e.g., `useAuth`)

**Context Pattern**:
```javascript
const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
```

**Route Protection Pattern**:
```javascript
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Cargando...</div>;
  }
  
  return user ? children : <Navigate to="/login" />;
};
```

**Layout Composition**:
```javascript
<Route path="/estudiantes" element={
  <PrivateRoute>
    <>
      <Navbar />
      <Estudiantes />
    </>
  </PrivateRoute>
} />
```

### Backend Architecture

**Controller Pattern**:
```javascript
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await query('SELECT * FROM usuarios WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    // Business logic here
    
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
};
```

**Route Definition Pattern**:
```javascript
import express from 'express';
import { login, register } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);

export default router;
```

**Middleware Pattern**:
```javascript
export const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};
```

## Textual Standards

### Naming Conventions

**Variables & Functions**:
- camelCase for variables and functions
- Descriptive names in Spanish (business domain language)
- Boolean variables prefixed with `is`, `has`, `should`

**Examples**:
```javascript
const isValidPassword = await bcrypt.compare(password, user.password);
const hashedPassword = await bcrypt.hash(password, 10);
const estudiantesRoutes = express.Router();
```

**Constants**:
- UPPER_SNAKE_CASE for true constants
- camelCase for configuration values

**Examples**:
```javascript
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;
```

**Database Fields**:
- snake_case for column names (SQL convention)
- Spanish names for business entities

**Examples**:
```sql
nombre_completo, fecha_nacimiento, contacto_emergencia_nombre
```

### Error Messages
- Spanish language for user-facing messages
- Descriptive and user-friendly
- Consistent error response format

**Examples**:
```javascript
{ error: 'Credenciales inválidas' }
{ error: 'Token no proporcionado' }
{ error: 'El email ya está registrado' }
{ error: 'Error en el servidor' }
```

### Comments
- Minimal comments (code should be self-documenting)
- Spanish for business logic explanations
- JSDoc-style for complex functions (when needed)

## Practices Followed

### Authentication & Security

**JWT Token Flow**:
1. Login returns token and user data
2. Token stored in localStorage
3. Token sent in Authorization header: `Bearer <token>`
4. Middleware validates token on protected routes

**Password Hashing**:
```javascript
const hashedPassword = await bcrypt.hash(password, 10);
const isValidPassword = await bcrypt.compare(password, user.password);
```

**Token Generation**:
```javascript
const token = jwt.sign(
  { id: user.id, email: user.email, rol: user.rol },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN }
);
```

### Database Practices

**Parameterized Queries** (SQL injection prevention):
```javascript
const result = await query('SELECT * FROM usuarios WHERE email = $1', [email]);
```

**Connection Pooling**:
```javascript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export const query = (text, params) => pool.query(text, params);
```

**Error Handling for Unique Constraints**:
```javascript
if (error.code === '23505') {
  return res.status(400).json({ error: 'El email ya está registrado' });
}
```

### State Management

**localStorage for Persistence**:
```javascript
localStorage.setItem('token', token);
localStorage.setItem('user', JSON.stringify(user));

const token = localStorage.getItem('token');
const userData = JSON.parse(localStorage.getItem('user'));
```

**Context for Global State**:
- Authentication state in AuthContext
- No Redux or external state management
- Custom hooks for context consumption

### API Communication

**Centralized API Service**:
- All API calls through service layer
- Axios for HTTP requests
- Token automatically attached to requests

**Error Handling**:
- Try-catch blocks in all async operations
- Consistent error response format
- HTTP status codes: 200 (success), 201 (created), 400 (bad request), 401 (unauthorized), 500 (server error)

### Configuration Management

**Environment Variables**:
- `.env` files for configuration (never committed)
- `.env.example` for documentation
- `dotenv` package for loading

**Required Variables**:
```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
PORT=5000
NODE_ENV=development
```

### Styling Practices

**Tailwind CSS Utility Classes**:
- Utility-first approach
- No custom CSS files (except index.css for imports)
- Responsive design with Tailwind breakpoints

**Brand Colors**:
```javascript
colors: {
  primary: '#2B4C9F',  // Blue
  gold: '#D4AF37',     // Gold
}
```

**Common Patterns**:
```javascript
className="flex items-center justify-center min-h-screen"
className="bg-primary text-white"
```

### Build & Development

**Vite Configuration**:
- Port 3000 for frontend dev server
- Proxy `/api` requests to backend (port 5000)
- React plugin for JSX support

**Concurrent Development**:
```bash
npm run dev  # Runs both frontend and backend simultaneously
```

**Module System**:
- ES modules throughout (`"type": "module"`)
- Always include `.js` extension in imports
- No CommonJS syntax

## Semantic Patterns

### Async/Await Pattern
- Always use async/await (never raw promises)
- Try-catch for error handling
- Early returns for error cases

### Destructuring
- Destructure request body: `const { email, password } = req.body`
- Destructure context: `const { user, loading } = useAuth()`
- Destructure imports: `import { query } from '../config/database.js'`

### Optional Chaining
- Use `?.` for safe property access
- Example: `req.headers.authorization?.split(' ')[1]`

### Template Literals
- Use backticks for string interpolation
- Example: `` `🚀 Servidor corriendo en puerto ${PORT}` ``

### Arrow Functions
- Prefer arrow functions for callbacks and short functions
- Named exports for controllers and utilities

### Conditional Rendering (React)
- Ternary operators for simple conditions
- Logical AND (`&&`) for conditional rendering
- Early returns for loading states

## Frequently Used Code Idioms

### Database Query Pattern
```javascript
const result = await query('SELECT * FROM table WHERE id = $1', [id]);
if (result.rows.length === 0) {
  return res.status(404).json({ error: 'No encontrado' });
}
const data = result.rows[0];
```

### JWT Verification Pattern
```javascript
const token = req.headers.authorization?.split(' ')[1];
if (!token) return res.status(401).json({ error: 'Token no proporcionado' });

const decoded = jwt.verify(token, process.env.JWT_SECRET);
req.user = decoded;
```

### React Effect for Initial Load
```javascript
useEffect(() => {
  const token = localStorage.getItem('token');
  if (token) {
    // Load user data
  }
  setLoading(false);
}, []);
```

### Route Registration Pattern
```javascript
app.use('/api/auth', authRoutes);
app.use('/api/estudiantes', estudiantesRoutes);
app.use('/api/profesores', profesoresRoutes);
```

## Popular Annotations

### JSDoc Comments (when needed)
```javascript
/**
 * Autentica un usuario y retorna un token JWT
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
```

### Tailwind Config Type Annotation
```javascript
/** @type {import('tailwindcss').Config} */
```

### React StrictMode
```javascript
<React.StrictMode>
  <App />
</React.StrictMode>
```

## Testing & Validation

### Input Validation
- Use express-validator for backend validation
- Client-side validation in forms
- Database constraints as last line of defense

### Error Responses
- Always return JSON error objects
- Include descriptive error messages
- Use appropriate HTTP status codes

## Deployment Considerations

### Production Settings
- SSL enabled for database in production
- CORS configured for production domains
- Environment-specific configurations
- Build optimization through Vite

### Database Migrations
- SQL schema files for version control
- Update scripts for schema changes
- Indexes for performance optimization
