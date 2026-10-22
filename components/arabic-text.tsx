import type { ReactNode } from "react";

export function ArabicText({
  children,
  className = ""
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span lang="ar" dir="rtl" className={`arabic-text ${className}`}>
      {children}
    </span>
  );
}
