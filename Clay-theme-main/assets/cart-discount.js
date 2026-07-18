class MinicartDiscount extends HTMLElement {
  /** @type {AbortController | null} */
  #activeFetch = null;

  constructor() {
    super();
    this.init();
    this.submitButton = this.querySelector('[type="submit"]');
    this.cart =
      document.querySelector("cart-notification") ||
      document.querySelector("cart-drawer");
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
          document.getElementById(section.section) ||
          document.getElementById(section.section);

        if (elementToReplace) {
          elementToReplace.innerHTML = this.getSectionInnerHTML(
            data.sections[section.section],
            section.section
          );
        }
      }
    });

    // Update header total price
    this.#updateHeaderTotalPrice(data);

    // Update free shipping progress bar
    this.#updateCartFreeShipping(data);

    // Reinitialize components
    BlsLazyloadImg.init();
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
      this.cart.cartAction();
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
      this.cart.cartAction();
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
    return [
      {
        section: "minicart-form",
      },
    ];
  }

  getSectionInnerHTML(html, selector) {
    return (
      new DOMParser()
        .parseFromString(html, "text/html")
        .querySelector(`#${selector}`)?.innerHTML || ""
    );
  }

  toastSuccess(message) {
    const toast = this.#createToast(message, "success");
    showToast(toast, 2000, "modal-success");
  }

  toastError(message) {
    const toast = this.#createToast(message, "error");
    showToast(toast, 2000, "modal-error");
  }

  /**
   * Create toast message HTML
   * @param {string} message - Toast message
   * @param {string} type - Toast type (success/error)
   * @returns {string} - Toast HTML
   */
  #createToast(message, type) {
    const isSuccess = type === "success";
    const iconColor = isSuccess ? "#137F24" : "#D0473E";
    const className = isSuccess
      ? "newsletter-form__message--success success"
      : "line-item-error-1 error";

    const iconPath = isSuccess
      ? `<path d="m6.033 8.992 1.972 1.98 3.952-3.96"/><path d="M7.973 1.178c.565-.482 1.49-.482 2.062 0l1.293 1.113c.245.213.704.385 1.03.385h1.392c.867 0 1.579.712 1.579 1.579v1.39c0 .32.172.786.384 1.032l1.113 1.292c.483.565.483 1.49 0 2.062l-1.113 1.293a1.813 1.813 0 0 0-.384 1.03v1.392c0 .867-.712 1.579-1.58 1.579h-1.39c-.32 0-.786.172-1.031.384l-1.293 1.113c-.564.483-1.489.483-2.062 0L6.681 15.71a1.813 1.813 0 0 0-1.031-.384H4.234c-.867 0-1.579-.712-1.579-1.58v-1.398c0-.32-.172-.778-.376-1.023l-1.105-1.301c-.474-.565-.474-1.48 0-2.045L2.28 6.677c.204-.246.376-.704.376-1.023V4.247c0-.868.712-1.58 1.58-1.58H5.65c.319 0 .785-.171 1.03-.384l1.293-1.105Z"/>`
      : `<path d="M7.977 1.198c.573-.482 1.498-.482 2.054 0l1.293 1.105a1.89 1.89 0 0 0 1.039.376h1.39c.868 0 1.58.712 1.58 1.58v1.39c0 .328.171.786.376 1.031l1.105 1.293c.482.573.482 1.497 0 2.054l-1.105 1.292c-.204.246-.376.704-.376 1.031v1.391c0 .867-.712 1.58-1.58 1.58h-1.39c-.328 0-.786.171-1.031.376L10.039 16.8c-.573.483-1.497.483-2.054 0l-1.292-1.104c-.246-.205-.712-.377-1.031-.377H4.23c-.867 0-1.58-.712-1.58-1.579v-1.399c0-.319-.163-.785-.367-1.023l-1.105-1.3c-.474-.565-.474-1.481 0-2.046l1.105-1.3c.204-.246.368-.705.368-1.024V4.267c0-.868.712-1.58 1.579-1.58h1.415c.328 0 .786-.171 1.031-.376l1.301-1.113ZM7 11l4-4M11 11 7 7"/>`;

    return `
      <div class="mt-10 ${className} form__message inline-flex align-center" tabindex="-1">
        <svg width="18" height="18" fill="none" class="flex-auto">
          <g stroke="${iconColor}" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.3">
            ${iconPath}
          </g>
        </svg>
        <span class="ml-5">${message}</span>
      </div>
    `;
  }
}

if (!customElements.get("minicart-discount")) {
  customElements.define("minicart-discount", MinicartDiscount);
}
