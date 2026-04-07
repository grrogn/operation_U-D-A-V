// Contact Form Handler
(function () {
  "use strict";

  var SEND_DELAY_MS = 1200;

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll('form[name="contact-form"]').forEach(initContactForm);
  });

  function initContactForm(form) {
    var submitButton = form.querySelector(".contact-form-button-submit");
    if (!submitButton) {
      return;
    }

    if (!submitButton.dataset.defaultLabel) {
      submitButton.dataset.defaultLabel = readButtonLabel(submitButton);
    }

    var errorBox = form.querySelector(".contact-form-error-message");
    var successBox = form.querySelector(".contact-form-success-message");

    if (!errorBox || !successBox) {
      var statusWrap = document.createElement("div");
      statusWrap.style.textAlign = "center";
      statusWrap.style.width = "100%";

      errorBox = document.createElement("div");
      errorBox.className = "contact-form-error-message";

      successBox = document.createElement("div");
      successBox.className = "contact-form-success-message";

      statusWrap.appendChild(errorBox);
      statusWrap.appendChild(successBox);
      form.appendChild(statusWrap);
    }

    errorBox.setAttribute("aria-live", "polite");
    successBox.setAttribute("aria-live", "polite");

    form.addEventListener("submit", handleSubmit);
    if ((submitButton.getAttribute("type") || "").toLowerCase() !== "submit") {
      submitButton.addEventListener("click", handleSubmit);
    }

    function handleSubmit(event) {
      event.preventDefault();

      if (form.dataset.busy === "true") {
        return;
      }

      var email = readValue(form, "email");
      var message = readValue(form, "email-message");

      if (!email) {
        showError("Please enter your email address.");
        return;
      }

      if (!isValidEmail(email)) {
        showError("Please enter a valid email address.");
        return;
      }

      if (!message) {
        showError("Please enter your message.");
        return;
      }

      form.dataset.busy = "true";
      submitButton.disabled = true;
      submitButton.classList.add("is-loading");
      setButtonLabel(submitButton, "Sending...");
      clearStatus();

      window.setTimeout(function () {
        showSuccess("Thank you! Your message has been sent successfully. We'll get back to you soon.");
        form.reset();
        delete form.dataset.busy;
        submitButton.disabled = false;
        submitButton.classList.remove("is-loading");
        setButtonLabel(submitButton, submitButton.dataset.defaultLabel || "Send");
      }, SEND_DELAY_MS);
    }

    function showError(message) {
      clearStatus();
      errorBox.textContent = message;
      errorBox.className = "contact-form-error-message contact-form-error-message-with-border";
    }

    function showSuccess(message) {
      clearStatus();
      successBox.textContent = message;
      successBox.className = "contact-form-success-message contact-form-success-message-with-border";
    }

    function clearStatus() {
      errorBox.textContent = "";
      successBox.textContent = "";
      errorBox.className = "contact-form-error-message";
      successBox.className = "contact-form-success-message";
    }
  }

  function readValue(form, name) {
    var field = form.querySelector('[name="' + name + '"]');
    return field ? field.value.trim() : "";
  }

  function readButtonLabel(button) {
    return button.tagName === "INPUT" ? button.value : button.textContent;
  }

  function setButtonLabel(button, label) {
    if (button.tagName === "INPUT") {
      button.value = label;
      return;
    }
    button.textContent = label;
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
})();


