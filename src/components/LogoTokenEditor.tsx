import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, Download, Layers, Type, Image as ImageIcon, Palette, ZoomIn, ZoomOut, Circle, Square, Copy, Lock, Unlock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import TemplateGallery from './TemplateGallery';

interface Template {
  id: string;
  name: string;
  preview: string;
  category: 'gold' | 'silver' | 'crypto' | 'colored';
  style: '2d' | '3d';
}

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
  locked: boolean;
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
  const marketingCanvasRef = useRef<HTMLCanvasElement>(null);
  const [layers, setLayers] = useState<Layer[]>([]);
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);
  const [canvasSize] = useState(500);
  const [zoom, setZoom] = useState(1);
  const [imageZoom, setImageZoom] = useState(1);
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
  const [rotationDegree, setRotationDegree] = useState(0);
  const [solanaAddress] = useState('2v32BcWsY9TdeTYmNuXRBt782vtgvXdCX3Hg1MjAgczr');
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Address copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy address');
    }
  }, []);

  const handleCanvasMouseDown = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / zoom;
    const y = (event.clientY - rect.top) / zoom;

    // Check if click is on any layer
    let clickedLayer = null;
    const sortedLayers = [...layers].sort((a, b) => b.zIndex - a.zIndex);

    for (const layer of sortedLayers) {
      if (!layer.visible || layer.locked) continue;
      
      if (x >= layer.x && x <= layer.x + layer.width &&
          y >= layer.y && y <= layer.y + layer.height) {
        clickedLayer = layer.id;
        break;
      }
    }

    if (clickedLayer) {
      setSelectedLayer(clickedLayer);
      setIsDragging(true);
      setDragStart({ x, y });
    } else {
      setSelectedLayer(null);
    }
  }, [layers, zoom]);

  const handleCanvasMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !selectedLayer) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / zoom;
    const y = (event.clientY - rect.top) / zoom;

    const deltaX = x - dragStart.x;
    const deltaY = y - dragStart.y;

    setLayers(prev => prev.map(layer => 
      layer.id === selectedLayer 
        ? { ...layer, x: layer.x + deltaX, y: layer.y + deltaY }
        : layer
    ));

    setDragStart({ x, y });
  }, [isDragging, selectedLayer, dragStart, zoom]);

  const handleCanvasMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTemplateSelect = useCallback((template: Template) => {
    // Create template background layer
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      canvas.width = canvas.height = canvasSize;
      
      // Create the gradient based on template style
      if (template.style === '3d') {
        // Create 3D-like gradient
        const gradient = ctx.createRadialGradient(
          canvasSize * 0.3, canvasSize * 0.3, 0,
          canvasSize / 2, canvasSize / 2, canvasSize / 2
        );
        
        // Apply different colors based on category
        switch (template.category) {
          case 'gold':
            gradient.addColorStop(0, '#ffd700');
            gradient.addColorStop(0.5, '#ffed4e');
            gradient.addColorStop(1, '#b8860b');
            break;
          case 'silver':
            gradient.addColorStop(0, '#c0c0c0');
            gradient.addColorStop(0.5, '#e5e5e5');
            gradient.addColorStop(1, '#a8a8a8');
            break;
          case 'crypto':
            gradient.addColorStop(0, '#f7931a');
            gradient.addColorStop(0.5, '#ffb347');
            gradient.addColorStop(1, '#cc7a00');
            break;
          case 'colored':
            gradient.addColorStop(0, '#AD03DE');
            gradient.addColorStop(0.5, '#FF69B4');
            gradient.addColorStop(1, '#E40078');
            break;
        }
        
        ctx.fillStyle = gradient;
      } else {
        // Create 2D flat color
        switch (template.category) {
          case 'gold':
            ctx.fillStyle = '#daa520';
            break;
          case 'silver':
            ctx.fillStyle = '#c0c0c0';
            break;
          case 'crypto':
            ctx.fillStyle = '#f7931a';
            break;
          case 'colored':
            ctx.fillStyle = '#AD03DE';
            break;
        }
      }
      
      if (canvasShape === 'circle') {
        ctx.beginPath();
        ctx.arc(canvasSize / 2, canvasSize / 2, canvasSize / 2, 0, 2 * Math.PI);
        ctx.fill();
      } else {
        ctx.fillRect(0, 0, canvasSize, canvasSize);
      }
      
      // Add 3D effects for 3D templates
      if (template.style === '3d') {
        // Add highlight
        const highlightGradient = ctx.createRadialGradient(
          canvasSize * 0.2, canvasSize * 0.2, 0,
          canvasSize / 2, canvasSize / 2, canvasSize / 2
        );
        highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = highlightGradient;
        
        if (canvasShape === 'circle') {
          ctx.beginPath();
          ctx.arc(canvasSize / 2, canvasSize / 2, canvasSize / 2, 0, 2 * Math.PI);
          ctx.fill();
        } else {
          ctx.fillRect(0, 0, canvasSize, canvasSize);
        }
        
        // Add inner ring
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 2;
        if (canvasShape === 'circle') {
          ctx.beginPath();
          ctx.arc(canvasSize / 2, canvasSize / 2, canvasSize / 2 - 20, 0, 2 * Math.PI);
          ctx.stroke();
        }
      }
      
      const templateDataUrl = canvas.toDataURL();
      
      const newLayer: Layer = {
        id: Date.now().toString(),
        type: 'image',
        content: templateDataUrl,
        x: 0,
        y: 0,
        width: canvasSize,
        height: canvasSize,
        rotation: 0,
        opacity: 1,
        visible: true,
        locked: false,
        zIndex: 0
      };
      
      setLayers([newLayer]);
      setSelectedLayer(newLayer.id);
      setShowTemplates(false);
      toast.success(`${template.name} template applied!`);
    }
  }, [canvasSize, canvasShape]);

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
            width: (canvasSize - 100) * imageZoom,
            height: (canvasSize - 100) * imageZoom,
            rotation: 0,
            opacity: 1,
            visible: true,
            locked: false,
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
  }, [layers.length, canvasSize, imageZoom]);

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
      locked: false,
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

  const toggleLayerLock = useCallback((layerId: string) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, locked: !layer.locked } : layer
    ));
    toast.success('Layer lock toggled');
  }, []);

  const handleRotationChange = useCallback((degree: number) => {
    setRotationDegree(degree);
    if (selectedLayer) {
      updateLayerProperty(selectedLayer, 'rotation', degree);
    }
  }, [selectedLayer, updateLayerProperty]);

  const moveLayerUp = useCallback((layerId: string) => {
    setLayers(prev => {
      const newLayers = [...prev];
      const currentIndex = newLayers.findIndex(l => l.id === layerId);
      if (currentIndex > 0) {
        [newLayers[currentIndex], newLayers[currentIndex - 1]] = [newLayers[currentIndex - 1], newLayers[currentIndex]];
      }
      return newLayers;
    });
  }, []);

  const moveLayerDown = useCallback((layerId: string) => {
    setLayers(prev => {
      const newLayers = [...prev];
      const currentIndex = newLayers.findIndex(l => l.id === layerId);
      if (currentIndex < newLayers.length - 1) {
        [newLayers[currentIndex], newLayers[currentIndex + 1]] = [newLayers[currentIndex + 1], newLayers[currentIndex]];
      }
      return newLayers;
    });
  }, []);

  // Update selected layer properties when UI controls change
  useEffect(() => {
    if (selectedLayer) {
      const layer = layers.find(l => l.id === selectedLayer);
      if (layer && layer.type === 'text') {
        setFontSize(layer.fontSize || 24);
        setTextColor(layer.fontColor || '#ffffff');
        setIsCircularText(layer.isCircularText || false);
        setTextRadius(layer.textRadius || 150);
        setRotationDegree(layer.rotation);
      }
    }
  }, [selectedLayer, layers]);

  // Update layer when text controls change
  useEffect(() => {
    if (selectedLayer) {
      const layer = layers.find(l => l.id === selectedLayer);
      if (layer && layer.type === 'text') {
        updateLayerProperty(selectedLayer, 'fontSize', fontSize);
        updateLayerProperty(selectedLayer, 'fontColor', textColor);
        updateLayerProperty(selectedLayer, 'isCircularText', isCircularText);
        updateLayerProperty(selectedLayer, 'textRadius', textRadius);
      }
    }
  }, [fontSize, textColor, isCircularText, textRadius, selectedLayer, updateLayerProperty]);

  const generateMarketingImage = useCallback(() => {
    const marketingCanvas = marketingCanvasRef.current;
    if (!marketingCanvas) return;

    const ctx = marketingCanvas.getContext('2d');
    if (!ctx) return;

    const marketingSize = 800;
    marketingCanvas.width = marketingSize;
    marketingCanvas.height = marketingSize;

    // Create 3D-like background
    const gradient = ctx.createLinearGradient(0, 0, marketingSize, marketingSize);
    gradient.addColorStop(0, '#1A1A1A');
    gradient.addColorStop(1, '#333333');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, marketingSize, marketingSize);

    // Create 3D token base
    const tokenSize = 300;
    const centerX = marketingSize / 2;
    const centerY = marketingSize / 2 - 50;

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(centerX, centerY + 20, tokenSize / 2, tokenSize / 8, 0, 0, 2 * Math.PI);
    ctx.fill();

    // Token base
    ctx.fillStyle = '#2A2A2A';
    ctx.beginPath();
    ctx.arc(centerX, centerY, tokenSize / 2, 0, 2 * Math.PI);
    ctx.fill();

    // Create a smaller version of the token design
    const tokenCanvas = document.createElement('canvas');
    const tokenCtx = tokenCanvas.getContext('2d');
    if (tokenCtx) {
      tokenCanvas.width = tokenCanvas.height = tokenSize;

      // Render the actual token design
      if (backgroundColor !== 'transparent') {
        tokenCtx.fillStyle = backgroundColor;
        if (canvasShape === 'circle') {
          tokenCtx.beginPath();
          tokenCtx.arc(tokenSize / 2, tokenSize / 2, tokenSize / 2, 0, 2 * Math.PI);
          tokenCtx.fill();
        } else {
          tokenCtx.fillRect(0, 0, tokenSize, tokenSize);
        }
      }

      // Render layers
      const sortedLayers = [...layers].sort((a, b) => a.zIndex - b.zIndex);
      const scale = tokenSize / canvasSize;

      sortedLayers.forEach(layer => {
        if (!layer.visible) return;

        tokenCtx.save();
        tokenCtx.globalAlpha = layer.opacity;

        if (layer.type === 'image') {
          const img = new Image();
          img.onload = () => {
            const scaledX = layer.x * scale;
            const scaledY = layer.y * scale;
            const scaledWidth = layer.width * scale;
            const scaledHeight = layer.height * scale;
            const centerX = scaledX + scaledWidth / 2;
            const centerY = scaledY + scaledHeight / 2;
            
            tokenCtx.translate(centerX, centerY);
            tokenCtx.rotate((layer.rotation * Math.PI) / 180);
            tokenCtx.translate(-centerX, -centerY);
            tokenCtx.drawImage(img, scaledX, scaledY, scaledWidth, scaledHeight);
          };
          img.src = layer.content;
        } else if (layer.type === 'text') {
          tokenCtx.fillStyle = layer.fontColor || textColor;
          tokenCtx.font = `${(layer.fontSize || fontSize) * scale}px Arial`;
          
          if (layer.isCircularText && layer.textRadius) {
            const text = layer.content;
            const radius = layer.textRadius * scale;
            const centerX = tokenSize / 2;
            const centerY = tokenSize / 2;
            const angleStep = (2 * Math.PI) / text.length;
            
            for (let i = 0; i < text.length; i++) {
              const angle = i * angleStep + layer.rotation * Math.PI / 180;
              const x = centerX + radius * Math.cos(angle - Math.PI / 2);
              const y = centerY + radius * Math.sin(angle - Math.PI / 2);
              
              tokenCtx.save();
              tokenCtx.translate(x, y);
              tokenCtx.rotate(angle);
              tokenCtx.fillText(text[i], -tokenCtx.measureText(text[i]).width / 2, 0);
              tokenCtx.restore();
            }
          } else {
            const scaledX = layer.x * scale;
            const scaledY = layer.y * scale;
            const scaledWidth = layer.width * scale;
            const scaledHeight = layer.height * scale;
            const centerX = scaledX + scaledWidth / 2;
            const centerY = scaledY + scaledHeight / 2;
            
            tokenCtx.translate(centerX, centerY);
            tokenCtx.rotate((layer.rotation * Math.PI) / 180);
            tokenCtx.textAlign = 'center';
            tokenCtx.textBaseline = 'middle';
            tokenCtx.fillText(layer.content, 0, 0);
          }
        }

        tokenCtx.restore();
      });

      // Apply the token design to the marketing canvas
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, tokenSize / 2 - 10, 0, 2 * Math.PI);
      ctx.clip();
      ctx.drawImage(tokenCanvas, centerX - tokenSize / 2, centerY - tokenSize / 2);
      ctx.restore();

      // Add 3D highlight
      const highlightGradient = ctx.createRadialGradient(
        centerX - 50, centerY - 50, 0,
        centerX, centerY, tokenSize / 2
      );
      highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
      highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = highlightGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, tokenSize / 2 - 10, 0, 2 * Math.PI);
      ctx.fill();
    }
  }, [layers, backgroundColor, canvasShape, canvasSize, fontSize, textColor]);

  const exportMarketingImage = useCallback(() => {
    generateMarketingImage();
    
    setTimeout(() => {
      const marketingCanvas = marketingCanvasRef.current;
      if (!marketingCanvas) return;

      marketingCanvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'token-marketing-image.png';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          
          const sizeInMB = (blob.size / (1024 * 1024)).toFixed(2);
          toast.success(`Marketing image exported! Size: ${sizeInMB}MB`);
        }
      }, 'image/png', 0.9);
    }, 100);
  }, [generateMarketingImage]);

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
        ctx.strokeStyle = '#AD03DE';
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
                    <Label>Image Zoom: {Math.round(imageZoom * 100)}%</Label>
                    <Slider
                      value={[imageZoom]}
                      onValueChange={(value) => setImageZoom(value[0])}
                      max={2}
                      min={0.1}
                      step={0.1}
                      className="mt-2"
                    />
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

                  {selectedLayer && layers.find(l => l.id === selectedLayer)?.type === 'text' && (
                    <div className="border-t border-border pt-4">
                      <Label className="text-sm font-medium">Edit Selected Text</Label>
                      <Input
                        value={layers.find(l => l.id === selectedLayer)?.content || ''}
                        onChange={(e) => updateLayerProperty(selectedLayer, 'content', e.target.value)}
                        placeholder="Edit text..."
                        className="mt-2 border-border bg-input text-foreground"
                      />
                    </div>
                  )}
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
                    {layers.map((layer, index) => (
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
                          <span className="text-sm flex items-center gap-2">
                            {layer.type === 'image' ? '🖼️' : layer.isCircularText ? '🔄' : '🔤'} 
                            {layer.type === 'text' ? layer.content.substring(0, 10) : `Image ${layer.id.substring(0, 4)}`}
                            {layer.locked && <Lock className="w-3 h-3 text-vibrant-orange" />}
                          </span>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                moveLayerUp(layer.id);
                              }}
                              className="h-6 w-6 p-0"
                              disabled={index === 0}
                            >
                              ↑
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                moveLayerDown(layer.id);
                              }}
                              className="h-6 w-6 p-0"
                              disabled={index === layers.length - 1}
                            >
                              ↓
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleLayerLock(layer.id);
                              }}
                              className="h-6 w-6 p-0"
                            >
                              {layer.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                            </Button>
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
                              <Label className="text-xs">Rotation: {rotationDegree}°</Label>
                              <div className="flex gap-2 mt-1">
                                <Slider
                                  value={[rotationDegree]}
                                  onValueChange={(value) => handleRotationChange(value[0])}
                                  max={360}
                                  min={-360}
                                  step={1}
                                  className="flex-1"
                                />
                                <Input
                                  type="number"
                                  value={rotationDegree}
                                  onChange={(e) => handleRotationChange(Number(e.target.value))}
                                  className="w-16 h-8 text-xs"
                                  min={-360}
                                  max={360}
                                />
                              </div>
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
                    onMouseDown={handleCanvasMouseDown}
                    onMouseMove={handleCanvasMouseMove}
                    onMouseUp={handleCanvasMouseUp}
                  />
                </div>
              </div>

              {showTemplates && (
                <div className="mt-6">
                  <TemplateGallery onSelectTemplate={handleTemplateSelect} />
                </div>
              )}
            </Card>

            {/* Hidden marketing canvas */}
            <canvas ref={marketingCanvasRef} className="hidden" />
          </div>

          {/* Export Panel */}
          <div className="lg:col-span-1">
            <Card className="bg-card border-border p-4">
              <h3 className="text-lg font-semibold mb-4">Export & Download</h3>
              
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button 
                    onClick={exportImage}
                    className="flex-1 bg-gradient-to-r from-vibrant-purple to-vibrant-pink hover:from-vibrant-purple/80 hover:to-vibrant-pink/80 border border-vibrant-purple/50 shadow-lg shadow-vibrant-purple/25"
                    style={{
                      filter: 'drop-shadow(0 0 8px rgba(173, 3, 222, 0.3))'
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Token
                  </Button>
                  <Button 
                    onClick={copyCanvasImage}
                    variant="outline"
                    className="hover:bg-vibrant-teal/10"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>

                <Button 
                  onClick={exportMarketingImage}
                  className="w-full bg-gradient-to-r from-vibrant-teal to-vibrant-blue hover:from-vibrant-teal/80 hover:to-vibrant-blue/80 border border-vibrant-teal/50 shadow-lg shadow-vibrant-teal/25"
                  style={{
                    filter: 'drop-shadow(0 0 8px rgba(0, 131, 141, 0.3))'
                  }}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Export 3D Preview
                </Button>
                
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• Automatically optimized</p>
                  <p>• Guaranteed under 1.5MB</p>
                  <p>• Perfect 1:1 aspect ratio</p>
                  <p>• Your design, your rights</p>
                </div>

                {/* Donation Section */}
                <div className="mt-6 p-3 bg-secondary/30 rounded-lg border border-vibrant-purple/20">
                  <p className="text-xs text-center text-muted-foreground mb-2">
                    Donations of Tokens accepted
                  </p>
                  <div className="flex items-center gap-2 p-2 bg-card rounded border">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#9945FF] to-[#14F195] flex items-center justify-center">
                      <svg width="12" height="12" viewBox="0 0 397.7 311.7" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <linearGradient id="logosGradient" x1="360.8793" y1="351.4553" x2="141.213" y2="-69.2936" gradientUnits="userSpaceOnUse">
                          <stop offset="0" stopColor="#00FFA3"/>
                          <stop offset="1" stopColor="#DC1FFF"/>
                        </linearGradient>
                        <path d="M64.6 237.9c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1L64.6 237.9z" fill="url(#logosGradient)"/>
                        <path d="M64.6 3.8C67.1 1.4 70.4 0 73.8 0h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1L64.6 3.8z" fill="url(#logosGradient)"/>
                        <path d="M333.1 120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8 0-8.7 7-4.6 11.1l62.7 62.7c2.4 2.4 5.7 3.8 9.2 3.8h317.4c5.8 0 8.7-7 4.6-11.1l-62.7-62.7z" fill="url(#logosGradient)"/>
                      </svg>
                    </div>
                    <span className="text-xs font-mono flex-1 text-muted-foreground">
                      {formatAddress(solanaAddress)}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(solanaAddress)}
                      className="h-6 w-6 p-0 bg-gradient-to-r from-[#9945FF] to-[#14F195] border-none hover:opacity-80"
                    >
                      <Copy className="w-3 h-3 text-white" />
                    </Button>
                  </div>
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
