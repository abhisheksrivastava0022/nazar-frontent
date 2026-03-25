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
        return <span className="badge  yellow-txt">Pending</span>;
      case 2:
        return <span className="badge green-txt">Approved</span>;
      case 3:
        return <span className="badge red-txt">Rejected</span>;
      default:
        return <span className="badge bg-secondary">Unknown</span>;
    }
  };

  // Get mode badge
  const getModeBadge = (mode) => {
    switch (mode) {
      case "single":
        return <span className="badge teal-txt ">Manually Url Entered</span>;
      case "bulk":
        return <span className="badge blue-txt">Bulk URLs</span>;
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

  // Helper function to render URLs
  const renderUrls = (urlsData) => {
    if (!urlsData) {
      return <small className="text-muted">No URLs provided</small>;
    }

    try {
      const urls =
        typeof urlsData === "string" ? JSON.parse(urlsData) : urlsData;

      if (!Array.isArray(urls) || urls.length === 0) {
        return <small className="text-muted">No URLs available</small>;
      }

      return urls.map((url, index) => (
        <small key={index} className="d-block mb-1">
          <strong>URL {index + 1}:</strong>{" "}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className=" text-break bule-txt"
          >
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
        style={{ minWidth: "180px" }}
      >
        <i className="bi bi-download"></i>
        <span className="small fw-medium">{label}</span>
      </a>
    ) : (
      <div
        className="d-flex align-items-center gap-2 px-3 py-2 border rounded bg-light text-muted"
        style={{ minWidth: "180px" }}
      >
        <i className="bi bi-file-earmark-x"></i>
        <span className="small">{label}</span>
      </div>
    );
  };

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
              <div className="col-md-5 ">
                <div className="input-group ">
                  <span className=" blue-bg">
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
            <div className="summary-cards-container">
              {filteredData.map((item) => (
                <div className="card mt-2 mb-2" key={item.id}>
                  {/* Card Header */}
                  <div className="card-header">
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="form-label fw-bold m-0">
                        Request ID: #{item.id}
                      </span>
                      <div className="d-flex gap-2">
                        {getStatusBadge(item.status)} |{getModeBadge(item.mode)}
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="card-body">
                    <h5 className="card-title mb-3">
                      {item.title || "Untitled"}
                    </h5>
                    <div className="d-flex align-items-center">
                      <i className="bi bi-calendar3 text-primary me-2"></i>
                      <small className="text-muted">
                        Registered On: {formatDate(item.createdAt)}
                      </small>
                    </div>
                    {/* URLs Accordion */}
                    <div
                      className="accordion1 mb-2"
                      id={`urls-accordion-${item.id}`}
                    >
                      <div className="accordion-item1">
                        <h2 className="accordion-header">URLs</h2>
                        <div>
                          <div>{renderUrls(item.urls)}</div>
                        </div>
                      </div>
                    </div>

                    {/* Description Accordion */}
                    <div className="accordion" id={`desc-accordion-${item.id}`}>
                      <div>
                        <h2 className="mt-2">Description</h2>

                        <div>
                          {item.description || "No description available"}
                        </div>
                      </div>
                    </div>

                    <div className="d-flex flex-wrap gap-3 mt-3">
                      {item.mode === "bulk" && item.csv_file && (
                        <FileItem file={item.csv_file} label="CSV File" />
                      )}

                      <FileItem
                        file={item.cbfc_certificate}
                        label={
                          item.cbfc_certificate
                            ? "CBFC Certificate"
                            : "No CBFC Certificate"
                        }
                      />

                      <FileItem
                        file={item.court_order}
                        label={
                          item.court_order ? "Court Order" : "No Court Order"
                        }
                      />

                      <FileItem
                        file={item.evidence}
                        label={item.evidence ? "Evidence File" : "No Evidence"}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default RequestDashboard;
