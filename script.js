(() => {
  const root = document.documentElement;
  const body = document.body;
  const preloader = document.querySelector(".preloader");
  const themeToggle = document.querySelector(".theme-toggle");
  const themeIcon = themeToggle?.querySelector("i");
  const toast = document.querySelector(".toast");
  const cursor = document.querySelector(".cursor");
  const cursorRing = document.querySelector(".cursor-ring");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const initialized = {};

  body.classList.add("preloading");

  const storedTheme = localStorage.getItem("rks-theme");
  const systemTheme = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  applyTheme(storedTheme || systemTheme, false);

  const revealDelay = reduceMotion ? 150 : 2200;
  let siteStarted = false;

  function revealSite() {
    if (siteStarted) return;
    siteStarted = true;
    preloader?.classList.add("is-hidden");
    body.classList.remove("preloading");
    initMotion();
  }

  function scheduleReveal() {
    window.setTimeout(revealSite, revealDelay);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", scheduleReveal, { once: true });
  } else {
    scheduleReveal();
  }

  window.setTimeout(revealSite, reduceMotion ? 500 : 3800);
  window.addEventListener("load", initMotion, { once: true });

  themeToggle?.addEventListener("click", () => {
    const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(nextTheme, true);
  });

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const target = document.querySelector(link.getAttribute("href"));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    });
  });

  function applyTheme(theme, notify) {
    root.dataset.theme = theme;
    localStorage.setItem("rks-theme", theme);
    if (themeIcon) {
      themeIcon.className = theme === "dark" ? "fa-solid fa-moon" : "fa-solid fa-sun";
    }
    if (notify) showToast(`${theme === "dark" ? "Dark" : "Light"} theme enabled`);
  }

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove("is-visible"), 1800);
  }

  function initMotion() {
    initParticles();
    initAOS();
    initGSAP();
    initCursor();
    initTilt();
    initCounters();
    initMagnetic();
  }

  function initParticles() {
    if (initialized.particles) return;
    if (!window.particlesJS || reduceMotion) return;
    initialized.particles = true;
    window.particlesJS("particles-js", {
      particles: {
        number: { value: 48, density: { enable: true, value_area: 900 } },
        color: { value: ["#FFD700", "#1E88E5", "#F8BBD0", "#5EEAD4"] },
        shape: { type: "circle" },
        opacity: { value: 0.35, random: true },
        size: { value: 3, random: true },
        line_linked: { enable: true, distance: 150, color: "#FFD700", opacity: 0.12, width: 1 },
        move: { enable: true, speed: 0.8, direction: "none", random: true, out_mode: "out" }
      },
      interactivity: {
        detect_on: "canvas",
        events: { onhover: { enable: true, mode: "grab" }, resize: true },
        modes: { grab: { distance: 150, line_linked: { opacity: 0.25 } } }
      },
      retina_detect: true
    });
  }

  function initAOS() {
    if (initialized.aos) return;
    if (!window.AOS) return;
    initialized.aos = true;
    window.AOS.init({
      duration: 900,
      easing: "ease-out-cubic",
      once: true,
      offset: 80,
      disable: () => reduceMotion
    });
  }

  function initGSAP() {
    if (initialized.gsap) return;
    if (!window.gsap || reduceMotion) return;
    initialized.gsap = true;
    const { gsap } = window;
    if (window.ScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);

    gsap.from(".hero .eyebrow, .hero__title span, .hero__title strong, .hero__subtitle, .hero__actions", {
      y: 36,
      opacity: 0,
      filter: "blur(12px)",
      duration: 1.1,
      stagger: 0.13,
      ease: "power3.out"
    });

    gsap.to(".profile-orbit", {
      yPercent: -8,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
    });

    gsap.utils.toArray(".cinematic span, .finale h2 span").forEach((line) => {
      gsap.from(line, {
        y: 40,
        opacity: 0,
        filter: "blur(10px)",
        duration: 0.85,
        ease: "power3.out",
        scrollTrigger: { trigger: line, start: "top 86%" }
      });
    });

    const track = document.querySelector(".publication-track");
    if (track && window.ScrollTrigger && window.innerWidth > 760) {
      gsap.to(track, {
        x: () => Math.min(0, window.innerWidth - track.scrollWidth - 120),
        ease: "none",
        scrollTrigger: { trigger: ".publications", start: "top top", end: "+=900", scrub: 1, pin: true }
      });
    }
  }

  function initCursor() {
    if (initialized.cursor) return;
    if (!cursor || !cursorRing || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    initialized.cursor = true;
    let x = 0;
    let y = 0;
    let ringX = 0;
    let ringY = 0;

    window.addEventListener("mousemove", (event) => {
      x = event.clientX;
      y = event.clientY;
      cursor.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
    });

    const render = () => {
      ringX += (x - ringX) * 0.18;
      ringY += (y - ringY) * 0.18;
      cursorRing.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
      requestAnimationFrame(render);
    };
    render();

    document.querySelectorAll("a, button, .tilt").forEach((item) => {
      item.addEventListener("mouseenter", () => cursorRing.classList.add("is-active"));
      item.addEventListener("mouseleave", () => cursorRing.classList.remove("is-active"));
    });
  }

  function initTilt() {
    if (initialized.tilt) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches || reduceMotion) return;
    initialized.tilt = true;
    document.querySelectorAll(".tilt").forEach((card) => {
      card.addEventListener("mousemove", (event) => {
        const rect = card.getBoundingClientRect();
        const rotateX = ((event.clientY - rect.top) / rect.height - 0.5) * -10;
        const rotateY = ((event.clientX - rect.left) / rect.width - 0.5) * 10;
        card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "rotateX(0deg) rotateY(0deg)";
      });
    });
  }

  function initCounters() {
    if (initialized.counters) return;
    const counters = document.querySelectorAll("[data-count]");
    if (!counters.length) return;
    initialized.counters = true;
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.55 });
    counters.forEach((counter) => observer.observe(counter));
  }

  function animateCounter(element) {
    const target = Number(element.dataset.count || 0);
    const duration = reduceMotion ? 1 : 1400;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = Math.round(target * eased).toString();
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  function initMagnetic() {
    if (initialized.magnetic) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches || reduceMotion) return;
    initialized.magnetic = true;
    document.querySelectorAll(".magnetic").forEach((item) => {
      item.addEventListener("mousemove", (event) => {
        const rect = item.getBoundingClientRect();
        const x = (event.clientX - rect.left - rect.width / 2) * 0.22;
        const y = (event.clientY - rect.top - rect.height / 2) * 0.22;
        item.style.transform = `translate(${x}px, ${y}px)`;
      });
      item.addEventListener("mouseleave", () => {
        item.style.transform = "translate(0, 0)";
      });
    });
  }
})();
