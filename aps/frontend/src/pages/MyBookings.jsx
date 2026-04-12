import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, MapPin, Car, ChevronRight, CheckCircle2, AlertCircle, Loader2, ArrowLeft, Receipt, ExternalLink } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import BookingPass from '../components/BookingPass';
import { useSearch } from '../context/SearchContext';

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedBookingDetails, setSelectedBookingDetails] = useState(null);
    const [showPass, setShowPass] = useState(false);

    const navigate = useNavigate();
    const { setBookingStatus, setLastBooking } = useSearch();

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const response = await api.get('/booking/my-bookings');
            setBookings(response.data.bookings);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to fetch bookings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleCheckOut = async (bookingId) => {
        if (!window.confirm('Are you sure you want to check out?')) return;

        try {
            setLoading(true);
            const response = await api.post(`/booking/${bookingId}/end`);
            // Show the generated invoice/pass
            const detailResponse = await api.get(`/booking/${bookingId}`);
            setSelectedBookingDetails(detailResponse.data);
            setShowPass(true);
            fetchBookings(); // Refresh list
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to check out');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = async (bookingId) => {
        try {
            setLoading(true);
            const response = await api.get(`/booking/${bookingId}`);
            setSelectedBookingDetails(response.data);
            setShowPass(true);
        } catch (err) {
            alert('Failed to fetch booking details');
        } finally {
            setLoading(false);
        }
    };

    const handlePayInvoice = async (invoiceId) => {
        try {
            setLoading(true);
            const response = await api.post(`/booking/invoices/${invoiceId}/checkout-session`);
            // Redirect to Stripe checkout URL
            window.location.href = response.data.url;
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to initialize payment');
        } finally {
            setLoading(false);
        }
    };

    const activeBookings = bookings.filter(b => b.status === 'active');
    const pastBookings = bookings.filter(b => b.status !== 'active');

    return (
        <div className="fade-in" style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <button
                    onClick={() => navigate('/')}
                    style={{ background: 'var(--surface)', border: 'none', color: 'white', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer' }}
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 className="gradient-text" style={{ fontSize: '2.5rem', margin: 0 }}>My Bookings</h1>
            </div>

            {loading && bookings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '5rem' }}>
                    <Loader2 className="animate-spin" size={48} style={{ color: 'var(--primary)', margin: '0 auto' }} />
                    <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading your history...</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>

                    {/* Active Bookings */}
                    <section>
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', fontSize: '1.5rem' }}>
                            <Clock style={{ color: 'var(--primary)' }} /> Active Sessions
                        </h2>
                        {activeBookings.length > 0 ? (
                            <div style={{ display: 'grid', gap: '1.5rem' }}>
                                {activeBookings.map(booking => (
                                    <motion.div
                                        key={booking.id}
                                        layout
                                        className="glass"
                                        style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                    >
                                        <div style={{ display: 'flex', gap: '2rem' }}>
                                            <div>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Facility</div>
                                                <div style={{ fontWeight: 'bold' }}>{booking.facility_name}</div>
                                                <div style={{ fontSize: '0.9rem', color: 'var(--primary)' }}>Floor {booking.floor_name} • Slot {booking.slot_number}</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Started</div>
                                                <div style={{ fontWeight: 'bold' }}>{new Date(booking.start_time).toLocaleTimeString()}</div>
                                                <div style={{ fontSize: '0.9rem', color: 'var(--text-tertiary)' }}>{new Date(booking.start_time).toLocaleDateString()}</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Vehicle</div>
                                                <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                    <Car size={16} /> {booking.vehicle_number}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <button
                                                onClick={() => handleViewDetails(booking.id)}
                                                className="glass"
                                                style={{ padding: '0.6rem 1rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                            >
                                                <Receipt size={18} /> Pass
                                            </button>
                                            <button
                                                onClick={() => handleCheckOut(booking.id)}
                                                className="button"
                                                style={{ background: 'var(--error)', padding: '0.6rem 1.2rem', borderRadius: '8px' }}
                                            >
                                                Check Out
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="glass" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                No active parking sessions.
                            </div>
                        )}
                    </section>

                    {/* Past Bookings */}
                    <section>
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', fontSize: '1.5rem' }}>
                            <CheckCircle2 style={{ color: 'var(--success)' }} /> History
                        </h2>
                        {pastBookings.length > 0 ? (
                            <div className="glass" style={{ overflow: 'hidden' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead style={{ background: 'rgba(255,255,255,0.05)', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                        <tr>
                                            <th style={{ padding: '1rem' }}>Date</th>
                                            <th style={{ padding: '1rem' }}>Facility</th>
                                            <th style={{ padding: '1rem' }}>Slot</th>
                                            <th style={{ padding: '1rem' }}>Duration</th>
                                            <th style={{ padding: '1rem' }}>Amount</th>
                                            <th style={{ padding: '1rem' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody style={{ fontSize: '0.95rem' }}>
                                        {pastBookings.map(booking => (
                                            <tr key={booking.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                                <td style={{ padding: '1rem' }}>{new Date(booking.start_time).toLocaleDateString()}</td>
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ fontWeight: '500' }}>{booking.facility_name}</div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{booking.vehicle_number}</div>
                                                </td>
                                                <td style={{ padding: '1rem' }}>{booking.slot_number}</td>
                                                <td style={{ padding: '1rem' }}>{booking.duration_hours || '0'} hrs</td>
                                                <td style={{ padding: '1rem', fontWeight: 'bold' }}>₹{booking.total_amount || '0.00'}</td>
                                                <td style={{ padding: '1rem' }}>
                                                    <button
                                                        onClick={() => handleViewDetails(booking.id)}
                                                        style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                                                    >
                                                        Invoice <ExternalLink size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="glass" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                Your parking history will appear here.
                            </div>
                        )}
                    </section>
                </div>
            )}

            {/* Pass Modal */}
            <AnimatePresence>
                {showPass && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.8)',
                            backdropFilter: 'blur(10px)',
                            zIndex: 3000,
                            display: 'flex',
                            flexDirection: 'column',
                            padding: '2rem 1rem',
                            overflowY: 'auto'
                        }}
                    >
                        <div style={{ margin: 'auto' }}>
                            <BookingPass
                                booking={selectedBookingDetails?.pass || selectedBookingDetails?.booking}
                                invoice={selectedBookingDetails?.invoice}
                                onPay={handlePayInvoice}
                                onClose={() => setShowPass(false)}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MyBookings;
