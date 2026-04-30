import { Link } from "react-router-dom";
import { asset } from "../../assets/asset";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer-section text-white pt-5 pb-3">
      <div className="container">
        <div className="row">
          <div className="col-md-4 mb-4">
            <img
              src={asset.logo}
              alt="Logo"
              width={60}
              height={60}
              className="mb-3 rounded-circle footer-logo"
            />
            <p className="footer-copy">
              Warm meals, smooth ordering, and a friendlier food experience for everyday cravings and weekend treats.
            </p>
          </div>

          <div className="col-md-4 mb-4">
            <h5 className="mb-3">Quick Links</h5>
            <ul className="list-unstyled footer-links">
              <li>
                <Link to="/" className="text-white text-decoration-none">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/explore" className="text-white text-decoration-none">
                  Explore Menu
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-white text-decoration-none">
                  Cart
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-white text-decoration-none">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-md-4 mb-4">
            <h5 className="mb-3">Contact</h5>
           
            <p className="footer-contact">
              <i className="bi bi-telephone-fill me-2"></i>+91 7023641686
            </p>
            <p className="footer-contact">
              <i className="bi bi-envelope-fill me-2"></i>kspk702364@gmail.com
            </p>

            <div className="d-flex gap-2 mt-2">
              <a
                href="https://www.linkedin.com/in/surya-pratap-singh-chundawat-7945422bb"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white fs-5 text-decoration-none footer-social"
              >
                <i className="bi bi-linkedin"></i> Linkedin </a>
           
            </div>
          </div>
        </div>

        <hr className="footer-divider" />

        <div className="text-center">
          <p className="mb-0">
            &copy; {new Date().getFullYear()} KSPK Foods. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
