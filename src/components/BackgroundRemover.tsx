
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, Wand2, Download, Copy } from 'lucide-react';
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
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          
          // Simple background removal algorithm
          // Remove pixels that are close to white/light colors
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // Calculate brightness and color similarity to common background colors
            const brightness = (r + g + b) / 3;
            const isWhitish = r > 200 && g > 200 && b > 200;
            const isGrayish = Math.abs(r - g) < 30 && Math.abs(g - b) < 30 && Math.abs(r - b) < 30 && brightness > 180;
            
            // Check for edge pixels (simple edge detection)
            const x = (i / 4) % canvas.width;
            const y = Math.floor(i / 4 / canvas.width);
            const isEdge = x < 5 || x > canvas.width - 5 || y < 5 || y > canvas.height - 5;
            
            if ((isWhitish || isGrayish || brightness > 240) && (isEdge || brightness > 250)) {
              data[i + 3] = 0; // Set alpha to 0 (transparent)
            }
          }
          
          ctx.putImageData(imageData, 0, 0);
          
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

  const copyImage = useCallback(async () => {
    if (!processedImage) return;

    try {
      const response = await fetch(processedImage);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ]);
      toast.success('Image copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy image to clipboard');
    }
  }, [processedImage]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-vibrant-teal via-vibrant-purple to-vibrant-pink bg-clip-text text-transparent mb-2">
          Background Remover
        </h2>
        <p className="text-muted-foreground">Remove backgrounds with smart processing</p>
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
              <div className="flex gap-2">
                <Button 
                  onClick={downloadImage}
                  className="flex-1 bg-gradient-to-r from-vibrant-teal to-vibrant-blue hover:from-vibrant-teal/80 hover:to-vibrant-blue/80"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button 
                  onClick={copyImage}
                  variant="outline"
                  className="hover:bg-vibrant-purple/10"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      <div className="bg-card/30 rounded-lg p-4">
        <h4 className="font-semibold mb-2 text-vibrant-teal">How it works:</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Algorithm removes light backgrounds (white, gray, light colors)</li>
          <li>• Works best with clear subject-background contrast</li>
          <li>• Edge detection helps identify background areas</li>
          <li>• Manual fine-tuning may be needed for complex images</li>
        </ul>
      </div>
    </div>
  );
};

export default BackgroundRemover;
