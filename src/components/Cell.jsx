function Cell({ type }) {
    const colors = {
      0: 'rgba(0, 0, 0, 0.8)',
      I: 'rgba(80, 227, 230, 0.95)',
      J: 'rgba(36, 95, 223, 0.95)',
      L: 'rgba(223, 173, 36, 0.95)',
      O: 'rgba(223, 217, 36, 0.95)',
      S: 'rgba(48, 211, 56, 0.95)',
      T: 'rgba(132, 61, 198, 0.95)',
      Z: 'rgba(227, 78, 78, 0.95)',
      x: 'rgba(255, 255, 255, 0.9)',
    };
  
    const isActive = type !== 0;
  
    const style = {
      background: colors[type] || 'black',
      border: isActive ? '1px solid rgba(255, 255, 255, 0.2)' : '0px solid',
      width: '24px',
      height: '24px',
      boxSizing: 'border-box',
      transition: 'background 0.1s ease',
    };
  
    return <div style={style}></div>;
}
  
export default Cell;