"use-strict";
function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}
// Performance monitoring utility
class PerformanceMonitor {
  static measurements = new Map();
  
  static startMeasurement(name) {
    this.measurements.set(name, performance.now());
  }
  
  static endMeasurement(name, logResult = false) {
    const startTime = this.measurements.get(name);
    if (startTime) {
      const duration = performance.now() - startTime;
      this.measurements.delete(name);
      
      if (logResult) {
        console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
      }
      
      return duration;
    }
    return 0;
  }
  
  static measureAsync(name, asyncFn) {
    return async (...args) => {
      this.startMeasurement(name);
      try {
        const result = await asyncFn(...args);
        return result;
      } finally {
        this.endMeasurement(name, true);
      }
    };
  }
}

// Enhanced Error Handler
class ErrorHandler {
  static handleFetchError(error, context = '') {
    console.error(`[${context}] Fetch error:`, error);
    
    // Show user-friendly message based on error type
    if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
      this.showUserMessage('Network error. Please check your connection.');
    } else if (error.message.includes('404')) {
      this.showUserMessage('Content not found.');
    } else if (error.message.includes('500')) {
      this.showUserMessage('Server error. Please try again later.');
    }
    
    // Report to analytics if available
    if (typeof gtag !== 'undefined') {
      gtag('event', 'exception', {
        description: `${context}: ${error.message}`,
        fatal: false
      });
    }
  }
  
  static showUserMessage(message) {
    // Use existing toast notification if available
    if (typeof showToast !== 'undefined') {
      showToast(message, 3000, "modal-error");
    } else {
      console.warn('Toast notification not available:', message);
    }
  }

  static async handleAsyncOperation(operation, context = '') {
    try {
      return await operation();
    } catch (error) {
      this.handleFetchError(error, context);
      throw error; // Re-throw to allow calling code to handle if needed
    }
  }
}

class CartNotification extends HTMLElement {
  constructor() {
    super();
    this.notification = document.getElementById("minicart_wrapper");
    this.giftwrap = document.querySelector(".add-giftwrap");
    this.cartCountDown = document.querySelector(".cart-countdown-time");
    this.minicart__wrapper =
      this.notification.querySelector(".minicart__wrapper");
    this.cartUpsellBeside = document.querySelector(".recommendations-beside");
    this.startTime = Date.now();
    this.querySelectorAll(".minicart__wrapper .close-cart-button").forEach(
      (closeButton) =>
        closeButton.addEventListener("click", this.close.bind(this))
    );
    document.querySelectorAll(".minicart__action").forEach((navToggle) => {
      navToggle.addEventListener(
        "click",
        (e) => {
          e.preventDefault();
          if (
            this.notification
              .querySelector(".minicart__wrapper")
              .classList.contains("open")
          ) {
            this.close();
          } else {
            this.open();
          }
        },
        false
      );
    });
    this.currentItemCount = Array.from(
      this.querySelectorAll('[name="updates[]"]')
    ).reduce(
      (total, quantityInput) => total + parseInt(quantityInput.value),
      0
    );
    this.onBodyClick = this.handleBodyClick.bind(this);
    this.debouncedOnChange = debounce((event) => {
      this.onChange(event);
    }, 300);
    this.notification.addEventListener(
      "change",
      this.debouncedOnChange.bind(this)
    );
    this.cartAction();
    this.addonsUpdate();
  }

  handleBodyClick(evt) {
    const target = evt.target;
    if (
      target != this &&
      !target.closest(".header__minicart") &&
      !target.closest("cart-notification") &&
      !target.closest(".cart-quick-edit-modal") &&
      !target.closest(".tingle-modal")
    ) {
      this.close();
    }
  }

  cartAction() {
    this.querySelectorAll(".close-cart").forEach((navToggle) => {
      navToggle.addEventListener(
        "click",
        (e) => {
          e.preventDefault();
          if (
            this.notification
              .querySelector(".minicart__wrapper")
              .classList.contains("open")
          ) {
            this.close();
          }
        },
        false
      );
    });
    this.querySelectorAll(".cart-addons button").forEach((button) => {
      button.removeEventListener("click", this.cartAddons.bind(this), false);
      button.addEventListener("click", this.cartAddons.bind(this), false);
    });

    document.querySelectorAll(".addon-actions .btn-save").forEach((button) => {
      button.removeEventListener(
        "click",
        this.cartAddonsSave.bind(this),
        false
      );
      button.addEventListener("click", this.cartAddonsSave.bind(this), false);
    });

    this.querySelectorAll(".add-giftwrap").forEach((giftwrap) => {
      giftwrap.removeEventListener(
        "click",
        this.addGiftwrapClick.bind(this),
        false
      );
      giftwrap.addEventListener(
        "click",
        this.addGiftwrapClick.bind(this),
        false
      );
    });

    this.querySelectorAll(".addon-actions .btn-cancel").forEach(
      (addonCancel) => {
        addonCancel.addEventListener(
          "click",
          (e) => {
            e.preventDefault();
            const target = e.currentTarget;
            target.closest(".cart__addon-content").classList.remove("is-open");
            target
              .closest(".minicart__wrapper")
              .querySelector(".open")
              .classList.remove("open");
          },
          false
        );
      }
    );
  }

  addonsUpdate() {
    const address_country = document.getElementById("address_country");
    const address_province = document.getElementById("address_province");
    if (address_country && address_province) {
      new Shopify.CountryProvinceSelector(
        "address_country",
        "address_province",
        { hideElement: "address_province_container" }
      );
    }

    const discount_code = document.querySelector(".discount_code");
    const code = localStorage.getItem("discount_code");
    if (code && discount_code) {
      document.querySelector(".discount_code").value = code;
    }
  }

  cartAddons(event) {
    event.preventDefault();
    const target = event.currentTarget;
    const open = target.getAttribute("data-open");
    if (!document.getElementById(open).classList.contains("is-open")) {
      document.getElementById(open).classList.add("is-open");
      target.classList.add("open");
      if (open == "shipping") {
        const address_country = document.getElementById("address_country");
        const address_province = document.getElementById("address_province");
        if (address_country && address_province) {
          new Shopify.CountryProvinceSelector(
            "address_country",
            "address_province",
            { hideElement: "address_province_container" }
          );
        }
      }
    } else {
      document.getElementById(open).classList.remove("is-open");
      target.classList.remove("open");
    }
  }

  fetchConfig(type = "json") {
    return {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: `application/${type}`,
      },
    };
  }

  cartAddonsSave(event) {
    event.preventDefault();
    const target = event.currentTarget;
    const action = target.getAttribute("data-action");
    if (action == "note") {
      const body = JSON.stringify({
        note: document.querySelector(".cart-note").value,
      });
      fetch(`${routes?.cart_update_url}`, {
        ...this.fetchConfig(),
        ...{ body },
      });
      document.getElementById(action).classList.remove("is-open");
      target
        .closest(".minicart__wrapper")
        .querySelector(".open")
        .classList.remove("open");
    } else if (action == "shipping") {
      var e = {};
      (e.zip = document.querySelector("#AddressZip").value || ""),
        (e.country = document.querySelector("#address_country").value || ""),
        (e.province = document.querySelector("#address_province").value || ""),
        this._getCartShippingRatesForDestination(e);
    }
  }

  _getCartShippingRatesForDestination(event) {
    fetch(
      `${window.Shopify.routes.root}cart/shipping_rates.json?shipping_address%5Bzip%5D=${event.zip}&shipping_address%5Bcountry%5D=${event.country}&shipping_address%5Bprovince%5D=${event.province}`
    )
      .then((response) => {
        return response.text();
      })
      .then((state) => {
        const message = document.querySelector(".addon-message");
        for (var item of document.querySelectorAll(".addon-message p")) {
          item.remove();
        }
        const { showDeliveryDays, deliveryDayOne, deliveryDaysOther } =
          message.dataset;
        const parsedState = JSON.parse(state);
        if (parsedState && parsedState.shipping_rates) {
          if (parsedState.shipping_rates.length > 0) {
            message.classList.remove("error", "warning");
            message.classList.add("success");
            const p = document.createElement("p");
            p.innerText = cartStrings?.shipping_rate.replace(
              "{{address}}",
              event.zip + ", " + event.country + " " + event.province
            );
            message.appendChild(p);
            parsedState.shipping_rates.map((rate) => {
              let daysShipping = "";
              if (rate.delivery_days.length > 0 && showDeliveryDays == "true") {
                let typeDay = deliveryDayOne;
                const day = rate.delivery_days[0];
                const dayAt = rate.delivery_days.at(-1);
                if (day > 1) typeDay = deliveryDaysOther;
                if (day === dayAt) {
                  daysShipping = `(${day} ${typeDay})`;
                } else {
                  daysShipping = `(${day} - ${dayAt} ${typeDay})`;
                }
              }
              const rateNode = document.createElement("p");
              rateNode.innerHTML =
                rate.name +
                ": " +
                Shopify.formatMoney(rate.price, cartStrings?.money_format) +
                " " +
                daysShipping;
              message.appendChild(rateNode);
            });
          } else {
            message.classList.remove("error", "success");
            message.classList.add("warning");
            const p = document.createElement("p");
            p.innerText = cartStrings?.no_shipping;
            message.appendChild(p);
          }
        } else {
          message.classList.remove("success", "warning");
          message.classList.add("error");
          Object.entries(parsedState).map((error) => {
            const message_error = `${error[1][0]}`;
            const p = document.createElement("p");
            p.innerText = message_error;
            message.appendChild(p);
          });
        }
      })
      .catch((error) => {
        throw error;
      });
  }

  addGiftwrapClick(event) {
    event.preventDefault();
    const target = event.currentTarget;
    const variant_id = target.getAttribute("data-variant-id");
    const config = fetchConfig("json");
    config.body = JSON.stringify({
      id: Number(variant_id),
      quantity: 1,
      sections: this.getSectionsToRender().map((section) => section.id),
      sections_url: window.location.pathname,
    });
    target.classList.add("loading");
    fetch(`${routes?.cart_add_url}`, config)
      .then((response) => {
        return response.text();
      })
      .then((state) => {
        const parsedState = JSON.parse(state);
        fetch("/cart.json")
          .then((res) => res.json())
          .then((cart) => {
            if (cart.item_count != undefined) {
              document.querySelectorAll(".cart-count").forEach((el) => {
                if (el.classList.contains("cart-count-drawer")) {
                  el.innerHTML = `(${cart.item_count})`;
                } else {
                  el.innerHTML = cart.item_count > 100 ? "~" : cart.item_count;
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
        this.getSectionsToRender().forEach((section) => {
          const elementToReplace = document.getElementById(section.id);
          const html = new DOMParser().parseFromString(
            parsedState.sections[section.id],
            "text/html"
          );
          elementToReplace.innerHTML =
            html.querySelector("#minicart-form").innerHTML;
        });
        this.cartAction();
      })
      .catch((e) => {
        throw e;
      })
      .finally(() => {
        BlsLazyloadImg.init();
        document.querySelector(".add-giftwrap").classList.remove("loading");
      });
  }

  onChange(event) {
    if (event.target.getAttribute("name") == "updates[]")
      this.updateQuantity(
        event.target.dataset.id,
        event.target.value,
        event.target.dataset.value,
        event.target,
        document.activeElement.getAttribute("name")
      );
  }

  updateQuantity(id, quantity, currentQuantity, _this, name) {
    quantity = quantity ? quantity : 0;
    const body = JSON.stringify({
      id,
      quantity,
      sections: this.getSectionsToRender().map((section) => section.id),
      sections_url: window.location.pathname,
    });
    const selector = `mini-cart-remove-button[data-index="${id}"]`;
    const cart_select = `minicart-wishlist-action[data-index="${id}"]`;

    const minicart_wishlist_action = this.querySelector(cart_select);
    if (minicart_wishlist_action) {
      minicart_wishlist_action.classList.add("loading");
    }
    const cart_item = this.querySelector(selector);
    cart_item.classList.add("loading");
    const cartRecommend = document.querySelector(".cart-recommend");
    if (cartRecommend && cartRecommend.classList.contains("open")) {
      cartRecommend.classList.remove("open");
    }
    const cart_free_ship = document.querySelector("free-ship-progress-bar");
    fetch(`${routes?.cart_change_url}`, { ...fetchConfig(), ...{ body } })
      .then((response) => {
        return response.text();
      })
      .then((state) => {
        const parsedState = JSON.parse(state);
        if (parsedState.errors) {
          this.updateMessageErrors(id, parsedState.errors, _this);
          return;
        }
        if (parsedState.item_count != undefined) {
          document.querySelectorAll(".cart-count").forEach((el) => {
            if (el.classList.contains("cart-count-drawer")) {
              el.innerHTML = `(${parsedState.item_count})`;
            } else {
              el.innerHTML =
                parsedState.item_count > 100 ? "~" : parsedState.item_count;
            }
          });
          if (document.querySelector("header-total-price")) {
            document
              .querySelector("header-total-price")
              .updateTotal(parsedState);
          }
        }
        if (document.querySelector(".quantity__label")) {
          const items = parsedState.items;
          const pro_id = document
            .querySelector(".quantity__label")
            .getAttribute("data-pro-id");
          var variant_id, variant_quantity;
          items.forEach(function (item) {
            variant_id = item.variant_id;
            if (variant_id == pro_id) {
              document.querySelector(".quantity-cart").innerHTML =
                item.quantity;
              document
                .querySelector(".quantity__label")
                .classList.remove("hidden");
              variant_quantity = pro_id;
              return;
            }
          });
          if (!variant_quantity) {
            document.querySelector(".quantity-cart").innerHTML = 0;
            document.querySelector(".quantity__label").classList.add("hidden");
          }
        }

        if (document.querySelector("header-total-price")) {
          document.querySelector("header-total-price").updateTotal(parsedState);
        }
        if (parsedState.item_count == 0 && this.cartCountDown) {
          this.cartCountDown.querySelector("countdown-timer").remove();
        }
        if (parsedState.item_count == 0 && this.cartUpsellBeside) {
          if (this.cartUpsellBeside.classList.contains("is-open")) {
            this.cartUpsellBeside.classList.remove("is-open");
          }
        }
        if (!parsedState.error && parsedState.item_count != undefined) {
          this.getSectionsToRender().forEach((section) => {
            const elementToReplace = document.getElementById(section.id);
            const html = new DOMParser().parseFromString(
              parsedState.sections[section.id],
              "text/html"
            );
            elementToReplace.innerHTML =
              html.querySelector("#minicart-form").innerHTML;
            if (cart_free_ship) {
              cart_free_ship.init(parsedState.items_subtotal_price);
            }
          });
        }
        this.cartAction();
      })
      .catch((e) => {
        throw e;
      })
      .finally(() => {
        BlsLazyloadImg.init();
        cart_item.classList.remove("loading");
        if (minicart_wishlist_action) {
          minicart_wishlist_action.classList.remove("loading");
        }
        setTimeout(function () {
          this.cart = document.querySelector("cart-notification");
        }, 500);
        const cartRecommend = document.querySelector(".cart-recommend");
        if (
          cartRecommend &&
          !cartRecommend.classList.contains("hidden-recommend")
        ) {
          if (cartRecommend.classList.contains("cart-recommend-custom")) {
            const cartUpsellItem =
              document.querySelectorAll(".cart-upsell-item");
            const cartUpsellSlide = document.querySelectorAll(
              ".swiper-cart-upsell .swiper-slide"
            );
            if (cartUpsellItem.length > 0) {
              setTimeout(function () {
                cartRecommend.classList.add("open");
              }, 800);
            } else if (cartUpsellSlide.length === 0) {
              cartRecommend.classList.remove("block");
              cartRecommend.classList.add("hidden");
            }
          } else {
            setTimeout(function () {
              cartRecommend.classList.add("open");
            }, 800);
          }
        }
      });
  }

  updateMessageErrors(line, message, target) {
    const val = target.dataset.value;
    target.value = val;
    const lineItemError = document.getElementById(
      `CartDrawer-LineItemError-${line}`
    );
    if (lineItemError)
      lineItemError.querySelector(".cart-item__error-text").textContent =
        message;
  }

  async open() {
    if (!this.notification.classList.contains("go_to_cart_page")) {
      if (this.classList.contains("show_popup")) {
        this.cart_icon = document.querySelector("header");
        this.minicart__wrapper.style.top = `calc(${
          this.cart_icon.getBoundingClientRect().bottom
        }px)`;
      }
      let delay;
      if (document.documentElement.classList.contains("open-search")) {
        delay = new Promise((resolve) => setTimeout(resolve, 650));
      }
      delay && (await delay);
      this.notification
        .querySelector(".minicart__wrapper")
        .classList.add("open");
      this.notification.classList.add("open");
      setTimeout(() => {
        if (!this.classList.contains("show_popup")) {
          document.documentElement.classList.add(
            "open-drawer",
            "open-minicart"
          );
          if (this.notification.classList.contains("open_drawer")) {
            root.style.setProperty(
              "padding-right",
              getScrollBarWidth.init() + "px"
            );
          }
        }
      }, 100);

      BlsLazyloadImg.init();
    } else {
      this.notification.querySelector("a").click();
    }
    this.notification.addEventListener(
      "transitionend",
      () => {
        this.notification.focus();
      },
      { once: true }
    );
    document.body.addEventListener("click", this.onBodyClick);
  }

  close() {
    this.notification.querySelector(".minicart__wrapper").classList.add("open");
    const cartRecommend = document.querySelector(".cart-recommend");
    let time = 0;
    if (cartRecommend && cartRecommend.classList.contains("open")) {
      time = 500;
      cartRecommend.classList.remove("open");
    }

    setTimeout(() => {
      this.notification.classList.remove("open");
      this.notification
        .querySelector(".minicart__wrapper")
        .classList.remove("open");
      document.documentElement.classList.remove("open-minicart");
    }, time);
    setTimeout(() => {
      root.style.removeProperty("padding-right");
      document.documentElement.classList.remove("open-drawer");
      if (document.querySelector("minicart-recommendations-beside")) {
        document
          .querySelector("minicart-recommendations-beside")
          .classList.remove("open");
      }
    }, time + 550);
    document.body.removeEventListener("click", this.onBodyClick);
    for (var item of document.querySelectorAll(".addon")) {
      item.classList.remove("is-open");
    }
  }

  getSectionsToRender() {
    return [
      {
        id: "minicart-form",
      },
    ];
  }

  getSectionInnerHTML(html, selector = ".shopify-section") {
    return new DOMParser()
      .parseFromString(html, "text/html")
      .querySelector(selector).innerHTML;
  }

  setActiveElement(element) {
    this.activeElement = element;
  }
}
customElements.define("cart-notification", CartNotification);

// Base class for components that fetch and update content
class BaseFetcher extends HTMLElement {
  constructor() {
    super();
    this.abortController = new AbortController();
  }

  async fetchAndUpdate(url, sourceSelector, targetSelector) {
    if (!url) {
      console.warn('No URL provided for fetching');
      return;
    }

    const measurementName = `${this.constructor.name}-fetch`;
    PerformanceMonitor.startMeasurement(measurementName);

    try {
      const response = await fetch(url, {
        signal: this.abortController.signal
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const text = await response.text();
      this.updateContent(text, sourceSelector, targetSelector);
      
    } catch (error) {
      if (error.name !== 'AbortError') {
        ErrorHandler.handleFetchError(error, this.constructor.name);
        this.classList.add("hidden");
      }
    } finally {
      PerformanceMonitor.endMeasurement(measurementName, false);
      this.initializeLazyLoading();
    }
  }

  updateContent(text, sourceSelector, targetSelector) {
    const html = document.createElement("div");
    html.innerHTML = text;
    
    const content = html.querySelector(sourceSelector);
    if (content?.innerHTML.trim().length) {
      const target = this.querySelector(targetSelector);
      if (target) {
        target.innerHTML = content.innerHTML;
      }
    } else {
      this.classList.add("hidden");
    }
  }

  initializeLazyLoading() {
    if (typeof BlsLazyloadImg !== 'undefined') {
      BlsLazyloadImg.init();
    }
  }

  disconnectedCallback() {
    // Cancel any ongoing fetch requests when element is removed
    this.abortController.abort();
  }
}

class CartUpsell extends BaseFetcher {
  constructor() {
    super();
  }
  
  init() {
    this.connectedCallback();
  }
  
  connectedCallback() {
    this.fetchAndUpdate(
      this.dataset.url,
      ".swiper-wrapper",
      ".swiper-wrapper"
    );
  }
}
customElements.define("minicart-recommendations", CartUpsell);

class CartUpsellBeside extends BaseFetcher {
  constructor() {
    super();
  }
  
  init() {
    this.connectedCallback();
  }
  
  connectedCallback() {
    this.fetchAndUpdate(
      this.dataset.url,
      ".cart-upsell-wrapper",
      ".cart-upsell-wrapper"
    );
  }
}
customElements.define("minicart-recommendations-beside", CartUpsellBeside);

class CartUpsellHeading extends HTMLElement {
  constructor() {
    super();
    if (this.querySelector(".button-close-beside")) {
      this.querySelector(".button-close-beside").addEventListener(
        "click",
        (e) => {
          const target = e.currentTarget;
          const closeBeside = target.closest(".cart-recommend");
          closeBeside.classList.remove("open");
        },
        false
      );
    }
  }
}
customElements.define("minicart-recommendations-heading", CartUpsellHeading);

class MinicartItemEdit extends PopupBase {
  constructor() {
    super();
    this.addEventListener("click", (event) => {
      event.preventDefault();
      const key = this.getAttribute("data-key");
      const quantity = this.getAttribute("data-quantity");
      const href = this.getAttribute("href");
      const variant =
        href.indexOf("?") > -1 ||
        href.indexOf("?variant=") > -1 ||
        href.indexOf("&variant=") > -1
          ? "&"
          : "/?";
      fetch(`${window.shopUrl}${href}${variant}section_id=cart-quick-edit`)
        .then((response) => {
          if (!response.ok) {
            var error = new Error(response.status);
            throw error;
          }
          return response.text();
        })
        .then((response) => {
          const resultsMarkup = new DOMParser()
            .parseFromString(response, "text/html")
            .getElementById("shopify-section-cart-quick-edit");
          this.initPopup(
            resultsMarkup,
            `<h3 class="title-popup h5 my-0 px-20 px-md-30 py-20 border-bottom">${this.dataset?.textHeader}</h3>`
          );
        })
        .catch((error) => {
          throw error;
        })
        .finally(() => {
          BlsLazyloadImg.init();
          if (document.querySelector("[data-template-quick-cart-edit]")) {
            document
              .querySelector("[data-template-quick-cart-edit]")
              .setAttribute("data-line", key);
          }
          if (
            document.querySelector(
              ".product-form-quick-edit quantity-input input"
            )
          ) {
            document.querySelector(
              ".product-form-quick-edit quantity-input input"
            ).value = quantity;
          }
        });
    });
  }
}
customElements.define("minicart-item-edit", MinicartItemEdit)