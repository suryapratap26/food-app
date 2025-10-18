// Assuming this is in a utility file
export const calculateCartTotals = (cartItems, quantities) => {
    
    const subTotal = cartItems.reduce((acc, food) => {
        // Ensure price is a number and quantity exists, default to 0 for safety
        const price = Number(food?.price) || 0;
        const qty = Number(quantities?.[food?.id]) || 0;
        
        return acc + (price * qty);
    }, 0);
    
    // Check if subTotal is still a number (e.g., if quantities had non-numeric values)
    const safeSubTotal = Number(subTotal) || 0;

    const shipping = safeSubTotal === 0 ? 0.0 : 10;
    const tax = safeSubTotal * 0.1;
    const total = safeSubTotal + shipping + tax;
    
    return { subTotal: safeSubTotal, shipping, tax, total }
}