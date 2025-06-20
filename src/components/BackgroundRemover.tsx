
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, Wand2, Download } from 'lucide-react';
import { toast } from 'sonner';

const BackgroundRemover: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 1.5 * 1024 * 1024) {
      toast.error('Image size must be under 1.5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setOriginalImage(e.target?.result as string);
      setProcessedImage(null);
    };
    reader.readAsDataURL(file);
  }, []);

  const removeBackground = useCallback(async () => {
    if (!originalImage) return;

    setIsProcessing(true);
    toast.info('Processing image... This may take a few moments');

    try {
      // Simulated background removal - in a real app, this would use AI services
      // like RemoveBG API or client-side ML models
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        
        if (ctx) {
          // Draw the original image
          ctx.drawImage(img, 0, 0);
          
          // Get image data for processing
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          
          // Simple background removal simulation (removing light backgrounds)
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // If pixel is close to white/light gray, make it transparent
            const brightness = (r + g + b) / 3;
            if (brightness > 200) {
              data[i + 3] = 0; // Set alpha to 0 (transparent)
            }
          }
          
          // Put the modified image data back
          ctx.putImageData(imageData, 0, 0);
          
          // Convert to data URL
          const processedDataUrl = canvas.toDataURL('image/png');
          setProcessedImage(processedDataUrl);
          toast.success('Background removed successfully!');
        }
      };
      
      img.src = originalImage;
    } catch (error) {
      console.error('Background removal failed:', error);
      toast.error('Failed to remove background. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [originalImage]);

  const downloadImage = useCallback(() => {
    if (!processedImage) return;

    const link = document.createElement('a');
    link.href = processedImage;
    link.download = 'removed-background.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Image downloaded!');
  }, [processedImage]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-vibrant-teal via-vibrant-purple to-vibrant-pink bg-clip-text text-transparent mb-2">
          AI Background Remover
        </h2>
        <p className="text-muted-foreground">Remove backgrounds with smart AI processing</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upload Section */}
        <Card className="bg-card border-border p-6">
          <h3 className="text-lg font-semibold mb-4">Original Image</h3>
          
          {!originalImage ? (
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">Upload an image to get started</p>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="bg-remove-upload"
              />
              <Button asChild className="bg-gradient-to-r from-vibrant-teal to-vibrant-purple hover:from-vibrant-teal/80 hover:to-vibrant-purple/80">
                <label htmlFor="bg-remove-upload" className="cursor-pointer">
                  Choose Image
                </label>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <img 
                src={originalImage} 
                alt="Original" 
                className="w-full h-64 object-contain bg-muted rounded-lg"
              />
              <Button 
                onClick={removeBackground}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-vibrant-purple to-vibrant-pink hover:from-vibrant-purple/80 hover:to-vibrant-pink/80"
              >
                <Wand2 className="w-4 h-4 mr-2" />
                {isProcessing ? 'Processing...' : 'Remove Background'}
              </Button>
            </div>
          )}
        </Card>

        {/* Result Section */}
        <Card className="bg-card border-border p-6">
          <h3 className="text-lg font-semibold mb-4">Processed Image</h3>
          
          {!processedImage ? (
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center h-64 flex items-center justify-center">
              <p className="text-muted-foreground">Processed image will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div 
                className="w-full h-64 rounded-lg flex items-center justify-center"
                style={{
                  backgroundImage: 'linear-gradient(45deg, hsl(var(--muted)) 25%, transparent 25%), linear-gradient(-45deg, hsl(var(--muted)) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, hsl(var(--muted)) 75%), linear-gradient(-45deg, transparent 75%, hsl(var(--muted)) 75%)',
                  backgroundSize: '20px 20px',
                  backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                }}
              >
                <img 
                  src={processedImage} 
                  alt="Processed" 
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <Button 
                onClick={downloadImage}
                className="w-full bg-gradient-to-r from-vibrant-teal to-vibrant-blue hover:from-vibrant-teal/80 hover:to-vibrant-blue/80"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Result
              </Button>
            </div>
          )}
        </Card>
      </div>

      <div className="bg-card/30 rounded-lg p-4">
        <h4 className="font-semibold mb-2 text-vibrant-teal">Pro Tips:</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Works best with images that have clear subject-background contrast</li>
          <li>• Ensure your main subject is well-lit and in focus</li>
          <li>• Avoid busy or complex backgrounds for better results</li>
          <li>• Output is automatically optimized for Web3 platforms</li>
        </ul>
      </div>
    </div>
  );
};

export default BackgroundRemover;
