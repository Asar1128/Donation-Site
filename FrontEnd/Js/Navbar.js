  // Add scroll effect
  
  window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.custom-navbar');
    if (window.scrollY > 50) {
      navbar.style.padding = '10px 0';
      navbar.style.boxShadow = '0 2px 15px rgba(0, 0, 0, 0.15)';
    } else {
      navbar.style.padding = '15px 0';
      navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    }
  });

