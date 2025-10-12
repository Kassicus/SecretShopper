"""
Gift group routes
"""
from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_required, current_user

from models import db, GiftGroup, GiftGroupMember
from utils.helpers import generate_cuid
from utils.decorators import group_member_required

groups_bp = Blueprint('groups', __name__, url_prefix='/groups')


@groups_bp.route('/')
@login_required
def index():
    """List all gift groups user is a member of"""
    groups = GiftGroup.query.join(GiftGroupMember).filter(
        GiftGroupMember.userId == current_user.id
    ).all()
    return render_template('groups/list.html', groups=groups)


@groups_bp.route('/<group_id>')
@login_required
@group_member_required
def detail(group_id):
    """View gift group details and chat"""
    group = GiftGroup.query.get_or_404(group_id)
    is_creator = group.createdBy == current_user.id
    assignments_made = any(member.assignedTo is not None for member in group.members)

    return render_template('groups/detail.html', group=group, is_creator=is_creator, assignments_made=assignments_made)


@groups_bp.route('/create', methods=['GET', 'POST'])
@login_required
def create():
    """Create a new gift group"""
    from models.family import Family, FamilyMember
    from datetime import datetime

    # Get user's families for the form
    families = Family.query.join(FamilyMember).filter(
        FamilyMember.userId == current_user.id
    ).all()

    if request.method == 'POST':
        name = request.form.get('name', '').strip()
        description = request.form.get('description', '').strip()
        family_id = request.form.get('family_id', '').strip()
        budget = request.form.get('budget', '').strip()
        reveal_date = request.form.get('reveal_date', '').strip()

        if not name:
            flash('Group name is required', 'error')
            return render_template('groups/create.html', families=families)

        if not family_id:
            flash('Please select a family', 'error')
            return render_template('groups/create.html', families=families)

        try:
            group = GiftGroup(
                id=generate_cuid(),
                name=name,
                description=description if description else None,
                familyId=family_id,
                createdBy=current_user.id,
                budget=float(budget) if budget else None,
                revealDate=datetime.strptime(reveal_date, '%Y-%m-%d') if reveal_date else None
            )
            db.session.add(group)

            # Add creator as member
            member = GiftGroupMember(
                id=generate_cuid(),
                groupId=group.id,
                userId=current_user.id
            )
            db.session.add(member)
            db.session.commit()

            flash('Gift group created!', 'success')
            return redirect(url_for('groups.detail', group_id=group.id))

        except Exception as e:
            db.session.rollback()
            flash('Error creating gift group', 'error')
            print(f'Group creation error: {e}')

    return render_template('groups/create.html', families=families)
