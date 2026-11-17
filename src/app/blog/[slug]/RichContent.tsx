import { Fragment, type ReactNode } from "react";
import { richChildren, richText, type RichContent, type RichNode } from "@/lib/solvix";

/**
 * Renders a post written in the Solvix rich-text editor (`contentJson`).
 *
 * The document is turned into React elements — never injected as HTML — so
 * every piece of text is escaped by React, and only the node / mark types
 * handled below can appear. Unknown blocks keep their text. Styling follows
 * the existing Numoro section renderer (slate text, blue accents).
 */

/** http(s), mailto, site paths ("/x", not "//host") and #anchors only. */
function safeHref(href: unknown): string | null {
  if (typeof href !== "string") return null;
  const value = href.trim();
  if (!value || /[\s\u0000-\u001f\u007f]/.test(value)) return null;
  return /^(https?:\/\/|mailto:|\/(?!\/)|#)/i.test(value) ? value : null;
}

/** Remote images, or the raster data URIs the Solvix media library may hold. */
function safeImageSrc(src: unknown): string | null {
  if (typeof src !== "string") return null;
  const value = src.trim();
  if (/^https?:\/\/[^\s"'<>]+$/i.test(value)) return value;
  if (/^data:image\/(png|jpe?g|gif|webp);base64,[a-z0-9+/=]+$/i.test(value)) return value;
  return null;
}

function renderInline(nodes: RichNode[], keyPrefix: string): ReactNode[] {
  return nodes.map((node, index) => {
    const key = `${keyPrefix}-${index}`;

    if (node.type === "hardBreak") return <br key={key} />;

    if (node.type !== "text") {
      return <Fragment key={key}>{renderInline(richChildren(node), key)}</Fragment>;
    }

    if (typeof node.text !== "string" || !node.text) return null;

    const marks = Array.isArray(node.marks) ? node.marks : [];
    const has = (type: string) => marks.some((mark) => mark?.type === type);

    let element: ReactNode = node.text;
    if (has("strike")) element = <s className="text-slate-500">{element}</s>;
    if (has("underline")) element = <u className="underline-offset-2">{element}</u>;
    if (has("italic")) element = <em>{element}</em>;
    if (has("bold")) element = <strong className="font-semibold text-slate-900">{element}</strong>;

    const href = safeHref(marks.find((mark) => mark?.type === "link")?.attrs?.href);
    if (href) {
      const external = /^https?:\/\//i.test(href);
      element = (
        <a
          href={href}
          className="font-medium text-blue-700 underline decoration-blue-300 underline-offset-2 transition hover:text-blue-600 hover:decoration-blue-600"
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {element}
        </a>
      );
    }

    return <Fragment key={key}>{element}</Fragment>;
  });
}

function renderListItems(list: RichNode, keyPrefix: string): ReactNode[] {
  return richChildren(list).map((item, index) => {
    const key = `${keyPrefix}-${index}`;
    const children = richChildren(item);

    if (children.length === 1 && children[0].type === "paragraph") {
      return <li key={key}>{renderInline(richChildren(children[0]), key)}</li>;
    }

    return (
      <li key={key} className="space-y-2">
        {renderBlocks(children, key)}
      </li>
    );
  });
}

function renderBlocks(nodes: RichNode[], keyPrefix: string, headingIds?: Map<number, string>): ReactNode[] {
  return nodes.map((node, index) => {
    const key = `${keyPrefix}-${index}`;

    switch (node.type) {
      case "paragraph":
        if (!richText(node).trim()) return null;
        return (
          <p key={key} className="text-slate-600 leading-relaxed">
            {renderInline(richChildren(node), key)}
          </p>
        );

      case "heading": {
        if (!richText(node).trim()) return null;
        const id = headingIds?.get(index);

        if (Number(node.attrs?.level) >= 3) {
          return (
            <h3 key={key} id={id} className="scroll-mt-24 pt-2 text-base md:text-lg font-semibold text-slate-900">
              {renderInline(richChildren(node), key)}
            </h3>
          );
        }

        return (
          <h2
            key={key}
            id={id}
            className="scroll-mt-24 pt-6 first:pt-0 text-xl md:text-2xl font-semibold text-slate-900 tracking-tight"
          >
            {renderInline(richChildren(node), key)}
          </h2>
        );
      }

      case "bulletList":
        return (
          <ul key={key} className="list-disc pl-5 space-y-2 text-slate-600 marker:text-blue-600">
            {renderListItems(node, key)}
          </ul>
        );

      case "orderedList": {
        const start = Math.floor(Number(node.attrs?.start));
        return (
          <ol
            key={key}
            start={start > 1 ? start : undefined}
            className="list-decimal pl-6 space-y-2 text-slate-600 marker:font-semibold marker:text-blue-700"
          >
            {renderListItems(node, key)}
          </ol>
        );
      }

      case "blockquote":
        return (
          <blockquote
            key={key}
            className="space-y-3 rounded-2xl border border-blue-100 bg-blue-50/60 p-4 text-slate-700 [&_p]:text-slate-700"
          >
            {renderBlocks(richChildren(node), key)}
          </blockquote>
        );

      case "horizontalRule":
        return <hr key={key} className="my-8 border-slate-200" />;

      case "image": {
        const src = safeImageSrc(node.attrs?.src);
        if (!src) return null;
        const alt = typeof node.attrs?.alt === "string" ? node.attrs.alt : "";
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={key}
            src={src}
            alt={alt}
            loading="lazy"
            className="my-6 h-auto w-full rounded-2xl border border-slate-200"
          />
        );
      }

      default:
        return <Fragment key={key}>{renderBlocks(richChildren(node), key)}</Fragment>;
    }
  });
}

export default function RichContentRenderer({ content }: { content: RichContent }) {
  // Solvix builds `toc` from the non-empty top-level H2/H3 headings in
  // document order, so the n-th such heading gets the n-th TOC id.
  const headingIds = new Map<number, string>();
  let tocIndex = 0;

  content.nodes.forEach((node, index) => {
    if (node.type !== "heading" || !richText(node).trim()) return;
    const entry = content.toc[tocIndex++];
    if (entry) headingIds.set(index, entry.id);
  });

  return <div className="space-y-4 break-words">{renderBlocks(content.nodes, "rich", headingIds)}</div>;
}
