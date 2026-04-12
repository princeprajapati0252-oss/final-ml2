import React, { useState } from 'react';
import { useSearch } from '../context/SearchContext';
import { useAuth } from '../context/AuthContext';
import { X, Check, AlertTriangle, ShieldCheck, Car, ArrowLeft, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

const SlotSelectionSidebar = () => {
    const {
        selectedFloor,
        slots,
        selectedSlot,
        selectSlot,
        selectFloor,
        loading,
        setBookingStatus,
        setLastBooking
    } = useSearch();

    const [isBooking, setIsBooking] = useState(false);
    const [vehicleNumber, setVehicleNumber] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState(null);

    if (!selectedFloor) return null;

    const handleBooking = async (e) => {
        e.preventDefault();
        
        const cleanVehicleNumber = vehicleNumber.trim().toUpperCase();
        if (!cleanVehicleNumber) {
            setFormError('Vehicle number is required');
            return;
        }

        // Standard Indian Plate: MH 12 AB 1234 (Relaxed up to 6 digits at the end to prevent blocking typos/customs)
        const standardPlateRegex = /^[A-Z]{2}[ -]?[0-9]{1,2}[ -]?[A-Z]{0,3}[ -]?[0-9]{1,6}$/;
        // BH Series Plate: 21 BH 2345 AA
        const bhPlateRegex = /^[0-9]{2}[ -]?BH[ -]?[0-9]{4}[ -]?[A-Z]{1,2}$/;

        if (!standardPlateRegex.test(cleanVehicleNumber) && !bhPlateRegex.test(cleanVehicleNumber)) {
            setFormError('Please enter a valid Indian vehicle number (e.g., MH 12 AB 1234)');
            return;
        }

        try {
            setSubmitting(true);
            setFormError(null);

            const response = await api.post('/booking/book', {
                slot_id: selectedSlot.id,
                vehicle_number: cleanVehicleNumber
            });

            setLastBooking(response.data.pass);
            setBookingStatus('success');

            // Reset local state
            setIsBooking(false);
            setVehicleNumber('');

            // Close sidebar
            selectFloor(null);

        } catch (err) {
            console.error(err);
            setFormError(err.response?.data?.error || 'Failed to create booking');
        } finally {
            setSubmitting(false);
        }
    };

    const handleBack = () => {
        setIsBooking(false);
        setFormError(null);
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                style={{
                    position: 'fixed',
                    right: 0,
                    top: 0,
                    width: '100%',
                    maxWidth: '450px',
                    height: '100vh',
                    background: 'rgba(15, 23, 42, 0.95)',
                    backdropFilter: 'blur(20px)',
                    borderLeft: '1px solid var(--glass-border)',
                    zIndex: 2000,
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '-10px 0 30px rgba(0,0,0,0.5)'
                }}
            >
                {/* Header */}
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {isBooking && (
                            <button
                                onClick={handleBack}
                                style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '0.25rem' }}
                            >
                                <ArrowLeft size={20} />
                            </button>
                        )}
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{isBooking ? 'Finalize Booking' : selectedFloor.floor_name}</h2>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                {isBooking ? 'Enter vehicle details' : 'Select your parking spot'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => selectFloor(null)}
                        style={{ background: 'var(--surface)', border: 'none', color: 'white', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer', display: 'flex' }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {!isBooking ? (
                    <>
                        {/* Legend */}
                        <div style={{ padding: '1rem 1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.8rem', borderBottom: '1px solid var(--glass-border)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--success)' }}></div>
                                <span>Available</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--error)' }}></div>
                                <span>Occupied</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--warning)' }}></div>
                                <span>Maintenance</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--primary)', border: '2px solid white' }}></div>
                                <span>Selected</span>
                            </div>
                        </div>

                        {/* Slot Grid */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
                            {loading ? (
                                <div style={{ textAlign: 'center', padding: '2rem' }}>Loading slots...</div>
                            ) : (
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(4, 1fr)',
                                    gap: '1rem'
                                }}>
                                    {slots.map(slot => {
                                        const isSelected = selectedSlot?.id === slot.id;
                                        const isOccupied = slot.status === 'occupied';
                                        const isMaintenance = slot.status === 'maintenance';
                                        const isAvailable = slot.status === 'available';

                                        let bgColor = 'var(--surface)';
                                        if (isAvailable) bgColor = 'rgba(34, 197, 94, 0.1)';
                                        if (isOccupied) bgColor = 'rgba(239, 68, 68, 0.1)';
                                        if (isMaintenance) bgColor = 'rgba(234, 179, 8, 0.1)';
                                        if (isSelected) bgColor = 'var(--primary)';

                                        return (
                                            <motion.div
                                                key={slot.id}
                                                whileHover={isAvailable ? { scale: 1.05 } : {}}
                                                whileTap={isAvailable ? { scale: 0.95 } : {}}
                                                onClick={() => isAvailable && selectSlot(slot)}
                                                style={{
                                                    background: bgColor,
                                                    border: isSelected ? '2px solid white' : `1px solid ${isAvailable ? 'var(--success)' : 'var(--glass-border)'}`,
                                                    borderRadius: '10px',
                                                    padding: '1rem 0.5rem',
                                                    textAlign: 'center',
                                                    cursor: isAvailable ? 'pointer' : 'not-allowed',
                                                    transition: '0.2s',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                    opacity: (isOccupied || isMaintenance) ? 0.6 : 1
                                                }}
                                            >
                                                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: isSelected ? 'white' : 'inherit' }}>
                                                    {slot.slot_number}
                                                </span>
                                                {isOccupied && <AlertTriangle size={14} style={{ color: 'var(--error)' }} />}
                                                {isSelected && <Check size={16} style={{ color: 'white' }} />}
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Footer / Summary */}
                        {selectedSlot && (
                            <motion.div
                                initial={{ y: 50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                style={{
                                    padding: '1.5rem',
                                    background: 'var(--surface)',
                                    borderTop: '1px solid var(--glass-border)'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Selected Slot</div>
                                        <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{selectedSlot.slot_number}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Price</div>
                                        <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>₹{selectedSlot.price_per_hour}/hr</div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsBooking(true)}
                                    className="button"
                                    style={{ width: '100%', padding: '0.875rem', borderRadius: '10px', fontSize: '1rem' }}
                                >
                                    Proceed to Booking
                                </button>
                            </motion.div>
                        )}
                    </>
                ) : (
                    <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <form onSubmit={handleBooking} style={{ flex: 1 }}>
                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>
                                    Vehicle Plate Number
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <Car style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} size={20} />
                                    <input
                                        type="text"
                                        placeholder="e.g. ABC-1234"
                                        value={vehicleNumber}
                                        onChange={(e) => setVehicleNumber(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '1rem 1rem 1rem 3rem',
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid var(--glass-border)',
                                            borderRadius: '12px',
                                            color: 'white',
                                            fontSize: '1.1rem',
                                            textTransform: 'uppercase'
                                        }}
                                        autoFocus
                                    />
                                </div>
                                {formError && <p style={{ color: 'var(--error)', marginTop: '0.5rem', fontSize: '0.9rem' }}>{formError}</p>}
                            </div>

                            <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px', marginBottom: '2rem' }}>
                                <h3 style={{ fontSize: '1rem', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Booking Summary</h3>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>Floor</span>
                                    <span>{selectedFloor.floor_name}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>Slot</span>
                                    <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{selectedSlot.slot_number}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>Hourly Rate</span>
                                    <span style={{ color: 'var(--success)' }}>₹{selectedSlot.price_per_hour}/hr</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="button"
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    borderRadius: '12px',
                                    fontSize: '1.1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.75rem'
                                }}
                            >
                                {submitting ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} />}
                                {submitting ? 'Creating Booking...' : 'Confirm & Pay'}
                            </button>
                        </form>
                    </div>
                )}
            </motion.div>
        </AnimatePresence>
    );
};

export default SlotSelectionSidebar;
