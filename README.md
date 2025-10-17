# Issue Tracker Frontend

A modern, responsive Next.js frontend for the Issue Tracker application. Provides a user-friendly interface for managing issues, comments, tags, and users.

---

## Tech Stack

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/ui**: Beautiful UI components
- **JWT Authentication**: Secure user authentication

---

## Requirements

- Node.js 18 or higher
- npm or yarn
- Backend server running (see backend README)

---

## Setup Guide

### Prerequisites

**⚠️ Important**: You must set up the backend first before running the frontend.

Follow the complete setup guide in `issue-tracker-backend/README.md` to:
1. Install PostgreSQL
2. Create database
3. Initialize tables
4. Load seed data
5. Start the backend server

The backend must be running on http://localhost:5000 for the frontend to work.

### Step 1: Install Dependencies

```bash
cd issue-tracker-frontend
npm install
```

### Step 2: Configure Environment

Create a `.env.local` file in the `issue-tracker-frontend` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

This tells the frontend where to find the backend API.

### Step 3: Start Development Server

```bash
npm run dev
```

The frontend will run on: **http://localhost:3000**

---

## Project Structure

```
issue-tracker-frontend/
├── app/                      # Next.js App Router
│   ├── context/             # React Context (Auth)
│   ├── issues/              # Issues pages
│   ├── profile/             # User profile pages
│   ├── utils/               # Utility functions
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page
├── components/
│   ├── custom/              # Custom components
│   │   ├── admin/          # Admin management
│   │   ├── auth/           # Login/Register forms
│   │   ├── comments/       # Comment components
│   │   └── issue/          # Issue components
│   └── ui/                 # Shadcn/ui components
├── lib/                     # Types and utilities
├── public/                  # Static assets
└── README.md               # This file
```

---

## Features

### User Features
- 🔐 **Authentication**: Register, login, and secure JWT-based sessions
- 📝 **Issue Management**: Create, edit, delete, and view issues
- 💬 **Comments**: Add, edit, and delete comments on issues
- 🏷️ **Tags**: Categorize issues with tags
- 🔍 **Filtering**: Filter issues by status, priority, tags, and author
- 👤 **User Profiles**: View user activity and contributions

### Admin Features
- 👥 **User Management**: Manage user accounts and roles
- 🏷️ **Tag Management**: Create, edit, and delete tags
- 📊 **Status Management**: Manage issue statuses
- ⚡ **Priority Management**: Configure priority levels

---

## Default Login Credentials

After setting up the backend with seed data, you can login with:

- **Admin Account**: 
  - Email: `admin@example.com`
  - Password: `admin123`

- **Regular User**: 
  - Email: `user@example.com`
  - Password: `user123`

**⚠️ Change these passwords after first login!**

---

## Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

---

## API Integration

The frontend communicates with the backend through REST API endpoints. All authenticated requests include a JWT token stored in localStorage.

### Key API Endpoints Used

- `POST /api/register` - User registration
- `POST /api/login` - User login
- `GET /api/issues` - Fetch issues (with filtering)
- `POST /api/issues` - Create new issue
- `GET /api/issues/:id/comments` - Fetch issue comments
- `POST /api/issues/:id/comments` - Add comment
- `GET /api/tags` - Fetch all tags
- `GET /api/statuses` - Fetch all statuses
- `GET /api/priorities` - Fetch all priorities

See backend README for complete API documentation.

---

## Troubleshooting

### "Failed to fetch" errors

1. **Check backend is running**:
   ```bash
   # In PowerShell
   Invoke-WebRequest http://localhost:5000/ping
   ```

2. **Verify `.env.local` exists and is correct**:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```

3. **Check CORS settings** in backend `.env`:
   ```env
   ALLOWED_ORIGINS=http://localhost:3000
   ```

### Authentication issues

- Clear localStorage: Open browser DevTools → Application → Local Storage → Clear
- Check JWT token is being sent in requests
- Verify backend JWT_SECRET_KEY is set in backend `.env`

### Page not found errors

- Make sure you're using Next.js 14 App Router structure
- Check file names in `app/` directory match routes

### Styling issues

- Ensure Tailwind CSS is properly configured
- Check `globals.css` is imported in `layout.tsx`

---

## Development Tips

### Adding New Components

```bash
# Add new shadcn/ui component
npx shadcn-ui@latest add [component-name]
```

### TypeScript Types

Types are defined in `lib/types.ts`. Update this file when backend models change.

### Authentication Context

The `AuthContext` in `app/context/AuthContext.tsx` manages user authentication state. Use it in components:

```typescript
import { useAuth } from '@/app/context/AuthContext';

function MyComponent() {
  const { user, logout } = useAuth();
  // ...
}
```

---

## Next Steps

1. **Explore the application**: Login and create some issues
2. **Try admin features**: Login as admin and manage tags/statuses
3. **Customize**: Modify components to match your branding
4. **Deploy**: Build for production with `npm run build`

---

## Backend Setup

For backend setup instructions, see: `../issue-tracker-backend/README.md`

The backend provides:
- PostgreSQL database
- Flask REST API
- JWT authentication
- User and issue management
