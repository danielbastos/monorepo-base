import type * as React from "react";
import { cn } from "@/lib/utils";

export function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    // Consumers associate this reusable primitive through htmlFor.
    // biome-ignore lint/a11y/noLabelWithoutControl: association is provided by the caller
    <label
      data-slot="label"
      className={cn("text-sm font-medium leading-none", className)}
      {...props}
    />
  );
}
