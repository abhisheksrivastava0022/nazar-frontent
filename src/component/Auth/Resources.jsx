import React from "react";

const Resources = () => {
  // Sample data array for resources
  const resourcesData = [
    {
      id: 1,
      title: "Anti-piracy guidelines for film industry",
      image: "/images/word-to-pdf-conversion.svg",
    },
    {
      id: 2,
      title: "Copyright registration process",
      image: "/images/word-to-pdf-conversion.svg",
    },
    {
      id: 3,
      title: "Digital rights management basics",
      image: "/images/word-to-pdf-conversion.svg",
    },
    {
      id: 4,
      title: "Content protection strategies",
      image: "/images/word-to-pdf-conversion.svg",
    },
  ];

  return (
    <>
      <div className="complaint-form">
        <div className="headeing">
          <h4 className="mb-0">Resources</h4>
        </div>
        <div className="details">
          <div className="row g-4">
            {" "}
            {/* Added g-4 for gap between cards */}
            {resourcesData.map((resource) => (
              <div key={resource.id} className="col-md-6 col-lg-6 col-xl-6">
                {" "}
                {/* 4 columns on xl screens */}
                <div className="card h-100 shadow-sm hover-effect">
                  <div className="card-header">
                    <p className="mb-0 fw-semibold">{resource.title}</p>
                  </div>
                  <div className="card-body d-flex align-items-center justify-content-center p-3">
                    <img
                      src={resource.image}
                      className="img-fluid resource-image"
                      alt={resource.title}
                      style={{ maxHeight: "120px", objectFit: "contain" }}
                    />
                  </div>
                  <div className="card-footer bg-transparent border-0 pb-3">
                    <button className="btn btn-outline-primary btn-sm w-100">
                     <i class="bi bi-download me-1"></i>  Download PDF
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Resources;
