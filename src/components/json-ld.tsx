/**
 * Renders a JSON-LD structured-data block. Escapes `<` so a literal
 * `</script>` inside any string can never terminate the tag (defense in
 * depth against XSS, blueprint §32).
 */
function JsonLd({ data }: { data: object }) {
  const html = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export { JsonLd };
