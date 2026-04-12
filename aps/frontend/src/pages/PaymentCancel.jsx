import React from 'react';
import { motion } from 'framer-motion';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

const PaymentCancel = () => {
    return (
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass"
                style={{
                    maxWidth: '500px',
                    width: '100%',
                    padding: '3rem',
                    textAlign: 'center',
                    borderRadius: '32px'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '50%' }}>
                        <XCircle size={64} style={{ color: 'var(--error)' }} />
                    </div>
                </div>
                
                <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', background: 'linear-gradient(135deg, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Payment Cancelled
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '2.5rem', lineHeight: '1.6' }}>
                    Your payment was not completed. If this was a mistake, you can try paying again from your bookings page.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <Link to="/my-bookings" className="button" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem' }}>
                        <RefreshCw size={20} /> Try Again
                    </Link>
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>
                        <ArrowLeft size={16} /> Back to Dashboard
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default PaymentCancel;
