import {
  Gamepad2,
  Heart,
  MessageCircle,
  Music2,
  Sparkles,
  Users,
} from "lucide-react";

const experiences = [
  {
    icon: Heart,
    title: "Faith",
    text: "Moments designed to reconnect, reflect and grow deeper in faith.",
  },
  {
    icon: Users,
    title: "Community",
    text: "Meet young people from different parishes and build new friendships.",
  },
  {
    icon: MessageCircle,
    title: "Real Talk",
    text: "Conversations around the questions and realities young people face.",
  },
  {
    icon: Gamepad2,
    title: "Games",
    text: "Interactive challenges, team activities and plenty of energy.",
  },
  {
    icon: Music2,
    title: "Celebration",
    text: "Music, performances and moments worth remembering together.",
  },
  {
    icon: Sparkles,
    title: "Experience",
    text: "Two days built to leave you with more than just memories.",
  },
];

function Experience() {
  return (
    <section
      id="experience"
      className="section-space bg-[var(--red)] text-white"
    >
      <div className="container-custom">
        <div className="grid gap-8 md:grid-cols-2 md:items-end">
          <div>
            <span className="text-xs font-black uppercase tracking-[0.18em] text-[var(--gold)]">
              02 / The Experience
            </span>

            <h2 className="mt-5 text-5xl font-black uppercase leading-[0.9] tracking-[-0.06em] sm:text-6xl lg:text-7xl">
              More than
              <br />
              a convention.
            </h2>
          </div>

          <p className="max-w-md leading-7 text-white/70 md:justify-self-end">
            UNARVV is designed around connection, participation and experiences
            that stay with you even after the convention ends.
          </p>
        </div>

        <div className="mt-14 grid gap-px overflow-hidden rounded-[28px] bg-white/15 md:grid-cols-2 lg:grid-cols-3">
          {experiences.map(({ icon: Icon, title, text }) => (
            <article
              key={title}
              className="min-h-[250px] bg-[var(--red)] p-8 transition duration-300 hover:bg-[var(--red-dark)] sm:p-9"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--gold)] text-[var(--gold)]">
                <Icon size={21} />
              </div>

              <h3 className="mt-9 text-2xl font-black uppercase tracking-[-0.03em]">
                {title}
              </h3>

              <p className="mt-3 max-w-xs text-sm leading-6 text-white/65">
                {text}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Experience;