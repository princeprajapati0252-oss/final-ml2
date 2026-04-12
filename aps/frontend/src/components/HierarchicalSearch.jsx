import React from 'react';
import { useSearch } from '../context/SearchContext';
import { MapPin, ChevronRight, Building2, Layers, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SlotSelectionSidebar from './SlotSelectionSidebar';

const HierarchicalSearch = () => {
    const {
        cities, areas, facilities, floors,
        selectedCity, selectedArea, selectedFacility,
        selectCity, selectArea, selectFacility, selectFloor,
        loading, cityQuery
    } = useSearch();

    const filteredCities = cities.filter(city => 
        (cityQuery ? city.name.toLowerCase().includes(cityQuery.toLowerCase()) : true)
    );

    return (
        <div className="search-container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
            {/* Breadcrumbs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', color: 'var(--text-secondary)' }}>
                <span
                    onClick={() => selectCity(null)}
                    style={{ cursor: 'pointer', color: !selectedCity ? 'var(--primary)' : 'inherit' }}
                >
                    Cities
                </span>
                {selectedCity && (
                    <>
                        <ChevronRight size={16} />
                        <span
                            onClick={() => selectArea(null)}
                            style={{ cursor: 'pointer', color: selectedCity && !selectedArea ? 'var(--primary)' : 'inherit' }}
                        >
                            {selectedCity.name}
                        </span>
                    </>
                )}
                {selectedArea && (
                    <>
                        <ChevronRight size={16} />
                        <span
                            onClick={() => selectFacility(null)}
                            style={{ cursor: 'pointer', color: selectedArea && !selectedFacility ? 'var(--primary)' : 'inherit' }}
                        >
                            {selectedArea.name}
                        </span>
                    </>
                )}
            </div>

            <AnimatePresence mode="wait">
                {!selectedCity && (
                    <motion.div
                        key="city-selector"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <h2 style={{ marginBottom: '1.5rem' }}>Select a City</h2>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                            gap: '1.5rem'
                        }}>
                            {filteredCities.length === 0 && !loading && (
                                <p style={{ color: 'var(--text-secondary)' }}>No cities match your search.</p>
                            )}
                            {filteredCities.map(city => (
                                <div
                                    key={city.id}
                                    className="glass card-hover"
                                    onClick={() => selectCity(city)}
                                    style={{ padding: '2rem', textAlign: 'center', cursor: 'pointer' }}
                                >
                                    <MapPin size={32} style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
                                    <h3 style={{ margin: 0 }}>{city.name}</h3>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {selectedCity && !selectedArea && (
                    <motion.div
                        key="area-selector"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <h2 style={{ marginBottom: '1.5rem' }}>Areas in {selectedCity.name}</h2>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                            gap: '1.5rem'
                        }}>
                            {areas.map(area => (
                                <div
                                    key={area.id}
                                    className="glass card-hover"
                                    onClick={() => selectArea(area)}
                                    style={{ padding: '2rem', textAlign: 'center', cursor: 'pointer' }}
                                >
                                    <Navigation size={32} style={{ color: 'var(--secondary)', marginBottom: '1rem' }} />
                                    <h3 style={{ margin: 0 }}>{area.name}</h3>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {selectedArea && !selectedFacility && (
                    <motion.div
                        key="facility-selector"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <h2 style={{ marginBottom: '1.5rem' }}>Facilities in {selectedArea.name}</h2>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                            gap: '1.5rem'
                        }}>
                            {facilities.map(facility => (
                                <div
                                    key={facility.id}
                                    className="glass card-hover"
                                    onClick={() => selectFacility(facility)}
                                    style={{ padding: '1.5rem', cursor: 'pointer' }}
                                >
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                                        <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '0.75rem', borderRadius: '12px' }}>
                                            <Building2 size={24} style={{ color: 'var(--primary)' }} />
                                        </div>
                                        <h3 style={{ margin: 0 }}>{facility.name}</h3>
                                    </div>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <MapPin size={14} /> {facility.address}
                                    </p>
                                </div>
                            ))}
                            {facilities.length === 0 && !loading && (
                                <p style={{ color: 'var(--text-secondary)' }}>No facilities found in this area.</p>
                            )}
                        </div>
                    </motion.div>
                )}

                {selectedFacility && (
                    <motion.div
                        key="floor-selector"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div>
                                <h2 style={{ margin: 0 }}>{selectedFacility.name}</h2>
                                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>{selectedFacility.address}</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {floors.map(floor => (
                                <div
                                    key={floor.id}
                                    className="glass card-hover"
                                    style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                >
                                    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <Layers size={20} style={{ color: 'var(--accent)' }} />
                                            <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>{floor.floor_name}</span>
                                        </div>
                                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                            <span style={{ color: 'var(--success)', fontWeight: '600' }}>{floor.available_slots}</span> / {floor.total_slots} slots
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>₹{floor.price_per_hour}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>per hour</div>
                                        </div>
                                        <button
                                            className="button"
                                            style={{ padding: '0.6rem 1.2rem', borderRadius: '8px' }}
                                            disabled={floor.available_slots === 0}
                                            onClick={() => selectFloor(floor)}
                                        >
                                            {floor.available_slots > 0 ? 'Select Slots' : 'Fully Booked'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <SlotSelectionSidebar />

            {loading && (
                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                    <div className="gradient-text">Fetching data...</div>
                </div>
            )}
        </div>
    );
};

export default HierarchicalSearch;
