/**
 * The plum-square "星化" mark, shared by every generated icon (apple-icon,
 * the manifest icon) so the brand mark is defined once instead of copied
 * per file. Matches src/app/icon.svg exactly — same colors, same glyph,
 * just re-rendered as PNG via ImageResponse where SVG isn't accepted
 * (iOS home-screen icons, PWA manifest icons).
 */
export function brandMarkNode(glyphFontSize: number) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#5c1f30",
      }}
    >
      <div style={{ display: "flex", fontSize: glyphFontSize, color: "#f5f1e6" }}>
        星化
      </div>
    </div>
  );
}
