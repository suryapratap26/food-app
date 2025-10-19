import { Link } from "react-router-dom";
import { asset } from "../../assets/asset.js";
import './header.css'
const Header = () => {
    return (
        <header className="header-container position-relative overflow-hidden text-center text-white">
           
            <video
                autoPlay
                loop
                muted
                playsInline
                className="background-video position-absolute top-0 start-0 w-80 h-70 object-fit-cover"
            >
                <source src={asset.video} type="video/mp4" />
                Your browser does not support the video tag.
            </video>

            <div className="overlay position-absolute top-0 start-0 w-100 h-100"></div>

            <div className="container position-relative z-1 d-flex flex-column justify-content-center align-items-center min-vh-100">
                <h1 className="display-4 fw-bold mb-3 animate-fade">
                    Order Your{" "}
                    <span className="text-gradient fw-bolder">Favorite Food</span> Here
                </h1>
                <p className="lead mb-4 animate-fade-delay">
                    Discover the best food and drinks — fast, fresh, and delicious.
                </p>
                <Link
                    to="/explore"
                    className="btn btn-lg btn-primary px-5 py-2 rounded-pill shadow hover-scale"
                >
                    <i className="bi bi-arrow-right-circle me-2"></i> Explore Menu
                </Link>
            </div>
        </header>
    );
};

export default Header;
