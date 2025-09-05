import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface TopPost {
  id: string;
  author: string;
  content: string;
  likes: number;
  comments: number;
  views: number;
  created_at: string;
}

export const useTopPosts = () => {
  const [posts, setPosts] = useState<TopPost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTopPosts = async () => {
    try {
      const { data: postsData } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          likes,
          comments,
          views,
          created_at,
          profiles!inner(display_name, username)
        `)
        .order('likes', { ascending: false })
        .limit(10);

      if (postsData) {
        const formattedPosts: TopPost[] = postsData.map(post => ({
          id: post.id,
          author: (post.profiles as any)?.display_name || (post.profiles as any)?.username || 'Utilisateur anonyme',
          content: post.content.length > 50 ? post.content.substring(0, 50) + '...' : post.content,
          likes: post.likes || 0,
          comments: post.comments || 0,
          views: post.views || 0,
          created_at: post.created_at
        }));
        
        setPosts(formattedPosts);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des posts populaires:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopPosts();

    // Écouter les changements en temps réel sur les posts
    const channel = supabase
      .channel('posts_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts'
        },
        () => {
          fetchTopPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { posts, loading, refetch: fetchTopPosts };
};