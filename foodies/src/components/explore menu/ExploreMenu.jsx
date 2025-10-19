import { useRef } from "react";
import { categories } from "./../../assets/asset";
import "./ExploreMenu.css";

const ExploreMenu = ({ category, setCategory }) => {
    const menuRef = useRef(null);

    const scrollLeft = () => {
        if (menuRef.current) {
            menuRef.current.scrollBy({ left: -200, behavior: "smooth" });
        }
    };

    const scrollRight = () => {
        if (menuRef.current) {
            menuRef.current.scrollBy({ left: 200, behavior: "smooth" });
        }
    };

    return (
        <div className="container my-5">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="fw-bold text-danger">Explore Our Menu</h2>
                <div>
                    <i
                        className="bi bi-arrow-left-circle fs-3 text-secondary me-2 cursor-pointer hover-scale"
                        onClick={scrollLeft}
                    ></i>
                    <i
                        className="bi bi-arrow-right-circle fs-3 text-secondary cursor-pointer hover-scale"
                        onClick={scrollRight}
                    ></i>
                </div>
            </div>

            <p className="text-muted mb-4">
                Order from our best food options
            </p>

            <div ref={menuRef} className="d-flex overflow-auto gap-4 pb-3 scroll-snap">
                {categories.map((item, index) => {
                    const isActive = item.category === category;
                    return (
                        <div
                            key={index}
                            className={`category-card text-center flex-shrink-0 p-3 rounded shadow-sm ${
                                isActive ? "active-category" : ""
                            }`}
                            style={{ width: "120px" }}
                            onClick={() =>
                                setCategory((prev) =>
                                    prev === item.category ? "All" : item.category
                                )
                            }
                        >
                            <img
                                src={item.icon}
                                alt={item.category}
                                className={`rounded-circle mb-2 category-icon ${
                                    isActive ? "border border-3 border-danger" : ""
                                }`}
                            />
                            <p className="text-capitalize small fw-semibold mb-0">
                                {item.category}
                            </p>
                        </div>
                    );
                })}
            </div>

            <hr className="mt-4" />
        </div>
    );
};

export default ExploreMenu;
