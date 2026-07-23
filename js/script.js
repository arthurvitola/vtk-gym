/* VTK Gym — interações em JavaScript puro */
document.addEventListener('DOMContentLoaded', () => {
  const navbar = document.querySelector('.navbar');
  const menuToggle = document.querySelector('.menu-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');
  const backToTop = document.querySelector('.back-to-top');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const darkSections = document.querySelectorAll('.hero, .section-dark, .cta-section');

  /* Menu mobile */
  const closeMenu = () => {
    menuToggle.classList.remove('active');
    navMenu.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Abrir menu');
    document.body.classList.remove('menu-open');
  };

  menuToggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('open');
    menuToggle.classList.toggle('active', isOpen);
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
    document.body.classList.toggle('menu-open', isOpen);
  });

  navLinks.forEach((link) => link.addEventListener('click', closeMenu));

  /* Navbar dinâmica e botão de topo */
  const updateHeader = () => {
    const shouldCondense = window.scrollY > 36;
    navbar.classList.toggle('scrolled', shouldCondense);
    const navigationHeight = navbar.getBoundingClientRect().height;
    const isOverDarkSection = [...darkSections].some((section) => {
      const bounds = section.getBoundingClientRect();
      return bounds.top <= navigationHeight && bounds.bottom > navigationHeight;
    });
    navbar.classList.toggle('dark-surface', shouldCondense && isOverDarkSection);
    backToTop.classList.toggle('visible', window.scrollY > 550);
  };
  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* Animação de entrada e contadores */
  const revealItems = document.querySelectorAll('.reveal');
  const counters = document.querySelectorAll('.counter');

  const animateCounter = (counter) => {
    if (counter.dataset.animated) return;
    counter.dataset.animated = 'true';

    const target = Number(counter.dataset.target);
    const suffix = counter.dataset.suffix || '';
    const duration = prefersReducedMotion ? 0 : 1400;
    const startTime = performance.now();

    const update = (currentTime) => {
      const progress = duration ? Math.min((currentTime - startTime) / duration, 1) : 1;
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      counter.textContent = `${Math.floor(target * easedProgress).toLocaleString('pt-BR')}${suffix}`;
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  };

  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      if (entry.target.classList.contains('counter')) animateCounter(entry.target);
      currentObserver.unobserve(entry.target);
    });
  }, { threshold: 0.14 });

  revealItems.forEach((item) => observer.observe(item));
  counters.forEach((counter) => observer.observe(counter));

  /* ScrollSpy */
  const sectionIds = ['inicio', 'sobre', 'estrutura', 'planos', 'treinadores', 'depoimentos', 'contato'];
  const sections = sectionIds.map((id) => document.getElementById(id)).filter(Boolean);
  const setActiveLink = (id) => {
    navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${id}`));
  };
  const scrollSpy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => { if (entry.isIntersecting) setActiveLink(entry.target.id); });
  }, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });
  sections.forEach((section) => scrollSpy.observe(section));

  /* Lightbox da galeria */
  const galleryItems = [...document.querySelectorAll('.gallery-item')];
  const lightbox = document.querySelector('#lightbox');
  const lightboxImage = document.querySelector('.lightbox-image');
  const lightboxClose = document.querySelector('.lightbox-close');
  const lightboxPrev = document.querySelector('.lightbox-prev');
  const lightboxNext = document.querySelector('.lightbox-next');
  let currentImageIndex = 0;
  let previouslyFocusedElement;

  const showLightboxImage = (index) => {
    currentImageIndex = (index + galleryItems.length) % galleryItems.length;
    const item = galleryItems[currentImageIndex];
    lightboxImage.src = item.dataset.image;
    lightboxImage.alt = item.dataset.alt;
  };
  const openLightbox = (index) => {
    previouslyFocusedElement = document.activeElement;
    showLightboxImage(index);
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');
    lightboxClose.focus();
  };
  const closeLightbox = () => {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-open');
    lightboxImage.src = '';
    if (previouslyFocusedElement) previouslyFocusedElement.focus();
  };
  galleryItems.forEach((item, index) => item.addEventListener('click', () => openLightbox(index)));
  lightboxClose.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', () => showLightboxImage(currentImageIndex - 1));
  lightboxNext.addEventListener('click', () => showLightboxImage(currentImageIndex + 1));
  lightbox.addEventListener('click', (event) => { if (event.target === lightbox) closeLightbox(); });

  /* Slider de depoimentos */
  const track = document.querySelector('.testimonials-track');
  const slides = [...document.querySelectorAll('.testimonial-slide')];
  const dots = [...document.querySelectorAll('.slider-dot')];
  const prevButton = document.querySelector('.slider-prev');
  const nextButton = document.querySelector('.slider-next');
  const slider = document.querySelector('.testimonials-slider');
  let activeSlide = 0;
  let sliderTimer;

  const goToSlide = (index) => {
    activeSlide = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${activeSlide * 100}%)`;
    dots.forEach((dot, dotIndex) => {
      const isActive = dotIndex === activeSlide;
      dot.classList.toggle('active', isActive);
      dot.setAttribute('aria-selected', String(isActive));
    });
  };
  const startSlider = () => {
    if (prefersReducedMotion) return;
    clearInterval(sliderTimer);
    sliderTimer = setInterval(() => goToSlide(activeSlide + 1), 6000);
  };
  prevButton.addEventListener('click', () => { goToSlide(activeSlide - 1); startSlider(); });
  nextButton.addEventListener('click', () => { goToSlide(activeSlide + 1); startSlider(); });
  dots.forEach((dot, index) => dot.addEventListener('click', () => { goToSlide(index); startSlider(); }));
  slider.addEventListener('mouseenter', () => clearInterval(sliderTimer));
  slider.addEventListener('mouseleave', startSlider);
  slider.addEventListener('focusin', () => clearInterval(sliderTimer));
  slider.addEventListener('focusout', startSlider);
  startSlider();

  /* Formulário, máscara de telefone e validação */
  const form = document.querySelector('#contact-form');
  const phoneInput = document.querySelector('#phone');
  const feedback = document.querySelector('#form-feedback');
  const fields = {
    name: { input: document.querySelector('#name'), message: 'Informe seu nome.' },
    phone: { input: phoneInput, message: 'Informe um telefone válido com DDD.' },
    email: { input: document.querySelector('#email'), message: 'Informe um e-mail válido.' },
    message: { input: document.querySelector('#message'), message: 'Escreva uma mensagem para a nossa equipe.' }
  };
  const formatPhone = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits.replace(/(\d{0,2})/, '($1');
    if (digits.length <= 6) return digits.replace(/(\d{2})(\d+)/, '($1) $2');
    if (digits.length <= 10) return digits.replace(/(\d{2})(\d{4})(\d+)/, '($1) $2-$3');
    return digits.replace(/(\d{2})(\d{5})(\d+)/, '($1) $2-$3');
  };
  phoneInput.addEventListener('input', (event) => { event.target.value = formatPhone(event.target.value); });

  const showFieldError = (fieldName, message = '') => {
    const field = fields[fieldName];
    const container = field.input.closest('.form-field');
    const error = document.querySelector(`#${fieldName}-error`);
    container.classList.toggle('has-error', Boolean(message));
    field.input.setAttribute('aria-invalid', String(Boolean(message)));
    error.textContent = message;
  };
  const validateField = (fieldName) => {
    const { input, message } = fields[fieldName];
    const value = input.value.trim();
    let error = '';
    if (!value) error = message;
    if (fieldName === 'phone' && value.replace(/\D/g, '').length < 10) error = message;
    if (fieldName === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = message;
    showFieldError(fieldName, error);
    return !error;
  };
  Object.keys(fields).forEach((fieldName) => fields[fieldName].input.addEventListener('blur', () => validateField(fieldName)));
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const isValid = Object.keys(fields).every(validateField);
    if (!isValid) {
      feedback.textContent = 'Revise os campos destacados antes de enviar.';
      feedback.style.color = '#c93400';
      form.querySelector('[aria-invalid="true"]').focus();
      return;
    }
    feedback.textContent = 'Mensagem enviada com sucesso! Em breve entraremos em contato.';
    feedback.style.color = '#14813c';
    form.reset();
    Object.keys(fields).forEach((fieldName) => showFieldError(fieldName));
  });

  /* Teclas globais e encerramento de menu em desktop */
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (lightbox.classList.contains('is-open')) closeLightbox();
      if (navMenu.classList.contains('open')) closeMenu();
    }
    if (lightbox.classList.contains('is-open') && event.key === 'ArrowLeft') showLightboxImage(currentImageIndex - 1);
    if (lightbox.classList.contains('is-open') && event.key === 'ArrowRight') showLightboxImage(currentImageIndex + 1);
  });
  window.addEventListener('resize', () => { if (window.innerWidth > 760) closeMenu(); });

  document.querySelector('#current-year').textContent = new Date().getFullYear();
});
