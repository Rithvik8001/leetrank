import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { SectionLabel } from "@/components/marketing/section-label";
import { FadeIn } from "@/components/marketing/motion/reveal";
import { faq } from "@/lib/marketing/content";

export function Faq() {
  return (
    <section id="faq" className="border-b border-border px-6 py-24">
      <FadeIn className="mx-auto grid max-w-4xl gap-10 md:grid-cols-[0.7fr_1fr]">
        <div>
          <SectionLabel className="mb-5">{faq.eyebrow}</SectionLabel>
          <h2 className="font-heading text-3xl font-bold tracking-[-0.02em] text-balance text-foreground sm:text-4xl">
            {faq.heading}
          </h2>
        </div>

        <Accordion>
          {faq.items.map((item) => (
            <AccordionItem key={item.question} value={item.question}>
              <AccordionTrigger>{item.question}</AccordionTrigger>
              <AccordionContent>
                <p>{item.answer}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </FadeIn>
    </section>
  );
}
