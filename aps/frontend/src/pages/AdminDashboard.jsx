import { Building2, Plus, BarChart3, MapPin, Layers, ChevronRight, Loader2, TrendingUp, Users, IndianRupee, Activity, PieChart } from 'lucide-react';
import api from '../services/api';
import AddFacilityModal from '../components/AddFacilityModal';
import FacilityManager from '../components/FacilityManager';
import { useSearch } from '../context/SearchContext';
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('facilities');
    const [facilities, setFacilities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedFacility, setSelectedFacility] = useState(null);

    const { cities, fetchCities } = useSearch();

    useEffect(() => {
        fetchCities();
    }, []);

    useEffect(() => {
        if (activeTab === 'facilities') {
            fetchFacilities();
        }
    }, [activeTab]);

    const fetchFacilities = async () => {
        try {
            setLoading(true);
            const response = await api.get('/parking/my-facilities');
            setFacilities(response.data.facilities);
        } catch (err) {
            console.error('Failed to fetch facilities', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fade-in" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
            <div style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Admin Console</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Manage your parking empire with ease.</p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--surface)', padding: '0.4rem', borderRadius: '12px' }}>
                    <button
                        onClick={() => setActiveTab('facilities')}
                        style={{
                            padding: '0.6rem 1.2rem',
                            borderRadius: '8px',
                            background: activeTab === 'facilities' ? 'var(--primary)' : 'transparent',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            transition: '0.3s'
                        }}
                    >
                        <Building2 size={18} /> Facilities
                    </button>
                    <button
                        onClick={() => setActiveTab('analytics')}
                        style={{
                            padding: '0.6rem 1.2rem',
                            borderRadius: '8px',
                            background: activeTab === 'analytics' ? 'var(--primary)' : 'transparent',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            transition: '0.3s'
                        }}
                    >
                        <BarChart3 size={18} /> Analytics
                    </button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {selectedFacility ? (
                    <motion.div
                        key="manager"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <FacilityManager
                            facility={selectedFacility}
                            onBack={() => {
                                setSelectedFacility(null);
                                fetchFacilities();
                            }}
                        />
                    </motion.div>
                ) : activeTab === 'facilities' ? (
                    <motion.div
                        key="facilities"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.5rem' }}>Active Facilities</h2>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="button"
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '12px' }}
                            >
                                <Plus size={20} /> Add Facility
                            </button>
                        </div>

                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '5rem' }}>
                                <Loader2 className="animate-spin" size={48} style={{ color: 'var(--primary)', margin: '0 auto' }} />
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
                                {facilities.map(facility => (
                                    <div key={facility.id} className="glass card-hover" style={{ padding: '1.5rem', position: 'relative' }}>
                                        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                            <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '1rem', borderRadius: '16px', height: 'fit-content' }}>
                                                <Building2 size={28} style={{ color: 'var(--primary)' }} />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{facility.name}</h3>
                                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                    <MapPin size={14} /> {facility.address}
                                                </p>
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px' }}>
                                            <div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Occupancy</div>
                                                <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                                                    {facility.occupied_slots} / {facility.total_slots}
                                                </div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Status</div>
                                                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: facility.is_active ? 'var(--success)' : 'var(--error)' }}>
                                                    {facility.is_active ? 'Active' : 'Private'}
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                                            <button
                                                onClick={() => setSelectedFacility(facility)}
                                                className="glass"
                                                style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', cursor: 'pointer' }}
                                            >
                                                <Layers size={16} /> Manage
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {facilities.length === 0 && (
                                    <div className="glass" style={{ padding: '4rem', textAlign: 'center', gridColumn: '1 / -1' }}>
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>You haven't added any facilities yet.</p>
                                        <button
                                            onClick={() => setShowCreateModal(true)}
                                            style={{ color: 'var(--primary)', background: 'none', border: 'none', fontWeight: 'bold', cursor: 'pointer', marginTop: '1rem' }}
                                        >
                                            Get started by adding your first one
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="analytics"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <AdminAnalytics />
                    </motion.div>
                )}
            </AnimatePresence>

            <AddFacilityModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={fetchFacilities}
                cities={cities}
            />
        </div>
    );
};

const AdminAnalytics = () => {
    const [analytics, setAnalytics] = useState(null);
    const [facilities, setFacilities] = useState([]);
    const [selectedFacilityId, setSelectedFacilityId] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (selectedFacilityId !== 'all') {
            fetchFacilityAnalytics(selectedFacilityId);
        } else {
            // Aggregate logic or global analytics if implemented
            // For now, just show first facility or placeholders
            if (facilities.length > 0) {
                fetchFacilityAnalytics(facilities[0].id);
                setSelectedFacilityId(facilities[0].id);
            } else {
                setLoading(false);
            }
        }
    }, [selectedFacilityId, facilities]);

    const fetchInitialData = async () => {
        try {
            const response = await api.get('/parking/my-facilities');
            setFacilities(response.data.facilities);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchFacilityAnalytics = async (id) => {
        try {
            setLoading(true);
            const response = await api.get(`/parking/facilities/${id}/analytics`);
            setAnalytics(response.data.analytics);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !analytics) return (
        <div style={{ textAlign: 'center', padding: '5rem' }}>
            <Loader2 className="animate-spin" size={48} style={{ color: 'var(--primary)', margin: '0 auto' }} />
        </div>
    );

    return (
        <div>
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.5rem' }}>Performance Overview</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Filter by Facility:</span>
                    <select
                        value={selectedFacilityId}
                        onChange={(e) => setSelectedFacilityId(e.target.value)}
                        style={{ padding: '0.5rem 1rem', borderRadius: '8px', background: 'var(--surface)', border: '1px solid var(--glass-border)', color: 'white' }}
                    >
                        {facilities.map(f => (
                            <option key={f.id} value={f.id}>{f.name}</option>
                        ))}
                        {facilities.length === 0 && <option value="none">No facilities</option>}
                    </select>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                <div className="glass" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <div style={{ background: 'rgba(34, 197, 94, 0.1)', padding: '0.75rem', borderRadius: '12px' }}>
                            <IndianRupee size={24} style={{ color: 'var(--success)' }} />
                        </div>
                        <TrendingUp size={20} style={{ color: 'var(--success)' }} />
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Today's Revenue</div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                        ₹{analytics?.today_revenue?.toFixed(2) || '0.00'}
                    </div>
                </div>

                <div className="glass" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '0.75rem', borderRadius: '12px' }}>
                            <Activity size={24} style={{ color: 'var(--primary)' }} />
                        </div>
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Active Bookings</div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                        {analytics?.active_bookings || 0}
                    </div>
                </div>

                <div className="glass" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <div style={{ background: 'rgba(236, 72, 153, 0.1)', padding: '0.75rem', borderRadius: '12px' }}>
                            <PieChart size={24} style={{ color: 'var(--secondary)' }} />
                        </div>
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Occupancy Rate</div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                        {analytics?.occupancy_rate || 0}%
                    </div>
                </div>

                <div className="glass" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '0.75rem', borderRadius: '12px' }}>
                            <Users size={24} style={{ color: 'var(--accent)' }} />
                        </div>
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Total Bookings</div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                        {analytics?.total_bookings || 0}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
