import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { ProductListItem } from "../shared/product-list-item.model";
import { SingleProduct } from "../shared/single-product.model";
import { Review } from "../shared/review.model";
import { environment } from "src/environments/environment";
import { AdminProductModel } from '../admin/admin-product.model';
import {from, Observable} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/firestore';
import firebase from 'firebase/app';
import 'firebase/firestore';


interface Product{
  averageRating : string
  category  : string
  name : string
  noOfRatings : string
  price : string
  productDesc1 : string
  productDesc2 : string
  productDesc3 : string
  subcategory : string
}
@Injectable({
  providedIn: "root"
})
export class ProductsService {
  private products: ProductListItem[] = [];
  productsUpdated = new Subject<ProductListItem[]>();
  productReceived = new Subject<SingleProduct>();
  // productReceived : SingleProduct;
  productPhotosReceived = new Subject<[]>();
  productReviewsReceived = new Subject<Review[]>();
  userCollection: AngularFirestoreCollection<SingleProduct>;
  users: Observable<SingleProduct[]>;
  constructor(private httpClient: HttpClient, private firestore: AngularFirestore) {}
  db = firebase.firestore();
  createProduct(product: AdminProductModel) {
    return this.httpClient.post(environment.apiUrl + "/api/products", product);
  }

  adminGetProducts() {
    return this.httpClient.get<{ success: number, products: [] }>(environment.apiUrl + "/api/products/admin/get");
  }

  getKeywords() {
    return this.httpClient.get<{ success: number, keywords: [] }>(environment.apiUrl + "/api/products/keywords/get");
  }

  getProductss(): Observable<SingleProduct[]> {
    alert("kok")
    var docRef = this.db.collection("products").doc("behO8OxKp3o8BbGlWtP3");

    docRef.get().then((doc) => {
        if (doc.exists) {
            console.log("Document data:", doc.data());
        } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
        }
    }).catch((error) => {
        console.log("Error getting document:", error);
    });
    // this.userCollection = this.firestore.collection<SingleProduct>(
    //   'products',
    // );
    // this.users = this.userCollection.snapshotChanges().pipe(
    //   map((actions) =>
    //     actions.map((a) => {
    //       alert('jj')
    //       const data = a.payload.doc.data() as SingleProduct;
    //       // data.id = a.payload.doc.id;

    //       // data.date = new Date(parseInt(data.date)).toDateString();
    //       return data;
    //     }),
    //   ),
    // );
    // console.log(this.users)
    return this.users;
  }

  getProducts(queryParams) {
    const filters = queryParams.filters ? queryParams.filters : "";
    const sortBy = queryParams.sortBy ? queryParams.sortBy : "";
    const order = queryParams.order ? queryParams.order : "";
    const q = queryParams.q ? queryParams.q : "";

    this.httpClient
      .get<{ success: string; products: ProductListItem[] }>(
        environment.apiUrl +
          "/api/products?filters=" +
          filters +
          "&q=" + q +
          "&sortBy=" +
          sortBy +
          "&order=" +
          order
      )
      .subscribe(productsData => {
        this.products = productsData.products;
        this.productsUpdated.next([...this.products]);
      });
  }

  getProductsByCategory(params, queryParams) {
    const category = params.category ? params.category : "";
    const subcategories = queryParams.subcategories ? queryParams.subcategories : "";
    const filters = queryParams.filters ? queryParams.filters : "";
    const sortBy = queryParams.sortBy ? queryParams.sortBy : "";
    const order = queryParams.order ? queryParams.order : "";

    this.httpClient
      .get<{ success: string; products: ProductListItem[] }>(
        environment.apiUrl +
          "/api/products/category/" +
          category +
          "?filters=" +
          filters +
          "&subcategories=" +
          subcategories +
          "&sortBy=" +
          sortBy +
          "&order=" +
          order
      )
      .subscribe(productsData => {
        this.products = productsData.products;
        this.productsUpdated.next([...this.products]);
      }, error => {
        /* console.log(error); */
      });
  }

  getProductById(id: number) {
    this.httpClient
      .get<{ success: string; product: SingleProduct }>(
        environment.apiUrl + "/api/products/" + id
      )
      .subscribe(productsData => {
        this.productReceived.next(productsData.product);
      });

      // var docRef = this.db.collection("products").doc("behO8OxKp3o8BbGlWtP3");

      // docRef.get().then((doc) => {
      //     if (doc.exists) {
      //       this.productReceived.next(doc.data() as SingleProduct);
      //       alert(doc.data().productDesc2)
      //     } else {
      //         console.log("No such document!");
      //     }
      // }).catch((error) => {
      //     console.log("Error getting document:", error);
      // });

      // this.userCollection = this.firestore.collection<SingleProduct>(
      //   "products",
      // );
      // return this.userCollection
      //   .doc<SingleProduct>("15")
      //   .snapshotChanges()
      //   .pipe(
      //     map((response) => {
      //       alert('kok')
      //       const data = response.payload.data() as SingleProduct;
      //       // data.id = response.payload.id;
      //       console.log(data)

      //     this.productReceived.next(data);

      //       return data;
      //     }),
      //   );
    // this.userCollection = this.firestore.collection<SingleProduct>(
    //   'products',
    // );
    // this.users = this.userCollection.snapshotChanges().pipe(
    //   map((actions) =>
    //     actions.map((a) => {
    //       const data = a.payload.doc.data() as SingleProduct;
    //       alert('ko')
    //       // data.id = a.payload.doc.id;

    //       // data.date = new Date(parseInt(data.date)).toDateString();
    //       return data;
    //     }),
    //   ),
    // );
    // // console.log(this.users)
    // return this.users;
  }

  getProductPhotosById(id: number) {
    this.httpClient
      .get<{ success: string; imgUrls: [] }>(
        environment.apiUrl + "/api/products/" + id + "/photos"
      )
      .subscribe(productsData => {
        // console.log(productsData.imgUrls)
        this.productPhotosReceived.next(productsData.imgUrls);
      });
  }

  getProductReviewsById(id: number, queryParams) {
    let sortBy = queryParams.sortBy;
    let order = queryParams.order;

    if (!queryParams.sortBy) {
      sortBy = "";
    }

    if (!queryParams.order) {
      order = "";
    }

    this.httpClient
      .get<{ success: string; reviews: Review[] }>(
        environment.apiUrl +
          "/api/products/" +
          id +
          "/reviews?sortBy=" +
          sortBy +
          "&order=" +
          order
      )
      .subscribe(productsData => {
        this.productReviewsReceived.next(productsData.reviews);
      });
  }

  getSubCategories(category: string) {
    return this.httpClient.get<{
      success: string;
      result: { subCategory: string; count: number }[];
    }>(environment.apiUrl + "/api/products/" + category + "/sub-categories");
  }
}
