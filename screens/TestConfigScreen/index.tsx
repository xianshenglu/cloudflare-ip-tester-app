import { StyleSheet } from "react-native";

import { View } from "@/components/Themed";
import { ConfigList } from "./components/ConfigList";

export default function TestConfigScreen() {
  return (
    <View style={styles.container}>
      <ConfigList />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
