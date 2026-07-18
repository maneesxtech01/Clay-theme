"use strict";

var BlsRVPageShopify = (function () {
  return {
    initRVItems: function () {
      if (window.location.search.indexOf("page=") == -1) {
        const rv_items = JSON.parse(
          localStorage.getItem("glozin__recently-viewed-products")
        );
        this.init(rv_items);
      }
    },

    init: function (rv_items) {
      const _this = this;
      const rv_div = document.querySelector(".rv-page-main");
      const div_no_product = rv_div.querySelector(".rv-no-product-js");
      const div_product = rv_div.querySelector(".row");
      if (rv_items === null || rv_items.length === 0) {
        if (div_no_product) {
          div_no_product.classList.remove("hidden");
        }
        if (div_product) {
          div_product.classList.add("hidden");
        }
        _this.skeletonFunction(0);
      } else {
        if (div_product) {
          div_product.classList.remove("hidden");
        }
        var query = "";
        rv_items.forEach((e, key, rv_items) => {
          if (!Object.is(rv_items.length - 1, key)) {
            query += e + "%20OR%20id:";
          } else {
            query += e;
          }
        });
        const section_id =
          document.querySelector(".rv-page-section").dataset.sectionId;
        var productAjaxURL =
          "?section_id=" +
          section_id +
          "&type=product&options[unavailable_products]=last&q=id:" +
          query;

        fetch(`${window.routes.search_url}${productAjaxURL}`)
          .then((response) => response.text())
          .then((responseText) => {
            const html = parser.parseFromString(responseText, "text/html");
            const results = document.createElement("div");
            results.classList.add("rv-results");
            const exist_results = rv_div.querySelector(".rv-results");
            if (exist_results) {
              exist_results.remove();
            }
            const er = html.querySelector(".rv-page-main > .rv-results");
            if (rv_items.length !== 0 && er) {
              rv_div.innerHTML = html.querySelector(".rv-page-main").innerHTML;
              _this.skeletonFunction(700);
            } else {
              _this.skeletonFunction(0);
              div_no_product.classList.remove("hidden");
            }
          })
          .catch((e) => {
            console.error(e);
          })
          .finally((e) => {
            initLazyloadItem();
            BlsRVPageShopify.clearAll();
          });
      }
    },
    clearAll: function () {
      const rv_div = document.querySelector(".rv-page-main");
      if (rv_div) {
        if (!rv_div.querySelector(".clear-all-rvp")) return;
        rv_div
          .querySelector(".clear-all-rvp")
          .addEventListener("click", function () {
            rv_div.querySelector(".rv-results").remove();
            rv_div.querySelector(".clear-all-rvp").classList.add("hidden");
            localStorage.removeItem("glozin__recently-viewed-products");
            BlsRVPageShopify.initRVItems();
          });
      }
    },
    skeletonFunction: function (timer) {
      window.setTimeout(function () {
        if (this.document.querySelector("skeleton-page")) {
          this.document.querySelector("skeleton-page").remove();
        }
        if (this.document.querySelector(".rv-page-section-inner")) {
          this.document
            .querySelector(".rv-page-section-inner")
            .classList.remove("hidden");
        }
      }, timer);
    },
  };
})();
BlsRVPageShopify.initRVItems();
