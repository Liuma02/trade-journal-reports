import { useState, useCallback } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useTrades } from "@/contexts/TradeContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, FileText, CheckCircle, AlertCircle, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const brokerFormats = [
  { id: 'generic', name: 'Generic CSV', description: 'Standard CSV with common column names' },
  { id: 'metatrader', name: 'MetaTrader 4/5', description: 'MT4/MT5 trading history export' },
  { id: 'tradingview', name: 'TradingView', description: 'TradingView paper trading export' },
  { id: 'thinkorswim', name: 'TD Ameritrade / thinkorswim', description: 'thinkorswim trading activity' },
  { id: 'ibkr', name: 'Interactive Brokers', description: 'IBKR Flex Query or Activity Statement' },
  { id: 'oanda', name: 'OANDA', description: 'OANDA fxTrade history' },
];

const Import = () => {
  const { importFromCSV } = useTrades();
  const navigate = useNavigate();
  const [selectedBroker, setSelectedBroker] = useState('generic');
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; count: number; errors: string[] } | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'text/csv') {
      setFile(droppedFile);
      setResult(null);
    } else {
      toast.error('Please upload a CSV file');
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    try {
      const content = await file.text();
      const importResult = await importFromCSV(content, selectedBroker);
      setResult(importResult);

      if (importResult.success) {
        toast.success(`Successfully imported ${importResult.count} trades`);
      } else {
        toast.error('Failed to import trades');
      }
    } catch (error) {
      toast.error('Error reading file');
      setResult({ success: false, count: 0, errors: ['Failed to read file'] });
    } finally {
      setImporting(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setResult(null);
  };

  return (
    <AppLayout title="Import Trades">
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        {/* Broker Selection */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Select Broker Format</CardTitle>
            <CardDescription>
              Choose your broker or platform to ensure correct data parsing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedBroker} onValueChange={setSelectedBroker}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {brokerFormats.map((broker) => (
                  <SelectItem key={broker.id} value={broker.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{broker.name}</span>
                      <span className="text-xs text-muted-foreground">{broker.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* File Upload */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Upload CSV File</CardTitle>
            <CardDescription>
              Drag and drop your trade history file or click to browse
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!file ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer ${
                  dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                }`}
              >
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-input"
                />
                <label htmlFor="file-input" className="cursor-pointer">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">Drop your CSV file here</p>
                  <p className="text-sm text-muted-foreground">or click to browse</p>
                </label>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-primary" />
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={clearFile}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {!result && (
                  <Button 
                    className="w-full" 
                    onClick={handleImport}
                    disabled={importing}
                  >
                    {importing ? 'Importing...' : 'Import Trades'}
                  </Button>
                )}

                {result && (
                  <div className={`p-4 rounded-lg ${result.success ? 'bg-profit/10' : 'bg-loss/10'}`}>
                    <div className="flex items-start gap-3">
                      {result.success ? (
                        <CheckCircle className="w-5 h-5 text-profit mt-0.5" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-loss mt-0.5" />
                      )}
                      <div>
                        <p className={`font-medium ${result.success ? 'text-profit' : 'text-loss'}`}>
                          {result.success 
                            ? `Successfully imported ${result.count} trades` 
                            : 'Import failed'}
                        </p>
                        {result.errors.length > 0 && (
                          <ul className="mt-2 text-sm text-muted-foreground space-y-1">
                            {result.errors.slice(0, 5).map((error, idx) => (
                              <li key={idx}>• {error}</li>
                            ))}
                            {result.errors.length > 5 && (
                              <li>• ...and {result.errors.length - 5} more errors</li>
                            )}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {result?.success && (
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={clearFile}
                    >
                      Import More
                    </Button>
                    <Button 
                      className="flex-1"
                      onClick={() => navigate('/dashboard')}
                    >
                      View Dashboard
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expected Columns */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Expected CSV Format</CardTitle>
            <CardDescription>
              Your CSV should contain some of these columns (case-insensitive)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="font-medium text-foreground">Date</p>
                <p className="text-muted-foreground">date, time, trade date</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Symbol</p>
                <p className="text-muted-foreground">symbol, instrument, ticker</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Side</p>
                <p className="text-muted-foreground">side, type, direction</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Entry Price</p>
                <p className="text-muted-foreground">entry, open price</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Exit Price</p>
                <p className="text-muted-foreground">exit, close price</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Quantity</p>
                <p className="text-muted-foreground">quantity, volume, lots</p>
              </div>
              <div>
                <p className="font-medium text-foreground">P&L</p>
                <p className="text-muted-foreground">pnl, profit, p/l</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Commission</p>
                <p className="text-muted-foreground">commission, fee</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Import;
