document.addEventListener('DOMContentLoaded', () => {

  
  const cursor = document.getElementById('cursor');
  const ring   = document.getElementById('cursorRing');
  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    cursor.style.left = mx - 5 + 'px';
    cursor.style.top  = my - 5 + 'px';
  });

  function lerpRing() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx - 19 + 'px';
    ring.style.top  = ry - 19 + 'px';
    requestAnimationFrame(lerpRing);
  }
  lerpRing();

  document.querySelectorAll('a, button, .practice-card, .testimonial-card, .attorney-card')
    .forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('expand'));
      el.addEventListener('mouseleave', () => ring.classList.remove('expand'));
    });

  
  const navbar      = document.getElementById('navbar');
  const progressBar = document.getElementById('progressBar');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
    const scrolled = window.scrollY / (document.body.scrollHeight - window.innerHeight);
    progressBar.style.transform = `scaleX(${scrolled})`;
  });

  
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  
  function animateCount(el, target, suffix) {
    let current  = 0;
    const duration = 1800;
    const interval = duration / target;
    const timer = setInterval(() => {
      current++;
      switch (suffix) {
        case 'M':  el.textContent = `$${current}M`; break;
        case '%':  el.textContent = `${current}%`;  break;
        default:   el.textContent = `${current}+`;  break;
      }
      if (current >= target) clearInterval(timer);
    }, interval);
  }

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.querySelectorAll('[data-count]').forEach(el => {
        const target  = parseInt(el.dataset.count, 10);
        const display = el.textContent;
        if      (display.includes('M')) animateCount(el, target, 'M');
        else if (display.includes('%')) animateCount(el, target, '%');
        else                            animateCount(el, target, '+');
      });
      statsObserver.unobserve(entry.target);
    });
  }, { threshold: 0.5 });

  const statsSection = document.querySelector('.hero-stats');
  if (statsSection) statsObserver.observe(statsSection);

  
  const form             = document.getElementById('contactForm');
  const submitBtn        = document.getElementById('submitBtn');
  const formSuccess      = document.getElementById('formSuccess');
  const formReset        = document.getElementById('formReset');
  const formErrorGeneral = document.getElementById('formErrorGeneral');

  if (!form) return; // guard if form isn't on page

  const validators = {
    firstName:    v => v.trim().length >= 2   ? null : 'Please enter your first name.',
    lastName:     v => v.trim().length >= 2   ? null : 'Please enter your last name.',
    email:        v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? null : 'Please enter a valid email address.',
    practiceArea: v => v !== ''               ? null : 'Please select a practice area.',
    message:      v => v.trim().length >= 20  ? null : 'Please describe your case (at least 20 characters).',
    consent:      v => v                      ? null : 'You must consent to be contacted.',
  };

  function getFieldValue(field) {
    if (field.type === 'checkbox') return field.checked;
    return field.value;
  }

  function showError(fieldName, message) {
    const errorEl = document.getElementById(`${fieldName}Error`);
    const inputEl = form.elements[fieldName];
    if (errorEl)  errorEl.textContent = message || '';
    if (inputEl) {
      if (message) inputEl.classList.add('invalid');
      else         inputEl.classList.remove('invalid');
    }
  }

  function validateField(fieldName) {
    const field     = form.elements[fieldName];
    const validator = validators[fieldName];
    if (!field || !validator) return true;
    const error = validator(getFieldValue(field));
    showError(fieldName, error);
    return !error;
  }

  function validateAll() {
    return Object.keys(validators)
      .map(name => validateField(name))
      .every(Boolean);
  }

  Object.keys(validators).forEach(name => {
    const field = form.elements[name];
    if (!field) return;
    field.addEventListener('blur',  () => validateField(name));
    field.addEventListener('input', () => validateField(name));
    field.addEventListener('change', () => validateField(name));
  });

  function setLoading(loading) {
    submitBtn.disabled = loading;
    submitBtn.classList.toggle('loading', loading);
  }

  function showGeneralError(message) {
    formErrorGeneral.textContent = message;
    formErrorGeneral.hidden = false;
  }
  function clearGeneralError() {
    formErrorGeneral.textContent = '';
    formErrorGeneral.hidden = true;
  }

  function showSuccess() {
    form.hidden       = true;
    formSuccess.hidden = false;
    formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  formReset?.addEventListener('click', () => {
    form.reset();
    Object.keys(validators).forEach(name => showError(name, null));
    clearGeneralError();
    form.hidden        = false;
    formSuccess.hidden = true;
  });

  function collectFormData() {
    return {
      firstName:    form.elements.firstName.value.trim(),
      lastName:     form.elements.lastName.value.trim(),
      email:        form.elements.email.value.trim(),
      phone:        form.elements.phone.value.trim(),
      practiceArea: form.elements.practiceArea.value,
      message:      form.elements.message.value.trim(),
    };
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearGeneralError();

    if (!validateAll()) {
      const firstInvalid = form.querySelector('.invalid, [aria-invalid="true"]');
      firstInvalid?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/contact', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(collectFormData()),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        showSuccess();
      } else {
        const msg = data?.error || 'Something went wrong. Please try again or call us directly.';
        showGeneralError(msg);
      }
    } catch (err) {
      showGeneralError(
        'Unable to send your message — please check your connection or call us at (800) 555-1947.'
      );
    } finally {
      setLoading(false);
    }
  });

});

