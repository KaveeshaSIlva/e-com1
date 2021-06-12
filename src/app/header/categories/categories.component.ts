import { Component, OnInit } from "@angular/core";
import { CategoriesService } from "src/app/shared/categories.service";
import { Category } from "src/app/shared/category.model";
import { FilterByService } from "src/app/product-list/filter-by/filter-by.service";
import { Router, ActivatedRoute } from "@angular/router";

@Component({
  selector: "app-categories",
  templateUrl: "./categories.component.html",
  styleUrls: ["./categories.component.css"]
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];

  constructor(
    private categoriesService: CategoriesService,
    private filterByService: FilterByService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.categoriesService.categoriesFetched.subscribe(res => {
      this.categories = res;
    });
  }

  navigateToAll() {
    window.location.href = `products`;
    this.router.navigate(["/products"]
    // , {
    //   queryParams: {
    //     order: this.route.snapshot.queryParamMap["params"].order,
    //     sortBy: this.route.snapshot.queryParamMap["params"].sortBy
    //   },
    //   queryParamsHandling: "preserve"
    // }
    );
  }

  navigateToCategory(category) {
    window.location.href = `products?category=${category}`;
    // this.router.navigate([], {
    //   queryParams: {
    //     sortBy: by
    //   },
    //   queryParamsHandling: "merge"
    // });
    this.router.navigate(['/products'],{queryParams:{category:category},
        queryParamsHandling: "merge"}
    )
    // ///////////////
    // this.router.navigate(["/products/category/" + category], {
    //   queryParams: {
    //     q: null,
    //     subcategories: null,
    //     redirectUrl: null,
    //     order: this.route.snapshot.queryParamMap["params"].order,
    //     sortBy: this.route.snapshot.queryParamMap["params"].sortBy
    //   },
    //   queryParamsHandling: "merge"
    // });
  }

  navigateToSubcategory(category, subcategory) {
    if (
      this.route.snapshot.queryParamMap["params"].subcategories !== subcategory
    ) {
      // only navigate if youre from the other page
      this.filterByService.resetAll();

      this.filterByService.addToActiveFilters(subcategory);

      this.router.navigate(["products/category/" + category], {
        queryParams: {
          q: null,
          redirectUrl: null,
          subcategories: subcategory,
          order: this.route.snapshot.queryParamMap["params"].order,
          sortBy: this.route.snapshot.queryParamMap["params"].sortBy
        },
        queryParamsHandling: "merge"
      });
    }
  }
}
