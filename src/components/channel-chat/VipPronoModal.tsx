import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Upload, X } from 'lucide-react';
import { toast } from 'sonner';

interface VipPronoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (prono: VipPronoData) => void;
}

export interface VipPronoData {
  totalOdds: string;
  image?: File;
  description: string;
  predictionText: string;
  betType?: string;
  matchesData?: string;
  matchTeams?: string;
  sport?: string;
}

const VipPronoModal = ({ isOpen, onClose, onSubmit }: VipPronoModalProps) => {
  const [totalOdds, setTotalOdds] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [predictionText, setPredictionText] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [betType, setBetType] = useState('simple');
  const [matches, setMatches] = useState<Array<{
    homeTeam: string;
    awayTeam: string;
    pronostic: string;
    odd: string;
    sport: string;
    selectedBetType: string;
  }>>([{
    homeTeam: '',
    awayTeam: '',
    pronostic: '',
    odd: '',
    sport: '',
    selectedBetType: '1X2'
  }]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const addMatch = () => {
    setMatches([...matches, {
      homeTeam: '',
      awayTeam: '',
      pronostic: '',
      odd: '',
      sport: '',
      selectedBetType: '1X2'
    }]);
  };

  const removeMatch = (index: number) => {
    if (matches.length > 1) {
      setMatches(matches.filter((_, i) => i !== index));
    }
  };

  const updateMatch = (index: number, field: string, value: string) => {
    const updatedMatches = matches.map((match, i) => 
      i === index ? { ...match, [field]: value } : match
    );
    setMatches(updatedMatches);
  };

  const handleSubmit = () => {
    if (!totalOdds || !description || !predictionText) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (betType !== 'simple') {
      const incompleteMatches = matches.some(match => 
        !match.homeTeam || !match.awayTeam || !match.pronostic || !match.odd
      );
      if (incompleteMatches) {
        toast.error('Veuillez remplir tous les matchs');
        return;
      }
    }

    const matchTeams = betType === 'simple' 
      ? matches[0].homeTeam && matches[0].awayTeam 
        ? `${matches[0].homeTeam} vs ${matches[0].awayTeam}`
        : ''
      : matches.map(m => `${m.homeTeam} vs ${m.awayTeam}`).join(' | ');

    onSubmit({
      totalOdds,
      image: image || undefined,
      description,
      predictionText,
      betType,
      matchesData: betType !== 'simple' ? JSON.stringify(matches) : undefined,
      matchTeams,
      sport: matches[0].sport || 'Football'
    });

    // Reset form
    setTotalOdds('');
    setImage(null);
    setDescription('');
    setPredictionText('');
    setImagePreview(null);
    setBetType('simple');
    setMatches([{
      homeTeam: '',
      awayTeam: '',
      pronostic: '',
      odd: '',
      sport: '',
      selectedBetType: '1X2'
    }]);
    onClose();
  };

  const handleClose = () => {
    setTotalOdds('');
    setImage(null);
    setDescription('');
    setPredictionText('');
    setImagePreview(null);
    setBetType('simple');
    setMatches([{
      homeTeam: '',
      awayTeam: '',
      pronostic: '',
      odd: '',
      sport: '',
      selectedBetType: '1X2'
    }]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Créer un prono VIP</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto scrollbar-hide px-1">
          <div className="space-y-4 pr-3">
            <div>
              <Label htmlFor="betType">Type de pronostic *</Label>
              <select
                id="betType"
                value={betType}
                onChange={(e) => setBetType(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="simple">Paris Simple</option>
                <option value="multiple">Paris Multiple</option>
                <option value="combine">Paris Combiné</option>
              </select>
            </div>

            {betType !== 'simple' && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Matchs ({matches.length})</Label>
                  <Button type="button" onClick={addMatch} variant="outline" size="sm">
                    Ajouter un match
                  </Button>
                </div>
                
                {matches.map((match, index) => (
                  <div key={index} className="border rounded-lg p-3 mb-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-sm">Match {index + 1}</span>
                      {matches.length > 1 && (
                        <Button 
                          type="button" 
                          onClick={() => removeMatch(index)}
                          variant="destructive" 
                          size="sm"
                        >
                          Supprimer
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <Input
                        placeholder="Équipe domicile"
                        value={match.homeTeam}
                        onChange={(e) => updateMatch(index, 'homeTeam', e.target.value)}
                      />
                      <Input
                        placeholder="Équipe extérieur"
                        value={match.awayTeam}
                        onChange={(e) => updateMatch(index, 'awayTeam', e.target.value)}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <Input
                        placeholder="Pronostic"
                        value={match.pronostic}
                        onChange={(e) => updateMatch(index, 'pronostic', e.target.value)}
                      />
                      <Input
                        placeholder="Côte"
                        type="number"
                        step="0.01"
                        value={match.odd}
                        onChange={(e) => updateMatch(index, 'odd', e.target.value)}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Sport"
                        value={match.sport}
                        onChange={(e) => updateMatch(index, 'sport', e.target.value)}
                      />
                      <select
                        value={match.selectedBetType}
                        onChange={(e) => updateMatch(index, 'selectedBetType', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="1X2">1X2</option>
                        <option value="Double Chance">Double Chance</option>
                        <option value="Plus/Moins">Plus/Moins</option>
                        <option value="BTTS">BTTS</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div>
              <Label htmlFor="totalOdds">Côte totale *</Label>
              <Input
                id="totalOdds"
                type="number"
                step="0.01"
                placeholder="Ex: 2.50"
                value={totalOdds}
                onChange={(e) => setTotalOdds(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="image">Image</Label>
              <div className="mt-1">
                {imagePreview ? (
                  <div className="relative">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={handleRemoveImage}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <label htmlFor="image" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <Upload className="w-8 h-8 text-gray-400" />
                    <span className="text-sm text-gray-500">Cliquez pour ajouter une image</span>
                    <input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="description">Texte d'accompagnement *</Label>
              <Textarea
                id="description"
                placeholder="Décrivez votre pronostique..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="predictionText">Détails du pronostique *</Label>
              <Textarea
                id="predictionText"
                placeholder="Détaillez vos prédictions..."
                value={predictionText}
                onChange={(e) => setPredictionText(e.target.value)}
                className="mt-1"
                rows={4}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-6 flex-shrink-0">
          <Button variant="outline" onClick={handleClose}>
            Annuler
          </Button>
          <Button onClick={handleSubmit}>
            Créer le prono VIP
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VipPronoModal;