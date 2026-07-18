"use-strict";
var BlsLazyloadImg = (function () {
  return {
    init: function () {
      this.lazyReady();
    },
    lazyReady: function () {
      if (!!window.IntersectionObserver) {
        let observer = new IntersectionObserver(
          (entries, observer) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                const onImageLoad = (e) => {
                  const target = e.currentTarget;
                  setTimeout(() => {
                    target
                      ?.closest("motion-element")
                      ?.classList.remove("bls-loading-image");
                    target?.classList.remove("bls-loading-image");
                  }, 600);
                  e.currentTarget.removeEventListener("load", onImageLoad);
                };
                entry.target.width = entry.boundingClientRect.width;
                entry.target.height = entry.boundingClientRect.height;
                entry.target.sizes = `${entry.boundingClientRect.width}px`;
                entry.target.addEventListener("load", onImageLoad);
                observer.unobserve(entry.target);
              }
            });
          },
          { rootMargin: "10px" }
        );
        document.querySelectorAll(".bls-image-js img").forEach((img) => {
          observer.observe(img);
        });
      }
    },
  };
})();
BlsLazyloadImg.init();
function CloseAllPopup(data) {
  publish("closeCanvas", data);
}

const imageReady = (imageOrArray) => {
  if (!imageOrArray) {
    return Promise.resolve();
  }
  imageOrArray =
    imageOrArray instanceof Element ? [imageOrArray] : Array.from(imageOrArray);
  return Promise.all(
    imageOrArray.map((image) => {
      return new Promise((resolve) => {
        if (
          (image.tagName === "IMG" && image.complete) ||
          !image.offsetParent
        ) {
          setTimeout(() => {
            image
              .closest("motion-element")
              ?.classList.remove("bls-loading-image");
            image.classList.remove("bls-loading-image");
            resolve();
          }, 100);
        } else {
          image.addEventListener("load", (e) => {
            e.currentTarget
              .closest("motion-element")
              ?.classList.remove("bls-loading-image");
            e.currentTarget.classList.remove("bls-loading-image");
            resolve();
          });
        }
      });
    })
  );
};
class MotionElement extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    if (this.isHold) return;
    this.preInitialize();
    if (this.dataset.noview) {
      return;
    }
    if (!this.isConnected || !document.body.contains(this)) {
      setTimeout(() => {
        this.connectedCallback();
      }, 100);
      return;
    }

    var _this = this;
    let custom_margin = this.dataset.margin || "0px 0px -5px 0px";
    let rootElement = {};
    if (this.dataset.parent) {
      var parent = this.closest(`.${this.dataset.parent}`);
      rootElement = { root: parent };
      custom_margin = "0px 0px 0px 0px";
    }
    Motion.inView(
      _this,
      async () => {
        if (
          !this.isInstant &&
          this.mediaElements &&
          this.hasAttribute("data-image")
        ) {
          await imageReady(this.mediaElements);
        }
        setTimeout(() => {
          _this.initialize();
        }, 50);
      },
      { margin: custom_margin, ...rootElement }
    );
  }

  get isHold() {
    return this.hasAttribute("hold");
  }

  get Transition() {
    let transition = this.getAttribute("data-transition")
      ?.split(",")
      .map(Number);
    return transition || [0, 0, 0.3, 1];
  }

  get isInstant() {
    return this.hasAttribute("data-instantly");
  }

  get mediaElements() {
    return Array.from(this.querySelectorAll("img, iframe, svg"));
  }

  get animationType() {
    return this.dataset.motion || "fade-up";
  }

  get animationDelay() {
    return parseInt(this.dataset.motionDelay || 0) / 1000;
  }

  set animationDelay(value) {
    this.dataset.motionDelay = value;
  }

  preInitialize() {
    if (this.isHold) return;
    switch (this.animationType) {
      case "fade-in":
        Motion.animate(this, { opacity: 0.01 }, { duration: 0 });
        break;

      case "fade-up":
        Motion.animate(
          this,
          { transform: "translateY(2.5rem)", opacity: 0.01 },
          { duration: 0 }
        );
        break;

      case "fade-up-sm":
        Motion.animate(
          this,
          { transform: "translateY(1rem)", opacity: 0.01 },
          { duration: 0 }
        );
        break;

      case "fade-up-lg":
        Motion.animate(
          this,
          { transform: "translateY(4rem)", opacity: 0.01 },
          { duration: 0 }
        );
        break;

      case "zoom-in":
        Motion.animate(this, { transform: "scale(0.8)" }, { duration: 0 });
        break;
      case "zoom-in-lg":
        Motion.animate(this, { transform: "scale(0)" }, { duration: 0 });
        break;

      case "zoom-out":
        Motion.animate(this, { transform: "scale(1.07)" }, { duration: 0 });
        break;

      case "zoom-out-sm":
        Motion.animate(this, { transform: "scale(1.07)" }, { duration: 0 });
        break;
      case "zoom-out-lg":
        Motion.animate(this, { transform: "scale(1.07)" }, { duration: 0 });
        break;
    }
  }

  async initialize() {
    if (this.isHold) return;
    switch (this.animationType) {
      case "fade-in":
        await Motion.animate(
          this,
          { opacity: 1 },
          { duration: 1.5, delay: this.animationDelay, easing: this.transition }
        ).finished;
        break;

      case "fade-up":
        await Motion.animate(
          this,
          { transform: "translateY(0)", opacity: 1 },
          {
            duration: 0.5,
            delay: this.animationDelay,
            easing: this.transition,
          }
        ).finished;
        break;

      case "fade-up-sm":
        await Motion.animate(
          this,
          { transform: "translateY(0)", opacity: 1 },
          {
            duration: 0.3,
            delay: this.animationDelay,
            easing: this.transition,
          }
        ).finished;
        break;

      case "fade-up-lg":
        await Motion.animate(
          this,
          { transform: "translateY(0)", opacity: 1 },
          {
            duration: 0.5,
            delay: this.animationDelay,
            easing: this.transition,
          }
        ).finished;
        break;

      case "zoom-in":
        await Motion.animate(
          this,
          { transform: "scale(1)" },
          { duration: 1.3, delay: this.animationDelay, easing: this.transition }
        ).finished;
        break;

      case "zoom-in-lg":
        await Motion.animate(
          this,
          { transform: "scale(1)" },
          { duration: 0.5, delay: this.animationDelay, easing: this.transition }
        ).finished;
        break;

      case "zoom-out":
        await Motion.animate(
          this,
          { transform: "scale(1)" },
          { duration: 1.5, delay: this.animationDelay, easing: this.transition }
        ).finished;
        break;

      case "zoom-out-sm":
        await Motion.animate(
          this,
          { transform: "scale(1)" },
          { duration: 1, delay: this.animationDelay, easing: this.transition }
        ).finished;
        break;
      case "zoom-out-lg":
        await Motion.animate(
          this,
          { transform: "scale(1)" },
          { duration: 1, delay: this.animationDelay, easing: this.transition }
        ).finished;
        break;
    }
  }
  refreshAnimation() {
    this.removeAttribute("hold");
    this.preInitialize();
    setTimeout(() => {
      this.initialize();
    }, 50); // Delay a bit to make animation re init properly.
  }
}
customElements.define("motion-element", MotionElement);

class SlideSection extends HTMLElement {
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
    const progressbar = _this?.dataset.paginationProgressbar === "true";
    const autoItem = _this?.dataset.itemMobile === "true";
    const autoHeight = _this?.dataset.autoHeight === "true";
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
    if (direction == "vertical") {
      _this.style.maxHeight = _this.offsetHeight + "px";
    }
    this.globalSlide = new Swiper(_this, {
      slidesPerView: autoItem ? "auto" : itemMobile,
      spaceBetween: spacing >= 15 ? 15 : spacing,
      autoplay: autoplaying,
      direction: direction,
      loop: loop,
      effect: effect,
      autoHeight: autoHeight,
      speed: speed,
      watchSlidesProgress: true,
      watchSlidesVisibility: true,
      grabCursor: true,
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
        el:
          _this.querySelector(".parent-pagination") ||
          _this.querySelector(".swiper-pagination"),
        type: progressbar ? "progressbar" : "bullets",
      },
      breakpoints: {
        768: {
          slidesPerView: itemTablet,
          spaceBetween: spacing >= 30 ? 30 : spacing,
          type: progressbar ? "progressbar" : "bullets",
          autoHeight: false,
        },
        1025: {
          slidesPerView: itemDesktop,
          spaceBetween: spacing,
          type: progressbar ? "progressbar" : "bullets",
          autoHeight: false,
        },
      },
      thumbs: {
        swiper: this.thumbnailSlide ? this.thumbnailSlide : null,
      },

      on: {
        init: function (e) {
          var sec__tiktok = _this.closest(".sec__tiktok-video");
          if (_this.classList.contains("slideshow")) {
            const motionElement = _this.querySelectorAll(
              `.swiper-slide.swiper-slide-active  motion-element.effect_fadeinup`
            );
            setTimeout(() => {
              motionElement &&
                motionElement.forEach((item) => {
                  item.refreshAnimation();
                });
            }, 350);
          }
          var slide_visibles = _this.querySelectorAll(
            ".swiper-slide:not(.swiper-slide-visible) motion-element:not([data-image]),motion-element.swiper-slide:not(.swiper-slide-visible)"
          );
          slide_visibles?.forEach((slide) => {
            if (slide && typeof slide.initialize === "function") {
              slide.initialize();
            }
          });
          e.autoplay.stop();
          if (_this?.dataset.autoplay === "true") {
            Motion.inView(
              _this,
              async () => {
                e.autoplay.start();
              },
              { margin: "0px 0px -50px 0px" }
            );
          }

          if (sec__tiktok) {
            _this.initSecTiktok(sec__tiktok);
            window.addEventListener("resize", function () {
              setTimeout(() => {
                _this.initSecTiktok(sec__tiktok);
              }, 150);
            });
          }
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
          var video = _this.querySelector("video.slideshow");
          if (video) {
            const handleIntersection = (entries, observer) => {
              if (!entries[0].isIntersecting) return;
              observer.unobserve(_this);
              const videos = _this.querySelectorAll("video");
              videos.forEach((video) => {
                const dataSrc = video.dataset.src;
                if (dataSrc) {
                  video.src = dataSrc;
                  video.removeAttribute("data-src");
                }
              });
            };
            new IntersectionObserver(handleIntersection.bind(_this), {
              rootMargin: "0px 0px 200px 0px",
            }).observe(_this);
          }
        },
        realIndexChange: function (swiper) {
          if (_this?.dataset.autoplay) {
            var slide_visibles = _this.querySelectorAll(
              ".swiper-slide motion-element:not([data-image])"
            );
            slide_visibles?.forEach((slide) => {
              if (!slide.hasAttribute("hold")) {
                slide?.setAttribute("hold", true);
              }
            });
          } else {
            var slide_visibles = _this.querySelectorAll(
              ".swiper-slide motion-element:not([data-image])"
            );
            slide_visibles?.forEach((slide) => {
              if (!slide.hasAttribute("hold")) {
                slide?.setAttribute("hold", true);
              }
            });
          }

          setTimeout(() => {
            if (_this.classList.contains("slideshow")) {
              const motionElement = _this.querySelectorAll(
                `.swiper-slide.swiper-slide-active  motion-element.effect_fadeinup, .swiper-slide.swiper-slide-active  motion-element.motion-image`
              );
              motionElement &&
                motionElement.forEach((item) => {
                  item.refreshAnimation();
                });
            }
          }, 50);
        },
        slideChange: function () {
          const index_currentSlide = this.realIndex + 1;
          if (_this.closest(".sec__testimonials-single")) {
            const allDots = _this
              .closest(".sec__testimonials-single")
              .querySelectorAll(`single-item`);
            allDots.forEach((dot) => {
              dot.classList.remove("active");
            });
            _this
              .closest(".sec__testimonials-single")
              .querySelector(
                ".testimonials-author-image[data-position='" +
                  index_currentSlide +
                  "']"
              )
              .classList.add("active");
          }
        },
      },
    });
  }

  initSecTiktok(sec) {
    sec.querySelectorAll(".swiper-slide").forEach((arrow) => {
      const tiktok = arrow.querySelector(".section_tiktok-image");
      let width = "--item-width: " + arrow.offsetWidth;
      tiktok.setAttribute("style", width);
    });
  }
}
customElements.define("slide-section", SlideSection);

class PopupBase extends HTMLElement {
  constructor() {
    super();
    this.customClass = this.dataset.customClass;
    this.modal = null;
  }

  initPopup(content, text, customClass) {
    const _this = this;
    this.modal = new tingle.modal({
      footer: false,
      stickyFooter: false,
      closeMethods: ["overlay", "button", "escape"],
      cssClass: [this.customClass || customClass],
      onOpen: function () {
        document.dispatchEvent(new CustomEvent("modal:opened"));
        document.documentElement.classList.add("open-popup");
        root.style.setProperty(
          "padding-right",
          getScrollBarWidth.init() + "px"
        );
        const video = this.modalBox.querySelector("video");
        if (!video) return;
        video.play();
        if (this.modal.classList.contains("shopable-video")) {
          video.muted = false;
        }
      },
      onClose: function () {
        document.dispatchEvent(new CustomEvent("modal:closed"));
        document.documentElement.classList.remove("open-popup");
        root.style.removeProperty("padding-right");
      },
      beforeClose: function () {
        _this.onCloseEvent();
        document.documentElement.classList.remove("open-popup");
        root.style.removeProperty("padding-right");
        return true;
      },
    });
    this.modal.setHeader = function (content) {
      let popup_content = this.modalBoxContent;
      let popup_header = document.createElement("div");
      popup_header.classList.add("tingle-modal-box__header");
      popup_header.innerHTML = content;
      let parentElement = popup_content.parentNode;
      parentElement.insertBefore(popup_header, popup_content);
    };
    if (text) {
      this.modal.setHeader(text);
    }

    this.modal.setContent(content);
    this.modal.open();
  }

  onClose() {
    this.modal.close();
  }
  onCloseEvent() {}
}

class SwatchInit extends HTMLElement {
  constructor() {
    super();
    this.options = null;
    this.init();
  }

  init() {
    const _this = this;
    this.querySelectorAll(".product__color-swatches--js").forEach((btn) => {
      _this.checkSwatches(btn);
    });
  }
  checkSwatches(e) {
    const { color, image, customValue, swatchType, optionSwatchValue } =
      e.dataset;
    if (color) {
      if (swatchType != "variant_images") {
        if (optionSwatchValue.length == 0 || optionSwatchValue == null) {
          if (this.checkColor(color)) {
            e.style.backgroundColor = color;
            e.classList.add(customValue);
          } else {
            e.classList.add(customValue);
            if (image) {
              e.classList.add("color__" + color.replace(" ", "-"));
              e.style.backgroundColor = null;
              e.style.backgroundImage = "url('" + image + "')";
              e.style.backgroundSize = "cover";
              e.style.backgroundRepeat = "no-repeat";
            }
          }
        } else {
          e.style.setProperty("--swatch--background", optionSwatchValue);
        }
      } else {
        if (optionSwatchValue == null || optionSwatchValue.length == 0) {
          if (image) {
            e.classList.add("color__" + color.replace(" ", "-"));
            e.style.backgroundColor = null;
            e.style.backgroundImage = "url('" + image + "')";
            e.style.backgroundSize = "cover";
            e.style.backgroundRepeat = "no-repeat";
          } else if (this.checkColor(color)) {
            e.style.backgroundColor = color;
            e.classList.add(customValue);
          } else {
            e.classList.add(customValue);
          }
        } else {
          e.style.setProperty("--swatch--background", optionSwatchValue);
        }
      }
    }
  }
  checkColor(strColor) {
    var s = new Option().style;
    s.color = strColor;
    return s.color == strColor;
  }
  updateOptions() {
    this.options = Array.from(
      this.querySelectorAll(".product__color-swatches--js.active"),
      (select) => select.getAttribute("data-value")
    );
    this.variantData.find((variant) => {
      if (this.options.length == 1) {
        const variantOptions = {
          1: variant.option1,
          2: variant.option2,
          3: variant.option3,
        };
        if (variantOptions[this.position_swatch] === this.options[0]) {
          this.options = variant.options;
        }
      }
    });
  }
  updateMasterId(variantData) {
    return (this.currentVariant = variantData.find((variant) => {
      return !variant.options
        .map((option, index) => {
          return this.options[index] === option;
        })
        .includes(false);
    }));
  }
}

// js for 3d product - not done yet
class DeferredMedia extends HTMLElement {
  constructor() {
    super();
    const poster = this.querySelector('[id^="Deferred-Poster-"]');
    if (!poster) return;
    poster.addEventListener("click", this.loadContent.bind(this));
  }

  loadContent(focus = true) {
    window.pauseAllMedia();
    if (!this.getAttribute("loaded")) {
      const content = document.createElement("div");
      content.appendChild(
        this.querySelector("template").content.firstElementChild.cloneNode(true)
      );

      this.setAttribute("loaded", true);
      const deferredElement = this.appendChild(
        content.querySelector("video, model-viewer, iframe")
      );
      if (focus) deferredElement.focus();
      if (
        deferredElement.nodeName == "VIDEO" &&
        deferredElement.getAttribute("autoplay")
      ) {
        deferredElement.play();
      }
    }
  }
}

function handleErrorMessagePopup(errorMessage = false) {
  const url = `${window.location.pathname}?section_id=form-message`;
  fetch(url)
    .then((response) => response.text())
    .then((responseText) => {
      const html = new DOMParser().parseFromString(responseText, "text/html");
      const elementErrorMessage = html.querySelector(
        ".product-form__error-message-wrapper"
      );
      const elementMessage = elementErrorMessage.querySelector(
        ".product-form__error-message"
      );
      elementMessage.textContent = errorMessage;
      showToast(elementErrorMessage.innerHTML, 5000, "modal-error");
    })
    .catch((e) => {
      throw e;
    });
}

function showToast(message, duration = 3000, customClass = "") {
  let toastContainer = document.getElementById("toast-container");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "toast-container";
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement("div");
  toast.className = `toast show ${customClass}`;
  toast.innerHTML = message;
  toastContainer.appendChild(toast);

  Motion.animate(
    toast,
    {
      opacity: [0, 1],
      scale: [0.3, 1],
    },
    {
      duration: 0.3,
      easing: "ease-out",
    }
  );

  setTimeout(() => {
    closeToast(toast);
  }, duration);
}

function closeToast(toast) {
  Motion.animate(
    toast,
    { opacity: 0, scale: 0.5 },
    { duration: 0.2, easing: "ease-in" }
  ).then(() => {
    toast.remove();
  });
}

class SlideLazyLoad {
  constructor(e) {
    (this.triggerEventsJs = e),
      (this.eventOptionsJs = { passive: !0 }),
      (this.userEventListenerJs = this.triggerListenerJs.bind(this)),
      (this.delayedScriptsJs = { normal: [], async: [], defer: [] });
  }
  triggerListenerJs() {
    this._removeUserInteractionListenerJs(this),
      "loading" === document.readyState
        ? document.addEventListener(
            "DOMContentLoaded",
            this._loadEverythingReadyNow.bind(this)
          )
        : this._loadEverythingReadyNow();
  }
  _removeUserInteractionListenerJs(e) {
    this.triggerEventsJs.forEach((t) =>
      window.removeEventListener(t, e.userEventListenerJs, e.eventOptionsJs)
    );
  }
  _addUserInteractionListenerJs(e) {
    this.triggerEventsJs.forEach((t) =>
      window.addEventListener(t, e.userEventListenerJs, e.eventOptionsJs)
    );
  }
  _preloadAllScriptsJs() {
    document.body.classList.add("swiper-lazy");
    document.body.classList.add("review-lazy");
    const loadingSwiper = document.querySelectorAll(
      ".lazy-loading-swiper-after"
    );
    loadingSwiper.forEach((el) => {
      el.classList.remove("lazy-loading-swiper-after");
      this.initSlide(el);
    });
    const reviewProduct = document.querySelectorAll(".review-product-added");
    reviewProduct.forEach((el) => {
      el.classList.remove("review-product-added");
      el.innerHTML = el.querySelector(".product-review-json").innerHTML;
      el.classList.remove("inline-loading");
    });
  }

  initSlide(el) {
    const _this = el;
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
    const progressbar = _this?.dataset.paginationProgressbar === "true";
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
    if (direction == "vertical") {
      _this.style.maxHeight = _this.offsetHeight + "px";
    }
    _this.globalSlide = new Swiper(el, {
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
        el:
          _this.querySelector(".parent-pagination") ||
          _this.querySelector(".swiper-pagination"),
        type: progressbar ? "progressbar" : "bullets",
      },
      breakpoints: {
        768: {
          slidesPerView: itemTablet,
          spaceBetween: spacing >= 30 ? 30 : spacing,
          pagination: {
            type: progressbar ? "progressbar" : "bullets",
          },
        },
        1025: {
          slidesPerView: itemDesktop,
          spaceBetween: spacing,
          pagination: {
            type: progressbar ? "progressbar" : "bullets",
          },
        },
      },
      thumbs: {
        swiper: this.thumbnailSlide ? this.thumbnailSlide : null,
      },

      on: {
        init: function (e) {
          var slide_visibles = _this.querySelectorAll(
            ".swiper-slide:not(.swiper-slide-visible) motion-element:not([data-image]),motion-element.swiper-slide:not(.swiper-slide-visible)"
          );
          slide_visibles?.forEach((slide) => {
            slide?.initialize();
          });
          e.autoplay.stop();
          if (_this?.dataset.autoplay === "true") {
            Motion.inView(
              _this,
              async () => {
                e.autoplay.start();
              },
              { margin: "0px 0px -50px 0px" }
            );
          }
          var sec__tiktok = _this.closest(".sec__tiktok-video");
          if (sec__tiktok) {
            _this.initSecTiktok(sec__tiktok);
            window.addEventListener("resize", function () {
              setTimeout(() => {
                _this.initSecTiktok(sec__tiktok);
              }, 150);
            });
          }
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
        },
        realIndexChange: function (swiper) {
          var slide_visibles = _this.querySelectorAll(
            ".swiper-slide motion-element:not([data-image])"
          );
          slide_visibles?.forEach((slide) => {
            if (!slide.hasAttribute("hold")) {
              slide?.setAttribute("hold", true);
            }
          });
        },
        slideChange: function () {
          const index_currentSlide = this.realIndex + 1;
          if (_this.closest(".sec__testimonials-single")) {
            const allDots = _this
              .closest(".sec__testimonials-single")
              .querySelectorAll(`single-item`);
            allDots.forEach((dot) => {
              dot.classList.remove("active");
            });
            _this
              .closest(".sec__testimonials-single")
              .querySelector(
                ".testimonials-author-image[data-position='" +
                  index_currentSlide +
                  "']"
              )
              .classList.add("active");
          }
        },
      },
    });
  }

  async _loadEverythingReadyNow() {
    this._preloadAllScriptsJs(),
      await this._loadScriptsFromListJs(this.delayedScriptsJs.normal),
      await this._loadScriptsFromListJs(this.delayedScriptsJs.defer),
      await this._loadScriptsFromListJs(this.delayedScriptsJs.async),
      await this._triggerDOMContentLoadedJs(),
      await this._triggerWindowLoadJs(),
      window.dispatchEvent(new Event("glozinspeed-allScriptsLoaded"));
  }
  async _loadScriptsFromListJs(e) {
    const t = e.shift();
    return t
      ? (await this._transformScript(t), this._loadScriptsFromListJs(e))
      : Promise.resolve();
  }
  async _transformScript(e) {
    return (
      await this._requestAnimFrame(),
      new Promise((t) => {
        const s = document.createElement("script");
        let n;
        [...e.attributes].forEach((e) => {
          let t = e.nodeName;
          "type" !== t &&
            ("data-glozinlazy-type" === t && ((t = "type"), (n = e.nodeValue)),
            s.setAttribute(t, e.nodeValue));
        }),
          e.hasAttribute("src")
            ? (s.addEventListener("load", t), s.addEventListener("error", t))
            : ((s.text = e.text), t()),
          e.parentNode.replaceChild(s, e);
      })
    );
  }
  async _triggerDOMContentLoadedJs() {
    (this.domReadyFired = !0),
      await this._requestAnimFrame(),
      document.dispatchEvent(new Event("glozinspeed-DOMContentLoaded")),
      await this._requestAnimFrame(),
      window.dispatchEvent(new Event("glozinspeed-DOMContentLoaded")),
      await this._requestAnimFrame(),
      document.dispatchEvent(new Event("glozinspeed-readystatechange")),
      await this._requestAnimFrame(),
      document.glozinonreadystatechange && document.glozinonreadystatechange();
  }
  async _triggerWindowLoadJs() {
    await this._requestAnimFrame(),
      window.dispatchEvent(new Event("glozinspeed-load")),
      await this._requestAnimFrame(),
      window.glozinonload && window.glozinonload(),
      await this._requestAnimFrame(),
      window.dispatchEvent(new Event("glozinspeed-pageshow")),
      await this._requestAnimFrame(),
      window.glozinonpageshow && window.glozinonpageshow();
  }
  async _requestAnimFrame() {
    return new Promise((e) => requestAnimationFrame(e));
  }
  static run() {
    const e = new SlideLazyLoad([
      "keydown",
      "mousemove",
      "touchmove",
      "touchstart",
      "touchend",
      "wheel",
    ]);
    e._addUserInteractionListenerJs(e);
  }
}
SlideLazyLoad.run();

// js for copy button
class CopyButton extends HTMLElement {
  constructor() {
    super();
    this.content = this.dataset.content;
    this.init();
  }
  init() {
    if (this.content) {
      this.addEventListener("click", this.onClick.bind(this));
    }
  }
  onClick() {
    navigator.clipboard.writeText(this.content);
    this.classList.add("copied");
  }
  updateUrl(newContent) {
    this.content = newContent;
  }
}
customElements.define("copy-button", CopyButton);
