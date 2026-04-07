// Theme Toggle Script
(function() {
  'use strict';
  
  document.addEventListener('DOMContentLoaded', function() {
    var themeToggle = document.getElementById('theme-toggle');
    var logoImg = document.querySelector('.main-logo img');
    var footerLogoImg = document.querySelector('.footer-logo img');
    
    // Original logo paths
    var lightLogo = 'Kate-logo.png';
    var darkLogo = 'Kate-logo-White.png';
    
    // Load saved theme from localStorage
    var savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      applyDarkTheme();
    }
    
    // Theme toggle click handler
    if (themeToggle) {
      themeToggle.addEventListener('click', function(event) {
        event.preventDefault();
        
        if (document.body.classList.contains('dark-theme')) {
          applyLightTheme();
        } else {
          applyDarkTheme();
        }
      });
    }
    
  function applyDarkTheme() {
    document.body.classList.add('dark-theme');
    localStorage.setItem('theme', 'dark');
    
    // Change ONLY header logo to white version (not footer)
    if (logoImg && logoImg.src.indexOf('Kate-logo.png') !== -1) {
      logoImg.src = darkLogo;
    }
  }
  
  function applyLightTheme() {
    document.body.classList.remove('dark-theme');
    localStorage.setItem('theme', 'light');
    
    // Change ONLY header logo back to original (not footer)
    if (logoImg && logoImg.src.indexOf('Kate-logo-White.png') !== -1) {
      logoImg.src = lightLogo;
    }
  }
  });
})();


