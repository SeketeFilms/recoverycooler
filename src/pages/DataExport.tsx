import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Download, FileJson, FileText, Loader2, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import BottomNav from '@/components/BottomNav';

interface ExportOption {
  id: string;
  label: string;
  description: string;
  table: string;
}

const exportOptions: ExportOption[] = [
  {
    id: 'journal',
    label: 'Journal Entries',
    description: 'Your daily reflections and notes',
    table: 'journal_entries',
  },
  {
    id: 'progress',
    label: 'Progress Data',
    description: 'Streaks, check-ins, and milestones',
    table: 'progress_tracking',
  },
  {
    id: 'spending',
    label: 'Spending Logs',
    description: 'Financial tracking data',
    table: 'spending_logs',
  },
  {
    id: 'triggers',
    label: 'Personal Triggers',
    description: 'Your identified triggers and notes',
    table: 'personal_triggers',
  },
  {
    id: 'strategies',
    label: 'Coping Strategies',
    description: 'Strategies and their effectiveness',
    table: 'coping_strategies',
  },
  {
    id: 'achievements',
    label: 'Achievements',
    description: 'Unlocked badges and accomplishments',
    table: 'user_achievements',
  },
];

const DataExport = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedOptions, setSelectedOptions] = useState<string[]>(['journal', 'progress']);
  const [exporting, setExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');

  const toggleOption = (id: string) => {
    setSelectedOptions((prev) =>
      prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id]
    );
  };

  const exportData = async () => {
    if (selectedOptions.length === 0) {
      toast.error('Please select at least one data type to export');
      return;
    }

    setExporting(true);

    try {
      const exportData: Record<string, unknown[]> = {};

      // Fetch each data type
      if (selectedOptions.includes('journal')) {
        const { data } = await supabase.from('journal_entries').select('*').eq('user_id', user!.id);
        exportData['journal'] = data || [];
      }
      if (selectedOptions.includes('progress')) {
        const { data } = await supabase.from('progress_tracking').select('*').eq('user_id', user!.id);
        exportData['progress'] = data || [];
      }
      if (selectedOptions.includes('spending')) {
        const { data } = await supabase.from('spending_logs').select('*').eq('user_id', user!.id);
        exportData['spending'] = data || [];
      }
      if (selectedOptions.includes('triggers')) {
        const { data } = await supabase.from('personal_triggers').select('*').eq('user_id', user!.id);
        exportData['triggers'] = data || [];
      }
      if (selectedOptions.includes('strategies')) {
        const { data } = await supabase.from('coping_strategies').select('*').eq('user_id', user!.id);
        exportData['strategies'] = data || [];
      }
      if (selectedOptions.includes('achievements')) {
        const { data } = await supabase.from('user_achievements').select('*').eq('user_id', user!.id);
        exportData['achievements'] = data || [];
      }

      // Add metadata
      const exportPayload = {
        exportedAt: new Date().toISOString(),
        userId: user!.id,
        dataTypes: selectedOptions,
        data: exportData,
      };

      let blob: Blob;
      let filename: string;

      if (exportFormat === 'json') {
        blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
          type: 'application/json',
        });
        filename = `recovery-data-${new Date().toISOString().split('T')[0]}.json`;
      } else {
        // Convert to CSV format
        let csvContent = '';
        for (const [key, records] of Object.entries(exportData)) {
          if (records.length === 0) continue;
          csvContent += `\n--- ${key.toUpperCase()} ---\n`;
          const headers = Object.keys(records[0] as object);
          csvContent += headers.join(',') + '\n';
          for (const record of records) {
            const values = headers.map((h) => {
              const val = (record as Record<string, unknown>)[h];
              if (typeof val === 'string' && val.includes(',')) {
                return `"${val}"`;
              }
              return val ?? '';
            });
            csvContent += values.join(',') + '\n';
          }
        }
        blob = new Blob([csvContent], { type: 'text/csv' });
        filename = `recovery-data-${new Date().toISOString().split('T')[0]}.csv`;
      }

      // Trigger download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Data exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 pb-28">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4 gentle-fade-in">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Export Your Data</h1>
            <p className="text-sm text-muted-foreground">Download your recovery journey data</p>
          </div>
        </div>

        {/* Privacy Notice */}
        <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-primary/20">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Your Data, Your Control</h3>
                <p className="text-sm text-muted-foreground">
                  You have full ownership of your data. Export it anytime for your records,
                  to share with a therapist, or to transfer to another service.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Format Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Export Format</CardTitle>
            <CardDescription>Choose how you'd like your data formatted</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant={exportFormat === 'json' ? 'default' : 'outline'}
                className="h-auto py-4 flex flex-col items-center gap-2"
                onClick={() => setExportFormat('json')}
              >
                <FileJson className="h-6 w-6" />
                <span>JSON</span>
                <span className="text-xs opacity-70">Structured data format</span>
              </Button>
              <Button
                variant={exportFormat === 'csv' ? 'default' : 'outline'}
                className="h-auto py-4 flex flex-col items-center gap-2"
                onClick={() => setExportFormat('csv')}
              >
                <FileText className="h-6 w-6" />
                <span>CSV</span>
                <span className="text-xs opacity-70">Spreadsheet compatible</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Data Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Select Data to Export</CardTitle>
            <CardDescription>Choose which types of data to include</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {exportOptions.map((option) => (
                <div
                  key={option.id}
                  className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => toggleOption(option.id)}
                >
                  <Checkbox
                    id={option.id}
                    checked={selectedOptions.includes(option.id)}
                    onCheckedChange={() => toggleOption(option.id)}
                  />
                  <div className="flex-1">
                    <Label htmlFor={option.id} className="font-medium cursor-pointer">
                      {option.label}
                    </Label>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Export Button */}
        <Button
          size="lg"
          className="w-full"
          onClick={exportData}
          disabled={exporting || selectedOptions.length === 0}
        >
          {exporting ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="h-5 w-5 mr-2" />
              Export Selected Data
            </>
          )}
        </Button>

        {/* Help Text */}
        <p className="text-center text-sm text-muted-foreground">
          Your exported file will be downloaded directly to your device.
          <br />
          No data is sent to external servers.
        </p>
      </div>
      <BottomNav />
    </div>
  );
};

export default DataExport;
