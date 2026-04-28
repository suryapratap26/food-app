import { useContext, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { storeContext } from "../../context/StoreContext";
import "./Profile.css";

const defaultAddress = {
  firstName: "",
  lastName: "",
  phone: "",
  line1: "",
  city: "",
  state: "",
  country: "IN",
  zipcode: "",
};

const Profile = () => {
  const { userProfile, saveUserProfile, isProfileLoading, orders } = useContext(storeContext);
  const [isSaving, setIsSaving] = useState(false);
  const [isCapturingLocation, setIsCapturingLocation] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    savedAddress: defaultAddress,
  });

  useEffect(() => {
    if (!userProfile) {
      return;
    }

    setFormData({
      name: userProfile.name || "",
      email: userProfile.email || "",
      phoneNumber: userProfile.phoneNumber || userProfile.savedAddress?.phone || "",
      savedAddress: {
        ...defaultAddress,
        ...userProfile.savedAddress,
        phone: userProfile.savedAddress?.phone || userProfile.phoneNumber || "",
      },
    });
  }, [userProfile]);

  const stats = useMemo(() => {
    const history = orders || [];
    return {
      totalOrders: history.length,
      deliveredOrders: history.filter((order) => order.orderStatus === "DELIVERED").length,
      savedAddresses: userProfile?.savedAddress?.line1 ? 1 : 0,
      totalSpent: history
        .filter((order) => order.paymentStatus === "SUCCESS")
        .reduce((sum, order) => sum + (Number(order.amount) || 0), 0),
    };
  }, [orders, userProfile]);

  const onChangeHandler = (event) => {
    const { name, value } = event.target;

    if (name.startsWith("savedAddress.")) {
      const key = name.replace("savedAddress.", "");
      setFormData((prev) => ({
        ...prev,
        savedAddress: { ...prev.savedAddress, [key]: value },
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported in this browser.");
      return;
    }

    setIsCapturingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          await saveUserProfile({
            location: {
              lat: Number(coords.latitude.toFixed(6)),
              lng: Number(coords.longitude.toFixed(6)),
            },
          });
          toast.success("Current location updated on your profile.");
        } catch (error) {
          console.error("profile location update error:", error);
          toast.error("Could not update your current location.");
        } finally {
          setIsCapturingLocation(false);
        }
      },
      () => {
        setIsCapturingLocation(false);
        toast.error("Unable to fetch your current location.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setIsSaving(true);

    try {
      await saveUserProfile({
        name: formData.name,
        phoneNumber: formData.phoneNumber,
        savedAddress: {
          ...formData.savedAddress,
          phone: formData.phoneNumber,
        },
      });
      toast.success("Profile updated successfully.");
    } catch (error) {
      console.error("profile save error:", error);
      toast.error(error.response?.data?.message || error.message || "Could not save profile.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isProfileLoading && !userProfile) {
    return (
      <div className="container text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container my-5 profile-page">
      <div className="profile-shell overflow-hidden">
        <div className="row g-0">
          <div className="col-lg-4">
            <div className="profile-hero h-100 d-flex flex-column justify-content-between">
              <div>
                <div className="profile-hero__eyebrow mb-3">Customer Account</div>
                <h1 className="profile-hero__title h2 fw-bold mb-3">Edit your profile</h1>
                <p className="mb-4 text-light-emphasis">
                  Keep your personal details and delivery address up to date so checkout stays fast.
                </p>
              </div>

              <div className="row g-3 mt-2">
                <div className="col-6 col-lg-12">
                  <div className="profile-stat">
                    <div className="small text-uppercase text-warning-emphasis">Total Orders</div>
                    <div className="fs-4 fw-bold">{stats.totalOrders}</div>
                  </div>
                </div>
                <div className="col-6 col-lg-12">
                  <div className="profile-stat">
                    <div className="small text-uppercase text-warning-emphasis">Delivered</div>
                    <div className="fs-4 fw-bold">{stats.deliveredOrders}</div>
                  </div>
                </div>
                <div className="col-6 col-lg-12">
                  <div className="profile-stat">
                    <div className="small text-uppercase text-warning-emphasis">Saved Address</div>
                    <div className="fs-4 fw-bold">{stats.savedAddresses ? "Yes" : "No"}</div>
                  </div>
                </div>
                <div className="col-6 col-lg-12">
                  <div className="profile-stat">
                    <div className="small text-uppercase text-warning-emphasis">Total Spent</div>
                    <div className="fs-4 fw-bold">Rs {stats.totalSpent.toFixed(2)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-8">
            <div className="profile-form-card">
              <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap mb-4">
                <div>
                  <h2 className="h4 fw-bold mb-1">Personal Information</h2>
                  <p className="text-muted mb-0">
                    Update your contact details and preferred delivery address.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-outline-primary rounded-pill"
                  onClick={handleUseCurrentLocation}
                  disabled={isCapturingLocation || isSaving}
                >
                  {isCapturingLocation ? "Capturing Location..." : "Use Current Location"}
                </button>
              </div>

              <form onSubmit={onSubmitHandler}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="profile-form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={formData.name}
                      onChange={onChangeHandler}
                      required
                      disabled={isSaving}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="profile-form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={formData.email}
                      readOnly
                      disabled
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="profile-form-label">Phone Number</label>
                    <input
                      type="tel"
                      className="form-control"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={onChangeHandler}
                      required
                      disabled={isSaving}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="profile-form-label">Current Delivery City</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.savedAddress.city}
                      readOnly
                      disabled
                    />
                  </div>

                  <div className="col-12 mt-4">
                    <h3 className="h5 fw-bold mb-2">Saved Delivery Address</h3>
                  </div>
                  <div className="col-md-6">
                    <label className="profile-form-label">First Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="savedAddress.firstName"
                      value={formData.savedAddress.firstName}
                      onChange={onChangeHandler}
                      required
                      disabled={isSaving}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="profile-form-label">Last Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="savedAddress.lastName"
                      value={formData.savedAddress.lastName}
                      onChange={onChangeHandler}
                      required
                      disabled={isSaving}
                    />
                  </div>
                  <div className="col-12">
                    <label className="profile-form-label">Street Address</label>
                    <input
                      type="text"
                      className="form-control"
                      name="savedAddress.line1"
                      value={formData.savedAddress.line1}
                      onChange={onChangeHandler}
                      required
                      disabled={isSaving}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="profile-form-label">City</label>
                    <input
                      type="text"
                      className="form-control"
                      name="savedAddress.city"
                      value={formData.savedAddress.city}
                      onChange={onChangeHandler}
                      required
                      disabled={isSaving}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="profile-form-label">State</label>
                    <input
                      type="text"
                      className="form-control"
                      name="savedAddress.state"
                      value={formData.savedAddress.state}
                      onChange={onChangeHandler}
                      required
                      disabled={isSaving}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="profile-form-label">Zip</label>
                    <input
                      type="text"
                      className="form-control"
                      name="savedAddress.zipcode"
                      value={formData.savedAddress.zipcode}
                      onChange={onChangeHandler}
                      required
                      disabled={isSaving}
                    />
                  </div>
                  <div className="col-md-12">
                    <label className="profile-form-label">Country</label>
                    <select
                      className="form-select"
                      name="savedAddress.country"
                      value={formData.savedAddress.country}
                      onChange={onChangeHandler}
                      disabled={isSaving}
                    >
                      <option value="IN">India</option>
                      <option value="US">United States</option>
                      <option value="GB">United Kingdom</option>
                    </select>
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-3 mt-4 flex-wrap">
                  <button
                    type="submit"
                    className="btn btn-primary rounded-pill px-4"
                    disabled={isSaving}
                  >
                    {isSaving ? "Saving..." : "Save Profile"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
