// ==========================================
// ===== SHARED USER & SESSION HELPERS =====
// ==========================================
const API_URL = 'http://localhost:3000/api';

function getCurrentUser() {
  const user = localStorage.getItem('brushcat_current_user');
  return user ? JSON.parse(user) : null;
}

function setCurrentUser(user) {
  localStorage.setItem('brushcat_current_user', JSON.stringify(user));
}

function clearCurrentUser() {
  localStorage.removeItem('brushcat_current_user');
}


// ==========================================
// ===== GAMEPLAY LOGIC (game.html) =====
// ==========================================
const gameArea = document.getElementById('game-area');
const catImg = document.getElementById('cat');
const combImg = document.getElementById('comb');
const scoreEl = document.getElementById('score');
const gameOverEl = document.getElementById('game-over');
let score = 0;

if (gameArea) {
  score = 0;
  let isMouseDown = false;
  let isGameOver = false;
  let catState = 'relax';          // 'relax' | 'alert'
  let alertTimeoutId = null;       // timer to revert alert → relax
  let alertTimestamp = 0;          // to track human reflex grace period

  let lastMouseX = 0;
  let lastMouseY = 0;
  let anchorX = 0;
  let anchorY = 0;
  let peakX = 0;
  let peakY = 0;
  let maxDistance = 0;
  let hasScoredThisDirection = false;
  const REVERSAL_THRESHOLD = 20;

  function getBrushThreshold() {
    return catImg.clientWidth / 3;
  }

  function generateAngerChance() {
    return 0.10 + Math.random() * 0.40;
  }

  let currentAngerChance = generateAngerChance();

  const ASSETS = {
    relax: 'assets/orange-relax.png',
    alert: 'assets/Orange-Alert.png',
    angry: 'assets/orange-angry.png',
    hair: 'assets/orange-hair.png',
  };

  gameArea.addEventListener('mouseenter', () => {
    if (!isGameOver) combImg.style.display = 'block';
  });

  gameArea.addEventListener('mouseleave', () => {
    combImg.style.display = 'none';
    if (isMouseDown) {
      isMouseDown = false;
      hasScoredThisDirection = false;
      maxDistance = 0;
      combImg.classList.remove('brushing');
    }
  });

  gameArea.addEventListener('mousemove', (e) => {
    if (isGameOver) return;
    const rect = gameArea.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    combImg.style.left = x + 'px';
    combImg.style.top = y + 'px';

    if (isMouseDown) {
      if (catState === 'alert') {
        if (Date.now() - alertTimestamp > 300) {
          triggerGameOver();
          return;
        }
      }

      const dx = e.clientX - anchorX;
      const dy = e.clientY - anchorY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > maxDistance) {
        maxDistance = distance;
        peakX = e.clientX;
        peakY = e.clientY;
      }

      if (maxDistance - distance > REVERSAL_THRESHOLD) {
        anchorX = peakX;
        anchorY = peakY;
        hasScoredThisDirection = false;
        maxDistance = 0;

        const newDx = e.clientX - anchorX;
        const newDy = e.clientY - anchorY;
        const newDistance = Math.sqrt(newDx * newDx + newDy * newDy);
        maxDistance = newDistance;
        peakX = e.clientX;
        peakY = e.clientY;
      } else {
        const threshold = getBrushThreshold();
        if (distance >= threshold && !hasScoredThisDirection) {
          hasScoredThisDirection = true;
          onSuccessfulBrush(x, y);
        }
      }
    }
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
  });

  gameArea.addEventListener('mousedown', (e) => {
    if (isGameOver) return;
    isMouseDown = true;
    anchorX = e.clientX;
    anchorY = e.clientY;
    peakX = e.clientX;
    peakY = e.clientY;
    maxDistance = 0;
    hasScoredThisDirection = false;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
    combImg.classList.add('brushing');
  });

  gameArea.addEventListener('mouseup', () => {
    if (isGameOver) return;
    isMouseDown = false;
    hasScoredThisDirection = false;
    maxDistance = 0;
    combImg.classList.remove('brushing');
  });

  function onSuccessfulBrush(cursorX, cursorY) {
    score++;
    scoreEl.textContent = 'Score: ' + score;

    scoreEl.classList.remove('pop');
    void scoreEl.offsetWidth;
    scoreEl.classList.add('pop');

    spawnHair(cursorX, cursorY);

    if (Math.random() < currentAngerChance) setCatAlert();
    currentAngerChance = generateAngerChance();
  }

  function spawnHair(x, y) {
    const hair = document.createElement('img');
    hair.src = ASSETS.hair;
    hair.className = 'hair';
    hair.style.left = (x - 25) + 'px';
    hair.style.top = y + 'px';
    gameArea.appendChild(hair);
    hair.addEventListener('animationend', () => hair.remove());
  }

  function setCatAlert() {
    catState = 'alert';
    catImg.src = ASSETS.alert;
    alertTimestamp = Date.now();
    if (alertTimeoutId) clearTimeout(alertTimeoutId);

    const delay = 500 + Math.random() * 2500;
    alertTimeoutId = setTimeout(() => {
      if (catState === 'alert' && !isGameOver) {
        catState = 'relax';
        catImg.src = ASSETS.relax;
      }
      alertTimeoutId = null;
    }, delay);
  }

  function triggerGameOver() {
    isGameOver = true;
    isMouseDown = false;
    combImg.classList.remove('brushing');
    combImg.style.display = 'none';

    if (alertTimeoutId) {
      clearTimeout(alertTimeoutId);
      alertTimeoutId = null;
    }

    catState = 'angry';
    catImg.src = ASSETS.angry;
    catImg.classList.add('zoom-in');

    checkAndUpdateHighScore();

    setTimeout(() => {
      if (gameOverEl) gameOverEl.classList.add('visible');
    }, 450);
  }

  if (gameOverEl) {
    gameOverEl.addEventListener('click', () => {
      score = 0;
      scoreEl.textContent = 'Score: 0';
      isGameOver = false;
      catState = 'relax';
      catImg.src = ASSETS.relax;
      catImg.classList.remove('zoom-in');
      gameOverEl.classList.remove('visible');
      currentAngerChance = generateAngerChance();
      anchorX = 0;
      anchorY = 0;
      peakX = 0;
      peakY = 0;
      maxDistance = 0;
      hasScoredThisDirection = false;
      document.querySelectorAll('.hair').forEach(h => h.remove());
    });
  }
}

// Leaderboard Integration 
async function checkAndUpdateHighScore() {
  const currentUser = getCurrentUser();
  if (!currentUser) return;
  
  if (typeof score !== 'undefined') {
    try {
      const response = await fetch(`${API_URL}/users/score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`
        },
        body: JSON.stringify({ score: score })
      });
      
      if (response.ok) {
        // Tarik data profil terbaru untuk meng-update bestScore lokal dan rank
        const profileRes = await fetch(`${API_URL}/users/current`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${currentUser.token}`
          }
        });
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          currentUser.bestScore = profileData.data.bestScore;
          currentUser.rank = profileData.data.rank;
          setCurrentUser(currentUser);
        }
      }
    } catch (e) {
      console.error('Gagal mengirim skor ke backend:', e);
    }
  }
  updateLeaderboardUI();
}

async function updateLeaderboardUI() {
  const currentUser = getCurrentUser();
  const leaderboardList = document.querySelector('.leaderboard-list');
  if (leaderboardList) {
    try {
      const response = await fetch(`${API_URL}/users/leaderboard`);
      if (response.ok) {
        const result = await response.json();
        const topScores = result.data;
        
        leaderboardList.innerHTML = '';
        
        if (topScores.length === 0) {
          leaderboardList.innerHTML = '<li class="leaderboard-item" style="justify-content: center; font-style: italic;">No high scores yet!</li>';
        } else {
          topScores.forEach((item, index) => {
            const li = document.createElement('li');
            li.className = 'leaderboard-item';
            
            let rankClass = '';
            if (index === 0) rankClass = 'rank-gold';
            else if (index === 1) rankClass = 'rank-silver';
            else if (index === 2) rankClass = 'rank-bronze';
            
            li.innerHTML = `
              <span class="rank ${rankClass}">#${index + 1}</span>
              <span class="username">${item.name}</span>
              <span class="high-score">${item.bestScore}</span>
            `;
            leaderboardList.appendChild(li);
          });
        }
      }
    } catch (e) {
      console.error('Gagal memuat leaderboard:', e);
    }
  }

  const myBestEl = document.querySelector('.leaderboard-item.my-best');
  if (!myBestEl) return;
  
  const rankEl = myBestEl.querySelector('.rank');
  const usernameEl = myBestEl.querySelector('.username');
  const scoreValEl = myBestEl.querySelector('.high-score');
  
  if (currentUser) {
    if (rankEl) rankEl.textContent = `#${currentUser.rank || '-'}`;
    if (usernameEl) usernameEl.textContent = `${currentUser.username} (My Best)`;
    if (scoreValEl) scoreValEl.textContent = currentUser.bestScore;
  } else {
    if (rankEl) rankEl.textContent = '-';
    if (usernameEl) usernameEl.textContent = 'You (My Best)';
    if (scoreValEl) scoreValEl.textContent = '0';
  }
}

document.addEventListener('DOMContentLoaded', updateLeaderboardUI);


// ==========================================
// ===== AUTH & POP-UP LOGIC (index.html) =====
// ==========================================
const backdrop = document.getElementById('auth-modal-backdrop');

if (backdrop) {
  const modal = document.getElementById('auth-modal');
  const closeBtn = document.getElementById('modal-close-btn');
  const loginBtn = document.getElementById('login-btn');
  const signupBtn = document.getElementById('signup-btn');
  const logoutBtn = document.getElementById('navbar-logout-btn');
  const navLogoutItem = document.getElementById('nav-logout-item');
  const loginView = document.getElementById('login-view');
  const signupView = document.getElementById('signup-view');
  const switchToSignupLink = document.getElementById('switch-to-signup');
  const switchToLoginLink = document.getElementById('switch-to-login');
  
  const loginForm = document.getElementById('login-form');
  const loginUsernameInput = document.getElementById('login-username');
  const loginPasswordInput = document.getElementById('login-password');
  
  const signupForm = document.getElementById('signup-form');
  const signupUsernameInput = document.getElementById('signup-username');
  const signupPasswordInput = document.getElementById('signup-password');
  
  const loginPassToggle = document.getElementById('login-pass-toggle');
  const signupPassToggle = document.getElementById('signup-pass-toggle');
  
  const toastContainer = document.getElementById('toast-container');

  function showToast(message, type = 'success') {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icon = type === 'success' ? '✨' : '⚠️';
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    toastContainer.appendChild(toast);

    void toast.offsetWidth;
    toast.classList.add('active');

    setTimeout(() => {
      toast.classList.remove('active');
      toast.addEventListener('transitionend', () => toast.remove());
    }, 3000);
  }

  function showModal(initialView = 'login') {
    backdrop.classList.add('active');
    resetErrors();
    
    if (loginForm) loginForm.reset();
    if (signupForm) signupForm.reset();
    
    if (loginPasswordInput && loginPassToggle) {
      loginPasswordInput.type = 'password';
      loginPassToggle.textContent = '👁️';
    }
    if (signupPasswordInput && signupPassToggle) {
      signupPasswordInput.type = 'password';
      signupPassToggle.textContent = '👁️';
    }

    if (initialView === 'login') {
      if (loginView) loginView.classList.add('active');
      if (signupView) signupView.classList.remove('active');
    } else {
      if (loginView) loginView.classList.remove('active');
      if (signupView) signupView.classList.add('active');
    }
  }

  function hideModal() {
    backdrop.classList.remove('active');
  }

  function switchView(viewName) {
    if (modal) {
      modal.classList.remove('wobble-anim');
      void modal.offsetWidth;
      modal.classList.add('wobble-anim');
    }
    resetErrors();

    setTimeout(() => {
      if (viewName === 'signup') {
        if (loginView) loginView.classList.remove('active');
        if (signupView) signupView.classList.add('active');
      } else {
        if (signupView) signupView.classList.remove('active');
        if (loginView) loginView.classList.add('active');
      }
    }, 150);
  }

  if (modal) {
    modal.addEventListener('animationend', (e) => {
      if (e.animationName === 'modalWobble') modal.classList.remove('wobble-anim');
    });
  }

  function setupPasswordToggle(inputEl, toggleBtn) {
    if (inputEl && toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        if (inputEl.type === 'password') {
          inputEl.type = 'text';
          toggleBtn.textContent = '🙈';
        } else {
          inputEl.type = 'password';
          toggleBtn.textContent = '👁️';
        }
      });
    }
  }

  setupPasswordToggle(loginPasswordInput, loginPassToggle);
  setupPasswordToggle(signupPasswordInput, signupPassToggle);

  function showError(inputEl, message) {
    if (!inputEl) return;
    inputEl.classList.add('has-error');
    const errorEl = document.getElementById(`${inputEl.id}-error`);
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.style.display = 'block';
    }
  }

  function clearError(inputEl) {
    if (!inputEl) return;
    inputEl.classList.remove('has-error');
    const errorEl = document.getElementById(`${inputEl.id}-error`);
    if (errorEl) errorEl.style.display = 'none';
  }

  function resetErrors() {
    const inputs = [loginUsernameInput, loginPasswordInput, signupUsernameInput, signupPasswordInput];
    inputs.forEach(input => { if (input) clearError(input) });
  }

  [loginUsernameInput, loginPasswordInput, signupUsernameInput, signupPasswordInput].forEach(input => {
    if (input) {
      input.addEventListener('input', () => {
        if (input.value.trim() !== '') clearError(input);
      });
    }
  });

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      resetErrors();

      const username = loginUsernameInput.value.trim();
      const password = loginPasswordInput.value;
      let isValid = true;

      if (!username) { showError(loginUsernameInput, 'Name is missing, groomer!'); isValid = false; }
      if (!password) { showError(loginPasswordInput, 'Password cannot be empty!'); isValid = false; }
      if (!isValid) return;

      try {
        const response = await fetch(`${API_URL}/users/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: username, password })
        });

        const result = await response.json();

        if (!response.ok) {
          showToast(result.error || 'Wrong username or password! Double check it.', 'error');
          return;
        }

        const authData = result.data;
        
        // Tarik profil user untuk mendapatkan bestScore saat ini
        const profileRes = await fetch(`${API_URL}/users/current`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${authData.token}` }
        });
        
        let bestScore = 0;
        let rank = '-';
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          bestScore = profileData.data.bestScore;
          rank = profileData.data.rank;
        }

        setCurrentUser({
          id: authData.user.id,
          username: authData.user.name,
          token: authData.token,
          bestScore: bestScore,
          rank: rank
        });

        showToast(`Welcome back, ${authData.user.name}! 🐾`, 'success');
        hideModal();
        updateAuthStateUI();
        updateLeaderboardUI();
      } catch (err) {
        console.error(err);
        showToast('Server backend mati atau terjadi kesalahan koneksi!', 'error');
      }
    });
  }

  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      resetErrors();

      const username = signupUsernameInput.value.trim();
      const password = signupPasswordInput.value;
      let isValid = true;

      if (!username) { showError(signupUsernameInput, 'Who are you? Please enter a username!'); isValid = false; }
      else if (username.length < 3) { showError(signupUsernameInput, 'Username must be at least 3 letters!'); isValid = false; }
      else if (!/^[a-zA-Z0-9_]+$/.test(username)) { showError(signupUsernameInput, 'Use alphanumeric characters only!'); isValid = false; }

      if (!password) { showError(signupPasswordInput, 'Please secure your account with a password!'); isValid = false; }
      else if (password.length < 4) { showError(signupPasswordInput, 'Too weak! Make it at least 4 characters.'); isValid = false; }

      if (!isValid) return;

      try {
        const response = await fetch(`${API_URL}/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: username, password })
        });

        const result = await response.json();

        if (!response.ok) {
          showToast(result.error || 'Oops! Username already taken by another groomer.', 'error');
          showError(signupUsernameInput, result.error || 'Name already taken!');
          return;
        }

        // Auto login setelah registrasi sukses
        const loginResponse = await fetch(`${API_URL}/users/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: username, password })
        });
        
        if (loginResponse.ok) {
          const loginResult = await loginResponse.json();
          const authData = loginResult.data;
          
          setCurrentUser({
            id: authData.user.id,
            username: authData.user.name,
            token: authData.token,
            bestScore: 0
          });
          
          showToast(`Account created! Welcome, ${username}! 🎉`, 'success');
          hideModal();
          updateAuthStateUI();
          updateLeaderboardUI();
        } else {
          showToast('Account created successfully! Please log in.', 'success');
          switchView('login');
        }
      } catch (err) {
        console.error(err);
        showToast('Server backend mati atau terjadi kesalahan koneksi!', 'error');
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const currentUser = getCurrentUser();
      if (currentUser && currentUser.token) {
        try {
          await fetch(`${API_URL}/users/logout`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${currentUser.token}` }
          });
        } catch (err) {
          console.error('Gagal logout di server:', err);
        }
      }
      clearCurrentUser();
      showToast(currentUser ? `See you later, ${currentUser.username}! 👋` : 'Logged out successfully.', 'success');
      updateAuthStateUI();
      updateLeaderboardUI();
    });
  }

  if (loginBtn) loginBtn.addEventListener('click', () => showModal('login'));
  if (signupBtn) signupBtn.addEventListener('click', () => showModal('signup'));
  if (closeBtn) closeBtn.addEventListener('click', hideModal);

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) hideModal();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && backdrop.classList.contains('active')) hideModal();
  });

  if (switchToSignupLink) switchToSignupLink.addEventListener('click', () => switchView('signup'));
  if (switchToLoginLink) switchToLoginLink.addEventListener('click', () => switchView('login'));

  async function verifySession() {
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.token) {
      try {
        const response = await fetch(`${API_URL}/users/current`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${currentUser.token}` }
        });
        if (!response.ok) {
          clearCurrentUser();
          updateAuthStateUI();
        }
      } catch (e) {
        console.error('Gagal verifikasi sesi:', e);
      }
    }
  }

  function updateAuthStateUI() {
    const currentUser = getCurrentUser();
    if (currentUser) {
      if (loginBtn) loginBtn.style.display = 'none';
      if (navLogoutItem) navLogoutItem.style.display = 'block';
    } else {
      if (loginBtn) loginBtn.style.display = 'inline-block';
      if (navLogoutItem) navLogoutItem.style.display = 'none';
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    verifySession().then(() => {
      updateAuthStateUI();
      updateLeaderboardUI();
    });
  });
}
