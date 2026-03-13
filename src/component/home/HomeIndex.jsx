import { useSelector } from "react-redux";
import ApiClient from "../ApiClient";
import { useEffect, useState } from "react";
import Booknow from "../Booking/Booknow";
import { Link, useParams } from "react-router-dom";

const HomeIndex = () => {
    const websiteData = useSelector((state) => state.website.data);
    const { title } = useParams();
    const { getRequestApi } = ApiClient();

    const post_meta = websiteData?.post_meta ?? {};
    const event_manage = websiteData?.event_manage ?? {};

    const [selectedDate, setSelectedDate] = useState("");
    const [shows, setShows] = useState([]);
    const [datarefresh, setDatarefresh] = useState(0);
    const [loading, setLoading] = useState(false);
    const [selectedTab, setSelectedTab] = useState(0);

    // Format date to display day and date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.toLocaleDateString('en-US', { weekday: 'short' });
        const dateNum = date.getDate();
        return { day, dateNum, fullDate: dateString };
    };

    // Get all formatted dates from event_manage
    const formattedDates = event_manage?.dates?.map(formatDate) || [];

    // Set initial selected date
    useEffect(() => {
        if (formattedDates.length > 0 && !selectedDate) {
            setSelectedDate(formattedDates[0].fullDate);
        }
    }, [formattedDates]);

    // Load shows for selected date
    useEffect(() => {
        if (selectedDate) {
            loadShowtimeForDate();
        }
    }, [selectedDate, event_manage?.event_id, datarefresh]);

    const loadShowtimeForDate = async () => {
        setLoading(true);
        try {

            const response = await getRequestApi(
                `delegate/getShows`,
                { date: selectedDate, title }
            );

            if (response.status) {
                setShows(response.data);
            } else {
                setShows([]);
            }
        } catch (error) {
            console.error("Error loading shows:", error);
            setShows([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDateClick = (date, index, e) => {
        e.preventDefault();
        setSelectedDate(date);
        setSelectedTab(index);
    };

    // Helper function to get image URL
    const getImageUrl = (url) => {
        if (url?.startsWith('http')) return url;
        if (url) return `https://inventory.nfdcindia.com/nfaiapi/api/gallery/${url}`;
        return 'images/default-movie.jpg';
    };

    return (
        <>
            <div className="dadaSaheb">
                <div className="container">
                    <div className="text-center col-md-10 mx-auto">
                        <h1 className="mt-4">{post_meta.heading || "Film Festival"} </h1>
                        <p>
                            {post_meta.sub_heading || "Experience the magic of cinema"}
                        </p>
                    </div>

                    {/* Date Navigation Tabs */}
                    <div className="mt-5">
                        <ul className="customTabs" id="myTabs" role="tablist">
                            {formattedDates.map((date, index) => (
                                <li className="nav-item" key={date.fullDate} role="presentation">
                                    <span>{date.day}</span>
                                    <a
                                        className={`nav-link ${selectedTab === index ? 'active' : ''}`}
                                        id={`date-tab-${index}`}
                                        data-bs-toggle="tab"
                                        // href={`#date-${index}`}
                                        role="tab"
                                        aria-controls={`date-${index}`}
                                        aria-selected={selectedTab === index}
                                        onClick={(e) => handleDateClick(date.fullDate, index, e)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {date.dateNum}
                                    </a>
                                </li>
                            ))}
                        </ul>

                        {/* Loading State */}
                        {loading && (
                            <div className="text-center my-5">
                                <div className="spinner-border" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        )}

                        {/* Shows Display */}
                        {!loading && shows.length > 0 ? (
                            <div className="row">
                                {shows.map((show, index) => (
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

                                                <i className="bi bi-receipt"></i> Seats: {show.total_book_seats || 0}/{show.total_seats || 0}
                                            </p>
                                            <p>
                                                <i className="bi bi-camera-reels"></i>
                                                {show.audi?.name || "Unknown Auditorium"}
                                            </p>
                                            <div className="mt-3">
                                                <Booknow show={show} setDatarefresh={setDatarefresh} datarefresh={datarefresh} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : !loading ? (
                            <div className="text-center my-5">
                                <p className="text-muted">No shows scheduled for this date.</p>
                            </div>
                        ) : null}

                        {/* Debug Info (remove in production) */}

                    </div>
                </div>
            </div >
        </>
    )
}

export default HomeIndex;