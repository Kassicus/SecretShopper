# Family Gift Coordinator - Project Plan

## Project Overview

A web application for tracking family member preferences (sizes, colors, vehicles, etc.) and coordinating gift purchases through wishlists and private group chats. The app will be hosted on Vercel with user self-registration and family invitation system.

## Technology Stack (Free/Open-Source)

### Frontend
- **Next.js 14+** (App Router) - Full-stack React framework optimized for Vercel
- **TypeScript** - Type safety and better developer experience
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Copy-paste component library (no dependencies)
- **React Hook Form** - Performant forms with easy validation
- **Zod** - TypeScript-first schema validation

### Backend & Database
- **PostgreSQL** - Hosted on one of these free options:
  - **Supabase** (Free tier: 500MB database, 2GB bandwidth, 50MB file storage)
  - **Neon** (Free tier: 3GB storage per branch)
  - **Aiven** (Free tier: 1 month trial, then need alternative)
- **Prisma ORM** - Type-safe database client with migrations
- **NextAuth.js v5** - Authentication solution for Next.js

### Authentication & Email
- **NextAuth.js** - Handles authentication flows
- **Resend** (Free tier: 100 emails/day, 3000/month) OR
- **Nodemailer** with:
  - Gmail SMTP (500 emails/day free)
  - SendGrid (100 emails/day free)
  - Brevo/Sendinblue (300 emails/day free)

### File Storage
- **Uploadthing** (Free tier: 2GB storage) OR
- **Cloudinary** (Free tier: 25GB bandwidth, 25GB storage) OR
- **Supabase Storage** (If using Supabase for DB)

### Real-time Features
- **Pusher** (Free tier: 200k messages/day, 100 connections) OR
- **Supabase Realtime** (If using Supabase) OR
- **Socket.io** with Vercel Edge Functions

### Future MFA Support
- **Speakeasy** - TOTP library for 2FA
- **QRCode.js** - Generate QR codes for authenticator apps

## Database Schema

### Core Tables

```sql
-- Users table (managed by NextAuth)
User
- id            String   @id @default(cuid())
- email         String   @unique
- emailVerified DateTime?
- name          String?
- image         String?
- password      String   (hashed)
- totpSecret    String?  (for future MFA)
- createdAt     DateTime @default(now())
- updatedAt     DateTime @updatedAt

-- Account table (for OAuth providers if added later)
Account
- id                String  @id @default(cuid())
- userId            String
- type              String
- provider          String
- providerAccountId String
- refresh_token     String?
- access_token      String?
- expires_at        Int?
- token_type        String?
- scope             String?
- id_token          String?
- session_state     String?

-- Families table
Family
- id         String   @id @default(cuid())
- name       String
- inviteCode String   @unique
- createdBy  String
- createdAt  DateTime @default(now())
- updatedAt  DateTime @updatedAt

-- Family members junction table
FamilyMember
- id        String   @id @default(cuid())
- familyId  String
- userId    String
- role      Role     @default(MEMBER) // ADMIN or MEMBER
- joinedAt  DateTime @default(now())

-- Profiles (tracking info)
Profile
- id             String   @id @default(cuid())
- userId         String
- familyId       String
- shoeSize       String?
- pantSize       String?
- shirtSize      String?
- dressSize      String?
- ringSize       String?
- favoriteColors Json?    // Array of colors
- vehicleMake    String?
- vehicleModel   String?
- vehicleYear    Int?
- hobbies        Json?    // Array of strings
- interests      Json?    // Array of strings
- allergies      String?
- dietaryRestrictions String?
- notes          String?  @db.Text
- birthday       DateTime?
- anniversary    DateTime?
- updatedAt      DateTime @updatedAt

-- Wishlist items
WishlistItem
- id          String   @id @default(cuid())
- userId      String
- familyId    String
- title       String
- description String?  @db.Text
- url         String?
- price       Decimal? @db.Decimal(10, 2)
- imageUrl    String?
- priority    Priority @default(MEDIUM) // LOW, MEDIUM, HIGH
- category    String?
- claimedBy   String?
- claimedAt   DateTime?
- purchased   Boolean  @default(false)
- createdAt   DateTime @default(now())
- updatedAt   DateTime @updatedAt

-- Gift groups
GiftGroup
- id            String   @id @default(cuid())
- familyId      String
- name          String
- description   String?  @db.Text
- occasion      String?
- occasionDate  DateTime?
- targetUserId  String?  // Person receiving the gift
- targetAmount  Decimal? @db.Decimal(10, 2)
- currentAmount Decimal  @default(0) @db.Decimal(10, 2)
- isActive      Boolean  @default(true)
- createdBy     String
- createdAt     DateTime @default(now())
- updatedAt     DateTime @updatedAt

-- Gift group members
GiftGroupMember
- id                 String   @id @default(cuid())
- giftGroupId        String
- userId             String
- contributionAmount Decimal? @db.Decimal(10, 2)
- hasPaid            Boolean  @default(false)
- joinedAt           DateTime @default(now())

-- Messages
Message
- id           String   @id @default(cuid())
- giftGroupId  String
- userId       String
- content      String   @db.Text
- attachmentUrl String?
- isEdited     Boolean  @default(false)
- createdAt    DateTime @default(now())
- updatedAt    DateTime @updatedAt

-- Email verification tokens
VerificationToken
- identifier String
- token      String   @unique
- expires    DateTime
```

## Feature Breakdown & Implementation Order

### Phase 1: Core Foundation (Week 1-2)

#### 1.1 Project Setup
- [ ] Initialize Next.js with TypeScript and App Router
- [ ] Configure Tailwind CSS
- [ ] Install and setup shadcn/ui
- [ ] Setup PostgreSQL database (Supabase/Neon)
- [ ] Configure Prisma ORM
- [ ] Setup environment variables
- [ ] Configure Git repository

#### 1.2 Authentication System
- [ ] Install and configure NextAuth.js v5
- [ ] Create auth API routes
- [ ] Implement registration with email/password
- [ ] Email verification flow using tokens
- [ ] Password reset functionality
- [ ] Protected route middleware
- [ ] Session management
- [ ] Login/logout functionality

#### 1.3 Email Service Setup
- [ ] Configure email provider (Resend/Nodemailer)
- [ ] Create email templates (verification, welcome, reset)
- [ ] Test email delivery
- [ ] Add email queuing for reliability

### Phase 2: Family Management (Week 2)

#### 2.1 Family CRUD Operations
- [ ] Create family form and API
- [ ] Generate unique invite codes
- [ ] Family settings page
- [ ] Delete/leave family functionality

#### 2.2 Member Management
- [ ] Join family via invite code
- [ ] Family member list view
- [ ] Member roles (admin/member)
- [ ] Remove members (admin only)
- [ ] Invite expiration system

### Phase 3: Profile & Tracking (Week 3)

#### 3.1 Profile Management
- [ ] Create/edit profile form
- [ ] Profile image upload
- [ ] Size selection components
- [ ] Color preference picker
- [ ] Vehicle information form
- [ ] Hobbies/interests tags

#### 3.2 Profile Viewing
- [ ] Family member profile cards
- [ ] Profile detail pages
- [ ] Search/filter profiles
- [ ] Profile completion indicators
- [ ] Privacy settings

### Phase 4: Wishlist System (Week 4)

#### 4.1 Wishlist CRUD
- [ ] Add wishlist item form
- [ ] URL metadata scraping
- [ ] Image upload for items
- [ ] Edit/delete items
- [ ] Priority settings
- [ ] Categories/tags

#### 4.2 Wishlist Interaction
- [ ] View family wishlists
- [ ] Claim items (hidden from owner)
- [ ] Mark as purchased
- [ ] Price tracking
- [ ] Sort and filter options
- [ ] Wishlist sharing links

### Phase 5: Group Coordination (Week 5)

#### 5.1 Gift Groups
- [ ] Create gift group form
- [ ] Set occasion and target
- [ ] Invite members to group
- [ ] Contribution tracking
- [ ] Progress indicators
- [ ] Group management tools

#### 5.2 Real-time Chat
- [ ] Implement WebSocket connection
- [ ] Message sending/receiving
- [ ] Message history
- [ ] Typing indicators
- [ ] Read receipts
- [ ] File attachments
- [ ] Message notifications

### Phase 6: Polish & Deployment (Week 6)

#### 6.1 UI/UX Improvements
- [ ] Responsive design testing
- [ ] Loading states and skeletons
- [ ] Error boundaries
- [ ] Empty states
- [ ] Toast notifications
- [ ] Dark mode support

#### 6.2 Performance & Features
- [ ] Image optimization
- [ ] Lazy loading
- [ ] SEO optimization
- [ ] PWA configuration
- [ ] Export functionality
- [ ] Print gift lists

### Phase 7: Future Enhancements

#### 7.1 MFA Implementation
- [ ] TOTP setup flow
- [ ] QR code generation
- [ ] Backup codes
- [ ] MFA enforcement options

#### 7.2 Additional Features
- [ ] Budget tracking
- [ ] Gift history/archive
- [ ] Reminder notifications
- [ ] Mobile app (React Native)
- [ ] Gift suggestions AI
- [ ] Price drop alerts

## File Structure

```
family-gift-app/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   ├── verify-email/
│   │   │   └── page.tsx
│   │   └── reset-password/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── family/
│   │   │   ├── create/
│   │   │   ├── join/
│   │   │   ├── [familyId]/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── settings/
│   │   │   │   └── members/
│   │   ├── profile/
│   │   │   ├── page.tsx
│   │   │   ├── edit/
│   │   │   └── [userId]/
│   │   ├── wishlist/
│   │   │   ├── page.tsx
│   │   │   ├── add/
│   │   │   └── [itemId]/
│   │   └── groups/
│   │       ├── page.tsx
│   │       ├── create/
│   │       └── [groupId]/
│   │           ├── page.tsx
│   │           └── chat/
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   ├── families/
│   │   ├── profiles/
│   │   ├── wishlist/
│   │   ├── groups/
│   │   ├── messages/
│   │   └── email/
│   └── layout.tsx
├── components/
│   ├── ui/           # shadcn/ui components
│   ├── auth/
│   ├── family/
│   ├── profile/
│   ├── wishlist/
│   ├── groups/
│   └── layouts/
├── lib/
│   ├── auth.ts
│   ├── db.ts
│   ├── email.ts
│   ├── prisma.ts
│   ├── utils.ts
│   └── validations/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── emails/           # Email templates
├── public/
├── types/
│   └── index.ts
├── middleware.ts
├── .env.local
├── .env.example
├── next.config.js
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-random-secret"

# Email (choose one)
# Option 1: Resend
RESEND_API_KEY="re_..."

# Option 2: SMTP (Gmail example)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="app-specific-password"
SMTP_FROM="your-email@gmail.com"

# File Upload (if using external service)
UPLOADTHING_SECRET="sk_..."
UPLOADTHING_APP_ID="..."
# OR
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."

# Real-time (if using Pusher)
NEXT_PUBLIC_PUSHER_KEY="..."
PUSHER_APP_ID="..."
PUSHER_SECRET="..."
PUSHER_CLUSTER="..."

# Public URL (for production)
NEXT_PUBLIC_APP_URL="https://your-domain.vercel.app"
```

## Security Considerations

### Authentication & Authorization
- Bcrypt for password hashing
- JWT tokens with secure HTTP-only cookies
- Session validation on each request
- Role-based access control (RBAC)
- Rate limiting on auth endpoints

### Data Protection
- Input validation with Zod schemas
- SQL injection prevention via Prisma
- XSS protection with React's default escaping
- CSRF protection with NextAuth
- Sanitize file uploads
- Maximum file size limits

### Privacy Features
- Claimed items hidden from recipients
- Private group chats
- Profile visibility settings
- Soft deletes for data recovery
- Data export functionality (GDPR)

## API Design

### RESTful Endpoints

```
Authentication:
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/reset-password
GET    /api/auth/verify-email

Families:
GET    /api/families
POST   /api/families
GET    /api/families/[id]
PATCH  /api/families/[id]
DELETE /api/families/[id]
POST   /api/families/join
GET    /api/families/[id]/members

Profiles:
GET    /api/profiles/[userId]
PATCH  /api/profiles/[userId]
POST   /api/profiles/upload-image

Wishlist:
GET    /api/wishlist
POST   /api/wishlist
GET    /api/wishlist/[id]
PATCH  /api/wishlist/[id]
DELETE /api/wishlist/[id]
POST   /api/wishlist/[id]/claim
POST   /api/wishlist/[id]/unclaim

Gift Groups:
GET    /api/groups
POST   /api/groups
GET    /api/groups/[id]
PATCH  /api/groups/[id]
DELETE /api/groups/[id]
POST   /api/groups/[id]/join
POST   /api/groups/[id]/contribute

Messages:
GET    /api/messages/[groupId]
POST   /api/messages
PATCH  /api/messages/[id]
DELETE /api/messages/[id]
```

## Development Workflow with Claude Code

### Effective Prompting Strategy

1. **Initial Setup Phase**
   ```
   "Set up a Next.js 14 project with TypeScript, Tailwind CSS, Prisma ORM connected to PostgreSQL, and NextAuth.js for authentication"
   ```

2. **Feature Development**
   ```
   "Create a complete authentication flow with email verification using NextAuth.js and Resend/Nodemailer for sending emails"
   ```

3. **Database Operations**
   ```
   "Create Prisma schema for families, profiles, and wishlist items with proper relationships and indexes"
   ```

4. **Component Creation**
   ```
   "Build a responsive profile editing form with all size fields, color picker, and vehicle information using React Hook Form and Zod validation"
   ```

5. **API Implementation**
   ```
   "Create protected API routes for wishlist CRUD operations with proper authorization checks"
   ```

### Task Breakdown Tips
- Keep requests focused on single features
- Provide context about existing code structure
- Ask for error handling and edge cases
- Request TypeScript types for all data structures
- Ask for both frontend and backend implementation

## Testing Strategy

### Unit Testing
- Utility functions
- Validation schemas
- Database queries
- Email templates

### Integration Testing
- API endpoint testing
- Authentication flows
- Database operations
- File upload handling

### E2E Testing
- User registration flow
- Family creation and joining
- Wishlist management
- Gift group coordination

### Testing Tools
- **Jest** - Unit testing
- **React Testing Library** - Component testing
- **Playwright** or **Cypress** - E2E testing
- **MSW** - API mocking

## Performance Optimization

### Frontend
- Image optimization with next/image
- Lazy loading for lists
- Code splitting by route
- Suspense boundaries
- React Query or SWR for data caching

### Backend
- Database indexes on frequently queried fields
- Pagination for large lists
- Efficient Prisma queries (select specific fields)
- API response caching
- Rate limiting

### Monitoring
- Vercel Analytics
- Error tracking (Sentry free tier)
- Performance monitoring
- Uptime monitoring

## Deployment Checklist

### Pre-deployment
- [ ] Environment variables configured
- [ ] Database migrations tested
- [ ] Email service verified
- [ ] Image upload tested
- [ ] Authentication flows verified
- [ ] Mobile responsiveness checked

### Vercel Configuration
- [ ] Environment variables added
- [ ] Build command configured
- [ ] Database connection string secured
- [ ] Domain configured
- [ ] SSL certificate active

### Post-deployment
- [ ] Verify email sending
- [ ] Test user registration
- [ ] Check real-time features
- [ ] Monitor error logs
- [ ] Set up backups
- [ ] Configure monitoring alerts

## Cost Analysis (Free Tier Limits)

### Database
- **Supabase**: 500MB storage, 2GB bandwidth/month
- **Neon**: 3GB storage per branch
- **Recommendation**: Start with Supabase, migrate if needed

### Email
- **Resend**: 100/day, 3000/month
- **Brevo**: 300/day
- **Recommendation**: Resend for simplicity

### File Storage
- **Uploadthing**: 2GB total
- **Cloudinary**: 25GB storage, 25GB bandwidth/month
- **Recommendation**: Cloudinary for better limits

### Hosting
- **Vercel**: Unlimited for personal use
- **Limits**: 100GB bandwidth/month, 10 second function timeout

### Estimated Capacity
With free tiers, the app can support:
- ~100 active families
- ~500 total users
- ~3000 wishlist items
- ~100 emails per day

## Support & Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)

### Community
- Stack Overflow for specific issues
- GitHub Discussions for Next.js
- Discord servers for real-time help
- Reddit r/nextjs community

### Tutorials
- Official Next.js tutorials
- Prisma getting started guide
- NextAuth.js examples repository
- Vercel deployment guides

## Notes for Claude Code Implementation

When implementing with Claude Code, consider:
1. Start with authentication - it's the foundation
2. Build incrementally - one feature at a time
3. Test each feature before moving on
4. Keep components modular and reusable
5. Use TypeScript strictly for better code generation
6. Request error handling in every implementation
7. Ask for both success and error UI states
8. Ensure mobile responsiveness from the start

This plan provides a complete roadmap for building your family gift coordinator app using entirely free services (within their generous free tiers). The architecture is scalable, allowing you to upgrade to paid tiers as your user base grows.