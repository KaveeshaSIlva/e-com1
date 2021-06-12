import {Injectable} from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/firestore';
import {from, Observable} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import {FilterQuery, MODELTYPE} from '../../shared/models';
import {Product} from '../../shared/models';
import firebase from 'firebase/app';
import 'firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  productCollection: AngularFirestoreCollection<Product>;
  products: Observable<Product[]>;
  constructor(private firestore: AngularFirestore) {}
  db = firebase.firestore();
  paramQuery:firebase.firestore.DocumentData = this.db.collection(MODELTYPE.PRODUCTS);
  // getProducts(): Observable<Product[]> {
  //   this.productCollection = this.firestore.collection<Product>(
  //     MODELTYPE.PRODUCTS,
  //   );
  //   this.products = this.productCollection.snapshotChanges().pipe(
  //     map((actions) =>
  //       actions.map((a) => {
  //         const data = a.payload.doc.data() as Product;
  //         data.id = a.payload.doc.id;
  //         // data.date = new Date(parseInt(data.date)).toDateString();
  //         return data;
  //       }),
  //     ),
  //   );
  //   return this.products;
  // }

  updateFilterQuery(listDocRef: firebase.firestore.DocumentData,field: string,value:any, operator: string="=="): firebase.firestore.DocumentData 
  {
    return listDocRef.where(field,operator,value);
  }

  updateSortQuery(listDocRef: firebase.firestore.DocumentData,field: string,order:string): firebase.firestore.DocumentData 
  {
    if(order!=undefined && order=="DESC"){
      return listDocRef.orderBy(field,'desc');
    } else {
      return listDocRef.orderBy(field)
    }
  }

  async getProducts(qparams: FilterQuery){
    this.paramQuery = this.db.collection(MODELTYPE.PRODUCTS);
    if(qparams.keyword!= undefined){
      this.paramQuery = this.updateFilterQuery(this.paramQuery,'name',qparams.keyword);
    }
    if(qparams.category!= undefined){
      this.paramQuery = this.updateFilterQuery(this.paramQuery,'category',qparams.category);
    }
    if(qparams.subcategory!= undefined){
      this.paramQuery = this.updateFilterQuery(this.paramQuery,'subcategory',qparams.subcategory);
    }
    if(qparams.sortBy!= undefined){
      this.paramQuery = this.updateSortQuery(this.paramQuery, qparams.sortBy, qparams.order? qparams.order:"DESC");
    } else{
      this.paramQuery = this.updateSortQuery(this.paramQuery, 'noOfRatings', 'DESC');
    }
    // let x =this.paramQuery.query()
    // console.log(this.paramQuery)
    // if(qparams.category!= undefined){
    //   this.paramQuery = this.updateFilterQuery(this.paramQuery,'category',qparams.category);
    // }
    // let listDocRef = this.db.collection(MODELTYPE.PRODUCTS).where('name','==',name);
    let s = await this.paramQuery.get().then((querySnapshot)=>{
      let w = querySnapshot.docs.map(function(doc) {
        return doc;
      });
      return w ;
    })
    return s;
  }

  async getCategoryByName(name:string){
    let listDocRef = this.db.collection(MODELTYPE.PRODUCTS).where('name','==',name);
    let s = await listDocRef.get().then((querySnapshot)=>{
      let w = querySnapshot.docs.map(function(doc) {
        return doc;
      });
      return w ;
    })
    return s;
  }

  // getProductssss(): Product[] {
  //   this.db.collection(MODELTYPE.PRODUCTS).where("name", "==", "Lettuce")
  //     .onSnapshot((querySnapshot) => {
  //         // var cities = [];
  //         // querySnapshot.forEach((doc) => {
  //         //     const data = doc.data() as Product;
  //         //     cities.push(data);
  //         // });
  //         let w = querySnapshot.docs.map(function(doc) {
  //           const data = doc.data() as Product;
  //           return data;
  //         });
  //         return w[0];
  //         // return cities;
  //     });
  //   // this.productCollection = this.firestore.collection<Product>(
  //   //   MODELTYPE.PRODUCTS,
  //   // );
  //   // this.products = this.productCollection.get({name: "Lettuce"}).pipe(
  //   //   map((actions) =>
  //   //     actions.map((a) => {
  //   //       const data = a.payload.doc.data() as Product;
  //   //       data.id = a.payload.doc.id;
  //   //       // data.date = new Date(parseInt(data.date)).toDateString();
  //   //       return data;
  //   //     }),
  //   //   ),
  //   // );
  //   // return this.products;
  // }
  
  // getProductsByIds(){
  // this.db.collection(MODELTYPE.PRODUCTS).where("name", "in", ['Pen','Pencil'])
  //   .get()
  //   .then(function(querySnapshot) {
  //       querySnapshot.forEach(function(doc) {
  //           // doc.data() is never undefined for query doc snapshots
  //           console.log(doc.id, " => ", doc.data());
  //       });
  //   })
  //   .catch(function(error) {
  //       console.log("Error getting documents: ", error);
  //   });
  // }
  getProductsInCategory(id: string) {
    this.db
      .collection(MODELTYPE.PRODUCTS)
      .where(firebase.firestore.FieldPath.documentId(), 'in', [
        'EnZRiX9LQ3wFSP5IZ8EL',
        'Pencil',
      ])
      .get()
      .then(function (querySnapshot) {
        var products = querySnapshot.docs.map((doc) => {
          return doc.data();
        });
        console.log(products);
        return products;
      })
      .catch(function (error) {
        console.log('Error getting documents: ', error);
      });
  }
  getProductsByIds() {
    this.db
      .collection(MODELTYPE.PRODUCTS)
      .where(firebase.firestore.FieldPath.documentId(), 'in', [
        'EnZRiX9LQ3wFSP5IZ8EL',
        'Pencil',
      ])
      .get()
      .then(function (querySnapshot) {
        var products = querySnapshot.docs.map((doc) => {
          return doc.data();
        });
        return products;
      })
      .catch(function (error) {
        console.log('Error getting documents: ', error);
      });
  }
  getProductById(id: string): Observable<Product> {
    this.productCollection = this.firestore.collection<Product>(
      MODELTYPE.PRODUCTS,
    );
    return this.productCollection
      .doc<Product>(id)
      .snapshotChanges()
      .pipe(
        map((response) => {
          const data = response.payload.data() as Product;
          data.id = response.payload.id;
          return data;
        }),
      );
  }

  addProduct(data) {
    // Add a new document with a generated id.
    this.firestore
      .collection(MODELTYPE.PRODUCTS)
      .add({
        name: data.name,
        date: data.date,
        photo: data.photo,
        category: data.category,
        varients: data.varients,
      })
      .then(function (docRef) {
        alert('Document written with ID: ' + docRef.id);
      })
      .catch(function (error) {
        console.error('Error adding document: ', error);
      });
  }

  setProduct(id: string, body: any) {
    this.productCollection = this.firestore.collection<Product>(
      MODELTYPE.PRODUCTS,
    );
    // this.userCollection.add(body);
    this.productCollection.doc(id).set(body);
  }

  updateProduct(id: string, body: any) {
    this.productCollection = this.firestore.collection(MODELTYPE.PRODUCTS);
    this.productCollection.doc(id).update(body);
  }

  deleteProduct(id: string) {
    this.productCollection = this.firestore.collection<Product>(
      MODELTYPE.PRODUCTS,
    );
    this.productCollection.doc(id).delete();
  }
}
