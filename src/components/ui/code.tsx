
import * as React from "react"
import { cn } from "@/lib/utils"

interface CodeProps extends React.HTMLAttributes<HTMLPreElement> {
  children: React.ReactNode
}

const Code = React.forwardRef<HTMLPreElement, CodeProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <pre
        ref={ref}
        className={cn(
          "relative rounded-lg bg-muted p-4 text-sm font-mono text-muted-foreground",
          className
        )}
        {...props}
      >
        <code className="block overflow-x-auto">{children}</code>
      </pre>
    )
  }
)
Code.displayName = "Code"

export { Code }
