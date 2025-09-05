-- Mettre à jour le profil de l'utilisateur padmin@pendor.com pour lui donner accès aux publicités
UPDATE public.profiles 
SET display_name = 'Smart'
WHERE user_id = 'f33e9489-a009-4104-8461-d4a39de30293';