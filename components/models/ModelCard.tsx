'use client';

import { Model } from '@/types/models';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Edit, Trash2, Sparkles, Zap, Shield } from 'lucide-react';

interface ModelCardProps {
  model: Model;
  onEdit?: (model: Model) => void;
  onDelete?: (id: string) => void;
}

export function ModelCard({ model, onEdit, onDelete }: ModelCardProps) {
  const getModelTypeGradient = (type: string) => {
    switch (type) {
      case 'text':
        return 'from-blue-500 to-cyan-500';
      case 'multimodal':
        return 'from-purple-500 to-pink-500';
      case 'video':
        return 'from-pink-500 to-rose-500';
      case 'audio':
        return 'from-green-500 to-emerald-500';
      case 'image':
        return 'from-orange-500 to-amber-500';
      default:
        return 'from-gray-500 to-slate-500';
    }
  };

  const formatContextLength = (length?: number | null) => {
    if (!length) return 'N/A';
    if (length >= 1000000) return `${(length / 1000000).toFixed(1)}M`;
    if (length >= 1000) return `${(length / 1000).toFixed(0)}K`;
    return length.toString();
  };

  return (
    <div className="group perspective-1000">
      <Card className="relative overflow-hidden backdrop-blur-xl bg-white/70 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105">
        {/* Gradient Background Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-br ${getModelTypeGradient(model.model_type)} opacity-5 group-hover:opacity-10 transition-opacity duration-500`} />
        
        {/* Animated Border Gradient */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <CardHeader className="relative">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              {/* Model Name with Icon */}
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 bg-gradient-to-br ${getModelTypeGradient(model.model_type)} rounded-lg`}>
                  <Zap className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all">
                  {model.name}
                </h3>
              </div>
              
              {/* Company Badge */}
              <div className="flex items-center gap-2 flex-wrap mb-3">
                <Badge className="bg-gradient-to-r from-slate-600 to-slate-700 text-white border-0 shadow-md">
                  {model.company}
                </Badge>
                {model.is_open_source && (
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-md flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    Open Source
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(model)}
                  className="h-8 w-8 hover:bg-blue-100"
                >
                  <Edit className="h-4 w-4 text-blue-600" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(model.id)}
                  className="h-8 w-8 hover:bg-red-100"
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              )}
            </div>
          </div>

          {/* Model Type & Stats */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={`bg-gradient-to-r ${getModelTypeGradient(model.model_type)} text-white border-0 shadow-md`}>
              {model.model_type.charAt(0).toUpperCase() + model.model_type.slice(1)}
            </Badge>
            {model.context_length && (
              <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
                📊 {formatContextLength(model.context_length)} tokens
              </Badge>
            )}
            {model.personal_rating && (
              <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                {model.personal_rating}/10
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="relative space-y-4">
          {/* Description */}
          {model.description && (
            <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
              {model.description}
            </p>
          )}

          {/* Strengths */}
          {model.strengths && (
            <div className="p-3 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100">
              <h4 className="text-xs font-semibold text-green-700 mb-1 flex items-center gap-1">
                <span>✨</span> Strengths
              </h4>
              <p className="text-xs text-green-600 line-clamp-2">{model.strengths}</p>
            </div>
          )}

          {/* Weaknesses */}
          {model.weaknesses && (
            <div className="p-3 rounded-lg bg-gradient-to-br from-red-50 to-rose-50 border border-red-100">
              <h4 className="text-xs font-semibold text-red-700 mb-1 flex items-center gap-1">
                <span>⚠️</span> Limitations
              </h4>
              <p className="text-xs text-red-600 line-clamp-2">{model.weaknesses}</p>
            </div>
          )}

          {/* Capabilities */}
          {model.capabilities && model.capabilities.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-700 mb-2">Capabilities</h4>
              <div className="flex flex-wrap gap-1">
                {model.capabilities.slice(0, 4).map((capability, index) => (
                  <Badge key={index} variant="secondary" className="text-xs bg-slate-100 text-slate-700">
                    {capability}
                  </Badge>
                ))}
                {model.capabilities.length > 4 && (
                  <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-700">
                    +{model.capabilities.length - 4} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Links */}
          {(model.url || model.documentation_url) && (
            <div className="flex gap-2 pt-2 border-t border-slate-100">
              {model.url && (
                <Button variant="outline" size="sm" asChild className="flex-1 hover:bg-blue-50 hover:border-blue-300">
                  <a href={model.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Website
                  </a>
                </Button>
              )}
              {model.documentation_url && (
                <Button variant="outline" size="sm" asChild className="flex-1 hover:bg-purple-50 hover:border-purple-300">
                  <a href={model.documentation_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Docs
                  </a>
                </Button>
              )}
            </div>
          )}

          {/* Last Update */}
          {model.last_model_update && (
            <div className="text-xs text-slate-500 pt-2 border-t border-slate-100 flex items-center gap-1">
              <span>🔄</span>
              Updated: {new Date(model.last_model_update).toLocaleDateString()}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
