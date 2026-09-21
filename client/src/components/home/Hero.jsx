import { useEffect, useRef } from "react";
import { ArrowDown, ArrowUpRight, CalendarDays, MapPin } from "lucide-react";
import gsap from "gsap";

import logo from "../../assets/unarvv-logo.png";

function Hero() {
  const heroRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hero-reveal", {
        y: 35,
        opacity: 0,
        duration: 0.85,
        stagger: 0.12,
        ease: "power3.out",
      });

      gsap.from(".hero-ray", {
        scale: 0.7,
        opacity: 0,
        duration: 1.4,
        ease: "power3.out",
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      id="home"
      className="relative flex min-h-[calc(100vh-114px)] items-center overflow-hidden py-16"
    >
      <div className="hero-ray pointer-events-none absolute left-1/2 top-1/2 h-[620px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(240,173,10,0.22)_0%,rgba(240,173,10,0.08)_35%,transparent_70%)]" />

      <div className="pointer-events-none absolute -right-32 top-16 h-72 w-72 rounded-full border-[45px] border-[rgba(151,29,32,0.05)]" />

      <div className="pointer-events-none absolute -bottom-40 -left-40 h-96 w-96 rounded-full border-[65px] border-[rgba(240,173,10,0.08)]" />

      <div className="container-custom relative z-10">
        <div className="mx-auto max-w-5xl text-center">
          <div className="hero-reveal mb-7 flex justify-center">
            <img
              src={logo}
              alt="UNARVV '26"
              className="h-24 w-auto object-contain sm:h-32 md:h-40"
            />
          </div>

          <p className="hero-reveal small-label mb-5">
            Syro Malabar Youth Movement
          </p>

          <h1 className="hero-reveal display-heading">
            Refine.
            <br />
            Renew.
            <span className="block text-[var(--gold)]">Reborn.</span>
          </h1>

          <p className="hero-reveal mx-auto mt-7 max-w-2xl text-sm leading-7 text-[var(--muted)] sm:text-base">
            Two days of faith, friendship, celebration and transformation.
            Come together as one generation and experience UNARVV '26.
          </p>

          <div className="hero-reveal mt-8 flex flex-wrap justify-center gap-x-6 gap-y-3 text-xs font-bold uppercase tracking-[0.08em] text-[var(--brown)] sm:text-sm">
            <span className="flex items-center gap-2">
              <CalendarDays size={17} className="text-[var(--red)]" />
              17–18 October 2026
            </span>

            <span className="flex items-center gap-2">
              <MapPin size={17} className="text-[var(--red)]" />
              St. Francis School, Kokkada
            </span>
          </div>

          <div className="hero-reveal mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href="#register" className="primary-button">
              Claim Your Pass
              <ArrowUpRight size={17} />
            </a>

            <a href="#about" className="outline-button">
              Explore UNARVV
            </a>
          </div>

          <a
            href="#about"
            className="hero-reveal mx-auto mt-12 flex w-fit flex-col items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--red)]"
          >
            Scroll to discover
            <ArrowDown size={17} />
          </a>
        </div>
      </div>
    </section>
  );
}

export default Hero;