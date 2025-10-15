import { useMemo, useRef, useState } from "react";

type Tool = "brush" | "eraser";

const WHITE = "#ffffff";

function makeGrid(n: number, fill = WHITE) {
  return Array.from({ length: n }, () => Array.from({ length: n }, () => fill));
}

export default function App() {
  const [size, setSize] = useState(16);
  const [tool, setTool] = useState<Tool>("brush");
  const [color, setColor] = useState("#1d4ed8");
  const [grid, setGrid] = useState<string[][]>(() => makeGrid(16));
  const mouseDownRef = useRef(false);

  const style = useMemo(() => ({ gridTemplateColumns: `repeat(${size}, 18px)` }), [size]);

  const setCell = (r: number, c: number, value: string) => {
    setGrid(g => {
      const next = g.map(row => row.slice());
      next[r][c] = value;
      return next;
    });
  };

  const onCell = (r: number, c: number) => {
    if (tool === "brush") setCell(r, c, color);
    else setCell(r, c, WHITE);
  };

  const clear = () => setGrid(makeGrid(size));

  const exportPng = () => {
    const canvas = document.createElement("canvas");
    const cell = 18;
    canvas.width = size * cell;
    canvas.height = size * cell;
    const ctx = canvas.getContext("2d")!;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        ctx.fillStyle = grid[r][c];
        ctx.fillRect(c * cell, r * cell, cell, cell);
      }
    }
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = "pixelsmith-lite.png";
    a.click();
  };

  // when size changes, reset grid at new size
  const onSizeChange = (n: number) => {
    const clamped = Math.max(8, Math.min(64, Math.floor(n || 16)));
    setSize(clamped);
    setGrid(makeGrid(clamped));
  };

  return (
    <div className="app"
         onMouseDown={() => (mouseDownRef.current = true)}
         onMouseUp={() => (mouseDownRef.current = false)}>
      <div className="toolbar">
        <label>Grid:&nbsp;
          <input type="number" min={8} max={64} value={size}
            onChange={(e)=> onSizeChange(parseInt(e.target.value,10))} />
        </label>
        <button aria-pressed={tool==="brush"} onClick={()=>setTool("brush")}>Brush</button>
        <button aria-pressed={tool==="eraser"} onClick={()=>setTool("eraser")}>Eraser</button>
        <input aria-label="color" type="color" value={color} onChange={(e)=>setColor(e.target.value)} />
        <button onClick={clear}>Clear</button>
        <button onClick={exportPng}>Export PNG</button>
      </div>

      <div className="grid" style={style}>
        {grid.map((row, r) => row.map((col, c) => (
          <div key={`${r}-${c}`}
               className="cell"
               style={{ background: col }}
               onMouseDown={() => onCell(r, c)}
               onMouseEnter={() => { if (mouseDownRef.current) onCell(r, c); }}
          />
        )))}
      </div>

      <div className="status">Minimal demo: Brush / Eraser, drag to paint, change size (8–64), export PNG.</div>
    </div>
  );
}
