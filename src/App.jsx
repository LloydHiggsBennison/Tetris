import { useState, useEffect } from "react";
import Tetris from "./components/Tetris";
import './index.css';

function App() {
  const [ranking, setRanking] = useState([]);
  const [puntajeFinal, setPuntajeFinal] = useState(0);

  const fetchRanking = async () => {
    try {
      const res = await fetch("https://script.google.com/macros/s/AKfycbzWr5z4HGo7m8f173KIAupysRMTustgjani0DPRaUZM4Z52z3esge283jymCR-EgFRZ/exec");
      const data = await res.json();
      const ordenado = data.sort((a, b) => b.Puntaje - a.Puntaje).slice(0, 10); // Solo tomar los 10 mejores
      setRanking(ordenado);
    } catch (error) {
      console.error("No se pudo obtener el ranking:", error);
    }
  };

  useEffect(() => {
    fetchRanking();
    const interval = setInterval(fetchRanking, 10000);
    return () => clearInterval(interval);
  }, []);

  const formatFecha = (fechaISO) => {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-CL', {
      day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">
          <span className="text-5xl">🎮</span> TETRIS <span className="text-5xl">🎮</span>
        </h1>
        <div className="score-display">Puntaje: {puntajeFinal}</div>
      </header>

      <div className="game-layout">
        <div className="game-board-container">
          <Tetris setPuntajeFinal={setPuntajeFinal} />
        </div>

        <div className="ranking-panel">
          <div className="ranking-header">
            <h2>🏆 RANKING GLOBAL (TOP 10)</h2> {/* Indicación de TOP 10 */}
          </div>
          <div className="ranking-content">
            {ranking.length > 0 ? (
              <>
                <table className="ranking-table">
                  <thead>
                    <tr>
                      <th className="position-header">Posición</th>
                      <th>Jugador</th>
                      <th>Puntaje</th>
                      <th>Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ranking.map((item, index) => (
                      <tr key={index} className={`ranking-row ${index % 2 === 0 ? 'even-row' : 'odd-row'} ${index < 3 ? 'top-three' : ''}`}>
                        <td className="position-cell">
                          {index === 0 ? (
                            <span className="gold-medal">🥇</span>
                          ) : index === 1 ? (
                            <span className="silver-medal">🥈</span>
                          ) : index === 2 ? (
                            <span className="bronze-medal">🥉</span>
                          ) : (
                            <span className="position-number">{index + 1}</span>
                          )}
                        </td>
                        <td className="player-name">{item.Nombre || 'Anónimo'}</td>
                        <td className="player-score">{item.Puntaje.toLocaleString()}</td>
                        <td className="player-date">{formatFecha(item.Fecha)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {ranking.length < 10 && (
                  <div className="ranking-count-message">
                    Mostrando {ranking.length} jugadores (de los 10 mejores)
                  </div>
                )}
              </>
            ) : (
              <div className="loading-ranking">Cargando ranking...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;