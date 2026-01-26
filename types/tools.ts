export type ToolStatus = 'Active' | 'Replaced' | 'Testing';
export type ToolPricingModel = 'free' | 'freemium' | 'paid' | 'subscription';

export interface AI_Tool {
  id: string;
  name: string;
  description: string | null;
  category: string;
  url: string | null;
  logo_url: string | null;
  pricing_model: ToolPricingModel | null;
  pricing_details: any;
  features: string[] | null;
  pros: string[] | null;
  cons: string[] | null;
  user_id: string;
  is_favorite: boolean;
  rating: number | null;
  notes: string | null;
  status: ToolStatus;
  replaced_by_id: string | null;
  created_at: string;
  updated_at: string;
}

export const TOOL_CATEGORIES = [
  'Coding & Dev',
  'Image Generation',
  'Video Generation',
  'Audio & Music',
  'Writing & Research',
  'Creative/Vibe',
  'Experimental/Agents',
] as const;

export type ToolCategory = typeof TOOL_CATEGORIES[number];
