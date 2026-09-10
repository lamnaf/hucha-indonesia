"use client";

import { Accordion } from "radix-ui";

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export interface FaqEntry {
  question: string;
  answer: string;
}

export interface FaqAccordionProps {
  items: FaqEntry[];
  defaultOpenIndex?: number;
}

function FaqAccordion({ items, defaultOpenIndex = 0 }: FaqAccordionProps) {
  const defaultValue =
    defaultOpenIndex >= 0 && defaultOpenIndex < items.length
      ? `faq-${defaultOpenIndex}`
      : undefined;

  return (
    <Accordion.Root type="single" collapsible defaultValue={defaultValue}>
      {items.map((item, index) => (
        <AccordionItem key={item.question} value={`faq-${index}`}>
          <AccordionTrigger>{item.question}</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            {item.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion.Root>
  );
}

export { FaqAccordion };
