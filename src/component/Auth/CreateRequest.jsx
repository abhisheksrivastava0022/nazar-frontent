import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ApiClient from "../ApiClient";
import { useSelector } from "react-redux";

const BASE_URL_API = `${import.meta.env.VITE_BASE_URL}/evidence/`;

const CreateRequest = () => {
  const { id } = useParams();
  const { postFormDataApiwithLogin, getRequestApiwithLogin } = ApiClient();
  const [bulkUrls, setBulkUrls] = useState([]);
  const [existingData, setExistingData] = useState(null);

  useEffect(() => {
    if (id) {
      loadDataComplaint();
    }
  }, [id]);

  const loadDataComplaint = async () => {
    const response = await getRequestApiwithLogin(`request/complaint/${id}`);
    if (response.data) {
      setExistingData(response.data);
      setFormData({
        description: response.data.description || "",
        title: response.data.title || "",
        declaration: true,
      });

      // Set URLs
      if (response.data.urls && Array.isArray(response.data.urls)) {
        setUrlafterokay(response.data.urls);
      }

      // Set mode based on existing data
      if (response.data.mode) {
        setMode(response.data.mode);
      }

      // Set file names for display
      if (response.data.evidence) {
        setEvidenceFileName(response.data.evidence);
        setHasExistingEvidence(true);
      }
      if (response.data.court_order) {
        setCourOrderFileName(response.data.court_order);
        setHasExistingCourtOrder(true);
      }
    }
  };

  const navigate = useNavigate();

  const [mode, setMode] = useState("single");
  const [urlafterokay, setUrlafterokay] = useState([]);
  const [hasExistingEvidence, setHasExistingEvidence] = useState(false);
  const [hasExistingCourtOrder, setHasExistingCourtOrder] = useState(false);

  const [formData, setFormData] = useState({
    url: "",
    description: "",
    court_order: null,
    uploaded_evidence: null,
    declaration: false,
    title: "",
  });

  const filmData = useSelector((state) => state.filmData.film);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [evidenceFileName, setEvidenceFileName] = useState("");
  const [courOrderFileName, setCourOrderFileName] = useState("");
  const [isValidUrl, setIsValidUrl] = useState(false);
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkFileName, setBulkFileName] = useState("");
  const [showUrlBox, setShowUrlBox] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  // URL validation for single mode
  const validateUrlBulk = (url) => {
    url = url?.trim();

    if (!url) {
      return false;
    }

    if (!/^https?:\/\//i.test(url)) {
      url = "https://" + url;
    }

    try {
      const parsed = new URL(url);
      const hostname = parsed.hostname;
      const domainRegex = /^(?!\d+$)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;

      if (!domainRegex.test(hostname)) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    if (mode === "single") {
      const validateUrl = () => {
        let url = formData.url?.trim();

        if (!url) {
          setIsValidUrl(false);
          return;
        }

        if (!/^https?:\/\//i.test(url)) {
          url = "https://" + url;
        }

        try {
          const parsed = new URL(url);
          const hostname = parsed.hostname;
          const domainRegex = /^(?!\d+$)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;

          if (!domainRegex.test(hostname)) {
            setIsValidUrl(false);
            return;
          }

          setIsValidUrl(true);
        } catch {
          setIsValidUrl(false);
        }
      };

      validateUrl();
    }
  }, [formData.url, mode]);

  const downloadBulkFormat = () => {
    const csvContent = "url\nhttps://example1.com\nhttps://example2.com\nhttps://example3.com";
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bulk_url_format.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleBulkFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
        setErrors({ bulkFile: "Only CSV files are allowed" });
        return;
      }

      setBulkFile(file);
      setBulkFileName(file.name);

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const csvData = event.target.result;
          const lines = csvData.split("\n");
          const headers = lines[0].split(",");

          if (headers[0].trim().toLowerCase() !== "url") {
            setErrors({ bulkFile: 'CSV must have "url" as the first column' });
            return;
          }

          const urls = [];
          for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim()) {
              const url = lines[i].split(",")[0].trim();
              if (url) {
                if (validateUrlBulk(url)) {
                  urls.push(url);
                }
              }
            }
          }

          setBulkUrls(urls);
          setShowUrlBox(true);

          if (errors.bulkFile) {
            setErrors((prev) => ({ ...prev, bulkFile: null }));
          }
        } catch (error) {
          setErrors({ bulkFile: "Error parsing CSV file" });
        }
      };
      reader.readAsText(file);
    }
  };

  const removeBulkFile = () => {
    setBulkFile(null);
    setBulkFileName("");
    setBulkUrls([]);
    setShowUrlBox(false);
    document.getElementById("bulkFile").value = "";
  };

  const addSingleUrl = () => {
    if (formData.url.trim() && isValidUrl) {
      const Urlafterokayvalud = [...urlafterokay];
      Urlafterokayvalud.push(formData.url);
      setUrlafterokay(Urlafterokayvalud);
      setFormData((prev) => ({
        ...prev,
        url: "",
      }));
    } else {
      alert("Invalid URL");
    }
  };

  const removeBulkUrl = (index) => {
    setBulkUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.declaration) {
      newErrors.declaration = "Declaration is required";
    }

    if (formData.court_order && formData.court_order.size > 5 * 1024 * 1024) {
      newErrors.court_order = "Court Order file size must be less than 5MB";
    }

    if (mode === "single") {
      if (urlafterokay.length === 0) {
        newErrors.url = "Please add url.";
      }

      if (!formData.description.trim()) {
        newErrors.description = "Description is required";
      }

      // Evidence is only mandatory if no existing evidence
      if (!formData.uploaded_evidence && !hasExistingEvidence) {
        newErrors.uploaded_evidence = "Evidence file is required";
      } else if (formData.uploaded_evidence && formData.uploaded_evidence.size > 5 * 1024 * 1024) {
        newErrors.uploaded_evidence = "Evidence file size must be less than 5MB";
      }
    } else {
      // Bulk mode validation
      if (!bulkFile && (!existingData || !existingData.urls)) {
        newErrors.bulkFile = "Please upload a CSV file with URLs";
      }

      if (!formData.uploaded_evidence && !hasExistingEvidence) {
        newErrors.uploaded_evidence = "Evidence file is required";
      } else if (formData.uploaded_evidence && formData.uploaded_evidence.size > 25 * 1024 * 1024) {
        newErrors.uploaded_evidence = "Evidence file size must be less than 25MB";
      }

      if (!formData.description.trim()) {
        newErrors.description = "Description is required for bulk upload";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePreview = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const previewInfo = {
      mode: mode,
      description: formData.description,
      isEdit: !!id,
      evidenceFile: {
        name: evidenceFileName || (hasExistingEvidence ? existingData?.evidence : null),
        size: formData.uploaded_evidence?.size,
        type: formData.uploaded_evidence?.type,
        existing: hasExistingEvidence,
      },
      courtorder: {
        name: courOrderFileName || (hasExistingCourtOrder ? existingData?.court_order : null),
        size: formData.court_order?.size,
        type: formData.court_order?.type,
        existing: hasExistingCourtOrder,
      },
    };

    if (mode === "single") {
      previewInfo.urls = urlafterokay;
      previewInfo.urlCount = urlafterokay.length;
    } else {
      previewInfo.bulkFile = {
        name: bulkFileName,
        size: bulkFile?.size,
      };
      previewInfo.urls = bulkUrls.length > 0 ? bulkUrls : existingData?.urls || [];
      previewInfo.urlCount = bulkUrls.length > 0 ? bulkUrls.length : existingData?.urls?.length || 0;
    }

    setPreviewData(previewInfo);
    setShowPreview(true);
  };

  const handleSubmit = async () => {
    setShowPreview(false);
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title || filmData?.title);

      if (mode === "single") {
        formDataToSend.append("urls", JSON.stringify(urlafterokay));
        formDataToSend.append("description", formData.description);
        formDataToSend.append("mode", "single");
      } else {
        formDataToSend.append("description", formData.description);
        formDataToSend.append("mode", "bulk");
        formDataToSend.append("urls", JSON.stringify(bulkUrls.length > 0 ? bulkUrls : existingData?.urls || []));
      }

      if (formData.court_order instanceof File) {
        formDataToSend.append("court_order", formData.court_order);
      }

      if (formData.uploaded_evidence instanceof File) {
        formDataToSend.append("uploaded_evidence", formData.uploaded_evidence);
      }

      let response;
      if (id) {
        // Update existing complaint
        response = await postFormDataApiwithLogin(`request/complaint/update/${id}`, formDataToSend);
      } else {
        // Create new complaint
        response = await postFormDataApiwithLogin("request/complaint/create", formDataToSend);
      }

      if (response.status) {
        navigate("/request-list");
      } else {
        setErrors({ submit: response.message || "Failed to submit request" });
      }
    } catch (error) {
      console.log({ error });
      setErrors({ submit: "An error occurred while submitting the form" });
    } finally {
      setLoading(false);
    }
  };

  const deleteUrl = (e, indexToRemove) => {
    e.preventDefault();
    const updatedUrls = urlafterokay.filter((_, index) => index !== indexToRemove);
    setUrlafterokay(updatedUrls);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const name = e.target.name;

    if (file) {
      const maxSize = mode === "single" ? 5 * 1024 * 1024 : 25 * 1024 * 1024;

      if (file.size > maxSize) {
        setErrors((prev) => ({
          ...prev,
          [name]: `File size must be less than ${mode === "single" ? "5MB" : "25MB"}`,
        }));
        return;
      }

      setFormData((prev) => ({
        ...prev,
        [name]: file,
      }));

      if (name === "uploaded_evidence") {
        setEvidenceFileName(file.name);
        setHasExistingEvidence(false); // New file replaces existing
      }
      if (name === "court_order") {
        setCourOrderFileName(file.name);
        setHasExistingCourtOrder(false); // New file replaces existing
      }

      if (errors[name]) {
        setErrors((prev) => ({
          ...prev,
          [name]: null,
        }));
      }
    }
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setErrors({});
    if (newMode === "single") {
      setFormData((prev) => ({ ...prev, url: "" }));
    }
  };

  const removeExistingFile = (fileType) => {
    if (fileType === "evidence") {
      setHasExistingEvidence(false);
      setEvidenceFileName("");
      setFormData((prev) => ({ ...prev, uploaded_evidence: null }));
    } else if (fileType === "court_order") {
      setHasExistingCourtOrder(false);
      setCourOrderFileName("");
      setFormData((prev) => ({ ...prev, court_order: null }));
    }
  };

  // Preview Modal Component
  const PreviewModal = () => {
    if (!showPreview || !previewData) return null;

    return (
      <div
        className="modal show d-block"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        onClick={() => setShowPreview(false)}
      >
        <div
          className="modal-dialog modal-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {previewData.isEdit ? "Preview Your Changes" : "Preview Your Request"}
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowPreview(false)}
              ></button>
            </div>
            <div className="modal-body">
              {/* Display Admin Comments if editing */}
              {previewData.isEdit && existingData?.comments && existingData.comments.length > 0 && (
                <div className="mb-4">
                  <h6 className="fw-bold text-danger">Administrator Comments</h6>
                  <div className="bg-light p-3 rounded">
                    {existingData.comments.map((comment, idx) => (
                      <div key={idx} className="mb-2 pb-2 border-bottom">
                        <div className="d-flex justify-content-between">
                          <strong className="text-danger">
                            Status: {getStatusText(comment.status)}
                          </strong>
                          <small className="text-muted">
                            {new Date(comment.createdAt).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </small>
                        </div>
                        <p className="mb-0 mt-1">{comment.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mode Information */}
              <div className="mb-3">
                <h6 className="fw-bold">Mode:</h6>
                <span>
                  {previewData.mode === "single"
                    ? "Manually Url Entered"
                    : "Bulk URLs via CSV"}
                </span>
              </div>

              {/* URLs Information */}
              <div className="mb-3 urls-div">
                <h6 className="fw-bold">
                  {previewData.mode === "single" ? "URLs:" : "URLs from CSV:"}
                </h6>
                <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                  {previewData.urls && previewData.urls.length > 0 ? (
                    previewData.urls.map((url, index) => (
                      <div key={index} className="mb-1 pb-1 border-bottom">
                        <small>{url}</small>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted">No URLs added</p>
                  )}
                </div>
                <div className="mt-1">
                  <small className="text-muted">
                    <b>Total URLs:</b> {previewData.urlCount || 0}
                  </small>
                </div>
              </div>

              {/* Description */}
              <div className="mb-3">
                <h6 className="fw-bold">Description:</h6>
                <div className="description">
                  {previewData.description || (
                    <span className="text-muted">No description provided</span>
                  )}
                </div>
              </div>

              {/* Files */}
              <div className="mb-3">
                <div className="row">
                  {/* Court Order */}
                  <div className="col-md-6">
                    <div className="mb-3">
                      <h6 className="fw-bold">Court Order:</h6>
                      <div className="file-name">
                        {previewData.courtorder?.name ? (
                          <>
                            <div>
                              <strong>Name:</strong> {previewData.courtorder.name}
                            </div>
                            {previewData.courtorder.size && (
                              <div>
                                <strong>Size:</strong>{" "}
                                {(previewData.courtorder.size / 1024 / 1024).toFixed(2)} MB
                              </div>
                            )}
                            {previewData.courtorder.existing && (
                              <div className="text-info">
                                <small>Existing file (will be kept if no new file uploaded)</small>
                              </div>
                            )}
                          </>
                        ) : (
                          <span className="text-muted">No file uploaded</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Evidence File */}
                  <div className="col-md-6">
                    <div className="mb-3">
                      <h6 className="fw-bold">Evidence File:</h6>
                      <div className="file-name">
                        {previewData.evidenceFile?.name ? (
                          <>
                            <div>
                              <strong>Name:</strong> {previewData.evidenceFile.name}
                            </div>
                            {previewData.evidenceFile.size && (
                              <div>
                                <strong>Size:</strong>{" "}
                                {(previewData.evidenceFile.size / 1024 / 1024).toFixed(2)} MB
                              </div>
                            )}
                            {previewData.evidenceFile.existing && (
                              <div className="text-info">
                                <small>Existing file (will be kept if no new file uploaded)</small>
                              </div>
                            )}
                          </>
                        ) : (
                          <span className="text-muted">No file uploaded</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowPreview(false)}
                disabled={loading}
              >
                Edit
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Submitting...
                  </>
                ) : (
                  "Confirm & Submit"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="complaint-form">
      <div className="headeing">
        <h4 className="mb-0">
          {id ? "Edit Your Complaint" : "Register your Complaint"}
        </h4>
      </div>
      <div className="details">
        {/* Display Admin Comments for Edit Mode */}
        {id && existingData?.comments && existingData.comments.length > 0 && (
          <div className="mb-4 p-3 bg-light rounded border">
            <h6 className="fw-bold text-danger mb-3">
              <i className="bi bi-chat-dots me-2"></i>
              Administrator Feedback
            </h6>
            {existingData.comments.map((comment, idx) => (
              <div key={idx} className="mb-2 pb-2 border-bottom">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="badge bg-danger">{getStatusText(comment.status)}</span>
                  <small className="text-muted">
                    {new Date(comment.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </small>
                </div>
                <p className="mb-0 mt-2">{comment.comment}</p>
              </div>
            ))}
          </div>
        )}

        {errors.submit && (
          <div className="alert alert-danger" role="alert">
            {errors.submit}
          </div>
        )}

        <div className="mb-4">
          <label htmlFor="title" className="form-label">
            Movie Title <span className="text-danger">*</span>
          </label>
          <input
            className={`form-control ${errors.title ? "is-invalid" : ""}`}
            id="title"
            name="title"
            value={filmData?.title || formData.title}
            onChange={handleInputChange}
            placeholder="Please provide title for a movie"
            disabled={!!filmData?.title}
          />
          {errors.title && (
            <div className="invalid-feedback d-block">{errors.title}</div>
          )}
        </div>

        <div className="mb-4">
          <label className="form-label fw-bold">URL Input Method</label>
          <div className="d-flex gap-4">
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="mode"
                id="singleMode"
                checked={mode === "single"}
                onChange={() => handleModeChange("single")}
                disabled={loading || !!id}
              />
              <label className="form-check-label" htmlFor="singleMode">
                Enter URL(s) Manually
              </label>
            </div>
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="mode"
                id="bulkMode"
                checked={mode === "bulk"}
                onChange={() => handleModeChange("bulk")}
                disabled={loading || !!id}
              />
              <label className="form-check-label" htmlFor="bulkMode">
                Upload URL(s) via CSV
              </label>
            </div>
          </div>
        </div>

        <form onSubmit={handlePreview}>
          {mode === "single" ? (
            <>
              <div className="mb-4">
                <label htmlFor="url" className="form-label">
                  URL <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <input
                    type="text"
                    className={`form-control ${errors.url ? "is-invalid" : ""}`}
                    id="url"
                    name="url"
                    value={formData.url}
                    onChange={handleInputChange}
                    placeholder="https://example.com"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-primary border-radius-norm addbtn"
                    onClick={addSingleUrl}
                  >
                    Add
                  </button>
                </div>
                {errors.url && (
                  <div className="invalid-feedback d-block">{errors.url}</div>
                )}
                {urlafterokay.length > 0 && (
                  <div className="mt-2 p-2 border rounded urls-div">
                    {urlafterokay.map((value, index) => (
                      <small key={index} className="d-block custom-dynmic-url">
                        URL : {value}
                        &nbsp;{" "}
                        <a
                          href="#"
                          style={{ textDecoration: "none" }}
                          onClick={(e) => deleteUrl(e, index)}
                          className="text-danger btn btn-sm btn-outline-danger"
                        >
                          <i className="bi bi-x"></i> Remove
                        </a>
                      </small>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="mb-4">
                <label className="form-label">
                  Upload a CSV file with multiple URLs for bulk processing{" "}
                  <span className="text-danger">*</span>
                </label>
                <div className="mb-2">
                  <button
                    type="button"
                    className="btn btn-link p-0"
                    onClick={downloadBulkFormat}
                  >
                    Download CSV Template (bulk_url_format.csv)
                  </button>
                </div>

                <div>
                  <input
                    type="file"
                    className={`form-control ${errors.bulkFile ? "is-invalid" : ""}`}
                    id="bulkFile"
                    accept=".csv"
                    onChange={handleBulkFileUpload}
                    disabled={loading || !!id}
                  />
                </div>
                {errors.bulkFile && (
                  <div className="invalid-feedback d-block">
                    {errors.bulkFile}
                  </div>
                )}
                <div className="form-text">
                  Upload CSV file with URLs (one per row, first column should be "url")
                </div>

                {existingData?.urls && !bulkFileName && (
                  <div className="mt-2 p-2 border rounded bg-light">
                    <div className="d-flex align-items-center">
                      <div className="me-2">
                        <i className="bi bi-file-earmark-spreadsheet fs-4"></i>
                      </div>
                      <div className="flex-grow-1">
                        <small className="text-info d-block">
                          <strong>Existing URLs:</strong> {existingData.urls.length} URLs found
                        </small>
                      </div>
                    </div>
                  </div>
                )}

                {bulkFileName && bulkFile && (
                  <div className="mt-2 p-2 border rounded bg-light">
                    <div className="d-flex align-items-center">
                      <div className="me-2">
                        <div className="bg-secondary text-white rounded p-2" style={{ width: "40px", height: "40px" }}>
                          <i className="bi bi-file-earmark-spreadsheet"></i>
                        </div>
                      </div>
                      <div className="flex-grow-1">
                        <small className="text-success d-block">
                          <strong>{bulkFileName}</strong>
                        </small>
                        <small className="text-muted">
                          Size: {(bulkFile.size / 1024).toFixed(2)} KB | URLs found: {bulkUrls.length}
                        </small>
                      </div>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={removeBulkFile}
                      >
                        <i className="bi bi-x"></i> Remove
                      </button>
                    </div>
                  </div>
                )}

                {showUrlBox && bulkUrls.length > 0 && (
                  <div className="mt-3">
                    <label className="form-label fw-bold">URLs from CSV:</label>
                    <div className="border rounded p-3 bg-light" style={{ maxHeight: "200px", overflowY: "auto" }}>
                      {bulkUrls.map((url, index) => (
                        <div key={index} className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                          <span style={{ fontSize: "0.9rem" }}>{url}</span>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => removeBulkUrl(index)}
                          >
                            <i className="bi bi-x"></i> Remove
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 text-muted">
                      <small>Total URLs: {bulkUrls.length}</small>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Description Field */}
          <div className="mb-4">
            <label htmlFor="description" className="form-label">
              Description <span className="text-danger">*</span>
            </label>
            <textarea
              className={`form-control ${errors.description ? "is-invalid" : ""}`}
              id="description"
              name="description"
              rows="4"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Please provide a detailed description of your request..."
              disabled={loading}
            />
            {errors.description && (
              <div className="invalid-feedback d-block">
                {errors.description}
              </div>
            )}
          </div>

          {/* Court Order Upload Field */}
          <div className="mb-4">
            <label htmlFor="court_order" className="form-label">
              Court Order
            </label>
            <div>
              <input
                type="file"
                className={`form-control ${errors.court_order ? "is-invalid" : ""}`}
                id="court_order"
                name="court_order"
                onChange={handleFileChange}
                accept="image/*,.pdf,.doc,.docx"
                disabled={loading}
              />
            </div>
            <div className="form-text">
              Max file size: 5MB. Accepted formats: Images, PDF, DOC, DOCX
            </div>

            {/* Show existing court order */}
            {hasExistingCourtOrder && !courOrderFileName && (
              <div className="mt-2 p-2 border rounded bg-light">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-file-text fs-4 me-2 text-primary"></i>
                    <div>
                      <small className="text-success d-block">
                        <strong>Current file: {existingData?.court_order}</strong>
                      </small>
                      <small className="text-muted">Existing file will be kept unless you upload a new one</small>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => removeExistingFile("court_order")}
                  >
                    <i className="bi bi-x"></i> Remove
                  </button>
                </div>
              </div>
            )}

            {/* Show new file preview */}
            {courOrderFileName && formData.court_order && (
              <div className="mt-2 p-2 border rounded bg-light">
                <div className="d-flex align-items-center">
                  <div className="me-2">
                    {formData.court_order.type?.startsWith("image/") ? (
                      <img
                        src={URL.createObjectURL(formData.court_order)}
                        alt="Preview"
                        style={{ width: "40px", height: "40px", objectFit: "cover" }}
                        className="rounded"
                      />
                    ) : (
                      <div className="bg-secondary text-white rounded p-2" style={{ width: "40px", height: "40px" }}>
                        <i className="bi bi-file-text"></i>
                      </div>
                    )}
                  </div>
                  <div className="flex-grow-1">
                    <small className="text-success d-block">
                      <strong>{courOrderFileName}</strong>
                    </small>
                    <small className="text-muted">
                      Size: {(formData.court_order.size / 1024 / 1024).toFixed(2)} MB
                    </small>
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, court_order: null }));
                      setCourOrderFileName("");
                      document.getElementById("court_order").value = "";
                    }}
                  >
                    <i className="bi bi-x"></i> Remove
                  </button>
                </div>
              </div>
            )}

            {errors.court_order && (
              <div className="invalid-feedback d-block">
                {errors.court_order}
              </div>
            )}
          </div>

          {/* Evidence Upload Field */}
          <div className="mb-4">
            <label htmlFor="uploaded_evidence" className="form-label">
              Evidence File {!hasExistingEvidence && <span className="text-danger">*</span>}
            </label>
            <div>
              <input
                type="file"
                className={`form-control ${errors.uploaded_evidence ? "is-invalid" : ""}`}
                id="uploaded_evidence"
                name="uploaded_evidence"
                onChange={handleFileChange}
                accept="image/*,.pdf,.doc,.docx"
                disabled={loading}
              />
            </div>
            <div className="form-text">
              {mode === "single"
                ? "Max file size: 5MB. Accepted formats: Images, PDF, DOC, DOCX"
                : "Max file size: 25MB. Accepted formats: Images, PDF, DOC, DOCX"}
              {hasExistingEvidence && " (Optional - existing file will be kept if no new file uploaded)"}
            </div>

            {/* Show existing evidence */}
            {hasExistingEvidence && !evidenceFileName && (
              <div className="mt-2 p-2 border rounded bg-light">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-file-text fs-4 me-2 text-primary"></i>
                    <div>
                      <small className="text-success d-block">
                        <strong>Current file: {existingData?.evidence}</strong>
                      </small>
                      <small className="text-muted">Existing file will be kept unless you upload a new one</small>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => removeExistingFile("evidence")}
                  >
                    <i className="bi bi-x"></i> Remove
                  </button>
                </div>
              </div>
            )}

            {/* Show new file preview */}
            {evidenceFileName && formData.uploaded_evidence && (
              <div className="mt-2 p-2 border rounded bg-light">
                <div className="d-flex align-items-center">
                  <div className="me-2">
                    {formData.uploaded_evidence.type?.startsWith("image/") ? (
                      <img
                        src={URL.createObjectURL(formData.uploaded_evidence)}
                        alt="Preview"
                        style={{ width: "40px", height: "40px", objectFit: "cover" }}
                        className="rounded"
                      />
                    ) : (
                      <div className="bg-secondary text-white rounded p-2" style={{ width: "40px", height: "40px" }}>
                        <i className="bi bi-file-text"></i>
                      </div>
                    )}
                  </div>
                  <div className="flex-grow-1">
                    <small className="text-success d-block">
                      <strong>{evidenceFileName}</strong>
                    </small>
                    <small className="text-muted">
                      Size: {(formData.uploaded_evidence.size / 1024 / 1024).toFixed(2)} MB
                    </small>
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, uploaded_evidence: null }));
                      setEvidenceFileName("");
                      document.getElementById("uploaded_evidence").value = "";
                    }}
                  >
                    <i className="bi bi-x"></i> Remove
                  </button>
                </div>
              </div>
            )}

            {errors.uploaded_evidence && (
              <div className="invalid-feedback d-block">
                {errors.uploaded_evidence}
              </div>
            )}
          </div>

          {/* Declaration */}
          <div className="mb-4">
            <label htmlFor="declaration" className="form-label font-wt-normal">
              <input
                className={`form-check-input ${errors.declaration ? "is-invalid" : ""}`}
                id="declaration"
                name="declaration"
                type="checkbox"
                checked={formData.declaration}
                onChange={handleInputChange}
                disabled={loading}
              />{" "}
              &nbsp;I, solemnly affirm that the URLs provided are hosting infringing content.
              I acknowledge that the Ministry of I&B acts in good faith based on this declaration.
              I hereby undertake full legal responsibility for any wrongful blocking and indemnify
              the Ministry against all costs and litigations arising therefrom.
              <span className="text-danger">*</span>
            </label>

            {errors.declaration && (
              <div className="invalid-feedback d-block">
                {errors.declaration}
              </div>
            )}
          </div>

          <div className="d-flex gap-2 justify-content-end">
            <button
              type="submit"
              className="btn btn-primary outline-common"
              disabled={loading}
            >
              Preview & Submit
            </button>
            <button
              type="button"
              className="btn btn-secondary outline-common-red"
              onClick={() => navigate("/request-list")}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
      <PreviewModal />
    </div>
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

export default CreateRequest;