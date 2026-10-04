import React, {useEffect} from 'react';
import {
  Image,
  StyleSheet,
  View,
} from 'react-native';
import {
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';

import {AppText} from '../../components/ui';
import {
  radius,
  spacing,
  useAppTheme,
} from '../../theme';
import {AuthStackParamList} from '../../navigation/types';

type Props = NativeStackScreenProps<
  AuthStackParamList,
  'Splash'
>;

export function BrandSplashScreen({
  navigation,
}: Props): React.JSX.Element {
  const {theme} = useAppTheme();

  useEffect(() => {
    // Short React-level bridge after the Android native splash.
    // Later the real session bootstrap will replace this fixed timer.
    const timer = setTimeout(() => {
      navigation.replace('AuthLanding');
    }, 550);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {backgroundColor: theme.colors.background},
      ]}>
      <View style={styles.content}>
        <View
          style={[
            styles.logoFrame,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}>
          <Image
            source={require('../../assets/branding/localsewa-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <AppText
          variant="h2"
          style={styles.brand}>
          Localsewa
        </AppText>

        <AppText
          variant="bodySmall"
          muted
          style={styles.tagline}>
          Fast • Trusted • Nearby
        </AppText>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[8],
  },
  logoFrame: {
    width: 156,
    height: 156,
    borderWidth: 1,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logo: {
    width: 150,
    height: 150,
  },
  brand: {
    marginTop: spacing[6],
  },
  tagline: {
    marginTop: spacing[1],
  },
});
