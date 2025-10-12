"""
Profile management routes
"""
from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_required, current_user

from models import db, Profile
from utils.helpers import generate_cuid
from utils.decorators import family_member_required

profile_bp = Blueprint('profile', __name__, url_prefix='/profile')


@profile_bp.route('/<family_id>')
@login_required
@family_member_required
def view(family_id):
    """View own profile in family context"""
    profile = Profile.query.filter_by(
        userId=current_user.id,
        familyId=family_id
    ).first()

    return render_template('profile/view.html', profile=profile, family_id=family_id)


@profile_bp.route('/<family_id>/edit', methods=['GET', 'POST'])
@login_required
@family_member_required
def edit(family_id):
    """Edit profile"""
    profile = Profile.query.filter_by(
        userId=current_user.id,
        familyId=family_id
    ).first()

    if not profile:
        # Create new profile
        profile = Profile(
            id=generate_cuid(),
            userId=current_user.id,
            familyId=family_id
        )
        db.session.add(profile)

    if request.method == 'POST':
        # Update profile fields
        profile.shoeSize = request.form.get('shoeSize') or None
        profile.pantSize = request.form.get('pantSize') or None
        profile.shirtSize = request.form.get('shirtSize') or None
        # ... (add all other fields)

        try:
            db.session.commit()
            flash('Profile updated successfully!', 'success')
            return redirect(url_for('profile.view', family_id=family_id))
        except Exception as e:
            db.session.rollback()
            flash('Error updating profile', 'error')
            print(f'Profile update error: {e}')

    return render_template('profile/edit.html', profile=profile, family_id=family_id)
