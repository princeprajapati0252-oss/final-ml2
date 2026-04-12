import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const SearchContext = createContext();

export const useSearch = () => useContext(SearchContext);

export const SearchProvider = ({ children }) => {
    const [cities, setCities] = useState([]);
    const [areas, setAreas] = useState([]);
    const [facilities, setFacilities] = useState([]);
    const [floors, setFloors] = useState([]);

    const [selectedCity, setSelectedCity] = useState(null);
    const [selectedArea, setSelectedArea] = useState(null);
    const [selectedFacility, setSelectedFacility] = useState(null);
    const [selectedFloor, setSelectedFloor] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [slots, setSlots] = useState([]);

    const [bookingStatus, setBookingStatus] = useState(null); // 'idle', 'loading', 'success', 'error'
    const [lastBooking, setLastBooking] = useState(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [cityQuery, setCityQuery] = useState('');

    // Initial load of cities
    useEffect(() => {
        fetchCities();
    }, []);

    const fetchCities = async (query = '') => {
        try {
            setLoading(true);
            const response = await api.get(`/search/cities?q=${query}`);
            setCities(response.data.cities);
            setError(null);
        } catch (err) {
            setError('Failed to fetch cities');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAreas = async (cityId) => {
        try {
            setLoading(true);
            const response = await api.get(`/search/cities/${cityId}/areas`);
            setAreas(response.data.areas);
            setError(null);
        } catch (err) {
            setError('Failed to fetch areas');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchFacilities = async (areaId) => {
        try {
            setLoading(true);
            const response = await api.get(`/search/areas/${areaId}/facilities`);
            setFacilities(response.data.facilities);
            setError(null);
        } catch (err) {
            setError('Failed to fetch facilities');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchFloors = async (facilityId) => {
        try {
            setLoading(true);
            const response = await api.get(`/search/facilities/${facilityId}/floors`);
            setFloors(response.data.floors);
            setError(null);
        } catch (err) {
            setError('Failed to fetch floors');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchSlots = async (floorId) => {
        try {
            setLoading(true);
            const response = await api.get(`/search/floors/${floorId}/slots`);
            setSlots(response.data.slots);
            setError(null);
        } catch (err) {
            setError('Failed to fetch slots');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const selectCity = (city) => {
        setSelectedCity(city);
        setSelectedArea(null);
        setSelectedFacility(null);
        setAreas([]);
        setFacilities([]);
        if (city) fetchAreas(city.id);
    };

    const selectArea = (area) => {
        setSelectedArea(area);
        setSelectedFacility(null);
        setFacilities([]);
        if (area) fetchFacilities(area.id);
    };

    const selectFacility = (facility) => {
        setSelectedFacility(facility);
        setSelectedFloor(null);
        setSelectedSlot(null);
        setFloors([]);
        setSlots([]);
        if (facility) fetchFloors(facility.id);
    };

    const selectFloor = (floor) => {
        setSelectedFloor(floor);
        setSelectedSlot(null);
        setSlots([]);
        if (floor) fetchSlots(floor.id);
    };

    const selectSlot = (slot) => {
        setSelectedSlot(slot);
    };

    const resetSearch = () => {
        setCityQuery('');
        setSelectedCity(null);
        setSelectedArea(null);
        setSelectedFacility(null);
        setSelectedFloor(null);
        setSelectedSlot(null);
        setAreas([]);
        setFacilities([]);
        setFloors([]);
        setSlots([]);
    };

    const value = {
        cities,
        areas,
        facilities,
        floors,
        slots,
        selectedCity,
        selectedArea,
        selectedFacility,
        selectedFloor,
        selectedSlot,
        loading,
        error,
        selectCity,
        selectArea,
        selectFacility,
        selectFloor,
        selectSlot,
        resetSearch,
        fetchCities,
        bookingStatus,
        setBookingStatus,
        lastBooking,
        setLastBooking,
        cityQuery,
        setCityQuery
    };

    return (
        <SearchContext.Provider value={value}>
            {children}
        </SearchContext.Provider>
    );
};
