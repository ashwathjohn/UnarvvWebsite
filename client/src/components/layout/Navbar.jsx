import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Menu,
  X,
  Ticket,
  TicketCheck,
} from "lucide-react";

import logo from "../../assets/unarvv-logo.png";

const links = [
  { label: "About", href: "/#about" },
  { label: "Experience", href: "/#experience" },
  { label: "Schedule", href: "/#schedule" },
  { label: "FAQ", href: "/#faq" },
];

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | NAVBAR SCROLL STATE
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | CLOSE MOBILE MENU
  |--------------------------------------------------------------------------
  */

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-50 border-b border-[var(--border)] transition-all duration-300 ${
        scrolled
          ? "bg-[rgba(244,237,223,0.95)] shadow-sm backdrop-blur-xl"
          : "bg-[var(--cream)]"
      }`}
    >
      {/* ================================================================
          MAIN NAVBAR
      ================================================================= */}

      <div className="container-custom flex min-h-[86px] items-center justify-between gap-4">

        {/* ==============================================================
            BRAND
        =============================================================== */}

        <Link
          to="/"
          onClick={closeMenu}
          className="group flex shrink-0 items-center gap-3 sm:gap-4"
          aria-label="UNARVV '26 Home"
        >
          {/* Logo */}

          <img
            src={logo}
            alt="UNARVV '26 Logo"
            className="h-[58px] w-[58px] object-contain transition-transform duration-300 group-hover:scale-105 sm:h-[66px] sm:w-[66px]"
          />

          {/* Wordmark */}

          <div className="flex flex-col">
            <span className="text-[22px] font-black uppercase leading-none tracking-[-0.045em] text-[var(--red)] sm:text-[26px]">
              UNARVV '26
            </span>

            <span className="mt-[5px] hidden text-[8px] font-extrabold uppercase tracking-[0.18em] text-[var(--gold-dark)] min-[430px]:block sm:text-[9px]">
              Refine • Renew • Reborn
            </span>
          </div>
        </Link>

        {/* ==============================================================
            DESKTOP NAVIGATION
        =============================================================== */}

        <nav
          className="hidden items-center gap-6 xl:gap-8 lg:flex"
          aria-label="Main navigation"
        >
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="relative whitespace-nowrap text-[11px] font-extrabold uppercase tracking-[0.14em] text-[var(--brown)] transition-colors duration-200 hover:text-[var(--red)]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* ==============================================================
            DESKTOP ACTIONS
        =============================================================== */}

        <div className="hidden items-center gap-3 lg:flex">

          {/* RETRIEVE EXISTING PASS */}

          <Link
            to="/retrieve-pass"
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border border-[var(--red)] px-5 py-3 text-[10px] font-black uppercase tracking-[0.1em] text-[var(--red)] transition-all duration-200 hover:bg-[var(--red)] hover:text-[var(--cream)]"
          >
            <TicketCheck size={15} />

            My Pass
          </Link>

          {/* NEW REGISTRATION */}

          <a
            href="/#register"
            className="primary-button whitespace-nowrap"
          >
            <Ticket size={16} />

            Get Tickets
          </a>

        </div>

        {/* ==============================================================
            MOBILE MENU BUTTON
        =============================================================== */}

        <button
          type="button"
          onClick={() =>
            setMenuOpen((prev) => !prev)
          }
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--red)] text-[var(--red)] transition-colors duration-200 hover:bg-[var(--red)] hover:text-white lg:hidden"
          aria-label={
            menuOpen
              ? "Close navigation menu"
              : "Open navigation menu"
          }
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
        >
          {menuOpen ? (
            <X size={21} />
          ) : (
            <Menu size={21} />
          )}
        </button>

      </div>

      {/* ================================================================
          MOBILE NAVIGATION
      ================================================================= */}

      <div
        id="mobile-navigation"
        className={`overflow-hidden bg-[var(--cream)] transition-all duration-300 lg:hidden ${
          menuOpen
            ? "max-h-[650px] border-t border-[var(--border)] opacity-100"
            : "max-h-0 border-t-0 opacity-0"
        }`}
      >
        <div className="container-custom flex flex-col py-5">

          {/* PAGE LINKS */}

          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={closeMenu}
              className="border-b border-[var(--border)] py-4 text-sm font-black uppercase tracking-[0.1em] text-[var(--brown)] transition-all duration-200 hover:pl-2 hover:text-[var(--red)]"
            >
              {link.label}
            </a>
          ))}

          {/* ============================================================
              MY PASS
          ============================================================= */}

          <Link
            to="/retrieve-pass"
            onClick={closeMenu}
            className="mt-5 flex items-center justify-center gap-2 rounded-full border-2 border-[var(--red)] px-5 py-3.5 text-xs font-black uppercase tracking-[0.1em] text-[var(--red)] transition-colors duration-200 hover:bg-[var(--red)] hover:text-[var(--cream)]"
          >
            <TicketCheck size={17} />

            Retrieve My Pass
          </Link>

          {/* ============================================================
              GET TICKETS
          ============================================================= */}

          <a
            href="/#register"
            onClick={closeMenu}
            className="primary-button mt-3"
          >
            <Ticket size={17} />

            Get Tickets
          </a>

        </div>
      </div>
    </header>
  );
}

export default Navbar;