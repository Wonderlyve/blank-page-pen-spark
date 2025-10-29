import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ExpertAdviceSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  predictionData: any;
}

export const ExpertAdviceSheet = ({ open, onOpenChange, predictionData }: ExpertAdviceSheetProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Charger l'analyse initiale quand le sheet s'ouvre
  useEffect(() => {
    if (open && messages.length === 0) {
      loadInitialAdvice();
    }
  }, [open]);

  // Auto-scroll vers le bas
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const loadInitialAdvice = async () => {
    setInitialLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('expert-advice', {
        body: {
          messages: [{ role: 'user', content: 'Analyse ce pronostic' }],
          predictionData
        }
      });

      if (error) throw error;

      if (data?.advice) {
        setMessages([{ role: 'assistant', content: data.advice }]);
      }
    } catch (error) {
      console.error('Error loading initial advice:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger l'avis d'expert",
        variant: "destructive",
      });
    } finally {
      setInitialLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('expert-advice', {
        body: {
          messages: newMessages,
          predictionData: null // Ne pas inclure les données de pronostic pour les messages suivants
        }
      });

      if (error) throw error;

      if (data?.advice) {
        setMessages([...newMessages, { role: 'assistant', content: data.advice }]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[80vh] flex flex-col">
        <DrawerHeader className="border-b">
          <DrawerTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            Conseil d'Expert IA
          </DrawerTitle>
        </DrawerHeader>

        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {initialLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
                <p className="text-sm text-muted-foreground">Analyse en cours...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    {message.role === 'assistant' && index === 0 && (
                      <div className="flex items-center gap-2 mb-2 text-sm font-semibold">
                        <Sparkles className="w-4 h-4 text-yellow-500" />
                        Analyse Expert
                      </div>
                    )}
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-3">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        <div className="border-t p-4">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Posez une question à l'expert..."
              className="resize-none min-h-[60px]"
              disabled={isLoading || initialLoading}
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading || initialLoading}
              size="icon"
              className="h-[60px] w-[60px] shrink-0"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
