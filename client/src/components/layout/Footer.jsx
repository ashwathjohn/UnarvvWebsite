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
      {/* Decorative background */}
      <div className="pointer-events-none absolute -bottom-44 -right-32 h-[420px] w-[420px] rounded-full border-[70px] border-white/[0.035]" />

      <div className="pointer-events-none absolute -left-32 top-20 h-[280px] w-[280px] rounded-full border-[45px] border-[rgba(240,173,10,0.06)]" />

      <div className="container-custom relative z-10">
        {/* MAIN FOOTER */}
        <div className="grid gap-12 py-14 lg:grid-cols-[1.25fr_0.75fr] lg:items-end lg:py-16">
          {/* BRAND */}
          <div>
            <a
              href="#home"
              className="group inline-flex items-center gap-4 sm:gap-5"
              aria-label="UNARVV '26 Home"
            >
              <div className="flex h-[82px] w-[82px] items-center justify-center sm:h-[96px] sm:w-[96px]">
              <img
  src={logo}
  alt="UNARVV '26 Logo"
  className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
/>
              </div>

              <div>
                <h2 className="text-3xl font-black uppercase leading-none tracking-[-0.055em] text-[var(--gold)] sm:text-4xl">
  UNARVV '26
</h2>

                <p className="mt-2 text-[10px] font-black uppercase tracking-[0.22em] text-[var(--gold)] sm:text-xs">
                  Refine • Renew • Reborn
                </p>
              </div>
            </a>

            <p className="mt-7 max-w-lg text-sm leading-7 text-white/65">
              Two days of faith, friendship, celebration and transformation.
              Come together as one youth movement for UNARVV '26.
            </p>

            {/* EVENT INFO */}
            <div className="mt-7 flex flex-col gap-3 text-xs font-bold uppercase tracking-[0.08em] text-white/75 sm:flex-row sm:flex-wrap sm:gap-x-7">
              <span className="flex items-center gap-2">
                <CalendarDays
                  size={16}
                  className="text-[var(--gold)]"
                />
                17–18 October 2026
              </span>

              <span className="flex items-center gap-2">
                <MapPin
                  size={16}
                  className="text-[var(--gold)]"
                />
                St. Francis School, Kokkada
              </span>
            </div>
          </div>

          {/* LINKS */}
          <div className="lg:justify-self-end">
            <p className="mb-5 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--gold)]">
              Explore
            </p>

            <nav className="grid grid-cols-2 gap-x-10 gap-y-4 text-xs font-black uppercase tracking-[0.12em] sm:flex sm:flex-wrap lg:max-w-[340px] lg:justify-end">
              <a
                href="#about"
                className="transition hover:text-[var(--gold)]"
              >
                About
              </a>

              <a
                href="#experience"
                className="transition hover:text-[var(--gold)]"
              >
                Experience
              </a>

              <a
                href="#schedule"
                className="transition hover:text-[var(--gold)]"
              >
                Schedule
              </a>

              <a
                href="#faq"
                className="transition hover:text-[var(--gold)]"
              >
                FAQ
              </a>
            </nav>

            <a
              href="#register"
              className="mt-8 inline-flex min-h-[50px] items-center justify-center gap-2 rounded-full bg-[var(--gold)] px-6 text-xs font-black uppercase tracking-[0.1em] text-[var(--red)] transition duration-300 hover:-translate-y-1 hover:bg-white"
            >
              <Ticket size={16} />
              Get Tickets
            </a>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="flex flex-col gap-5 border-t border-white/15 py-7 text-[10px] font-bold uppercase tracking-[0.12em] text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Syro Malabar Youth Movement • Diocese of Belthangady
          </p>

          <a
            href="#home"
            className="flex w-fit items-center gap-2 font-black text-white transition hover:text-[var(--gold)]"
          >
            Back to top

            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/25">
              <ArrowUp size={13} />
            </span>
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;