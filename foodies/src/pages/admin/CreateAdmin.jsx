import React, { useState } from 'react';
import { createAdmin } from '../../service/userService'; // Adjust path as needed
import AdminLayout from './AdminLayout';

const CreateAdmin = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Handle input changes, updating the formData state
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        // Clear any previous error/message on new input
        setError('');
        setMessage('');
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic client-side validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        setError('');
        setMessage('');

        try {
            const adminData = {
                email: formData.email,
                password: formData.password,
                // Note: The 'role' assignment is handled server-side 
                // by the userService.createAdmin(request) method.
            };

            const response = await createAdmin(adminData);
            
            setMessage(`Admin user ${response.email} created successfully!`);
            
            // Clear the form fields after successful creation
            setFormData({
                email: '',
                password: '',
                confirmPassword: '',
            });

        } catch (err) {
            // Handle various API errors (e.g., email already exists, unauthorized)
            const errorMsg = err.response 
                ? err.response.data.message || 'Failed to create admin.' 
                : 'Network error or service unavailable.';
            
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
       <AdminLayout>
         <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card shadow-lg">
                        <div className="card-header bg-primary text-white">
                            <h4 className="mb-0">Create New Administrator</h4>
                        </div>
                        <div className="card-body">
                            {/* Success and Error Messages */}
                            {message && (
                                <div className="alert alert-success">{message}</div>
                            )}
                            {error && (
                                <div className="alert alert-danger">{error}</div>
                            )}

                            <form onSubmit={handleSubmit}>
                                {/* Email Input */}
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label">Email address</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                    />
                                </div>

                                {/* Password Input */}
                                <div className="mb-3">
                                    <label htmlFor="password" className="form-label">Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        minLength="6"
                                        disabled={loading}
                                    />
                                </div>

                                {/* Confirm Password Input */}
                                <div className="mb-3">
                                    <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                    />
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    className="btn btn-success w-100"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Creating...
                                        </>
                                    ) : (
                                        'Create Admin'
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
       </AdminLayout>
    );
};

export default CreateAdmin;