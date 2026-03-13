import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ApiClient from '../ApiClient';
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';

const FormAvailableFor = () => {
    const { getRequestApi } = ApiClient();
    const navigate = useNavigate();
    const location = useLocation();
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getRequestApi("delegate/editions");
            if (response?.status && response?.data) {
                setForms(response.data);
            } else {
                setError('Failed to load forms');
            }
        } catch (error) {
            console.error("Error loading forms:", error);
            setError('An error occurred while loading forms');
        } finally {
            setLoading(false);
        }
    };

    // Simple encryption function for URL parameters
    const encryptParam = (data) => {
        // Base64 encode the string to make it look encrypted
        return btoa(JSON.stringify(data));
    };

    const handleFormSelect = (form) => {
        // Create encrypted payload
        const encryptedData = encryptParam({
            formId: form.id,
            formName: form.form_name,
            timestamp: Date.now()
        });

        // Redirect with encrypted parameter
        navigate(`/login-otp/${form.form_name.toLowerCase()}`)
        // navigate(`/login-otp/${encryptedData}`, {
        //     state: {
        //         formData: form,
        //         from: location.pathname
        //     }
        // });
    };

    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                <div className="text-center">
                    <Spinner animation="border" variant="primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                    <p className="mt-3 text-muted">Loading forms...</p>
                </div>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="mt-5">
                <Alert variant="danger" className="text-center">
                    <Alert.Heading>Error</Alert.Heading>
                    <p>{error}</p>
                    <hr />
                    <div className="d-flex justify-content-center">
                        <button className="btn btn-outline-danger" onClick={loadData}>
                            Try Again
                        </button>
                    </div>
                </Alert>
            </Container>
        );
    }

    return (
        <Container className="py-5">
            {/* Header Section */}
            <Row className="mb-4">
                <Col className="text-center">
                    <h2 className="display-6 fw-bold text-primary mb-3 section-title">
                       <span>Available</span>  Forms
                    </h2>
                    <p className="text-muted">
                        Select a form to proceed with registration
                    </p>
                </Col>
            </Row>

            {/* Forms Grid */}
            {forms.length === 0 ? (
                <Row>
                    <Col>
                        <Alert variant="info" className="text-center">
                            <i className="bi bi-info-circle me-2"></i>
                            No forms available at the moment
                        </Alert>
                    </Col>
                </Row>
            ) : (
                <Row xs={1} md={2} lg={3} className="g-4">
                    {forms.map((form) => (
                        <Col key={form.id}>
                            <Card
                                className="h-100 shadow-sm hover-effect"
                                role="button"
                                onClick={() => handleFormSelect(form)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        handleFormSelect(form);
                                    }
                                }}
                                tabIndex={0}
                                style={{
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                }}

                            >
                                <div className="position-relative" style={{ paddingTop: '60%' }}>
                                    <Card.Img
                                        variant="top"
                                        src={form.image}
                                        alt={form.form_name}
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                                        }}
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                        }}
                                    />
                                </div>

                                <Card.Body className="d-flex flex-column">
                                    <Card.Title className="h5 fw-bold mb-3">
                                        {form.form_name}
                                    </Card.Title>

                                    <div className="mt-auto d-flex justify-content-between align-items-center">
                                        <span className="text-primary">
                                            Click to select
                                        </span>
                                        <i className="bi bi-arrow-right-circle-fill"></i>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}

            {/* Bootstrap Icons - Add this to your public/index.html or install bootstrap-icons */}
            <style>{`
        .hover-effect:hover {
          transform: translateY(-5px);
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
        }
        
        .hover-effect:focus {
          outline: none;
          box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25) !important;
        }
        
        .card {
          border-radius: 12px;
          overflow: hidden;
        }
      `}</style>
        </Container>
    );
};

export default FormAvailableFor;