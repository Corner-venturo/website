export interface StayInfo {
  name: string;
  rating: number;
  stars: number;
  image: string;
  address: string;
  checkIn: { date: string; day: string; time: string };
  checkOut: { date: string; day: string; time: string };
  nights: number;
  bookingId: string;
  roomType: string;
  bedType: string;
  guests: string;
  requests: string[];
  paymentStatus: string;
  phone: string;
}
