import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PnlToggleProps {
  value: "net" | "gross";
  onChange: (value: "net" | "gross") => void;
}

export function PnlToggle({ value, onChange }: PnlToggleProps) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-xs text-muted-foreground">P&L SHOWING</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-7 gap-1 text-xs">
            {value === "net" ? "NET P&L" : "GROSS P&L"}
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => onChange("net")}>NET P&L</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onChange("gross")}>GROSS P&L</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
