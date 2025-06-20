
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Template {
  id: string;
  name: string;
  preview: string;
  category: 'gold' | 'silver' | 'crypto' | 'colored';
  style: '2d' | '3d';
}

const templates: Template[] = [
  {
    id: '1',
    name: 'Classic Gold Coin',
    preview: 'radial-gradient(circle at 30% 30%, #ffd700, #ffed4e, #b8860b)',
    category: 'gold',
    style: '3d'
  },
  {
    id: '2',
    name: 'Gold Ring Token',
    preview: 'conic-gradient(from 0deg, #ffd700, #ffed4e, #daa520, #ffd700)',
    category: 'gold',
    style: '3d'
  },
  {
    id: '3',
    name: 'Silver Coin',
    preview: 'radial-gradient(circle at 30% 30%, #c0c0c0, #e5e5e5, #a8a8a8)',
    category: 'silver',
    style: '3d'
  },
  {
    id: '4',
    name: 'Bronze Token',
    preview: 'radial-gradient(circle at 30% 30%, #cd7f32, #d4af37, #8b4513)',
    category: 'gold',
    style: '3d'
  },
  {
    id: '5',
    name: 'Bitcoin Style',
    preview: 'radial-gradient(circle at 30% 30%, #f7931a, #ffb347, #cc7a00)',
    category: 'crypto',
    style: '2d'
  },
  {
    id: '6',
    name: 'Ethereum Blue',
    preview: 'radial-gradient(circle at 30% 30%, #627eea, #8bb8ff, #4169e1)',
    category: 'crypto',
    style: '2d'
  },
  {
    id: '7',
    name: 'Neon Pink',
    preview: 'radial-gradient(circle at 30% 30%, hsl(var(--vibrant-pink)), #ff8fa3, #c71585)',
    category: 'colored',
    style: '2d'
  },
  {
    id: '8',
    name: 'Cyber Teal',
    preview: 'radial-gradient(circle at 30% 30%, hsl(var(--vibrant-teal)), #20b2aa, #008b8b)',
    category: 'colored',
    style: '2d'
  },
  {
    id: '9',
    name: 'Lightning Yellow',
    preview: 'radial-gradient(circle at 30% 30%, #ffd700, #ffff00, #daa520)',
    category: 'colored',
    style: '2d'
  },
  {
    id: '10',
    name: 'White Token',
    preview: 'radial-gradient(circle at 30% 30%, #ffffff, #f5f5f5, #e0e0e0)',
    category: 'silver',
    style: '2d'
  }
];

interface TemplateGalleryProps {
  onSelectTemplate: (template: Template) => void;
}

const TemplateGallery: React.FC<TemplateGalleryProps> = ({ onSelectTemplate }) => {
  const categories = ['gold', 'silver', 'crypto', 'colored'] as const;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'gold': return 'text-vibrant-orange';
      case 'silver': return 'text-muted-foreground';
      case 'crypto': return 'text-vibrant-purple';
      case 'colored': return 'text-vibrant-pink';
      default: return 'text-foreground';
    }
  };

  const getCategoryHoverColor = (category: string) => {
    switch (category) {
      case 'gold': return 'hover:border-vibrant-orange/50';
      case 'silver': return 'hover:border-muted-foreground/50';
      case 'crypto': return 'hover:border-vibrant-purple/50';
      case 'colored': return 'hover:border-vibrant-pink/50';
      default: return 'hover:border-border';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-vibrant-teal via-vibrant-purple to-vibrant-pink bg-clip-text text-transparent mb-2">
          Choose Your Template
        </h2>
        <p className="text-muted-foreground">Start with a professionally designed token template</p>
      </div>

      {categories.map(category => (
        <div key={category} className="space-y-3">
          <h3 className={`text-lg font-semibold capitalize ${getCategoryColor(category)}`}>
            {category} Tokens
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {templates
              .filter(template => template.category === category)
              .map(template => (
                <Card 
                  key={template.id}
                  className={`bg-card border-border p-3 ${getCategoryHoverColor(category)} transition-colors cursor-pointer group`}
                  onClick={() => onSelectTemplate(template)}
                >
                  <div 
                    className="w-full aspect-square rounded-full mb-3 border-2 border-border/50 relative overflow-hidden"
                    style={{ background: template.preview }}
                  >
                    {/* Add subtle 3D ring effect for 3D templates */}
                    {template.style === '3d' && (
                      <>
                        <div className="absolute inset-2 rounded-full border border-white/20" />
                        <div className="absolute inset-4 rounded-full border border-white/10" />
                      </>
                    )}
                  </div>
                  <h4 className={`text-xs font-medium text-center text-muted-foreground group-hover:${getCategoryColor(category)} transition-colors mb-1`}>
                    {template.name}
                  </h4>
                  <div className="text-xs text-center text-muted-foreground/70 mb-2">
                    {template.style.toUpperCase()} Style
                  </div>
                  <Button 
                    size="sm" 
                    className="w-full text-xs bg-gradient-to-r from-vibrant-purple to-vibrant-pink hover:from-vibrant-purple/80 hover:to-vibrant-pink/80 opacity-0 group-hover:opacity-100 transition-opacity"
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
