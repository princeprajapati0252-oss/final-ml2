import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MousePointer2,
    Square,
    SquareDashed,
    ParkingCircle,
    Save,
    X,
    RefreshCw,
    Info,
    Layers,
    Move
} from 'lucide-react';

const FloorLayoutDesigner = ({ floor, slots = [], onClose, onSave }) => {
    // Grid settings
    const [gridSize, setGridSize] = useState({ rows: 12, cols: 20 });
    const [layout, setLayout] = useState({}); // { "x,y": { type, id } }
    const [selectedTool, setSelectedTool] = useState('select'); // select, wall, path, slot
    const [activeSlotId, setActiveSlotId] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    // Load existing layout (if any, for prototype we start fresh or from mock)
    useEffect(() => {
        // In a real app, fetch layout from backend
        // For prototype, we'll try to find any existing slots and list them
    }, []);

    const handleCellClick = (r, c) => {
        const key = `${r},${c}`;
        const newLayout = { ...layout };

        if (selectedTool === 'select') {
            // Already handled by hover/selection state if needed
            return;
        }

        if (selectedTool === 'wall') {
            if (newLayout[key]?.type === 'wall') delete newLayout[key];
            else newLayout[key] = { type: 'wall' };
        } else if (selectedTool === 'path') {
            if (newLayout[key]?.type === 'path') delete newLayout[key];
            else newLayout[key] = { type: 'path' };
        } else if (selectedTool === 'slot' && activeSlotId) {
            // Check if slot already exists elsewhere
            Object.keys(newLayout).forEach(k => {
                if (newLayout[k].slotId === activeSlotId) delete newLayout[k];
            });
            newLayout[key] = { type: 'slot', slotId: activeSlotId };
        }

        setLayout(newLayout);
    };

    const handleMouseDown = (r, c) => {
        if (selectedTool === 'wall' || selectedTool === 'path') {
            setIsDragging(true);
            handleCellClick(r, c);
        }
    };

    const handleMouseEnter = (r, c) => {
        if (isDragging && (selectedTool === 'wall' || selectedTool === 'path')) {
            handleCellClick(r, c);
        }
    };

    const handleMouseUp = () => setIsDragging(false);

    // Helper to find slot object by ID
    const getSlotInfo = (slotId) => slots.find(s => s.id === slotId);

    // Filter slots that aren't placed yet
    const placedSlotIds = Object.values(layout).map(cell => cell.slotId).filter(Boolean);
    const availableSlots = slots.filter(s => !placedSlotIds.includes(s.id));

    return createPortal(
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 4000,
            background: 'var(--background)',
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) 320px',
            color: 'white',
            overflow: 'hidden'
        }}>
            {/* Main Canvas Area */}
            <div
                style={{
                    padding: '2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'auto',
                    background: 'radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)'
                }}
                onMouseUp={handleMouseUp}
            >
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}>Designer: {floor.floor_name}</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Level {floor.floor_number} • Map out your physical space</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            onClick={() => onSave(layout)}
                            className="button"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', borderRadius: '10px' }}
                        >
                            <Save size={18} /> Save Layout
                        </button>
                        <button
                            onClick={onClose}
                            className="glass"
                            style={{ padding: '0.6rem', borderRadius: '50%', color: 'var(--text-secondary)' }}
                        >
                            <X size={20} />
                        </button>
                    </div>
                </header>

                <div style={{
                    margin: 'auto',
                    padding: '2rem',
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: '24px',
                    border: '1px solid var(--glass-border)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                }}>
                    {/* Grid Designer */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${gridSize.cols}, 32px)`,
                        gridTemplateRows: `repeat(${gridSize.rows}, 32px)`,
                        gap: '2px',
                        background: 'rgba(255,255,255,0.05)',
                        padding: '2px',
                        borderRadius: '4px'
                    }}>
                        {Array.from({ length: gridSize.rows }).map((_, r) => (
                            Array.from({ length: gridSize.cols }).map((_, c) => {
                                const key = `${r},${c}`;
                                const cell = layout[key];
                                const isSlot = cell?.type === 'slot';
                                const slotInfo = isSlot ? getSlotInfo(cell.slotId) : null;

                                return (
                                    <div
                                        key={key}
                                        onMouseDown={() => handleMouseDown(r, c)}
                                        onMouseEnter={() => handleMouseEnter(r, c)}
                                        onClick={() => handleCellClick(r, c)}
                                        style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '2px',
                                            cursor: 'crosshair',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '0.6rem',
                                            fontWeight: 'bold',
                                            transition: '0.15s',
                                            background: cell?.type === 'wall' ? '#475569' :
                                                cell?.type === 'path' ? 'rgba(99, 102, 241, 0.2)' :
                                                    cell?.type === 'slot' ? 'var(--primary)' :
                                                        'rgba(255,255,255,0.03)',
                                            border: cell?.type === 'path' ? '1px dashed rgba(99, 102, 241, 0.4)' : 'none',
                                            boxShadow: isSlot ? '0 0 10px rgba(99, 102, 241, 0.4)' : 'none'
                                        }}
                                        className="cell-hover"
                                    >
                                        {isSlot && slotInfo?.slot_number}
                                        {!cell && (r % 5 === 0 && c % 5 === 0) && <div style={{ width: '2px', height: '2px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%' }} />}
                                    </div>
                                );
                            })
                        ))}
                    </div>
                </div>

                {/* Legend */}
                <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginTop: '2rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '12px', height: '12px', background: 'var(--primary)', borderRadius: '2px' }} /> Parking Slot
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '12px', height: '12px', background: '#475569', borderRadius: '2px' }} /> Wall / Pillar
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '12px', height: '12px', border: '1px dashed rgba(99, 102, 241, 0.6)', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '2px' }} /> Path / Driveway
                    </div>
                </div>
            </div>

            {/* Toolbar Sidebar */}
            <div style={{
                background: 'rgba(15, 23, 42, 0.8)',
                backdropFilter: 'blur(20px)',
                borderLeft: '1px solid var(--glass-border)',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '2rem'
            }}>
                <section>
                    <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1.25rem' }}>Tools</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <ToolButton
                            active={selectedTool === 'select'}
                            onClick={() => setSelectedTool('select')}
                            icon={<MousePointer2 size={18} />}
                            label="Select"
                        />
                        <ToolButton
                            active={selectedTool === 'wall'}
                            onClick={() => setSelectedTool('wall')}
                            icon={<Square size={18} />}
                            label="Wall"
                        />
                        <ToolButton
                            active={selectedTool === 'path'}
                            onClick={() => setSelectedTool('path')}
                            icon={<SquareDashed size={18} />}
                            label="Path"
                        />
                        <ToolButton
                            active={selectedTool === 'slot'}
                            onClick={() => setSelectedTool('slot')}
                            icon={<ParkingCircle size={18} />}
                            label="Slot"
                        />
                    </div>
                </section>

                <section style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                        <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>Available Slots</h3>
                        <span style={{ fontSize: '0.75rem', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 'bold' }}>
                            {availableSlots.length}
                        </span>
                    </div>

                    <div style={{
                        flex: 1,
                        overflowY: 'auto',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))',
                        gap: '0.5rem',
                        alignContent: 'start',
                        padding: '0.5rem',
                        background: 'rgba(0,0,0,0.2)',
                        borderRadius: '12px'
                    }}>
                        {availableSlots.map(slot => (
                            <button
                                key={slot.id}
                                onClick={() => {
                                    setSelectedTool('slot');
                                    setActiveSlotId(slot.id);
                                }}
                                style={{
                                    padding: '0.5rem',
                                    background: activeSlotId === slot.id ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                                    border: '1px solid',
                                    borderColor: activeSlotId === slot.id ? 'var(--primary)' : 'var(--glass-border)',
                                    borderRadius: '8px',
                                    color: 'white',
                                    fontSize: '0.75rem',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    transition: '0.2s'
                                }}
                            >
                                {slot.slot_number}
                            </button>
                        ))}
                        {availableSlots.length === 0 && (
                            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                All slots placed!
                            </div>
                        )}
                    </div>
                </section>

                <div className="glass" style={{ padding: '1rem', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                        <Info size={16} />
                        <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Instructions</span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                        {selectedTool === 'slot' ? 'Select a slot on the right, then click a grid cell to place it.' :
                            selectedTool === 'wall' || selectedTool === 'path' ? 'Click or drag across the grid to draw.' :
                                'Select an item on the grid to see details.'}
                    </p>
                </div>
            </div>
        </div>,
        document.body
    );
};

const ToolButton = ({ active, icon, label, onClick }) => (
    <button
        onClick={onClick}
        style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '1rem 0.5rem',
            background: active ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.03)',
            border: active ? '1px solid var(--primary)' : '1px solid var(--glass-border)',
            borderRadius: '12px',
            color: active ? 'var(--primary)' : 'var(--text-secondary)',
            cursor: 'pointer',
            transition: '0.2s'
        }}
    >
        {icon}
        <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>{label}</span>
    </button>
);

export default FloorLayoutDesigner;
