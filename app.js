(() => {
  "use strict";

  const root = document.documentElement;

  /** HERO / 3D SCENES: no automatic rotation, mouse only */
  const motionScenes = document.querySelectorAll("#hero, .projection-scene");
  let tx = 0, ty = 0, cx = 0, cy = 0;

  motionScenes.forEach((scene) => {
    scene.addEventListener("pointermove", (event) => {
      const rect = scene.getBoundingClientRect();
      tx = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      ty = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    }, { passive: true });

    scene.addEventListener("pointerleave", () => {
      tx = 0;
      ty = 0;
    });
  });

  /** CUSTOM CURSOR */
  const cursorDot = document.querySelector(".cursor-dot");
  let mx = 0, my = 0, dx = 0, dy = 0;

  window.addEventListener("pointermove", (event) => {
    mx = event.clientX;
    my = event.clientY;
  }, { passive: true });

  function raf() {
    cx += (tx - cx) * 0.06;
    cy += (ty - cy) * 0.06;
    root.style.setProperty("--mx", cx.toFixed(4));
    root.style.setProperty("--my", cy.toFixed(4));

    if (cursorDot) {
      dx += (mx - dx) * 0.18;
      dy += (my - dy) * 0.18;
      cursorDot.style.transform = `translate(${dx}px, ${dy}px) translate(-50%, -50%)`;
    }

    requestAnimationFrame(raf);
  }
  raf();

  /** MATTE GLASS MENU */
  const menu = document.getElementById("siteMenu");
  const open = document.getElementById("menuOpen");
  const close = document.getElementById("menuClose");

  const setMenu = (state) => {
    if (!menu) return;
    menu.classList.toggle("is-open", state);
    menu.setAttribute("aria-hidden", state ? "false" : "true");
    document.body.classList.toggle("menu-open", state);
  };

  open?.addEventListener("click", () => setMenu(true));
  close?.addEventListener("click", () => setMenu(false));
  menu?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false)));
  window.addEventListener("keydown", (event) => { if (event.key === "Escape") setMenu(false); });

  /** AUDIO PLAYER */
  const audio = document.getElementById("audio");
  const audioBtn = document.getElementById("audioBtn");
  const audioPlayer = document.querySelector(".audio-player");

  audioBtn?.addEventListener("click", async () => {
    if (!audio) return;
    try {
      if (audio.paused) {
        await audio.play();
        audioBtn.textContent = "PAUSE";
        audioPlayer?.classList.add("is-playing");
      } else {
        audio.pause();
        audioBtn.textContent = "PLAY";
        audioPlayer?.classList.remove("is-playing");
      }
    } catch (error) {
      console.warn("Audio playback failed", error);
    }
  });

  if (!window.gsap || !window.ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);

  /** LENIS */
  if (window.Lenis) {
    const lenis = new Lenis({ lerp: 0.085, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  /** REVEALS */
  gsap.utils.toArray(".reveal-up").forEach((el) => {
    gsap.fromTo(el,
      { opacity: 0, y: 80 },
      {
        opacity: 1,
        y: 0,
        duration: 1.1,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 82%", once: true }
      }
    );
  });

  /** SOFT HERO TITLE PARALLAX */
  const heroTitle = document.querySelector(".hero-title");
  const heroScene = document.querySelector(".hero-scene");
  if (heroTitle && heroScene) {
    gsap.fromTo(heroTitle,
      { yPercent: 0 },
      {
        yPercent: -18,
        ease: "none",
        scrollTrigger: { trigger: heroScene, start: "top top", end: "bottom top", scrub: 1 }
      }
    );
  }

  /** STRONG CARD PARALLAX */
  document.querySelectorAll(".team-card, .h-panel, .poster-card, .page-card, .merch-card, .booking-card").forEach((card) => {
    card.style.transformStyle = "preserve-3d";
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(1200px) rotateX(${(-y * 14).toFixed(2)}deg) rotateY(${(x * 14).toFixed(2)}deg) translateZ(24px)`;
    }, { passive: true });
    card.addEventListener("pointerleave", () => {
      card.style.transform = "perspective(1200px) rotateX(0deg) rotateY(0deg) translateZ(0px)";
    });
  });

  /** HORIZONTAL SCROLL: 3 panels, exact calculated distance */
  const horizontalSection = document.querySelector(".horizontal-section");
  const horizontalTrack = document.getElementById("horizontalTrack");

  if (horizontalSection && horizontalTrack) {
    const getDistance = () => Math.max(1, horizontalTrack.scrollWidth - window.innerWidth);

    gsap.to(horizontalTrack, {
      x: () => -getDistance(),
      ease: "none",
      scrollTrigger: {
        trigger: horizontalSection,
        start: "top top",
        end: () => "+=" + getDistance(),
        scrub: 1,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true
      }
    });
  }

  /** PROJECTION 3D BLOCKS */
  gsap.utils.toArray(".projection-section").forEach((section) => {
    const image = section.querySelector(".projection-figure");
    const title = section.querySelector(".projection-title");
    if (image) {
      gsap.fromTo(image,
        { yPercent: 8, scale: 0.94 },
        {
          yPercent: -8,
          scale: 1.04,
          ease: "none",
          scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: 1 }
        }
      );
    }
    if (title) {
      gsap.fromTo(title,
        { xPercent: -8 },
        {
          xPercent: 8,
          ease: "none",
          scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: 1 }
        }
      );
    }
  });

  window.addEventListener("load", () => ScrollTrigger.refresh());
  window.addEventListener("resize", () => ScrollTrigger.refresh());
})();


/* Progulki mobile guard */
(() => {
  const mobile = () => window.matchMedia("(max-width: 900px)").matches;
  function guard(){
    if(!mobile()) return;
    const track = document.getElementById("horizontalTrack");
    if(track) track.style.transform = "none";
    if(window.ScrollTrigger) ScrollTrigger.refresh();
  }
  window.addEventListener("load", guard);
  window.addEventListener("resize", guard, {passive:true});
})();


/* 1-second site preloader */
(() => {
  const preloader = document.getElementById("sitePreloader");
  if (!preloader) return;
  window.addEventListener("load", () => {
    setTimeout(() => {
      preloader.classList.add("is-hidden");
      setTimeout(() => preloader.remove(), 650);
    }, 1000);
  });
})();
