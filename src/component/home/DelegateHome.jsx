import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ApiClient from '../ApiClient';
import PaymentModule from '../PaymentModule';

const DelegateHome = () => {
    const { getRequestApi, getRequestApiwithLogin } = ApiClient();
    const [data, setData] = useState([]);
    const [userInfo, setUserInfo] = useState([]);
    let userData = localStorage.getItem("userData");
    const token = localStorage.getItem("token");

    if (userData) {
        userData = JSON.parse(userData);
    }
    useEffect(() => {
        loadData();
    }, []);
    const loadData = async () => {
        const [response, responseuser] = await Promise.all([
            getRequestApi("post/type/participate/en"),
            token ? getRequestApiwithLogin('event/profile') : Promise.resolve({ status: false })
        ]);

        if (response.status) {
            setData(response.data);
        }
        if (responseuser.status) {
            setUserInfo(responseuser.data);
        }
    }
    const showForm = (type, price) => {
        console.log(type, price);
        // your logic here type
    };

    return (
        <div>
            <header className="hero-section text-center">
                <div className="container">
                    <h1 className="display-5 fw-bold text-dark">Delegate Registration</h1>
                    <p className="lead text-dark">
                        Select your category and apply for the upcoming festival.
                    </p>
                </div>
            </header>

            <div className="container mb-5" id="apply-section">
                <div className="row g-4 justify-content-center">
                    {userInfo?.delegate_accredation ?
                        <>
                            <div className="col-md-12" >
                                <div className="card card-registration h-100 p-4 text-center">
                                    <h4 className="text-uppercase tracking-wider">
                                        {userInfo.participant_type.title}
                                    </h4>

                                    <hr className="mx-auto w-25" />

                                    <p className="text-muted small">
                                        <div className="price-tag my-3">{userInfo.participant_type.post_meta.tagline}
                                        </div>
                                    </p>
                                    {userInfo.participant_type.post_meta.price && userInfo.participant_type.post_meta.price != 0 ?
                                        <div className="price-tag my-3"> {userInfo.participant_type.post_meta.price}</div>
                                        : <div className="price-tag my-3"> Free</div>
                                    }
                                    {
                                        userInfo?.delegate_accredation.status == "confirmed" ?
                                            <PaymentModule data={userInfo?.delegate_accredation} />
                                            :

                                            <Link

                                                className="btn btn-apply mt-auto"
                                                style={{ background: "#7ce37c" }}
                                            >
                                                {userInfo?.delegate_accredation.status}
                                            </Link>
                                    }

                                </div>
                            </div>
                        </>
                        :

                        <>

                            {
                                data && data.map((item, index) => {
                                    return (
                                        <div className="col-md-4" key={index}>
                                            <div className="card card-registration h-100 p-4 text-center">
                                                <h4 className="text-uppercase tracking-wider">
                                                    {item.title}
                                                </h4>

                                                <hr className="mx-auto w-25" />

                                                <p className="text-muted small">
                                                    {item?.post_meta?.tagline}
                                                </p>
                                                {item?.post_meta?.price && item.post_meta.price != 0 ?
                                                    <div className="price-tag my-3"> {item?.post_meta?.price}</div>
                                                    : <div className="price-tag my-3"> Free</div>
                                                }

                                                <Link
                                                    to={`/participants/${item.slug}`}
                                                    className="btn btn-apply mt-auto"
                                                >
                                                    Apply Now
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })
                            }
                        </>
                    }
                </div>
            </div>
        </div>
    );
};

export default DelegateHome;
