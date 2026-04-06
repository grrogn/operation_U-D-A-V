// Contact Form Handler
(function() {
  'use strict';
  
  var SEND_DELAY_MS = 1200;
  
  document.addEventListener('DOMContentLoaded', function() {
    var form = document.querySelector('form[name="contact-form"]');
    var submitButton = document.getElementById('ContactForm1_contact-form-submit');
    
    if (!form || !submitButton) {
      return;
    }
    
    // Create status container if it doesn't exist
    var statusContainer = form.querySelector('.contact-status');
    if (!statusContainer) {
      statusContainer = document.createElement('div');
      statusContainer.className = 'contact-status';
      // Insert after the submit button
      var buttonParent = submitButton.parentNode;
      if (buttonParent.nextSibling) {
        buttonParent.parentNode.insertBefore(statusContainer, buttonParent.nextSibling);
      } else {
        buttonParent.parentNode.appendChild(statusContainer);
      }
    }
    
    submitButton.addEventListener('click', function(event) {
      event.preventDefault();
      
      if (form.dataset.busy === 'true') {
        return;
      }
      
      // Get form values
      var name = form.querySelector('[name="name"]').value.trim();
      var email = form.querySelector('[name="email"]').value.trim();
      var message = form.querySelector('[name="email-message"]').value.trim();
      
      // Validate
      if (!email) {
        showStatus('error', 'Please enter your email address.');
        return;
      }
      
      if (!isValidEmail(email)) {
        showStatus('error', 'Please enter a valid email address.');
        return;
      }
      
      if (!message) {
        showStatus('error', 'Please enter your message.');
        return;
      }
      
      // Start sending
      form.dataset.busy = 'true';
      submitButton.disabled = true;
      submitButton.value = 'Sending...';
      submitButton.classList.add('is-loading');
      clearStatus();
      
      // Simulate sending
      setTimeout(function() {
        showStatus('success', 'Thank you! Your message has been sent successfully. We\'ll get back to you soon.');
        form.reset();
        
        // Reset button
        form.dataset.busy = 'false';
        submitButton.disabled = false;
        submitButton.value = 'Send';
        submitButton.classList.remove('is-loading');
      }, SEND_DELAY_MS);
    });
    
    function showStatus(type, message) {
      statusContainer.textContent = message;
      statusContainer.className = 'contact-status is-visible is-' + type;
    }
    
    function clearStatus() {
      statusContainer.textContent = '';
      statusContainer.className = 'contact-status';
    }
    
    function isValidEmail(email) {
      var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    }
  });
})();
