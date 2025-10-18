import { Link } from 'react-router-dom';
import { asset } from '../../assets/asset';

const Footer = () => {
    return (
        <footer className="bg-dark text-white pt-5 pb-3 mt-5">
            <div className="container">
                <div className="row">

                    {/* Logo and About */}
                    <div className="col-md-4 mb-4">
                        <img src={asset.logo} alt="Logo" width={60} height={60} className="mb-3" />
                        <p>
                            Delicious food delivered fast to your doorstep. Enjoy fresh meals from your favorite restaurants.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="col-md-4 mb-4">
                        <h5 className="mb-3">Quick Links</h5>
                        <ul className="list-unstyled">
                            <li><Link to="/" className="text-white text-decoration-none">Home</Link></li>
                            <li><Link to="/explore" className="text-white text-decoration-none">Explore Menu</Link></li>
                            <li><Link to="/cart" className="text-white text-decoration-none">Cart</Link></li>
                            <li><Link to="/contact" className="text-white text-decoration-none">Contact Us</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="col-md-4 mb-4">
                        <h5 className="mb-3">Contact</h5>
                        <p><i className="bi bi-geo-alt-fill me-2"></i>123 Food Street, City, Country</p>
                        <p><i className="bi bi-telephone-fill me-2"></i>+91 98765 43210</p>
                        <p><i className="bi bi-envelope-fill me-2"></i>support@foodapp.com</p>

                        <div className="d-flex gap-2 mt-2">
                            <a href="#" className="text-white fs-5"><i className="bi bi-facebook"></i></a>
                            <a href="#" className="text-white fs-5"><i className="bi bi-twitter"></i></a>
                            <a href="#" className="text-white fs-5"><i className="bi bi-instagram"></i></a>
                        </div>
                    </div>

                </div>

                <hr className="bg-secondary" />

                <div className="text-center">
                    <p className="mb-0">&copy; {new Date().getFullYear()} FoodApp. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
