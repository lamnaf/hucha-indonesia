"use client";

import * as React from "react";
import Link from "next/link";
import { MessageCircleIcon, XIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { socialLinkItems } from "@/components/social-links";

function FloatingSocial() {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (!open) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div
      data-slot="floating-social"
      className="fixed right-4 bottom-4 z-50 flex flex-col items-end gap-2"
    >
      {open ? (
        <div className="flex flex-col items-end gap-2">
          {socialLinkItems.map(({ label, href, icon: imgSrc }) => (
            <Link
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className={cn(
                "bg-background text-foreground hover:bg-accent flex items-center gap-2 rounded-full border py-2 pr-5 pl-3 text-sm font-medium shadow-md transition-colors",
                "animate-in fade-in-0 zoom-in-95 duration-200"
              )}
              onClick={() => setOpen(false)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imgSrc}
                alt={label}
                width={16}
                height={16}
                className="size-4 object-contain"
                aria-hidden="true"
              />
              {label}
            </Link>
          ))}
        </div>
      ) : null}
      <Button
        size="icon"
        className="size-12 rounded-full shadow-lg"
        aria-label={
          open ? "Tutup tautan media sosial" : "Buka tautan media sosial"
        }
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        {open ? <XIcon /> : <MessageCircleIcon />}
      </Button>
    </div>
  );
}

export { FloatingSocial };
