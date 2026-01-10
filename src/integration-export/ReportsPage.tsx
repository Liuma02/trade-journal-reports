import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import { FilterCategory, TradeData } from './types';
import { filterCategories, getDataForCategory, getCategoryTitle } from './mockData';
import './Reports.css';

// ============ ICONS (inline SVG) ============

const FilterIcon = () => (
  <svg className="icon" viewBox="0 0 24 24">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="icon" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg className="icon" viewBox="0 0 24 24">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

// ============ DROPDOWN COMPONENT ============

interface DropdownProps {
  trigger: React.ReactNode;
  items: { label: string; onClick?: () => void }[];
}

const Dropdown: React.FC<DropdownProps> = ({ trigger, items }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`dropdown ${isOpen ? 'open' : ''}`}>
      <button className="dropdown-btn" onClick={() => setIsOpen(!isOpen)}>
        {trigger}
        <ChevronDownIcon />
      </button>
      <div className="dropdown-content">
        {items.map((item, index) => (
          <button
            key={index}
            className="dropdown-item"
            onClick={() => {
              item.onClick?.();
              setIsOpen(false);
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};

// ============ DISTRIBUTION CHART ============

interface DistributionChartProps {
  title: string;
  subtitle?: string;
  data: TradeData[];
}

const DistributionChart: React.FC<DistributionChartProps> = ({ title, subtitle, data }) => {
  return (
    <div className="chart-card">
      <h3>{title}</h3>
      {subtitle && <p className="subtitle">{subtitle}</p>}
      <div className="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#30363d" horizontal vertical={false} />
            <XAxis
              type="number"
              stroke="#7d8590"
              tick={{ fill: '#7d8590', fontSize: 11 }}
              axisLine={{ stroke: '#30363d' }}
            />
            <YAxis
              dataKey="label"
              type="category"
              stroke="#7d8590"
              tick={{ fill: '#7d8590', fontSize: 11 }}
              axisLine={{ stroke: '#30363d' }}
              width={55}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#161b22',
                border: '1px solid #30363d',
                borderRadius: '8px',
                color: '#e6edf3',
              }}
              formatter={(value: number) => [`${value} trades`, 'Count']}
            />
            <Bar dataKey="trades" radius={[0, 4, 4, 0]}>
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill="#7c3aed" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// ============ PERFORMANCE CHART ============

interface PerformanceChartProps {
  title: string;
  subtitle?: string;
  data: TradeData[];
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ title, subtitle, data }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="chart-card">
      <h3>{title}</h3>
      {subtitle && <p className="subtitle">{subtitle}</p>}
      <div className="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#30363d" horizontal vertical={false} />
            <XAxis
              type="number"
              stroke="#7d8590"
              tick={{ fill: '#7d8590', fontSize: 11 }}
              axisLine={{ stroke: '#30363d' }}
              tickFormatter={formatCurrency}
            />
            <YAxis
              dataKey="label"
              type="category"
              stroke="#7d8590"
              tick={{ fill: '#7d8590', fontSize: 11 }}
              axisLine={{ stroke: '#30363d' }}
              width={55}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#161b22',
                border: '1px solid #30363d',
                borderRadius: '8px',
                color: '#e6edf3',
              }}
              formatter={(value: number) => [formatCurrency(value), 'P&L']}
            />
            <ReferenceLine x={0} stroke="#30363d" strokeWidth={2} />
            <Bar dataKey="pnl" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#3fb950' : '#f85149'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// ============ SUMMARY TABLE ============

interface SummaryTableProps {
  data: TradeData[];
  labelHeader: string;
}

const SummaryTable: React.FC<SummaryTableProps> = ({ data, labelHeader }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const summaryData = data.map((row) => {
    const totalProfits = row.pnl > 0 ? row.pnl : 0;
    const totalLoss = row.pnl < 0 ? Math.abs(row.pnl) : 0;
    const winRate =
      row.trades > 0 && row.pnl > 0
        ? Math.min(95, Math.round((row.pnl / (row.trades * 100)) * 100 + 50))
        : row.pnl < 0
        ? Math.max(5, 50 - Math.round((Math.abs(row.pnl) / (row.trades * 100)) * 50))
        : 0;

    return {
      ...row,
      netProfit: row.pnl,
      totalProfits,
      totalLoss,
      winRate: row.trades > 0 ? winRate : 0,
      volume: Math.round(row.trades * 2.5),
    };
  });

  return (
    <div className="chart-card summary-section">
      <h3>SUMMARY</h3>
      <table className="summary-table">
        <thead>
          <tr>
            <th>{labelHeader}</th>
            <th>Net Profit</th>
            <th className="center">Winning %</th>
            <th>Total Profits</th>
            <th>Total Loss</th>
            <th>Trades</th>
            <th>Volume</th>
          </tr>
        </thead>
        <tbody>
          {summaryData.map((row, index) => (
            <tr key={index}>
              <td>
                <span className="label-badge">{row.label}</span>
              </td>
              <td className={row.netProfit >= 0 ? 'profit' : 'loss'}>
                {formatCurrency(row.netProfit)}
              </td>
              <td>
                <div className="winrate-cell">
                  {row.winRate > 0 ? (
                    <div className="winrate-bar">
                      <div
                        className={`winrate-fill ${row.winRate >= 50 ? 'positive' : 'negative'}`}
                        style={{ width: `${row.winRate}%` }}
                      />
                    </div>
                  ) : (
                    <span className="muted">-</span>
                  )}
                </div>
              </td>
              <td className="profit">
                {row.totalProfits > 0 ? formatCurrency(row.totalProfits) : formatCurrency(0)}
              </td>
              <td className="loss">
                {row.totalLoss > 0 ? formatCurrency(row.totalLoss) : formatCurrency(0)}
              </td>
              <td className="muted">{row.trades}</td>
              <td className="muted">{row.volume}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ============ MAIN REPORTS PAGE ============

const ReportsPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('time');
  const [pnlType, setPnlType] = useState<'net' | 'gross'>('net');

  const data = getDataForCategory(activeFilter);
  const categoryTitle = getCategoryTitle(activeFilter);

  return (
    <div className="reports-page">
      <div className="reports-container">
        {/* Header */}
        <div className="report-header">
          <h1>Reports</h1>
          <div className="header-controls">
            <Dropdown
              trigger={
                <>
                  <FilterIcon />
                  Filters
                </>
              }
              items={[
                { label: 'All Trades' },
                { label: 'Winners Only' },
                { label: 'Losers Only' },
                { label: 'Long Trades' },
                { label: 'Short Trades' },
              ]}
            />
            <Dropdown
              trigger={
                <>
                  <CalendarIcon />
                  Date range
                </>
              }
              items={[
                { label: 'Today' },
                { label: 'This Week' },
                { label: 'This Month' },
                { label: 'Last 30 Days' },
                { label: 'Last 90 Days' },
                { label: 'All Time' },
              ]}
            />
            <Dropdown
              trigger={
                <>
                  <span className="status-dot" />
                  MT5 2320.MT5
                </>
              }
              items={[
                { label: 'MT5 2320.MT5' },
                { label: 'MT4 1105.MT4' },
                { label: 'All Accounts' },
              ]}
            />
          </div>
        </div>

        {/* P&L Toggle */}
        <div className="pnl-toggle">
          <span>P&L SHOWING</span>
          <Dropdown
            trigger={<>{pnlType === 'net' ? 'NET P&L' : 'GROSS P&L'}</>}
            items={[
              { label: 'NET P&L', onClick: () => setPnlType('net') },
              { label: 'GROSS P&L', onClick: () => setPnlType('gross') },
            ]}
          />
        </div>

        {/* Filter Tabs */}
        <div className="filter-tabs">
          <span className="filter-label">FILTER BY:</span>
          {filterCategories.map((category) => (
            <button
              key={category.id}
              className={`filter-tab ${activeFilter === category.id ? 'active' : ''}`}
              onClick={() => setActiveFilter(category.id)}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Sub Filters */}
        {(activeFilter === 'time' || activeFilter === 'instrument') && (
          <div className="sub-filters">
            <span>
              {activeFilter === 'time' ? 'SELECT TIME INTERVAL' : 'SHOW INSTRUMENT DATA FROM'}
            </span>
            <Dropdown
              trigger={<>{activeFilter === 'time' ? '1 Hour' : 'TOP 10'}</>}
              items={
                activeFilter === 'time'
                  ? [{ label: '1 Hour' }, { label: '30 Min' }, { label: '15 Min' }]
                  : [{ label: 'TOP 10' }, { label: 'TOP 20' }, { label: 'All' }]
              }
            />
          </div>
        )}

        {/* Charts */}
        <div className="charts-grid">
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

        {/* Summary Table */}
        <SummaryTable data={data} labelHeader={categoryTitle} />
      </div>
    </div>
  );
};

export default ReportsPage;
