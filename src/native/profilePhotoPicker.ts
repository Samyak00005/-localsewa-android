import {
  NativeModules,
  Platform,
} from 'react-native';

import {
  ProfileImageUpload,
} from '../types/account';

type NativeProfilePhotoPicker = {
  pickProfilePhoto(): Promise<ProfileImageUpload | null>;
};

export async function pickProfilePhoto(): Promise<ProfileImageUpload | null> {
  if (Platform.OS !== 'android') {
    throw new Error('Profile photo editing is currently available on Android only.');
  }

  const module = NativeModules.ProfilePhotoPicker as
    | NativeProfilePhotoPicker
    | undefined;

  if (!module?.pickProfilePhoto) {
    throw new Error(
      'Profile photo picker is unavailable. Rebuild the Android app and try again.',
    );
  }

  return module.pickProfilePhoto();
}
