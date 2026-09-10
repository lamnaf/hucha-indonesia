"use client";

import * as React from "react";
import {
  BoldIcon,
  Heading2Icon,
  Heading3Icon,
  ItalicIcon,
  LinkIcon,
  ListIcon,
  ListOrderedIcon,
  Redo2Icon,
  Undo2Icon,
} from "lucide-react";

import { cn } from "@/lib/utils";

export interface RichTextEditorProps {
  id: string;
  name: string;
  defaultValue?: string;
  className?: string;
  hint?: string;
}

/**
 * Lightweight rich-text editor for article bodies (blueprint §27). Uses a
 * contentEditable element + the native `document.execCommand` API (no
 * external deps). Editor HTML is mirrored into a hidden `name`d input; the
 * same HTML is sanitized by the server's allow-list before it is ever
 * rendered on the public site (§34).
 */
export function RichTextEditor({
  id,
  name,
  defaultValue = "",
  className,
  hint,
}: RichTextEditorProps) {
  const editorRef = React.useRef<HTMLDivElement>(null);
  const hiddenRef = React.useRef<HTMLInputElement>(null);
  const initialHtmlRef = React.useRef(toSafeInitialHtml(defaultValue));

  function sync() {
    if (hiddenRef.current && editorRef.current) {
      hiddenRef.current.value = editorRef.current.innerHTML;
    }
  }

  function exec(command: string, value?: string) {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    sync();
  }

  function addLink() {
    const href = window.prompt("Alamat tautan (URL):");
    if (href) {
      exec("createLink", href);
    }
  }

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="overflow-hidden rounded-md border bg-background focus-within:border-ring focus-within:ring-ring/30 focus-within:ring-2">
        <div className="flex flex-wrap items-center gap-1 border-b p-1">
          <ToolbarButton
            onClick={() => exec("bold")}
            title="Tebal"
            aria="Tebal"
          >
            <BoldIcon className="size-4" aria-hidden="true" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => exec("italic")}
            title="Miring"
            aria="Miring"
          >
            <ItalicIcon className="size-4" aria-hidden="true" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => exec("formatBlock", "<h2>")}
            title="Judul 2"
            aria="Judul 2"
          >
            <Heading2Icon className="size-4" aria-hidden="true" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => exec("formatBlock", "<h3>")}
            title="Judul 3"
            aria="Judul 3"
          >
            <Heading3Icon className="size-4" aria-hidden="true" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => exec("insertUnorderedList")}
            title="Daftar"
            aria="Daftar berpoin"
          >
            <ListIcon className="size-4" aria-hidden="true" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => exec("insertOrderedList")}
            title="Daftar nomor"
            aria="Daftar bernomor"
          >
            <ListOrderedIcon className="size-4" aria-hidden="true" />
          </ToolbarButton>
          <ToolbarButton
            onClick={addLink}
            title="Tautan"
            aria="Sisipkan tautan"
          >
            <LinkIcon className="size-4" aria-hidden="true" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => exec("undo")}
            title="Urungkan"
            aria="Urungkan"
          >
            <Undo2Icon className="size-4" aria-hidden="true" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => exec("redo")}
            title="Ulangi"
            aria="Ulangi"
          >
            <Redo2Icon className="size-4" aria-hidden="true" />
          </ToolbarButton>
        </div>
        <div
          ref={editorRef}
          id={id}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          aria-label="Isi artikel"
          className="min-h-56 w-full px-3 py-2 text-sm leading-relaxed outline-none [&_p]:my-2 [&_h2]:my-3 [&_h2]:text-xl [&_h2]:font-bold [&_h3]:my-3 [&_h3]:text-lg [&_h3]:font-semibold [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_blockquote]:border-l-2 [&_blockquote]:pl-4"
          onInput={sync}
          dangerouslySetInnerHTML={{ __html: initialHtmlRef.current }}
        />
      </div>
      <input
        ref={hiddenRef}
        type="hidden"
        name={name}
        defaultValue={initialHtmlRef.current}
      />
      {hint ? <p className="text-muted-foreground text-xs">{hint}</p> : null}
    </div>
  );
}

function ToolbarButton({
  children,
  onClick,
  title,
  aria,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  aria: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseDown={(event) => event.preventDefault()}
      title={title}
      aria-label={aria}
      className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-md p-1.5 transition-colors"
    >
      {children}
    </button>
  );
}

/**
 * Seeds the editor. Bodies saved by this editor are already HTML, so pass
 * them through untouched for a faithful round-trip. Legacy plain-text bodies
 * (pre rich-text editor) are HTML-escaped + newline→<br> so text renders
 * correctly. A body is treated as HTML when it contains any block/inline tag.
 */
function toSafeInitialHtml(value: string): string {
  const looksLikeHtml = /<(p|h[2-4]|b|i|strong|em|ul|ol|li|blockquote|a|img|br)\b/i.test(
    value
  );
  if (looksLikeHtml) {
    return value;
  }
  return escapeAndWrapPlainText(value);
}

function escapeAndWrapPlainText(value: string): string {
  const escape = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return escape(value).replace(/\n/g, "<br>");
}
