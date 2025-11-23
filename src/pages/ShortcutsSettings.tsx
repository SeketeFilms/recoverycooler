import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Sparkles, MessageSquare, AlertCircle, Shield, HelpCircle, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import BottomNav from '@/components/BottomNav';

const availableShortcuts = [
  { key: 'progress', icon: Sparkles, label: 'Progress Tracking', color: 'text-primary' },
  { key: 'journal', icon: MessageSquare, label: 'Recovery Journal', color: 'text-accent' },
  { key: 'crisis', icon: AlertCircle, label: 'Crisis Support', color: 'text-destructive' },
  { key: 'community', icon: MessageSquare, label: 'Community', color: 'text-primary' },
  { key: 'relapse', icon: Shield, label: 'Relapse Prevention', color: 'text-accent' },
  { key: 'exclusion', icon: Shield, label: 'Site Blocking', color: 'text-primary' },
  { key: 'ai', icon: MessageSquare, label: 'AI Assistant', color: 'text-accent' },
  { key: 'help', icon: HelpCircle, label: 'Help Resources', color: 'text-primary' },
];

const ShortcutsSettings = () => {
  const [selectedShortcuts, setSelectedShortcuts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    loadShortcuts();
  }, [user]);

  const loadShortcuts = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('user_shortcuts')
      .select('shortcut_key')
      .eq('user_id', user.id)
      .order('position');

    if (data && data.length > 0) {
      setSelectedShortcuts(data.map(s => s.shortcut_key));
    } else {
      setSelectedShortcuts(['progress', 'journal', 'crisis', 'community']);
    }
    setLoading(false);
  };

  const toggleShortcut = (key: string) => {
    if (selectedShortcuts.includes(key)) {
      setSelectedShortcuts(selectedShortcuts.filter(k => k !== key));
    } else {
      if (selectedShortcuts.length >= 6) {
        toast.error('Maximum 6 shortcuts allowed');
        return;
      }
      setSelectedShortcuts([...selectedShortcuts, key]);
    }
  };

  const saveShortcuts = async () => {
    if (!user) return;

    try {
      // Delete existing shortcuts
      await supabase
        .from('user_shortcuts')
        .delete()
        .eq('user_id', user.id);

      // Insert new shortcuts
      if (selectedShortcuts.length > 0) {
        const shortcuts = selectedShortcuts.map((key, index) => ({
          user_id: user.id,
          shortcut_key: key,
          position: index,
        }));

        await supabase
          .from('user_shortcuts')
          .insert(shortcuts);
      }

      toast.success('Shortcuts saved successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to save shortcuts');
    }
  };

  const moveShortcut = (index: number, direction: 'up' | 'down') => {
    const newShortcuts = [...selectedShortcuts];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex < 0 || newIndex >= newShortcuts.length) return;
    
    [newShortcuts[index], newShortcuts[newIndex]] = [newShortcuts[newIndex], newShortcuts[index]];
    setSelectedShortcuts(newShortcuts);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 pb-32">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 gentle-fade-in">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Customize Shortcuts
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Select up to 6 shortcuts for quick access
            </p>
          </div>
        </div>

        {/* Selected Shortcuts */}
        {selectedShortcuts.length > 0 && (
          <Card className="p-6 gentle-fade-in">
            <h2 className="text-lg font-semibold mb-4">Your Shortcuts ({selectedShortcuts.length}/6)</h2>
            <div className="space-y-2">
              {selectedShortcuts.map((key, index) => {
                const shortcut = availableShortcuts.find(s => s.key === key);
                if (!shortcut) return null;
                const Icon = shortcut.icon;
                return (
                  <div
                    key={key}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => moveShortcut(index, 'up')}
                        disabled={index === 0}
                      >
                        <GripVertical className="h-4 w-4" />
                      </Button>
                    </div>
                    <Icon className={`h-5 w-5 ${shortcut.color}`} />
                    <span className="flex-1 font-medium">{shortcut.label}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleShortcut(key)}
                    >
                      Remove
                    </Button>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Available Shortcuts */}
        <Card className="p-6 gentle-fade-in">
          <h2 className="text-lg font-semibold mb-4">Available Shortcuts</h2>
          <div className="space-y-3">
            {availableShortcuts.map((shortcut) => {
              const Icon = shortcut.icon;
              const isSelected = selectedShortcuts.includes(shortcut.key);
              return (
                <div
                  key={shortcut.key}
                  className={`flex items-center gap-3 p-4 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-primary/5 border-primary/50'
                      : 'hover:bg-muted/50 border-border'
                  }`}
                  onClick={() => toggleShortcut(shortcut.key)}
                >
                  <Checkbox checked={isSelected} />
                  <Icon className={`h-5 w-5 ${shortcut.color}`} />
                  <span className="flex-1 font-medium">{shortcut.label}</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Save Button */}
        <Button
          onClick={saveShortcuts}
          className="w-full py-6 text-base font-semibold"
        >
          Save Shortcuts
        </Button>
      </div>
      <BottomNav />
    </div>
  );
};

export default ShortcutsSettings;
