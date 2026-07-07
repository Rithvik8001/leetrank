import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { faq } from "@/lib/marketing/content";

export function Faq() {
  return (
    <section id="faq" className="border-b border-border px-6 py-20">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 text-center">
          <Badge variant="secondary" className="mb-4 font-mono">
            {faq.eyebrow}
          </Badge>
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
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
      </div>
    </section>
  );
}
