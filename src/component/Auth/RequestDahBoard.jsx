import React, { useEffect, useState } from "react";
import ApiClient from "../ApiClient";
import { useNavigate } from "react-router-dom";

const BASE_URL_API = `${import.meta.env.VITE_BASE_URL}/evidence`;

const RequestDashboard = () => {
  const { getRequestApiwithLogin, putRequestApiwithLogin } = ApiClient();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modeFilter, setModeFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [completionComment, setCompletionComment] = useState("");
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await getRequestApiwithLogin("request/request-list");
      if (response.status) {
        setData(response.data);
      }
    } catch (error) {
      console.error("Error loading requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Improved status badge with proper colors
  const getStatusBadge = (status) => {
    switch (status) {
      case 1:
        return <span className="badge bg-info text-white">SUBMITTED</span>;
      case 2:
        return <span className="badge bg-warning text-dark">UNDER PROCESS</span>;
      case 3:
        return <span className="badge bg-warning text-dark">UNDER PROCESS</span>;
      case 4:
        return <span className="badge bg-danger text-white">REJECTED</span>;
      case 5:
        return <span className="badge bg-warning text-dark">UNDER PROCESS</span>;
      case 6:
        return <span className="badge bg-success text-white">COMPLIANCE DONE</span>;
      case 7:
        return <span className="badge bg-warning text-dark">UNDER PROCESS</span>;
      case 8:
        return <span className="badge bg-danger text-white">MORE CLARIFICATION REQUIRED</span>;
      case 9:
        return <span className="badge bg-primary text-white">INFORMATION SENT</span>;
      case 10:
        return <span className="badge bg-success text-white">RESOLVED</span>;
      default:
        return <span className="badge bg-secondary text-white">UNDER PROCESS</span>;
    }
  };

  const getModeBadge = (mode) => {
    switch (mode) {
      case "single":
        return <span className="badge bg-info text-white">Manually Url Entered</span>;
      case "bulk":
        return <span className="badge bg-primary text-white">Bulk URLs</span>;
      default:
        return <span className="badge bg-secondary text-white">Unknown</span>;
    }
  };

  // Separate admin comments from user comments
  const getCommentsByType = (comments, currentStatus) => {
    if (!comments || !Array.isArray(comments)) {
      return { adminComments: [], userComments: [] };
    }

    // Statuses that represent user actions
    const userStatuses = [6, 9, 10];

    const adminComments = comments.filter(comment => !userStatuses.includes(comment.status));
    const userComments = comments.filter(comment => userStatuses.includes(comment.status));

    return { adminComments, userComments };
  };

  // Handle edit for status 8
  const handleEditRequest = (requestId) => {
    navigate(`/request/${requestId}`);
  };

  // Handle compliance done (status 10)
  const handleComplianceDone = async () => {
    if (!completionComment.trim()) {
      alert("Please provide compliance completion comments");
      return;
    }

    setSubmitting(true);
    try {
      const response = await putRequestApiwithLogin(`request/update-status/${selectedRequest.id}`, {
        status: 10,
        comment: completionComment
      });

      if (response.status) {
        alert("Compliance completed successfully!");
        setShowCompletionModal(false);
        setCompletionComment("");
        setSelectedRequest(null);
        loadData(); // Refresh the list
      } else {
        alert("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const openCompletionModal = (request) => {
    setSelectedRequest(request);
    setShowCompletionModal(true);
  };

  const renderUrls = (urlsData) => {
    if (!urlsData) {
      return <small className="text-muted">No URLs provided</small>;
    }

    try {
      const urls = typeof urlsData === "string" ? JSON.parse(urlsData) : urlsData;

      if (!Array.isArray(urls) || urls.length === 0) {
        return <small className="text-muted">No URLs available</small>;
      }

      return urls.map((url, index) => (
        <small key={index} className="d-block mb-1">
          <strong>URL {index + 1}:</strong>{" "}
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-break text-primary">
            {url}
          </a>
        </small>
      ));
    } catch (error) {
      console.error("Error parsing URLs:", error);
      return <small className="text-danger">Invalid URL format</small>;
    }
  };

  const FileItem = ({ file, label }) => {
    return file ? (
      <a
        href={`${BASE_URL_API}/${file}`}
        target="_blank"
        rel="noopener noreferrer"
        className="d-flex align-items-center gap-2 px-3 py-2 border rounded text-decoration-none text-primary bg-light hover-shadow"
      >
        <i className="bi bi-download"></i>
        <span className="small fw-medium">{label}</span>
      </a>
    ) : (
      <div className="d-flex align-items-center gap-2 px-3 py-2 border rounded bg-light text-muted">
        <i className="bi bi-file-earmark-x"></i>
        <span className="small">{label}</span>
      </div>
    );
  };

  // Filter data
  const filteredData = data.filter((item) => {
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch =
      (item.urls && item.urls.toLowerCase().includes(searchTermLower)) ||
      (item.description && item.description.toLowerCase().includes(searchTermLower)) ||
      (item.id && item.id.toString().includes(searchTermLower)) ||
      (item.producer_id && item.producer_id.toString().includes(searchTermLower));

    const matchesStatus = statusFilter === "all" || item.status.toString() === statusFilter;
    const matchesMode = modeFilter === "all" || item.mode === modeFilter;

    return matchesSearch && matchesStatus && matchesMode;
  });

  return (
    <>
      <div className="complaint-form">
        <div className="headeing">
          <h4 className="mb-0">My Complaint</h4>
        </div>
        <div className="details">
          {/* Filters */}
          <div className="searching">
            <div className="row">
              <div className="col-md-5">
                <div className="input-group">
                  <span className="blue-bg">
                    <i className="bi bi-search text-primary"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    placeholder="Search by URL, description, ID or Producer ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-3">
                <select
                  className="form-select form-select-lg bg-white"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="1">Submitted</option>
                  <option value="2,3,5,7">Under Process</option>
                  <option value="4">Rejected</option>
                  <option value="6">Compliance Done</option>
                  <option value="8">More Clarification Required</option>
                  <option value="9">Information Sent</option>
                  <option value="10">Resolved</option>
                </select>
              </div>
              <div className="col-md-4">
                <select
                  className="form-select form-select-lg bg-white"
                  value={modeFilter}
                  onChange={(e) => setModeFilter(e.target.value)}
                >
                  <option value="all">All Modes</option>
                  <option value="single">Manually Url(s) Entered</option>
                  <option value="bulk">Bulk URLs</option>
                </select>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" style={{ width: "3rem", height: "3rem" }} role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading requests...</p>
            </div>
          )}

          {/* No Data State */}
          {!loading && filteredData.length === 0 && (
            <div className="text-center py-5 bg-light rounded">
              <p className="col-md-4 mx-auto">
                <img src="/no-request-found.jpg" className="img-fluid" alt="No requests" />
              </p>
              <h5 className="mt-3">No requests found</h5>
              {(searchTerm || statusFilter !== "all" || modeFilter !== "all") && (
                <button
                  className="btn btn-outline-secondary mt-2"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                    setModeFilter("all");
                  }}
                >
                  <i className="bi bi-x-circle me-2"></i>
                  Clear Filters
                </button>
              )}
            </div>
          )}

          {/* Summary Cards */}
          {!loading && filteredData.length > 0 && (
            <div className="summary-cards-container">
              {filteredData.map((item) => {
                const { adminComments, userComments } = getCommentsByType(item.comments, item.status);

                return (
                  <div className="card mt-2 mb-2" key={item.id}>
                    {/* Card Header */}
                    <div className="card-header">
                      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                        <span className="form-label fw-bold m-0">
                          Request ID : NZ-{item.id}
                        </span>
                        <div className="d-flex gap-2 align-items-center flex-wrap">
                          {getStatusBadge(item.status)}
                          {getModeBadge(item.mode)}
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="card-body">
                      <h5 className="card-title mb-3">{item.title || "Untitled"}</h5>
                      <div className="d-flex align-items-center mb-3">
                        <i className="bi bi-calendar3 text-primary me-2"></i>
                        <small className="text-muted">
                          Registered On: {formatDate(item.createdAt)}
                        </small>
                      </div>

                      {/* URLs Section */}
                      <div className="mb-2">
                        <h6 className="fw-bold">URLs</h6>
                        <div>{renderUrls(item.urls)}</div>
                      </div>

                      {/* Description Section */}
                      <div className="mb-3">
                        <h6 className="fw-bold">Description</h6>
                        <div>{item.description || "No description available"}</div>
                      </div>

                      {/* Admin Comments Section */}
                      {adminComments.length > 0 && (
                        <div className="mb-3">
                          <h6 className="fw-bold text-danger">Administrator Comments</h6>
                          <div className="bg-light p-3 rounded">
                            {adminComments.map((comment, idx) => (
                              <div key={idx} className="mb-2 pb-2 border-bottom">
                                <div className="d-flex justify-content-between">
                                  <strong className="text-danger">Status: {getStatusText(comment.status)}</strong>
                                  <small className="text-muted">{formatDate(comment.createdAt)}</small>
                                </div>
                                <p className="mb-0 mt-1">{comment.comment}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* User Comments Section (Status 6, 9, 10) */}
                      {userComments.length > 0 && (
                        <div className="mb-3">
                          <h6 className="fw-bold text-success">Your Activity</h6>
                          <div className="bg-light p-3 rounded">
                            {userComments.map((comment, idx) => (
                              <div key={idx} className="mb-2 pb-2 border-bottom">
                                <div className="d-flex justify-content-between">
                                  <strong className="text-success">{getStatusText(comment.status)}</strong>
                                  <small className="text-muted">{formatDate(comment.createdAt)}</small>
                                </div>
                                <p className="mb-0 mt-1">{comment.comment}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Files Section */}
                      <div className="d-flex flex-wrap gap-3 mt-3">
                        {item.mode === "bulk" && item.csv_file && (
                          <FileItem file={item.csv_file} label="CSV File" />
                        )}
                        <FileItem file={item.court_order} label={item.court_order ? "Court Order" : "No Court Order"} />
                        <FileItem file={item.evidence} label={item.evidence ? "Evidence File" : "No Evidence"} />
                      </div>

                      {/* Action Buttons */}
                      <div className="d-flex gap-2 mt-3">
                        {/* Edit button for status 8 */}
                        {item.status === 8 && (
                          <button
                            className="btn btn-warning btn-sm"
                            onClick={() => handleEditRequest(item.unique_id)}
                          >
                            <i className="bi bi-pencil me-1"></i>
                            Edit & Resubmit
                          </button>
                        )}

                        {/* Compliance Done button for status 10 */}
                        {item.status === 10 && (
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => openCompletionModal(item)}
                          >
                            <i className="bi bi-check2-circle me-1"></i>
                            Compliance Done
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Compliance Done Modal for Status 10 */}
      {showCompletionModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Compliance Completion</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowCompletionModal(false);
                    setCompletionComment("");
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <p>Request ID: <strong>NZ-{selectedRequest?.id}</strong></p>
                <div className="alert alert-info">
                  <i className="bi bi-info-circle me-2"></i>
                  Please provide compliance completion details below.
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Compliance Comments <span className="text-danger">*</span></label>
                  <textarea
                    className="form-control"
                    rows="5"
                    value={completionComment}
                    onChange={(e) => setCompletionComment(e.target.value)}
                    placeholder="Please provide detailed compliance completion comments..."
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowCompletionModal(false);
                    setCompletionComment("");
                  }}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={handleComplianceDone}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1"></span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-lg me-1"></i>
                      Submit Compliance
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Helper function to get status text
const getStatusText = (status) => {
  switch (status) {
    case 1: return "Submitted";
    case 2: return "Under Process";
    case 3: return "Under Process";
    case 4: return "Rejected";
    case 5: return "Under Process";
    case 6: return "Compliance Done";
    case 7: return "Under Process";
    case 8: return "More Clarification Required";
    case 9: return "Information Sent";
    case 10: return "Resolved";
    default: return "Unknown Status";
  }
};

export default RequestDashboard;