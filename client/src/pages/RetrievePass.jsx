import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Search,
  ShieldCheck,
  Ticket,
  Mail,
  KeyRound,
} from "lucide-react";
import { toast } from "react-toastify";
import ParticipantNavbar from "../components/common/ParticipantNavbar";

import api from "../services/api";


function RetrievePass() {
  const navigate = useNavigate();

  // email = first step
  // otp   = second step
  const [step, setStep] = useState("email");

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);


  // ============================================================
  // SEND OTP
  // ============================================================

  const handleSendOtp = async (event) => {
    event.preventDefault();

    if (loading) return;

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      toast.error("Please enter your registered email.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post(
        "/registrations/pass/request-otp",
        {
          email: cleanEmail,
        }
      );

      if (!response.data?.success) {
        throw new Error(
          "Unable to send verification code."
        );
      }

      toast.success(
        "Verification code sent to your email."
      );

      setStep("otp");

    } catch (error) {
      console.error(
        "Send OTP error:",
        error
      );

      const status =
        error.response?.status;

      const message =
        error.response?.data?.message;

      if (status === 429) {
        toast.error(
          message ||
            "Too many requests. Please try again later."
        );

        return;
      }

      toast.error(
        message ||
          "Unable to send verification code. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };


  // ============================================================
  // VERIFY OTP
  // ============================================================

  const handleVerifyOtp = async (event) => {
    event.preventDefault();

    if (loading) return;

    if (!/^\d{6}$/.test(otp)) {
      toast.error(
        "Please enter the 6-digit verification code."
      );

      return;
    }

    try {
      setLoading(true);

      const response = await api.post(
        "/registrations/pass/verify-otp",
        {
          email: email.trim().toLowerCase(),
          otp,
        }
      );

      const ticketToken =
        response.data?.registration?.ticketToken;

      if (
        !response.data?.success ||
        !ticketToken
      ) {
        throw new Error(
          "Pass token was not returned."
        );
      }

      toast.success(
        "Email verified successfully!"
      );

      navigate(`/pass/${ticketToken}`);

    } catch (error) {
      console.error(
        "Verify OTP error:",
        error
      );

      const status =
        error.response?.status;

      const message =
        error.response?.data?.message;

      if (status === 429) {
        toast.error(
          message ||
            "Too many verification attempts. Please try again later."
        );

        return;
      }

      if (status === 400) {
        toast.error(
          message ||
            "Invalid verification code."
        );

        return;
      }

      toast.error(
        message ||
          "Unable to verify the code. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };


  // ============================================================
  // CHANGE EMAIL
  // ============================================================

  const handleChangeEmail = () => {
    if (loading) return;

    setStep("email");
    setOtp("");
  };


  return (
    <div className="min-h-screen bg-[var(--cream)]">

      <ParticipantNavbar />

      <main className="flex min-h-screen items-center justify-center bg-[var(--cream)] px-4 py-12">

        <div className="w-full max-w-lg">

          {/* Heading */}

          <div className="mb-8 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--red)] text-[var(--cream)]">
              <Ticket size={26} />
            </div>

            <span className="mt-5 block text-[10px] font-black uppercase tracking-[0.18em] text-[var(--gold)]">
              UNARVV '26
            </span>

            <h1 className="mt-2 text-4xl font-black uppercase tracking-[-0.05em] text-[var(--red)] sm:text-5xl">
              Retrieve
              <br />
              Your Pass
            </h1>

            <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-[var(--muted)]">

              {step === "email"
                ? "Enter the email address you used when registering for UNARVV '26."
                : "Enter the 6-digit verification code sent to your registered email."}

            </p>

          </div>


          {/* Recovery card */}

          <div className="rounded-[30px] border-2 border-[var(--red)] bg-[var(--cream-light)] p-6 shadow-[8px_8px_0_var(--red)] sm:p-8">


            {/* Card heading */}

            <div className="mb-7 flex items-center gap-3 border-b border-[var(--border)] pb-5">

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--gold)] text-[var(--red)]">

                {step === "email" ? (
                  <Search size={18} />
                ) : (
                  <KeyRound size={18} />
                )}

              </div>

              <div>

                <span className="block text-[10px] font-black uppercase tracking-[0.14em] text-[var(--muted)]">
                  Pass Recovery
                </span>

                <strong className="text-lg text-[var(--red)]">

                  {step === "email"
                    ? "Find Registration"
                    : "Verify Your Email"}

                </strong>

              </div>

            </div>


            {/* ==================================================
                STEP 1 — EMAIL
            =================================================== */}

            {step === "email" && (

              <form onSubmit={handleSendOtp}>

                <div>

                  <label
                    htmlFor="recoveryEmail"
                    className="form-label"
                  >
                    Registered Email *
                  </label>

                  <input
                    id="recoveryEmail"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    disabled={loading}
                    className="form-control disabled:cursor-not-allowed disabled:opacity-60"
                    placeholder="Enter Your Email Address"
                    autoComplete="email"
                  />

                </div>


                <button
                  type="submit"
                  disabled={loading}
                  className="primary-button mt-7 w-full disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {loading ? (
                    "Sending Code..."
                  ) : (
                    <>
                      Send Verification Code
                      <ArrowRight size={18} />
                    </>
                  )}

                </button>

              </form>

            )}


            {/* ==================================================
                STEP 2 — OTP
            =================================================== */}

            {step === "otp" && (

              <form onSubmit={handleVerifyOtp}>

                {/* Email information */}

                <div className="mb-5 flex items-start gap-3 rounded-2xl bg-[var(--red)]/5 p-4">

                  <Mail
                    size={17}
                    className="mt-0.5 shrink-0 text-[var(--red)]"
                  />

                  <div>

                    <span className="block text-[10px] font-black uppercase tracking-[0.12em] text-[var(--muted)]">
                      Code sent to
                    </span>

                    <span className="mt-1 block break-all text-sm font-bold text-[var(--red)]">
                      {email.trim().toLowerCase()}
                    </span>

                  </div>

                </div>


                {/* OTP */}

                <div>

                  <label
                    htmlFor="recoveryOtp"
                    className="form-label"
                  >
                    Verification Code *
                  </label>

                  <input
                    id="recoveryOtp"
                    name="otp"
                    type="text"
                    value={otp}
                    onChange={(event) =>
                      setOtp(
                        event.target.value
                          .replace(/\D/g, "")
                          .slice(0, 6)
                      )
                    }
                    disabled={loading}
                    className="form-control text-center text-xl font-black tracking-[0.35em] disabled:cursor-not-allowed disabled:opacity-60"
                    placeholder="000000"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    autoFocus
                  />

                </div>


                {/* Verify */}

                <button
                  type="submit"
                  disabled={
                    loading ||
                    otp.length !== 6
                  }
                  className="primary-button mt-7 w-full disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {loading ? (
                    "Verifying..."
                  ) : (
                    <>
                      Verify & Get Pass
                      <ArrowRight size={18} />
                    </>
                  )}

                </button>


                {/* Change email */}

                <button
                  type="button"
                  onClick={handleChangeEmail}
                  disabled={loading}
                  className="mt-4 w-full text-center text-xs font-black uppercase tracking-[0.1em] text-[var(--red)] hover:underline disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Change Email
                </button>

              </form>

            )}


            {/* Security note */}

            <div className="mt-5 flex items-start gap-2 rounded-2xl bg-[var(--gold)]/20 p-4">

              <ShieldCheck
                size={16}
                className="mt-0.5 shrink-0 text-[var(--red)]"
              />

              <p className="text-[11px] leading-5 text-[var(--muted)]">

                {step === "email"
                  ? "A verification code will be sent only to the email associated with a successfully paid UNARVV '26 registration."
                  : "For your security, the verification code expires in 5 minutes and can only be used once."}

              </p>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}


export default RetrievePass;