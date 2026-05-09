// Popup script

document.addEventListener('DOMContentLoaded', async () => {
  const apiUrlInput = document.getElementById('apiUrl');
  const userTokenInput = document.getElementById('userToken');
  const connectBtn = document.getElementById('connectBtn');
  const openAppBtn = document.getElementById('openAppBtn');
  const statusDot = document.getElementById('statusDot');
  const statusText = document.getElementById('statusText');
  const successMessage = document.getElementById('successMessage');
  const errorMessage = document.getElementById('errorMessage');

  // Load saved config
  const config = await chrome.storage.local.get(['apiUrl', 'userToken']);
  if (config.apiUrl) {
    apiUrlInput.value = config.apiUrl;
  } else {
    apiUrlInput.value = 'http://localhost:3000';
  }
  if (config.userToken) {
    userTokenInput.value = config.userToken;
    updateStatus(true);
  }

  // Connect button
  connectBtn.addEventListener('click', async () => {
    const apiUrl = apiUrlInput.value.trim();
    const userToken = userTokenInput.value.trim();

    if (!apiUrl || !userToken) {
      showError('Please fill in all fields');
      return;
    }

    try {
      // Save to storage
      await chrome.storage.local.set({
        apiUrl,
        userToken,
      });

      // Test connection
      const response = await fetch(`${apiUrl}/api/auth/user`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (response.ok) {
        showSuccess('✅ Extension connected successfully!');
        updateStatus(true);
      } else {
        showError('Failed to connect. Check your token.');
        updateStatus(false);
      }
    } catch (error) {
      showError('Connection error. Check API URL.');
      updateStatus(false);
    }
  });

  // Open app button
  openAppBtn.addEventListener('click', () => {
    const apiUrl = apiUrlInput.value.trim() || 'http://localhost:3000';
    chrome.tabs.create({ url: `${apiUrl}/copilot` });
  });

  function updateStatus(connected) {
    if (connected) {
      statusDot.classList.add('connected');
      statusText.textContent = '✅ Connected';
    } else {
      statusDot.classList.remove('connected');
      statusText.textContent = '❌ Not Connected';
    }
  }

  function showSuccess(message) {
    successMessage.textContent = message;
    successMessage.style.display = 'block';
    errorMessage.style.display = 'none';
    setTimeout(() => {
      successMessage.style.display = 'none';
    }, 3000);
  }

  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    successMessage.style.display = 'none';
  }
});
