"""
Authentication routes: register, login, logout, verification
"""
from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_user, logout_user, current_user
from flask_wtf.csrf import CSRFProtect
from werkzeug.security import generate_password_hash
from datetime import datetime

from models import db, User, VerificationToken
from utils.helpers import generate_cuid, generate_verification_token, create_verification_token_expiry
from utils.email import send_verification_email, send_welcome_email

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

# Note: CSRF protection is handled globally via CSRFProtect in app.py


@auth_bp.route('/register', methods=['GET', 'POST'])
def register():
    """User registration"""
    if current_user.is_authenticated:
        return redirect(url_for('dashboard.index'))

    if request.method == 'POST':
        name = request.form.get('name', '').strip()
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')
        confirm_password = request.form.get('confirm_password', '')

        # Validation
        errors = []

        if not email:
            errors.append('Email is required')
        elif '@' not in email:
            errors.append('Invalid email address')

        if not password:
            errors.append('Password is required')
        elif len(password) < 8:
            errors.append('Password must be at least 8 characters')

        if password != confirm_password:
            errors.append('Passwords do not match')

        # Check if user already exists
        if User.query.filter_by(email=email).first():
            errors.append('An account with this email already exists')

        if errors:
            for error in errors:
                flash(error, 'error')
            return render_template('auth/register.html', name=name, email=email)

        # Create new user
        try:
            user = User(
                id=generate_cuid(),
                email=email,
                name=name or None,
                emailVerified=None
            )
            user.set_password(password)

            db.session.add(user)
            db.session.commit()

            # Create verification token
            token = generate_verification_token()
            verification = VerificationToken(
                identifier=user.email,
                token=token,
                expires=create_verification_token_expiry()
            )
            db.session.add(verification)
            db.session.commit()

            # Send verification email
            send_verification_email(user, token)

            flash('Account created! Please check your email to verify your account.', 'success')
            return redirect(url_for('auth.login'))

        except Exception as e:
            db.session.rollback()
            flash('An error occurred during registration. Please try again.', 'error')
            print(f'Registration error: {e}')
            return render_template('auth/register.html', name=name, email=email)

    return render_template('auth/register.html')


@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    """User login"""
    if current_user.is_authenticated:
        return redirect(url_for('dashboard.index'))

    if request.method == 'POST':
        print(f"Login attempt - Form data: {request.form}")
        print(f"CSRF token in form: {request.form.get('csrf_token')}")

        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')
        remember = request.form.get('remember', False) == 'on'

        if not email or not password:
            flash('Email and password are required', 'error')
            return render_template('auth/login.html', email=email)

        # Find user
        user = User.query.filter_by(email=email).first()

        print(f"User found: {user is not None}")
        if user:
            print(f"User ID: {user.id}, Email: {user.email}")
            print(f"Password check result: {user.check_password(password)}")

        if not user:
            flash('Invalid email or password', 'error')
            return render_template('auth/login.html', email=email)

        if not user.check_password(password):
            flash('Invalid email or password', 'error')
            return render_template('auth/login.html', email=email)

        # Check if email is verified (optional - can allow unverified users)
        # if not user.emailVerified:
        #     flash('Please verify your email before logging in', 'warning')
        #     return render_template('auth/login.html', email=email)

        # Log user in
        login_user(user, remember=remember)
        flash(f'Welcome back, {user.name or user.email}!', 'success')

        # Redirect to next page or dashboard
        next_page = request.args.get('next')
        if next_page and next_page.startswith('/'):
            return redirect(next_page)
        return redirect(url_for('dashboard.index'))

    return render_template('auth/login.html')


@auth_bp.route('/logout')
def logout():
    """User logout"""
    logout_user()
    flash('You have been logged out', 'info')
    return redirect(url_for('index'))


@auth_bp.route('/verify')
def verify():
    """Email verification"""
    token = request.args.get('token')

    if not token:
        flash('Invalid verification link', 'error')
        return redirect(url_for('auth.login'))

    # Find verification token
    verification = VerificationToken.query.filter_by(token=token).first()

    if not verification:
        flash('Invalid or expired verification link', 'error')
        return redirect(url_for('auth.login'))

    if verification.is_expired():
        flash('This verification link has expired', 'error')
        db.session.delete(verification)
        db.session.commit()
        return redirect(url_for('auth.login'))

    # Find user and mark as verified
    user = User.query.filter_by(email=verification.identifier).first()

    if not user:
        flash('User not found', 'error')
        return redirect(url_for('auth.login'))

    if user.emailVerified:
        flash('Your email is already verified', 'info')
        return redirect(url_for('auth.login'))

    # Verify user
    user.emailVerified = datetime.utcnow()
    db.session.delete(verification)
    db.session.commit()

    # Send welcome email
    send_welcome_email(user)

    flash('Email verified successfully! You can now log in.', 'success')
    return redirect(url_for('auth.login'))


@auth_bp.route('/resend-verification', methods=['POST'])
def resend_verification():
    """Resend verification email"""
    email = request.form.get('email', '').strip().lower()

    if not email:
        flash('Email is required', 'error')
        return redirect(url_for('auth.login'))

    user = User.query.filter_by(email=email).first()

    if not user:
        # Don't reveal if user exists
        flash('If an account exists, a verification email has been sent', 'info')
        return redirect(url_for('auth.login'))

    if user.emailVerified:
        flash('Your email is already verified', 'info')
        return redirect(url_for('auth.login'))

    # Delete old tokens
    VerificationToken.query.filter_by(identifier=email).delete()

    # Create new token
    token = generate_verification_token()
    verification = VerificationToken(
        identifier=user.email,
        token=token,
        expires=create_verification_token_expiry()
    )
    db.session.add(verification)
    db.session.commit()

    # Send email
    send_verification_email(user, token)

    flash('Verification email sent! Please check your inbox.', 'success')
    return redirect(url_for('auth.login'))
