"""
Flask application configuration
"""
import os
from dotenv import load_dotenv
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse

load_dotenv()


def clean_database_url(url):
    """
    Remove Supabase-specific parameters from DATABASE_URL that psycopg2 doesn't recognize

    Args:
        url: Database connection URL

    Returns:
        Cleaned URL without unsupported parameters
    """
    if not url:
        return url

    parsed = urlparse(url)
    query_params = parse_qs(parsed.query)

    # Remove Supabase-specific parameters that psycopg2 doesn't support
    unsupported_params = ['pgbouncer']
    for param in unsupported_params:
        query_params.pop(param, None)

    # Reconstruct the URL
    new_query = urlencode(query_params, doseq=True)
    cleaned = parsed._replace(query=new_query)
    return urlunparse(cleaned)


class Config:
    """Base configuration class"""

    # Security
    SECRET_KEY = os.getenv('SECRET_KEY') or 'dev-secret-key-change-in-production'

    # Database
    SQLALCHEMY_DATABASE_URI = clean_database_url(os.getenv('DATABASE_URL'))
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_pre_ping': True,
        'pool_recycle': 300,
    }

    # Flask-WTF
    WTF_CSRF_ENABLED = True
    WTF_CSRF_TIME_LIMIT = None  # No time limit for CSRF token

    # Session
    SESSION_COOKIE_SECURE = os.getenv('ENV') == 'production'
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    PERMANENT_SESSION_LIFETIME = 86400  # 24 hours

    # Email Configuration
    # Resend (primary)
    RESEND_API_KEY = os.getenv('RESEND_API_KEY')

    # SMTP (fallback)
    MAIL_SERVER = os.getenv('SMTP_HOST', 'smtp.gmail.com')
    MAIL_PORT = int(os.getenv('SMTP_PORT', 587))
    MAIL_USE_TLS = True
    MAIL_USERNAME = os.getenv('SMTP_USER')
    MAIL_PASSWORD = os.getenv('SMTP_PASSWORD')
    MAIL_DEFAULT_SENDER = os.getenv('SMTP_FROM')

    # Application
    APP_NAME = 'SecretShopper'
    APP_URL = os.getenv('NEXTAUTH_URL', 'http://localhost:5000')

    # File Upload (if needed in future)
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max upload


class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    TESTING = False


class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    TESTING = False


class TestingConfig(Config):
    """Testing configuration"""
    DEBUG = True
    TESTING = True
    WTF_CSRF_ENABLED = False


# Configuration dictionary
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
