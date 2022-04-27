import { SortType } from "@/typings/index";
import { TableHeaderColumn } from "@/components/Table/TableHeader";
import { useState } from "react";
export function useTableHeader<TableHeaderCol extends TableHeaderColumn>(
  initialTableHeaderCols: TableHeaderCol[]
) {
  const [tableHeaders, setTableHeaders] = useState<TableHeaderCol[]>(
    initialTableHeaderCols
  );
  function changeTableHeadersSortType(
    id: TableHeaderCol["id"],
    sortType: TableHeaderCol["sort"]
  ): void {
    setTableHeaders((prevTableHeaderCols) => {
      const result = prevTableHeaderCols.map((item) => {
        const isSortingCol = item.id === id;
        const targetSortType = isSortingCol ? sortType : SortType.Default;
        return {
          ...item,
          sort: targetSortType,
        };
      });

      return result;
    });
  }
  function reset() {
    setTableHeaders(() => initialTableHeaderCols);
  }
  function getCurrentSortConf(): {
    sortType: `${SortType}`;
    columnId: TableHeaderCol["id"];
  } {
    let activeSortCol = tableHeaders.find(
      (item) => item.sort !== SortType.Default
    );
    activeSortCol = activeSortCol || tableHeaders[0];
    return {
      sortType: activeSortCol.sort,
      columnId: activeSortCol.id,
    };
  }

  return {
    tableHeaders,
    setTableHeaders,
    reset,
    changeTableHeadersSortType,
    getCurrentSortConf,
  };
}
