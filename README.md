# FastAPI Web Application

A modern web application built with FastAPI featuring login, signup, home, and pricing pages with animations and a responsive UI.

## Features

- User authentication (login and signup)
- Responsive design
- Modern UI with animations using GSAP and Animate.css
- Pricing page with interactive pricing cards

## Project Structure

```
├── main.py              # FastAPI application entry point
├── requirements.txt     # Project dependencies
├── static/              # Static files
│   ├── css/             # CSS stylesheets
│   │   └── styles.css   # Main stylesheet
│   └── js/              # JavaScript files
│       └── main.js      # Main JavaScript file
└── templates/           # HTML templates
    ├── base.html        # Base template with common layout
    ├── home.html        # Home page template
    ├── login.html       # Login page template
    ├── pricing.html     # Pricing page template
    └── signup.html      # Signup page template
```

## Installation

1. Clone the repository or download the source code

2. Create a virtual environment (optional but recommended):
   ```
   python -m venv venv
   venv\Scripts\activate  # On Windows
   ```

3. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```

## Running the Application

1. Start the FastAPI server:
   ```
   python main.py
   ```

2. Open your browser and navigate to:
   ```
   http://127.0.0.1:8000/
   ```

## Pages

- **Home** (`/`): Landing page with feature highlights
- **Login** (`/login`): User login page
- **Signup** (`/signup`): New user registration
- **Pricing** (`/pricing`): Pricing plans and information

## Technologies Used

- **Backend**: FastAPI, Uvicorn
- **Frontend**: HTML, CSS, JavaScript
- **Animation Libraries**: GSAP, Animate.css
- **Templating**: Jinja2

## Development

To modify the application:

- Edit templates in the `templates/` directory
- Modify styles in `static/css/styles.css`
- Update JavaScript functionality in `static/js/main.js`
- Add new routes or modify existing ones in `main.py`