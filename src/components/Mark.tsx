export default function Mark({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 100"
      className={`shrink-0 text-ink ${className}`}
      fill="none"
    >
      <ellipse
        cx="50"
        cy="52"
        rx="47"
        ry="17"
        transform="rotate(-11 50 52)"
        stroke="currentColor"
        strokeWidth="1.1"
        opacity="0.5"
      />
      <text
        x="50"
        y="61"
        textAnchor="middle"
        fontFamily="var(--font-display), serif"
        fontSize="40"
        fontWeight="600"
        fill="currentColor"
        stroke="none"
      >
        星化
      </text>
      <path
        d="M83 21 L84.6 27.4 L91 29 L84.6 30.6 L83 37 L81.4 30.6 L75 29 L81.4 27.4 Z"
        fill="currentColor"
      />
    </svg>
  );
}
