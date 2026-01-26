'use client';

import { useState, useEffect } from 'react';
import { Model, CreateModelInput, ModelType } from '@/types/models';
import { ModelCard } from '@/components/models/ModelCard';
import { ModelForm } from '@/components/models/ModelForm';
import { ModelComparison } from '@/components/models/ModelComparison';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, Sparkles, Zap, RefreshCw, TrendingUp } from 'lucide-react';
import { Sidebar } from '@/components/sidebar';
import { toast } from 'sonner';

export default function ModelsPage() {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<Model | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdatingModels, setIsUpdatingModels] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showOpenSourceOnly, setShowOpenSourceOnly] = useState(false);
  const [selectedModels, setSelectedModels] = useState<Model[]>([]);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);

  const formatContextLength = (length: number) => {
    if (!length) return '0';
    if (length >= 1000000) return `${(length / 1000000).toFixed(1)}M`;
    if (length >= 1000) return `${(length / 1000).toFixed(0)}K`;
    return length.toString();
  };

  // Fetch models
  const fetchModels = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCompany !== 'all') params.append('company', selectedCompany);
      if (selectedType !== 'all') params.append('model_type', selectedType);
      if (showOpenSourceOnly) params.append('is_open_source', 'true');

      const response = await fetch(`/api/models?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setModels(data.data || []);
      } else {
        toast.error('Failed to fetch models');
      }
    } catch (error) {
      console.error('Error fetching models:', error);
      toast.error('Failed to fetch models');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, [searchQuery, selectedCompany, selectedType, showOpenSourceOnly]);

  // Create or update model
  const handleSubmit = async (data: CreateModelInput) => {
    try {
      setIsSubmitting(true);
      const url = editingModel ? `/api/models/${editingModel.id}` : '/api/models';
      const method = editingModel ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(editingModel ? 'Model updated successfully' : 'Model added successfully');
        setIsFormOpen(false);
        setEditingModel(null);
        fetchModels();
      } else {
        toast.error(result.error || 'Failed to save model');
      }
    } catch (error) {
      console.error('Error saving model:', error);
      toast.error('Failed to save model');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete model
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this model?')) return;

    try {
      const response = await fetch(`/api/models/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Model deleted successfully');
        fetchModels();
      } else {
        toast.error('Failed to delete model');
      }
    } catch (error) {
      console.error('Error deleting model:', error);
      toast.error('Failed to delete model');
    }
  };

  const toggleModelSelection = (model: Model, isSelected: boolean) => {
    if (isSelected) {
      if (selectedModels.length >= 4) {
        toast.error('Maximum 4 models can be compared at once');
        return;
      }

      // Enforce Same Category
      if (selectedModels.length > 0 && selectedModels[0].model_type !== model.model_type) {
        toast.error(`Category Mismatch: You can only compare models within the "${selectedModels[0].model_type.toUpperCase()}" ecosystem.`);
        return;
      }

      setSelectedModels([...selectedModels, model]);
    } else {
      setSelectedModels(selectedModels.filter((m) => m.id !== model.id));
    }
  };

  // Get unique companies for filter
  const uniqueCompanies = Array.from(new Set(models.map((m) => m.company))).sort();

  // Update latest models from APIs
  const handleUpdateModels = async () => {
    try {
      setIsUpdatingModels(true);
      toast.info('Fetching latest AI models...');

      const response = await fetch('/api/cron/update-models', {
        method: 'POST',
      });

      const result = await response.json();

      if (response.ok) {
        const messages = [];
        if (result.stats.newModels > 0) {
          messages.push(`✨ ${result.stats.newModels} new models added`);
        }
        if (result.stats.updatedModels > 0) {
          messages.push(`🔄 ${result.stats.updatedModels} models updated`);
        }
        // Only show deletions if actually occurred (usually 0 unless pruning happened)
        if (result.stats.deletedOutdated > 0) {
          messages.push(`🗑️ ${result.stats.deletedOutdated} outdated models removed`);
        }

        const message = messages.length > 0
          ? messages.join(' • ')
          : '✓ All models are up to date';

        toast.success(message, { duration: 5000 });
        fetchModels();
      } else {
        toast.error(result.error || 'Failed to update models');
      }
    } catch (error) {
      console.error('Error updating models:', error);
      toast.error('Failed to fetch latest models');
    } finally {
      setIsUpdatingModels(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="overflow-y-auto">
        {/* Header with Glassmorphism */}
        <div className="sticky top-0 z-10 backdrop-blur-xl bg-card/60 border-b border-border/20 shadow-lg">
          <div className="container mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-primary rounded-xl shadow-lg shadow-primary/20">
                    <Sparkles className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h1 className="text-4xl font-bold tracking-tight">
                    Model Tracker
                  </h1>
                </div>
                <p className="text-muted-foreground ml-14">
                  Frontier AI capabilities & technical performance benchmarks
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleUpdateModels}
                  disabled={isUpdatingModels}
                  variant="outline"
                  className="bg-card/50 border-border hover:bg-card hover:text-foreground text-muted-foreground transition-all px-6"
                  size="lg"
                >
                  {isUpdatingModels ? (
                    <RefreshCw className="h-5 w-5 mr-2 animate-spin text-primary" />
                  ) : (
                    <RefreshCw className="h-5 w-5 mr-2" />
                  )}
                  {isUpdatingModels ? 'Syncing...' : 'Sync Models'}
                </Button>
                <Button
                  onClick={() => {
                    setEditingModel(null);
                    setIsFormOpen(true);
                  }}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-xl shadow-primary/20 px-8"
                  size="lg"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add New Model
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-8">
          {/* Search & Filter "Tab" Section */}
          <div className="relative mb-12">
            <div className="absolute -top-6 left-8 px-4 py-1.5 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-[0.2em] rounded-t-xl shadow-lg shadow-primary/20">
              Model Discovery & Insight
            </div>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 rounded-3xl bg-neutral-900 border border-white/5 shadow-2xl backdrop-blur-md relative z-10">
              <div className="relative flex-1 group max-w-xl">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/50 transition-colors group-focus-within:text-primary animate-pulse" />
                <Input
                  placeholder="IDENTIFY ARCHITECTURE, CAPABILITY, OR LAB..."
                  className="pl-14 h-11 bg-white/5 border-white/10 rounded-2xl focus-visible:ring-primary/20 focus-visible:ring-offset-0 font-black tracking-widest text-sm placeholder:text-muted-foreground/30 transition-all focus:bg-white/10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="h-10 w-[1px] bg-white/10 hidden lg:block" />
              <div className="flex-1 lg:max-w-3xl flex gap-3">
                <div className="flex-1">
                  <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                    <SelectTrigger className="bg-white/5 border-white/10 h-11 rounded-xl text-xs font-bold font-black tracking-widest text-[#B5C0D0]">
                      <SelectValue placeholder="All Labs" />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-900 border-white/10">
                      <SelectItem value="all">Every AI Lab</SelectItem>
                      {uniqueCompanies.map((company) => (
                        <SelectItem key={company} value={company}>{company}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="bg-white/5 border-white/10 h-11 rounded-xl text-xs font-bold font-black tracking-widest text-[#B5C0D0]">
                      <SelectValue placeholder="All Modalities" />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-900 border-white/10">
                      <SelectItem value="all">All Modalities</SelectItem>
                      <SelectItem value="text">Text / Reasoning</SelectItem>
                      <SelectItem value="multimodal">Vision / Multimodal</SelectItem>
                      <SelectItem value="video">Sora / Video</SelectItem>
                      <SelectItem value="audio">Voice / Audio</SelectItem>
                      <SelectItem value="image">DALL-E / Image</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant={showOpenSourceOnly ? 'default' : 'outline'}
                  onClick={() => setShowOpenSourceOnly(!showOpenSourceOnly)}
                  className={`h-11 px-6 rounded-xl font-black text-[10px] tracking-widest uppercase transition-all ${showOpenSourceOnly
                    ? 'bg-primary text-primary-foreground border-0 shadow-lg shadow-primary/20'
                    : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10 hover:text-white'
                    }`}
                >
                  {showOpenSourceOnly && <Zap className="w-3 h-3 mr-2 fill-current" />}
                  Weights
                </Button>
              </div>
            </div>
          </div>

          {/* Models Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-4">
                  <div className="absolute inset-0 rounded-full border-2 border-border/20"></div>
                  <div className="absolute inset-0 rounded-full border-2 border-t-primary animate-spin"></div>
                </div>
                <p className="text-muted-foreground font-medium tracking-widest uppercase text-[10px]">Processing Benchmarks</p>
              </div>
            </div>
          ) : models.length === 0 ? (
            <div className="rounded-3xl p-20 text-center border border-border/40 bg-card/20 backdrop-blur-sm">
              <Sparkles className="h-16 w-16 mx-auto mb-6 text-muted-foreground/30" />
              <h3 className="text-xl font-bold mb-2">No Model Signatures Found</h3>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-8">Our discovery engine returned no results for this specific filter set.</p>
              <Button onClick={() => { setSearchQuery(''); setSelectedCompany('all'); }} variant="link" className="text-primary hover:text-primary/80">Reset Database Filters</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {models.map((model) => (
                <ModelCard
                  key={model.id}
                  model={model}
                  onEdit={(m) => {
                    setEditingModel(m);
                    setIsFormOpen(true);
                  }}
                  onDelete={handleDelete}
                  isSelected={selectedModels.some((m) => m.id === model.id)}
                  onSelect={toggleModelSelection}
                  isDisabled={selectedModels.length > 0 && selectedModels[0].model_type !== model.model_type}
                />
              ))}
            </div>
          )}
        </div>

        {/* Model Form Dialog */}
        <ModelForm
          open={isFormOpen}
          onOpenChange={(open) => {
            setIsFormOpen(open);
            if (!open) setEditingModel(null);
          }}
          onSubmit={handleSubmit}
          initialData={editingModel}
          isLoading={isSubmitting}
        />
        {/* Comparison Dock - Floating Bar */}
        {selectedModels.length > 0 && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-5">
            <div className="bg-card/90 backdrop-blur-2xl border border-primary/20 rounded-2xl shadow-2xl p-4 flex items-center gap-6 ring-1 ring-white/10">
              <div className="flex -space-x-3 overflow-hidden">
                {selectedModels.map((m) => (
                  <div key={m.id} className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center border-2 border-background shadow-lg ring-1 ring-primary/20" title={m.name}>
                    <Zap className="h-4 w-4 text-primary-foreground fill-current" />
                  </div>
                ))}
              </div>
              <div className="h-8 w-[1px] bg-border/40" />
              <div className="flex items-center gap-4">
                <div className="text-sm">
                  <span className="font-black text-foreground">{selectedModels.length}</span>
                  <span className="text-muted-foreground ml-1 font-bold">MODELS STAGED</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setSelectedModels([])}
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground font-black text-[10px] tracking-widest uppercase px-4"
                  >
                    CLEAR
                  </Button>
                  <Button
                    onClick={() => setIsComparisonOpen(true)}
                    size="sm"
                    variant="default"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-black text-[10px] tracking-[0.2em] shadow-lg shadow-primary/20 px-6 rounded-xl"
                  >
                    COMPARE BENCHMARKS
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Comparison Modal */}
        <ModelComparison
          models={selectedModels}
          open={isComparisonOpen}
          onOpenChange={setIsComparisonOpen}
        />
      </div>
    </div>
  );
}
