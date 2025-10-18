import axios from 'axios'

const API_URL=`${import.meta.env.VITE_BACKEND_URL}`
  
export const fetchFoodList=async()=>{
     try {
       const response= await axios.get(`${API_URL}/api/food`);
    return response.data; 
     } catch (error) {
        console.log(error)
     }
    }

   export  const fetchFoodDetail=async(id)=>{
   try {
      const response= await axios.get(`${API_URL}/api/food/`+id)
    
      return response.data;
    
   } catch (error) {
      console.log(error)
   }



}