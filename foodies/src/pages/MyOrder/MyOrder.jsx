import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { asset } from "../../assets/asset";
import { storeContext } from "../../context/StoreContext";
import "./MyOrder.css";

const MyOrder = () => {
  const navigate = useNavigate();
  const { token, orders, loadProtectedData, increaseQty, removeOrder } = useContext(storeContext);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("NEWEST");
  const [busyOrderId, setBusyOrderId] = useState("");

  useEffect(() => {
    const loadOrders = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        await loadProtectedData();
      } catch (error) {
        console.error("my orders load error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const orderStats = useMemo(() => {
    const history = orders || [];
    return {
      total: history.length,
      active: history.filter((order) =>
        ["PROCESSING", "PREPARING", "OUT_FOR_DELIVERY", "AWAITING_PAYMENT"].includes(order.orderStatus)
      ).length,
      delivered: history.filter((order) => order.orderStatus === "DELIVERED").length,
      spent: history
        .filter((order) => order.paymentStatus === "SUCCESS")
        .reduce((sum, order) => sum + (Number(order.amount) || 0), 0),
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase();
    const list = [...(orders || [])]
      .filter((order) => {
        if (statusFilter !== "ALL" && order.orderStatus !== statusFilter) {
          return false;
        }

        if (!normalizedSearch) {
          return true;
        }

        const itemNames = (order.orderedItems || []).map((item) => item.name || "").join(" ");
        return [order.id, order.restaurantName, itemNames, order.userAddress]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);
      })
      .sort((a, b) => {
        if (sortBy === "OLDEST") {
          return new Date(a.createdAt) - new Date(b.createdAt);
        }
        if (sortBy === "HIGHEST_AMOUNT") {
          return (Number(b.amount) || 0) - (Number(a.amount) || 0);
        }
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

    return list;
  }, [orders, searchText, sortBy, statusFilter]);

  const formatPaymentBadge = (paymentStatus) => {
    const s = (paymentStatus || "").toLowerCase();
    if (["success", "paid"].includes(s)) return "bg-success";
    if (["pending", "pending_intent_creation", "awaiting_payment"].includes(s)) return "bg-warning text-dark";
    return "bg-danger";
  };

  const formatOrderBadge = (orderStatus) => {
    if (orderStatus === "DELIVERED") return "bg-success";
    if (["PROCESSING", "PREPARING"].includes(orderStatus)) return "bg-warning text-dark";
    if (orderStatus === "PAYMENT_FAILED") return "bg-danger";
    return "bg-primary";
  };

  const handleRepeatOrder = async (order) => {
    setBusyOrderId(order.id);
    try {
      for (const item of order.orderedItems || []) {
        for (let index = 0; index < (item.quantity || 0); index += 1) {
          await increaseQty(item.foodId);
        }
      }
      toast.success("Items from this order were added back to your cart.");
      navigate("/cart");
    } catch (error) {
      console.error("repeat order error:", error);
      toast.error("Could not add all items back to the cart.");
    } finally {
      setBusyOrderId("");
    }
  };

  const handleRemoveHistory = async (orderId) => {
    setBusyOrderId(orderId);
    try {
      await removeOrder(orderId);
      toast.success("Order removed from your history.");
    } catch (error) {
      console.error("remove history error:", error);
      toast.error("Could not remove this order.");
    } finally {
      setBusyOrderId("");
    }
  };

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

  if (!orders || orders.length === 0) {
    return (
      <div className="container text-center py-5">
        <div className="alert alert-info rounded-4" role="alert">
          <h4 className="alert-heading">No Orders Found</h4>
          <p className="mb-0">It looks like you have not placed any orders yet. Start exploring and your history will appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container my-5 orders-page">
      <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap mb-4">
        <div>
          <h2 className="text-primary mb-2 fw-bold">My Order History</h2>
          <p className="text-muted mb-0">Track every order, repeat your favorites, and revisit the food you loved.</p>
        </div>
        <Link to="/profile" className="btn btn-outline-primary rounded-pill">
          <i className="bi bi-person-gear me-2"></i>
          Edit Profile
        </Link>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <div className="orders-stat">
            <div className="orders-stat__label">Total Orders</div>
            <div className="orders-stat__value">{orderStats.total}</div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="orders-stat">
            <div className="orders-stat__label">Active</div>
            <div className="orders-stat__value">{orderStats.active}</div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="orders-stat">
            <div className="orders-stat__label">Delivered</div>
            <div className="orders-stat__value">{orderStats.delivered}</div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="orders-stat">
            <div className="orders-stat__label">Spent</div>
            <div className="orders-stat__value">Rs {orderStats.spent.toFixed(0)}</div>
          </div>
        </div>
      </div>

      <div className="orders-toolbar p-4 mb-4">
        <div className="row g-3">
          <div className="col-lg-6">
            <label className="form-label fw-semibold">Search Orders</label>
            <input
              type="text"
              className="form-control rounded-pill"
              placeholder="Search by order id, restaurant, or food item"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
            />
          </div>
          <div className="col-md-6 col-lg-3">
            <label className="form-label fw-semibold">Status</label>
            <select
              className="form-select rounded-pill"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="ALL">All statuses</option>
              <option value="AWAITING_PAYMENT">Awaiting payment</option>
              <option value="PROCESSING">Processing</option>
              <option value="PREPARING">Preparing</option>
              <option value="OUT_FOR_DELIVERY">Out for delivery</option>
              <option value="DELIVERED">Delivered</option>
              <option value="PAYMENT_FAILED">Payment failed</option>
            </select>
          </div>
          <div className="col-md-6 col-lg-3">
            <label className="form-label fw-semibold">Sort</label>
            <select
              className="form-select rounded-pill"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
            >
              <option value="NEWEST">Newest first</option>
              <option value="OLDEST">Oldest first</option>
              <option value="HIGHEST_AMOUNT">Highest amount</option>
            </select>
          </div>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="alert alert-light border rounded-4 text-center py-4">
          No orders matched your current filters.
        </div>
      ) : (
        <div className="row g-4">
          {filteredOrders.map((order) => {
            const canRemoveHistory = ["DELIVERED", "PAYMENT_FAILED"].includes(order.orderStatus);

            return (
              <div key={order.id} className="col-12">
                <div className="order-card p-4">
                  <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap mb-3">
                    <div>
                      <div className="order-card__meta mb-2">
                        {order.createdAt ? new Date(order.createdAt).toLocaleString() : "Recently placed"}
                      </div>
                      <h5 className="mb-1">
                        Order ID: <span className="text-secondary fw-normal">{order.id}</span>
                      </h5>
                      <div className="text-muted">{order.restaurantName}</div>
                    </div>
                    <div className="d-flex gap-2 flex-wrap">
                      <span className={`badge text-uppercase p-2 ${formatOrderBadge(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                      <span className={`badge p-2 ${formatPaymentBadge(order.paymentStatus)}`}>
                        {order.paymentStatus || "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-3">
                      <div className="small text-muted">Items</div>
                      <div className="fw-semibold">{order.orderedItems?.length ?? 0}</div>
                    </div>
                    <div className="col-md-3">
                      <div className="small text-muted">Amount</div>
                      <div className="fw-semibold text-success">Rs {(order.amount ?? 0).toFixed(2)}</div>
                    </div>
                    <div className="col-md-6">
                      <div className="small text-muted">Delivery Address</div>
                      <div className="fw-semibold">{order.userAddress}</div>
                    </div>
                  </div>

                  <div className="border rounded-4 overflow-hidden mb-4">
                    {(order.orderedItems || []).map((item, index) => (
                      <div
                        key={`${order.id}-${item.foodId}-${index}`}
                        className="order-card__item d-flex justify-content-between align-items-center gap-3 p-3 flex-wrap"
                      >
                        <div className="d-flex align-items-center gap-3">
                          <img
                            src={(item.imageUrl || asset.placeholder).replace(/^http:\/\//i, "https://")}
                            alt={item.name}
                            className="rounded"
                            style={{ width: "56px", height: "56px", objectFit: "cover" }}
                          />
                          <div>
                            <div className="fw-semibold">{item.name}</div>
                            <div className="small text-muted">
                              Qty {item.quantity} · Rs {(Number(item.price) || 0).toFixed(2)} each
                            </div>
                          </div>
                        </div>
                        <div className="d-flex gap-2 flex-wrap">
                          <Link to={`/food/${item.foodId}`} className="btn btn-sm btn-outline-secondary rounded-pill">
                            View Food
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap">
                    <div className="text-muted small">
                      Phone: {order.phoneNumber}
                    </div>
                    <div className="d-flex gap-2 flex-wrap">
                      <button
                        type="button"
                        className="btn btn-primary rounded-pill"
                        onClick={() => handleRepeatOrder(order)}
                        disabled={busyOrderId === order.id}
                      >
                        {busyOrderId === order.id ? "Adding..." : "Repeat Order"}
                      </button>
                      {canRemoveHistory && (
                        <button
                          type="button"
                          className="btn btn-outline-danger rounded-pill"
                          onClick={() => handleRemoveHistory(order.id)}
                          disabled={busyOrderId === order.id}
                        >
                          Remove History
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyOrder;
