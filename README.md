# Password Guardian 

Hey whoever is reading this! This is where it all starts! This is the first project I have built to grow my personal portfolio. Password Guardian is a Flask-based web application that lets you test how strong, or weak, your passwords are. There is instant feedback and a live checker to see if your password exists in a leaked database, provided by Have I Been Pwned.

## Why I Built It
- Passwords are a fundamental of cybersecurity so it is important to get an in-depth understanding
- Practice full-stack development through Flask and modern browser APIs
- Plus I needed something practical and relevant to add to my project portfolio

## What Features Does It Have
- 'zxcvbn' library
  - Live password strenght checker
  - Shows estimated crack time
- Leak detection using the Have I Been Pwned k-anonymity API
- Default criteria checklist for lowercase, uppercase, numbers, and special characters
- Visual display bar to see strength (5 stages) 

## Tech Stack
- **Backend:** Flask (Python)
- **Frontend:** HTML, CSS, JavaScript
- **APIs/Libraries:** Have I Been Pwned, zxcvbn

## Required Set Up
```bash
# create & activate a virtualenv (optional but recommended)
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# install dependencies
pip install -r requirements.txt

# run the app
python app.py
```
Then open `http://localhost:5000/` in your browser.
