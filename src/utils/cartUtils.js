// src/utils/cartUtils.js

export const getCart = () => {
    const raw = localStorage.getItem("cart");
    try {
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
};

export const addToCart = (product) => {
    const { id, qty = 1 } = product;        // default qty = 1 if missing
    const cart = getCart();
    const idx = cart.findIndex((p) => p.id === id);

    if (idx >= 0) {
        // add the passed-in quantity instead of always +1
        cart[idx].qty += qty;
    } else {
        // push the full product with its qty
        cart.push({ ...product, qty });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
};

// optional helper to wipe cart
export const clearCart = () => {
    localStorage.removeItem("cart");
};
