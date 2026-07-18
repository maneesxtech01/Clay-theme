"use-strict";

class StickyAddCart extends HTMLElement {
  constructor() {
    super();
    this.init();
  }
  init() {
    this.getHeightAddToCart();
    const btn_minimal = this.querySelector("minimal-button");
    if (btn_minimal) {
      btn_minimal.addEventListener("click", this.toggle.bind(this), false);
    }
  }
  getHeightAddToCart() {
    const _this = this;
    this.main = this.closest(".sec__featured-product");
    if (!this.main) return;
    const primaryBtn = this.main.querySelector(".button-trigger__sticky");
    const footer = document.querySelector(".product-sticky-hide");

    if (!primaryBtn) return;

    var isVisible = true;
    window.addEventListener("scroll", function () {
      var buttonRect = primaryBtn.getBoundingClientRect();
      var viewportHeight = window.innerHeight;
      if (footer) {
        var footerRect = footer.getBoundingClientRect();
        if (footerRect.top < window.innerHeight - 100) {
          _this.classList.remove("show-sticky-cart");
          isVisible = true;
        } else {
          if (
            !isVisible &&
            buttonRect.top < viewportHeight &&
            buttonRect.bottom > 0
          ) {
            isVisible = true;
            _this.classList.remove("show-sticky-cart");
          } else if (isVisible && buttonRect.bottom <= 0) {
            isVisible = false;
            _this.classList.add("show-sticky-cart");
          }
        }
      } else {
        if (
          !isVisible &&
          buttonRect.top < viewportHeight &&
          buttonRect.bottom > 0
        ) {
          isVisible = true;
          _this.classList.remove("show-sticky-cart");
        } else if (isVisible && buttonRect.bottom <= 0) {
          isVisible = false;
          _this.classList.add("show-sticky-cart");
        }
      }
    });
  }
  toggle(e) {
    const target = e.currentTarget;
    target.classList.toggle("opened");
    if (!target) return;
    const parent = target.closest("sticky-add-cart");
    if (!parent) return;
    const content = parent.querySelector(".content--expand");
    slideAnime({
      target: content,
      animeType: "slideToggle",
    });
  }
}
customElements.define("sticky-add-cart", StickyAddCart);
// js for fake sold
class SoldProduct extends HTMLElement {
  constructor() {
    super();
    this.sold = this.dataset.sold;
    this.hours = this.dataset.hours;
    this.message = this.dataset.message;
    this.init();
  }
  init() {
    if (this.message && this.sold && this.hours) {
      var message = "";
      message = this.message
        .replace("{{ sold }}", this.randomSelect(this.sold))
        .replace("{{ hours }}", this.randomSelect(this.hours));
      this.innerHTML += message;
    }
  }

  randomSelect(numbers) {
    const numberArray = numbers.split(",");
    const randomIndex = Math.floor(Math.random() * numberArray.length);
    const randomNumber = numberArray[randomIndex];
    return randomNumber;
  }
}
customElements.define("sold-product", SoldProduct);

// js for live view
class LiveView extends HTMLElement {
  constructor() {
    super();
    this.min = this.dataset.min;
    this.max = this.dataset.max;
    this.interval = this.dataset.interval;
    this.message = this.dataset.message;
    this.init();
  }
  init() {
    if (this.message && this.max && this.min && this.interval) {
      this.handle();
      setInterval(() => {
        this.handle();
      }, this.interval * 1000);
    }
  }

  handle() {
    var message = "";
    message = this.message.replace(
      "[count]",
      this.randomSelect(parseInt(this.min), parseInt(this.max))
    );
    this.innerHTML = message;
  }

  randomSelect(min, max) {
    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomNumber;
  }
}
customElements.define("live-view", LiveView);



class CompareRadios extends SwatchInit {
  constructor() {
    super();
    this.variantData =
      this.variantData ||
      JSON.parse(this.querySelector('[type="application/json"]').textContent);
    this.init();
    this.initFunction();
  }

  initFunction() {
    this.querySelectorAll(".product__color-swatches--js").forEach((btn) => {
      btn.addEventListener("click", this.onVariantChange.bind(this), false);
    });
  }

  onVariantChange(e) {
    e.preventDefault();
    const target = e.currentTarget;
    target.classList.toggle("active");
    this.handleWhenSwatchUpdate();
  }

  handleWhenSwatchUpdate() {
    this.updateOptions();
    const arrayItem = this.updateMasterId(this.variantData);
    this.handleMediaCompare(arrayItem);
  }

  handleMediaCompare(arrayItem) {
    if (!arrayItem) return;
    const html = `
            ${arrayItem
              .map((item) => {
                return `
                <div class="compare__items-inner">
                        <img width="300px" height="300px" src="${item.featured_media.preview_image.src}" alt="${item.featured_media.alt}">
                        <p class="mb-0 mt-10 heading-style capitalize">${item.title}</p></div>
                    `;
              })
              .join("")}
        `;
    const compareColorContent = this.closest(".compare-colors__content");
    if (!compareColorContent) return;
    const compareItems = compareColorContent.querySelector(".compare__items");
    if (!compareItems) return;
    compareItems.innerHTML = html;
  }

  updateMasterId(variantData) {
    let arrayItem = [];
    this.options.forEach((option) => {
      const matchingVariant = variantData.find((variant) => {
        return variant.options.includes(option);
      });
      if (matchingVariant) {
        arrayItem.push(matchingVariant);
      }
    });
    return arrayItem;
  }
}
customElements.define("compare-radios", CompareRadios);

class ProductRecommendations extends SlideSection {
  constructor() {
    super();
  }
  init() {
    this.call();
  }
  call() {
    const handleIntersection = (entries, observer) => {
      if (!entries[0].isIntersecting) return;
      observer.unobserve(this);
      fetch(this.dataset.url)
        .then((response) => response.text())
        .then((text) => {
          const html = document.createElement("div");
          html.innerHTML = text;
          const recommendations = html.querySelector("product-recommendations");
          if (recommendations && recommendations.innerHTML.trim().length) {
            this.innerHTML = recommendations.innerHTML;
          }
          if (recommendations.innerHTML.trim().length === 0) {
            // this.remove();
            this.style.display = "none";
            if (document.querySelector(".product-recommendations-heading")) {
              document
                .querySelector(".product-recommendations-heading")
                .remove();
            }
          }
        })
        .finally(() => {
          if (this.querySelector(".swiper-wrapper")) {
            this.initSlide();
            BlsAnimations.init();
            BlsLazyloadImg.init();          
          }
          initLazyloadItem();
        })
        .catch((e) => {
          console.error(e);
        });
    };

    new IntersectionObserver(handleIntersection.bind(this), {
      rootMargin: "0px 0px 400px 0px",
    }).observe(this);
  }
}
customElements.define("product-recommendations", ProductRecommendations);

// js for live view
class SkeletonPage extends HTMLElement {
  constructor() {
    super();
    this.init();
  }
  init() {
    window.setTimeout(() => {
      this.classList.remove("skeleton");
    }, 1500);
  }
}
customElements.define("skeleton-page", SkeletonPage);

// js for live view
class ProductGrouped extends HTMLElement {
  constructor() {
    super();
    this.init();
  }
  init() {
    var group = this.querySelector('.productGroup[type="application/json"]');
    if (!group) return;
    var variantData = JSON.parse(group.innerText);
    var query = "";
    variantData.forEach((e, key, variantData) => {
      if (!Object.is(variantData.length - 1, key)) {
        query += e + "%20OR%20id:";
      } else {
        query += e;
      }
    });
    var productAjaxURL = "?q=id:" + query + "&section_id=product-grouped";
    fetch(`${window.routes.search_url}${productAjaxURL}`)
      .then((response) => response.text())
      .then(async (responseText) => {
        const html = new DOMParser().parseFromString(responseText, "text/html");
        this.innerHTML = html.querySelector(".product-group").innerHTML;
      })
      .catch((e) => {
        throw error;
      })
      .finally(() => {
        this.eventProductGroupAction();
      });
  }

  eventProductGroupAction() {
    document
      .querySelectorAll(".product-group-list .product-variant-option")
      .forEach((select) => {
        select.addEventListener(
          "change",
          (event) => {
            var target = event.target;
            var image =
                target.options[target.selectedIndex].getAttribute("data-image"),
              price =
                target.options[target.selectedIndex].getAttribute("data-price"),
              pro_handle = target.getAttribute("data-handle"),
              image =
                target.options[target.selectedIndex].getAttribute("data-image"),
              price =
                target.options[target.selectedIndex].getAttribute("data-price"),
              pro_handle = target.getAttribute("data-handle"),
              compare_price =
                target.options[target.selectedIndex].getAttribute(
                  "data-compare-price"
                );
            var img = target
              .closest(".product-group-list")
              .querySelector(".product-group-item ." + pro_handle + "")
              .querySelector("img");
            if (img) {
              img.removeAttribute("srcset");
              img.setAttribute("src", image);
            }
            const productTarget = target.closest(".product-group-item");
            const bls__price = productTarget.querySelector(
              ".product-item__price .card-product-price"
            );
            if (bls__price) {
              if (!bls__price.querySelector(".compare-price")) {
                var ps = document.createElement("div");
                var sp = document.createElement("span");
                var cp = document.createElement("s");
                cp.classList.add("price-item", "compare-price");
                sp.appendChild(cp);
                ps.appendChild(sp);
                ps.classList.add("price-regular");
                if (productTarget.querySelector(".card-product-price")) {
                  productTarget
                    .querySelector(".card-product-price")
                    .appendChild(ps);
                }
              }
              const cpp = bls__price.querySelector(".compare-price");

              if (cpp) {
                if (compare_price && compare_price > price) {
                  const compare_format = Shopify.formatMoney(
                    compare_price,
                    themeGlobalVariables.settings.money_format
                  );
                  cpp.innerHTML = compare_format;
                  if (bls__price.querySelector(".price-regular")) {
                    bls__price
                      .querySelector(".price-regular")
                      .classList.add("primary-color");
                  }
                  if (bls__price.querySelector(".price-regular .price")) {
                    bls__price
                      .querySelector(".price-regular .price")
                      .classList.add("price--special");
                  }
                } else {
                  cpp.innerHTML = "";
                  if (bls__price.querySelector(".price-regular")) {
                    bls__price
                      .querySelector(".price-regular")
                      .classList.remove("primary-color");
                  }
                  if (bls__price.querySelector(".price-regular .price")) {
                    bls__price.querySelector(
                      ".price-regular .price"
                    ).innerHTML = Shopify.formatMoney(
                      price,
                      cartStrings.money_format
                    );
                    bls__price
                      .querySelector(".price-regular .price")
                      .classList.remove("price--special");
                  }
                }
              }
            }
            target.setAttribute("data-price", price);
            target.setAttribute("data-compare-price", compare_price);
          },
          false
        );
      });

    let totalQty = 0;
    const classQty = document.querySelectorAll(
      ".quantity__input-product-group"
    );
    classQty.forEach((input) => {
      let valueQtyDefault = input.value;
      let valueAsDefault = parseFloat(valueQtyDefault);
      if (!isNaN(valueAsDefault)) {
        totalQty += valueAsDefault;
      }
      input.addEventListener("change", () => {
        totalQty = 0;
        classQty.forEach((value) => {
          let valueQty = value.value;
          let valueAsQty = parseFloat(valueQty);
          if (!isNaN(valueAsQty)) {
            totalQty += valueAsQty;
          }
        });
      });
    });
    document.querySelectorAll(".product-group-submit").forEach((button) => {
      button.addEventListener(
        "click",
        (event) => {
          if (totalQty === 0) {
            const content = document.querySelector(
              ".form-infor .add-cart-error"
            );
            const messageErrQty = button.getAttribute("data-add-cart-err-qty");
            handleErrorMessagePopup(messageErrQty);
            if (!content) return;
          } else {
            this.submitProductGroup(event);
          }
        },
        false
      );
    });

    document.querySelectorAll(".product-group-buy-now").forEach((button) => {
      button.addEventListener(
        "click",
        (event) => {
          if (totalQty === 0) {
            const content = document.querySelector(
              ".form-infor .add-cart-error"
            );
            const messageErrQty = button.getAttribute("data-add-cart-err-qty");
            handleErrorMessagePopup(messageErrQty);
            if (!content) return;
          } else {
            this.submitNowProductGroup(event);
          }
        },
        false
      );
    });
  }

  submitNowProductGroup(event) {
    event.preventDefault();
    const form = document.getElementById("form-product-grouped");
    const config = fetchConfig("json");
    config.headers["X-Requested-With"] = "XMLHttpRequest";
    delete config.headers["Content-Type"];
    const formData = new FormData(form);
    config.body = formData;
    fetch(`${routes.cart_add_url}.js`, config)
      .then((response) => {
        return response.text();
      })
      .then((state) => {
        const parsedState = JSON.parse(state);
        if (parsedState.items) {
          window.location.href = "/checkout";
        } else {
          const content = document.querySelector(".form-infor .add-cart-error");
          if (!content) return;
        }
      })
      .catch((e) => {
        throw e;
      });
  }

  submitProductGroup(event) {
    event.preventDefault();
    const target = event.currentTarget;
    const cart =
      document.querySelector("cart-notification") ||
      document.querySelector("cart-drawer");
    const form = document.getElementById("form-product-grouped");
    const config = fetchConfig("json");
    config.headers["X-Requested-With"] = "XMLHttpRequest";
    delete config.headers["Content-Type"];
    let openMiniCart = 0;
    const formData = new FormData(form);
    if (cart) {
      formData.append(
        "sections",
        cart.getSectionsToRender().map((section) => section.id)
      );
      formData.append("sections_url", window.location.pathname);
    }
    config.body = formData;
    target.classList.add("loading");
    fetch(`${routes.cart_add_url}.js`, config)
      .then((response) => {
        return response.text();
      })
      .then((state) => {
        fetch("/cart.json")
          .then((res) => res.json())
          .then((cart) => {
            if (cart.item_count != undefined) {
              document.querySelectorAll(".cart-count").forEach((el) => {
                if (el.classList.contains("cart-count-drawer")) {
                  el.innerHTML = `(${cart.item_count})`;
                } else {
                  el.innerHTML = cart.item_count > 100 ? '~' : cart.item_count;
                }
              });
              if (document.querySelector("header-total-price")) {
                document.querySelector("header-total-price").updateTotal(cart);
              }
              const cart_free_ship = document.querySelector(
                "free-ship-progress-bar"
              );
              if (cart_free_ship) {
                cart_free_ship.init(cart.items_subtotal_price);
              }
            }
          })
          .catch((error) => {
            throw error;
          });
        const parsedState = JSON.parse(state);
        if (parsedState.message) {
          handleErrorMessagePopup(parsedState.description);
          if (!content) return;
        } else {
          parsedState.items.forEach((e) => {
            if (e.quantity > 0) {
              openMiniCart = 1;
            }
          });
          cart.getSectionsToRender().forEach((section) => {
            const elementToReplace = document.getElementById(section.id);
            const html = new DOMParser().parseFromString(
              parsedState.sections[section.id],
              "text/html"
            );
            elementToReplace.innerHTML =
              html.querySelector("#minicart-form").innerHTML;
            const countdown = cart.querySelector(".cart-countdown-time");
            const html_countdown = html.querySelector(".cart-countdown-time");
            if (countdown && html_countdown) {
              countdown.innerHTML = html_countdown.innerHTML;
            }
          });
          cart.cartAction();
        }
      })
      .catch((e) => {
        throw e;
      })
      .finally(() => {
        target.classList.remove("loading");
        if (openMiniCart === 1) {
          cart.open();
        }
        const cartRecommend = document.querySelector(".cart-recommend");
        if (
          cartRecommend &&
          !cartRecommend.classList.contains("hidden-recommend")
        ) {
          if (cartRecommend.classList.contains('cart-recommend-custom')) {
            const cartUpsellItem = document.querySelectorAll('.cart-upsell-item');
            const cartUpsellSlide = document.querySelectorAll('.swiper-cart-upsell .swiper-slide');
            if (cartUpsellItem.length > 0) {
              setTimeout(function () {
                cartRecommend.classList.add("open");
              }, 800);
            } else if (cartUpsellSlide.length === 0){
              cartRecommend.classList.remove('block');
              cartRecommend.classList.add('hidden');
            }
          }else{
            setTimeout(function () {
              cartRecommend.classList.add("open");
            }, 800);
          }
        }
      });
  }
}
customElements.define("product-group", ProductGrouped);

// js for product addons
class ProductAddons extends PopupBase {
  constructor() {
    super();
    this.productPopupDiv = this.querySelector(".product-addons__content");
    this.init();
  }
  init() {
    if (this.productPopupDiv) {
      this.addEventListener("click", this.onClick.bind(this));
    }
  }
  onClick() {
    const html = this.productPopupDiv;
    if (!html) return;
    html.classList.remove("hidden");
    this.initPopup(
      html,
      `<h3 class="title-popup h5 my-0 px-20 px-md-30 py-20 border-bottom">${this.dataset?.textHeader}</h3>`
    );
  }
}
customElements.define("product-addons", ProductAddons);

class SwatchDropdown extends HTMLElement {
  constructor() {
    super();
    this.spanFor = this.dataset.spanFor;
    this.init();
  }
  init() {
    if (!this.spanFor) return;
    this.addEventListener("click", this.activeFilterSort.bind(this), false);
  }
  activeFilterSort() {
    if (this.querySelector(`#${this.spanFor}`).classList.contains("active")) {
      this.querySelector(`#${this.spanFor}`).classList.remove("active");
    } else {
      this.querySelector(`#${this.spanFor}`).classList.add("active");
    }
  }
}
customElements.define("swatch-dropdown", SwatchDropdown);

class ProductBoughtTogether extends HTMLElement {
  constructor() {
    super();
    this.init();
  }
  init() {
    const boughTogether = document.querySelector(
      '.productBoughTogether[type="application/json"]'
    );
    if (!boughTogether) return;
    const variantData = JSON.parse(boughTogether.innerText);
    let query = "";
    variantData.forEach((e, key, variantData) => {
      if (!Object.is(variantData.length - 1, key)) {
        query += e + "%20OR%20id:";
      } else {
        query += e;
      }
    });
    const productAjaxURL =
      "?q=id:" + query + "&section_id=product-bough-together";
    fetch(`${window.routes.search_url}${productAjaxURL}`)
      .then((response) => response.text())
      .then(async (responseText) => {
        const html = new DOMParser().parseFromString(responseText, "text/html");
        document.getElementById("product-bought-together").innerHTML =
          html.querySelector(".bought-together").innerHTML;
      })
      .catch((e) => {
        throw error;
      })
      .finally(() => {
        this.eventProductBoughTogetherAction();
      });
  }
  eventProductBoughTogetherAction() {
    var _this = this;
    document
      .querySelectorAll(".bought-together-checkbox")
      .forEach((checkbox) => {
        checkbox.addEventListener(
          "change",
          (event) => {
            var target = event.target;
            var total_price = 0,
              total_compare_price = 0,
              save_price = 0,
              price,
              compare_price,
              pro_handle = event.target.getAttribute("data-handle");
            var img = target
              .closest("#product-bought-together")
              .querySelector(".product-bought-image-item." + pro_handle + "");
            if (target.checked) {
              img.classList.add("select");
              target
                .closest(".product-bought-together-item")
                .classList.add("select");
              target
                .closest(".product-bought-together-item")
                .querySelector(".product-variant-option")
                .removeAttribute("disabled");
              target
                .closest(".product-bought-together-item")
                .querySelector(".quantity")
                .removeAttribute("disabled");
            } else {
              img.classList.remove("select");
              target
                .closest(".product-bought-together-item")
                .classList.remove("select");
              target
                .closest(".product-bought-together-item")
                .querySelector(".product-variant-option")
                .setAttribute("disabled", true);
              target
                .closest(".product-bought-together-item")
                .querySelector(".quantity")
                .setAttribute("disabled", true);
            }
            setTimeout(function () {
              var bought_together_select = document.querySelectorAll(
                ".product-bought-together-item.select"
              );
              bought_together_select.forEach((item) => {
                var option = item.querySelector(".product-variant-option");
                price = option.getAttribute("data-price");
                compare_price = option.getAttribute("data-compare-price");
                total_price = total_price + Number(price);
                total_compare_price =
                  total_compare_price + Number(compare_price);
              });
              save_price = total_compare_price - total_price;
              _this.eventProductBoughTogetherUpdatePrice(
                total_price,
                total_compare_price,
                save_price
              );
              if (bought_together_select.length <= 1) {
                document
                  .querySelector(".bought-together-submit")
                  .setAttribute("disabled", true);
              } else {
                document
                  .querySelector(".bought-together-submit")
                  .removeAttribute("disabled");
              }
            }, 50);
          },
          false
        );
      });
    document
      .querySelectorAll("#product-bought-together .product-variant-option")
      .forEach((select) => {
        select.addEventListener(
          "change",
          (event) => {
            var target = event.target;
            var total_price = 0,
              total_compare_price = 0,
              save_price = 0,
              image =
                target.options[target.selectedIndex].getAttribute("data-image"),
              price =
                target.options[target.selectedIndex].getAttribute("data-price"),
              pro_handle = target.getAttribute("data-handle"),
              compare_price =
                target.options[target.selectedIndex].getAttribute(
                  "data-compare-price"
                );
            var img = target
              .closest("#product-bought-together")
              .querySelector(".product-bought-image-item." + pro_handle + "")
              .querySelector("img");
            if (img) {
              img.removeAttribute("srcset");
              img.setAttribute("src", image);
            }
            const productTarget = target.closest(
              ".product-bought-together-item"
            );
            const bls__price = productTarget.querySelector(
              ".product-item__price .card-product-price"
            );
            if (bls__price) {
              if (!bls__price.querySelector(".compare-price")) {
                var ps = document.createElement("div");
                var sp = document.createElement("span");
                var cp = document.createElement("s");
                cp.classList.add("price-item", "compare-price");
                sp.appendChild(cp);
                ps.appendChild(sp);
                ps.classList.add("price-regular");
                if (productTarget.querySelector(".card-product-price")) {
                  productTarget
                    .querySelector(".card-product-price")
                    .appendChild(ps);
                }
              }
              const cpp = bls__price.querySelector(".compare-price");

              if (cpp) {
                if (compare_price && compare_price > price) {
                  const compare_format = Shopify.formatMoney(
                    compare_price,
                    themeGlobalVariables.settings.money_format
                  );
                  cpp.innerHTML = compare_format;
                  if (bls__price.querySelector(".price-regular")) {
                    bls__price
                      .querySelector(".price-regular")
                      .classList.add("primary-color");
                  }
                  if (bls__price.querySelector(".price-regular .price")) {
                    bls__price
                      .querySelector(".price-regular .price")
                      .classList.add("price--special");
                  }
                } else {
                  cpp.innerHTML = "";
                  if (bls__price.querySelector(".price-regular")) {
                    bls__price
                      .querySelector(".price-regular")
                      .classList.remove("primary-color");
                  }
                  if (bls__price.querySelector(".price-regular .price")) {
                    bls__price.querySelector(
                      ".price-regular .price"
                    ).innerHTML = Shopify.formatMoney(
                      price,
                      cartStrings.money_format
                    );
                    bls__price
                      .querySelector(".price-regular .price")
                      .classList.remove("price--special");
                  }
                }
              }
            }
            target.setAttribute("data-price", price);
            target.setAttribute("data-compare-price", compare_price);
            document
              .querySelectorAll(".product-bought-together-item.select")
              .forEach((item) => {
                var option = item.querySelector(".product-variant-option");
                price = option.getAttribute("data-price");
                compare_price = option.getAttribute("data-compare-price");
                total_price = total_price + Number(price);
                total_compare_price =
                  total_compare_price + Number(compare_price);
              });
            save_price = total_compare_price - total_price;
            _this.eventProductBoughTogetherUpdatePrice(
              total_price,
              total_compare_price,
              save_price
            );
          },
          false
        );
      });

    document.querySelectorAll(".bought-together-submit").forEach((button) => {
      button.addEventListener(
        "click",
        this.submitBoughtTogether.bind(this),
        false
      );
    });
  }
  submitBoughtTogether(event) {
    event.preventDefault();
    const target = event.currentTarget;
    const cart =
      document.querySelector("cart-notification") ||
      document.querySelector("cart-drawer");
    const form = document.getElementById("bought-together-form");
    const config = fetchConfig("json");
    config.headers["X-Requested-With"] = "XMLHttpRequest";
    delete config.headers["Content-Type"];
    const formData = new FormData(form);
    if (cart) {
      formData.append(
        "sections",
        cart.getSectionsToRender().map((section) => section.id)
      );
      formData.append("sections_url", window.location.pathname);
    }
    config.body = formData;
    target.classList.add("loading");
    fetch(`${routes.cart_add_url}.js`, config)
      .then((response) => {
        return response.text();
      })
      .then((state) => {
        fetch("/cart.json")
          .then((res) => res.json())
          .then((cart) => {
            if (cart.item_count != undefined) {
              document.querySelectorAll(".cart-count").forEach((el) => {
                if (el.classList.contains("cart-count-drawer")) {
                  el.innerHTML = `(${cart.item_count})`;
                } else {
                  el.innerHTML = cart.item_count > 100 ? '~' : cart.item_count;
                }
              });
              if (document.querySelector("header-total-price")) {
                document.querySelector("header-total-price").updateTotal(cart);
              }
              const cart_free_ship = document.querySelector(
                "free-ship-progress-bar"
              );
              if (cart_free_ship) {
                cart_free_ship.init(cart.items_subtotal_price);
              }
            }
          })
          .catch((error) => {
            throw error;
          });
        const parsedState = JSON.parse(state);
        cart.getSectionsToRender().forEach((section) => {
          const elementToReplace = document.getElementById(section.id);
          const html = new DOMParser().parseFromString(
            parsedState.sections[section.id],
            "text/html"
          );
          elementToReplace.innerHTML =
            html.querySelector("#minicart-form").innerHTML;
          const countdown = cart.querySelector(".cart-countdown-time");
          const html_countdown = html.querySelector(".cart-countdown-time");
          if (countdown && html_countdown) {
            countdown.innerHTML = html_countdown.innerHTML;
          }
        });
        cart.cartAction();
      })
      .catch((e) => {
        throw e;
      })
      .finally(() => {
        target.classList.remove("loading");
        cart.open();
        const cartRecommend = document.querySelector(".cart-recommend");
        if (
          cartRecommend &&
          !cartRecommend.classList.contains("hidden-recommend")
        ) {
          if (cartRecommend.classList.contains('cart-recommend-custom')) {
            const cartUpsellItem = document.querySelectorAll('.cart-upsell-item');
            const cartUpsellSlide = document.querySelectorAll('.swiper-cart-upsell .swiper-slide');
            if (cartUpsellItem.length > 0) {
              setTimeout(function () {
                cartRecommend.classList.add("open");
              }, 800);
            } else if (cartUpsellSlide.length === 0){
              cartRecommend.classList.remove('block');
              cartRecommend.classList.add('hidden');
            }
          }else{
            setTimeout(function () {
              cartRecommend.classList.add("open");
            }, 800);
          }
        }
      });
  }

  eventProductBoughTogetherUpdatePrice(
    total_price,
    total_compare_price,
    save_price
  ) {
    var total = document.querySelector("#product-bought-together .box-total");
    if (total) {
      total.querySelector(".saved-price .price").innerHTML =
        Shopify.formatMoney(save_price, cartStrings.money_format);
      total.querySelector(".total-price .price__sale .price-item").innerHTML =
        Shopify.formatMoney(total_compare_price, cartStrings.money_format);
      total.querySelector(".total-price .price").innerHTML =
        Shopify.formatMoney(total_price, cartStrings.money_format);
      if (total_compare_price > total_price) {
        total.querySelector(".total-price").classList.add("price--on-sale");
        total
          .querySelector(".total-price .price")
          .classList.add("special-price");
      } else {
        total.querySelector(".total-price").classList.remove("price--on-sale");
        total
          .querySelector(".total-price .price")
          .classList.remove("special-price");
      }
      if (save_price > 1) {
        total.querySelector(".saved-price").classList.remove("hidden");
      } else {
        total.querySelector(".saved-price").classList.add("hidden");
      }
    }
  }
}
customElements.define("product-bought-together", ProductBoughtTogether);

document.addEventListener("DOMContentLoaded", function () {
  function addProductEntry(productJson, storedProducts) {
    if (storedProducts === null) storedProducts = [];

    var currentProductID = productJson.id.toString();
    if (!storedProducts.includes(currentProductID)) {
      storedProducts.unshift(currentProductID);
      if (storedProducts.length > 25) {
        storedProducts.pop();
      }
      localStorage.setItem(
        "glozin__recently-viewed-products",
        JSON.stringify(storedProducts)
      );
    } else {
      const index = storedProducts.indexOf(currentProductID);
      if (index > -1) {
        storedProducts.splice(index, 1);
      }
      storedProducts.unshift(currentProductID);
      localStorage.setItem(
        "glozin__recently-viewed-products",
        JSON.stringify(storedProducts)
      );
    }
  }

  const prodData = document.querySelector("[data-product-json]");
  if (prodData != null) {
    var productJson = JSON.parse(prodData.innerHTML);
    var storedProducts = JSON.parse(
      localStorage.getItem("glozin__recently-viewed-products")
    );
    addProductEntry(productJson, storedProducts);
  }
});
var BlsDropDownProduct = (function () {
  return {
    innit: function () {
      var custom_select = document.querySelectorAll(".custom-select");
      if (custom_select) {
        custom_select.forEach((item) => {
          let select__selected = item.querySelector(".select__selected");
          select__selected.addEventListener("click", (e) => {
            let dropdown = e.target.nextElementSibling;
            dropdown.classList.toggle("hidden");
          });
        });
      }
      document.addEventListener("click", function (event) {
        if (!event.target.closest(".custom-select")) {
          document.querySelectorAll(".select__dropdown")?.forEach((item) => {
            item.classList.add("hidden");
          });
        }
      });
    },
  };
})();

BlsDropDownProduct.innit();

var SyncQuantityInput = (() => {
  return {
    init: () => {
      const syncInputs = document.querySelectorAll(
        ".product-detail__buy-buttons input.quantity-input"
      );
      syncInputs.forEach((input) => {
        input.addEventListener("change", function () {
          const value = this.value;
          syncInputs.forEach((otherInput) => {
            if (otherInput !== input) {
              otherInput.value = value;
            }
          });
        });
      });
    },
  };
})();

SyncQuantityInput.init();

class SlideSectionProductSet extends HTMLElement {
  constructor() {
    super();
    this.globalSlide = null;
    this.init();
  }

  init() {
    if (document.body.classList.contains("index")) {
      let pos = window.pageYOffset;
      if (pos > 0 || document.body.classList.contains("swiper-lazy")) {
        this.initSlide();
      } else {
        if (this.classList.contains("lazy-loading-swiper-before")) {
          this.initSlide();
        } else {
          this.classList.add("lazy-loading-swiper-after");
        }
      }
    } else {
      this.initSlide();
    }
  }

  initSlide() {
    const _this = this;
    var autoplaying = _this?.dataset.autoplay === "true";
    const loop = _this?.dataset.loop === "true";
    const itemDesktop = _this?.dataset.desktop ? _this?.dataset.desktop : 4;
    var itemTablet = _this?.dataset.tablet ? _this?.dataset.tablet : "";
    const itemMobile = _this?.dataset.mobile ? _this?.dataset.mobile : 1;
    const direction = _this?.dataset.direction
      ? _this?.dataset.direction
      : "horizontal";
    var autoplaySpeed = _this?.dataset.autoplaySpeed
      ? _this?.dataset.autoplaySpeed * 1000
      : 3000;
    var speed = _this?.dataset.speed ? _this?.dataset.speed : 400;
    const effect = _this?.dataset.effect ? _this?.dataset.effect : "slide";
    const row = _this?.dataset.row ? _this?.dataset.row : 1;
    var spacing = _this?.dataset.spacing ? _this?.dataset.spacing : 30;
    const autoItem = _this?.dataset.itemMobile === "true";
    const arrowCenterimage = _this?.dataset.arrowCenterimage
      ? _this?.dataset.arrowCenterimage
      : 0;
    spacing = Number(spacing);
    autoplaySpeed = Number(autoplaySpeed);
    speed = Number(speed);
    if (autoplaying) {
      autoplaying = { delay: autoplaySpeed };
    }
    if (!itemTablet) {
      if (itemDesktop < 2) {
        itemTablet = 1;
      } else if (itemDesktop < 3) {
        itemTablet = 2;
      } else {
        itemTablet = 3;
      }
    }
    this.globalSlide = new Swiper(_this, {
      slidesPerView: autoItem ? "auto" : itemMobile,
      spaceBetween: spacing >= 15 ? 15 : spacing,
      autoplay: autoplaying,
      direction: direction,
      loop: loop,
      effect: effect,
      speed: speed,
      watchSlidesProgress: true,
      watchSlidesVisibility: true,
      grid: {
        rows: row,
        fill: "row",
      },
      navigation: {
        nextEl: _this.querySelector(".swiper-button-next"),
        prevEl: _this.querySelector(".swiper-button-prev"),
      },
      pagination: {
        clickable: true,
        el: document.querySelector(".swiper-pagination-product-set"),
        type: "custom",
        renderCustom: function (swiper, current, total) {
          return current + "/" + total;
        }
      },
      breakpoints: {
        768: {
          slidesPerView: itemTablet,
          spaceBetween: spacing >= 30 ? 30 : spacing,
        },
        1025: {
          slidesPerView: itemDesktop,
          spaceBetween: spacing,
        },
      },

      on: {
        init: function () {
          if (arrowCenterimage) {
            var items_slide = _this.querySelectorAll(
              ".product-item__media--ratio"
            );
            if (items_slide.length != 0) {
              var oH = [];
              items_slide.forEach((e) => {
                oH.push(e.offsetHeight / 2);
              });
              var max = Math.max(...oH);
              var arrowsOffset = "--arrows-offset-top: " + max + "px";
              if (_this.querySelectorAll(".swiper-arrow")) {
                _this.querySelectorAll(".swiper-arrow").forEach((arrow) => {
                  arrow.setAttribute("style", arrowsOffset);
                });
              }
            }
          }
        }
      },
    });
  }
}
customElements.define("slide-section-product-set", SlideSectionProductSet);