import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Camera,
  CheckCircle2,
  CircleAlert,
  LoaderCircle,
  RotateCcw,
  ScanLine,
  X,
} from "lucide-react";

import {
  Html5Qrcode,
} from "html5-qrcode";

import api from "../../services/api";

/*
|--------------------------------------------------------------------------
| FORMAT CHECK-IN TIME
|--------------------------------------------------------------------------
*/

const formatDateTime = (
  value
) => {
  if (!value) return "—";

  const date = new Date(value);

  if (
    Number.isNaN(date.getTime())
  ) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
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
| QR SCANNER
|--------------------------------------------------------------------------
*/

function QrScannerModal({
  open,
  onClose,
  onCheckInSuccess,
}) {
  const scannerRef =
    useRef(null);

  const processingRef =
    useRef(false);

  const [starting, setStarting] =
    useState(false);

  const [scanning, setScanning] =
    useState(false);

  const [result, setResult] =
    useState(null);

  const [error, setError] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | STOP CAMERA
  |--------------------------------------------------------------------------
  */

  const stopScanner =
    useCallback(async () => {
      const scanner =
        scannerRef.current;

      if (!scanner) {
        setScanning(false);
        return;
      }

      try {
        if (
          scanner.isScanning
        ) {
          await scanner.stop();
        }
      } catch {
        // Scanner may already be stopped.
      }

      try {
        await scanner.clear();
      } catch {
        // Ignore clear errors.
      }

      scannerRef.current =
        null;

      setScanning(false);
    }, []);

  /*
  |--------------------------------------------------------------------------
  | PROCESS QR
  |--------------------------------------------------------------------------
  */

  const processQr =
    useCallback(
      async (qrData) => {
        if (
          processingRef.current
        ) {
          return;
        }

        processingRef.current =
          true;

        /*
         * Stop scanning immediately so the
         * same QR isn't repeatedly submitted.
         */
        await stopScanner();

        try {
          const response =
            await api.post(
              "/admin/check-in/qr",
              {
                qrData,
              }
            );

          setResult({
            type: "success",
            participant:
              response.data
                .participant,
            message:
              response.data
                .message,
          });

          if (
            onCheckInSuccess
          ) {
            onCheckInSuccess(
              response.data
                .participant
            );
          }
        } catch (requestError) {
          const data =
            requestError.response
              ?.data;

          if (
            data?.code ===
            "ALREADY_CHECKED_IN"
          ) {
            setResult({
              type: "already",
              participant:
                data.participant,
              message:
                data.message,
            });

            return;
          }

          setResult({
            type: "error",
            participant: null,
            message:
              data?.message ||
              "Unable to verify this QR code.",
          });
        } finally {
          processingRef.current =
            false;
        }
      },
      [
        onCheckInSuccess,
        stopScanner,
      ]
    );

  /*
  |--------------------------------------------------------------------------
  | START CAMERA
  |--------------------------------------------------------------------------
  */

  const startScanner =
    useCallback(async () => {
      await stopScanner();

      setError("");
      setResult(null);
      setStarting(true);

      try {
        const scanner =
          new Html5Qrcode(
            "unarvv-qr-reader"
          );

        scannerRef.current =
          scanner;

        const cameras =
          await Html5Qrcode.getCameras();

        if (
          !cameras ||
          cameras.length === 0
        ) {
          throw new Error(
            "No camera was found on this device."
          );
        }

        /*
         * Prefer the back camera on phones.
         */
        const preferredCamera =
          cameras.find(
            (camera) =>
              /back|rear|environment/i.test(
                camera.label
              )
          ) ||
          cameras[
            cameras.length - 1
          ];

        await scanner.start(
          preferredCamera.id,
          {
            fps: 10,

            qrbox: {
              width: 240,
              height: 240,
            },

            aspectRatio: 1,
          },

          (decodedText) => {
            processQr(
              decodedText
            );
          },

          () => {
            /*
             * QR parse failures while the
             * camera is moving are normal.
             * Don't show them to the admin.
             */
          }
        );

        setScanning(true);
      } catch (scannerError) {
        scannerRef.current =
          null;

        setScanning(false);

        setError(
          scannerError?.message ||
            "Unable to access the camera. Please allow camera permission and try again."
        );
      } finally {
        setStarting(false);
      }
    }, [
      processQr,
      stopScanner,
    ]);

  /*
  |--------------------------------------------------------------------------
  | OPEN/CLOSE
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    /*
     * Allow the modal DOM to mount before
     * html5-qrcode looks for the reader.
     */
    const timer =
      window.setTimeout(
        () => {
          startScanner();
        },
        100
      );

    return () => {
      window.clearTimeout(
        timer
      );

      stopScanner();
    };
  }, [
    open,
    startScanner,
    stopScanner,
  ]);

  /*
  |--------------------------------------------------------------------------
  | CLOSE
  |--------------------------------------------------------------------------
  */

  const handleClose =
    async () => {
      await stopScanner();

      setResult(null);
      setError("");

      onClose();
    };

  /*
  |--------------------------------------------------------------------------
  | SCAN ANOTHER
  |--------------------------------------------------------------------------
  */

  const handleScanAnother =
    async () => {
      processingRef.current =
        false;

      setResult(null);
      setError("");

      await startScanner();
    };

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-3 sm:p-5">

      <div className="max-h-[95vh] w-full max-w-xl overflow-y-auto rounded-[28px] bg-[var(--cream-light)] shadow-2xl">

        {/* HEADER */}

        <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] p-5">

          <div>
            <span className="text-[9px] font-black uppercase tracking-[0.16em] text-[var(--gold)]">
              Event Check-In
            </span>

            <h2 className="mt-1 text-2xl font-black uppercase text-[var(--red)]">
              Scan Participant QR
            </h2>

            <p className="mt-2 text-xs text-[var(--muted)]">
              Scan the QR code shown
              on the participant's
              UNARVV '26 pass.
            </p>
          </div>

          <button
            type="button"
            onClick={
              handleClose
            }
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--border)] text-[var(--red)]"
            aria-label="Close scanner"
          >
            <X size={18} />
          </button>

        </div>

        <div className="p-5">

          {/* ==========================================================
              SCANNER
          ========================================================== */}

          {!result && (
            <>
              <div className="overflow-hidden rounded-[22px] bg-black">

                <div
                  id="unarvv-qr-reader"
                  className="min-h-[300px] w-full"
                />

              </div>

              {starting && (
                <div className="mt-4 flex items-center justify-center gap-2 text-xs font-bold text-[var(--muted)]">
                  <LoaderCircle
                    size={16}
                    className="animate-spin"
                  />

                  Starting camera...
                </div>
              )}

              {scanning &&
                !starting && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-[0.08em] text-[var(--red)]">

                    <ScanLine
                      size={16}
                    />

                    Ready to scan

                  </div>
                )}

              {error && (
                <div className="mt-4 rounded-2xl bg-red-50 p-4 text-red-800">

                  <div className="flex gap-3">

                    <CircleAlert
                      size={19}
                      className="shrink-0"
                    />

                    <div>
                      <p className="text-xs font-black uppercase">
                        Camera Error
                      </p>

                      <p className="mt-1 text-xs leading-5">
                        {error}
                      </p>
                    </div>

                  </div>

                  <button
                    type="button"
                    onClick={
                      startScanner
                    }
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-[var(--red)] px-4 py-2.5 text-[10px] font-black uppercase text-white"
                  >
                    <RotateCcw
                      size={14}
                    />

                    Try Again
                  </button>

                </div>
              )}
            </>
          )}

          {/* ==========================================================
              SUCCESS
          ========================================================== */}

          {result?.type ===
            "success" && (
            <div className="rounded-[24px] bg-green-50 p-6 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-600 text-white">
                <CheckCircle2
                  size={30}
                />
              </div>

              <p className="mt-5 text-[10px] font-black uppercase tracking-[0.15em] text-green-700">
                Check-In Successful
              </p>

              <h3 className="mt-2 text-2xl font-black text-green-900">
                {
                  result.participant
                    ?.fullName
                }
              </h3>

              <p className="mt-1 text-sm text-green-800">
                {
                  result.participant
                    ?.parish
                }
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3 text-left">

                <div className="rounded-xl bg-white p-3">
                  <p className="text-[8px] font-black uppercase text-gray-500">
                    Ticket
                  </p>

                  <p className="mt-1 text-xs font-black">
                    {
                      result.participant
                        ?.registrationId
                    }
                  </p>
                </div>

                <div className="rounded-xl bg-white p-3">
                  <p className="text-[8px] font-black uppercase text-gray-500">
                    Jersey
                  </p>

                  <p className="mt-1 text-xs font-black">
                    {
                      result.participant
                        ?.jerseySize
                    }
                  </p>
                </div>

              </div>

              <p className="mt-4 text-xs text-green-800">
                Checked in{" "}
                {formatDateTime(
                  result.participant
                    ?.checkedInAt
                )}
              </p>

              <button
                type="button"
                onClick={
                  handleScanAnother
                }
                className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-green-700 px-6 text-xs font-black uppercase text-white"
              >
                <Camera
                  size={16}
                />

                Scan Next
              </button>

            </div>
          )}

          {/* ==========================================================
              ALREADY CHECKED IN
          ========================================================== */}

          {result?.type ===
            "already" && (
            <div className="rounded-[24px] bg-[var(--gold)]/15 p-6 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--gold)] text-[var(--red)]">
                <CircleAlert
                  size={30}
                />
              </div>

              <p className="mt-5 text-[10px] font-black uppercase tracking-[0.15em] text-[var(--red)]">
                Already Checked In
              </p>

              <h3 className="mt-2 text-2xl font-black text-[var(--red)]">
                {
                  result.participant
                    ?.fullName
                }
              </h3>

              <p className="mt-1 text-sm text-[var(--muted)]">
                {
                  result.participant
                    ?.parish
                }
              </p>

              <p className="mt-4 text-xs font-bold text-[var(--brown)]">
                Previous check-in:{" "}
                {formatDateTime(
                  result.participant
                    ?.checkedInAt
                )}
              </p>

              <button
                type="button"
                onClick={
                  handleScanAnother
                }
                className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[var(--red)] px-6 text-xs font-black uppercase text-white"
              >
                <Camera
                  size={16}
                />

                Scan Next
              </button>

            </div>
          )}

          {/* ==========================================================
              INVALID QR
          ========================================================== */}

          {result?.type ===
            "error" && (
            <div className="rounded-[24px] bg-red-50 p-6 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-700 text-white">
                <CircleAlert
                  size={30}
                />
              </div>

              <p className="mt-5 text-[10px] font-black uppercase tracking-[0.15em] text-red-700">
                Invalid Pass
              </p>

              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-red-900">
                {result.message}
              </p>

              <button
                type="button"
                onClick={
                  handleScanAnother
                }
                className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-red-700 px-6 text-xs font-black uppercase text-white"
              >
                <RotateCcw
                  size={16}
                />

                Scan Again
              </button>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}

export default QrScannerModal;