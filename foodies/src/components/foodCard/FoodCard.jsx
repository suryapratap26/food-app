import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { storeContext } from '../../context/StoreContext';

const getDistanceInKm = (from, to) => {
 const toRadians = (value) => (value * Math.PI) / 180;
 if (!from?.lat || !from?.lng || !to?.lat || !to?.lng) return null;
 const earthRadiusKm = 6371;
 const dLat = toRadians(to.lat - from.lat);
 const dLng = toRadians(to.lng - from.lng);
 const a =
   Math.sin(dLat / 2) * Math.sin(dLat / 2) +
   Math.cos(toRadians(from.lat)) *
     Math.cos(toRadians(to.lat)) *
     Math.sin(dLng / 2) *
     Math.sin(dLng / 2);
 return earthRadiusKm * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

const FoodCard = ({ food, userLocation }) => {
 const { increaseQty,decreaseQty, quantities}=useContext(storeContext);
 const distanceKm = getDistanceInKm(userLocation, food.restaurantLocation);
 const averageRating = Number(food.ratingAverage || 0);
 const fullStars = Math.floor(averageRating);
 const hasHalfStar = averageRating - fullStars >= 0.5;
 const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className='col-12 col-sm-6 col-md-4 col-lg-3 mb-5 d-flex justify-content-center'>
       <div className="card food-card border-0 w-100" style={{ maxWidth: "320px", textDecoration: "none" }}>
      <Link to={`/food/${food.id}`}> <img src={food.imageUrl} className="card-img-top food-image" alt={food.name} />
       </Link>
        <div className="card-body">
          <h5 className="card-title">{food.name}</h5>
          <p className="small text-muted mb-2">
            {food.restaurantName}
            {distanceKm !== null ? ` . ${distanceKm.toFixed(1)} km away` : ""}
          </p>
          <p className="card-text food-card__description">{food.description}</p>
          <div className="d-flex justify-content-between align-items-center">
            <span className="h5 mb-0 food-card__price">&#8377; {food.price}</span>
            <div className="food-card__rating">
              {Array.from({ length: fullStars }).map((_, index) => (
                <i key={`full-${index}`} className="bi bi-star-fill text-warning"></i>
              ))}
              {hasHalfStar && <i className="bi bi-star-half text-warning"></i>}
              {Array.from({ length: emptyStars }).map((_, index) => (
                <i key={`empty-${index}`} className="bi bi-star text-warning"></i>
              ))}
              <small className="text-muted">
                {food.reviewCount ? `(${averageRating.toFixed(1)} · ${food.reviewCount})` : "(No reviews)"}
              </small>
            </div>
          </div>
        </div>
        <div className="card-footer d-flex justify-content-between align-items-center food-card__footer">
          <Link className="btn btn-primary btn-sm rounded-pill px-3" to={`/food/${food.id}`}>View Food</Link>
         {
          quantities[food.id]>0?
          <div className="d-flex align-tems-center gap-2">
            <button className='btn btn-outline-primary btn-sm rounded-circle food-card__icon-btn' onClick={()=>decreaseQty(food.id)}> <i className="bi bi-dash-circle"></i></button>
            <span className='fw-bold food-card__qty'>{quantities[food.id]}</span>
          <button className='btn btn-primary btn-sm rounded-circle food-card__icon-btn' onClick={()=>increaseQty(food.id)}><i className="bi bi-plus-circle"></i></button>
          </div>
          :   <button className='btn btn-primary btn-sm rounded-circle food-card__icon-btn' onClick={()=>increaseQty(food.id)}><i className="bi bi-plus-circle"></i></button>

         }
        </div>
      </div>
    </div>
  );
};

export default FoodCard;
