import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { FilterTabs } from "@/components/reports/FilterTabs";
import { DistributionChart } from "@/components/reports/DistributionChart";
import { PerformanceChart } from "@/components/reports/PerformanceChart";
import { SummaryTable } from "@/components/reports/SummaryTable";
import { SubFilters } from "@/components/reports/SubFilters";
import { PnlToggle } from "@/components/reports/PnlToggle";
import { FilterCategory, getDataForCategory, getCategoryTitle } from "@/data/mockTradeData";

const Reports = () => {
  const [activeFilter, setActiveFilter] = useState<FilterCategory>("time");
  const [pnlType, setPnlType] = useState<"net" | "gross">("net");

  const data = getDataForCategory(activeFilter);
  const categoryTitle = getCategoryTitle(activeFilter);

  return (
    <AppLayout title="Reports" showFilters>
      <div className="p-6">
        <PnlToggle value={pnlType} onChange={setPnlType} />
        
        <FilterTabs activeFilter={activeFilter} onFilterChange={setActiveFilter} />
        
        <SubFilters activeFilter={activeFilter} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <DistributionChart 
            title={`TRADE DISTRIBUTION BY ${categoryTitle}`}
            subtitle="(ALL DATES)"
            data={data}
          />
          <PerformanceChart 
            title={`PERFORMANCE BY ${categoryTitle}`}
            subtitle="(ALL DATES)"
            data={data}
          />
        </div>

        <div className="mt-6">
          <SummaryTable data={data} labelHeader={categoryTitle} />
        </div>
      </div>
    </AppLayout>
  );
};

export default Reports;
