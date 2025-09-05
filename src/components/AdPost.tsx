import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, MousePointer, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAds } from '@/hooks/useAds';
import { supabase } from '@/integrations/supabase/client';
import React from 'react';

interface AdPostProps {
  ad: {
    id: string;
    title: string;
    description: string;
    button_text: string;
    button_action: 'landing' | 'external';
    external_url?: string;
    image_url?: string;
    views: number;
    clicks: number;
    created_at: string;
  };
}

const AdPost = ({ ad }: AdPostProps) => {
  const navigate = useNavigate();
  const { recordAdClick } = useAds();

  // Tracker la vue de la publicité
  React.useEffect(() => {
    const recordAdView = async () => {
      try {
        await supabase
          .from('ads')
          .update({ views: ad.views + 1 })
          .eq('id', ad.id);
      } catch (error) {
        console.error('Error recording ad view:', error);
      }
    };

    recordAdView();
  }, [ad.id, ad.views]);

  const handleButtonClick = async () => {
    // Enregistrer le clic
    await recordAdClick(ad.id);

    if (ad.button_action === 'external' && ad.external_url) {
      // Ouvrir le site externe
      window.open(ad.external_url, '_blank');
    } else {
      // Naviguer vers la page landing
      navigate(`/ad-landing/${ad.id}`);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'À l\'instant';
    } else if (diffInHours < 24) {
      return `Il y a ${diffInHours}h`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `Il y a ${diffInDays}j`;
    }
  };

  return (
    <Card className="w-full mb-4 relative overflow-hidden bg-gradient-to-r from-yellow-50/30 to-transparent dark:from-yellow-900/10">
      <div className="absolute top-3 right-3">
        <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
          Sponsorisé
        </Badge>
      </div>
      
      <CardContent className="p-4 space-y-4">
        <div className="flex items-start gap-4">
          {/* Avatar/Logo pour les pubs */}
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-lg">📢</span>
          </div>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium">Publicité</span>
              <span>•</span>
              <span>{formatTimeAgo(ad.created_at)}</span>
            </div>
            
            <h2 className="font-semibold text-lg text-foreground leading-tight">
              {ad.title}
            </h2>
            
            <p className="text-muted-foreground text-sm leading-relaxed">
              {ad.description}
            </p>
          </div>
        </div>

        {/* Image principale si présente */}
        {ad.image_url && (
          <div className="rounded-lg overflow-hidden">
            <img 
              src={ad.image_url} 
              alt={ad.title}
              className="w-full h-64 object-cover"
            />
          </div>
        )}

        {/* Bouton d'action */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>{ad.views}</span>
            </div>
            <div className="flex items-center gap-1">
              <MousePointer className="w-3 h-3" />
              <span>{ad.clicks}</span>
            </div>
          </div>
          
          <Button 
            onClick={handleButtonClick}
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white border-0"
            size="sm"
          >
            <span className="mr-1">{ad.button_text}</span>
            {ad.button_action === 'external' && (
              <ExternalLink className="w-3 h-3 ml-1" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdPost;