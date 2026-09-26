import { ArrowUpRight, CalendarDays } from "lucide-react";
import { Link } from "react-router-dom";

const marqueeItems = [
  "REGISTRATION CLOSES OCTOBER 5",
  "UNARVV '26",
  "DON'T MISS OUT",
  "REFINE • RENEW • REBORN",
];

function RegistrationDeadline() {
  return (
    <section
      className="relative overflow-hidden bg-gradient-to-br from-[var(--red-dark)] via-[var(--red)] to-[var(--red-dark)] text-[var(--cream)]"
      aria-label="UNARVV '26 registration deadline"
    >
      {/* =====================================================
          TOP MARQUEE
      ====================================================== */}

      <div className="overflow-hidden border-y border-white/10 bg-black/15 py-3">
        <div className="deadline-marquee flex w-max items-center">
          {[...marqueeItems, ...marqueeItems].map((item, index) => (
            <div
              key={`${item}-${index}`}
              className="flex shrink-0 items-center"
            >
              <span className="whitespace-nowrap px-6 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--cream)] sm:px-8 sm:text-xs">
                {item}
              </span>

              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--gold)]" />
            </div>
          ))}
        </div>
      </div>


      {/* =====================================================
          DEADLINE CONTENT
      ====================================================== */}

      <div className="container-custom relative py-10 sm:py-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">

          {/* Left */}

          <div>
            <div className="flex items-center gap-2 text-[var(--gold)]">
              <CalendarDays size={16} />

              <span className="text-[10px] font-black uppercase tracking-[0.18em] sm:text-xs">
                Registration Deadline
              </span>
            </div>

            <h2 className="mt-4 max-w-3xl text-4xl font-black uppercase leading-[0.9] tracking-[-0.055em] text-[var(--cream)] sm:text-5xl lg:text-6xl">
              Registration
              <br />

              <span className="text-[var(--gold)]">
                Closes On October 5.
              </span>
            </h2>

            <p className="mt-5 max-w-xl text-sm leading-6 text-[var(--cream)]/75 sm:text-base">
              Don't wait until the last moment. Secure your place
              at UNARVV '26 and be part of two unforgettable days
              of faith, friendship and celebration.
            </p>
          </div>


          {/* Right */}

          {/* <div className="lg:min-w-[240px]">

            <Link
              to="/#register"
              className="group flex w-full items-center justify-between gap-8 rounded-full bg-[var(--gold)] px-6 py-4 text-sm font-black uppercase tracking-[0.08em] text-[var(--red-dark)] transition-all duration-300 hover:-translate-y-1 hover:bg-[var(--gold-light)] sm:w-auto"
            >
              Register Now

              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--red-dark)] text-[var(--cream)] transition-transform duration-300 group-hover:rotate-45">
                <ArrowUpRight size={17} />
              </span>
            </Link>

            <p className="mt-4 text-center text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--cream)]/50">
              17–18 October 2026 • Kokkada
            </p>

          </div> */}
        </div>
      </div>


      {/* =====================================================
          MARQUEE ANIMATION
      ====================================================== */}

      <style>{`
        @keyframes deadline-marquee {
          from {
            transform: translateX(0);
          }

          to {
            transform: translateX(-50%);
          }
        }

        .deadline-marquee {
          animation: deadline-marquee 24s linear infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .deadline-marquee {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}

export default RegistrationDeadline;