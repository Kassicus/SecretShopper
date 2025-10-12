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
        title = request.form.get('title', '').strip()
        description = request.form.get('description', '').strip()
        url = request.form.get('url', '').strip()
        price = request.form.get('price', '').strip()
        priority = request.form.get('priority', 'MEDIUM')

        if not title:
            flash('Title is required', 'error')
            return render_template('wishlist/add.html')

        try:
            item = WishlistItem(
                id=generate_cuid(),
                userId=current_user.id,
                title=title,
                description=description if description else None,
                url=url if url else None,
                price=float(price) if price else None,
                priority=Priority[priority]
            )
            db.session.add(item)
            db.session.commit()
            flash('Wishlist item added!', 'success')
            return redirect(url_for('wishlist.index'))

        except Exception as e:
            db.session.rollback()
            flash('Error adding wishlist item', 'error')
            print(f'Wishlist add error: {e}')

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
        title = request.form.get('title', '').strip()
        description = request.form.get('description', '').strip()
        url = request.form.get('url', '').strip()
        price = request.form.get('price', '').strip()
        priority = request.form.get('priority', 'MEDIUM')

        if not title:
            flash('Title is required', 'error')
            return render_template('wishlist/edit.html', item=item)

        try:
            item.title = title
            item.description = description if description else None
            item.url = url if url else None
            item.price = float(price) if price else None
            item.priority = Priority[priority]
            db.session.commit()
            flash('Wishlist item updated!', 'success')
            return redirect(url_for('wishlist.index'))

        except Exception as e:
            db.session.rollback()
            flash('Error updating wishlist item', 'error')
            print(f'Wishlist edit error: {e}')

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


@wishlist_bp.route('/<item_id>/unclaim', methods=['POST'])
@login_required
def unclaim(item_id):
    """Unclaim a wishlist item"""
    item = WishlistItem.query.get_or_404(item_id)

    if item.claimedBy != current_user.id:
        flash('You can only unclaim items you have claimed', 'error')
        return redirect(request.referrer or url_for('wishlist.index'))

    item.unclaim()
    db.session.commit()

    flash('Item unclaimed', 'success')
    return redirect(request.referrer or url_for('wishlist.index'))


@wishlist_bp.route('/<item_id>/delete', methods=['POST'])
@login_required
def delete(item_id):
    """Delete wishlist item"""
    item = WishlistItem.query.get_or_404(item_id)

    if item.userId != current_user.id:
        flash('You can only delete your own wishlist items', 'error')
        return redirect(url_for('wishlist.index'))

    try:
        db.session.delete(item)
        db.session.commit()
        flash('Wishlist item deleted', 'success')
    except Exception as e:
        db.session.rollback()
        flash('Error deleting wishlist item', 'error')
        print(f'Wishlist delete error: {e}')

    return redirect(url_for('wishlist.index'))


@wishlist_bp.route('/user/<user_id>')
@login_required
def list(user_id=None):
    """View wishlist for a specific user"""
    from models.user import User

    if user_id:
        view_user = User.query.get_or_404(user_id)
        items = WishlistItem.query.filter_by(userId=user_id).all()
        return render_template('wishlist/list.html', items=items, view_user=view_user)
    else:
        return redirect(url_for('wishlist.index'))
