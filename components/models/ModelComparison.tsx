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
import { Button } from '@/components/ui/button';
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
    HelpCircle,
    Search as SearchIcon,
    X
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';

interface ModelComparisonProps {
    models: Model[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ModelComparison({ models, open, onOpenChange }: ModelComparisonProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [showSearch, setShowSearch] = useState(false);

    const winner = useMemo(() => {
        return [...models].sort((a, b) => {
            const rA = a.personal_rating ?? 0;
            const rB = b.personal_rating ?? 0;
            if (rB !== rA) return rB - rA;
            // Tier-break by pricing if ratings are equal
            const costA = (a.pricing?.input || 0) + (a.pricing?.output || 0);
            const costB = (b.pricing?.input || 0) + (b.pricing?.output || 0);
            return costA - costB; // Lower cost wins
        })[0];
    }, [models]);

    const formatCurrency = (amount?: number) => {
        if (amount === undefined || amount === null) return 'N/A';
        return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const formatContext = (ctx?: number | null) => {
        if (!ctx) return 'N/A';
        return ctx >= 1000000 ? `${(ctx / 1000000).toFixed(1)}M` : `${(ctx / 1000).toFixed(0)}K`;
    };

    if (models.length === 0) return null;

    const criteriaRows = [
        { id: 'context', label: 'Architecture', icon: <Cpu className="h-3 w-3 text-primary" />, getValue: (m: Model) => `${formatContext(m.context_length)} Tokens` },
        { id: 'input', label: 'Input Cost', icon: <DollarSign className="h-3 w-3 text-emerald-500" />, getValue: (m: Model) => formatCurrency(m.pricing?.input) },
        { id: 'output', label: 'Output Cost', icon: <DollarSign className="h-3 w-3 text-emerald-500" />, getValue: (m: Model) => formatCurrency(m.pricing?.output) },
        { id: 'access', label: 'Access Protocol', icon: <Shield className="h-3 w-3 text-sky-500" />, getValue: (m: Model) => m.is_open_source ? 'OPEN WEIGHTS' : 'PROPRIETARY' },
        { id: 'rating', label: 'Honest Rating', icon: <Star className="h-3 w-3 text-amber-500" />, getValue: (m: Model) => `${m.personal_rating || 0}/10` },
        { id: 'strengths', label: 'Advantages', icon: <CheckCircle2 className="h-3 w-3 text-emerald-500" />, getValue: (m: Model) => m.strengths || 'N/A' },
        { id: 'weaknesses', label: 'Critiques', icon: <XCircle className="h-3 w-3 text-rose-500" />, getValue: (m: Model) => m.weaknesses || 'N/A' },
        { id: 'capabilities', label: 'Skill Matrix', icon: <Globe className="h-3 w-3 text-primary" />, getValue: (m: Model) => (m.capabilities || []).join(', ') },
        { id: 'evolution', label: 'Evolution', icon: <Clock className="h-3 w-3" />, getValue: (m: Model) => m.last_model_update ? new Date(m.last_model_update).toLocaleDateString() : 'Unknown' },
    ];

    const filteredRows = criteriaRows.filter(row =>
        row.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        models.some(m => row.getValue(m).toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[95vw] lg:max-w-[1200px] max-h-[90vh] overflow-y-auto border-white/10 backdrop-blur-3xl bg-neutral-950/98 p-0">
                <DialogHeader className="p-8 border-b border-white/5 relative flex-row items-center justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary rounded-xl shadow-lg shadow-primary/20">
                                <Zap className="h-5 w-5 text-primary-foreground" />
                            </div>
                            <DialogTitle className="text-3xl font-black tracking-tighter text-white">Intelligence Comparison</DialogTitle>
                        </div>
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Frontier performance benchmarks</p>
                    </div>

                    <div className="flex items-center gap-4 mr-8">
                        {showSearch && (
                            <div className="animate-in slide-in-from-right-4 fade-in duration-300">
                                <input
                                    autoFocus
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="SEARCH BENCHMARKS..."
                                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-black tracking-[0.2em] text-white focus:outline-none focus:ring-1 focus:ring-primary/40 w-64 uppercase"
                                />
                            </div>
                        )}
                        <button
                            onClick={() => setShowSearch(!showSearch)}
                            className={cn(
                                "h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300",
                                showSearch ? "bg-primary text-black" : "bg-white/5 text-muted-foreground hover:text-white"
                            )}
                        >
                            <SearchIcon className="h-5 w-5" />
                        </button>
                    </div>
                </DialogHeader>

                <div className="py-6 overflow-x-auto custom-scrollbar">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-white/5 hover:bg-transparent bg-white/[0.02]">
                                <TableHead className="w-[200px] p-8 text-[10px] font-black uppercase text-white/40 tracking-[0.2em]">Criteria</TableHead>
                                {models.map((model) => (
                                    <TableHead key={model.id} className="min-w-[250px] p-8 border-l border-white/5 text-center relative">
                                        {winner?.id === model.id && (
                                            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
                                                <Badge className="bg-primary text-black font-black text-[8px] tracking-[0.2em] rounded-full border-4 border-neutral-950 px-3 py-1 animate-bounce shadow-lg shadow-primary/20 whitespace-nowrap">
                                                    NEURALDESK CHOICE
                                                </Badge>
                                            </div>
                                        )}
                                        <div className={cn(
                                            "space-y-1 transition-all duration-500",
                                            winner?.id === model.id ? "scale-110" : "opacity-60 grayscale-[0.5]"
                                        )}>
                                            <div className={cn("text-2xl font-black tracking-tight", winner?.id === model.id ? "text-primary italic" : "text-white")}>{model.name}</div>
                                            <div className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">{model.company}</div>
                                        </div>
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredRows.map(row => (
                                <TableRow key={row.id} className="border-white/5 group hover:bg-white/[0.02] transition-colors">
                                    <TableCell className="p-8 font-black text-[11px] text-white/50 uppercase tracking-wider">
                                        <div className="flex items-center gap-3">
                                            {row.icon} {row.label}
                                        </div>
                                    </TableCell>
                                    {models.map((model) => {
                                        const isWinner = winner?.id === model.id;
                                        const value = row.getValue(model);
                                        return (
                                            <TableCell key={model.id} className={cn(
                                                "p-8 text-center border-l border-white/5 transition-all font-bold",
                                                isWinner ? "bg-primary/[0.02] text-primary" : "text-white/90"
                                            )}>
                                                {row.id === 'rating' ? (
                                                    <div className="flex items-center justify-center gap-2 text-2xl tracking-tighter">
                                                        <Star className={cn("h-5 w-5 fill-current", isWinner ? "text-primary" : "text-amber-500")} />
                                                        {value}
                                                    </div>
                                                ) : (
                                                    <div className="text-[12px] leading-relaxed max-w-[250px] mx-auto">
                                                        {value}
                                                    </div>
                                                )}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            ))}

                            <TableRow className="bg-white/[0.02]">
                                <TableCell className="p-8 font-black text-white/40 uppercase text-[10px] tracking-widest">Final Action</TableCell>
                                {models.map((model) => (
                                    <TableCell key={model.id} className="p-8 text-center border-l border-white/5">
                                        <div className="flex flex-col items-center gap-3">
                                            {model.url && (
                                                <Button className={cn(
                                                    "h-12 px-8 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all hover:scale-105 w-full",
                                                    winner?.id === model.id
                                                        ? "bg-primary text-black hover:bg-primary/90 shadow-2xl shadow-primary/40"
                                                        : "bg-white/5 text-white hover:bg-white/10"
                                                )} asChild>
                                                    <a href={model.url} target="_blank" rel="noopener noreferrer">
                                                        DEPLOY MODEL <ExternalLink className="ml-2 h-4 w-4" />
                                                    </a>
                                                </Button>
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
