import { useState, useRef } from 'react';
import { Crown, Eye, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import VipMultiplePronoModal from './VipMultiplePronoModal';

interface VipPronoCardProps {
  id: string;
  totalOdds: number;
  imageUrl?: string;
  description: string;
  predictionText: string;
  createdAt: string;
  creatorUsername?: string;
  betType?: string;
  matchesData?: string;
  matchTeams?: string;
  sport?: string;
  onReply?: (pronoData: any) => void;
}

const VipPronoCard = ({ 
  id,
  totalOdds, 
  imageUrl, 
  description, 
  predictionText, 
  createdAt, 
  creatorUsername,
  betType,
  matchesData,
  matchTeams,
  sport,
  onReply
}: VipPronoCardProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showMultipleModal, setShowMultipleModal] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [startX, setStartX] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentX = e.touches[0].clientX;
    const diffX = currentX - startX;
    
    // Permettre le swipe vers la droite pour répondre
    if (diffX > 0 && diffX < 100) {
      setSwipeOffset(diffX);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diffX = swipeOffset;
    
    // Si swipe > 50px, déclencher la réponse
    if (diffX > 50 && onReply) {
      onReply({
        type: 'vip_prono',
        content: `Prono VIP (côte ${totalOdds}): ${description}`,
        creatorUsername
      });
    }
    
    setSwipeOffset(0);
  };

  // Déterminer le type de pronostic
  const isMultiple = betType === 'multiple' || betType === 'combine';
  let matchesArray: any[] = [];
  
  if (matchesData) {
    try {
      matchesArray = JSON.parse(matchesData);
    } catch (e) {
      console.error('Error parsing matches data:', e);
    }
  }
  
  const isMultipleBet = isMultiple || matchesArray.length > 1 || (matchTeams && matchTeams.includes('|'));

  const handleViewDetails = () => {
    if (isMultipleBet) {
      setShowMultipleModal(true);
    } else {
      setShowDetails(true);
    }
  };

  return (
    <>
      <Card 
        ref={cardRef}
        className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 shadow-md transition-transform select-none"
        style={{ transform: `translateX(${swipeOffset}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Crown className="w-5 h-5 text-yellow-600" />
            <span className="font-semibold text-yellow-800">PRONO VIP</span>
            <span className="text-xs text-yellow-600">
              {formatTime(createdAt)}
            </span>
          </div>

          {creatorUsername && (
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-sm font-medium text-gray-700">
                Par {creatorUsername}
              </span>
            </div>
          )}

          <div className="flex items-center space-x-3 mb-3">
            <div className="flex items-center space-x-2 bg-white rounded-lg px-3 py-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="font-bold text-lg text-green-600">
                {totalOdds}
              </span>
              <span className="text-sm text-gray-500">côte</span>
            </div>
          </div>

          {imageUrl && (
            <div className="mb-3">
              <img 
                src={imageUrl} 
                alt="Prono VIP" 
                className="w-full h-40 object-cover rounded-lg"
              />
            </div>
          )}

          <p className="text-gray-700 text-sm mb-4">
            {description}
          </p>

          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-yellow-700 font-medium">
              {isMultipleBet ? (betType === 'combine' ? 'Pari Combiné' : 'Paris Multiple') : 'Pari Simple'}
            </span>
            {isMultipleBet && (
              <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full">
                {matchesArray.length || (matchTeams?.split('|').length || 1)} match{(matchesArray.length || (matchTeams?.split('|').length || 1)) > 1 ? 's' : ''}
              </span>
            )}
          </div>
          
          <Button 
            onClick={handleViewDetails}
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
          >
            <Eye className="w-4 h-4 mr-2" />
            Voir le pronostique
          </Button>
        </CardContent>
      </Card>

      {/* Modal pour pronostics simples */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Crown className="w-5 h-5 text-yellow-600" />
              <span>Détails du prono VIP</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <div>
                <span className="font-bold text-xl text-green-600">
                  {totalOdds}
                </span>
                <span className="text-sm text-gray-500 ml-2">côte totale</span>
              </div>
            </div>

            {imageUrl && (
              <div>
                <img 
                  src={imageUrl} 
                  alt="Prono VIP" 
                  className="w-full h-60 object-cover rounded-lg"
                />
              </div>
            )}

            <div>
              <h4 className="font-semibold mb-2">Description</h4>
              <p className="text-gray-700 text-sm">
                {description}
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Détails du pronostique</h4>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-700 text-sm whitespace-pre-wrap">
                  {predictionText}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <Button onClick={() => setShowDetails(false)}>
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal pour pronostics multiples/combinés */}
      <VipMultiplePronoModal
        open={showMultipleModal}
        onOpenChange={setShowMultipleModal}
        prono={{
          id,
          creator_username: creatorUsername,
          total_odds: totalOdds,
          description,
          prediction_text: predictionText,
          created_at: createdAt,
          image_url: imageUrl,
          bet_type: betType,
          matches_data: matchesData,
          match_teams: matchTeams,
          sport
        }}
      />
    </>
  );
};

export default VipPronoCard;