import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import {
  AuthLandingScreen,
  BrandSplashScreen,
  ForgotPasswordScreen,
  LoginScreen,
  OtpScreen,
  RegisterScreen,
  ResetPasswordScreen,
} from '../screens/auth';
import { AuthStackParamList } from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="Splash"
        component={BrandSplashScreen}
        options={{ animation: 'fade' }}
      />
      <Stack.Screen
        name="AuthLanding"
        component={AuthLandingScreen}
        options={{ animation: 'fade' }}
      />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Otp" component={OtpScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </Stack.Navigator>
  );
}
