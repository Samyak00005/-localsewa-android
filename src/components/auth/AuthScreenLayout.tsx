import React, {PropsWithChildren} from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {AppText} from '../ui';
import {
  layout,
  radius,
  spacing,
  useAppTheme,
} from '../../theme';

type AuthScreenLayoutProps = PropsWithChildren<{
  eyebrow?: string;
  title: string;
  description?: string;
  showBrand?: boolean;
}>;

export function AuthScreenLayout({
  eyebrow,
  title,
  description,
  showBrand = true,
  children,
}: AuthScreenLayoutProps): React.JSX.Element {
  const {theme} = useAppTheme();

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {backgroundColor: theme.colors.background},
      ]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          {showBrand ? (
            <View style={styles.brandRow}>
              <Image
                source={require('../../assets/branding/localsewa-logo.png')}
                style={styles.brandLogo}
                resizeMode="contain"
              />
              <View style={styles.brandCopy}>
                <AppText
                  variant="title"
                  style={styles.brandName}>
                  Localsewa
                </AppText>
                <AppText
                  variant="caption"
                  muted>
                  Fast • Trusted • Nearby
                </AppText>
              </View>
            </View>
          ) : null}

          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}>
            {eyebrow ? (
              <AppText
                variant="overline"
                color={theme.colors.primary}
                style={styles.eyebrow}>
                {eyebrow}
              </AppText>
            ) : null}

            <AppText variant="h2">
              {title}
            </AppText>

            {description ? (
              <AppText
                variant="bodySmall"
                muted
                style={styles.description}>
                {description}
              </AppText>
            ) : null}

            <View style={styles.body}>
              {children}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: layout.screenHorizontal,
    paddingTop: spacing[5],
    paddingBottom: spacing[10],
    justifyContent: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  brandLogo: {
    width: 58,
    height: 58,
    borderRadius: radius.lg,
  },
  brandCopy: {
    marginLeft: spacing[3],
  },
  brandName: {
    lineHeight: 22,
  },
  card: {
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing[5],
  },
  eyebrow: {
    letterSpacing: 1.1,
    marginBottom: spacing[2],
  },
  description: {
    marginTop: spacing[2],
  },
  body: {
    marginTop: spacing[6],
  },
});
