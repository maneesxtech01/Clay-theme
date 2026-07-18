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
