export enum MODELTYPE {
  CATEGORIES = 'categories',
  PRODUCTS = 'products',
  SALES = 'sales',
  CONFIGURATIONS ='configurations',
}
 
export interface Product{
  id: string,
  name: string,
  price: number,
  productDesc1: string,
  productDesc2: string,
  productDesc3: string,
  averageRating: number,
  noOfRatings: number,
  category: string,
  subcategory: string,
  photos: string[],
}

export interface FilterQuery{
  sortBy: string;
  order: string;
  category: string;
  subcategory: string;
  keyword: string;
}