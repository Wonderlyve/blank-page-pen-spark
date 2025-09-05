import { ArrowLeft, Users, UserCheck, Activity, TrendingUp, Eye, MessageCircle, Heart, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect } from 'react';
import { useAdminStats } from '@/hooks/useAdminStats';
import { useRealtimeUsers } from '@/hooks/useRealtimeUsers';
import { useTopPosts } from '@/hooks/useTopPosts';
import { useUserPresence } from '@/hooks/useUserPresence';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Hooks pour les données réelles
  const { stats, loading: statsLoading, setStats } = useAdminStats();
  const { users: recentUsers, onlineCount, loading: usersLoading } = useRealtimeUsers();
  const { posts: topPosts, loading: postsLoading } = useTopPosts();
  
  // Activer la présence pour l'utilisateur actuel
  useUserPresence();

  // Redirect if not Smart user
  useEffect(() => {
    if (user && user.email !== 'smart@example.com' && !user.email?.includes('padmin') && user.user_metadata?.display_name !== 'Smart') {
      navigate('/');
    }
  }, [user, navigate]);

  // Mettre à jour le nombre d'utilisateurs en ligne
  useEffect(() => {
    setStats(prevStats => ({
      ...prevStats,
      onlineUsers: onlineCount
    }));
  }, [onlineCount, setStats]);

  if (!user || (user.email !== 'smart@example.com' && !user.email?.includes('padmin') && user.user_metadata?.display_name !== 'Smart')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-card border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/settings')}
              className="hover:bg-accent"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Activity className="w-6 h-6 text-muted-foreground" />
            <h1 className="text-xl font-bold text-foreground">Tableau de bord administrateur</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <Users className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Utilisateurs totaux</p>
                {statsLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <p className="text-2xl font-bold text-foreground">{stats.totalUsers.toLocaleString()}</p>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <UserCheck className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">En ligne maintenant</p>
                {statsLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-2xl font-bold text-foreground">{stats.onlineUsers}</p>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-8 h-8 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Actifs aujourd'hui</p>
                {statsLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-2xl font-bold text-foreground">{stats.activeToday}</p>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <Eye className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Posts totaux</p>
                {statsLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <p className="text-2xl font-bold text-foreground">{stats.totalPosts.toLocaleString()}</p>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Engagement Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <Heart className="w-6 h-6 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Likes totaux</p>
                {statsLoading ? (
                  <Skeleton className="h-6 w-20" />
                ) : (
                  <p className="text-xl font-bold text-foreground">{stats.totalLikes.toLocaleString()}</p>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <MessageCircle className="w-6 h-6 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Commentaires totaux</p>
                {statsLoading ? (
                  <Skeleton className="h-6 w-20" />
                ) : (
                  <p className="text-xl font-bold text-foreground">{stats.totalComments.toLocaleString()}</p>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <Share2 className="w-6 h-6 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Partages totaux</p>
                {statsLoading ? (
                  <Skeleton className="h-6 w-20" />
                ) : (
                  <p className="text-xl font-bold text-foreground">{stats.totalShares.toLocaleString()}</p>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Users Table */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Utilisateurs récents
            <span className="ml-2 text-sm text-muted-foreground">
              ({onlineCount} en ligne)
            </span>
          </h3>
          {usersLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Inscription</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        {user.avatar_url && (
                          <img 
                            src={user.avatar_url} 
                            alt={user.name}
                            className="w-6 h-6 rounded-full"
                          />
                        )}
                        <span>{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        user.status === 'online' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                      }`}>
                        <span className={`w-2 h-2 rounded-full mr-1 ${
                          user.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                        }`} />
                        {user.status === 'online' ? 'En ligne' : 'Hors ligne'}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(user.joinedAt).toLocaleDateString('fr-FR')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>

        {/* Top Posts */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Posts populaires</h3>
          {postsLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Auteur</TableHead>
                  <TableHead>Contenu</TableHead>
                  <TableHead>Likes</TableHead>
                  <TableHead>Commentaires</TableHead>
                  <TableHead>Vues</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topPosts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="font-medium">{post.author}</TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate" title={post.content}>
                        {post.content}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Heart className="w-4 h-4 text-red-500" />
                        <span>{post.likes}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="w-4 h-4 text-blue-500" />
                        <span>{post.comments}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Eye className="w-4 h-4 text-purple-500" />
                        <span>{post.views}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(post.created_at).toLocaleDateString('fr-FR')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;