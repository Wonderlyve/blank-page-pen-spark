import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface Ad {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  button_text: string;
  button_action: 'landing' | 'external';
  external_url?: string;
  landing_title?: string;
  landing_description?: string;
  landing_images?: string[];
  image_url?: string;
  is_active: boolean;
  views: number;
  clicks: number;
  created_at: string;
  updated_at: string;
}

export const useAds = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchAds = async () => {
    try {
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching ads:', error);
        toast.error('Erreur lors du chargement des publicités');
        return;
      }

      const transformedAds = data?.map((ad: any) => ({
        ...ad,
        button_action: ad.button_action as 'landing' | 'external'
      })) || [];

      setAds(transformedAds);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors du chargement des publicités');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyAds = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching my ads:', error);
        toast.error('Erreur lors du chargement de vos publicités');
        return;
      }

      const transformedAds = data?.map((ad: any) => ({
        ...ad,
        button_action: ad.button_action as 'landing' | 'external'
      })) || [];

      setAds(transformedAds);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors du chargement de vos publicités');
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file: File, bucket: string): Promise<string | null> => {
    if (!user) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast.error('Erreur lors de l\'upload du fichier');
        return null;
      }

      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Erreur lors de l\'upload du fichier');
      return null;
    }
  };

  const createAd = async (adData: {
    title: string;
    description: string;
    button_text: string;
    button_action: 'landing' | 'external';
    external_url?: string;
    landing_title?: string;
    landing_description?: string;
    image_file?: File;
    landing_image_files?: File[];
  }) => {
    if (!user) {
      toast.error('Vous devez être connecté pour créer une publicité');
      return null;
    }

    try {
      let image_url = null;
      let landing_images: string[] = [];

      // Upload main image if provided
      if (adData.image_file) {
        image_url = await uploadFile(adData.image_file, 'post-images');
      }

      // Upload landing images if provided
      if (adData.landing_image_files && adData.landing_image_files.length > 0) {
        const uploadPromises = adData.landing_image_files.map(file => 
          uploadFile(file, 'post-images')
        );
        const results = await Promise.all(uploadPromises);
        landing_images = results.filter(url => url !== null) as string[];
      }

      const { data, error } = await supabase
        .from('ads')
        .insert({
          creator_id: user.id,
          title: adData.title,
          description: adData.description,
          button_text: adData.button_text,
          button_action: adData.button_action,
          external_url: adData.external_url,
          landing_title: adData.landing_title,
          landing_description: adData.landing_description,
          image_url,
          landing_images: landing_images.length > 0 ? landing_images : null,
          is_active: true,
          views: 0,
          clicks: 0
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating ad:', error);
        toast.error('Erreur lors de la création de la publicité');
        return null;
      }

      toast.success('Publicité créée avec succès !');
      fetchMyAds();
      return data;
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors de la création de la publicité');
      return null;
    }
  };

  const updateAdStatus = async (adId: string, isActive: boolean) => {
    if (!user) {
      toast.error('Vous devez être connecté');
      return;
    }

    try {
      const { error } = await supabase
        .from('ads')
        .update({ is_active: isActive })
        .eq('id', adId)
        .eq('creator_id', user.id);

      if (error) {
        console.error('Error updating ad status:', error);
        toast.error('Erreur lors de la mise à jour');
        return;
      }

      toast.success(`Publicité ${isActive ? 'activée' : 'désactivée'} avec succès`);
      fetchMyAds();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const recordAdClick = async (adId: string) => {
    try {
      // Enregistrer le clic (qui va trigger automatiquement la mise à jour des stats)
      const { error } = await supabase
        .from('ad_clicks')
        .insert({
          ad_id: adId,
          user_id: user?.id || null
        });

      if (error) {
        console.error('Error recording ad click:', error);
      }

      // Mettre à jour le count local pour une UX immédiate
      setAds(prevAds => 
        prevAds.map(ad => 
          ad.id === adId 
            ? { ...ad, clicks: ad.clicks + 1 }
            : ad
        )
      );
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  return {
    ads,
    loading,
    createAd,
    updateAdStatus,
    recordAdClick,
    fetchMyAds,
    refetch: fetchAds
  };
};