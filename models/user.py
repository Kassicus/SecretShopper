"""
User, Account, and VerificationToken models
"""
from datetime import datetime
from flask_login import UserMixin
from models import db
import bcrypt


class User(UserMixin, db.Model):
    """User model for authentication and profile management"""
    __tablename__ = 'User'

    id = db.Column(db.String(25), primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    emailVerified = db.Column(db.DateTime, nullable=True)
    name = db.Column(db.String(255), nullable=True)
    image = db.Column(db.String(500), nullable=True)
    password = db.Column(db.String(255), nullable=False)
    totpSecret = db.Column(db.String(255), nullable=True)
    createdAt = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updatedAt = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    accounts = db.relationship('Account', back_populates='user', cascade='all, delete-orphan')
    familyMembers = db.relationship('FamilyMember', back_populates='user', cascade='all, delete-orphan')
    profiles = db.relationship('Profile', back_populates='user', cascade='all, delete-orphan')
    wishlistItems = db.relationship('WishlistItem', foreign_keys='WishlistItem.userId', back_populates='user', cascade='all, delete-orphan')
    createdFamilies = db.relationship('Family', back_populates='creator', cascade='all, delete-orphan')
    claimedItems = db.relationship('WishlistItem', foreign_keys='WishlistItem.claimedBy', back_populates='claimer')
    createdGroups = db.relationship('GiftGroup', back_populates='creator', cascade='all, delete-orphan')
    groupMembers = db.relationship('GiftGroupMember', back_populates='user', cascade='all, delete-orphan')
    messages = db.relationship('Message', back_populates='user', cascade='all, delete-orphan')

    def set_password(self, password):
        """Hash and set password"""
        salt = bcrypt.gensalt()
        self.password = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

    def check_password(self, password):
        """Verify password against hash"""
        return bcrypt.checkpw(password.encode('utf-8'), self.password.encode('utf-8'))

    def __repr__(self):
        return f'<User {self.email}>'


class Account(db.Model):
    """OAuth account model for future OAuth providers"""
    __tablename__ = 'Account'

    id = db.Column(db.String(25), primary_key=True)
    userId = db.Column(db.String(25), db.ForeignKey('User.id', ondelete='CASCADE'), nullable=False)
    type = db.Column(db.String(50), nullable=False)
    provider = db.Column(db.String(50), nullable=False)
    providerAccountId = db.Column(db.String(255), nullable=False)
    refresh_token = db.Column(db.Text, nullable=True)
    access_token = db.Column(db.Text, nullable=True)
    expires_at = db.Column(db.Integer, nullable=True)
    token_type = db.Column(db.String(50), nullable=True)
    scope = db.Column(db.String(255), nullable=True)
    id_token = db.Column(db.Text, nullable=True)
    session_state = db.Column(db.String(255), nullable=True)

    # Relationships
    user = db.relationship('User', back_populates='accounts')

    __table_args__ = (
        db.UniqueConstraint('provider', 'providerAccountId', name='_provider_providerAccountId_uc'),
    )

    def __repr__(self):
        return f'<Account {self.provider}:{self.providerAccountId}>'


class VerificationToken(db.Model):
    """Email verification token model"""
    __tablename__ = 'VerificationToken'

    identifier = db.Column(db.String(255), primary_key=True)
    token = db.Column(db.String(255), unique=True, nullable=False, index=True)
    expires = db.Column(db.DateTime, nullable=False)

    __table_args__ = (
        db.UniqueConstraint('identifier', 'token', name='_identifier_token_uc'),
    )

    def is_expired(self):
        """Check if token is expired"""
        return datetime.utcnow() > self.expires

    def __repr__(self):
        return f'<VerificationToken {self.identifier}>'
