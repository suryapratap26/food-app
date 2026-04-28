import AdminLayout from "./AdminLayout";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import orderService from "../../service/orderService";
import { fetchFoodList } from "../../service/foodService";
import { getPendingRestaurants } from "../../service/userService";

const formatCurrency = (value) => `Rs ${Number(value || 0).toFixed(2)}`;

const AdminDashboard = () => {
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalFoods, setTotalFoods] = useState(0);
  const [pendingRestaurants, setPendingRestaurants] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [activeOrders, setActiveOrders] = useState(0);
  const [recentOrders, setRecentOrders] = useState([]);
  const [ordersByStatus, setOrdersByStatus] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const role = localStorage.getItem("role");
  const profile = JSON.parse(localStorage.getItem("profile") || "null");
  const isRestaurant = role === "RESTAURANT";

  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoading(true);
        const orders = await orderService.getAllOrders();
        const foods = await fetchFoodList(
          isRestaurant && profile?.id ? { managerRestaurantId: profile.id } : {}
        );

        setTotalOrders(orders.length);
        setTotalFoods(foods.length);
        setRecentOrders((orders || []).slice(0, 5));

        const successfulOrders = (orders || []).filter(
          (order) => order.paymentStatus === "SUCCESS" || order.paymentMethod === "COD"
        );
        setTotalRevenue(
          successfulOrders.reduce((sum, order) => sum + (Number(order.amount) || 0), 0)
        );

        const active = (orders || []).filter((order) =>
          ["PLACED", "PROCESSING", "PREPARING", "AWAITING_PAYMENT"].includes(order.orderStatus)
        ).length;
        setActiveOrders(active);

        const groupedStatus = (orders || []).reduce((acc, order) => {
          acc[order.orderStatus] = (acc[order.orderStatus] || 0) + 1;
          return acc;
        }, {});
        setOrdersByStatus(groupedStatus);

        if (!isRestaurant) {
          const pending = await getPendingRestaurants();
          setPendingRestaurants(pending.length);
        }
      } catch (error) {
        console.error("Failed to load admin stats:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadStats();
  }, [isRestaurant, profile?.id]);

  const overviewCards = useMemo(
    () =>
      isRestaurant
        ? [
            {
              label: "Orders Received",
              value: totalOrders,
              meta: `${activeOrders} currently active`,
              icon: "bi-receipt",
            },
            {
              label: "Menu Items",
              value: totalFoods,
              meta: "Live dishes in your catalog",
              icon: "bi-basket",
            },
            {
              label: "Revenue Snapshot",
              value: formatCurrency(totalRevenue),
              meta: "Successful and COD orders combined",
              icon: "bi-cash-stack",
            },
            {
              label: "Store Status",
              value: "Active",
              meta: "Visible to customers right now",
              icon: "bi-shop-window",
            },
          ]
        : [
            {
              label: "Platform Orders",
              value: totalOrders,
              meta: `${activeOrders} still in progress`,
              icon: "bi-receipt",
            },
            {
              label: "Food Listings",
              value: totalFoods,
              meta: "Available menu items across restaurants",
              icon: "bi-basket",
            },
            {
              label: "Pending Restaurants",
              value: pendingRestaurants,
              meta: "Awaiting approval",
              icon: "bi-shop-window",
            },
            {
              label: "Revenue Snapshot",
              value: formatCurrency(totalRevenue),
              meta: "Captured from successful and COD orders",
              icon: "bi-graph-up-arrow",
            },
          ],
    [activeOrders, isRestaurant, pendingRestaurants, totalFoods, totalOrders, totalRevenue]
  );

  const quickLinks = isRestaurant
    ? [
        { to: "/admin/addfood", title: "Add New Food", text: "Launch a new menu item with fresh details." },
        { to: "/admin/manage-food", title: "Refresh Menu", text: "Update prices, images, and availability." },
        { to: "/admin/orders", title: "Handle Orders", text: "Move live orders through your kitchen flow." },
        { to: "/admin", title: "Watch Performance", text: "Keep an eye on delivery and revenue pace." },
      ]
    : [
        { to: "/admin/pending-restaurants", title: "Review Restaurants", text: "Approve or reject incoming partners." },
        { to: "/admin/orders", title: "Track Orders", text: "Monitor all platform orders in one place." },
        { to: "/admin/manage-food", title: "Audit Listings", text: "Review and manage all listed food items." },
        { to: "/admin/createAdmin", title: "Add Admin", text: "Create another internal operator account." },
      ];

  return (
    <AdminLayout>
      <div className="container-fluid">
        <section className="dashboard-hero mb-4">
          <div className="row g-4 align-items-center">
            <div className="col-lg-8">
              <div className="dashboard-hero__eyebrow mb-2">
                {isRestaurant ? "Restaurant Dashboard" : "Platform Dashboard"}
              </div>
              <h2 className="dashboard-hero__title display-6 mb-3">
                {isRestaurant
                  ? "A faster way to manage your store, menu, and incoming orders."
                  : "A clearer view of orders, restaurants, and overall marketplace momentum."}
              </h2>
              <p className="mb-0" style={{ maxWidth: 720 }}>
                {isRestaurant
                  ? "Use this dashboard to react quickly, keep the menu fresh, and maintain a smooth order pipeline."
                  : "Use this control center to keep the platform healthy, respond to approvals, and stay ahead of activity spikes."}
              </p>
            </div>
            <div className="col-lg-4">
              <div className="dashboard-hero__panel">
                <div className="small text-uppercase fw-semibold mb-2">Today at a glance</div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Orders</span>
                  <strong>{totalOrders}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Active flow</span>
                  <strong>{activeOrders}</strong>
                </div>
                <div className="d-flex justify-content-between">
                  <span>{isRestaurant ? "Sales snapshot" : "Pending approvals"}</span>
                  <strong>{isRestaurant ? formatCurrency(totalRevenue) : pendingRestaurants}</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="row g-4 mb-4">
          {overviewCards.map((card) => (
            <div key={card.label} className="col-md-6 col-xl-3">
              <div className="dashboard-card h-100">
                <div className="dashboard-card__label">
                  <i className={`bi ${card.icon}`}></i>
                  {card.label}
                </div>
                <div className="dashboard-card__value">{card.value}</div>
                <div className="dashboard-card__meta">{card.meta}</div>
              </div>
            </div>
          ))}
        </section>

        <section className="row g-4">
          <div className="col-xl-7">
            <div className="dashboard-card h-100">
              <div className="d-flex justify-content-between align-items-start gap-3 mb-3 flex-wrap">
                <div>
                  <h3 className="dashboard-section-title h4 mb-1">Recent Orders</h3>
                  <p className="text-muted mb-0">
                    {isRestaurant
                      ? "Latest orders placed for your restaurant."
                      : "Latest orders moving through the marketplace."}
                  </p>
                </div>
                <Link to="/admin/orders" className="btn btn-outline-primary rounded-pill">
                  View Orders
                </Link>
              </div>

              {isLoading ? (
                <p className="text-muted mb-0">Loading dashboard activity...</p>
              ) : recentOrders.length ? (
                <div className="dashboard-list">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="dashboard-list__item">
                      <div>
                        <div className="fw-semibold">{order.restaurantName}</div>
                        <div className="small text-muted">
                          {order.id} · {order.orderedItems?.length || 0} item
                          {(order.orderedItems?.length || 0) === 1 ? "" : "s"}
                        </div>
                      </div>
                      <div className="text-end">
                        <div className="fw-bold">{formatCurrency(order.amount)}</div>
                        <span className="badge text-bg-light border">{order.orderStatus}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted mb-0">No orders yet.</p>
              )}
            </div>
          </div>

          <div className="col-xl-5">
            <div className="dashboard-card h-100 mb-4">
              <h3 className="dashboard-section-title h4 mb-3">Quick Actions</h3>
              <div className="dashboard-quick-grid">
                {quickLinks.map((link) => (
                  <Link key={link.to + link.title} to={link.to} className="dashboard-quick-link">
                    <div className="fw-semibold mb-1">{link.title}</div>
                    <div className="small text-muted">{link.text}</div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="dashboard-card h-100">
              <h3 className="dashboard-section-title h4 mb-3">Order Status Mix</h3>
              {Object.keys(ordersByStatus).length ? (
                <div className="dashboard-list">
                  {Object.entries(ordersByStatus).map(([status, count]) => (
                    <div key={status} className="dashboard-list__item">
                      <span className="fw-semibold">{status}</span>
                      <span className="badge text-bg-light border">{count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted mb-0">Status data will appear after orders start flowing.</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
