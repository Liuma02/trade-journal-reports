import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FilterCategory } from "@/data/mockTradeData";

interface SubFiltersProps {
  activeFilter: FilterCategory;
}

export function SubFilters({ activeFilter }: SubFiltersProps) {
  const getSubFilterOptions = () => {
    switch (activeFilter) {
      case "time":
        return {
          label: "SELECT TIME INTERVAL",
          options: ["1 Hour", "30 Min", "15 Min"],
          defaultValue: "1 Hour",
        };
      case "instrument":
        return {
          label: "SHOW INSTRUMENT DATA FROM",
          options: ["TOP 10", "TOP 20", "All"],
          defaultValue: "TOP 10",
        };
      case "duration":
        return null;
      default:
        return null;
    }
  };

  const subFilter = getSubFilterOptions();

  if (!subFilter) return null;

  return (
    <div className="flex items-center gap-2 py-3">
      <span className="text-xs text-muted-foreground">{subFilter.label}</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-7 gap-1 text-xs">
            {subFilter.defaultValue}
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {subFilter.options.map((option) => (
            <DropdownMenuItem key={option}>{option}</DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
