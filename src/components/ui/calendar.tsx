import * as React from "react"
import { DayPicker } from "react-day-picker"
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      captionLayout="dropdown"
      startMonth={new Date(2020, 0)}
      endMonth={new Date(2035, 11)}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-4",
        month: "relative flex flex-col gap-4",

        // Caption row — px-8 reserves space for the absolute nav arrows on each side
        month_caption: "flex justify-center items-center h-9 px-8",

        // Nav arrows — z-10 so they sit above the caption content
        nav: "absolute top-0 inset-x-0 flex items-center justify-between h-9 px-1 z-10",
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),

        // Container for both dropdowns
        dropdowns: "flex items-center gap-1.5",

        // DropdownRoot = relative wrapper (select + visible display span stacked)
        dropdown_root: "relative inline-flex items-center",

        // The native <select> sits invisible on top — full coverage, handles all interaction
        dropdown: cn(
          "absolute inset-0 w-full opacity-0 cursor-pointer z-[1]",
        ),

        // caption_label is the VISIBLE display for each dropdown (text + chevron)
        // also used as the non-dropdown month/year label — looks fine either way
        caption_label: cn(
          "flex items-center gap-1 border border-[var(--border)] rounded-md",
          "px-2.5 py-1 text-sm font-medium pointer-events-none select-none",
          "bg-transparent hover:bg-muted transition-colors"
        ),

        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday: "text-muted-foreground w-8 font-normal text-[0.8rem] text-center",
        week: "flex w-full mt-2",
        day: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 p-0 font-normal",
        ),
        // data-selected sits on the Day (td). The number is rendered by the ghost
        // day_button, whose own bg/text would win over Tailwind arbitrary variants
        // here — so the selected button styling lives in a plain CSS rule in
        // index.css ([data-selected="true"] > button). This just marks the cell.
        selected: "rdp-selected-day",
        today: "rounded-md bg-accent [&>button]:text-accent-foreground",
        outside: "text-muted-foreground/40",
        disabled: "text-muted-foreground opacity-50",
        range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => {
          if (orientation === "left")  return <ChevronLeft  className="h-4 w-4" />
          if (orientation === "down")  return <ChevronDown  className="h-3 w-3 text-muted-foreground shrink-0" />
          return <ChevronRight className="h-4 w-4" />
        },
      }}
      {...props}
    />
  )
}

Calendar.displayName = "Calendar"

export { Calendar }
