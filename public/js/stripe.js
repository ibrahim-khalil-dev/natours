// Initialize Stripe with your public key
const stripe = Stripe(
    'pk_test_51R6oIq4P54p2R6NbHobAUjktsx2Ogg09z3nAacRu88C6VEk1K3l3vsK9FdiJDEK9yxUPx74ZZbbcYUNUEmQJQWXc00JPa9mcm5'
  );
  
  // Check if Stripe is properly loaded
  if (!window.Stripe) {
    console.error('Stripe.js not loaded!');
    alert('Could not load Stripe. Please refresh the page and try again.');
  } else {
    console.log('Stripe loaded successfully');
  }
  
  // Simple alert function if not already defined
  function showAlert(type, msg) {
    const markup = `<div class="alert alert--${type}">${msg}</div>`;
    document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
    window.setTimeout(() => {
      document.querySelector('.alert').remove();
    }, 5000);
  }
  
  // Make function globally available
  const bookTour = async (tourId) => {
    try {
      // 1) Get checkout session from the API
      const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
      console.log('Full session response:', session);
      
      // 2) Try both redirect methods
      if (session.data.session.url) {
        // Method 1: Direct URL redirect (preferred)
        console.log('Redirecting to:', session.data.session.url);
        window.location.href = session.data.session.url;
      } else {
        // Method 2: Using redirectToCheckout
        console.log('Using redirectToCheckout with session ID:', session.data.session.id);
        const result = await stripe.redirectToCheckout({
          sessionId: session.data.session.id
        });
        
        if (result.error) {
          console.error('Stripe redirect error:', result.error);
          showAlert('error', result.error.message);
        }
      }
    } catch (err) {
      console.error('Error booking tour:', err);
      showAlert(
        'error',
        err.response?.data?.message || 'Something went wrong. Please try again.'
      );
      
      // Reset button text
      const bookBtn = document.getElementById('book-tour');
      if (bookBtn) bookBtn.textContent = 'Book tour now!';
    }
  };
  
  // Add event listener to the book tour button
  document.addEventListener('DOMContentLoaded', () => {
    const bookBtn = document.getElementById('book-tour');
  
    if (bookBtn) {
      console.log('Book button found:', bookBtn);
      bookBtn.addEventListener('click', (e) => {
        console.log('Book button clicked!');
        e.target.textContent = 'Processing...';
        const tourId = e.target.dataset.tourId;
        console.log('Tour ID:', tourId);
        bookTour(tourId);
      });
    } else {
      console.log('Book button not found');
    }
  });