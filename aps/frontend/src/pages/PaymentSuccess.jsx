import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, Receipt, Loader2, Clock, Car, MapPin } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [details, setDetails] = useState(null);
    const [error, setError] = useState(null);
    const sessionId = searchParams.get('session_id');

    useEffect(() => {
        const fetchDetails = async () => {
            if (!sessionId) {
                setError("No session ID found");
                setLoading(false);
                return;
            }
            try {
                const response = await api.get(`/booking/checkout-session/${sessionId}`);
                setDetails(response.data);
            } catch (err) {
                setError("Failed to fetch payment details");
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [sessionId]);

    if (loading) {
        return (
            <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 className="animate-spin" size={48} style={{ color: 'var(--success)' }} />
                <h2 style={{ mt: '1rem', color: 'var(--text-secondary)' }}>Verifying Payment...</h2>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ color: 'var(--error)', fontSize: '1.25rem', marginBottom: '1rem' }}>{error}</div>
                <Link to="/my-bookings" className="button">Back to My Bookings</Link>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass"
                style={{
                    maxWidth: '550px',
                    width: '100%',
                    padding: '3rem',
                    textAlign: 'center',
                    borderRadius: '32px'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ background: 'rgba(34, 197, 94, 0.1)', padding: '1rem', borderRadius: '50%' }}>
                        <CheckCircle2 size={64} style={{ color: 'var(--success)' }} />
                    </div>
                </div>
                
                <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', background: 'linear-gradient(135deg, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Payment Success!
                </h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                    Receipt #{details.invoice_number}
                </p>

                {/* Transaction Summary */}
                <div style={{ 
                    background: 'rgba(255,255,255,0.03)', 
                    borderRadius: '24px', 
                    padding: '2rem', 
                    marginBottom: '2.5rem',
                    textAlign: 'left',
                    border: '1px solid var(--glass-border)'
                }}>
                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)' }}>
                                <MapPin size={18} /> Facility
                            </div>
                            <div style={{ fontWeight: '600' }}>{details.facility_name}</div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)' }}>
                                <Car size={18} /> Vehicle
                            </div>
                            <div style={{ fontWeight: '600' }}>{details.vehicle_number}</div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)' }}>
                                <Clock size={18} /> Duration
                            </div>
                            <div style={{ fontWeight: '600' }}>{details.duration} Hours</div>
                        </div>
                        <div style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Total Amount</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--success)' }}>₹{details.amount_total.toFixed(2)}</div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <Link to="/my-bookings" className="button" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem' }}>
                        <Receipt size={20} /> View All Receipts <ArrowRight size={18} />
                    </Link>
                    <Link to="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>
                        Return to Dashboard
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default PaymentSuccess;
