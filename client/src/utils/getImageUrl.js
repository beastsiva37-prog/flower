const getImageUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  const apiBase = import.meta.env.VITE_API_URL || "https://flower-shop-server-u3av.onrender.com";
  // Remove trailing slash if present to prevent double slashes
  const cleanBase = apiBase.endsWith('/') ? apiBase.slice(0, -1) : apiBase;
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  return `${cleanBase}${cleanUrl}`;
};

export default getImageUrl;
