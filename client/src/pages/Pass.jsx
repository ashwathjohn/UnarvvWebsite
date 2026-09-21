import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  CalendarDays,
  CheckCircle2,
  Download,
  MapPin,
  Shirt,
  Ticket,
} from "lucide-react";
import QRCode from "qrcode";

import api from "../services/api";

function Pass() {
  const { token } = useParams();

  const [pass, setPass] = useState(null);
  const [event, setEvent] = useState(null);
  const [qrCode, setQrCode] = useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let active = true;

    const loadPass = async () => {
      try {
        setLoading(true);
        setError("");

        /*
        |--------------------------------------------------------------------------
        | Retrieve confirmed pass
        |--------------------------------------------------------------------------
        */

        const response = await api.get(
          `/registrations/pass/${encodeURIComponent(
            token
          )}`
        );

        if (!active) {
          return;
        }

        if (!response.data?.success) {
          throw new Error(
            "Unable to retrieve pass."
          );
        }

        const passData =
          response.data.pass;

        const eventData =
          response.data.event;

        setPass(passData);
        setEvent(eventData);

        /*
        |--------------------------------------------------------------------------
        | Generate QR
        |--------------------------------------------------------------------------
        |
        | We DO NOT encode:
        |
        | name
        | email
        | phone
        | payment information
        |
        | QR contains only a check-in reference.
        |
        */

        const qrPayload =
          `UNARVV26:${passData.checkInToken}`;

        const qrDataUrl =
          await QRCode.toDataURL(
            qrPayload,
            {
              width: 500,
              margin: 2,

              errorCorrectionLevel:
                "H",
            }
          );

        if (active) {
          setQrCode(qrDataUrl);
        }
      } catch (error) {
        console.error(
          "Pass loading error:",
          error
        );

        if (!active) {
          return;
        }

        setError(
          error.response?.data?.message ||
            "Unable to retrieve this pass."
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    if (token) {
      loadPass();
    } else {
      setError("Invalid pass link.");
      setLoading(false);
    }

    return () => {
      active = false;
    };
  }, [token]);

  /*
  |--------------------------------------------------------------------------
  | PRINT / SAVE
  |--------------------------------------------------------------------------
  |
  | Browser print allows:
  |
  | Print physically
  | Save as PDF
  |
  */

  const handleSavePass = () => {
    window.print();
  };

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--cream)] px-5">
        <div className="text-center">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[var(--red)]/20 border-t-[var(--red)]" />

          <p className="mt-5 text-xs font-black uppercase tracking-[0.15em] text-[var(--red)]">
            Loading your pass...
          </p>
        </div>
      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | INVALID PASS
  |--------------------------------------------------------------------------
  */

  if (error || !pass || !event) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--cream)] px-5">

        <div className="max-w-md text-center">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--red)] text-[var(--cream)]">
            <Ticket size={28} />
          </div>

          <h1 className="mt-6 text-3xl font-black uppercase text-[var(--red)]">
            Pass Not Found
          </h1>

          <p className="mt-3 leading-7 text-[var(--muted)]">
            {error ||
              "This convention pass is unavailable."}
          </p>

          <a
            href="/"
            className="primary-button mt-7 inline-flex"
          >
            Return Home
          </a>

        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--cream)] px-4 py-10 sm:px-6 sm:py-16">

      <div className="mx-auto max-w-xl">

        {/* SUCCESS MESSAGE */}

        <div className="mb-7 text-center print:hidden">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--red)] text-[var(--cream)]">
            <CheckCircle2 size={28} />
          </div>

          <h1 className="mt-5 text-3xl font-black uppercase tracking-[-0.04em] text-[var(--red)] sm:text-4xl">
            Registration Confirmed
          </h1>

          <p className="mt-2 text-sm text-[var(--muted)]">
            Your UNARVV '26 convention
            pass is ready.
          </p>

        </div>

        {/* PASS */}

        <section
          id="unarvv-pass"
          className="overflow-hidden rounded-[30px] border-2 border-[var(--red)] bg-[var(--cream-light)] shadow-[10px_10px_0_var(--red)] print:shadow-none"
        >

          {/* PASS HEADER */}

          <div className="bg-[var(--red)] px-7 py-8 text-center text-[var(--cream)]">

            <span className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--gold-light)]">
              Syro Malabar Youth Movement
            </span>

            <h2 className="mt-3 text-5xl font-black uppercase tracking-[-0.06em] sm:text-6xl">
              UNARVV '26
            </h2>

            <p className="mt-3 text-xs font-black uppercase tracking-[0.18em] text-[var(--gold-light)]">
              Refine • Renew • Reborn
            </p>

          </div>

          {/* PARTICIPANT */}

          <div className="px-7 py-7 sm:px-9">

            <span className="text-[10px] font-black uppercase tracking-[0.16em] text-[var(--muted)]">
              Convention Pass
            </span>

            <h3 className="mt-2 text-3xl font-black uppercase leading-tight text-[var(--red)]">
              {pass.fullName}
            </h3>

            <p className="mt-2 text-sm font-bold text-[var(--brown)]/70">
              {pass.parish}
            </p>

            {/* DETAILS */}

            <div className="mt-7 grid gap-3 sm:grid-cols-2">

              <PassDetail
                icon={<CalendarDays size={18} />}
                label="Dates"
                value={event.dates}
              />

              <PassDetail
                icon={<MapPin size={18} />}
                label="Venue"
                value={event.venue}
              />

              <PassDetail
                icon={<Shirt size={18} />}
                label="Jersey Size"
                value={pass.jerseySize}
              />

              <PassDetail
                icon={<Ticket size={18} />}
                label="Ticket ID"
                value={pass.registrationId}
              />

            </div>

            {/* DIVIDER */}

            <div className="my-8 border-t-2 border-dashed border-[var(--red)]/25" />

            {/* QR */}

            <div className="text-center">

              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--muted)]">
                Entry QR
              </span>

              {qrCode && (
                <div className="mx-auto mt-4 w-fit rounded-[22px] border-2 border-[var(--red)] bg-white p-3">

                  <img
                    src={qrCode}
                    alt="UNARVV convention pass QR code"
                    className="h-44 w-44 sm:h-48 sm:w-48"
                  />

                </div>
              )}

              <p className="mt-4 font-mono text-xs font-bold text-[var(--red)]">
                {pass.registrationId}
              </p>

              <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--gold)] px-4 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-[var(--red)]">
                <CheckCircle2 size={14} />
                Payment Verified
              </div>

              <p className="mx-auto mt-4 max-w-xs text-[11px] leading-5 text-[var(--muted)]">
                Present this QR code at the
                registration desk for
                verification and check-in.
              </p>

            </div>
          </div>

          {/* BOTTOM STRIP */}

          <div className="border-t border-[var(--border)] bg-[var(--gold)] px-6 py-4 text-center">

            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[var(--red)]">
              17–18 October 2026 •
              St. Francis School, Kokkada
            </p>

          </div>

        </section>

        {/* SAVE BUTTON */}

        <button
          type="button"
          onClick={handleSavePass}
          className="primary-button mt-8 w-full print:hidden"
        >
          <Download size={18} />
          Save / Print Pass
        </button>

        <p className="mt-4 text-center text-xs leading-5 text-[var(--muted)] print:hidden">
          Keep this pass available on your
          phone and present it at the
          registration desk.
        </p>

      </div>
    </main>
  );
}

/*
|--------------------------------------------------------------------------
| PASS DETAIL COMPONENT
|--------------------------------------------------------------------------
*/

function PassDetail({
  icon,
  label,
  value,
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white/40 p-4">

      <div className="flex items-start gap-3">

        <div className="mt-0.5 text-[var(--red)]">
          {icon}
        </div>

        <div>
          <span className="block text-[9px] font-black uppercase tracking-[0.12em] text-[var(--muted)]">
            {label}
          </span>

          <strong className="mt-1 block text-sm leading-5 text-[var(--brown)]">
            {value}
          </strong>
        </div>

      </div>
    </div>
  );
}

export default Pass;