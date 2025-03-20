export interface IMenuItem {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  description?: string;
}

export interface IOrderItem {
  id: number;
  name: string;
  price: number;
  category: string;
  quantity?: number;
}
