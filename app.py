from flask import Flask, render_template, request, jsonify
import hashlib
import requests

app = Flask(__name__)

# -------------------------------
# ROUTE: Home page
# -------------------------------
@app.route('/')
def index():
    return render_template('index.html')


# -------------------------------
# ROUTE: Breach check (AJAX call)
# -------------------------------
@app.route('/check_breach', methods=['POST'])
def check_breach():
    data = request.get_json()
    password = data.get('password', '')

    # Compute SHA1 hash of password (uppercase for HIBP format)
    sha1_hash = hashlib.sha1(password.encode('utf-8')).hexdigest().upper()
    prefix = sha1_hash[:5]
    suffix = sha1_hash[5:]

    # Query HaveIBeenPwned API using the k-anonymity model
    url = f"https://api.pwnedpasswords.com/range/{prefix}"
    res = requests.get(url)

    if res.status_code != 200:
        return jsonify({"error": "API error"}), 500

    # Check if hash suffix exists in returned results
    found = any(line.split(':')[0] == suffix for line in res.text.splitlines())

    return jsonify({"breached": found})


if __name__ == "__main__":
    app.run(debug=True)
