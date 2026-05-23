import React, { useState } from "react";
import { Box, Text, useInput } from "ink";
import { addTag, removeTag, getTagsForExpression, getAllTags, getExpressionsByTag } from "../cron/tags";

interface TagsPanelProps {
  expression: string;
  onFilterByTag?: (tag: string) => void;
}

export function TagBadge({ tag, onRemove }: { tag: string; onRemove?: (tag: string) => void }) {
  return (
    <Box marginRight={1}>
      <Text color="cyan">[{tag}]</Text>
      {onRemove && (
        <Text color="red" dimColor>
          {" "}×
        </Text>
      )}
    </Box>
  );
}

export function TagsPanel({ expression, onFilterByTag }: TagsPanelProps) {
  const [tags, setTags] = useState<string[]>(() => getTagsForExpression(expression));
  const [allTags] = useState<string[]>(() => getAllTags());
  const [newTag, setNewTag] = useState("");
  const [mode, setMode] = useState<"view" | "add">("view");
  const [error, setError] = useState("");

  useInput((input, key) => {
    if (mode === "view") {
      if (input === "a") setMode("add");
      return;
    }
    if (mode === "add") {
      if (key.return) {
        const trimmed = newTag.trim();
        if (!trimmed) { setError("Tag cannot be empty"); return; }
        if (!/^[\w-]+$/.test(trimmed)) { setError("Only alphanumeric and hyphens allowed"); return; }
        const updated = addTag(expression, trimmed);
        setTags(updated[expression] ?? []);
        setNewTag("");
        setMode("view");
        setError("");
      } else if (key.escape) {
        setMode("view");
        setNewTag("");
        setError("");
      } else if (key.backspace || key.delete) {
        setNewTag((p) => p.slice(0, -1));
      } else if (input) {
        setNewTag((p) => p + input);
      }
    }
  });

  const handleRemove = (tag: string) => {
    const updated = removeTag(expression, tag);
    setTags(updated[expression] ?? []);
  };

  return (
    <Box flexDirection="column" borderStyle="round" borderColor="cyan" padding={1}>
      <Text bold color="cyan">Tags for: <Text color="white">{expression}</Text></Text>
      <Box marginTop={1} flexWrap="wrap">
        {tags.length === 0 ? (
          <Text dimColor>No tags yet. Press <Text color="yellow">a</Text> to add.</Text>
        ) : (
          tags.map((tag) => (
            <TagBadge key={tag} tag={tag} onRemove={handleRemove} />
          ))
        )}
      </Box>
      {mode === "add" && (
        <Box marginTop={1}>
          <Text color="yellow">New tag: </Text>
          <Text>{newTag}<Text color="gray">█</Text></Text>
        </Box>
      )}
      {error && <Text color="red">{error}</Text>}
      {allTags.length > 0 && (
        <Box marginTop={1} flexDirection="column">
          <Text dimColor>All tags: {allTags.join(", ")}</Text>
        </Box>
      )}
    </Box>
  );
}
