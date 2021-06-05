import {Injectable} from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/firestore';
import {from, Observable} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import {MODELTYPE} from '../../shared/models';
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
  getProducts(): Observable<Product[]> {
    this.productCollection = this.firestore.collection<Product>(
      MODELTYPE.PRODUCTS,
    );
    this.products = this.productCollection.snapshotChanges().pipe(
      map((actions) =>
        actions.map((a) => {
          const data = a.payload.doc.data() as Product;
          data.id = a.payload.doc.id;
          // data.date = new Date(parseInt(data.date)).toDateString();
          return data;
        }),
      ),
    );
    return this.products;
  }
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
