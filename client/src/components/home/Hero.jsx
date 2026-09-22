import { useEffect, useRef } from "react";
import {
  ArrowDown,
  ArrowUpRight,
  CalendarDays,
  MapPin,
} from "lucide-react";
import gsap from "gsap";

import logo from "../../assets/unarvv-logo.png";
import smymLogo from "../../assets/smym-logo.png";

function Hero() {
  const heroRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hero-reveal", {
        y: 28,
        opacity: 0,
        duration: 0.85,
        stagger: 0.1,
        ease: "power3.out",
      });

      gsap.from(".hero-ray", {
        scale: 0.78,
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
      className="
        relative
        flex
        min-h-[calc(100vh-114px)]
        items-center
        overflow-hidden
        bg-[var(--cream)]
        py-14
        sm:py-16
        lg:py-20
      "
    >
      {/* ================================================================
          BACKGROUND DECORATION
      ================================================================= */}

      <div
        className="
          hero-ray
          pointer-events-none
          absolute
          left-1/2
          top-[32%]
          h-[420px]
          w-[420px]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-[radial-gradient(circle,rgba(240,173,10,0.15)_0%,rgba(240,173,10,0.06)_38%,transparent_70%)]
          sm:h-[540px]
          sm:w-[540px]
          lg:h-[650px]
          lg:w-[650px]
        "
      />

      {/* Large outer circle */}

      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-[31%]
          h-[300px]
          w-[300px]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          border
          border-[rgba(151,29,32,0.13)]
          sm:h-[400px]
          sm:w-[400px]
          lg:h-[500px]
          lg:w-[500px]
        "
      />

      {/* Dashed circle */}

      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-[31%]
          h-[240px]
          w-[240px]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          border
          border-dashed
          border-[rgba(240,173,10,0.24)]
          sm:h-[320px]
          sm:w-[320px]
          lg:h-[390px]
          lg:w-[390px]
        "
      />

      {/* Side decorative circles */}

      <div
        className="
          pointer-events-none
          absolute
          -right-32
          top-16
          h-72
          w-72
          rounded-full
          border-[45px]
          border-[rgba(151,29,32,0.04)]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -bottom-40
          -left-40
          h-96
          w-96
          rounded-full
          border-[65px]
          border-[rgba(240,173,10,0.06)]
        "
      />

      {/* ================================================================
          HERO CONTENT
      ================================================================= */}

      <div className="container-custom relative z-10">
        <div className="mx-auto max-w-5xl text-center">

          {/* ============================================================
              SMYM LOGO
          ============================================================= */}

{/* ============================================================
    EVENT BADGE
============================================================= */}

<div className="hero-reveal mb-8 flex w-full justify-center">
  <div
    className="
      flex
      w-fit
      max-w-full
      items-center
      justify-center
      gap-0.5
      rounded-full
      border
      border-[rgba(151,29,32,0.22)]
      bg-[rgba(151,29,32,0.06)]
      px-3
      py-2.5
      text-center
      font-black
      uppercase
      text-[var(--red)]

      sm:gap-1
      sm:px-5
      sm:py-3

      lg:gap-1
      lg:px-7
      lg:py-3
    "
  >
    {/* SMYM LOGO */}

    <img
      src={smymLogo}
      alt="SMYM Logo"
      className="
        h-[44px]
        w-[44px]
        shrink-0
        object-contain

        sm:h-[52px]
        sm:w-[52px]

        lg:h-[60px]
        lg:w-[60px]
      "
    />

    {/* GOLD DOT */}

    <span
      className="
        h-1.5
        w-1.5
        shrink-0
        rounded-full
        bg-[var(--gold)]

        sm:h-2
        sm:w-2
      "
    />

    {/* ORGANISATION NAME */}

    <span
      className="
        whitespace-nowrap
        text-[clamp(5.5px,1.75vw,11px)]
        leading-none
        tracking-[0.04em]

        sm:text-[9px]
        sm:tracking-[0.1em]

        md:text-[10px]

        lg:text-[11px]
        lg:tracking-[0.14em]
      "
    >
      Syro Malabar Youth Movement • Diocese of Belthangady
    </span>
  </div>
</div>
          {/* ============================================================
              UNARVV LOGO
          ============================================================= */}

          <div className="hero-reveal mb-5 flex justify-center sm:mb-6">
            <img
              src={logo}
              alt="UNARVV '26 Logo"
              className="
                h-[82px]
                w-auto
                object-contain
                sm:h-[105px]
                md:h-[120px]
              "
            />
          </div>

          {/* ============================================================
              MAIN EVENT NAME
          ============================================================= */}

          <h1
            className="
              hero-reveal
              whitespace-nowrap
              text-[clamp(3.25rem,12vw,8rem)]
              font-black
              uppercase
              leading-[0.82]
              tracking-[-0.065em]
              text-[var(--red)]
            "
          >
            UNARVV ’26
          </h1>

          {/* ============================================================
              THEME
          ============================================================= */}

          <div
            className="
              hero-reveal
              mt-7
              flex
              items-center
              justify-center
              gap-2
              font-black
              uppercase
              tracking-[0.05em]
              sm:mt-9
              sm:gap-3
              sm:tracking-[0.08em]
            "
          >
            <span
              className="
                text-[17px]
                text-[var(--red)]
                sm:text-[25px]
                md:text-[30px]
              "
            >
              Refine
            </span>

            <span
              className="
                h-1.5
                w-1.5
                rounded-full
                bg-[var(--gold)]
                sm:h-2
                sm:w-2
              "
            />

            <span
              className="
                text-[17px]
                text-[var(--gold)]
                sm:text-[25px]
                md:text-[30px]
              "
            >
              Renew
            </span>

            <span
              className="
                h-1.5
                w-1.5
                rounded-full
                bg-[var(--red)]
                sm:h-2
                sm:w-2
              "
            />

            <span
              className="
                text-[17px]
                text-[var(--red)]
                sm:text-[25px]
                md:text-[30px]
              "
            >
              Reborn
            </span>
          </div>

          {/* ============================================================
              DESCRIPTION
          ============================================================= */}

          <p
            className="
              hero-reveal
              mx-auto
              mt-7
              max-w-[720px]
              text-[13px]
              font-medium
              leading-6
              text-[var(--brown)]
              sm:mt-8
              sm:text-[15px]
              sm:leading-7
              md:text-base
            "
          >
            Two days of uncompromised faith, divine fire, friendship and
            generation-defining transformation. Step into an experience
            where old limits burn away and a bold faith is ignited.
          </p>

          {/* ============================================================
              BIBLE VERSE
          ============================================================= */}

          <p
            className="
              hero-reveal
              mx-auto
              mt-3
              max-w-xl
              text-[10px]
              font-semibold
              italic
              leading-5
              text-[var(--red)]
              sm:text-[11px]
            "
          >
            “He will sit as a refiner and purifier of silver...”
            <span className="ml-1 font-black not-italic">
              — Malachi 3:3
            </span>
          </p>

          {/* ============================================================
              EVENT INFORMATION
          ============================================================= */}

          <div
            className="
              hero-reveal
              mx-auto
              mt-8
              flex
              max-w-2xl
              flex-col
              items-center
              justify-center
              gap-3
              text-[10px]
              font-black
              uppercase
              tracking-[0.07em]
              text-[var(--brown)]
              sm:flex-row
              sm:flex-wrap
              sm:gap-x-7
              sm:text-xs
            "
          >
            <span className="flex items-center gap-2">
              <CalendarDays
                size={16}
                className="text-[var(--red)]"
              />

              17–18 October 2026
            </span>

            <span className="flex items-center gap-2">
              <MapPin
                size={16}
                className="text-[var(--red)]"
              />

              St. Francis School, Kokkada
            </span>
          </div>

          {/* ============================================================
              CTA BUTTONS
          ============================================================= */}

          <div
            className="
              hero-reveal
              mt-9
              flex
              flex-col
              items-center
              justify-center
              gap-3
              sm:flex-row
            "
          >
            <a
              href="#register"
              className="primary-button"
            >
              Claim Your Pass

              <ArrowUpRight size={17} />
            </a>

            <a
              href="#about"
              className="outline-button"
            >
              Explore UNARVV
            </a>
          </div>

          {/* ============================================================
              SCROLL INDICATOR
          ============================================================= */}

          <a
            href="#about"
            className="
              hero-reveal
              mx-auto
              mt-10
              flex
              w-fit
              flex-col
              items-center
              gap-2
              text-[9px]
              font-black
              uppercase
              tracking-[0.2em]
              text-[var(--red)]
              sm:mt-12
              sm:text-[10px]
            "
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