import React from 'react';
import {
  Apple,
  Armchair,
  ArrowUpDown,
  Baby,
  Bath,
  BatteryCharging,
  Bike,
  BriefcaseBusiness,
  Building2,
  Calculator,
  CalendarDays,
  Camera,
  Car,
  CookingPot,
  Droplets,
  Dumbbell,
  FileText,
  FireExtinguisher,
  Fish,
  Flame,
  Flower2,
  Gem,
  GraduationCap,
  Hammer,
  HardHat,
  HeartHandshake,
  Home,
  KeyRound,
  Keyboard,
  Laptop,
  LayoutGrid,
  Map,
  Megaphone,
  MessageCircle,
  Monitor,
  MoonStar,
  Music,
  Package,
  Palette,
  PawPrint,
  Plane,
  Printer,
  Recycle,
  Ruler,
  Scale,
  Scissors,
  Search,
  Shield,
  ShieldCheck,
  Shirt,
  ShoppingBasket,
  Smartphone,
  Snowflake,
  Sofa,
  Sparkles,
  Speaker,
  Sprout,
  Stethoscope,
  Sun,
  Tent,
  Truck,
  Tv,
  UserRound,
  UtensilsCrossed,
  Video,
  Watch,
  Waves,
  Wrench,
  Zap,
} from 'lucide-react-native';

type Props = {
  slug?: string;
  name: string;
  size?: number;
  color: string;
};

// A stable pest-control fallback using an already-supported Lucide icon.
const BugSafe = Shield;

const CATEGORY_ICONS = {
  electrician: Zap,
  plumber: Wrench,
  carpenter: Hammer,
  cleaning: Sparkles,
  'ac-repair': Snowflake,
  mechanic: Car,
  'appliance-repair': Wrench,
  'refrigerator-repair': Snowflake,
  'washing-machine-repair': Sparkles,
  'geyser-repair': Flame,
  'ro-water-purifier': Droplets,
  'tv-repair': Tv,
  'computer-laptop-repair': Laptop,
  'mobile-repair': Smartphone,
  'printer-repair': Printer,
  'cctv-security': Camera,
  locksmith: KeyRound,
  painter: Palette,
  'mason-construction': HardHat,
  'interior-designer': Armchair,
  architect: Ruler,
  'furniture-assembly': Armchair,
  'pest-control': BugSafe,
  gardening: Sprout,
  'water-tank-cleaning': Droplets,
  'bathroom-cleaning': Bath,
  'sofa-carpet-cleaning': Sofa,
  'laundry-dry-cleaning': Shirt,
  'cook-chef': CookingPot,
  'tiffin-service': UtensilsCrossed,
  catering: UtensilsCrossed,
  beautician: Sparkles,
  'salon-haircut': Scissors,
  'makeup-artist': Palette,
  'mehndi-artist': Palette,
  'massage-spa': Sparkles,
  'fitness-trainer': Dumbbell,
  'yoga-instructor': UserRound,
  'home-tutor': GraduationCap,
  'music-teacher': Music,
  'dance-teacher': Music,
  photographer: Camera,
  videographer: Video,
  'event-planner': CalendarDays,
  'event-decorator': Sparkles,
  'dj-sound': Speaker,
  driver: Car,
  'taxi-cab': Car,
  'bike-service': Bike,
  'car-wash': Droplets,
  'packers-movers': Truck,
  'courier-delivery': Package,
  babysitter: Baby,
  'elder-care': HeartHandshake,
  'nurse-patient-care': Stethoscope,
  physiotherapy: Stethoscope,
  'pet-care': PawPrint,
  veterinary: PawPrint,
  tailor: Scissors,
  'legal-services': Scale,
  'ca-tax-consultant': Calculator,
  'insurance-advisor': ShieldCheck,
  'solar-services': Sun,
  'generator-inverter': BatteryCharging,
  'welder-fabricator': Flame,
  'borewell-pump': Droplets,
  'glass-aluminium': LayoutGrid,
  waterproofing: Droplets,
  'security-guard': Shield,
  'domestic-help': Home,
  'home-renovation': Hammer,
  roofing: Home,
  'false-ceiling': LayoutGrid,
  'modular-kitchen': CookingPot,
  'tile-marble-work': LayoutGrid,
  'floor-polishing': Sparkles,
  'drain-cleaning': Wrench,
  'septic-tank-cleaning': Droplets,
  'chimney-repair': Wrench,
  'microwave-oven-repair': CookingPot,
  'gas-stove-repair': Flame,
  'dishwasher-repair': Droplets,
  'chimney-cleaning': Sparkles,
  'mattress-cleaning': Sparkles,
  'office-cleaning': Building2,
  housekeeping: Home,
  upholstery: Armchair,
  'aquarium-service': Fish,
  'shoe-repair': Wrench,
  'watch-repair': Watch,
  'jewellery-repair': Gem,
  'driving-school': Car,
  'ev-repair': BatteryCharging,
  'travel-agent': Plane,
  'tour-guide': Map,
  'tent-house': Tent,
  florist: Flower2,
  'pandit-puja': Flame,
  astrologer: MoonStar,
  'property-dealer': Building2,
  'web-designer': Monitor,
  'graphic-designer': Palette,
  'digital-marketing': Megaphone,
  'computer-training': Laptop,
  'data-entry': Keyboard,
  'cyber-cafe': Monitor,
  'photocopy-printing': Printer,
  'document-service': FileText,
  'home-inspection': Search,
  'land-surveyor': Ruler,
  'fire-safety': FireExtinguisher,
  'lift-repair': ArrowUpDown,
  'water-tanker': Truck,
  'milk-delivery': Droplets,
  'grocery-delivery': ShoppingBasket,
  'scrap-dealer': Recycle,
  'pool-cleaning': Waves,
  'speech-therapy': MessageCircle,
  'dietitian-nutritionist': Apple,
  'rental-equipment': BriefcaseBusiness,

  // Known live/custom categories that are not part of the canonical 120.
  developer: Laptop,
  'web-development': Monitor,
} as const;

function normalize(
  value?: string,
): string {
  return (value ?? '')
    .trim()
    .toLowerCase();
}

function keywordFallback(
  name: string,
) {
  const value =
    normalize(name);

  if (
    value.includes(
      'electric',
    )
  ) {
    return Zap;
  }

  if (
    value.includes(
      'plumb',
    ) ||
    value.includes(
      'repair',
    ) ||
    value.includes(
      'service',
    )
  ) {
    return Wrench;
  }

  if (
    value.includes(
      'clean',
    )
  ) {
    return Sparkles;
  }

  if (
    value.includes(
      'car',
    ) ||
    value.includes(
      'driver',
    )
  ) {
    return Car;
  }

  if (
    value.includes(
      'computer',
    ) ||
    value.includes(
      'developer',
    ) ||
    value.includes(
      'web',
    )
  ) {
    return Laptop;
  }

  if (
    value.includes(
      'photo',
    )
  ) {
    return Camera;
  }

  if (
    value.includes(
      'food',
    ) ||
    value.includes(
      'cook',
    )
  ) {
    return CookingPot;
  }

  if (
    value.includes(
      'health',
    ) ||
    value.includes(
      'nurse',
    )
  ) {
    return Stethoscope;
  }

  if (
    value.includes(
      'home',
    ) ||
    value.includes(
      'house',
    )
  ) {
    return Home;
  }

  return LayoutGrid;
}

export function ServiceCategoryIcon({
  slug,
  name,
  size = 27,
  color,
}: Props): React.JSX.Element {
  const normalizedSlug =
    normalize(slug);

  const Icon =
    CATEGORY_ICONS[
      normalizedSlug as keyof typeof CATEGORY_ICONS
    ] ??
    keywordFallback(
      name,
    );

  return (
    <Icon
      size={size}
      color={color}
      strokeWidth={1.9}
    />
  );
}
