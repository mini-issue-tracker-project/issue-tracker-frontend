# Issue Tracker Frontend

Next.js frontend for the Issue Tracker application.

🌐 **Live Demo:** https://issue-tracker-frontend-phi.vercel.app

---

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Shadcn/ui Components

---

## Local Setup

### Prerequisites

**⚠️ Backend must be running first!**

See `../issue-tracker-backend/README.md` for backend setup.

### 1. Install Dependencies

```bash
cd issue-tracker-frontend
npm install
```

### 2. Configure Environment

Create `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 3. Start Development Server

```bash
npm run dev
```

Frontend runs on: **http://localhost:3000**

---

## Features

- 🔐 User authentication (register/login)
- 📝 Create, edit, delete issues
- 💬 Comment on issues
- 🏷️ Categorize with tags
- 🔍 Filter by status, priority, tags, author
- 👤 User profiles
- 👑 Admin panel (for admins only)

---

## Default Login

After backend setup:

- **Admin**: `admin@example.com` / `admin123`
- **User**: `user@example.com` / `user123`

---

## Project Structure

```
issue-tracker-frontend/
├── app/
│   ├── context/      # Auth context
│   ├── utils/        # API utilities
│   └── issues/       # Issue pages
├── components/
│   ├── custom/       # App components
│   └── ui/           # Shadcn/ui components
└── lib/              # Types and utils
```

---

## Available Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm start        # Start production server
npm run lint     # Lint code
```

---

## Deployment (Vercel)

The app is deployed on Vercel with environment variable:

```
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
```

---

## Troubleshooting

**"Failed to fetch" errors:**
- Ensure backend is running on port 5000
- Check `.env.local` has correct NEXT_PUBLIC_API_URL
- Verify backend CORS allows your frontend URL

**Authentication issues:**
- Clear localStorage (DevTools → Application → Local Storage)
- Check JWT token is being sent in requests (Network tab)

**Styling issues:**
- Run `npm install` to ensure all dependencies are installed
- Check Tailwind CSS configuration
