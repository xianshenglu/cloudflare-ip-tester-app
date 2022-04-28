import { StyleSheet } from "react-native";

import { Text, View } from "../components/Themed";
import { I18n } from "@/localize";

export default function TestConfigScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{I18n.t("testConfig.title")}</Text>
      <View
        style={styles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />
      {/* <TestPage path="/screens/TestConfigScreen.tsx" /> */}
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
