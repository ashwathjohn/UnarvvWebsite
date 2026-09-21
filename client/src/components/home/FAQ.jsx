import { useState } from "react";
import { Minus, Plus } from "lucide-react";

const faqs = [
  {
    question: "When is UNARVV '26?",
    answer:
      "UNARVV '26 will be held on 17 and 18 October 2026.",
  },
  {
    question: "Where is the convention happening?",
    answer:
      "The convention will be held at St. Francis School, Kokkada.",
  },
  {
    question: "What is the registration fee?",
    answer:
      "The convention registration fee is ₹300 per participant.",
  },
  {
    question: "What should I provide while registering?",
    answer:
      "You will need your full name, email address, phone number, parish and jersey size.",
  },
  {
    question: "How will I receive my pass?",
    answer:
      "After successful payment verification, your convention pass will be generated and you get your pass by entering email and phone no in My Pass section.",
  },

];

function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" className="section-space">
      <div className="container-custom">
        <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <span className="small-label">05 / Need to Know</span>

            <h2 className="mt-5 text-5xl font-black uppercase leading-[0.9] tracking-[-0.055em] text-[var(--red)] sm:text-6xl">
              Questions?
            </h2>

            <p className="mt-5 max-w-sm leading-7 text-[var(--muted)]">
              Here are a few things you may want to know before registering.
            </p>
          </div>

          <div className="border-t border-[var(--red)]">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;

              return (
                <article
                  key={faq.question}
                  className="border-b border-[var(--red)]"
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? -1 : index)}
                    className="flex w-full items-center justify-between gap-6 py-6 text-left"
                  >
                    <span className="font-black uppercase tracking-[-0.02em] text-[var(--brown)]">
                      {faq.question}
                    </span>

                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--red)] text-[var(--red)]">
                      {isOpen ? <Minus size={15} /> : <Plus size={15} />}
                    </span>
                  </button>

                  {isOpen && (
                    <p className="max-w-2xl pb-6 pr-10 text-sm leading-7 text-[var(--muted)]">
                      {faq.answer}
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default FAQ;