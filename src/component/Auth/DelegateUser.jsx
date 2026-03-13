import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import ApiClient from '../ApiClient';
const BASE_URL_API = `${import.meta.env.VITE_BASE_URL}/`;

const DelegateUser = () => {
  const navigate = useNavigate();
  const userData = useSelector((state) => state.user);
  console.log({ userData })
  const { getRequestApi } = ApiClient();

  const [loading, setLoading] = useState(true);
  const [accredationDetails, setAccredationDetails] = useState(null);
  const [delegateDetails, setDelegateDetails] = useState(null);
  const [delegateDocuments, setDelegateDocuments] = useState([]);
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

      if (details) {
        const event_edition_form = details.event_edition_form;

        if (details.status === 1) {
          if (event_edition_form?.type === 2) {
            navigate("/delegate-form");
          } else {
            navigate("/delegate-registration");
          }
        } else if (details.status === 2) {
          if (event_edition_form?.type === 2) {
            navigate("/profile-delegate");
          } else {
            // Set delegate details from details.details (which contains the form data)
            setDelegateDetails(details.details);
            setAccredationDetails(delegate_accredation);
            setDelegateDocuments(data?.delegate_document || []);

            // Load location data after setting delegate details
            if (details.details) {
              loadLocationData(details.details);
            } else if (delegate) {
              loadLocationData(delegate);
            }

            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [userData, navigate]);

  const loadLocationData = async (details) => {
    try {
      // Load countries if needed for display
      const countriesRes = await getRequestApi("delegate/country");
      if (countriesRes.status) {
        setCountries(countriesRes.data || []);
      }

      // Load state if country exists
      if (details?.country) {
        const statesRes = await getRequestApi(`delegate/state/${details.country}`);
        if (statesRes.status) {
          setStates(statesRes.data || []);
        }
      }

      // Load city if state exists
      if (details?.state) {
        const citiesRes = await getRequestApi(`delegate/city/${details.state}`);
        if (citiesRes.status) {
          setCities(citiesRes.data || []);
        }
      }
    } catch (error) {
      console.error('Error loading location data:', error);
    }
  };

  const getCountryName = (countryId) => {
    if (!countryId || countryId === 0) return 'N/A';
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getFileIcon = (fileName) => {
    const ext = fileName?.split('.').pop().toLowerCase();
    if (ext === 'pdf') return 'bi-file-pdf text-danger';
    if (ext === 'doc' || ext === 'docx') return 'bi-file-word text-primary';
    if (ext === 'jpg' || ext === 'jpeg' || ext === 'png' || ext === 'gif') return 'bi-file-image text-success';
    return 'bi-file-text text-secondary';
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
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card bg-primary text-white border-0">
            <div className="card-body py-4">
              <img className=" img-fluid rounded" style={{ width: "50px" }} src={`${BASE_URL_API}userfile/image/${userData?.data?.delegate?.profile_photo}`} />

              <div className="d-flex align-items-center justify-content-between">

                <div className="d-flex align-items-center">

                  <div className="flex-shrink-0">

                    <i className="bi bi-person-badge fs-1"></i>

                  </div>
                  <div className="flex-grow-1 ms-3">
                    <h2 className="display-6 fw-bold text-white mb-3">Delegate Profile</h2>
                    <p className="text-white mb-0">View your registered details</p>
                  </div>
                </div>
                <div className="text-end">
                  <span className="badge bg-warning text-dark px-3 py-2 fs-6">
                    <i className="bi bi-clock-history me-2"></i>
                    {accredationDetails?.status ?? "NA"}
                  </span>
                </div>
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
                      <td>{delegateDetails.first_name || 'N/A'} {delegateDetails.last_name || ''}</td>
                    </tr>
                    <tr>
                      <td className="fw-bold">Email:</td>
                      <td>
                        {delegateDetails.email ? (
                          <a href={`mailto:${delegateDetails.email}`} className="text-decoration-none">
                            {delegateDetails.email}
                          </a>
                        ) : 'N/A'}
                      </td>
                    </tr>
                    <tr>
                      <td className="fw-bold">Phone:</td>
                      <td>
                        {delegateDetails.phone ? (
                          <a href={`tel:${delegateDetails.phone}`} className="text-decoration-none">
                            {delegateDetails.phone}
                          </a>
                        ) : 'N/A'}
                      </td>
                    </tr>
                    {delegateDetails.mobile && (
                      <tr>
                        <td className="fw-bold">Mobile:</td>
                        <td>
                          <a href={`tel:${delegateDetails.mobile}`} className="text-decoration-none">
                            {delegateDetails.mobile}
                          </a>
                        </td>
                      </tr>
                    )}
                    <tr>
                      <td className="fw-bold">Gender:</td>
                      <td className="text-capitalize">{delegateDetails.gender || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td className="fw-bold">Date of Birth:</td>
                      <td>{formatDate(delegateDetails.dob)}</td>
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
                      <td className="fw-bold" style={{ width: '160px' }}>Applied For:</td>
                      <td>{delegateDetails.professionType || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td className="fw-bold">Job Title:</td>
                      <td>{delegateDetails.jobTitle || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td className="fw-bold">Company:</td>
                      <td>{delegateDetails.company || 'N/A'}</td>
                    </tr>
                    {delegateDetails.company_name && (
                      <tr>
                        <td className="fw-bold">Company Name:</td>
                        <td>{delegateDetails.company_name}</td>
                      </tr>
                    )}
                    {delegateDetails.department && (
                      <tr>
                        <td className="fw-bold">Department:</td>
                        <td>{delegateDetails.department}</td>
                      </tr>
                    )}
                    <tr>
                      <td className="fw-bold">Industry:</td>
                      <td>{delegateDetails.industry || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td className="fw-bold">Experience:</td>
                      <td>{delegateDetails.yearsOfExperience || 'N/A'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Education Details Section */}
        <div className="col-lg-6 mb-4">
          <div className="card h-100 shadow-sm">
            <div className="card-header bg-light">
              <h5 className="mb-0">
                <i className="bi bi-mortarboard me-2 text-primary"></i>
                Education Details
              </h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-borderless">
                  <tbody>
                    <tr>
                      <td className="fw-bold" style={{ width: '160px' }}>Education Level:</td>
                      <td>{delegateDetails.educationLevel || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td className="fw-bold">University:</td>
                      <td>{delegateDetails.university || 'N/A'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information Section */}
        {(delegateDetails.notes || delegateDetails.company_name || delegateDetails.department) && (
          <div className="col-12 mb-4">
            <div className="card shadow-sm">
              <div className="card-header bg-light">
                <h5 className="mb-0">
                  <i className="bi bi-info-circle me-2 text-primary"></i>
                  Additional Information
                </h5>
              </div>
              <div className="card-body">
                {delegateDetails.notes && (
                  <div className="mb-0">
                    <strong>Notes:</strong>
                    <p className="mt-2 mb-0 bg-light p-3 rounded">{delegateDetails.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Documents Section */}
        {delegateDocuments.length > 0 && (
          <div className="col-12 mb-4">
            <div className="card shadow-sm">
              <div className="card-header bg-light">
                <h5 className="mb-0">
                  <i className="bi bi-file-earmark-text me-2 text-primary"></i>
                  Uploaded Documents
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  {delegateDocuments.map((doc) => (
                    <div key={doc.id} className="col-md-4 mb-3">
                      <div className="border rounded p-3 text-center h-100 d-flex flex-column">
                        <i className={`bi ${getFileIcon(doc.file_name)} fs-1 mb-2`}></i>
                        <h6 className="mt-2 fw-bold">{doc.field_value?.name || 'Document'}</h6>
                        <p className="small text-muted mb-2">{doc.file_name}</p>
                        <a
                          // href={doc.file_path}
                          href={`${BASE_URL_API}userfile/document/${doc?.file_path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-outline-primary mt-auto"
                        >
                          <i className="bi bi-eye me-1"></i> View Document
                        </a>
                      </div>
                    </div>
                  ))}
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
              onClick={() => navigate(-1)}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DelegateUser;