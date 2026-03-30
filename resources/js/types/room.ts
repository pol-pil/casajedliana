export type Status = 'Available' | 'Occupied' | 'Reserved' | 'Maintenance';

export type Room = {
	id: number;
	roomNumber: string;
	category: string;
	capacity: number;
	beds: string;
	amenities: string[];
	status: Status;
	price?: number;
};