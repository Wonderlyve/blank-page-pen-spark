-- Ajouter les colonnes manquantes à la table vip_pronos pour supporter les paris multiples
ALTER TABLE public.vip_pronos 
ADD COLUMN IF NOT EXISTS bet_type text DEFAULT 'simple',
ADD COLUMN IF NOT EXISTS matches_data text,
ADD COLUMN IF NOT EXISTS match_teams text,
ADD COLUMN IF NOT EXISTS sport text;