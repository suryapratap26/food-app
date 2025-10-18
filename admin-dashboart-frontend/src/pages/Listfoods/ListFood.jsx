import axios from 'axios';
import  { useEffect, useState } from 'react'
import { toast } from 'react-toastify';
import "./ListFood.css"
import { deleteFood, getFoodList } from '../../services/foodService';
const ListFood = () => {

  const [listFood,setListFood]=useState([]);
const fetchList = async () => {
        try {
            const data = await getFoodList();
            setListFood(data);
        } catch (error) {
            toast.error('Error in reading data');
        }
    };
useEffect(()=>{
  fetchList();
},[])

const removeElement = async (foodId) => {
        try {
            const success = await deleteFood(foodId);
            if (success) {
                toast.success('Item removed successfully');
                await fetchList(); // Re-fetch the list to update the UI
            } else {
                toast.error('Remove unsuccessful');
            }
        } catch (error) {
            toast.error('Remove unsuccessful');
        }
    };
  return (
    <div className='p-5 row justify-content-center'>
      <div className="card col-11">
        <table className='table'>
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {listFood.map((item,index)=>{
              return <tr key={index}>
                <td><img src={item.imageUrl} alt="" height={48} width={48}/></td>
                 <td>{item.name}</td>
                <td>{item.category}</td>
                 <td>{item.price}</td>
                  <td className='text-danger'
                  ><i className='bi bi-x-circle-fill' onClick={()=>removeElement(item.id)}></i></td>
              </tr>
            })
            }
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ListFood