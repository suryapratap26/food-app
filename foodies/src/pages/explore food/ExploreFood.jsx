import { useState } from "react";
import FoodDisplay from "../../components/food display/FoodDisplay";

const ExploreFood = () => {
    const [category, setCategory] = useState("All");
    const [searchText, setSearchText] = useState("");

    return (
        <>
            <div className="container my-4">
                <div className="row justify-content-center">
                    <div className="col-md-6 col-lg-4">
                        <form onSubmit={(e) => e.preventDefault()}>
                            <div className="input-group">
                                <select
                                    className="form-select"
                                    style={{ maxWidth: "150px" }}
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                >
                                    <option value="All">All</option>
                                    <option value="pizza">Pizzas</option>
                                    <option value="burger">Burger</option>
                                    <option value="side">Sides</option>
                                    <option value="dessert">Desserts</option>
                                    <option value="drink">Drinks</option>
                                </select>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search your favorite food"
                                    onChange={(e) => setSearchText(e.target.value)}
                                    value={searchText}
                                />
                                <button className="btn btn-primary" type="submit">
                                    <i className="bi bi-search"></i>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <FoodDisplay category={category} searchText={searchText} />
        </>
    );
};

export default ExploreFood;
