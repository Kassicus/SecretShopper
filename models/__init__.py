"""
SQLAlchemy models initialization
"""
from flask_sqlalchemy import SQLAlchemy

# Initialize SQLAlchemy
db = SQLAlchemy()

# Import models
from .user import User, Account, VerificationToken
from .family import Family, FamilyMember, Role
from .profile import Profile
from .wishlist import WishlistItem, Priority
from .gift_group import GiftGroup, GiftGroupMember
from .message import Message

__all__ = [
    'db',
    'User', 'Account', 'VerificationToken',
    'Family', 'FamilyMember', 'Role',
    'Profile',
    'WishlistItem', 'Priority',
    'GiftGroup', 'GiftGroupMember',
    'Message'
]
