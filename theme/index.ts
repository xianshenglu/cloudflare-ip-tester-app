import { StyleSheet } from "react-native";
import { DefaultTheme } from "react-native-paper";

export const miniStyle = StyleSheet.create({
  textStyle: {
    fontSize: 12,
  },
});
export const APP_THEME = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#2196f3",
  },
};