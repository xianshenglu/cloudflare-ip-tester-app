import { StyleSheet } from "react-native";

import TestPage from "../components/TestPage";
import { Text, View } from "../components/Themed";

export default function TestConfigScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Test Config</Text>
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
