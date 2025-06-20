
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Template {
  id: string;
  name: string;
  preview: string;
  category: 'minimal' | 'crypto' | 'gaming' | 'artistic';
}

const templates: Template[] = [
  {
    id: '1',
    name: 'Crypto Minimal',
    preview: 'linear-gradient(135deg, hsl(var(--vibrant-purple)) 0%, hsl(var(--vibrant-blue)) 100%)',
    category: 'crypto'
  },
  {
    id: '2',
    name: 'Neon Gaming',
    preview: 'linear-gradient(135deg, hsl(var(--vibrant-pink)) 0%, hsl(var(--vibrant-red-purple)) 100%)',
    category: 'gaming'
  },
  {
    id: '3',
    name: 'Clean Professional',
    preview: 'linear-gradient(135deg, hsl(var(--vibrant-teal)) 0%, hsl(var(--vibrant-blue)) 100%)',
    category: 'minimal'
  },
  {
    id: '4',
    name: 'Artistic Gradient',
    preview: 'linear-gradient(135deg, hsl(var(--vibrant-teal)) 0%, hsl(var(--vibrant-orange)) 100%)',
    category: 'artistic'
  },
  {
    id: '5',
    name: 'Dark Crypto',
    preview: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
    category: 'crypto'
  },
  {
    id: '6',
    name: 'Holographic',
    preview: 'linear-gradient(135deg, hsl(var(--vibrant-pink)) 0%, hsl(var(--vibrant-purple)) 50%, hsl(var(--vibrant-teal)) 100%)',
    category: 'artistic'
  }
];

interface TemplateGalleryProps {
  onSelectTemplate: (template: Template) => void;
}

const TemplateGallery: React.FC<TemplateGalleryProps> = ({ onSelectTemplate }) => {
  const categories = ['minimal', 'crypto', 'gaming', 'artistic'] as const;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'minimal': return 'text-vibrant-teal';
      case 'crypto': return 'text-vibrant-purple';
      case 'gaming': return 'text-vibrant-pink';
      case 'artistic': return 'text-vibrant-orange';
      default: return 'text-foreground';
    }
  };

  const getCategoryHoverColor = (category: string) => {
    switch (category) {
      case 'minimal': return 'hover:border-vibrant-teal/50';
      case 'crypto': return 'hover:border-vibrant-purple/50';
      case 'gaming': return 'hover:border-vibrant-pink/50';
      case 'artistic': return 'hover:border-vibrant-orange/50';
      default: return 'hover:border-border';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-vibrant-teal via-vibrant-purple to-vibrant-pink bg-clip-text text-transparent mb-2">
          Choose Your Template
        </h2>
        <p className="text-muted-foreground">Start with a professionally designed template</p>
      </div>

      {categories.map(category => (
        <div key={category} className="space-y-3">
          <h3 className={`text-lg font-semibold capitalize ${getCategoryColor(category)}`}>
            {category}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {templates
              .filter(template => template.category === category)
              .map(template => (
                <Card 
                  key={template.id}
                  className={`bg-card border-border p-3 ${getCategoryHoverColor(category)} transition-colors cursor-pointer group`}
                  onClick={() => onSelectTemplate(template)}
                >
                  <div 
                    className="w-full aspect-square rounded-lg mb-3 border border-border"
                    style={{ background: template.preview }}
                  />
                  <h4 className={`text-sm font-medium text-center text-muted-foreground group-hover:${getCategoryColor(category)} transition-colors`}>
                    {template.name}
                  </h4>
                  <Button 
                    size="sm" 
                    className="w-full mt-2 bg-gradient-to-r from-vibrant-purple to-vibrant-pink hover:from-vibrant-purple/80 hover:to-vibrant-pink/80 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Use Template
                  </Button>
                </Card>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TemplateGallery;
