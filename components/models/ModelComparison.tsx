'use client';

import { Model } from '@/types/models';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Cpu,
    DollarSign,
    Zap,
    Shield,
    Star,
    CheckCircle2,
    XCircle,
    FileText,
    Clock,
    Globe,
    ExternalLink,
    HelpCircle
} from 'lucide-react';

interface ModelComparisonProps {
    models: Model[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ModelComparison({ models, open, onOpenChange }: ModelComparisonProps) {
    if (models.length === 0) return null;

    const formatCurrency = (amount?: number) => {
        if (amount === undefined || amount === null) return 'N/A';
        return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const formatContext = (ctx?: number | null) => {
        if (!ctx) return 'N/A';
        return ctx >= 1000000 ? `${(ctx / 1000000).toFixed(1)}M` : `${(ctx / 1000).toFixed(0)}K`;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[95vw] lg:max-w-[1200px] max-h-[90vh] overflow-y-auto border-border/40 backdrop-blur-2xl bg-card/95">
                <DialogHeader className="pb-6 border-b border-border/20">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary rounded-xl shadow-lg shadow-primary/20">
                            <Zap className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <DialogTitle className="text-3xl font-black tracking-tighter">Intelligence Comparison</DialogTitle>
                    </div>
                </DialogHeader>

                <div className="py-6 overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-border/20 hover:bg-transparent">
                                <TableHead className="w-[180px] text-[10px] font-black uppercase text-muted-foreground tracking-widest">Benchmark</TableHead>
                                {models.map((model) => (
                                    <TableHead key={model.id} className="min-w-[200px]">
                                        <div className="space-y-1">
                                            <div className="text-lg font-black text-foreground tracking-tight">{model.name}</div>
                                            <div className="text-[10px] font-bold text-primary uppercase tracking-widest">{model.company}</div>
                                        </div>
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {/* Architecture Tier */}
                            <TableRow className="border-border/10 bg-primary/[0.02]">
                                <TableCell className="font-black text-[11px] text-muted-foreground uppercase">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <Cpu className="h-3 w-3 text-primary" /> Architecture
                                        </div>
                                        <div className="text-[9px] font-medium lowercase text-muted-foreground/60 pl-5 leading-tight">
                                            memory capacity (tokens)
                                        </div>
                                    </div>
                                </TableCell>
                                {models.map((model) => (
                                    <TableCell key={model.id}>
                                        <div className="space-y-1">
                                            <div className="text-sm font-black text-foreground">{formatContext(model.context_length)} Tokens</div>
                                            <div className="text-[10px] font-medium text-muted-foreground">{model.model_type.toUpperCase()} Tier</div>
                                        </div>
                                    </TableCell>
                                ))}
                            </TableRow>

                            {/* Token Explainer Row */}
                            <TableRow className="border-border/5 hover:bg-transparent">
                                <TableCell className="py-2">
                                    <div className="flex items-center gap-2 text-[9px] font-bold text-primary/60 uppercase tracking-tighter pl-5">
                                        <HelpCircle className="h-2.5 w-2.5" /> What is this?
                                    </div>
                                </TableCell>
                                <TableCell colSpan={models.length} className="py-2">
                                    <p className="text-[10px] text-muted-foreground italic leading-relaxed">
                                        Tokens represent the model's <strong>"memory window"</strong>. A larger token count (e.g. 1M+) means the model can process much longer documents or keep much longer conversations in its active memory without forgetting the beginning.
                                    </p>
                                </TableCell>
                            </TableRow>

                            {/* Input Pricing */}
                            <TableRow className="border-border/10">
                                <TableCell className="font-black text-[11px] text-muted-foreground uppercase flex items-center gap-2">
                                    <DollarSign className="h-3 w-3" /> Input Cost (1M)
                                </TableCell>
                                {models.map((model) => (
                                    <TableCell key={model.id}>
                                        <span className="text-sm font-black text-foreground">
                                            {formatCurrency(model.pricing?.input)}
                                        </span>
                                    </TableCell>
                                ))}
                            </TableRow>

                            {/* Output Pricing */}
                            <TableRow className="border-border/10">
                                <TableCell className="font-black text-[11px] text-muted-foreground uppercase flex items-center gap-2">
                                    <DollarSign className="h-3 w-3" /> Output Cost (1M)
                                </TableCell>
                                {models.map((model) => (
                                    <TableCell key={model.id}>
                                        <span className="text-sm font-black text-foreground">
                                            {formatCurrency(model.pricing?.output)}
                                        </span>
                                    </TableCell>
                                ))}
                            </TableRow>

                            {/* Access Tier */}
                            <TableRow className="border-border/10">
                                <TableCell className="font-black text-[11px] text-muted-foreground uppercase flex items-center gap-2">
                                    <Shield className="h-3 w-3" /> Access Protocol
                                </TableCell>
                                {models.map((model) => (
                                    <TableCell key={model.id}>
                                        <Badge variant={model.is_open_source ? "outline" : "secondary"} className={model.is_open_source ? "border-emerald-500/20 text-emerald-500" : "bg-primary/10 text-primary border-transparent"}>
                                            {model.is_open_source ? 'OPEN WEIGHTS' : 'PROPRIETARY'}
                                        </Badge>
                                    </TableCell>
                                ))}
                            </TableRow>

                            {/* Personal Rating */}
                            <TableRow className="border-border/10">
                                <TableCell className="font-black text-[11px] text-muted-foreground uppercase flex items-center gap-2">
                                    <Star className="h-3 w-3" /> Honest Rating
                                </TableCell>
                                {models.map((model) => (
                                    <TableCell key={model.id}>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-sm font-black text-foreground">{model.personal_rating || 'N/A'}</span>
                                            <span className="text-[10px] text-muted-foreground">/ 10</span>
                                        </div>
                                    </TableCell>
                                ))}
                            </TableRow>

                            {/* Strategic Pros */}
                            <TableRow className="border-border/10">
                                <TableCell className="font-black text-[11px] text-muted-foreground uppercase py-6 align-top">
                                    <div className="flex items-center gap-2 mt-1">
                                        <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Advantages
                                    </div>
                                </TableCell>
                                {models.map((model) => (
                                    <TableCell key={model.id} className="py-6 align-top">
                                        <p className="text-[11px] font-medium leading-relaxed text-foreground/80 max-w-[250px]">
                                            {model.strengths || 'No specific strengths logged.'}
                                        </p>
                                    </TableCell>
                                ))}
                            </TableRow>

                            {/* Strategic Cons */}
                            <TableRow className="border-border/10">
                                <TableCell className="font-black text-[11px] text-muted-foreground uppercase py-6 align-top">
                                    <div className="flex items-center gap-2 mt-1">
                                        <XCircle className="h-3 w-3 text-destructive" /> Critiques
                                    </div>
                                </TableCell>
                                {models.map((model) => (
                                    <TableCell key={model.id} className="py-6 align-top">
                                        <p className="text-[11px] font-medium leading-relaxed text-foreground/80 max-w-[250px]">
                                            {model.weaknesses || 'No specific critiques logged.'}
                                        </p>
                                    </TableCell>
                                ))}
                            </TableRow>

                            {/* Capabilities Matrix */}
                            <TableRow className="border-border/10">
                                <TableCell className="font-black text-[11px] text-muted-foreground uppercase py-6 align-top">
                                    <div className="flex items-center gap-2 mt-1">
                                        <Globe className="h-3 w-3 text-primary" /> Skill Matrix
                                    </div>
                                </TableCell>
                                {models.map((model) => (
                                    <TableCell key={model.id} className="py-6 align-top">
                                        <div className="flex flex-wrap gap-1.5 max-w-[250px]">
                                            {model.capabilities?.map((cap, i) => (
                                                <Badge key={i} variant="outline" className="text-[9px] font-bold h-5 px-2 bg-primary/5 border-primary/10 text-primary">
                                                    {cap}
                                                </Badge>
                                            )) || <span className="text-[10px] text-muted-foreground italic">Standard tier</span>}
                                        </div>
                                    </TableCell>
                                ))}
                            </TableRow>

                            {/* Technical Evolution */}
                            <TableRow className="border-border/10">
                                <TableCell className="font-black text-[11px] text-muted-foreground uppercase">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-3 w-3" /> Evolution
                                    </div>
                                </TableCell>
                                {models.map((model) => (
                                    <TableCell key={model.id}>
                                        <span className="text-[11px] font-bold text-foreground">
                                            {model.last_model_update ? new Date(model.last_model_update).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Unknown'}
                                        </span>
                                    </TableCell>
                                ))}
                            </TableRow>

                            {/* External Intel */}
                            <TableRow className="border-border/10 bg-muted/20">
                                <TableCell className="font-black text-[11px] text-muted-foreground uppercase">
                                    <div className="flex items-center gap-2">
                                        <ExternalLink className="h-3 w-3" /> External Intel
                                    </div>
                                </TableCell>
                                {models.map((model) => (
                                    <TableCell key={model.id}>
                                        <div className="flex gap-2">
                                            {model.documentation_url && (
                                                <Badge asChild variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground text-[9px] font-black h-6">
                                                    <a href={model.documentation_url} target="_blank" rel="noopener noreferrer">DOCS</a>
                                                </Badge>
                                            )}
                                            {model.url && (
                                                <Badge asChild variant="outline" className="cursor-pointer hover:border-primary hover:text-primary text-[9px] font-black h-6">
                                                    <a href={model.url} target="_blank" rel="noopener noreferrer">SITE</a>
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </DialogContent>
        </Dialog>
    );
}
