import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import {
  ProviderBookingChatScreen,
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
        name="ProviderBookingChat"
        component={ProviderBookingChatScreen}
      />
      <Stack.Screen
        name="ProviderVoiceCallPreview"
        component={ProviderVoiceCallPreviewScreen}
        options={{ animation: 'fade' }}
      />
    </Stack.Navigator>
  );
}
