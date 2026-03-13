import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import ApiClient from '../ApiClient';
import Booknow from '../Booking/Booknow';

const MovieDetails = () => {
    const { slug } = useParams();
    const { getRequestApi } = ApiClient();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const getImageUrl = (url) => {
        if (url?.startsWith('http')) return url;
        if (url) return `https://inventory.nfdcindia.com/nfaiapi/api/gallery/${url}`;
        return 'images/default-movie.jpg';
    };
    useEffect(() => {
        fetchMovie();
    }, [slug]) // Added slug as dependency

    const fetchMovie = async () => {
        setLoading(true);
        try {
            const response = await getRequestApi("delegate/movieDetails", { slug });
            if (response.status) {
                setData(response.data);
            }
        } catch (error) {
            console.error("Error fetching movie details:", error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="dadaSaheb">
                <div className="container">
                    <div className="text-center mt-4">
                        <p>Loading...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="dadaSaheb">
                <div className="container">
                    <div className="text-center mt-4">
                        <p>Movie not found</p>
                    </div>
                </div>
            </div>
        );
    }

    // Format date from "08-01-2026" to "22 Dec, 2025" format
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const [day, month, year] = dateString.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        return date.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    // Format time from "14:00:00" to "14:00" format
    const formatTime = (timeString) => {
        if (!timeString) return '';
        return timeString.slice(0, 5);
    };

    return (
        <>
            <div className="dadaSaheb">
                <div className="container">
                    <div className="text-left " >
                        <h1 className="mt-4">{data.title}</h1>
                        <p>
                            {data.post_meta?.duration} • {data.post_meta?.genre} • {formatDate(data.post_meta?.date)}
                        </p>
                        <div className="black-btn">
                            <span>{data.post_meta?.feature}</span>
                            <span>{data.post_meta?.language}</span>
                        </div>
                    </div>
                    <div className=" row mt-4">
                        <div className="col-sm-8">
                            <div className="thumb-img mb-4">
                                <div className="col-lg-12 img-border-line">
                                    <img
                                        src={getImageUrl(`${data.featured_image?.url}`)}
                                        alt={data.title}
                                        className="img-fluid"
                                    />
                                    <div className='line-img'></div>
                                </div>

                            </div>
                            <div className="content-box mb-4">
                                <h4> About the movie</h4>
                                <p>{data.post_meta?.about_the_movie || data.post_meta?.storyline}</p>
                            </div>

                            {data.post_meta?.festival_history && (
                                <div className="content-box mb-4">
                                    <h4> Festival History</h4>
                                    <p>{data.post_meta.festival_history}</p>
                                </div>
                            )}

                            {data.post_meta?.awards && (
                                <div className="content-box mb-4">
                                    <h4> Awards</h4>
                                    <p>{data.post_meta.awards}</p>
                                </div>
                            )}

                            <div className="content-box mb-4">
                                <p><b>Director :</b> {data.post_meta?.director}</p>
                                <p><b>Cast :</b> {data.post_meta?.cast}</p>
                            </div>


                        </div>
                        <div className="col-sm-4">
                            <div className="content-box mb-4">
                                <h4>Ticket Booking</h4>
                                <p>To book a ticket, please login to your account</p>

                            </div>

                            {data.shows && data.shows.length > 0 && (
                                <div className="content-box">
                                    <h4>Screenings</h4>
                                    {data.shows.map((show, index) => (
                                        <ul key={show.id} className="date-time-screen">
                                            <li><i className="bi bi-calendar2-week"></i> {formatDate(data.post_meta?.date)}</li>
                                            <li><i className="bi bi-clock"></i> {formatTime(show.start_time)} - {formatTime(show.end_time)}</li>
                                            <li><i className="bi bi-geo-alt"></i> {show.audi?.name}, {show.audi?.post?.title}</li>
                                            <li><Booknow show={show} /></li>
                                        </ul>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default MovieDetails