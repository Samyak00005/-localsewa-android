import React from 'react';
import {
  ArrowRight,
  Bell,
  Bookmark,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  CircleHelp,
  Clock3,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  Grid2X2,
  Hammer,
  Home,
  KeyRound,
  LayoutGrid,
  LockKeyhole,
  LogOut,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Search,
  Send,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  UserPen,
  UserRound,
  Volume2,
  VolumeX,
  Wrench,
  X,
  Zap,
} from 'lucide-react-native';

const ICONS = {
  arrowRight: ArrowRight,
  bell: Bell,
  bookmark: Bookmark,
  briefcase: BriefcaseBusiness,
  calendar: CalendarDays,
  checkCircle: CheckCircle2,
  chevronDown: ChevronDown,
  chevronRight: ChevronRight,
  chevronUp: ChevronUp,
  clock: Clock3,
  externalLink: ExternalLink,
  eye: Eye,
  eyeOff: EyeOff,
  fileText: FileText,
  grid: Grid2X2,
  servicesGrid: LayoutGrid,
  hammer: Hammer,
  help: CircleHelp,
  home: Home,
  key: KeyRound,
  lock: LockKeyhole,
  logOut: LogOut,
  mail: Mail,
  mapPin: MapPin,
  menu: Menu,
  message: MessageCircle,
  mic: Mic,
  micOff: MicOff,
  phone: Phone,
  phoneOff: PhoneOff,
  search: Search,
  send: Send,
  shield: Shield,
  shieldCheck: ShieldCheck,
  sparkles: Sparkles,
  star: Star,
  trash: Trash2,
  userEdit: UserPen,
  user: UserRound,
  volume: Volume2,
  volumeOff: VolumeX,
  wrench: Wrench,
  x: X,
  zap: Zap,
} as const;

export type AppIconName =
  keyof typeof ICONS;

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
