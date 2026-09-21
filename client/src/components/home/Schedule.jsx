const dayOne = [
  {
    time: "Morning",
    title: "Registration",
    description:
      "Participant registration and arrival for UNARVV '26.",
  },
  {
    time: "Morning",
    title: "Flag Hoisting",
    description:
      "Official flag hoisting to mark the beginning of the convention.",
  },
  {
    time: "Morning",
    title: "Inauguration",
    description:
      "Official inauguration of UNARVV '26.",
  },
  {
    time: "Morning",
    title: "Chief Guest Talk",
    description:
      "Special address by the chief guest.",
  },
  {
    time: "Forenoon",
    title: "Ice Breaking & Action Song",
    description:
      "An energetic ice-breaking activity and action song.",
  },
  {
    time: "Forenoon",
    title: "Session",
    description:
      "Convention session led by the resource team.",
  },
  {
    time: "Afternoon",
    title: "Holy Mass",
    description:
      "Celebration of the Holy Mass.",
  },
  {
    time: "Afternoon",
    title: "Lunch",
    description:
      "Lunch break for all participants.",
  },
  {
    time: "Evening",
    title: "Dinner",
    description:
      "Dinner for all convention participants.",
  },
  {
    time: "Evening",
    title: "Cultural Program",
    description:
      "Cultural performances and celebrations.",
  },
  {
    time: "Evening",
    title: "Music Night",
    description:
      "Music night to conclude the first day of UNARVV '26.",
  },
];

const dayTwo = [
  {
    time: "Morning",
    title: "Holy Mass",
    description:
      "Begin the second day of UNARVV '26 with the celebration of Holy Mass.",
  },
  {
    time: "Morning",
    title: "Breakfast",
    description:
      "Breakfast for all convention participants.",
  },
  {
    time: "Morning",
    title: "Felicitation & Announcements",
    description:
      "Felicitation ceremony followed by convention announcements.",
  },
  {
    time: "Afternoon",
    title: "Lunch",
    description:
      "Lunch break for all participants.",
  },
  {
    time: "Afternoon",
    title: "Conclusion",
    description:
      "Closing moments and conclusion of UNARVV '26.",
  },
];

function ScheduleColumn({
  day,
  date,
  items,
}) {
  return (
    <div>
      <div className="mb-7 flex items-end justify-between border-b-2 border-[var(--red)] pb-4">
        <div>
          <span className="small-label">
            {date}
          </span>

          <h3 className="mt-2 text-3xl font-black uppercase text-[var(--red)]">
            {day}
          </h3>
        </div>
      </div>

      <div>
        {items.map(
          (item, index) => (
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
          )
        )}
      </div>
    </div>
  );
}

function Schedule() {
  return (
    <section
      id="schedule"
      className="section-space"
    >
      <div className="container-custom">
        <span className="small-label">
          03 / Two Days
        </span>

        <h2 className="mt-5 text-5xl font-black uppercase leading-[0.9] tracking-[-0.055em] text-[var(--red)] sm:text-6xl lg:text-7xl">
          The
          <br />
          Schedule.
        </h2>

        <p className="mt-6 max-w-xl leading-7 text-[var(--muted)]">
          Two days created around faith,
          connection, participation and
          celebration.
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