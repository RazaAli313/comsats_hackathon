# Security Analysis — ShopMart

This document summarizes security considerations, mitigations applied in the project, and recommended improvements for production readiness.

1. Authentication and session management

- Current approach:
  - Short-lived JWT access token stored in an HttpOnly cookie.
  - Long-lived refresh token with rotation stored server-side (collection `refresh_tokens`).
  - Token rotation and revocation: refresh tokens have a `jti` stored in DB and are deleted on logout or rotation.

- Strengths:
  - HttpOnly cookie prevents JavaScript access (mitigates XSS theft of tokens).
  - Server-side refresh token tracking allows explicit revocation.

- Risks & Recommendations:
  - Ensure `COOKIE_SECURE` is enabled in production so cookies are only sent over HTTPS.
  - Use `SameSite=Lax` or `Strict` depending on embed scenarios to mitigate CSRF. For cross-site POSTs, implement CSRF tokens.
  - Consider short access token TTLs (minutes) and longer refresh lifetimes with rotation.

2. Password storage

- Passwords are hashed with `bcrypt` before storing in MongoDB.
- Recommendation: use a bcrypt cost appropriate for the environment; rotate hashes if algorithm upgrades are needed.

3. Input validation & serialization

- Pydantic models validate request payloads.
- Avoid returning raw `ObjectId` or other non-JSON-serializable values from endpoints; normalize `_id` to `id: str`.
- Recommendation: use `response_model` on endpoints where appropriate and centralize document->dict conversion.

4. File uploads

- Images are validated and processed using Pillow in `backend/utils/cloudinaryUploader.py` before uploading to Cloudinary.
- Limits: 10MB file size; allowed extensions JPG/PNG/WEBP.
- Recommendation: scan uploaded files for malware (third-party services), enforce strict CORS and content-type checks.

5. Payments

- Stripe Checkout is used for payment processing; verify webhook signatures using `STRIPE_WEBHOOK_SECRET`.
- The webhook handler must be idempotent (current implementation checks `stripe_session_id` on orders).
- Recommendation: implement stronger idempotency by storing processed event IDs and consider transactionality when updating stock.

6. Database

- Use principle of least privilege for your MongoDB credentials.
- For atomic operations (order creation + stock decrement), enable replica set and use MongoDB transactions.

7. Admin access and RBAC

- Admin endpoints are guarded via `require_admin` dependency which checks `user.role`.
- The frontend hides admin UI for non-admins, but backend checks are authoritative.

8. Rate limiting & abuse prevention

- Add rate-limiting middleware or an API gateway to prevent brute-force attacks on auth endpoints.

9. Logging & monitoring

- Avoid logging sensitive data (passwords, full tokens). Keep audit logs for security events (logins, failed logins, token rotations).

10. Deployment

- Use HTTPS everywhere; configure proper CORS and HSTS headers.
- Store secrets in environment variables or a secrets manager.

11. Next steps for production

- Configure CI to run static analysis and tests.
- Implement automated penetration tests and dependency scanning.
- Formalize incident response and rotate secrets periodically.

