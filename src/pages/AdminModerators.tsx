import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Shield, Trash2, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

interface Row { id: string; user_id: string; role: string; username?: string | null; full_name?: string | null; }

const AdminModerators = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [userIdInput, setUserIdInput] = useState('');
  const [role, setRole] = useState<'moderator' | 'admin'>('moderator');

  const load = async () => {
    const { data: rolesData } = await supabase
      .from('user_roles')
      .select('id, user_id, role')
      .in('role', ['admin', 'moderator']);
    const userIds = (rolesData ?? []).map((r: any) => r.user_id);
    let profiles: any[] = [];
    if (userIds.length) {
      const { data: p } = await supabase.from('profiles').select('user_id, username, full_name').in('user_id', userIds);
      profiles = p ?? [];
    }
    setRows((rolesData ?? []).map((r: any) => {
      const p = profiles.find(x => x.user_id === r.user_id);
      return { ...r, username: p?.username, full_name: p?.full_name };
    }));
  };

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from('user_roles').select('role').eq('user_id', user.id).eq('role', 'admin');
      const admin = (data ?? []).length > 0;
      setIsAdmin(admin);
      if (admin) await load();
      setLoading(false);
    })();
  }, [user]);

  const addRole = async () => {
    const id = userIdInput.trim();
    if (!id) return;
    const { error } = await (supabase as any).from('user_roles').insert({ user_id: id, role });
    if (error) { toast.error(error.message); return; }
    toast.success('Role granted');
    setUserIdInput('');
    load();
  };

  const removeRole = async (rowId: string) => {
    const { error } = await supabase.from('user_roles').delete().eq('id', rowId);
    if (error) { toast.error(error.message); return; }
    toast.success('Role removed');
    load();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 pb-8 text-center space-y-3">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground" />
            <h1 className="text-xl font-bold">Admins only</h1>
            <Button onClick={() => navigate('/home')}>Go home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 p-6 pb-28">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6" /> Moderator control
          </h1>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">Grant role</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="User ID (uuid)" value={userIdInput} onChange={e => setUserIdInput(e.target.value)} />
            <div className="flex gap-2">
              <Select value={role} onValueChange={(v: any) => setRole(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="moderator">Moderator</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={addRole} className="whitespace-nowrap"><UserPlus className="h-4 w-4 mr-2" /> Grant</Button>
            </div>
            <p className="text-xs text-muted-foreground">Look up the user's ID from your Users backend.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Current staff</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate('/admin/reports')}>Reports</Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/admin/appeals')}>Appeals</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {rows.length === 0 && <p className="text-sm text-muted-foreground">None yet.</p>}
            {rows.map(r => (
              <div key={r.id} className="flex items-center justify-between border rounded-md p-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{r.username || r.full_name || r.user_id}</p>
                  <p className="text-xs text-muted-foreground font-mono truncate">{r.user_id}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={r.role === 'admin' ? 'default' : 'secondary'}>{r.role}</Badge>
                  <Button variant="ghost" size="icon" onClick={() => removeRole(r.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminModerators;
