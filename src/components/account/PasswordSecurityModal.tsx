import React from 'react';

export type PasswordSecurityMode =
  | 'change'
  | 'set';

type Props = {
  mode: PasswordSecurityMode;
  visible: boolean;
  onClose: () => void;
};

/**
 * v1.10.20 compatibility stub.
 * AccountSecurityScreen no longer uses this module.
 */
export function PasswordSecurityModal(
  _props: Props,
): React.JSX.Element | null {
  return null;
}
