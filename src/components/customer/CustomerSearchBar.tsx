import React from 'react';
import {
  Keyboard,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  ViewStyle,
} from 'react-native';

import { radius, shadows, spacing } from '../../theme';
import { AppIcon, iconSize } from '../icons';

type Props = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  onSearch?: () => void;
  style?: ViewStyle;
};

export function CustomerSearchBar({
  value,
  onChangeText,
  placeholder = 'What service do you need?',
  onSearch,
  style,
}: Props): React.JSX.Element {
  function submit() {
    Keyboard.dismiss();
    onSearch?.();
  }

  return (
    <View style={[styles.searchBar, shadows.md, style]}>
      <AppIcon name="search" size={iconSize.sm} color="#667A70" />

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#879A90"
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
        style={styles.searchInput}
        onSubmitEditing={submit}
      />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Search"
        hitSlop={4}
        onPress={submit}
        style={({ pressed }) => [
          styles.searchButton,
          {
            opacity: pressed ? 0.82 : 1,
          },
        ]}
      >
        <AppIcon name="search" size={iconSize.sm} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    minHeight: 58,
    borderRadius: radius.pill,
    backgroundColor: '#FFFFFF',
    paddingLeft: spacing[4],
    paddingRight: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  searchInput: {
    flex: 1,
    minHeight: 52,
    color: '#102018',
    fontSize: 15,
    paddingVertical: 0,
  },
  searchButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#15A153',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
