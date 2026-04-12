import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSearch } from '../context/SearchContext';
import { LogOut, User, MapPin, Car, Search } from 'lucide-react';

const Navbar = () => {
    const { user, logout, isAdmin, isSuperAdmin } = useAuth();
    const { cityQuery, setCityQuery } = useSearch();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="glass" style={{
            margin: '1rem',
            padding: '0.75rem 2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: '1rem',
            zIndex: 1000
        }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Car size={32} className="gradient-text" style={{ color: 'var(--primary)' }} />
                <span className="gradient-text" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>APS</span>
            </Link>

            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                {user ? (
                    <>
                        {isAdmin ? (
                            <div style={{ display: 'flex', gap: '1.5rem' }}>
                                <Link to="/admin" style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Admin Panel</Link>
                                {isSuperAdmin && (
                                    <Link to="/super-admin" style={{ color: 'var(--accent)', fontWeight: '600' }}>Super Authority</Link>
                                )}
                            </div>
                        ) : (
                            <>
                                <div style={{ position: 'relative' }}>
                                    <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                                    <input 
                                        type="text" 
                                        placeholder="Search city..." 
                                        value={cityQuery}
                                        onChange={(e) => {
                                            setCityQuery(e.target.value);
                                            if (location.pathname !== '/') {
                                                navigate('/');
                                            }
                                        }}
                                        style={{
                                            padding: '0.4rem 1rem 0.4rem 2rem',
                                            borderRadius: '8px',
                                            border: '1px solid var(--glass-border)',
                                            background: 'rgba(255, 255, 255, 0.05)',
                                            color: 'white',
                                            outline: 'none',
                                            width: '200px',
                                            fontSize: '0.9rem'
                                        }}
                                    />
                                </div>
                                <Link to="/my-bookings" className="navbar-link">My Bookings</Link>
                            </>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: isAdmin ? 'var(--accent)' : 'var(--primary)',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    fontSize: '0.9rem',
                                    fontWeight: 'bold'
                                }}>
                                    {user.first_name[0]}{user.last_name[0]}
                                </div>
                                <span style={{ fontWeight: '500' }}>{user.first_name}</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: '8px',
                                    background: 'var(--surface)',
                                    color: 'var(--text-primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    transition: '0.2s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.background = 'var(--surface-hover)'}
                                onMouseOut={(e) => e.currentTarget.style.background = 'var(--surface)'}
                            >
                                <LogOut size={16} />
                                Logout
                            </button>
                        </div>
                    </>
                ) : (
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                        <Link to="/login" style={{ color: 'var(--text-secondary)', fontWeight: '500', textDecoration: 'none' }}>Login</Link>
                        <Link
                            to="/register"
                            style={{
                                padding: '0.5rem 1.5rem',
                                borderRadius: '8px',
                                background: 'var(--primary)',
                                color: 'white',
                                fontWeight: '500',
                                textDecoration: 'none'
                            }}
                        >
                            Sign Up
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
