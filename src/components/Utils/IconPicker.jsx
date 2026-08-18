import React from 'react';
import {
  Laptop,
  Ruler,
  Activity,
  Briefcase,
  Wrench,
  GraduationCap,
  BookOpen,
  Cog,
  Cpu,
  Code,
  Globe,
  Zap,
  Heart,
  Compass,
  Layers,
  Brain,
  Shield,
  Rocket,
  Award,
  Target,
  Sparkles,
  FileText,
  Folder,
  Search,
  Camera,
  Star,
  Book,
  Feather,
  Lightbulb,
  Check
} from 'lucide-react';

export const ICON_MAP = {
  Laptop,
  Ruler,
  Activity,
  Briefcase,
  Wrench,
  GraduationCap,
  BookOpen,
  Cog,
  Cpu,
  Code,
  Globe,
  Zap,
  Heart,
  Compass,
  Layers,
  Brain,
  Shield,
  Rocket,
  Award,
  Target,
  Sparkles,
  FileText,
  Folder,
  Search,
  Camera,
  Star,
  Book,
  Feather,
  Lightbulb,
};

export function DynamicIcon({ name, size = 18, className = '', color }) {
  const IconComponent = ICON_MAP[name] || ICON_MAP.Laptop;
  return <IconComponent size={size} className={className} color={color} />;
}

export default function IconPicker({ selectedIcon, onSelectIcon }) {
  return (
    <div className="icon-picker-container" style={{ marginTop: '8px' }}>
      <label className="edit-label" style={{ display: 'block', marginBottom: '6px' }}>
        Selecione o Ícone para a Preferência:
      </label>
      <div
        className="icon-picker-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(44px, 1fr))',
          gap: '8px',
          maxHeight: '180px',
          overflowY: 'auto',
          padding: '8px',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
        }}
      >
        {Object.keys(ICON_MAP).map((iconName) => {
          const Icon = ICON_MAP[iconName];
          const isSelected = selectedIcon === iconName;
          return (
            <button
              key={iconName}
              type="button"
              className={`icon-picker-item ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectIcon(iconName)}
              title={iconName}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '42px',
                borderRadius: '8px',
                border: isSelected ? '2px solid #00875F' : '1px solid #cbd5e1',
                background: isSelected ? '#e6f4ea' : '#ffffff',
                color: isSelected ? '#00875F' : '#475569',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={20} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
