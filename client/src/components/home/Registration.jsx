import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
  Link,
} from "react-router-dom";

import {
  ArrowRight,
  Check,
  ChevronDown,
  LoaderCircle,
  Search,
  ShieldCheck,
  TicketCheck,
} from "lucide-react";

import { toast } from "react-toastify";

import api from "../../services/api";
import { loadRazorpayScript } from "../../utils/loadRazorpay";

/*
|--------------------------------------------------------------------------
| INITIAL FORM
|--------------------------------------------------------------------------
*/

const initialForm = {
  fullName: "",
  email: "",
  phone: "",
  parish: "",
  jerseySize: "",
};

/*
|--------------------------------------------------------------------------
| PARISHES
|--------------------------------------------------------------------------
*/

const PARISHES = [
  "Addahole",
  "Ajekar",
  "Ajiri",
  "Arla",
  "Arasinamakki",
  "Bajagoli",
  "Banavara",
  "Bangady",
  "Battial",
  "Belthangady",
  "Bolminar",
  "Devagiri",
  "Dharmasthala",
  "Gandibagilu",
  "Gonikoppal",
  "Guthigar",
  "Hanchikad",
  "Hebri",
  "Heggala",
  "Hoskote",
  "Ichilampady",
  "Jadkal",
  "Kalenja",
  "Kalmakki",
  "Kanchal",
  "Kankanady",
  "Kattipalla",
  "Kervashe",
  "Kuthlur",
  "Kutrupady",
  "Maddody",
  "Mala-Chowki",
  "Manipal",
  "Mantrady",
  "Mardala",
  "Moorje",
  "Mudur",
  "Mundaje",
  "Murnad",
  "Navoor",
  "Nellyady",
  "Nettana",
  "Padavu",
  "Sampaje",
  "Shirady",
  "Shirlal",
  "Shirur",
  "Siddapura(Kodagu)",
  "Siddapura(Kundapura)",
  "Sullia",
  "Thottathady",
  "Udane",
  "Ujire",
  "Venur",
  "Yellukochi",
];

function Registration() {
  const navigate = useNavigate();

  /*
  |--------------------------------------------------------------------------
  | FORM STATE
  |--------------------------------------------------------------------------
  */

  const [form, setForm] =
    useState(initialForm);

  const [loading, setLoading] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | PARISH DROPDOWN STATE
  |--------------------------------------------------------------------------
  */

  const [
    parishOpen,
    setParishOpen,
  ] = useState(false);

  const [
    parishSearch,
    setParishSearch,
  ] = useState("");

  const parishRef = useRef(null);

  /*
  |--------------------------------------------------------------------------
  | FILTER PARISHES
  |--------------------------------------------------------------------------
  */

  const filteredParishes =
    PARISHES.filter((parish) =>
      parish
        .toLowerCase()
        .includes(
          parishSearch
            .trim()
            .toLowerCase()
        )
    );

  /*
  |--------------------------------------------------------------------------
  | CLOSE PARISH DROPDOWN ON OUTSIDE CLICK
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const handleOutsideClick = (
      event
    ) => {
      if (
        parishRef.current &&
        !parishRef.current.contains(
          event.target
        )
      ) {
        setParishOpen(false);
        setParishSearch("");
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | HANDLE PARISH SELECTION
  |--------------------------------------------------------------------------
  */

  const handleParishSelect = (
    parish
  ) => {
    setForm((prev) => ({
      ...prev,
      parish,
    }));

    setParishOpen(false);
    setParishSearch("");
  };

  /*
  |--------------------------------------------------------------------------
  | HANDLE FORM INPUT
  |--------------------------------------------------------------------------
  */

  const handleChange = (event) => {
    const { name, value } =
      event.target;

    // Phone: digits only, maximum 10
    if (name === "phone") {
      const digitsOnly = value
        .replace(/\D/g, "")
        .slice(0, 10);

      setForm((prev) => ({
        ...prev,
        phone: digitsOnly,
      }));

      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /*
  |--------------------------------------------------------------------------
  | CLIENT-SIDE VALIDATION
  |--------------------------------------------------------------------------
  |
  | UX validation only.
  | Backend remains the source of truth.
  |
  */

  const validateForm = () => {
    const fullName =
      form.fullName.trim();

    const email =
      form.email.trim();

    const phone =
      form.phone.trim();

    const parish =
      form.parish.trim();

    if (!fullName) {
      toast.error(
        "Please enter your full name."
      );

      return false;
    }

    if (!email) {
      toast.error(
        "Please enter your email address."
      );

      return false;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email
      )
    ) {
      toast.error(
        "Please enter a valid email address."
      );

      return false;
    }

    if (!phone) {
      toast.error(
        "Please enter your phone number."
      );

      return false;
    }

    if (
      !/^[6-9]\d{9}$/.test(phone)
    ) {
      toast.error(
        "Please enter a valid 10-digit mobile number."
      );

      return false;
    }

    if (!parish) {
      toast.error(
        "Please select your parish."
      );

      return false;
    }

    if (!form.jerseySize) {
      toast.error(
        "Please select your jersey size."
      );

      return false;
    }

    return true;
  };

  /*
  |--------------------------------------------------------------------------
  | START REGISTRATION + PAYMENT
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    // Prevent double-clicks
    if (loading) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    let checkoutOpened = false;

    try {
      setLoading(true);

      /*
      |--------------------------------------------------------------------------
      | STEP 1 — LOAD RAZORPAY CHECKOUT
      |--------------------------------------------------------------------------
      */

      const razorpayLoaded =
        await loadRazorpayScript();

      if (!razorpayLoaded) {
        toast.error(
          "Unable to load the payment gateway. Please check your internet connection and try again."
        );

        setLoading(false);
        return;
      }

      /*
      |--------------------------------------------------------------------------
      | STEP 2 — CREATE ORDER THROUGH OUR BACKEND
      |--------------------------------------------------------------------------
      |
      | Amount and currency are NOT sent from React.
      | Backend controls the ₹300 registration fee.
      |
      */

      const orderResponse =
        await api.post(
          "/payments/create-order",
          {
            fullName:
              form.fullName.trim(),

            email:
              form.email.trim(),

            phone:
              form.phone.trim(),

            parish:
              form.parish.trim(),

            jerseySize:
              form.jerseySize,
          }
        );

      const {
        success,
        order,
        keyId,
      } = orderResponse.data;

      if (
        !success ||
        !order?.id ||
        !order?.amount ||
        !order?.currency ||
        !keyId
      ) {
        throw new Error(
          "Invalid payment order response."
        );
      }

      /*
      |--------------------------------------------------------------------------
      | STEP 3 — RAZORPAY CHECKOUT CONFIGURATION
      |--------------------------------------------------------------------------
      */

      const options = {
        // Public Razorpay key only
        key: keyId,

        amount: order.amount,
        currency: order.currency,
        order_id: order.id,

        name: "UNARVV '26",

        description:
          "Youth Convention Registration",

        prefill: {
          name:
            form.fullName.trim(),

          email:
            form.email.trim(),

          contact:
            form.phone.trim(),
        },

        notes: {
          event: "UNARVV26",
        },

        theme: {
          color: "#971d20",
        },

        /*
        |--------------------------------------------------------------------------
        | PAYMENT SUCCESS CALLBACK
        |--------------------------------------------------------------------------
        |
        | Razorpay success is NOT trusted directly.
        | Backend performs final verification.
        |
        */

        handler: async function (
          razorpayResponse
        ) {
          try {
            toast.info(
              "Payment received. Verifying your registration..."
            );

            /*
            |--------------------------------------------------------------------------
            | STEP 4 — VERIFY PAYMENT ON BACKEND
            |--------------------------------------------------------------------------
            */

            const verifyResponse =
              await api.post(
                "/payments/verify",
                {
                  razorpay_order_id:
                    razorpayResponse
                      .razorpay_order_id,

                  razorpay_payment_id:
                    razorpayResponse
                      .razorpay_payment_id,

                  razorpay_signature:
                    razorpayResponse
                      .razorpay_signature,
                }
              );

            /*
            |--------------------------------------------------------------------------
            | STEP 5 — REGISTRATION CONFIRMED
            |--------------------------------------------------------------------------
            */

            if (
              verifyResponse.data
                ?.success
            ) {
              const registration =
                verifyResponse.data
                  .registration;

              const ticketToken =
                registration
                  ?.ticketToken;

              if (!ticketToken) {
                throw new Error(
                  "Ticket token was not returned."
                );
              }

              toast.success(
                "Registration confirmed! Welcome to UNARVV '26."
              );

              // Clear form
              setForm(initialForm);

              // Clear parish UI
              setParishSearch("");
              setParishOpen(false);

              // Open secure pass
              navigate(
                `/pass/${ticketToken}`
              );

              return;
            }

            throw new Error(
              "Payment verification failed."
            );
          } catch (
            verificationError
          ) {
            console.error(
              "Payment verification error:",
              verificationError
            );

            const serverMessage =
              verificationError
                .response?.data
                ?.message;

            /*
             * Important:
             * The payment may have already
             * succeeded.
             *
             * Never immediately ask the user
             * to pay again.
             */

            toast.error(
              serverMessage ||
                "Your payment may have succeeded, but confirmation could not be completed. Please do not pay again immediately."
            );
          } finally {
            setLoading(false);
          }
        },

        /*
        |--------------------------------------------------------------------------
        | CHECKOUT CLOSED
        |--------------------------------------------------------------------------
        */

        modal: {
          ondismiss: function () {
            setLoading(false);

            toast.info(
              "Payment window closed. Your registration has not been confirmed."
            );
          },

          escape: true,
          backdropclose: false,
          confirm_close: true,
        },
      };

      /*
      |--------------------------------------------------------------------------
      | STEP 6 — CREATE CHECKOUT INSTANCE
      |--------------------------------------------------------------------------
      */

      const razorpayCheckout =
        new window.Razorpay(
          options
        );

      /*
      |--------------------------------------------------------------------------
      | PAYMENT FAILURE EVENT
      |--------------------------------------------------------------------------
      */

      razorpayCheckout.on(
        "payment.failed",
        function (response) {
          console.error(
            "Razorpay payment failed:",
            response.error
          );

          setLoading(false);

          const description =
            response.error
              ?.description;

          toast.error(
            description ||
              "Payment failed. No registration was confirmed."
          );
        }
      );

      /*
      |--------------------------------------------------------------------------
      | STEP 7 — OPEN RAZORPAY CHECKOUT
      |--------------------------------------------------------------------------
      */

      razorpayCheckout.open();

      checkoutOpened = true;
    } catch (error) {
      console.error(
        "Payment initialization error:",
        error
      );

      const data =
        error.response?.data;

      /*
      |--------------------------------------------------------------------------
      | ALREADY REGISTERED
      |--------------------------------------------------------------------------
      */

      if (
        error.response?.status ===
          409 &&
        data?.code ===
          "ALREADY_REGISTERED"
      ) {
        toast.error(
          "You already have a confirmed registration. Use Retrieve My Pass to access your pass."
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | BACKEND VALIDATION ERROR
      |--------------------------------------------------------------------------
      */

      if (
        error.response?.status ===
          400 &&
        Array.isArray(
          data?.errors
        )
      ) {
        toast.error(
          data.errors[0]
            ?.message ||
            "Please check your registration details."
        );

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | OTHER ERRORS
      |--------------------------------------------------------------------------
      */

      toast.error(
        data?.message ||
          error.message ||
          "Unable to start payment. Please try again."
      );
    } finally {
      /*
       * Checkout callbacks release
       * loading after Checkout opens.
       */

      if (!checkoutOpened) {
        setLoading(false);
      }
    }
  };

  return (
    <section
      id="register"
      className="section-space bg-[var(--gold)]"
    >
      <div className="container-custom">

        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">

          {/* ================================================================
              LEFT CONTENT
          ================================================================= */}

          <div>
            <span className="text-xs font-black uppercase tracking-[0.18em] text-[var(--red)]">
              04 / Registration
            </span>

            <h2 className="mt-5 text-5xl font-black uppercase leading-[0.88] tracking-[-0.06em] text-[var(--red)] sm:text-6xl lg:text-7xl">
              Claim
              <br />
              your pass.
            </h2>

            <p className="mt-6 max-w-md text-base leading-7 text-[var(--brown)]/75">
              Join us at St. Francis
              School, Kokkada on
              17–18 October 2026 for
              UNARVV '26.
            </p>

            <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-[var(--red)] px-5 py-3 text-xs font-black uppercase tracking-[0.1em] text-[var(--red)]">
              <ShieldCheck
                size={17}
              />

              Secure registration
            </div>

            {/* ============================================================
                EXISTING PARTICIPANT
            ============================================================= */}

            <div className="mt-8 max-w-md border-t border-[var(--red)]/25 pt-6">

              <p className="text-sm font-semibold text-[var(--brown)]/75">
                Already registered
                and paid?
              </p>

              <Link
                to="/retrieve-pass"
                className="mt-3 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-[var(--red)] transition-opacity hover:opacity-70"
              >
                <TicketCheck
                  size={17}
                />

                Retrieve My Pass

                <ArrowRight
                  size={15}
                />
              </Link>

            </div>
          </div>

          {/* ================================================================
              REGISTRATION CARD
          ================================================================= */}

          <div className="rounded-[30px] border-2 border-[var(--red)] bg-[var(--cream)] p-6 shadow-[10px_10px_0_var(--red)] sm:p-9">

            {/* HEADER */}

            <div className="mb-8 flex items-end justify-between gap-4 border-b border-[var(--border)] pb-6">

              <div>
                <span className="small-label">
                  Convention Pass
                </span>

                <h3 className="mt-2 text-2xl font-black uppercase text-[var(--red)]">
                  Your Details
                </h3>
              </div>

              <div className="text-right">
                <span className="block text-[10px] font-black uppercase tracking-[0.1em] text-[var(--muted)]">
                  Fee
                </span>

                <strong className="text-3xl font-black text-[var(--red)]">
                  ₹300
                </strong>
              </div>

            </div>

            {/* ============================================================
                FORM
            ============================================================= */}

            <form
              onSubmit={
                handleSubmit
              }
            >
              <div className="grid gap-5 sm:grid-cols-2">

                {/* FULL NAME */}

                <div className="sm:col-span-2">

                  <label
                    htmlFor="fullName"
                    className="form-label"
                  >
                    Full Name *
                  </label>

                  <input
                    id="fullName"
                    type="text"
                    name="fullName"
                    value={
                      form.fullName
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      loading
                    }
                    className="form-control disabled:cursor-not-allowed disabled:opacity-60"
                    placeholder="Enter your full name"
                    autoComplete="name"
                    maxLength={
                      100
                    }
                  />

                </div>

                {/* EMAIL */}

                <div>
                  <label
                    htmlFor="email"
                    className="form-label"
                  >
                    Email Address *
                  </label>

                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={
                      form.email
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      loading
                    }
                    className="form-control disabled:cursor-not-allowed disabled:opacity-60"
                    placeholder="you@example.com"
                    autoComplete="email"
                    maxLength={
                      150
                    }
                  />
                </div>

                {/* PHONE */}

                <div>
                  <label
                    htmlFor="phone"
                    className="form-label"
                  >
                    Phone Number *
                  </label>

                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    value={
                      form.phone
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      loading
                    }
                    className="form-control disabled:cursor-not-allowed disabled:opacity-60"
                    placeholder="10-digit number"
                    inputMode="numeric"
                    autoComplete="tel"
                    maxLength={
                      10
                    }
                  />
                </div>

                {/* ========================================================
                    PARISH — SEARCHABLE DROPDOWN
                ========================================================= */}

                <div
                  ref={parishRef}
                  className="relative"
                >
                  <label
                    htmlFor="parish"
                    className="form-label"
                  >
                    Parish *
                  </label>

                  {/* SELECT BUTTON */}

                  <button
                    id="parish"
                    type="button"
                    disabled={loading}
                    onClick={() => {
                      if (!loading) {
                        setParishOpen(
                          (current) =>
                            !current
                        );

                        setParishSearch(
                          ""
                        );
                      }
                    }}
                    className="
                      form-control
                      flex
                      w-full
                      items-center
                      justify-between
                      gap-3
                      text-left
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
                    aria-haspopup="listbox"
                    aria-expanded={
                      parishOpen
                    }
                  >
                    <span
                      className={
                        form.parish
                          ? "truncate text-[var(--brown)]"
                          : "truncate text-[var(--muted)]"
                      }
                    >
                      {form.parish ||
                        "Select your parish"}
                    </span>

                    <ChevronDown
                      size={17}
                      className={`
                        shrink-0
                        text-[var(--red)]
                        transition-transform
                        duration-200
                        ${
                          parishOpen
                            ? "rotate-180"
                            : ""
                        }
                      `}
                    />
                  </button>

                  {/* DROPDOWN */}

                  {parishOpen &&
                    !loading && (
                      <div
                        className="
                          absolute
                          left-0
                          right-0
                          top-full
                          z-50
                          mt-2
                          overflow-hidden
                          rounded-2xl
                          border
                          border-[var(--red)]/20
                          bg-[var(--cream-light)]
                          shadow-xl
                        "
                      >
                        {/* SEARCH */}

                        <div className="border-b border-[var(--border)] p-3">

                          <div className="relative">

                            <Search
                              size={
                                16
                              }
                              className="
                                pointer-events-none
                                absolute
                                left-3
                                top-1/2
                                -translate-y-1/2
                                text-[var(--red)]
                              "
                            />

                            <input
                              type="text"
                              value={
                                parishSearch
                              }
                              onChange={(
                                event
                              ) =>
                                setParishSearch(
                                  event
                                    .target
                                    .value
                                )
                              }
                              placeholder="Search parish..."
                              autoFocus
                              className="
                                w-full
                                rounded-xl
                                border
                                border-[var(--border)]
                                bg-[var(--cream)]
                                py-3
                                pl-10
                                pr-3
                                text-sm
                                font-semibold
                                text-[var(--brown)]
                                outline-none
                                transition
                                placeholder:text-[var(--muted)]/70
                                focus:border-[var(--red)]
                              "
                            />

                          </div>

                        </div>

                        {/* PARISH LIST */}

                        <div
                          className="
                            max-h-60
                            overflow-y-auto
                            p-2
                          "
                          role="listbox"
                        >
                          {filteredParishes.length >
                          0 ? (
                            filteredParishes.map(
                              (
                                parish
                              ) => {
                                const selected =
                                  form.parish ===
                                  parish;

                                return (
                                  <button
                                    key={
                                      parish
                                    }
                                    type="button"
                                    role="option"
                                    aria-selected={
                                      selected
                                    }
                                    onClick={() =>
                                      handleParishSelect(
                                        parish
                                      )
                                    }
                                    className={`
                                      flex
                                      w-full
                                      items-center
                                      justify-between
                                      gap-3
                                      rounded-xl
                                      px-3
                                      py-2.5
                                      text-left
                                      text-sm
                                      font-bold
                                      transition
                                      ${
                                        selected
                                          ? "bg-[var(--red)] text-[var(--cream)]"
                                          : "text-[var(--brown)] hover:bg-[var(--gold)]/20 hover:text-[var(--red)]"
                                      }
                                    `}
                                  >
                                    <span>
                                      {
                                        parish
                                      }
                                    </span>

                                    {selected && (
                                      <Check
                                        size={
                                          15
                                        }
                                        className="shrink-0"
                                      />
                                    )}

                                  </button>
                                );
                              }
                            )
                          ) : (
                            <div className="px-4 py-8 text-center">

                              <Search
                                size={
                                  20
                                }
                                className="mx-auto text-[var(--muted)]"
                              />

                              <p className="mt-2 text-xs font-bold text-[var(--muted)]">
                                No
                                parish
                                found.
                              </p>

                            </div>
                          )}
                        </div>

                      </div>
                    )}
                </div>

                {/* JERSEY SIZE */}

                <div>
                  <label
                    htmlFor="jerseySize"
                    className="form-label"
                  >
                    Jersey Size *
                  </label>

                  <select
                    id="jerseySize"
                    name="jerseySize"
                    value={
                      form.jerseySize
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      loading
                    }
                    className="form-control disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="">
                      Select size
                    </option>

                    <option value="XS">
                      XS
                    </option>

                    <option value="S">
                      S
                    </option>

                    <option value="M">
                      M
                    </option>

                    <option value="L">
                      L
                    </option>

                    <option value="XL">
                      XL
                    </option>

                    <option value="XXL">
                      XXL
                    </option>

                    <option value="XXXL">
                      XXXL
                    </option>

                  </select>
                </div>

              </div>

              {/* ==========================================================
                  PAYMENT BUTTON
              =========================================================== */}

              <button
                type="submit"
                disabled={
                  loading
                }
                className="primary-button mt-7 w-full disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <LoaderCircle
                      size={18}
                      className="animate-spin"
                    />

                    Processing...
                  </>
                ) : (
                  <>
                    Continue to
                    Payment

                    <ArrowRight
                      size={18}
                    />
                  </>
                )}
              </button>

              {/* ==========================================================
                  SECURITY MESSAGE
              =========================================================== */}

              <div className="mt-4 flex items-start justify-center gap-2 text-center text-[11px] leading-5 text-[var(--muted)]">

                <ShieldCheck
                  size={14}
                  className="mt-[2px] shrink-0"
                />

                <p>
                  Your registration
                  will only be confirmed
                  after successful
                  payment verification.
                </p>

              </div>

              {/* ==========================================================
                  RETRIEVE PASS — MOBILE / CARD CTA
              =========================================================== */}

              <div className="mt-6 border-t border-[var(--border)] pt-5 text-center">

                <p className="text-xs text-[var(--muted)]">
                  Already registered
                  and completed your
                  payment?
                </p>

                <Link
                  to="/retrieve-pass"
                  className="mt-2 inline-flex items-center justify-center gap-2 text-xs font-black uppercase tracking-[0.1em] text-[var(--red)] transition-opacity hover:opacity-70"
                >
                  <TicketCheck
                    size={16}
                  />

                  Retrieve My Pass

                  <ArrowRight
                    size={14}
                  />
                </Link>

              </div>

            </form>
          </div>

        </div>
      </div>
    </section>
  );
}

export default Registration;