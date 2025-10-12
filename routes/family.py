"""
Family management routes
"""
from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_required, current_user

from models import db, Family, FamilyMember, Role
from utils.helpers import generate_cuid, generate_invite_code
from utils.decorators import family_member_required, family_admin_required

family_bp = Blueprint('family', __name__, url_prefix='/family')


@family_bp.route('/')
@login_required
def index():
    """List all families user is a member of"""
    families = Family.query.join(FamilyMember).filter(
        FamilyMember.userId == current_user.id
    ).all()
    return render_template('family/list.html', families=families)


@family_bp.route('/create', methods=['GET', 'POST'])
@login_required
def create():
    """Create a new family"""
    if request.method == 'POST':
        name = request.form.get('name', '').strip()

        if not name:
            flash('Family name is required', 'error')
            return render_template('family/create.html')

        try:
            # Create family
            family = Family(
                id=generate_cuid(),
                name=name,
                inviteCode=generate_invite_code(),
                createdBy=current_user.id
            )
            db.session.add(family)

            # Add creator as admin member
            member = FamilyMember(
                id=generate_cuid(),
                familyId=family.id,
                userId=current_user.id,
                role=Role.ADMIN
            )
            db.session.add(member)
            db.session.commit()

            flash(f'Family "{name}" created successfully!', 'success')
            return redirect(url_for('family.detail', family_id=family.id))

        except Exception as e:
            db.session.rollback()
            flash('Error creating family', 'error')
            print(f'Family creation error: {e}')

    return render_template('family/create.html')


@family_bp.route('/<family_id>')
@login_required
@family_member_required
def detail(family_id):
    """View family details"""
    family = Family.query.get_or_404(family_id)
    members = FamilyMember.query.filter_by(familyId=family_id).all()

    # Check if current user is admin
    current_member = FamilyMember.query.filter_by(
        familyId=family_id,
        userId=current_user.id
    ).first()
    is_admin = current_member and current_member.role == Role.ADMIN

    return render_template('family/detail.html', family=family, members=members, is_admin=is_admin)


@family_bp.route('/join', methods=['GET', 'POST'])
@login_required
def join():
    """Join family with invite code"""
    if request.method == 'POST':
        invite_code = request.form.get('invite_code', '').strip().upper()

        if not invite_code:
            flash('Invite code is required', 'error')
            return render_template('family/join.html')

        family = Family.query.filter_by(inviteCode=invite_code).first()

        if not family:
            flash('Invalid invite code', 'error')
            return render_template('family/join.html')

        # Check if already a member
        existing = FamilyMember.query.filter_by(
            familyId=family.id,
            userId=current_user.id
        ).first()

        if existing:
            flash('You are already a member of this family', 'info')
            return redirect(url_for('family.detail', family_id=family.id))

        # Add as member
        try:
            member = FamilyMember(
                id=generate_cuid(),
                familyId=family.id,
                userId=current_user.id,
                role=Role.MEMBER
            )
            db.session.add(member)
            db.session.commit()

            flash(f'Successfully joined "{family.name}"!', 'success')
            return redirect(url_for('family.detail', family_id=family.id))

        except Exception as e:
            db.session.rollback()
            flash('Error joining family', 'error')
            print(f'Family join error: {e}')

    return render_template('family/join.html')
