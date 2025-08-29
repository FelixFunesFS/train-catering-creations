import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Send, Mail, Phone, Clock, Eye, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface CommunicationPanelProps {
  quoteId: string;
  customerName: string;
  customerEmail: string;
}

interface MessageThread {
  id: string;
  subject: string;
  last_message_at: string;
  is_active: boolean;
}

interface Message {
  id: string;
  sender_type: string;
  sender_name: string;
  sender_email: string;
  message_content: string;
  message_type: string;
  read_status: boolean;
  template_name?: string;
  created_at: string;
}

const MESSAGE_TEMPLATES = [
  {
    name: 'initial_response',
    subject: 'Thank you for your catering inquiry',
    content: `Thank you for reaching out to Soul Train's Eatery! We're excited about the opportunity to cater your event.

We've received your request and will review the details. Our team will get back to you within 24 hours with a custom quote and next steps.

In the meantime, feel free to reach out if you have any questions.

Best regards,
Soul Train's Eatery Team
(843) 970-0265`
  },
  {
    name: 'quote_ready',
    subject: 'Your custom catering quote is ready',
    content: `Great news! Your custom catering quote is ready for review.

We've carefully reviewed your event details and prepared a personalized proposal that includes menu options, pricing, and logistics.

Please let us know if you'd like to schedule a call to discuss the details or if you have any questions.

Looking forward to serving you!

Soul Train's Eatery Team`
  },
  {
    name: 'follow_up',
    subject: 'Following up on your catering request',
    content: `Hi! We wanted to follow up on your catering inquiry from a few days ago.

We understand that planning an event involves many decisions, and we're here to help make the catering aspect as smooth as possible.

Is there anything specific you'd like to discuss about your event or our services?

We're here when you're ready!

Soul Train's Eatery Team`
  }
];

export function CommunicationPanel({ quoteId, customerName, customerEmail }: CommunicationPanelProps) {
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [messageSubject, setMessageSubject] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchThreads();
  }, [quoteId]);

  useEffect(() => {
    if (activeThread) {
      fetchMessages(activeThread);
    }
  }, [activeThread]);

  const fetchThreads = async () => {
    try {
      const { data, error } = await supabase
        .from('message_threads')
        .select('*')
        .eq('quote_request_id', quoteId)
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      setThreads(data || []);
      
      if (data && data.length > 0) {
        setActiveThread(data[0].id);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load messages: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (threadId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load messages: " + error.message,
        variant: "destructive"
      });
    }
  };

  const createNewThread = async () => {
    if (!messageSubject.trim()) {
      toast({
        title: "Error",
        description: "Please enter a subject for the new conversation",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('message_threads')
        .insert({
          quote_request_id: quoteId,
          subject: messageSubject.trim()
        })
        .select()
        .single();

      if (error) throw error;

      setThreads(prev => [data, ...prev]);
      setActiveThread(data.id);
      setMessageSubject('');
      
      toast({
        title: "Success",
        description: "New conversation started"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to create thread: " + error.message,
        variant: "destructive"
      });
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeThread) return;

    setSending(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          thread_id: activeThread,
          sender_type: 'admin',
          sender_name: 'Soul Train\'s Eatery',
          sender_email: 'soultrainseatery@gmail.com',
          message_content: newMessage.trim(),
          message_type: 'text',
          template_name: selectedTemplate || null
        })
        .select()
        .single();

      if (error) throw error;

      setMessages(prev => [...prev, data]);
      setNewMessage('');
      setSelectedTemplate('');
      
      toast({
        title: "Success",
        description: "Message sent successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to send message: " + error.message,
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  const applyTemplate = (templateName: string) => {
    const template = MESSAGE_TEMPLATES.find(t => t.name === templateName);
    if (template) {
      setNewMessage(template.content);
      setSelectedTemplate(templateName);
      if (!messageSubject && !activeThread) {
        setMessageSubject(template.subject);
      }
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading messages...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header with customer info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Customer Communication
            </div>
            <div className="flex items-center gap-2 text-sm font-normal">
              <User className="h-4 w-4" />
              {customerName} ({customerEmail})
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Thread List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Conversations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* New Thread */}
            <div className="space-y-2 p-3 border rounded-lg">
              <Input
                placeholder="Subject for new conversation..."
                value={messageSubject}
                onChange={(e) => setMessageSubject(e.target.value)}
              />
              <Button 
                onClick={createNewThread} 
                size="sm" 
                className="w-full"
                disabled={!messageSubject.trim()}
              >
                Start New Conversation
              </Button>
            </div>

            {/* Existing Threads */}
            {threads.map((thread) => (
              <Card 
                key={thread.id} 
                className={`cursor-pointer transition-colors ${
                  activeThread === thread.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'
                }`}
                onClick={() => setActiveThread(thread.id)}
              >
                <CardContent className="p-3">
                  <div className="space-y-1">
                    <div className="font-medium text-sm truncate">{thread.subject}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(thread.last_message_at), { addSuffix: true })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {threads.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No conversations yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Messages and Compose */}
        <div className="lg:col-span-2 space-y-4">
          {/* Template Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Message Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {MESSAGE_TEMPLATES.map((template) => (
                  <Button
                    key={template.name}
                    variant="outline"
                    size="sm"
                    onClick={() => applyTemplate(template.name)}
                    className="text-left justify-start"
                  >
                    {template.subject}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Messages */}
          {activeThread && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {threads.find(t => t.id === activeThread)?.subject}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="max-h-96 overflow-y-auto space-y-3">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender_type === 'admin' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.sender_type === 'admin'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <div className="text-sm font-medium mb-1">
                          {message.sender_name}
                        </div>
                        <div className="text-sm whitespace-pre-wrap">
                          {message.message_content}
                        </div>
                        <div className="text-xs mt-2 opacity-70">
                          {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                          {message.template_name && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              Template: {message.template_name}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Compose Message */}
                <div className="space-y-3 border-t pt-4">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    rows={4}
                  />
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Will be sent via email
                      </span>
                    </div>
                    <Button 
                      onClick={sendMessage} 
                      disabled={!newMessage.trim() || sending}
                      className="flex items-center gap-2"
                    >
                      <Send className="h-4 w-4" />
                      {sending ? 'Sending...' : 'Send Message'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {!activeThread && threads.length > 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Select a conversation to view messages</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
