import React, { useEffect, useState } from "react";
import ApiClient from "../ApiClient";
import { useNavigate } from "react-router-dom";

const BASE_URL_API = `${import.meta.env.VITE_BASE_URL}/evidence`;

const RequestDashboard = () => {
  const { getRequestApiwithLogin } = ApiClient();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modeFilter, setModeFilter] = useState("all"); // New mode filter
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

  // Format date
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

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 1:
        return <span className="badge bg-warning text-dark">Pending</span>;
      case 2:
        return <span className="badge bg-success">Approved</span>;
      case 3:
        return <span className="badge bg-danger">Rejected</span>;
      default:
        return <span className="badge bg-secondary">Unknown</span>;
    }
  };

  // Get mode badge
  const getModeBadge = (mode) => {
    switch (mode) {
      case "single":
        return (
          <span className="badge bg-info text-dark">Manually Url Entered</span>
        );
      case "bulk":
        return <span className="badge bg-purple text-white">Bulk URLs</span>;
      default:
        return <span className="badge bg-secondary">Unknown</span>;
    }
  };

  // Filter data based on search, status, and mode
  const filteredData = data.filter((item) => {
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch =
      (item.urls && item.urls.toLowerCase().includes(searchTermLower)) ||
      (item.description &&
        item.description.toLowerCase().includes(searchTermLower)) ||
      (item.id && item.id.toString().includes(searchTermLower)) ||
      (item.producer_id &&
        item.producer_id.toString().includes(searchTermLower));

    const matchesStatus =
      statusFilter === "all" || item.status.toString() === statusFilter;
    const matchesMode = modeFilter === "all" || item.mode === modeFilter;

    return matchesSearch && matchesStatus && matchesMode;
  });

  // Parse URLs from CSV if needed (you might want to fetch this from an API)
  const [csvUrls, setCsvUrls] = useState({});

  const viewCsvContent = async (item) => {
    try {
      const urls = JSON.parse(item.urls);

      setCsvUrls((prev) => ({
        ...prev,
        [item.id]: urls,
      }));
    } catch (error) {
      console.error("Error loading CSV:", error);
    }
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="card p-0 ">
          <div className="card-header">
            <div className="btn-header">
              <h4 className="mb-0">
                <i className="bi bi-card-list me-2"></i>
                Dashboard
              </h4>
              <button
                className="btn btn-outlnie-primary white-border btn-sm"
                onClick={() => navigate("/request/create")}
              >
                <i className="bi bi-file-earmark-plus me-2"></i>
                Register New Complaint
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="row m-2">
            <div className="col-md-5 ">
              <div className="input-group">
                <span className="input-group-text bg-white">
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
                <option value="all">All Status</option>
                <option value="1">Pending</option>
                <option value="2">Approved</option>
                <option value="3">Rejected</option>
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

          {/* Loading State */}
          {loading && (
            <div className="text-center py-5">
              <div
                className="spinner-border text-primary"
                style={{ width: "3rem", height: "3rem" }}
                role="status"
              >
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 ">Loading requests...</p>
            </div>
          )}

          {/* No Data State */}
          {!loading && filteredData.length === 0 && (
            <div className="text-center py-5 bg-light rounded">
              {/* <i className="bi bi-inbox fs-1 "></i> */}
              <p className="col-md-4 mx-auto">
                <img src="/no-request-found.jpg" className="img-fluid" />
              </p>
              <h5 className="mt-3 ">No requests found</h5>
              {(searchTerm ||
                statusFilter !== "all" ||
                modeFilter !== "all") && (
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
            <>
              {/* Status Summary Pills */}
              {/* <div className="d-flex gap-2 mb-4 flex-wrap">
                                <div className="bg-light px-3 py-2 rounded-pill">
                                    <span className="fw-bold">Total:</span> {data.length}
                                </div>
                                <div className="bg-warning bg-opacity-10 px-3 py-2 rounded-pill">
                                    <span className="fw-bold">Pending:</span> {data.filter(item => item.status === 1).length}
                                </div>
                                <div className="bg-success bg-opacity-10 px-3 py-2 rounded-pill">
                                    <span className="fw-bold">Approved:</span> {data.filter(item => item.status === 2).length}
                                </div>
                                <div className="bg-danger bg-opacity-10 px-3 py-2 rounded-pill">
                                    <span className="fw-bold">Rejected:</span> {data.filter(item => item.status === 3).length}
                                </div>
                                <div className="bg-info bg-opacity-10 px-3 py-2 rounded-pill">
                                    <span className="fw-bold">Single URL:</span> {data.filter(item => item.mode === 'single').length}
                                </div>
                                <div className="bg-purple bg-opacity-10 px-3 py-2 rounded-pill">
                                    <span className="fw-bold">Bulk URLs:</span> {data.filter(item => item.mode === 'bulk').length}
                                </div>
                            </div> */}

              {/* Cards */}
              <div className=" g-4">
                {filteredData.map((item) => (
                  <div className="col-12" key={item.id}>
                    <div className="border-box">
                      <div className="card-body">
                        <div className="row">
                          {/* Left Column - URL/File Info */}
                          <div className="col-md-12 mb-3 mb-md-0">
                            <div className="" style={{ minHeight: "auto" }}>
                              <div className="d-flex top-header-box top-div">
                                <span className="form-label m-0">
                                  Request ID: #{item.id}
                                </span>
                                <div className="d-flex status-end ">
                                  {getStatusBadge(item.status)}
                                  {getModeBadge(item.mode)}
                                </div>
                              </div>
                              <div className="d-flex align-items-center gap-2 mb-2">
                                <h4 className="mb-3">Title: {item.title}</h4>
                              </div>

                              <div className="urls-div">
                                {/* <div className="d-flex align-items-center gap-2 mb-2">
                                                                        <i className="bi bi-link-45deg fs-4 text-primary"></i>
                                                                        <h6 className="mb-0">URL Input Method :  URL(s) Entered Manually </h6>
                                                                    </div> */}
                                {item.urls &&
                                  (() => {
                                    try {
                                      const urls =
                                        typeof item.urls === "string"
                                          ? JSON.parse(item.urls)
                                          : item.urls;

                                      return (
                                        Array.isArray(urls) &&
                                        urls.map((value, index) => (
                                          <small
                                            key={index}
                                            className=" d-block black-txt"
                                          >
                                            <strong>URL {index + 1}:</strong>{" "}
                                            <a href={value} target="_blank">
                                              {value}
                                            </a>
                                          </small>
                                        ))
                                      );
                                    } catch (error) {
                                      console.error(
                                        "Error parsing URLs:",
                                        error,
                                      );
                                      return null;
                                    }
                                  })()}
                              </div>
                            </div>
                          </div>

                          {/* Middle - Description and Details */}
                          <div className="col-md-12">
                            <div className="d-flex align-items-start gap-2 mb-2 flex-wrap">
                              <h6 className="mb-0">Description</h6>
                            </div>

                            <p className=" mb-3">{item.description}</p>

                            <div className="d-flex flex-column gap-2">
                              <div className="d-flex align-items-center">
                                <i className="bi bi-calendar3 text-primary me-2"></i>
                                <small className="">
                                  Registered On: {formatDate(item.createdAt)}
                                </small>
                              </div>

                              {/* <div className="d-flex align-items-center">
                                                                <i className="bi bi-person text-primary me-2"></i>
                                                                <small className="">
                                                                    Producer ID: {item.producer_id}
                                                                </small>
                                                            </div> */}
                              {item.approved_comment && (
                                <div className="d-flex align-items-start">
                                  <i className="bi bi-check-circle text-success me-2"></i>
                                  <small className="">
                                    Approved: {item.approved_comment}
                                  </small>
                                </div>
                              )}
                              {item.rejected_comment && (
                                <div className="d-flex align-items-start">
                                  <i className="bi bi-x-circle text-danger me-2"></i>
                                  <small className="">
                                    Rejected: {item.rejected_comment}
                                  </small>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Right side - Files Download */}
                          <div className="col-md-12">
                            <div className="">
                              {/* <h6 className="mb-3 mt-3">
                                                                <i className="bi bi-file-earmark-text me-2"></i>
                                                                Files
                                                            </h6> */}

                              {/* Evidence File */}
                              {item.evidence ? (
                                <div className="mb-3 status-end">
                                  {/* <div className="bg-white rounded p-2 mb-2">
                                                                        <small className=" d-block text-truncate">
                                                                            {item.evidence}
                                                                        </small>
                                                                    </div> */}
                                  {item.mode === "bulk" && item.csv_file && (
                                    <a
                                      href={`${BASE_URL_API}/${item.csv_file}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="btn btn-primary btn-sm"
                                    >
                                      {/* <div className="bg-white rounded p-2 mb-2">
                                                                        <small className=" d-block text-truncate">
                                                                            {item.csv_file}
                                                                        </small>
                                                                    </div> */}
                                      <i className="bi bi-file-earmark-spreadsheet me-2"></i>
                                      Download CSV
                                    </a>
                                  )}
                                  <a
                                    href={`${BASE_URL_API}/${item.evidence}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-primary btn-sm "
                                  >
                                    <i className="bi bi-download me-2"></i>
                                    Download Evidence
                                  </a>
                                </div>
                              ) : (
                                <div className="text-center py-2 mb-3">
                                  <i className="bi bi-file-earmark-x "></i>
                                  <p className=" small">No evidence</p>
                                </div>
                              )}

                              {/* CSV File for Bulk Mode */}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
                .hover-shadow {
                    transition: all 0.3s ease;
                }
                .hover-shadow:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 .5rem 1rem rgba(0,0,0,.15)!important;
                }
                .transition {
                    transition: all 0.3s ease;
                }
                .bg-purple {
                    background-color: #6f42c1 !important;
                }
                .bg-purple.bg-opacity-10 {
                    background-color: rgba(111, 66, 193, 0.1) !important;
                }
                .text-purple {
                    color: #6f42c1 !important;
                }
            `}</style>
    </div>
  );
};

export default RequestDashboard;
