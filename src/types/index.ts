export interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
  is_pinned: boolean;
  pinned_position: number;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface Reminder {
  id: string;
  note_id: string;
  remind_at: string;
  is_triggered: boolean;
  created_at: string;
}

export interface Setting {
  key: string;
  value: string;
}

export interface CreateNotePayload {
  title: string;
  content: string;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface UpdateNotePayload {
  id: string;
  title?: string;
  content?: string;
  color?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  is_pinned?: boolean;
  pinned_position?: number;
}

export interface CreateTagPayload {
  name: string;
  color: string;
}

export interface UpdateTagPayload {
  id: string;
  name?: string;
  color?: string;
}

export interface CreateReminderPayload {
  note_id: string;
  remind_at: string;
}

export type Language = 'zh-CN' | 'zh-TW' | 'en';
export type ReminderEffectType = 'color-blink' | 'border-blink' | 'shake' | 'bounce' | 'glow';
export type ViewMode = 'notes' | 'tags' | 'settings';

export const NOTE_COLORS = [
  '#FF8C42', '#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#9B59B6',
  '#FF78C4', '#A8E6CF', '#FFD3B6', '#DCEDC1', '#D4A5A5', '#FFC3A0',
  '#FF9AA2', '#B5EAD7', '#C7CEEA', '#E2F0CB', '#FFDAC1', '#FFB7B2',
  '#FF677D', '#D4A5FF', '#392F5A', '#F8B500', '#00B8A9', '#F6416C',
  '#845EC2', '#D65DB1', '#FF6F91', '#FFC75F', '#F9F871', '#2C73D2',
  '#0089BA', '#FF9671',
] as const;

export const DEFAULT_NOTE_COLORS: Record<string, string> = {
  '橙记橙': '#FF8C42',
  '珊瑚红': '#FF6B6B',
  '柠檬黄': '#FFD93D',
  '薄荷绿': '#6BCB77',
  '天空蓝': '#4D96FF',
  '薰衣紫': '#9B59B6',
  '樱花粉': '#FF78C4',
  '翡翠绿': '#A8E6CF',
  '暖杏色': '#FFD3B6',
  '橄榄绿': '#DCEDC1',
  '玫瑰灰': '#D4A5A5',
  '蜜桃橙': '#FFC3A0',
  '桃花粉': '#FF9AA2',
  '薄荷奶': '#B5EAD7',
  '丁香紫': '#C7CEEA',
  '嫩芽绿': '#E2F0CB',
  '暖橘粉': '#FFDAC1',
  '草莓红': '#FFB7B2',
  '玫红色': '#FF677D',
  '紫罗兰': '#D4A5FF',
  '深空蓝': '#392F5A',
  '琥珀黄': '#F8B500',
  '孔雀绿': '#00B8A9',
  '胭脂红': '#F6416C',
  '梦幻紫': '#845EC2',
  '兰花粉': '#D65DB1',
  '蜜瓜红': '#FF6F91',
  '金盏黄': '#FFC75F',
  '柠檬奶': '#F9F871',
  '宝石蓝': '#2C73D2',
  '湖水蓝': '#0089BA',
  '暖阳橙': '#FF9671',
};

export const REMINDER_SOUNDS = [
  { id: 'default', name: '默认', file: '' },
  { id: 'bell', name: '铃声', file: 'bell.mp3' },
  { id: 'chime', name: '风铃', file: 'chime.mp3' },
  { id: 'alert', name: '提示', file: 'alert.mp3' },
  { id: 'gentle', name: '轻柔', file: 'gentle.mp3' },
  { id: 'digital', name: '电子', file: 'digital.mp3' },
] as const;
