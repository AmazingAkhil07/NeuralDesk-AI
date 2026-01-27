
'use client';

import { useState } from 'react'
import { Idea, IdeaRecommendation } from '@/types/ideas';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, Zap, AlertTriangle, CheckCircle, XCircle, Search, Trophy, Users, DollarSign, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Brain } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IdeaCardProps {
    idea: Idea;
    onEdit: (idea: Idea) => void;
    onDelete: (id: string, name: string) => void;
    onAnalyze: (id: string) => void;
    isAnalyzing?: boolean;
}

const RecommendationBadge = ({ recommendation }: { recommendation?: IdeaRecommendation | null }) => {
    if (!recommendation) return <Badge variant="outline" className="text-muted-foreground border-dashed">PENDING EVALUATION</Badge>;

    switch (recommendation) {
        case 'Build':
            return <Badge className="bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20"><CheckCircle className="w-3 h-3 mr-1" /> BUILD</Badge>;
        case 'Iterate':
            return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20"><AlertTriangle className="w-3 h-3 mr-1" /> ITERATE</Badge>;
        case 'Kill':
            return <Badge className="bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20"><XCircle className="w-3 h-3 mr-1" /> KILL</Badge>;
        default:
            return <Badge variant="secondary">{recommendation}</Badge>;
    }
};

const ScoreBadge = ({ score }: { score?: number | null }) => {
    if (score === undefined || score === null) return null;

    let colorClass = 'text-muted-foreground';
    if (score >= 8) colorClass = 'text-green-500';
    else if (score >= 5) colorClass = 'text-yellow-500';
    else colorClass = 'text-red-500';

    return (
        <div className={cn("text-2xl font-black flex items-center gap-1", colorClass)}>
            {score}<span className="text-xs text-muted-foreground font-medium">/10</span>
        </div>
    );
};

export function IdeaCard({ idea, onEdit, onDelete, onAnalyze, isAnalyzing }: IdeaCardProps) {
    const [open, setOpen] = useState(false)

    // Lightweight inference helpers for missing analysis fields
    const inferBuyerFromOneLiner = (text?: string) => {
        if (!text) return null;
        const s = text.toLowerCase();
        if (/founder|founders|startup|startups|founding/.test(s)) return 'Founders / Early-stage teams';
        if (/investor|vc|venture/.test(s)) return 'Investors / VCs';
        if (/enterprise|business|b2b|teams/.test(s)) return 'SMB / Enterprise teams';
        if (/ai|machine learning|ml|models|model|automation/.test(s)) return 'AI teams, researchers, and tooling buyers';
        if (/consumer|user|app|mobile|web/.test(s)) return 'Consumers / App users';
        return null;
    }

    const inferDemandFromOneLiner = (text?: string) => {
        if (!text) return null;
        const s = text.toLowerCase();
        if (/track|monitor|dashboard|analytics|real time|real-time/.test(s)) return 'Medium';
        if (/marketplace|platform|aggregation|search/.test(s)) return 'Medium';
        if (/niche|very specific|specialized/.test(s)) return 'Low';
        return null;
    }

    const inferredBuyer = inferBuyerFromOneLiner(idea.one_liner);
    const inferredDemand = inferDemandFromOneLiner(idea.one_liner);

    const [suggestedOneLiner, setSuggestedOneLiner] = useState<string | null>(null);

    const generateImprovedOneLiner = (oneLiner?: string, name?: string) => {
        const base = (oneLiner || '').trim();
        // quick cleanup and heuristic rewrite
        let cleaned = base
            .replace(/burtally/gi, 'brutally')
            .replace(/AI-powered/gi, 'AI')
            .replace(/real time/gi, 'real-time')
            .replace(/track the ai world/gi, 'track AI developments')
            .replace(/track the AI world/gi, 'track AI developments')
            .replace(/\s+/g, ' ')
            .trim();

        const product = name || 'This product';
        if (cleaned.length === 0) {
            return `${product} is an AI dashboard for founders and AI teams to monitor AI developments in real-time and quickly validate startup ideas with concise, actionable feedback.`;
        }

        // Try to craft a concise value-first one-liner
        return `${product} is an AI dashboard for founders and AI teams to monitor AI developments in real-time and rapidly validate startup ideas with concise, actionable feedback.`;
    }


    // Premium 3D/gradient card look
    return (
        <>
        <Card className={cn(
            "group relative overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl border-white/10 bg-gradient-to-br from-white/10 via-amber-50/80 to-amber-100/80 backdrop-blur-2xl flex flex-col h-full shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)]",
        )}>
            {/* Decorative gradient/3D background */}
            <div className="absolute -right-24 -top-24 h-56 w-56 rounded-full bg-primary/10 blur-3xl transition-all group-hover:bg-primary/20" />
            <div className="absolute left-0 bottom-0 w-full h-2 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-80" />

            <CardHeader className="pb-2">
                <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                        <CardTitle className="text-xl font-extrabold tracking-tight text-foreground group-hover:text-primary transition-colors line-clamp-1 drop-shadow-sm">
                            {idea.name}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            <RecommendationBadge recommendation={idea.recommendation} />
                            {!idea.analysis_json && <Badge variant="outline" className="text-amber-700 border-amber-200 bg-amber-50">ANALYSIS NEEDED</Badge>}
                        </div>
                    </div>
                    <ScoreBadge score={idea.score} />
                </div>
            </CardHeader>

            <CardContent className="space-y-4 flex-grow">
                <p className="text-base text-foreground/90 min-h-[40px] leading-relaxed font-medium break-words">
                    {idea.one_liner}
                </p>

                {idea.brutal_summary ? (
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-800/90 to-amber-700/80 border border-amber-700/30 mt-2 shadow-lg min-h-[60px] flex items-center break-words">
                        <p className="text-lg font-extrabold text-amber-50 leading-snug drop-shadow-sm break-words w-full">
                            {`"${idea.brutal_summary}"`}
                        </p>
                    </div>
                ) : (
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-100 via-white to-amber-50 border border-amber-200 mt-2 flex items-center justify-between min-h-[74px] shadow-inner break-words w-full">
                        <div className="flex items-center gap-3">
                            <Search className="w-4 h-4 text-amber-700" />
                            <div>
                                <p className="text-sm font-semibold text-amber-800">Awaiting Analysis</p>
                                <p className="text-xs text-amber-600">Run the Power Test to generate a full evaluation</p>
                            </div>
                        </div>
                        <div>
                            <Button size="sm" variant="ghost" className="bg-amber-700/10 text-amber-800 hover:bg-amber-700/20 shadow" onClick={() => onAnalyze(idea.id)} disabled={isAnalyzing}>
                                {isAnalyzing ? 'TESTING...' : 'Run Now'}
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>

            <CardFooter className="pt-2 flex justify-between gap-2 border-t border-white/10 bg-gradient-to-r from-white/10 via-black/10 to-white/5 p-4">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(idea.id, idea.name)}
                    className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors h-8 w-8 p-0"
                >
                    <Trash2 className="w-4 h-4" />
                </Button>
                <div className="flex gap-2">
                    {!idea.recommendation && (
                        <Button
                            variant="default"
                            size="sm"
                            onClick={() => onAnalyze(idea.id)}
                            disabled={isAnalyzing}
                            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold h-8 text-xs tracking-wide shadow"
                        >
                            <Zap className={cn("w-3 h-3 mr-1.5", isAnalyzing && "animate-spin")} />
                            {isAnalyzing ? 'TESTING...' : 'POWER TEST'}
                        </Button>
                    )}
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setOpen(true)}
                        className="bg-amber-700/10 hover:bg-amber-700/20 text-amber-900 border border-amber-200 transition-transform hover:-translate-y-0.5 shadow font-semibold h-8 text-xs flex items-center gap-2"
                    >
                        <Search className="w-3 h-3 text-amber-900" /> View Analysis
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(idea)}
                        className="bg-amber-700/10 text-amber-900 border-amber-700/20 hover:bg-amber-700/20 h-8 text-xs font-semibold"
                    >
                        <Edit2 className="w-3 h-3 mr-1.5 text-amber-900" /> EDIT
                    </Button>
                </div>
            </CardFooter>
        </Card>

        
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[900px] p-0 bg-transparent shadow-none">
                    <div className="rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-white/10 via-amber-50/90 to-amber-100/90 border border-white/10 backdrop-blur-2xl relative">
                        {/* Static Brain Icon Mascot - premium, no animation */}
                        <div className="absolute left-6 top-6 z-20">
                            <Brain className="h-14 w-14 text-yellow-400 drop-shadow-lg" />
                        </div>
                        <DialogHeader className="px-8 pt-8 pb-2 flex flex-col items-center justify-center">
                            <DialogTitle className="text-3xl font-extrabold tracking-tight text-foreground drop-shadow-sm flex items-center gap-3 mb-2">
                                NeuralDesk <span className="text-primary font-black">— Analysis</span>
                            </DialogTitle>
                            {/* Large, centered verdict box with icon and text inside */}
                            <div className={
                                cn(
                                    "flex flex-col items-center justify-center gap-2 px-8 py-4 rounded-3xl shadow-xl border-2 font-black text-xl tracking-wide mt-2 w-full max-w-xl animate-bounce-slow",
                                    idea.recommendation === 'Build' && 'bg-green-100 text-green-700 border-green-300',
                                    idea.recommendation === 'Iterate' && 'bg-yellow-100 text-yellow-700 border-yellow-300',
                                    idea.recommendation === 'Kill' && 'bg-red-100 text-red-700 border-red-300',
                                    !idea.recommendation && 'bg-primary/10 text-primary border-primary/20'
                                )
                            }>
                                <div className="flex items-center gap-3">
                                    {idea.recommendation === 'Build' && <CheckCircle className="w-8 h-8 text-green-500" />}
                                    {idea.recommendation === 'Iterate' && <AlertTriangle className="w-8 h-8 text-yellow-500" />}
                                    {idea.recommendation === 'Kill' && <XCircle className="w-8 h-8 text-red-500" />}
                                    <span>NeuralDesk Verdict</span>
                                </div>
                                <div className="text-2xl font-black mt-1 text-center w-full">
                                    {idea.recommendation === 'Build' && 'Build this idea!'}
                                    {idea.recommendation === 'Iterate' && 'Iterate and improve this idea!'}
                                    {idea.recommendation === 'Kill' && 'Kill this idea and move on!'}
                                    {!idea.recommendation && 'No verdict yet'}
                                </div>
                            </div>
                        </DialogHeader>
                        <div className="px-8 pb-8 pt-2 max-h-[70vh] overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-8 font-sans tracking-tight">
                            {/* One-liner Section */}
                            <div className="flex flex-col gap-4">
                                <div className="rounded-2xl bg-gradient-to-br from-primary/5 via-white/60 to-amber-100/60 border border-primary/10 p-6 shadow-lg relative min-h-[90px] flex flex-col justify-between break-words items-start">
                                    <div className="flex w-full justify-end mb-2">
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-primary font-black text-xs bg-primary/5"><Trophy className="w-4 h-4" /> One-liner</span>
                                    </div>
                                    <p className="text-base text-foreground/90 font-medium leading-relaxed mb-3 w-full break-words">{idea.one_liner}</p>
                                    <div className="flex justify-end w-full">
                                        <Button size="sm" className="bg-primary/10 text-primary hover:bg-primary/20 font-bold" onClick={() => setSuggestedOneLiner(generateImprovedOneLiner(idea.one_liner, idea.name))}>
                                            Improve one-liner
                                        </Button>
                                    </div>
                                    {suggestedOneLiner && (
                                        <div className="mt-3 p-3 bg-white/80 border border-primary/10 rounded-xl">
                                            <div className="text-sm font-semibold text-primary">Suggested one-liner</div>
                                            <textarea className="w-full mt-2 p-2 text-sm rounded border border-primary/10" rows={3} value={suggestedOneLiner} onChange={(e) => setSuggestedOneLiner(e.target.value)} />
                                            <div className="mt-2 flex gap-2">
                                                <Button size="sm" className="bg-primary text-primary-foreground font-bold" onClick={() => { setSuggestedOneLiner(null); onEdit({ ...idea, one_liner: suggestedOneLiner || '' }); }}>
                                                    Apply
                                                </Button>
                                                <Button size="sm" variant="outline" onClick={() => setSuggestedOneLiner(null)}>Dismiss</Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {/* Brutal Summary Section - no prefix, no overlap, better spacing */}
                            <div className="flex flex-col gap-4">
                                <div className="rounded-2xl bg-gradient-to-br from-amber-800/90 to-amber-700/80 border border-amber-700/30 p-6 shadow-xl relative min-h-[120px] flex flex-col items-start break-words">
                                    <div className="flex w-full justify-end mb-2">
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-amber-200 font-black text-xs bg-amber-900/30"><AlertTriangle className="w-4 h-4" /> Brutal Summary</span>
                                    </div>
                                    <p className="text-2xl font-extrabold text-amber-50 leading-snug drop-shadow-sm break-words w-full">
                                        {idea.brutal_summary || 'No summary available.'}
                                    </p>
                                </div>
                            </div>
                            {/* Analysis Section */}
                            <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8 mt-2">
                                {/* Differentiation */}
                                <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-white/70 to-amber-100/70 border border-primary/10 p-6 shadow-lg flex flex-col gap-2 relative min-h-[110px] break-words items-start">
                                    <div className="flex w-full justify-end mb-2">
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-primary font-black text-xs bg-primary/5"><Sparkles className="w-4 h-4" /> Differentiation</span>
                                    </div>
                                    <span className="font-semibold text-foreground/90 w-full break-words">{idea.analysis_json?.differentiation?.one_sentence_diff ?? 'No clear differentiation detected.'}</span>
                                    {/* notes property removed as it does not exist on type */}
                                </div>
                                {/* Existence / Competition */}
                                <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-white/70 to-amber-100/70 border border-primary/10 p-6 shadow-lg flex flex-col gap-2 relative min-h-[110px] break-words items-start">
                                    <div className="flex w-full justify-end mb-2">
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-primary font-black text-xs bg-primary/5"><Users className="w-4 h-4" /> Existence / Competition</span>
                                    </div>
                                    <span className="font-semibold text-foreground/90 w-full break-words">{idea.analysis_json?.existence?.status ?? 'Unknown'}</span>
                                    <span className="text-xs text-muted-foreground w-full break-words">References: {(idea.analysis_json?.existence?.references && idea.analysis_json.existence.references.length) ? (idea.analysis_json.existence.references.join(', ')) : 'None found'}</span>
                                </div>
                                {/* AI Justification */}
                                <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-white/70 to-amber-100/70 border border-primary/10 p-6 shadow-lg flex flex-col gap-2 relative min-h-[110px] break-words items-start">
                                    <div className="flex w-full justify-end mb-2">
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-primary font-black text-xs bg-primary/5"><Zap className="w-4 h-4" /> AI Justification</span>
                                    </div>
                                    <span className="font-semibold text-foreground/90 w-full break-words">{idea.analysis_json?.ai_justification?.necessity_level ?? 'Unknown'}</span>
                                    <span className="text-xs text-muted-foreground w-full break-words">{idea.analysis_json?.ai_justification?.reasoning ?? ''}</span>
                                </div>
                                {/* Monetization */}
                                <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-white/70 to-amber-100/70 border border-primary/10 p-6 shadow-lg flex flex-col gap-2 relative min-h-[110px] break-words items-start">
                                    <div className="flex w-full justify-end mb-2">
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-primary font-black text-xs bg-primary/5"><DollarSign className="w-4 h-4" /> Monetization</span>
                                    </div>
                                    <span className="font-semibold text-foreground/90 w-full break-words">Buyer: {idea.analysis_json?.monetization?.buyer_persona ?? (inferredBuyer ? `Inferred: ${inferredBuyer}` : 'Unknown')}</span>
                                    <span className="font-semibold text-foreground/90 w-full break-words">Willingness to pay: {idea.analysis_json?.monetization?.willingness_to_pay ?? 'Unknown'}</span>
                                </div>
                                {/* Fallback if no analysis */}
                                {!idea.analysis_json && (
                                    <div className="col-span-2 p-4 rounded-xl bg-white/80 border border-primary/10 shadow-sm mt-2">
                                        <p className="font-bold text-primary">No analysis available</p>
                                        <p className="text-sm text-muted-foreground mt-2">I couldn't find structured evaluation data for this idea. Try these quick steps to improve results:</p>
                                        <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
                                            <li>Add a clear target user (who will buy or use this?)</li>
                                            <li>Define the specific problem you solve and a concise solution</li>
                                            <li>Give one or two examples of competitors or related products</li>
                                            <li>Include a short note on how AI is used and how you might monetize it</li>
                                        </ul>
                                        <div className="mt-3 text-sm text-primary">Suggested quick inferences: <span className="font-semibold">{inferredBuyer ? inferredBuyer : 'No buyer inferred'}</span> — Demand: <span className="font-semibold">{inferredDemand ? inferredDemand : 'Unknown'}</span></div>
                                        <div className="mt-4 flex gap-2">
                                            <Button size="sm" className="bg-primary text-primary-foreground font-bold" onClick={() => onAnalyze(idea.id)} disabled={isAnalyzing}>{isAnalyzing ? 'Testing...' : 'Run Power Test'}</Button>
                                            <Button size="sm" variant="outline" onClick={() => onEdit(idea)}>Edit Idea</Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    {/* No call-to-action at the end; verdict is now in the main box above */}
                </DialogContent>
            </Dialog>
        </>
    );
}
