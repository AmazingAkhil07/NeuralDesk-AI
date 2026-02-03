'use client';

import { useState } from 'react';
import { CreateIdeaInput, Idea } from '@/types/ideas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    DialogFooter,
} from '@/components/ui/dialog';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface IdeaFormProps {
    initialData?: Partial<Idea>;
    onSubmit: (data: CreateIdeaInput) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
}

export function IdeaForm({
    initialData,
    onSubmit,
    onCancel,
    isLoading = false,
}: IdeaFormProps) {
    const [formData, setFormData] = useState<CreateIdeaInput>({
        name: initialData?.name || '',
        one_liner: initialData?.one_liner || '',
        problem: initialData?.problem || '',
        target_user: initialData?.target_user || '',
        solution: initialData?.solution || '',
        why_ai: initialData?.why_ai || '',
    });

    const [errors, setErrors] = useState<Partial<Record<keyof CreateIdeaInput, string>>>({});

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof CreateIdeaInput, string>> = {};
        let isValid = true;

        if (!formData.name.trim()) {
            newErrors.name = 'Idea name is required';
            isValid = false;
        }

        if (!formData.one_liner.trim()) {
            newErrors.one_liner = 'One-liner is required';
            isValid = false;
        } else {
            const wordCount = formData.one_liner.split(/\s+/).filter(w => w.length > 0).length;
            if (wordCount > 25) {
                newErrors.one_liner = `Must be 25 words or less (current: ${wordCount})`;
                isValid = false;
            }
        }

        if (!formData.problem.trim() || formData.problem.length < 10) {
            newErrors.problem = 'Please provide a detailed problem statement';
            isValid = false;
        }

        if (!formData.target_user.trim()) {
            newErrors.target_user = 'Target user is required';
            isValid = false;
        }

        if (!formData.solution.trim() || formData.solution.length < 10) {
            newErrors.solution = 'Please provide a detailed solution';
            isValid = false;
        }

        if (!formData.why_ai.trim()) {
            newErrors.why_ai = 'AI justification is required';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            await onSubmit(formData);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 mt-2">
            {/* Name & One Liner Group */}
            <div className="space-y-6">
                <div className="space-y-3">
                    <Label htmlFor="name" className="text-sm font-bold text-zinc-400 uppercase tracking-wider ml-1">
                        Codename / Title
                    </Label>
                    <div className="relative group">
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. NeuralDesk"
                            className={cn(
                                "h-14 bg-zinc-900/50 border-zinc-800 text-lg font-bold text-white placeholder:text-zinc-700 rounded-2xl px-5 transition-all",
                                "focus:bg-zinc-900 focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/10",
                                errors.name && "border-red-500/50 focus:ring-red-500/10"
                            )}
                        />
                        {errors.name && <p className="absolute -bottom-6 left-1 text-xs text-red-500 font-medium flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.name}</p>}
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between items-center ml-1">
                        <Label htmlFor="one_liner" className="text-sm font-bold text-zinc-400 uppercase tracking-wider">
                            The Pitch (One-Liner)
                        </Label>
                        <span className={cn(
                            "text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800",
                            formData.one_liner.split(/\s+/).filter(w => w.length > 0).length > 25 ? 'text-red-400 border-red-900/50' : 'text-zinc-500'
                        )}>
                            {formData.one_liner.split(/\s+/).filter(w => w.length > 0).length} / 25 WORDS
                        </span>
                    </div>
                    <Input
                        id="one_liner"
                        value={formData.one_liner}
                        onChange={(e) => setFormData({ ...formData, one_liner: e.target.value })}
                        placeholder="A personal AI-powered control center to track the AI world..."
                        className={cn(
                            "h-12 bg-zinc-900/50 border-zinc-800 text-base font-medium text-zinc-100 placeholder:text-zinc-700 rounded-xl px-4 transition-all",
                            "focus:bg-zinc-900 focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/10",
                            errors.one_liner && "border-red-500/50"
                        )}
                    />
                    {errors.one_liner && <p className="text-xs text-red-500 font-medium ml-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.one_liner}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                    <Label htmlFor="target_user" className="text-sm font-bold text-zinc-400 uppercase tracking-wider ml-1">Target User</Label>
                    <Input
                        id="target_user"
                        value={formData.target_user}
                        onChange={(e) => setFormData({ ...formData, target_user: e.target.value })}
                        placeholder="e.g. AI Engineers, Indie Founders"
                        className={cn(
                            "h-12 bg-zinc-900/50 border-zinc-800 text-zinc-100 placeholder:text-zinc-700 rounded-xl px-4 transition-all",
                            "focus:bg-zinc-900 focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/10",
                            errors.target_user && "border-red-500/50"
                        )}
                    />
                    {errors.target_user && <p className="text-xs text-red-500 font-medium ml-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.target_user}</p>}
                </div>
            </div>

            {/* Deep Dive Section */}
            <div className="space-y-6 pt-4 border-t border-white/5">
                <h4 className="text-xs font-black text-yellow-500/50 uppercase tracking-[0.2em] mb-4">Deep Dive Analysis</h4>

                <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-3">
                        <Label htmlFor="problem" className="text-sm font-bold text-zinc-400 uppercase tracking-wider ml-1">The Pain (Problem)</Label>
                        <Textarea
                            id="problem"
                            value={formData.problem}
                            onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
                            placeholder="Describe the excruciating pain point. Who is suffering and why?"
                            rows={4}
                            className={cn(
                                "bg-zinc-900/30 border-zinc-800 text-zinc-300 placeholder:text-zinc-700/50 rounded-2xl p-4 resize-none transition-all",
                                "focus:bg-zinc-900 focus:text-white focus:border-yellow-500/30 focus:ring-4 focus:ring-yellow-500/5",
                                errors.problem && "border-red-500/50"
                            )}
                        />
                        {errors.problem && <p className="text-xs text-red-500 font-medium ml-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.problem}</p>}
                    </div>

                    <div className="space-y-3">
                        <Label htmlFor="solution" className="text-sm font-bold text-zinc-400 uppercase tracking-wider ml-1">The Fix (Solution)</Label>
                        <Textarea
                            id="solution"
                            value={formData.solution}
                            onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
                            placeholder="How does it solve the problem? What is the core mechanics?"
                            rows={4}
                            className={cn(
                                "bg-zinc-900/30 border-zinc-800 text-zinc-300 placeholder:text-zinc-700/50 rounded-2xl p-4 resize-none transition-all",
                                "focus:bg-zinc-900 focus:text-white focus:border-yellow-500/30 focus:ring-4 focus:ring-yellow-500/5",
                                errors.solution && "border-red-500/50"
                            )}
                        />
                        {errors.solution && <p className="text-xs text-red-500 font-medium ml-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.solution}</p>}
                    </div>

                    <div className="space-y-3">
                        <Label htmlFor="why_ai" className="text-sm font-bold text-zinc-400 uppercase tracking-wider ml-1">Why AI?</Label>
                        <Textarea
                            id="why_ai"
                            value={formData.why_ai}
                            onChange={(e) => setFormData({ ...formData, why_ai: e.target.value })}
                            placeholder="Is AI essential or just a wrapper? Be honest."
                            rows={3}
                            className={cn(
                                "bg-zinc-900/30 border-zinc-800 text-zinc-300 placeholder:text-zinc-700/50 rounded-2xl p-4 resize-none transition-all",
                                "focus:bg-zinc-900 focus:text-white focus:border-yellow-500/30 focus:ring-4 focus:ring-yellow-500/5",
                                errors.why_ai && "border-red-500/50"
                            )}
                        />
                        {errors.why_ai && <p className="text-xs text-red-500 font-medium ml-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errors.why_ai}</p>}
                    </div>
                </div>
            </div>

            <DialogFooter className="pt-8 flex flex-row gap-3 justify-end border-t border-white/5">
                <Button type="button" variant="ghost" onClick={onCancel} className="bg-transparent hover:bg-white/5 text-zinc-500 hover:text-white font-bold tracking-wide">
                    CANCEL
                </Button>
                <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-yellow-500 hover:bg-yellow-400 text-black font-black tracking-widest px-8 rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.2)] hover:shadow-[0_0_30px_rgba(234,179,8,0.4)] transition-all"
                >
                    {isLoading ? (
                        <span className="flex items-center gap-2"><div className="h-4 w-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> PROCESSING...</span>
                    ) : (
                        initialData?.name ? 'UPDATE THESIS' : 'LAUNCH ARENA TEST'
                    )}
                </Button>
            </DialogFooter>
        </form>
    );
}
