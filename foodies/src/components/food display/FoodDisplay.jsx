import React, { useContext, useEffect, useState } from "react";
import { storeContext } from "../../context/StoreContext";
import FoodCard from "../foodCard/FoodCard";
import "./foodDisplay.css";
import { Link } from "react-router-dom"; 
const FoodDisplay = ({ category, searchText, isHomeView = false }) => {
    const { foodList } = useContext(storeContext);
    const [filteredFood, setFilteredFood] = useState([]);

    useEffect(() => {
        const normalizedSearch = searchText.trim().toLowerCase();
        let newFilteredFood = [];

        const initialFiltered = foodList.filter((food) => {
            const matchesCategory = category === "All" || food.category === category;
            const matchesSearch =
                food.name.toLowerCase().includes(normalizedSearch) ||
                food.description?.toLowerCase().includes(normalizedSearch);
            return matchesCategory && matchesSearch;
        });

        if (isHomeView) {
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
    }, [category, searchText, foodList, isHomeView]); 
    return (
        <div className="container py-4 food-display">
            <div className="text-center mb-5">
                <h2 className="fw-bold text-primary display-6">
                    {category === "All" && isHomeView ? "Featured Dishes" : 
                     category === "All" ? "All Dishes" : `${category} Dishes`}
                </h2>
                <p className="text-muted">
                    {filteredFood.length
                        ? `Showing ${filteredFood.length} delicious option${
                              filteredFood.length > 1 ? "s" : ""
                          }`
                        : "No items match your search"}
                </p>
            </div>

            <div className="row">
                {filteredFood.length > 0 ? (
                    filteredFood.map((food) => (
                        <FoodCard key={food.id} food={food} />
                    ))
                ) : (
                    <div className="col-12 text-center mt-5">
                        <img
                            src="https://cdn-icons-png.flaticon.com/512/857/857681.png"
                            alt="No results"
                            width={120}
                            height={120}
                            className="mb-3 opacity-75"
                        />
                        <h4 className="fw-semibold text-secondary">
                            No food items found.
                        </h4>
                        <p className="text-muted">
                            Try adjusting your filters or search keywords.
                        </p>
                    </div>
                )}
            </div>

           {isHomeView && (
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