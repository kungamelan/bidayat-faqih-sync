import React from 'react';
import { GraduationCap, User } from 'lucide-react';

export interface PresetAvatar {
  id: string;
  name: string;
  emoji: string;
  bgGradient: string;
  borderColor: string;
}

export const PRESET_AVATARS: PresetAvatar[] = [
  {
    id: 'avatar-scholar',
    name: 'طالب العلم',
    emoji: '🎓',
    bgGradient: 'from-emerald-700 to-emerald-950',
    borderColor: 'border-emerald-500/40',
  },
  {
    id: 'avatar-reader',
    name: 'قارئ المتون',
    emoji: '📖',
    bgGradient: 'from-blue-700 to-slate-950',
    borderColor: 'border-blue-500/40',
  },
  {
    id: 'avatar-star',
    name: 'نجم الفقه',
    emoji: '🌟',
    bgGradient: 'from-amber-600 to-amber-950',
    borderColor: 'border-amber-500/40',
  },
  {
    id: 'avatar-mihrab',
    name: 'صاحب المحراب',
    emoji: '🕌',
    bgGradient: 'from-teal-700 to-emerald-950',
    borderColor: 'border-teal-500/40',
  },
  {
    id: 'avatar-nature',
    name: 'غرس الفضيلة',
    emoji: '🌿',
    bgGradient: 'from-green-600 to-slate-900',
    borderColor: 'border-green-500/40',
  },
  {
    id: 'avatar-champion',
    name: 'بطل التحدي',
    emoji: '🏆',
    bgGradient: 'from-amber-500 to-amber-900',
    borderColor: 'border-amber-400/50',
  },
  {
    id: 'avatar-peace',
    name: 'السمت الصالح',
    emoji: '🕊️',
    bgGradient: 'from-cyan-700 to-blue-950',
    borderColor: 'border-cyan-500/40',
  },
  {
    id: 'avatar-gem',
    name: 'جوهرة الإتقان',
    emoji: '💎',
    bgGradient: 'from-purple-700 to-slate-950',
    borderColor: 'border-purple-500/40',
  },
];

interface StudentAvatarProps {
  avatar?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const StudentAvatar: React.FC<StudentAvatarProps> = ({
  avatar,
  name = 'طالب',
  size = 'md',
  className = '',
}) => {
  // Size mapping
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-11 h-11 text-base',
    lg: 'w-16 h-16 text-2xl',
    xl: 'w-20 h-20 text-3xl',
  };

  const currentSizeClass = sizeClasses[size] || sizeClasses.md;

  // 1. Custom uploaded image (Data URL or HTTP URL)
  if (avatar && (avatar.startsWith('data:image') || avatar.startsWith('http') || avatar.startsWith('blob'))) {
    return (
      <div
        className={`${currentSizeClass} rounded-2xl overflow-hidden border border-emerald-500/30 bg-slate-900 shadow-md shrink-0 flex items-center justify-center ${className}`}
      >
        <img
          src={avatar}
          alt={name}
          className="w-full h-full object-cover rounded-2xl"
          loading="lazy"
        />
      </div>
    );
  }

  // 2. Preset Avatar by ID
  const preset = PRESET_AVATARS.find((p) => p.id === avatar);
  if (preset) {
    return (
      <div
        className={`${currentSizeClass} rounded-2xl bg-gradient-to-br ${preset.bgGradient} border ${preset.borderColor} shadow-md shrink-0 flex items-center justify-center select-none ${className}`}
        title={`${preset.name} - ${name}`}
      >
        <span className="leading-none transform translate-y-[-1px]">{preset.emoji}</span>
      </div>
    );
  }

  // 3. Fallback: First letter or default graduation cap
  return (
    <div
      className={`${currentSizeClass} rounded-2xl bg-emerald-700 border border-emerald-500/40 text-white font-bold shadow-md shrink-0 flex items-center justify-center select-none ${className}`}
    >
      {name ? name.trim().charAt(0) : <GraduationCap className="w-5 h-5" />}
    </div>
  );
};

/**
 * Resizes a chosen file from user device into a tiny data URL (max 128x128)
 */
export function compressImageFileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('لم يتم اختيار ملف'));
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 128;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height *= MAX_DIM / width;
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width *= MAX_DIM / height;
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        // High quality compressed JPEG
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('فشل قراءة الصورة'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('فشل رفع الملف'));
    reader.readAsDataURL(file);
  });
}
