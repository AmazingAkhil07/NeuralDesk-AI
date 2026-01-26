'use client'

import { Button } from '@/components/ui/button'
import { TOOL_CATEGORIES } from '@/types/tools'
import { cn } from '@/lib/utils'

interface CategoryFilterProps {
    selectedCategory: string
    onCategoryChange: (category: string) => void
}

export function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
    const categories = ['All', ...TOOL_CATEGORIES]

    return (
        <div className="flex flex-wrap gap-1.5 p-1 bg-white/5 rounded-2xl border border-white/5">
            {categories.map((category) => (
                <Button
                    key={category}
                    variant="ghost"
                    size="sm"
                    className={cn(
                        'rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all duration-500',
                        selectedCategory === category
                            ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 translate-y-[-1px]'
                            : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                    )}
                    onClick={() => onCategoryChange(category)}
                >
                    {category}
                </Button>
            ))}
        </div>
    )
}
