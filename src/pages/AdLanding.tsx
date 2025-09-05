import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Eye, MousePointer } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Navigation from '@/components/Navigation';

interface AdLanding {
  id: string;
  title: string;
  landing_title: string;
  landing_description: string;
  landing_images?: string[];
  image_url?: string;
  views: number;
  clicks: number;
  created_at: string;
}

const AdLanding = () => {
  const { adId } = useParams<{ adId: string }>();
  const navigate = useNavigate();
  const [ad, setAd] = useState<AdLanding | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAd = async () => {
      if (!adId) return;

      try {
        const { data, error } = await supabase
          .from('ads')
          .select('id, title, landing_title, landing_description, landing_images, image_url, views, clicks, created_at')
          .eq('id', adId)
          .eq('is_active', true)
          .single();

        if (error) {
          console.error('Error fetching ad:', error);
          toast.error('Publicité non trouvée');
          navigate('/');
          return;
        }

        setAd(data);
      } catch (error) {
        console.error('Error:', error);
        toast.error('Erreur lors du chargement');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchAd();
  }, [adId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!ad) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center min-h-[50vh]">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-destructive">Publicité non trouvée</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={() => navigate('/')}>
                Retour à l'accueil
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
              Contenu sponsorisé
            </Badge>
          </div>
        </div>

        <div className="space-y-8">
          {/* Header avec image principale */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl md:text-3xl font-bold">
                  {ad.landing_title}
                </CardTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{ad.views}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MousePointer className="w-4 h-4" />
                    <span>{ad.clicks}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            {ad.image_url && (
              <CardContent className="pt-4">
                <div className="rounded-lg overflow-hidden">
                  <img 
                    src={ad.image_url} 
                    alt={ad.landing_title}
                    className="w-full h-64 md:h-96 object-cover"
                  />
                </div>
              </CardContent>
            )}
          </Card>

          {/* Contenu principal */}
          <Card>
            <CardContent className="p-8">
              <div className="prose prose-lg max-w-none dark:prose-invert">
                <p className="text-lg leading-relaxed whitespace-pre-wrap">
                  {ad.landing_description}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Images additionnelles */}
          {ad.landing_images && ad.landing_images.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Images</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ad.landing_images.map((imageUrl, index) => (
                    <div key={index} className="rounded-lg overflow-hidden">
                      <img 
                        src={imageUrl} 
                        alt={`${ad.landing_title} - Image ${index + 1}`}
                        className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Call to action */}
          <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800">
            <CardContent className="p-8 text-center">
              <h3 className="text-xl font-semibold mb-4">Intéressé par cette offre ?</h3>
              <p className="text-muted-foreground mb-6">
                Contactez-nous pour plus d'informations ou pour découvrir nos autres services.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700"
                >
                  Nous contacter
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => navigate('/')}
                >
                  Retour au feed
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdLanding;