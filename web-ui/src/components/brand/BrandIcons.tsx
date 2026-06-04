/**
 * Brandované SVG ikony — jednotný geometrický mono-line styl (currentColor).
 *
 * Slouží jako konzistentní, ne-emoji ikonografie napříč aplikací (rozcestník,
 * hlavičky). Záměrně střídmé; finální „flat + retro-věda" sadu dodá designér
 * podle DESIGN-BRIEF.md a tyto komponenty se jen prohodí.
 */
import type { SVGProps, ReactNode } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { className?: string };

function Line({ className = 'w-6 h-6', children, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

/** Tapír — značka (vyplněná silueta, currentColor). */
export function TapirMark({ className = 'w-8 h-8', ...props }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      {/* tělo + hlava (hlava vpravo, krátký svěšený chobot) */}
      <path d="M6 30c0-7.2 5.6-12.5 13-12.5h5.5c3.4 0 6 .6 8.8 .6 1.8 0 3-.7 4.6-1.8.9-.6 2 .3 1.7 1.3-.5 1.7-1.6 3-3.2 3.9-.9 .5-1.4 1-1.7 1.8l-1.6 4 0 .2 0 3.7a3 3 0 0 1-3 3H10a4 4 0 0 1-4-4z" />
      {/* ucho na temeni hlavy */}
      <path d="M30 18.2c.5-2.2 1.6-3.7 3.2-4.4 .9-.4 1.8 .5 1.4 1.4-.6 1.5-.8 2.7-.6 3.9z" />
      {/* oko (výřez) */}
      <circle cx="33" cy="23" r="1.4" fill="var(--color-brand-cream)" />
      {/* nohy */}
      <rect x="13" y="34.5" width="2.8" height="5" rx="1.3" />
      <rect x="25.5" y="34.5" width="2.8" height="5" rx="1.3" />
    </svg>
  );
}

/** Krizový štáb — vládní budova (landmark). */
export function IconCrisisStaff({ className, ...props }: IconProps) {
  return (
    <Line className={className} {...props}>
      <path d="M3 9.5l9-5 9 5" />
      <path d="M4 9.5h16" />
      <path d="M5 20h14" />
      <path d="M6.5 12v6M10 12v6M14 12v6M17.5 12v6" />
    </Line>
  );
}

/** Ósacká horečka — telefon + síť kontaktů. */
export function IconOsacka({ className, ...props }: IconProps) {
  return (
    <Line className={className} {...props}>
      <path d="M5 4.5h3l1.2 3.4-1.7 1.2a10 10 0 0 0 4.7 4.7l1.2-1.7 3.4 1.2v3a1.5 1.5 0 0 1-1.6 1.5A13.5 13.5 0 0 1 4.5 6.1 1.5 1.5 0 0 1 5 4.5z" />
      <circle cx="17.5" cy="5.5" r="1.4" />
      <circle cx="21" cy="9.5" r="1.4" />
      <path d="M16.4 6.6l-2.4 2.2" />
    </Line>
  );
}

/** Záhada z Oyster Bay — lupa nad kapkou (voda/vyšetřování). */
export function IconOysterBay({ className, ...props }: IconProps) {
  return (
    <Line className={className} {...props}>
      <circle cx="10.5" cy="10.5" r="6" />
      <path d="M15 15l4.5 4.5" />
      <path d="M10.5 7.5c1.6 1.7 2.5 3.1 2.5 4.3a2.5 2.5 0 0 1-5 0c0-1.2.9-2.6 2.5-4.3z" />
    </Line>
  );
}

/** Příručka epidemiologa — otevřená kniha. */
export function IconHandbook({ className, ...props }: IconProps) {
  return (
    <Line className={className} {...props}>
      <path d="M12 6.5C10.5 5.3 8.5 4.8 5 5v12c3.5-.2 5.5.3 7 1.5 1.5-1.2 3.5-1.7 7-1.5V5c-3.5-.2-5.5.3-7 1.5z" />
      <path d="M12 6.5V18" />
    </Line>
  );
}

/** Odborný režim / sandbox — epidemická křivka v rámu. */
export function IconSandbox({ className, ...props }: IconProps) {
  return (
    <Line className={className} {...props}>
      <path d="M4 4v16h16" />
      <path d="M6 16c2 0 2.5-7 5-7s3 9 8 3" />
    </Line>
  );
}

/** Učitelský režim — tabule s grafem. */
export function IconTeacher({ className, ...props }: IconProps) {
  return (
    <Line className={className} {...props}>
      <rect x="4" y="4.5" width="16" height="11" rx="1.5" />
      <path d="M7 12l2.5-3 2 2L15 7.5" />
      <path d="M12 15.5V19" />
      <path d="M9 19h6" />
    </Line>
  );
}
