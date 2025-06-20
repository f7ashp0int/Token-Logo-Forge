
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, Download, Layers, Type, Image as ImageIcon, Palette, RotateCw, Scissors, Move, ZoomIn, ZoomOut, Circle, Square, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import TemplateGallery from './TemplateGallery';

interface Layer {
  id: string;
  type: 'image' | 'text' | 'shape';
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  visible: boolean;
  zIndex: number;
  isCircularText?: boolean;
  textRadius?: number;
  fontSize?: number;
  fontColor?: string;
}

interface ImageAdjustments {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  hue: number;
}

const LogoTokenEditor = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [layers, setLayers] = useState<Layer[]>([]);
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);
  const [canvasSize] = useState(500);
  const [zoom, setZoom] = useState(1);
  const [tool, setTool] = useState<'select' | 'crop' | 'text'>('select');
  const [backgroundColor, setBackgroundColor] = useState('transparent');
  const [canvasShape, setCanvasShape] = useState<'square' | 'circle'>('circle');
  const [adjustments, setAdjustments] = useState<ImageAdjustments>({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    hue: 0
  });
  const [textInput, setTextInput] = useState('');
  const [fontSize, setFontSize] = useState(24);
  const [textColor, setTextColor] = useState('#ffffff');
  const [isCircularText, setIsCircularText] = useState(false);
  const [textRadius, setTextRadius] = useState(150);
  const [showTemplates, setShowTemplates] = useState(false);

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 1.5 * 1024 * 1024) {
      toast.error('Image size must be under 1.5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const size = Math.min(img.width, img.height);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          canvas.width = canvas.height = size;
          const offsetX = (img.width - size) / 2;
          const offsetY = (img.height - size) / 2;
          
          ctx.drawImage(img, offsetX, offsetY, size, size, 0, 0, size, size);
          
          const newLayer: Layer = {
            id: Date.now().toString(),
            type: 'image',
            content: canvas.toDataURL(),
            x: 50,
            y: 50,
            width: canvasSize - 100,
            height: canvasSize - 100,
            rotation: 0,
            opacity: 1,
            visible: true,
            zIndex: layers.length
          };
          
          setLayers(prev => [...prev, newLayer]);
          setSelectedLayer(newLayer.id);
          toast.success('Image uploaded and auto-cropped to 1:1 ratio');
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, [layers.length, canvasSize]);

  const addTextLayer = useCallback(() => {
    if (!textInput.trim()) {
      toast.error('Please enter some text');
      return;
    }

    const newLayer: Layer = {
      id: Date.now().toString(),
      type: 'text',
      content: textInput,
      x: canvasSize / 2 - 50,
      y: canvasSize / 2,
      width: 100,
      height: fontSize + 10,
      rotation: 0,
      opacity: 1,
      visible: true,
      zIndex: layers.length,
      isCircularText,
      textRadius: isCircularText ? textRadius : undefined,
      fontSize,
      fontColor: textColor
    };
    
    setLayers(prev => [...prev, newLayer]);
    setSelectedLayer(newLayer.id);
    setTextInput('');
    toast.success(`${isCircularText ? 'Circular' : 'Regular'} text layer added`);
  }, [textInput, fontSize, textColor, isCircularText, textRadius, layers.length, canvasSize]);

  const updateLayerProperty = useCallback((layerId: string, property: keyof Layer, value: any) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, [property]: value } : layer
    ));
  }, []);

  const deleteLayer = useCallback((layerId: string) => {
    setLayers(prev => prev.filter(layer => layer.id !== layerId));
    if (selectedLayer === layerId) {
      setSelectedLayer(null);
    }
    toast.success('Layer deleted');
  }, [selectedLayer]);

  const exportImage = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvasSize, canvasSize);
    
    // Set background
    if (backgroundColor !== 'transparent') {
      ctx.fillStyle = backgroundColor;
      if (canvasShape === 'circle') {
        ctx.beginPath();
        ctx.arc(canvasSize / 2, canvasSize / 2, canvasSize / 2, 0, 2 * Math.PI);
        ctx.fill();
      } else {
        ctx.fillRect(0, 0, canvasSize, canvasSize);
      }
    }

    // Apply canvas clipping if circle
    if (canvasShape === 'circle') {
      ctx.save();
      ctx.beginPath();
      ctx.arc(canvasSize / 2, canvasSize / 2, canvasSize / 2, 0, 2 * Math.PI);
      ctx.clip();
    }

    // Render layers
    const sortedLayers = [...layers].sort((a, b) => a.zIndex - b.zIndex);
    
    for (const layer of sortedLayers) {
      if (!layer.visible) continue;

      ctx.save();
      ctx.globalAlpha = layer.opacity;

      if (layer.type === 'image') {
        const img = new Image();
        img.onload = () => {
          const centerX = layer.x + layer.width / 2;
          const centerY = layer.y + layer.height / 2;
          ctx.translate(centerX, centerY);
          ctx.rotate((layer.rotation * Math.PI) / 180);
          ctx.translate(-centerX, -centerY);
          ctx.drawImage(img, layer.x, layer.y, layer.width, layer.height);
        };
        img.src = layer.content;
      } else if (layer.type === 'text') {
        ctx.fillStyle = layer.fontColor || textColor;
        ctx.font = `${layer.fontSize || fontSize}px Arial`;
        
        if (layer.isCircularText && layer.textRadius) {
          // Draw circular text
          const text = layer.content;
          const radius = layer.textRadius;
          const centerX = canvasSize / 2;
          const centerY = canvasSize / 2;
          const angleStep = (2 * Math.PI) / text.length;
          
          for (let i = 0; i < text.length; i++) {
            const angle = i * angleStep + layer.rotation * Math.PI / 180;
            const x = centerX + radius * Math.cos(angle - Math.PI / 2);
            const y = centerY + radius * Math.sin(angle - Math.PI / 2);
            
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle);
            ctx.fillText(text[i], -ctx.measureText(text[i]).width / 2, 0);
            ctx.restore();
          }
        } else {
          // Draw regular text
          const centerX = layer.x + layer.width / 2;
          const centerY = layer.y + layer.height / 2;
          ctx.translate(centerX, centerY);
          ctx.rotate((layer.rotation * Math.PI) / 180);
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(layer.content, 0, 0);
        }
      }

      ctx.restore();
    }

    if (canvasShape === 'circle') {
      ctx.restore();
    }

    // Export
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'token-image.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        const sizeInMB = (blob.size / (1024 * 1024)).toFixed(2);
        toast.success(`Image exported! Size: ${sizeInMB}MB`);
      }
    }, 'image/png', 0.9);
  }, [backgroundColor, canvasShape, layers, canvasSize, fontSize, textColor]);

  const copyCanvasImage = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (blob) {
          await navigator.clipboard.write([
            new ClipboardItem({ [blob.type]: blob })
          ]);
          toast.success('Image copied to clipboard!');
        }
      });
    } catch (error) {
      toast.error('Failed to copy image to clipboard');
    }
  }, []);

  // Render canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvasSize, canvasSize);
    
    // Set background
    if (backgroundColor !== 'transparent') {
      ctx.fillStyle = backgroundColor;
      if (canvasShape === 'circle') {
        ctx.beginPath();
        ctx.arc(canvasSize / 2, canvasSize / 2, canvasSize / 2, 0, 2 * Math.PI);
        ctx.fill();
      } else {
        ctx.fillRect(0, 0, canvasSize, canvasSize);
      }
    }

    // Apply canvas clipping if circle
    if (canvasShape === 'circle') {
      ctx.save();
      ctx.beginPath();
      ctx.arc(canvasSize / 2, canvasSize / 2, canvasSize / 2, 0, 2 * Math.PI);
      ctx.clip();
    }

    // Render layers
    const sortedLayers = [...layers].sort((a, b) => a.zIndex - b.zIndex);
    
    sortedLayers.forEach(layer => {
      if (!layer.visible) return;

      ctx.save();
      ctx.globalAlpha = layer.opacity;

      if (layer.type === 'image') {
        const img = new Image();
        img.onload = () => {
          const centerX = layer.x + layer.width / 2;
          const centerY = layer.y + layer.height / 2;
          ctx.translate(centerX, centerY);
          ctx.rotate((layer.rotation * Math.PI) / 180);
          ctx.translate(-centerX, -centerY);
          ctx.drawImage(img, layer.x, layer.y, layer.width, layer.height);
        };
        img.src = layer.content;
      } else if (layer.type === 'text') {
        ctx.fillStyle = layer.fontColor || textColor;
        ctx.font = `${layer.fontSize || fontSize}px Arial`;
        
        if (layer.isCircularText && layer.textRadius) {
          // Draw circular text
          const text = layer.content;
          const radius = layer.textRadius;
          const centerX = canvasSize / 2;
          const centerY = canvasSize / 2;
          const angleStep = (2 * Math.PI) / text.length;
          
          for (let i = 0; i < text.length; i++) {
            const angle = i * angleStep + layer.rotation * Math.PI / 180;
            const x = centerX + radius * Math.cos(angle - Math.PI / 2);
            const y = centerY + radius * Math.sin(angle - Math.PI / 2);
            
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle);
            ctx.fillText(text[i], -ctx.measureText(text[i]).width / 2, 0);
            ctx.restore();
          }
        } else {
          // Draw regular text
          const centerX = layer.x + layer.width / 2;
          const centerY = layer.y + layer.height / 2;
          ctx.translate(centerX, centerY);
          ctx.rotate((layer.rotation * Math.PI) / 180);
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(layer.content, 0, 0);
        }
      }

      // Selection border
      if (selectedLayer === layer.id && !layer.isCircularText) {
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.strokeRect(layer.x - 2, layer.y - 2, layer.width + 4, layer.height + 4);
      }

      ctx.restore();
    });

    if (canvasShape === 'circle') {
      ctx.restore();
    }

    // Draw canvas border
    ctx.strokeStyle = canvasShape === 'circle' ? '#374151' : '#374151';
    ctx.lineWidth = 2;
    if (canvasShape === 'circle') {
      ctx.beginPath();
      ctx.arc(canvasSize / 2, canvasSize / 2, canvasSize / 2 - 1, 0, 2 * Math.PI);
      ctx.stroke();
    } else {
      ctx.strokeRect(1, 1, canvasSize - 2, canvasSize - 2);
    }
  }, [layers, selectedLayer, backgroundColor, canvasShape, adjustments, fontSize, textColor, canvasSize]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto p-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-vibrant-teal via-vibrant-purple to-vibrant-pink bg-clip-text text-transparent mb-2">
            Token Image Creator
          </h1>
          <p className="text-muted-foreground">Create your unique 1:1 ratio token image under 1.5MB</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Tools Panel */}
          <div className="lg:col-span-1">
            <Card className="bg-card border-border p-4">
              <Tabs defaultValue="upload" className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-secondary">
                  <TabsTrigger value="upload"><Upload className="w-4 h-4" /></TabsTrigger>
                  <TabsTrigger value="text"><Type className="w-4 h-4" /></TabsTrigger>
                  <TabsTrigger value="adjust"><Palette className="w-4 h-4" /></TabsTrigger>
                  <TabsTrigger value="layers"><Layers className="w-4 h-4" /></TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="space-y-4 mt-4">
                  <div>
                    <Label>Upload Image</Label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Button 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full mt-2 bg-gradient-to-r from-vibrant-teal to-vibrant-purple hover:from-vibrant-teal/80 hover:to-vibrant-purple/80"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Choose Image
                    </Button>
                  </div>

                  <div>
                    <Label>Templates</Label>
                    <Button 
                      onClick={() => setShowTemplates(!showTemplates)}
                      variant="outline"
                      className="w-full mt-2"
                    >
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Browse Templates
                    </Button>
                  </div>

                  <div>
                    <Label>Canvas Shape</Label>
                    <div className="flex gap-2 mt-2">
                      <Button
                        onClick={() => setCanvasShape('circle')}
                        variant={canvasShape === 'circle' ? 'default' : 'outline'}
                        size="sm"
                        className="flex-1"
                      >
                        <Circle className="w-4 h-4 mr-1" />
                        Circle
                      </Button>
                      <Button
                        onClick={() => setCanvasShape('square')}
                        variant={canvasShape === 'square' ? 'default' : 'outline'}
                        size="sm"
                        className="flex-1"
                      >
                        <Square className="w-4 h-4 mr-1" />
                        Square
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Background</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        type="color"
                        value={backgroundColor === 'transparent' ? '#ffffff' : backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="h-10 border-border bg-input"
                      />
                      <Button
                        onClick={() => setBackgroundColor('transparent')}
                        variant={backgroundColor === 'transparent' ? 'default' : 'outline'}
                        size="sm"
                      >
                        Transparent
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="text" className="space-y-4 mt-4">
                  <div>
                    <Label>Add Text</Label>
                    <Input
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="Enter your text..."
                      className="mt-2 border-border bg-input text-foreground"
                    />
                    
                    <div className="flex items-center space-x-2 mt-2">
                      <input
                        type="checkbox"
                        id="circular-text"
                        checked={isCircularText}
                        onChange={(e) => setIsCircularText(e.target.checked)}
                        className="rounded"
                      />
                      <Label htmlFor="circular-text" className="text-sm">Circular Text</Label>
                    </div>
                    
                    {isCircularText && (
                      <div className="mt-2">
                        <Label className="text-sm">Radius: {textRadius}px</Label>
                        <Slider
                          value={[textRadius]}
                          onValueChange={(value) => setTextRadius(value[0])}
                          max={200}
                          min={50}
                          step={5}
                          className="mt-1"
                        />
                      </div>
                    )}
                    
                    <Button 
                      onClick={addTextLayer}
                      className="w-full mt-2 bg-gradient-to-r from-vibrant-purple to-vibrant-pink hover:from-vibrant-purple/80 hover:to-vibrant-pink/80"
                    >
                      Add Text
                    </Button>
                  </div>
                  
                  <div>
                    <Label>Font Size: {fontSize}px</Label>
                    <Slider
                      value={[fontSize]}
                      onValueChange={(value) => setFontSize(value[0])}
                      max={100}
                      min={10}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                  
                  <div>
                    <Label>Text Color</Label>
                    <Input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="mt-2 h-10 border-border bg-input"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="adjust" className="space-y-4 mt-4">
                  <div>
                    <Label>Brightness: {adjustments.brightness}%</Label>
                    <Slider
                      value={[adjustments.brightness]}
                      onValueChange={(value) => setAdjustments(prev => ({ ...prev, brightness: value[0] }))}
                      max={200}
                      min={0}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                  
                  <div>
                    <Label>Contrast: {adjustments.contrast}%</Label>
                    <Slider
                      value={[adjustments.contrast]}
                      onValueChange={(value) => setAdjustments(prev => ({ ...prev, contrast: value[0] }))}
                      max={200}
                      min={0}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                  
                  <div>
                    <Label>Saturation: {adjustments.saturation}%</Label>
                    <Slider
                      value={[adjustments.saturation]}
                      onValueChange={(value) => setAdjustments(prev => ({ ...prev, saturation: value[0] }))}
                      max={200}
                      min={0}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="layers" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    {layers.map((layer) => (
                      <div 
                        key={layer.id}
                        className={`p-2 rounded border cursor-pointer transition-colors ${
                          selectedLayer === layer.id 
                            ? 'border-vibrant-teal bg-vibrant-teal/10' 
                            : 'border-border bg-card'
                        }`}
                        onClick={() => setSelectedLayer(layer.id)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm">
                            {layer.type === 'image' ? '🖼️' : layer.isCircularText ? '🔄' : '🔤'} 
                            {layer.type === 'text' ? layer.content.substring(0, 10) : `Image ${layer.id.substring(0, 4)}`}
                          </span>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteLayer(layer.id);
                            }}
                            className="h-6 w-6 p-0"
                          >
                            ×
                          </Button>
                        </div>
                        
                        {selectedLayer === layer.id && (
                          <div className="mt-2 space-y-2">
                            <div>
                              <Label className="text-xs">Opacity: {Math.round(layer.opacity * 100)}%</Label>
                              <Slider
                                value={[layer.opacity]}
                                onValueChange={(value) => updateLayerProperty(layer.id, 'opacity', value[0])}
                                max={1}
                                min={0}
                                step={0.01}
                                className="mt-1"
                              />
                            </div>
                            
                            <div>
                              <Label className="text-xs">Rotation: {layer.rotation}°</Label>
                              <Slider
                                value={[layer.rotation]}
                                onValueChange={(value) => updateLayerProperty(layer.id, 'rotation', value[0])}
                                max={360}
                                min={-360}
                                step={1}
                                className="mt-1"
                              />
                            </div>

                            {layer.isCircularText && (
                              <div>
                                <Label className="text-xs">Text Radius: {layer.textRadius}px</Label>
                                <Slider
                                  value={[layer.textRadius || 150]}
                                  onValueChange={(value) => updateLayerProperty(layer.id, 'textRadius', value[0])}
                                  max={200}
                                  min={50}
                                  step={5}
                                  className="mt-1"
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          {/* Canvas Area */}
          <div className="lg:col-span-2">
            <Card className="bg-card border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Canvas (1:1 Ratio)</h2>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}>
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <span className="text-sm px-2 py-1 bg-secondary rounded">{Math.round(zoom * 100)}%</span>
                  <Button size="sm" variant="outline" onClick={() => setZoom(Math.min(2, zoom + 0.1))}>
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex justify-center">
                <div 
                  className={`border-2 border-dashed border-border overflow-hidden ${canvasShape === 'circle' ? 'rounded-full' : 'rounded-lg'}`}
                  style={{ 
                    width: canvasSize * zoom, 
                    height: canvasSize * zoom,
                    backgroundImage: backgroundColor === 'transparent' ? 'linear-gradient(45deg, #374151 25%, transparent 25%), linear-gradient(-45deg, #374151 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #374151 75%), linear-gradient(-45deg, transparent 75%, #374151 75%)' : 'none',
                    backgroundSize: '20px 20px',
                    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                  }}
                >
                  <canvas
                    ref={canvasRef}
                    width={canvasSize}
                    height={canvasSize}
                    style={{ 
                      width: canvasSize * zoom, 
                      height: canvasSize * zoom,
                      cursor: tool === 'select' ? 'pointer' : 'crosshair'
                    }}
                    className="block"
                  />
                </div>
              </div>

              {showTemplates && (
                <div className="mt-6">
                  <TemplateGallery onSelectTemplate={() => setShowTemplates(false)} />
                </div>
              )}
            </Card>
          </div>

          {/* Export Panel */}
          <div className="lg:col-span-1">
            <Card className="bg-card border-border p-4">
              <h3 className="text-lg font-semibold mb-4">Export & Download</h3>
              
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button 
                    onClick={exportImage}
                    className="flex-1 bg-gradient-to-r from-vibrant-purple to-vibrant-pink hover:from-vibrant-purple/80 hover:to-vibrant-pink/80"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button 
                    onClick={copyCanvasImage}
                    variant="outline"
                    className="hover:bg-vibrant-teal/10"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• Automatically optimized</p>
                  <p>• Guaranteed under 1.5MB</p>
                  <p>• Perfect 1:1 aspect ratio</p>
                  <p>• Web3 platform ready</p>
                </div>
              </div>
            </Card>

            {/* Footer */}
            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>Made with ❤️ by <a href="https://xeenon.xyz/f7ash" target="_blank" rel="noopener noreferrer" className="text-vibrant-purple hover:text-vibrant-pink transition-colors">f7ash</a></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoTokenEditor;
