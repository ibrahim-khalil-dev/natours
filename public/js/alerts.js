// Simple alert system
function hideAlert() {
  const el = document.querySelector('.alert');
  if (el) el.parentElement.removeChild(el);
}

function showAlert(type, msg) {
  // Hide any existing alerts
  hideAlert();
  
  // Create alert HTML
  const markup = `<div class="alert alert--${type}">${msg}</div>`;
  
  // Add alert to the page
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
  
  // Remove alert after 5 seconds
  window.setTimeout(hideAlert, 5000);
}