-- Créer la table pour les publicités natives
CREATE TABLE public.ads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  button_text TEXT NOT NULL, -- "Voir plus" ou "Visiter notre site"
  button_action TEXT NOT NULL CHECK (button_action IN ('landing', 'external')),
  external_url TEXT, -- URL pour "Visiter notre site"
  landing_title TEXT, -- Titre pour la landing page
  landing_description TEXT, -- Description détaillée pour la landing page
  landing_images TEXT[], -- URLs des images pour la landing page
  image_url TEXT, -- Image principale de l'ad
  is_active BOOLEAN NOT NULL DEFAULT true,
  views INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;

-- Policies pour les ads
CREATE POLICY "Ads sont visibles par tous" 
ON public.ads 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Seul Smart peut créer des ads" 
ON public.ads 
FOR INSERT 
WITH CHECK (
  auth.uid() = creator_id AND 
  (auth.email() = 'smart@example.com' OR 
   (auth.jwt() ->> 'user_metadata')::jsonb ->> 'display_name' = 'Smart')
);

CREATE POLICY "Seul Smart peut modifier ses ads" 
ON public.ads 
FOR UPDATE 
USING (
  auth.uid() = creator_id AND 
  (auth.email() = 'smart@example.com' OR 
   (auth.jwt() ->> 'user_metadata')::jsonb ->> 'display_name' = 'Smart')
);

CREATE POLICY "Seul Smart peut supprimer ses ads" 
ON public.ads 
FOR DELETE 
USING (
  auth.uid() = creator_id AND 
  (auth.email() = 'smart@example.com' OR 
   (auth.jwt() ->> 'user_metadata')::jsonb ->> 'display_name' = 'Smart')
);

-- Créer la table pour les clics sur les ads
CREATE TABLE public.ad_clicks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ad_id UUID NOT NULL,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS pour ad_clicks
ALTER TABLE public.ad_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tout le monde peut enregistrer des clics" 
ON public.ad_clicks 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Seul Smart peut voir les clics" 
ON public.ad_clicks 
FOR SELECT 
USING (
  auth.email() = 'smart@example.com' OR 
  (auth.jwt() ->> 'user_metadata')::jsonb ->> 'display_name' = 'Smart'
);

-- Trigger pour incrémenter les vues d'ads
CREATE OR REPLACE FUNCTION public.increment_ad_views()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.ads 
  SET views = views + 1 
  WHERE id = NEW.ad_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour incrémenter les clics d'ads
CREATE OR REPLACE FUNCTION public.increment_ad_clicks()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.ads 
  SET clicks = clicks + 1 
  WHERE id = NEW.ad_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer les triggers
CREATE TRIGGER trigger_increment_ad_clicks
  AFTER INSERT ON public.ad_clicks
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_ad_clicks();

-- Trigger pour updated_at
CREATE TRIGGER update_ads_updated_at
  BEFORE UPDATE ON public.ads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();