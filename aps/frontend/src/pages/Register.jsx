import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Lock, User, Phone, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Register = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        phone: '',
        role: 'end_user'
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await register(formData);
        if (result.success) {
            setSuccess(true);
            setTimeout(() => navigate('/login'), 2000);
        } else {
            setError(result.error);
        }
        setLoading(false);
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '2rem 1rem',
            minHeight: 'calc(100vh - 100px)'
        }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass"
                style={{
                    width: '100%',
                    maxWidth: '500px',
                    padding: '2.5rem'
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Create Account</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Join our Automated Parking System</p>
                </div>

                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: 'var(--error)',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.9rem'
                    }}>
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

                {success && (
                    <div style={{
                        background: 'rgba(34, 197, 94, 0.1)',
                        color: 'var(--success)',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.9rem'
                    }}>
                        <CheckCircle size={18} />
                        Registration successful! Redirecting to login...
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    {/* Role Selection */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '0.5rem' }}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Register as</label>
                        <div style={{
                            display: 'flex',
                            background: 'var(--surface)',
                            padding: '4px',
                            borderRadius: '10px',
                            border: '1px solid var(--glass-border)'
                        }}>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, role: 'end_user' })}
                                style={{
                                    flex: 1,
                                    padding: '0.6rem',
                                    borderRadius: '8px',
                                    background: formData.role === 'end_user' ? 'var(--primary)' : 'transparent',
                                    color: formData.role === 'end_user' ? 'white' : 'var(--text-secondary)',
                                    fontWeight: '500',
                                    transition: '0.3s'
                                }}
                            >
                                End User
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, role: 'admin' })}
                                style={{
                                    flex: 1,
                                    padding: '0.6rem',
                                    borderRadius: '8px',
                                    background: formData.role === 'admin' ? 'var(--accent)' : 'transparent',
                                    color: formData.role === 'admin' ? 'white' : 'var(--text-secondary)',
                                    fontWeight: '500',
                                    transition: '0.3s'
                                }}
                            >
                                Admin
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
                            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>First Name</label>
                            <div style={{ position: 'relative' }}>
                                <User size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                                <input
                                    name="first_name"
                                    required
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    style={{
                                        width: '100%',
                                        padding: '0.65rem 1rem 0.65rem 2.2rem',
                                        borderRadius: '8px',
                                        background: 'var(--surface)',
                                        border: '1px solid var(--glass-border)',
                                        color: 'white',
                                        outline: 'none'
                                    }}
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
                            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Last Name</label>
                            <input
                                name="last_name"
                                required
                                value={formData.last_name}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '0.65rem 1rem',
                                    borderRadius: '8px',
                                    background: 'var(--surface)',
                                    border: '1px solid var(--glass-border)',
                                    color: 'white',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input
                                type="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '0.65rem 1rem 0.65rem 2.2rem',
                                    borderRadius: '8px',
                                    background: 'var(--surface)',
                                    border: '1px solid var(--glass-border)',
                                    color: 'white',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Phone Number</label>
                        <div style={{ position: 'relative' }}>
                            <Phone size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '0.65rem 1rem 0.65rem 2.2rem',
                                    borderRadius: '8px',
                                    background: 'var(--surface)',
                                    border: '1px solid var(--glass-border)',
                                    color: 'white',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input
                                type="password"
                                name="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                style={{
                                    width: '100%',
                                    padding: '0.65rem 1rem 0.65rem 2.2rem',
                                    borderRadius: '8px',
                                    background: 'var(--surface)',
                                    border: '1px solid var(--glass-border)',
                                    color: 'white',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            marginTop: '1rem',
                            padding: '0.875rem',
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, var(--accent), var(--secondary))',
                            color: 'white',
                            fontWeight: '600',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '0.5rem',
                            opacity: loading ? 0.7 : 1,
                            transition: '0.3s'
                        }}
                    >
                        {loading ? 'Creating Account...' : <><UserPlus size={20} /> Register</>}
                    </button>
                </form>

                <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Already have an account? </span>
                    <Link to="/login" style={{ color: 'var(--accent)', fontWeight: '600' }}>Login</Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
