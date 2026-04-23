import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, Car, ShieldCheck, X, CreditCard } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const BookingPass = ({ booking, invoice, onPay, onClose }) => {
    if (!booking) return null;

    // Generate QR data
    const qrData = JSON.stringify({
        id: booking.booking_id,
        vehicle: booking.vehicle_number,
        facility: booking.facility_name,
        slot: `${booking.floor_name}-${booking.slot_number}`,
        entry: booking.start_time
    });

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass"
            style={{
                maxWidth: '400px',
                width: '100%',
                margin: 'auto',
                padding: 0,
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                position: 'relative'
            }}
        >
            {/* Close Button */}
            <button
                onClick={onClose}
                style={{
                    position: 'absolute',
                    right: '1.5rem',
                    top: '1.5rem',
                    background: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    color: 'white',
                    padding: '0.5rem',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    zIndex: 10
                }}
            >
                <X size={18} />
            </button>

            {/* Header / Brand */}
            <div style={{
                background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                padding: '2rem',
                textAlign: 'center',
                color: 'white'
            }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                    <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.75rem', borderRadius: '16px' }}>
                        <ShieldCheck size={32} />
                    </div>
                </div>
                <h2 style={{ margin: 0, fontSize: '1.5rem', letterSpacing: '1px' }}>{invoice ? 'INVOICE' : 'PARKING PASS'}</h2>
                <p style={{ margin: '0.5rem 0 0', opacity: 0.8, fontSize: '0.9rem' }}>Booking ID: #{booking.booking_id}</p>
            </div>

            {/* Main Content */}
            <div style={{ padding: '2rem' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Facility</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <MapPin size={20} style={{ color: 'var(--primary)' }} />
                        {booking.facility_name}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginLeft: '1.75rem', marginTop: '0.25rem' }}>
                        {booking.facility_address}
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Slot</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Floor {booking.floor_name}</div>
                        <div style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>Slot {booking.slot_number}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Vehicle</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Car size={18} />
                            {booking.vehicle_number}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Entry Time</div>
                        <div style={{ fontSize: '1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Clock size={18} />
                            {new Date(booking.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Rate</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--success)' }}>
                            ₹{booking.price_per_hour}/hr
                        </div>
                    </div>
                </div>

                {invoice ? (
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.25rem', borderRadius: '16px', marginBottom: '2rem', border: '1px solid var(--glass-border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Entry Time</span>
                            <span style={{ fontWeight: '500' }}>{new Date(booking.start_time).toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Duration</span>
                            <span style={{ fontWeight: '500' }}>{invoice.duration_hours} hrs</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Status</span>
                            <span style={{ color: invoice.paid ? 'var(--success)' : 'var(--error)', fontWeight: 'bold' }}>
                                {invoice.paid ? 'PAID' : 'UNPAID'}
                            </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed var(--glass-border)', fontWeight: 'bold', fontSize: '1.1rem' }}>
                            <span>Total Amount</span>
                            <span style={{ color: 'var(--success)' }}>₹{parseFloat(invoice.total_amount).toFixed(2)}</span>
                        </div>
                        
                        {!invoice.paid && (
                            <button 
                                onClick={() => onPay(invoice.id)}
                                className="button" 
                                style={{ 
                                    background: 'var(--success)', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    gap: '0.75rem', 
                                    padding: '1rem', 
                                    borderRadius: '16px',
                                    fontSize: '1.1rem',
                                    fontWeight: 'bold',
                                    width: '100%',
                                    marginTop: '1.5rem',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                <CreditCard size={20} /> Pay with Stripe
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Dynamic QR Code */}
                        <div style={{
                            background: 'white',
                            padding: '1.25rem',
                            borderRadius: '20px',
                            display: 'flex',
                            justifyContent: 'center',
                            marginBottom: '2rem',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                            border: '1px solid #eee'
                        }}>
                            <QRCodeSVG
                                value={qrData}
                                size={180}
                                level="H"
                                includeMargin={false}
                                imageSettings={{
                                    src: "/vite.svg",
                                    x: undefined,
                                    y: undefined,
                                    height: 24,
                                    width: 24,
                                    excavate: true,
                                }}
                            />
                        </div>


                    </>
                )}
            </div>

            {/* Ticket Cut Design */}
            <div style={{
                position: 'absolute',
                left: '-10px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: 'rgba(15, 23, 42, 1)',
                zIndex: 5
            }}></div>
            <div style={{
                position: 'absolute',
                right: '-10px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: 'rgba(15, 23, 42, 1)',
                zIndex: 5
            }}></div>
            <div style={{
                position: 'absolute',
                left: '20px',
                right: '20px',
                top: '50%',
                borderTop: '2px dashed var(--glass-border)',
                zIndex: 4
            }}></div>
        </motion.div>
    );
};

export default BookingPass;
