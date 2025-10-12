"""
Email utilities for sending verification and notification emails
Supports: Resend (primary), SMTP (fallback), Flask-Mail (fallback)
"""
from flask import current_app, render_template
from flask_mail import Mail, Message as MailMessage
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

mail = Mail()


def init_mail(app):
    """Initialize Flask-Mail with app"""
    mail.init_app(app)


def send_email(to, subject, html_body, text_body=None):
    """
    Send email using Resend (primary) or SMTP (fallback)

    Args:
        to: Recipient email address
        subject: Email subject
        html_body: HTML content
        text_body: Plain text content (optional)
    """
    # Try Resend first if API key is configured
    resend_api_key = os.getenv('RESEND_API_KEY') or current_app.config.get('RESEND_API_KEY')

    if resend_api_key:
        try:
            return send_email_resend(to, subject, html_body, text_body)
        except Exception as e:
            current_app.logger.error(f'Resend failed: {e}')
            # Fall through to SMTP

    # Try Flask-Mail/SMTP as fallback
    try:
        msg = MailMessage(
            subject=subject,
            recipients=[to],
            html=html_body,
            body=text_body or html_body
        )
        mail.send(msg)
        return True
    except Exception as e:
        current_app.logger.error(f'Flask-Mail failed: {e}')

        # Fallback to direct SMTP
        try:
            return send_email_smtp(to, subject, html_body, text_body)
        except Exception as smtp_e:
            current_app.logger.error(f'SMTP fallback failed: {smtp_e}')
            return False


def send_email_resend(to, subject, html_body, text_body=None):
    """
    Send email using Resend API

    Args:
        to: Recipient email address
        subject: Email subject
        html_body: HTML content
        text_body: Plain text content (optional)
    """
    import resend

    resend_api_key = os.getenv('RESEND_API_KEY') or current_app.config.get('RESEND_API_KEY')
    resend.api_key = resend_api_key

    sender = os.getenv('SMTP_FROM') or current_app.config.get('MAIL_DEFAULT_SENDER')

    params = {
        "from": sender,
        "to": [to],
        "subject": subject,
        "html": html_body,
    }

    if text_body:
        params["text"] = text_body

    email = resend.Emails.send(params)
    current_app.logger.info(f'Resend email sent: {email}')
    return True


def send_email_smtp(to, subject, html_body, text_body=None):
    """
    Send email using direct SMTP connection
    """
    sender = current_app.config['MAIL_DEFAULT_SENDER']

    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From'] = sender
    msg['To'] = to

    # Attach text and HTML parts
    if text_body:
        part1 = MIMEText(text_body, 'plain')
        msg.attach(part1)

    part2 = MIMEText(html_body, 'html')
    msg.attach(part2)

    # Send via SMTP
    with smtplib.SMTP(
        current_app.config['MAIL_SERVER'],
        current_app.config['MAIL_PORT']
    ) as server:
        server.starttls()
        server.login(
            current_app.config['MAIL_USERNAME'],
            current_app.config['MAIL_PASSWORD']
        )
        server.sendmail(sender, to, msg.as_string())

    return True


def send_verification_email(user, token):
    """
    Send email verification link to user

    Args:
        user: User object
        token: Verification token
    """
    app_url = current_app.config['APP_URL']
    verification_url = f'{app_url}/auth/verify?token={token}'

    html_body = render_template(
        'emails/verification.html',
        user=user,
        verification_url=verification_url
    )

    text_body = f"""
    Welcome to SecretShopper!

    Please verify your email address by clicking the link below:
    {verification_url}

    This link will expire in 24 hours.

    If you didn't create an account, please ignore this email.
    """

    return send_email(
        to=user.email,
        subject='Verify your SecretShopper account',
        html_body=html_body,
        text_body=text_body
    )


def send_family_invite_email(inviter, invitee_email, family_name, invite_code):
    """
    Send family invitation email

    Args:
        inviter: User who sent the invite
        invitee_email: Email to send invite to
        family_name: Name of the family
        invite_code: Family invite code
    """
    app_url = current_app.config['APP_URL']
    invite_url = f'{app_url}/family/join?code={invite_code}'

    html_body = f"""
    <h2>You've been invited to join a family on SecretShopper!</h2>
    <p>{inviter.name or inviter.email} has invited you to join the family "{family_name}".</p>
    <p><a href="{invite_url}">Click here to join</a></p>
    <p>Or use this invite code: <strong>{invite_code}</strong></p>
    """

    text_body = f"""
    You've been invited to join a family on SecretShopper!

    {inviter.name or inviter.email} has invited you to join the family "{family_name}".

    Join here: {invite_url}
    Or use this invite code: {invite_code}
    """

    return send_email(
        to=invitee_email,
        subject=f'Join {family_name} on SecretShopper',
        html_body=html_body,
        text_body=text_body
    )


def send_welcome_email(user):
    """
    Send welcome email to new user

    Args:
        user: User object
    """
    html_body = f"""
    <h2>Welcome to SecretShopper!</h2>
    <p>Hi {user.name or 'there'},</p>
    <p>Thanks for joining SecretShopper! You're all set to start tracking gift preferences and coordinating with your family.</p>
    <p>Get started by:</p>
    <ul>
        <li>Creating or joining a family</li>
        <li>Adding items to your wishlist</li>
        <li>Viewing family members' profiles and wishlists</li>
    </ul>
    <p>Happy gifting!</p>
    """

    text_body = f"""
    Welcome to SecretShopper!

    Hi {user.name or 'there'},

    Thanks for joining SecretShopper! You're all set to start tracking gift preferences and coordinating with your family.

    Get started by:
    - Creating or joining a family
    - Adding items to your wishlist
    - Viewing family members' profiles and wishlists

    Happy gifting!
    """

    return send_email(
        to=user.email,
        subject='Welcome to SecretShopper!',
        html_body=html_body,
        text_body=text_body
    )
