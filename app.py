"""
Main Flask application factory
"""
from flask import Flask, render_template
from flask_login import LoginManager
from config import config
import os


def create_app(config_name=None):
    """
    Application factory pattern for Flask

    Args:
        config_name: Configuration to use ('development', 'production', 'testing')

    Returns:
        Flask application instance
    """
    if config_name is None:
        config_name = os.getenv('FLASK_ENV', 'development')

    app = Flask(__name__)
    app.config.from_object(config[config_name])

    # Initialize extensions
    from models import db
    db.init_app(app)

    # Initialize Flask-Login
    login_manager = LoginManager()
    login_manager.init_app(app)
    login_manager.login_view = 'auth.login'
    login_manager.login_message = 'Please log in to access this page.'
    login_manager.login_message_category = 'info'

    @login_manager.user_loader
    def load_user(user_id):
        from models.user import User
        return User.query.get(user_id)

    # Register blueprints
    from routes.auth import auth_bp
    from routes.dashboard import dashboard_bp
    from routes.family import family_bp
    from routes.profile import profile_bp
    from routes.wishlist import wishlist_bp
    from routes.groups import groups_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(family_bp)
    app.register_blueprint(profile_bp)
    app.register_blueprint(wishlist_bp)
    app.register_blueprint(groups_bp)

    # Landing page route
    @app.route('/')
    def index():
        return render_template('index.html')

    # Error handlers
    @app.errorhandler(404)
    def not_found_error(error):
        return render_template('errors/404.html'), 404

    @app.errorhandler(403)
    def forbidden_error(error):
        return render_template('errors/403.html'), 403

    @app.errorhandler(500)
    def internal_error(error):
        from models import db
        db.session.rollback()
        return render_template('errors/500.html'), 500

    # Template filters
    @app.template_filter('datetime')
    def format_datetime(value, format='%B %d, %Y'):
        """Format datetime for templates"""
        if value is None:
            return ''
        return value.strftime(format)

    @app.template_filter('currency')
    def format_currency(value):
        """Format number as currency"""
        if value is None:
            return '$0.00'
        return f'${value:,.2f}'

    # Context processors for global template variables
    @app.context_processor
    def inject_app_info():
        return {
            'app_name': app.config['APP_NAME'],
            'app_url': app.config['APP_URL']
        }

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=5000)
