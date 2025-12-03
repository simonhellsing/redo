"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"
import { cn } from "@/lib/utils"

// Chart container component
const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: Record<string, { label?: React.ReactNode; color?: string }>
    children: React.ComponentProps<
      typeof RechartsPrimitive.ResponsiveContainer
    >["children"]
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

  return (
    <div
      data-chart={chartId}
      ref={ref}
      className={cn(
        "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line-line]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
        className
      )}
      {...props}
    >
      <ChartStyle id={chartId} config={config} />
      <RechartsPrimitive.ResponsiveContainer>
        {children}
      </RechartsPrimitive.ResponsiveContainer>
    </div>
  )
})
ChartContainer.displayName = "Chart"

// Chart style component for CSS variables
const ChartStyle = ({ id, config }: { id: string; config: Record<string, { label?: React.ReactNode; color?: string }> }) => {
  const colorConfig = Object.entries(config).filter(
    ([_, config]) => config.color
  )

  if (!colorConfig.length) {
    return null
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(config)
          .filter(([_, config]) => config.color)
          .map(([key, itemConfig], index) => {
            const color = itemConfig.color || `hsl(var(--chart-${(index % 5) + 1}))`
            return `[data-chart=${id}] .color-${key} { color: ${color}; }`
          })
          .join("\n"),
      }}
    />
  )
}

// Chart tooltip component
const ChartTooltip = RechartsPrimitive.Tooltip

// Chart tooltip content component
const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
    React.ComponentProps<"div"> & {
      hideLabel?: boolean
      hideIndicator?: boolean
      indicator?: "line" | "dot" | "dashed"
      nameKey?: string
      labelKey?: string
    }
>(
  (
    {
      active,
      payload,
      className,
      indicator = "dot",
      hideLabel = false,
      hideIndicator = false,
      label,
      labelFormatter,
      labelClassName,
      formatter,
      color,
      nameKey,
      labelKey,
    },
    ref
  ) => {
    const tooltipLabel = React.useMemo(() => {
      if (hideLabel || !payload?.length) {
        return null
      }

      if (labelFormatter && label !== undefined) {
        return (
          <div className={cn("font-medium", labelClassName)}>
            {labelFormatter(label, payload)}
          </div>
        )
      }

      if (!labelFormatter && typeof label === "string") {
        return <div className={cn("font-medium", labelClassName)}>{label}</div>
      }

      return null
    }, [
      label,
      labelFormatter,
      payload,
      hideLabel,
      labelClassName,
      labelKey,
    ])

    if (!active || !payload?.length) {
      return null
    }

    const [item] = payload
    const value = item.value
    const itemConfig = item.payload?.[nameKey || item.name || ""] || {}

    return (
      <div
        ref={ref}
        className={cn(
          "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-[var(--neutral-200)] bg-white px-2.5 py-1.5 text-xs shadow-md",
          className
        )}
      >
        {tooltipLabel}
        <div className="grid gap-1.5">
          {payload.map((item, index) => {
            const key = `${nameKey || item.name || item.dataKey || "value"}`
            const itemConfig = item.payload?.[key] ? item.payload : item.payload?.payload || item.payload
            const indicatorColor = color || item.payload?.fill || item.color

            return (
              <div
                key={item.dataKey}
                className={cn(
                  "flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-[var(--neutral-700)]",
                  indicator === "dot" && "items-center"
                )}
              >
                <>
                  {!hideIndicator && (
                    <div
                      className={cn(
                        "shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]",
                        {
                          "h-2.5 w-2.5": indicator === "dot",
                          "w-1": indicator === "line",
                          "w-0 border-[1.5px] border-dashed bg-transparent":
                            indicator === "dashed",
                          "my-0.5": indicator === "line",
                        }
                      )}
                      style={
                        {
                          "--color-bg": indicatorColor,
                          "--color-border": indicatorColor,
                        } as React.CSSProperties
                      }
                    />
                  )}
                  <div
                    className={cn(
                      "flex flex-1 justify-between leading-none",
                      indicator === "dot" ? "items-center" : "items-start"
                    )}
                  >
                    <div className="grid gap-1.5">
                      <span className="text-[var(--neutral-600)]">
                        {item.name}
                      </span>
                      <span className="font-medium tabular-nums text-[var(--neutral-900)]">
                        {formatter && item?.value !== undefined && item.name
                          ? formatter(item.value, item.name, item, index, item.payload)
                          : typeof item.value === "number"
                          ? item.value.toLocaleString("sv-SE")
                          : item.value}
                      </span>
                    </div>
                  </div>
                </>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
)
ChartTooltipContent.displayName = "ChartTooltipContent"

// Chart legend component
const ChartLegend = RechartsPrimitive.Legend

export {
  ChartContainer,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
}

