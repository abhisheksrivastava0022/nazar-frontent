import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import ApiClient from "../ApiClient";
// import { setUserData } from "../../action";
import { setUserData } from "../../reducer/userDataSlice";
import { setFilmData } from "../../reducer/filmDataSlice";

const Header = () => {
  const dispatch = useDispatch();

  const { getRequestApiwithLogin, postRequestApiwithLogin } = ApiClient();
  const userData = useSelector((state) => state.user);

  const token = localStorage.getItem("token");
  const [showprofile, setShowprofile] = useState(null);
  const [showFormFor, setShowFormFor] = useState(null);
  const [
    delegate_accredation_admin_access,
    setDelegate_accredation_admin_access,
  ] = useState(null);
  //let userData = localStorage.getItem("userData");
  useEffect(() => {
    if (userData?.data) {
      const data = userData.data;
      if (data.delegate_other_details && data.delegate) {
        // navigate('/profile');
        setShowprofile("profile");
      } else if (data.delegate) {
        if (data.delegate_accredation.admin_access) {
          setDelegate_accredation_admin_access(true);
        }

        setShowprofile("profile-delegate");
      } else if (data.delegate_other_details) {
        const details = data.delegate_other_details.event_edition_form;
        setShowFormFor({
          url: details.type == 2 ? "delegate-registration" : "delegate-form",
          name: `Please complete your ${details.form_name}`,
        });
      }
    }
  }, [userData]);

  useEffect(() => {
    loadUserData();
  }, [token]);
  const loadUserData = async () => {
    console.log({ token });
    if (token) {
      // const response = await getRequestApiwithLogin("delegate/profile");
      const response = await getRequestApiwithLogin("request/info");

      console.log({ response });

      if (response.status) {
        // dispatch(setUserData(response.data));
        dispatch(setUserData(response?.data.user));
        dispatch(setFilmData(response?.data.movie));
      }
    }
  };

  const navigate = useNavigate();
  const hangleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <>
      <header className="d-flex align-items-center mt-2 py-2 top-header ">
        <div className="logo">
          <a href="/" className="d-block me-3" aria-label="Home">
            <img
              // src="/logonazar.png"
              src="/nazar.png"
              alt="National Anti-Piracy and Zero-Tolerance Action on Rights Infringement"
              // className="logo-width"
              className="img-fluid"
              style={{ maxHeight: "70px" }}
              loading="lazy"
            />
          </a>

          <a
            href="/"
            className="parhari d-block"
            aria-label="Ministry of Information & Broadcasting"
          >
            <img
              src="/mib.png"
              alt="Ministry of Information & Broadcasting"
              className="img-fluid"
              style={{ maxHeight: "70px" }}
              loading="lazy"
            />
          </a>
        </div>
        {/* Commented out for future use
  <a href="/" className="parhari d-block ms-3" aria-label="Prahari">
    <img 
      src="/prahari.png" 
      alt="Prahari Logo" 
      className="logo-width" 
      loading="lazy"
    />
  </a>
  */}

        <div class="dropdown profile-login">
          <button
            class="btn btn-primary outline-common dropdown-toggle"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <i class="bi bi-person-circle"></i> Digital Team
          </button>
          <ul class="dropdown-menu">
            <li>
              <button
                className="Login-btn"
                type="button"
                onClick={hangleLogout}
              >
                <i class="bi bi-box-arrow-right"></i> Logout
              </button>
            </li>
            {/* <li><a class="dropdown-item" href="#">Another action</a></li> */}
            {/* <li><a class="dropdown-item" href="#">Something else here</a></li> */}
          </ul>
        </div>
      </header>
    </>
  );
};

export default Header;
