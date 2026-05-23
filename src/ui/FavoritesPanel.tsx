import React, { useState } from 'react';
import { Box, Text } from 'ink';
import { Favorite, loadFavorites, removeFavorite } from '../cron/favorites';

interface FavoritesPanelProps {
  onSelect: (expression: string) => void;
}

export function FavoritesPanel({ onSelect }: FavoritesPanelProps): JSX.Element {
  const [favorites, setFavorites] = useState<Favorite[]>(() => loadFavorites());
  const [selectedIndex, setSelectedIndex] = useState(0);

  function handleRemove(id: string): void {
    removeFavorite(id);
    setFavorites(loadFavorites());
    setSelectedIndex(prev => Math.max(0, prev - 1));
  }

  if (favorites.length === 0) {
    return (
      <Box borderStyle="round" paddingX={1}>
        <Text dimColor>No favorites saved yet. Press 'f' on any expression to save it.</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" borderStyle="round" paddingX={1}>
      <Text bold color="yellow">★ Favorites</Text>
      {favorites.map((fav, i) => (
        <Box key={fav.id} flexDirection="row" gap={1}>
          <Text color={i === selectedIndex ? 'cyan' : undefined}>
            {i === selectedIndex ? '▶' : ' '}
          </Text>
          <Box flexDirection="column">
            <Text bold={i === selectedIndex}>{fav.label}</Text>
            <Text dimColor>{fav.expression}</Text>
          </Box>
          <Box marginLeft={2}>
            <Text
              color="green"
              onClick={() => onSelect(fav.expression)}
            >
              [use]
            </Text>
            <Text> </Text>
            <Text
              color="red"
              onClick={() => handleRemove(fav.id)}
            >
              [remove]
            </Text>
          </Box>
        </Box>
      ))}
      <Text dimColor>Added: {favorites[selectedIndex]?.createdAt
        ? new Date(favorites[selectedIndex].createdAt).toLocaleDateString()
        : ''}
      </Text>
    </Box>
  );
}
