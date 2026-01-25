'use client';

import { Model } from '@/types/models';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Cpu,
    DollarSign,
    FileText,
    Activity,
    ShieldCheck,
    Clock,
    Globe,
    Star
} from 'lucide-react';

interface ModelDetailsProps {
    model: Model | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ModelDetails({ model, open, onOpenChange }: ModelDetailsProps) {
    if (!model) return null;

    const formatCurrency = (amount?: number) => {
        if (amount === undefined || amount === null) return 'N/A';
        return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto border-border/40 backdrop-blur-2xl bg-card/95">
                <DialogHeader className="pb-4">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-primary rounded-2xl shadow-lg shadow-primary/20">
                            <Cpu className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <div>
                            <DialogTitle className="text-3xl font-black text-foreground tracking-tight">
                                {model.name}
                            </DialogTitle>
                            <DialogDescription className="font-bold text-primary flex items-center gap-2">
                                Technical Signature • {model.company}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-8 py-4">
                    {/* Top Level Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-2xl bg-background/50 border border-border/40 text-center">
                            <ShieldCheck className="h-5 w-5 mx-auto mb-2 text-primary" />
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Access</span>
                            <span className="text-sm font-bold text-foreground">
                                {model.is_open_source ? 'Open Weights' : 'Proprietary'}
                            </span>
                        </div>
                        <div className="p-4 rounded-2xl bg-background/50 border border-border/40 text-center">
                            <Activity className="h-5 w-5 mx-auto mb-2 text-primary" />
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Context</span>
                            <span className="text-sm font-bold text-foreground">
                                {model.context_length ? (model.context_length / 1000).toFixed(0) + 'k' : 'N/A'} tokens
                            </span>
                        </div>
                        <div className="p-4 rounded-2xl bg-background/50 border border-border/40 text-center">
                            <Star className="h-5 w-5 mx-auto mb-2 text-primary fill-primary/20" />
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Neural Rating</span>
                            <span className="text-sm font-bold text-foreground">
                                {model.personal_rating ? model.personal_rating + ' / 10' : 'Unrated'}
                            </span>
                        </div>
                    </div>

                    {/* Pricing Architecture */}
                    <section>
                        <h3 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <DollarSign className="h-3 w-3" />
                            Token Pricing (per 1M)
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                                <span className="text-[10px] font-black text-primary uppercase mb-1 block">Input Request</span>
                                <span className="text-2xl font-black text-foreground">
                                    {formatCurrency(model.pricing?.input)}
                                </span>
                                <span className="text-[10px] text-muted-foreground ml-1 font-bold">USD</span>
                            </div>
                            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                                <span className="text-[10px] font-black text-primary uppercase mb-1 block">Output Response</span>
                                <span className="text-2xl font-black text-foreground">
                                    {formatCurrency(model.pricing?.output)}
                                </span>
                                <span className="text-[10px] text-muted-foreground ml-1 font-bold">USD</span>
                            </div>
                        </div>
                    </section>

                    {/* Detailed Intelligence */}
                    <div className="grid md:grid-cols-2 gap-8">
                        <section className="space-y-4">
                            <h3 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                                <FileText className="h-3 w-3" />
                                Technical Summary
                            </h3>
                            <p className="text-sm text-foreground/80 leading-relaxed font-medium bg-muted/20 p-4 rounded-2xl border border-border/40">
                                {model.description || 'No descriptive summary available for this architectural signature.'}
                            </p>

                            <h3 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2 pt-2">
                                <Clock className="h-3 w-3" />
                                Latest Evolution
                            </h3>
                            <div className="text-sm font-bold text-foreground/90">
                                {model.last_model_update ? new Date(model.last_model_update).toLocaleDateString('en-US', {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric'
                                }) : 'Unknown'}
                            </div>
                        </section>

                        <section className="space-y-4">
                            <h3 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                                <Globe className="h-3 w-3" />
                                Full Capabilities Matrix
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {model.capabilities?.map((cap, i) => (
                                    <Badge key={i} className="bg-primary/5 text-primary border-primary/20 text-[11px] font-bold px-3 py-1.5 rounded-xl">
                                        {cap}
                                    </Badge>
                                )) || <span className="text-sm text-muted-foreground italic">No specialized capabilities logged.</span>}
                            </div>

                            {model.notes && (
                                <>
                                    <h3 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2 pt-4">
                                        <span>◈</span> Strategic Notes
                                    </h3>
                                    <p className="text-sm text-foreground/70 font-medium italic">
                                        "{model.notes}"
                                    </p>
                                </>
                            )}
                        </section>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
