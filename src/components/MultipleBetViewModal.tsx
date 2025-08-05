import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface MultipleBetViewModalProps {
  prediction: {
    id: string;
    user: {
      username: string;
      avatar: string;
      badge: string;
      badgeColor: string;
    };
    match: string;
    prediction: string;
    odds: string;
    confidence: number;
    analysis: string;
    successRate: number;
    sport: string;
    totalOdds?: string;
    reservationCode?: string;
    betType?: string;
    matches?: Array<{
      id: string;
      teams: string;
      prediction: string;
      odds: string;
      league: string;
      time: string;
      betType?: string;
    }>;
  };
}

const MultipleBetViewModal = ({ prediction }: MultipleBetViewModalProps) => {
  // Traiter les matchs pour l'affichage en tableau
  const matches = prediction.matches ? 
    prediction.matches.map((match, index) => ({
      ...match,
      id: match.id || `match-${index}`,
      betType: match.betType || prediction.betType || '1X2'
    })) :
    [{
      id: "1",
      teams: prediction.match,
      prediction: prediction.prediction,
      odds: prediction.odds,
      league: prediction.sport,
      time: '20:00',
      betType: prediction.betType || '1X2'
    }];

  const isMultipleBet = prediction.betType === 'multiple' || matches.length > 1;

  return (
    <ScrollArea className="max-h-[80vh] pr-4">
      <div className="space-y-4">
        {/* Header avec info utilisateur */}
        <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
          <img
            src={prediction.user.avatar}
            alt={prediction.user.username}
            className="w-10 h-10 rounded-full"
          />
          <div className="flex-1">
            <div className="font-medium text-sm">{prediction.user.username}</div>
            <div className="text-xs text-muted-foreground">
              {prediction.successRate}% de réussite • Badge {prediction.user.badge}
            </div>
          </div>
          {isMultipleBet && (
            <Badge variant="secondary" className="text-xs">
              Paris Multiple
            </Badge>
          )}
        </div>

        {/* Tableau des matchs optimisé mobile */}
        <Card className="p-0 overflow-hidden">
          <div className="p-3 bg-muted/30 border-b">
            <h5 className="text-sm font-medium">
              {matches.length > 1 ? `Matchs sélectionnés (${matches.length})` : 'Match sélectionné'}
            </h5>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-medium text-xs px-2 py-2">Équipes</TableHead>
                  <TableHead className="font-medium text-xs px-2 py-2 text-center">Type</TableHead>
                  <TableHead className="font-medium text-xs px-2 py-2 text-center">Prono</TableHead>
                  <TableHead className="font-medium text-xs px-2 py-2 text-right">Côte</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {matches.map((match, index) => (
                  <TableRow key={match.id} className="hover:bg-muted/30">
                    <TableCell className="px-2 py-3">
                      <div className="space-y-1">
                        <div className="font-medium text-sm leading-tight">
                          {match.teams}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {match.league} • {match.time}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-2 py-3 text-center">
                      <Badge variant="outline" className="text-xs py-0 px-1.5">
                        {match.betType}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-2 py-3 text-center">
                      <Badge variant="default" className="text-xs py-0 px-1.5 bg-green-500 hover:bg-green-600">
                        {match.prediction}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-2 py-3 text-right">
                      <span className="font-bold text-green-600 text-sm">
                        {match.odds}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
        
        {/* Total des côtes pour pari multiple */}
        {prediction.totalOdds && isMultipleBet && (
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-lg">📊</span>
                <span className="font-semibold text-blue-800 text-sm">Côtes individuelles</span>
              </div>
              <span className="text-sm text-blue-600 font-medium">
                {matches.length} paris
              </span>
            </div>
          </div>
        )}

        {/* Code de réservation */}
        {prediction.reservationCode && (
          <div className="bg-green-500 text-white p-4 rounded-lg text-center">
            <div className="text-sm font-medium mb-1">CODE DE RÉSERVATION</div>
            <div className="text-xl font-bold tracking-widest">
              {prediction.reservationCode}
            </div>
          </div>
        )}

        {/* Analyse */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-lg">💡</span>
            <span className="font-medium text-blue-900 text-sm">Analyse détaillée</span>
          </div>
          <p className="text-blue-800 text-sm leading-relaxed">{prediction.analysis}</p>
        </div>

        {/* Niveau de confiance */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg">🔥</span>
              <span className="font-medium text-yellow-800 text-sm">Niveau de confiance</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      i < prediction.confidence ? 'bg-yellow-400' : 'bg-yellow-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-yellow-700 font-medium text-sm">
                {prediction.confidence}/5
                {prediction.confidence === 5 ? ' 🚀' : prediction.confidence >= 4 ? ' 🔥' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Statistiques additionnelles pour paris multiples */}
        {isMultipleBet && matches.length > 1 && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-lg">📈</span>
              <span className="font-medium text-purple-800 text-sm">Statistiques du paris multiple</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="text-center">
                <div className="font-bold text-purple-700">{matches.length}</div>
                <div className="text-purple-600 text-xs">Matchs</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-purple-700">
                  {(matches.reduce((sum, m) => sum + parseFloat(m.odds), 0) / matches.length).toFixed(2)}
                </div>
                <div className="text-purple-600 text-xs">Côte moyenne</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default MultipleBetViewModal;