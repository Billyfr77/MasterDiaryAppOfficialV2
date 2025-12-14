import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Maximize, Minimize, Ruler, MousePointer, PenTool, Check, X, 
  Trash2, ZoomIn, ZoomOut, Move, Square, Copy
} from 'lucide-react';

const SNAP_THRESHOLD = 10; // px

const calculateDistance = (p1, p2) => Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));

const calculatePolygonArea = (points) => {
  if (points.length < 3) return 0;
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }
  return Math.abs(area / 2);
};

const calculatePolygonPerimeter = (points) => {
    if (points.length < 2) return 0;
    let perimeter = 0;
    for (let i = 0; i < points.length; i++) {
        const j = (i + 1) % points.length;
        perimeter += calculateDistance(points[i], points[j]);
    }
    return perimeter;
}

const VisualTakeoffCanvas = ({ imageUrl, onAddMeasurement, onClose }) => {
  // Viewport State
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // Tools: 'select', 'pan', 'draw-poly', 'draw-rect', 'calibrate'
  const [tool, setTool] = useState('pan'); 
  
  // Data State
  const [shapes, setShapes] = useState([]);
  const [currentPoints, setCurrentPoints] = useState([]); // Currently drawing
  const [calibrationLine, setCalibrationLine] = useState(null); // { p1, p2, realLength }
  const [pixelsPerUnit, setPixelsPerUnit] = useState(1); // 1 px = 1 unit (default)
  const [unit, setUnit] = useState('m'); // m, ft, mm

  const [selectedShapeId, setSelectedShapeId] = useState(null);
  const [hoverPoint, setHoverPoint] = useState(null);

  // --- MOUSE HANDLERS ---

  const getCanvasCoords = (e) => {
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - offset.x) / scale,
      y: (e.clientY - rect.top - offset.y) / scale
    };
  };

  const handleMouseDown = (e) => {
    const coords = getCanvasCoords(e);

    if (tool === 'pan') {
      setIsPanning(true);
      setStartPan({ x: e.clientX, y: e.clientY });
      return;
    }

    if (tool === 'draw-poly') {
      // Check snap to first point to close
      if (currentPoints.length > 2) {
          const dist = calculateDistance(coords, currentPoints[0]);
          if (dist < SNAP_THRESHOLD / scale) {
              finishPolygon();
              return;
          }
      }
      setCurrentPoints([...currentPoints, coords]);
    }

    if (tool === 'calibrate') {
        if (!calibrationLine) {
            setCalibrationLine({ p1: coords, p2: null });
        } else if (!calibrationLine.p2) {
            setCalibrationLine(prev => ({ ...prev, p2: coords }));
            // Prompt immediately
            setTimeout(promptCalibration, 50); 
        } else {
            // Reset
            setCalibrationLine({ p1: coords, p2: null });
        }
    }

    if (tool === 'select') {
        // Hit detection could be added here (ray casting), 
        // but easier to handle onClick on the SVG elements themselves.
        setSelectedShapeId(null);
    }
  };

  const handleMouseMove = (e) => {
    if (tool === 'pan' && isPanning) {
      const dx = e.clientX - startPan.x;
      const dy = e.clientY - startPan.y;
      setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      setStartPan({ x: e.clientX, y: e.clientY });
      return;
    }

    const coords = getCanvasCoords(e);

    // Snap preview
    if (tool === 'draw-poly' && currentPoints.length > 0) {
       const dist = calculateDistance(coords, currentPoints[0]);
       setHoverPoint(dist < SNAP_THRESHOLD / scale ? currentPoints[0] : null);
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleWheel = (e) => {
    // Zoom logic
    e.preventDefault();
    const zoomSensitivity = 0.001;
    const delta = -e.deltaY * zoomSensitivity;
    const newScale = Math.min(Math.max(0.1, scale + delta), 5);
    
    // Zoom towards mouse pointer logic usually requires complex offset math.
    // For MVP, just zoom center or simple scale.
    setScale(newScale);
  };

  // --- LOGIC ---

  const finishPolygon = () => {
      if (currentPoints.length < 3) return;
      
      const newShape = {
          id: Date.now(),
          type: 'polygon',
          points: currentPoints,
          color: '#10b981' // emerald default
      };
      setShapes([...shapes, newShape]);
      setCurrentPoints([]);
      setTool('select');
      setSelectedShapeId(newShape.id);
  };

  const promptCalibration = () => {
      const dist = prompt("Enter the real-world distance for this line (e.g. 5):", "1");
      if (dist && !isNaN(dist)) {
          const pixelDist = calculateDistance(calibrationLine.p1, calibrationLine.p2);
          const ppu = pixelDist / parseFloat(dist);
          setPixelsPerUnit(ppu);
          setTool('select');
      } else {
          setCalibrationLine(null);
      }
  };

  const deleteSelected = () => {
      if (selectedShapeId) {
          setShapes(shapes.filter(s => s.id !== selectedShapeId));
          setSelectedShapeId(null);
      }
  };

  const addToQuote = () => {
      if (!selectedShapeId) return;
      const shape = shapes.find(s => s.id === selectedShapeId);
      const pxArea = calculatePolygonArea(shape.points);
      const realArea = pxArea / (pixelsPerUnit * pixelsPerUnit);
      
      const pxPerim = calculatePolygonPerimeter(shape.points);
      const realPerim = pxPerim / pixelsPerUnit;

      onAddMeasurement({
          area: realArea.toFixed(2),
          perimeter: realPerim.toFixed(2),
          unit: unit === 'm' ? 'sq m' : 'sq ft', // simplified unit handling
          name: `Measured Area ${shapes.length}`
      });
  };

  // --- RENDER ---

  return (
    <div className="fixed inset-0 z-[100] bg-stone-950 flex flex-col animate-fade-in">
        
        {/* HEADER */}
        <div className="h-16 border-b border-white/10 bg-stone-900 px-6 flex justify-between items-center z-20">
            <div className="flex items-center gap-4">
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                    <Ruler className="text-indigo-500" /> Visual Takeoff
                </h2>
                <div className="bg-black/30 px-3 py-1 rounded-lg border border-white/10 text-xs font-mono text-gray-400">
                    Scale: 1 {unit} = {pixelsPerUnit.toFixed(2)} px
                </div>
            </div>
            
            {/* TOOLBAR */}
            <div className="flex bg-stone-800 rounded-xl p-1 border border-white/10">
                <button 
                    onClick={() => setTool('select')} 
                    className={`p-2 rounded-lg transition-all ${tool === 'select' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`} 
                    title="Select"
                >
                    <MousePointer size={20} />
                </button>
                <button 
                    onClick={() => setTool('pan')} 
                    className={`p-2 rounded-lg transition-all ${tool === 'pan' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`} 
                    title="Pan"
                >
                    <Move size={20} />
                </button>
                <div className="w-px h-8 bg-white/10 mx-1"></div>
                <button 
                    onClick={() => setTool('calibrate')} 
                    className={`p-2 rounded-lg transition-all ${tool === 'calibrate' ? 'bg-amber-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`} 
                    title="Calibrate Scale"
                >
                    <Ruler size={20} />
                </button>
                <button 
                    onClick={() => setTool('draw-poly')} 
                    className={`p-2 rounded-lg transition-all ${tool === 'draw-poly' ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`} 
                    title="Draw Area"
                >
                    <PenTool size={20} />
                </button>
            </div>

            <div className="flex gap-3">
                <button onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white font-bold">Close</button>
                <button 
                    onClick={addToQuote} 
                    disabled={!selectedShapeId}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-lg flex items-center gap-2"
                >
                    <Check size={18} /> Add to Quote
                </button>
            </div>
        </div>

        {/* WORKSPACE */}
        <div 
            className="flex-1 relative overflow-hidden bg-stone-950 cursor-crosshair"
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onWheel={handleWheel}
        >
            <div 
                className="absolute origin-top-left transition-transform duration-75 ease-linear"
                style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})` }}
            >
                {/* BACKGROUND IMAGE */}
                {imageUrl ? (
                    <img 
                        src={imageUrl} 
                        alt="Plan" 
                        className="pointer-events-none select-none opacity-80"
                        style={{ maxWidth: 'none' }} // Allow full size
                        draggable={false}
                    />
                ) : (
                    <div className="w-[800px] h-[600px] bg-stone-900 border border-white/10 flex items-center justify-center text-gray-600">
                        No Plan Loaded
                    </div>
                )}

                {/* SVG OVERLAY */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ minWidth: '100%', minHeight: '100%' }}>
                    
                    {/* Render Shapes */}
                    {shapes.map(shape => {
                        const isSelected = shape.id === selectedShapeId;
                        const pointsStr = shape.points.map(p => `${p.x},${p.y}`).join(' ');
                        const area = (calculatePolygonArea(shape.points) / (pixelsPerUnit ** 2)).toFixed(1);

                        return (
                            <g key={shape.id} onClick={(e) => { e.stopPropagation(); setSelectedShapeId(shape.id); }} className="pointer-events-auto cursor-pointer">
                                <polygon 
                                    points={pointsStr}
                                    fill={isSelected ? 'rgba(99, 102, 241, 0.3)' : 'rgba(16, 185, 129, 0.2)'}
                                    stroke={isSelected ? '#6366f1' : '#10b981'}
                                    strokeWidth={2 / scale}
                                />
                                {/* Label */}
                                <text 
                                    x={shape.points[0].x} 
                                    y={shape.points[0].y} 
                                    fill="white" 
                                    fontSize={14 / scale}
                                    fontFamily="monospace"
                                    fontWeight="bold"
                                    className="drop-shadow-md"
                                >
                                    {area} {unit}²
                                </text>
                            </g>
                        );
                    })}

                    {/* Current Drawing */}
                    {currentPoints.length > 0 && (
                        <polyline 
                            points={currentPoints.map(p => `${p.x},${p.y}`).join(' ')}
                            fill="none"
                            stroke="#f59e0b"
                            strokeWidth={2 / scale}
                            strokeDasharray="5,5"
                        />
                    )}

                    {/* Hover Snap Point */}
                    {hoverPoint && (
                        <circle cx={hoverPoint.x} cy={hoverPoint.y} r={5 / scale} fill="#f59e0b" />
                    )}

                    {/* Calibration Line */}
                    {calibrationLine && (
                        <g>
                            <circle cx={calibrationLine.p1.x} cy={calibrationLine.p1.y} r={4 / scale} fill="#f59e0b" />
                            {calibrationLine.p2 && (
                                <>
                                    <line 
                                        x1={calibrationLine.p1.x} y1={calibrationLine.p1.y}
                                        x2={calibrationLine.p2.x} y2={calibrationLine.p2.y}
                                        stroke="#f59e0b"
                                        strokeWidth={2 / scale}
                                    />
                                    <circle cx={calibrationLine.p2.x} cy={calibrationLine.p2.y} r={4 / scale} fill="#f59e0b" />
                                </>
                            )}
                        </g>
                    )}

                </svg>
            </div>

            {/* FLOATING CONTROLS (ZOOM) */}
            <div className="absolute bottom-6 left-6 flex gap-2">
                <button onClick={() => setScale(s => s * 1.2)} className="p-3 bg-stone-800 border border-white/10 rounded-full text-white hover:bg-stone-700"><ZoomIn size={20} /></button>
                <button onClick={() => setScale(s => s / 1.2)} className="p-3 bg-stone-800 border border-white/10 rounded-full text-white hover:bg-stone-700"><ZoomOut size={20} /></button>
                <div className="bg-black/50 px-3 py-2 rounded-full text-xs font-mono text-white flex items-center">
                    {(scale * 100).toFixed(0)}%
                </div>
            </div>

            {selectedShapeId && (
                <div className="absolute top-20 right-6 bg-stone-900 border border-white/10 p-4 rounded-xl shadow-2xl animate-fade-in-up">
                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Selected Area</h4>
                    <div className="text-2xl font-black text-white mb-4">
                        {(calculatePolygonArea(shapes.find(s => s.id === selectedShapeId).points) / (pixelsPerUnit**2)).toFixed(2)} <span className="text-sm text-gray-500">{unit}²</span>
                    </div>
                    <button onClick={deleteSelected} className="w-full py-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-2">
                        <Trash2 size={14} /> Delete Shape
                    </button>
                </div>
            )}
        </div>
    </div>
  );
};

export default VisualTakeoffCanvas;
