import { Platform } from 'react-native';

export const shadows = {
  none: {},
  sm: Platform.select({
    android: { elevation: 1 },
    default: {
      shadowColor: '#000000',
      shadowOpacity: 0.06,
      shadowRadius: 3,
      shadowOffset: { width: 0, height: 1 },
    },
  }),
  md: Platform.select({
    android: { elevation: 3 },
    default: {
      shadowColor: '#000000',
      shadowOpacity: 0.08,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
    },
  }),
} as const;
