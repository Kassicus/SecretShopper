# Secret Shopper - Setup Guide

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (choose one option below)

## Database Setup Options

### Option 1: Local Prisma Postgres (Recommended for Development)
```bash
npx prisma dev
```
This will start a local Prisma Postgres instance. The connection string is already configured in `.env`.

### Option 2: External PostgreSQL (Supabase, Neon, etc.)
1. Create a PostgreSQL database on your preferred provider:
   - [Supabase](https://supabase.com) - 500MB free
   - [Neon](https://neon.tech) - 3GB free
   - [Aiven](https://aiven.io) - Free trial

2. Update the `DATABASE_URL` in `.env` with your connection string

### Option 3: Local PostgreSQL
```bash
# Install PostgreSQL on macOS
brew install postgresql@16
brew services start postgresql@16

# Create database
createdb secretshopper

# Update .env with:
DATABASE_URL="postgresql://yourusername@localhost:5432/secretshopper?schema=public"
```

## Initial Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Generate NextAuth secret:**
   ```bash
   openssl rand -base64 32
   ```
   Copy the output and replace `NEXTAUTH_SECRET` value in `.env`

3. **Run database migrations:**
   ```bash
   npm run prisma:migrate
   ```

4. **Generate Prisma Client:**
   ```bash
   npm run prisma:generate
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

6. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## What's Implemented

### ✅ Phase 1.1 - Project Setup (Complete)
- Next.js 15 with TypeScript and App Router
- Tailwind CSS with custom theme
- shadcn/ui components
- Prisma ORM configuration
- Complete folder structure

### ✅ Phase 1.2 - Authentication System (Complete)
- Complete Prisma database schema with all models:
  - Users, Accounts, Families, FamilyMembers
  - Profiles, WishlistItems, GiftGroups
  - GiftGroupMembers, Messages, VerificationTokens
- NextAuth.js v5 with credentials provider
- Registration API with password hashing
- Login/logout functionality
- Protected routes middleware
- TypeScript type definitions

### 📋 Next Steps (Phase 2)

**Family Management:**
- Create family functionality
- Join family via invite code
- Family member management
- Admin roles

**Then:**
- Profile management (sizes, preferences, etc.)
- Wishlist system
- Gift group coordination
- Real-time chat

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio (database GUI)

## Testing the Auth Flow

1. Go to `/register` to create an account
2. Fill in your details (password must have uppercase, lowercase, and number)
3. After registration, go to `/login` to sign in
4. You'll be redirected to `/dashboard`

## Troubleshooting

**Database connection errors:**
- Make sure your PostgreSQL server is running
- Check that the `DATABASE_URL` in `.env` is correct
- Try running `npx prisma dev` if using local Prisma Postgres

**NextAuth errors:**
- Ensure `NEXTAUTH_SECRET` is set in `.env`
- Make sure you've run `npm run prisma:generate`

**Build errors:**
- Delete `.next` folder and run `npm run dev` again
- Delete `node_modules` and run `npm install` again
