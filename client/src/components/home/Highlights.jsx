import { CalendarDays, MapPin, Ticket, Users } from "lucide-react";

const highlights = [
  {
    icon: CalendarDays,
    value: "17–18",
    label: "October 2026",
  },
  {
    icon: MapPin,
    value: "Kokkada",
    label: "St. Francis School",
  },
  {
    icon: Ticket,
    value: "₹300",
    label: "Convention Pass",
  },
  {
    icon: Users,
    value: "Together",
    label: "One Youth Movement",
  },
];

function Highlights() {
  return (
    <section className="border-y border-[var(--border)] bg-[var(--cream-light)]">
      <div className="container-custom grid grid-cols-2 md:grid-cols-4">
        {highlights.map(({ icon: Icon, value, label }, index) => (
          <div
            key={label}
            className={`flex min-h-[180px] flex-col items-center justify-center px-4 text-center ${
              index !== highlights.length - 1
                ? "md:border-r md:border-[var(--border)]"
                : ""
            }`}
          >
            <Icon size={23} className="mb-4 text-[var(--red)]" />

            <strong className="text-xl font-black uppercase text-[var(--red)] sm:text-2xl">
              {value}
            </strong>

            <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--muted)] sm:text-xs">
              {label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Highlights;