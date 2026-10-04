import React from 'react';
import {
  Bell,
  Bookmark,
  BriefcaseBusiness,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  CircleHelp,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  Home,
  KeyRound,
  LockKeyhole,
  Mail,
  MapPin,
  MessageCircle,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Send,
  Shield,
  ShieldCheck,
  Star,
  Trash2,
  UserPen,
  UserRound,
  Volume2,
  VolumeX,
  Wrench,
} from 'lucide-react-native';

const ICONS = {
  bell: Bell,
  bookmark: Bookmark,
  briefcase: BriefcaseBusiness,
  calendar: CalendarDays,
  chevronDown: ChevronDown,
  chevronRight: ChevronRight,
  chevronUp: ChevronUp,
  externalLink: ExternalLink,
  eye: Eye,
  eyeOff: EyeOff,
  fileText: FileText,
  help: CircleHelp,
  home: Home,
  key: KeyRound,
  lock: LockKeyhole,
  mail: Mail,
  mapPin: MapPin,
  message: MessageCircle,
  mic: Mic,
  micOff: MicOff,
  phone: Phone,
  phoneOff: PhoneOff,
  send: Send,
  shield: Shield,
  shieldCheck: ShieldCheck,
  star: Star,
  trash: Trash2,
  userEdit: UserPen,
  user: UserRound,
  volume: Volume2,
  volumeOff: VolumeX,
  wrench: Wrench,
} as const;

export type AppIconName = keyof typeof ICONS;

export const iconSize = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 28,
  xl: 32,
} as const;

type Props = {
  name: AppIconName;
  size?: number;
  color: string;
  strokeWidth?: number;
  fill?: string;
};

export function AppIcon({
  name,
  size = iconSize.md,
  color,
  strokeWidth = 2,
  fill = 'none',
}: Props): React.JSX.Element {
  const Icon = ICONS[name];

  return (
    <Icon
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      fill={fill}
    />
  );
}
