export interface IMenuItem {
  id: number;
  product_key?: string;
  language?: string;
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
