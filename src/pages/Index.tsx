
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
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6">
            <div className="container mx-auto">
              <Button 
                onClick={() => setCurrentView('home')} 
                variant="outline" 
                className="mb-6 border-slate-600 text-slate-300 hover:bg-slate-700"
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
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6">
            <div className="container mx-auto">
              <Button 
                onClick={() => setCurrentView('home')} 
                variant="outline" 
                className="mb-6 border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                ← Back to Home
              </Button>
              <BackgroundRemover />
            </div>
          </div>
        );
      default:
        return (
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
            <div className="container mx-auto px-4 py-16">
              {/* Hero Section */}
              <div className="text-center mb-16">
                <h1 className="text-6xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-6">
                  Web3 Logo Token Creator
                </h1>
                <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
                  Create stunning 1:1 ratio logo tokens for your Web3 presence. 
                  Perfect for SocialFi platforms, NFT profiles, and tokenized identities.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    onClick={() => setCurrentView('editor')}
                    size="lg"
                    className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-lg px-8 py-4"
                  >
                    Start Creating
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  <Button 
                    onClick={() => setCurrentView('templates')}
                    size="lg"
                    variant="outline"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700 text-lg px-8 py-4"
                  >
                    Browse Templates
                  </Button>
                </div>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                <Card 
                  className="bg-slate-800/50 border-slate-700 p-6 hover:border-cyan-400/50 transition-colors cursor-pointer group"
                  onClick={() => setCurrentView('editor')}
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-cyan-400 transition-colors">
                    Smart Upload & Crop
                  </h3>
                  <p className="text-slate-300">
                    Upload any image and let our AI automatically crop it to perfect 1:1 ratio. 
                    Face detection ensures optimal framing.
                  </p>
                </Card>

                <Card 
                  className="bg-slate-800/50 border-slate-700 p-6 hover:border-cyan-400/50 transition-colors cursor-pointer group"
                  onClick={() => setCurrentView('background-remover')}
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Wand2 className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-cyan-400 transition-colors">
                    AI Background Removal
                  </h3>
                  <p className="text-slate-300">
                    Remove backgrounds instantly with our advanced AI. 
                    Perfect for profile pictures and logo isolation.
                  </p>
                </Card>

                <Card 
                  className="bg-slate-800/50 border-slate-700 p-6 hover:border-cyan-400/50 transition-colors cursor-pointer group"
                  onClick={() => setCurrentView('templates')}
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Palette className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-cyan-400 transition-colors">
                    Professional Templates
                  </h3>
                  <p className="text-slate-300">
                    Start with designer templates crafted for Web3. 
                    Crypto, gaming, and minimalist styles available.
                  </p>
                </Card>
              </div>

              {/* Technical Specs */}
              <div className="bg-slate-800/30 rounded-2xl p-8 mb-16">
                <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  Technical Specifications
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-cyan-400 mb-2">1:1</div>
                    <div className="text-slate-300">Perfect Aspect Ratio</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400 mb-2">&lt;1.5MB</div>
                    <div className="text-slate-300">Optimized File Size</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-pink-400 mb-2">4K</div>
                    <div className="text-slate-300">Maximum Resolution</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400 mb-2">WebP</div>
                    <div className="text-slate-300">Next-Gen Formats</div>
                  </div>
                </div>
              </div>

              {/* Call to Action */}
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-4">Ready to Create Your Token Logo?</h2>
                <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
                  Join thousands of Web3 creators who trust our platform for their digital identity. 
                  Start building your tokenized presence today.
                </p>
                <Button 
                  onClick={() => setCurrentView('editor')}
                  size="lg"
                  className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-lg px-12 py-4"
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
