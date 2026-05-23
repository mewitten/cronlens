import React, { useState } from "react";
import { Box, Text, useInput } from "ink";
import { NoteEntry, setNote, removeNote, getAllNotes } from "../cron/notes";

interface NotesPanelProps {
  expression: string;
  onClose?: () => void;
}

export const NotesPanel: React.FC<NotesPanelProps> = ({ expression, onClose }) => {
  const existing = getAllNotes().find((n) => n.expression === expression);
  const [input, setInput] = useState(existing?.note ?? "");
  const [saved, setSaved] = useState(false);
  const [deleted, setDeleted] = useState(false);

  useInput((char, key) => {
    if (key.return) {
      if (input.trim()) {
        setNote(expression, input.trim());
        setSaved(true);
      }
      onClose?.();
      return;
    }
    if (key.escape) {
      onClose?.();
      return;
    }
    if (key.delete || key.backspace) {
      setInput((prev) => prev.slice(0, -1));
      setSaved(false);
      return;
    }
    if (char && !key.ctrl && !key.meta) {
      setInput((prev) => prev + char);
      setSaved(false);
    }
  });

  const handleDelete = () => {
    removeNote(expression);
    setDeleted(true);
    setInput("");
    onClose?.();
  };

  return (
    <Box flexDirection="column" borderStyle="round" borderColor="yellow" padding={1} width={60}>
      <Text bold color="yellow">
        📝 Note for: <Text color="cyan">{expression}</Text>
      </Text>
      <Box marginTop={1}>
        <Text color="gray">Note: </Text>
        <Text>{input || <Text color="gray">Type a note and press Enter…</Text>}</Text>
      </Box>
      {saved && (
        <Box marginTop={1}>
          <Text color="green">✔ Note saved.</Text>
        </Box>
      )}
      {deleted && (
        <Box marginTop={1}>
          <Text color="red">✖ Note deleted.</Text>
        </Box>
      )}
      <Box marginTop={1}>
        <Text color="gray" dimColor>
          [Enter] Save · [Esc] Cancel · [Del] Clear note
        </Text>
      </Box>
    </Box>
  );
};

export default NotesPanel;
