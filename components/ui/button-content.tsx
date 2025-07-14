// components/ui/button-content.tsx
import React from "react";
import { cn } from "@/lib/utils";

export function ButtonContent({
  children,
  className,
}: {
  children: React.ReactNode,
  className?: string,
}) {
  return <span className={cn("flex items-center", className)}>{children}</span>;
}
