export function VerifiedBadge({ size = 14 }: { size?: number }) {
  return (
    <span
      title="متجر موثق"
      className="inline-flex items-center"
      style={{ width: size + 2, height: size + 2 }}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className="text-brand-500">
        <path d="M12 1l2.6 2.2 3.4-.4 1.2 3.2 3.2 1.2-.4 3.4L24 12l-2.2 2.6.4 3.4-3.2 1.2-1.2 3.2-3.4-.4L12 24l-2.6-2.2-3.4.4-1.2-3.2L1.6 18l.4-3.4L0 12l2.2-2.6L1.8 6l3.2-1.2L6.2 1.6 9.6 2 12 1z" />
        <path d="M9.5 12.5l2 2 3.5-4" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}
