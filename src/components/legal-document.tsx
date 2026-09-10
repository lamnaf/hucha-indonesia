import type { LegalSection } from "@/lib/mock/legal";

import { Card, CardContent } from "@/components/ui/card";

export interface LegalDocumentProps {
  updatedAt: string;
  sections: LegalSection[];
}

function LegalDocument({ updatedAt, sections }: LegalDocumentProps) {
  return (
    <section className="border-t bg-muted/40 py-12 sm:py-16">
      <div className="container max-w-3xl space-y-8">
        <p className="text-muted-foreground text-sm">
          Terakhir diperbarui: {updatedAt}
        </p>
        <Card className="gap-0">
          <CardContent className="space-y-8 py-8">
            {sections.map((section) => (
              <div key={section.heading} className="space-y-3">
                <h2 className="text-xl font-bold tracking-tight">
                  {section.heading}
                </h2>
                <div className="space-y-2">
                  {section.paragraphs.map((paragraph) => (
                    <p
                      key={paragraph}
                      className="text-muted-foreground text-pretty text-sm leading-relaxed"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

export { LegalDocument };
