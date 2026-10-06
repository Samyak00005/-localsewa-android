import React from 'react';
import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import {
  AccountDeletionScreen,
  AccountSecurityScreen,
  BookingChatScreen,
  BookingDetailsScreen,
  BookingRequestScreen,
  ChangeEmailScreen,
  ChangePasswordScreen,
  CustomerNearbyServicesScreen,
  CustomerNotificationsScreen,
  DefaultLocationScreen,
  EditCustomerProfileScreen,
  HelpSupportScreen,
  PrivacyPolicyScreen,
  ProviderDetailsScreen,
  SetPasswordScreen,
  TermsConditionsScreen,
  VoiceCallPreviewScreen,
} from '../screens/customer';

import {CustomerTabs} from './CustomerTabs';
import {CustomerStackParamList} from './types';

const Stack =
  createNativeStackNavigator<CustomerStackParamList>();

export function CustomerNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation:
          'slide_from_right',
      }}>
      <Stack.Screen
        name="CustomerTabs"
        component={CustomerTabs}
      />

      <Stack.Screen
        name="Notifications"
        component={
          CustomerNotificationsScreen
        }
      />

      <Stack.Screen
        name="NearbyServices"
        component={
          CustomerNearbyServicesScreen
        }
      />

      <Stack.Screen
        name="ProviderDetails"
        component={
          ProviderDetailsScreen
        }
      />

      <Stack.Screen
        name="BookingRequest"
        component={
          BookingRequestScreen
        }
      />

      <Stack.Screen
        name="BookingDetails"
        component={
          BookingDetailsScreen
        }
      />

      <Stack.Screen
        name="BookingChat"
        component={
          BookingChatScreen
        }
      />

      <Stack.Screen
        name="VoiceCallPreview"
        component={
          VoiceCallPreviewScreen
        }
        options={{
          animation: 'fade',
        }}
      />

      <Stack.Screen
        name="EditCustomerProfile"
        component={
          EditCustomerProfileScreen
        }
      />

      <Stack.Screen
        name="DefaultLocation"
        component={
          DefaultLocationScreen
        }
        options={{
          presentation:
            'transparentModal',
          animation: 'fade',
          contentStyle: {
            backgroundColor:
              'transparent',
          },
        }}
      />

      <Stack.Screen
        name="AccountSecurity"
        component={
          AccountSecurityScreen
        }
      />

      <Stack.Screen
        name="ChangePassword"
        component={
          ChangePasswordScreen
        }
      />

      <Stack.Screen
        name="SetPassword"
        component={
          SetPasswordScreen
        }
      />

      <Stack.Screen
        name="ChangeEmail"
        component={
          ChangeEmailScreen
        }
      />

      <Stack.Screen
        name="HelpSupport"
        component={
          HelpSupportScreen
        }
      />

      <Stack.Screen
        name="TermsConditions"
        component={
          TermsConditionsScreen
        }
      />

      <Stack.Screen
        name="PrivacyPolicy"
        component={
          PrivacyPolicyScreen
        }
      />

      <Stack.Screen
        name="AccountDeletion"
        component={
          AccountDeletionScreen
        }
      />
    </Stack.Navigator>
  );
}
