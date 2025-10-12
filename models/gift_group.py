"""
GiftGroup and GiftGroupMember models
"""
from datetime import datetime
from models import db
from decimal import Decimal


class GiftGroup(db.Model):
    """Gift group for pooling funds"""
    __tablename__ = 'GiftGroup'

    id = db.Column(db.String(25), primary_key=True)
    familyId = db.Column(db.String(25), db.ForeignKey('Family.id', ondelete='CASCADE'), nullable=False)

    # Group details
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    occasion = db.Column(db.String(100), nullable=True)
    occasionDate = db.Column(db.DateTime, nullable=True)
    targetUserId = db.Column(db.String(25), nullable=True)

    # Financial tracking
    targetAmount = db.Column(db.Numeric(10, 2), nullable=True)
    currentAmount = db.Column(db.Numeric(10, 2), nullable=False, default=Decimal('0.00'))

    isActive = db.Column(db.Boolean, nullable=False, default=True)
    createdBy = db.Column(db.String(25), db.ForeignKey('User.id'), nullable=False)
    createdAt = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updatedAt = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    family = db.relationship('Family', back_populates='giftGroups')
    creator = db.relationship('User', back_populates='createdGroups')
    members = db.relationship('GiftGroupMember', back_populates='giftGroup', cascade='all, delete-orphan')
    messages = db.relationship('Message', back_populates='giftGroup', cascade='all, delete-orphan')

    def calculate_progress_percentage(self):
        """Calculate progress towards target amount"""
        if not self.targetAmount or self.targetAmount == 0:
            return 0
        return int((float(self.currentAmount) / float(self.targetAmount)) * 100)

    def add_contribution(self, amount):
        """Add contribution to current amount"""
        self.currentAmount += Decimal(str(amount))
        self.updatedAt = datetime.utcnow()

    def __repr__(self):
        return f'<GiftGroup {self.name}>'


class GiftGroupMember(db.Model):
    """Junction table for gift group membership"""
    __tablename__ = 'GiftGroupMember'

    id = db.Column(db.String(25), primary_key=True)
    giftGroupId = db.Column(db.String(25), db.ForeignKey('GiftGroup.id', ondelete='CASCADE'), nullable=False)
    userId = db.Column(db.String(25), db.ForeignKey('User.id', ondelete='CASCADE'), nullable=False)

    contributionAmount = db.Column(db.Numeric(10, 2), nullable=True)
    hasPaid = db.Column(db.Boolean, nullable=False, default=False)
    lastReadAt = db.Column(db.DateTime, nullable=True)
    joinedAt = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    # Relationships
    giftGroup = db.relationship('GiftGroup', back_populates='members')
    user = db.relationship('User', back_populates='groupMembers')

    __table_args__ = (
        db.UniqueConstraint('giftGroupId', 'userId', name='_giftGroup_user_uc'),
    )

    def mark_read(self):
        """Update last read timestamp"""
        self.lastReadAt = datetime.utcnow()

    def __repr__(self):
        return f'<GiftGroupMember {self.userId} in {self.giftGroupId}>'
