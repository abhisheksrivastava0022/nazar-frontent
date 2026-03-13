import { useSelector } from "react-redux";
import ApiClient from "../ApiClient";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const LocationIndex = () => {
    const websiteData = useSelector((state) => state.website.data);
    const { getRequestApi } = ApiClient();

    const event_manage = websiteData?.event_manage ?? {};
    const locations = event_manage?.location_details ?? [];

    // Helper function to get location attribute value
    const getLocationAttribute = (location, attributeName) => {
        const metaItem = location.post_meta?.find(
            (meta) => meta.attribute === attributeName
        );
        return metaItem?.attribute_value || null;
    };

    // Get unique cities and states for stats
    const uniqueCities = [...new Set(locations.map(l => getLocationAttribute(l, 'city')).filter(Boolean))];
    const uniqueStates = [...new Set(locations.map(l => getLocationAttribute(l, 'state')).filter(Boolean))];

    return (
        <>
            <div className=" py-5">
                <div className="container">
                    {/* Header Section */}
                    <div className="row justify-content-center text-center mb-5">
                        <div className="col-lg-8">
                            <h1 className="display-5 fw-bold mb-3 section-title" ><span>Film Festival</span> Locations</h1>
                            <p className="lead text-muted">
                                Discover our prestigious venues across India
                            </p>
                        </div>
                    </div>

                    {/* Locations Grid */}
                    {locations.length > 0 ? (
                        <>
                            <div className="row g-4">
                                {locations.map((location) => (
                                    <div
                                        key={location.id}
                                        className="col-12 col-md-6 col-lg-4"
                                    >
                                        <div className="card h-100 border-0 shadow-sm hover-shadow transition">
                                            {/* Location Image */}
                                            {getLocationAttribute(location, 'image') ? (
                                                <img
                                                    src={getLocationAttribute(location, 'image')}
                                                    className="card-img-top"
                                                    alt={location.title}
                                                    style={{
                                                        height: '220px',
                                                        objectFit: 'cover',
                                                        borderTopLeftRadius: 'calc(0.375rem - 1px)',
                                                        borderTopRightRadius: 'calc(0.375rem - 1px)'
                                                    }}
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = 'https://via.placeholder.com/400x220?text=Venue+Image';
                                                    }}
                                                />
                                            ) : (
                                                <div
                                                    className="bg-secondary bg-opacity-10 d-flex align-items-center justify-content-center"
                                                    style={{
                                                        height: '220px',
                                                        borderTopLeftRadius: 'calc(0.375rem - 1px)',
                                                        borderTopRightRadius: 'calc(0.375rem - 1px)'
                                                    }}
                                                >
                                                    <i className="bi bi-building fs-1 text-secondary"></i>
                                                </div>
                                            )}

                                            <div className="card-body">
                                                {/* Location Title */}
                                                <h4 className="card-title h5 mb-3">
                                                    {location.title}
                                                </h4>

                                                {/* Address */}
                                                {getLocationAttribute(location, 'address') && (
                                                    <div className="d-flex mb-3">
                                                        <i className="bi bi-geo-alt text-primary me-2"></i>
                                                        <p className="mb-0 text-muted small">
                                                            {getLocationAttribute(location, 'address')}
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Location Details Badges */}
                                                <div className="d-flex flex-wrap gap-2 mb-3">
                                                    {getLocationAttribute(location, 'city') && (
                                                        <span className="badge bg-light text-dark border">
                                                            <i className="bi bi-building me-1"></i>
                                                            {getLocationAttribute(location, 'city')}
                                                        </span>
                                                    )}
                                                    {getLocationAttribute(location, 'state') && (
                                                        <span className="badge bg-light text-dark border">
                                                            <i className="bi bi-pin-map me-1"></i>
                                                            {getLocationAttribute(location, 'state')}
                                                        </span>
                                                    )}
                                                    {getLocationAttribute(location, 'zip_code') && (
                                                        <span className="badge bg-light text-dark border">
                                                            <i className="bi bi-mailbox me-1"></i>
                                                            {getLocationAttribute(location, 'zip_code')}
                                                        </span>
                                                    )}
                                                    {getLocationAttribute(location, 'country') && (
                                                        <span className="badge bg-light text-dark border">
                                                            <i className="bi bi-flag me-1"></i>
                                                            {getLocationAttribute(location, 'country')}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Card Footer with Button */}
                                            <div className="card-footer bg-white border-0 pb-3 pt-0">
                                                <Link
                                                    to={`/location/${location.title.toLowerCase()}`}
                                                    className="btn btn-outline-primary w-100"
                                                >
                                                    View Details
                                                    <i className="bi bi-arrow-right ms-2"></i>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Statistics Section */}
                            {/* <div className="row g-4 mt-5 pt-4 border-top">
                                <div className="col-12">
                                   <h1 class="display-5 fw-bold mb-3 text-center section-title "><span>Venue</span> Statistics</h1>
                                </div>
                                <div className="col-md-4">
                                    <div className="text-center">
                                        <div className="display-4 fw-bold text-primary mb-2">
                                            {locations.length}
                                        </div>
                                        <p className="text-muted mb-0">Total Venues</p>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="text-center">
                                        <div className="display-4 fw-bold text-primary mb-2">
                                            {uniqueCities.length}
                                        </div>
                                        <p className="text-muted mb-0">Cities</p>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="text-center">
                                        <div className="display-4 fw-bold text-primary mb-2">
                                            {uniqueStates.length}
                                        </div>
                                        <p className="text-muted mb-0">States</p>
                                    </div>
                                </div>
                            </div> */}
                        </>
                    ) : (
                        /* Empty State */
                        <div className="row justify-content-center">
                            <div className="col-md-6 text-center py-5">
                                <div className="mb-4">
                                    <i className="bi bi-geo-alt text-secondary" style={{ fontSize: '4rem' }}></i>
                                </div>
                                <h4 className="h5 mb-3">No Locations Available</h4>
                                <p className="text-muted mb-0">
                                    We're currently updating our venue information. Please check back later.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Custom CSS for hover effect (optional - can be added in your main CSS file) */}
            <style>{`
                .hover-shadow {
                    transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
                }
                .hover-shadow:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
                }
                .transition {
                    transition: all 0.2s ease-in-out;
                }
            `}</style>
        </>
    );
};

export default LocationIndex;