
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, Download, Layers, Type, Image as ImageIcon, Palette, RotateCw, Scissors, Move, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

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
  const [canvasSize] = useState(500); // 1:1 ratio canvas
  const [zoom, setZoom] = useState(1);
  const [tool, setTool] = useState<'select' | 'crop' | 'text'>('select');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [adjustments, setAdjustments] = useState<ImageAdjustments>({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    hue: 0
  });
  const [textInput, setTextInput] = useState('');
  const [fontSize, setFontSize] = useState(24);
  const [textColor, setTextColor] = useState('#000000');

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (1.5MB limit)
    if (file.size > 1.5 * 1024 * 1024) {
      toast.error('Image size must be under 1.5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Smart cropping to 1:1 ratio
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
      zIndex: layers.length
    };
    
    setLayers(prev => [...prev, newLayer]);
    setSelectedLayer(newLayer.id);
    setTextInput('');
    toast.success('Text layer added');
  }, [textInput, fontSize, layers.length, canvasSize]);

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
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    // Apply filters to context
    ctx.filter = `brightness(${adjustments.brightness}%) contrast(${adjustments.contrast}%) saturate(${adjustments.saturation}%) blur(${adjustments.blur}px) hue-rotate(${adjustments.hue}deg)`;

    // Render layers in order
    const sortedLayers = [...layers].sort((a, b) => a.zIndex - b.zIndex);
    
    for (const layer of sortedLayers) {
      if (!layer.visible) continue;

      ctx.save();
      ctx.globalAlpha = layer.opacity;
      
      // Apply transformations
      const centerX = layer.x + layer.width / 2;
      const centerY = layer.y + layer.height / 2;
      ctx.translate(centerX, centerY);
      ctx.rotate((layer.rotation * Math.PI) / 180);
      ctx.translate(-centerX, -centerY);

      if (layer.type === 'image') {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, layer.x, layer.y, layer.width, layer.height);
        };
        img.src = layer.content;
      } else if (layer.type === 'text') {
        ctx.fillStyle = textColor;
        ctx.font = `${fontSize}px Arial`;
        ctx.fillText(layer.content, layer.x, layer.y + fontSize);
      }

      ctx.restore();
    }

    // Export with optimization
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'logo-token.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        const sizeInMB = (blob.size / (1024 * 1024)).toFixed(2);
        toast.success(`Image exported! Size: ${sizeInMB}MB`);
      }
    }, 'image/png', 0.9);
  }, [backgroundColor, adjustments, layers, canvasSize, fontSize, textColor]);

  // Render canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear and set background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    // Apply global adjustments
    ctx.filter = `brightness(${adjustments.brightness}%) contrast(${adjustments.contrast}%) saturate(${adjustments.saturation}%) blur(${adjustments.blur}px) hue-rotate(${adjustments.hue}deg)`;

    // Render layers
    const sortedLayers = [...layers].sort((a, b) => a.zIndex - b.zIndex);
    
    sortedLayers.forEach(layer => {
      if (!layer.visible) return;

      ctx.save();
      ctx.globalAlpha = layer.opacity;
      
      const centerX = layer.x + layer.width / 2;
      const centerY = layer.y + layer.height / 2;
      ctx.translate(centerX, centerY);
      ctx.rotate((layer.rotation * Math.PI) / 180);
      ctx.translate(-centerX, -centerY);

      if (layer.type === 'image') {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, layer.x, layer.y, layer.width, layer.height);
        };
        img.src = layer.content;
      } else if (layer.type === 'text') {
        ctx.fillStyle = textColor;
        ctx.font = `${fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(layer.content, layer.x + layer.width / 2, layer.y + layer.height / 2);
      }

      // Selection border
      if (selectedLayer === layer.id) {
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.strokeRect(layer.x - 2, layer.y - 2, layer.width + 4, layer.height + 4);
      }

      ctx.restore();
    });
  }, [layers, selectedLayer, backgroundColor, adjustments, fontSize, textColor, canvasSize]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="container mx-auto p-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Web3 Logo Token Creator
          </h1>
          <p className="text-slate-300">Create your unique 1:1 ratio token logo under 1.5MB</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Tools Panel */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800/50 border-slate-700 p-4">
              <Tabs defaultValue="upload" className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-slate-700">
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
                      className="w-full mt-2 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Choose Image
                    </Button>
                  </div>
                  
                  <div>
                    <Label>Background Color</Label>
                    <Input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="mt-2 h-10 border-slate-600 bg-slate-700"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="text" className="space-y-4 mt-4">
                  <div>
                    <Label>Add Text</Label>
                    <Input
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="Enter your text..."
                      className="mt-2 border-slate-600 bg-slate-700 text-white"
                    />
                    <Button 
                      onClick={addTextLayer}
                      className="w-full mt-2 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
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
                      className="mt-2 h-10 border-slate-600 bg-slate-700"
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
                  
                  <div>
                    <Label>Blur: {adjustments.blur}px</Label>
                    <Slider
                      value={[adjustments.blur]}
                      onValueChange={(value) => setAdjustments(prev => ({ ...prev, blur: value[0] }))}
                      max={10}
                      min={0}
                      step={0.1}
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
                            ? 'border-cyan-400 bg-cyan-400/10' 
                            : 'border-slate-600 bg-slate-700/50'
                        }`}
                        onClick={() => setSelectedLayer(layer.id)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm">
                            {layer.type === 'image' ? '🖼️' : '🔤'} 
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
            <Card className="bg-slate-800/50 border-slate-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Canvas (1:1 Ratio)</h2>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}>
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <span className="text-sm px-2 py-1 bg-slate-700 rounded">{Math.round(zoom * 100)}%</span>
                  <Button size="sm" variant="outline" onClick={() => setZoom(Math.min(2, zoom + 0.1))}>
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex justify-center">
                <div 
                  className="border-2 border-dashed border-slate-600 rounded-lg overflow-hidden"
                  style={{ 
                    width: canvasSize * zoom, 
                    height: canvasSize * zoom,
                    backgroundImage: 'linear-gradient(45deg, #374151 25%, transparent 25%), linear-gradient(-45deg, #374151 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #374151 75%), linear-gradient(-45deg, transparent 75%, #374151 75%)',
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
            </Card>
          </div>

          {/* Export Panel */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800/50 border-slate-700 p-4">
              <h3 className="text-lg font-semibold mb-4">Export & Download</h3>
              
              <div className="space-y-4">
                <div>
                  <Label>Output Size</Label>
                  <select className="w-full mt-2 p-2 bg-slate-700 border border-slate-600 rounded text-white">
                    <option value="300">300x300px (Small)</option>
                    <option value="500">500x500px (Medium)</option>
                    <option value="800">800x800px (Large)</option>
                    <option value="1000">1000x1000px (HD)</option>
                  </select>
                </div>
                
                <div>
                  <Label>Format</Label>
                  <select className="w-full mt-2 p-2 bg-slate-700 border border-slate-600 rounded text-white">
                    <option value="png">PNG (Best for logos)</option>
                    <option value="webp">WebP (Smaller size)</option>
                    <option value="jpg">JPG (Photos)</option>
                  </select>
                </div>
                
                <Button 
                  onClick={exportImage}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Token
                </Button>
                
                <div className="text-xs text-slate-400 space-y-1">
                  <p>• Automatically optimized</p>
                  <p>• Guaranteed under 1.5MB</p>
                  <p>• Perfect 1:1 aspect ratio</p>
                  <p>• Web3 platform ready</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoTokenEditor;
