import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Mail, User, Clock, CheckCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface Message {
  id: string;
  created_at: string;
  sender_type: string;
  sender_name: string;
  message_content: string;
  message_type: string;
  read_status: boolean;
  is_template_used: boolean;
  template_name: string | null;
}

interface QuoteCommunicationLogProps {
  quoteId: string;
}

export const QuoteCommunicationLog = ({ quoteId }: QuoteCommunicationLogProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMessages();
  }, [quoteId]);

  const loadMessages = async () => {
    setIsLoading(true);
    try {
      // Get or create message thread
      let { data: thread, error: threadError } = await supabase
        .from('message_threads')
        .select('id')
        .eq('quote_request_id', quoteId)
        .single();

      if (threadError && threadError.code === 'PGRST116') {
        // Thread doesn't exist, create it
        const { data: newThread, error: createError } = await supabase
          .from('message_threads')
          .insert({
            quote_request_id: quoteId,
            subject: 'Quote Communication'
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating thread:', createError);
          return;
        }
        thread = newThread;
      }

      if (!thread) return;

      // Load messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('thread_id', thread.id)
        .order('created_at', { ascending: true });

      if (messagesError) {
        console.error('Error loading messages:', messagesError);
        return;
      }

      setMessages(messagesData || []);
    } catch (error) {
      console.error('Error in loadMessages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Communication History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Loading messages...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Communication History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {messages.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No messages yet
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div key={message.id}>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${
                      message.sender_type === 'admin' 
                        ? 'bg-primary/10 text-primary' 
                        : 'bg-muted'
                    }`}>
                      {message.sender_type === 'admin' ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Mail className="h-4 w-4" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{message.sender_name}</span>
                          {message.sender_type === 'admin' && (
                            <Badge variant="secondary" className="text-xs">
                              Admin
                            </Badge>
                          )}
                          {message.is_template_used && (
                            <Badge variant="outline" className="text-xs">
                              Template: {message.template_name}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                        </div>
                      </div>
                      
                      <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                        {message.message_content}
                      </div>
                      
                      {message.read_status && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                          <CheckCheck className="h-3 w-3" />
                          Read
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {index < messages.length - 1 && <Separator className="my-4" />}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
