import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  ChevronLeft,
  ChevronRight,
  Eye,
  LoaderCircle,
  Search,
  SlidersHorizontal,
  Users,
  X,
} from "lucide-react";

import {
  toast,
} from "react-toastify";

import api from "../../services/api";

import ParticipantModal from "./ParticipantModal";

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

const PAGE_SIZE = 20;

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
    Number(amountInPaise || 0) /
      100
  );
};

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

      day: "2-digit",

      month: "short",

      year: "numeric",
    }
  ).format(date);
};

/*
|--------------------------------------------------------------------------
| PARTICIPANT MANAGEMENT
|--------------------------------------------------------------------------
|
| refreshKey:
|
| The parent dashboard increments this after a successful QR check-in.
|
| When it changes, this component reloads the current participant list.
|
*/

function ParticipantManagement({
  refreshKey = 0,
  onCheckInSuccess,
}) {
  /*
  |--------------------------------------------------------------------------
  | DATA STATE
  |--------------------------------------------------------------------------
  */

  const [
    registrations,
    setRegistrations,
  ] = useState([]);

  const [
    pagination,
    setPagination,
  ] = useState({
    page: 1,

    limit: PAGE_SIZE,

    totalRegistrations: 0,

    totalPages: 0,

    hasPreviousPage: false,

    hasNextPage: false,
  });

  const [loading, setLoading] =
    useState(true);

  /*
  |--------------------------------------------------------------------------
  | FILTER STATE
  |--------------------------------------------------------------------------
  */

  const [
    searchInput,
    setSearchInput,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    jerseySize,
    setJerseySize,
  ] = useState("");

  const [
    checkIn,
    setCheckIn,
  ] = useState("");

  const [sort, setSort] =
    useState("newest");

  const [page, setPage] =
    useState(1);

  const [
    selectedParticipant,
    setSelectedParticipant,
  ] = useState(null);

  /*
  |--------------------------------------------------------------------------
  | LOAD PARTICIPANTS
  |--------------------------------------------------------------------------
  */

  const loadRegistrations =
    useCallback(async () => {
      try {
        setLoading(true);

        const response =
          await api.get(
            "/admin/registrations",
            {
              params: {
                search:
                  search ||
                  undefined,

                jerseySize:
                  jerseySize ||
                  undefined,

                checkIn:
                  checkIn ||
                  undefined,

                sort,

                page,

                limit:
                  PAGE_SIZE,
              },
            }
          );

        setRegistrations(
          response.data
            ?.registrations ||
            []
        );

        setPagination(
          response.data
            ?.pagination || {
            page: 1,

            limit:
              PAGE_SIZE,

            totalRegistrations:
              0,

            totalPages: 0,

            hasPreviousPage:
              false,

            hasNextPage:
              false,
          }
        );
      } catch (error) {
        if (
          error.response?.status !==
          401
        ) {
          toast.error(
            "Unable to load participants."
          );
        }
      } finally {
        setLoading(false);
      }
    }, [
      search,
      jerseySize,
      checkIn,
      sort,
      page,
    ]);

  /*
  |--------------------------------------------------------------------------
  | INITIAL LOAD + FILTER/PAGE CHANGES + QR REFRESH
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    loadRegistrations();
  }, [
    loadRegistrations,
    refreshKey,
  ]);

  /*
  |--------------------------------------------------------------------------
  | KEEP OPEN PARTICIPANT MODAL UPDATED
  |--------------------------------------------------------------------------
  |
  | If the participant whose modal is currently open was updated by a
  | QR check-in, update the modal with the refreshed participant data.
  |
  */

  useEffect(() => {
    if (
      !selectedParticipant
    ) {
      return;
    }

    const refreshedParticipant =
      registrations.find(
        (participant) =>
          participant._id ===
          selectedParticipant._id
      );

    if (
      refreshedParticipant
    ) {
      setSelectedParticipant(
        refreshedParticipant
      );
    }
  }, [
    registrations,
    selectedParticipant,
  ]);

  /*
  |--------------------------------------------------------------------------
  | SEARCH
  |--------------------------------------------------------------------------
  */

  const handleSearch = (
    event
  ) => {
    event.preventDefault();

    setPage(1);

    setSearch(
      searchInput.trim()
    );
  };

  /*
  |--------------------------------------------------------------------------
  | CLEAR FILTERS
  |--------------------------------------------------------------------------
  */

  const clearFilters = () => {
    setSearchInput("");

    setSearch("");

    setJerseySize("");

    setCheckIn("");

    setSort("newest");

    setPage(1);
  };

  const filtersActive =
    Boolean(search) ||
    Boolean(jerseySize) ||
    Boolean(checkIn) ||
    sort !== "newest";

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (
    <>
      <section className="mt-6 overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--cream-light)]">

        {/* HEADER */}

        <div className="flex flex-col justify-between gap-4 border-b border-[var(--border)] p-5 sm:p-6 lg:flex-row lg:items-center">

          <div>

            <span className="text-[9px] font-black uppercase tracking-[0.15em] text-[var(--gold)]">
              Registrations
            </span>

            <div className="mt-1 flex items-center gap-3">

              <h2 className="text-xl font-black uppercase text-[var(--red)]">
                Participant Management
              </h2>

              <span className="rounded-full bg-[var(--red)] px-2.5 py-1 text-[9px] font-black text-[var(--cream)]">
                {
                  pagination.totalRegistrations
                }
              </span>

            </div>

            <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
              Search and filter confirmed
              paid registrations.
            </p>

          </div>

          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.1em] text-[var(--muted)]">

            <Users size={15} />

            {
              pagination.totalRegistrations
            }{" "}
            Participants

          </div>

        </div>

        {/* SEARCH */}

        <div className="border-b border-[var(--border)] p-5 sm:p-6">

          <form
            onSubmit={
              handleSearch
            }
            className="flex flex-col gap-3 md:flex-row"
          >

            <div className="relative flex-1">

              <Search
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]"
              />

              <input
                type="search"
                value={
                  searchInput
                }
                onChange={(
                  event
                ) =>
                  setSearchInput(
                    event.target
                      .value
                  )
                }
                placeholder="Search name, email, phone, parish, ticket or payment ID..."
                className="form-control pl-11"
              />

            </div>

            <button
              type="submit"
              className="primary-button justify-center md:min-w-28"
            >
              <Search
                size={16}
              />

              Search
            </button>

          </form>

          {/* FILTERS */}

          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

            <select
              value={
                jerseySize
              }
              onChange={(
                event
              ) => {
                setJerseySize(
                  event.target
                    .value
                );

                setPage(1);
              }}
              className="form-control"
            >
              <option value="">
                All Jersey Sizes
              </option>

              {JERSEY_SIZES.map(
                (size) => (
                  <option
                    key={size}
                    value={size}
                  >
                    Jersey {size}
                  </option>
                )
              )}
            </select>

            <select
              value={checkIn}
              onChange={(
                event
              ) => {
                setCheckIn(
                  event.target
                    .value
                );

                setPage(1);
              }}
              className="form-control"
            >
              <option value="">
                All Check-In Status
              </option>

              <option value="checked-in">
                Checked In
              </option>

              <option value="not-checked-in">
                Not Checked In
              </option>
            </select>

            <select
              value={sort}
              onChange={(
                event
              ) => {
                setSort(
                  event.target
                    .value
                );

                setPage(1);
              }}
              className="form-control"
            >
              <option value="newest">
                Newest First
              </option>

              <option value="oldest">
                Oldest First
              </option>

              <option value="name-asc">
                Name A–Z
              </option>

              <option value="name-desc">
                Name Z–A
              </option>

              <option value="parish-asc">
                Parish A–Z
              </option>

              <option value="parish-desc">
                Parish Z–A
              </option>
            </select>

            <button
              type="button"
              onClick={
                clearFilters
              }
              disabled={
                !filtersActive
              }
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-[var(--border)] px-4 text-xs font-black uppercase tracking-[0.08em] text-[var(--red)] transition hover:border-[var(--red)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <X size={15} />

              Clear Filters
            </button>

          </div>

        </div>

        {/* CONTENT */}

        {loading ? (
          <div className="flex min-h-[320px] items-center justify-center">

            <div className="text-center">

              <LoaderCircle
                size={28}
                className="mx-auto animate-spin text-[var(--red)]"
              />

              <p className="mt-3 text-[9px] font-black uppercase tracking-[0.15em] text-[var(--muted)]">
                Loading Participants
              </p>

            </div>

          </div>
        ) : registrations.length ===
          0 ? (

          /* EMPTY */

          <div className="flex min-h-[320px] items-center justify-center p-6 text-center">

            <div>

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--gold)]/15 text-[var(--red)]">

                <SlidersHorizontal
                  size={22}
                />

              </div>

              <h3 className="mt-4 text-lg font-black uppercase text-[var(--red)]">
                No Participants Found
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-[var(--muted)]">
                No confirmed registrations
                match your current search
                or filters.
              </p>

              {filtersActive && (
                <button
                  type="button"
                  onClick={
                    clearFilters
                  }
                  className="mt-5 text-xs font-black uppercase tracking-[0.1em] text-[var(--red)] underline"
                >
                  Clear Filters
                </button>
              )}

            </div>

          </div>
        ) : (
          <>
            {/* ========================================================
                DESKTOP TABLE
            ======================================================== */}

            <div className="hidden overflow-x-auto lg:block">

              <table className="w-full min-w-[1150px] border-collapse">

                <thead>

                  <tr className="border-b border-[var(--border)] bg-[var(--cream)]">

                    {[
                      "Ticket ID",
                      "Participant",
                      "Phone",
                      "Parish",
                      "Jersey",
                      "Payment ID",
                      "Amount",
                      "Date",
                      "Check-In",
                      "",
                    ].map(
                      (
                        heading,
                        index
                      ) => (
                        <th
                          key={`${heading}-${index}`}
                          className="whitespace-nowrap px-4 py-4 text-left text-[9px] font-black uppercase tracking-[0.12em] text-[var(--muted)]"
                        >
                          {heading}
                        </th>
                      )
                    )}

                  </tr>

                </thead>

                <tbody>

                  {registrations.map(
                    (
                      participant
                    ) => (
                      <tr
                        key={
                          participant._id
                        }
                        className="border-b border-[var(--border)] transition last:border-b-0 hover:bg-[var(--cream)]/60"
                      >

                        {/* ID */}

                        <td className="whitespace-nowrap px-4 py-4 text-[11px] font-black text-[var(--red)]">
                          {
                            participant.registrationId
                          }
                        </td>

                        {/* PARTICIPANT */}

                        <td className="px-4 py-4">

                          <p className="whitespace-nowrap text-xs font-black text-[var(--brown)]">
                            {
                              participant.fullName
                            }
                          </p>

                          <p className="mt-1 max-w-[190px] truncate text-[10px] text-[var(--muted)]">
                            {
                              participant.email
                            }
                          </p>

                        </td>

                        {/* PHONE */}

                        <td className="whitespace-nowrap px-4 py-4 text-[11px] text-[var(--brown)]">
                          {
                            participant.phone
                          }
                        </td>

                        {/* PARISH */}

                        <td className="max-w-[180px] px-4 py-4 text-[11px] text-[var(--brown)]">

                          <p className="line-clamp-2">
                            {
                              participant.parish
                            }
                          </p>

                        </td>

                        {/* JERSEY */}

                        <td className="px-4 py-4">

                          <span className="inline-flex min-w-9 justify-center rounded-full bg-[var(--gold)] px-2.5 py-1 text-[9px] font-black text-[var(--red)]">
                            {
                              participant.jerseySize
                            }
                          </span>

                        </td>

                        {/* PAYMENT */}

                        <td className="max-w-[150px] px-4 py-4">

                          <p
                            title={
                              participant.razorpayPaymentId
                            }
                            className="truncate font-mono text-[10px] text-[var(--muted)]"
                          >
                            {
                              participant.razorpayPaymentId ||
                              "—"
                            }
                          </p>

                        </td>

                        {/* AMOUNT */}

                        <td className="whitespace-nowrap px-4 py-4 text-[11px] font-black text-[var(--brown)]">
                          {formatCurrency(
                            participant.amountPaid
                          )}
                        </td>

                        {/* DATE */}

                        <td className="whitespace-nowrap px-4 py-4 text-[10px] text-[var(--muted)]">
                          {formatDate(
                            participant.createdAt
                          )}
                        </td>

                        {/* CHECK-IN */}

                        <td className="whitespace-nowrap px-4 py-4">

                          {participant.checkedIn ? (
                            <span className="rounded-full bg-green-100 px-3 py-1.5 text-[9px] font-black uppercase text-green-800">
                              Checked In
                            </span>
                          ) : (
                            <span className="rounded-full bg-[var(--cream)] px-3 py-1.5 text-[9px] font-black uppercase text-[var(--muted)]">
                              Not Checked In
                            </span>
                          )}

                        </td>

                        {/* DETAILS */}

                        <td className="px-4 py-4">

                          <button
                            type="button"
                            onClick={() =>
                              setSelectedParticipant(
                                participant
                              )
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] text-[var(--red)] transition hover:border-[var(--red)] hover:bg-[var(--red)] hover:text-[var(--cream)]"
                            aria-label={`View ${participant.fullName}`}
                          >
                            <Eye
                              size={15}
                            />
                          </button>

                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>

            {/* ========================================================
                MOBILE / TABLET
            ======================================================== */}

            <div className="grid gap-3 p-4 lg:hidden">

              {registrations.map(
                (
                  participant
                ) => (
                  <article
                    key={
                      participant._id
                    }
                    className="rounded-2xl border border-[var(--border)] bg-[var(--cream)]/50 p-4"
                  >

                    <div className="flex items-start justify-between gap-3">

                      <div className="min-w-0">

                        <p className="text-[9px] font-black uppercase tracking-[0.1em] text-[var(--gold)]">
                          {
                            participant.registrationId
                          }
                        </p>

                        <h3 className="mt-1 truncate text-base font-black text-[var(--red)]">
                          {
                            participant.fullName
                          }
                        </h3>

                        <p className="mt-1 truncate text-[11px] text-[var(--muted)]">
                          {
                            participant.parish
                          }
                        </p>

                      </div>

                      <span className="shrink-0 rounded-full bg-[var(--gold)] px-3 py-1.5 text-[9px] font-black text-[var(--red)]">
                        {
                          participant.jerseySize
                        }
                      </span>

                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">

                      <div>

                        <p className="text-[8px] font-black uppercase tracking-[0.1em] text-[var(--muted)]">
                          Amount
                        </p>

                        <p className="mt-1 text-xs font-black">
                          {formatCurrency(
                            participant.amountPaid
                          )}
                        </p>

                      </div>

                      <div>

                        <p className="text-[8px] font-black uppercase tracking-[0.1em] text-[var(--muted)]">
                          Status
                        </p>

                        <p
                          className={`mt-1 text-[10px] font-black ${
                            participant.checkedIn
                              ? "text-green-700"
                              : "text-[var(--red)]"
                          }`}
                        >
                          {participant.checkedIn
                            ? "Checked In"
                            : "Not Checked In"}
                        </p>

                      </div>

                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setSelectedParticipant(
                          participant
                        )
                      }
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-[var(--red)] px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.08em] text-[var(--red)]"
                    >
                      <Eye size={14} />

                      View Details
                    </button>

                  </article>
                )
              )}

            </div>
          </>
        )}

        {/* ============================================================
            PAGINATION
        ============================================================= */}

        {!loading &&
          pagination.totalRegistrations >
            0 && (
            <div className="flex flex-col justify-between gap-4 border-t border-[var(--border)] p-5 sm:flex-row sm:items-center sm:p-6">

              <div>

                <p className="text-[10px] font-bold text-[var(--muted)]">
                  Showing page{" "}

                  <span className="font-black text-[var(--red)]">
                    {pagination.page}
                  </span>

                  {" "}of{" "}

                  <span className="font-black text-[var(--red)]">
                    {pagination.totalPages}
                  </span>
                </p>

                <p className="mt-1 text-[9px] text-[var(--muted)]">
                  {
                    pagination.totalRegistrations
                  }{" "}
                  matching participant
                  {pagination.totalRegistrations ===
                  1
                    ? ""
                    : "s"}
                </p>

              </div>

              <div className="flex gap-2">

                <button
                  type="button"
                  disabled={
                    !pagination.hasPreviousPage
                  }
                  onClick={() =>
                    setPage(
                      (
                        previous
                      ) =>
                        Math.max(
                          previous -
                            1,
                          1
                        )
                    )
                  }
                  className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[var(--border)] px-4 text-[10px] font-black uppercase tracking-[0.08em] text-[var(--red)] transition hover:border-[var(--red)] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft
                    size={15}
                  />

                  Previous
                </button>

                <button
                  type="button"
                  disabled={
                    !pagination.hasNextPage
                  }
                  onClick={() =>
                    setPage(
                      (
                        previous
                      ) =>
                        previous +
                        1
                    )
                  }
                  className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[var(--red)] px-4 text-[10px] font-black uppercase tracking-[0.08em] text-[var(--cream)] transition hover:bg-[var(--red-dark)] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next

                  <ChevronRight
                    size={15}
                  />
                </button>

              </div>

            </div>
          )}

      </section>

      {/* ==============================================================
          PARTICIPANT DETAILS MODAL
      =============================================================== */}

    <ParticipantModal
  participant={
    selectedParticipant
  }
  onClose={() =>
    setSelectedParticipant(
      null
    )
  }
  onCheckInSuccess={() => {
    /*
     * Close participant modal.
     */
    setSelectedParticipant(
      null
    );

    /*
     * Refresh this participant table.
     *
     * This gives immediate feedback even
     * before the parent's refreshKey changes.
     */
    loadRegistrations();

    /*
     * Tell AdminDashboard.
     *
     * AdminDashboard will:
     *
     * - reload dashboard stats
     * - increment participantRefreshKey
     */
    onCheckInSuccess?.();
  }}
/>

    </>
  );
}

export default ParticipantManagement;