import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { Send, Bot, User, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import ConversationHistory from './ConversationHistory';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIChatProps {
  showHistory?: boolean;
}

const AIChat = ({ showHistory = true }: AIChatProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [addictionType, setAddictionType] = useState<string>('gambling');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  useEffect(() => {
    if (user) {
      loadOrCreateConversation();
    }
  }, [user]);

  // Auto-scroll only when new messages arrive and user hasn't scrolled up
  useEffect(() => {
    if (shouldAutoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, shouldAutoScroll]);

  const loadOrCreateConversation = async () => {
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('addiction_type')
        .eq('user_id', user.id)
        .single();

      const userAddictionType = profile?.addiction_type || 'gambling';
      setAddictionType(userAddictionType);

      const { data: conversations } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('user_id', user.id)
        .eq('addiction_type', userAddictionType)
        .order('updated_at', { ascending: false })
        .limit(1);

      let convId: string;

      if (conversations && conversations.length > 0) {
        convId = conversations[0].id;
        const { data: existingMessages } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('conversation_id', convId)
          .order('created_at', { ascending: true });

        if (existingMessages && existingMessages.length > 0) {
          setMessages(existingMessages.map(msg => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content
          })));
        } else {
          const welcomeMessage = {
            role: 'assistant' as const,
            content: "Hi, I'm here to support you 24/7. Whether you're experiencing cravings, need motivation, or just want to talk, I'm here. How can I help you today?"
          };
          setMessages([welcomeMessage]);
          await supabase.from('chat_messages').insert({
            conversation_id: convId,
            role: 'assistant',
            content: welcomeMessage.content
          });
        }
      } else {
        const { data: newConv, error } = await supabase
          .from('chat_conversations')
          .insert({
            user_id: user.id,
            addiction_type: userAddictionType
          })
          .select()
          .single();

        if (error) throw error;
        convId = newConv.id;

        const welcomeMessage = {
          role: 'assistant' as const,
          content: "Hi, I'm here to support you 24/7. Whether you're experiencing cravings, need motivation, or just want to talk, I'm here. How can I help you today?"
        };
        setMessages([welcomeMessage]);
        await supabase.from('chat_messages').insert({
          conversation_id: convId,
          role: 'assistant',
          content: welcomeMessage.content
        });
      }

      setConversationId(convId);
      setShouldAutoScroll(true);
    } catch (error) {
      console.error('Error loading conversation:', error);
      toast.error('Failed to load chat history');
    }
  };

  const loadConversation = async (convId: string) => {
    try {
      setIsLoading(true);
      
      const { data: existingMessages, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (existingMessages && existingMessages.length > 0) {
        setMessages(existingMessages.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        })));
      }
      
      setConversationId(convId);
      setShouldAutoScroll(true);
    } catch (error) {
      console.error('Error loading conversation:', error);
      toast.error('Failed to load conversation');
    } finally {
      setIsLoading(false);
    }
  };

  const startNewConversation = async () => {
    if (!user) return;
    
    try {
      const { data: newConv, error } = await supabase
        .from('chat_conversations')
        .insert({
          user_id: user.id,
          addiction_type: addictionType
        })
        .select()
        .single();

      if (error) throw error;

      const welcomeMessage = {
        role: 'assistant' as const,
        content: "Hi, I'm here to support you 24/7. Whether you're experiencing cravings, need motivation, or just want to talk, I'm here. How can I help you today?"
      };
      
      setMessages([welcomeMessage]);
      setConversationId(newConv.id);

      await supabase.from('chat_messages').insert({
        conversation_id: newConv.id,
        role: 'assistant',
        content: welcomeMessage.content
      });

      setShouldAutoScroll(true);
      toast.success('Started new conversation');
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error('Failed to start new conversation');
    }
  };

  const handleScroll = () => {
    if (scrollAreaRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShouldAutoScroll(isNearBottom);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading || !conversationId) return;

    const userMessage = input.trim();
    setInput('');
    const newUserMsg = { role: 'user' as const, content: userMessage };
    setMessages(prev => [...prev, newUserMsg]);
    setIsLoading(true);

    try {
      await supabase.from('chat_messages').insert({
        conversation_id: conversationId,
        role: 'user',
        content: userMessage
      });

      await supabase
        .from('chat_conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

      const { data, error } = await supabase.functions.invoke('ai-recovery-chat', {
        body: { 
          messages: [...messages, newUserMsg],
          addictionType
        }
      });

      if (error) throw error;

      if (data?.message) {
        const assistantMsg = { role: 'assistant' as const, content: data.message };
        setMessages(prev => [...prev, assistantMsg]);

        await supabase.from('chat_messages').insert({
          conversation_id: conversationId,
          role: 'assistant',
          content: data.message
        });
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to send message. Please try again.');
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex gap-4 h-full w-full">
      {showHistory && (
        <ConversationHistory
          currentConversationId={conversationId}
          onSelectConversation={loadConversation}
        />
      )}
      
      <Card className="flex flex-col h-full max-h-[calc(100vh-12rem)] flex-1">
        <CardHeader className="border-b flex-shrink-0">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              24/7 Recovery Assistant
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={startNewConversation}
              className="text-xs"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              New Chat
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
          <div 
            className="flex-1 overflow-y-auto"
            ref={scrollAreaRef}
            onScroll={handleScroll}
          >
            <div className="p-4 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  </div>
                  {message.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-accent-foreground" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="bg-muted rounded-2xl px-4 py-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
          <div className="p-4 border-t flex-shrink-0 bg-background">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Share what's on your mind..."
                className="min-h-[60px] resize-none"
                disabled={isLoading}
              />
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="h-[60px] w-[60px] flex-shrink-0"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIChat;