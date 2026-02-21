const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

/**
 * Get authentication token from localStorage
 */
const getAuthToken = () => {
    const token = localStorage.getItem('token');
    return token;
};

/**
 * Add new address
 */
export const addAddress = async (addressData: any) => {
    const token = getAuthToken();

    const response = await fetch(`${API_BASE_URL}/api/address`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(addressData)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add address');
    }

    return response.json();
};

/**
 * Get all user addresses
 */
export const getAddresses = async () => {
    const token = getAuthToken();

    const response = await fetch(`${API_BASE_URL}/api/address`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch addresses');
    }

    return response.json();
};

/**
 * Update address
 */
export const updateAddress = async (id: string, addressData: any) => {
    const token = getAuthToken();

    const response = await fetch(`${API_BASE_URL}/api/address/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(addressData)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update address');
    }

    return response.json();
};

/**
 * Delete address
 */
export const deleteAddress = async (id: string) => {
    const token = getAuthToken();

    const response = await fetch(`${API_BASE_URL}/api/address/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete address');
    }

    return response.json();
};

/**
 * Set address as default
 */
export const setDefaultAddress = async (id: string) => {
    const token = getAuthToken();

    const response = await fetch(`${API_BASE_URL}/api/address/${id}/default`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to set default address');
    }

    return response.json();
};
