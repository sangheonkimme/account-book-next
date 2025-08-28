"use client";

import { useRef, useEffect } from "react";
import {
  Table,
  TextInput,
  Select,
  Badge,
  ActionIcon,
  Text,
} from "@mantine/core";
import { IconGripVertical, IconTrash } from "@tabler/icons-react";
import { Transaction } from "@/types/interface/transaction";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { format } from "date-fns";
import { useTransactionStore } from "@/store/transactions";

type SortableItemProps = {
  t: Transaction;
};

const SortableItem = ({ t }: SortableItemProps) => {
  const {
    editingTransactionId,
    newDescription,
    newType,
    startEditing,
    cancelEditing,
    updateTransaction,
    setNewDescription,
    setNewType,
    openDeleteModal,
  } = useTransactionStore();

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: t.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleEditKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      updateTransaction();
    }
    if (event.key === "Escape") {
      cancelEditing();
    }
  };

  const isEditing = editingTransactionId === t.id;
  const rowRef = useRef<HTMLTableRowElement>(null);

  useEffect(() => {
    if (!isEditing) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        rowRef.current &&
        !rowRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest(".mantine-Select-dropdown")
      ) {
        cancelEditing();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isEditing, cancelEditing]);

  const color =
    t.type === "income" ? "teal" : t.type === "expense" ? "red" : "blue";

  const date = format(new Date(t.date), "yyyy-MM-dd");

  return (
    <Table.Tr
      ref={(node) => {
        setNodeRef(node);
        rowRef.current = node;
      }}
      style={style}
      {...attributes}
    >
      <Table.Td {...listeners}>
        <IconGripVertical style={{ cursor: "pointer" }} />
      </Table.Td>
      <Table.Td>{date}</Table.Td>
      <Table.Td
        onClick={() => !isEditing && startEditing(t)}
        style={{ width: "40%" }}
      >
        {isEditing ? (
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
        <Text c={color} fw={500}>
          {t.type === "income" ? "+" : "-"}
          {t.amount.toLocaleString()}원
        </Text>
      </Table.Td>
      <Table.Td
        align="center"
        onClick={() => !isEditing && startEditing(t)}
        style={{ width: "150px" }}
      >
        {isEditing ? (
          <Select
            value={newType}
            onChange={(value) => {
              setNewType(value as Transaction["type"]);
            }}
            data={["income", "expense", "saving"]}
            onKeyDown={handleEditKeyDown}
          />
        ) : (
          <Badge color={color} variant="light">
            {t.type}
          </Badge>
        )}
      </Table.Td>
      <Table.Td align="center">
        <ActionIcon color="red" onClick={() => openDeleteModal(t.id)}>
          <IconTrash size={16} />
        </ActionIcon>
      </Table.Td>
    </Table.Tr>
  );
};
export default SortableItem;
