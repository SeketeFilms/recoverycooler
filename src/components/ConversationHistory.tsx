import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { MessageSquare, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
  addiction_type: string;
}

interface ConversationHistoryProps {
  currentConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
}

const ConversationHistory = ({ currentConversationId, onSelectConversation }: ConversationHistoryProps) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  const loadConversations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  if (conversations.length <= 1) {
    return null; // Don't show if only one or no conversations
  }

  return (
    <Card className="w-64 flex-shrink-0 hidden md:block">
      <div className="p-4 border-b">
        <h3 className="font-semibold flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Past Conversations
        </h3>
      </div>
      <ScrollArea className="h-[calc(100vh-16rem)]">
        <div className="p-2 space-y-2">
          {conversations.map((conv) => (
            <Button
              key={conv.id}
              variant={currentConversationId === conv.id ? 'secondary' : 'ghost'}
              className="w-full justify-start text-left h-auto py-3"
              onClick={() => onSelectConversation(conv.id)}
            >
              <div className="flex flex-col items-start gap-1 w-full">
                <div className="flex items-center gap-2 w-full">
                  <MessageSquare className="h-3 w-3 flex-shrink-0" />
                  <span className="text-xs capitalize truncate">
                    {conv.addiction_type} Recovery
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(conv.updated_at), { addSuffix: true })}
                </div>
              </div>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};

export default ConversationHistory;