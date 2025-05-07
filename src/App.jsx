import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import Tetris from "./components/Tetris";
import './index.css';

function App() {
  const [ranking, setRanking] = useState([]);
  const [puntajeFinal, setPuntajeFinal] = useState(0);
  const [_cargandoRanking, setCargandoRanking] = useState(false);

  const fetchRanking = async () => {
    setCargandoRanking(true);
    try {
      const res = await fetch("https://script.google.com/macros/s/AKfycbwvet_zTy9rRhv9raIhobpJ8hLL-C5XXQxcRxt1B1GawB4im5GUbh5XX0HX-Rcv6ME/exec");
      const data = await res.json();
      const ordenado = data.sort((a, b) => b.Puntaje - a.Puntaje).slice(0, 10); 
      setRanking(ordenado);
    } catch (error) {
      console.error("No se pudo obtener el ranking:", error);
    } finally {
      setCargandoRanking(false);
    }
  };

  const borrarRanking = async () => {
    const confirmar = window.confirm("¿Estás seguro que deseas borrar todo el ranking?");
    if (!confirmar) return;

    try {
      await fetch("https://script.google.com/macros/s/AKfycbwvet_zTy9rRhv9raIhobpJ8hLL-C5XXQxcRxt1B1GawB4im5GUbh5XX0HX-Rcv6ME/exec?accion=borrar_todo", {
        method: "GET",
        mode: "no-cors"
      });

      alert("Ranking eliminado.");
      fetchRanking();
    } catch (error) {
      console.error("Error al borrar ranking:", error);
      alert("No se pudo borrar el ranking.");
    }
  };

  const editarJugador = async (index) => {
    const actual = ranking[index];

    const { value: formValues } = await Swal.fire({
      title: 'Editar jugador',
      html:
        `<input id="swal-input1" class="swal2-input" placeholder="Nombre" value="${actual.Nombre}">` +
        `<input id="swal-input2" class="swal2-input" placeholder="Puntaje" type="number" value="${actual.Puntaje}">`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const nombre = document.getElementById('swal-input1').value.trim();
        const puntaje = parseInt(document.getElementById('swal-input2').value);

        if (!nombre) {
          Swal.showValidationMessage('El nombre no puede estar vacío');
          return false;
        }

        if (isNaN(puntaje)) {
          Swal.showValidationMessage('El puntaje debe ser un número válido');
          return false;
        }

        return { nombre, puntaje };
      }
    });

    if (formValues) {
      const { nombre, puntaje } = formValues;

      try {
        await fetch("https://script.google.com/macros/s/AKfycbwvet_zTy9rRhv9raIhobpJ8hLL-C5XXQxcRxt1B1GawB4im5GUbh5XX0HX-Rcv6ME/exec", {
          method: "POST",
          mode: "no-cors",
          body: JSON.stringify({
            accion: "editar",
            fila: index + 2,
            nombre,
            puntaje
          }),
          headers: {
            "Content-Type": "application/json"
          }
        });

        Swal.fire('✅ Jugador actualizado', '', 'success');
        fetchRanking();
      } catch (error) {
        console.error("Error al editar jugador:", error);
        Swal.fire('❌ Error al actualizar', '', 'error');
      }
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
            <h2>🏆 RANKING GLOBAL (TOP 10)</h2>
          </div>
          <div className="ranking-content">
            {ranking.length > 0 ? (
              <>
                <table className="ranking-table">
                  <thead>
                    <tr>
                      <th>Posición</th>
                      <th>Jugador</th>
                      <th>Puntaje</th>
                      <th>Fecha</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ranking.map((item, index) => (
                      <tr key={index} className={`ranking-row ${index % 2 === 0 ? 'even-row' : 'odd-row'} ${index < 3 ? 'top-three' : ''}`}>
                        <td>
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                        </td>
                        <td>{item.Nombre || 'Anónimo'}</td>
                        <td>{item.Puntaje.toLocaleString()}</td>
                        <td>{formatFecha(item.Fecha)}</td>
                        <td>
                          <button
                            onClick={() => editarJugador(index)}
                            className="edit-button"
                          >
                            ✏️ Editar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {ranking.length < 10 && (
                  <div className="ranking-count-message">
                    Mostrando {ranking.length} jugadores (de los 10 mejores)
                  </div>
                )}
                <div className="ranking-delete mt-4">
                  <button
                    onClick={borrarRanking}
                    className="px-4 py-2 bg-red-600 text-white font-bold rounded hover:bg-red-700 transition"
                  >
                    🗑️ Borrar todo el ranking
                  </button>
                </div>
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
