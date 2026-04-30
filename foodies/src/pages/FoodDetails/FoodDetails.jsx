import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchFoodDetail, submitFoodReview } from "./../../service/foodService";
import { storeContext } from "./../../context/StoreContext";
import { toast } from "react-toastify";
import "./FoodDetails.css";

const FoodDetails = () => {
    const { increaseQty, orders, token, userProfile } = useContext(storeContext);
    const { id } = useParams();
    const [data, setData] = useState({});
    const [quantity, setQuantity] = useState(1);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
    const [isSavingReview, setIsSavingReview] = useState(false);
    const navigate = useNavigate();

    const averageRating = Number(data.ratingAverage || 0);
    const fullStars = Math.floor(averageRating);
    const hasHalfStar = averageRating - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    const hasPurchasedFood = useMemo(
        () =>
            (orders || []).some(
                (order) =>
                    order.paymentStatus === "SUCCESS" &&
                    (order.orderedItems || []).some((item) => item.foodId === id)
            ),
        [id, orders]
    );

    const existingReview = useMemo(
        () =>
            (data.reviews || []).find((review) => review.userId === userProfile?.id),
        [data.reviews, userProfile?.id]
    );

    useEffect(() => {
        if (existingReview) {
            setReviewForm({
                rating: existingReview.rating || 5,
                comment: existingReview.comment || "",
            });
        }
    }, [existingReview]);

    const handleAddToCart = async () => {
        if (!data.id) return;
        for (let i = 0; i < quantity; i++) {
            await increaseQty(data.id);
        }
        toast.success(`${quantity} x ${data.name} added to cart!`);
        navigate("/cart");
    };

    useEffect(() => {
        const loadFoodDetail = async (foodId) => {
            try {
                if (!foodId) return;
                const response = await fetchFoodDetail(foodId);
                setData(response);
            } catch (error) {
                console.error("Error fetching food details:", error);
                toast.error("Error fetching food details.");
            }
        };
        loadFoodDetail(id);
    }, [id]);

    const handleQuantityChange = (val) => {
        setQuantity((prev) => {
            const newQty = prev + val;
            return newQty >= 1 ? newQty : 1;
        });
    };

    const handleReviewChange = (event) => {
        const { name, value } = event.target;
        setReviewForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleRatingClick = (rating) => {
        setReviewForm((prev) => ({ ...prev, rating }));
    };

    const handleSubmitReview = async (event) => {
        event.preventDefault();

        if (!token) {
            toast.info("Please log in to write a review.");
            navigate("/login");
            return;
        }

        setIsSavingReview(true);
        try {
            const response = await submitFoodReview(id, {
                rating: reviewForm.rating,
                comment: reviewForm.comment,
            });
            setData(response);
            toast.success(existingReview ? "Review updated successfully." : "Review added successfully.");
        } catch (error) {
            const message =
                error.response?.data?.message || error.message || "Could not save review.";
            toast.error(message);
        } finally {
            setIsSavingReview(false);
        }
    };

    return (
        <section className="food-details-section py-5">
            <div className="container px-4 px-lg-5 my-5">
                <div className="row gx-4 gx-lg-5 align-items-start food-details-main">
                    <div className="col-md-6 mb-4 mb-md-0">
                        <div className="card shadow-sm rounded-4 overflow-hidden border-0 food-details-media-card">
                            <img
                                className="card-img-top food-img"
                                src={data?.imageUrl}
                                alt={data?.name}
                            />
                        </div>
                    </div>

                    <div className="col-md-6">
                        <div className="food-details-summary">
                            <div className="mb-2">
                                <span className="badge bg-warning text-dark px-3 py-2">
                                    {data?.category}
                                </span>
                            </div>

                            <h1 className="display-5 fw-bolder mb-3">{data?.name}</h1>

                            <div className="food-details-rating mb-3">
                                <div className="food-details-rating__stars">
                                    {Array.from({ length: fullStars }).map((_, index) => (
                                        <i key={`full-${index}`} className="bi bi-star-fill"></i>
                                    ))}
                                    {hasHalfStar && <i className="bi bi-star-half"></i>}
                                    {Array.from({ length: emptyStars }).map((_, index) => (
                                        <i key={`empty-${index}`} className="bi bi-star"></i>
                                    ))}
                                </div>
                                <span className="food-details-rating__meta">
                                    {data.reviewCount
                                        ? `${averageRating.toFixed(1)} from ${data.reviewCount} review${data.reviewCount > 1 ? "s" : ""}`
                                        : "No reviews yet"}
                                </span>
                            </div>

                            <div className="fs-4 text-primary fw-semibold mb-3">
                                Rs {data?.price}
                            </div>

                            <p className="lead mb-4">{data?.description}</p>

                            <div className="d-flex align-items-center gap-3 flex-wrap">
                                <div className="input-group quantity-selector" style={{ maxWidth: "120px" }}>
                                    <button
                                        className="btn btn-outline-secondary"
                                        type="button"
                                        onClick={() => handleQuantityChange(-1)}
                                    >
                                        <i className="bi bi-dash"></i>
                                    </button>
                                    <input
                                        type="text"
                                        className="form-control text-center"
                                        value={quantity}
                                        readOnly
                                    />
                                    <button
                                        className="btn btn-outline-secondary"
                                        type="button"
                                        onClick={() => handleQuantityChange(1)}
                                    >
                                        <i className="bi bi-plus"></i>
                                    </button>
                                </div>

                                <button
                                    className="btn btn-primary btn-lg px-4 shadow-sm"
                                    onClick={handleAddToCart}
                                >
                                    <i className="bi bi-cart-fill me-2"></i> Add to Cart
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <section className="food-details-reviews-full mt-5">
                    <div className="food-details-review-card card border-0 shadow-sm rounded-4 p-4 p-lg-5">
                        <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">
                            <div>
                                <h3 className="h3 mb-2">Customer Reviews</h3>
                                <p className="text-muted mb-0">
                                    Real ratings and comments from customers who ordered this food.
                                </p>
                            </div>
                            <span className="badge text-bg-light border px-3 py-2">
                                {data.reviewCount || 0} review{data.reviewCount === 1 ? "" : "s"}
                            </span>
                        </div>

                        <hr className="my-4" />

                        <div className="row g-4">
                            <div className="col-lg-5">
                                <div className="food-details-review-form-shell">
                                    <div className="food-details-review-summary mb-4">
                                        <div className="food-details-review-summary__score">
                                            {data.reviewCount ? averageRating.toFixed(1) : "0.0"}
                                        </div>
                                        <div>
                                            <div className="food-details-rating__stars">
                                                {Array.from({ length: fullStars }).map((_, index) => (
                                                    <i key={`summary-full-${index}`} className="bi bi-star-fill"></i>
                                                ))}
                                                {hasHalfStar && <i className="bi bi-star-half"></i>}
                                                {Array.from({ length: emptyStars }).map((_, index) => (
                                                    <i key={`summary-empty-${index}`} className="bi bi-star"></i>
                                                ))}
                                            </div>
                                            <div className="text-muted small mt-2">
                                                Based on {data.reviewCount || 0} customer review{data.reviewCount === 1 ? "" : "s"}
                                            </div>
                                        </div>
                                    </div>

                                    <form onSubmit={handleSubmitReview}>
                                        <label className="form-label fw-semibold d-block">Your Rating</label>
                                        <div className="food-details-review-stars mb-3">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    className={`food-details-review-stars__button ${reviewForm.rating >= star ? "is-active" : ""}`}
                                                    onClick={() => handleRatingClick(star)}
                                                >
                                                    <i className={`bi ${reviewForm.rating >= star ? "bi-star-fill" : "bi-star"}`}></i>
                                                </button>
                                            ))}
                                        </div>

                                        <div className="mb-3">
                                            <label htmlFor="reviewComment" className="form-label fw-semibold">
                                                Your Review
                                            </label>
                                            <textarea
                                                id="reviewComment"
                                                name="comment"
                                                className="form-control rounded-4"
                                                rows="5"
                                                placeholder="Share what you liked about this dish."
                                                value={reviewForm.comment}
                                                onChange={handleReviewChange}
                                                disabled={isSavingReview}
                                            ></textarea>
                                        </div>

                                        {token ? (
                                            hasPurchasedFood ? (
                                                <button
                                                    className="btn btn-primary rounded-pill px-4"
                                                    type="submit"
                                                    disabled={isSavingReview}
                                                >
                                                    {isSavingReview
                                                        ? "Saving Review..."
                                                        : existingReview
                                                        ? "Update Review"
                                                        : "Submit Review"}
                                                </button>
                                            ) : (
                                                <p className="text-muted mb-0">
                                                    You can review this food after placing a successful order for it.
                                                </p>
                                            )
                                        ) : (
                                            <button
                                                className="btn btn-outline-primary rounded-pill px-4"
                                                type="button"
                                                onClick={() => navigate("/login")}
                                            >
                                                Login to Review
                                            </button>
                                        )}
                                    </form>
                                </div>
                            </div>

                            <div className="col-lg-7">
                                <div className="food-details-review-list food-details-review-list--full">
                                    {(data.reviews || []).length ? (
                                        data.reviews.map((review) => (
                                            <article key={review.id} className="food-details-review-item">
                                                <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">
                                                    <div>
                                                        <h4 className="h6 mb-1">{review.userName}</h4>
                                                        <div className="food-details-review-item__stars">
                                                            {Array.from({ length: 5 }).map((_, index) => (
                                                                <i
                                                                    key={`${review.id}-${index}`}
                                                                    className={`bi ${index < review.rating ? "bi-star-fill" : "bi-star"}`}
                                                                ></i>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <small className="text-muted">
                                                        {review.createdAt
                                                            ? new Date(review.createdAt).toLocaleDateString()
                                                            : ""}
                                                    </small>
                                                </div>
                                                <p className="mb-0 mt-3 text-secondary">
                                                    {review.comment || "Rated this dish without a written comment."}
                                                </p>
                                            </article>
                                        ))
                                    ) : (
                                        <p className="text-muted mb-0">
                                            No reviews yet. Be the first customer to share feedback after ordering.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </section>
    );
};

export default FoodDetails;
