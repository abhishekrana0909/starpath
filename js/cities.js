// [name, lat, lon, timezone offset hours]
export const CITIES = [
  ['Delhi', 28.6139, 77.2090, 5.5], ['Mumbai', 19.0760, 72.8777, 5.5], ['Kolkata', 22.5726, 88.3639, 5.5], ['Chennai', 13.0827, 80.2707, 5.5],
  ['Bengaluru', 12.9716, 77.5946, 5.5], ['Hyderabad', 17.3850, 78.4867, 5.5], ['Ahmedabad', 23.0225, 72.5714, 5.5], ['Pune', 18.5204, 73.8567, 5.5],
  ['Jaipur', 26.9124, 75.7873, 5.5], ['Lucknow', 26.8467, 80.9462, 5.5], ['Kanpur', 26.4499, 80.3319, 5.5], ['Nagpur', 21.1458, 79.0882, 5.5],
  ['Indore', 22.7196, 75.8577, 5.5], ['Bhopal', 23.2599, 77.4126, 5.5], ['Patna', 25.5941, 85.1376, 5.5], ['Vadodara', 22.3072, 73.1812, 5.5],
  ['Ghaziabad', 28.6692, 77.4538, 5.5], ['Noida', 28.5355, 77.3910, 5.5], ['Gurugram', 28.4595, 77.0266, 5.5], ['Faridabad', 28.4089, 77.3178, 5.5],
  ['Ludhiana', 30.9010, 75.8573, 5.5], ['Agra', 27.1767, 78.0081, 5.5], ['Nashik', 19.9975, 73.7898, 5.5], ['Varanasi', 25.3176, 82.9739, 5.5],
  ['Meerut', 28.9845, 77.7064, 5.5], ['Rajkot', 22.3039, 70.8022, 5.5], ['Srinagar', 34.0837, 74.7973, 5.5], ['Amritsar', 31.6340, 74.8723, 5.5],
  ['Prayagraj', 25.4358, 81.8463, 5.5], ['Ranchi', 23.3441, 85.3096, 5.5], ['Jabalpur', 23.1815, 79.9864, 5.5], ['Gwalior', 26.2183, 78.1828, 5.5],
  ['Vijayawada', 16.5062, 80.6480, 5.5], ['Jodhpur', 26.2389, 73.0243, 5.5], ['Udaipur', 24.5854, 73.7125, 5.5], ['Madurai', 9.9252, 78.1198, 5.5],
  ['Raipur', 21.2514, 81.6296, 5.5], ['Kota', 25.2138, 75.8648, 5.5], ['Chandigarh', 30.7333, 76.7794, 5.5], ['Guwahati', 26.1445, 91.7362, 5.5],
  ['Mysuru', 12.2958, 76.6394, 5.5], ['Tiruchirappalli', 10.7905, 78.7047, 5.5], ['Bareilly', 28.3670, 79.4304, 5.5], ['Aligarh', 27.8974, 78.0880, 5.5],
  ['Moradabad', 28.8386, 78.7733, 5.5], ['Gorakhpur', 26.7606, 83.3732, 5.5], ['Dehradun', 30.3165, 78.0322, 5.5], ['Haridwar', 29.9457, 78.1642, 5.5],
  ['Rishikesh', 30.0869, 78.2676, 5.5], ['Ujjain', 23.1765, 75.7885, 5.5], ['Mathura', 27.4924, 77.6737, 5.5], ['Ayodhya', 26.7922, 82.1998, 5.5],
  ['Shimla', 31.1048, 77.1734, 5.5], ['Jammu', 32.7266, 74.8570, 5.5], ['Bhubaneswar', 20.2961, 85.8245, 5.5], ['Thiruvananthapuram', 8.5241, 76.9366, 5.5],
  ['Kochi', 9.9312, 76.2673, 5.5], ['Coimbatore', 11.0168, 76.9558, 5.5], ['Visakhapatnam', 17.6868, 83.2185, 5.5], ['Surat', 21.1702, 72.8311, 5.5],
  ['Panaji', 15.4909, 73.8278, 5.5], ['Dhanbad', 23.7957, 86.4304, 5.5], ['Jamshedpur', 22.8046, 86.2029, 5.5], ['Sonipat', 28.9931, 77.0151, 5.5],
  ['Panipat', 29.3909, 76.9635, 5.5], ['Rohtak', 28.8955, 76.6066, 5.5], ['Hisar', 29.1492, 75.7217, 5.5], ['Karnal', 29.6857, 76.9905, 5.5],
  ['Bikaner', 28.0229, 73.3119, 5.5], ['Ajmer', 26.4499, 74.6399, 5.5], ['Tirupati', 13.6288, 79.4192, 5.5], ['Puducherry', 11.9416, 79.8083, 5.5],
  ['Kathmandu', 27.7172, 85.3240, 5.75], ['Dhaka', 23.8103, 90.4125, 6], ['Karachi', 24.8607, 67.0011, 5], ['Lahore', 31.5204, 74.3587, 5],
  ['Colombo', 6.9271, 79.8612, 5.5], ['Dubai', 25.2048, 55.2708, 4], ['Abu Dhabi', 24.4539, 54.3773, 4], ['Muscat', 23.5880, 58.3829, 4],
  ['Doha', 25.2854, 51.5310, 3], ['Singapore', 1.3521, 103.8198, 8], ['Kuala Lumpur', 3.1390, 101.6869, 8], ['London', 51.5074, -0.1278, 0],
  ['New York', 40.7128, -74.0060, -5], ['Toronto', 43.6532, -79.3832, -5], ['San Francisco', 37.7749, -122.4194, -8], ['Sydney', -33.8688, 151.2093, 10],
];

export const cityByName = (n) => CITIES.find((c) => c[0].toLowerCase() === (n || '').trim().toLowerCase());

/** Online place search (OpenStreetMap Nominatim). Only called when the user presses search. */
export async function searchPlace(q) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(q)}`;
  const r = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!r.ok) throw new Error('search failed');
  const j = await r.json();
  return j.map((x) => ({ name: x.display_name, lat: parseFloat(x.lat), lon: parseFloat(x.lon) }));
}
