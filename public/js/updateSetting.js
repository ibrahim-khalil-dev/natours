// Update user settings functionality
document.addEventListener('DOMContentLoaded', function() {
  // User data form
  const userDataForm = document.querySelector('.form-user-data');
  
  // Password form
  const passwordForm = document.querySelector('.form-user-password');
  
  // Handle user data form submission
  if (userDataForm) {
    userDataForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Create form data object
      const form = new FormData();
      form.append('name', document.getElementById('name').value);
      form.append('email', document.getElementById('email').value);
      
      // Add photo if one was selected
      const photoInput = document.getElementById('photo');
      if (photoInput.files.length > 0) {
        form.append('photo', photoInput.files[0]);
      }
      
      // Get save button
      const saveBtn = userDataForm.querySelector('.btn');
      saveBtn.textContent = 'Saving...';
      saveBtn.disabled = true;
      
      // Send update request
      axios({
        method: 'PATCH',
        url: '/api/v1/users/updateMe',
        data: form
      })
      .then(function(res) {
        showAlert('success', 'Profile updated successfully!');
        
        // Reload page after delay to show updated data
        window.setTimeout(function() {
          location.reload();
        }, 1500);
      })
      .catch(function(err) {
        showAlert('error', err.response?.data?.message || 'Error updating profile!');
      })
      .finally(function() {
        saveBtn.textContent = 'Save settings';
        saveBtn.disabled = false;
      });
    });
  }
  
  // Handle password form submission
  if (passwordForm) {
    passwordForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Get password values
      const passwordCurrent = document.getElementById('password-current').value;
      const password = document.getElementById('password').value;
      const passwordConfirm = document.getElementById('password-confirm').value;
      
      // Get save button
      const saveBtn = passwordForm.querySelector('.btn');
      saveBtn.textContent = 'Updating...';
      saveBtn.disabled = true;
      
      // Check if passwords match
      if (password !== passwordConfirm) {
        showAlert('error', 'Passwords do not match!');
        saveBtn.textContent = 'Save password';
        saveBtn.disabled = false;
        return;
      }
      
      // Send update request
      axios({
        method: 'PATCH',
        url: '/api/v1/users/updatePassword',
        data: {
          passwordCurrent,
          password,
          passwordConfirm
        }
      })
      .then(function(res) {
        showAlert('success', 'Password updated successfully!');
        
        // Clear password fields
        document.getElementById('password-current').value = '';
        document.getElementById('password').value = '';
        document.getElementById('password-confirm').value = '';
      })
      .catch(function(err) {
        showAlert('error', err.response?.data?.message || 'Error updating password!');
      })
      .finally(function() {
        saveBtn.textContent = 'Save password';
        saveBtn.disabled = false;
      });
    });
  }
});