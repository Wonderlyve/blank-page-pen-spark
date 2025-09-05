import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AdminStats {
  totalUsers: number;
  onlineUsers: number;
  activeToday: number;
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
}

export const useAdminStats = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    onlineUsers: 0,
    activeToday: 0,
    totalPosts: 0,
    totalLikes: 0,
    totalComments: 0,
    totalShares: 0
  });
  
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      // Récupérer le nombre total d'utilisateurs
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Récupérer le nombre total de posts
      const { count: totalPosts } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true });

      // Récupérer le nombre total de likes
      const { count: totalLikes } = await supabase
        .from('post_likes')
        .select('*', { count: 'exact', head: true });

      // Récupérer le nombre total de commentaires
      const { count: totalComments } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true });

      // Calculer les utilisateurs actifs aujourd'hui (ayant créé un post ou commentaire aujourd'hui)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data: activeTodayData } = await supabase
        .from('posts')
        .select('user_id')
        .gte('created_at', today.toISOString());

      const { data: activeCommentsData } = await supabase
        .from('comments')
        .select('user_id')
        .gte('created_at', today.toISOString());

      const activeUserIds = new Set([
        ...(activeTodayData || []).map(p => p.user_id),
        ...(activeCommentsData || []).map(c => c.user_id)
      ]);

      // Récupérer les partages (on peut utiliser les boosts comme proxy)
      const { count: totalShares } = await supabase
        .from('post_boosts')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalUsers: totalUsers || 0,
        onlineUsers: 0, // Sera mis à jour par le système de présence
        activeToday: activeUserIds.size,
        totalPosts: totalPosts || 0,
        totalLikes: totalLikes || 0,
        totalComments: totalComments || 0,
        totalShares: totalShares || 0
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, loading, refetch: fetchStats, setStats };
};