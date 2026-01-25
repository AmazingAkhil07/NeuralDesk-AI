'use client';

import { useState } from 'react';
import { Model, CreateModelInput, ModelType } from '@/types/models';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';

interface ModelFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateModelInput) => Promise<void>;
  initialData?: Model | null;
  isLoading?: boolean;
}

const MODEL_TYPES: { value: ModelType; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'multimodal', label: 'Multimodal' },
  { value: 'video', label: 'Video' },
  { value: 'audio', label: 'Audio' },
  { value: 'image', label: 'Image' },
];

export function ModelForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isLoading = false,
}: ModelFormProps) {
  const [formData, setFormData] = useState<CreateModelInput>(() => {
    if (initialData) {
      return {
        name: initialData.name,
        company: initialData.company,
        model_type: initialData.model_type,
        model_id: initialData.model_id || undefined,
        context_length: initialData.context_length || undefined,
        is_open_source: initialData.is_open_source,
        strengths: initialData.strengths || undefined,
        weaknesses: initialData.weaknesses || undefined,
        description: initialData.description || undefined,
        capabilities: initialData.capabilities || undefined,
        last_model_update: initialData.last_model_update || undefined,
        url: initialData.url || undefined,
        documentation_url: initialData.documentation_url || undefined,
        personal_rating: initialData.personal_rating || undefined,
        notes: initialData.notes || undefined,
      };
    }
    return {
      name: '',
      company: '',
      model_type: 'text',
      is_open_source: false,
    };
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleCapabilitiesChange = (value: string) => {
    const capabilities = value.split(',').map((c) => c.trim()).filter(Boolean);
    setFormData({ ...formData, capabilities });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Model' : 'Add New Model'}</DialogTitle>
          <DialogDescription>
            {initialData
              ? 'Update the model details below.'
              : 'Add a new AI model to your tracker.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Model Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., GPT-4 Turbo"
              required
            />
          </div>

          {/* Company and Model Type Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">
                Company <span className="text-destructive">*</span>
              </Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="e.g., OpenAI"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model_type">
                Type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.model_type}
                onValueChange={(value: ModelType) =>
                  setFormData({ ...formData, model_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MODEL_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Model ID and Context Length */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="model_id">Model ID</Label>
              <Input
                id="model_id"
                value={formData.model_id || ''}
                onChange={(e) => setFormData({ ...formData, model_id: e.target.value })}
                placeholder="e.g., gpt-4-turbo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="context_length">Context Length (tokens)</Label>
              <Input
                id="context_length"
                type="number"
                value={formData.context_length || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    context_length: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
                placeholder="e.g., 128000"
              />
            </div>
          </div>

          {/* Open Source Switch */}
          <div className="flex items-center space-x-2">
            <Switch
              id="is_open_source"
              checked={formData.is_open_source}
              onCheckedChange={(checked) => setFormData({ ...formData, is_open_source: checked })}
            />
            <Label htmlFor="is_open_source" className="cursor-pointer">
              Open Source Model
            </Label>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the model..."
              rows={2}
            />
          </div>

          {/* Strengths */}
          <div className="space-y-2">
            <Label htmlFor="strengths">Strengths</Label>
            <Textarea
              id="strengths"
              value={formData.strengths || ''}
              onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
              placeholder="What the model excels at..."
              rows={2}
            />
          </div>

          {/* Weaknesses */}
          <div className="space-y-2">
            <Label htmlFor="weaknesses">Weaknesses</Label>
            <Textarea
              id="weaknesses"
              value={formData.weaknesses || ''}
              onChange={(e) => setFormData({ ...formData, weaknesses: e.target.value })}
              placeholder="Known limitations..."
              rows={2}
            />
          </div>

          {/* Capabilities */}
          <div className="space-y-2">
            <Label htmlFor="capabilities">Capabilities (comma-separated)</Label>
            <Input
              id="capabilities"
              value={formData.capabilities?.join(', ') || ''}
              onChange={(e) => handleCapabilitiesChange(e.target.value)}
              placeholder="e.g., text, code, reasoning, function calling"
            />
          </div>

          {/* URLs */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="url">Website URL</Label>
              <Input
                id="url"
                type="url"
                value={formData.url || ''}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="documentation_url">Documentation URL</Label>
              <Input
                id="documentation_url"
                type="url"
                value={formData.documentation_url || ''}
                onChange={(e) => setFormData({ ...formData, documentation_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Rating and Last Update */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="personal_rating">Personal Rating (1-10)</Label>
              <Input
                id="personal_rating"
                type="number"
                min="1"
                max="10"
                value={formData.personal_rating || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    personal_rating: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
                placeholder="Rate 1-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_model_update">Last Model Update</Label>
              <Input
                id="last_model_update"
                type="date"
                value={formData.last_model_update || ''}
                onChange={(e) => setFormData({ ...formData, last_model_update: e.target.value })}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Personal Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any personal notes..."
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : initialData ? 'Update Model' : 'Add Model'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
