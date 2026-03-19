import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { IconLeaf } from "../components/icons/Icons";
import "./HeroLanding.css";

gsap.registerPlugin(ScrollTrigger);

const TITLE = "Habitflow";

const FEATURES = [
  {
    icon: "📊",
    labelKey: "hero.features.heatmap.title",
    descKey: "hero.features.heatmap.desc",
  },
  {
    icon: "🔥",
    labelKey: "hero.features.streaks.title",
    descKey: "hero.features.streaks.desc",
  },
  {
    icon: "📈",
    labelKey: "hero.features.analytics.title",
    descKey: "hero.features.analytics.desc",
  },
];

const STATS = [
  {
    display: "100+",
    numVal: 100,
    suffix: "+",
    labelKey: "hero.stats.daysTracked.label",
    descKey: "hero.stats.daysTracked.desc",
  },
  {
    display: "5×",
    numVal: 5,
    suffix: "×",
    labelKey: "hero.stats.moreLikely.label",
    descKey: "hero.stats.moreLikely.desc",
  },
  {
    display: "∞",
    numVal: null,
    suffix: "",
    labelKey: "hero.stats.possibilities.label",
    descKey: "hero.stats.possibilities.desc",
  },
];

const JOURNEY_STEPS = [
  {
    icon: "🧭",
    titleKey: "hero.journey.steps.capture.title",
    descKey: "hero.journey.steps.capture.desc",
  },
  {
    icon: "🧱",
    titleKey: "hero.journey.steps.consistency.title",
    descKey: "hero.journey.steps.consistency.desc",
  },
  {
    icon: "🚀",
    titleKey: "hero.journey.steps.momentum.title",
    descKey: "hero.journey.steps.momentum.desc",
  },
];

const CREATORS = [
  {
    name: "Kyuuto09",
    handle: "@Kyuuto09",
    url: "https://github.com/Kyuuto09/",
    avatar: "https://github.com/Kyuuto09.png",
  },
  {
    name: "axneo27",
    handle: "@axneo27",
    url: "https://github.com/axneo27",
    avatar: "https://github.com/axneo27.png",
  },
];

export default function HeroLanding() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const logoRef = useRef(null);
  const badgeRef = useRef(null);
  const scrollHintRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const ctaWrapRef = useRef(null);
  const featuresRef = useRef(null);
  const orb1Ref = useRef(null);
  const orb2Ref = useRef(null);
  const orb3Ref = useRef(null);
  const scrollSectionRef = useRef(null);

  // ── Bug fix: body has overflow:hidden from index.css; override for the landing page ──
  useEffect(() => {
    document.body.style.overflow = "auto";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // ── Initial states ──
      // titleRef intentionally excluded — the <h1> wrapper must stay visible;
      // individual .hero-char spans carry their own opacity/transform state.
      gsap.set(
        [
          logoRef.current,
          badgeRef.current,
          subtitleRef.current,
          ctaWrapRef.current,
          featuresRef.current,
          scrollHintRef.current,
        ],
        { opacity: 0 },
      );
      gsap.set(logoRef.current, { scale: 0.7, y: 10 });
      gsap.set(badgeRef.current, { y: -12, scale: 0.92 });
      gsap.set(".hero-char", { opacity: 0, y: 64 });
      gsap.set(subtitleRef.current, { y: 28 });
      gsap.set(ctaWrapRef.current, { y: 20 });
      gsap.set(featuresRef.current, { y: 32 });
      gsap.set(".feature-card", { opacity: 0, y: 40 });
      gsap.set([orb1Ref.current, orb2Ref.current, orb3Ref.current], {
        opacity: 0,
        scale: 0.4,
      });

      // ── Master entrance timeline ──
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      // Orbs bloom
      tl.to([orb1Ref.current, orb2Ref.current, orb3Ref.current], {
        opacity: 1,
        scale: 1,
        duration: 1.8,
        stagger: 0.2,
        ease: "power2.out",
      })
        // Logo mark
        .to(
          logoRef.current,
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.6,
            ease: "back.out(1.6)",
          },
          "-=1.5",
        )
        // Badge pill
        .to(
          badgeRef.current,
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.55,
            ease: "back.out(1.7)",
          },
          "-=0.35",
        )
        // Title characters waterfall
        .to(
          ".hero-char",
          {
            opacity: 1,
            y: 0,
            duration: 0.65,
            stagger: 0.045,
            ease: "back.out(1.4)",
          },
          "-=0.45",
        )
        // Subtitle fade-up
        .to(subtitleRef.current, { opacity: 1, y: 0, duration: 0.65 }, "-=0.25")
        // CTA row
        .to(ctaWrapRef.current, { opacity: 1, y: 0, duration: 0.5 }, "-=0.35")
        // Feature cards stagger
        .to(featuresRef.current, { opacity: 1, y: 0, duration: 0.1 }, "-=0.2")
        .to(
          ".feature-card",
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.1,
            ease: "back.out(1.2)",
          },
          "-=0.1",
        );

      // Scroll hint fades in after main sequence
      tl.to(
        scrollHintRef.current,
        { opacity: 1, duration: 0.6, ease: "power2.out" },
        "-=0.1",
      );

      // ── Logo dissolves — leaves a clean hero after its entrance moment ──
      tl.to(
        logoRef.current,
        {
          opacity: 0,
          scale: 1.12,
          filter: "blur(10px)",
          duration: 0.52,
          ease: "power2.in",
        },
        "+=0.42",
      ).to(
        logoRef.current,
        {
          height: 0,
          marginBottom: -28, // cancel the flex gap so badge glides up
          duration: 0.38,
          ease: "sine.inOut",
          onComplete: () => {
            if (logoRef.current) logoRef.current.style.visibility = "hidden";
          },
        },
        "-=0.28",
      );

      // Auto-hide scroll hint once user scrolls
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: "5% top",
        onEnterBack: () =>
          gsap.to(scrollHintRef.current, { opacity: 1, duration: 0.3 }),
        onLeave: () =>
          gsap.to(scrollHintRef.current, { opacity: 0, duration: 0.4 }),
      });

      // ── Idle floating orbs ──
      gsap.to(orb1Ref.current, {
        x: 50,
        y: -40,
        duration: 9,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
      gsap.to(orb2Ref.current, {
        x: -60,
        y: 50,
        duration: 12,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
      gsap.to(orb3Ref.current, {
        x: 40,
        y: 60,
        duration: 10,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // ── Mouse parallax on orbs ──
      const handleMouseMove = (e) => {
        const xR = (e.clientX / window.innerWidth - 0.5) * 2;
        const yR = (e.clientY / window.innerHeight - 0.5) * 2;
        gsap.to(orb1Ref.current, {
          x: xR * 35,
          y: yR * 25,
          duration: 1.6,
          ease: "power2.out",
          overwrite: "auto",
        });
        gsap.to(orb2Ref.current, {
          x: xR * -45,
          y: yR * -35,
          duration: 2.0,
          ease: "power2.out",
          overwrite: "auto",
        });
        gsap.to(orb3Ref.current, {
          x: xR * 25,
          y: yR * 40,
          duration: 1.8,
          ease: "power2.out",
          overwrite: "auto",
        });
      };
      window.addEventListener("mousemove", handleMouseMove);

      // ── Hero section scrolls away ──
      gsap.to(".hero-inner", {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "55% top",
          scrub: 1.2,
        },
        y: -90,
        opacity: 0,
        scale: 0.96,
      });

      // ── GSAP hover effects on feature cards ──
      document.querySelectorAll(".feature-card").forEach((card) => {
        const iconWrap = card.querySelector(".feature-icon-wrap");
        card.addEventListener("mouseenter", () => {
          gsap.to(iconWrap, {
            scale: 1.14,
            rotation: -6,
            duration: 0.3,
            ease: "back.out(2)",
          });
          gsap.to(card, { y: -6, duration: 0.3, ease: "power2.out" });
        });
        card.addEventListener("mouseleave", () => {
          gsap.to(iconWrap, { scale: 1, rotation: 0, duration: 0.35 });
          gsap.to(card, { y: 0, duration: 0.35 });
        });
      });

      // ── Divider scale-in ──
      gsap.from(".section-divider", {
        scrollTrigger: {
          trigger: ".section-divider",
          start: "top 92%",
          toggleActions: "play none none reverse",
        },
        scaleX: 0,
        opacity: 0,
        duration: 1.1,
        ease: "power3.out",
      });

      // ── Stat cards: scroll reveal + counter animation ──
      document.querySelectorAll(".stat-card").forEach((card, i) => {
        gsap.from(card, {
          scrollTrigger: {
            trigger: card,
            start: "top 86%",
            toggleActions: "play none none reverse",
          },
          y: 60,
          opacity: 0,
          duration: 0.7,
          delay: i * 0.12,
          ease: "power3.out",
        });

        const numEl = card.querySelector(".stat-number");
        const target = numEl?.dataset.target;
        const suffix = numEl?.dataset.suffix || "";

        if (target && target !== "null") {
          ScrollTrigger.create({
            trigger: card,
            start: "top 82%",
            once: true,
            onEnter: () => {
              const obj = { val: 0 };
              gsap.to(obj, {
                val: Number(target),
                duration: 1.6,
                ease: "power2.out",
                onUpdate: () => {
                  numEl.textContent =
                    Math.round(obj.val).toLocaleString() + suffix;
                },
              });
            },
          });
        }
      });

      // ── Final CTA section reveal ──
      gsap.from(".scroll-cta", {
        scrollTrigger: {
          trigger: ".scroll-cta",
          start: "top 82%",
          toggleActions: "play none none reverse",
        },
        y: 50,
        opacity: 0,
        duration: 0.85,
        ease: "power3.out",
      });

      // ── Journey section reveal ──
      gsap.from([".journey-kicker", ".journey-title", ".journey-subtitle"], {
        scrollTrigger: {
          trigger: ".journey-section",
          start: "top 84%",
          toggleActions: "play none none reverse",
        },
        y: 26,
        opacity: 0,
        duration: 0.68,
        stagger: 0.1,
        ease: "power3.out",
      });

      gsap.from(".journey-panel", {
        scrollTrigger: {
          trigger: ".journey-grid",
          start: "top 82%",
          toggleActions: "play none none reverse",
        },
        x: -36,
        y: 24,
        opacity: 0,
        duration: 0.75,
        ease: "power3.out",
      });

      gsap.from(".journey-proof-chip", {
        scrollTrigger: {
          trigger: ".journey-grid",
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
        y: 14,
        opacity: 0,
        duration: 0.45,
        stagger: 0.08,
        delay: 0.15,
        ease: "power2.out",
      });

      gsap.from(".journey-step", {
        scrollTrigger: {
          trigger: ".journey-grid",
          start: "top 82%",
          toggleActions: "play none none reverse",
        },
        x: 30,
        y: 22,
        opacity: 0,
        duration: 0.62,
        stagger: 0.1,
        ease: "back.out(1.35)",
      });

      // ── Creators section reveal ──
      gsap.from(".creators-label", {
        scrollTrigger: {
          trigger: ".creators-section",
          start: "top 88%",
          toggleActions: "play none none reverse",
        },
        y: 18,
        opacity: 0,
        duration: 0.5,
        ease: "power3.out",
      });

      gsap.from(".creators-title-text", {
        scrollTrigger: {
          trigger: ".creators-section",
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
        y: 32,
        opacity: 0,
        duration: 0.7,
        delay: 0.1,
        ease: "power3.out",
      });

      document.querySelectorAll(".creator-card").forEach((card, i) => {
        // Scroll entrance — cards fly in from opposite sides
        gsap.from(card, {
          scrollTrigger: {
            trigger: ".creators-grid",
            start: "top 82%",
            toggleActions: "play none none reverse",
          },
          x: i === 0 ? -80 : 80,
          y: 40,
          opacity: 0,
          scale: 0.9,
          rotation: i === 0 ? -5 : 5,
          duration: 0.8,
          delay: i * 0.15,
          ease: "back.out(1.5)",
        });

        // 3D magnetic tilt on hover
        card.addEventListener("mousemove", (e) => {
          const rect = card.getBoundingClientRect();
          const dx =
            (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
          const dy =
            (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
          const pctX = ((e.clientX - rect.left) / rect.width) * 100;
          const pctY = ((e.clientY - rect.top) / rect.height) * 100;
          card.style.setProperty("--cmx", `${pctX}%`);
          card.style.setProperty("--cmy", `${pctY}%`);
          gsap.to(card, {
            rotateY: dx * 12,
            rotateX: -dy * 12,
            transformPerspective: 900,
            duration: 0.35,
            ease: "power2.out",
            overwrite: "auto",
          });
        });

        card.addEventListener("mouseleave", () => {
          gsap.to(card, {
            rotateY: 0,
            rotateX: 0,
            duration: 0.7,
            ease: "elastic.out(1, 0.45)",
            overwrite: "auto",
          });
        });
      });

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
      };
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleCTAClick = () => {
    gsap.to(containerRef.current, {
      opacity: 0,
      y: -16,
      duration: 0.38,
      ease: "power2.in",
      onComplete: () => navigate("/app"),
    });
  };

  return (
    <div className="landing" ref={containerRef}>
      {/* ── Background layer ── */}
      <div className="bg-layer">
        <div className="orb orb-1" ref={orb1Ref} />
        <div className="orb orb-2" ref={orb2Ref} />
        <div className="orb orb-3" ref={orb3Ref} />
        <div className="grid-overlay" />
        <div className="noise-overlay" />
      </div>

      {/* ── Hero section ── */}
      <section className="hero-section">
        <div className="hero-inner">
          {/* Logo */}
          <div className="logo-container" ref={logoRef}>
            <img src="/leaf.svg" alt="Habitflow" className="logo-icon" />
          </div>

          {/* Badge pill */}
          <div className="hero-badge" ref={badgeRef}>
            <span className="badge-dot" />
            <span>{t("hero.badge")}</span>
          </div>

          {/* Title — split into characters for GSAP */}
          <h1 className="landing-title" ref={titleRef} aria-label={TITLE}>
            {TITLE.split("").map((char, i) => (
              <span key={i} className="hero-char">
                {char}
              </span>
            ))}
          </h1>

          {/* Subtitle */}
          <p className="landing-subtitle" ref={subtitleRef}>
            {t("hero.subtitleLine1")}
            <br />
            {t("hero.subtitleLine2")}
          </p>

          {/* CTA buttons */}
          <div className="cta-wrap" ref={ctaWrapRef}>
            <button className="landing-cta primary" onClick={handleCTAClick}>
              {t("hero.getStarted")}
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className="cta-icon"
              >
                <path
                  d="M6 3L11 8L6 13"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          {/* Feature cards */}
          <div className="features" ref={featuresRef}>
            {FEATURES.map((f, i) => (
              <div className="feature-card" key={i}>
                <div className="feature-icon-wrap">
                  <span className="feature-icon">{f.icon}</span>
                </div>
                <h3>{t(f.labelKey)}</h3>
                <p>{t(f.descKey)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll hint */}
        <div className="scroll-hint" ref={scrollHintRef}>
          <span className="scroll-hint-label">{t("hero.scroll")}</span>
          <div className="scroll-hint-arrow">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 3v10M4 9l4 4 4-4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="section-divider" />

      {/* ── Stats + final CTA ── */}
      <section className="scroll-section" ref={scrollSectionRef}>
        <div className="scroll-content">
          {STATS.map((s, i) => (
            <div className="stat-card" key={i}>
              <span
                className="stat-number"
                data-target={s.numVal}
                data-suffix={s.suffix}
              >
                {s.display}
              </span>
              <h3>{t(s.labelKey)}</h3>
              <p>{t(s.descKey)}</p>
            </div>
          ))}
        </div>

        <div className="scroll-cta">
          <p className="cta-eyebrow">{t("hero.startToday")}</p>
          <h2>{t("hero.transformTitle")}</h2>
          <button className="landing-cta primary" onClick={handleCTAClick}>
            {t("hero.startJourney")}
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className="cta-icon"
            >
              <path
                d="M6 3L11 8L6 13"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="section-divider" />

      {/* ── Journey narrative ── */}
      <section className="journey-section">
        <div className="journey-head">
          <p className="journey-kicker">{t("hero.journey.kicker")}</p>
          <h2 className="journey-title">{t("hero.journey.title")}</h2>
          <p className="journey-subtitle">{t("hero.journey.subtitle")}</p>
        </div>

        <div className="journey-grid">
          <div className="journey-panel">
            <p className="journey-panel-title">
              {t("hero.journey.panelTitle")}
            </p>
            <p className="journey-panel-desc">{t("hero.journey.panelDesc")}</p>

            <div className="journey-proof-row">
              <span className="journey-proof-chip">
                {t("hero.journey.proof1")}
              </span>
              <span className="journey-proof-chip">
                {t("hero.journey.proof2")}
              </span>
              <span className="journey-proof-chip">
                {t("hero.journey.proof3")}
              </span>
            </div>
          </div>

          <div className="journey-steps">
            {JOURNEY_STEPS.map((step, i) => (
              <div className="journey-step" key={i}>
                <div className="journey-step-icon">{step.icon}</div>
                <div className="journey-step-copy">
                  <h3>{t(step.titleKey)}</h3>
                  <p>{t(step.descKey)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="section-divider" />

      {/* ── Creators ── */}
      <section className="creators-section">
        <div className="creators-heading-wrap">
          <span className="creators-label">{t("hero.team")}</span>
          <h2 className="creators-title-text">{t("hero.craftedBy")}</h2>
        </div>
        <div className="creators-grid">
          {CREATORS.map((c, i) => (
            <a
              key={i}
              className="creator-card"
              href={c.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="creator-avatar-ring">
                <img className="creator-avatar" src={c.avatar} alt={c.name} />
              </div>
              <span className="creator-name">{c.name}</span>
              <span className="creator-handle">{c.handle}</span>
              <div className="creator-github-btn">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                </svg>
                {t("hero.viewProfile")}
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
