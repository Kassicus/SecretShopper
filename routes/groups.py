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
    return render_template('groups/detail.html', group=group)


@groups_bp.route('/create', methods=['GET', 'POST'])
@login_required
def create():
    """Create a new gift group"""
    if request.method == 'POST':
        # TODO: Implement group creation
        flash('Gift group created!', 'success')
        return redirect(url_for('groups.index'))

    return render_template('groups/create.html')
