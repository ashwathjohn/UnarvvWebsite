const dayOne = [
  {
    time: "Morning",
    title: "Opening & Welcome",
    description: "The beginning of the UNARVV '26 experience.",
  },
  {
    time: "Forenoon",
    title: "Convention Sessions",
    description: "Interactive sessions led by the convention resource team.",
  },
  {
    time: "Afternoon",
    title: "Activities & Experiences",
    description: "Community, participation, games and youth experiences.",
  },
  {
    time: "Evening",
    title: "Faith & Celebration",
    description: "A meaningful close to the first day.",
  },
];

const dayTwo = [
  {
    time: "Morning",
    title: "Day Two Begins",
    description: "A fresh start to the second day of UNARVV.",
  },
  {
    time: "Forenoon",
    title: "Convention Sessions",
    description: "More conversations and experiences with the resource team.",
  },
  {
    time: "Afternoon",
    title: "Community & Mission",
    description: "Activities focused on connection, purpose and participation.",
  },
  {
    time: "Evening",
    title: "Finale",
    description: "Closing moments of UNARVV '26.",
  },
];

function ScheduleColumn({ day, date, items }) {
  return (
    <div>
      <div className="mb-7 flex items-end justify-between border-b-2 border-[var(--red)] pb-4">
        <div>
          <span className="small-label">{date}</span>

          <h3 className="mt-2 text-3xl font-black uppercase text-[var(--red)]">
            {day}
          </h3>
        </div>
      </div>

      <div>
        {items.map((item, index) => (
          <div
            key={`${item.time}-${index}`}
            className="grid grid-cols-[95px_1fr] gap-4 border-b border-[var(--border)] py-6 sm:grid-cols-[120px_1fr]"
          >
            <span className="text-xs font-black uppercase tracking-[0.08em] text-[var(--gold-dark)]">
              {item.time}
            </span>

            <div>
              <h4 className="font-black uppercase text-[var(--brown)]">
                {item.title}
              </h4>

              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Schedule() {
  return (
    <section id="schedule" className="section-space">
      <div className="container-custom">
        <span className="small-label">03 / Two Days</span>

        <h2 className="mt-5 text-5xl font-black uppercase leading-[0.9] tracking-[-0.055em] text-[var(--red)] sm:text-6xl lg:text-7xl">
          The
          <br />
          Schedule.
        </h2>

        <p className="mt-6 max-w-xl leading-7 text-[var(--muted)]">
          Two days created around faith, connection, participation and
          celebration. The detailed programme will be announced soon.
        </p>

        <div className="mt-14 grid gap-14 lg:grid-cols-2">
          <ScheduleColumn
            day="Day One"
            date="17 October 2026"
            items={dayOne}
          />

          <ScheduleColumn
            day="Day Two"
            date="18 October 2026"
            items={dayTwo}
          />
        </div>
      </div>
    </section>
  );
}

export default Schedule;