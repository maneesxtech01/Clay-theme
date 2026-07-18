function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

class CartUtils {
  /**
   * Update cart count display across all cart count elements
   * @param {number} itemCount - Number of items in cart
   */
  static updateCartCount(itemCount) {
    document.querySelectorAll(".cart-count").forEach((el) => {
      if (el.classList.contains("cart-count-drawer")) {
        el.innerHTML = `(${itemCount})`;
      } else {
        el.innerHTML = itemCount > 100 ? "~" : itemCount;
      }
    });
  }

  /**
   * Update header total price if element exists
   * @param {Object} cartData - Cart data object
   */
  static updateHeaderTotalPrice(cartData) {
    const headerTotalPrice = document.querySelector("header-total-price");
    if (headerTotalPrice && typeof headerTotalPrice.updateTotal === "function") {
      headerTotalPrice.updateTotal(cartData);
    }
  }

  /**
   * Update free shipping progress bar
   * @param {number} subtotalPrice - Items subtotal price
   */
  static updateFreeShippingBar(subtotalPrice) {
    const cartFreeShip = document.querySelector("free-ship-progress-bar");
    if (cartFreeShip) {
      cartFreeShip.init(subtotalPrice);
    }
  }

  /**
   * Update cart totals section
   * @param {Object} sections - Parsed sections data
   * @param {string} totalsSelector - CSS selector for totals
   */
  static updateCartTotals(sections, totalsSelector = ".cart-info .totals") {
    const mainCartItems = document.getElementById("main-cart-items");
    if (!mainCartItems || !sections) return;

    const totalsHTML = CartUtils.getSectionInnerHTML(
      sections[mainCartItems.dataset.id],
      totalsSelector
    );
    const totalsContent = document.querySelector(totalsSelector);
    
    if (totalsHTML && totalsContent) {
      totalsContent.innerHTML = totalsHTML;
    }
  }

  /**
   * Parse HTML section and return inner HTML
   * @param {string} html - HTML string to parse
   * @param {string} selector - CSS selector
   * @returns {string} - Inner HTML or empty string
   */
  static getSectionInnerHTML(html, selector) {
    try {
      return new DOMParser()
        .parseFromString(html, "text/html")
        .querySelector(selector)?.innerHTML || "";
    } catch (error) {
      console.error("Error parsing HTML section:", error);
      return "";
    }
  }

  /**
   * Update gift form event listeners
   * @param {HTMLElement} cartInstance - Cart instance for binding methods
   */
  static updateGiftFormListeners(cartInstance) {
    const giftFormMinicart = document.getElementById("gift_form_minicart");
    if (giftFormMinicart) {
      giftFormMinicart.addEventListener("change", (event) => {
        if (event.currentTarget.checked) {
          cartInstance.addGiftwrapCartClick(giftFormMinicart);
        } else {
          cartInstance.updateQuantity(event.currentTarget.dataset.index, 0);
        }
      });
    }
  }

  /**
   * Comprehensive cart UI update after API responses
   * @param {Object} options - Update options
   * @param {Object} options.parsedState - Parsed API response
   * @param {Array} options.sectionsToRender - Sections to update
   * @param {HTMLElement} options.cartInstance - Cart instance
   * @param {string} options.totalsSelector - Totals selector
   */
  static updateCartUI({ parsedState, sectionsToRender, cartInstance, totalsSelector = ".cart-info .totals" }) {
    // Update cart count
    if (parsedState.item_count !== undefined) {
      CartUtils.updateCartCount(parsedState.item_count);
      CartUtils.updateHeaderTotalPrice(parsedState);
    }

    // Update cart sections
    if (parsedState.item_count == 0) {
      sectionsToRender.forEach((section) => {
        const elementToReplace = document.querySelector("#main-cart-items");
        if (elementToReplace) {
          elementToReplace.innerHTML = CartUtils.getSectionInnerHTML(
            parsedState.sections[section.section],
            "#main-cart-items"
          );
        }
      });
    } else {
      sectionsToRender.forEach((section) => {
        const elementToReplace =
          document.getElementById(section.id)?.querySelector(section.selector) ||
          document.getElementById(section.id);
        
        if (elementToReplace) {
          elementToReplace.innerHTML = CartUtils.getSectionInnerHTML(
            parsedState.sections[section.section],
            section.selector
          );
        }
      });

      // Update totals
      CartUtils.updateCartTotals(parsedState.sections, totalsSelector);

      // Update gift section
      CartUtils.updateGiftSection(parsedState.sections, cartInstance);
    }

    // Update free shipping
    CartUtils.updateFreeShippingBar(parsedState.items_subtotal_price);

    // Reinitialize components
    BlsLazyloadImg.init();
  }

  /**
   * Update gift section
   * @param {Object} sections - Parsed sections
   * @param {HTMLElement} cartInstance - Cart instance
   */
  static updateGiftSection(sections, cartInstance) {
    const mainCartItems = document.getElementById("main-cart-items");
    if (!mainCartItems || !sections) return;

    const html = new DOMParser().parseFromString(
      sections[mainCartItems.dataset.id],
      "text/html"
    );
    
    const cartGiftHtml = html.getElementById("gift");
    const cartGift = document.getElementById("gift");

    if (cartGift && cartGiftHtml) {
      cartGift.innerHTML = cartGiftHtml.innerHTML;
      CartUtils.updateGiftFormListeners(cartInstance);
    }
  }

  /**
   * Show toast message with unified styling
   * @param {string} message - Message to display
   * @param {string} type - Type of toast (success/error)
   */
  static showToast(message, type = "success") {
    const isSuccess = type === "success";
    const iconColor = isSuccess ? "#137F24" : "#D0473E";
    const className = isSuccess
      ? "newsletter-form__message--success success"
      : "line-item-error-1 error";
    const modalType = isSuccess ? "modal-success" : "modal-error";

    const iconPath = isSuccess
      ? `<path d="m6.033 8.992 1.972 1.98 3.952-3.96"/><path d="M7.973 1.178c.565-.482 1.49-.482 2.062 0l1.293 1.113c.245.213.704.385 1.03.385h1.392c.867 0 1.579.712 1.579 1.579v1.39c0 .32.172.786.384 1.032l1.113 1.292c.483.565.483 1.49 0 2.062l-1.113 1.293a1.813 1.813 0 0 0-.384 1.03v1.392c0 .867-.712 1.579-1.58 1.579h-1.39c-.32 0-.786.172-1.031.384l-1.293 1.113c-.564.483-1.489.483-2.062 0L6.681 15.71a1.813 1.813 0 0 0-1.031-.384H4.234c-.867 0-1.579-.712-1.579-1.58v-1.398c0-.32-.172-.778-.376-1.023l-1.105-1.301c-.474-.565-.474-1.48 0-2.045L2.28 6.677c.204-.246.376-.704.376-1.023V4.247c0-.868.712-1.58 1.58-1.58H5.65c.319 0 .785-.171 1.03-.384l1.293-1.105Z"/>`
      : `<path d="M7.977 1.198c.573-.482 1.498-.482 2.054 0l1.293 1.105a1.89 1.89 0 0 0 1.039.376h1.39c.868 0 1.58.712 1.58 1.58v1.39c0 .328.171.786.376 1.031l1.105 1.293c.482.573.482 1.497 0 2.054l-1.105 1.292c-.204.246-.376.704-.376 1.031v1.391c0 .867-.712 1.58-1.58 1.58h-1.39c-.328 0-.786.171-1.031.376L10.039 16.8c-.573.483-1.497.483-2.054 0l-1.292-1.104c-.246-.205-.712-.377-1.031-.377H4.23c-.867 0-1.58-.712-1.58-1.579v-1.399c0-.319-.163-.785-.367-1.023l-1.105-1.3c-.474-.565-.474-1.481 0-2.046l1.105-1.3c.204-.246.368-.705.368-1.024V4.267c0-.868.712-1.58 1.579-1.58h1.415c.328 0 .786-.171 1.031-.376l1.301-1.113ZM7 11l4-4M11 11 7 7"/>`;

    const toastHTML = `
      <div class="mt-10 ${className} form__message inline-flex align-center" tabindex="-1">
        <svg width="18" height="18" fill="none" class="flex-auto">
          <g stroke="${iconColor}" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.3">
            ${iconPath}
          </g>
        </svg>
        <span class="ml-5">${message}</span>
      </div>
    `;

    showToast(toastHTML, 3000, modalType);
  }
}

class CartRemoveButton extends HTMLElement {
  constructor() {
    super();
    this.addEventListener("click", (event) => {
      event.preventDefault();
      const cartItems =
        this.closest("cart-items") || this.closest("cart-drawer-items");
      cartItems.updateQuantity(this.dataset.index, 0);
    });
  }
} 
customElements.define("cart-remove-button", CartRemoveButton);

class CartItems extends HTMLElement {
  constructor() {
    super();
    this.currentItemCount = Array.from(
      this.querySelectorAll('[name="updates[]"]')
    ).reduce(
      (total, quantityInput) => total + parseInt(quantityInput.value),
      0
    );

    this.debouncedOnChange = debounce((event) => {
      this.onChange(event);
    }, 300);

    this.addEventListener("change", this.debouncedOnChange.bind(this));
    
    // Use CartUtils for gift form listeners
    CartUtils.updateGiftFormListeners(this);
    
    document
      .querySelectorAll(".js-addtocart-page")
      .forEach((upsell) =>
        upsell.addEventListener("click", this.addProductUpSellEvent.bind(this))
      );
  }

  onChange(event) {
    this.updateQuantity(
      event.target.dataset.index,
      event.target.dataset.key,
      event.target.value,
      document.activeElement.getAttribute("name"),
      event.target
    );
  }

  getSectionsToRender() {
    return [
      {
        id: "main-cart-items",
        section: document.getElementById("main-cart-items").dataset.id,
        selector: ".js-contents",
      }
    ];
  }

  updateQuantity(line, key, quantity, name, target) {
    quantity = quantity ? quantity : 0;
    const selector = `cart-remove-button[data-index="${line}"]`;
    const cart_item = this.querySelector(selector);
    cart_item?.classList.add("loading");
    
    const body = JSON.stringify({
      line,
      quantity,
      sections: this.getSectionsToRender().map((section) => section.section),
      sections_url: window.location.pathname,
    });

    fetch(`${routes.cart_change_url}`, { ...fetchConfig(), ...{ body } })
      .then((response) => response.text())
      .then((state) => {
        const parsedState = JSON.parse(state);
        
        if (parsedState.errors) {
          this.updateMessageErrors(line, parsedState.errors, target);
          this.disableLoading();
          return;
        }

        // Use CartUtils for comprehensive UI update
        CartUtils.updateCartUI({
          parsedState,
          sectionsToRender: this.getSectionsToRender(),
          cartInstance: this,
          totalsSelector: ".cart-info .totals"
        });

        this.updateLiveRegions(line, key, parsedState.item_count);
        this.disableLoading();
      })
      .catch((e) => {
        console.error(e);
        this.disableLoading();
      })
      .finally(() => {
        BlsLazyloadImg.init();
        cart_item?.classList.remove("loading");
      });
  }

  updateLiveRegions(line, key, itemCount) {
    if (this.currentItemCount === itemCount) {
      const lineItemError =
        document.getElementById(`Line-item-error-${line}`) ||
        document.getElementById(`CartDrawer-LineItemError-${line}`);
      const quantityElement =
        document.getElementById(`Quantity-${line}`) ||
        document.getElementById(`Drawer-quantity-${line}`);
      for (var item of document.querySelectorAll(".cart-item__error-text")) {
        item.classList.remove("error");
      }
      if (lineItemError) {
        {
          lineItemError
            .querySelector(`.cart-item__error-text-${key}`)
            .classList.add("error");
          lineItemError.querySelector(
            `.cart-item__error-text-${key}`
          ).innerHTML = window.cartStrings.quantityError.replace(
            "[quantity]",
            quantityElement.value
          );
        }
      }
    }

    this.currentItemCount = itemCount;
  }

  updateMessageErrors(line, message, target) {
    const val = target.dataset.value;
    target.value = val;
    var wrapperDiv = document.createElement("div");
    var messageDiv = document.createElement("div");
    messageDiv.className = `mt-10 line-item-error-${line} error form__message inline-flex align-center`;
    messageDiv.setAttribute("tabindex", "-1");
    messageDiv.innerHTML = `
  <svg width="18" height="18" fill="none" class="flex-auto">
    <g stroke="#D0473E" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.3">
      <path d="M7.977 1.198c.573-.482 1.498-.482 2.054 0l1.293 1.105a1.89 1.89 0 0 0 1.039.376h1.39c.868 0 1.58.712 1.58 1.58v1.39c0 .328.171.786.376 1.031l1.105 1.293c.482.573.482 1.497 0 2.054l-1.105 1.292c-.204.246-.376.704-.376 1.031v1.391c0 .867-.712 1.58-1.58 1.58h-1.39c-.328 0-.786.171-1.031.376L10.039 16.8c-.573.483-1.497.483-2.054 0l-1.292-1.104c-.246-.205-.712-.377-1.031-.377H4.23c-.867 0-1.58-.712-1.58-1.579v-1.399c0-.319-.163-.785-.367-1.023l-1.105-1.3c-.474-.565-.474-1.481 0-2.046l1.105-1.3c.204-.246.368-.705.368-1.024V4.267c0-.868.712-1.58 1.579-1.58h1.415c.328 0 .786-.171 1.031-.376l1.301-1.113ZM7 11l4-4M11 11 7 7"/>
    </g>
  </svg>
`;
    var span = document.createElement("span");
    span.className = "ml-5";
    span.textContent = message;
    messageDiv.appendChild(span);
    wrapperDiv.appendChild(messageDiv);
    showToast(wrapperDiv.innerHTML, 3000, "modal-error");
  }

  addGiftwrapCartClick(event) {
    const target = event;
    const variant_id = target.getAttribute("data-variant-id");
    const body = JSON.stringify({
      id: Number(variant_id),
      quantity: 1,
      sections: this.getSectionsToRender().map((section) => section.section),
      sections_url: window.location.pathname,
    });

    fetch(`${routes.cart_add_url}`, { ...fetchConfig(), ...{ body } })
      .then((response) => response.text())
      .then((state) => {
        const parsedState = JSON.parse(state);
        
        // Fetch updated cart data
        return fetch("/cart.json")
          .then((res) => res.json())
          .then((cart) => {
            // Update cart count and related elements
            if (cart.item_count !== undefined) {
              CartUtils.updateCartCount(cart.item_count);
              CartUtils.updateHeaderTotalPrice(cart);
              CartUtils.updateFreeShippingBar(cart.items_subtotal_price);
            }
            return { parsedState, cart };
          });
      })
      .then(({ parsedState }) => {
        // Use CartUtils for UI update
        CartUtils.updateCartUI({
          parsedState,
          sectionsToRender: this.getSectionsToRender(),
          cartInstance: this,
          totalsSelector: ".cart-info .totals"
        });

        this.disableLoading();
      })
      .catch((error) => {
        console.error("Error in addGiftwrapCartClick:", error);
        this.disableLoading();
      });
  }

  toastSuccess(message) {
    CartUtils.showToast(message, "success");
  }

  toastError(message) {
    CartUtils.showToast(message, "error");
  }

  addProductUpSellEvent(event) {
    event.preventDefault();
    const target = event.currentTarget;
    const variant_id = target
      .closest(".product-addtocart-js")
      .getAttribute("data-product-variant-id");
    
    const body = JSON.stringify({
      id: Number(variant_id),
      quantity: 1,
      sections: CartUtils.getSectionsToRender().map((section) => section.section),
      sections_url: window.location.pathname,
    });

    fetch(`${routes.cart_add_url}`, { ...fetchConfig(), ...{ body } })
      .then((response) => response.text())
      .then((state) => {
        const parsedState = JSON.parse(state);
        
        // Fetch updated cart data
        return fetch("/cart.json")
          .then((res) => res.json())
          .then((cart) => {
            // Update cart count and related elements
            if (cart.item_count !== undefined) {
              CartUtils.updateCartCount(cart.item_count);
              CartUtils.updateHeaderTotalPrice(cart);
              CartUtils.updateFreeShippingBar(cart.items_subtotal_price);
            }
            return { parsedState, cart };
          });
      })
      .then(({ parsedState }) => {
        // Use CartUtils for UI update with different totals selector
        CartUtils.updateCartUI({
          parsedState,
          sectionsToRender: this.getSectionsToRender(),
          cartInstance: this,
          totalsSelector: ".cart__footer .totals"
        });
      })
      .catch((error) => {
        console.error("Error in addProductUpSellEvent:", error);
        this.disableLoading();
      });
  }

  getSectionInnerHTML(html, selector) {
    return CartUtils.getSectionInnerHTML(html, selector);
  }

  enableLoading(line) {
    document.body.classList.add("start", "loading");
    document.activeElement.blur();
  }

  disableLoading() {
    // document.body.classList.add('finish');
    // setTimeout(function () {
    //   document.body.classList.remove('start', 'loading', 'finish');
    // }, 500);
  }
}
customElements.define("cart-items", CartItems);

if (!customElements.get("cart-note")) {
  customElements.define(
    "cart-note",
    class CartNote extends HTMLElement {
      constructor() {
        super();
        this.addEventListener(
          "change",
          debounce((event) => {
            const body = JSON.stringify({ note: event.target.value });
            fetch(`${routes.cart_update_url}`, {
              ...fetchConfig(),
              ...{ body },
            });
          }, 300)
        );
      }
    }
  );
}

class CartEstimate extends HTMLElement {
  constructor() {
    super();
    this.button = this.querySelector('button[ data-action="shipping"]');
    this.init();
  }
  init() {
    var _this = this;
    this.button.addEventListener("click", _this.onclick.bind(_this));
    this.addonsUpdate();
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
  onclick() {
    var e = {};
    (e.zip = document.querySelector("#AddressZip").value || ""),
      (e.country = document.querySelector("#address_country").value || ""),
      (e.province = document.querySelector("#address_province").value || ""),
      this.getCartShippingRatesForDestination(e);
  }
  getCartShippingRatesForDestination(event) {
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
}
customElements.define("cart-estimate", CartEstimate);
class CartDiscount extends HTMLElement {
  /** @type {AbortController | null} */
  #activeFetch = null;

  constructor() {
    super();
    this.init();
    this.submitButton = this.querySelector('[type="submit"]');
  }

  init() {
    const form = this.querySelector("form");
    if (form) {
      form.addEventListener("submit", this.applyDiscount);
    }
    this.addEventListener("click", (event) => {
      if (event.target.closest(".cart-discount-remove")) {
        this.removeDiscount(event);
      }
    });
  }

  #createAbortController() {
    if (this.#activeFetch) {
      this.#activeFetch.abort();
    }

    const abortController = new AbortController();
    this.#activeFetch = abortController;
    return abortController;
  }

  /**
   * Common method to update cart with discount changes
   * @param {string[]} discountCodes - Array of discount codes
   * @param {AbortController} abortController - Abort controller for the request
   * @returns {Promise<Object>} - Cart update response
   */
  async #updateCartDiscount(discountCodes, abortController) {
    const body = JSON.stringify({
      discount: discountCodes.join(","),
      sections: this.getSectionsToRender().map((section) => section.section),
      sections_url: window.location.pathname,
    });

    const response = await fetch(routes.cart_update_url, {
      ...fetchConfig(),
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: body,
      signal: abortController.signal,
    });

    return response.json();
  }

  /**
   * Common method to update UI after cart changes
   * @param {Object} data - Cart response data
   */
  #updateCartUI(data) {
    // Update main cart sections
    this.getSectionsToRender().forEach((section) => {
      if (data.sections && data.sections[section.section]) {
        const elementToReplace =
          document
            .getElementById(section.id)
            ?.querySelector(section.selector) ||
          document.getElementById(section.id);

        if (elementToReplace) {
          elementToReplace.innerHTML = this.getSectionInnerHTML(
            data.sections[section.section],
            section.selector
          );
        }
      }
    });

    // Update totals
    this.#updateTotals(data);

    // Update header total price
    this.#updateHeaderTotalPrice(data);

    // Update free shipping progress bar
    this.#updateCartFreeShipping(data);

    // Reinitialize components
    BlsLazyloadImg.init();
  }

  /**
   * Update cart totals
   * @param {Object} data - Cart response data
   */
  #updateTotals(data) {
    const mainCartItems = document.getElementById("main-cart-items");
    if (!mainCartItems || !data.sections) return;

    const totals = this.getSectionInnerHTML(
      data.sections[mainCartItems.dataset.id],
      ".cart-info .totals"
    );
    const totalsContent = document.querySelector(".cart-info .totals");

    if (totals && totalsContent) {
      totalsContent.innerHTML = totals;
    }
  }

  /**
   * Update header total price
   * @param {Object} data - Cart response data
   */
  #updateHeaderTotalPrice(data) {
    const headerTotalPrice = document.querySelector("header-total-price");
    if (
      headerTotalPrice &&
      typeof headerTotalPrice.updateTotal === "function"
    ) {
      headerTotalPrice.updateTotal(data);
    }
  }

  /**
   * Update free shipping progress bar
   * @param {Object} data - Cart response data
   */
  #updateCartFreeShipping(data) {
    const cart_free_ship = document.querySelector("free-ship-progress-bar");
    if (cart_free_ship) {
      cart_free_ship.init(data.items_subtotal_price);
    }
  }

  /**
   * Common method to handle loading states
   * @param {boolean} isLoading - Loading state
   */
  #setLoadingState(isLoading) {
    if (!this.submitButton) return;

    if (isLoading) {
      this.submitButton.setAttribute("aria-disabled", "true");
      this.submitButton.classList.add("loading");
    } else {
      this.submitButton.removeAttribute("aria-disabled");
      this.submitButton.classList.remove("loading");
    }
  }

  /**
   * Common error handling method
   * @param {Error} error - Error object
   * @param {string} operation - Operation that failed
   */
  #handleError(error, operation = "discount operation") {
    if (error.name !== "AbortError") {
      console.error(`Error during ${operation}:`, error);
      this.#handleDiscountError();
    }
  }

  /**
   * Handles updates to the cart discount.
   * @param {SubmitEvent} event - The submit event on our form.
   */
  applyDiscount = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    const form =
      event.target instanceof HTMLFormElement
        ? event.target
        : this.querySelector("form");

    if (!form) {
      console.warn("CartDiscount: No form found");
      return;
    }

    const discountCode = form.querySelector('input[name="discount"]');
    if (!(discountCode instanceof HTMLInputElement)) {
      console.warn("CartDiscount: No discount input found");
      return;
    }

    const discountCodeValue = discountCode.value.trim();
    if (!discountCodeValue) return;

    // Check if discount already exists
    const existingDiscounts = this.#existingDiscounts();
    if (existingDiscounts.includes(discountCodeValue)) {
      this.toastError(cartStrings?.discount_already);
      return;
    }

    this.#setLoadingState(true);
    const abortController = this.#createAbortController();

    try {
      const updatedDiscounts = [...existingDiscounts, discountCodeValue];
      const data = await this.#updateCartDiscount(
        updatedDiscounts,
        abortController
      );

      if (
        data.discount_codes.find(
          (/** @type {{ code: string; applicable: boolean; }} */ discount) => {
            return (
              discount.code === discountCodeValue &&
              discount.applicable === false
            );
          }
        )
      ) {
        this.#handleDiscountError();
        return;
      }

      discountCode.value = "";
      this.#updateCartUI(data);
      this.toastSuccess(cartStrings?.discount_applied);
    } catch (error) {
      this.#handleError(error, "applying discount");
    } finally {
      this.#setLoadingState(false);
      this.#activeFetch = null;
    }
  };

  /**
   * Handles removing a discount from the cart.
   * @param {MouseEvent | KeyboardEvent} event - The mouse or keyboard event in our pill.
   */
  removeDiscount = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    const removeButton = event.target.closest(".cart-discount-remove");
    removeButton.setAttribute("aria-disabled", "true");
    removeButton.classList.add("loading");
    if (event instanceof KeyboardEvent && event.key !== "Enter") {
      return;
    }

    const discountCode = this.#getDiscountCodeFromEvent(event);
    if (!discountCode) return;

    const existingDiscounts = this.#existingDiscounts();
    const updatedDiscounts = existingDiscounts.filter(
      (code) => code !== discountCode
    );

    if (updatedDiscounts.length === existingDiscounts.length) {
      console.warn("Discount code not found in existing discounts");
      return;
    }

    const abortController = this.#createAbortController();

    try {
      const data = await this.#updateCartDiscount(
        updatedDiscounts,
        abortController
      );
      this.#updateCartUI(data);
      this.toastSuccess(cartStrings?.discount_removed);
    } catch (error) {
      this.#handleError(error, "removing discount");
    } finally {
      this.#activeFetch = null;
      removeButton.setAttribute("aria-disabled", "false");
      removeButton.classList.remove("loading");
    }
  };

  /**
   * Extract discount code from remove event
   * @param {Event} event - Click/keyboard event
   * @returns {string|null} - Discount code or null
   */
  #getDiscountCodeFromEvent(event) {
    const removeButton = event.target.closest(".cart-discount__item");
    if (!removeButton) return null;

    return (
      removeButton.dataset.code ||
      removeButton.dataset.discountCode ||
      removeButton.closest("[data-discount-code]")?.dataset.discountCode ||
      null
    );
  }

  /**
   * Handles the discount error.
   */
  #handleDiscountError() {
    const errorMessage = cartStrings?.discount_error;
    this.toastError(errorMessage);
  }

  /**
   * Returns an array of existing discount codes.
   * @returns {string[]}
   */
  #existingDiscounts() {
    const discountCodes = [];
    const discountPills = this.querySelectorAll(
      ".cart-discount__item, [data-discount-code]"
    );

    for (const pill of discountPills) {
      if (pill instanceof HTMLElement) {
        const code = pill.dataset.discountCode || pill.dataset.code;
        if (typeof code === "string" && code.trim()) {
          discountCodes.push(code.trim());
        }
      }
    }

    return discountCodes;
  }

  getSectionsToRender() {
    const mainCartItems = document.getElementById("main-cart-items");
    if (!mainCartItems) {
      console.warn('CartDiscount: No element found with id="main-cart-items"');
      return [];
    }

    return [
      {
        id: "main-cart-items",
        section: mainCartItems.dataset.id,
        selector: ".js-contents",
      },
      {
        id: "main-cart-items",
        section: mainCartItems.dataset.id,
        selector: ".js-contents_discounts",
      },
      {
        id: "main-cart-items",
        section: mainCartItems.dataset.id,
        selector: ".cart-discount__codes",
      }
    ];
  }

  getSectionInnerHTML(html, selector) {
    return CartUtils.getSectionInnerHTML(html, selector);
  }

  toastSuccess(message) {
    CartUtils.showToast(message, "success");
  }

  toastError(message) {
    CartUtils.showToast(message, "error");
  }
}

if (!customElements.get("cart-discount")) {
  customElements.define("cart-discount", CartDiscount);
}
