document.addEventListener("DOMContentLoaded", function () {
  initNavigation();
  initPasswordToggles();
  initAuthForms();
  initBackTop();
});

function initNavigation() {
  var body = document.body;
  var searchWrap = document.getElementById("nav-search");
  var showSearch = document.querySelector(".show-search");
  var hideSearch = document.querySelector(".hide-search");
  var mobileToggle = document.querySelector(".mobile-menu-toggle");
  var mobileMenuWrap = document.querySelector(".mobile-menu-wrap");
  var submenuToggles = document.querySelectorAll(".mobile-menu .submenu-toggle");

  if (showSearch && searchWrap) {
    showSearch.addEventListener("click", function (event) {
      event.preventDefault();
      searchWrap.style.display = "block";
      var input = searchWrap.querySelector(".search-input");
      if (input) {
        input.focus();
      }
    });
  }

  if (hideSearch && searchWrap) {
    hideSearch.addEventListener("click", function (event) {
      event.preventDefault();
      searchWrap.style.display = "";
    });
  }

  if (mobileToggle) {
    mobileToggle.addEventListener("click", function (event) {
      event.preventDefault();
      body.classList.toggle("nav-active");
    });
  }

  submenuToggles.forEach(function (toggle) {
    toggle.addEventListener("click", function (event) {
      event.preventDefault();
      var item = toggle.parentElement;
      if (!item) {
        return;
      }
      item.classList.toggle("show");
      var subMenu = item.querySelector(".m-sub");
      if (subMenu) {
        subMenu.style.display = item.classList.contains("show") ? "block" : "none";
      }
    });
  });

  document.addEventListener("click", function (event) {
    if (!body.classList.contains("nav-active")) {
      return;
    }
    var clickedToggle = mobileToggle && mobileToggle.contains(event.target);
    var clickedMenu = mobileMenuWrap && mobileMenuWrap.contains(event.target);
    if (!clickedToggle && !clickedMenu) {
      body.classList.remove("nav-active");
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") {
      return;
    }
    body.classList.remove("nav-active");
    if (searchWrap) {
      searchWrap.style.display = "";
    }
  });
}

function initPasswordToggles() {
  document.querySelectorAll("[data-password-toggle]").forEach(function (toggle) {
    toggle.addEventListener("click", function () {
      var selector = toggle.getAttribute("data-password-toggle");
      var input = document.querySelector(selector);
      if (!input) {
        return;
      }
      var showPassword = input.type === "password";
      input.type = showPassword ? "text" : "password";
      toggle.classList.toggle("is-visible", showPassword);
      toggle.setAttribute("aria-label", showPassword ? "Hide password" : "Show password");
    });
  });
}

function initAuthForms() {
  prefillFromQuery();
  document.querySelectorAll("[data-auth-form]").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (form.getAttribute("data-auth-form") === "register") {
        handleRegister(form);
        return;
      }
      handleLogin(form);
    });
  });
}

function handleRegister(form) {
  var name = readValue(form, "name");
  var email = normalizeEmail(readValue(form, "email"));
  var password = readValue(form, "password");
  var confirmPassword = readValue(form, "confirm_password");
  var terms = form.querySelector('[name="terms"]');

  if (!name || !email || !password || !confirmPassword) {
    setStatus(form, "error", "Please fill in all required fields.");
    return;
  }
  if (!isValidEmail(email)) {
    setStatus(form, "error", "Please enter a valid email address.");
    return;
  }
  if (password.length < 6) {
    setStatus(form, "error", "Password must contain at least 6 characters.");
    return;
  }
  if (password !== confirmPassword) {
    setStatus(form, "error", "Passwords do not match.");
    return;
  }
  if (terms && !terms.checked) {
    setStatus(form, "error", "Please accept the terms to continue.");
    return;
  }

  setStatus(
    form,
    "pending",
    "Your account request has been received and is now under review. We will activate it after processing."
  );
  form.reset();
}

function handleLogin(form) {
  var users = getStoredUsers();
  var email = normalizeEmail(readValue(form, "email"));
  var password = readValue(form, "password");
  var remember = form.querySelector('[name="remember"]');
  var user = users.find(function (item) { return item.email === email; });

  if (!email || !password) {
    setStatus(form, "error", "Please enter your email and password.");
    return;
  }
  if (!isValidEmail(email)) {
    setStatus(form, "error", "Please enter a valid email address.");
    return;
  }
  if (!user) {
    setStatus(form, "error", "Account not found. Create one first.");
    return;
  }
  if (user.password !== password) {
    setStatus(form, "error", "Incorrect password. Please try again.");
    return;
  }

  try {
    localStorage.setItem("site_auth_session", JSON.stringify({
      email: user.email,
      name: user.name,
      remember: Boolean(remember && remember.checked),
      signedInAt: new Date().toISOString()
    }));
  } catch (error) {
    setStatus(form, "error", "Unable to save the session in this browser.");
    return;
  }

  setStatus(form, "success", "Signed in successfully. Redirecting...");
  form.reset();
  window.setTimeout(function () {
    window.location.href = "index.html";
  }, 900);
}

function prefillFromQuery() {
  var params = new URLSearchParams(window.location.search);
  var email = params.get("email");
  var registered = params.get("registered");
  var loginForm = document.querySelector('[data-auth-form="login"]');

  if (loginForm && email) {
    var emailField = loginForm.querySelector('[name="email"]');
    if (emailField) {
      emailField.value = email;
    }
  }
  if (loginForm && registered === "1") {
    setStatus(loginForm, "success", "Account created. You can sign in now.");
  }
}

function initBackTop() {
  var backTop = document.querySelector(".back-top");
  if (!backTop) {
    return;
  }
  function syncBackTop() {
    backTop.style.display = window.scrollY > 300 ? "block" : "none";
  }
  syncBackTop();
  window.addEventListener("scroll", syncBackTop, { passive: true });
  backTop.addEventListener("click", function (event) {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

function setStatus(form, type, message) {
  var box = form.querySelector(".auth-status");
  if (!box) {
    return;
  }
  box.textContent = message;
  var statusClass = "is-error";
  if (type === "success") {
    statusClass = "is-success";
  } else if (type === "pending") {
    statusClass = "is-pending";
  }
  box.className = "auth-status is-visible " + statusClass;
}

function readValue(form, name) {
  var field = form.querySelector('[name="' + name + '"]');
  return field ? field.value.trim() : "";
}

function normalizeEmail(value) {
  return value.trim().toLowerCase();
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function getStoredUsers() {
  try {
    var raw = localStorage.getItem("site_auth_users");
    var parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function saveStoredUsers(users) {
  localStorage.setItem("site_auth_users", JSON.stringify(users));
}
