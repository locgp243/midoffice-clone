import { useAppTheme } from "@/hooks/useAppTheme";
import { useFocusEffect, usePathname } from "expo-router";
import { ReactNode, useCallback, useRef } from "react";
import { Animated, Dimensions, Platform, StyleSheet } from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;

const TAB_ORDER = ["/", "/tasks", "/menu", "/notifications", "/profile"];

let activeTabIndex = 0;

type Props = {
  children: ReactNode;
};

export default function AnimatedTabScreen({ children }: Props) {
  const pathname = usePathname();
  const { colors } = useAppTheme();

  const translateX = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      const currentIndex = TAB_ORDER.findIndex((path) => {
        if (path === "/") {
          return pathname === "/";
        }

        return pathname === path;
      });

      if (currentIndex === -1) {
        return;
      }

      if (currentIndex === activeTabIndex) {
        translateX.setValue(0);
        return;
      }

      const direction = currentIndex > activeTabIndex ? 1 : -1;

      translateX.setValue(direction * SCREEN_WIDTH);

      const animation = Animated.timing(translateX, {
        toValue: 0,
        duration: 240,
        useNativeDriver: Platform.OS !== "web",
      });

      animation.start();

      activeTabIndex = currentIndex;

      return () => {
        animation.stop();
        translateX.setValue(0);
      };
    }, [pathname, translateX]),
  );

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          transform: [{ translateX }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
