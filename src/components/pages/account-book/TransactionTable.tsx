"use client";

import {
  Table,
  TextInput,
  Select,
  Badge,
  ActionIcon,
  Text,
  Paper,
} from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { Transaction } from "@/types/interface/transaction";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type SortableItemProps = {
  t: Transaction;
  editingTransactionId: number | null;
  newDescription: string;
  newType: Transaction["type"] | null;
  handleEditClick: (transaction: Transaction) => void;
  handleEditKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  setNewDescription: (value: string) => void;
  setNewType: (value: Transaction["type"] | null) => void;
  handleClickOpen: (id: number) => void;
};

function SortableItem({
  t,
  editingTransactionId,
  newDescription,
  newType,
  handleEditClick,
  handleEditKeyDown,
  setNewDescription,
  setNewType,
  handleClickOpen,
}: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: t.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Table.Tr ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Table.Td>{t.date}</Table.Td>
      <Table.Td onClick={() => handleEditClick(t)}>
        {editingTransactionId === t.id ? (
          <TextInput
            value={newDescription}
            onChange={(event) => setNewDescription(event.currentTarget.value)}
            onKeyDown={handleEditKeyDown}
            autoFocus
          />
        ) : (
          t.description
        )}
      </Table.Td>
      <Table.Td align="right">
        <Text
          c={
            t.type === "income" ? "teal" : t.type === "expense" ? "red" : "blue"
          }
          fw={500}
        >
          {t.type === "income" ? "+" : "-"}
          {t.amount.toLocaleString()}원
        </Text>
      </Table.Td>
      <Table.Td align="center" onClick={() => handleEditClick(t)}>
        {editingTransactionId === t.id ? (
          <Select
            value={newType}
            onChange={(value) => setNewType(value as Transaction["type"])}
            data={["income", "expense", "saving"]}
            onKeyDown={handleEditKeyDown}
          />
        ) : (
          <Badge
            color={
              t.type === "income"
                ? "teal"
                : t.type === "expense"
                ? "red"
                : "blue"
            }
            variant="light"
          >
            {t.type}
          </Badge>
        )}
      </Table.Td>
      <Table.Td align="center">
        <ActionIcon color="red" onClick={() => handleClickOpen(t.id)}>
          <IconTrash size={16} />
        </ActionIcon>
      </Table.Td>
    </Table.Tr>
  );
}

type TransactionTableProps = {
  transactions: Transaction[];
  editingTransactionId: number | null;
  newDescription: string;
  newType: Transaction["type"] | null;
  editingRowRef: React.RefObject<HTMLTableRowElement | null>;
  handleEditClick: (transaction: Transaction) => void;
  handleEditKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  setNewDescription: (value: string) => void;
  setNewType: (value: Transaction["type"] | null) => void;
  handleClickOpen: (id: number) => void;
  handleReorder: (event: DragEndEvent) => void;
};

export function TransactionTable({
  transactions,
  editingTransactionId,
  newDescription,
  newType,
  editingRowRef,
  handleEditClick,
  handleEditKeyDown,
  setNewDescription,
  setNewType,
  handleClickOpen,
  handleReorder,
}: TransactionTableProps) {
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
                <Table.Th>Date</Table.Th>
                <Table.Th>Description</Table.Th>
                <Table.Th ta="right">Amount</Table.Th>
                <Table.Th ta="center">Type</Table.Th>
                <Table.Th ta="center">Delete</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {transactions.map((t) => (
                <SortableItem
                  key={t.id}
                  t={t}
                  editingTransactionId={editingTransactionId}
                  newDescription={newDescription}
                  newType={newType}
                  handleEditClick={handleEditClick}
                  handleEditKeyDown={handleEditKeyDown}
                  setNewDescription={setNewDescription}
                  setNewType={setNewType}
                  handleClickOpen={handleClickOpen}
                />
              ))}
            </Table.Tbody>
          </Table>
        </SortableContext>
      </DndContext>
    </Paper>
  );
}
