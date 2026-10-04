import React from 'react';
import {StyleSheet, View} from 'react-native';

import {
  Card,
  Skeleton,
} from '../ui';
import {spacing} from '../../theme';

export function ProviderListSkeleton(): React.JSX.Element {
  return (
    <View style={styles.list}>
      {[0, 1, 2].map(index => (
        <Card key={index}>
          <View style={styles.row}>
            <Skeleton
              width={72}
              height={72}
              radiusValue={16}
            />

            <View style={styles.copy}>
              <Skeleton
                width="70%"
                height={18}
              />
              <Skeleton
                width="48%"
                height={14}
                style={styles.gap}
              />
              <Skeleton
                width="85%"
                height={12}
                style={styles.gap}
              />
            </View>
          </View>
        </Card>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing[3],
  },
  row: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  copy: {
    flex: 1,
  },
  gap: {
    marginTop: spacing[2],
  },
});
