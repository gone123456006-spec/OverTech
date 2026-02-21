/**
 * Calculate distance between two points using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
export const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in kilometers

    const toRad = (value) => (value * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 10) / 10; // Round to 1 decimal place
};

/**
 * Check if a location is within delivery radius
 * @param {object} userCoords - { latitude, longitude }
 * @param {object} storeCoords - { latitude, longitude }
 * @param {number} radius - Delivery radius in km
 * @returns {boolean} True if within radius
 */
export const isWithinRadius = (userCoords, storeCoords, radius) => {
    const distance = calculateHaversineDistance(
        userCoords.latitude,
        userCoords.longitude,
        storeCoords.latitude,
        storeCoords.longitude
    );
    return distance <= radius;
};

/**
 * Estimate delivery time based on distance
 * @param {number} distance - Distance in kilometers
 * @returns {string} Estimated delivery time range
 */
export const estimateDeliveryTime = (distance) => {
    if (distance <= 2) {
        return '15-20 mins';
    } else if (distance <= 5) {
        return '20-30 mins';
    } else if (distance <= 10) {
        return '30-45 mins';
    } else if (distance <= 15) {
        return '45-60 mins';
    } else {
        return 'Not available';
    }
};

/**
 * Get delivery fee based on distance
 * @param {number} distance - Distance in kilometers
 * @returns {number} Delivery fee
 */
export const calculateDeliveryFee = (distance) => {
    if (distance <= 2) {
        return 0; // Free delivery
    } else if (distance <= 5) {
        return 20;
    } else if (distance <= 10) {
        return 40;
    } else {
        return 60;
    }
};
