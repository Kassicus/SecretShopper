"""
WishlistItem model
"""
from datetime import datetime
from models import db
from decimal import Decimal
import enum


class Priority(enum.Enum):
    """Wishlist item priority levels"""
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class WishlistItem(db.Model):
    """Wishlist item model"""
    __tablename__ = 'WishlistItem'

    id = db.Column(db.String(25), primary_key=True)
    userId = db.Column(db.String(25), db.ForeignKey('User.id', ondelete='CASCADE'), nullable=False)
    familyId = db.Column(db.String(25), db.ForeignKey('Family.id', ondelete='CASCADE'), nullable=False)

    # Item details
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    url = db.Column(db.String(500), nullable=True)
    price = db.Column(db.Numeric(10, 2), nullable=True)
    imageUrl = db.Column(db.String(500), nullable=True)
    priority = db.Column(db.Enum(Priority), nullable=False, default=Priority.MEDIUM)
    category = db.Column(db.String(100), nullable=True)

    # Claiming and purchase tracking
    claimedBy = db.Column(db.String(25), db.ForeignKey('User.id'), nullable=True)
    claimedAt = db.Column(db.DateTime, nullable=True)
    purchased = db.Column(db.Boolean, nullable=False, default=False)

    createdAt = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updatedAt = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = db.relationship('User', foreign_keys=[userId], back_populates='wishlistItems')
    family = db.relationship('Family', back_populates='wishlistItems')
    claimer = db.relationship('User', foreign_keys=[claimedBy], back_populates='claimedItems')

    def is_claimed(self):
        """Check if item is claimed"""
        return self.claimedBy is not None

    def claim(self, user_id):
        """Claim this item"""
        self.claimedBy = user_id
        self.claimedAt = datetime.utcnow()

    def unclaim(self):
        """Unclaim this item"""
        self.claimedBy = None
        self.claimedAt = None

    def mark_purchased(self):
        """Mark item as purchased"""
        self.purchased = True

    def __repr__(self):
        return f'<WishlistItem {self.title}>'
