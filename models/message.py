"""
Message model for gift group chat
"""
from datetime import datetime
from models import db


class Message(db.Model):
    """Message model for group chat"""
    __tablename__ = 'Message'

    id = db.Column(db.String(25), primary_key=True)
    giftGroupId = db.Column(db.String(25), db.ForeignKey('GiftGroup.id', ondelete='CASCADE'), nullable=False)
    userId = db.Column(db.String(25), db.ForeignKey('User.id', ondelete='CASCADE'), nullable=False)

    content = db.Column(db.Text, nullable=False)
    attachmentUrl = db.Column(db.String(500), nullable=True)
    isEdited = db.Column(db.Boolean, nullable=False, default=False)

    createdAt = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updatedAt = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    giftGroup = db.relationship('GiftGroup', back_populates='messages')
    user = db.relationship('User', back_populates='messages')

    def edit_content(self, new_content):
        """Edit message content"""
        self.content = new_content
        self.isEdited = True
        self.updatedAt = datetime.utcnow()

    def __repr__(self):
        return f'<Message {self.id} in {self.giftGroupId}>'
