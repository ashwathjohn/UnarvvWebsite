import resourceTeamPoster from "../../assets/resource-team-poster.jpeg";


const pillars = [
  {
    number: "01",
    title: "Refine",
    text: "A space to pause, reflect and rediscover what truly matters.",
  },
  {
    number: "02",
    title: "Renew",
    text: "Renew your faith, friendships, purpose and relationship with God.",
  },
  {
    number: "03",
    title: "Reborn",
    text: "Return with a renewed heart, fresh purpose and courage to live your faith.",
  },
];


function Vision() {
  return (
    <section id="about" className="section-space">
      <div className="container-custom">

        {/* =====================================================
            ABOUT THE CONVENTION
        ====================================================== */}

        <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <span className="small-label">
              / About the Convention
            </span>

            <h2 className="mt-5 text-5xl font-black uppercase leading-[0.9] tracking-[-0.055em] text-[var(--red)] sm:text-6xl lg:text-7xl">
              This is
              <br />
              UNARVV.
            </h2>
          </div>

          <div className="max-w-xl lg:justify-self-end">
            <p className="text-lg font-semibold leading-8 text-[var(--brown)] sm:text-xl">
              An awakening. A gathering. A generation coming together in faith.
            </p>

            <p className="mt-5 leading-7 text-[var(--muted)]">
              UNARVV '26 brings young people together for two days of meaningful
              experiences, conversations, celebration, prayer and community.
            </p>
          </div>
        </div>


        {/* =====================================================
            REFINE / RENEW / REBORN
        ====================================================== */}

        <div className="mt-16 grid overflow-hidden rounded-[28px] border border-[var(--red)] md:grid-cols-3">
          {pillars.map((pillar, index) => (
            <article
              key={pillar.title}
              className={`min-h-[300px] p-8 sm:p-10 ${
                index !== pillars.length - 1
                  ? "border-b border-[var(--red)] md:border-b-0 md:border-r"
                  : ""
              }`}
            >
              <span className="text-xs font-black tracking-[0.15em] text-[var(--gold-dark)]">
                {pillar.number}
              </span>

              <h3 className="mt-12 text-4xl font-black uppercase tracking-[-0.05em] text-[var(--red)]">
                {pillar.title}
              </h3>

              <p className="mt-5 max-w-xs leading-7 text-[var(--muted)]">
                {pillar.text}
              </p>
            </article>
          ))}
        </div>


        {/* =====================================================
            EVENT RESOURCE TEAM
        ====================================================== */}

        <div className="mt-24">

          {/* Resource Team heading */}

          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <span className="small-label">
                / Meet the Team
              </span>

              <h2 className="mt-5 text-4xl font-black uppercase leading-[0.92] tracking-[-0.05em] text-[var(--red)] sm:text-5xl lg:text-6xl">
                Event
                <br />
                Resource Team.
              </h2>
            </div>

            <div className="max-w-xl lg:justify-self-end">
              <p className="text-lg font-semibold leading-8 text-[var(--brown)] sm:text-xl">
                The people bringing the UNARVV '26 experience to life.
              </p>

              <p className="mt-4 leading-7 text-[var(--muted)]">
                From meaningful sessions and inspiring insights to music,
                energy and unique talents — different people coming together
                to make these two days count.
              </p>
            </div>
          </div>


       {/* Resource Team poster */}

<div className="mt-10 flex justify-center">
  <div className="w-full max-w-[720px] overflow-hidden rounded-[28px] border border-[var(--red)] bg-[var(--cream-light)] shadow-[6px_6px_0_var(--red)]">
    <img
      src={resourceTeamPoster}
      alt="UNARVV '26 Event Resource Team"
      className="block h-auto w-full"
      loading="lazy"
    />
  </div>
</div>


          {/* Resource Team footer */}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-black uppercase tracking-[0.08em] text-[var(--red)]">
              One team. One purpose. One unforgettable UNARVV.
            </p>

            <span className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
              Refine • Renew • Reborn
            </span>
          </div>

        </div>

      </div>
    </section>
  );
}


export default Vision;