import React, {
  useEffect,
} from 'react';

import {
  AppText,
} from '../ui';
import {
  useAppTheme,
} from '../../theme';

type Props = {
  seconds: number;
  onTick: (
    value: number,
  ) => void;
};

export function SecurityOtpStatus({
  seconds,
  onTick,
}: Props): React.JSX.Element {
  const {theme} =
    useAppTheme();

  useEffect(() => {
    if (seconds <= 0) {
      return;
    }

    const timer =
      setTimeout(() => {
        onTick(
          Math.max(
            0,
            seconds - 1,
          ),
        );
      }, 1000);

    return () =>
      clearTimeout(timer);
  }, [
    seconds,
    onTick,
  ]);

  return (
    <AppText
      variant="caption"
      color={
        seconds > 0
          ? theme.colors.textMuted
          : theme.colors.primary
      }>
      {seconds > 0
        ? `You can request another code in ${seconds}s`
        : 'You can request another code now.'}
    </AppText>
  );
}
