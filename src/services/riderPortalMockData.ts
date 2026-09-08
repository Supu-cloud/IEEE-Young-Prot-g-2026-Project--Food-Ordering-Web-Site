export type RiderDeliveryStatus = 'Assigned' | 'Accepted' | 'Picked Up' | 'Out for Delivery' | 'Delivered'
export type RiderDelivery = { id: string; restaurant: string; pickup: string; customer: string; dropoff: string; phone: string; distance: string; eta: string; payout: number; status: RiderDeliveryStatus; items: string[] }

export const riderDeliveries: RiderDelivery[] = [
  { id: 'FD-1048', restaurant: 'Ceylon Kitchen', pickup: '128 Galle Road, Colombo 03', customer: 'Maya Perera', dropoff: '18 Flower Road, Colombo 07', phone: '077 234 6789', distance: '3.2 km', eta: '18 min', payout: 420, status: 'Assigned', items: ['2 x Cheese Chicken Kottu', '1 x Ceylon Milk Tea'] },
  { id: 'FD-1045', restaurant: 'Hopper House', pickup: '24 Ward Place, Colombo 07', customer: 'Dinuka Jayasinghe', dropoff: '91 Temple Road, Kotte', phone: '075 903 2241', distance: '5.8 km', eta: '27 min', payout: 610, status: 'Out for Delivery', items: ['2 x Chicken Lamprais'] },
  { id: 'FD-1039', restaurant: 'Island Spice', pickup: '65 High Level Road, Nugegoda', customer: 'Aisha Fernando', dropoff: '6 Park Lane, Rajagiriya', phone: '076 512 9034', distance: '4.1 km', eta: '22 min', payout: 520, status: 'Delivered', items: ['1 x Seafood Fried Rice', '1 x Lime Juice'] },
  { id: 'FD-1037', restaurant: 'Short Eats', pickup: '12 Station Road, Dehiwala', customer: 'Nimal Silva', dropoff: '42 Lake Drive, Nugegoda', phone: '071 845 1290', distance: '6.3 km', eta: '31 min', payout: 680, status: 'Delivered', items: ['2 x Chicken Rolls', '2 x Fish Patties'] },
]

export const riderProfile = { name: 'Kasun Perera', phone: '077 456 1290', email: 'kasun.rider@example.com', vehicleType: 'Motorcycle', vehicleNumber: 'WP BCT-4821', rating: 4.9, completed: 384, image: '' }

export const earningsHistory = [
  { day: 'Today', trips: 7, amount: 3850 }, { day: 'Yesterday', trips: 6, amount: 3240 }, { day: 'Wednesday', trips: 8, amount: 4180 }, { day: 'Tuesday', trips: 5, amount: 2760 },
]
