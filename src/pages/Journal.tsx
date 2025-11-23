import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { ArrowLeft, BookOpen, Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';
import BottomNav from '@/components/BottomNav';

interface JournalEntry {
  id: string;
  entry_date: string;
  mood: number;
  triggers: string[];
  coping_strategies_used: string[];
  gratitude: string;
  notes: string;
  created_at: string;
}

const Journal = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [mood, setMood] = useState(5);
  const [triggers, setTriggers] = useState('');
  const [copingStrategies, setCopingStrategies] = useState('');
  const [gratitude, setGratitude] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadEntries();
    }
  }, [user]);

  const loadEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user!.id)
        .order('entry_date', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error loading entries:', error);
      toast.error('Failed to load journal entries');
    }
  };

  const handleSaveEntry = async () => {
    if (!gratitude && !notes) {
      toast.error('Please add at least gratitude or notes');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('journal_entries')
        .insert({
          user_id: user!.id,
          mood,
          triggers: triggers ? triggers.split(',').map(t => t.trim()) : [],
          coping_strategies_used: copingStrategies ? copingStrategies.split(',').map(s => s.trim()) : [],
          gratitude,
          notes
        });

      if (error) throw error;

      toast.success('Journal entry saved! 📝');
      setShowNewEntry(false);
      resetForm();
      loadEntries();
      checkJournalAchievement();
    } catch (error) {
      console.error('Error saving entry:', error);
      toast.error('Failed to save entry');
    } finally {
      setLoading(false);
    }
  };

  const checkJournalAchievement = async () => {
    const { data: achievements } = await supabase
      .from('achievements')
      .select('id, requirement_value')
      .eq('requirement_type', 'journal_entries');

    const { data: userAchievements } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', user!.id);

    const unlockedIds = userAchievements?.map(ua => ua.achievement_id) || [];
    const entryCount = entries.length + 1;

    for (const ach of achievements || []) {
      if (ach.requirement_value <= entryCount && !unlockedIds.includes(ach.id)) {
        await supabase.from('user_achievements').insert({
          user_id: user!.id,
          achievement_id: ach.id
        });
      }
    }
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Entry deleted');
      loadEntries();
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast.error('Failed to delete entry');
    }
  };

  const resetForm = () => {
    setMood(5);
    setTriggers('');
    setCopingStrategies('');
    setGratitude('');
    setNotes('');
  };

  const getMoodEmoji = (moodValue: number) => {
    if (moodValue <= 2) return '😢';
    if (moodValue <= 4) return '😕';
    if (moodValue <= 6) return '😐';
    if (moodValue <= 8) return '🙂';
    return '😄';
  };

  const getMoodColor = (moodValue: number) => {
    if (moodValue <= 3) return 'text-red-500';
    if (moodValue <= 5) return 'text-orange-500';
    if (moodValue <= 7) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 pb-28">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between gentle-fade-in">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/home')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Recovery Journal</h1>
          </div>
          <Button onClick={() => setShowNewEntry(!showNewEntry)}>
            <Plus className="h-4 w-4 mr-2" />
            New Entry
          </Button>
        </div>

        {showNewEntry && (
          <Card className="gentle-fade-in">
            <CardHeader>
              <CardTitle>New Journal Entry</CardTitle>
              <CardDescription>Reflect on your day and track your progress</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-medium flex items-center justify-between">
                  <span>How are you feeling today?</span>
                  <span className={`text-4xl ${getMoodColor(mood)}`}>
                    {getMoodEmoji(mood)}
                  </span>
                </label>
                <Slider
                  value={[mood]}
                  onValueChange={(value) => setMood(value[0])}
                  min={1}
                  max={10}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Very Low</span>
                  <span>{mood}/10</span>
                  <span>Excellent</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Triggers (comma-separated)</label>
                <Textarea
                  value={triggers}
                  onChange={(e) => setTriggers(e.target.value)}
                  placeholder="Stress, loneliness, boredom..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Coping Strategies Used (comma-separated)</label>
                <Textarea
                  value={copingStrategies}
                  onChange={(e) => setCopingStrategies(e.target.value)}
                  placeholder="Exercise, meditation, called friend..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Gratitude</label>
                <Textarea
                  value={gratitude}
                  onChange={(e) => setGratitude(e.target.value)}
                  placeholder="What are you grateful for today?"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Notes</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional thoughts or reflections..."
                  rows={4}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSaveEntry} disabled={loading} className="flex-1">
                  Save Entry
                </Button>
                <Button variant="outline" onClick={() => setShowNewEntry(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Past Entries */}
        <div className="space-y-4">
          {entries.map((entry) => (
            <Card key={entry.id} className="gentle-fade-in">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      {format(new Date(entry.entry_date), 'MMMM d, yyyy')}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      Mood: <span className={`text-2xl ${getMoodColor(entry.mood)}`}>
                        {getMoodEmoji(entry.mood)} {entry.mood}/10
                      </span>
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteEntry(entry.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {entry.triggers && entry.triggers.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Triggers:</p>
                    <div className="flex flex-wrap gap-2">
                      {entry.triggers.map((trigger, idx) => (
                        <Badge key={idx} variant="secondary">{trigger}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {entry.coping_strategies_used && entry.coping_strategies_used.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Coping Strategies:</p>
                    <div className="flex flex-wrap gap-2">
                      {entry.coping_strategies_used.map((strategy, idx) => (
                        <Badge key={idx} variant="outline">{strategy}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {entry.gratitude && (
                  <div>
                    <p className="text-sm font-medium mb-1">Gratitude:</p>
                    <p className="text-sm text-muted-foreground">{entry.gratitude}</p>
                  </div>
                )}

                {entry.notes && (
                  <div>
                    <p className="text-sm font-medium mb-1">Notes:</p>
                    <p className="text-sm text-muted-foreground">{entry.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {entries.length === 0 && !showNewEntry && (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No journal entries yet. Start your first one!</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Journal;
