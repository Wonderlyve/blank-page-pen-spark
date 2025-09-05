-- Corriger les politiques RLS pour éviter l'utilisation de user_metadata
-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Seul Smart peut créer des ads" ON public.ads;
DROP POLICY IF EXISTS "Seul Smart peut modifier ses ads" ON public.ads;
DROP POLICY IF EXISTS "Seul Smart peut supprimer ses ads" ON public.ads;
DROP POLICY IF EXISTS "Seul Smart peut voir les clics" ON public.ad_clicks;

-- Créer de nouvelles politiques sécurisées utilisant la table profiles
CREATE POLICY "Seul Smart peut créer des ads" 
ON public.ads 
FOR INSERT 
WITH CHECK (
  auth.uid() = creator_id AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND (username = 'smart' OR display_name = 'Smart')
  )
);

CREATE POLICY "Seul Smart peut modifier ses ads" 
ON public.ads 
FOR UPDATE 
USING (
  auth.uid() = creator_id AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND (username = 'smart' OR display_name = 'Smart')
  )
);

CREATE POLICY "Seul Smart peut supprimer ses ads" 
ON public.ads 
FOR DELETE 
USING (
  auth.uid() = creator_id AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND (username = 'smart' OR display_name = 'Smart')
  )
);

CREATE POLICY "Seul Smart peut voir les clics" 
ON public.ad_clicks 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND (username = 'smart' OR display_name = 'Smart')
  )
);