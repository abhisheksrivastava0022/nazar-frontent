import { Outlet, useNavigate } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { useEffect } from "react";
import { setWebsite } from "../../action";
import { useDispatch } from "react-redux";
import ApiClient from "../ApiClient";
import { useLocation } from "react-router-dom";

const MainLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/");
    }
  }, []);
  console.log({ pathname: location.pathname });
  const dispatch = useDispatch();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };
  return (
    <>
      <div class="container mt-2 mb-5">
        <Header />
        <div class="row ">
          <div class="col-md-3"></div>
          <div class="col-md-9 ">
            {/* <h2 class="white-txt"> Registration Form for </h2>
            <p class="orange-text text-uppercase">Delegate</p> */}
          </div>
          <div class="col-md-3 mt-4 left-menu">
            <p className="text-center mb-0">
              {" "}
              <img src="/profile-img.jpg" alt="miff" className="profile-img" />
            </p>
            <p className="text-center">
              Hi, <b>Digital Team</b>
            </p>

            <div
              class="nav flex-column nav-pills tab-btn"
              id="v-tabs"
              role="tablist"
            >
              <button
                class={`nav-link ${location.pathname == "/request/create" ? "active" : ""}`}
                data-bs-toggle="pill"
                data-bs-target="#tab2"
                type="button"
                onClick={() => navigate("/request/create")}
              >
                <i class="bi bi-people"></i> Register Complaint
              </button>
              <button
                class={`nav-link ${location.pathname == "/request-list" ? "active" : ""}`}
                data-bs-toggle="pill"
                data-bs-target="#tab1"
                type="button"
                onClick={() => navigate("/request-list")}
              >
                <i class="bi bi-receipt-cutoff"></i> My complaints
              </button>
              <button
                class={`nav-link ${location.pathname == "/resources" ? "active" : ""}`}
                data-bs-toggle="pill"
                data-bs-target="#tab3"
                type="button"
                onClick={() => navigate("/resources")}
              >
                <i class="bi bi-music-note-list"></i> Resource
              </button>
              <button
                class={`nav-link`}
                data-bs-toggle="pill"
                data-bs-target="#tab4"
                type="button"
                onClick={logout}
              >
                <i class="bi bi-box-arrow-right"></i> Logout
              </button>
            </div>
          </div>
          <div class="col-md-9">
            <Outlet />
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default MainLayout;
