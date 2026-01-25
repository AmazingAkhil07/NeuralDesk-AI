'use client';

import { useState, useEffect } from 'react';
import { Model, CreateModelInput, ModelType } from '@/types/models';
import { ModelCard } from '@/components/models/ModelCard';
import { ModelForm } from '@/components/models/ModelForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, Sparkles, Zap, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function ModelsPage() {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<Model | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showOpenSourceOnly, setShowOpenSourceOnly] = useState(false);
  const [isUpdatingModels, setIsUpdatingModels] = useState(false);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header with Glassmorphism */}
      <div className="sticky top-0 z-10 backdrop-blur-xl bg-white/70 border-b border-white/20 shadow-lg">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AI Models Tracker
                </h1>
              </div>
              <p className="text-slate-600 ml-14">
                Discover and track the most powerful AI models
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleUpdateModels}
                disabled={isUpdatingModels}
                variant="outline"
                className="bg-white/80 border-white/20 hover:bg-white shadow-lg"
                size="lg"
              >
                {isUpdatingModels ? (
                  <>
                    <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-5 w-5 mr-2" />
                    Sync Latest Models
                  </>
                )}
              </Button>
              <Button
                onClick={() => {
                  setEditingModel(null);
                  setIsFormOpen(true);
                }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                size="lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Model
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Filters Card with Glassmorphism */}
        <div className="mb-8 p-6 rounded-2xl backdrop-blur-xl bg-white/60 border border-white/20 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-slate-800">Filters & Search</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search models..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/80 border-slate-200 focus:border-blue-400 focus:ring-blue-400"
              />
            </div>

            {/* Company Filter */}
            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
              <SelectTrigger className="bg-white/80 border-slate-200">
                <SelectValue placeholder="All Companies" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Companies</SelectItem>
                {uniqueCompanies.map((company) => (
                  <SelectItem key={company} value={company}>
                    {company}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Type Filter */}
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="bg-white/80 border-slate-200">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="multimodal">Multimodal</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="audio">Audio</SelectItem>
                <SelectItem value="image">Image</SelectItem>
              </SelectContent>
            </Select>

            {/* Open Source Filter */}
            <Button
              variant={showOpenSourceOnly ? 'default' : 'outline'}
              onClick={() => setShowOpenSourceOnly(!showOpenSourceOnly)}
              className={
                showOpenSourceOnly
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white border-0'
                  : 'bg-white/80 border-slate-200'
              }
            >
              {showOpenSourceOnly ? '✓ ' : ''}Open Source
            </Button>
          </div>
        </div>

        {/* Models Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="relative w-16 h-16 mx-auto mb-4">
                <div className="absolute inset-0 rounded-full border-4 border-blue-200"></div>
                <div className="absolute inset-0 rounded-full border-4 border-t-blue-600 animate-spin"></div>
              </div>
              <p className="text-slate-600 font-medium">Loading models...</p>
            </div>
          </div>
        ) : models.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
              <Sparkles className="h-12 w-12 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">No models found</h3>
            <p className="text-slate-600 mb-6">
              {searchQuery || selectedCompany !== 'all' || selectedType !== 'all'
                ? 'Try adjusting your filters'
                : 'Get started by adding your first AI model'}
            </p>
            {!searchQuery && selectedCompany === 'all' && selectedType === 'all' && (
              <Button
                onClick={() => {
                  setEditingModel(null);
                  setIsFormOpen(true);
                }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Model
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {models.map((model) => (
              <ModelCard
                key={model.id}
                model={model}
                onEdit={(model) => {
                  setEditingModel(model);
                  setIsFormOpen(true);
                }}
                onDelete={handleDelete}
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
    </div>
  );
}
