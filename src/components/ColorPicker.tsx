import React from 'react';
import { NOTE_COLORS, DEFAULT_NOTE_COLORS } from '../types';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  showLabels?: boolean;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ value, onChange, showLabels = false }) => {
  const colorNames = Object.keys(DEFAULT_NOTE_COLORS);

  return (
    <div className="color-picker">
      <div className="grid grid-cols-8 gap-2">
        {NOTE_COLORS.map((color, i) => (
          <button
            key={color}
            type="button"
            className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
              value === color ? 'border-gray-800 ring-2 ring-gray-400' : 'border-transparent'
            }`}
            style={{ backgroundColor: color }}
            title={showLabels ? colorNames[i] : color}
            onClick={() => onChange(color)}
          />
        ))}
      </div>
    </div>
  );
};

export default ColorPicker;
