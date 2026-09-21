import { Sparkles } from "lucide-react";

function AnnouncementBar() {
  return (
    <div className="bg-[var(--red)] text-white">
      <div className="container-custom flex min-h-[38px] items-center justify-center gap-2 text-center text-[10px] font-bold uppercase tracking-[0.16em] sm:text-xs">
        <Sparkles size={13} />

        <span>
          UNARVV '26 • 17–18 OCTOBER • ST. FRANCIS SCHOOL, KOKKADA
        </span>

        <Sparkles size={13} />
      </div>
    </div>
  );
}

export default AnnouncementBar;