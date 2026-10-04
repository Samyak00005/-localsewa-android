import React from 'react';
import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import {
  BookingDetailsScreen,
  BookingRequestScreen,
  BookingReviewScreen,
  ProviderDetailsScreen,
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
        name="BookingReview"
        component={
          BookingReviewScreen
        }
      />
    </Stack.Navigator>
  );
}
