import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useNavigate } from "react-router-dom";
import "./HeroLanding.css";

gsap.registerPlugin(ScrollTrigger);

const TITLE = "Habitflow";

const FEATURES = [
  {
    icon: "📊",
    label: "Heatmap Tracking",
    desc: "Visualize your consistency with GitHub-style heatmaps",
  },
  {
    icon: "🔥",
    label: "Streaks",
    desc: "Build momentum and watch your streaks grow daily",
  },
  {
    icon: "📈",
    label: "Analytics",
    desc: "Weekly & monthly deep-dive insights on your habits",
  },
];

const STATS = [
  {
    display: "100+",
    numVal: 100,
    suffix: "+",
    label: "Days Tracked",
    desc: "Build consistency that lasts",
  },
  {
    display: "5×",
    numVal: 5,
    suffix: "×",
    label: "More Likely",
    desc: "Users who stick to their habits",
  },
  {
    display: "∞",
    numVal: null,
    suffix: "",
    label: "Possibilities",
    desc: "Create unlimited habits",
  },
];

export default function HeroLanding() {
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
      gsap.set(".hero-char", { opacity: 0, y: 64, rotateX: -90 });
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
            rotateX: 0,
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
            <span>Now available — free to use</span>
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
            Build better habits, one day at a time.
            <br />
            Track your progress with clean, beautiful insights.
          </p>

          {/* CTA buttons */}
          <div className="cta-wrap" ref={ctaWrapRef}>
            <button className="landing-cta primary" onClick={handleCTAClick}>
              Get Started
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
                <h3>{f.label}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll hint */}
        <div className="scroll-hint" ref={scrollHintRef}>
          <span className="scroll-hint-label">Scroll to explore</span>
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
              <h3>{s.label}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="scroll-cta">
          <p className="cta-eyebrow">Start today</p>
          <h2>Ready to transform your habits?</h2>
          <button className="landing-cta primary" onClick={handleCTAClick}>
            Start Your Journey
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
    </div>
  );
}
