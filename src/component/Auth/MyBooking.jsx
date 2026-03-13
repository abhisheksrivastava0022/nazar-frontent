import React, { useEffect, useState } from 'react'
import ApiClient from '../ApiClient'
import { Link } from 'react-router-dom';
import Booknow from '../Booking/Booknow';

const MyBooking = () => {
    const { getRequestApiwithLogin } = ApiClient();
    const [data, setData] = useState([]);
    useEffect(() => {
        dataLoad()
    }, [])
    const dataLoad = async () => {
        const response = await getRequestApiwithLogin("event/my-booking");
        if (response.status) {
            setData(response.data);
        }
    }
    const getImageUrl = (url) => {
        if (url?.startsWith('http')) return url;
        if (url) return `https://inventory.nfdcindia.com/nfaiapi/api/gallery/${url}`;
        return 'images/default-movie.jpg';
    };
    return (
        <> {data.length > 0 ? (
            <div className="container">
            <div className="row mt-4">
                {data.map((show, index) => (
                    <div className="col-sm-3 mb-4 thumbimg" key={`${show.movie_id}-${show.start_time}`}>
                        <Link to={`movie/${show.post.slug}`}>
                            <img
                                src={getImageUrl(show.post?.gallery?.url)}
                                alt={show.post?.title || "Movie Poster"}
                                className="img-fluid"
                                style={{
                                    width: '100%',
                                    height: 'auto',
                                    objectFit: 'cover',
                                    borderRadius: '8px'
                                }}
                            /></Link>
                        <div className="name-desigation">
                            <p className="name">{show.post?.title || "Unknown Movie"}</p>
                            <p className="year">
                                <i className="bi bi-clock"></i>
                                {show.start_time?.substring(0, 5)} - {show.end_time?.substring(0, 5)}
                            </p>
                            <p>
                                <i className="bi bi-geo-alt"></i> {show.audi?.post?.title || "Unknown Theater"}
                            </p>
                            <p>
                               <i className="bi bi-receipt"></i>
                               h Seats: {show.total_book_seats || 0}/{show.total_seats || 0}
                            </p>
                            <p>
                                <i className="bi bi-camera-reels"></i>
                                {show.audi?.name || "Unknown Auditorium"}
                            </p>
                            <div className="mt-4">
                            <Booknow show={show} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            </div>
        ) : (
            <div className="text-center my-5">
                <p className="text-muted">No  scheduled found for this date.</p>
            </div>
        )
        }
        </>
    )
}

export default MyBooking