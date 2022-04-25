import { StyleSheet } from "react-native";

import TestPage from "./components/TestPage";
import { Text, View } from "@/components/Themed";
import { RootTabScreenProps } from "@/types";

export default function TestRunScreen({
  navigation,
}: RootTabScreenProps<"TestRun">) {
  return (
    <View style={{ ...styles.container }}>
      <TestPage path="/screens/TestRunScreen/index.tsx" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
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
