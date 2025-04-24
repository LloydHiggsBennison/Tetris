import { useState } from 'react';
import { randomTetromino } from '../tetrominos';
import { STAGE_WIDTH, checkCollision, rotate } from '../helpers';

export const usePlayer = () => {
  const [player, setPlayer] = useState({
    pos: { x: 0, y: 0 },
    tetromino: randomTetromino().shape,
    collided: false,
  });

  const rotatePlayer = (stage, dir) => {
    const clonedPlayer = JSON.parse(JSON.stringify(player));
    clonedPlayer.tetromino = rotate(clonedPlayer.tetromino, dir);

    const pos = clonedPlayer.pos.x;
    let offset = 1;
    while (checkCollision(clonedPlayer, stage, { x: 0, y: 0 })) {
      clonedPlayer.pos.x += offset;
      offset = -(offset + (offset > 0 ? 1 : -1));
      if (offset > clonedPlayer.tetromino[0].length) {
        clonedPlayer.tetromino = rotate(clonedPlayer.tetromino, -dir);
        clonedPlayer.pos.x = pos;
        return;
      }
    }

    setPlayer(clonedPlayer);
  };

  const updatePlayerPos = ({ x, y, collided }) => {
    setPlayer(prev => ({
      ...prev,
      pos: { x: prev.pos.x + x, y: prev.pos.y + y },
      collided,
    }));
  };

  const resetPlayer = () => {
    const tetromino = randomTetromino().shape;
    const randomX = Math.floor(Math.random() * (STAGE_WIDTH - tetromino[0].length));
    setPlayer({
      pos: { x: randomX, y: 0 },
      tetromino,
      collided: false,
    });
  };
  

  return [player, updatePlayerPos, resetPlayer, rotatePlayer];
};

