import React from "react";

const Footer = () => {
  return (
    <>
      <footer className="footer mt-auto ">
        <div className="container text-center">
          {/* <p className="small text-muted mb-0"> */}
          <p className="mb-0">
            &copy; {new Date().getFullYear()} nfdcindia.com. All rights
            reserved.
          </p>
        </div>
      </footer>
    </>
  );
};

export default Footer;
