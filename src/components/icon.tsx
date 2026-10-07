import type { CSSProperties } from "react";

type IconName = "spark" | "plus" | "search" | "image" | "upload" | "check" | "arrow" | "smile" | "meh";
const paths: Record<IconName, React.ReactNode> = {
  spark: <path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2Z" />,
  plus: <path d="M12 5v14M5 12h14" />,
  search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4 4" /></>,
  image: <><rect x="3" y="3" width="18" height="18" rx="4" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m3 17 5-5 4 4 4-6 5 7" /></>,
  upload: <><path d="M12 16V3m-5 5 5-5 5 5M4 15v5a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-5" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
  smile: <><circle cx="12" cy="12" r="9" /><path d="M8 14a4 4 0 0 0 8 0M8 8h.01M16 8h.01" /></>,
  meh: <><circle cx="12" cy="12" r="9" /><path d="M8 14h8M8 8h.01M16 8h.01" /></>,
};

export function Icon({ name, className = "", style }: { name: IconName; className?: string; style?: CSSProperties }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={`size-4 shrink-0 ${className}`} style={style}>{paths[name]}</svg>;
}
