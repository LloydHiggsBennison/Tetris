import { useState, useEffect } from 'react';
import { createStage } from '../helpers';

export const useStage = (player) => {
  const [stage, setStage] = useState(createStage());

  useEffect(() => {
    const updateStage = prevStage => {
      // Limpiar el stage
      const newStage = prevStage.map(row =>
        row.map(cell => (cell[1] === 'clear' ? [0, 'clear'] : cell))
      );

      // Dibujar la pieza
      player.tetromino.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) {
            newStage[y + player.pos.y][x + player.pos.x] = [
              value,
              `${player.collided ? 'merged' : 'clear'}`,
            ];
          }
        });
      });

      return newStage;
    };

    setStage(prev => updateStage(prev));
  }, [player]);

  return [stage, setStage];
};
