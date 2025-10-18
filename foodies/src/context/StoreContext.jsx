import { createContext, useEffect, useState } from "react";
import { fetchFoodList } from "../service/foodService";
import {addToCart, clearCart, decreaseCart, getCartItems} from "../service/AppService.js";
export const storeContext=createContext(null);

export const StoreContextProivder=(props)=>{

    const [foodList,setFoodList]=useState([]);
    const [quantities,setQuantities]=useState({});
    const [token,setToken]=useState("");
    const increaseQty =async (foodId)=>{
        setQuantities((prev)=> ({...prev ,[foodId]:(prev[foodId]||0)+1} ))
       const response= await addToCart(foodId,token);
        console.log(response);
    }


    const decreaseQty = async (foodId) => {
        setQuantities((prev) => ({ ...prev, [foodId]: (prev[foodId] > 0 ? prev[foodId] - 1 : 0) }));
        const response = await decreaseCart(foodId, token);
        console.log(response);
    };

    const loadCartData = async (token) => {
        const response=await getCartItems(token)
            setQuantities(response.data.items);
    }

    const removeFromCart=async (foodId)=>{
        const response=await clearCart(token)  ;
        console.log(response)
        setQuantities((prevQuantity)=>{
            const updatedQuanities={...prevQuantity}

            delete updatedQuanities[foodId];

            return updatedQuanities;
        })
    }
    const contextValue={
     foodList,
     increaseQty,
     decreaseQty,
     quantities,
        setQuantities,
     removeFromCart,
     token,
        loadCartData,
     setToken
    }

    useEffect(()=>{
        async function loadData(){
           const data= await fetchFoodList();
           setFoodList(data)
            if(localStorage.getItem('token')){
                setToken(localStorage.getItem('token'))
               await loadCartData(localStorage.getItem('token'));
            }
        }
        loadData();
    },[])

    return (
    <storeContext.Provider value={contextValue}>
        {props.children}
    </storeContext.Provider>
)
}