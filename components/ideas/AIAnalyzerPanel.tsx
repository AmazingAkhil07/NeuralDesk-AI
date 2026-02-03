'use client';

import { Idea, IdeaRecommendation } from '@/types/ideas';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Brain, Zap, TrendingUp, Users, DollarSign, Lightbulb, CheckCircle, 
  AlertTriangle, XCircle, Target, Sparkles, BarChart3, Loader2, ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIAnalyzerPanelProps {
  idea: Idea;
  isAnalyzing?: boolean;
  onAnalyze?: () => void;
}

const RecommendationCard = ({ recommendation }: { recommendation?: IdeaRecommendation | null }) => {
  if (!recommendation) {
    return (
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-700/20 to-slate-800/20 border border-slate-500/20 p-6 backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Awaiting Analysis</p>
            <p className="text-slate-300">Run AI Analyzer to get detailed verdict</p>
          </div>
          <Sparkles className="h-8 w-8 text-slate-400 animate-pulse" />
        </div>
      </div>
    );
  }

  const configs: Record<IdeaRecommendation, {
    gradient: string;
    bgGradient: string;
    icon: any;
    title: string;
    description: string;
    color: string;
  }> = {
    'Build': {
      gradient: 'from-emerald-400 to-green-500',
      bgGradient: 'from-emerald-500/10 to-green-500/5',
      icon: CheckCircle,
      title: 'BUILD THIS',
      description: 'Strong market potential with clear value proposition',
      color: 'text-emerald-300'
    },
    'Iterate': {
      gradient: 'from-amber-400 to-yellow-500',
      bgGradient: 'from-amber-500/10 to-yellow-500/5',
      icon: AlertTriangle,
      title: 'ITERATE & REFINE',
      description: 'Promising concept needs refinement and validation',
      color: 'text-amber-300'
    },
    'Kill': {
      gradient: 'from-red-400 to-rose-500',
      bgGradient: 'from-red-500/10 to-rose-500/5',
      icon: XCircle,
      title: 'NOT VIABLE NOW',
      description: 'Market conditions or concept needs rethinking',
      color: 'text-red-300'
    },
    'Pending': {
      gradient: 'from-slate-400 to-slate-500',
      bgGradient: 'from-slate-500/10 to-slate-500/5',
      icon: Sparkles,
      title: 'PENDING ANALYSIS',
      description: 'Awaiting comprehensive AI analysis',
      color: 'text-slate-300'
    }
  };

  const config = configs[recommendation];
  const Icon = config.icon;

  return (
    <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${config.bgGradient} ${recommendation === 'Build' ? 'border-emerald-500/30' : recommendation === 'Iterate' ? 'border-amber-500/30' : 'border-red-500/30'} border p-6 backdrop-blur`}>
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full blur-2xl opacity-20" style={{backgroundImage: `linear-gradient(135deg, var(--tw-gradient-stops))`}} />
      
      <div className="relative flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Icon className={`h-6 w-6 ${config.color}`} />
            <p className={`text-sm font-black uppercase tracking-[0.2em] bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent`}>
              {config.title}
            </p>
          </div>
          <p className="text-sm text-slate-300 font-medium">{config.description}</p>
        </div>
        <Badge className={`bg-gradient-to-r ${config.gradient} text-white border-0 text-xs font-bold`}>
          {recommendation}
        </Badge>
      </div>
    </div>
  );
};

const AnalysisMetric = ({ 
  label, 
  value, 
  icon: Icon, 
  description,
  max = 10,
  color = 'indigo'
}: { 
  label: string; 
  value?: number | string; 
  icon: any; 
  description?: string;
  max?: number;
  color?: string;
}) => {
  const percentage = typeof value === 'number' ? (value / max) * 100 : 0;
  
  const colorClasses = {
    indigo: 'from-indigo-500 to-indigo-600',
    purple: 'from-purple-500 to-purple-600',
    cyan: 'from-cyan-500 to-cyan-600',
    rose: 'from-rose-500 to-rose-600',
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-slate-400" />
          <span className="text-sm font-semibold text-slate-300">{label}</span>
        </div>
        {typeof value === 'number' && (
          <span className={`font-bold text-lg bg-gradient-to-r ${colorClasses[color as keyof typeof colorClasses]} bg-clip-text text-transparent`}>
            {value}/{max}
          </span>
        )}
      </div>
      {typeof value === 'number' && (
        <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden border border-slate-600/30">
          <div 
            className={`h-full bg-gradient-to-r ${colorClasses[color as keyof typeof colorClasses]} transition-all duration-500`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
      {description && (
        <p className="text-xs text-slate-400 font-medium">{description}</p>
      )}
    </div>
  );
};

export function AIAnalyzerPanel({ idea, isAnalyzing = false, onAnalyze }: AIAnalyzerPanelProps) {
  const safeScore = typeof idea.score === 'number' ? idea.score : null
  
  const getBorderColorClass = (rec?: IdeaRecommendation | null) => {
    if (rec === 'Build') return 'border-emerald-500/30'
    if (rec === 'Iterate') return 'border-amber-500/30'
    if (rec === 'Kill') return 'border-red-500/30'
    return 'border-slate-500/30'
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-indigo-400" />
            <h3 className="text-xl font-bold text-slate-100">AI Analyzer</h3>
          </div>
          <p className="text-sm text-slate-400">Deep market & concept evaluation powered by advanced AI</p>
        </div>
        {!idea.analysis_json && (
          <Button
            onClick={onAnalyze}
            disabled={isAnalyzing}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold px-6 h-10 rounded-lg shadow-lg shadow-indigo-500/30 transition-all hover:scale-105 active:scale-95"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Analyze Now
              </>
            )}
          </Button>
        )}
      </div>

      {idea.analysis_json ? (
        <div className="space-y-6">
          {/* Overall Score */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 p-6 backdrop-blur">
            <div className="absolute -right-12 -top-12 h-40 w-40 bg-indigo-500/20 rounded-full blur-3xl" />
            <div className="relative flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-indigo-300">Overall Viability Score</p>
                <p className="text-slate-300 font-medium">Comprehensive evaluation across all metrics</p>
              </div>
              <div className="text-center">
                <div className={cn(
                  "text-6xl font-black text-center",
                  safeScore !== null && safeScore >= 8 ? 'text-emerald-400' :
                  safeScore !== null && safeScore >= 5 ? 'text-amber-400' :
                  'text-red-400'
                )}>
                  {safeScore ?? '-'}
                </div>
                <p className="text-sm text-slate-400 font-semibold mt-1">/10</p>
              </div>
            </div>
          </div>

          {/* Verdict */}
          <RecommendationCard recommendation={idea.recommendation} />

          {/* Detailed Metrics */}
          <div className="rounded-xl bg-slate-800/30 border border-slate-700/50 p-6 backdrop-blur space-y-6">
            <div>
              <h4 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-indigo-400" />
                Market & Demand Metrics
              </h4>
              <div className="space-y-4">
                <AnalysisMetric
                  label="Market Demand"
                  value={idea.analysis_json?.market?.demand_likelihood === 'High' ? 9 : idea.analysis_json?.market?.demand_likelihood === 'Medium' ? 6 : 3}
                  icon={TrendingUp}
                  description={idea.analysis_json?.market?.pain_intensity || 'Assessing market need and opportunity size'}
                  color="indigo"
                />
                <AnalysisMetric
                  label="Target Buyer Clarity"
                  value={idea.analysis_json?.monetization?.willingness_to_pay === 'High' ? 9 : idea.analysis_json?.monetization?.willingness_to_pay === 'Medium' ? 6 : 3}
                  icon={Users}
                  description={idea.analysis_json?.monetization?.buyer_persona || 'Who exactly would pay for this?'}
                  color="purple"
                />
                <AnalysisMetric
                  label="AI Necessity"
                  value={idea.analysis_json?.ai_justification?.necessity_level === 'Essential' ? 9 : idea.analysis_json?.ai_justification?.necessity_level === 'Optional' ? 6 : 3}
                  icon={DollarSign}
                  description={idea.analysis_json?.ai_justification?.reasoning || 'Can this leverage AI effectively?'}
                  color="rose"
                />
                <AnalysisMetric
                  label="Differentiation"
                  value={idea.analysis_json?.differentiation?.one_sentence_diff ? 8 : 4}
                  icon={Sparkles}
                  description={idea.analysis_json?.differentiation?.one_sentence_diff || 'How unique is this compared to competitors?'}
                  color="cyan"
                />
              </div>
            </div>
          </div>

          {/* Analysis Details */}
          {idea.analysis_json && (
            <div className="rounded-xl bg-slate-800/30 border border-slate-700/50 p-6 backdrop-blur space-y-4">
              <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-indigo-400" />
                Key Insights
              </h4>
              
              <div className="space-y-3">
                {idea.brutal_summary && (
                  <div className="p-3 rounded-lg bg-slate-700/30 border border-slate-600/50">
                    <p className="text-xs font-bold text-indigo-300 uppercase tracking-wide mb-1">Market Reality</p>
                    <p className="text-sm text-slate-300 leading-relaxed">{idea.brutal_summary}</p>
                  </div>
                )}

                {idea.analysis_json.differentiation?.one_sentence_diff && (
                  <div className="p-3 rounded-lg bg-slate-700/30 border border-slate-600/50">
                    <p className="text-xs font-bold text-purple-300 uppercase tracking-wide mb-1">Differentiation</p>
                    <p className="text-sm text-slate-300 leading-relaxed">{idea.analysis_json.differentiation.one_sentence_diff}</p>
                  </div>
                )}

                {idea.analysis_json.differentiation?.flags && idea.analysis_json.differentiation.flags.length > 0 && (
                  <div className="p-3 rounded-lg bg-slate-700/30 border border-slate-600/50">
                    <p className="text-xs font-bold text-red-300 uppercase tracking-wide mb-1">⚠️ Key Flags</p>
                    <ul className="text-sm text-slate-300 leading-relaxed">
                      {idea.analysis_json.differentiation.flags.map((flag, idx) => (
                        <li key={idx}>• {flag}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {idea.analysis_json.ai_justification?.reasoning && (
                  <div className="p-3 rounded-lg bg-slate-700/30 border border-slate-600/50">
                    <p className="text-xs font-bold text-emerald-300 uppercase tracking-wide mb-1">AI Justification</p>
                    <p className="text-sm text-slate-300 leading-relaxed">{idea.analysis_json.ai_justification.reasoning}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-2 border-dashed border-slate-600/50 p-12 text-center backdrop-blur">
          <div className="space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/30">
              <Zap className="h-8 w-8 text-indigo-400" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-200 mb-2">Ready for Analysis?</h4>
              <p className="text-sm text-slate-400 mb-6">Click "Analyze Now" to unlock AI-powered insights about market potential, risks, and next steps</p>
            </div>
            <Button
              onClick={onAnalyze}
              disabled={isAnalyzing}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold px-8 h-11 rounded-lg shadow-lg shadow-indigo-500/30 transition-all hover:scale-105 active:scale-95"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Run AI Analyzer
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
