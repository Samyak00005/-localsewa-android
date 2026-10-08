import React, {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Platform,
  StyleSheet,
  View,
} from 'react-native';

type OverlayBlurContextValue = {
  setBlurred: (active: boolean) => void;
};

const ProviderOverlayBlurContext = createContext<OverlayBlurContextValue>({
  setBlurred: () => undefined,
});

export function ProviderOverlayBlurProvider({
  children,
}: PropsWithChildren): React.JSX.Element {
  const [blurred, setBlurred] = useState(false);
  const value = useMemo(() => ({setBlurred}), []);

  return (
    <ProviderOverlayBlurContext.Provider value={value}>
      <View
        style={[
          styles.root,
          blurred && Platform.OS === 'android'
            ? ({filter: [{blur: 15}]} as any)
            : null,
        ]}>
        {children}
      </View>
    </ProviderOverlayBlurContext.Provider>
  );
}

export function useProviderOverlayBlur(active: boolean) {
  const {setBlurred} = useContext(ProviderOverlayBlurContext);

  useEffect(() => {
    setBlurred(active);

    return () => {
      setBlurred(false);
    };
  }, [active, setBlurred]);
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
