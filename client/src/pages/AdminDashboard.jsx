import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  ExternalLink,
  IndianRupee,
  LoaderCircle,
  LogOut,
  ScanLine,
  Shirt,
  TicketCheck,
  Users,
} from "lucide-react";

import { toast } from "react-toastify";

import api from "../services/api";
import logo from "../assets/unarvv-logo.png";

import QrScannerModal from "../components/admin/QrScannerModal";
import ParticipantManagement from "../components/admin/ParticipantManagement";

/*
|--------------------------------------------------------------------------
| CONSTANTS
|--------------------------------------------------------------------------
*/

const JERSEY_SIZES = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "XXXL",
];

/*
|--------------------------------------------------------------------------
| FORMAT CURRENCY
|--------------------------------------------------------------------------
*/

const formatCurrency = (
  amountInPaise = 0
) => {
  const amountInRupees =
    Number(amountInPaise || 0) /
    100;

  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }
  ).format(amountInRupees);
};

/*
|--------------------------------------------------------------------------
| FORMAT REGISTRATION DATE
|--------------------------------------------------------------------------
*/

const formatRegistrationDate = (
  value
) => {
  if (!value) {
    return "No registrations yet";
  }

  const date = new Date(value);

  if (
    Number.isNaN(date.getTime())
  ) {
    return "Unavailable";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  ).format(date);
};

/*
|--------------------------------------------------------------------------
| STAT CARD
|--------------------------------------------------------------------------
*/

function StatCard({
  label,
  value,
  helper,
  icon: Icon,
}) {
  return (
    <article className="group relative overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--cream-light)] p-5 transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-6">

      <div className="absolute -right-5 -top-5 h-24 w-24 rounded-full bg-[var(--gold)]/10" />

      <div className="relative">

        <div className="mb-6 flex items-start justify-between gap-4">

          <span className="text-[10px] font-black uppercase tracking-[0.16em] text-[var(--muted)]">
            {label}
          </span>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--red)] text-[var(--cream)]">
            <Icon size={17} />
          </div>

        </div>

        <p className="text-3xl font-black tracking-[-0.05em] text-[var(--red)] sm:text-4xl">
          {value}
        </p>

        {helper && (
          <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
            {helper}
          </p>
        )}

      </div>

    </article>
  );
}

/*
|--------------------------------------------------------------------------
| ADMIN DASHBOARD
|--------------------------------------------------------------------------
*/

function AdminDashboard() {
  const navigate =
    useNavigate();

  /*
  |--------------------------------------------------------------------------
  | STATE
  |--------------------------------------------------------------------------
  */

  const [admin, setAdmin] =
    useState(null);

  const [
    dashboard,
    setDashboard,
  ] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [
    loggingOut,
    setLoggingOut,
  ] = useState(false);

  const [
    exporting,
    setExporting,
  ] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | STAGE 6 - QR SCANNER STATE
  |--------------------------------------------------------------------------
  */

  const [
    scannerOpen,
    setScannerOpen,
  ] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | STAGE 6 - PARTICIPANT REFRESH KEY
  |--------------------------------------------------------------------------
  |
  | ParticipantManagement owns its own API request.
  |
  | Incrementing this value tells the component to reload after a
  | successful QR check-in.
  |
  */

  const [
    participantRefreshKey,
    setParticipantRefreshKey,
  ] = useState(0);

  /*
  |--------------------------------------------------------------------------
  | LOAD ADMIN + DASHBOARD
  |--------------------------------------------------------------------------
  */

  const loadDashboard =
    useCallback(async () => {
      try {
        const [
          adminResponse,
          dashboardResponse,
        ] = await Promise.all([
          api.get("/admin/me"),

          api.get(
            "/admin/dashboard/summary"
          ),
        ]);

        setAdmin(
          adminResponse.data.admin
        );

        setDashboard(
          dashboardResponse.data
        );
      } catch (error) {
        if (
          error.response?.status ===
          401
        ) {
          navigate("/admin", {
            replace: true,
          });

          return;
        }

        toast.error(
          "Unable to load the dashboard."
        );
      } finally {
        setLoading(false);
      }
    }, [navigate]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  /*
  |--------------------------------------------------------------------------
  | QR CHECK-IN SUCCESS
  |--------------------------------------------------------------------------
  |
  | After the backend confirms a QR check-in:
  |
  | 1. Refresh dashboard counters
  | 2. Refresh participant table
  |
  */

  const handleCheckInSuccess =
    useCallback(() => {
      loadDashboard();

      setParticipantRefreshKey(
        (current) =>
          current + 1
      );
    }, [loadDashboard]);

  /*
  |--------------------------------------------------------------------------
  | LOGOUT
  |--------------------------------------------------------------------------
  */

  const handleLogout =
    async () => {
      if (loggingOut) {
        return;
      }

      try {
        setLoggingOut(true);

        await api.post(
          "/admin/logout"
        );

        toast.success(
          "Logged out successfully."
        );

        navigate("/admin", {
          replace: true,
        });
      } catch {
        toast.error(
          "Unable to logout. Please try again."
        );
      } finally {
        setLoggingOut(false);
      }
    };

  /*
  |--------------------------------------------------------------------------
  | EXPORT PARTICIPANTS
  |--------------------------------------------------------------------------
  */

  const handleExport =
    async () => {
      if (exporting) {
        return;
      }

      try {
        setExporting(true);

        const response =
          await api.get(
            "/admin/registrations/export",
            {
              responseType:
                "blob",
            }
          );

        const blob =
          new Blob(
            [response.data],
            {
              type:
                "text/csv;charset=utf-8;",
            }
          );

        const downloadUrl =
          window.URL.createObjectURL(
            blob
          );

        const contentDisposition =
          response.headers[
            "content-disposition"
          ];

        let filename =
          "UNARVV26_Registrations.csv";

        if (contentDisposition) {
          const match =
            contentDisposition.match(
              /filename="?([^";]+)"?/i
            );

          if (match?.[1]) {
            filename =
              match[1];
          }
        }

        const link =
          document.createElement(
            "a"
          );

        link.href =
          downloadUrl;

        link.download =
          filename;

        document.body.appendChild(
          link
        );

        link.click();

        link.remove();

        window.URL.revokeObjectURL(
          downloadUrl
        );

        toast.success(
          "Participant CSV exported successfully."
        );
      } catch (error) {
        if (
          error.response?.status ===
          401
        ) {
          toast.error(
            "Your admin session has expired."
          );

          navigate("/admin", {
            replace: true,
          });

          return;
        }

        toast.error(
          "Unable to export participant data."
        );
      } finally {
        setExporting(false);
      }
    };

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--cream)]">

        <div className="flex flex-col items-center">

          <LoaderCircle
            size={30}
            className="animate-spin text-[var(--red)]"
          />

          <p className="mt-4 text-[10px] font-black uppercase tracking-[0.16em] text-[var(--red)]">
            Loading Dashboard
          </p>

        </div>

      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | DASHBOARD DATA
  |--------------------------------------------------------------------------
  */

  const summary =
    dashboard?.summary || {};

  const jerseySummary =
    dashboard?.jerseySummary ||
    {};

  const checkInSummary =
    dashboard?.checkInSummary ||
    {};

  const lastRegistration =
    summary.lastRegistration;

  return (
    <main className="min-h-screen bg-[var(--cream)] text-[var(--brown)]">

      {/* ==============================================================
          ADMIN HEADER
      =============================================================== */}

      <header className="sticky top-0 z-40 border-b border-white/10 bg-[var(--red)]">

        <div className="container-custom flex min-h-[76px] items-center justify-between gap-4">

          {/* BRAND */}

          <Link
            to="/admin/dashboard"
            className="flex min-w-0 items-center gap-3"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--cream)] p-1.5">

              <img
                src={logo}
                alt="UNARVV '26"
                className="h-full w-full object-contain"
              />

            </div>

            <div className="min-w-0">

              <p className="truncate text-lg font-black uppercase leading-none text-[var(--cream)] sm:text-xl">
                UNARVV '26
              </p>

              <p className="mt-1 text-[8px] font-black uppercase tracking-[0.18em] text-[var(--gold)] sm:text-[9px]">
                Admin Panel
              </p>

            </div>

          </Link>

          {/* DESKTOP ACTIONS */}

          <div className="hidden items-center gap-2 md:flex">

            <Link
              to="/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.08em] text-[var(--cream)] transition hover:bg-[var(--cream)] hover:text-[var(--red)]"
            >
              <ExternalLink
                size={14}
              />

              View Site
            </Link>

            <button
              type="button"
              onClick={
                handleExport
              }
              disabled={
                exporting
              }
              className="inline-flex items-center gap-2 rounded-full bg-[var(--gold)] px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.08em] text-[var(--red)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {exporting ? (
                <LoaderCircle
                  size={14}
                  className="animate-spin"
                />
              ) : (
                <Download
                  size={14}
                />
              )}

              {exporting
                ? "Exporting..."
                : "Export CSV"}
            </button>

            <button
              type="button"
              onClick={
                handleLogout
              }
              disabled={
                loggingOut
              }
              className="inline-flex items-center gap-2 rounded-full border border-white/25 px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.08em] text-[var(--cream)] transition hover:bg-[var(--cream)] hover:text-[var(--red)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loggingOut ? (
                <LoaderCircle
                  size={14}
                  className="animate-spin"
                />
              ) : (
                <LogOut
                  size={14}
                />
              )}

              Logout
            </button>

          </div>

          {/* MOBILE LOGOUT */}

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            aria-label="Logout"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 text-[var(--cream)] md:hidden"
          >
            {loggingOut ? (
              <LoaderCircle
                size={16}
                className="animate-spin"
              />
            ) : (
              <LogOut size={16} />
            )}
          </button>

        </div>

      </header>

      {/* ==============================================================
          DASHBOARD
      =============================================================== */}

      <div className="container-custom py-8 sm:py-10">

        {/* TITLE */}

        <section className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">

          <div>

            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--gold)]">
              UNARVV '26 Administration
            </span>

            <h1 className="mt-2 text-3xl font-black uppercase tracking-[-0.05em] text-[var(--red)] sm:text-4xl">
              Registrant Dashboard
            </h1>

            <p className="mt-3 text-sm text-[var(--muted)]">
              17–18 October 2026 •
              St. Francis School,
              Kokkada • SMYM Diocese
              of Belthangady
            </p>

          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--cream-light)] px-4 py-3">

            <p className="text-[9px] font-black uppercase tracking-[0.13em] text-[var(--muted)]">
              Signed in as
            </p>

            <p className="mt-1 text-sm font-black text-[var(--red)]">
              {admin?.name}
            </p>

            {admin?.role && (
              <p className="mt-1 text-[8px] font-black uppercase tracking-[0.1em] text-[var(--gold)]">
                {admin.role}
              </p>
            )}

          </div>

        </section>

        {/* ============================================================
            MAIN STATISTICS
        ============================================================= */}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <StatCard
            label="Total Registered"
            value={
              summary.totalRegistered ??
              0
            }
            helper="Confirmed paid participants"
            icon={Users}
          />

          <StatCard
            label="Total Revenue"
            value={formatCurrency(
              summary.totalRevenue
            )}
            helper="From verified registrations"
            icon={IndianRupee}
          />

          <StatCard
            label="Today"
            value={
              summary.todayRegistrations ??
              0
            }
            helper="Registrations received today"
            icon={CalendarDays}
          />

          <StatCard
            label="Last Registration"
            value={
              lastRegistration
                ? lastRegistration.fullName
                : "—"
            }
            helper={
              lastRegistration
                ? formatRegistrationDate(
                    lastRegistration.registeredAt
                  )
                : "No registrations yet"
            }
            icon={Clock3}
          />

        </section>

        {/* ============================================================
            LAST REGISTRATION
        ============================================================= */}

        {lastRegistration && (
          <section className="mt-6 rounded-[24px] border border-[var(--border)] bg-[var(--cream-light)] p-5 sm:p-6">

            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

              <div>

                <span className="text-[9px] font-black uppercase tracking-[0.15em] text-[var(--gold)]">
                  Latest Registration
                </span>

                <h2 className="mt-1 text-xl font-black uppercase text-[var(--red)]">
                  {
                    lastRegistration.fullName
                  }
                </h2>

                <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
                  {
                    lastRegistration.parish
                  }
                </p>

              </div>

              <div className="flex flex-wrap gap-2">

                <span className="rounded-full bg-[var(--red)] px-3 py-2 text-[9px] font-black uppercase tracking-[0.08em] text-[var(--cream)]">
                  {
                    lastRegistration.registrationId
                  }
                </span>

                <span className="rounded-full bg-[var(--gold)] px-3 py-2 text-[9px] font-black uppercase tracking-[0.08em] text-[var(--red)]">
                  Jersey{" "}
                  {
                    lastRegistration.jerseySize
                  }
                </span>

              </div>

            </div>

          </section>
        )}

        {/* ============================================================
            JERSEY SUMMARY
        ============================================================= */}

        <section className="mt-6 overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--cream-light)]">

          <div className="flex items-center gap-3 border-b border-[var(--border)] px-5 py-5 sm:px-6">

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--gold)] text-[var(--red)]">
              <Shirt size={18} />
            </div>

            <div>

              <span className="text-[9px] font-black uppercase tracking-[0.15em] text-[var(--gold)]">
                Merchandise
              </span>

              <h2 className="text-lg font-black uppercase text-[var(--red)]">
                Jersey Size Summary
              </h2>

            </div>

          </div>

          <div className="grid grid-cols-2 gap-px bg-[var(--border)] sm:grid-cols-4 xl:grid-cols-7">

            {JERSEY_SIZES.map(
              (size) => (
                <div
                  key={size}
                  className="bg-[var(--cream-light)] p-5 text-center sm:p-6"
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[var(--muted)]">
                    {size}
                  </p>

                  <p className="mt-2 text-3xl font-black text-[var(--red)]">
                    {jerseySummary[
                      size
                    ] ?? 0}
                  </p>
                </div>
              )
            )}

          </div>

        </section>

        {/* ============================================================
            EVENT CHECK-IN
        ============================================================= */}

        <section className="mt-6 overflow-hidden rounded-[28px] bg-[var(--red)] text-[var(--cream)]">

          <div className="p-5 sm:p-7">

            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">

              <div>

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--gold)] text-[var(--red)]">
                    <TicketCheck
                      size={20}
                    />
                  </div>

                  <div>

                    <span className="text-[9px] font-black uppercase tracking-[0.16em] text-[var(--gold)]">
                      Event Day
                    </span>

                    <h2 className="text-xl font-black uppercase">
                      Check-In Status
                    </h2>

                  </div>

                </div>

                <p className="mt-4 max-w-xl text-xs leading-5 text-[var(--cream)]/70">
                  Track participant
                  arrivals during the
                  UNARVV '26 convention.
                </p>

              </div>

              {/* ======================================================
                  QR SCANNER
              ====================================================== */}

              <button
                type="button"
                onClick={() =>
                  setScannerOpen(
                    true
                  )
                }
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--gold)] px-6 text-xs font-black uppercase tracking-[0.1em] text-[var(--red)] transition hover:brightness-105"
              >
                <ScanLine
                  size={18}
                />

                Scan QR
              </button>

            </div>

            {/* CHECK-IN STATS */}

            <div className="mt-7 grid gap-3 sm:grid-cols-3">

              <div className="rounded-2xl border border-white/15 bg-white/5 p-5">

                <div className="flex items-center gap-2 text-[var(--gold)]">
                  <Users size={15} />

                  <span className="text-[9px] font-black uppercase tracking-[0.12em]">
                    Registered
                  </span>
                </div>

                <p className="mt-3 text-3xl font-black">
                  {checkInSummary.totalRegistered ??
                    0}
                </p>

              </div>

              <div className="rounded-2xl border border-white/15 bg-white/5 p-5">

                <div className="flex items-center gap-2 text-[var(--gold)]">

                  <CheckCircle2
                    size={15}
                  />

                  <span className="text-[9px] font-black uppercase tracking-[0.12em]">
                    Checked In
                  </span>

                </div>

                <p className="mt-3 text-3xl font-black">
                  {checkInSummary.checkedIn ??
                    0}
                </p>

              </div>

              <div className="rounded-2xl border border-white/15 bg-white/5 p-5">

                <div className="flex items-center gap-2 text-[var(--gold)]">

                  <Clock3 size={15} />

                  <span className="text-[9px] font-black uppercase tracking-[0.12em]">
                    Remaining
                  </span>

                </div>

                <p className="mt-3 text-3xl font-black">
                  {checkInSummary.remaining ??
                    0}
                </p>

              </div>

            </div>

          </div>

        </section>

        {/* ============================================================
            PARTICIPANT MANAGEMENT
        ============================================================= */}

     <ParticipantManagement
  refreshKey={
    participantRefreshKey
  }
  onCheckInSuccess={
    handleCheckInSuccess
  }
/>

        {/* ============================================================
            MOBILE ACTIONS
        ============================================================= */}

        <section className="mt-6 grid gap-3 md:hidden">

          <Link
            to="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 rounded-full border border-[var(--red)] px-5 py-3 text-xs font-black uppercase tracking-[0.08em] text-[var(--red)]"
          >
            <ExternalLink
              size={16}
            />

            View Site
          </Link>

          <button
            type="button"
            onClick={
              handleExport
            }
            disabled={
              exporting
            }
            className="flex items-center justify-center gap-2 rounded-full bg-[var(--gold)] px-5 py-3 text-xs font-black uppercase tracking-[0.08em] text-[var(--red)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {exporting ? (
              <LoaderCircle
                size={16}
                className="animate-spin"
              />
            ) : (
              <Download
                size={16}
              />
            )}

            {exporting
              ? "Exporting..."
              : "Export CSV"}
          </button>

        </section>

        {/* FOOTER */}

        <footer className="mt-10 border-t border-[var(--border)] py-6 text-center">

          <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[var(--muted)]">
            UNARVV '26 • SMYM Diocese
            of Belthangady
          </p>

        </footer>

      </div>

      {/* ==============================================================
          QR SCANNER MODAL
      =============================================================== */}

      <QrScannerModal
        open={scannerOpen}
        onClose={() =>
          setScannerOpen(false)
        }
        onCheckInSuccess={
          handleCheckInSuccess
        }
      />

    </main>
  );
}

export default AdminDashboard;