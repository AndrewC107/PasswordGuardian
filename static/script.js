const passwordInput = document.getElementById('passwordInput');
const criteria = {
  lowercase: document.getElementById('lowercase'),
  uppercase: document.getElementById('uppercase'),
  number: document.getElementById('number'),
  special: document.getElementById('special')
};
const strengthBar = document.getElementById('strengthBar');
const strengthMessage = document.getElementById('strengthMessage');
const crackTimeElement = document.getElementById('crackTime');
const breachResult = document.getElementById('breachResult');
const showPassword = document.getElementById('showPassword');
let timeout = null;
let latestCheckId = 0;

/* ---------- Strength Evaluation ---------- */
function evaluateStrength(password) {
  if (!password) {
    return {
      width: 0,
      color: 'red',
      message: '',
      score: 0,
      crackTime: ''
    };
  }

  if (typeof zxcvbn === 'function') {
    const result = zxcvbn(password);
    const scale = [
      { width: 10, color: '#d32f2f', baseMessage: 'Very weak' },
      { width: 30, color: '#f4511e', baseMessage: 'Weak' },
      { width: 55, color: '#f9a825', baseMessage: 'Fair' },
      { width: 80, color: '#7cb342', baseMessage: 'Strong' },
      { width: 100, color: '#2e7d32', baseMessage: 'Very strong' }
    ];

    const clampedScore = Math.min(Math.max(result.score, 0), 4);
    const { width, color, baseMessage } = scale[clampedScore];

    const crackTime = result.crack_times_display?.offline_slow_hashing_1e4_per_second || '';
    const feedback = result.feedback?.warning || result.feedback?.suggestions?.[0] || '';

    return {
      width,
      color,
      message: baseMessage,
      score: clampedScore,
      crackTime,
      feedback
    };
  }

  // Fallback to simple entropy-based scoring if zxcvbn unavailable
  let charset = 0;
  if (/[a-z]/.test(password)) charset += 26;
  if (/[A-Z]/.test(password)) charset += 26;
  if (/[0-9]/.test(password)) charset += 10;
  if (/[^A-Za-z0-9]/.test(password)) charset += 32;
  const entropy = password.length * Math.log2(charset || 1);

  let width;
  if (entropy < 30) width = 15;
  else if (entropy < 45) width = 35;
  else if (entropy < 65) width = 60;
  else width = 100;

  let color;
  if (width < 25) color = 'red';
  else if (width < 60) color = 'yellow';
  else color = 'green';

  return {
    width,
    color,
    message: 'Password evaluation fallback in use.',
    score: width < 25 ? 0 : width < 60 ? 2 : 4,
    crackTime: '',
    feedback: ''
  };
}

/* ---------- Criteria Updates ---------- */
function updateCriteria(password) {
  criteria.lowercase.style.backgroundColor = /[a-z]/.test(password) ? '#b7e4b4' : '#d9d9d9';
  criteria.uppercase.style.backgroundColor = /[A-Z]/.test(password) ? '#b7e4b4' : '#d9d9d9';
  criteria.number.style.backgroundColor = /[0-9]/.test(password) ? '#b7e4b4' : '#d9d9d9';
  criteria.special.style.backgroundColor = /[^A-Za-z0-9]/.test(password) ? '#b7e4b4' : '#d9d9d9';
}

/* ---------- Strength Bar Update ---------- */
function updateStrength(password, breachStatus) {
  if (!password) {
    strengthBar.style.width = '0%';
    strengthBar.style.backgroundColor = 'red';
    breachResult.textContent = '';
    breachResult.classList.remove('loading');
    strengthMessage.textContent = '';
    crackTimeElement.textContent = '';
    return;
  }

  let evaluation = evaluateStrength(password);

  if (breachStatus === true) {
    evaluation = {
      width: 0,
      color: '#d32f2f',
      message: 'Known breached password — choose a completely different password.',
      score: 0,
      crackTime: '',
      feedback: ''
    };
  }

  // Update width and color
  strengthBar.style.width = evaluation.width + '%';
  strengthBar.style.backgroundColor = evaluation.color;
  strengthMessage.textContent = evaluation.message;
  crackTimeElement.textContent = evaluation.crackTime ? evaluation.crackTime : '';

  // Update breach result section
  if (breachStatus === null) {
    breachResult.textContent = 'Checking for leaks...';
    breachResult.classList.add('loading');
  } else if (breachStatus === true) {
    breachResult.textContent = '⚠️ This password has appeared in known data breaches.';
    breachResult.classList.remove('loading');
  } else {
    breachResult.textContent = '✅ This password has not been found in any known leaks.';
    breachResult.classList.remove('loading');
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
  clearTimeout(timeout);

  if (!password) {
    latestCheckId++;
    updateStrength('', null);
    return;
  }

  updateStrength(password, null);
  const checkId = ++latestCheckId;

  timeout = setTimeout(async () => {
    const breached = await checkBreach(password);
    if (checkId !== latestCheckId) return;
    updateStrength(passwordInput.value, breached);
  }, 400);
});

/* ---------- Show / Hide Password Toggle ---------- */
showPassword.addEventListener('change', () => {
  passwordInput.type = showPassword.checked ? 'text' : 'password';
});
