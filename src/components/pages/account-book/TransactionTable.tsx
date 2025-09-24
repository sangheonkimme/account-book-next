"use client";

import { useState, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  ColDef,
  RowDragEndEvent,
  ICellRendererParams,
  ModuleRegistry,
  AllCommunityModule,
  CellValueChangedEvent,
} from "ag-grid-community";
import { useTransactionStore } from "@/store/transactions";
import { Transaction } from "@/types/interface/transaction";
import { Button, Badge } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { getTypeColor } from "@/lib/colorUtils";

ModuleRegistry.registerModules([AllCommunityModule]);

// Custom cell renderer for the delete button
const DeleteCellRenderer = (props: ICellRendererParams<Transaction>) => {
  const { openDeleteModal } = useTransactionStore();
  const handleDelete = () => {
    if (props.data) openDeleteModal(props.data.id);
  };

  return (
    <Button variant="subtle" color="red" size="xs" onClick={handleDelete}>
      <IconTrash size={16} />
    </Button>
  );
};

const TypeCellRenderer = (props: ICellRendererParams<Transaction>) => {
  if (!props.value) {
    return null;
  }

  return (
    <Badge color={getTypeColor(props.value)} variant="light">
      {props.value}
    </Badge>
  );
};

interface TransactionTableProps {
  transactions: Transaction[];
}

export function TransactionTable({ transactions }: TransactionTableProps) {
  const {
    transactions: allTransactions,
    setTransactionsAndUpdateOrder,
    updateTransactionField,
  } = useTransactionStore();

  const [colDefs] = useState<ColDef<Transaction>[]>([
    { rowDrag: true, width: 30, cellClass: "cursor-grab" },
    { field: "date", width: 120, headerName: "Date" },
    {
      field: "description",
      headerName: "Description",
      flex: 1,
      editable: true,
    },
    {
      field: "amount",
      width: 110,
      headerName: "Amount",
      cellStyle: (params) => ({
        textAlign: "right",
        color: getTypeColor(params.data?.type),
      }),
      valueFormatter: (params) => params.value.toLocaleString(),
      editable: true,
    },
    {
      field: "type",
      width: 110,
      headerName: "Type",
      cellRenderer: TypeCellRenderer,
      editable: true,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: ["income", "expense", "saving"],
      },
    },
    {
      headerName: "Delete",
      width: 90,
      cellRenderer: DeleteCellRenderer,
      cellStyle: { textAlign: "center" },
    },
  ]);

  const onRowDragEnd = useCallback(
    (event: RowDragEndEvent<Transaction>) => {
      const reorderedNodes = event.api
        .getRenderedNodes()
        .map((node) => node.data as Transaction);

      if (!reorderedNodes || reorderedNodes.length === 0) return;

      const currentClassification = reorderedNodes[0].classification;

      const unchangedGroup = allTransactions.filter(
        (t) => t.classification !== currentClassification
      );

      const newFullList = [...unchangedGroup, ...reorderedNodes];

      setTransactionsAndUpdateOrder(newFullList);
    },
    [allTransactions, setTransactionsAndUpdateOrder]
  );

  const onCellValueChanged = useCallback(
    async (event: CellValueChangedEvent) => {
      const field = event.column.getColId();
      const newValue = event.newValue;
      const transactionId = event.data.id;

      const dataToUpdate = { [field]: newValue };

      try {
        await updateTransactionField(transactionId, dataToUpdate);
      } catch (error) {
        // Revert on error
        event.node.setDataValue(field, event.oldValue);
      }
    },
    [updateTransactionField]
  );

  return (
    <div className="ag-theme-quartz h-[600px]">
      <AgGridReact
        rowData={transactions}
        columnDefs={colDefs}
        rowDragManaged={true}
        animateRows={true}
        onRowDragEnd={onRowDragEnd}
        onCellValueChanged={onCellValueChanged}
      />
    </div>
  );
}
