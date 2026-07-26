/** Minimal monochrome-warm US flag motif — used sparingly per brand guidance */
export default function AmericanFlag({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 20"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <rect width="32" height="20" fill="#E8E0D0" opacity="0.15" />
      <rect y="0" width="32" height="1.54" fill="#E8E0D0" opacity="0.55" />
      <rect y="3.08" width="32" height="1.54" fill="#E8E0D0" opacity="0.55" />
      <rect y="6.15" width="32" height="1.54" fill="#E8E0D0" opacity="0.55" />
      <rect y="9.23" width="32" height="1.54" fill="#E8E0D0" opacity="0.55" />
      <rect y="12.31" width="32" height="1.54" fill="#E8E0D0" opacity="0.55" />
      <rect y="15.38" width="32" height="1.54" fill="#E8E0D0" opacity="0.55" />
      <rect y="18.46" width="32" height="1.54" fill="#E8E0D0" opacity="0.55" />
      <rect width="12.5" height="10.8" fill="#FF5A00" opacity="0.75" />
      {/* Stars — simplified dots */}
      {[
        [2, 2],
        [5, 2],
        [8, 2],
        [10.5, 2],
        [3.5, 4.2],
        [6.5, 4.2],
        [9.5, 4.2],
        [2, 6.4],
        [5, 6.4],
        [8, 6.4],
        [10.5, 6.4],
        [3.5, 8.6],
        [6.5, 8.6],
        [9.5, 8.6],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="0.55" fill="#E8E0D0" opacity="0.9" />
      ))}
    </svg>
  );
}
