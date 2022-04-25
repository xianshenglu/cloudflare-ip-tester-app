import { StyleSheet, VirtualizedList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TableHeaderColumn } from "../TableHeader";
import { Text, View } from "@/components/Themed";
import { tableSharedStyles } from "..";

function TableRow<Row, Column extends TableHeaderColumn>(props: {
  row: Row;
  columns: (Column extends TableHeaderColumn ? Column : unknown)[];
}) {
  const { row, columns } = props;

  return (
    <View
      style={{
        ...tableSharedStyles.tableHeader,
        justifyContent: "center",
      }}
    >
      {columns.map((column, index) => {
        const rowText = column.formatter
          ? column.formatter(row, column, index)
          : row[column.id as keyof Row];
        return (
          <View
            key={column.id}
            style={{
              flex: columns[index].width,
              flexBasis: columns[index].width,
              ...styles.tableCell,
            }}
          >
            <Text>{rowText}</Text>
          </View>
        );
      })}
    </View>
  );
}
export function TableRows<Row, Column>(props: {
  rows: Row[];
  columns: (Column extends TableHeaderColumn ? Column : unknown)[];
  rowKeyName: keyof Row;
}) {
  const { rows, columns, rowKeyName } = props;
  return (
    <SafeAreaView
      // https://github.com/th3rdwave/react-native-safe-area-context/issues/167#issuecomment-883604754
      edges={["bottom", "left", "right"]}
      style={{
        flex: 1,
        flexDirection: "column",
        alignSelf: "stretch",
      }}
    >
      <VirtualizedList
        style={{}}
        data={rows}
        initialNumToRender={20}
        renderItem={({ item }: { item: Row }) => (
          <TableRow row={item} columns={columns} />
        )}
        keyExtractor={(item: Row) => item[rowKeyName] as any}
        getItemCount={() => rows.length}
        getItem={(data, index) => rows[index]}
      />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  tableCell: {
    paddingHorizontal: 3,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "center",
    borderLeftWidth: 0.5,
    borderBottomWidth: 0.5,
  },
});
