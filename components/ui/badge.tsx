import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-primary/10 text-primary border-transparent shadow",
        secondary:
          "bg-secondary/10 text-secondary border-transparent shadow",
        destructive:
          "bg-destructive/10 text-destructive border-transparent shadow",
        success:
          "bg-primary/10 text-primary border-transparent shadow",
        warning:
          "bg-secondary/10 text-secondary border-transparent shadow",
        info:
          "bg-accent/10 text-accent border-transparent shadow",
        outline: "bg-transparent text-foreground border border-border",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
