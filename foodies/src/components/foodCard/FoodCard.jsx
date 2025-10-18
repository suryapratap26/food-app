
import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { storeContext } from '../../context/StoreContext';

const FoodCard = ({ food }) => {
 const { increaseQty,decreaseQty, quantities}=useContext(storeContext)
  return (
    <div className='col-12 col-sm-6 col-md-4 col-lg-3 mb-5 d-flex justify-content-center'>
       <div   className="card" style={{ 'maxWidth': '320px',textDecoration:'none' }}>
      <Link to={`/food/${food.id}`}> <img src={food.imageUrl} className="card-img-top" alt={food.name} />
       </Link>
        <div className="card-body">
          <h5 className="card-title">{food.name}</h5>
          <p className="card-text">{food.description}</p>
          <div className="d-flex justify-content-between align-items-center">
            <span className="h5 mb-0">&#8377; {food.price}</span>
            <div>
              <i className="bi bi-star-fill text-warning"></i>
              <i className="bi bi-star-fill text-warning"></i>
              <i className="bi bi-star-fill text-warning"></i>
              <i className="bi bi-star-fill text-warning"></i>
              <i className="bi bi-star-half text-warning"></i>
              <small className="text-muted">(4.5)</small>
            </div>
          </div>
        </div>
        <div className="card-footer d-flex justify-content-between bg-light">
          <Link className="btn btn-primary btn-sm" to={`/food/${food.id}`}>View Food</Link>
         {
          quantities[food.id]>0?
          <div className="d-flex align-tems-center gap-2">
            <button className='btn btn-danger btn-sm' onClick={()=>decreaseQty(food.id)}> <i className="bi bi-dash-circle"></i></button>
            <span className='fw-bold'>{quantities[food.id]}</span>
          <button className='btn btn-success btn-sm' onClick={()=>increaseQty(food.id)}><i className="bi bi-plus-circle"></i></button>
          </div>
          :   <button className='btn btn-primary btn-sm' onClick={()=>increaseQty(food.id)}><i className="bi bi-plus-circle"></i></button>
       
         }
        </div>
      </div>
    </div>
  );
};

export default FoodCard;