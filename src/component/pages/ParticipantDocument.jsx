import React, { useEffect, useState, useRef } from 'react'
import ApiClient from '../ApiClient'
import { Link, useParams } from 'react-router-dom'

const ParticipantDocument = () => {
    const { slug } = useParams();
    const [documentTypes, setDocumentTypes] = useState([]);
    const [documents, setDocuments] = useState({});
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({
        current: 0,
        total: 0,
        message: '',
        fileName: ''
    });
    const [submitLoading, setSubmitLoading] = useState(false);
    const [deleting, setDeleting] = useState({});
    const fileInputRefs = useRef({});
    const { getRequestApiwithLogin, getRequestApi, postRequestApiwithLogin, postFormDataApiwithLogin, deleteRequestApi } = ApiClient();
    const token = localStorage.getItem("token");

    useEffect(() => {
        loadData();
    }, [slug])

    const loadData = async () => {
        try {
            const [documentsRes, profileRes] = await Promise.all([
                getRequestApi('event/fetch-field/Documents%20Type'),
                token ? getRequestApiwithLogin('event/profile') : Promise.resolve({ status: false })
            ]);

            console.log('Profile Response:', profileRes);

            if (documentsRes.status) {
                setDocumentTypes(documentsRes.data);

                // Process document types and map with uploaded documents from profileRes
                const initialDocuments = {};
                documentsRes.data.forEach(doc => {
                    const fieldInfo = doc.field_info || {};

                    // Check if this document type already has an uploaded file in profileRes
                    let uploadedDoc = null;
                    if (profileRes.status && profileRes.data && profileRes.data.delegatedoc) {
                        uploadedDoc = profileRes.data.delegatedoc.find(
                            uploaded => uploaded.file_type == doc.id // Match file_type with document type id
                        );
                    }

                    initialDocuments[doc.id] = {
                        typeId: doc.id,
                        typeName: doc.name,
                        required: fieldInfo.required === true || fieldInfo.required === 1,
                        fieldTypesId: doc.field_types_id,
                        fileType: fieldInfo.file_type || [],
                        maxFileSize: fieldInfo.size || 5,
                        file: null,
                        fileName: uploadedDoc ? uploadedDoc.file_name : '',
                        fileUrl: uploadedDoc ? uploadedDoc.file_path : '', // Use file_path from API
                        uploaded: !!uploadedDoc, // Mark as uploaded if we found a match
                        serverId: uploadedDoc ? uploadedDoc.id : null,
                        error: ''
                    };
                });

                console.log('Initial documents state:', initialDocuments);
                setDocuments(initialDocuments);
            } else {
                alert("Error loading document types");
            }
        } catch (error) {
            console.error('Error loading data:', error);
            alert("Error loading data. Please try again.");
        }
    }

    const handleFileChange = (documentId, event) => {
        const file = event.target.files[0];
        if (file) {
            const docData = documents[documentId];

            // Clear previous error
            setDocuments(prev => ({
                ...prev,
                [documentId]: {
                    ...prev[documentId],
                    error: ''
                }
            }));

            // Get file extension
            const fileExtension = file.name.split('.').pop().toLowerCase();

            // Validate file type
            const allowedTypes = docData.fileType || [];
            if (allowedTypes.length > 0 && !allowedTypes.includes(fileExtension)) {
                const errorMsg = `Only ${allowedTypes.join(', ').toUpperCase()} files are allowed for ${docData.typeName}`;
                setDocuments(prev => ({
                    ...prev,
                    [documentId]: {
                        ...prev[documentId],
                        error: errorMsg
                    }
                }));
                if (fileInputRefs.current[documentId]) {
                    fileInputRefs.current[documentId].value = '';
                }
                return;
            }

            // Validate file size
            const maxSize = (docData.maxFileSize || 5) * 1024 * 1024;
            if (file.size > maxSize) {
                const errorMsg = `File size should be less than ${docData.maxFileSize}MB for ${docData.typeName}`;
                setDocuments(prev => ({
                    ...prev,
                    [documentId]: {
                        ...prev[documentId],
                        error: errorMsg
                    }
                }));
                if (fileInputRefs.current[documentId]) {
                    fileInputRefs.current[documentId].value = '';
                }
                return;
            }

            setDocuments(prev => ({
                ...prev,
                [documentId]: {
                    ...prev[documentId],
                    file: file,
                    fileName: file.name,
                    uploaded: false, // Mark as not uploaded yet (pending new upload)
                    error: ''
                }
            }));
        }
    }

    const handleRemoveFile = (documentId) => {
        if (fileInputRefs.current[documentId]) {
            fileInputRefs.current[documentId].value = '';
        }

        setDocuments(prev => ({
            ...prev,
            [documentId]: {
                ...prev[documentId],
                file: null,
                fileName: '',
                fileUrl: '',
                uploaded: false,
                serverId: null,
                error: ''
            }
        }));
    }

    // const deleteUploadedFile = async (documentId) => {
    //     const docData = documents[documentId];

    //     if (!docData.serverId) {
    //         handleRemoveFile(documentId);
    //         return;
    //     }

    //     if (!window.confirm(`Are you sure you want to delete the uploaded "${docData.typeName}" document?`)) {
    //         return;
    //     }

    //     setDeleting(prev => ({ ...prev, [documentId]: true }));

    //     try {
    //         const res = await deleteRequestApi(`event/delete-document/${docData.serverId}`, {
    //             headers: {
    //                 'Authorization': `Bearer ${token}`
    //             }
    //         });

    //         if (res.status) {
    //             alert(res.message || 'Document deleted successfully!');
    //             // Clear the file from local state
    //             handleRemoveFile(documentId);
    //             // Reload data to ensure consistency
    //             await loadData();
    //         } else {
    //             alert(`Delete failed: ${res.message}`);
    //         }
    //     } catch (error) {
    //         alert(`Error deleting document: ${error.message}`);
    //     } finally {
    //         setDeleting(prev => ({ ...prev, [documentId]: false }));
    //     }
    // }

    const uploadAllDocuments = async () => {
        // Get all documents that need to be uploaded 
        // (including new files and files that replace existing ones)
        const documentsToUpload = Object.values(documents)
            .filter(doc => doc.file && !doc.uploaded); // Files that are selected but not yet uploaded

        if (documentsToUpload.length === 0) {
            alert('No documents to upload. Please select files first.');
            return;
        }

        setUploading(true);
        setUploadProgress({
            current: 0,
            total: documentsToUpload.length,
            message: 'Starting upload process...',
            fileName: ''
        });

        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < documentsToUpload.length; i++) {
            const doc = documentsToUpload[i];

            setUploadProgress({
                current: i + 1,
                total: documentsToUpload.length,
                message: `Uploading file ${i + 1} of ${documentsToUpload.length}`,
                fileName: doc.fileName
            });

            const formData = new FormData();
            formData.append('document_type_id', doc.typeId);
            formData.append('field_types_id', doc.fieldTypesId);
            formData.append('required', doc.required ? 1 : 0);
            formData.append('name', doc.typeName);
            formData.append('file', doc.file);
            formData.append('slug', slug);
            formData.append('fileName', doc.fileName);

            try {
                const res = await postFormDataApiwithLogin('event/upload-document', formData, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });

                if (res.status) {
                    // Update document state with new upload info

                    successCount++;
                } else {
                    setDocuments(prev => ({
                        ...prev,
                        [doc.typeId]: {
                            ...prev[doc.typeId],
                            error: res.message || 'Upload failed'
                        }
                    }));
                    failCount++;
                }
            } catch (error) {
                setDocuments(prev => ({
                    ...prev,
                    [doc.typeId]: {
                        ...prev[doc.typeId],
                        error: error.message
                    }
                }));
                failCount++;
            }
        }
        loadData();
        // Clear file inputs for successfully uploaded files
        Object.keys(documents).forEach(docId => {
            const doc = documents[docId];
            if (doc.file && doc.uploaded) {
                if (fileInputRefs.current[docId]) {
                    fileInputRefs.current[docId].value = '';
                }
            }
        });

        setUploading(false);
        setUploadProgress({
            current: documentsToUpload.length,
            total: documentsToUpload.length,
            message: successCount > 0
                ? `Upload complete! ${successCount} file(s) uploaded successfully${failCount > 0 ? `, ${failCount} failed` : ''}.`
                : 'Upload failed. Please try again.',
            fileName: ''
        });

        setTimeout(() => {
            setUploadProgress({ current: 0, total: 0, message: '', fileName: '' });
        }, 3000);
    }

    const validateRequiredDocuments = () => {
        const missingRequiredDocs = [];
        Object.values(documents).forEach(doc => {
            if (doc.required && !doc.fileUrl && !doc.uploaded) {
                missingRequiredDocs.push(doc.typeName);
            }
        });
        return missingRequiredDocs;
    }

    const handleSubmit = async () => {
        const missingRequiredDocs = validateRequiredDocuments();

        if (missingRequiredDocs.length > 0) {
            alert(`Please upload the following required documents: ${missingRequiredDocs.join(', ')}`);
            return;
        }

        // Check if there are any files that haven't been uploaded yet
        const unuploadedFiles = Object.values(documents)
            .filter(doc => doc.file && !doc.uploaded);

        if (unuploadedFiles.length > 0) {
            const confirmUpload = window.confirm(
                `You have ${unuploadedFiles.length} file(s) that haven't been uploaded yet. ` +
                `Do you want to upload them before submission?`
            );

            if (confirmUpload) {
                await uploadAllDocuments();

                // Re-check if all required documents are uploaded
                const stillMissing = validateRequiredDocuments();
                if (stillMissing.length > 0) {
                    alert(`Please upload the following required documents: ${stillMissing.join(', ')}`);
                    return;
                }
            } else {
                alert('Please upload all files before submission.');
                return;
            }
        }

        setSubmitLoading(true);

        try {
            const submitData = {
                slug: slug,
                status: 'submitted',
                submitted_at: new Date().toISOString()
            };

            const res = await postRequestApiwithLogin('event/submit-accredation', submitData);

            if (res.status) {
                alert(res.message || 'Documents submitted successfully!');
                // Reload data to reflect any updates
                await loadData();
            } else {
                alert(`Submission failed: ${res.message}`);
            }
        } catch (error) {
            alert(`Error submitting documents: ${error.message}`);
        } finally {
            setSubmitLoading(false);
        }
    }

    const getUploadStats = () => {
        const total = documentTypes.length;
        const uploaded = Object.values(documents).filter(doc => doc.uploaded).length;
        const selected = Object.values(documents).filter(doc => doc.file).length;
        const requiredTotal = documentTypes.filter(doc => {
            const fieldInfo = doc.field_info || {};
            return fieldInfo.required === true || fieldInfo.required === 1;
        }).length;
        const requiredUploaded = Object.values(documents)
            .filter(doc => doc.required && doc.uploaded).length;

        return { total, uploaded, selected, requiredTotal, requiredUploaded };
    }

    const stats = getUploadStats();

    return (
        <>
            <div className="col-md-12">
                <div className="card card-registration h-100 p-4">
                    <h3 className="mb-4 text-center">Upload Required Documents</h3>

                    {/* Circular Loader Modal for Upload */}
                    {uploading && (
                        <div className="modal-backdrop fade show">
                            <div className="modal d-block">
                                <div className="modal-dialog modal-dialog-centered">
                                    <div className="modal-content" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
                                        <div className="modal-body text-center py-5">
                                            {/* Yellow Circular Loader */}
                                            <div className="mb-4">
                                                <div className="spinner-border text-warning"
                                                    style={{ width: '5rem', height: '5rem', borderWidth: '0.5rem' }}
                                                    role="status">
                                                    <span className="visually-hidden">Uploading...</span>
                                                </div>
                                            </div>

                                            <h4 className="text-warning mb-3">Uploading Documents</h4>

                                            {/* Progress Info */}
                                            <div className="mb-3">
                                                <div className="text-warning fw-bold fs-5 mb-2">
                                                    {uploadProgress.current} / {uploadProgress.total}
                                                </div>
                                                <div className="progress mb-2" style={{ height: '12px' }}>
                                                    <div
                                                        className="progress-bar bg-warning"
                                                        style={{
                                                            width: `${(uploadProgress.current / uploadProgress.total) * 100}%`
                                                        }}
                                                        role="progressbar"
                                                    ></div>
                                                </div>
                                                <div className="text-muted">
                                                    {Math.round((uploadProgress.current / uploadProgress.total) * 100)}% Complete
                                                </div>
                                            </div>

                                            {/* Current File Info */}
                                            <div className="alert alert-light border-warning">
                                                <p className="mb-1">
                                                    <strong>Current File:</strong> {uploadProgress.fileName}
                                                </p>
                                                <p className="mb-0">
                                                    <strong>Status:</strong> {uploadProgress.message}
                                                </p>
                                            </div>

                                            <p className="text-muted mt-3">
                                                Please wait while files are being uploaded...
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Upload Statistics */}
                    <div className="row mb-4">
                        <div className="col-md-12">
                            <div className="alert alert-info">
                                <div className="row text-center">
                                    <div className="col-md-3">
                                        <p>📁 <strong>Total:</strong> {stats.total}</p>
                                    </div>
                                    <div className="col-md-3">
                                        <p>📄 <strong>Selected:</strong> {stats.selected}</p>
                                    </div>
                                    <div className="col-md-3">
                                        <p>✅ <strong>Uploaded:</strong> {stats.uploaded}</p>
                                    </div>
                                    <div className="col-md-3">
                                        <p>⭐ <strong>Required:</strong> {stats.requiredUploaded}/{stats.requiredTotal}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Success/Failure Message */}
                    {uploadProgress.message && !uploading && (
                        <div className={`alert ${uploadProgress.message.includes('failed') ? 'alert-danger' : 'alert-success'} mb-4`}>
                            <div className="d-flex align-items-center">
                                <span className="me-2">{uploadProgress.message.includes('failed') ? '❌' : '✅'}</span>
                                <span>{uploadProgress.message}</span>
                            </div>
                        </div>
                    )}

                    {/* Documents List */}
                    {documentTypes.map((docType) => {
                        const docData = documents[docType.id] || {};
                        const fieldInfo = docType.field_info || {};
                        const isRequired = fieldInfo.required === true || fieldInfo.required === 1;
                        const allowedTypes = fieldInfo.file_type || [];
                        const maxSize = fieldInfo.size || 5;
                        const isDeleting = deleting[docType.id] || false;

                        return (
                            <div key={docType.id} className="document-upload-item mb-4 p-3 border rounded">
                                <div className="row align-items-center">
                                    <div className="col-md-3">
                                        <label className="form-label fw-bold">
                                            {docType.name}
                                            {isRequired && <span className="text-danger"> *</span>}
                                        </label>
                                        <div className="mt-1">
                                            {isRequired && !docData.uploaded && (
                                                <span className="badge bg-danger">Required</span>
                                            )}
                                            {docData.uploaded && (
                                                <span className="badge bg-success">Uploaded</span>
                                            )}
                                            {docData.file && !docData.uploaded && (
                                                <span className="badge bg-warning text-dark">Pending Upload</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-md-7">
                                        <div className="input-group">
                                            <input
                                                ref={el => fileInputRefs.current[docType.id] = el}
                                                type="file"
                                                className="form-control"
                                                id={`file-${docType.id}`}
                                                accept={allowedTypes.map(type => `.${type}`).join(',')}
                                                onChange={(e) => handleFileChange(docType.id, e)}
                                                disabled={uploading || submitLoading || isDeleting}
                                            />
                                            {docData.file && !docData.uploaded && (
                                                <button
                                                    className="btn btn-outline-danger"
                                                    type="button"
                                                    onClick={() => handleRemoveFile(docType.id)}
                                                    disabled={uploading || submitLoading || isDeleting}
                                                >
                                                    × Remove
                                                </button>
                                            )}
                                        </div>

                                        {docData.fileName && (
                                            <small className={`text-${docData.uploaded ? 'success' : 'warning'} d-block mt-1`}>
                                                {docData.uploaded ? '✅ Uploaded: ' : '📄 Selected: '}
                                                {docData.fileName}
                                            </small>
                                        )}

                                        {docData.error && (
                                            <small className="text-danger d-block mt-1">
                                                ⚠️ {docData.error}
                                            </small>
                                        )}

                                        <small className="text-muted d-block mt-1">
                                            Allowed: {allowedTypes.map(t => t.toUpperCase()).join(', ')} |
                                            Max: {maxSize}MB {!isRequired && '| Optional'}
                                        </small>

                                        {docData.uploaded && (
                                            <div className="mt-2">
                                                <small className="text-info">
                                                    ℹ️ To change this document, select a new file above and click "Upload All Files"
                                                </small>
                                            </div>
                                        )}
                                    </div>
                                    <div className="col-md-2">
                                        {docData.fileUrl && (
                                            <>
                                                <a
                                                    href={docData.fileUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn btn-sm btn-outline-success w-100 mb-1"
                                                >
                                                    👁️ View
                                                </a>
                                                {/* <button
                                                    className="btn btn-sm btn-outline-danger w-100"
                                                    onClick={() => deleteUploadedFile(docType.id)}
                                                    disabled={uploading || submitLoading || isDeleting}
                                                >
                                                    {isDeleting ? (
                                                        <>
                                                            <span className="spinner-border spinner-border-sm me-1"></span>
                                                            Deleting...
                                                        </>
                                                    ) : '🗑️ Delete'}
                                                </button> */}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Action Buttons */}
                    <div className="text-center mt-4">
                        {token ? (
                            <>
                                <div className="mb-3">
                                    <button
                                        className="btn btn-warning me-3"
                                        style={{
                                            padding: "12px 40px",
                                            borderRadius: "8px",
                                            fontWeight: "600",
                                            fontSize: "16px",
                                        }}
                                        onClick={uploadAllDocuments}
                                        disabled={uploading || submitLoading || stats.selected === 0}
                                    >
                                        {uploading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Uploading...
                                            </>
                                        ) : '📤 Upload All Files'}
                                    </button>

                                    <button
                                        className="btn btn-apply"
                                        style={{
                                            padding: "12px 40px",
                                            borderRadius: "8px",
                                            fontWeight: "600",
                                            fontSize: "16px",
                                        }}
                                        onClick={handleSubmit}
                                        disabled={submitLoading || uploading || stats.requiredUploaded < stats.requiredTotal}
                                    >
                                        {submitLoading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Submitting...
                                            </>
                                        ) : '✅ Submit Documents'}
                                    </button>
                                </div>

                                <div>
                                    <button
                                        className="btn btn-outline-secondary"
                                        onClick={() => {
                                            const resetDocs = { ...documents };
                                            Object.keys(resetDocs).forEach(id => {
                                                if (!resetDocs[id].uploaded) {
                                                    resetDocs[id] = {
                                                        ...resetDocs[id],
                                                        file: null,
                                                        fileName: '',
                                                        fileUrl: '',
                                                        error: ''
                                                    };
                                                    if (fileInputRefs.current[id]) {
                                                        fileInputRefs.current[id].value = '';
                                                    }
                                                }
                                            });
                                            setDocuments(resetDocs);
                                        }}
                                        disabled={submitLoading || uploading}
                                    >
                                        🗑️ Clear Selection
                                    </button>
                                </div>
                            </>
                        ) : (
                            <Link
                                to={"/login"}
                                className="btn btn-apply"
                                style={{
                                    padding: "12px 40px",
                                    borderRadius: "8px",
                                    fontWeight: "600",
                                    fontSize: "16px",
                                }}
                            >
                                🔐 Log in to Apply Now
                            </Link>
                        )}
                    </div>

                    {/* Instructions */}
                    <div className="mt-4">
                        <div className="alert alert-light border-info">
                            <h6>📋 How to Upload/Change Documents:</h6>
                            <ol className="mb-0">
                                <li>To upload a new document, select a file using the file input</li>
                                <li>To <strong>change an uploaded document</strong>:
                                    <ul>
                                        <li>Select a new file for the document type</li>
                                        <li>Click <strong>"Upload All Files"</strong> to upload the new file</li>
                                        <li>The new file will replace the existing one</li>
                                    </ul>
                                </li>
                                <li>To <strong>delete an uploaded document</strong>, click the <span className="badge bg-danger">Delete</span> button</li>
                                <li>Click <strong>"Upload All Files"</strong> (yellow button) to upload selected files</li>
                                <li>Once all required files show <span className="badge bg-success">Uploaded</span>, click <strong>"Submit Documents"</strong></li>
                                <li>All required documents (<span className="text-danger">*</span>) must be uploaded before submission</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ParticipantDocument