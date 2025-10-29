import { useState } from 'react';
import Navbar from '@/components/Navbar';
import BottomNavigation from '@/components/BottomNavigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Loader2, Sparkles, Plus, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Match {
  id: string;
  description: string;
}

const Expert = () => {
  const [matches, setMatches] = useState<Match[]>([{ id: '1', description: '' }]);
  const [analysis, setAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const addMatch = () => {
    setMatches([...matches, { id: Date.now().toString(), description: '' }]);
  };

  const removeMatch = (id: string) => {
    if (matches.length > 1) {
      setMatches(matches.filter(m => m.id !== id));
    }
  };

  const updateMatch = (id: string, description: string) => {
    setMatches(matches.map(m => m.id === id ? { ...m, description } : m));
  };

  const getExpertAdvice = async () => {
    const filledMatches = matches.filter(m => m.description.trim());
    
    if (filledMatches.length === 0) {
      toast.error('Veuillez entrer au moins un match');
      return;
    }

    setIsLoading(true);
    setAnalysis('');

    try {
      const { data, error } = await supabase.functions.invoke('expert-composition', {
        body: { matches: filledMatches }
      });

      if (error) {
        if (error.message?.includes('Rate limits')) {
          toast.error('Limite de requêtes atteinte, réessayez plus tard.');
        } else if (error.message?.includes('Payment required')) {
          toast.error('Crédits insuffisants pour l\'IA.');
        } else {
          toast.error('Erreur lors de l\'analyse');
        }
        console.error('Error:', error);
        return;
      }

      if (data?.advice) {
        setAnalysis(data.advice);
      }
    } catch (error: any) {
      console.error('Error getting expert advice:', error);
      toast.error('Erreur lors de l\'analyse');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Expert IA</h1>
          </div>
          <p className="text-muted-foreground">
            Entrez vos matchs pour recevoir une analyse experte et des suggestions de composition
          </p>
        </div>

        <Card className="p-6 mb-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Vos matchs</h2>
              <Button
                onClick={addMatch}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Ajouter un match
              </Button>
            </div>

            {matches.map((match, index) => (
              <div key={match.id} className="flex gap-2 items-start">
                <div className="flex-1">
                  <Textarea
                    placeholder={`Match ${index + 1}: Ex: PSG vs OM - 1X2 - Victoire PSG à 1.80`}
                    value={match.description}
                    onChange={(e) => updateMatch(match.id, e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
                {matches.length > 1 && (
                  <Button
                    onClick={() => removeMatch(match.id)}
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}

            <Button
              onClick={getExpertAdvice}
              disabled={isLoading}
              className="w-full gap-2"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyse en cours...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Obtenir l'avis d'expert
                </>
              )}
            </Button>
          </div>
        </Card>

        {analysis && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Analyse de l'expert IA
            </h2>
            <ScrollArea className="h-[400px] pr-4">
              <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                {analysis}
              </div>
            </ScrollArea>
          </Card>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Expert;
