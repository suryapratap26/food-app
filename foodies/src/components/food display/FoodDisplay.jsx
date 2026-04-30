import React, { useContext, useEffect, useState } from "react";
import { storeContext } from "../../context/StoreContext";
import FoodCard from "../foodCard/FoodCard";
import "./foodDisplay.css";
import { Link } from "react-router-dom";
import { asset } from "../../assets/asset";

const FoodDisplay = ({ category, searchText, isHomeView = false }) => {
    const { foodList, backendError, userProfile, token } = useContext(storeContext);
    const [filteredFood, setFilteredFood] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        const timeoutId = setTimeout(() => {
            const normalizedSearch = searchText.trim().toLowerCase();
            let newFilteredFood = [];

            const initialFiltered = foodList.filter((food) => {
                const matchesCategory = category === "All" || food.category === category;
                const matchesSearch =
                    food.name.toLowerCase().includes(normalizedSearch) ||
                    food.description?.toLowerCase().includes(normalizedSearch);

                if (!matchesCategory || !matchesSearch) {
                    return false;
                }
                return true;
            });

            const shouldLimitDisplay = isHomeView && category === "All";

            if (shouldLimitDisplay) {
                const addedCategories = new Set();
                for (const food of initialFiltered) {
                    if (!addedCategories.has(food.category)) {
                        newFilteredFood.push(food);
                        addedCategories.add(food.category);
                    }
                }
            } else {
                newFilteredFood = initialFiltered;
            }

            setFilteredFood(newFilteredFood);
            setIsLoading(false);
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [category, searchText, foodList, isHomeView, token, userProfile]);

    if (isLoading) {
        return (
            <div className="container py-5 text-center">
                <div className="spinner-border text-primary mb-3" role="status"></div>
                <h5 className="text-muted">Loading food items...</h5>
            </div>
        );
    }

    return (
        <div className="container py-4 food-display">
            <div className="text-center mb-5">
                <h2 className="fw-bold section-title display-6">
                    {isHomeView && category === "All"
                        ? "Featured Dishes"
                        : category === "All"
                        ? "All Dishes"
                        : `${category} Dishes`}
                </h2>
                <p className="text-muted">
                    <span className="food-display__intro d-inline-block">
                    {filteredFood.length
                        ? `Showing ${filteredFood.length} delicious option${filteredFood.length > 1 ? "s" : ""}`
                        : "No items match your search"}
                    </span>
                </p>
            </div>

            <div className="row">
                {filteredFood.length > 0 ? (
                    filteredFood.map((food) => (
                        <FoodCard
                            key={food.id}
                            food={food}
                            userLocation={userProfile?.location}
                        />
                    ))
                ) : (
                    <div className="col-12 text-center mt-5">
                        <img
                            src={asset.logo}
                            alt="App logo"
                            width={96}
                            height={96}
                            className="mb-3 food-display__empty-logo"
                        />
                        <h4 className="fw-semibold text-secondary">
                            {backendError ? "Server connection problem" : "No food items found."}
                        </h4>
                        <p className="text-muted">
                            {backendError ||
                                "Try adjusting your filters or search keywords."}
                        </p>
                    </div>
                )}
            </div>

            {isHomeView && category === "All" && (
                <div className="text-center mt-5">
                    <Link to="/explore" className="btn btn-lg btn-outline-primary">
                        <i className="bi bi-arrow-right-circle me-2"></i> View All Food Items
                    </Link>
                </div>
            )}
        </div>
    );
};

export default FoodDisplay;
