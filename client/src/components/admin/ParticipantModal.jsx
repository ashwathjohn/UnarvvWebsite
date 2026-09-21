import {
  useEffect,
  useState,
} from "react";

import {
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  CircleX,
  CreditCard,
  LoaderCircle,
  Mail,
  MapPin,
  Phone,
  Shirt,
  Ticket,
  UserRound,
  X,
} from "lucide-react";

import {
  toast,
} from "react-toastify";

import api from "../../services/api";

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

const formatCurrency = (
  amountInPaise = 0
) => {
  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }
  ).format(
    Number(
      amountInPaise || 0
    ) / 100
  );
};

/*
|--------------------------------------------------------------------------
| FORMAT DATE - INDIA TIME
|--------------------------------------------------------------------------
*/

const formatDate = (
  value
) => {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      timeZone:
        "Asia/Kolkata",

      day:
        "2-digit",

      month:
        "short",

      year:
        "numeric",

      hour:
        "numeric",

      minute:
        "2-digit",
    }
  ).format(date);
};

/*
|--------------------------------------------------------------------------
| DETAIL ROW
|--------------------------------------------------------------------------
*/

function DetailRow({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="flex gap-3 border-b border-[var(--border)] py-4 last:border-b-0">

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--gold)]/15 text-[var(--red)]">

        <Icon size={16} />

      </div>

      <div className="min-w-0">

        <p className="text-[9px] font-black uppercase tracking-[0.13em] text-[var(--muted)]">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-bold text-[var(--brown)]">
          {value || "—"}
        </p>

      </div>

    </div>
  );
}

/*
|--------------------------------------------------------------------------
| PARTICIPANT MODAL
|--------------------------------------------------------------------------
*/

function ParticipantModal({
  participant,
  onClose,
  onCheckInSuccess,
}) {
  /*
  |--------------------------------------------------------------------------
  | STATE
  |--------------------------------------------------------------------------
  */

  const [
    checkingIn,
    setCheckingIn,
  ] = useState(false);

  const [
    confirmCheckIn,
    setConfirmCheckIn,
  ] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | RESET CONFIRMATION WHEN PARTICIPANT CHANGES
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    setConfirmCheckIn(false);
    setCheckingIn(false);
  }, [
    participant?._id,
  ]);

  /*
  |--------------------------------------------------------------------------
  | ESC KEY
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!participant) {
      return undefined;
    }

    const handleKeyDown = (
      event
    ) => {
      if (
        event.key === "Escape" &&
        !checkingIn
      ) {
        onClose?.();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    participant,
    checkingIn,
    onClose,
  ]);

  /*
  |--------------------------------------------------------------------------
  | MANUAL CHECK-IN
  |--------------------------------------------------------------------------
  */

  const handleManualCheckIn =
    async () => {
      if (
        checkingIn ||
        !participant
      ) {
        return;
      }

      try {
        setCheckingIn(true);

        /*
         * IMPORTANT:
         *
         * We only send the registration ID.
         *
         * The backend decides whether the
         * participant is actually eligible
         * for check-in.
         */

        const response =
          await api.post(
            "/admin/check-in/manual",
            {
              registrationId:
                participant.registrationId,
            }
          );

        const updatedParticipant =
          response.data
            ?.participant;

        toast.success(
          response.data
            ?.message ||
            "Participant checked in successfully."
        );

        setConfirmCheckIn(
          false
        );

        /*
         * Notify ParticipantManagement.
         *
         * This will refresh:
         *
         * - participant table
         * - dashboard stats
         */
        onCheckInSuccess?.(
          updatedParticipant
        );
      } catch (error) {
        const status =
          error.response
            ?.status;

        const code =
          error.response
            ?.data?.code;

        const serverMessage =
          error.response
            ?.data?.message;

        /*
        |--------------------------------------------------------------------------
        | ADMIN SESSION EXPIRED
        |--------------------------------------------------------------------------
        */

        if (status === 401) {
          toast.error(
            "Your admin session has expired. Please sign in again."
          );

          return;
        }

        /*
        |--------------------------------------------------------------------------
        | ALREADY CHECKED IN
        |--------------------------------------------------------------------------
        |
        | This could happen if:
        |
        | - another admin checked them in
        | - their QR was scanned
        | - this modal contained stale data
        |
        */

        if (
          code ===
          "ALREADY_CHECKED_IN"
        ) {
          toast.info(
            "This participant has already checked in."
          );

          setConfirmCheckIn(
            false
          );

          /*
           * Refresh frontend state so the
           * stale "Not Checked In" state
           * disappears.
           */
          onCheckInSuccess?.(
            error.response
              ?.data
              ?.participant
          );

          return;
        }

        /*
        |--------------------------------------------------------------------------
        | REGISTRATION NOT FOUND
        |--------------------------------------------------------------------------
        */

        if (
          code ===
          "REGISTRATION_NOT_FOUND"
        ) {
          toast.error(
            serverMessage ||
              "No confirmed paid registration was found."
          );

          return;
        }

        /*
        |--------------------------------------------------------------------------
        | INVALID REGISTRATION ID
        |--------------------------------------------------------------------------
        */

        if (
          code ===
          "INVALID_REGISTRATION_ID"
        ) {
          toast.error(
            serverMessage ||
              "Invalid registration ID."
          );

          return;
        }

        /*
        |--------------------------------------------------------------------------
        | GENERAL FAILURE
        |--------------------------------------------------------------------------
        */

        toast.error(
          serverMessage ||
            "Unable to check in participant."
        );
      } finally {
        setCheckingIn(false);
      }
    };

  /*
  |--------------------------------------------------------------------------
  | NO PARTICIPANT
  |--------------------------------------------------------------------------
  */

  if (!participant) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
      onMouseDown={(
        event
      ) => {
        if (
          event.target ===
            event.currentTarget &&
          !checkingIn
        ) {
          onClose?.();
        }
      }}
    >

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="participant-modal-title"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[28px] bg-[var(--cream-light)] shadow-2xl"
      >

        {/* ============================================================
            HEADER
        ============================================================= */}

        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[var(--border)] bg-[var(--cream-light)] p-5 sm:p-6">

          <div>

            <span className="text-[9px] font-black uppercase tracking-[0.16em] text-[var(--gold)]">
              Participant Details
            </span>

            <h2
              id="participant-modal-title"
              className="mt-1 text-2xl font-black uppercase tracking-[-0.03em] text-[var(--red)]"
            >
              {
                participant.fullName
              }
            </h2>

            <p className="mt-1 text-xs font-bold text-[var(--muted)]">
              {
                participant.registrationId
              }
            </p>

          </div>

          <button
            type="button"
            onClick={() => {
              if (
                !checkingIn
              ) {
                onClose?.();
              }
            }}
            disabled={
              checkingIn
            }
            aria-label="Close participant details"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--border)] text-[var(--red)] transition hover:bg-[var(--red)] hover:text-[var(--cream)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={18} />
          </button>

        </div>

        {/* ============================================================
            CHECK-IN STATUS
        ============================================================= */}

        <div className="p-5 pb-0 sm:p-6 sm:pb-0">

          {participant.checkedIn ? (
            <div className="flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-green-800">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100">

                <CheckCircle2
                  size={20}
                />

              </div>

              <div>

                <p className="text-xs font-black uppercase tracking-[0.08em]">
                  Checked In
                </p>

                <p className="mt-1 text-[11px]">
                  {participant.checkedInAt
                    ? formatDate(
                        participant.checkedInAt
                      )
                    : "Check-in confirmed"}
                </p>

              </div>

            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-2xl border border-[var(--gold)]/30 bg-[var(--gold)]/15 p-4 text-[var(--red)]">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--gold)]/20">

                <CircleX
                  size={20}
                />

              </div>

              <div>

                <p className="text-xs font-black uppercase tracking-[0.08em]">
                  Not Checked In
                </p>

                <p className="mt-1 text-[11px] text-[var(--muted)]">
                  Participant has not
                  entered the event yet.
                </p>

              </div>

            </div>
          )}

        </div>

        {/* ============================================================
            PARTICIPANT DETAILS
        ============================================================= */}

        <div className="grid gap-x-7 p-5 sm:grid-cols-2 sm:p-6">

          <div>

            <DetailRow
              icon={UserRound}
              label="Full Name"
              value={
                participant.fullName
              }
            />

            <DetailRow
              icon={Mail}
              label="Email"
              value={
                participant.email
              }
            />

            <DetailRow
              icon={Phone}
              label="Phone"
              value={
                participant.phone
              }
            />

            <DetailRow
              icon={MapPin}
              label="Parish"
              value={
                participant.parish
              }
            />

          </div>

          <div>

            <DetailRow
              icon={Shirt}
              label="Jersey Size"
              value={
                participant.jerseySize
              }
            />

            <DetailRow
              icon={Ticket}
              label="Ticket ID"
              value={
                participant.registrationId
              }
            />

            <DetailRow
              icon={CreditCard}
              label="Payment"
              value={`${formatCurrency(
                participant.amountPaid
              )} • Verified`}
            />

            <DetailRow
              icon={CalendarDays}
              label="Registered At"
              value={formatDate(
                participant.createdAt
              )}
            />

          </div>

        </div>

        {/* ============================================================
            PAYMENT ID
        ============================================================= */}

        <div className="border-t border-[var(--border)] px-5 py-5 sm:px-6">

          <p className="text-[9px] font-black uppercase tracking-[0.13em] text-[var(--muted)]">
            Razorpay Payment ID
          </p>

          <p className="mt-2 break-all rounded-xl bg-[var(--cream)] p-3 font-mono text-[11px] text-[var(--brown)]">
            {
              participant.razorpayPaymentId ||
              "—"
            }
          </p>

        </div>

        {/* ============================================================
            MANUAL CHECK-IN
        ============================================================= */}

        {!participant.checkedIn && (
          <div className="border-t border-[var(--border)] p-5 sm:p-6">

            {!confirmCheckIn ? (
              <>
                <div className="mb-4">

                  <p className="text-[9px] font-black uppercase tracking-[0.14em] text-[var(--gold)]">
                    Event Entry
                  </p>

                  <h3 className="mt-1 text-base font-black uppercase text-[var(--red)]">
                    Manual Check-In
                  </h3>

                  <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
                    Use this only when
                    the participant's QR
                    code cannot be scanned.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setConfirmCheckIn(
                      true
                    )
                  }
                  className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--red)] px-5 text-xs font-black uppercase tracking-[0.08em] text-[var(--cream)] transition hover:bg-[var(--red-dark)]"
                >
                  <CheckCircle2
                    size={17}
                  />

                  Manual Check-In
                </button>
              </>
            ) : (
              /*
              |--------------------------------------------------------------------------
              | CONFIRMATION PANEL
              |--------------------------------------------------------------------------
              */

              <div className="rounded-2xl border border-[var(--gold)]/40 bg-[var(--gold)]/10 p-4 sm:p-5">

                <div className="flex items-start gap-3">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--gold)] text-[var(--red)]">

                    <CircleAlert
                      size={19}
                    />

                  </div>

                  <div>

                    <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--red)]">
                      Confirm Manual Check-In
                    </p>

                    <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
                      Confirm entry for{" "}
                      <strong className="text-[var(--brown)]">
                        {
                          participant.fullName
                        }
                      </strong>
                      {" "}with ticket{" "}
                      <strong className="text-[var(--brown)]">
                        {
                          participant.registrationId
                        }
                      </strong>
                      ?
                    </p>

                  </div>

                </div>

                <div className="mt-5 grid gap-2 sm:grid-cols-2">

                  <button
                    type="button"
                    disabled={
                      checkingIn
                    }
                    onClick={() =>
                      setConfirmCheckIn(
                        false
                      )
                    }
                    className="flex min-h-11 items-center justify-center rounded-full border border-[var(--border)] px-4 text-[10px] font-black uppercase tracking-[0.08em] text-[var(--red)] transition hover:border-[var(--red)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    disabled={
                      checkingIn
                    }
                    onClick={
                      handleManualCheckIn
                    }
                    className="flex min-h-11 items-center justify-center gap-2 rounded-full bg-[var(--red)] px-4 text-[10px] font-black uppercase tracking-[0.08em] text-[var(--cream)] transition hover:bg-[var(--red-dark)] disabled:cursor-not-allowed disabled:opacity-60"
                  >

                    {checkingIn ? (
                      <>
                        <LoaderCircle
                          size={15}
                          className="animate-spin"
                        />

                        Checking In...
                      </>
                    ) : (
                      <>
                        <CheckCircle2
                          size={15}
                        />

                        Confirm Check-In
                      </>
                    )}

                  </button>

                </div>

              </div>
            )}

          </div>
        )}

        {/* ============================================================
            CHECKED-IN FOOTER
        ============================================================= */}

        {participant.checkedIn && (
          <div className="border-t border-[var(--border)] p-5 sm:p-6">

            <div className="flex items-center justify-center gap-2 rounded-full bg-green-100 px-5 py-3 text-[10px] font-black uppercase tracking-[0.1em] text-green-800">

              <CheckCircle2
                size={16}
              />

              Entry Confirmed

            </div>

          </div>
        )}

      </div>

    </div>
  );
}

export default ParticipantModal;