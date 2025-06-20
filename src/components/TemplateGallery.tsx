
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
    preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    category: 'crypto'
  },
  {
    id: '2',
    name: 'Neon Gaming',
    preview: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    category: 'gaming'
  },
  {
    id: '3',
    name: 'Clean Professional',
    preview: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    category: 'minimal'
  },
  {
    id: '4',
    name: 'Artistic Gradient',
    preview: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    category: 'artistic'
  },
  {
    id: '5',
    name: 'Dark Crypto',
    preview: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 100%)',
    category: 'crypto'
  },
  {
    id: '6',
    name: 'Holographic',
    preview: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
    category: 'artistic'
  }
];

interface TemplateGalleryProps {
  onSelectTemplate: (template: Template) => void;
}

const TemplateGallery: React.FC<TemplateGalleryProps> = ({ onSelectTemplate }) => {
  const categories = ['minimal', 'crypto', 'gaming', 'artistic'] as const;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
          Choose Your Template
        </h2>
        <p className="text-slate-300">Start with a professionally designed template</p>
      </div>

      {categories.map(category => (
        <div key={category} className="space-y-3">
          <h3 className="text-lg font-semibold capitalize text-slate-200">
            {category}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {templates
              .filter(template => template.category === category)
              .map(template => (
                <Card 
                  key={template.id}
                  className="bg-slate-800/50 border-slate-700 p-3 hover:border-cyan-400/50 transition-colors cursor-pointer group"
                  onClick={() => onSelectTemplate(template)}
                >
                  <div 
                    className="w-full aspect-square rounded-lg mb-3 border border-slate-600"
                    style={{ background: template.preview }}
                  />
                  <h4 className="text-sm font-medium text-center text-slate-300 group-hover:text-cyan-400 transition-colors">
                    {template.name}
                  </h4>
                  <Button 
                    size="sm" 
                    className="w-full mt-2 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"
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
