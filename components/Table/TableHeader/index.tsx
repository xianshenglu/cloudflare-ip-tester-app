import { SortType } from "@/typings";
import { FontAwesome } from "@expo/vector-icons";
import { Pressable, StyleSheet } from "react-native";
import { Text, View } from "@/components/Themed";
import { tableSharedStyles } from "..";

export type TableHeaderColumn<Row = any, Column = any> = {
  id: string;
  label: string;
  width: number;
  sort: `${SortType}`;
  formatter?: (row: Row, column: Column, index: number) => any;
};
export function TableHeader(props: {
  cols: TableHeaderColumn[];
  onSort: (
    id: TableHeaderColumn["id"],
    sortType: TableHeaderColumn["sort"]
  ) => void;
}) {
  const { cols, onSort } = props;
  const sortIconNameMap: Record<
    TableHeaderColumn["sort"],
    "sort-asc" | "sort-desc" | "info"
  > = {
    ascending: "sort-asc",
    descending: "sort-desc",
    default: "info",
  };
  const nextSortTypeMap: Record<
    TableHeaderColumn["sort"],
    TableHeaderColumn["sort"]
  > = {
    default: "ascending",
    ascending: "descending",
    descending: "ascending",
  };

  return (
    <View style={tableSharedStyles.tableHeader}>
      {cols.map((column) => {
        return (
          <Pressable
            onPress={() => onSort(column.id, nextSortTypeMap[column.sort])}
            key={column.id}
            style={{
              flex: column.width,
              flexBasis: column.width,
              ...styles.tableHeaderCell,
            }}
          >
            <Text style={styles.tableHeaderCellText}> {column.label}</Text>
            <FontAwesome
              name={sortIconNameMap[column.sort]}
              size={12}
              style={{ marginLeft: 5 }}
            />
          </Pressable>
        );
      })}
    </View>
  );
}
export const styles = StyleSheet.create({
  tableHeaderCell: {
    flexDirection: "row",
    borderLeftWidth: 0.5,
    borderTopWidth: 0.5,
    paddingHorizontal: 3,
    paddingVertical: 3,
    alignSelf: "stretch",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e6f6fa",
  },
  tableHeaderCellText: {
    lineHeight: 18,
    textAlign: "center",
  },
});
