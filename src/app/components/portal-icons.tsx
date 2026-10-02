type IconProps = { className?: string };

export function PortalMark({ className }: IconProps) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 40 40">
      <path d="M7 8.5h18.5a7 7 0 0 1 0 14H14.5a7 7 0 0 0 0 14H33" stroke="currentColor" strokeLinecap="round" strokeWidth="5" />
      <circle cx="7" cy="8.5" fill="currentColor" r="3.5" />
      <circle cx="33" cy="31.5" fill="currentColor" r="3.5" />
    </svg>
  );
}

export function AppsIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <rect height="6" rx="1.5" stroke="currentColor" strokeWidth="1.8" width="6" x="3" y="3" />
      <rect height="6" rx="1.5" stroke="currentColor" strokeWidth="1.8" width="6" x="15" y="3" />
      <rect height="6" rx="1.5" stroke="currentColor" strokeWidth="1.8" width="6" x="3" y="15" />
      <rect height="6" rx="1.5" stroke="currentColor" strokeWidth="1.8" width="6" x="15" y="15" />
    </svg>
  );
}

export function BlogIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path d="M6 4.5h9.5A2.5 2.5 0 0 1 18 7v13H8.5A2.5 2.5 0 0 0 6 22.5v-18Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="M6 4.5v18M10 9h4.5M10 13h4.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  );
}

export function HelpIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9.7 9.35a2.4 2.4 0 1 1 3.72 2c-.9.62-1.42 1.05-1.42 2.15M12 16.9h.01" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  );
}

export function ArrowUpRightIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path d="M7 17 17 7M9 7h8v8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

export function SparkIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path d="M12 2.75c.87 5.1 3.15 7.38 8.25 8.25-5.1.87-7.38 3.15-8.25 8.25C11.13 14.15 8.85 11.87 3.75 11 8.85 10.13 11.13 7.85 12 2.75Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

export function MenuIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path d="M5 7h14M5 12h14M5 17h14" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  );
}

export function SignOutIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path d="M10 5H6.5A1.5 1.5 0 0 0 5 6.5v11A1.5 1.5 0 0 0 6.5 19H10M14 8l4 4-4 4M18 12H9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

export function GridIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <rect height="6" rx="1" stroke="currentColor" strokeWidth="1.8" width="6" x="3" y="3" />
      <rect height="6" rx="1" stroke="currentColor" strokeWidth="1.8" width="6" x="15" y="3" />
      <rect height="6" rx="1" stroke="currentColor" strokeWidth="1.8" width="6" x="3" y="15" />
      <rect height="6" rx="1" stroke="currentColor" strokeWidth="1.8" width="6" x="15" y="15" />
    </svg>
  );
}

export function ListIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path d="M9 6h10M9 12h10M9 18h10M5 6h.01M5 12h.01M5 18h.01" stroke="currentColor" strokeLinecap="round" strokeWidth="2.4" />
    </svg>
  );
}
