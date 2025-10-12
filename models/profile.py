"""
Profile model for user preferences and information
"""
from datetime import datetime
from models import db
from sqlalchemy.dialects.postgresql import JSON


class Profile(db.Model):
    """Profile model storing user preferences per family"""
    __tablename__ = 'Profile'

    id = db.Column(db.String(25), primary_key=True)
    userId = db.Column(db.String(25), db.ForeignKey('User.id', ondelete='CASCADE'), nullable=False)
    familyId = db.Column(db.String(25), db.ForeignKey('Family.id', ondelete='CASCADE'), nullable=False)

    # Clothing sizes
    shoeSize = db.Column(db.String(50), nullable=True)
    pantSize = db.Column(db.String(50), nullable=True)
    shirtSize = db.Column(db.String(50), nullable=True)
    dressSize = db.Column(db.String(50), nullable=True)
    ringSize = db.Column(db.String(50), nullable=True)

    # Preferences (stored as JSON arrays)
    favoriteColors = db.Column(JSON, nullable=True)

    # Vehicle information
    vehicleMake = db.Column(db.String(100), nullable=True)
    vehicleModel = db.Column(db.String(100), nullable=True)
    vehicleYear = db.Column(db.Integer, nullable=True)

    # Interests (stored as JSON arrays)
    hobbies = db.Column(JSON, nullable=True)
    interests = db.Column(JSON, nullable=True)

    # Dietary/health information
    allergies = db.Column(db.String(500), nullable=True)
    dietaryRestrictions = db.Column(db.String(500), nullable=True)

    # Additional notes
    notes = db.Column(db.Text, nullable=True)

    # Important dates
    birthday = db.Column(db.DateTime, nullable=True)
    anniversary = db.Column(db.DateTime, nullable=True)

    updatedAt = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = db.relationship('User', back_populates='profiles')
    family = db.relationship('Family', back_populates='profiles')

    __table_args__ = (
        db.UniqueConstraint('userId', 'familyId', name='_user_family_uc'),
    )

    def calculate_completion_percentage(self):
        """Calculate profile completion percentage"""
        fields = [
            self.shoeSize, self.pantSize, self.shirtSize, self.dressSize, self.ringSize,
            self.favoriteColors, self.vehicleMake, self.vehicleModel, self.vehicleYear,
            self.hobbies, self.interests, self.allergies, self.dietaryRestrictions,
            self.notes, self.birthday, self.anniversary
        ]
        filled = sum(1 for field in fields if field)
        total = len(fields)
        return int((filled / total) * 100)

    def __repr__(self):
        return f'<Profile {self.userId} in {self.familyId}>'
