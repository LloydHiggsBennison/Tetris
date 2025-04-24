import Cell from './Cell';

function Stage({ stage }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${stage[0].length}, 24px)`,
        background: '#111',
        border: '2px solid #333',
        width: 'max-content',
        margin: 'auto',
      }}
    >
      {stage.map((row, y) =>
        row.map((cell, x) => <Cell key={`${y}-${x}`} type={cell[0]} />)
      )}
    </div>
  );
}

export default Stage;