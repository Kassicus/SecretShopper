# SecretShopper Tech Stack Migration Guide

**Version:** 1.0
**Date Started:** October 12, 2025
**Branch:** `tech-stack-migration`
**Status:** 🚧 In Progress

---

## Table of Contents

1. [Overview](#overview)
2. [Migration Goals](#migration-goals)
3. [Current Tech Stack](#current-tech-stack)
4. [New Tech Stack](#new-tech-stack)
5. [Database Schema Reference](#database-schema-reference)
6. [Feature Inventory](#feature-inventory)
7. [Architecture](#architecture)
8. [Design System](#design-system)
9. [Implementation Progress](#implementation-progress)
10. [Deployment](#deployment)
11. [Testing Checklist](#testing-checklist)
12. [Troubleshooting](#troubleshooting)
13. [References](#references)

---

## Overview

This document serves as the **living reference** for migrating SecretShopper from a Next.js 15 + React application to a Python Flask + Jinja2 application. The migration maintains all existing functionality while implementing a modern glassmorphic design language.

**Why this migration?**
- Transition to Python backend for easier maintenance
- Simplify frontend with server-side rendering (Jinja2)
- Maintain deployment on Vercel
- Keep Supabase PostgreSQL database
- Implement sleek glassmorphic design

---

## Migration Goals

### Must Preserve
✅ All user authentication functionality
✅ Family management (create, join, invite, manage)
✅ User profiles per family (sizes, preferences, dates)
✅ Wishlist system (add, edit, delete, claim, purchase tracking)
✅ Gift groups (pooling funds, messaging, contributions)
✅ Dashboard overview
✅ Database schema and data integrity
✅ Vercel deployment compatibility
✅ Supabase PostgreSQL connection

### New Implementations
🎨 Glassmorphic design language
🎯 Minimal, purposeful animations
📱 Mobile-responsive layouts
🔒 Enhanced security practices (CSRF, session management)

---

## Current Tech Stack

### Frontend
- **Framework:** Next.js 15 (App Router)
- **UI Library:** React 19
- **Styling:** Tailwind CSS 4.1
- **Components:** Radix UI, shadcn/ui
- **Animations:** Framer Motion
- **Icons:** Lucide React

### Backend
- **Runtime:** Node.js
- **API:** Next.js API Routes
- **Authentication:** NextAuth.js 5 (beta)
- **ORM:** Prisma 6.16
- **Validation:** Zod, React Hook Form

### Database
- **Provider:** Supabase (PostgreSQL)
- **Connection:** Direct + Pooled URLs

### Deployment
- **Platform:** Vercel
- **Build:** Next.js build process

---

## New Tech Stack

### Backend
- **Framework:** Flask 3.x (Python 3.11+)
- **WSGI Server:** Gunicorn (for production)
- **ORM:** SQLAlchemy 2.x
- **Authentication:** Flask-Login
- **Password Hashing:** bcrypt
- **Email:** Flask-Mail or python SMTP
- **Environment:** python-dotenv
- **Database Driver:** psycopg2-binary

### Frontend
- **Template Engine:** Jinja2 (built into Flask)
- **Styling:** Custom CSS with glassmorphic design
- **JavaScript:** Vanilla JS (minimal, for interactions)
- **Forms:** WTForms (Flask-WTF) with CSRF protection

### Database
- **Provider:** Supabase (PostgreSQL) - **UNCHANGED**
- **Connection:** SQLAlchemy connection via DATABASE_URL

### Deployment
- **Platform:** Vercel (Python runtime)
- **Configuration:** `vercel.json` + `vercel_app.py`

---

## Database Schema Reference

### Tables and Relationships

#### User
```
id: String (PK, cuid)
email: String (unique)
emailVerified: DateTime?
name: String?
image: String?
password: String (hashed with bcrypt)
totpSecret: String?
createdAt: DateTime
updatedAt: DateTime

Relationships:
- accounts (Account[])
- familyMembers (FamilyMember[])
- profiles (Profile[])
- wishlistItems (WishlistItem[])
- createdFamilies (Family[])
- claimedItems (WishlistItem[])
- createdGroups (GiftGroup[])
- groupMembers (GiftGroupMember[])
- messages (Message[])
```

#### Family
```
id: String (PK, cuid)
name: String
inviteCode: String (unique)
createdBy: String (FK → User)
createdAt: DateTime
updatedAt: DateTime

Relationships:
- creator (User)
- members (FamilyMember[])
- profiles (Profile[])
- wishlistItems (WishlistItem[])
- giftGroups (GiftGroup[])
```

#### FamilyMember (Junction Table)
```
id: String (PK, cuid)
familyId: String (FK → Family)
userId: String (FK → User)
role: Role (ADMIN | MEMBER)
joinedAt: DateTime

Unique: [familyId, userId]
```

#### Profile
```
id: String (PK, cuid)
userId: String (FK → User)
familyId: String (FK → Family)
shoeSize: String?
pantSize: String?
shirtSize: String?
dressSize: String?
ringSize: String?
favoriteColors: JSON?
vehicleMake: String?
vehicleModel: String?
vehicleYear: Int?
hobbies: JSON?
interests: JSON?
allergies: String?
dietaryRestrictions: String?
notes: Text?
birthday: DateTime?
anniversary: DateTime?
updatedAt: DateTime

Unique: [userId, familyId]
```

#### WishlistItem
```
id: String (PK, cuid)
userId: String (FK → User)
familyId: String (FK → Family)
title: String
description: Text?
url: String?
price: Decimal(10,2)?
imageUrl: String?
priority: Priority (LOW | MEDIUM | HIGH)
category: String?
claimedBy: String? (FK → User)
claimedAt: DateTime?
purchased: Boolean (default: false)
createdAt: DateTime
updatedAt: DateTime
```

#### GiftGroup
```
id: String (PK, cuid)
familyId: String (FK → Family)
name: String
description: Text?
occasion: String?
occasionDate: DateTime?
targetUserId: String?
targetAmount: Decimal(10,2)?
currentAmount: Decimal(10,2) (default: 0)
isActive: Boolean (default: true)
createdBy: String (FK → User)
createdAt: DateTime
updatedAt: DateTime

Relationships:
- members (GiftGroupMember[])
- messages (Message[])
```

#### GiftGroupMember
```
id: String (PK, cuid)
giftGroupId: String (FK → GiftGroup)
userId: String (FK → User)
contributionAmount: Decimal(10,2)?
hasPaid: Boolean (default: false)
lastReadAt: DateTime?
joinedAt: DateTime

Unique: [giftGroupId, userId]
```

#### Message
```
id: String (PK, cuid)
giftGroupId: String (FK → GiftGroup)
userId: String (FK → User)
content: Text
attachmentUrl: String?
isEdited: Boolean (default: false)
createdAt: DateTime
updatedAt: DateTime
```

#### Account (OAuth - for future)
```
id: String (PK, cuid)
userId: String (FK → User)
type: String
provider: String
providerAccountId: String
refresh_token: Text?
access_token: Text?
expires_at: Int?
token_type: String?
scope: String?
id_token: Text?
session_state: String?

Unique: [provider, providerAccountId]
```

#### VerificationToken
```
identifier: String
token: String (unique)
expires: DateTime

Unique: [identifier, token]
```

### Enums
- **Role:** ADMIN, MEMBER
- **Priority:** LOW, MEDIUM, HIGH

---

## Feature Inventory

### Authentication & Authorization
- [ ] User registration with email/password
- [ ] Email verification system
- [ ] User login with session management
- [ ] Password hashing (bcrypt)
- [ ] Logout functionality
- [ ] Session persistence
- [ ] Protected routes (login required)
- [ ] CSRF protection on all forms

### Family Management
- [ ] Create new family
- [ ] Generate unique invite codes
- [ ] Join family via invite code
- [ ] View family members list
- [ ] Remove members (ADMIN only)
- [ ] Invite by email
- [ ] Copy invite link to clipboard
- [ ] Leave family
- [ ] Role-based permissions (ADMIN vs MEMBER)

### Profile Management
- [ ] View user profile per family
- [ ] Edit profile information
- [ ] Track clothing sizes (shoe, pant, shirt, dress, ring)
- [ ] Store favorite colors (JSON array)
- [ ] Vehicle information (make, model, year)
- [ ] Hobbies and interests (JSON arrays)
- [ ] Allergies and dietary restrictions
- [ ] Personal notes field
- [ ] Birthday tracking
- [ ] Anniversary tracking
- [ ] Profile completion percentage indicator

### Wishlist System
- [ ] Add wishlist items
- [ ] Edit wishlist items
- [ ] Delete wishlist items
- [ ] Set item priority (LOW, MEDIUM, HIGH)
- [ ] Add item URL and image
- [ ] Set item price
- [ ] Categorize items
- [ ] Claim items (by other family members)
- [ ] Unclaim items
- [ ] Mark items as purchased
- [ ] View own wishlist
- [ ] View family members' wishlists
- [ ] Filter wishlists by user, priority, claimed status
- [ ] Sort wishlists

### Gift Groups
- [ ] Create gift group within family
- [ ] Set target amount and recipient
- [ ] Set occasion and date
- [ ] Add members to group
- [ ] Track contribution amounts per member
- [ ] Mark contributions as paid
- [ ] Group chat/messaging
- [ ] View message history
- [ ] Track unread messages
- [ ] Real-time message display
- [ ] Edit group details
- [ ] Archive/deactivate groups

### Dashboard
- [ ] Display user's families (top 2 by member count)
- [ ] Show wishlist preview (4-6 items, sorted by priority)
- [ ] Show gift groups (2-4 recent groups)
- [ ] Display unread message counts
- [ ] Quick links to main sections
- [ ] Empty state handling for each section

### Notifications & Email
- [ ] Welcome email after registration
- [ ] Email verification link
- [ ] Family invitation emails
- [ ] Gift group activity notifications (optional)

---

## Architecture

### New Directory Structure

```
SecretShopper/
├── app.py                          # Main Flask application entry point
├── wsgi.py                         # WSGI entry for Gunicorn
├── config.py                       # Application configuration
├── requirements.txt                # Python dependencies
├── vercel.json                     # Vercel deployment config
├── .env                            # Environment variables (local, gitignored)
├── .env.example                    # Environment template
├── README.md                       # Updated setup instructions
├── MIGRATION_GUIDE.md              # This document
│
├── models/                         # SQLAlchemy models
│   ├── __init__.py
│   ├── user.py                     # User, Account models
│   ├── family.py                   # Family, FamilyMember models
│   ├── profile.py                  # Profile model
│   ├── wishlist.py                 # WishlistItem model
│   ├── gift_group.py               # GiftGroup, GiftGroupMember models
│   ├── message.py                  # Message model
│   └── verification.py             # VerificationToken model
│
├── routes/                         # Flask blueprints
│   ├── __init__.py
│   ├── auth.py                     # /register, /login, /logout, /verify
│   ├── dashboard.py                # /dashboard
│   ├── family.py                   # /family/*
│   ├── profile.py                  # /profile/*
│   ├── wishlist.py                 # /wishlist/*
│   └── groups.py                   # /groups/*
│
├── templates/                      # Jinja2 templates
│   ├── base.html                   # Base layout with nav, footer
│   ├── _components/                # Reusable template components
│   │   ├── navbar.html
│   │   ├── sidebar.html
│   │   ├── card.html
│   │   ├── modal.html
│   │   ├── form_field.html
│   │   └── button.html
│   ├── auth/
│   │   ├── login.html
│   │   ├── register.html
│   │   └── verify.html
│   ├── dashboard/
│   │   └── index.html
│   ├── family/
│   │   ├── list.html               # Family overview
│   │   ├── detail.html             # Single family view
│   │   ├── members.html
│   │   ├── settings.html
│   │   └── join.html
│   ├── profile/
│   │   ├── view.html
│   │   └── edit.html
│   ├── wishlist/
│   │   ├── list.html
│   │   ├── add.html
│   │   └── edit.html
│   ├── groups/
│   │   ├── list.html
│   │   ├── detail.html             # Group with chat
│   │   └── create.html
│   └── errors/
│       ├── 404.html
│       ├── 403.html
│       └── 500.html
│
├── static/                         # Static assets
│   ├── css/
│   │   ├── main.css                # Main styles with glassmorphic theme
│   │   ├── components.css          # Component-specific styles
│   │   └── animations.css          # Minimal animation definitions
│   ├── js/
│   │   ├── main.js                 # Global JavaScript
│   │   ├── forms.js                # Form validation helpers
│   │   └── chat.js                 # Gift group chat interactions
│   └── images/
│       ├── logo.png
│       └── placeholder.png
│
├── utils/                          # Utility functions
│   ├── __init__.py
│   ├── email.py                    # Email sending utilities
│   ├── validators.py               # Custom validation functions
│   ├── decorators.py               # Custom route decorators (login_required, etc.)
│   ├── helpers.py                  # General helper functions
│   └── invite_code.py              # Invite code generation
│
└── migrations/                     # Alembic migrations (if needed)
    └── versions/
```

### Flask Application Structure

#### app.py
```python
from flask import Flask
from flask_login import LoginManager
from models import db, User
import os

def create_app():
    app = Flask(__name__)
    app.config.from_object('config.Config')

    # Initialize extensions
    db.init_app(app)
    login_manager = LoginManager(app)
    login_manager.login_view = 'auth.login'

    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(user_id)

    # Register blueprints
    from routes import auth, dashboard, family, profile, wishlist, groups
    app.register_blueprint(auth.bp)
    app.register_blueprint(dashboard.bp)
    app.register_blueprint(family.bp)
    app.register_blueprint(profile.bp)
    app.register_blueprint(wishlist.bp)
    app.register_blueprint(groups.bp)

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
```

#### config.py
```python
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY')
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    WTF_CSRF_ENABLED = True
    # Email config
    MAIL_SERVER = os.getenv('SMTP_HOST')
    MAIL_PORT = int(os.getenv('SMTP_PORT', 587))
    MAIL_USERNAME = os.getenv('SMTP_USER')
    MAIL_PASSWORD = os.getenv('SMTP_PASSWORD')
    MAIL_DEFAULT_SENDER = os.getenv('SMTP_FROM')
```

---

## Design System

### Glassmorphic Theme Specification

#### Color Palette
```css
:root {
  /* Base colors with transparency */
  --glass-white: rgba(255, 255, 255, 0.1);
  --glass-white-strong: rgba(255, 255, 255, 0.25);
  --glass-black: rgba(0, 0, 0, 0.1);

  /* Primary gradient */
  --gradient-primary: linear-gradient(135deg,
    rgba(99, 102, 241, 0.8),
    rgba(168, 85, 247, 0.6));

  /* Background layers */
  --bg-primary: #0f172a;        /* Dark slate */
  --bg-secondary: #1e293b;

  /* Text colors */
  --text-primary: #f8fafc;
  --text-secondary: #cbd5e1;
  --text-muted: #94a3b8;

  /* Accent colors */
  --accent-primary: #6366f1;    /* Indigo */
  --accent-secondary: #a855f7;  /* Purple */
  --accent-success: #10b981;    /* Green */
  --accent-warning: #f59e0b;    /* Amber */
  --accent-error: #ef4444;      /* Red */

  /* Border and shadow */
  --border-glass: rgba(255, 255, 255, 0.18);
  --shadow-glass: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
}
```

#### Glass Card Component
```css
.glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px) saturate(180%);
  -webkit-backdrop-filter: blur(10px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 12px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  transition: all 0.3s ease;
}

.glass-card:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
  box-shadow: 0 12px 40px 0 rgba(31, 38, 135, 0.45);
}
```

#### Typography
```css
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
               'Helvetica Neue', Arial, sans-serif;
  font-size: 16px;
  line-height: 1.6;
  color: var(--text-primary);
}

h1 { font-size: 2.5rem; font-weight: 700; line-height: 1.2; }
h2 { font-size: 2rem; font-weight: 600; }
h3 { font-size: 1.5rem; font-weight: 600; }
h4 { font-size: 1.25rem; font-weight: 500; }
```

#### Buttons
```css
.btn-primary {
  background: var(--gradient-primary);
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px 0 rgba(99, 102, 241, 0.4);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px 0 rgba(99, 102, 241, 0.6);
}

.btn-glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  color: var(--text-primary);
  transition: all 0.3s ease;
}
```

#### Animations (Minimal)
```css
/* Fade in on page load */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.fade-in {
  animation: fadeIn 0.5s ease forwards;
}

/* Gentle hover effects */
.hover-lift {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.hover-lift:hover {
  transform: translateY(-4px);
}

/* Loading spinner */
@keyframes spin {
  to { transform: rotate(360deg); }
}

.spinner {
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: var(--accent-primary);
  border-radius: 50%;
  width: 2rem;
  height: 2rem;
  animation: spin 0.8s linear infinite;
}
```

#### Form Inputs
```css
.form-input {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  color: var(--text-primary);
  transition: all 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--accent-primary);
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}
```

#### Layout
- **Container max-width:** 1280px
- **Spacing scale:** 0.25rem, 0.5rem, 1rem, 1.5rem, 2rem, 3rem, 4rem
- **Border radius:** 8px (small), 12px (medium), 16px (large)
- **Responsive breakpoints:**
  - Mobile: < 640px
  - Tablet: 640px - 1024px
  - Desktop: > 1024px

---

## Implementation Progress

### Phase 1: Setup ✅ / 🚧 / ❌
- [x] Create migration branch
- [x] Create MIGRATION_GUIDE.md
- [ ] Set up Python virtual environment
- [ ] Install Flask dependencies
- [ ] Create Flask app structure

### Phase 2: Database & Auth
- [ ] Convert Prisma models to SQLAlchemy
- [ ] Set up database connection
- [ ] Implement Flask-Login
- [ ] Create User model with password hashing
- [ ] Build registration route
- [ ] Build login route
- [ ] Build logout route
- [ ] Email verification system

### Phase 3: Core Features
- [ ] Family CRUD routes
- [ ] Family invite system
- [ ] Family member management
- [ ] Profile view/edit routes
- [ ] Wishlist CRUD routes
- [ ] Wishlist claim/purchase functionality
- [ ] Gift group CRUD routes
- [ ] Gift group messaging
- [ ] Gift group contributions
- [ ] Dashboard aggregate views

### Phase 4: Frontend
- [ ] Create base.html layout
- [ ] Implement navigation
- [ ] Build component templates
- [ ] Create glassmorphic CSS
- [ ] Implement responsive design
- [ ] Add minimal animations
- [ ] Create all page templates

### Phase 5: Testing & Deployment
- [ ] Test authentication flows
- [ ] Test all CRUD operations
- [ ] Security audit
- [ ] Create vercel.json
- [ ] Set up environment variables in Vercel
- [ ] Deploy to Vercel
- [ ] Verify database connection
- [ ] End-to-end testing

---

## Deployment

### Vercel Configuration

#### vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "wsgi.py",
      "use": "@vercel/python"
    },
    {
      "src": "static/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/static/(.*)",
      "dest": "/static/$1"
    },
    {
      "src": "/(.*)",
      "dest": "wsgi.py"
    }
  ]
}
```

#### wsgi.py
```python
from app import create_app

app = create_app()

if __name__ == "__main__":
    app.run()
```

### Environment Variables (Vercel)
Set these in Vercel project settings:

```
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
SECRET_KEY=your-secret-key-here
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=your-email@gmail.com
NEXTAUTH_URL=https://your-domain.vercel.app
```

### requirements.txt
```
Flask==3.0.0
Flask-Login==0.6.3
Flask-WTF==1.2.1
Flask-Mail==0.9.1
SQLAlchemy==2.0.23
psycopg2-binary==2.9.9
bcrypt==4.1.2
python-dotenv==1.0.0
email-validator==2.1.0
gunicorn==21.2.0
```

---

## Testing Checklist

### Authentication
- [ ] User can register with email/password
- [ ] Email verification sends and validates
- [ ] User can login with correct credentials
- [ ] Login fails with wrong credentials
- [ ] Session persists across page loads
- [ ] User can logout
- [ ] Protected routes redirect to login

### Family Management
- [ ] User can create a new family
- [ ] Invite code is generated and unique
- [ ] User can join family with valid code
- [ ] User cannot join with invalid code
- [ ] Family creator is ADMIN
- [ ] ADMIN can remove members
- [ ] MEMBER cannot remove members
- [ ] User can leave family
- [ ] Deleted family removes all associations

### Profile Management
- [ ] User can view profile in family context
- [ ] User can edit own profile
- [ ] All profile fields save correctly
- [ ] JSON fields (colors, hobbies) parse correctly
- [ ] Birthday and anniversary format correctly
- [ ] Profile completion percentage calculates

### Wishlist
- [ ] User can add wishlist item
- [ ] User can edit own wishlist item
- [ ] User can delete own wishlist item
- [ ] Other family members can view wishlist
- [ ] Other members can claim item
- [ ] Claimed item shows who claimed it
- [ ] User cannot see who claimed their own items
- [ ] Item can be marked as purchased
- [ ] Filters work correctly

### Gift Groups
- [ ] User can create gift group
- [ ] User can add members to group
- [ ] Members can see group details
- [ ] Members can post messages
- [ ] Message history displays correctly
- [ ] Unread count updates
- [ ] User can contribute amount
- [ ] Contribution totals calculate correctly
- [ ] User can mark contribution as paid

### Dashboard
- [ ] Shows correct families
- [ ] Shows wishlist preview
- [ ] Shows gift groups
- [ ] Unread counts display
- [ ] Empty states show correctly
- [ ] Links navigate properly

### Security
- [ ] CSRF tokens on all forms
- [ ] SQL injection protection
- [ ] XSS protection in templates
- [ ] Session security
- [ ] Password hashing works
- [ ] Email verification required

---

## Troubleshooting

### Common Issues

#### Database Connection Errors
**Problem:** `psycopg2.OperationalError: could not connect`
**Solution:**
- Verify DATABASE_URL is correct
- Check Supabase project is active
- Ensure IP is allowlisted in Supabase (or use connection pooler)
- Use DIRECT_URL for migrations, DATABASE_URL for app

#### Template Not Found
**Problem:** `jinja2.exceptions.TemplateNotFound`
**Solution:**
- Verify template path matches blueprint template_folder
- Check template file extension is .html
- Ensure templates/ folder is in correct location

#### Static Files Not Loading
**Problem:** CSS/JS files return 404
**Solution:**
- Verify static/ folder structure
- Check url_for('static', filename='..') syntax
- Ensure vercel.json routes static files correctly

#### CSRF Token Errors
**Problem:** `The CSRF token is missing`
**Solution:**
- Add `{{ csrf_token() }}` in all forms
- Verify WTF_CSRF_ENABLED = True in config
- Check SECRET_KEY is set

#### Session Not Persisting
**Problem:** User logged out after refresh
**Solution:**
- Verify SECRET_KEY is consistent
- Check Flask-Login configuration
- Ensure cookies are enabled in browser
- Verify session cookie settings

---

## References

### Documentation
- [Flask Documentation](https://flask.palletsprojects.com/)
- [Jinja2 Template Designer Documentation](https://jinja.palletsprojects.com/)
- [SQLAlchemy 2.0 Documentation](https://docs.sqlalchemy.org/)
- [Flask-Login Documentation](https://flask-login.readthedocs.io/)
- [Vercel Python Runtime](https://vercel.com/docs/functions/runtimes/python)
- [Supabase Documentation](https://supabase.com/docs)

### Design Resources
- [Glassmorphism UI](https://ui.glass/)
- [CSS Backdrop Filter](https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter)
- [CSS Gradients](https://cssgradient.io/)

### Code Examples
- Original Next.js codebase (reference in same repo)
- Prisma schema: `/prisma/schema.prisma`
- Current API routes: `/app/api/**/*.ts`

---

## Change Log

### October 12, 2025
- Created migration branch `tech-stack-migration`
- Created comprehensive MIGRATION_GUIDE.md
- Documented all features and database schema
- Defined glassmorphic design system
- Outlined complete architecture

---

**Next Steps:**
1. Set up Python virtual environment
2. Install Flask and dependencies
3. Create Flask app structure
4. Begin SQLAlchemy model conversion

**Questions or Issues?**
Document them here as they arise during development.
