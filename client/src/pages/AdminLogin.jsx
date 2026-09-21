import { useEffect, useState } from "react";
import {
  useNavigate,
  Link,
} from "react-router-dom";

import {
  ArrowRight,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

import { toast } from "react-toastify";

import api from "../services/api";
import logo from "../assets/unarvv-logo.png";

function AdminLogin() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] =
    useState(false);

  const [
    checkingSession,
    setCheckingSession,
  ] = useState(true);

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | CHECK EXISTING SESSION
  |--------------------------------------------------------------------------
  |
  | If admin is already logged in,
  | don't show login again.
  |
  */

  useEffect(() => {
    let mounted = true;

    const checkSession =
      async () => {
        try {
          await api.get(
            "/admin/me"
          );

          if (mounted) {
            navigate(
              "/admin/dashboard",
              {
                replace: true,
              }
            );
          }
        } catch {
          /*
           * 401 is expected when
           * not logged in.
           */
        } finally {
          if (mounted) {
            setCheckingSession(
              false
            );
          }
        }
      };

    checkSession();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  /*
  |--------------------------------------------------------------------------
  | FORM CHANGE
  |--------------------------------------------------------------------------
  */

  const handleChange = (
    event
  ) => {
    const { name, value } =
      event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /*
  |--------------------------------------------------------------------------
  | LOGIN
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (loading) return;

    const email =
      form.email
        .trim()
        .toLowerCase();

    const password =
      form.password;

    if (!email) {
      toast.error(
        "Please enter your email."
      );
      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email
      )
    ) {
      toast.error(
        "Please enter a valid email address."
      );
      return;
    }

    if (!password) {
      toast.error(
        "Please enter your password."
      );
      return;
    }

    try {
      setLoading(true);

      const response =
        await api.post(
          "/admin/login",
          {
            email,
            password,
          }
        );

      if (
        !response.data?.success
      ) {
        throw new Error(
          "Login failed."
        );
      }

      toast.success(
        "Welcome to UNARVV '26 Admin."
      );

      navigate(
        "/admin/dashboard",
        {
          replace: true,
        }
      );
    } catch (error) {
      const message =
        error.response?.data
          ?.message;

      if (
        error.response?.status ===
        429
      ) {
        toast.error(
          message ||
            "Too many login attempts. Please try again later."
        );
        return;
      }

      if (
        error.response?.status ===
        401
      ) {
        toast.error(
          "Invalid email or password."
        );
        return;
      }

      toast.error(
        message ||
          "Unable to login. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | INITIAL SESSION CHECK
  |--------------------------------------------------------------------------
  */

  if (checkingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--cream)]">
        <div className="flex items-center gap-3 text-[var(--red)]">
          <LoaderCircle
            size={22}
            className="animate-spin"
          />

          <span className="text-xs font-black uppercase tracking-[0.12em]">
            Checking session...
          </span>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--cream)] px-4 py-12">

      <div className="w-full max-w-md">

        {/* ==============================================================
            BRAND
        =============================================================== */}

        <div className="mb-8 text-center">

          <Link
            to="/"
            className="inline-flex flex-col items-center"
          >
            <img
              src={logo}
              alt="UNARVV '26"
              className="h-20 w-20 object-contain"
            />

            <span className="mt-3 text-2xl font-black uppercase tracking-[-0.04em] text-[var(--red)]">
              UNARVV '26
            </span>
          </Link>

          <span className="mt-2 block text-[10px] font-black uppercase tracking-[0.2em] text-[var(--gold)]">
            Administration
          </span>

        </div>

        {/* ==============================================================
            LOGIN CARD
        =============================================================== */}

        <div className="rounded-[30px] border-2 border-[var(--red)] bg-[var(--cream-light)] p-6 shadow-[9px_9px_0_var(--red)] sm:p-8">

          {/* Header */}

          <div className="mb-7 flex items-center gap-4 border-b border-[var(--border)] pb-6">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--red)] text-[var(--cream)]">
              <LockKeyhole
                size={21}
              />
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.14em] text-[var(--gold)]">
                Authorized Access
              </span>

              <h1 className="mt-1 text-2xl font-black uppercase text-[var(--red)]">
                Admin Login
              </h1>
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

            {/* EMAIL */}

            <div>
              <label
                htmlFor="adminEmail"
                className="form-label"
              >
                Email Address *
              </label>

              <input
                id="adminEmail"
                name="email"
                type="email"
                value={
                  form.email
                }
                onChange={
                  handleChange
                }
                disabled={
                  loading
                }
                autoComplete="email"
                placeholder="admin@example.com"
                className="form-control disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            {/* PASSWORD */}

            <div className="mt-5">

              <label
                htmlFor="adminPassword"
                className="form-label"
              >
                Password *
              </label>

              <div className="relative">

                <input
                  id="adminPassword"
                  name="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={
                    form.password
                  }
                  onChange={
                    handleChange
                  }
                  disabled={
                    loading
                  }
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="form-control pr-12 disabled:cursor-not-allowed disabled:opacity-60"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (previous) =>
                        !previous
                    )
                  }
                  disabled={
                    loading
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted)] transition-colors hover:text-[var(--red)]"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff
                      size={18}
                    />
                  ) : (
                    <Eye
                      size={18}
                    />
                  )}
                </button>

              </div>
            </div>

            {/* LOGIN */}

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

                  Signing In...
                </>
              ) : (
                <>
                  Sign In

                  <ArrowRight
                    size={18}
                  />
                </>
              )}
            </button>

          </form>

          {/* SECURITY */}

          <div className="mt-6 flex items-start gap-2 rounded-2xl bg-[var(--gold)]/15 p-4">

            <ShieldCheck
              size={16}
              className="mt-0.5 shrink-0 text-[var(--red)]"
            />

            <p className="text-[11px] leading-5 text-[var(--muted)]">
              Restricted to authorized
              UNARVV '26 administrators.
            </p>

          </div>

        </div>

        {/* RETURN */}

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
  );
}

export default AdminLogin;