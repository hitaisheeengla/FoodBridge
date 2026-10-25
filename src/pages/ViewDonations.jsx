import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { donationService } from '../services/api';

const ViewDonations = () => {
  // State for storing donations, filters, and sorting
  const [donations, setDonations] = useState([]);
  const [filteredDonations, setFilteredDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    foodType: '',
  });
  const [sortBy, setSortBy] = useState('expiry');
  const [searchQuery, setSearchQuery] = useState('');

  // Function to get badge color based on food type
  const getFoodTypeBadgeColor = (foodType) => {
    switch (foodType) {
      case 'Non-Vegetarian Cooked Meals':
        return 'danger';
      case 'Vegetarian Cooked Meals':
        return 'success';
      case 'Grilled / Tandoori':
        return 'warning';
      case 'Fried / Steamed':
        return 'info';
      case 'Bakery Items':
        return 'primary';
      case 'Fresh Produce':
        return 'success';
      case 'Dairy Products':
        return 'light';
      case 'Packaged / Dry Foods':
        return 'secondary';
      case 'Beverages':
        return 'info';
      case 'Mixed Items':
        return 'dark';
      default:
        return 'secondary';
    }
  };


  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const data = await donationService.getDonations();
        setDonations(Array.isArray(data) ? data : []);
      } catch (error) {
        setError(
          error.response?.data?.message ||
          'Failed to load donations. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();
  }, []);


  // Apply filters and sorting

  useEffect(() => {
    let result = [...donations];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();

      result = result.filter((donation) =>
        (donation.donor?.name || 'Restaurant')
          .toLowerCase()
          .includes(query) ||
        (donation.foodItems || '')
          .toLowerCase()
          .includes(query) ||
        (donation.foodType || '')
          .toLowerCase()
          .includes(query)
      );
    }

    if (filters.foodType) {
      result = result.filter(
        (donation) => donation.foodType === filters.foodType
      );
    }

    switch (sortBy) {
      case 'distance':
        // Distance is unavailable until location-based
        // distance calculation is implemented.
        break;

      case 'expiry':
        result.sort(
          (a, b) =>
            new Date(a.pickupDate) - new Date(b.pickupDate)
        );
        break;

      case 'quantity':
        result.sort(
          (a, b) => Number(b.quantity) - Number(a.quantity)
        );
        break;

      default:
        break;
    }

    setFilteredDonations(result);
  }, [donations, filters, sortBy, searchQuery]);


  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle sort changes
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({ foodType: '' });
    setSortBy('expiry');
    setSearchQuery('');
  };

  // Handle search input
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="container py-5">
      <div className="row mb-4 align-items-center">
        <div className="col-md-7">
          <h2 className="fw-bold">Available Donations</h2>
          <p className="text-muted">Browse food donations available for pickup in your area</p>
        </div>
        <div className="col-md-5">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Search by restaurant or food item..."
              aria-label="Search donations"
              value={searchQuery}
              onChange={handleSearch}
            />
            <button
              className="btn btn-primary"
              type="button"
              onClick={() => setSearchQuery('')}
              title={searchQuery ? "Clear search" : "Search"}
            >
              <i className={`fas fa-${searchQuery ? 'times' : 'search'} me-1`}></i>
              {searchQuery ? 'Clear' : 'Search'}
            </button>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Filters Sidebar */}
        <div className="col-lg-3 mb-4">
          <div className="card border-0 shadow">
            <div className="card-header bg-white py-3">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold">Filters</h5>
                <button
                  className="btn btn-sm btn-link text-decoration-none"
                  onClick={resetFilters}
                >
                  Reset All
                </button>
              </div>
            </div>
            <div className="card-body">
              <form>
                <div className="mb-3">
                  <label htmlFor="foodType" className="form-label">Food Type</label>
                  <select
                    className="form-select"
                    id="foodType"
                    name="foodType"
                    value={filters.foodType}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Types</option>
                    <option value="Non-Vegetarian Cooked Meals">Non-Vegetarian Cooked Meals</option>
                    <option value="Vegetarian Cooked Meals">Vegetarian Cooked Meals</option>
                    <option value="Grilled / Tandoori">Grilled / Tandoori</option>
                    <option value="Fried / Steamed">Fried / Steamed</option>
                    <option value="Bakery Items">Bakery Items</option>
                    <option value="Fresh Produce">Fresh Produce</option>
                    <option value="Dairy Products">Dairy Products</option>
                    <option value="Packaged / Dry Foods">Packaged / Dry Foods</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Mixed Items">Mixed Items</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="distance" className="form-label">Max Distance</label>
                  <select
                    className="form-select"
                    id="distance"
                    name="distance"
                    value={filters.distance}
                    onChange={handleFilterChange}
                  >
                    <option value="">Any Distance</option>
                    <option value="3">Within 3 km</option>
                    <option value="5">Within 5 km</option>
                    <option value="10">Within 10 km</option>
                    <option value="20">Within 20 km</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="expiryTime" className="form-label">Expiry Time</label>
                  <select
                    className="form-select"
                    id="expiryTime"
                    name="expiryTime"
                    value={filters.expiryTime}
                    onChange={handleFilterChange}
                  >
                    <option value="">Any Time</option>
                    <option value="6">Within 6 hours</option>
                    <option value="12">Within 12 hours</option>
                    <option value="24">Within 24 hours</option>
                    <option value="48">Within 48 hours</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="sortBy" className="form-label">Sort By</label>
                  <select
                    className="form-select"
                    id="sortBy"
                    value={sortBy}
                    onChange={handleSortChange}
                  >
                    <option value="expiry">Pickup Date (Soonest)</option>
                    <option value="quantity">Quantity (Highest)</option>
                  </select>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Donations Grid */}
        <div className="col-lg-9">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading available donations...</p>
            </div>
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : filteredDonations.length > 0 ? (
            <div className="row">

              {filteredDonations.map((donation) => (
                <div
                  key={donation._id}
                  className="col-md-6 col-xl-4 mb-4"
                >
                  <div className="card border-0 shadow-sm h-100 position-relative">
                    <div className="card-body">
                      <h5 className="card-title">
                        {donation.donor?.name || 'Restaurant'}
                      </h5>

                      <p className="card-text mb-2">
                        <strong>Food Items:</strong> {donation.foodItems}
                      </p>

                      <p className="mb-2">
                        <span
                          className={`badge bg-${getFoodTypeBadgeColor(
                            donation.foodType
                          )} me-2`}
                        >
                          {donation.foodType}
                        </span>
                      </p>

                      <div className="d-flex justify-content-between mb-2">
                        <span>
                          <i className="fas fa-weight me-1"></i>
                          {donation.quantity} {donation.quantityUnit || 'kg'}
                        </span>
                        <span>
                          <i className="fas fa-map-marker-alt me-1"></i>
                          {donation.location}
                        </span>
                      </div>

                      <div className="d-flex justify-content-between mb-3">
                        <span className="text-success">
                          <i className="fas fa-calendar me-1"></i>
                          Pickup:{' '}
                          {donation.pickupDate
                            ? new Date(donation.pickupDate).toLocaleDateString()
                            : 'Not specified'}
                        </span>
                      </div>

                      <p className="mb-2">
                        <small>
                          <i className="fas fa-hourglass-half me-1"></i>
                          Pickup window: {donation.pickupStartTime} -{' '}
                          {donation.pickupEndTime}
                        </small>
                      </p>

                      {donation.allergenInfo && (
                        <p className="small text-muted mb-2">
                          <strong>Allergens:</strong> {donation.allergenInfo}
                        </p>
                      )}

                      {donation.dietaryInfo && (
                        <p className="small text-muted mb-2">
                          <strong>Dietary:</strong> {donation.dietaryInfo}
                        </p>
                      )}

                      {donation.additionalInfo && (
                        <p className="small text-muted mb-3">
                          <i className="fas fa-info-circle me-1"></i>
                          {donation.additionalInfo}
                        </p>
                      )}

                      <div className="d-grid gap-2">
                        <Link
                          to={`/donation/${donation._id}`}
                          className="btn btn-outline-primary"
                        >
                          View Details
                        </Link>
                        <button className="btn btn-primary">
                          Request Pickup
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

            </div>
          ) : (
            <div className="text-center py-5">
              <div className="mb-4">
                <i className="fas fa-search fa-3x text-muted"></i>
              </div>
              <h4>No Donations Found</h4>
              <p className="text-muted mb-4">
                {searchQuery
                  ? `No donations match your search "${searchQuery}"`
                  : filters.foodType
                    ? "No donations match your selected filters"
                    : "No donations are currently available"
                }
              </p>
              {(searchQuery || filters.foodType) && (
                <button
                  className="btn btn-outline-primary"
                  onClick={resetFilters}
                >
                  <i className="fas fa-redo me-2"></i>
                  Reset All Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewDonations; 