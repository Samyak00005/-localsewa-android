import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import {
  ProviderAccountDeletionScreen,
  ProviderAccountSecurityScreen,
  ProviderBookingChatScreen,
  ProviderHelpSupportScreen,
  ProviderPrivacyPolicyScreen,
  ProviderRequestDetailsScreen,
  ProviderTermsConditionsScreen,
  ProviderVoiceCallPreviewScreen,
} from '../screens/provider';
import { ProviderTabs } from './ProviderTabs';
import { ProviderStackParamList } from './types';

const Stack = createNativeStackNavigator<ProviderStackParamList>();

export function ProviderNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="ProviderTabs" component={ProviderTabs} />
      <Stack.Screen
        name="ProviderRequestDetails"
        component={ProviderRequestDetailsScreen}
      />
      <Stack.Screen
        name="ProviderBookingChat"
        component={ProviderBookingChatScreen}
      />
      <Stack.Screen
        name="ProviderVoiceCallPreview"
        component={ProviderVoiceCallPreviewScreen}
        options={{ animation: 'fade' }}
      />
      <Stack.Screen
        name="ProviderAccountSecurity"
        component={ProviderAccountSecurityScreen}
      />
      <Stack.Screen
        name="ProviderAccountDeletion"
        component={ProviderAccountDeletionScreen}
      />
      <Stack.Screen
        name="ProviderHelpSupport"
        component={ProviderHelpSupportScreen}
      />
      <Stack.Screen
        name="ProviderTermsConditions"
        component={ProviderTermsConditionsScreen}
      />
      <Stack.Screen
        name="ProviderPrivacyPolicy"
        component={ProviderPrivacyPolicyScreen}
      />
    </Stack.Navigator>
  );
}
