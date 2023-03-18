import { StyleSheet } from "react-native";
import { DarkTheme, DefaultTheme } from "react-native-paper";

export const miniStyle = StyleSheet.create({
  textStyle: {
    fontSize: 12,
  },
});
export const getAppTheme = (dark = false) => {
  const commonParts = {
    colors: {
      primary: "#2196f3",
    },
  };
  const targetTheme = dark ? DarkTheme : DefaultTheme;
  return {
    ...targetTheme,
    dark,
    colors: {
      ...targetTheme.colors,
      ...commonParts.colors,
    },
  };
};
