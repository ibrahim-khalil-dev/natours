// Login functionality
document.addEventListener('DOMContentLoaded', function() {
  // Get login form
  const loginForm = document.querySelector('.login-form .form');
  
  // Only add event listener if form exists on the page
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Get email and password
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      // Get login button
      const loginBtn = document.querySelector('.btn--green');
      
      // Update button state
      loginBtn.textContent = 'Logging in...';
      loginBtn.disabled = true;
      
      // Send login request
      axios({
        method: 'POST',
        url: '/api/v1/users/login',
        data: {
          email,
          password
        }
      })
      .then(function(res) {
        // Show success message
        showAlert('success', 'Logged in successfully!');
        
        // Redirect to home page after delay
        window.setTimeout(function() {
          location.assign('/');
        }, 1500);
      })
      .catch(function(err) {
        // Show error message
        showAlert('error', err.response?.data?.message || 'Incorrect email or password');
        
        // Reset button
        loginBtn.textContent = 'Login';
        loginBtn.disabled = false;
      });
    });
  }
});



// Logout functionality
document.addEventListener('DOMContentLoaded', function() {
  // Get logout button
  const logoutBtn = document.querySelector('.nav__el--logout');
  
  // Only add event listener if button exists
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Show loading state
      logoutBtn.textContent = 'Logging out...';
      
      // Send logout request
      axios({
        method: 'GET',
        url: '/api/v1/users/logout'
      })
      .then(function() {
        // Show success message
        showAlert('success', 'Logged out successfully!');
        
        // Redirect to home page after delay
        window.setTimeout(function() {
          location.assign('/');
        }, 1500);
      })
      .catch(function() {
        showAlert('error', 'Error logging out. Please try again.');
        logoutBtn.textContent = 'Log out';
      });
    });
  }
});