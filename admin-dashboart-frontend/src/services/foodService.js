import axios from "axios";

const API_URL = "http://localhost:8080";
export const addFood=async(foodData,image)=>{
 const formData = new FormData();
        formData.append('food', JSON.stringify(foodData));
        formData.append('file', image);
  try {
         await axios.post(`${API_URL}/api/food`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
    
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
}

export const getFoodList=async()=>{
try {
            const response=await  axios.get(`${API_URL}/api/food/getfoods`)
      return response.data;
} catch (error) {
    console.lod(error);
    throw error;
}
}

export const deleteFood=async(foodId)=>{
        try {
            const response=  await axios.delete(`${API_URL}/api/food/deletefood/`+foodId);
            return response.status==204;
        } catch (error) {
            console.log(error)
            throw error
        }
}
