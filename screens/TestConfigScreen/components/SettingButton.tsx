import { View } from "@/components/Themed";
import { useTheme } from "@react-navigation/native";
import { Button } from "react-native-paper";
import { StyleSheet } from "react-native";

export function SettingButton(props: { onPress: () => void; label: string }) {
  const { onPress, label } = props;
  const { colors } = useTheme();

  return (
    <View style={styles.item}>
      <Button
        mode="text"
        uppercase={false}
        style={{
          width: "100%",
        }}
        labelStyle={{
          color: colors.text,
          fontFamily: "inherit",
        }}
        contentStyle={{
          marginLeft: -16,
          alignSelf: "flex-start",
        }}
        onPress={onPress}
      >
        {label}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
