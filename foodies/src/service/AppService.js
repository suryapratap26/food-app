import axios from "axios";

const API_URL=`${import.meta.env.VITE_BACKEND_URL}`;

export const registerUser = async (data) => {
    try{
        const response= await axios.post(`${API_URL}/register`,data)
                return response;

    }catch (error){
        throw error;
    }
}

export const login = async (data) => {
    try{
        const response= await axios.post(`${API_URL}/login`,data)
        return response;
    } catch (error){
        throw error;
    }
}

export const  addToCart = async (foodId,token) => {
 try{
     return   await axios.post("http://localhost:8080/api/cart", {foodId}, {headers: {"Authorization":`Bearer ${token}`}})
 }catch (error){
     throw error;
 }
}

export const clearCart = async (token) => {
    try {
        return  await axios.delete("http://localhost:8080/api/cart", {headers: {"Authorization":`Bearer ${token}`}});

    }
    catch (error){
        throw error;
    }

}

export const  getCartItems = async (token) => {
    try {
       return  await axios.get("http://localhost:8080/api/cart",{headers: {"Authorization":`Bearer ${token}`}});

    }catch (error){
        throw error;
    }
}

export const decreaseCart = async (foodId,token) => {
    try{
        return await axios.post("http://localhost:8080/api/cart/remove", {foodId},{headers: {"Authorization":`Bearer ${token}`}});

    }catch (error){
        throw error;
    }
}