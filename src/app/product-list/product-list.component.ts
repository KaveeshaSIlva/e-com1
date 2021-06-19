import { Component, OnInit, OnDestroy, OnChanges, SimpleChanges } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Category } from "../shared/category.model";
import { CategoriesService } from "../shared/categories.service";
import * as faker from "faker";
import { PagerService } from "../shared/pager.service";
import { Subscription, combineLatest } from "rxjs";

import { HeaderMobileService } from "../header-mobile/header-mobile.service";
import { FilterByMobileService } from "./filter-by-mobile/filter-by-mobile.service";
import { ProductsService } from "./products.service";

import { Location } from "@angular/common";
import { ProductListItem } from "../shared/product-list-item.model";
import { AuthService } from "../account/auth.service";
import { CartService } from "../cart/cart.service";
import { FilterByService } from "./filter-by/filter-by.service";

import { Product, FilterQuery } from "../shared/models";
import { ProductService } from "../services/product-service/product.service";
import firebase from 'firebase/app';
import { subscribeOn } from "rxjs/operators";
import { EnumType } from "typescript";

@Component({
  selector: "app-category-page",
  templateUrl: "./product-list.component.html",
  styleUrls: ["./product-list.component.css"]
})
export class ProductListComponent implements OnInit, OnDestroy {
  selectedCategory:{name: string, subcetegories: {name: string}[]}={name:"",subcetegories:[]}
  address: string;
  categories: Category[] = [];
  activeSort = "noOfRatings";
  activeOrder = "DESC";
  paramQuery: firebase.firestore.DocumentData;
  // ui state vars
  isMobileSortByToggled = false;
  isMobileFilterByToggled = false;
  isNavActive = false;

  // subscriptions vars
  productsUpdatedSubscription: Subscription;
  locationSubscription: Subscription;

  // ui state subscriptions
  navActiveSubscription: Subscription;
  filterByMobileServiceSubscription: Subscription;

  // pagination vars
  // products: ProductListItem[] = [];
  pager: any = {};
  // pagedProducts: any[]; // paged items

  latestQueryParams;

  isLoading = true;
  addToCartLoading = 0;

  cartServiceSubscription: Subscription;
  queryParamsSubscription: Subscription;

  isCategoryValid = false;
  allProductsMode: boolean;
  searchMode: boolean;
  getByCategoryMode: boolean;
  getBySubCategoryMode: boolean;
  searchValue;
  pagedProducts: Product[];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private categoryService: CategoriesService,
    private pagerService: PagerService,
    private headerMobileService: HeaderMobileService,
    private filterByMobileService: FilterByMobileService,
    private productsService: ProductsService,
    private location: Location,
    private authService: AuthService,
    private cartService: CartService,
    private filterByService: FilterByService,
    private ps: ProductService
  ) {}
  
  sttt(){
    let qparams =this.route.snapshot.queryParamMap["params"] as FilterQuery;
    // console.log(qparams)
    if(qparams.category!=undefined){
      this.activateMode('category')
      this.selectedCategory = {name: qparams.category,subcetegories:[]}
    }
    if(qparams.keyword !=undefined){
      this.activateMode('search')
      this.searchValue = qparams.keyword
    }
    this.ps.getProducts(qparams).then((categoryDoc)=>{
      let prod = categoryDoc.map((p)=>{
        return p.data()
      })
      this.pagedProducts =prod
      this.isLoading =false
    })
  }

  getProductsByOrder(filterQuery: FilterQuery){
    this.ps.getProducts(filterQuery).then((categoryDoc)=>{
      let prod = categoryDoc.map((p)=>{
        return p.data()
      })
      this.pagedProducts =prod
      this.isLoading =false
    })
  }

  ngOnInit() {
    this.searchMode =false;
    this.getByCategoryMode =false;
    this.getBySubCategoryMode =false;
    this.allProductsMode =true;
    // this.ps.getProducts().subscribe((data)=>{
    //   this.pagedProducts =data
    //   this.isLoading =false
    // })
    // let qparams =this.route.snapshot.queryParamMap["params"] as FilterQuery;
    // this.ps.getProducts(qparams).then((categoryDoc)=>{
    //   let prod = categoryDoc.map((p)=>{
    //     return p.data()
    //   })
    //   this.pagedProducts =prod
    //   this.isLoading =false
    // })
    this.sttt();

    this.categoryService.categoriesFetched.subscribe(res => {
      this.categories = res;
    });

    this.cartServiceSubscription = this.cartService.cartUpdated.subscribe(
      response => {
        this.addToCartLoading = 0;
      }
    );

    this.filterByService.filterByUpdated.subscribe(res => {
      this.isLoading = true;
    });

    this.locationSubscription = this.location.subscribe(() => {
      window.location.reload();
    }) as Subscription;

    this.productsUpdatedSubscription = this.productsService.productsUpdated.subscribe(
      products => {
        // this.products = products;
        this.setPage(1);
        this.isLoading = false;
      }
    );

    // ui state subscriptions
    this.navActiveSubscription = this.headerMobileService.navToggled.subscribe(
      isNavActive => {
        this.isNavActive = isNavActive;
      }
    );

    this.filterByMobileServiceSubscription = this.filterByMobileService.filterByMobileToggled.subscribe(
      f => {
        this.isMobileFilterByToggled = f;
      }
    );
  }

  activateMode(mode:'search'| 'category'|'subcategory'|'all'){
    this.searchMode =false;
    this.getByCategoryMode =false;
    this.getBySubCategoryMode =false;
    this.allProductsMode =false;
      if(mode =='all'){
        this.allProductsMode =true;
      }
      if(mode =='search'){
        this.searchMode =true;
      }
      if(mode =='category'){
        this.getByCategoryMode =true;
      }
      if(mode =='subcategory'){
        this.getBySubCategoryMode =true;
      }
  }

  selectedcategoryChanged(selectedCategory:{name: string, subcetegories: {name: string}[]}){
    this.selectedCategory=selectedCategory
    if(selectedCategory.subcetegories.length>0){
      this.activateMode('subcategory')
    } else{
      this.activateMode('category')
    }
    this.ps.getProductsByCatBrowsing(selectedCategory).then((categoryDoc)=>{
      let prod = categoryDoc.map((p)=>{
        return p.data()
      })
      this.pagedProducts =prod
      this.isLoading =false
    })
  }

  ngOnDestroy() {
    this.productsUpdatedSubscription.unsubscribe();
    this.navActiveSubscription.unsubscribe();
    this.filterByMobileServiceSubscription.unsubscribe();
    this.locationSubscription.unsubscribe();
    this.cartServiceSubscription.unsubscribe();
  }

  getCategoryByUrl(url: string): Category {
    const category = this.categories.find(c => {
      return c.url === url;
    });

    return category;
  }

  isAddToCartLoading(productId) {
    return this.addToCartLoading === +productId ? true : false;
  }

  onAddToCart(productId: number, quantity: number, productName: string) {
    if (this.authService.getAuthStatus()) {
      this.addToCartLoading = productId;
      this.cartService.addToCart(
        "+",
        this.authService.getUserId(),
        productId,
        1,
        productName
      );
    } else {
      this.router.navigate(["/account/login"], {
        queryParams: {
          redirectUrl: this.router.url.includes("?") ? this.router.url.substring(0, this.router.url.indexOf("?")) : this.router.url
        }
      });
    }
  }

  onSortProducts(by: string) {
    // if (this.latestQueryParams.sortBy !== by) {
    //   this.isLoading = true;
    // }

    this.onToggleSortByMobile();

    this.router.navigate([], {
      queryParams: {
        sortBy: by
      },
      queryParamsHandling: "merge"
    }).then(()=>{
      this.activeSort = by;
      this.sttt()
    });
  }

  onSelectOrder(selectedOrder: string) {
    // this.pagedProducts=[]
    // if (this.latestQueryParams.order !== selectedOrder) {
    //   this.isLoading = true;
    // }

    this.onToggleSortByMobile();
    if(this.getByCategoryMode){
      this.getProductsByOrder({sortBy:undefined,keyword:undefined,category:this.selectedCategory.name,subcategory:undefined,order:selectedOrder})
    }
    if(this.searchMode){
      this.getProductsByOrder({sortBy:undefined,keyword:this.searchValue,category:undefined,subcategory:undefined,order:selectedOrder})
    }
    
    // this.router.navigate([], {
    //   queryParams: {
    //     order: selectedOrder
    //   },
    //   queryParamsHandling: "merge"
    // }).then(()=>{

      this.activeOrder = selectedOrder;
    //   this.sttt();
    // });

  }

  onToggleSortByMobile() {
    // ui only
    this.isMobileSortByToggled = !this.isMobileSortByToggled;
  }

  onToggleFilterByMobile() {
    // ui only
    this.filterByMobileService.toggleFilterByMobile();
  }

  scrollToTop() {
    window.scrollTo({ top: 0 });
  }

  setPage(page: number) {
    this.scrollToTop();
    // this.pager = this.pagerService.getPager(this.products.length, page, 8);
    // this.pagedProducts = this.products.slice(
    //   this.pager.startIndex,
    //   this.pager.endIndex + 1
    // );
  }
}

/*
// faker
  latestId = 0;
  fakers: Product[] = [];

for (let i = 0; i < 10; i++) {
      this.fakers.push(
        new Product(
          this.latestId++, // id
          faker.fake("{{lorem.word}}"), // name
          ProductListComponent.generateRandomNumber(0, 100), // price
          ProductListComponent.generateRandomNumber(0, 100), // subCatId
          ProductListComponent.generateRandomNumber(0, 200), // catId
          [faker.fake("{{lorem.paragraph}}"), faker.fake("{{lorem.paragraph}}"), faker.fake("{{lorem.paragraph}}")], // desc
          [
            new Review(ProductListComponent.generateRandomNumber(0, 100), faker.fake("{{lorem.sentence}}"), faker.fake("{{lorem.paragraph}}"), faker.fake("{{name.firstName}}"), ProductListComponent.generateRandomNumber(0, 100)),
            new Review(ProductListComponent.generateRandomNumber(0, 100), faker.fake("{{lorem.sentence}}"), faker.fake("{{lorem.paragraph}}"), faker.fake("{{name.firstName}}"), ProductListComponent.generateRandomNumber(0, 100)),
            new Review(ProductListComponent.generateRandomNumber(0, 100), faker.fake("{{lorem.sentence}}"), faker.fake("{{lorem.paragraph}}"), faker.fake("{{name.firstName}}"), ProductListComponent.generateRandomNumber(0, 100))
          ], // reviews[]
          "https://picsum.photos/470/362?random=" + this.latestId, // imgSrc
          ["vegetarian", "dairyfree", "onoffer", "monarch"]
        )
      );

      static generateRandomNumber(min, max) {
    return Math.floor(Math.random() * max + min);
  }
    }

    console.log(JSON.stringify(this.fakers)); */
