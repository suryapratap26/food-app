import { useState } from "react";
import ExploreMenu from "../../components/explore menu/ExploreMenu";
import FoodDisplay from "../../components/food display/FoodDisplay";
import Header from "../../components/header/Header";

const Home = () => {
    const [category, setCategory] = useState("All");

    return (
        <main>
            {/* Full-width header with video */}
            <Header />

            {/* Explore Menu Section */}
            <ExploreMenu category={category} setCategory={setCategory} />

            {/* Food Display Section */}
            <FoodDisplay category={category} searchText="" />
        </main>
    );
};

export default Home;
