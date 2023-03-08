import { AppI18n } from "@/localize";
import { APP_THEME } from "@/theme";
import { StatusBar } from "expo-status-bar";
import { Platform, StyleSheet, Linking, Pressable } from "react-native";

import { Text, View } from "../components/Themed";

export default function ModalScreen() {
  const latestVersionUrl =
    "https://github.com/xianshenglu/cloudflare-ip-tester-app/releases/latest/download/app-universal-release-signed.apk";
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Help</Text>
      <View
        style={styles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />
      {/* <TestPage path="/screens/ModalScreen.tsx" /> */}
      <Pressable onPress={() => Linking.openURL(latestVersionUrl)}>
        <Text style={{ color: APP_THEME.colors.primary, fontSize: 16 }}>
          {AppI18n.t("update.downloadLatestVersion")}
        </Text>
      </Pressable>

      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
