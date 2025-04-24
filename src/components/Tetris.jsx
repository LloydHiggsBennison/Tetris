import { useEffect, useState } from 'react';
import Stage from './Stage';
import Display from './Display';
import { useStage } from '../hooks/useStage';
import { usePlayer } from '../hooks/usePlayer';
import { useInterval } from '../hooks/useInterval';
import { checkCollision } from '../helpers';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

function Tetris({ setPuntajeFinal }) {
  const [player, updatePlayerPos, resetPlayer, rotatePlayer] = usePlayer();
  const [stage, setStage] = useStage(player);
  const [dropTime, setDropTime] = useState(500);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Función para manejar el foco del tablero
  const handleFocus = () => {
    setIsFocused(true);
  };

  // Función para manejar la pérdida de foco
  const handleBlur = () => {
    setIsFocused(false);
  };

  useEffect(() => {
    // Agregar listeners para el foco cuando el componente se monta
    const gameContainer = document.querySelector('.game-container');
    if (gameContainer) {
      gameContainer.addEventListener('focus', handleFocus);
      gameContainer.addEventListener('blur', handleBlur);
      
      // Enfocar automáticamente al cargar
      gameContainer.focus();
    }

    return () => {
      if (gameContainer) {
        gameContainer.removeEventListener('focus', handleFocus);
        gameContainer.removeEventListener('blur', handleBlur);
      }
    };
  }, []);

  const sweepRows = (newStage) => {
    let rowsCleared = 0;
    const updatedStage = newStage.reduce((acc, row) => {
      if (row.every(cell => cell[0] !== 0)) {
        rowsCleared++;
        acc.unshift(new Array(row.length).fill(['x', 'clear']));
      } else {
        acc.push(row);
      }
      return acc;
    }, []);

    if (rowsCleared > 0) {
      setScore(prev => prev + rowsCleared * 100);
    }

    return updatedStage;
  };

  const handleGameOver = () => {
    setGameOver(true);
    setDropTime(null);
    setPuntajeFinal(score);

    MySwal.fire({
      title: 'Juego finalizado 🎮',
      html: `<p>Tu puntaje fue: <strong>${score}</strong> puntos</p>` +
            `<input id="nombreJugador" class="swal2-input" placeholder="Tu nombre" autofocus />`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Volver a jugar',
      focusConfirm: false,
      preConfirm: () => {
        const nombre = document.getElementById('nombreJugador').value;
        if (!nombre) return Swal.showValidationMessage('Debes ingresar un nombre');
        return { nombre };
      },
      allowOutsideClick: false
    }).then(async (result) => {
      if (result.isConfirmed && result.value) {
        const nuevaPartida = {
          nombre: result.value.nombre,
          puntaje: score,
          fecha: new Date().toISOString(),
        };

        await fetch("https://script.google.com/macros/s/AKfycbzWr5z4HGo7m8f173KIAupysRMTustgjani0DPRaUZM4Z52z3esge283jymCR-EgFRZ/exec", {
          method: "POST",
          mode: "no-cors",
          body: JSON.stringify(nuevaPartida),
          headers: {
            "Content-Type": "application/json",
          },
        });

        Swal.fire('Guardado!', 'Tu partida ha sido registrada.', 'success').then(() => window.location.reload());
      } else {
        window.location.reload();
      }
    });
  };

  const movePlayer = dir => {
    if (!checkCollision(player, stage, { x: dir, y: 0 })) {
      updatePlayerPos({ x: dir, y: 0, collided: false });
    }
  };

  const drop = () => {
    if (!checkCollision(player, stage, { x: 0, y: 1 })) {
      updatePlayerPos({ x: 0, y: 1, collided: false });
    } else {
      if (player.pos.y < 1) {
        handleGameOver();
        return;
      }

      const newStage = stage.map(row =>
        row.map(cell => (cell[1] === 'clear' ? [0, 'clear'] : cell))
      );

      player.tetromino.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) {
            newStage[y + player.pos.y][x + player.pos.x] = [value, 'merged'];
          }
        });
      });

      const cleanedStage = sweepRows(newStage);
      setStage(cleanedStage);
      updatePlayerPos({ x: 0, y: 0, collided: true });
      resetPlayer();
    }
  };

  const dropPlayer = () => {
    setDropTime(50);
  };

  const move = ({ keyCode }) => {
    if (!gameOver && isFocused) {
      if (keyCode === 37) movePlayer(-1); // Flecha izquierda
      else if (keyCode === 39) movePlayer(1); // Flecha derecha
      else if (keyCode === 40) dropPlayer(); // Flecha abajo
      else if (keyCode === 38) rotatePlayer(stage, 1); // Flecha arriba
    }
  };

  useInterval(() => {
    drop();
  }, dropTime);

  useEffect(() => {
    const handleKeyUp = ({ keyCode }) => {
      if (!gameOver && keyCode === 40) {
        setDropTime(500);
      }
    };

    window.addEventListener('keyup', handleKeyUp);
    return () => window.removeEventListener('keyup', handleKeyUp);
  }, [gameOver]);

  return (
    <div
      className="game-container relative flex flex-col items-center gap-4 p-6 bg-gray-900 rounded-xl shadow-2xl outline-none"
      tabIndex="0"
      onKeyDown={move}
    >
      <div className={`transition duration-200 ${gameOver ? 'blur-sm brightness-75' : ''}`}>
        <Stage stage={stage} />
      </div>
      <Display
        text={gameOver ? "GAME OVER" : `Puntaje: ${score}`}
        className={`text-xl font-mono font-bold ${gameOver ? "text-red-500 animate-pulse" : "text-white"}`}
      />
      {gameOver && (
        <div className="absolute inset-0 bg-black bg-opacity-70 z-10 pointer-events-none rounded-xl" />
      )}
    </div>
  );
}

export default Tetris;