import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface RealtimeUser {
  id: string;
  name: string;
  email: string;
  status: 'online' | 'offline';
  joinedAt: string;
  avatar_url?: string;
}

export const useRealtimeUsers = () => {
  const [users, setUsers] = useState<RealtimeUser[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Récupérer les utilisateurs récents
  const fetchRecentUsers = async () => {
    try {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, username, avatar_url, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

      if (profiles) {
        const usersList: RealtimeUser[] = profiles.map(profile => ({
          id: profile.user_id,
          name: profile.display_name || profile.username || 'Utilisateur',
          email: `user${profile.user_id.slice(0, 8)}@example.com`, // Email générique
          status: onlineUsers.includes(profile.user_id) ? 'online' : 'offline',
          joinedAt: profile.created_at,
          avatar_url: profile.avatar_url
        }));
        
        setUsers(usersList);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentUsers();
  }, [onlineUsers]);

  // Système de présence en temps réel
  useEffect(() => {
    const channel = supabase.channel('admin_presence');
    
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const onlineUserIds = Object.keys(state);
        setOnlineUsers(onlineUserIds);
      })
      .on('presence', { event: 'join' }, ({ key }) => {
        setOnlineUsers(prev => [...new Set([...prev, key])]);
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        setOnlineUsers(prev => prev.filter(id => id !== key));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Mettre à jour le statut des utilisateurs quand la liste des utilisateurs en ligne change
  useEffect(() => {
    setUsers(prevUsers => 
      prevUsers.map(user => ({
        ...user,
        status: onlineUsers.includes(user.id) ? 'online' : 'offline'
      }))
    );
  }, [onlineUsers]);

  return { 
    users, 
    onlineUsers, 
    onlineCount: onlineUsers.length, 
    loading, 
    refetch: fetchRecentUsers 
  };
};