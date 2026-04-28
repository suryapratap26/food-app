import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { storeContext } from "../../context/StoreContext";

const CompleteAddress = () => {
    const navigate = useNavigate();
    const { userProfile, saveUserProfile } = useContext(storeContext);
    const [isSaving, setIsSaving] = useState(false);
    const [data, setData] = useState({
        firstName: "",
        lastName: "",
        phone: "",
        line1: "",
        city: "",
        state: "",
        country: "IN",
        zipcode: "",
    });

    useEffect(() => {
        if (!userProfile) {
            return;
        }

        if (userProfile.role && userProfile.role !== "CUSTOMER") {
            navigate("/admin", { replace: true });
            return;
        }

        if (userProfile.savedAddress?.line1 && userProfile.savedAddress?.city) {
            navigate("/", { replace: true });
            return;
        }

        setData((prev) => ({
            ...prev,
            firstName: userProfile.savedAddress?.firstName || userProfile.name || prev.firstName,
            lastName: userProfile.savedAddress?.lastName || prev.lastName,
            phone: userProfile.savedAddress?.phone || userProfile.phoneNumber || prev.phone,
            line1: userProfile.savedAddress?.line1 || prev.line1,
            city: userProfile.savedAddress?.city || prev.city,
            state: userProfile.savedAddress?.state || prev.state,
            country: userProfile.savedAddress?.country || prev.country,
            zipcode: userProfile.savedAddress?.zipcode || prev.zipcode,
        }));
    }, [navigate, userProfile]);

    const onChangeHandler = (event) => {
        const { name, value } = event.target;
        setData((prev) => ({ ...prev, [name]: value }));
    };

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        setIsSaving(true);

        try {
            await saveUserProfile({
                phoneNumber: data.phone,
                savedAddress: {
                    firstName: data.firstName,
                    lastName: data.lastName,
                    phone: data.phone,
                    line1: data.line1,
                    city: data.city,
                    state: data.state,
                    country: data.country,
                    zipcode: data.zipcode,
                },
            });
            toast.success("Address saved successfully.");
            navigate("/", { replace: true });
        } catch (error) {
            console.error("complete address save error:", error);
            toast.error("Could not save your address.");
        } finally {
            setIsSaving(false);
        }
    };

    const onSkipHandler = () => {
        navigate("/", { replace: true });
    };

    return (
        <section className="login-page">
            <div className="login-page__glow login-page__glow--one"></div>
            <div className="login-page__glow login-page__glow--two"></div>

            <div className="container position-relative py-5">
                <div className="row justify-content-center align-items-center min-vh-100">
                    <div className="col-12 col-lg-8">
                        <div className="login-shell">
                            <div className="login-shell__content">
                                <span className="login-shell__eyebrow">One Last Step</span>
                                <h1 className="login-shell__title">Please provide your address</h1>
                                <p className="login-shell__text">
                                    Add your delivery details now, or skip and do it later at checkout.
                                </p>
                            </div>

                            <div className="login-card shadow-lg">
                                <div className="text-center mb-4">
                                    <div className="login-card__icon">
                                        <i className="bi bi-geo-alt"></i>
                                    </div>
                                    <h3 className="fw-bold mt-3 mb-2">
                                        Delivery Address
                                    </h3>
                                    <p className="text-secondary mb-0">
                                        Please provide your address details below.
                                    </p>
                                </div>

                                <form onSubmit={onSubmitHandler}>
                                    <div className="row g-3 mb-4">
                                        <div className="col-sm-6">
                                            <label className="form-label">First Name</label>
                                            <input
                                                className="form-control rounded-4"
                                                placeholder="First name"
                                                name="firstName"
                                                value={data.firstName}
                                                onChange={onChangeHandler}
                                                required
                                                disabled={isSaving}
                                            />
                                        </div>
                                        <div className="col-sm-6">
                                            <label className="form-label">Last Name</label>
                                            <input
                                                className="form-control rounded-4"
                                                placeholder="Last name"
                                                name="lastName"
                                                value={data.lastName}
                                                onChange={onChangeHandler}
                                                required
                                                disabled={isSaving}
                                            />
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label">Phone</label>
                                            <input
                                                className="form-control rounded-4"
                                                placeholder="Phone number"
                                                name="phone"
                                                value={data.phone}
                                                onChange={onChangeHandler}
                                                required
                                                disabled={isSaving}
                                            />
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label">Street Address</label>
                                            <input
                                                className="form-control rounded-4"
                                                placeholder="Street address"
                                                name="line1"
                                                value={data.line1}
                                                onChange={onChangeHandler}
                                                required
                                                disabled={isSaving}
                                            />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label">City</label>
                                            <input
                                                className="form-control rounded-4"
                                                placeholder="City"
                                                name="city"
                                                value={data.city}
                                                onChange={onChangeHandler}
                                                required
                                                disabled={isSaving}
                                            />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label">State</label>
                                            <input
                                                className="form-control rounded-4"
                                                placeholder="State"
                                                name="state"
                                                value={data.state}
                                                onChange={onChangeHandler}
                                                required
                                                disabled={isSaving}
                                            />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label">Zip</label>
                                            <input
                                                className="form-control rounded-4"
                                                placeholder="Zip"
                                                name="zipcode"
                                                value={data.zipcode}
                                                onChange={onChangeHandler}
                                                required
                                                disabled={isSaving}
                                            />
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label">Country</label>
                                            <select
                                                className="form-select rounded-4"
                                                name="country"
                                                value={data.country}
                                                onChange={onChangeHandler}
                                                required
                                                disabled={isSaving}
                                            >
                                                <option value="IN">India</option>
                                                <option value="US">United States</option>
                                                <option value="GB">United Kingdom</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="d-grid gap-3">
                                        <button
                                            className="btn login-card__button btn-lg fw-semibold rounded-4"
                                            type="submit"
                                            disabled={isSaving}
                                        >
                                            {isSaving ? (
                                                <>
                                                    <span
                                                        className="spinner-border spinner-border-sm me-2"
                                                        role="status"
                                                        aria-hidden="true"
                                                    ></span>
                                                    Saving Address...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="bi bi-check2-circle me-2"></i>
                                                    Save Address
                                                </>
                                            )}
                                        </button>

                                        <button
                                            className="btn btn-outline-secondary btn-sm rounded-4"
                                            type="button"
                                            onClick={onSkipHandler}
                                            disabled={isSaving}
                                        >
                                            Skip For Now
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CompleteAddress;
