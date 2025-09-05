import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useUserPresence = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel('admin_presence');
    
    // Rejoindre le channel de présence
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        // Marquer l'utilisateur comme en ligne
        await channel.track({
          user_id: user.id,
          online_at: new Date().toISOString(),
        });
      }
    });

    // Nettoyer la présence quand l'utilisateur quitte
    const handleBeforeUnload = () => {
      channel.untrack();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      supabase.removeChannel(channel);
    };
  }, [user]);
};