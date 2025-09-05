-- Corriger la politique de création d'ads pour bien restreindre à Smart
DROP POLICY IF EXISTS "Seul Smart peut créer des ads" ON public.ads;

CREATE POLICY "Seul Smart peut créer des ads" 
ON public.ads 
FOR INSERT 
WITH CHECK (
  auth.uid() = creator_id AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND (profiles.username = 'smart' OR profiles.display_name = 'Smart')
  )
);

-- S'assurer que les stats (vues et clics) sont bien mises à jour via des triggers
-- Créer une fonction pour mettre à jour les vues
CREATE OR REPLACE FUNCTION public.update_ad_views()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.ads 
  SET views = (
    SELECT COUNT(*) 
    FROM public.ad_clicks 
    WHERE ad_id = NEW.ad_id
  )
  WHERE id = NEW.ad_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Créer une fonction pour mettre à jour les clics
CREATE OR REPLACE FUNCTION public.update_ad_clicks()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.ads 
  SET clicks = (
    SELECT COUNT(*) 
    FROM public.ad_clicks 
    WHERE ad_id = NEW.ad_id
  )
  WHERE id = NEW.ad_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Créer des triggers pour mettre à jour automatiquement les stats
DROP TRIGGER IF EXISTS update_ad_clicks_trigger ON public.ad_clicks;
CREATE TRIGGER update_ad_clicks_trigger
  AFTER INSERT ON public.ad_clicks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_ad_clicks();