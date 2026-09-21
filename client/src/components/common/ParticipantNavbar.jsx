import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import logo from "../../assets/unarvv-logo.png";

function ParticipantNavbar() {
  const navigate = useNavigate();

  const handleBackHome = () => {
    navigate("/");
  };

  return (
    <header
      className="
        sticky
        top-0
        z-50
        border-b
        border-[var(--border)]
        bg-[rgba(244,237,223,0.96)]
        backdrop-blur-xl
      "
    >
      <div
        className="
          container-custom
          flex
          min-h-[78px]
          items-center
          justify-between
          gap-3
          sm:min-h-[90px]
        "
      >
        {/* ==============================================================
            BRAND
        =============================================================== */}

        <button
          type="button"
          onClick={handleBackHome}
          className="
            group
            flex
            min-w-0
            items-center
            gap-2.5
            text-left
            sm:gap-4
          "
          aria-label="Go to UNARVV '26 home"
        >
          {/* LOGO */}

          <img
            src={logo}
            alt="UNARVV '26 Logo"
            className="
              h-[52px]
              w-[52px]
              shrink-0
              object-contain
              transition-transform
              duration-300
              group-hover:scale-105
              sm:h-[64px]
              sm:w-[64px]
            "
          />

          {/* WORDMARK */}

          <div className="min-w-0">
            <span
              className="
                block
                whitespace-nowrap
                text-[20px]
                font-black
                uppercase
                leading-none
                tracking-[-0.045em]
                text-[var(--red)]
                sm:text-[26px]
              "
            >
              UNARVV '26
            </span>

            <span
              className="
                mt-1.5
                block
                whitespace-nowrap
                text-[6.5px]
                font-black
                uppercase
                tracking-[0.1em]
                text-[var(--gold)]
                min-[380px]:text-[7px]
                sm:text-[9px]
                sm:tracking-[0.18em]
              "
            >
              Refine
              <span className="mx-1 text-[var(--red)]">
                •
              </span>

              Renew
              <span className="mx-1 text-[var(--red)]">
                •
              </span>

              Reborn
            </span>
          </div>
        </button>

        {/* ==============================================================
            BACK TO HOME
        =============================================================== */}

        <button
          type="button"
          onClick={handleBackHome}
          className="
            inline-flex
            h-10
            shrink-0
            items-center
            justify-center
            gap-2
            rounded-full
            border
            border-[var(--red)]
            px-3
            text-[9px]
            font-black
            uppercase
            tracking-[0.08em]
            text-[var(--red)]
            transition-all
            duration-200
            hover:bg-[var(--red)]
            hover:text-white
            sm:h-11
            sm:px-5
            sm:text-[10px]
            sm:tracking-[0.1em]
          "
        >
          <ArrowLeft size={15} />

          {/* Desktop / larger mobile */}

          <span className="hidden min-[390px]:inline">
            Back to Home
          </span>

          {/* Very small mobile */}

          <span className="min-[390px]:hidden">
            Home
          </span>
        </button>
      </div>
    </header>
  );
}

export default ParticipantNavbar;