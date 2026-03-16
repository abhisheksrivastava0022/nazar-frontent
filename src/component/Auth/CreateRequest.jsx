import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ApiClient from "../ApiClient";

const BASE_URL_API = `${import.meta.env.VITE_BASE_URL}/evidence/`;

const CreateRequest = () => {
  const { postFormDataApiwithLogin } = ApiClient();
  const navigate = useNavigate();

  const [mode, setMode] = useState("single"); // 'single' or 'bulk'
  const [urlafterokay, setUrlafterokay] = useState([]); // 'single' or 'bulk'
  const [formData, setFormData] = useState({
    title: "",
    url: "",
    description: "",
    uploaded_evidence: null,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [isValidUrl, setIsValidUrl] = useState(false);
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkFileName, setBulkFileName] = useState("");
  const [bulkUrls, setBulkUrls] = useState([]);
  const [showUrlBox, setShowUrlBox] = useState(false);

  // New state for preview modal
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  // URL validation for single mode
  const validateUrlBulk = (url) => {
    url = url?.trim();

    if (!url) {
      return false;
    }

    // Add https if missing
    if (!/^https?:\/\//i.test(url)) {
      url = "https://" + url;
    }

    try {
      const parsed = new URL(url);
      const hostname = parsed.hostname;

      // Strict domain regex:
      // - must contain dot
      // - last part min 2 letters
      // - no only numbers
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

        // Add https if missing
        if (!/^https?:\/\//i.test(url)) {
          url = "https://" + url;
        }

        try {
          const parsed = new URL(url);
          const hostname = parsed.hostname;

          // Strict domain regex:
          // - must contain dot
          // - last part min 2 letters
          // - no only numbers
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
    // Create CSV with only URL column
    const csvContent =
      "url\nhttps://example1.com\nhttps://example2.com\nhttps://example3.com";
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
      // Check if it's a CSV file
      if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
        setErrors({ bulkFile: "Only CSV files are allowed" });
        return;
      }

      // Store the actual file for upload
      setBulkFile(file);
      setBulkFileName(file.name);

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const csvData = event.target.result;
          const lines = csvData.split("\n");
          const headers = lines[0].split(",");

          // Validate header - should be 'url'
          if (headers[0].trim().toLowerCase() !== "url") {
            setErrors({ bulkFile: 'CSV must have "url" as the first column' });
            return;
          }

          const urls = [];
          for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim()) {
              const url = lines[i].split(",")[0].trim();
              if (url) {
                // Validate URL format
                if (validateUrlBulk(url)) {
                  urls.push(url);
                }
              }
            }
          }

          setBulkUrls(urls);
          setShowUrlBox(true);

          // Clear any previous errors
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
      const Urlafterokayvalud = urlafterokay;
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
    if (!formData.title.trim()) {
      newErrors.title = "Movie Title is required";
    }
    if (mode === "single") {
      if (urlafterokay.length == 0) {
        newErrors.url = "Please add url.";
      }

      if (!formData.description.trim()) {
        newErrors.description = "Description is required";
      }

      if (!formData.uploaded_evidence) {
        newErrors.uploaded_evidence = "Evidence file is required";
      } else if (formData.uploaded_evidence.size > 5 * 1024 * 1024) {
        newErrors.uploaded_evidence =
          "Evidence file size must be less than 5MB";
      }
    } else {
      // Bulk mode validation
      if (!bulkFile) {
        newErrors.bulkFile = "Please upload a CSV file with URLs";
      }

      if (!formData.uploaded_evidence) {
        newErrors.uploaded_evidence = "Evidence file is required";
      } else if (formData.uploaded_evidence.size > 25 * 1024 * 1024) {
        newErrors.uploaded_evidence =
          "Evidence file size must be less than 25MB";
      }

      if (!formData.description.trim()) {
        newErrors.description = "Description is required for bulk upload";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // New function to handle preview
  const handlePreview = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Prepare preview data
    const previewInfo = {
      mode: mode,
      title: formData.title,
      description: formData.description,
      evidenceFile: {
        name: fileName,
        size: formData.uploaded_evidence?.size,
        type: formData.uploaded_evidence?.type,
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
      previewInfo.urls = bulkUrls;
      previewInfo.urlCount = bulkUrls.length;
    }

    setPreviewData(previewInfo);
    setShowPreview(true);
  };

  // Modified handleSubmit to be called from preview
  const handleSubmit = async () => {
    setShowPreview(false);
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      if (mode === "single") {
        // Single mode
        formDataToSend.append("url", formData.url);
        formDataToSend.append("urls", JSON.stringify(urlafterokay));
        formDataToSend.append("description", formData.description);
        formDataToSend.append("mode", "single");
      } else {
        // Bulk mode - send the CSV file
        formDataToSend.append("csv_file", bulkFile);
        formDataToSend.append("description", formData.description);
        formDataToSend.append("mode", "bulk");
        formDataToSend.append("urls", JSON.stringify(bulkUrls));
      }

      // Add evidence file if uploaded
      if (formData.uploaded_evidence instanceof File) {
        formDataToSend.append("uploaded_evidence", formData.uploaded_evidence);
      }

      const response = await postFormDataApiwithLogin(
        "request/complaint/create",
        formDataToSend,
      );

      if (response.status) {
        navigate("/request-list");
      } else {
        // Handle error response
        setErrors({ submit: response.message || "Failed to create request" });
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

    const updatedUrls = urlafterokay.filter(
      (_, index) => index !== indexToRemove,
    );

    setUrlafterokay(updatedUrls);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size based on mode
      const maxSize = mode === "single" ? 5 * 1024 * 1024 : 25 * 1024 * 1024;

      if (file.size > maxSize) {
        setErrors((prev) => ({
          ...prev,
          uploaded_evidence: `Evidence file size must be less than ${mode === "single" ? "5MB" : "25MB"}`,
        }));
        return;
      }

      setFormData((prev) => ({
        ...prev,
        uploaded_evidence: file,
      }));
      setFileName(file.name);
      // Clear error for file field
      if (errors.uploaded_evidence) {
        setErrors((prev) => ({
          ...prev,
          uploaded_evidence: null,
        }));
      }
    }
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    // Reset relevant fields when switching modes
    setErrors({});
    setBulkUrls([]);
    setShowUrlBox(false);
    setBulkFile(null);
    setBulkFileName("");
    if (newMode === "single") {
      setFormData((prev) => ({ ...prev, url: "" }));
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
              <h5 className="modal-title">Preview Your Request</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowPreview(false)}
              ></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <h6 className="fw-custom">
                  Movie Title:<span className="">{previewData.title} </span>
                </h6>
              </div>
              {/* Mode Information */}
              <div className="mb-3">
                <h6 className="fw-custom">
                  Mode:
                  <span>
                    {" "}
                    {previewData.mode === "single"
                      ? "Manually Url Entered"
                      : "Bulk URLs via CSV"}
                  </span>
                </h6>
              </div>

              {/* URLs Information */}
              <div className="mb-3 urls-div">
                <h6 className="fw-custom">
                  {previewData.mode === "single" ? "URLs:" : "URLs from CSV:"}
                </h6>
                <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                  {previewData.urls.length > 0 ? (
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
                  <small className="text-muted total">
                    <b>Total URLs:</b> {previewData.urlCount}
                  </small>
                </div>
              </div>

              {/* Description */}

              <div className="mb-3">
                <h6 className="fw-custom">Description:</h6>
                <div className="description">
                  {previewData.description || (
                    <span className="text-muted">No description provided</span>
                  )}
                </div>
              </div>

              {/* Evidence File */}
              <div className="mb-3">
                <h6 className="fw-custom title-head">Evidence File:</h6>
                <div className="file-name">
                  {previewData.evidenceFile.name ? (
                    <>
                      <div>
                        <strong>Name:</strong> {previewData.evidenceFile.name}
                      </div>
                      <div>
                        <strong>Size:</strong>{" "}
                        {(previewData.evidenceFile.size / 1024 / 1024).toFixed(
                          2,
                        )}{" "}
                        MB
                      </div>
                      <div>
                        <strong>Type:</strong>{" "}
                        {previewData.evidenceFile.type || "Unknown"}
                      </div>
                    </>
                  ) : (
                    <span className="text-muted">No file uploaded</span>
                  )}
                </div>
              </div>

              {/* Bulk File Info (if applicable) */}
              {previewData.mode === "bulk" && previewData.bulkFile && (
                <div className="mb-3">
                  <h6 className="fw-custom">CSV File:</h6>
                  <div className="bg-light p-2 rounded">
                    <div>
                      <strong>Name:</strong> {previewData.bulkFile.name}
                    </div>
                    <div>
                      <strong>Size:</strong>{" "}
                      {(previewData.bulkFile.size / 1024).toFixed(2)} KB
                    </div>
                  </div>
                </div>
              )}
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
    <>
      {/* complaint-form */}
      <div className="complaint-form">
        <div className="headeing">
          <h4 className="mb-0">Register your Complaint</h4>
        </div>
        <div className="details">
          {errors.submit && (
            <div className="alert alert-danger" role="alert">
              {errors.submit}
            </div>
          )}
          <div className="mb-2">
            <label htmlFor="title" className="form-label">
              Movie TItle <span className="text-danger">*</span>
            </label>
            <input
              className={`form-control ${errors.title ? "is-invalid" : ""}`}
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Please provide title for a movie"
              disabled={loading}
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
                  disabled={loading}
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
                  disabled={loading}
                />
                <label className="form-check-label" htmlFor="bulkMode">
                  Upload URL(s) via CSV
                </label>
              </div>
            </div>
          </div>

          <form onSubmit={handlePreview}>
            {mode === "single" ? (
              /* Single URL Mode */
              <>
                {/* URL Field with Okay Button */}
              
                <div className="mb-3">
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
                      className="btn btn-outline-primary border-radius-norm"
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
                        <small
                          key={index}
                          className=" d-block custom-dynmic-url"
                        >
                          URL : {value}
                          &nbsp;{" "}
                          <a
                            href=""
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
              /* Bulk URL Mode */
              <>
                {/* Download Template Link */}
                <div className="mb-3">
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

                  {/* File Upload */}
                  <div>
                    <input
                      type="file"
                      className={`form-control ${errors.bulkFile ? "is-invalid" : ""}`}
                      id="bulkFile"
                      accept=".csv"
                      onChange={handleBulkFileUpload}
                      disabled={loading}
                    />
                  </div>
                  {errors.bulkFile && (
                    <div className="invalid-feedback d-block">
                      {errors.bulkFile}
                    </div>
                  )}
                  <div className="form-text">
                    Upload CSV file with URLs (one per row, first column should
                    be "url")
                  </div>

                  {/* Display Uploaded CSV File Info */}
                  {bulkFileName && (
                    <div className="mt-2 p-2 border rounded bg-light">
                      <div className="d-flex align-items-center">
                        <div className="me-2">
                          <div
                            className="bg-secondary text-white rounded p-2"
                            style={{ width: "40px", height: "40px" }}
                          >
                            <i className="bi bi-file-earmark-spreadsheet"></i>
                          </div>
                        </div>
                        <div className="flex-grow-1">
                          <small className="text-success d-block">
                            <strong>{bulkFileName}</strong>
                          </small>
                          <small className="text-muted">
                            Size: {(bulkFile.size / 1024).toFixed(2)} KB | URLs
                            found: {bulkUrls.length}
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

                  {/* Display Uploaded URLs */}
                  {showUrlBox && bulkUrls.length > 0 && (
                    <div className="mt-3">
                      <label className="form-label fw-bold">
                        URLs from CSV:
                      </label>
                      <div
                        className="border rounded p-3 bg-light"
                        style={{ maxHeight: "200px", overflowY: "auto" }}
                      >
                        {bulkUrls.map((url, index) => (
                          <div
                            key={index}
                            className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom"
                          >
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

            {/* Description Field - Common for both modes */}
            <div className="mb-3">
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

            {/* Evidence Upload Field */}
            <div className="mb-3">
              <label htmlFor="evidence" className="form-label">
                Evidence File <span className="text-danger">*</span>
              </label>
              <div>
                <input
                  type="file"
                  className={`form-control ${errors.uploaded_evidence ? "is-invalid" : ""}`}
                  id="evidence"
                  name="evidence"
                  onChange={handleFileChange}
                  accept="image/*,.pdf,.doc,.docx"
                  disabled={loading}
                />
              </div>
              <div className="form-text">
                {mode === "single"
                  ? "Max file size: 5MB. Accepted formats: Images, PDF, DOC, DOCX"
                  : "Max file size: 25MB. Accepted formats: Images, PDF, DOC, DOCX"}
              </div>

              {/* File Preview */}
              {fileName && (
                <div className="mt-2 p-2 border rounded bg-light">
                  <div className="d-flex align-items-center">
                    <div className="me-2">
                      {formData.uploaded_evidence?.type?.startsWith(
                        "image/",
                      ) ? (
                        <img
                          src={URL.createObjectURL(formData.uploaded_evidence)}
                          alt="Preview"
                          style={{
                            width: "40px",
                            height: "40px",
                            objectFit: "cover",
                          }}
                          className="rounded"
                        />
                      ) : (
                        <div
                          className="bg-secondary text-white rounded p-2"
                          style={{ width: "40px", height: "40px" }}
                        >
                          <i className="bi bi-file-text"></i>
                        </div>
                      )}
                    </div>
                    <div className="flex-grow-1">
                      <small className="text-success d-block">
                        <strong>{fileName}</strong>
                      </small>
                      <small className="text-muted">
                        Size:{" "}
                        {(
                          formData.uploaded_evidence.size /
                          1024 /
                          1024
                        ).toFixed(2)}{" "}
                        MB
                      </small>
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          uploaded_evidence: null,
                        }));
                        setFileName("");
                        document.getElementById("evidence").value = "";
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

            {/* Submit Buttons */}
            <div className="mb-3">
              <label htmlFor="declaration" className="form-label font-wt-normal">
                <input
                  className={`form-check-input ${errors.title ? "is-invalid" : ""}`}
                  id="declaration"
                  name="declaration"
                  type="checkbox"
                  value={formData.declaration}
                  onChange={handleInputChange}
                  placeholder=""
                  disabled={loading}
                />{" "}
                &nbsp;I hereby declare that I am the copyright holder or an
                authorized representative of the film/content mentioned above,
                and that the reported URL(s) contain unauthorized or pirated
                content shared without permission.
                <span className="text-danger">*</span>
              </label>

              {errors.declaration && (
                <div className="invalid-feedback d-block">
                  {errors.declaration}
                </div>
              )}
            </div>

            <div className="d-flex gap-2 justify-content-end ">
              <button
                type="submit"
                className="btn btn-primary outline-common"
                disabled={loading || (mode === "bulk" && !bulkFile)}
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
      </div>
      {/* Preview Modal */}
      <PreviewModal />
    </>
  );
};

export default CreateRequest;
