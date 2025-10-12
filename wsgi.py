"""
WSGI entry point for production deployment (Vercel, Gunicorn, etc.)
"""
from app import create_app

# Create the application instance
app = create_app('production')

if __name__ == "__main__":
    app.run()
