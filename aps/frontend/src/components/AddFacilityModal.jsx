import React, { useState, useEffect } from 'react';
import { X, MapPin, Building2, AlignLeft, Check, Loader2, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useSearch } from '../context/SearchContext';

const AddFacilityModal = ({ isOpen, onClose, onSuccess, cities }) => {
    const { fetchCities } = useSearch();

    const [view, setView] = useState('facility'); // 'facility' | 'add_city' | 'add_area'
    
    // Facility mapping states
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [description, setDescription] = useState('');
    const [selectedCityId, setSelectedCityId] = useState('');
    const [selectedAreaId, setSelectedAreaId] = useState('');
    
    // Sub-view states
    const [newCityName, setNewCityName] = useState('');
    const [newAreaName, setNewAreaName] = useState('');
    
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

    const handleAddCityArea = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            setError(null);
            
            // 1. Create City
            const cityRes = await api.post('/parking/cities', { name: newCityName });
            const newCityId = cityRes.data.city.id;
            
            // 2. Create Area
            const areaRes = await api.post(`/parking/cities/${newCityId}/areas`, { name: newAreaName });
            const newAreaId = areaRes.data.area.id;
            
            // 3. Update parent states and global context
            await fetchCities(); 
            setSelectedCityId(newCityId);
            // We manually fetch areas for the newly selected city
            setAreas([{ id: newAreaId, name: newAreaName }]);
            setSelectedAreaId(newAreaId);
            
            // 4. Return to main facility form
            setNewCityName('');
            setNewAreaName('');
            setView('facility');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create City & Area');
        } finally {
            setSubmitting(false);
        }
    };

    const handleAddArea = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            setError(null);
            
            // Create Area
            const areaRes = await api.post(`/parking/cities/${selectedCityId}/areas`, { name: newAreaName });
            const newAreaId = areaRes.data.area.id;
            
            setAreas([...areas, { id: newAreaId, name: newAreaName }]);
            setSelectedAreaId(newAreaId);
            
            setNewAreaName('');
            setView('facility');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create Area');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedAreaId) {
            setError('Please select an Area');
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
            handleClose();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create facility');
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        onClose();
        // Reset ALL states
        setView('facility');
        setName('');
        setAddress('');
        setDescription('');
        setSelectedCityId('');
        setSelectedAreaId('');
        setNewCityName('');
        setNewAreaName('');
        setError(null);
    };

    if (!isOpen) return null;

    let modalContent;

    if (view === 'add_city') {
        modalContent = (
            <motion.div
                key="add_city"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
            >
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem', gap: '1rem' }}>
                    <button onClick={() => setView('facility')} style={{ background: 'var(--surface)', border: 'none', color: 'white', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', display: 'flex' }}>
                        <ArrowLeft size={20} />
                    </button>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0 }}>
                        <MapPin className="gradient-text" /> Create City & Area
                    </h2>
                </div>

                <form onSubmit={handleAddCityArea} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>New City Name</label>
                        <input
                            type="text"
                            required
                            value={newCityName}
                            onChange={(e) => setNewCityName(e.target.value)}
                            placeholder="e.g. Mumbai"
                            style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Initial Area for City</label>
                        <input
                            type="text"
                            required
                            value={newAreaName}
                            onChange={(e) => setNewAreaName(e.target.value)}
                            placeholder="e.g. Andheri East"
                            style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white' }}
                        />
                    </div>

                    {error && <div style={{ color: 'var(--error)', fontSize: '0.9rem' }}>{error}</div>}

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button
                            type="button"
                            onClick={() => setView('facility')}
                            className="button"
                            style={{ flex: 1, padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', color: 'white' }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="button"
                            style={{ flex: 2, padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                        >
                            {submitting ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
                            {submitting ? 'Creating...' : 'Add City'}
                        </button>
                    </div>
                </form>
            </motion.div>
        );
    } else if (view === 'add_area') {
        const cityName = cities.find(c => c.id === parseInt(selectedCityId))?.name || 'Selected City';
        modalContent = (
            <motion.div
                key="add_area"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
            >
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem', gap: '1rem' }}>
                    <button onClick={() => setView('facility')} style={{ background: 'var(--surface)', border: 'none', color: 'white', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', display: 'flex' }}>
                        <ArrowLeft size={20} />
                    </button>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0 }}>
                        <MapPin className="gradient-text" /> Add New Area
                    </h2>
                </div>

                <form onSubmit={handleAddArea} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Targeting City</label>
                        <input
                            type="text"
                            disabled
                            value={cityName}
                            style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>New Area Name</label>
                        <input
                            type="text"
                            required
                            value={newAreaName}
                            onChange={(e) => setNewAreaName(e.target.value)}
                            placeholder="e.g. Bandra West"
                            style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white' }}
                        />
                    </div>

                    {error && <div style={{ color: 'var(--error)', fontSize: '0.9rem' }}>{error}</div>}

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button
                            type="button"
                            onClick={() => setView('facility')}
                            className="button"
                            style={{ flex: 1, padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', color: 'white' }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="button"
                            style={{ flex: 2, padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                        >
                            {submitting ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
                            {submitting ? 'Creating...' : 'Add Area'}
                        </button>
                    </div>
                </form>
            </motion.div>
        );
    } else {
        modalContent = (
            <motion.div
                key="facility"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0 }}>
                        <Building2 className="gradient-text" /> Add New Facility
                    </h2>
                    <button
                        onClick={handleClose}
                        style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                    >
                        <X size={24} />
                    </button>
                </div>

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
                            <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                <span>City</span>
                                <button type="button" onClick={() => { setView('add_city'); setError(null); }} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.8rem' }}>
                                    + Add New City
                                </button>
                            </label>
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
                            <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                <span>Area</span>
                                <button
                                    type="button" 
                                    onClick={() => { setView('add_area'); setError(null); }}
                                    disabled={!selectedCityId}
                                    style={{ background: 'none', border: 'none', color: selectedCityId ? 'var(--primary)' : 'var(--text-secondary)', cursor: selectedCityId ? 'pointer' : 'not-allowed', fontSize: '0.8rem', opacity: selectedCityId ? 1 : 0.5 }}
                                >
                                    + Add New Area
                                </button>
                            </label>
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
        );
    }

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
            <div className="glass" style={{ maxWidth: '500px', width: '100%', padding: '2rem', position: 'relative', overflow: 'hidden' }}>
                <AnimatePresence mode="wait">
                    {modalContent}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AddFacilityModal;
