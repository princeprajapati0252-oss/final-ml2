import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Layers, Grid, Save, Trash2, Loader2, CheckCircle2, IndianRupee, List, Layout } from 'lucide-react';
import api from '../services/api';

const FacilityManager = ({ facility, onBack }) => {
    const [floors, setFloors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [showAddFloor, setShowAddFloor] = useState(false);
    const [newFloor, setNewFloor] = useState({ floor_name: '', floor_number: '', price_per_hour: '' });
    const [confirmDelete, setConfirmDelete] = useState(null);

    // Bulk slots state
    const [showBulkSlots, setShowBulkSlots] = useState(null); // floorId
    const [bulkConfig, setBulkConfig] = useState({ prefix: 'S', count: 20 });
    
    // Designer state
    const [designingFloor, setDesigningFloor] = useState(null);
    const [floorSlots, setFloorSlots] = useState([]);

    useEffect(() => {
        fetchFloors();
    }, [facility.id]);

    const fetchFloors = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/search/facilities/${facility.id}/floors`);
            setFloors(response.data.floors);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddFloor = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            await api.post(`/parking/facilities/${facility.id}/floors`, {
                floor_name: newFloor.floor_name,
                floor_number: parseInt(newFloor.floor_number),
                price_per_hour: parseFloat(newFloor.price_per_hour)
            });
            setShowAddFloor(false);
            setNewFloor({ floor_name: '', floor_number: '', price_per_hour: '' });
            fetchFloors();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to add floor');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteFloor = async (floorId) => {
        try {
            setSaving(true);
            await api.delete(`/parking/floors/${floorId}`);
            setConfirmDelete(null);
            fetchFloors();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to delete floor');
        } finally {
            setSaving(false);
        }
    };

    const handleBulkCreateSlots = async (floorId) => {
        if (!bulkConfig.count || bulkConfig.count < 5 || bulkConfig.count > 20) {
            alert('Slot quantity must be between 5 and 20.');
            return;
        }
        try {
            setSaving(true);
            await api.post(`/parking/floors/${floorId}/slots/bulk`, bulkConfig);
            setShowBulkSlots(null);
            fetchFloors(); // Refresh counts
            alert('Slots created successfully');
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to create slots');
        } finally {
            setSaving(false);
        }
    };
    const handleOpenDesigner = async (floor) => {
        try {
            setLoading(true);
            const response = await api.get(`/parking/floors/${floor.id}/slots`);
            setFloorSlots(response.data.slots);
            setDesigningFloor(floor);
        } catch (err) {
            alert('Failed to fetch slots for designer');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveLayout = async (layout) => {
        // Prototype save: just update local state or console log
        console.log('Saving layout for floor:', designingFloor.id, layout);
        alert('Layout saved successfully (Prototype)');
        setDesigningFloor(null);
    };

    return (
        <div className="fade-in">
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <button
                    onClick={onBack}
                    style={{ background: 'var(--surface)', border: 'none', color: 'white', padding: '0.6rem', borderRadius: '50%', cursor: 'pointer' }}
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="gradient-text" style={{ fontSize: '2rem', margin: 0 }}>{facility.name}</h1>
                    <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Management Console</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>

                {/* Floors List */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Layers size={20} style={{ color: 'var(--primary)' }} /> Parking Floors
                        </h2>
                        <button
                            onClick={() => setShowAddFloor(true)}
                            className="glass"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', borderRadius: '10px', color: 'var(--primary)', fontWeight: '600' }}
                        >
                            <Plus size={18} /> Add Floor
                        </button>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '3rem' }}><Loader2 className="animate-spin" /></div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {floors.map(floor => (
                                <motion.div
                                    key={floor.id}
                                    layout
                                    className="glass"
                                    style={{ padding: '1.5rem' }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                                            <div>
                                                <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{floor.floor_name}</div>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Level {floor.floor_number}</div>
                                            </div>
                                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.5rem 1rem', borderRadius: '8px' }}>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Price</div>
                                                <div style={{ fontWeight: '600' }}>₹{floor.price_per_hour}/hr</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Slots</div>
                                                <div style={{ fontWeight: '600' }}>{floor.total_slots} Total</div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                                            <button
                                                onClick={() => setShowBulkSlots(floor.id)}
                                                style={{ padding: '0.5rem 1rem', borderRadius: '8px', background: 'var(--surface)', border: '1px solid var(--glass-border)', color: 'white', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem' }}
                                            >
                                                <Grid size={16} /> Manage Slots
                                            </button>
                                            <div style={{ position: 'relative' }}>
                                                {confirmDelete === floor.id ? (
                                                    <div style={{ display: 'flex', gap: '0.4rem', background: 'var(--surface)', padding: '0.2rem', borderRadius: '8px', border: '1px solid var(--error)' }}>
                                                        <button disabled={saving} onClick={() => handleDeleteFloor(floor.id)} style={{ padding: '0.3rem 0.6rem', border: 'none', background: 'var(--error)', color: 'white', borderRadius: '6px', fontSize: '0.85rem', cursor: saving ? 'not-allowed' : 'pointer' }}>Yes</button>
                                                        <button disabled={saving} onClick={() => setConfirmDelete(null)} style={{ padding: '0.3rem 0.6rem', border: 'none', background: 'transparent', color: 'var(--text-secondary)', borderRadius: '6px', fontSize: '0.85rem', cursor: saving ? 'not-allowed' : 'pointer' }}>No</button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => setConfirmDelete(floor.id)}
                                                        disabled={saving}
                                                        style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: 'var(--error)', opacity: saving ? 0.5 : 1, cursor: saving ? 'not-allowed' : 'pointer' }}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bulk Slots Inline Form */}
                                    <AnimatePresence>
                                        {showBulkSlots === floor.id && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                style={{ overflow: 'hidden' }}
                                            >
                                                <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--glass-border)', display: 'flex', alignItems: 'flex-end', gap: '1rem' }}>
                                                    <div>
                                                        <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>Prefix</label>
                                                        <input
                                                            type="text"
                                                            value={bulkConfig.prefix}
                                                            onChange={(e) => setBulkConfig({ ...bulkConfig, prefix: e.target.value })}
                                                            style={{ width: '80px', padding: '0.5rem', borderRadius: '6px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white' }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>Quantity</label>
                                                        <input
                                                            type="number"
                                                            min="5"
                                                            max="20"
                                                            value={bulkConfig.count}
                                                            onChange={(e) => setBulkConfig({ ...bulkConfig, count: parseInt(e.target.value) || '' })}
                                                            style={{ width: '100px', padding: '0.5rem', borderRadius: '6px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white' }}
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={() => handleBulkCreateSlots(floor.id)}
                                                        disabled={saving}
                                                        className="button"
                                                        style={{ padding: '0.6rem 1.2rem', borderRadius: '8px' }}
                                                    >
                                                        Generate Slots
                                                    </button>
                                                    <button
                                                        onClick={() => setShowBulkSlots(null)}
                                                        style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', padding: '0.6rem' }}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Info Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="glass" style={{ padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <CheckCircle2 size={18} style={{ color: 'var(--success)' }} /> Facility Info
                        </h3>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div>
                                <div style={{ textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 'bold' }}>Address</div>
                                <div style={{ color: 'white', marginTop: '0.2rem' }}>{facility.address}</div>
                            </div>
                            <div>
                                <div style={{ textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 'bold' }}>Total Capacity</div>
                                <div style={{ color: 'white', marginTop: '0.2rem' }}>{facility.total_slots} Slots</div>
                            </div>
                        </div>
                    </div>

                    {showAddFloor && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="glass"
                            style={{ padding: '1.5rem', border: '1px solid var(--primary)' }}
                        >
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>New Floor</h3>
                            <form onSubmit={handleAddFloor} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <input
                                    placeholder="Floor Name (e.g. B1)"
                                    required
                                    value={newFloor.floor_name}
                                    onChange={(e) => setNewFloor({ ...newFloor, floor_name: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white' }}
                                />
                                <input
                                    type="number"
                                    placeholder="Level Number"
                                    required
                                    value={newFloor.floor_number}
                                    onChange={(e) => setNewFloor({ ...newFloor, floor_number: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white' }}
                                />
                                <div style={{ position: 'relative' }}>
                                    <IndianRupee size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="Price per hour"
                                        required
                                        value={newFloor.price_per_hour}
                                        onChange={(e) => setNewFloor({ ...newFloor, price_per_hour: e.target.value })}
                                        style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                    <button type="submit" disabled={saving} className="button" style={{ flex: 2, padding: '0.75rem', borderRadius: '8px' }}>
                                        {saving ? 'Adding...' : 'Add Floor'}
                                    </button>
                                    <button type="button" onClick={() => setShowAddFloor(false)} className="glass" style={{ flex: 1, padding: '0.75rem', borderRadius: '8px' }}>
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FacilityManager;
