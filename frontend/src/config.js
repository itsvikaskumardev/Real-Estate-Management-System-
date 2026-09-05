// When deployed on Vercel, API_URL can be empty because the backend is on the same domain
// and requests to /api/* are automatically routed to the .NET container.
export const API_URL = import.meta.env.PROD ? "" : "http://localhost:5291";

export default API_URL;