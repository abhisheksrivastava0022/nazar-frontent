import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import ApiClient from '../ApiClient';

const DelegateAdmin = () => {
  const navigate = useNavigate();
  const userData = useSelector((state) => state.user);
  const { getRequestApi } = ApiClient();

  const [loading, setLoading] = useState(false);
  const [accredationDetails, setAccredationDetails] = useState(null);
  const [delegateDetails, setDelegateDetails] = useState(null);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  useEffect(() => {
    if (userData?.data) {
      const data = userData.data;

      // Access the nested objects correctly
      const delegate = data.delegate;
      const delegate_accredation = data.delegate_accredation;
      const details = data.delegate_other_details;

      console.log('Delegate Data:', delegate);
      console.log('Accreditation Data:', delegate_accredation);
      console.log('Other Details:', details);

      if (details) {
        const event_edition_form = details.event_edition_form;

        if (details.status === 1) { // Use === for comparison
          if (event_edition_form?.type === 2) {
            navigate("/delegate-form");
          } else {
            navigate("/delegate-registration");
          }
        } else if (details.status === 2) {
          if (event_edition_form?.type === 2) {
            setDelegateDetails(delegate);
            setAccredationDetails(delegate_accredation);
            // Load location data after setting delegate details
            if (delegate) {
              loadLocationData(delegate);
            }
          } else {
            navigate("/profile");
          }
        }
      }
    }
  }, [userData, navigate]);

  const loadLocationData = async (details) => {
    if (!details) return;

    setLoading(true);
    try {
      // Load countries if needed for display
      const countriesRes = await getRequestApi("delegate/country");
      if (countriesRes.status) {
        setCountries(countriesRes.data || []);
      }

      // Load state if country exists
      if (details.country) {
        const statesRes = await getRequestApi(`delegate/state/${details.country}`);
        if (statesRes.status) {
          setStates(statesRes.data || []);
        }
      }

      // Load city if state exists
      if (details.state) {
        const citiesRes = await getRequestApi(`delegate/city/${details.state}`);
        if (citiesRes.status) {
          setCities(citiesRes.data || []);
        }
      }
    } catch (error) {
      console.error('Error loading location data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCountryName = (countryId) => {
    if (!countryId) return 'N/A';
    const country = countries.find(c => c.id === parseInt(countryId));
    return country ? country.name : 'N/A';
  };

  const getStateName = (stateId) => {
    if (!stateId) return 'N/A';
    const state = states.find(s => s.id === parseInt(stateId));
    return state ? state.name : 'N/A';
  };

  const getCityName = (cityId) => {
    if (!cityId) return 'N/A';
    const city = cities.find(c => c.id === parseInt(cityId));
    return city ? city.name : 'N/A';
  };

  const getStatusBadgeClass = (status) => {
    if (!status) return 'bg-secondary';

    switch (status.toString().toLowerCase()) {
      case 'confirmed':
      case '1':
        return 'bg-success';
      case 'pending':
      case '2':
        return 'bg-warning text-dark';
      case 'rejected':
      case '3':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };

  const getStatusText = (status) => {
    if (!status) return 'N/A';

    switch (status.toString().toLowerCase()) {
      case 'confirmed':
      case '1':
        return 'Confirmed';
      case 'pending':
      case '2':
        return 'Pending';
      case 'rejected':
      case '3':
        return 'Rejected';
      default:
        return status.toString();
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!delegateDetails) {
    return (
      <div className="container mt-5">
        <div className="alert alert-info text-center">
          <h5>No delegate details found</h5>
          <p className="mb-0">Please check if delegate data is available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4 mb-5">
      {/* Header with Status */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card bg-primary text-white border-0">
            <div className="card-body py-4">
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                  <div className="flex-shrink-0">
                    <i className="bi bi-person-badge fs-1"></i>
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <h2 className="mb-1 text-white">Delegate Profile</h2>
                    <p className="mb-0 opacity-75 text-white">Admin View - Delegate Information</p>
                  </div>
                </div>
                {accredationDetails && (
                  <div className="text-end">
                    <span className={`badge ${getStatusBadgeClass(accredationDetails.status)} px-3 py-2 fs-6`}>
                      {getStatusText(accredationDetails.status)}
                    </span>
                    <div className="mt-2">
                      <small className="opacity-75 text-white">Accreditation ID: {accredationDetails.id}</small>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Personal Details Section */}
        <div className="col-lg-6 mb-4">
          <div className="card h-100 shadow-sm">
            <div className="card-header bg-light">
              <h5 className="mb-0">
                <i className="bi bi-person-circle me-2 text-primary"></i>
                Personal Details
              </h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-borderless">
                  <tbody>
                    <tr>
                      <td className="fw-bold" style={{ width: '140px' }}>Full Name:</td>
                      <td>{delegateDetails.first_name} {delegateDetails.last_name}</td>
                    </tr>
                    <tr>
                      <td className="fw-bold">Email:</td>
                      <td>
                        <a href={`mailto:${delegateDetails.email}`} className="text-decoration-none">
                          {delegateDetails.email}
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td className="fw-bold">Mobile:</td>
                      <td>
                        {delegateDetails.mobile ? (
                          <a href={`tel:${delegateDetails.mobile}`} className="text-decoration-none">
                            {delegateDetails.mobile}
                          </a>
                        ) : 'N/A'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Address Details Section */}
        <div className="col-lg-6 mb-4">
          <div className="card h-100 shadow-sm">
            <div className="card-header bg-light">
              <h5 className="mb-0">
                <i className="bi bi-geo-alt me-2 text-primary"></i>
                Address Details
              </h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-borderless">
                  <tbody>
                    <tr>
                      <td className="fw-bold" style={{ width: '120px' }}>Address:</td>
                      <td>{delegateDetails.address || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td className="fw-bold">Country:</td>
                      <td>{getCountryName(delegateDetails.country)}</td>
                    </tr>
                    <tr>
                      <td className="fw-bold">State:</td>
                      <td>{getStateName(delegateDetails.state)}</td>
                    </tr>
                    <tr>
                      <td className="fw-bold">City:</td>
                      <td>{getCityName(delegateDetails.city)}</td>
                    </tr>
                    <tr>
                      <td className="fw-bold">Pin Code:</td>
                      <td>{delegateDetails.pin_code || 'N/A'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Professional Details Section */}
        <div className="col-lg-6 mb-4">
          <div className="card h-100 shadow-sm">
            <div className="card-header bg-light">
              <h5 className="mb-0">
                <i className="bi bi-briefcase me-2 text-primary"></i>
                Professional Details
              </h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-borderless">
                  <tbody>
                    <tr>
                      <td className="fw-bold" style={{ width: '160px' }}>Company Name:</td>
                      <td>{delegateDetails.company_name || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td className="fw-bold">Department:</td>
                      <td>{delegateDetails.department || 'N/A'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Accreditation Details Section */}
        {accredationDetails && (
          <div className="col-lg-6 mb-4">
            <div className="card h-100 shadow-sm">
              <div className="card-header bg-light">
                <h5 className="mb-0">
                  <i className="bi bi-card-checklist me-2 text-primary"></i>
                  Accreditation Details
                </h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-borderless">
                    <tbody>
                      <tr>
                        <td className="fw-bold" style={{ width: '160px' }}>Accreditation ID:</td>
                        <td>{accredationDetails.id}</td>
                      </tr>
                      <tr>
                        <td className="fw-bold">Status:</td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(accredationDetails.status)}`}>
                            {getStatusText(accredationDetails.status)}
                          </span>
                        </td>
                      </tr>
                      {accredationDetails.admin_access && (
                        <tr>
                          <td className="fw-bold">Admin Access:</td>
                          <td>{accredationDetails.admin_access}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Profile Photo Section */}
        {delegateDetails.profile_photo && (
          <div className="col-12 mb-4">
            <div className="card shadow-sm">
              <div className="card-header bg-light">
                <h5 className="mb-0">
                  <i className="bi bi-image me-2 text-primary"></i>
                  Profile Photo
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-4">
                    <div className="border rounded p-3 text-center">
                      <img
                        src={delegateDetails.profile_photo}
                        alt="Profile"
                        className="img-fluid rounded"
                        style={{ maxHeight: '200px' }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/200?text=No+Image';
                        }}
                      />
                      <div className="mt-3">
                        <a
                          href={delegateDetails.profile_photo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-outline-primary"
                        >
                          <i className="bi bi-download me-1"></i> View Full Size
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="row mt-3">
        <div className="col-12">
          <div className="d-flex justify-content-between">
            <button
              className="btn btn-outline-secondary"
              onClick={() => window.print()}
            >
              <i className="bi bi-printer me-2"></i>
              Print Profile
            </button>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/admin/delegates')}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Back to Delegates List
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DelegateAdmin;