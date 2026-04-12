import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useSearch } from '../context/SearchContext';
import HierarchicalSearch from '../components/HierarchicalSearch';
import BookingPass from '../components/BookingPass';
import { motion, AnimatePresence } from 'framer-motion';

const UserDashboard = () => {
    const { user } = useAuth();
    const { lastBooking, setLastBooking, setBookingStatus } = useSearch();

    const handleClosePass = () => {
        setLastBooking(null);
        setBookingStatus(null);
    };

    return (
        <div className="fade-in" style={{ padding: '2rem' }}>
            <AnimatePresence>
                {lastBooking && (
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
                            flexDirection: 'column', // Allow margin: auto to work vertically
                            padding: '2rem 1rem',
                            overflowY: 'auto'
                        }}
                    >
                        <BookingPass booking={lastBooking} onClose={handleClosePass} />
                    </motion.div>
                )}
            </AnimatePresence>

            <section style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 className="gradient-text" style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
                    Hello, {user?.first_name}!
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                    Find your perfect parking spot in seconds.
                </p>
            </section>

            <HierarchicalSearch />
        </div>
    );
};

export default UserDashboard;
