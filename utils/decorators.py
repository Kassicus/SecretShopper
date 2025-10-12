"""
Custom decorators for route protection and utilities
"""
from functools import wraps
from flask import redirect, url_for, flash, abort
from flask_login import current_user


def login_required(f):
    """
    Decorator to require login for routes
    (Flask-Login provides this, but we can customize it)
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated:
            flash('Please log in to access this page.', 'warning')
            return redirect(url_for('auth.login'))
        return f(*args, **kwargs)
    return decorated_function


def family_member_required(f):
    """
    Decorator to ensure user is a member of the family being accessed
    Expects 'family_id' in route parameters
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated:
            flash('Please log in to access this page.', 'warning')
            return redirect(url_for('auth.login'))

        family_id = kwargs.get('family_id') or kwargs.get('familyId')
        if not family_id:
            abort(400, 'Family ID is required')

        from models import FamilyMember
        membership = FamilyMember.query.filter_by(
            familyId=family_id,
            userId=current_user.id
        ).first()

        if not membership:
            flash('You do not have access to this family.', 'error')
            abort(403)

        return f(*args, **kwargs)
    return decorated_function


def family_admin_required(f):
    """
    Decorator to ensure user is an admin of the family being accessed
    Expects 'family_id' in route parameters
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated:
            flash('Please log in to access this page.', 'warning')
            return redirect(url_for('auth.login'))

        family_id = kwargs.get('family_id') or kwargs.get('familyId')
        if not family_id:
            abort(400, 'Family ID is required')

        from models import FamilyMember, Role
        membership = FamilyMember.query.filter_by(
            familyId=family_id,
            userId=current_user.id
        ).first()

        if not membership or membership.role != Role.ADMIN:
            flash('You must be a family admin to perform this action.', 'error')
            abort(403)

        return f(*args, **kwargs)
    return decorated_function


def group_member_required(f):
    """
    Decorator to ensure user is a member of the gift group being accessed
    Expects 'group_id' in route parameters
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated:
            flash('Please log in to access this page.', 'warning')
            return redirect(url_for('auth.login'))

        group_id = kwargs.get('group_id') or kwargs.get('groupId')
        if not group_id:
            abort(400, 'Group ID is required')

        from models import GiftGroupMember
        membership = GiftGroupMember.query.filter_by(
            giftGroupId=group_id,
            userId=current_user.id
        ).first()

        if not membership:
            flash('You do not have access to this gift group.', 'error')
            abort(403)

        return f(*args, **kwargs)
    return decorated_function
