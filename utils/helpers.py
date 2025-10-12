"""
General helper functions
"""
import secrets
import string
from datetime import datetime, timedelta


def generate_cuid():
    """
    Generate a CUID-like ID (simplified version)
    Format: c + timestamp + random characters
    """
    timestamp = hex(int(datetime.utcnow().timestamp() * 1000))[2:]
    random_part = ''.join(secrets.choice(string.ascii_lowercase + string.digits) for _ in range(12))
    return f'c{timestamp}{random_part}'[:25]


def generate_invite_code(length=8):
    """
    Generate a random invite code for families
    Uses uppercase letters and digits
    """
    characters = string.ascii_uppercase + string.digits
    return ''.join(secrets.choice(characters) for _ in range(length))


def generate_verification_token():
    """
    Generate a secure verification token for email verification
    """
    return secrets.token_urlsafe(32)


def create_verification_token_expiry(hours=24):
    """
    Create expiration datetime for verification token
    Default: 24 hours from now
    """
    return datetime.utcnow() + timedelta(hours=hours)


def format_price(value):
    """
    Format decimal/float as currency string
    """
    if value is None:
        return '$0.00'
    return f'${float(value):,.2f}'


def parse_json_field(field):
    """
    Safely parse JSON field (returns empty list if None)
    """
    if field is None:
        return []
    return field if isinstance(field, list) else []


def calculate_percentage(part, total):
    """
    Calculate percentage, handling edge cases
    """
    if total == 0 or part is None or total is None:
        return 0
    return int((float(part) / float(total)) * 100)


def truncate_text(text, length=100, suffix='...'):
    """
    Truncate text to specified length with suffix
    """
    if not text or len(text) <= length:
        return text
    return text[:length].rsplit(' ', 1)[0] + suffix


def get_user_initials(name):
    """
    Get user initials from name (max 2 characters)
    """
    if not name:
        return '??'
    parts = name.strip().split()
    if len(parts) >= 2:
        return f'{parts[0][0]}{parts[-1][0]}'.upper()
    return name[:2].upper()
