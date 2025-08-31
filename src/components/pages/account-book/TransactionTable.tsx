"use client";

import { Table, Paper } from "@mantine/core";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableItem from "./SortableItem";
import { useTransactionStore } from "@/store/transactions";

export function TransactionTable() {
  const { transactions, handleReorder } = useTransactionStore();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <Paper withBorder shadow="xs" p="xl" mt="xl" radius="md">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleReorder}
      >
        <SortableContext
          items={transactions.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <Table highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th w={34}></Table.Th>
                <Table.Th w={120}>Date</Table.Th>
                <Table.Th>Description</Table.Th>
                <Table.Th w={130} ta="right">
                  Amount
                </Table.Th>
                <Table.Th ta="center">Type</Table.Th>
                <Table.Th ta="center">Delete</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {transactions.map((t) => (
                <SortableItem key={t.id} t={t} />
              ))}
            </Table.Tbody>
          </Table>
        </SortableContext>
      </DndContext>
    </Paper>
  );
}
