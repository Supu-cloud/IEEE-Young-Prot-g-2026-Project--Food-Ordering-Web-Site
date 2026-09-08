import type { MenuItem, Order, Restaurant } from '../types'

export const formatLkr = (amount: number) => `Rs. ${Math.round(amount).toLocaleString('en-LK')}`
export const cuisines = [{ name: 'All', emoji: '🍽️' }, { name: 'Breakfast', emoji: '☀️' }, { name: 'Kottu', emoji: '🥘' }, { name: 'Rice & Curry', emoji: '🍛' }, { name: 'Short Eats', emoji: '🥟' }, { name: 'Sweets', emoji: '🍬' }]

export const restaurants: Restaurant[] = [
  { id: 'island-spice', name: 'Island Spice', cuisine: 'Sri Lankan · Rice & Curry', price: 'Rs. 550–2,800', rating: 4.8, reviews: 286, deliveryTime: '25–35 min', image: '/images/logos/island-spice.svg', status: 'Open', featured: true, address: '42 Galle Road, Colombo 03' },
  { id: 'kottu-labs', name: 'Kottu Labs', cuisine: 'Kottu · Street Food', price: 'Rs. 650–1,800', rating: 4.7, reviews: 418, deliveryTime: '20–30 min', image: '/images/logos/kottu-labs.svg', status: 'Open', featured: true, address: '18 Duplication Road, Colombo 04' },
  { id: 'hopper-house', name: 'Hopper House', cuisine: 'Breakfast · Hoppers', price: 'Rs. 350–1,400', rating: 4.9, reviews: 192, deliveryTime: '15–25 min', image: '/images/logos/hopper-house.svg', status: 'Open', featured: true, address: '7 Temple Street, Kandy' },
  { id: 'ape-kema', name: 'Ape Kema', cuisine: 'Traditional · Family Meals', price: 'Rs. 500–3,200', rating: 4.6, reviews: 337, deliveryTime: '30–40 min', image: '/images/logos/ape-kema.svg', status: 'Busy', featured: true, address: '15 Parliament Road, Sri Jayawardenepura Kotte' },
  { id: 'sweet-ceylon', name: 'Sweet Ceylon', cuisine: 'Avurudu Sweets · Desserts', price: 'Rs. 180–1,600', rating: 4.8, reviews: 154, deliveryTime: '20–30 min', image: '/images/logos/sweet-ceylon.svg', status: 'Open', address: '25 High Level Road, Nugegoda' },
  { id: 'short-eats-corner', name: 'Short Eats Corner', cuisine: 'Short Eats · Tea Time', price: 'Rs. 120–950', rating: 4.5, reviews: 229, deliveryTime: '15–25 min', image: '/images/logos/short-eats.svg', status: 'Open', address: '61 Sea Street, Negombo' },
]

const item = (id: string, restaurantId: string, name: string, description: string, price: number, category: string, image: string, popular = false): MenuItem => ({ id, restaurantId, name, description, price, category, image: `/images/food/${image.replace('.png','.jpg')}`, popular })
export const menuItems: MenuItem[] = [
  item('cheese-chicken-kottu','kottu-labs','Cheese Chicken Kottu','Chopped godamba roti, chicken, vegetables and melted cheese.',1450,'Kottu','cheese_kottu.png',true),
  item('egg-hopper-breakfast','hopper-house','Egg Hopper Breakfast','Crisp egg hoppers served with lunu miris and seeni sambol.',780,'Breakfast','egg_hoppers.png',true),
  item('sri-lankan-family-feast','island-spice','Sri Lankan Family Feast','Rice, chicken curry, dhal, seasonal vegetables, sambol and papadam.',3200,'Rice & Curry','sri_lankan_feast.png',true),
  item('ulundu-vadai','short-eats-corner','Ulundu Vadai','Crisp savoury urad-dhal fritters with curry leaves and green chilli.',240,'Short Eats','vadai.png'),
  item('pittu-chicken-curry','ape-kema','Pittu with Chicken Curry','Steamed coconut pittu with chicken curry and coconut milk gravy.',1150,'Rice & Curry','pittu.png',true),
  item('kiribath-breakfast','hopper-house','Kiribath Breakfast','Creamy milk rice with katta sambol and fish ambul thiyal.',850,'Breakfast','kiribath.png'),
  item('konda-kawum','sweet-ceylon','Konda Kawum','Deep golden-brown oil cakes with their traditional raised konda tops.',220,'Sweets','kavum.png',true),
  item('handi-kawum','sweet-ceylon','Handi Kawum','Flat, round rice-flour cakes fried to a warm golden brown.',200,'Sweets','handi_kawum.png'),
  item('kokis','sweet-ceylon','Kokis','Crisp flower-shaped rice-flour treats, a festive Sri Lankan favourite.',180,'Sweets','kokis.png'),
  item('pani-walalu','sweet-ceylon','Pani Walalu','Handmade flower-like tangled loops soaked in fragrant treacle.',280,'Sweets','pani_walalu.png',true),
  item('mung-kawum','sweet-ceylon','Mung Kawum','Folded mung-filled pieces with yellow coating and browned fried edges.',240,'Sweets','mung_kavum.png'),
  item('mun-guli','sweet-ceylon','Mun Guli','Rustic mung balls with a coarse golden surface and caramelised patches.',220,'Sweets','mun_guli.png'),
  item('laveria','sweet-ceylon','Laveria','Soft white string-hopper rolls filled with coconut and jaggery.',260,'Sweets','lavariya.png'),
  item('coconut-pancake','sweet-ceylon','Coconut Pancake','Smooth golden pancakes rolled around sweet coconut and treacle.',240,'Sweets','pancake.png'),
  item('aasmi','sweet-ceylon','Aasmi','Delicate white lacy pieces decorated with ribbons of brown syrup.',260,'Sweets','asmi.png'),
  item('gotu-pittu','sweet-ceylon','Gotu Pittu','Small traditional pittu portions prepared in folded leaf cups.',300,'Sweets','gotu_pittu.png'),
  item('puhul-dosi','sweet-ceylon','Puhul Dosi','Soft crystallised winter-melon confection with a delicate sweetness.',190,'Sweets','puhul_dosi.png'),
  item('kiri-toffee','sweet-ceylon','Kiri Toffee','Rich Sri Lankan milk toffee cut into soft, creamy squares.',240,'Sweets','kiri_toffee.png'),
  item('sau-dodol','sweet-ceylon','Sau Dodol','Glossy, slow-cooked coconut and jaggery confection.',280,'Sweets','sau_dodol.png'),
  item('pani-aluwa','sweet-ceylon','Pani Aluwa','Rice-flour diamonds sweetened with coconut treacle.',210,'Sweets','pani_aluwa.png'),
  item('boondi','sweet-ceylon','Boondi','Tiny golden gram-flour pearls lightly bound with sugar syrup.',180,'Sweets','boondi.png'),
  item('aggala','sweet-ceylon','Aggala','Traditional roasted-rice and coconut balls sweetened with treacle.',190,'Sweets','aggala.png'),
]

export const orders: Order[] = [
  { id:'FD-1234567',restaurant:'Kottu Labs',restaurantImage:restaurants[1].image,placedAt:'August 9, 2026 · 1:30 PM',items:3,total:3280,status:'Preparing' },
  { id:'FD-1234566',restaurant:'Island Spice',restaurantImage:restaurants[0].image,placedAt:'August 8, 2026 · 7:15 PM',items:2,total:3890,status:'Out for Delivery' },
  { id:'FD-1234565',restaurant:'Hopper House',restaurantImage:restaurants[2].image,placedAt:'August 6, 2026 · 8:45 AM',items:4,total:2760,status:'Delivered' },
  { id:'FD-1234564',restaurant:'Sweet Ceylon',restaurantImage:restaurants[4].image,placedAt:'August 3, 2026 · 4:20 PM',items:6,total:1420,status:'Cancelled' },
]
