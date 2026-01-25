import { useState } from 'react';
import { Model } from '@/types/models';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Edit, Trash2, Sparkles, Zap, Shield, Cpu, Video, Music, Image, Type, CheckCircle2 } from 'lucide-react';
import { ModelDetails } from './ModelDetails';

interface ModelCardProps {
  model: Model;
  onEdit: (model: Model) => void;
  onDelete: (id: string) => void;
  isSelected?: boolean;
  onSelect?: (model: Model, selected: boolean) => void;
}

export function ModelCard({ model, onEdit, onDelete, isSelected, onSelect }: ModelCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const getModelTypeColor = (type: string) => {
    switch (type) {
      case 'text': return 'text-blue-400 border-blue-400/20 bg-blue-400/5';
      case 'multimodal': return 'text-purple-400 border-purple-400/20 bg-purple-400/5';
      case 'video': return 'text-orange-400 border-orange-400/20 bg-orange-400/5';
      case 'audio': return 'text-green-400 border-green-400/20 bg-green-400/5';
      case 'image': return 'text-amber-400 border-amber-400/20 bg-amber-400/5';
      default: return 'text-slate-400 border-slate-400/20 bg-slate-400/5';
    }
  };

  const getModelTypeIcon = (type: string) => {
    switch (type) {
      case 'text': return <Type className="h-5 w-5" />;
      case 'multimodal': return <Zap className="h-5 w-5" />;
      case 'video': return <Video className="h-5 w-5" />;
      case 'audio': return <Music className="h-5 w-5" />;
      case 'image': return <Image className="h-5 w-5" />;
      default: return <Cpu className="h-5 w-5" />;
    }
  };

  const formatContextLength = (length?: number | null) => {
    if (!length) return 'N/A';
    if (length >= 1000000) return `${(length / 1000000).toFixed(1)}M`;
    if (length >= 1000) return `${(length / 1000).toFixed(0)}K`;
    return length.toString();
  };

  return (
    <div className="relative h-full group">
      <Card
        className={`group transition-all duration-500 border-border/40 backdrop-blur-xl bg-card hover:-translate-y-2 relative overflow-hidden flex flex-col h-full ${isSelected
          ? 'ring-2 ring-primary ring-offset-4 ring-offset-background shadow-2xl shadow-primary/20 bg-primary/[0.04]'
          : 'hover:shadow-2xl'
          }`}
      >
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Selection Toggle Button */}
        <div className="absolute top-4 left-4 z-10">
          <Button
            size="sm"
            variant={isSelected ? "default" : "outline"}
            onClick={() => onSelect?.(model, !isSelected)}
            className={`h-7 px-3 text-[9px] font-black tracking-[0.2em] rounded-full transition-all duration-300 ${isSelected
              ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30 border-transparent'
              : 'bg-background/50 border-border/40 text-muted-foreground hover:text-foreground hover:bg-background/80'
              }`}
          >
            {isSelected ? (
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> SELECTED
              </span>
            ) : (
              'COMPARE'
            )}
          </Button>
        </div>

        <CardHeader className="relative pb-0 pt-10">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3.5 rounded-2xl shadow-lg transition-transform duration-500 group-hover:scale-110 ${getModelTypeColor(model.model_type)}`}>
                {getModelTypeIcon(model.model_type)}
              </div>
              <div className="space-y-1">
                <Badge variant="outline" className="text-[9px] font-black tracking-[0.2em] border-primary/20 text-primary bg-primary/5 px-2.5 py-0.5 rounded-full">
                  {model.company.toUpperCase()}
                </Badge>
                <h3 className="text-xl font-bold tracking-tight text-foreground line-clamp-1">
                  {model.name}
                </h3>
              </div>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(model)}
                className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(model.id)}
                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-lg"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col gap-6 pt-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-background/60 border border-border/60 shadow-sm">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] block mb-1">Architecture</span>
              <span className="text-[13px] font-bold text-foreground">{formatContextLength(model.context_length)} tokens</span>
            </div>
            <div className="p-4 rounded-2xl bg-background/60 border border-border/60 shadow-sm relative overflow-hidden group/rating">
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] block mb-1 flex items-center gap-1">
                <Sparkles className="h-2.5 w-2.5 fill-current" />
                Honest Rating
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-[18px] font-black text-foreground">
                  {model.personal_rating || 'N/A'}
                </span>
                <span className="text-[10px] font-bold text-muted-foreground">/ 10</span>
              </div>
              {/* Rating Pulse Effect */}
              {model.personal_rating && model.personal_rating >= 9 && (
                <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-primary/10 rounded-full blur-xl group-hover/rating:bg-primary/20 transition-colors" />
              )}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-between">
            <span className="text-[10px] font-black text-primary uppercase tracking-widest">Industry Tier</span>
            <span className="text-[12px] font-black text-foreground tracking-tight">
              {model.personal_rating && model.personal_rating >= 9 ? 'ELITE PERFORMANCE' :
                model.personal_rating && model.personal_rating >= 7 ? 'FRONTIER CLASS' :
                  'STANDARD DEPLOYMENT'}
            </span>
          </div>

          <div className="grid gap-3">
            {model.strengths && (
              <div className="p-3.5 rounded-xl bg-green-500/5 border border-green-500/10">
                <div className="flex items-center gap-2 mb-1.5 font-black text-[10px] text-green-500 uppercase tracking-widest">
                  <span>✧</span> ADVANTAGES
                </div>
                <p className="text-xs text-foreground/90 leading-relaxed font-medium line-clamp-2">
                  {model.strengths}
                </p>
              </div>
            )}
            {model.weaknesses && (
              <div className="p-3.5 rounded-xl bg-orange-500/5 border border-orange-500/10">
                <div className="flex items-center gap-2 mb-1.5 font-black text-[10px] text-orange-500 uppercase tracking-widest">
                  <span>▵</span> CRITIQUES
                </div>
                <p className="text-xs text-foreground/90 leading-relaxed font-medium line-clamp-2">
                  {model.weaknesses}
                </p>
              </div>
            )}
          </div>

          <div className="mt-auto pt-4 flex gap-2 border-t border-border/40">
            {model.url && (
              <Button variant="outline" size="sm" asChild className="flex-1 bg-transparent border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all rounded-xl text-[10px] font-black tracking-widest">
                <a href={model.url} target="_blank" rel="noopener noreferrer">
                  WEBSITE
                </a>
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(true)}
              className="flex-1 text-muted-foreground hover:text-foreground font-black tracking-widest text-[10px]"
            >
              DETAILS
            </Button>
          </div>
        </CardContent>
      </Card>

      <ModelDetails
        model={model}
        open={showDetails}
        onOpenChange={setShowDetails}
      />
    </div>
  );
}
