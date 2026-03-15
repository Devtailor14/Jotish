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

  const json = await response.json();
  const rawData = json?.TABLE_DATA?.data || json?.data || json;
  const rows = Array.isArray(rawData) ? rawData : [];

  return rows.map((row) => {
    if (Array.isArray(row)) {
      return {
        name: row[0] || '',
        position: row[1] || '',
        city: row[2] || '',
        id: row[3] || '',
        date: row[4] || '',
        salary: parseSalary(row[5]),
      };
    }
    return row;
  });
}

function parseSalary(val) {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    return parseFloat(val.replace(/[$,]/g, '')) || 0;
  }
  return 0;
}

export function mergePhotoAndSignature(photoDataUrl, signatureCanvas) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');

      ctx.drawImage(img, 0, 0);
      ctx.drawImage(signatureCanvas, 0, 0, canvas.width, canvas.height);

      const mergedDataUrl = canvas.toDataURL('image/png');
      resolve(mergedDataUrl);
    };
    img.src = photoDataUrl;
  });
}

export const CITY_COORDINATES = {
  'Edinburgh': [55.9533, -3.1883],
  'London': [51.5074, -0.1278],
  'New York': [40.7128, -74.0060],
  'San Francisco': [37.7749, -122.4194],
  'Sidney': [-33.8688, 151.2093],
  'Sydney': [-33.8688, 151.2093],
  'Singapore': [1.3521, 103.8198],
  'Tokyo': [35.6762, 139.6503],
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
  'Dubai': [25.2048, 55.2708],
};
