import {
  Sparkles,
  Zap,
} from "lucide-react";

function AnnouncementBar() {
  return (
    <div className="bg-[var(--red)] text-white">
      <div
        className="
          container-custom
          flex
          min-h-[46px]
          items-center
          justify-center
          py-2
          sm:min-h-[44px]
          lg:min-h-[48px]
        "
      >
        <div
          className="
            flex
            w-full
            flex-wrap
            items-center
            justify-center
            gap-x-3
            gap-y-1.5
            text-center
          "
        >
          {/* Registration Live Badge */}
          <div
            className="
              shrink-0
              rounded-full
              bg-[var(--gold-light)]
              px-3
              py-1
              text-[9px]
              font-black
              uppercase
              tracking-[0.08em]
              text-[var(--red-dark)]
              shadow-sm
              sm:px-4
              sm:text-[10px]
              lg:text-[11px]
            "
          >
            Registration Live
          </div>

          {/* Main Announcement */}
          <div
            className="
              flex
              items-center
              justify-center
              gap-2
              text-[10px]
              font-bold
              leading-tight
              sm:text-[11px]
              lg:text-xs
            "
          >
            <Zap
              size={14}
              className="
                shrink-0
                fill-[var(--gold-light)]
                text-[var(--gold-light)]
              "
            />

            <span>
              <span className="hidden sm:inline">
               Registrations Open!
              </span>

              <span className="sm:hidden">
                Registrations Open!
              </span>
            </span>
          </div>

          {/* Divider - Desktop */}
          <span
            className="
              hidden
              h-4
              w-px
              bg-white/30
              lg:block
            "
          />

          {/* Existing UNARVV Content */}
          <div
            className="
              flex
              basis-full
              items-center
              justify-center
              gap-1.5
              text-[9px]
              font-bold
              uppercase
              tracking-[0.08em]
              text-white/85
              sm:text-[10px]
              lg:basis-auto
              lg:text-[11px]
              lg:tracking-[0.1em]
            "
          >
            <Sparkles
              size={11}
              className="
                hidden
                shrink-0
                sm:block
              "
            />

            <span>
              UNARVV '26
              <span className="mx-1.5 text-[var(--gold-light)]">
                •
              </span>
              17–18 OCTOBER
              <span className="mx-1.5 text-[var(--gold-light)]">
                •
              </span>
              <span className="hidden xs:inline">
                ST. FRANCIS SCHOOL,{" "}
              </span>
              KOKKADA
            </span>

            <Sparkles
              size={11}
              className="
                hidden
                shrink-0
                sm:block
              "
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnnouncementBar;