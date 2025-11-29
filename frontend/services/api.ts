const BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

async function request(path: string, opts: RequestInit = {}) {
  const url = `${BASE}${path}`;
  const res = await fetch(url, { ...opts, credentials: "include" });
  const contentType = res.headers.get("content-type") || "";
  if (res.ok) {
    if (contentType.includes("application/json")) return res.json();
    return res.text();
  }
  let err: any = new Error(`Request failed: ${res.status}`);
  try {
    err.info = await res.json();
  } catch {}
  err.status = res.status;
  throw err;
}

export async function login(email: string, password: string) {
  return request(`/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
}

export async function register(username: string, email: string, password: string) {
  return request(`/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });
}

export async function logout() {
  return request(`/api/auth/logout`, { method: "POST" });
}

export async function me() {
  return request(`/api/auth/me`);
}

export async function getProducts(params: Record<string, any> = {}) {
  // Build querystring while filtering out undefined/null values and the string 'undefined'
  const safe: Record<string, string> = {};
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    // convert boolean/number to string; ignore the literal string 'undefined'
    const s = String(v);
    if (s === "undefined") return;
    safe[k] = s;
  });
  const qs = new URLSearchParams(safe).toString();
  return request(`/api/products${qs ? `?${qs}` : ""}`);
}

export async function getProduct(id: string) {
  return request(`/api/products/${id}`);
}

export async function addToCart(productId: string, quantity: number, price: number) {
  return request(`/api/cart/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ product_id: productId, quantity, price }),
  });
}

export async function uploadImage(file: File) {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${BASE}/api/products/upload-image`, { method: 'POST', body: form, credentials: 'include' });
  if (!res.ok) throw new Error('Upload failed');
  return res.json();
}

export async function getCategories() {
  return request(`/api/products/categories`);
}

export async function getCart() {
  return request(`/api/cart`);
}

export async function checkout(items: any[]) {
  return request(`/api/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });
}

export async function createCheckoutSession(items: any[], successUrl?: string, cancelUrl?: string) {
  return request(`/api/payments/create-checkout-session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items, success_url: successUrl, cancel_url: cancelUrl }),
  });
}

export async function updateCart(productId: string, quantity: number, price: number) {
  return request(`/api/cart/update`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ product_id: productId, quantity, price }),
  });
}

export async function removeFromCart(productId: string) {
  const qs = new URLSearchParams({ product_id: productId }).toString();
  return request(`/api/cart/remove?${qs}`, { method: "DELETE" });
}

export async function createProduct(payload: any) {
  return request(`/api/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function updateProduct(id: string, payload: any) {
  return request(`/api/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function deleteProduct(id: string) {
  return request(`/api/products/${id}`, { method: "DELETE" });
}

export async function getMyOrders() {
  return request(`/api/orders/me`);
}

export async function getAllOrders() {
  return request(`/api/orders/admin`);
}

export default {
  login,
  register,
  logout,
  me,
  getProducts,
  getProduct,
  addToCart,
  getCart,
  checkout,
  createCheckoutSession,
  createProduct,
  updateProduct,
  deleteProduct,
  updateCart,
  removeFromCart,
  getMyOrders,
  getAllOrders,
  uploadImage,
  getCategories,
};
