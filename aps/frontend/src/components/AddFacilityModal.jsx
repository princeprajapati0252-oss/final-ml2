import React, { useState, useEffect } from 'react';
import { X, MapPin, Building2, AlignLeft, Check, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

const AddFacilityModal = ({ isOpen, onClose, onSuccess, cities }) => {
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [description, setDescription] = useState('');
    const [selectedCityId, setSelectedCityId] = useState('');
    const [selectedAreaId, setSelectedAreaId] = useState('');
    const [areas, setAreas] = useState([]);
    const [loadingAreas, setLoadingAreas] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (selectedCityId) {
            fetchAreas(selectedCityId);
        } else {
            setAreas([]);
            setSelectedAreaId('');
        }
    }, [selectedCityId]);

    const fetchAreas = async (cityId) => {
        try {
            setLoadingAreas(true);
            const response = await api.get(`/search/cities/${cityId}/areas`);
            setAreas(response.data.areas);
        } catch (err) {
            console.error('Failed to fetch areas', err);
        } finally {
            setLoadingAreas(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedAreaId) {
            setError('Please select an area');
            return;
        }

        try {
            setSubmitting(true);
            setError(null);
            await api.post('/parking/facilities', {
                name,
                address,
                description,
                area_id: parseInt(selectedAreaId)
            });
            onSuccess();
            onClose();
            // Reset form
            setName('');
            setAddress('');
            setDescription('');
            setSelectedCityId('');
            setSelectedAreaId('');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create facility');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(8px)',
            zIndex: 3000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
        }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="glass"
                style={{
                    maxWidth: '500px',
                    width: '100%',
                    padding: '2rem',
                    position: 'relative'
                }}
            >
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                >
                    <X size={24} />
                </button>

                <h2 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Building2 className="gradient-text" /> Add New Facility
                </h2>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Facility Name</label>
                        <div style={{ position: 'relative' }}>
                            <Building2 size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Grand Central Parking"
                                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>City</label>
                            <select
                                required
                                value={selectedCityId}
                                onChange={(e) => setSelectedCityId(e.target.value)}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white' }}
                            >
                                <option value="" style={{ background: 'var(--background)' }}>Select City</option>
                                {cities.map(city => (
                                    <option key={city.id} value={city.id} style={{ background: 'var(--background)' }}>{city.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Area</label>
                            <select
                                required
                                value={selectedAreaId}
                                onChange={(e) => setSelectedAreaId(e.target.value)}
                                disabled={!selectedCityId || loadingAreas}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', opacity: !selectedCityId ? 0.5 : 1 }}
                            >
                                <option value="" style={{ background: 'var(--background)' }}>
                                    {loadingAreas ? 'Loading...' : 'Select Area'}
                                </option>
                                {areas.map(area => (
                                    <option key={area.id} value={area.id} style={{ background: 'var(--background)' }}>{area.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Address</label>
                        <div style={{ position: 'relative' }}>
                            <MapPin size={18} style={{ position: 'absolute', left: '1rem', top: '1rem', color: 'var(--text-secondary)' }} />
                            <textarea
                                required
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="Full street address..."
                                rows={2}
                                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', resize: 'none' }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Description (Optional)</label>
                        <div style={{ position: 'relative' }}>
                            <AlignLeft size={18} style={{ position: 'absolute', left: '1rem', top: '1rem', color: 'var(--text-secondary)' }} />
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Brief details about the facility..."
                                rows={2}
                                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', resize: 'none' }}
                            />
                        </div>
                    </div>

                    {error && <div style={{ color: 'var(--error)', fontSize: '0.9rem' }}>{error}</div>}

                    <button
                        type="submit"
                        disabled={submitting}
                        className="button"
                        style={{ width: '100%', padding: '1rem', borderRadius: '12px', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    >
                        {submitting ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
                        {submitting ? 'Creating...' : 'Create Facility'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default AddFacilityModal;
