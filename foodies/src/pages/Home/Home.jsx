import { useState } from "react";
import ExploreMenu from "../../components/explore menu/ExploreMenu";
import FoodDisplay from "../../components/food display/FoodDisplay";
import Header from "../../components/header/Header";

const Home = () => {
    const [category, setCategory] = useState("All");

    return (
        <main>
            <Header />

            <ExploreMenu category={category} setCategory={setCategory} />

           
            <FoodDisplay category={category} searchText="" isHomeView={true} />
            
                </main>
    );
};

export default Home;