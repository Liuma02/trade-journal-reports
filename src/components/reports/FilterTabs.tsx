import { filterCategories, FilterCategory } from "@/data/mockTradeData";
// Using types from mockTradeData, but actual data comes from TradeContext

interface FilterTabsProps {
  activeFilter: FilterCategory;
  onFilterChange: (filter: FilterCategory) => void;
}

export function FilterTabs({ activeFilter, onFilterChange }: FilterTabsProps) {
  return (
    <div className="flex items-center gap-1 border-b border-border pb-0 overflow-x-auto">
      <span className="text-xs text-muted-foreground mr-2 whitespace-nowrap">FILTER BY:</span>
      {filterCategories.map((category) => (
        <button
          key={category.id}
          onClick={() => onFilterChange(category.id)}
          className={`px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap ${
            activeFilter === category.id
              ? "text-primary border-b-2 border-primary -mb-[1px]"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {category.label}
        </button>
      ))}
    </div>
  );
}
