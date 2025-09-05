import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Crown, TrendingUp } from 'lucide-react';

interface Match {
  id?: string;
  homeTeam?: string;
  awayTeam?: string;
  team1?: string;
  team2?: string;
  teams?: string;
  pronostic?: string;
  prediction?: string;
  odd?: string;
  odds?: string;
  sport?: string;
  league?: string;
  selectedBetType?: string;
  betType?: string;
  time?: string;
}

interface VipMultiplePronoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prono: {
    id: string;
    creator_username?: string;
    total_odds: number;
    description: string;
    prediction_text: string;
    created_at: string;
    image_url?: string;
    bet_type?: string;
    matches_data?: string;
    match_teams?: string;
    sport?: string;
  };
}

const VipMultiplePronoModal = ({ open, onOpenChange, prono }: VipMultiplePronoModalProps) => {
  // Normalisation d'un match individuel
  const normalizeMatch = (match: any, index: number) => ({
    id: match.id || `match-${index}`,
    teams:
      match.homeTeam && match.awayTeam
        ? `${match.homeTeam} vs ${match.awayTeam}`
        : match.team1 && match.team2 
        ? `${match.team1} vs ${match.team2}`
        : match.teams || match.match || prono.match_teams,
    prediction: match.pronostic || match.prediction || 'N/A',
    odds: match.odd || match.odds || '0.00',
    league: match.sport || match.league || prono.sport || 'Football',
    time: match.time || match.heure || '20:00',
    betType: match.selectedBetType || match.betType || 'Standard',
  });

  // Division de matchs multiples séparés par "|"
  const splitMultipleMatches = (matchString: string) => {
    const matchParts = matchString.split('|').map(m => m.trim());
    
    return matchParts.map((match, index) => ({
      id: `split-${index}`,
      teams: match,
      prediction: 'N/A',
      odds: '0.00',
      league: prono.sport || 'Football',
      time: '20:00',
      betType: 'Standard',
    }));
  };

  // Préparer les matchs
  let matches: Match[] = [];

  if (prono.matches_data) {
    try {
      const matchesData = JSON.parse(prono.matches_data);

      if (Array.isArray(matchesData)) {
        matches = matchesData.map((match, index) => normalizeMatch(match, index));
      } else if (matchesData.homeTeam || matchesData.teams || matchesData.team1) {
        matches = [normalizeMatch(matchesData, 0)];
      }
    } catch (error) {
      console.error('Erreur parsing matches_data:', error);
    }
  }

  if (matches.length === 0 && prono.match_teams) {
    if (prono.match_teams.includes('|')) {
      matches = splitMultipleMatches(prono.match_teams);
    } else {
      matches = [
        {
          id: 'default-1',
          teams: prono.match_teams,
          prediction: 'N/A',
          odds: prono.total_odds.toString(),
          league: prono.sport || 'Football',
          time: '20:00',
          betType: 'Standard',
        },
      ];
    }
  }

  const isMultipleBet = prono.bet_type === 'combine' || prono.bet_type === 'multiple' || matches.length > 1;
  const betTypeLabel = prono.bet_type === 'combine' ? 'Prono VIP Combiné' : 'Prono VIP Multiple';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0 pb-4">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Crown className="w-5 h-5 text-yellow-600" />
              <span className="text-lg font-semibold">{betTypeLabel}</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {matches.length} match{matches.length > 1 ? 's' : ''}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {/* Zone scrollable */}
        <div className="flex-1 overflow-y-auto px-4 pr-2">
          <div className="space-y-4 pb-4 pr-2">
            {/* Informations utilisateur */}
            {prono.creator_username && (
              <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                <Crown className="w-8 h-8 text-yellow-600" />
                <div className="flex-1">
                  <div className="font-medium text-sm">Par {prono.creator_username}</div>
                  <div className="text-xs text-yellow-700">Prono VIP • Expert</div>
                </div>
              </div>
            )}

            {/* Image si disponible */}
            {prono.image_url && (
              <div className="relative">
                <img
                  src={prono.image_url}
                  alt="Prono VIP"
                  className="w-full h-auto rounded-lg"
                />
              </div>
            )}

            {/* Côte totale */}
            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-yellow-600" />
                  <span className="font-semibold text-yellow-800 text-sm">
                    Côte totale {prono.bet_type === 'combine' ? 'combinée' : 'multiple'}
                  </span>
                </div>
                <span className="text-lg font-bold text-yellow-600">
                  {prono.total_odds}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-lg">💡</span>
                <span className="font-medium text-blue-900 text-sm">Description</span>
              </div>
              <p className="text-blue-800 text-sm leading-relaxed">{prono.description}</p>
            </div>

            {/* Matchs sélectionnés */}
            {matches.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground">
                  Matchs sélectionnés ({matches.length} match{matches.length > 1 ? 's' : ''})
                </h4>

                {matches.map((match, index) => (
                  <div
                    key={match.id || index}
                    className="p-3 mb-2 border rounded-xl shadow-sm bg-background"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <p className="font-semibold text-sm mb-1">{match.teams}</p>
                        <p className="text-muted-foreground text-xs">
                          ⚽ {match.league} • ⏰ {match.time}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          🎯 Type : <span className="font-medium">{match.betType}</span>
                        </p>
                      </div>
                      <div className="text-right ml-3">
                        <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full">
                          {match.prediction}
                        </span>
                        {match.odds !== '0.00' && (
                          <div className="text-xs text-gray-500 mt-1">
                            Côte: {match.odds}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Détails du pronostique */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-lg">📊</span>
                <span className="font-medium text-gray-900 text-sm">Détails du pronostique</span>
              </div>
              <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
                {prono.prediction_text}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VipMultiplePronoModal;