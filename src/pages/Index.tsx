
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, Palette, Wand2, ArrowRight } from 'lucide-react';
import LogoTokenEditor from '@/components/LogoTokenEditor';
import TemplateGallery from '@/components/TemplateGallery';
import BackgroundRemover from '@/components/BackgroundRemover';

type ViewMode = 'home' | 'editor' | 'templates' | 'background-remover';

const Index = () => {
  const [currentView, setCurrentView] = useState<ViewMode>('home');

  const renderView = () => {
    switch (currentView) {
      case 'editor':
        return <LogoTokenEditor />;
      case 'templates':
        return (
          <div className="min-h-screen bg-background text-foreground p-6">
            <div className="container mx-auto">
              <Button 
                onClick={() => setCurrentView('home')} 
                variant="outline" 
                className="mb-6"
              >
                ← Back to Home
              </Button>
              <TemplateGallery 
                onSelectTemplate={(template) => {
                  console.log('Selected template:', template);
                  setCurrentView('editor');
                }} 
              />
            </div>
          </div>
        );
      case 'background-remover':
        return (
          <div className="min-h-screen bg-background text-foreground p-6">
            <div className="container mx-auto">
              <Button 
                onClick={() => setCurrentView('home')} 
                variant="outline" 
                className="mb-6"
              >
                ← Back to Home
              </Button>
              <BackgroundRemover />
            </div>
          </div>
        );
      default:
        return (
          <div className="min-h-screen bg-background text-foreground">
            <div className="container mx-auto px-4 py-16">
              {/* Hero Section */}
              <div className="text-center mb-16">
                <h1 className="text-6xl font-bold bg-gradient-to-r from-vibrant-teal via-vibrant-purple to-vibrant-pink bg-clip-text text-transparent mb-6">
                  Web3 Logo Token Creator
                </h1>
                <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                  Create stunning 1:1 ratio logo tokens for your Web3 presence. 
                  Perfect for SocialFi platforms, NFT profiles, and tokenized identities.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    onClick={() => setCurrentView('editor')}
                    size="lg"
                    className="bg-gradient-to-r from-vibrant-purple to-vibrant-pink hover:from-vibrant-purple/80 hover:to-vibrant-pink/80 text-lg px-8 py-4"
                  >
                    Start Creating
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  <Button 
                    onClick={() => setCurrentView('templates')}
                    size="lg"
                    variant="outline"
                    className="text-lg px-8 py-4 hover:bg-vibrant-teal/10 hover:border-vibrant-teal"
                  >
                    Browse Templates
                  </Button>
                </div>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                <Card 
                  className="bg-card border-border p-6 hover:border-vibrant-purple/50 transition-colors cursor-pointer group"
                  onClick={() => setCurrentView('editor')}
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-vibrant-purple to-vibrant-pink rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-vibrant-purple transition-colors">
                    Smart Upload & Crop
                  </h3>
                  <p className="text-muted-foreground">
                    Upload any image and let our AI automatically crop it to perfect 1:1 ratio. 
                    Face detection ensures optimal framing.
                  </p>
                </Card>

                <Card 
                  className="bg-card border-border p-6 hover:border-vibrant-pink/50 transition-colors cursor-pointer group"
                  onClick={() => setCurrentView('background-remover')}
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-vibrant-pink to-vibrant-red-purple rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Wand2 className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-vibrant-pink transition-colors">
                    AI Background Removal
                  </h3>
                  <p className="text-muted-foreground">
                    Remove backgrounds instantly with our advanced AI. 
                    Perfect for profile pictures and logo isolation.
                  </p>
                </Card>

                <Card 
                  className="bg-card border-border p-6 hover:border-vibrant-teal/50 transition-colors cursor-pointer group"
                  onClick={() => setCurrentView('templates')}
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-vibrant-teal to-vibrant-blue rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Palette className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-vibrant-teal transition-colors">
                    Professional Templates
                  </h3>
                  <p className="text-muted-foreground">
                    Start with designer templates crafted for Web3. 
                    Crypto, gaming, and minimalist styles available.
                  </p>
                </Card>
              </div>

              {/* Technical Specs */}
              <div className="bg-card/30 rounded-2xl p-8 mb-16">
                <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-vibrant-teal to-vibrant-purple bg-clip-text text-transparent">
                  Technical Specifications
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-vibrant-teal mb-2">1:1</div>
                    <div className="text-muted-foreground">Perfect Aspect Ratio</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-vibrant-purple mb-2">&lt;1.5MB</div>
                    <div className="text-muted-foreground">Optimized File Size</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-vibrant-pink mb-2">4K</div>
                    <div className="text-muted-foreground">Maximum Resolution</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-vibrant-blue mb-2">WebP</div>
                    <div className="text-muted-foreground">Next-Gen Formats</div>
                  </div>
                </div>
              </div>

              {/* Call to Action */}
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-4">Ready to Create Your Token Logo?</h2>
                <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Join thousands of Web3 creators who trust our platform for their digital identity. 
                  Start building your tokenized presence today.
                </p>
                <Button 
                  onClick={() => setCurrentView('editor')}
                  size="lg"
                  className="bg-gradient-to-r from-vibrant-teal to-vibrant-purple hover:from-vibrant-teal/80 hover:to-vibrant-purple/80 text-lg px-12 py-4"
                >
                  Launch Editor
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        );
    }
  };

  return renderView();
};

export default Index;
