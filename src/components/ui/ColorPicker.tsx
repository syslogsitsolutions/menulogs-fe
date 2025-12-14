import { useState } from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
  presets?: string[];
}

const DEFAULT_PRESETS = [
  '#ee6620', // Sunset Orange (Default)
  '#0D47A1', // Ocean Blue
  '#10b981', // Emerald Green
  '#8b5cf6', // Royal Purple
  '#ef4444', // Ruby Red
  '#f59e0b', // Golden Amber
  '#ec4899', // Rose Pink
  '#14b8a6', // Teal
  '#6366f1', // Indigo
  '#64748b', // Slate
  '#D32F2F', // Red
];

const ColorPicker = ({ 
  value, 
  onChange, 
  label,
  presets = DEFAULT_PRESETS 
}: ColorPickerProps) => {
  const [customColor, setCustomColor] = useState(value);

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setCustomColor(color);
    onChange(color);
  };

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-sm font-medium text-gray-700">{label}</label>
      )}
      
      {/* Preset Colors */}
      <div className="flex flex-wrap gap-2">
        {presets.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            className={cn(
              'w-10 h-10 rounded-lg border-2 transition-all flex items-center justify-center',
              value === color 
                ? 'border-gray-900 scale-110' 
                : 'border-transparent hover:scale-105'
            )}
            style={{ backgroundColor: color }}
            title={color}
          >
            {value === color && (
              <Check className="w-5 h-5 text-white drop-shadow-md" />
            )}
          </button>
        ))}
      </div>

      {/* Custom Color Input */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <input
            type="color"
            value={customColor}
            onChange={handleCustomChange}
            className="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-200"
          />
        </div>
        <div className="flex-1">
          <input
            type="text"
            value={value}
            onChange={(e) => {
              const color = e.target.value;
              if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
                onChange(color);
                setCustomColor(color);
              }
            }}
            placeholder="#ee6620"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      {/* Preview */}
      <div 
        className="p-4 rounded-lg text-white text-center font-medium"
        style={{ backgroundColor: value }}
      >
        Preview: Your Brand Color
      </div>
    </div>
  );
};

export default ColorPicker;

