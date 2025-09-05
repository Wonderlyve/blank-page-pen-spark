import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Image, ExternalLink, Eye, MousePointer, Trash2, Power } from 'lucide-react';
import { useAds } from '@/hooks/useAds';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Navigation from '@/components/Navigation';

const Ads = () => {
  const { ads, loading, createAd, updateAdStatus, fetchMyAds } = useAds();
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    button_text: '',
    button_action: 'landing' as 'landing' | 'external',
    external_url: '',
    landing_title: '',
    landing_description: '',
    image_file: null as File | null,
    landing_image_files: [] as File[]
  });

  // Vérifier si l'utilisateur est Smart (aligné avec les politiques RLS)
  const [isSmartUser, setIsSmartUser] = React.useState(false);

  React.useEffect(() => {
    const checkSmartUser = async () => {
      if (!user) return;
      
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, display_name')
          .eq('user_id', user.id)
          .single();
        
        const isSmartByProfile = profile?.username === 'smart' || profile?.display_name === 'Smart';
        const isSmartByEmail = user?.email === 'smart@example.com';
        
        setIsSmartUser(isSmartByProfile || isSmartByEmail);
      } catch (error) {
        console.error('Error checking Smart user:', error);
      }
    };

    checkSmartUser();
  }, [user]);

  React.useEffect(() => {
    if (isSmartUser) {
      fetchMyAds();
    }
  }, [isSmartUser, fetchMyAds]);

  if (!isSmartUser) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center min-h-[50vh]">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-red-600">Accès non autorisé</CardTitle>
              <CardDescription>
                Cette page est réservée aux utilisateurs Smart.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.button_text) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (formData.button_action === 'external' && !formData.external_url) {
      toast.error('Veuillez fournir une URL pour "Visiter notre site"');
      return;
    }

    if (formData.button_action === 'landing' && (!formData.landing_title || !formData.landing_description)) {
      toast.error('Veuillez remplir le titre et la description de la page de destination');
      return;
    }

    setIsCreating(true);
    await createAd(formData);
    
    // Reset form
    setFormData({
      title: '',
      description: '',
      button_text: '',
      button_action: 'landing',
      external_url: '',
      landing_title: '',
      landing_description: '',
      image_file: null,
      landing_image_files: []
    });
    
    setIsCreating(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, image_file: e.target.files[0] });
    }
  };

  const handleLandingImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData({ ...formData, landing_image_files: Array.from(e.target.files) });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Gestion des Publicités</h1>
          <p className="text-muted-foreground">Créez et gérez vos publicités natives</p>
        </div>

        <Tabs defaultValue="create" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">Créer une publicité</TabsTrigger>
            <TabsTrigger value="manage">Gérer mes publicités</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Créer une nouvelle publicité
                </CardTitle>
                <CardDescription>
                  Les publicités apparaîtront comme des publications natives dans le feed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title">Titre de la publicité *</Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          placeholder="Titre accrocheur..."
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="description">Description *</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="Description courte qui apparaîtra dans le feed..."
                          rows={3}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="button_text">Texte du bouton *</Label>
                        <Input
                          id="button_text"
                          value={formData.button_text}
                          onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                          placeholder="ex: Voir plus, Visiter notre site..."
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="button_action">Action du bouton</Label>
                        <Select
                          value={formData.button_action}
                          onValueChange={(value: 'landing' | 'external') => 
                            setFormData({ ...formData, button_action: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="landing">Page de destination (landing)</SelectItem>
                            <SelectItem value="external">Site externe</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="main_image">Image principale</Label>
                        <Input
                          id="main_image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      {formData.button_action === 'external' ? (
                        <div>
                          <Label htmlFor="external_url">URL du site externe *</Label>
                          <Input
                            id="external_url"
                            type="url"
                            value={formData.external_url}
                            onChange={(e) => setFormData({ ...formData, external_url: e.target.value })}
                            placeholder="https://example.com"
                            required
                          />
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="landing_title">Titre de la page de destination *</Label>
                            <Input
                              id="landing_title"
                              value={formData.landing_title}
                              onChange={(e) => setFormData({ ...formData, landing_title: e.target.value })}
                              placeholder="Titre détaillé du produit/service..."
                              required
                            />
                          </div>

                          <div>
                            <Label htmlFor="landing_description">Description détaillée *</Label>
                            <Textarea
                              id="landing_description"
                              value={formData.landing_description}
                              onChange={(e) => setFormData({ ...formData, landing_description: e.target.value })}
                              placeholder="Description complète du produit/service, avantages, caractéristiques..."
                              rows={4}
                              required
                            />
                          </div>

                          <div>
                            <Label htmlFor="landing_images">Images additionnelles pour la landing</Label>
                            <Input
                              id="landing_images"
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handleLandingImagesChange}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Vous pouvez sélectionner plusieurs images
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isCreating}
                    className="w-full md:w-auto"
                  >
                    {isCreating ? 'Création...' : 'Créer la publicité'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manage" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Mes publicités</CardTitle>
                <CardDescription>
                  Gérez vos publicités existantes et consultez les statistiques
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Chargement...</p>
                  </div>
                ) : ads.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Aucune publicité créée</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {ads.map((ad) => (
                      <Card key={ad.id} className="border-l-4 border-l-primary">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold">{ad.title}</h3>
                                <Badge variant={ad.is_active ? "default" : "secondary"}>
                                  {ad.is_active ? "Active" : "Inactive"}
                                </Badge>
                              </div>
                              <p className="text-muted-foreground text-sm mb-3">{ad.description}</p>
                              
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Eye className="w-4 h-4" />
                                  {ad.views} vues
                                </div>
                                <div className="flex items-center gap-1">
                                  <MousePointer className="w-4 h-4" />
                                  {ad.clicks} clics
                                </div>
                                <div className="flex items-center gap-1">
                                  {ad.button_action === 'external' ? (
                                    <ExternalLink className="w-4 h-4" />
                                  ) : (
                                    <Image className="w-4 h-4" />
                                  )}
                                  {ad.button_text}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateAdStatus(ad.id, !ad.is_active)}
                              >
                                <Power className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Ads;