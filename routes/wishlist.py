"""
Wishlist routes
"""
from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_required, current_user

from models import db, WishlistItem, Priority
from utils.helpers import generate_cuid
from utils.decorators import family_member_required

wishlist_bp = Blueprint('wishlist', __name__, url_prefix='/wishlist')


@wishlist_bp.route('/')
@login_required
def index():
    """View own wishlist across all families"""
    items = WishlistItem.query.filter_by(userId=current_user.id).all()
    return render_template('wishlist/list.html', items=items)


@wishlist_bp.route('/add', methods=['GET', 'POST'])
@login_required
def add():
    """Add wishlist item"""
    if request.method == 'POST':
        # TODO: Implement item creation
        flash('Wishlist item added!', 'success')
        return redirect(url_for('wishlist.index'))

    return render_template('wishlist/add.html')


@wishlist_bp.route('/<item_id>/edit', methods=['GET', 'POST'])
@login_required
def edit(item_id):
    """Edit wishlist item"""
    item = WishlistItem.query.get_or_404(item_id)

    # Verify ownership
    if item.userId != current_user.id:
        flash('You can only edit your own wishlist items', 'error')
        return redirect(url_for('wishlist.index'))

    if request.method == 'POST':
        # TODO: Update item
        flash('Wishlist item updated!', 'success')
        return redirect(url_for('wishlist.index'))

    return render_template('wishlist/edit.html', item=item)


@wishlist_bp.route('/<item_id>/claim', methods=['POST'])
@login_required
def claim(item_id):
    """Claim a wishlist item"""
    item = WishlistItem.query.get_or_404(item_id)

    if item.userId == current_user.id:
        flash('You cannot claim your own wishlist items', 'error')
        return redirect(request.referrer or url_for('wishlist.index'))

    if item.is_claimed():
        flash('This item is already claimed', 'error')
        return redirect(request.referrer or url_for('wishlist.index'))

    item.claim(current_user.id)
    db.session.commit()

    flash('Item claimed successfully!', 'success')
    return redirect(request.referrer or url_for('wishlist.index'))
