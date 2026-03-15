const API_URL = 'https://backend.jotish.in/backend_dev/gettabledata.php';

export async function fetchEmployees() {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'test', password: '123456' }),
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  const data = await response.json();
  return data;
}

/**
 * Merge a photo (Base64) and a signature canvas into a single image Blob/Base64.
 * Draws the photo first, then overlays the signature on top.
 */
export function mergePhotoAndSignature(photoDataUrl, signatureCanvas) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');

      // Draw photo
      ctx.drawImage(img, 0, 0);

      // Draw signature overlay
      ctx.drawImage(signatureCanvas, 0, 0, canvas.width, canvas.height);

      // Export
      const mergedDataUrl = canvas.toDataURL('image/png');
      resolve(mergedDataUrl);
    };
    img.src = photoDataUrl;
  });
}

/**
 * City-to-coordinate mapping for India-based cities.
 * Used by the Leaflet map on the Analytics page.
 */
export const CITY_COORDINATES = {
  'Mumbai': [19.0760, 72.8777],
  'Delhi': [28.7041, 77.1025],
  'Bangalore': [12.9716, 77.5946],
  'Bengaluru': [12.9716, 77.5946],
  'Chennai': [13.0827, 80.2707],
  'Kolkata': [22.5726, 88.3639],
  'Hyderabad': [17.3850, 78.4867],
  'Pune': [18.5204, 73.8567],
  'Ahmedabad': [23.0225, 72.5714],
  'Jaipur': [26.9124, 75.7873],
  'Lucknow': [26.8467, 80.9462],
  'Surat': [21.1702, 72.8311],
  'Kanpur': [26.4499, 80.3319],
  'Nagpur': [21.1458, 79.0882],
  'Indore': [22.7196, 75.8577],
  'Thane': [19.2183, 72.9781],
  'Bhopal': [23.2599, 77.4126],
  'Visakhapatnam': [17.6868, 83.2185],
  'Patna': [25.6093, 85.1376],
  'Vadodara': [22.3072, 73.1812],
  'Gurgaon': [28.4595, 77.0266],
  'Noida': [28.5355, 77.3910],
  'Coimbatore': [11.0168, 76.9558],
  'Kochi': [9.9312, 76.2673],
  'Chandigarh': [30.7333, 76.7794],
  'Guwahati': [26.1445, 91.7362],
  'Mysore': [12.2958, 76.6394],
  'New York': [40.7128, -74.0060],
  'San Francisco': [37.7749, -122.4194],
  'London': [51.5074, -0.1278],
  'Singapore': [1.3521, 103.8198],
  'Dubai': [25.2048, 55.2708],
  'Tokyo': [35.6762, 139.6503],
};
