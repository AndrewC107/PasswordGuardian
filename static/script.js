const passwordInput = document.getElementById('passwordInput');
const criteria = {
  lowercase: document.getElementById('lowercase'),
  uppercase: document.getElementById('uppercase'),
  number: document.getElementById('number'),
  special: document.getElementById('special')
};
const strengthBar = document.getElementById('strengthBar');
const breachResult = document.getElementById('breachResult');
const showPassword = document.getElementById('showPassword');
let timeout = null;

/* ---------- Entropy Calculation ---------- */
function calculateEntropy(password) {
  let charset = 0;
  if (/[a-z]/.test(password)) charset += 26;
  if (/[A-Z]/.test(password)) charset += 26;
  if (/[0-9]/.test(password)) charset += 10;
  if (/[^A-Za-z0-9]/.test(password)) charset += 32;
  return password.length * Math.log2(charset || 1);
}

/* ---------- Criteria Updates ---------- */
function updateCriteria(password) {
  criteria.lowercase.style.backgroundColor = /[a-z]/.test(password) ? '#b7e4b4' : '#d9d9d9';
  criteria.uppercase.style.backgroundColor = /[A-Z]/.test(password) ? '#b7e4b4' : '#d9d9d9';
  criteria.number.style.backgroundColor = /[0-9]/.test(password) ? '#b7e4b4' : '#d9d9d9';
  criteria.special.style.backgroundColor = /[^A-Za-z0-9]/.test(password) ? '#b7e4b4' : '#d9d9d9';
}

/* ---------- Strength Bar Update ---------- */
function updateStrength(password, breached) {
  const entropy = calculateEntropy(password);
  let score = 0;

  // Scoring based on entropy
  if (entropy < 30) score = 15;
  else if (entropy < 45) score = 35;
  else if (entropy < 65) score = 60;
  else score = 100;

  if (breached) score = Math.max(score - 40, 0);

  // Update width and color
  strengthBar.style.width = score + '%';
  if (score < 25) strengthBar.style.backgroundColor = 'red';
  else if (score < 60) strengthBar.style.backgroundColor = 'yellow';
  else strengthBar.style.backgroundColor = 'green';

  // Update breach result section
  if (!password) {
    breachResult.textContent = '';
  } else if (breached) {
    breachResult.textContent = '⚠️ This password has appeared in known data breaches.';
  } else {
    breachResult.textContent = '✅ This password has not been found in any known leaks.';
  }
}

/* ---------- HIBP Breach Check ---------- */
async function checkBreach(password) {
  try {
    const res = await fetch('/check_breach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    const data = await res.json();
    return data.breached || false;
  } catch (err) {
    console.error('Error:', err);
    return false;
  }
}

/* ---------- Live Typing Event ---------- */
passwordInput.addEventListener('input', () => {
  const password = passwordInput.value;
  updateCriteria(password);
  strengthBar.style.width = '0%';
  breachResult.textContent = '';

  clearTimeout(timeout);
  if (password.length > 0) {
    timeout = setTimeout(async () => {
      const breached = await checkBreach(password);
      updateStrength(password, breached);
    }, 800);
  }
});

/* ---------- Show / Hide Password Toggle ---------- */
showPassword.addEventListener('change', () => {
  passwordInput.type = showPassword.checked ? 'text' : 'password';
});
