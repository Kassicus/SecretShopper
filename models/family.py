"""
Family and FamilyMember models
"""
from datetime import datetime
from models import db
import enum


class Role(enum.Enum):
    """Family member roles"""
    ADMIN = "ADMIN"
    MEMBER = "MEMBER"


class Family(db.Model):
    """Family group model"""
    __tablename__ = 'Family'

    id = db.Column(db.String(25), primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    inviteCode = db.Column(db.String(50), unique=True, nullable=False, index=True)
    createdBy = db.Column(db.String(25), db.ForeignKey('User.id'), nullable=False)
    createdAt = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updatedAt = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    creator = db.relationship('User', back_populates='createdFamilies')
    members = db.relationship('FamilyMember', back_populates='family', cascade='all, delete-orphan')
    profiles = db.relationship('Profile', back_populates='family', cascade='all, delete-orphan')
    wishlistItems = db.relationship('WishlistItem', back_populates='family', cascade='all, delete-orphan')
    giftGroups = db.relationship('GiftGroup', back_populates='family', cascade='all, delete-orphan')

    def __repr__(self):
        return f'<Family {self.name}>'


class FamilyMember(db.Model):
    """Junction table for family membership"""
    __tablename__ = 'FamilyMember'

    id = db.Column(db.String(25), primary_key=True)
    familyId = db.Column(db.String(25), db.ForeignKey('Family.id', ondelete='CASCADE'), nullable=False)
    userId = db.Column(db.String(25), db.ForeignKey('User.id', ondelete='CASCADE'), nullable=False)
    role = db.Column(db.Enum(Role), nullable=False, default=Role.MEMBER)
    joinedAt = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    # Relationships
    family = db.relationship('Family', back_populates='members')
    user = db.relationship('User', back_populates='familyMembers')

    __table_args__ = (
        db.UniqueConstraint('familyId', 'userId', name='_family_user_uc'),
    )

    def is_admin(self):
        """Check if member is admin"""
        return self.role == Role.ADMIN

    def __repr__(self):
        return f'<FamilyMember {self.userId} in {self.familyId}>'
