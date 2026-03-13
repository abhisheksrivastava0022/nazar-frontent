import React, { useEffect, useState } from 'react'
import ApiClient from '../ApiClient'
import { Link, useParams } from 'react-router-dom'
import PaymentModule from '../PaymentModule';

const Participant = () => {
    const { slug } = useParams();
    const [data, setData] = useState();
    const { getRequestApi } = ApiClient();
    const token = localStorage.getItem("token");

    useEffect(() => {
        loadData();
    }, [slug])

    const loadData = async () => {
        const res = await getRequestApi(`post/${slug}/en`);
        if (res.status) {
            setData(res.data)
        } else {
            alert("data loading error");
        }
    }
    return (
        <>
            {/* <header className="hero-section text-center">
                <div className="container">
                    <h1 className="display-5 fw-bold text-dark text-uppercase">{data?.title}</h1>

                </div>

            </header> */}
            <div className="col-md-12">
                <div className="card card-registration h-100 p-4 text-center">

                    <div dangerouslySetInnerHTML={{ __html: data?.content }} />
                    <div className="col-md-4">
                        {
                            token ?

                                <PaymentModule
                                    data={data}
                                />
                                :
                                <><Link
                                    to={"/login"}
                                    className="btn btn-apply mt-auto"

                                >
                                    logged in to Apply Now
                                </Link></>
                        }

                    </div>
                </div>
            </div>

        </>
    )
}

export default Participant