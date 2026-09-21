import {
  ArrowUp,
  CalendarDays,
  MapPin,
  Ticket,
} from "lucide-react";

import logo from "../../assets/unarvv-logo.png";

function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[var(--red)] text-white">

      {/* ================================================================
          DECORATIVE BACKGROUND
      ================================================================= */}

      <div className="pointer-events-none absolute -bottom-44 -right-32 h-[420px] w-[420px] rounded-full border-[70px] border-white/[0.035]" />

      <div className="pointer-events-none absolute -left-32 top-20 h-[280px] w-[280px] rounded-full border-[45px] border-[rgba(240,173,10,0.06)]" />

      <div className="container-custom relative z-10">

        {/* ================================================================
            MAIN FOOTER
        ================================================================= */}

        <div
          className="
            grid
            gap-12
            py-12
            sm:py-14
            lg:grid-cols-[1.15fr_0.85fr]
            lg:items-start
            lg:gap-16
            lg:py-16
          "
        >

          {/* ==============================================================
              BRAND
          =============================================================== */}

          <div>
            <a
              href="#home"
              className="group inline-flex items-center gap-3 sm:gap-5"
              aria-label="UNARVV '26 Home"
            >
              {/* LOGO */}

              <div
                className="
                  flex
                  h-[70px]
                  w-[70px]
                  shrink-0
                  items-center
                  justify-center
                  sm:h-[96px]
                  sm:w-[96px]
                "
              >
                <img
                  src={logo}
                  alt="UNARVV '26 Logo"
                  className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              {/* WORDMARK */}

              <div>
                <h2
                  className="
                    text-[28px]
                    font-black
                    uppercase
                    leading-none
                    tracking-[-0.055em]
                    text-[var(--gold)]
                    sm:text-4xl
                  "
                >
                  UNARVV '26
                </h2>

                <p
                  className="
                    mt-2
                    whitespace-nowrap
                    text-[8px]
                    font-black
                    uppercase
                    tracking-[0.16em]
                    text-[var(--gold)]
                    sm:text-xs
                    sm:tracking-[0.22em]
                  "
                >
                  Refine • Renew • Reborn
                </p>
              </div>
            </a>

            {/* DESCRIPTION */}

            <p
              className="
                mt-7
                max-w-xl
                text-sm
                leading-7
                text-white/65
                sm:text-[15px]
              "
            >
             UNARVV'26 is an Interdenominational Youth Movement committed to
awakening a holy, unashamed generation through radicalbiblical truth, fervent
worship, and genuine community.
            </p>

            {/* ============================================================
                EVENT INFO
            ============================================================= */}

            <div
              className="
                mt-7
                flex
                flex-col
                gap-3
                text-[11px]
                font-bold
                uppercase
                tracking-[0.07em]
                text-white/75
                sm:flex-row
                sm:flex-wrap
                sm:gap-x-7
                sm:text-xs
                sm:tracking-[0.08em]
              "
            >
              <span className="flex items-center gap-2">
                <CalendarDays
                  size={16}
                  className="shrink-0 text-[var(--gold)]"
                />

                17–18 October 2026
              </span>

              <span className="flex items-center gap-2">
                <MapPin
                  size={16}
                  className="shrink-0 text-[var(--gold)]"
                />

                St. Francis School, Kokkada
              </span>
            </div>
          </div>

          {/* ==============================================================
              EXPLORE / LINKS
          =============================================================== */}

          <div
            className="
              w-full
              lg:max-w-[520px]
              lg:justify-self-end
            "
          >
            {/* HEADING */}

            <p
              className="
                mb-6
                text-[10px]
                font-black
                uppercase
                tracking-[0.22em]
                text-[var(--gold)]
              "
            >
              Explore
            </p>

            {/* NAVIGATION */}

            <nav
              className="
                grid
                grid-cols-2
                gap-x-6
                gap-y-5
                text-xs
                font-black
                uppercase
                tracking-[0.12em]
                sm:grid-cols-4
                sm:gap-x-8
                lg:grid-cols-2
                lg:gap-x-16
                lg:gap-y-5
              "
              aria-label="Footer navigation"
            >
              <a
                href="#about"
                className="w-fit transition-colors duration-200 hover:text-[var(--gold)]"
              >
                About
              </a>

              <a
                href="#experience"
                className="w-fit transition-colors duration-200 hover:text-[var(--gold)]"
              >
                Experience
              </a>

              <a
                href="#schedule"
                className="w-fit transition-colors duration-200 hover:text-[var(--gold)]"
              >
                Schedule
              </a>

              <a
                href="#faq"
                className="w-fit transition-colors duration-200 hover:text-[var(--gold)]"
              >
                FAQ
              </a>
            </nav>

            {/* GET TICKETS */}

            <a
              href="#register"
              className="
                mt-8
                inline-flex
                min-h-[50px]
                items-center
                justify-center
                gap-2
                rounded-full
                bg-[var(--gold)]
                px-7
                text-xs
                font-black
                uppercase
                tracking-[0.1em]
                text-[var(--red)]
                transition
                duration-300
                hover:-translate-y-1
                hover:bg-white
                sm:min-w-[190px]
              "
            >
              <Ticket size={16} />

              Get Tickets
            </a>
          </div>
        </div>

        {/* ================================================================
            BOTTOM BAR
        ================================================================= */}

        <div
          className="
            flex
            flex-col
            gap-5
            border-t
            border-white/15
            py-6
            text-[9px]
            font-bold
            uppercase
            tracking-[0.1em]
            text-white/50
            sm:flex-row
            sm:items-center
            sm:justify-between
            sm:py-7
            sm:text-[10px]
            sm:tracking-[0.12em]
          "
        >
          {/* COPYRIGHT */}

          <p className="leading-5">
            © 2026 Syro Malabar Youth Movement
            <span className="hidden sm:inline">
              {" "}
              • Diocese of Belthangady
            </span>

            <span className="block sm:hidden">
              Diocese of Belthangady
            </span>
          </p>

          {/* BACK TO TOP */}

          <a
            href="#home"
            className="
              flex
              w-fit
              items-center
              gap-2
              font-black
              text-white
              transition-colors
              duration-200
              hover:text-[var(--gold)]
            "
          >
            Back to top

            <span
              className="
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-full
                border
                border-white/25
                transition-colors
                duration-200
                hover:border-[var(--gold)]
              "
            >
              <ArrowUp size={13} />
            </span>
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;