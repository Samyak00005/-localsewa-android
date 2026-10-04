import React from 'react';
import {
  Image,
  StyleSheet,
  View,
} from 'react-native';
import {
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';

import {
  AppText,
  Button,
} from '../../components/ui';
import {
  layout,
  radius,
  spacing,
  useAppTheme,
} from '../../theme';
import {AuthStackParamList} from '../../navigation/types';

type Props = NativeStackScreenProps<
  AuthStackParamList,
  'AuthLanding'
>;

export function AuthLandingScreen({
  navigation,
}: Props): React.JSX.Element {
  const {theme} = useAppTheme();

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor:
            theme.colors.background,
        },
      ]}>
      <View style={styles.content}>
        <View style={styles.hero}>
          <Image
            source={require('../../assets/branding/localsewa-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          <AppText
            variant="h1"
            style={styles.title}>
            Local help, without the hassle.
          </AppText>

          <AppText
            variant="body"
            muted
            style={styles.description}>
            Discover trusted local professionals, manage bookings and stay
            connected from one place.
          </AppText>
        </View>

        <View style={styles.actions}>
          <Button
            label="Sign in"
            onPress={() =>
              navigation.navigate(
                'Login',
              )
            }
            fullWidth
          />

          <Button
            label="Create an account"
            variant="outline"
            onPress={() =>
              navigation.navigate(
                'Register',
              )
            }
            fullWidth
          />

          <AppText
            variant="caption"
            muted
            style={styles.legal}>
            By continuing, you agree to Localsewa's Terms & Conditions and
            Privacy Policy.
          </AppText>
        </View>
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
    paddingHorizontal:
      layout.screenHorizontal,
    paddingTop: spacing[8],
    paddingBottom: spacing[8],
    justifyContent: 'space-between',
  },
  hero: {
    alignItems: 'center',
  },
  logo: {
    width: 132,
    height: 132,
    borderRadius: radius.xl,
  },
  title: {
    textAlign: 'center',
    marginTop: spacing[7],
  },
  description: {
    textAlign: 'center',
    marginTop: spacing[3],
    maxWidth: 340,
  },
  actions: {
    width: '100%',
    gap: spacing[3],
  },
  legal: {
    textAlign: 'center',
    marginTop: spacing[2],
  },
});
