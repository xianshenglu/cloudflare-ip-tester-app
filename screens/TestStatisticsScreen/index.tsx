import { StyleSheet } from "react-native";

import { Text, View } from "@/components/Themed";
import { StatisticsData } from "./components/StatisticsData";
import { testStatisticsStore } from "@/store/TestStatistics";

export default function TestConfigScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Test Statistics</Text>
      <View
        style={styles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />
      <StatisticsData testStatisticsStore={testStatisticsStore} />
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
