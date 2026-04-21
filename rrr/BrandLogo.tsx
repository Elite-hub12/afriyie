/**
 * Multi-tool logo: a Swiss-army-knife inspired mark with multiple
 * tool blades fanning out from a single hub. Uses currentColor so
 * it inherits text color from parent (theme-aware).
 */
export function BrandLogo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Hub */}
      <circle cx="20" cy="20" r="3.2" fill="currentColor" stroke="none" />
      {/* Wrench */}
      <path d="M20 20 L8 8 M8 8 a3 3 0 1 0 4 4" />
      {/* Screwdriver */}
      <path d="M20 20 L32 8 M32 8 l1.5 1.5" />
      {/* Ruler */}
      <path d="M20 20 L8 32 M11 29 l1.5 1.5 M14 26 l1.5 1.5" />
      {/* Calculator key */}
      <path d="M20 20 L32 32 M28 32 l4 0 M32 28 l0 4" />
    </svg>
  );
}
