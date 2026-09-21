import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowRight,
  Search,
  ShieldCheck,
  Ticket,
} from "lucide-react";
import { toast } from "react-toastify";
import ParticipantNavbar from "../components/common/ParticipantNavbar";



import api from "../services/api";

function RetrievePass() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    // Phone should contain digits only
    if (name === "phone") {
      setForm((previous) => ({
        ...previous,
        phone: value.replace(/\D/g, "").slice(0, 10),
      }));

      return;
    }

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    const email = form.email.trim();
    const phone = form.phone.trim();

    // Frontend validation
    if (!email) {
      toast.error("Please enter your registered email.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      toast.error(
        "Please enter your registered 10-digit phone number."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await api.post(
        "/registrations/retrieve-pass",
        {
          email,
          phone,
        }
      );

      const ticketToken =
        response.data?.registration?.ticketToken;

      if (!response.data?.success || !ticketToken) {
        throw new Error("Pass token was not returned.");
      }

      toast.success("Registration found!");

      // Open existing pass page
      navigate(`/pass/${ticketToken}`);
    } catch (error) {
      console.error("Retrieve pass error:", error);

      const status = error.response?.status;
      const message = error.response?.data?.message;

      if (status === 429) {
        toast.error(
          message ||
            "Too many attempts. Please try again later."
        );
        return;
      }

      if (status === 404) {
        toast.error(
          "We could not find a confirmed registration matching those details."
        );
        return;
      }

      if (status === 400) {
        toast.error(
          message ||
            "Please check the information you entered."
        );
        return;
      }

      toast.error(
        "Unable to retrieve your pass. Please try again."
      );
    } finally {
      setLoading(false);
    }
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
            Enter the same email address and phone number
            you used when registering for UNARVV '26.
          </p>
        </div>

        {/* Recovery card */}
        <div className="rounded-[30px] border-2 border-[var(--red)] bg-[var(--cream-light)] p-6 shadow-[8px_8px_0_var(--red)] sm:p-8">

          <div className="mb-7 flex items-center gap-3 border-b border-[var(--border)] pb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--gold)] text-[var(--red)]">
              <Search size={18} />
            </div>

            <div>
              <span className="block text-[10px] font-black uppercase tracking-[0.14em] text-[var(--muted)]">
                Pass Recovery
              </span>

              <strong className="text-lg text-[var(--red)]">
                Find Registration
              </strong>
            </div>
          </div>

          <form onSubmit={handleSubmit}>

            {/* Email */}
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
                value={form.email}
                onChange={handleChange}
                disabled={loading}
                className="form-control disabled:cursor-not-allowed disabled:opacity-60"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            {/* Phone */}
            <div className="mt-5">
              <label
                htmlFor="recoveryPhone"
                className="form-label"
              >
                Registered Phone *
              </label>

              <input
                id="recoveryPhone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                disabled={loading}
                className="form-control disabled:cursor-not-allowed disabled:opacity-60"
                placeholder="10-digit phone number"
                inputMode="numeric"
                autoComplete="tel"
                maxLength={10}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="primary-button mt-7 w-full disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                "Finding Pass..."
              ) : (
                <>
                  Retrieve My Pass
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Security note */}
          <div className="mt-5 flex items-start gap-2 rounded-2xl bg-[var(--gold)]/20 p-4">
            <ShieldCheck
              size={16}
              className="mt-0.5 shrink-0 text-[var(--red)]"
            />

            <p className="text-[11px] leading-5 text-[var(--muted)]">
              Both details must match a successfully paid
              UNARVV '26 registration.
            </p>
          </div>
        </div>

        {/* Back */}
        <div className="mt-7 text-center">
          <Link
            to="/"
            className="text-xs font-black uppercase tracking-[0.12em] text-[var(--red)] hover:underline"
          >
            ← Return to UNARVV '26
          </Link>
        </div>
      </div>
    </main>
        
    </div>
  );
}

export default RetrievePass;