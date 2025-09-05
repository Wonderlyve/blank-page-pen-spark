import { useState, useEffect } from 'react';
import { Trophy, Medal, Crown, TrendingUp, Zap, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useClassement } from '@/hooks/useClassement';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface TopPost {
  id: string;
  rank: number;
  user_id: string;
  content: string;
  sport?: string;
  match_teams?: string;
  prediction_text?: string;
  odds: number;
  confidence: number;
  likes: number;
  comments: number;
  views: number;
  created_at: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
  badge?: string;
  visibility_score?: number;
  boost_count?: number;
  trend?: 'up' | 'down' | 'stable';
}

export const PostLeaderboard = () => {
  const [topPosts, setTopPosts] = useState<TopPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState('visibility');
  const { getCommunityFeed, getPersonalizedFeed } = useClassement();

  const loadTopPosts = async (criteria: string) => {
    setLoading(true);
    try {
      let posts = [];
      
      if (criteria === 'community') {
        posts = await getCommunityFeed(10, 0, '24h');
      } else {
        posts = await getCommunityFeed(10, 0, '7d');
      }

      // Convertir et trier selon le critère
      const rankedPosts: TopPost[] = posts.map((post, index) => ({
        ...post,
        rank: index + 1,
        trend: Math.random() > 0.6 ? 'up' : Math.random() > 0.3 ? 'down' : 'stable'
      }));

      setTopPosts(rankedPosts);
    } catch (error) {
      console.error('Erreur lors du chargement du classement:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTopPosts(currentTab);
  }, [currentTab]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-400" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-300" />;
      case 3:
        return <Medal className="w-5 h-5 text-amber-600" />;
      default:
        return <Trophy className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-3 h-3 text-green-500" />;
      case 'down':
        return <TrendingUp className="w-3 h-3 text-red-500 rotate-180" />;
      default:
        return <div className="w-3 h-3" />;
    }
  };

  const getScoreDisplay = (post: TopPost, criteria: string) => {
    switch (criteria) {
      case 'visibility':
        return `${Math.round(post.visibility_score || 0)}`;
      case 'engagement':
        return `${post.likes + post.comments + post.views}`;
      case 'community':
        return `${post.likes}`;
      default:
        return `${Math.round(post.visibility_score || 0)}`;
    }
  };

  const getScoreLabel = (criteria: string) => {
    switch (criteria) {
      case 'visibility':
        return 'Score';
      case 'engagement':
        return 'Engagement';
      case 'community':
        return 'Likes';
      default:
        return 'Score';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-6 h-6 text-primary" />
          Classement des Pronostics
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Les meilleurs pronostics selon différents critères
        </p>
      </CardHeader>
      
      <CardContent>
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="visibility" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Qualité
            </TabsTrigger>
            <TabsTrigger value="engagement" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Engagement
            </TabsTrigger>
            <TabsTrigger value="community" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Tendance
            </TabsTrigger>
          </TabsList>

          <TabsContent value={currentTab} className="mt-4">
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                topPosts.map((post) => (
                  <div
                    key={post.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {/* Rang et icône */}
                      <div className="flex items-center gap-2 w-16">
                        <span className={`text-sm font-bold ${
                          post.rank <= 3 ? "text-primary" : "text-muted-foreground"
                        }`}>
                          #{post.rank}
                        </span>
                        {getRankIcon(post.rank)}
                      </div>

                      {/* Avatar et info utilisateur */}
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={post.avatar_url || ''} />
                        <AvatarFallback className="text-xs">
                          {post.display_name?.[0] || post.username?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm truncate">
                            {post.display_name || post.username || 'Utilisateur'}
                          </p>
                          {post.badge && (
                            <Badge variant="secondary" className="text-xs">
                              {post.badge}
                            </Badge>
                          )}
                        </div>
                        
                        {/* Détails du pronostic */}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {post.sport && (
                            <Badge variant="outline" className="text-xs">
                              {post.sport}
                            </Badge>
                          )}
                          {post.match_teams && (
                            <span className="truncate">{post.match_teams}</span>
                          )}
                        </div>
                        
                        {post.prediction_text && (
                          <p className="text-xs text-muted-foreground truncate mt-1">
                            {post.prediction_text}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Tendance */}
                      <div className="flex items-center gap-1">
                        {getTrendIcon(post.trend)}
                      </div>

                      {/* Statistiques */}
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          {post.odds && (
                            <span className="text-xs font-medium text-primary">
                              @{post.odds}
                            </span>
                          )}
                          {post.confidence && (
                            <Badge variant="outline" className="text-xs">
                              {post.confidence}%
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                          <span>{post.likes} ❤️</span>
                          <span>{post.comments} 💬</span>
                          <span>{post.views} 👁️</span>
                        </div>
                      </div>

                      {/* Score principal */}
                      <div className="text-right">
                        <p className="font-bold text-primary">
                          {getScoreDisplay(post, currentTab)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {getScoreLabel(currentTab)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}

              {topPosts.length === 0 && !loading && (
                <div className="text-center py-8 text-muted-foreground">
                  Aucun pronostic trouvé pour ce critère
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Stats globales */}
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <p className="font-bold text-primary">{topPosts.length}</p>
              <p className="text-muted-foreground">Posts classés</p>
            </div>
            <div>
              <p className="font-bold text-green-500">
                {topPosts.filter(p => p.trend === 'up').length}
              </p>
              <p className="text-muted-foreground">En hausse</p>
            </div>
            <div>
              <p className="font-bold text-yellow-500">
                {topPosts.reduce((avg, p) => avg + (p.confidence || 0), 0) / Math.max(topPosts.length, 1)}%
              </p>
              <p className="text-muted-foreground">Confiance moy.</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};