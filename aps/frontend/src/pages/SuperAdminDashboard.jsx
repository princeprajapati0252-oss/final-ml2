import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Shield, Building2, Activity, Search, ShieldAlert, CheckCircle, XCircle, ShieldCheck, Loader2, ArrowLeft, RefreshCw } from 'lucide-react';
import api from '../services/api';

const SuperAdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [facilities, setFacilities] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('users'); // users, facilities, bookings
    const [filter, setFilter] = useState('all'); // all, admin, end_user
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalAdmins: 0,
        totalSuperAdmins: 0,
        activeUsers: 0,
        totalFacilities: 0
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [userRes, facilityRes, bookingRes] = await Promise.all([
                api.get('/auth/users'),
                api.get('/parking/all-facilities'),
                api.get('/booking/all')
            ]);

            setUsers(userRes.data.users);
            setFacilities(facilityRes.data.facilities);
            setBookings(bookingRes.data.bookings);

            // Calculate stats
            const allUsers = userRes.data.users;
            const allFacilities = facilityRes.data.facilities;
            setStats({
                totalUsers: allUsers.length,
                totalAdmins: allUsers.filter(u => u.role === 'admin').length,
                totalSuperAdmins: allUsers.filter(u => u.role === 'super_admin').length,
                activeUsers: allUsers.filter(u => u.is_active).length,
                totalFacilities: allFacilities.length
            });
        } catch (err) {
            console.error('Failed to fetch data', err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (userId, currentStatus) => {
        try {
            await api.patch(`/auth/users/${userId}/status`, { is_active: !currentStatus });
            setUsers(users.map(u => u.id === userId ? { ...u, is_active: !currentStatus } : u));
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to update user status');
        }
    };

    const filteredUsers = users.filter(u => {
        const matchesFilter = filter === 'all' || u.role === filter;
        const fullName = `${u.first_name} ${u.last_name}`.toLowerCase();
        const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    if (loading && users.length === 0) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <Loader2 className="animate-spin" size={48} style={{ color: 'var(--primary)' }} />
            </div>
        );
    }

    return (
        <div className="fade-in" style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
            {/* Header */}
            <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <ShieldAlert size={40} /> Super Authority
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>System-wide governance and administrative oversight.</p>
                </div>
                <button
                    onClick={fetchData}
                    className="glass"
                    style={{ padding: '0.75rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}
                >
                    <RefreshCw size={18} /> Refresh Data
                </button>
            </header>

            {/* Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <StatCard icon={<Users size={24} />} title="Total Users" value={stats.totalUsers} color="var(--primary)" />
                <StatCard icon={<Shield size={24} />} title="Admins" value={stats.totalAdmins} color="var(--secondary)" />
                <StatCard icon={<Building2 size={24} />} title="Facilities" value={stats.totalFacilities} color="var(--accent)" />
                <StatCard icon={<CheckCircle size={24} />} title="Active Users" value={stats.activeUsers} color="var(--success)" />
            </div>

            {/* Main Tabs */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
                <button
                    onClick={() => setActiveTab('users')}
                    style={{
                        background: 'none',
                        color: activeTab === 'users' ? 'var(--primary)' : 'var(--text-secondary)',
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        padding: '0.5rem 1rem',
                        position: 'relative'
                    }}
                >
                    Users & Admins
                    {activeTab === 'users' && <motion.div layoutId="tab-underline" style={{ position: 'absolute', bottom: -17, left: 0, right: 0, height: '3px', background: 'var(--primary)', borderRadius: '3px' }} />}
                </button>
                <button
                    onClick={() => setActiveTab('facilities')}
                    style={{
                        background: 'none',
                        color: activeTab === 'facilities' ? 'var(--primary)' : 'var(--text-secondary)',
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        padding: '0.5rem 1rem',
                        position: 'relative'
                    }}
                >
                    All Facilities
                    {activeTab === 'facilities' && <motion.div layoutId="tab-underline" style={{ position: 'absolute', bottom: -17, left: 0, right: 0, height: '3px', background: 'var(--primary)', borderRadius: '3px' }} />}
                </button>
                <button
                    onClick={() => setActiveTab('bookings')}
                    style={{
                        background: 'none',
                        color: activeTab === 'bookings' ? 'var(--primary)' : 'var(--text-secondary)',
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        padding: '0.5rem 1rem',
                        position: 'relative'
                    }}
                >
                    Global Bookings
                    {activeTab === 'bookings' && <motion.div layoutId="tab-underline" style={{ position: 'absolute', bottom: -17, left: 0, right: 0, height: '3px', background: 'var(--primary)', borderRadius: '3px' }} />}
                </button>
            </div>

            {activeTab === 'users' ? (
                /* User Management Section */
                <div className="glass" style={{ padding: '2rem', position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <h2 style={{ fontSize: '1.5rem', margin: 0 }}>User Management</h2>

                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            {/* Search */}
                            <div style={{ position: 'relative' }}>
                                <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{
                                        padding: '0.6rem 1rem 0.6rem 2.75rem',
                                        borderRadius: '10px',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid var(--glass-border)',
                                        color: 'white',
                                        width: '250px'
                                    }}
                                />
                            </div>

                            {/* Filter Tabs */}
                            <div style={{ display: 'flex', background: 'var(--surface)', padding: '0.3rem', borderRadius: '10px' }}>
                                {['all', 'admin', 'end_user'].map(type => (
                                    <button
                                        key={type}
                                        onClick={() => setFilter(type)}
                                        style={{
                                            padding: '0.4rem 1rem',
                                            borderRadius: '7px',
                                            background: filter === type ? 'var(--primary)' : 'transparent',
                                            color: 'white',
                                            fontSize: '0.85rem',
                                            textTransform: 'capitalize',
                                            transition: '0.3s'
                                        }}
                                    >
                                        {type === 'end_user' ? 'Users' : type}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Users Table */}
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                    <th style={{ padding: '1rem' }}>User</th>
                                    <th style={{ padding: '1rem' }}>Role</th>
                                    <th style={{ padding: '1rem' }}>Status</th>
                                    <th style={{ padding: '1rem' }}>Joined</th>
                                    <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence mode="popLayout">
                                    {filteredUsers.map(user => (
                                        <motion.tr
                                            key={user.id}
                                            layout
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: '0.2s' }}
                                            className="table-row-hover"
                                        >
                                            <td style={{ padding: '1.25rem 1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <div style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        borderRadius: '50%',
                                                        background: user.role === 'super_admin' ? 'var(--accent)' : (user.role === 'admin' ? 'var(--secondary)' : 'var(--primary)'),
                                                        display: 'flex',
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                        fontWeight: 'bold',
                                                        fontSize: '0.9rem'
                                                    }}>
                                                        {user.first_name[0]}{user.last_name[0]}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: '600' }}>{user.first_name} {user.last_name}</div>
                                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{
                                                    fontSize: '0.75rem',
                                                    padding: '0.25rem 0.75rem',
                                                    borderRadius: '20px',
                                                    background: 'rgba(255,255,255,0.05)',
                                                    border: '1px solid var(--glass-border)',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px'
                                                }}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                                                    <div style={{
                                                        width: '8px',
                                                        height: '8px',
                                                        borderRadius: '50%',
                                                        background: user.is_active ? 'var(--success)' : 'var(--error)'
                                                    }} />
                                                    {user.is_active ? 'Active' : 'Deactivated'}
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                                {/* Date placeholder */}
                                                System Logged
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                <button
                                                    onClick={() => handleToggleStatus(user.id, user.is_active)}
                                                    disabled={user.role === 'super_admin'}
                                                    style={{
                                                        background: user.is_active ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                                                        color: user.is_active ? 'var(--error)' : 'var(--success)',
                                                        padding: '0.5rem 1rem',
                                                        borderRadius: '8px',
                                                        fontSize: '0.85rem',
                                                        fontWeight: '600',
                                                        opacity: user.role === 'super_admin' ? 0.5 : 1,
                                                        cursor: user.role === 'super_admin' ? 'not-allowed' : 'pointer',
                                                        transition: '0.2s'
                                                    }}
                                                >
                                                    {user.is_active ? 'Deactivate' : 'Activate'}
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>

                    {filteredUsers.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
                            No users found matching your criteria.
                        </div>
                    )}
                </div>
            ) : activeTab === 'facilities' ? (
                /* Facilities Management Section */
                <div className="glass" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.5rem' }}>Global Facilities Overview</h2>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
                        {facilities.map(facility => (
                            <div key={facility.id} className="glass card-hover" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)' }}>
                                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '0.75rem', borderRadius: '12px' }}>
                                        <Building2 size={24} style={{ color: 'var(--primary)' }} />
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>{facility.name}</h3>
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{facility.address}</p>
                                    </div>
                                </div>

                                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px', marginBottom: '1rem' }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Owner Information</div>
                                    <div style={{ fontWeight: '600' }}>{facility.owner_name}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{facility.owner_email}</div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="glass" style={{ padding: '0.75rem', textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>CAPACITY</div>
                                        <div style={{ fontWeight: 'bold' }}>{facility.total_slots} Slots</div>
                                    </div>
                                    <div className="glass" style={{ padding: '0.75rem', textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>OCCUPANCY</div>
                                        <div style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{facility.occupied_slots} Busy</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                /* Global Bookings Section */
                <div className="glass" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.5rem' }}>System-Wide Bookings</h2>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                    <th style={{ padding: '1rem' }}>User</th>
                                    <th style={{ padding: '1rem' }}>Facility / Slot</th>
                                    <th style={{ padding: '1rem' }}>Date & Time</th>
                                    <th style={{ padding: '1rem' }}>Status</th>
                                    <th style={{ padding: '1rem', textAlign: 'right' }}>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map(booking => (
                                    <tr key={booking.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ fontWeight: '600' }}>{booking.user_name}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{booking.user_email}</div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Building2 size={14} style={{ color: 'var(--primary)' }} />
                                                <span>{booking.facility_name}</span>
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                {booking.floor_name} - Slot {booking.slot_number}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ fontSize: '0.9rem' }}>{new Date(booking.start_time).toLocaleDateString()}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                {new Date(booking.start_time).toLocaleTimeString()}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                fontSize: '0.75rem',
                                                padding: '0.2rem 0.6rem',
                                                borderRadius: '20px',
                                                background: booking.status === 'active' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                                                color: booking.status === 'active' ? 'var(--success)' : 'var(--text-secondary)',
                                                border: '1px solid currentColor'
                                            }}>
                                                {booking.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold' }}>
                                            {booking.total_amount ? `₹${booking.total_amount.toFixed(2)}` : 'In Progress'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

const StatCard = ({ icon, title, value, color }) => (
    <div className="glass card-hover" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{
            background: `${color}15`,
            padding: '1rem',
            borderRadius: '16px',
            color: color,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            {icon}
        </div>
        <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>{title}</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>{value}</div>
        </div>
    </div>
);

export default SuperAdminDashboard;
