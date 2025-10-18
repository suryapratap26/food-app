import  { useContext, useState, useEffect } from 'react';
import orderService from '../../service/orderService.js';
import { storeContext } from '../../context/StoreContext';
import { toast } from 'react-toastify';
import { asset } from '../../assets/asset'; 

const MyOrder = () => {
    const { token } = useContext(storeContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchOrders = async () => {
        if (!token) {
            setError("User is not authenticated. Please log in.");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            const fetchedOrders = await orderService.getUserOrders(token);
            setOrders(fetchedOrders);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch orders:", err);
            const errorMessage = err.response?.data?.message || "Could not load order history.";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [token]);

    if (loading) {
        return (
            <div className="container text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-primary">Loading your order history...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container text-center py-5">
                <div className="alert alert-danger" role="alert">
                    <h4 className="alert-heading">Authentication Error</h4>
                    <p>{error}</p>
                    <hr />
                    <p className="mb-0">Please check your network connection or ensure you are logged in.</p>
                </div>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="container text-center py-5">
                <div className="alert alert-info" role="alert">
                    <h4 className="alert-heading">No Orders Found</h4>
                    <p>It looks like you haven't placed any orders yet. Time to browse some food! 🍔</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container my-5">
            <h2 className="text-primary mb-4 fw-bold">My Order History</h2>
            <div className="row g-4">
                {orders.map((order, index) => (
                    <div key={order.id || index} className="col-12">
                        <div className="card shadow-sm border-0 rounded-4">
                            <div className="card-header bg-light d-flex justify-content-between align-items-center rounded-top-4">
                                <h5 className="mb-0 text-dark">Order ID: <span className="text-secondary fw-normal">{order.id}</span></h5>
                                <span className={`badge text-uppercase p-2 
                                    ${order.orderStatus === 'DELIVERED' ? 'bg-success' :
                                    order.orderStatus === 'PREPARING' ? 'bg-warning text-dark' :
                                        'bg-primary'}`}>
                                    {order.orderStatus}
                                </span>
                            </div>

                            <div className="card-body p-4">
                                <p className="mb-2"><strong>Total Items:</strong> {order.orderedItems.length}</p>
                                <p className="mb-2"><strong>Payment Status:</strong>
                                    <span className={`badge ms-2 ${order.paymentStatus === 'PAID' ? 'bg-success' : 'bg-danger'}`}>
                                        {order.paymentStatus || 'N/A'}
                                    </span>
                                </p>
                                <p className="mb-2"><strong>Amount:</strong> <span className="text-success fw-bold">&#8377; {order.amount ? order.amount.toFixed(2) : '0.00'}</span></p>

                                <h6 className="mt-3 text-secondary">Items Ordered:</h6>
                                <ul className="list-group list-group-flush mb-3">
                                    {order.orderedItems.map((item, itemIndex) => (
                                        <li key={itemIndex} className="list-group-item d-flex justify-content-between align-items-center px-0">
                                            <div className="d-flex align-items-center">
                                                {/* Display image if available, otherwise use a placeholder */}
                                                <img
                                                    src={item.imageUrl || asset.placeholder}
                                                    alt={item.name}
                                                    className="rounded me-3"
                                                    style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                                />
                                                {item.name}
                                            </div>
                                            <span className="text-muted">x{item.quantity}</span>
                                        </li>
                                    ))}
                                </ul>

                                <p className="mt-3 mb-1"><strong>Shipping Address:</strong></p>
                                <address className="mb-0 text-muted fst-italic">
                                    {order.userAddress} <br />
                                    Phone: {order.phoneNumber}
                                </address>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyOrder;