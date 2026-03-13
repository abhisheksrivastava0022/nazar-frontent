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
      <div className="container mb-4">
        <Header />
        <div className="mt-3">
          <div className="card">
            <div className="">
              {/* Main content area */}
              <div className="row">
                <div className="col-md-4 g-0">
                  <div className="menu-header">
                    {/* User Detail's */}
                    <div className="user-detail">
                      <div>
                        <p className="mb-0">
                          {/* <img
                          src="/profile-img.jpg"
                          alt="miff"
                          className="profile-img"
                        /> */}
                          <i class="bi bi-person-circle"></i>
                        </p>
                      </div>
                      <div>
                        <p className="mb-0">Welcome</p>
                        <h6>Digital Team</h6>
                      </div>
                    </div>
                    {/* Menu List */}
                    <div className="menu-list">
                      <div
                        class="nav flex-column nav-pills "
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
                          class={`nav-link logout-btn`}
                          data-bs-toggle="pill"
                          data-bs-target="#tab4"
                          type="button"
                          onClick={logout}
                        >
                          <i class="bi bi-box-arrow-right"></i> Logout
                        </button>
                      </div>
                    </div>
                    <div className="menu-image">
                      <img
                        src="/images/menu-img.png"
                        alt=""
                        className="img-fluid"
                      />
                    </div>
                  </div>
                </div>
                <div className="col-md-8 g-0">
                  {/* Calling Component By using Outlet */}
                  <Outlet />
                </div>
              </div>
            </div>
            <div className="card-footer">
              {/* Footer actions or information */}
              <Footer />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MainLayout;
