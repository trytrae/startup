import * as React from "react"
import { cn } from "@/lib/utils"

const Steps = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value: number
  }
>(({ className, value, children, ...props }, ref) => {
  const items = React.Children.toArray(children)
  
  return (
    <div
      ref={ref}
      className={cn("flex items-center", className)}
      {...props}
    >
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <div className={cn(
              "flex-1 h-1 mx-2",
              index <= value ? "bg-primary" : "bg-border"
            )} />
          )}
          {item}
        </React.Fragment>
      ))}
    </div>
  )
})
Steps.displayName = "Steps"

const StepsContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value: number
    index: number
  }
>(({ className, value, index, children, ...props }, ref) => {
  if (value !== index) return null
  
  return (
    <div
      ref={ref}
      className={cn("mt-4", className)}
      {...props}
    >
      {children}
    </div>
  )
})
StepsContent.displayName = "StepsContent"

const StepsItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    title: string
  }
>(({ className, title, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground",
        className
      )}
      {...props}
    >
      {title}
    </div>
  )
})
StepsItem.displayName = "StepsItem"

export { Steps, StepsContent, StepsItem }