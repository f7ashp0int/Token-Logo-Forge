import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, Download, Layers, Type, Image as ImageIcon, Palette, ZoomIn, ZoomOut, Circle, Square, Copy, Lock, Unlock, Sparkles, X, User, ExternalLink, Eye, EyeOff, ChevronUp, ChevronDown, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import TemplateGallery from './TemplateGallery';
import ColorPicker from './ColorPicker';
import '@fontsource/fira-code';
import '@fontsource/jetbrains-mono';

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
  textKerning?: number;
  textStartAngle?: number;
  fontFamily?: string;
  strokeColor?: string;
  strokeWidth?: number;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  glowColor?: string;
  glowBlur?: number;
  imageAdjustments?: ImageAdjustments;
}

interface ImageAdjustments {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  hue: number;
  blendMode: string;
  opacity: number;
  fill: number;
  gamma: number;
  sepia: number;
  invert: boolean;
  grayscale: boolean;
}

// Curated Google Fonts list
const GOOGLE_FONTS = [
  'Roboto', 'Open Sans', 'Montserrat', 'Lato', 'Oswald', 'Poppins', 'Raleway', 'Merriweather',
  'Bebas Neue', 'Nunito', 'Playfair Display', 'Rubik', 'Inter', 'Archivo Black', 'Bangers',
  'Orbitron', 'Pacifico', 'Permanent Marker', 'Press Start 2P', 'Quicksand', 'Source Sans Pro',
  'Titillium Web', 'Ubuntu', 'Varela Round', 'Work Sans'
];
// Fontsource fonts (already imported)
const FONTSOURCE_FONTS = [
  'Fira Code',
  'JetBrains Mono',
];
// Open Foundry fonts (assume ABC Diatype is available via @font-face)
const OPEN_FOUNDRY_FONTS = [
  'ABC Diatype',
];

const promotedChannels = [
  { name: 'f7ash', url: 'https://xeenon.xyz/f7ash', logo: '/f7ash.png' },
  { name: 'blu3mojo', url: 'https://xeenon.xyz/mojo', logo: '/mojo-logo.png' },
  { name: 'Cptfive', url: 'https://xeenon.xyz/Cptfive', logo: '/cptfive-logo.png' },
  { name: 'LordWaffl3', url: 'https://xeenon.xyz/LordWaffl3', logo: '/lordwaffl3-logo.png' },
  { name: 'MaddoxMakes', url: 'https://xeenon.xyz/MDXMKS', logo: '/mdxmks-logo.png' },
  { name: 'iWhiffBetter', url: 'https://xeenon.xyz/67fdf3334dd95bd19504af13', logo: '/iwhiffbetter-logo.png' },
];

const LogoTokenEditor = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [layers, setLayers] = useState<Layer[]>([]);
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);
  const [canvasSize] = useState(500);
  const [zoom, setZoom] = useState(0.9);
  const [imageZoom, setImageZoom] = useState(1);
  const [tool, setTool] = useState<'select' | 'crop' | 'text'>('select');
  const [backgroundColor, setBackgroundColor] = useState('transparent');
  const [canvasShape, setCanvasShape] = useState<'square' | 'circle'>('circle');
  const [textInput, setTextInput] = useState('');
  const [fontSize, setFontSize] = useState(24);
  const [textColor, setTextColor] = useState('#ffffff');
  const [isCircularText, setIsCircularText] = useState(false);
  const [textRadius, setTextRadius] = useState(150);
  const [textKerning, setTextKerning] = useState(0);
  const [textStartAngle, setTextStartAngle] = useState(0);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(0);
  const [shadowColor, setShadowColor] = useState('#000000');
  const [shadowBlur, setShadowBlur] = useState(0);
  const [shadowOffsetX, setShadowOffsetX] = useState(0);
  const [shadowOffsetY, setShadowOffsetY] = useState(0);
  const [glowColor, setGlowColor] = useState('#ffffff');
  const [glowBlur, setGlowBlur] = useState(0);
  const [mainView, setMainView] = useState<'canvas' | 'templates'>('canvas');
  const [canvasBorderWidth, setCanvasBorderWidth] = useState(10);
  const [canvasBorderColor, setCanvasBorderColor] = useState('#c0c0c0');
  const [rimShadow, setRimShadow] = useState({
    enabled: true,
    type: 'outer' as 'outer' | 'inner',
    color: 'rgba(0,0,0,0.5)',
    blur: 15,
    offsetX: 5,
    offsetY: 5,
  });
  const [rotationDegree, setRotationDegree] = useState(0);
  const [solanaAddress] = useState('2v32BcWsY9TdeTYmNuXRBt782vtgvXdCX3Hg1MjAgczr');
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [fontChangeTrigger, setFontChangeTrigger] = useState(0);
  const [fontLoadingStatus, setFontLoadingStatus] = useState<string>('');

  const loadFontIfNeeded = async (fontFamily: string | undefined) => {
    if (!fontFamily || fontFamily === 'Arial') return;
    try {
      await document.fonts.load(`1em "${fontFamily}"`);
    } catch (e) {
      console.warn(`Could not load font: ${fontFamily}`, e);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 10)}...${address.slice(-10)}`;
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

  const renderCanvas = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvasSize, canvasSize);
    ctx.globalCompositeOperation = 'source-over';


      if (canvasShape === 'circle') {
      ctx.save();
      // Draw outer shadow for the entire coin
      if (rimShadow.enabled && rimShadow.type === 'outer' && canvasBorderWidth > 0) {
        ctx.shadowColor = rimShadow.color;
        ctx.shadowBlur = rimShadow.blur;
        ctx.shadowOffsetX = rimShadow.offsetX;
        ctx.shadowOffsetY = rimShadow.offsetY;
      }
      
      // 1. Draw the outer rim
      if (canvasBorderWidth > 0) {
        ctx.fillStyle = canvasBorderColor;
        ctx.beginPath();
        ctx.arc(canvasSize / 2, canvasSize / 2, canvasSize / 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore(); // Restore to remove shadow for subsequent operations

      // Draw inner shadow for the rim
      if (rimShadow.enabled && rimShadow.type === 'inner' && canvasBorderWidth > 0) {
        ctx.save();
        ctx.strokeStyle = rimShadow.color;
        ctx.shadowColor = rimShadow.color;
        ctx.shadowBlur = rimShadow.blur;
        ctx.shadowOffsetX = rimShadow.offsetX;
        ctx.shadowOffsetY = rimShadow.offsetY;
        
        ctx.beginPath();
        ctx.arc(canvasSize / 2, canvasSize / 2, canvasSize / 2 - canvasBorderWidth, 0, Math.PI * 2);
        
        // This creates an "inner" shadow effect by stroking inside the rim area
        ctx.lineWidth = rimShadow.blur;
        ctx.stroke();
        ctx.restore();
      }
      
      // 2. "Punch out" the middle for the content area
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(canvasSize / 2, canvasSize / 2, canvasSize / 2 - canvasBorderWidth, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';

      // 3. Clip the content area for subsequent drawing
      ctx.save();
      ctx.beginPath();
      ctx.arc(canvasSize / 2, canvasSize / 2, canvasSize / 2 - canvasBorderWidth, 0, Math.PI * 2);
      ctx.clip();
    }

    // Draw background color
    if (backgroundColor !== 'transparent') {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvasSize, canvasSize);
    }
    
    // Draw layers
    const sortedLayers = [...layers].sort((a, b) => a.zIndex - b.zIndex);
    for (const layer of sortedLayers) {
      if (!layer.visible) continue;

      await loadFontIfNeeded(layer.fontFamily);
      
      ctx.save();
      const centerX = layer.x + layer.width / 2;
      const centerY = layer.y + layer.height / 2;
      
      ctx.translate(centerX, centerY);
      ctx.rotate(layer.rotation * Math.PI / 180);
      ctx.translate(-centerX, -centerY);
      
      ctx.globalAlpha = layer.opacity * (layer.type === 'image' ? (layer.imageAdjustments?.opacity || 100) / 100 : 1);

      // Apply blend mode for images
      if (layer.type === 'image' && layer.imageAdjustments) {
        ctx.globalCompositeOperation = layer.imageAdjustments.blendMode as GlobalCompositeOperation;
      }

      // Only apply image adjustments to image layers
      if (layer.type === 'image' && layer.imageAdjustments) {
        const filter = [
          `brightness(${(layer.imageAdjustments.brightness || 100) / 100})`,
          `contrast(${(layer.imageAdjustments.contrast || 100) / 100})`,
          `saturate(${(layer.imageAdjustments.saturation || 100) / 100})`,
          `blur(${(layer.imageAdjustments.blur || 0) / 10}px)`,
          `hue-rotate(${layer.imageAdjustments.hue || 0}deg)`,
          `opacity(${(layer.imageAdjustments.opacity || 100) / 100})`,
          `sepia(${(layer.imageAdjustments.sepia || 0) / 100})`,
          `gamma(${(layer.imageAdjustments.gamma || 100) / 100})`,
          layer.imageAdjustments.invert ? 'invert(1)' : 'none',
          layer.imageAdjustments.grayscale ? 'grayscale(1)' : 'none'
        ].filter(f => f !== 'none').join(' ');
        ctx.filter = filter;
      } else {
        ctx.filter = 'none';
      }
      
      if (layer.type === 'image') {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = layer.content;
        await new Promise(resolve => { img.onload = resolve; });
        ctx.drawImage(img, layer.x, layer.y, layer.width, layer.height);
      } else if (layer.type === 'text') {
        ctx.fillStyle = layer.fontColor || '#ffffff';
        ctx.font = `${layer.fontSize || 24}px "${layer.fontFamily || 'Arial'}"`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const textContent = layer.content || '';

        if (layer.isCircularText) {
          const radius = layer.textRadius || 150;
            const kerning = layer.textKerning || 0;
          const startAngle = (layer.textStartAngle || 0) * (Math.PI / 180);
            const textCenterX = canvasSize / 2;
            const textCenterY = canvasSize / 2;

            ctx.save();
            ctx.translate(textCenterX, textCenterY);
          
            let totalAngle = 0;
          for(let i=0; i < textContent.length; i++) {
              totalAngle += (ctx.measureText(textContent[i]).width + kerning) / radius;
            }
          ctx.rotate(startAngle - totalAngle / 2);
          
          for (let i = 0; i < textContent.length; i++) {
            const char = textContent[i];
              const charWidth = ctx.measureText(char).width;
            const angleForChar = (charWidth / 2) / radius;
              ctx.rotate(angleForChar);
            
            // Apply glow effect first (multiple passes for stronger glow)
            if (layer.glowBlur && layer.glowBlur > 0) {
              ctx.shadowColor = layer.glowColor || '#ffffff';
              ctx.shadowBlur = layer.glowBlur;
              ctx.shadowOffsetX = 0;
              ctx.shadowOffsetY = 0;
              ctx.fillText(char, 0, -radius);
              ctx.fillText(char, 0, -radius);
              ctx.fillText(char, 0, -radius);
            }
            
            // Apply shadow
            if (layer.shadowBlur && layer.shadowBlur > 0) {
              ctx.shadowColor = layer.shadowColor || '#000000';
              ctx.shadowBlur = layer.shadowBlur;
              ctx.shadowOffsetX = layer.shadowOffsetX || 0;
              ctx.shadowOffsetY = layer.shadowOffsetY || 0;
            }
            
            if (layer.strokeWidth && layer.strokeWidth > 0) {
              ctx.strokeStyle = layer.strokeColor || '#000000';
              ctx.lineWidth = layer.strokeWidth;
              ctx.strokeText(char, 0, -radius);
            }
            
            // Clear shadow for main text
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            
            ctx.fillText(char, 0, -radius);
            
            ctx.rotate((charWidth / 2 + kerning) / radius);
      }
      ctx.restore();
        } else {
          // Apply glow effect first (multiple passes for stronger glow)
          if (layer.glowBlur && layer.glowBlur > 0) {
            ctx.shadowColor = layer.glowColor || '#ffffff';
            ctx.shadowBlur = layer.glowBlur;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            ctx.fillText(textContent, centerX, centerY);
            ctx.fillText(textContent, centerX, centerY);
            ctx.fillText(textContent, centerX, centerY);
          }
          
          // Apply shadow
          if (layer.shadowBlur && layer.shadowBlur > 0) {
            ctx.shadowColor = layer.shadowColor || '#000000';
            ctx.shadowBlur = layer.shadowBlur;
            ctx.shadowOffsetX = layer.shadowOffsetX || 0;
            ctx.shadowOffsetY = layer.shadowOffsetY || 0;
          }
          
          if (layer.strokeWidth && layer.strokeWidth > 0) {
            ctx.strokeStyle = layer.strokeColor || '#000000';
            ctx.lineWidth = layer.strokeWidth;
            ctx.strokeText(textContent, centerX, centerY);
          }
          
          // Clear shadow for main text
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
          
          ctx.fillText(textContent, centerX, centerY);
        }
      }
      ctx.restore();
    }
    
    if (canvasShape === 'circle') {
      ctx.restore(); // Restore from the clip
    }
  }, [layers, backgroundColor, canvasShape, canvasSize, canvasBorderWidth, canvasBorderColor, rimShadow]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  const handleTemplateSelect = useCallback((template: Template) => {
    // Create template background layer
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      canvas.width = canvas.height = canvasSize;
      
      // Create the gradient based on template style and specific template
      if (template.style === '3d') {
        // Enhanced 3D-like gradients with template-specific colors
        const gradient = ctx.createRadialGradient(
          canvasSize * 0.25, canvasSize * 0.25, 0,
          canvasSize / 2, canvasSize / 2, canvasSize * 0.8
        );
        
        // Apply template-specific colors based on template name
        switch (template.name) {
          case 'Classic Gold Coin':
            gradient.addColorStop(0, '#FFD700'); // Bright gold center
            gradient.addColorStop(0.3, '#FFA500'); // Orange gold
            gradient.addColorStop(0.6, '#DAA520'); // Golden rod
            gradient.addColorStop(0.8, '#B8860B'); // Dark golden rod
            gradient.addColorStop(1, '#8B6914'); // Dark gold edge
            break;
          case 'Gold Ring Token':
            gradient.addColorStop(0, '#FFD700'); // Bright gold
            gradient.addColorStop(0.25, '#FFED4E'); // Light gold
            gradient.addColorStop(0.5, '#DAA520'); // Golden rod
            gradient.addColorStop(0.75, '#FFD700'); // Back to gold
            gradient.addColorStop(1, '#B8860B'); // Dark gold edge
            break;
          case 'Silver Coin':
            gradient.addColorStop(0, '#FFFFFF'); // Pure white center
            gradient.addColorStop(0.3, '#E5E5E5'); // Light silver
            gradient.addColorStop(0.6, '#C0C0C0'); // Silver
            gradient.addColorStop(0.8, '#A8A8A8'); // Dark silver
            gradient.addColorStop(1, '#696969'); // Dim gray edge
            break;
          case 'Bronze Token':
            gradient.addColorStop(0, '#CD7F32'); // Bronze center
            gradient.addColorStop(0.3, '#D4AF37'); // Golden bronze
            gradient.addColorStop(0.6, '#B8860B'); // Dark golden rod
            gradient.addColorStop(0.8, '#8B4513'); // Saddle brown
            gradient.addColorStop(1, '#654321'); // Dark brown edge
            break;
          default:
            // Fallback to category-based colors
        switch (template.category) {
          case 'gold':
                gradient.addColorStop(0, '#FFD700');
                gradient.addColorStop(0.3, '#FFA500');
                gradient.addColorStop(0.6, '#DAA520');
                gradient.addColorStop(0.8, '#B8860B');
                gradient.addColorStop(1, '#8B6914');
            break;
          case 'silver':
                gradient.addColorStop(0, '#FFFFFF');
                gradient.addColorStop(0.3, '#E5E5E5');
                gradient.addColorStop(0.6, '#C0C0C0');
                gradient.addColorStop(0.8, '#A8A8A8');
                gradient.addColorStop(1, '#696969');
            break;
          case 'crypto':
                gradient.addColorStop(0, '#FFD700');
                gradient.addColorStop(0.3, '#FFA500');
                gradient.addColorStop(0.6, '#FF8C00');
                gradient.addColorStop(0.8, '#FF4500');
                gradient.addColorStop(1, '#8B0000');
            break;
          case 'colored':
                gradient.addColorStop(0, '#FF69B4');
                gradient.addColorStop(0.3, '#FF1493');
                gradient.addColorStop(0.6, '#8A2BE2');
                gradient.addColorStop(0.8, '#4B0082');
                gradient.addColorStop(1, '#2E0854');
            break;
            }
        }
        
        ctx.fillStyle = gradient;
      } else {
        // Enhanced 2D flat colors with template-specific gradients
        const gradient = ctx.createLinearGradient(0, 0, canvasSize, canvasSize);
        
        // Apply template-specific colors for 2D templates
        switch (template.name) {
          case 'Bitcoin Style':
            gradient.addColorStop(0, '#F7931A'); // Bitcoin orange
            gradient.addColorStop(1, '#CC7A00'); // Dark orange
            break;
          case 'Ethereum Blue':
            gradient.addColorStop(0, '#627EEA'); // Ethereum blue
            gradient.addColorStop(1, '#4169E1'); // Royal blue
            break;
          case 'Neon Pink':
            gradient.addColorStop(0, '#FF69B4'); // Hot pink
            gradient.addColorStop(1, '#C71585'); // Medium violet red
            break;
          case 'Cyber Teal':
            gradient.addColorStop(0, '#20B2AA'); // Light sea green
            gradient.addColorStop(1, '#008B8B'); // Dark cyan
            break;
          case 'Lightning Yellow':
            gradient.addColorStop(0, '#FFD700'); // Gold
            gradient.addColorStop(1, '#DAA520'); // Golden rod
            break;
          case 'White Token':
            gradient.addColorStop(0, '#FFFFFF'); // White
            gradient.addColorStop(1, '#E0E0E0'); // Light gray
            break;
          default:
            // Fallback to category-based colors
        switch (template.category) {
          case 'gold':
                gradient.addColorStop(0, '#FFD700');
                gradient.addColorStop(1, '#DAA520');
            break;
          case 'silver':
                gradient.addColorStop(0, '#E5E5E5');
                gradient.addColorStop(1, '#C0C0C0');
            break;
          case 'crypto':
                gradient.addColorStop(0, '#FFA500');
                gradient.addColorStop(1, '#FF8C00');
            break;
          case 'colored':
                gradient.addColorStop(0, '#FF69B4');
                gradient.addColorStop(1, '#8A2BE2');
            break;
        }
        }
        ctx.fillStyle = gradient;
      }
      
      if (canvasShape === 'circle') {
        ctx.beginPath();
        ctx.arc(canvasSize / 2, canvasSize / 2, canvasSize / 2, 0, 2 * Math.PI);
        ctx.fill();
      } else {
        ctx.fillRect(0, 0, canvasSize, canvasSize);
      }
      
      // Enhanced 3D effects for 3D templates
      if (template.style === '3d') {
        // Add realistic highlight
        const highlightGradient = ctx.createRadialGradient(
          canvasSize * 0.15, canvasSize * 0.15, 0,
          canvasSize * 0.15, canvasSize * 0.15, canvasSize * 0.4
        );
        highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        highlightGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
        highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = highlightGradient;
        
        if (canvasShape === 'circle') {
          ctx.beginPath();
          ctx.arc(canvasSize / 2, canvasSize / 2, canvasSize / 2, 0, 2 * Math.PI);
          ctx.fill();
        } else {
          ctx.fillRect(0, 0, canvasSize, canvasSize);
        }
        
        // Add realistic shadow
        const shadowGradient = ctx.createRadialGradient(
          canvasSize * 0.85, canvasSize * 0.85, 0,
          canvasSize * 0.85, canvasSize * 0.85, canvasSize * 0.4
        );
        shadowGradient.addColorStop(0, 'rgba(0, 0, 0, 0.4)');
        shadowGradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.2)');
        shadowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = shadowGradient;
        
        if (canvasShape === 'circle') {
          ctx.beginPath();
          ctx.arc(canvasSize / 2, canvasSize / 2, canvasSize / 2, 0, 2 * Math.PI);
          ctx.fill();
        } else {
          ctx.fillRect(0, 0, canvasSize, canvasSize);
        }
        
        // Add inner ring for depth
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 3;
        if (canvasShape === 'circle') {
          ctx.beginPath();
          ctx.arc(canvasSize / 2, canvasSize / 2, canvasSize / 2 - 15, 0, 2 * Math.PI);
          ctx.stroke();
        }
        
        // Add outer ring for definition
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.lineWidth = 2;
        if (canvasShape === 'circle') {
          ctx.beginPath();
          ctx.arc(canvasSize / 2, canvasSize / 2, canvasSize / 2 - 2, 0, 2 * Math.PI);
          ctx.stroke();
        }
      }
      
      const templateDataUrl = canvas.toDataURL();
      
      // Add a base layer for the template background
      const baseLayer: Layer = {
        id: Date.now().toString() + "-base",
        type: 'image',
        content: templateDataUrl,
        x: 0,
        y: 0,
        width: canvasSize,
        height: canvasSize,
        rotation: 0,
        opacity: 1,
        visible: true,
        locked: true, // Lock the base template layer
        zIndex: -1, // Ensure it's at the bottom
        imageAdjustments: {
          brightness: 100,
          contrast: 100,
          saturation: 100,
          blur: 0,
          hue: 0,
          blendMode: 'normal',
          opacity: 100,
          fill: 100,
          gamma: 100,
          sepia: 0,
          invert: false,
          grayscale: false
        }
      };

      // Add a second layer for the coin edge/rim
      const rimCanvas = document.createElement('canvas');
      rimCanvas.width = rimCanvas.height = canvasSize;
      const rimCtx = rimCanvas.getContext('2d')!;
      
      const rimWidth = canvasBorderWidth; // Use state for consistency
      rimCtx.strokeStyle = canvasBorderColor;
      rimCtx.lineWidth = rimWidth;
      rimCtx.beginPath();
      rimCtx.arc(canvasSize / 2, canvasSize / 2, canvasSize / 2 - rimWidth / 2, 0, 2 * Math.PI);
      rimCtx.stroke();
      
      // Add a subtle inner shadow to the rim for depth
      rimCtx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
      rimCtx.lineWidth = 2;
      rimCtx.beginPath();
      rimCtx.arc(canvasSize / 2, canvasSize / 2, canvasSize / 2 - rimWidth - 1, 0, 2 * Math.PI);
      rimCtx.stroke();

      const rimLayer: Layer = {
        id: Date.now().toString() + "-rim",
        type: 'image',
        content: rimCanvas.toDataURL(),
        x: 0,
        y: 0,
        width: canvasSize,
        height: canvasSize,
        rotation: 0,
        opacity: 1,
        visible: true,
        locked: true,
        zIndex: 1000, // Ensure it's on top
        imageAdjustments: {
          brightness: 100,
          contrast: 100,
          saturation: 100,
          blur: 0,
          hue: 0,
          blendMode: 'normal',
          opacity: 100,
          fill: 100,
          gamma: 100,
          sepia: 0,
          invert: false,
          grayscale: false
        }
      };
      
      setLayers([baseLayer, rimLayer]);
      setSelectedLayer(null); // Nothing is selected initially
      setMainView('canvas');
      toast.success(`${template.name} template applied!`);
    }
  }, [canvasSize, canvasShape, canvasBorderWidth, canvasBorderColor]);

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
          
          const imageWidth = (canvasSize - 100) * imageZoom;
          const imageHeight = (canvasSize - 100) * imageZoom;
          
          const newLayer: Layer = {
            id: Date.now().toString(),
            type: 'image',
            content: canvas.toDataURL(),
            x: (canvasSize - imageWidth) / 2,
            y: (canvasSize - imageHeight) / 2,
            width: imageWidth,
            height: imageHeight,
            rotation: 0,
            opacity: 1,
            visible: true,
            locked: false,
            zIndex: (Math.max(...layers.map(l => l.zIndex), -1) + 1),
            imageAdjustments: {
              brightness: 100,
              contrast: 100,
              saturation: 100,
              blur: 0,
              hue: 0,
              blendMode: 'normal',
              opacity: 100,
              fill: 100,
              gamma: 100,
              sepia: 0,
              invert: false,
              grayscale: false
            }
          };
          
          setLayers(prev => [...prev, newLayer]);
          setSelectedLayer(newLayer.id);
          toast.success('Image uploaded and auto-cropped to 1:1 ratio');
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, [layers, canvasSize, imageZoom]);

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
      zIndex: (Math.max(...layers.map(l => l.zIndex), -1) + 1),
      isCircularText,
      textRadius: isCircularText ? textRadius : undefined,
      fontSize,
      fontColor: textColor,
      textKerning: isCircularText ? textKerning : undefined,
      textStartAngle: isCircularText ? textStartAngle : undefined,
      fontFamily,
      strokeColor,
      strokeWidth,
      shadowColor,
      shadowBlur,
      shadowOffsetX,
      shadowOffsetY,
      glowColor,
      glowBlur
    };
    
    setLayers(prev => [...prev, newLayer]);
    setSelectedLayer(newLayer.id);
    setTextInput('');
    toast.success(`${isCircularText ? 'Circular' : 'Regular'} text layer added`);
  }, [textInput, fontSize, textColor, isCircularText, textRadius, textKerning, textStartAngle, layers, canvasSize, fontFamily, strokeColor, strokeWidth, shadowColor, shadowBlur, shadowOffsetX, shadowOffsetY, glowColor, glowBlur]);

  const updateLayerProperty = useCallback(<K extends keyof Layer>(layerId: string, property: K, value: Layer[K]) => {
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
        // Swap the layers
        [newLayers[currentIndex], newLayers[currentIndex - 1]] = [newLayers[currentIndex - 1], newLayers[currentIndex]];
        
        // Update zIndex values to match the new order
        newLayers.forEach((layer, index) => {
          layer.zIndex = index;
        });
      }
      return newLayers;
    });
  }, []);

  const moveLayerDown = useCallback((layerId: string) => {
    setLayers(prev => {
      const newLayers = [...prev];
      const currentIndex = newLayers.findIndex(l => l.id === layerId);
      if (currentIndex < newLayers.length - 1) {
        // Swap the layers
        [newLayers[currentIndex], newLayers[currentIndex + 1]] = [newLayers[currentIndex + 1], newLayers[currentIndex]];
        
        // Update zIndex values to match the new order
        newLayers.forEach((layer, index) => {
          layer.zIndex = index;
        });
      }
      return newLayers;
    });
  }, []);

  // Update selected layer properties when UI controls change
  useEffect(() => {
    if (selectedLayer) {
      const layer = layers.find(l => l.id === selectedLayer);
      if (layer) {
        if (layer.type === 'text') {
          setFontSize(layer.fontSize || 24);
          setTextColor(layer.fontColor || '#ffffff');
          setIsCircularText(layer.isCircularText || false);
          setTextRadius(layer.textRadius || 150);
          setRotationDegree(layer.rotation);
          if (layer.isCircularText) {
            setTextKerning(layer.textKerning || 0);
            setTextStartAngle(layer.textStartAngle || 0);
          }
          setFontFamily(layer.fontFamily || 'Arial');
          setStrokeColor(layer.strokeColor || '#000000');
          setStrokeWidth(layer.strokeWidth || 0);
          setShadowColor(layer.shadowColor || '#000000');
          setShadowBlur(layer.shadowBlur || 0);
          setShadowOffsetX(layer.shadowOffsetX || 0);
          setShadowOffsetY(layer.shadowOffsetY || 0);
          setGlowColor(layer.glowColor || '#ffffff');
          setGlowBlur(layer.glowBlur || 0);
        } else if (layer.type === 'image') {
          // Base size assumes the image was not manually resized, only scaled via this slider
          const baseSize = canvasSize - 100;
          const currentZoom = layer.width / baseSize;
          setImageZoom(currentZoom);
        }
      }
    }
  }, [selectedLayer, layers, canvasSize]);

  const handleExport = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const link = document.createElement('a');
      link.download = 'token-logo.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  return (
    <div className="min-h-screen text-foreground">
      <div className="p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 
            className="text-4xl font-bold mb-2" 
            style={{ 
              background: 'linear-gradient(to right, #00d4aa, #9945ff, #ff69b4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            Token Logo Creator
          </h1>
          <p className="text-sm text-vibrant-purple/70">Create your unique token image</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Tools Panel */}
          <div className="lg:col-span-3">
            <div className="sticky top-6">
              <Card className="bg-black/30 backdrop-blur-xl border border-vibrant-purple/20 p-4 h-[calc(100vh-12rem)] rounded-2xl shadow-lg">
                <ScrollArea className="h-full w-full pr-4">
              <Tabs defaultValue="upload" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 bg-black/20">
                      <TabsTrigger value="upload" className="data-[state=active]:bg-vibrant-purple/20 text-gray-200 hover:text-white hover:bg-vibrant-purple/10"><Upload className="w-4 h-4" /></TabsTrigger>
                      <TabsTrigger value="text" className="data-[state=active]:bg-vibrant-purple/20 text-gray-200 hover:text-white hover:bg-vibrant-purple/10"><Type className="w-4 h-4" /></TabsTrigger>
                      <TabsTrigger value="adjust" className="data-[state=active]:bg-vibrant-purple/20 text-gray-200 hover:text-white hover:bg-vibrant-purple/10"><Palette className="w-4 h-4" /></TabsTrigger>
                      <TabsTrigger value="layers" className="data-[state=active]:bg-vibrant-purple/20 text-gray-200 hover:text-white hover:bg-vibrant-purple/10"><Layers className="w-4 h-4" /></TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-300">Upload Image</Label>
                        <Input
                          id="image-upload"
                      type="file"
                          ref={fileInputRef}
                      onChange={handleImageUpload}
                      className="hidden"
                          accept="image/png, image/jpeg, image/svg+xml"
                    />
                    <Button 
                      onClick={() => fileInputRef.current?.click()}
                          className="w-full h-12 flex items-center justify-center gap-2 rounded-lg border-2 border-green-400/50 bg-green-500/10 backdrop-blur-sm text-green-300 font-semibold transition-all duration-300 hover:bg-green-500/20 hover:border-green-400 hover:text-green-200"
                    >
                          <Upload className="w-5 h-5" />
                          <span>Click to upload</span>
                    </Button>
                  </div>

                      <div className="space-y-2">
                        <Label htmlFor="image-zoom" className="text-sm font-medium text-gray-300">Image Zoom: {Math.round(imageZoom * 100)}%</Label>
                    <Slider
                      value={[imageZoom]}
                      onValueChange={(value) => {
                        const newZoom = value[0];
                        setImageZoom(newZoom);
                        if (selectedLayer) {
                          setLayers(prev => prev.map(l => {
                            if (l.id === selectedLayer && l.type === 'image') {
                              const baseSize = canvasSize - 100;
                              const newWidth = baseSize * newZoom;
                              const newHeight = baseSize * newZoom;
                              const newX = l.x + (l.width - newWidth) / 2;
                              const newY = l.y + (l.height - newHeight) / 2;
                              return { ...l, width: newWidth, height: newHeight, x: newX, y: newY };
                            }
                            return l;
                          }));
                        }
                      }}
                      max={2}
                      min={0.1}
                      step={0.1}
                      className="mt-2"
                    />
                  </div>

                  <div>
                        <Label className="text-gray-300">Templates</Label>
                    <Button 
                          onClick={() => setMainView('templates')}
                      variant="outline"
                          className="w-full mt-2 border-vibrant-purple/30 hover:bg-vibrant-purple/20 text-gray-200 hover:text-white"
                    >
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Browse Templates
                    </Button>
                  </div>

                  <div>
                        <Label className="text-gray-300">Canvas Shape</Label>
                    <div className="flex gap-2 mt-2">
                      <Button
                        onClick={() => setCanvasShape('circle')}
                            variant="outline"
                        size="sm"
                            className={`flex-1 border-vibrant-purple/30 hover:bg-vibrant-purple/20 text-gray-200 hover:text-white ${canvasShape === 'circle' ? 'bg-vibrant-purple/30 border-vibrant-purple/50 text-white' : ''}`}
                      >
                        <Circle className="w-4 h-4 mr-1" />
                        Circle
                      </Button>
                      <Button
                        onClick={() => setCanvasShape('square')}
                            variant="outline"
                        size="sm"
                            className={`flex-1 border-vibrant-purple/30 hover:bg-vibrant-purple/20 text-gray-200 hover:text-white ${canvasShape === 'square' ? 'bg-vibrant-purple/30 border-vibrant-purple/50 text-white' : ''}`}
                      >
                        <Square className="w-4 h-4 mr-1" />
                        Square
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                        <Label className="text-gray-300">Coin Rim</Label>
                        <div className="flex gap-2 mt-2 items-center">
                      <Slider
                        value={[canvasBorderWidth]}
                        onValueChange={(value) => setCanvasBorderWidth(value[0])}
                        max={30}
                        min={0}
                        step={1}
                          />
                          <ColorPicker
                            color={canvasBorderColor}
                            onChange={setCanvasBorderColor}
                      />
                    </div>
                  </div>

                  <div>
                        <Label className="text-gray-300">Rim Shadow</Label>
                        <div className="p-2 border border-vibrant-purple/20 rounded-md mt-2 space-y-3">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="rim-shadow-enable" className="text-sm text-gray-300">Enable Shadow</Label>
                            <input
                              type="checkbox"
                              id="rim-shadow-enable"
                              checked={rimShadow.enabled}
                              onChange={(e) => setRimShadow(s => ({...s, enabled: e.target.checked}))}
                              className="rounded"
                            />
                          </div>
                          {rimShadow.enabled && (
                            <>
                              <div className="flex gap-2">
                                <Button onClick={() => setRimShadow(s => ({ ...s, type: 'outer' }))} variant="outline" size="sm" className={`flex-1 border-vibrant-purple/30 hover:bg-vibrant-purple/20 text-gray-200 hover:text-white ${rimShadow.type === 'outer' ? 'bg-vibrant-purple/30 border-vibrant-purple/50 text-white' : ''}`}>Outer</Button>
                                <Button onClick={() => setRimShadow(s => ({ ...s, type: 'inner' }))} variant="outline" size="sm" className={`flex-1 border-vibrant-purple/30 hover:bg-vibrant-purple/20 text-gray-200 hover:text-white ${rimShadow.type === 'inner' ? 'bg-vibrant-purple/30 border-vibrant-purple/50 text-white' : ''}`}>Inner</Button>
                              </div>
                              <div className="flex gap-2 items-center">
                                <div className='flex-1'>
                                   <Label className="text-xs text-vibrant-purple/70">Blur: {rimShadow.blur}px</Label>
                                   <Slider value={[rimShadow.blur]} onValueChange={v => setRimShadow(s => ({ ...s, blur: v[0] }))} max={50} min={0} step={1} />
                                </div>
                                <ColorPicker color={rimShadow.color} onChange={color => setRimShadow(s => ({ ...s, color }))} />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-xs text-vibrant-purple/70">X: {rimShadow.offsetX}px</Label>
                                  <Slider value={[rimShadow.offsetX]} onValueChange={v => setRimShadow(s => ({ ...s, offsetX: v[0] }))} max={50} min={-50} step={1} />
                                </div>
                                <div>
                                  <Label className="text-xs text-vibrant-purple/70">Y: {rimShadow.offsetY}px</Label>
                                  <Slider value={[rimShadow.offsetY]} onValueChange={v => setRimShadow(s => ({ ...s, offsetY: v[0] }))} max={50} min={-50} step={1} />
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                  </div>

                  <div>
                        <Label className="text-gray-300">Background</Label>
                        <div className="flex gap-2 mt-2 items-center">
                      <Button
                        onClick={() => setBackgroundColor('transparent')}
                            variant="outline"
                        size="sm"
                            className={`border-vibrant-purple/30 hover:bg-vibrant-purple/20 text-gray-200 hover:text-white ${backgroundColor === 'transparent' ? 'bg-vibrant-purple/30 border-vibrant-purple/50 text-white' : ''}`}
                      >
                        Transparent
                      </Button>
                          <ColorPicker
                            color={backgroundColor === 'transparent' ? '#ffffff' : backgroundColor}
                            onChange={setBackgroundColor}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="text" className="space-y-4 mt-4">
                      {/* Add Text */}
                      <div className="p-1">
                        <Label className="text-gray-300 font-semibold">Add Text</Label>
                        <div className="flex gap-2 mt-2">
                    <Input
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                            placeholder="Enter text..."
                            className="bg-black/20 border-vibrant-purple/30 rounded-md text-gray-200"
                          />
                    <Button 
                      onClick={addTextLayer}
                            className="bg-gradient-to-r from-vibrant-purple to-vibrant-pink hover:from-vibrant-purple/80 hover:to-vibrant-pink/80 text-white px-6"
                    >
                            Add
                    </Button>
                        </div>
                  </div>
                  
                      {/* Font Properties */}
                      <div className="p-1 border-t border-vibrant-purple/20 pt-4">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                          <div className="col-span-1">
                            <Label className="text-gray-300">Font Family</Label>
                          </div>
                          <div className="col-span-1">
                            <Label className="text-gray-300">Font Size: {fontSize}px</Label>
                          </div>
                          <div className="col-span-1">
                    <select
                      value={fontFamily}
                      onChange={async (e) => {
                        const newFont = e.target.value;
                        setFontLoadingStatus(`Loading ${newFont}...`);
                        if (GOOGLE_FONTS.includes(newFont)) {
                          const fontUrl = `https://fonts.googleapis.com/css2?family=${newFont.replace(/\s+/g, '+')}:wght@400&display=swap`;
                                  if (![...document.querySelectorAll('link[rel="stylesheet"]')].some(l => (l as HTMLLinkElement).href === fontUrl)) {
                            const link = document.createElement('link');
                            link.href = fontUrl;
                            link.rel = 'stylesheet';
                            document.head.appendChild(link);
                          }
                          try {
                            await document.fonts.load(`1em "${newFont}"`);
                            setFontFamily(newFont);
                            if (selectedLayer) updateLayerProperty(selectedLayer, 'fontFamily', newFont);
                            setFontChangeTrigger(prev => prev + 1);
                            setFontLoadingStatus(`Font ${newFont} loaded!`);
                            setTimeout(() => setFontLoadingStatus(''), 1500);
                          } catch (err) {
                            setFontLoadingStatus(`Failed to load ${newFont}`);
                            toast.error(`Could not load font "${newFont}"`);
                            setTimeout(() => setFontLoadingStatus(''), 3000);
                          }
                        } else {
                          setFontFamily(newFont);
                          if (selectedLayer) updateLayerProperty(selectedLayer, 'fontFamily', newFont);
                          setFontChangeTrigger(prev => prev + 1);
                          setFontLoadingStatus(`Font ${newFont} loaded!`);
                          setTimeout(() => setFontLoadingStatus(''), 1000);
                        }
                      }}
                              className="w-full mt-1 border rounded p-2 bg-black/20 border-vibrant-purple/30 text-gray-200 hover:border-vibrant-purple/50"
                      style={{ fontFamily }}
                    >
                      <optgroup label="Google Fonts">
                        {GOOGLE_FONTS.map(font => (
                          <option key={font} value={font} style={{ fontFamily: font }}>{font}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Fontsource">
                        {FONTSOURCE_FONTS.map(font => (
                          <option key={font} value={font} style={{ fontFamily: font }}>{font}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Open Foundry">
                        {OPEN_FOUNDRY_FONTS.map(font => (
                          <option key={font} value={font} style={{ fontFamily: font }}>{font}</option>
                        ))}
                      </optgroup>
                    </select>
                    {fontLoadingStatus && (
                              <p className="text-xs text-vibrant-purple/70 mt-1">{fontLoadingStatus}</p>
                    )}
                  </div>
                          <div className="col-span-1 space-y-1">
                    <Slider
                      value={[fontSize]}
                      onValueChange={(value) => {
                        const size = value[0];
                        setFontSize(size);
                        if (selectedLayer) {
                          updateLayerProperty(selectedLayer, 'fontSize', size);
                        }
                      }}
                      max={500}
                      min={10}
                      step={1}
                            />
                            <div className="flex justify-end items-center pt-2">
                               <Label className="text-gray-300 mr-2">Text Color</Label>
                               <ColorPicker
                                color={textColor}
                                onChange={(color) => {
                                  setTextColor(color);
                                  if (selectedLayer) {
                                    updateLayerProperty(selectedLayer, 'fontColor', color);
                                  }
                                }}
                              />
                            </div>
                          </div>
                        </div>
                  </div>
                  
                      {/* Circular Text */}
                      <div className="p-1 border-t border-vibrant-purple/20 pt-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="circular-text"
                            checked={isCircularText}
                          onChange={(e) => {
                              const checked = e.target.checked;
                              setIsCircularText(checked);
                              if (selectedLayer) {
                                updateLayerProperty(selectedLayer, 'isCircularText', checked);
                              }
                            }}
                            className="rounded"
                          />
                          <Label htmlFor="circular-text" className="text-sm text-gray-300">Circular Text</Label>
                        </div>
                        
                        {isCircularText && (
                          <div className="mt-2 space-y-2 border-l-2 border-vibrant-purple/30 pl-4 ml-2">
                            <div>
                              <Label className="text-sm text-gray-300">Radius: {textRadius}px</Label>
                              <Slider
                                value={[textRadius]}
                                onValueChange={(value) => {
                                  const r = value[0];
                                  setTextRadius(r);
                                  if (selectedLayer) {
                                    updateLayerProperty(selectedLayer, 'textRadius', r);
                                  }
                                }}
                                max={200}
                                min={50}
                                step={5}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-sm text-gray-300">Character Spacing: {textKerning}px</Label>
                              <Slider
                                value={[textKerning]}
                                onValueChange={(value) => {
                                  const k = value[0];
                                  setTextKerning(k);
                                  if (selectedLayer) {
                                    updateLayerProperty(selectedLayer, 'textKerning', k);
                                  }
                                }}
                                max={50}
                                min={-10}
                                step={1}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-sm text-gray-300">Start Angle: {textStartAngle}°</Label>
                              <Slider
                                value={[textStartAngle]}
                                onValueChange={(value) => {
                                  const a = value[0];
                                  setTextStartAngle(a);
                                  if (selectedLayer) {
                                    updateLayerProperty(selectedLayer, 'textStartAngle', a);
                                  }
                                }}
                                max={360}
                                min={0}
                                step={1}
                                className="mt-1"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Effects */}
                      <div className="p-1 border-t border-vibrant-purple/20 pt-4 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-gray-300">Stroke</Label>
                            <div className="flex gap-2 mt-2 items-center">
                        <Slider
                          value={[strokeWidth]}
                          onValueChange={(value) => {
                            const width = value[0];
                            setStrokeWidth(width);
                            if (selectedLayer) updateLayerProperty(selectedLayer, 'strokeWidth', width);
                          }}
                          max={10}
                          min={0}
                          step={0.5}
                              />
                              <ColorPicker
                                color={strokeColor}
                                onChange={(color) => {
                            setStrokeColor(color);
                            if (selectedLayer) updateLayerProperty(selectedLayer, 'strokeColor', color);
                          }}
                        />
                      </div>
                    </div>
                    <div>
                            <Label className="text-gray-300">Glow</Label>
                            <div className="flex gap-2 mt-2 items-center">
                              <Slider
                                value={[glowBlur]}
                                onValueChange={(value) => {
                                  const blur = value[0];
                                  setGlowBlur(blur);
                                  if (selectedLayer) updateLayerProperty(selectedLayer, 'glowBlur', blur);
                                }}
                                max={20}
                                min={0}
                                step={1}
                              />
                              <ColorPicker
                                color={glowColor}
                                onChange={(color) => {
                                  setGlowColor(color);
                                  if (selectedLayer) updateLayerProperty(selectedLayer, 'glowColor', color);
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        <div>
                          <Label className="text-gray-300">Shadow</Label>
                          <div className="flex gap-2 mt-2 items-center">
                        <Slider
                          value={[shadowBlur]}
                          onValueChange={(value) => {
                            const blur = value[0];
                            setShadowBlur(blur);
                            if (selectedLayer) updateLayerProperty(selectedLayer, 'shadowBlur', blur);
                          }}
                          max={20}
                          min={0}
                          step={1}
                            />
                            <ColorPicker
                              color={shadowColor}
                              onChange={(color) => {
                            setShadowColor(color);
                            if (selectedLayer) updateLayerProperty(selectedLayer, 'shadowColor', color);
                          }}
                        />
                      </div>
                          <div className="grid grid-cols-2 gap-4 mt-2">
                            <div>
                              <Label className="text-xs font-medium text-gray-300">X Offset: {shadowOffsetX}px</Label>
                        <Slider
                          value={[shadowOffsetX]}
                          onValueChange={(value) => {
                            const x = value[0];
                            setShadowOffsetX(x);
                            if (selectedLayer) updateLayerProperty(selectedLayer, 'shadowOffsetX', x);
                          }}
                          max={20}
                          min={-20}
                          step={1}
                        />
                            </div>
                            <div>
                              <Label className="text-xs font-medium text-gray-300">Y Offset: {shadowOffsetY}px</Label>
                        <Slider
                          value={[shadowOffsetY]}
                          onValueChange={(value) => {
                            const y = value[0];
                            setShadowOffsetY(y);
                            if (selectedLayer) updateLayerProperty(selectedLayer, 'shadowOffsetY', y);
                          }}
                          max={20}
                          min={-20}
                          step={1}
                        />
                      </div>
                      </div>
                    </div>
                  </div>
                  
                      {/* Edit Selected Text */}
                  {selectedLayer && layers.find(l => l.id === selectedLayer)?.type === 'text' && (
                        <div className="border-t border-vibrant-purple/20 pt-4">
                          <Label className="text-sm font-medium text-gray-300">Edit Selected Text</Label>
                      <Input
                        value={layers.find(l => l.id === selectedLayer)?.content || ''}
                        onChange={(e) => updateLayerProperty(selectedLayer, 'content', e.target.value)}
                        placeholder="Edit text..."
                            className="mt-2 bg-black/20 border-vibrant-purple/30 rounded-md text-gray-200"
                      />
                      
                      <div className="flex items-center space-x-2 mt-2">
                        <input
                          type="checkbox"
                          id="convert-circular"
                          checked={layers.find(l => l.id === selectedLayer)?.isCircularText || false}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            updateLayerProperty(selectedLayer, 'isCircularText', checked);
                            if (checked) {
                              updateLayerProperty(selectedLayer, 'textRadius', textRadius);
                              updateLayerProperty(selectedLayer, 'textKerning', textKerning);
                              updateLayerProperty(selectedLayer, 'textStartAngle', textStartAngle);
                            }
                          }}
                          className="rounded"
                        />
                            <Label htmlFor="convert-circular" className="text-sm text-gray-300">Convert to Circular Text</Label>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="adjust" className="space-y-4 mt-4">
                  {selectedLayer && layers.find(l => l.id === selectedLayer)?.type === 'image' ? (
                    <>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-medium text-gray-300">Image Adjustments</h3>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            const layer = layers.find(l => l.id === selectedLayer);
                            if (layer) {
                              updateLayerProperty(selectedLayer, 'imageAdjustments', {
                                brightness: 100,
                                contrast: 100,
                                saturation: 100,
                                blur: 0,
                                hue: 0,
                                blendMode: 'normal',
                                opacity: 100,
                                fill: 100,
                                gamma: 100,
                                sepia: 0,
                                invert: false,
                                grayscale: false
                              });
                            }
                          }} 
                          className="border-vibrant-purple/30 hover:bg-vibrant-purple/20 text-gray-200 hover:text-white"
                        >
                          Reset
                        </Button>
                      </div>
                      
                      {(() => {
                        const layer = layers.find(l => l.id === selectedLayer);
                        let layerAdjustments = layer?.imageAdjustments;
                        
                        // Initialize imageAdjustments if it doesn't exist
                        if (!layerAdjustments && layer?.type === 'image') {
                          layerAdjustments = {
                            brightness: 100,
                            contrast: 100,
                            saturation: 100,
                            blur: 0,
                            hue: 0,
                            blendMode: 'normal',
                            opacity: 100,
                            fill: 100,
                            gamma: 100,
                            sepia: 0,
                            invert: false,
                            grayscale: false
                          };
                          // Update the layer with the initialized adjustments
                          updateLayerProperty(selectedLayer, 'imageAdjustments', layerAdjustments);
                        }
                        
                        if (!layerAdjustments) return null;
                        
                        return (
                          <>
                            <div>
                              <Label className="text-gray-300">Blend Mode</Label>
                              <select
                                value={layerAdjustments.blendMode}
                                onChange={(e) => updateLayerProperty(selectedLayer, 'imageAdjustments', { ...layerAdjustments, blendMode: e.target.value })}
                                className="w-full mt-2 p-2 bg-black/20 border border-vibrant-purple/30 rounded-md text-gray-200"
                              >
                                <option value="normal">Normal</option>
                                <option value="multiply">Multiply</option>
                                <option value="screen">Screen</option>
                                <option value="overlay">Overlay</option>
                                <option value="soft-light">Soft Light</option>
                                <option value="hard-light">Hard Light</option>
                                <option value="color-dodge">Color Dodge</option>
                                <option value="color-burn">Color Burn</option>
                                <option value="darken">Darken</option>
                                <option value="lighten">Lighten</option>
                                <option value="difference">Difference</option>
                                <option value="exclusion">Exclusion</option>
                                <option value="hue">Hue</option>
                                <option value="saturation">Saturation</option>
                                <option value="color">Color</option>
                                <option value="luminosity">Luminosity</option>
                              </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-gray-300">Opacity: {layerAdjustments.opacity}%</Label>
                                <Slider
                                  value={[layerAdjustments.opacity]}
                                  onValueChange={(value) => updateLayerProperty(selectedLayer, 'imageAdjustments', { ...layerAdjustments, opacity: value[0] })}
                                  max={100}
                                  min={0}
                                  step={1}
                                  className="mt-2"
                                />
                              </div>
                              <div>
                                <Label className="text-gray-300">Fill: {layerAdjustments.fill}%</Label>
                                <Slider
                                  value={[layerAdjustments.fill]}
                                  onValueChange={(value) => updateLayerProperty(selectedLayer, 'imageAdjustments', { ...layerAdjustments, fill: value[0] })}
                                  max={100}
                                  min={0}
                                  step={1}
                                  className="mt-2"
                                />
                              </div>
                            </div>
                            
                            <div>
                              <Label className="text-gray-300">Brightness: {layerAdjustments.brightness}%</Label>
                              <Slider
                                value={[layerAdjustments.brightness]}
                                onValueChange={(value) => updateLayerProperty(selectedLayer, 'imageAdjustments', { ...layerAdjustments, brightness: value[0] })}
                                max={200}
                                min={0}
                                step={1}
                                className="mt-2"
                              />
                            </div>
                            
                            <div>
                              <Label className="text-gray-300">Contrast: {layerAdjustments.contrast}%</Label>
                              <Slider
                                value={[layerAdjustments.contrast]}
                                onValueChange={(value) => updateLayerProperty(selectedLayer, 'imageAdjustments', { ...layerAdjustments, contrast: value[0] })}
                                max={200}
                                min={0}
                                step={1}
                                className="mt-2"
                              />
                            </div>
                            
                            <div>
                              <Label className="text-gray-300">Saturation: {layerAdjustments.saturation}%</Label>
                              <Slider
                                value={[layerAdjustments.saturation]}
                                onValueChange={(value) => updateLayerProperty(selectedLayer, 'imageAdjustments', { ...layerAdjustments, saturation: value[0] })}
                                max={200}
                                min={0}
                                step={1}
                                className="mt-2"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-gray-300">Blur: {layerAdjustments.blur}px</Label>
                                <Slider
                                  value={[layerAdjustments.blur]}
                                  onValueChange={(value) => updateLayerProperty(selectedLayer, 'imageAdjustments', { ...layerAdjustments, blur: value[0] })}
                                  max={50}
                                  min={0}
                                  step={1}
                                  className="mt-2"
                                />
                              </div>
                              <div>
                                <Label className="text-gray-300">Hue: {layerAdjustments.hue}°</Label>
                                <Slider
                                  value={[layerAdjustments.hue]}
                                  onValueChange={(value) => updateLayerProperty(selectedLayer, 'imageAdjustments', { ...layerAdjustments, hue: value[0] })}
                                  max={360}
                                  min={0}
                                  step={1}
                                  className="mt-2"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-gray-300">Gamma: {layerAdjustments.gamma}%</Label>
                                <Slider
                                  value={[layerAdjustments.gamma]}
                                  onValueChange={(value) => updateLayerProperty(selectedLayer, 'imageAdjustments', { ...layerAdjustments, gamma: value[0] })}
                                  max={200}
                                  min={0}
                                  step={1}
                                  className="mt-2"
                                />
                              </div>
                              <div>
                                <Label className="text-gray-300">Sepia: {layerAdjustments.sepia}%</Label>
                                <Slider
                                  value={[layerAdjustments.sepia]}
                                  onValueChange={(value) => updateLayerProperty(selectedLayer, 'imageAdjustments', { ...layerAdjustments, sepia: value[0] })}
                                  max={100}
                                  min={0}
                                  step={1}
                                  className="mt-2"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id="invert"
                                  checked={layerAdjustments.invert}
                                  onChange={(e) => updateLayerProperty(selectedLayer, 'imageAdjustments', { ...layerAdjustments, invert: e.target.checked })}
                                  className="rounded"
                                />
                                <Label htmlFor="invert" className="text-sm text-gray-300">Invert Colors</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id="grayscale"
                                  checked={layerAdjustments.grayscale}
                                  onChange={(e) => updateLayerProperty(selectedLayer, 'imageAdjustments', { ...layerAdjustments, grayscale: e.target.checked })}
                                  className="rounded"
                                />
                                <Label htmlFor="grayscale" className="text-sm text-gray-300">Grayscale</Label>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </>
                  ) : (
                    <div className="text-center text-gray-400 py-8">
                      <Palette className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Select an image layer to adjust its properties</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="layers" className="space-y-4 mt-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-medium text-gray-300">Layers</h3>
                    <span className="text-xs text-gray-400">{layers.length} layers</span>
                  </div>
                  
                  {layers.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No layers yet</p>
                      <p className="text-xs">Upload an image or add text to get started</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {[...layers].sort((a, b) => b.zIndex - a.zIndex).map((layer) => (
                        <div
                          key={layer.id}
                          className={`p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                            selectedLayer === layer.id
                              ? 'border-vibrant-purple/60 bg-vibrant-purple/10'
                              : 'border-vibrant-purple/20 bg-black/20 hover:border-vibrant-purple/40'
                          }`}
                          onClick={() => setSelectedLayer(layer.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <div className="w-6 h-6 rounded bg-vibrant-purple/20 flex items-center justify-center flex-shrink-0">
                                {layer.type === 'image' ? (
                                  <ImageIcon className="w-3 h-3 text-vibrant-purple" />
                                ) : layer.type === 'text' ? (
                                  <Type className="w-3 h-3 text-vibrant-purple" />
                                ) : (
                                  <Square className="w-3 h-3 text-vibrant-purple" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-200 truncate">
                                  {layer.type === 'text' ? layer.content || 'Text' : `${layer.type.charAt(0).toUpperCase() + layer.type.slice(1)} ${layer.id.slice(-4)}`}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {layer.type === 'text' ? `${layer.fontSize || 24}px ${layer.fontFamily || 'Arial'}` : `${Math.round(layer.width)}×${Math.round(layer.height)}`}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              {/* Visibility toggle */}
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateLayerProperty(layer.id, 'visible', !layer.visible);
                                }}
                                className="w-6 h-6 hover:bg-vibrant-purple/20"
                              >
                                {layer.visible ? (
                                  <Eye className="w-3 h-3 text-gray-300" />
                                ) : (
                                  <EyeOff className="w-3 h-3 text-gray-500" />
                                )}
                              </Button>
                              
                              {/* Lock toggle */}
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleLayerLock(layer.id);
                                }}
                                className="w-6 h-6 hover:bg-vibrant-purple/20"
                              >
                                {layer.locked ? (
                                  <Lock className="w-3 h-3 text-vibrant-purple" />
                                ) : (
                                  <Unlock className="w-3 h-3 text-gray-300" />
                                )}
                              </Button>
                              
                              {/* Move up */}
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveLayerUp(layer.id);
                                }}
                                className="w-6 h-6 hover:bg-vibrant-purple/20"
                                disabled={layer.zIndex === Math.max(...layers.map(l => l.zIndex))}
                              >
                                <ChevronUp className="w-3 h-3 text-gray-300" />
                              </Button>
                              
                              {/* Move down */}
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveLayerDown(layer.id);
                                }}
                                className="w-6 h-6 hover:bg-vibrant-purple/20"
                                disabled={layer.zIndex === Math.min(...layers.map(l => l.zIndex))}
                              >
                                <ChevronDown className="w-3 h-3 text-gray-300" />
                              </Button>
                              
                              {/* Delete */}
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteLayer(layer.id);
                                }}
                                className="w-6 h-6 hover:bg-red-500/20 hover:text-red-400"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          
                          {/* Layer opacity slider */}
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                              <span>Opacity</span>
                              <span>{Math.round(layer.opacity * 100)}%</span>
                            </div>
                            <Slider
                              value={[layer.opacity]}
                              onValueChange={(value) => updateLayerProperty(layer.id, 'opacity', value[0])}
                              max={1}
                              min={0}
                              step={0.01}
                              className="w-full"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
                </ScrollArea>
            </Card>
            </div>
          </div>

          {/* Canvas Area */}
          <div className="lg:col-span-6">
            {mainView === 'canvas' ? (
              <Card className="bg-black/30 backdrop-blur-xl border border-vibrant-purple/20 p-6 rounded-2xl shadow-lg h-[calc(100vh-12rem)] flex flex-col overflow-visible">
              <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-200">Canvas (1:1 Ratio)</h2>
                <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setZoom(Math.max(0.5, zoom - 0.1))} className="border-vibrant-purple/30 hover:bg-vibrant-purple/20 text-gray-200 hover:text-white">
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                    <span className="h-9 w-16 rounded-md flex items-center justify-center text-sm bg-black/20">{Math.round(zoom * 100)}%</span>
                    <Button size="sm" variant="outline" onClick={() => setZoom(Math.min(1.1, zoom + 0.1))} className="border-vibrant-purple/30 hover:bg-vibrant-purple/20 text-gray-200 hover:text-white">
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
                <div className="flex-grow flex items-center justify-center">
                <div 
                    className={`border-2 border-dashed border-vibrant-purple/20 overflow-hidden ${canvasShape === 'circle' ? 'rounded-full' : 'rounded-lg'} transition-all duration-300 ease-in-out`}
                  style={{ 
                    width: canvasSize * zoom, 
                    height: canvasSize * zoom,
                      marginTop: '-4rem',
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

          {/* Export Panel */}
                <div className="flex-shrink-0 pt-4 flex justify-center">
                  <div className="bg-black/40 backdrop-blur-xl border border-vibrant-purple/20 rounded-xl px-6 py-3 shadow-lg flex justify-center">
                    <div className="flex items-center gap-4">
                      <div className="text-xs text-vibrant-purple/70 flex items-center gap-2">
                        <span>Optimized</span>
                        <span className="text-gray-600">•</span>
                        <span>1:1 ratio</span>
                        <span className="text-gray-600">•</span>
                        <span>Under 2MB</span>
                      </div>
                <Button 
                  onClick={handleExport}
                  className="bg-vibrant-purple hover:bg-vibrant-purple text-white font-bold py-3 px-6 rounded-xl shadow-[0_0_20px_0] shadow-vibrant-purple/40 hover:shadow-[0_0_25px_3px] hover:shadow-vibrant-purple/60 border border-t-purple-400/80 border-l-purple-400/80 border-b-purple-900/80 border-r-purple-900/80 transition-all duration-300 transform hover:scale-105"
                >
                  Download
                  <Download className="w-5 h-5 ml-3" />
                </Button>
              </div>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="bg-black/30 backdrop-blur-xl border border-vibrant-purple/20 p-6 rounded-2xl shadow-lg h-[calc(100vh-12rem)]">
                <ScrollArea className="h-full w-full pr-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-200">Browse Templates</h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setMainView('canvas')}
                      className="text-gray-400 hover:text-white hover:bg-vibrant-purple/20"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                  <TemplateGallery onSelectTemplate={handleTemplateSelect} />
                </ScrollArea>
              </Card>
            )}
              </div>

          {/* Export Panel */}
          <div className="lg:col-span-3">
            <div className="sticky top-6 h-[calc(100vh-12rem)]">
              <ScrollArea className="h-full w-full pr-4">
                <div className="flex flex-col h-full">
                  <Card className="bg-black/30 backdrop-blur-xl border border-vibrant-purple/20 p-4 rounded-2xl shadow-lg flex-1 flex flex-col justify-center items-center relative overflow-hidden group">
                    {/* Subtle animated glow effect */}
                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                         style={{
                           background: 'radial-gradient(circle at center, rgba(138, 43, 226, 0.1) 0%, transparent 70%)',
                           boxShadow: '0 0 30px rgba(138, 43, 226, 0.2)',
                         }}
                    />
                    
                    {/* Enhanced border glow */}
                    <div className="absolute inset-0 rounded-2xl opacity-30 group-hover:opacity-60 transition-opacity duration-300 pointer-events-none"
                         style={{
                           border: '1px solid rgba(138, 43, 226, 0.3)',
                           boxShadow: 'inset 0 0 20px rgba(138, 43, 226, 0.1), 0 0 20px rgba(138, 43, 226, 0.1)',
                         }}
                    />

              {/* Donation Section */}
                    <p className="text-xs text-center text-vibrant-purple/70 mb-4 w-full relative z-10">
                  Donations of Tokens accepted
                </p>
                    <div className="w-11/12 flex items-center gap-3 p-2 bg-transparent rounded-lg border border-vibrant-purple/30 relative z-10 group-hover:border-vibrant-purple/50 transition-colors duration-300">
                      <a href={`https://solana.fm/address/${solanaAddress}/transactions?cluster=mainnet-alpha`} target="_blank" rel="noopener noreferrer" aria-label="View address on Solana Explorer">
                        <div className="w-8 h-8 rounded-full bg-vibrant-purple/20 flex items-center justify-center group-hover:bg-vibrant-purple/30 transition-colors duration-300">
                          <svg width="16" height="16" viewBox="0 0 397.7 311.7" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <linearGradient id="logosGradient" x1="360.8793" y1="351.4553" x2="141.213" y2="-69.2936" gradientUnits="userSpaceOnUse">
                        <stop offset="0" stopColor="#00FFA3"/>
                        <stop offset="1" stopColor="#DC1FFF"/>
                      </linearGradient>
                      <path d="M64.6 237.9c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1L64.6 237.9z" fill="url(#logosGradient)"/>
                      <path d="M64.6 3.8C67.1 1.4 70.4 0 73.8 0h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1L64.6 3.8z" fill="url(#logosGradient)"/>
                      <path d="M333.1 120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8 0-8.7 7-4.6 11.1l62.7 62.7c2.4 2.4 5.7 3.8 9.2 3.8h317.4c5.8 0 8.7-7 4.6-11.1l-62.7-62.7z" fill="url(#logosGradient)"/>
                    </svg>
                  </div>
                      </a>
                      <span className="text-sm font-mono flex-1 text-center text-gray-300 group-hover:text-gray-200 transition-colors duration-300">
                    {formatAddress(solanaAddress)}
                  </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => copyToClipboard(solanaAddress)}
                        className="hover:bg-vibrant-purple/20 text-gray-200 hover:text-white transition-all duration-300 hover:scale-110"
                      >
                        <Copy className="w-5 h-5" />
                      </Button>
              </div>
            </Card>

                  <Card className="bg-black/30 backdrop-blur-xl border border-vibrant-purple/20 p-4 rounded-2xl shadow-lg mt-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-200">Promoted Channels</h3>
                    <div className="space-y-3">
                      {/* First channel - full width */}
                      <a
                        href={promotedChannels[0].url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative flex items-center gap-3 p-4 rounded-xl transition-all duration-300 ease-out hover:scale-[1.02]"
                        style={{
                          background: 'linear-gradient(135deg, rgba(59, 7, 100, 0.2) 0%, rgba(59, 7, 100, 0.1) 100%)',
                          backdropFilter: 'blur(20px)',
                          border: '1px solid rgba(59, 7, 100, 0.4)',
                          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(59, 7, 100, 0.2)',
                        }}
                      >
                        {/* Animated gradient border */}
                        <div
                          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
                            padding: '1px',
                            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                            maskComposite: 'exclude',
                          }}
                        />

                        {/* Logo container with glassmorphism */}
                        <div className="relative w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden bg-[#F53566]">
                          {promotedChannels[0].logo ? (
                            <img
                              src={promotedChannels[0].logo}
                              alt={`${promotedChannels[0].name} logo`}
                              className="w-7 h-7 object-contain group-hover:scale-110 transition-transform duration-300"
                            />
                          ) : (
                            <User className="w-5 h-5 text-gray-400" />
                          )}
            </div>

                        {/* Channel name with enhanced styling */}
                        <span className="text-sm font-semibold flex-1 text-gray-200 group-hover:text-white transition-colors duration-300">
                          {promotedChannels[0].name}
                        </span>

                        {/* External link icon with glow effect */}
                        <div className="relative">
                          <ExternalLink
                            className="w-4 h-4 text-gray-400 group-hover:text-white transition-all duration-300 group-hover:scale-110"
                            style={{
                              filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.3))',
                            }}
                          />
          </div>

                        {/* Hover glow effect */}
                        <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                             style={{
                               background: 'radial-gradient(circle at center, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
                               boxShadow: '0 0 20px rgba(255, 255, 255, 0.1)',
                             }}
                        />
                      </a>

                      {/* Side by side channels */}
                      <div className="grid grid-cols-2 gap-3">
                        {promotedChannels.slice(1, 3).map((channel) => (
                          <a
                            key={channel.name}
                            href={channel.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative flex items-center gap-2 p-3 rounded-xl transition-all duration-300 ease-out hover:scale-[1.02]"
                            style={{
                              background: 'linear-gradient(135deg, rgba(59, 7, 100, 0.2) 0%, rgba(59, 7, 100, 0.1) 100%)',
                              backdropFilter: 'blur(20px)',
                              border: '1px solid rgba(59, 7, 100, 0.4)',
                              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(59, 7, 100, 0.2)',
                            }}
                          >
                            <div
                              className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                              style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
                                padding: '1px',
                                mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                                maskComposite: 'exclude',
                              }}
                            />
                            {/* Logo container */}
                            <div className="relative w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
                                 style={{
                                   background: 'linear-gradient(135deg, rgba(59, 7, 100, 0.3) 0%, rgba(59, 7, 100, 0.2) 100%)',
                                   backdropFilter: 'blur(10px)',
                                   border: '1px solid rgba(59, 7, 100, 0.5)',
                                   boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(59, 7, 100, 0.3)',
                                 }}>
                              {channel.logo ? (
                                <img
                                  src={channel.logo}
                                  alt={`${channel.name} logo`}
                                  className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-300"
                                />
                              ) : (
                                <User className="w-4 h-4 text-gray-400" />
                              )}
        </div>

                            {/* Channel name */}
                            <span className="text-xs font-semibold flex-1 text-gray-200 group-hover:text-white transition-colors duration-300 truncate">
                              {channel.name}
                            </span>

                            {/* External link icon */}
                            <ExternalLink
                              className="w-3 h-3 text-gray-400 group-hover:text-white transition-all duration-300 group-hover:scale-110"
                              style={{
                                filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.3))',
                              }}
                            />
                            <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                                 style={{
                                   background: 'radial-gradient(circle at center, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
                                   boxShadow: '0 0 20px rgba(255, 255, 255, 0.1)',
                                 }}
                            />
                          </a>
                        ))}
      </div>

                      {/* Second row of side by side channels */}
                      <div className="grid grid-cols-2 gap-3">
                        {promotedChannels.slice(3, 5).map((channel) => (
                          <a
                            key={channel.name}
                            href={channel.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative flex items-center gap-2 p-3 rounded-xl transition-all duration-300 ease-out hover:scale-[1.02]"
                            style={{
                              background: 'linear-gradient(135deg, rgba(59, 7, 100, 0.2) 0%, rgba(59, 7, 100, 0.1) 100%)',
                              backdropFilter: 'blur(20px)',
                              border: '1px solid rgba(59, 7, 100, 0.4)',
                              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(59, 7, 100, 0.2)',
                            }}
                          >
                            <div
                              className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                              style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
                                padding: '1px',
                                mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                                maskComposite: 'exclude',
                              }}
                            />
                            {/* Logo container */}
                            <div className="relative w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
                                 style={{
                                   background: 'linear-gradient(135deg, rgba(59, 7, 100, 0.3) 0%, rgba(59, 7, 100, 0.2) 100%)',
                                   backdropFilter: 'blur(10px)',
                                   border: '1px solid rgba(59, 7, 100, 0.5)',
                                   boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(59, 7, 100, 0.3)',
                                 }}>
                              {channel.logo ? (
                                <img
                                  src={channel.logo}
                                  alt={`${channel.name} logo`}
                                  className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-300"
                                />
                              ) : (
                                <User className="w-4 h-4 text-gray-400" />
                              )}
                            </div>

                            {/* Channel name */}
                            <span className="text-xs font-semibold flex-1 text-gray-200 group-hover:text-white transition-colors duration-300 truncate">
                              {channel.name}
                            </span>

                            {/* External link icon */}
                            <ExternalLink
                              className="w-3 h-3 text-gray-400 group-hover:text-white transition-all duration-300 group-hover:scale-110"
                              style={{
                                filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.3))',
                              }}
                            />
                            <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                                 style={{
                                   background: 'radial-gradient(circle at center, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
                                   boxShadow: '0 0 20px rgba(255, 255, 255, 0.1)',
                                 }}
                            />
                          </a>
                        ))}
                      </div>

                      {/* Third row with last channel and placeholder */}
                      <div className="grid grid-cols-2 gap-3">
                        {/* Last channel */}
                        <a
                          href={promotedChannels[5].url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group relative flex items-center gap-2 p-3 rounded-xl transition-all duration-300 ease-out hover:scale-[1.02]"
                          style={{
                            background: 'linear-gradient(135deg, rgba(59, 7, 100, 0.2) 0%, rgba(59, 7, 100, 0.1) 100%)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(59, 7, 100, 0.4)',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(59, 7, 100, 0.2)',
                          }}
                        >
                          <div
                            className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            style={{
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
                              padding: '1px',
                              mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                              maskComposite: 'exclude',
                            }}
                          />
                          {/* Logo container */}
                          <div className="relative w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
                               style={{
                                 background: 'linear-gradient(135deg, rgba(59, 7, 100, 0.3) 0%, rgba(59, 7, 100, 0.2) 100%)',
                                 backdropFilter: 'blur(10px)',
                                 border: '1px solid rgba(59, 7, 100, 0.5)',
                                 boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(59, 7, 100, 0.3)',
                               }}>
                            {promotedChannels[5].logo ? (
                              <img
                                src={promotedChannels[5].logo}
                                alt={`${promotedChannels[5].name} logo`}
                                className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-300"
                              />
                            ) : (
                              <User className="w-4 h-4 text-gray-400" />
                            )}
                          </div>

                          {/* Channel name */}
                          <span className="text-xs font-semibold flex-1 text-gray-200 group-hover:text-white transition-colors duration-300 truncate">
                            {promotedChannels[5].name}
                          </span>

                          {/* External link icon */}
                          <ExternalLink
                            className="w-3 h-3 text-gray-400 group-hover:text-white transition-all duration-300 group-hover:scale-110"
                            style={{
                              filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.3))',
                            }}
                          />
                          <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                               style={{
                                 background: 'radial-gradient(circle at center, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
                                 boxShadow: '0 0 20px rgba(255, 255, 255, 0.1)',
                               }}
                          />
                        </a>

                        {/* Placeholder for "Your Channel" */}
                        <div className="group relative flex items-center gap-2 p-3 rounded-xl transition-all duration-300 ease-out border-2 border-dashed border-vibrant-purple/30 bg-black/10">
                          {/* Logo container */}
                          <div className="relative w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden bg-vibrant-purple/20">
                            <User className="w-4 h-4 text-vibrant-purple/60" />
                          </div>

                          {/* Placeholder text */}
                          <span className="text-xs font-semibold flex-1 text-vibrant-purple/60">
                            Your Channel
                          </span>

                          {/* Question mark icon */}
                          <div className="w-3 h-3 text-vibrant-purple/60">?</div>
                        </div>
                      </div>

                      {/* Additional placeholder rows to fill space */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="group relative flex items-center gap-2 p-3 rounded-xl transition-all duration-300 ease-out border-2 border-dashed border-vibrant-purple/30 bg-black/10">
                          <div className="relative w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden bg-vibrant-purple/20">
                            <User className="w-4 h-4 text-vibrant-purple/60" />
                          </div>
                          <span className="text-xs font-semibold flex-1 text-vibrant-purple/60">
                            Your Channel
                          </span>
                          <div className="w-3 h-3 text-vibrant-purple/60">?</div>
                        </div>
                        <div className="group relative flex items-center gap-2 p-3 rounded-xl transition-all duration-300 ease-out border-2 border-dashed border-vibrant-purple/30 bg-black/10">
                          <div className="relative w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden bg-vibrant-purple/20">
                            <User className="w-4 h-4 text-vibrant-purple/60" />
                          </div>
                          <span className="text-xs font-semibold flex-1 text-vibrant-purple/60">
                            Your Channel
                          </span>
                          <div className="w-3 h-3 text-vibrant-purple/60">?</div>
                        </div>
                      </div>

                      {/* Get featured text */}
                      <div className="text-center pt-2">
                        <p className="text-xs text-vibrant-purple/70 italic">
                          Get featured here based on donations sent
                        </p>
                      </div>
                    </div>
                  </Card>
      </div>
              </ScrollArea>
            </div>
          </div>
        </div>
        <footer className="w-full py-4 mt-8 text-center">
          <p className="text-sm text-vibrant-purple/70 mb-4">Made with ❤️ by <a href="https://xeenon.xyz/f7ash" target="_blank" rel="noopener noreferrer" className="text-vibrant-purple hover:text-vibrant-pink transition-colors">f7ash</a></p>
        <div className="container mx-auto flex items-center justify-center">
            <p className="text-lg mr-2 text-gray-300">Made for</p>
          <img src="/xeenon-logo.png" alt="Xeenon Logo" className="h-8 w-auto" />
            <p className="text-lg ml-2 text-gray-300">Community</p>
        </div>
      </footer>
      </div>
    </div>
  );
};

export default LogoTokenEditor;
