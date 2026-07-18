"use-strict";
import "./cart-components.js";

function initComparisons() {
  var x, i;
  x = document.getElementsByClassName("img-comp-overlay");
  for (i = 0; i < x.length; i++) {
    compareImages(x[i]);
  }
  function compareImages(img) {
    var slider,
      img,
      clicked = 0,
      w;
    w = img.offsetWidth;
    const icc = img.closest(".img-comp-container");
    if (icc) {
      slider = icc.querySelector(".image-comparison__button");
    }
    if (slider) {
      slider.addEventListener("touchstart", slideReady);
      slider.addEventListener("mousedown", slideReady);
    }
    window.addEventListener("mouseup", slideFinish);
    window.addEventListener("touchend", slideFinish);
    function slideReady(e) {
      e.preventDefault();
      clicked = 1;
      window.addEventListener("mousemove", slideMove);
      window.addEventListener("touchmove", slideMove);
    }
    function slideFinish() {
      clicked = 0;
    }
    function slideMove(e) {
      var pos;
      if (clicked == 0) return false;
      pos = getCursorPos(e);
      if (pos < 0) pos = 0;
      if (pos > w) pos = w;
      slide(pos);
    }
    function getCursorPos(e) {
      e = e.changedTouches ? e.changedTouches[0] : e;
      const a = img.getBoundingClientRect();
      let x = e.clientX - a.left + 14;
      x = Math.max(0, Math.min(x, w));

      return x;
    }

    function slide(x) {
      if (slider) {
        const sliderHalfWidth = slider.offsetWidth / 2;
        let percent = ((x - sliderHalfWidth) / w) * 100;
        let min = (sliderHalfWidth / icc.getBoundingClientRect().width) * 100;
        console.log(min - 0.1);
        percent = Math.max(min - 0.1, Math.min(percent, 100));
        img
          .closest(".img-comp-container")
          .setAttribute("style", "--percent: " + percent + "%;");
      }
    }
  }
}

initComparisons();
let resizeTimeout;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    initComparisons();
  }, 200);
});

function eventFlashingBrowseTab() {
  var enable = window.flashingBrowseTab?.enable,
    myTimer,
    message,
    titleTag = document.getElementsByTagName("title")[0],
    first_notification = window.flashingBrowseTab?.firstNotification,
    secondary_notification = window.flashingBrowseTab?.secondaryNotification;
  if (enable && titleTag) {
    var originalTitle = titleTag.innerText;
    var isActive = true;
    document.addEventListener("visibilitychange", () => {
      document.visibilityState === "visible"
        ? (function () {
            if (isActive) return;
            clearInterval(myTimer), (titleTag.innerText = originalTitle);
          })()
        : (function () {
            var i = 1;
            if (
              ((isActive = false),
              !first_notification || !secondary_notification)
            )
              return;
            myTimer = setInterval(function () {
              if (i == 1) {
                message = first_notification;
                i = 2;
              } else {
                message = secondary_notification;
                i = 1;
              }
              titleTag.innerText = message;
            }, 2000);
          })();
    });
  }
}
eventFlashingBrowseTab();

function initializeLazyLoad() {
  const videoPlaceholders = document.querySelectorAll(".lazy-video-link");
  const loadYouTubeVideo = (element) => {
    const videoId = element.getAttribute("data-video-id");
    const iframe = document.createElement("iframe");
    iframe.src = `https://www.youtube.com/embed/${videoId}?controls=0&autoplay=1&mute=1&playsinline=1&loop=1&playlist=${videoId}`;
    iframe.allowFullscreen = true;
    iframe.frameBorder = "0";
    iframe.allow =
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    element.innerHTML = "";
    element.appendChild(iframe);
  };
  const loadVimeoVideo = (element) => {
    const videoId = element.getAttribute("data-video-id");
    const iframe = document.createElement("iframe");
    iframe.src = `https://player.vimeo.com/video/${videoId}?controls=0background=1&autoplay=1&muted=1&loop=1`;
    iframe.allowFullscreen = true;
    iframe.allow = "autoplay; fullscreen; picture-in-picture";
    iframe.frameBorder = "0";
    element.innerHTML = "";
    element.appendChild(iframe);
  };
  const loadVideo = (element) => {
    const videoType = element.getAttribute("data-video-type");
    if (videoType === "youtube") {
      loadYouTubeVideo(element);
    } else if (videoType === "vimeo") {
      loadVimeoVideo(element);
    }
  };
  const lazyLoadVideos = () => {
    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          loadVideo(entry.target);
          observer.unobserve(entry.target);
        }
      });
    });
    videoPlaceholders.forEach((videoPlaceholder) => {
      observer.observe(videoPlaceholder);
    });
  };
  lazyLoadVideos();
}
initializeLazyLoad();

const slideAnime = (() => {
  let isAnimating = false;

  return (setOptions) => {
    const defaultOptions = {
      target: false,
      animeType: "slideToggle",
      duration: 250,
      easing: "ease",
      isDisplayStyle: "block",
      parent: false,
      addFunction: () => {},
    };
    const options = Object.assign({}, defaultOptions, setOptions);
    const target = options.target;
    const ownAnimate = options.ownAnimate;
    if (ownAnimate) {
      isAnimating = false;
    }
    const parent = options.parent;
    if (!target) {
      return;
    }

    if (isAnimating) {
      return;
    }
    isAnimating = true;
    parent.classList?.toggle("opened");

    let animeType = options.animeType;
    const styles = getComputedStyle(target);
    if (animeType === "slideToggle") {
      animeType = styles.display === "none" ? "slideDown" : "slideUp";
    }
    if (
      (animeType === "slideUp" && styles.display === "none") ||
      (animeType === "slideDown" && styles.display !== "none") ||
      (animeType !== "slideUp" && animeType !== "slideDown")
    ) {
      isAnimating = false;
      return false;
    }
    target.style.overflow = "hidden";
    const duration = options.duration;
    const easing = options.easing;
    const isDisplayStyle = options.isDisplayStyle;

    if (animeType === "slideDown") {
      target.style.display = isDisplayStyle;
    }
    const heightVal = {
      height: target.getBoundingClientRect().height + "px",
      marginTop: styles.marginTop,
      marginBottom: styles.marginBottom,
      paddingTop: styles.paddingTop,
      paddingBottom: styles.paddingBottom,
    };

    Object.keys(heightVal).forEach((key) => {
      if (parseFloat(heightVal[key]) === 0) {
        delete heightVal[key];
      }
    });
    if (Object.keys(heightVal).length === 0) {
      isAnimating = false;
      return false;
    }
    let slideAnime;
    if (animeType === "slideDown") {
      Object.keys(heightVal).forEach((key) => {
        target.style[key] = 0;
      });
      slideAnime = target.animate(heightVal, {
        duration: duration,
        easing: easing,
      });
    } else if (animeType === "slideUp") {
      Object.keys(heightVal).forEach((key) => {
        target.style[key] = heightVal[key];
        heightVal[key] = 0;
      });
      slideAnime = target.animate(heightVal, {
        duration: duration,
        easing: easing,
      });
    }
    slideAnime.finished.then(() => {
      options.addFunction();
      target.style.overflow = "";
      Object.keys(heightVal).forEach((key) => {
        target.style[key] = "";
      });
      if (animeType === "slideUp") {
        target.style.display = "none";
      }
      isAnimating = false;
    });
  };
})();

class CollectionOverviews extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.initSections();

    document.addEventListener("shopify:section:load", (event) => {
      if (this.contains(event.target)) {
        this.initSection(event.target);
      }
    });

    document.addEventListener("shopify:section:reorder", (event) => {
      if (this.contains(event.target)) {
        this.initSection(event.target);
      }
    });
  }

  initSections() {
    const sections = this.querySelectorAll(".section__block-inner");
    sections.forEach((section) => {
      this.initSection(section);
    });
  }

  initSection(section) {
    const blocks = section.querySelectorAll(".content-overview-block");
    const banners = section.querySelectorAll(".banner__media-collection");

    banners.forEach((banner) => {
      banner.classList.remove("active");
    });

    if (banners.length > 0) {
      banners[0].classList.add("active");
    }

    blocks.forEach((block) => {
      block.classList.remove("active");
    });

    if (blocks.length > 0) {
      blocks[0].classList.add("active");
    }

    blocks.forEach((block) => {
      block.addEventListener("mousemove", () => {
        const blockIndex = block.getAttribute("data-index");

        banners.forEach((banner) => {
          banner.classList.remove("active");
        });

        blocks.forEach((b) => {
          b.classList.remove("active");
        });

        const targetBanner = section.querySelector(
          `.banner__media-collection[data-index="${blockIndex}"]`
        );
        if (targetBanner) {
          targetBanner.classList.add("active");
        }

        block.classList.add("active");
      });
    });
  }
}

customElements.define("collection-overviews", CollectionOverviews);

class MultiContent extends SlideSection {
  constructor() {
    super();
    this.enable = this.dataset.enable;
    this.swiperSlideInnerHtml = this.innerHTML;
    this.init();
  }
  init() {
    if (this.enable == "true") {
      let width = window.innerWidth;
      window.addEventListener("resize", () => {
        const newWidth = window.innerWidth;
        if (newWidth <= 767 && width > 767) {
          this.actionOnMobile();
        }
        if (newWidth > 767 && width <= 767) {
          this.actionOutMobile();
        }
        width = newWidth;
      });
      if (width <= 576) {
        this.actionOnMobile();
      } else {
        this.actionOutMobile();
      }
    }
  }
  actionOnMobile() {
    this.classList.add("swiper");
    const html = this.swiperSlideInnerHtml.replaceAll(
      "section__block",
      "swiper-slide"
    );
    const wrapper = `<div class='swiper-wrapper'>${html}</div> <div
    class="swiper-pagination  ${
      this.enable && this.dataset.mobile != 1.5 ? "flex" : "hidden"
    } px-15 lh-1 bottom-30 justify-content-center"
    style="--swiper-pagination-bottom: 3rem;--swiper-pagination-position: static;"
  ></div> `;
    this.innerHTML = wrapper;
    this.initSlide();
  }
  actionOutMobile() {
    if (this.classList.contains("swiper")) {
      this.classList.remove("swiper");
      this.innerHTML = this.swiperSlideInnerHtml;
    }
  }
}
customElements.define("multi-content", MultiContent);
var wishlistHeader = (function () {
  return {
    init: function () {
      this.handleCount();
    },
    handleCount: function () {
      const wishlist = document.querySelectorAll(".wishlist-count");
      const items = JSON.parse(localStorage.getItem("glozin__wishlist-items"));
      wishlist.forEach((item) => {
        item.innerText = items !== null && items.length != 0 ? items.length : 0;
      });
    },
  };
})();
wishlistHeader.init();

function HoverIntent(exitTime, elements, userConfig) {
  const defaultOptions = {
    exitDelay: exitTime,
    interval: 100,
    sensitivity: 6,
  };
  let config = {};
  let currX, currY, prevX, prevY;
  let allElems, pollTimer, exitTimer;
  const extend = function (defaults, userArgs) {
    for (let i in userArgs) {
      defaults[i] = userArgs[i];
    }
    return defaults;
  };
  const mouseTrack = function (ev) {
    currX = ev.pageX;
    currY = ev.pageY;
  };
  const mouseCompare = function (targetElem) {
    const distX = prevX - currX,
      distY = prevY - currY;
    const distance = Math.sqrt(distX * distX + distY * distY);
    if (distance < config.sensitivity) {
      clearTimeout(exitTimer);
      for (let elem of allElems) {
        if (elem.isActive) {
          config.onExit(elem);
          elem.isActive = false;
        }
      }
      config.onEnter(targetElem);
      targetElem.isActive = true;
    } else {
      prevX = currX;
      prevY = currY;
      pollTimer = setTimeout(function () {
        mouseCompare(targetElem);
      }, config.interval);
    }
  };
  const init = function (exitTime, elements, userConfig) {
    if (!userConfig || !userConfig.onEnter || !userConfig.onExit) {
      throw "onEnter and onExit callbacks must be provided";
    }
    config = extend(defaultOptions, userConfig);
    allElems = elements;
    for (let elem of allElems) {
      if (!elem) return;
      elem.isActive = false;
      elem.addEventListener("mousemove", mouseTrack);
      elem.addEventListener("mouseenter", function (ev) {
        prevX = ev.pageX;
        prevY = ev.pageY;
        if (elem.isActive) {
          clearTimeout(exitTimer);
          return;
        }
        pollTimer = setTimeout(function () {
          mouseCompare(elem);
        }, config.interval);
      });
      elem.addEventListener("mouseleave", function (ev) {
        clearTimeout(pollTimer);
        if (!elem.isActive) return;
        exitTimer = setTimeout(function () {
          config.onExit(elem);
          elem.isActive = false;
        }, config.exitDelay);
      });
    }
  };
  init(exitTime, elements, userConfig);
}

let BlsMainMenuShopify = (function () {
  return {
    init: function () {
      this.initMenu();
      this.initMainMenu();
      this.initMobileMenu();
      this.initVerticalMenu();
    },

    initMenu: function () {
      const header = document.querySelector("header");
      if (!header) return;

      // Cache DOM elements
      const elements = {
        categoriesListMenuMobile: document.querySelector(
          ".categories-list-menu-mobile"
        ),
        categoriesListMenu: document.querySelector(
          '[data-menu="categories-list"]'
        ),
        categoriesListMenuVertical: document.querySelector(
          '[data-menu="verticalmenu-list"]'
        ),
        categoriesListMenuVerticalMobile: document.querySelector(
          ".verticalmenu-mobile"
        ),
        horizontalList: document.querySelector("nav.mobile .horizontal-list"),
      };

      // Calculate section padding bottom value
      const sectionPbValue = this.calculateSectionPadding(header);

      // Initialize fade-in-down animation if present
      this.initFadeInDownAnimation(header, sectionPbValue);

      // Handle menu tab switching
      this.setupMenuTabSwitching(elements);

      // Initialize menu tab state based on window width
      this.updateMenuTabState(elements);
      this.updateMenuVerticalMobile(elements);

      // Add resize event listener for responsive behavior
      window.addEventListener("resize", () =>
        this.updateMenuTabState(elements)
      );
      window.addEventListener("resize", () =>
        this.updateMenuVerticalMobile(elements)
      );
    },

    calculateSectionPadding: function (header) {
      let sectionPbValue = parseInt(
        getComputedStyle(header).getPropertyValue("--section-pb").trim()
      );
      if (header.querySelector(".header__layout-2")) {
        sectionPbValue = 0;
      }
      return sectionPbValue;
    },

    initFadeInDownAnimation: function (header, sectionPbValue) {
      const fadeInDown = document.querySelector(".fade-in-down");
      if (!fadeInDown) {
        // Simple hover intent for non-fade-in menus
        this.setupSimpleHoverIntent(180, ".menu-parent__horizontal");
        return;
      }

      HoverIntent(180, document.querySelectorAll(".menu-parent__horizontal"), {
        onEnter: (targetItem) =>
          this.handleMenuEnter(targetItem, header, sectionPbValue),
        onExit: (targetItem) => this.handleMenuExit(targetItem, header),
      });
    },

    setupSimpleHoverIntent: function (time, selector) {
      HoverIntent(time, document.querySelectorAll(selector), {
        onEnter: function (targetItem) {
          targetItem.classList.add("visible");
        },
        onExit: function (targetItem) {
          targetItem.classList.remove("visible");
        },
      });
    },

    handleMenuEnter: function (targetItem, header, sectionPbValue) {
      const submenu = targetItem.querySelector(".submenu-horizontal");
      if (!submenu) return;

      const width = window.innerWidth;
      if (width < 1024) return;

      const sticky = header?.getAttribute("data-sticky");
      if (sticky == "on-scroll-up") {
        header.classList.add("open-submenu");
      }

      if (document.documentElement.classList.contains("open-search")) {
        this.handleMenuEnterWithSearchOpen(targetItem, submenu, sectionPbValue);
      } else {
        this.handleStandardMenuEnter(targetItem, submenu, header);
      }
    },

    handleStandardMenuEnter: function (targetItem, submenu, header) {
      const outerRect = header.getBoundingClientRect();
      const innerRect = targetItem.getBoundingClientRect();
      const heightScrollDown = outerRect.bottom - innerRect.bottom;

      Motion.animate(
        submenu,
        {
          y: ["-105%", heightScrollDown],
          visibility: ["hidden", "visible"],
        },
        {
          ease: [0.7, 0, 0.2, 1],
          duration: 0.35,
        }
      );

      targetItem.classList.add("visible");
      if (!header.classList.contains("border-bottom")) {
        header.classList.add("active");
      }
    },

    handleMenuEnterWithSearchOpen: function (
      targetItem,
      submenu,
      sectionPbValue
    ) {
      const ps = document.querySelector(".popup-search");
      const overlay_search = document.querySelector(".overlay_search");
      const sf = document.querySelector(".search-full");

      if (!ps || !overlay_search || !sf) return;

      overlay_search.classList.remove("open");
      let topCaculate = sf.getBoundingClientRect().bottom + 10;

      Promise.all([
        Motion.animate(
          ps,
          {
            y: [topCaculate, "-105%"],
            visibility: ["visible", "hidden"],
          },
          {
            ease: [0.7, 0, 0.2, 1],
            duration: 0.2,
          }
        ),
        Motion.animate(
          overlay_search,
          {
            opacity: [1, 0],
            visibility: ["visible", "hidden"],
          },
          {
            ease: [0.7, 0, 0.2, 1],
            duration: 0.2,
          }
        ),
      ]).then(() => {
        setTimeout(() => {
          // Update document classes
          if (document.documentElement.classList.contains("open-minicart")) {
            document.documentElement.classList.remove("open-search");
          } else {
            document.documentElement.classList.remove(
              "open-drawer",
              "open-search"
            );
            root.style.removeProperty("padding-right");
          }

          // Show submenu with animation
          Motion.animate(
            submenu,
            {
              y: ["-105%", sectionPbValue],
              visibility: ["hidden", "visible"],
            },
            {
              ease: [0.7, 0, 0.2, 1],
              duration: 0.35,
            }
          );
          targetItem.classList.add("visible");
        }, 20);
      });
    },

    handleMenuExit: function (targetItem, header) {
      const submenu = targetItem.querySelector(".submenu-horizontal");
      if (!submenu) return;

      const width = window.innerWidth;
      if (width < 1024) return;

      const sticky = header?.getAttribute("data-sticky");
      const outerRect = header.getBoundingClientRect();
      const innerRect = targetItem.getBoundingClientRect();
      const heightScrollDown = outerRect.bottom - innerRect.bottom;

      if (sticky == "on-scroll-up") {
        header.classList.remove("open-submenu");
      }

      Motion.animate(
        submenu,
        {
          y: [heightScrollDown, "-105%"],
          visibility: ["visible", "hidden"],
        },
        {
          ease: [0.7, 0, 0.2, 1],
          duration: 0.4,
        }
      );

      targetItem.classList.remove("visible");
      if (header.classList.contains("active")) {
        header.classList.remove("active");
      }
    },

    setupMenuTabSwitching: function (elements) {
      document.querySelectorAll(".menu-mobile-title a").forEach((tabToggle) => {
        tabToggle.addEventListener("click", (e) => {
          e.preventDefault();
          const target = e.currentTarget;
          const data = target.dataset.menu;

          // Reset active state on all tabs
          document
            .querySelectorAll(".menu-mobile-title a")
            .forEach((item) => item.classList.remove("active"));

          // Set current tab as active
          target.classList.add("active");

          // Show appropriate menu based on selected tab
          this.showMenuForTab(data, elements);
        });
      });
    },

    showMenuForTab: function (tabId, elements) {
      const { horizontalList, categoriesListMenuMobile } = elements;
      const categoriesListMenuVerticalMobile = document.querySelector(
        ".verticalmenu-mobile"
      );

      if (!horizontalList) return;

      // Hide horizontal list if we're showing a specific menu
      horizontalList.style.display =
        tabId !== "horizontal-list" ? "none" : "block";

      // Show appropriate menu based on tab
      if (tabId === "categories-list") {
        if (categoriesListMenuMobile)
          categoriesListMenuMobile.style.display = "block";
        if (categoriesListMenuVerticalMobile)
          categoriesListMenuVerticalMobile.style.display = "none";
      } else if (tabId === "verticalmenu-list") {
        if (categoriesListMenuMobile)
          categoriesListMenuMobile.style.display = "none";
        if (categoriesListMenuVerticalMobile)
          categoriesListMenuVerticalMobile.style.display = "block";
      } else {
        if (categoriesListMenuMobile)
          categoriesListMenuMobile.style.display = "none";
        if (categoriesListMenuVerticalMobile)
          categoriesListMenuVerticalMobile.style.display = "none";
      }
    },

    updateMenuVerticalMobile: function (elements) {
      const windowWidth = window.innerWidth;
      if (windowWidth <= 1024) {
        const headerVertical = document.querySelector(".header-vertical");
        const headerVerticalMobile = document.querySelector(
          ".verticalmenu-mobile"
        );
        const titleVertical = headerVerticalMobile?.dataset.title;
        const menuMobileTitle = document.querySelector(".menu-mobile-title");
        if (!headerVertical) return;
        if (!menuMobileTitle.querySelector('[data-menu="verticalmenu-list"]')) {
          const contentAppendTitleVertical = `
            <a
              class="no-underline heading-style py-10"
              data-menu="verticalmenu-list"
              role="link"
              aria-disabled="true"
            >
              ${titleVertical}
            </a>
          `;
          menuMobileTitle.insertAdjacentHTML(
            "beforeend",
            contentAppendTitleVertical
          );
          const newTabButton = menuMobileTitle.querySelector(
            '[data-menu="verticalmenu-list"]'
          );
          if (newTabButton) {
            newTabButton.addEventListener("click", (e) => {
              e.preventDefault();
              document
                .querySelectorAll(".menu-mobile-title a")
                .forEach((item) => item.classList.remove("active"));
              newTabButton.classList.add("active");
              this.showMenuForTab("verticalmenu-list", elements);
            });
          }
        }
        const wrapperVerticalmenu = document.querySelector(
          ".verticalmenu-mobile"
        );
        const navigationMenuContent = document.querySelector(
          ".navigation__menu-content-mobile"
        );
        if (!wrapperVerticalmenu || !navigationMenuContent) {
          return;
        }
        if (!navigationMenuContent.querySelector(".verticalmenu-mobile")) {
          const cloneWrapper = wrapperVerticalmenu.cloneNode(true);
          navigationMenuContent.appendChild(cloneWrapper);
        }
      }
    },

    updateMenuTabState: function (elements) {
      const windowWidth = window.innerWidth;
      const {
        horizontalList,
        categoriesListMenu,
        categoriesListMenuVertical,
        categoriesListMenuMobile,
        categoriesListMenuVerticalMobile,
      } = elements;

      if (!horizontalList || !categoriesListMenu) return;

      if (windowWidth <= 1024) {
        // Mobile view
        if (
          categoriesListMenu?.classList.contains("active") ||
          categoriesListMenuVertical?.classList.contains("active")
        ) {
          horizontalList.style.display = "none";
        }

        if (
          categoriesListMenuVerticalMobile &&
          categoriesListMenuVertical?.classList.contains("active")
        ) {
          categoriesListMenuVerticalMobile.style.display = "block";
        }
      } else {
        // Desktop view
        if (
          categoriesListMenuMobile &&
          categoriesListMenu?.classList.contains("active")
        ) {
          categoriesListMenuMobile.style.display = "none";
        }

        if (
          categoriesListMenuVerticalMobile &&
          categoriesListMenuVertical?.classList.contains("active")
        ) {
          categoriesListMenuVerticalMobile.style.display = "none";
        }

        if (
          categoriesListMenu?.classList.contains("active") ||
          categoriesListMenuVertical?.classList.contains("active")
        ) {
          horizontalList.style.display = "inline-flex";
        }
      }
    },

    initMainMenu: function () {
      const header = document.querySelector("header");
      if (!header) return;

      this.setupNavToggle();
      this.setupMenuMouseEvents();
      this.setupHeaderAttributes();
      this.initStickyHeader(header);
      this.initSubMenu();
    },

    setupNavToggle: function () {
      document.querySelectorAll(".nav-toggle").forEach((navToggle) => {
        navToggle.addEventListener("click", (e) => {
          const target = e.currentTarget;
          const main_menu = document.querySelector(".navigation.horizontal");

          if (document.documentElement.classList.contains("nav-open")) {
            // Close menu
            root.style.removeProperty("padding-right");
            document.documentElement.classList.remove(
              "nav-open",
              "open-drawer"
            );
            target.classList.remove("open");
            if (!main_menu) {
              document.documentElement.classList.remove("nav-verticalmenu");
            }
          } else {
            // Open menu
            root.style.setProperty(
              "padding-right",
              getScrollBarWidth.init() + "px"
            );
            document.documentElement.classList.add("nav-open", "open-drawer");
            target.classList.add("open");
            if (!main_menu) {
              document.documentElement.classList.add("nav-verticalmenu");
            }
          }
        });
      });
    },

    setupMenuMouseEvents: function () {
      let width = screen.width;
      if (width <= 1024) return;

      document
        .querySelectorAll("li.menu-parent .submenu")
        .forEach((menuItem) => {
          menuItem.addEventListener("mouseenter", (e) => {
            const target = e.currentTarget;
            target.closest(".menu-parent").classList.add("active-submenu");
          });

          menuItem.addEventListener("mouseleave", (e) => {
            const target = e.currentTarget;
            target.closest(".menu-parent").classList.remove("active-submenu");
          });
        });
    },

    setupHeaderAttributes: function () {
      // Calculate heights for CSS variables
      let announcement_bar =
        document.querySelector(".section-announcement-bar")?.clientHeight || 0;
      let top_bar =
        document.querySelector(".section-top-bar")?.clientHeight || 0;
      let headerpage = document.querySelector("header")?.clientHeight || 0;

      document
        .querySelector("body")
        .setAttribute(
          "style",
          `--height-bar: ${announcement_bar}px; --height-header: ${headerpage}px; --height-topbar: ${top_bar}px`
        );
    },

    initStickyHeader: function (header) {
      const sticky = header?.getAttribute("data-sticky");
      const sticky_mobile = header?.getAttribute("data-sticky-mobile");

      if (sticky === "none") return;
      if (sticky_mobile === "false" && window.innerWidth < 1025) return;

      // Setup header sticky behavior
      const headerSpaceH =
        document.getElementById("header-sticky")?.offsetHeight || 0;
      const announcement_bar =
        document.querySelector(".section-announcement-bar")?.clientHeight || 0;
      const top_bar =
        document.querySelector(".section-top-bar")?.clientHeight || 0;
      const headerh = announcement_bar + top_bar + headerSpaceH;
      this.lastScrollPosition = 0; // Initialize lastScrollPosition property
      const sec_header = header.closest(".section-header");

      if (!sec_header) return;

      if (sticky === "on-scroll-up") {
        sec_header.classList.add("scroll-up");
      }

      window.addEventListener("scroll", () => {
        if (header.classList.contains("open-submenu")) return;
        this.updateStickyHeader(sec_header, sticky, headerh);
      });
    },

    updateStickyHeader: function (sec_header, sticky, headerh) {
      let wpy = window.scrollY;

      if (sticky === "always") {
        // Always sticky behavior
        if (wpy > headerh) {
          sec_header.classList.add("shopify-section-header-sticky", "animate");
        } else {
          sec_header.classList.remove(
            "shopify-section-header-sticky",
            "animate"
          );
        }
      } else {
        // Scroll-up sticky behavior
        if (wpy > 0) {
          if (wpy > headerh) {
            sec_header.classList.add("scr-pass-header");

            if (wpy > this.lastScrollPosition) {
              sec_header.classList.add("shopify-section-header-hidden");
            } else {
              sec_header.classList.remove("shopify-section-header-hidden");
              sec_header.classList.add("animate");
            }
            sec_header.classList.add(
              "header-sticky",
              "shopify-section-header-sticky"
            );
            this.lastScrollPosition = wpy;
          } else {
            sec_header.classList.remove("header-sticky", "scr-pass-header");
            this.lastScrollPosition = 0;
          }
        } else {
          sec_header.classList.remove(
            "shopify-section-header-hidden",
            "header-sticky",
            "animate",
            "shopify-section-header-sticky"
          );
        }
      }
    },

    initSubMenu: function () {
      const main_menu = document.querySelector(".navigation.horizontal");
      if (!main_menu || window.innerWidth <= 1024) return;

      this.addCssSubMenu();

      window.addEventListener("resize", () => {
        if (window.innerWidth > 1024) {
          this.addCssSubMenu();
        }
      });
    },

    addCssSubMenu: function () {
      const bodyWidth =
        document.documentElement.clientWidth || document.body.clientWidth;
      const header = document.querySelector("header");
      const submenu_center = document.querySelector(".submenu-center");
      const width_sub_center = 800;

      if (!header || bodyWidth < 1024) return;

      const padding = 30;
      document
        .querySelectorAll(".horizontal-list .mega-menu-fix-width")
        .forEach((submenu) => {
          if (submenu_center) {
            // Handle center aligned submenu
            const submenu_data = submenu.getBoundingClientRect();
            const width = submenu_data.width;
            const left = submenu_data.left;
            const right = submenu_data.right;

            if (width_sub_center <= width) {
              const left_style = (left - (right - bodyWidth)) / 2;
              submenu.style.left = left_style + "px";
            }
          } else {
            // Handle default submenu positioning
            const elementWidth = submenu.clientWidth;
            const elementLeft = submenu.offsetLeft;

            if (bodyWidth - (elementWidth + elementLeft) < 0) {
              let left = bodyWidth - (elementWidth + elementLeft);
              left = left + elementLeft - padding;

              if (elementLeft < 0) {
                left = 0;
              }

              submenu.style.left = left + "px";
            }
          }
        });
    },

    initVerticalMenu: function () {
      const article = document.querySelector(".verticalmenu-html");
      if (!article) return;

      const verticalMenu = document.querySelector(".vertical-menu");
      if (!verticalMenu) return;
      verticalMenu.addEventListener("mouseenter", function () {
        setTimeout(function () {
          verticalMenu.classList.add("open-vertical");
        }, 150);
      });
      verticalMenu.addEventListener("mouseleave", function () {
        verticalMenu.classList.remove("open-vertical");
      });
      this.setupSimpleHoverIntent(1, ".menu-parent__vertical");
    },

    initMobileMenu: function () {
      // Reserved for mobile menu specific initialization
    },
  };
})();
BlsMainMenuShopify.init();
var BlsSearchShopify = (function () {
  return {
    init: function () {
      var predictive = document.querySelector("#predictive-search");
      if (predictive) {
        this.setupEventListeners();
      }
      const form = document.querySelector("#search-form");
      document.querySelectorAll(".top-search-toggle").forEach((navToggle) => {
        navToggle.onclick = (e) => {
          const target = e.currentTarget;
          if (!form.classList.contains("open")) {
            form.classList.add("open");
            target.classList.add("open");
            document.documentElement.classList.add(
              "open-drawer",
              "open-search"
            );
            root.style.setProperty(
              "padding-right",
              getScrollBarWidth.init() + "px"
            );
            setTimeout(function () {
              form.querySelector('input[type="search"]').focus();
            }, 100);
          } else {
            form.classList.remove("open");
            target.classList.remove("open");
            setTimeout(() => {
              document.documentElement.classList.remove("open-drawer");
              root.style.removeProperty("padding-right");
            }, 300);

            document.documentElement.classList.remove("open-search");
          }
        };
      });
      document.querySelectorAll(".btn-search-close").forEach((navToggle) => {
        navToggle.onclick = () => {
          form.classList.remove("open");
          document
            .querySelector(".dropdown-toggle .top-search-toggle")
            ?.classList.remove("open");
          document.documentElement.classList.remove("open-search");
          setTimeout(() => {
            document.documentElement.classList.remove("open-drawer");
            root.style.removeProperty("padding-right");
          }, 300);
        };
        const overlay_search = document.querySelector(".overlay_search");
        if (overlay_search) {
          overlay_search.onclick = () => {
            navToggle.click();
          };
        }
      });
      const sf = document.querySelector(".search-full");
      if (sf) {
        const hs = sf.closest(".header_search");
        var unSubcribeCloseCanvas;
        if (unSubcribeCloseCanvas) {
          unSubcribeCloseCanvas();
          unSubcribeCloseCanvas = null;
        }
        unSubcribeCloseCanvas = subscribe("closeCanvas", (data) => {
          if (document.documentElement.classList.contains("open-search")) {
            const width = window.innerWidth;
            const ps = document.querySelector(".popup-search");
            if (width >= 767.95 && ps) {
              this.closeDefaultSearch();
            }
          }
        });
        this._boundHandleClickSearch =
          this._boundHandleClickSearch || this.handleClickSearch.bind(this);

        document.removeEventListener("click", this._boundHandleClickSearch);

        document.addEventListener("click", this._boundHandleClickSearch);
      }
    },
    handleClickSearch: function (e) {
      const sf = document.querySelector(".search-full");
      const hs = sf.closest(".header_search");
      const ehs = e.target.closest(".header_search");

      const search_container = e.target.closest("header-search");

      if (ehs || search_container) {
        const ps = document.querySelector(".popup-search");
        const width = window.innerWidth;
        if (ps) {
          ps.classList.add("popup-search-show");
          if (document.documentElement.classList.contains("open-search")) {
            return;
          }
          if (width >= 767.95) {
            this.openDefaultSearch();
          }
        }
      } else {
        if (hs) {
          if (document.documentElement.classList.contains("open-search")) {
            const width = window.innerWidth;
            if (width >= 767.95) {
              this.closeDefaultSearch();
            } else {
              const form = document.querySelector("#search-form");
              form.classList.remove("open");
              if (
                document.documentElement.classList.contains("open-minicart")
              ) {
                document.documentElement.classList.remove("open-search");
              } else {
                document.documentElement.classList.remove(
                  "open-drawer",
                  "open-search"
                );
                root.style.removeProperty("padding-right");
              }
            }
          }
        }
      }
    },
    openDefaultSearch: function () {
      const headerNavigation = document.querySelector(
        ".header-bottom__navigation"
      );
      const headerTopActions = document.querySelector(".header-top__actions");
      const headerWrapper = document.querySelector("header");
      if (headerNavigation && headerWrapper) {
        const headerNavigationHeight = headerNavigation.offsetHeight;
        headerNavigation.style.opacity = "0";
        headerNavigation.style.transition = "opacity 0.3s ease";
        headerNavigation.style.display = "none";
        headerWrapper.style.marginBottom = `${headerNavigationHeight}px`;
      }
      const overlay_search = document.querySelector(".overlay_search");
      overlay_search.classList.add("open");
      const containsHeaderLayoutOne =
        document.querySelector(".header__layout-1");
      const containsHeaderLayoutTwo =
        document.querySelector(".header__layout-2");
      const containsHeaderLayoutThree =
        document.querySelector(".header__layout-3");
      const sf = document.querySelector(
        containsHeaderLayoutOne
          ? "header"
          : containsHeaderLayoutTwo
          ? "header-inner"
          : containsHeaderLayoutThree
          ? ".header-mega-store"
          : ".search-full"
      );
      let topCaculate = sf.getBoundingClientRect().bottom;
      const ps = document.querySelector(".popup-search");
      document.documentElement.classList.add("open-drawer");
      root.style.setProperty("padding-right", getScrollBarWidth.init() + "px");
      Promise.all([
        Motion.animate(
          ps,
          {
            y: ["-105%", topCaculate],
            visibility: ["hidden", "visible"],
          },
          {
            ease: [0.7, 0, 0.2, 1],
            duration: 0.4,
          }
        ),

        Motion.animate(
          overlay_search,
          {
            opacity: [0, 1],
            visibility: ["hidden", "visible"],
          },
          {
            ease: [0.7, 0, 0.2, 1],
            duration: 0.4,
          }
        ),
      ]).then(() => {
        setTimeout(() => {
          document.documentElement.classList.add("open-search");
        }, 20);
      });
    },

    closeDefaultSearch: function () {
      const headerNavigation = document.querySelector(
        ".header-bottom__navigation"
      );
      const headerWrapper = document.querySelector("header");
      const ps = document.querySelector(".popup-search");
      const sf = document.querySelector(".search-full");
      const overlay_search = document.querySelector(".overlay_search");
      overlay_search.classList.remove("open");
      ps.classList.remove("popup-search-show");
      let topCaculate = sf.getBoundingClientRect().bottom + 10;
      if (headerNavigation && headerWrapper) {
        headerNavigation.style.opacity = "";
        headerNavigation.style.transition = "";
        headerNavigation.style.display = "";
        headerWrapper.style.marginBottom = "";
      }
      Promise.all([
        Motion.animate(
          ps,
          {
            y: [topCaculate, "-105%"],
            visibility: ["visible", "hidden"],
          },
          {
            ease: [0.7, 0, 0.2, 1],
            duration: 0.4,
          }
        ),

        Motion.animate(
          overlay_search,
          {
            opacity: [1, 0],
            visibility: ["visible", "hidden"],
          },
          {
            ease: [0.7, 0, 0.2, 1],
            duration: 0.4,
          }
        ),
      ]).then(() => {
        setTimeout(() => {
          if (document.documentElement.classList.contains("open-minicart")) {
            document.documentElement.classList.remove("open-search");
          } else {
            document.documentElement.classList.remove(
              "open-drawer",
              "open-search"
            );
            root.style.removeProperty("padding-right");
          }
        }, 20);
      });
    },

    setupEventListeners: function () {
      const input = document.querySelector('input[type="search"]');
      const form = document.querySelector("form.search");
      if (!input || !form) return;
      form.addEventListener("submit", this.onFormSubmit.bind(this));
      input.addEventListener(
        "input",
        this.debounce((event) => {
          this.onChange(event);
        }, 300).bind(this)
      );
      input.addEventListener("focus", this.onFocus.bind(this));
      document.addEventListener("focusout", this.onFocusOut.bind(this));
      document.addEventListener("keyup", this.onKeyup.bind(this));
    },

    debounce: function (fn, wait) {
      let t;
      return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn.apply(this, args), wait);
      };
    },

    getQuery: function () {
      return document.querySelector('input[type="search"]').value.trim();
    },

    onChange: function () {
      const searchTerm = this.getQuery();

      if (!searchTerm.length) {
        this.close(true);
        return;
      }

      this.getSearchResults(searchTerm);
    },

    onFormSubmit: function (event) {
      if (
        !this.getQuery().length ||
        this.querySelector('[aria-selected="true"] a')
      )
        event.preventDefault();
    },

    onFocus: function () {
      const searchTerm = this.getQuery();
      if (!searchTerm.length) return;
      if (
        document
          .querySelector("#predictive-search")
          .classList.contains("results")
      ) {
        this.open();
      } else {
        this.getSearchResults(searchTerm);
      }
    },

    onFocusOut: function () {
      setTimeout(() => {
        if (!document.contains(document.activeElement)) this.close();
      });
    },

    onKeyup: function (event) {
      if (!this.getQuery().length) this.close(true);
      event.preventDefault();

      switch (event.code) {
        case "ArrowUp":
          this.switchOption("up");
          break;
        case "ArrowDown":
          this.switchOption("down");
          break;
        case "Enter":
          this.selectOption();
          break;
      }
    },

    switchOption: function (direction) {
      if (!this.getAttribute("open")) return;
      const moveUp = direction === "up";
      const selectedElement = document.querySelector('[aria-selected="true"]');
      const allElements = document.querySelectorAll("li");
      let activeElement = document.querySelector("li");

      if (moveUp && !selectedElement) return;

      this.statusElement.textContent = "";

      if (!moveUp && selectedElement) {
        activeElement = selectedElement.nextElementSibling || allElements[0];
      } else if (moveUp) {
        activeElement =
          selectedElement.previousElementSibling ||
          allElements[allElements.length - 1];
      }

      if (activeElement === selectedElement) return;

      activeElement.setAttribute("aria-selected", true);
      if (selectedElement) selectedElement.setAttribute("aria-selected", false);
      document
        .querySelector('input[type="search"]')
        .setAttribute("aria-activedescendant", activeElement.id);
    },

    selectOption: function () {
      const selectedProduct = document.querySelector(
        '[aria-selected="true"] a, [aria-selected="true"] button'
      );

      if (selectedProduct) selectedProduct.click();
    },

    getSearchResults: function (searchTerm) {
      const cachedResults = {};
      const queryKey = searchTerm.replace(" ", "-").toLowerCase();
      this.setLiveRegionLoadingState();
      if (cachedResults[queryKey]) {
        this.renderSearchResults(cachedResults[queryKey]);
        return;
      }
      var loading = document.querySelector(".search__loading-state");
      var collection_suggest = document.querySelector(".collection-suggest");

      if (collection_suggest) {
        collection_suggest.style.display = "none";
      }
      var section_id = "search-predictive-grid";
      if (document.querySelector(".predictive_search_suggest")) {
        var search_url = `${
          routes?.predictive_search_url
        }?q=${encodeURIComponent(
          searchTerm
        )}&resources[options][fields]=title,tag,vendor,product_type,variants.title,variants.sku&resources[options][prefix]=last&resources[options][unavailable_products]=last&resources[type]=query,product,collection,page,article&section_id=${section_id}`;
      } else {
        var search_url = `${routes.search_url}?q=${encodeURIComponent(
          searchTerm
        )}&options[prefix]=last&options[unavailable_products]=last&type=query,product,collection,page,article&section_id=${section_id}`;
      }
      fetch(`${search_url}`)
        .then((response) => {
          if (!response.ok) {
            var error = new Error(response.status);
            this.close();
            throw error;
          }
          return response.text();
        })
        .then((text) => {
          const resultsMarkup = new DOMParser()
            .parseFromString(text, "text/html")
            .querySelector("#shopify-section-" + section_id + "").innerHTML;
          cachedResults[queryKey] = resultsMarkup;
          this.renderSearchResults(resultsMarkup);
          BlsLazyloadImg.init();
        })
        .catch((error) => {
          this.close();
          throw error;
        });
    },

    setLiveRegionLoadingState: function () {
      document.querySelector("#search_mini_form").classList.add("loading");
      document.querySelector("#predictive-search").classList.add("loading");
    },

    setLiveRegionResults: function () {
      document.querySelector("#search_mini_form").classList.remove("loading");
      document.querySelector("#predictive-search").classList.remove("loading");
    },

    renderSearchResults: function (resultsMarkup) {
      document.querySelector("[data-predictive-search]").innerHTML =
        resultsMarkup;
      document.querySelector("#predictive-search").classList.add("results");
      if (document.querySelector(".search-not-sugges")) {
        document
          .querySelector(".search-not-sugges")
          .classList.remove("search-hidden");
        document.documentElement.classList.add("open-drawer", "open-search");
        root.style.setProperty(
          "padding-right",
          getScrollBarWidth.init() + "px"
        );
      }
      const quick_search = document.querySelector("#quick-search");
      if (quick_search) {
        quick_search.classList.add("hidden");
      }
      this.setLiveRegionResults();
      this.open();
    },

    open: function () {
      document
        .querySelector('input[type="search"]')
        .setAttribute("aria-expanded", true);
      this.isOpen = true;
    },

    close: function (clearSearchTerm = false) {
      if (clearSearchTerm) {
        document.querySelector('input[type="search"]').value = "";
        document
          .querySelector("#predictive-search")
          .classList.remove("results");
        if (document.querySelector(".search-not-sugges")) {
          document
            .querySelector(".search-not-sugges")
            .classList.add("search-hidden");
          document.documentElement.classList.remove(
            "open-drawer",
            "open-search"
          );
          root.style.removeProperty("padding-right");
        }

        const quick_search = document.querySelector("#quick-search");
        if (quick_search) {
          quick_search.classList.remove("hidden");
        }
      }
      const selected = document.querySelector('[aria-selected="true"]');
      if (selected) selected.setAttribute("aria-selected", false);
      document
        .querySelector('input[type="search"]')
        .setAttribute("aria-activedescendant", "");
      document
        .querySelector('input[type="search"]')
        .setAttribute("aria-expanded", false);
      this.resultsMaxHeight = false;
      document
        .querySelector("[data-predictive-search]")
        .removeAttribute("style");
      this.isOpen = false;
    },
  };
})();
BlsSearchShopify.init();
class HeaderSearch extends HTMLElement {
  constructor() {
    super();
    this.init();
  }
  init() {
    const _this = this;
    const header = document.querySelector("header");
    const button_search_default = document.querySelector(
      "#button_search_default"
    );
    if (
      header.classList.contains("popup-search-mobile") &&
      this.classList.contains("search_type_default")
    ) {
      let sectionId = "top-search";
      if (window.innerWidth <= 767) {
        _this.fetchUrl(
          `${window.location.pathname}?section_id=${sectionId}&type=popup&ajax=1`,
          "popup"
        );
        button_search_default.classList.add("top-search-toggle");
      }
      let width = window.innerWidth;
      window.addEventListener("resize", function () {
        const newWidth = window.innerWidth;

        if (newWidth <= 767 && width > 767) {
          const overlay_search = document.querySelector(".overlay_search");
          overlay_search.style.visibility = "hidden";
          overlay_search.style.opacity = 0;
          overlay_search.classList.remove("open");
          _this.fetchUrl(
            `${window.location.pathname}?section_id=${sectionId}&type=popup&ajax=1`,
            "popup"
          );
          button_search_default.classList.add("top-search-toggle");
        }
        if (newWidth > 767 && width <= 767) {
          button_search_default.classList.remove("top-search-toggle");
          _this.fetchUrl(
            `${window.location.pathname}?section_id=${sectionId}&type=default&ajax=1`
          );
          var popup_search_form_popup = document.querySelector(
            ".search__type-popup"
          );
          if (popup_search_form_popup) {
            popup_search_form_popup.style.display = "none";
          }
        }
        width = newWidth;
      });
    } else {
      let width = window.innerWidth;
      window.addEventListener("resize", function () {
        const newWidth = window.innerWidth;
        var popup_search_form_popup = document.querySelector(
          ".search__type-popup"
        );
        if (newWidth <= 767 && width > 767) {
          if (
            popup_search_form_popup &&
            !document.documentElement.classList.contains("open-search")
          ) {
            popup_search_form_popup.style.display = "none";
            setTimeout(() => {
              popup_search_form_popup.style.display = "block";
            }, 20);
          }
        }
        if (newWidth > 767 && width <= 767) {
          if (
            popup_search_form_popup &&
            !document.documentElement.classList.contains("open-search")
          ) {
            popup_search_form_popup.style.display = "none";
            setTimeout(() => {
              popup_search_form_popup.style.display = "block";
            }, 20);
          }
        }

        width = newWidth;
      });
    }
  }
  fetchUrl(url, type = "default") {
    var input = document.querySelector(".search__input");
    if (type == "default") {
      input.setAttribute("type", "search");
    } else {
      input.removeAttribute("type");
    }
    fetch(url)
      .then((response) => response.text())
      .then((responseText) => {
        const newSection = new DOMParser()
          .parseFromString(responseText, "text/html")
          .querySelector("header-search").innerHTML;
        document.querySelector("header-search").innerHTML = newSection;
      })
      .catch((e) => {
        throw e;
      })
      .finally(() => {
        if (document.documentElement.classList.contains("open-search")) {
          document.documentElement.classList.remove(
            "open-search",
            "open-drawer"
          );
        }
        BlsSearchShopify.init();
      });
  }
}

customElements.define("header-search", HeaderSearch);;
class QuantityInput extends HTMLElement {
  constructor() {
    super();
    this.input = this.querySelector("input");
    this.changeEvent = new Event("change", { bubbles: true });
    this.input.addEventListener("change", this.onInputChange.bind(this));
    this.querySelectorAll("button").forEach((button) =>
      button.addEventListener("click", this.onButtonClick.bind(this))
    );
  }

  quantityUpdateUnsubscriber = undefined;

  connectedCallback() {
    this.validateQtyRules();
    this.quantityUpdateUnsubscriber = subscribe(
      PUB_SUB_EVENTS.quantityUpdate,
      this.validateQtyRules.bind(this)
    );
  }

  disconnectedCallback() {
    if (this.quantityUpdateUnsubscriber) {
      this.quantityUpdateUnsubscriber();
    }
  }

  onInputChange() {
    this.validateQtyRules();
  }

  onButtonClick(event) {
    event.preventDefault();
    const previousValue = this.input.value;

    event.target.name === "plus" ||
    event.target.closest("button").name === "plus"
      ? this.input.stepUp()
      : this.input.stepDown();
    if (previousValue !== this.input.value)
      this.input.dispatchEvent(this.changeEvent);
  }

  validateQtyRules() {
    const value = parseInt(this.input.value);
    if (this.input.min) {
      const min = parseInt(this.input.min);
      const buttonMinus = this.querySelector(".quantity__button[name='minus']");
      buttonMinus.classList.toggle("disabled", value <= min);
    }
    if (this.input.max) {
      const max = parseInt(this.input.max);
      const buttonPlus = this.querySelector(".quantity__button[name='plus']");
      buttonPlus.classList.toggle("disabled", value >= max);
    }
  }
}

customElements.define("quantity-input", QuantityInput);

class ProgressBar extends HTMLElement {
  constructor() {
    super();
    const orders = this.dataset.order;
    this.init(orders);
  }
  init(orders) {
    const fe_unavaiable = this.dataset.feUnavaiable;
    const fe_avaiable = this.dataset.feAvaiable;
    const rate = Number(Shopify.currency.rate);
    const min = Number(this.dataset.feAmount);
    if (!min || !rate) return;
    const order = Number(orders) / 100;
    const min_by_currency = min * rate;
    if (order == undefined) return;
    if ((order / min_by_currency) * 100 > 100) {
      this.setProgressBar(100);
    } else {
      this.setProgressBar((order / min_by_currency) * 100);
    }
    this.setProgressBarTitle(
      order,
      min_by_currency,
      fe_unavaiable,
      fe_avaiable
    );
  }
  setProgressBarTitle(order, min_by_currency, fe_unavaiable, fe_avaiable) {
    const title = this.querySelector(".free-shipping-message");
    if (!title) return;
    title.classList.remove("opacity-0");
    if (order >= min_by_currency) {
      title.innerHTML = fe_avaiable;
    } else {
      const ammount = "{{ amount }}";
      title.innerHTML = fe_unavaiable.replace(
        ammount.trim(),
        Shopify.formatMoney(
          (min_by_currency - order) * 100,
          cartStrings.money_format
        )
      );
    }
  }
  setProgressBar(progress) {
    const p = this.querySelector(".progress");
    p.style.width = progress + "%";
    if (progress === 100) {
      this.classList.add("cart_shipping_free");
    } else {
      this.classList.remove("cart_shipping_free");
    }
  }
}
customElements.define("free-ship-progress-bar", ProgressBar);

class OpenChildrenToggle extends HTMLElement {
  constructor() {
    super();
    this.addEventListener("click", this.onToggle.bind(this), false);
  }
  onToggle() {
    const parent = this.parentElement;
    if (parent) {
      if (!parent.classList.contains("is-open")) {
        parent.classList.add("is-open");
      } else {
        parent.classList.remove("is-open");
      }
    }
  }
}
customElements.define("open-children-toggle", OpenChildrenToggle);

class CloseMenu extends HTMLElement {
  constructor() {
    super();
    this.addEventListener("click", this.onClose.bind(this), false);
  }
  onClose() {
    document.querySelector(".nav-toggle").classList.remove("open");
    document.querySelectorAll("menu-item").forEach((item) => {
      item.classList.remove("is-open");
    });
    document.documentElement.classList.remove("nav-open");
    setTimeout(() => {
      document.documentElement.classList.remove("open-drawer");
      root.style.removeProperty("padding-right");
    }, 400);
  }
}
customElements.define("close-menu", CloseMenu);

class ReviewProduct extends HTMLElement {
  constructor() {
    super();
    this.productHandle = this.dataset.productHandle;

    if (document.body.classList.contains("index")) {
      this.fetchDataReviewProduct();
      window.addEventListener("scroll", () => {
        this.fetchDataReviewProduct();
      });
      let pos = window.pageYOffset;
      if (pos > 0 || document.body.classList.contains("review-lazy")) {
        this.fetchDataReviewProduct();
      }
    } else {
      this.fetchDataReviewProduct();
    }
  }
  fetchDataReviewProduct() {
    if (!this.classList.contains("review-product-added")) {
      return;
    }
    this.classList.remove("review-product-added");
    this.innerHTML = this.querySelector(".product-review-json").innerHTML;
    this.classList.remove("inline-loading");
  }
}
customElements.define("review-product", ReviewProduct);

class BackMenu extends HTMLElement {
  constructor() {
    super();
    this.addEventListener("click", this.onBackMenu.bind(this), false);
  }
  onBackMenu() {
    if (this.classList.contains("back-lv1")) {
      this.closest(".level-1")
        .querySelector("menu-item")
        .classList.remove("is-open");
    } else {
      this.closest(".level0")
        .querySelector("menu-item")
        .classList.remove("is-open");
    }
  }
}
customElements.define("back-menu", BackMenu);

var BlsLoginPopup = (function () {
  return {
    init: function () {
      this.showLogin();
    },
    clickTab: function (modal) {
      const hidden = document.querySelectorAll("[data-login-hidden]");
      const show = document.querySelectorAll("[data-login-show]");
      const iTitle = document.querySelector("#login-popup .login-heading");
      show.forEach((e) => {
        var s = e?.dataset.loginShow;
        e.addEventListener("click", function (el) {
          el.preventDefault();
          hidden.forEach((eh) => {
            var h = eh?.dataset.loginHidden;
            if (eh.getAttribute("aria-hidden") === "true" && s === h) {
              eh.setAttribute("aria-hidden", "false");
              if (iTitle) {
                iTitle.innerText = s;
              }
            } else {
              eh.setAttribute("aria-hidden", "true");
            }
          });
        });
      });
    },
    showLogin: function () {
      const action = document.querySelector(".action-login-popup");
      const _this = this;
      if (action) {
        action.addEventListener("click", (e) => {
          e.preventDefault();
          _this.fetchDataLogin();
        });
      }
    },
    fetchDataLogin: function () {
      const url = `${window.location.pathname}?section_id=login-popup`;
      const _this = this;
      fetch(url)
        .then((response) => response.text())
        .then((responseText) => {
          const html = parser.parseFromString(responseText, "text/html");
          const content = html.querySelector("#login-popup");
          if (content) {
            const modal = new tingle.modal({
              footer: false,
              stickyFooter: false,
              closeMethods: ["overlay", "button", "escape"],
              closeLabel: "Close",
              cssClass: ["login-popup-modal"],
              onOpen: function () {},
              onClose: function () {},
              beforeOpen: function () {},
              beforeClose: function () {
                return true;
              },
            });
            modal.setContent(content);
            modal.open();

            document
              .querySelectorAll(".login__popup-button-close")
              .forEach((navToggle) => {
                navToggle.addEventListener(
                  "click",
                  (e) => {
                    e.preventDefault();
                    modal.close();
                  },
                  false
                );
              });
          }
          _this.clickTab();
        })
        .catch((e) => {
          throw e;
        });
    },
  };
})();
BlsLoginPopup.init();

class BackToTop extends HTMLElement {
  constructor() {
    super();
    this.addEventListener("click", this.backToTop.bind(this), false);
  }

  connectedCallback() {
    window.addEventListener("scroll", this.updateScrollPercentage.bind(this));
  }

  backToTop() {
    if (document.documentElement.scrollTop > 0 || document.body.scrollTop > 0) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }

  updateScrollPercentage() {
    const scrollHeight =
      document.documentElement.scrollHeight || document.body.scrollHeight;
    const scrollTop =
      document.documentElement.scrollTop || document.body.scrollTop;
    const clientHeight =
      document.documentElement.clientHeight || document.body.clientHeight;
    const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100;
    this.style.setProperty("--height", scrollPercentage.toFixed(2) + "%");
    if (scrollTop > 200) {
      this.classList.add("show");
    } else {
      this.classList.remove("show");
    }
  }
}
customElements.define("back-to-top", BackToTop);

class LocalizationForm extends HTMLElement {
  constructor() {
    super();
    this.elements = {
      input: this.querySelector(
        'input[name="language_code"], input[name="country_code"]'
      ),
      button: this.querySelector(".button-localization"),
      panel: this.querySelector("ul"),
    };
    this.elements.button.addEventListener(
      "click",
      this.openSelector.bind(this)
    );
    this.elements.button.addEventListener(
      "focusout",
      this.closeSelector.bind(this)
    );
    this.addEventListener("keyup", this.onContainerKeyUp.bind(this));
    this.querySelectorAll("a").forEach((item) =>
      item.addEventListener("click", this.onItemClick.bind(this))
    );
    this.onBodyClick = this.handleBodyClick.bind(this);
  }

  handleBodyClick(evt) {
    const target = evt.target;
    if (target != this && !target.closest("localization-form")) {
      this.hidePanel();
    }
  }

  hidePanel() {
    document.body.removeEventListener("click", this.onBodyClick);
    this.elements.button.classList.remove("open");
  }

  onContainerKeyUp(event) {
    if (event.code.toUpperCase() !== "ESCAPE") return;
    this.hidePanel();
    this.elements.button.focus();
  }

  onItemClick(event) {
    event.preventDefault();
    const form = this.querySelector("form");
    this.elements.input.value = event.currentTarget.dataset.value;
    if (form) form.submit();
  }

  openSelector() {
    if (this.elements.button.classList.contains("open")) {
      this.hidePanel();
    } else {
      document.body.addEventListener("click", this.onBodyClick);
      this.elements.button.focus();
      for (var item of document.querySelectorAll(".button-localization")) {
        item.classList.remove("open");
      }
      this.elements.button.classList.add("open");
    }
  }

  closeSelector(event) {
    const shouldClose =
      event.relatedTarget && event.relatedTarget.nodeName === "BUTTON";
    if (event.relatedTarget === null || shouldClose) {
      this.hidePanel();
    }
  }
}
customElements.define("localization-form", LocalizationForm);

class CollapsibleBlock extends HTMLElement {
  constructor() {
    super();
    const _this = this;
    const block = _this.querySelectorAll(".collapsible-heading");
    block.forEach((event) => {
      event.addEventListener("click", (e) => {
        const target = e.currentTarget;
        const parent = target.parentElement;
        const footerContent = parent.querySelector(".collapsible-content");
        if (
          _this.closest(".collection-filter") &&
          _this
            .closest(".collection-filter")
            .classList.contains("horizontal") &&
          window.innerWidth > 1024
        ) {
          if (!_this.classList.contains("active")) {
            if (document.querySelector("collapsible-block.active")) {
              document
                .querySelector("collapsible-block.active")
                .classList.remove("active");
            }
            _this.classList.add("active");
          } else {
            _this.classList.remove("active");
          }
        } else {
          slideAnime({
            target: footerContent,
            animeType: "slideToggle",
          });
          if (!_this.classList.contains("active")) {
            _this.classList.add("active");
          } else {
            _this.classList.remove("active");
          }
        }
      });
    });
    document.body.addEventListener("click", this.handleBodyClick.bind(this));
    if (this.classList.contains("collection")) {
      this.actionInMobile();
      window.addEventListener("resize", () => {
        this.actionInMobile();
      });
    }
  }

  actionInMobile() {
    var _this = this;
    var width = window.innerWidth;
    if (width <= 1024) {
      const footerContent = _this.querySelector(".collapsible-content");
      if (footerContent) footerContent.style.display = "block";
      _this.classList.add("active");
    }
  }

  handleBodyClick(evt) {
    const target = evt.target;
    if (
      target != this &&
      !target.closest("collapsible-block") &&
      document.querySelector(".collection-filter") &&
      document
        .querySelector(".collection-filter")
        .classList.contains("horizontal") &&
      window.innerWidth > 1024
    ) {
      const block = document
        .querySelector(".collection-filter")
        .querySelectorAll("collapsible-block");
      block.forEach((collapsible) => {
        collapsible.classList.remove("active");
      });
    }
  }
}
customElements.define("collapsible-block", CollapsibleBlock);

class StickyElement extends HTMLElement {
  constructor() {
    super();
    this.collapsibleHeading = this.querySelector(".collapsible-bundle");
    this.contentWrapper = this.querySelector(".bundle-items__wrapper");
    this.isOpen = true;
    this.isMobile = window.innerWidth <= 1024;
    this.init();
  }

  init() {
    if (this.isMobile) {
      this.setupCollapsible();
    }

    window.addEventListener("resize", this.onResize.bind(this));
  }

  setupCollapsible() {
    if (!this.collapsibleHeading || !this.contentWrapper) return;

    if (this.isMobile) {
      this.isOpen = false;
      this.contentWrapper.style.display = "none";
      this.classList.remove("opened");
    }

    if (!this.collapsibleHeading.hasEventListener) {
      this.collapsibleHeading.hasEventListener = true;
      this.collapsibleHeading.addEventListener(
        "click",
        this.toggleCollapse.bind(this)
      );
    }
  }

  toggleCollapse(event) {
    if (!this.isMobile) return;

    event.preventDefault();

    this.isOpen = !this.isOpen;

    slideAnime({
      target: this.contentWrapper,
      animeType: "slideToggle",
      parent: this,
    });
  }

  onResize() {
    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth <= 1024;

    if (wasMobile !== this.isMobile) {
      if (this.isMobile) {
        this.setupCollapsible();
      } else {
        if (this.contentWrapper) {
          this.contentWrapper.style.display = "block";
          this.contentWrapper.style.height = "auto";
        }
      }
    }
  }

  showContent() {
    if (this.isMobile && !this.isOpen && this.contentWrapper) {
      this.isOpen = true;
      slideAnime({
        target: this.contentWrapper,
        animeType: "slideDown",
        parent: this,
      });
      this.classList.add("opened");
    }
  }
}

customElements.define("sticky-element", StickyElement);

class AnnouncementBar extends HTMLElement {
  constructor() {
    super();
    const _this = this;
    const close = _this.querySelector(".announcement-bar-close");
    if (!close) {
      return;
    }
    close.addEventListener("click", (e) => {
      slideAnime({
        target: _this,
        animeType: "slideToggle",
      });
      sessionStorage.setItem("announcement_bar", "false");
    });
  }
}
customElements.define("announcement-bar", AnnouncementBar);

class VideoSection extends HTMLElement {
  constructor() {
    super();
    this.thumb = this.querySelector(".video-thumbnail");
    this.video_iframe = this.querySelector(".video-has-bg iframe");
    this.init();
  }

  init() {
    if (this.video_iframe) {
      this.video_iframe.addEventListener("load", () => {
        if (this.thumb) {
          this.thumb.remove();
        }
      });
    }
  }
}
customElements.define("video-section", VideoSection);

class AgeVerifier extends HTMLElement {
  constructor() {
    super();
    this.ageVerifyDetail = this.querySelector(".age-verify-detail");
    this.declineVerifyDetail = this.querySelector(".decline-verify-detail");
    this.init();
    this.mainFunction();
  }
  init() {
    const _this = this;
    if (!Shopify.designMode) {
      if (!getCookie("age_verifier")) {
        this.classList.add("active");
        this.declineVerifyDetail.classList.add("hidden");
        this.ageVerifyDetail.classList.remove("hidden");
      } else {
        if (getCookie("age_verifier") == "false") {
          this.classList.add("active");
          this.declineVerifyDetail.classList.remove("hidden");
          this.ageVerifyDetail.classList.add("hidden");
        } else {
          this.remove();
        }
      }
    }
  }

  mainFunction() {
    const approve = this.querySelector(".age-verifier-approve");
    const decline = this.querySelector(".age-verifier-decline");
    const returnBtn = this.querySelector(".age-verifier-return");
    if (returnBtn) {
      returnBtn.addEventListener("click", () => this.handleReturn());
    }

    if (!approve || !decline) return;
    approve.addEventListener("click", () => this.handleApprove());
    decline.addEventListener("click", () => this.handleDecline());
  }
  handleReturn() {
    if (!Shopify.designMode) {
      setCookie("age_verifier", "false", "-1");
      this.init();
    }
  }
  handleDecline() {
    if (!Shopify.designMode) {
      setCookie("age_verifier", "false", "365");
      this.init();
    }
  }
  handleApprove() {
    setCookie("age_verifier", "true", "false");
    this.classList.add("fadeOut");
    setTimeout(() => {
      this.remove();
    }, 1000);
  }
}
customElements.define("age-verifier", AgeVerifier);

class PromotionPopup extends HTMLElement {
  constructor() {
    super();
    setTimeout(() => {
      this.init();
    }, 15000);
  }

  init() {
    const _this = this;
    const s = _this?.dataset.show;
    const m = _this?.dataset.showMb === "true";
    if (!Shopify.designMode) {
      if (s === "show-on-all-pages" || s === "show-on-homepage") {
        if (getCookie("promotion-popup") === "") {
          const modal = new tingle.modal({
            footer: false,
            stickyFooter: false,
            closeMethods: ["overlay", "button", "escape"],
            closeLabel: "Close",
            cssClass: [
              `promotion-popup-modal`,
              `${m ? "enable-on-mobile" : "show-all"}`,
            ],
          });
          modal.setContent(_this.innerHTML);
          modal.open();
          _this.copyPromotion();
          _this.checkNotShowPromotion();
        }
      }
    }
  }
  checkNotShowPromotion() {
    const check = document.querySelector(
      ".promotion-popup-modal .do-not-show-again"
    );
    if (check) {
      check.addEventListener("click", (e) => {
        setCookie("promotion-popup", 1, 1);
        document
          .querySelector(".promotion-popup-modal .tingle-modal__close")
          .click();
      });
    }
  }
  copyPromotion() {
    const cp = document.querySelectorAll(".promotion-popup-modal .discount");
    if (cp !== null) {
      cp.forEach((e) => {
        e.addEventListener("click", (el) => {
          el.preventDefault();
          navigator.clipboard.writeText(e?.dataset.code);
          e.classList.add("action-copy");
          setTimeout(() => {
            e.classList.remove("action-copy");
          }, 1500);
        });
      });
    }
  }
}
customElements.define("promotion-popup", PromotionPopup);

class NewsletterPopup extends HTMLElement {
  constructor() {
    super();
    setTimeout(() => {
      this.init();
    }, 12000);
  }
  init() {
    const sectionId = this.dataset.sectionId;
    const url = `${window.location.pathname}?section_id=${sectionId}&ajax=1`;
    fetch(`${url}`)
      .then((response) => {
        if (!response.ok) {
          var error = new Error(response.status);
          throw error;
        }
        return response.text();
      })
      .then((responseText) => {
        const newSection = new DOMParser()
          .parseFromString(responseText, "text/html")
          .querySelector("newsletter-popup").innerHTML;
        document.querySelector("newsletter-popup").innerHTML = newSection;
      })
      .catch((error) => {
        throw error;
      })
      .finally(() => {
        this.initPopup();
      });
  }

  initPopup() {
    const _this = this;
    const s = _this?.dataset.show;
    const m = _this?.dataset.showMb === "true";
    if (!Shopify.designMode) {
      const cookie = getCookie("newsletter_popup");
      const width = window.innerWidth;
      if (!m && width < 768) {
        return false;
      }
      if ((s == "show_homepage" || s == "show_all_page") && cookie === "") {
        const modal = new tingle.modal({
          footer: false,
          stickyFooter: false,
          closeMethods: ["overlay", "button", "escape"],
          closeLabel: "Close",
          beforeOpen: function () {
            CloseAllPopup();
          },
          cssClass: [
            `newsletter-popup-modal`,
            `${m ? "show-all" : "disable-on-mobile"}`,
          ],
        });
        modal.setContent(_this.innerHTML);
        modal.open();
        _this.onShowNewletter();
      }
    }
  }

  onShowNewletter() {
    const _this = this;
    const setC = document.querySelector(
      ".newsletter-popup-modal .newsletter-popup__dont-show"
    );
    if (!setC) return;
    setC.addEventListener("click", _this.notShow.bind(_this));
    setC.addEventListener(
      "keypress",
      function (event) {
        if (event.key === "Enter") {
          _this.notShow.bind(_this)(event);
        }
      }.bind(_this),
      false
    );
  }

  notShow(e) {
    e.preventDefault();
    setCookie("newsletter_popup", 30, 1);
    document
      .querySelector(".newsletter-popup-modal .tingle-modal__close")
      .click();
  }
}
customElements.define("newsletter-popup", NewsletterPopup);

class TiktokVideo extends HTMLElement {
  constructor() {
    super();
    this.init();
  }
  init() {
    const _this = this;
    window.addEventListener("scroll", () => {
      let wpy = window.scrollY;
      if (wpy > 0) {
        this.scrollLazyloadVideo();
      }
    });
    let pos = window.pageYOffset;
    if (pos > 40) {
      this.scrollLazyloadVideo();
    }
  }

  scrollLazyloadVideo() {
    const _this = this;
    if (!_this.classList.contains("tiktok-loading")) {
      return;
    }
    _this.classList.remove("tiktok-loading");
    const sectionId = _this.dataset.sectionId;
    const url = `${window.location.pathname}?section_id=${sectionId}&ajax=1`;
    fetch(`${url}`)
      .then((response) => {
        if (!response.ok) {
          var error = new Error(response.status);
          throw error;
        }
        return response.text();
      })
      .then((responseText) => {
        const newSection = new DOMParser()
          .parseFromString(responseText, "text/html")
          .querySelector("tiktok-video").innerHTML;
        _this.innerHTML = newSection;
      })
      .catch((error) => {
        throw error;
      })
      .finally(() => {
        var script = document.createElement("script");
        script.type = "text/javascript";
        script.src = "https://www.tiktok.com/embed.js";
        document.body.appendChild(script);
      });
  }
}
customElements.define("tiktok-video", TiktokVideo);

var returnMessageWhenSubmit = (function () {
  return {
    init: function () {
      this.checkUrlReturn();
    },
    checkUrlReturn: function () {
      const getUrl = window.location.href;
      if (
        getUrl.indexOf("customer_posted=true#newsletter-form") >= 1 ||
        getUrl.indexOf("customer_posted=true") >= 1
      ) {
        this.handleMessageSuccessPopup();
        setCookie("newsletter_popup", 30, 1);
        const newURL = location.href.split("?")[0];
        window.history.pushState("object", document.title, newURL);
      }

      if (
        getUrl.indexOf("contact%5Btags%5D=newsletter&form_type=customer") >= 1
      ) {
        this.handleMessageErrorPopup();
        const newURL = location.href.split("?")[0];
        window.history.pushState("object", document.title, newURL);
      }
    },

    handleMessageSuccessPopup: function () {
      const url = `${window.location.pathname}?section_id=form-message`;
      fetch(url)
        .then((response) => response.text())
        .then((responseText) => {
          const html = new DOMParser().parseFromString(
            responseText,
            "text/html"
          );
          const elementSuccessMessage = html.querySelector(
            ".newsletter-form__success-message-wrapper"
          );
          showToast(elementSuccessMessage.innerHTML, 3000, "modal-success");
        })
        .catch((e) => {
          throw e;
        });
    },

    handleMessageErrorPopup: function () {
      const url = `${window.location.pathname}?section_id=form-message`;
      fetch(url)
        .then((response) => response.text())
        .then((responseText) => {
          const html = new DOMParser().parseFromString(
            responseText,
            "text/html"
          );
          const elementErrorMessage = html.querySelector(
            ".newsletter-form__error-message-wrapper"
          );
          const elementMessage = elementErrorMessage.querySelector(
            ".newsletter-form__message"
          );
          showToast(elementErrorMessage.innerHTML, 3000, "modal-error");
        })
        .catch((e) => {
          throw e;
        });
    },
  };
})();
returnMessageWhenSubmit.init();
class NavBar extends HTMLElement {
  constructor() {
    super();
    this.init();
  }
  init() {
    document.body.classList.add("mobi-navigation-bar");
  }
}
customElements.define("mobile-navigation-bar", NavBar);

class CarouselMobile extends SlideSection {
  constructor() {
    super();
    this.enable = this.dataset.enable;
    this.swiperSlideInnerHtml = this.innerHTML;
    this.init();
  }
  init() {
    if (this.enable == "true") {
      let width = window.innerWidth;
      window.addEventListener("resize", () => {
        const newWidth = window.innerWidth;
        if (newWidth <= 767 && width > 767) {
          this.actionOnMobile();
        }
        if (newWidth > 767 && width <= 767) {
          this.actionOutMobile();
        }
        width = newWidth;
      });
      if (width <= 767) {
        this.actionOnMobile();
      } else {
        this.actionOutMobile();
      }
    }
  }
  actionOnMobile() {
    this.classList.add("swiper");
    this.classList.remove("grid", "grid-cols");
    const html = this.swiperSlideInnerHtml.replaceAll(
      "sec__icon-switch-slide",
      "swiper-slide"
    );
    const wrapper = `<div class='swiper-wrapper'>${html}</div> <div
    class="swiper-pagination  ${
      this.enable && this.dataset.mobile != 1.5 ? "flex" : "hidden"
    } px-15 lh-1 bottom-30 justify-content-center"
    style="--swiper-pagination-bottom: 3rem;--swiper-pagination-position: static;"
  ></div> `;
    this.innerHTML = wrapper;
    this.initSlide();
  }
  actionOutMobile() {
    this.classList.remove("swiper");
    this.classList.add("grid", "grid-cols");
    this.innerHTML = this.swiperSlideInnerHtml;
  }
}
customElements.define("carousel-mobile", CarouselMobile);

class PaginateLoadmore extends HTMLElement {
  constructor() {
    super();
    this.initLoadMore();
    if (this.classList.contains("collection-infinite-scroll")) {
      this.querySelector("a").addEventListener(
        "click",
        async (e) => {
          this.toggleLoading(e.currentTarget, true);
          await new Promise((resolve, reject) => {
            setTimeout(() => {
              resolve();
              this.toggleLoading(e.currentTarget, false);
              this.remove();
            }, 400);
          });
          for (var item of document.querySelectorAll(
            ".sec__collections-list .collection-item.grid-custom-item"
          )) {
            item.classList.remove("hidden");
          }
          if (!this.hasAttribute("hold")) {
            Motion.animate(
              document.querySelectorAll(
                ".sec__collections-list .collection-item.grid-custom-item.trigger_slidein"
              ),
              {
                transform: ["translateY(3.5rem)", "translateY(0)"],
                opacity: [0.01, 1],
                visibility: ["hidden", "visible"],
              },
              {
                duration: 0.5,
                delay: Motion.stagger(0.1),
                easing: [0, 0, 0.3, 1],
              }
            );
          }
        },
        false
      );
    }
  }
  initLoadMore() {
    this.querySelectorAll(".actions-loadmore").forEach((loadMore) => {
      var _this = this;
      if (loadMore.classList.contains("infinit-scrolling")) {
        var observer = new IntersectionObserver(
          function (entries) {
            entries.forEach((entry) => {
              if (entry.intersectionRatio === 1) {
                _this.loadMoreItem(loadMore);
              }
            });
          },
          { threshold: 1.0 }
        );
        observer.observe(loadMore);
      } else {
        loadMore.addEventListener(
          "click",
          (event) => {
            event.preventDefault();
            const target = event.currentTarget;
            _this.loadMoreItem(target);
          },
          false
        );
      }
    });
  }
  loadMoreItem(target) {
    const loadMore_url = target.getAttribute("href");
    const _this = this;
    let sectionContainer = document.querySelector(`#product-grid`);
    sectionContainer?.classList.add("bls-image-js");
    _this.toggleLoading(target, true);
    fetch(`${loadMore_url}`)
      .then((response) => {
        if (!response.ok) {
          var error = new Error(response.status);
          throw error;
        }
        return response.text();
      })
      .then((responseText) => {
        const resultNodes = parser.parseFromString(responseText, "text/html");
        const resultNodesHtml = resultNodes.querySelectorAll(
          ".loadmore-lists .loadmore-item"
        );
        resultNodesHtml.forEach((prodNode) =>
          document.querySelector(".loadmore-lists").appendChild(prodNode)
        );
        const load_more = resultNodes.querySelector(".actions-loadmore");
        document.querySelector(".load-more-bar").innerHTML =
          resultNodes.querySelector(".load-more-bar").innerHTML;
        if (load_more) {
          target.setAttribute("href", load_more.getAttribute("href"));
        } else {
          target.remove();
        }
        _this.toggleLoading(target, false);
      })
      .catch((error) => {
        throw error;
      })
      .finally(async () => {
        initLazyloadItem();
        BlsLazyloadImg.init();
        setTimeout(() => {
          const grid_list = document.querySelector("grid-list");
          grid_list?.showGridItems();
        }, 100);
      });
  }
  toggleLoading(event, loading) {
    if (event) {
      const method = loading ? "add" : "remove";
      event.classList[method]("loading");
    }
  }
}
customElements.define("loadmore-button", PaginateLoadmore);

class SingleItem extends HTMLElement {
  constructor() {
    super();
    this.position = this.dataset.position;
    this.section = this.closest(".section-slide-single");
    this.init();
  }
  init() {
    this.addEventListener("click", this.onClick.bind(this));
  }
  onClick() {
    if (this.section && this.position) {
      const slideSEction = this.section.querySelector(`slide-section-single`);
      const allDots = this.section.querySelectorAll(`single-item`);
      allDots.forEach((dot) => {
        dot.classList.remove("active");
      });
      this.classList.add("active");
      if (slideSEction) {
        slideSEction.functionGoto(this.position);
      }
    }
  }
}
customElements.define("single-item", SingleItem);

class SlideSectionSingle extends SlideSection {
  constructor() {
    super();
    this.init();
  }
  init() {
    this.initSlide();
  }
  functionGoto(position) {
    this.globalSlide.slideToLoop(position - 1, 500);
  }
}
customElements.define("slide-section-single", SlideSectionSingle);
class VariantRadiosQuickEdit extends SwatchInit {
  constructor() {
    super();
    this.variantData = null;
    this.currentVariant = null;
    this.options = [];
    this.init();
  }

  init() {
    const swatchButtons = this.querySelectorAll(".product__color-swatches--js");
    swatchButtons.forEach((btn) => {
      this.checkSwatches(btn);
    });
    
    const optionSwatches = this.querySelectorAll(".option-swatch-js");
    optionSwatches.forEach((button) => {
      button.addEventListener(
        "click", 
        this.onVariantChange.bind(this), 
        false
      );
    });
  }

  onVariantChange(event) {
    event.preventDefault();
    const target = event.currentTarget;
    const value = target.getAttribute("data-value");
    for (var item of target
      .closest("fieldset")
      .querySelectorAll(".option-swatch-js")) {
      item.classList.remove("active");
    }
    target.classList.toggle("active");
    target
      .closest("fieldset")
      .querySelector(".swatch-selected-value").textContent = value;
    this.options = Array.from(
      this.querySelectorAll(".option-swatch-js.active"),
      (select) => select.getAttribute("data-value")
    );
    this.updateMasterId();
    this.toggleAddButton(true, "", false);
    this.updateVariantStatuses();
    if (!this.currentVariant) {
      this.toggleAddButton(true, "", true);
      this.setUnavailable();
    } else {
      this.updateMedia();
      this.updateVariantInput();
      this.renderProductInfo();
    }
  }

  updateMasterId() {
    this.currentVariant = this.getVariantData().find((variant) => {
      return !variant.options
        .map((option, index) => {
          return this.options[index] === option;
        })
        .includes(false);
    });
  }

  updateMedia() {
    if (!this.currentVariant) return;
    if (!this.currentVariant.featured_media) return;
    const form = document.getElementById(
      `product-form-quick-edit-${this.dataset.section}`
    );
    if (form.querySelector(".product__media img")) {
      form.querySelector(".product__media img").removeAttribute("srcset");
      form
        .querySelector(".product__media img")
        .setAttribute(
          "src",
          this.currentVariant.featured_media.preview_image.src
        );
    }
  }

  updateVariantInput() {
    const productForms = document.querySelectorAll(
      `#product-form-quick-edit-${this.dataset.section}`
    );
    productForms.forEach((productForm) => {
      const input = productForm.querySelector('input[name="id"]');
      input.value = this.currentVariant.id;
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });
  }

  renderProductInfo() {
    if (!this.currentVariant) return;
    const compare_at_price = this.currentVariant.compare_at_price;
    const current_price = this.currentVariant.price;
    const price_format = Shopify.formatMoney(
      this.currentVariant.price,
      cartStrings?.money_format
    );
    const form = document.getElementById(
      `product-form-quick-edit-${this.dataset.section}`
    );
    form.querySelector(".price-regular .price").innerHTML = price_format;
    const price = form.querySelector(".price");
    const cardPrice = form.querySelector(".card-product-price");
    price.classList.remove("price--sold-out", "price--on-sale");
    price
      .querySelector(".price-regular .price")
      .classList.remove("special-price");
    const cpp = cardPrice.querySelector(".compare-price");
    if (compare_at_price && compare_at_price > current_price) {
      const compare_format = Shopify.formatMoney(
        compare_at_price,
        cartStrings?.money_format
      );
      if (!price.querySelector(".compare-price")) {
        var ps = document.createElement("div");
        var sp = document.createElement("span");
        var cp = document.createElement("s");
        cp.classList.add("price-item", "compare-price");
        sp.appendChild(cp);
        ps.appendChild(sp);
        ps.classList.add("price-regular");
        cardPrice.appendChild(ps);
      }
      if (price.querySelector(".compare-price")) {
        price.querySelector(".compare-price").innerHTML = compare_format;
      }
      price.classList.add("price--on-sale");
      price
        .querySelector(".price-regular .price")
        .classList.add("special-price", "primary-color");
    } else {
      if (cpp) {
        cpp.innerHTML = "";
      }
      if (cardPrice.querySelector(".price-regular")) {
        cardPrice
          .querySelector(".price-regular")
          .classList.remove("primary-color");
      }
      if (cardPrice.querySelector(".price-regular .price")) {
        cardPrice.querySelector(".price-regular .price").innerHTML =
          price_format;
        cardPrice
          .querySelector(".price-regular .price")
          .classList.remove("price--special", "primary-color");
      }
    }
    if (!this.currentVariant.available) {
      price.classList.add("price--sold-out");
    }
    this.toggleAddButton(
      !this.currentVariant.available,
      window.variantStrings?.soldOut
    );
  }

  toggleAddButton(disable = true, text, modifyClass = true) {
    const productForm = document.getElementById(
      `product-form-quick-edit-${this.dataset.section}`
    );
    if (!productForm) return;
    const addButton = productForm.querySelector('[name="add"]');
    const addButtonText = productForm.querySelector('[name="add"] > span');
    const buttonPayment = productForm.querySelector(
      ".product-dynamic-checkout"
    );
    if (!addButton) return;

    if (disable) {
      addButton.setAttribute("disabled", "disabled");
      if (text) addButtonText.textContent = text;
    } else {
      addButton.removeAttribute("disabled");
      addButtonText.textContent = window.variantStrings?.addToCart;
    }

    if (!modifyClass) return;
  }

  setUnavailable() {
    const button = document.getElementById(
      `product-form-quick-edit-${this.dataset.section}`
    );
    const addButton = button.querySelector('[name="add"]');
    const addButtonText = button.querySelector('[name="add"] > span');
    const price = document.getElementById(`price-${this.dataset.section}`);
    if (!addButton) return;
    addButtonText.textContent = window.variantStrings?.unavailable;
    if (price) price.classList.add("visibility-hidden");
  }

  setAvailability(listOfOptions, listOfAvailableOptions) {
    listOfOptions.forEach((input) => {
      if (listOfAvailableOptions.includes(input.dataset.value)) {
        input.classList.remove("option-disabled");
      } else {
        input.classList.add("option-disabled");
      }
    });
  }

  updateVariantStatuses() {
    const selectedOptionOneVariants = this.getVariantData().filter(
      (variant) =>
        this.querySelector(".active").dataset.value === variant.option1
    );
    const inputWrappers = [...this.querySelectorAll(".product-form__input")];
    inputWrappers.forEach((option, index) => {
      if (index === 0) return;
      const optionInputs = [...option.querySelectorAll(".option-swatch-js")];
      const previousOptionSelected =
        inputWrappers[index - 1].querySelector(".active").dataset.value;
      const availableOptionInputsValue = selectedOptionOneVariants
        .filter(
          (variant) =>
            variant.available &&
            variant[`option${index}`] === previousOptionSelected
        )
        .map((variantOption) => variantOption[`option${index + 1}`]);
      this.setAvailability(optionInputs, availableOptionInputsValue);
    });
  }

  getVariantData() {
    this.variantData =
      this.variantData ||
      JSON.parse(this.querySelector('[type="application/json"]').textContent);
    return this.variantData;
  }
}
customElements.define("variant-radios-quick-edit", VariantRadiosQuickEdit);

class VariantRadiosBundle extends SwatchInit {
  constructor() {
    super();
    this.init();
  }

  init() {
    this.querySelectorAll(".product__color-swatches--js").forEach((btn) => {
      this.checkSwatches(btn);
      this.variantHover(btn);
    });
    this.querySelectorAll(".option-swatch-js").forEach((button) =>
      button.addEventListener("click", this.onVariantChange.bind(this), false)
    );
  }

  onVariantChange(event) {
    event.preventDefault();
    this.productTarget = this.closest(".product__item-js");
    const variantQtyData = JSON.parse(
      this.productTarget.querySelector(".productVariantsQty").textContent
    );
    const target = event.currentTarget;
    const value = target.getAttribute("data-value");
    for (var item of target
      .closest("fieldset")
      .querySelectorAll(".option-swatch-js")) {
      item.classList.remove("active");
    }
    target.classList.toggle("active");
    target
      .closest("fieldset")
      .querySelector(".swatch-selected-value").textContent = value;
    this.options = Array.from(
      this.querySelectorAll(".option-swatch-js.active"),
      (select) => select.getAttribute("data-value")
    );
    this.updateMasterId();
    this.toggleAddButton(true, "", false);
    this.updateVariantStatuses();
    if (!this.currentVariant) {
      this.toggleAddButton(true, "", true);
      this.setUnavailable();
    } else {
      this.updateVariantInput();
      this.renderProductInfo(this.productTarget, variantQtyData, target);
      this.updateMedia();
    }
  }

  updateMasterId() {
    this.currentVariant = this.getVariantData().find((variant) => {
      return !variant.options
        .map((option, index) => {
          return this.options[index] === option;
        })
        .includes(false);
    });
  }

  async updateMedia() {
    if (!this.currentVariant) return;
    if (
      !this.productTarget
        .querySelector(".product__media img")
        .classList.contains("hidden")
    ) {
      const productItem = this.productTarget
        .querySelector(".product__media img")
        .closest(".product-item");
      if (
        productItem.querySelector("video") ||
        productItem.querySelector("iframe")
      ) {
        this.productTarget
          .querySelector(".product__media img")
          .classList.add("hidden");
        productItem.querySelector("video")?.classList.remove("hidden");
        productItem.querySelector("iframe")?.classList.remove("hidden");
      }
    }
    if (!this.currentVariant.featured_media) return;
    if (this.productTarget.querySelector(".product__media img")) {
      this.productTarget
        .querySelector(".product__media img")
        .removeAttribute("srcset");
    }
    if (
      this.productTarget
        .querySelector(".product__media img")
        .classList.contains("hidden")
    ) {
      this.productTarget
        .querySelector(".product__media img")
        .classList.remove("hidden");
      const productItem = this.productTarget
        .querySelector(".product__media img")
        .closest(".product-item");
      if (
        productItem.querySelector("video") ||
        productItem.querySelector("iframe")
      ) {
        productItem.querySelector("video")?.classList.add("hidden");
        productItem.querySelector("iframe")?.classList.add("hidden");
      }
    }
    if (this.productTarget.querySelector(".product__media img")) {
      await Motion.animate(
        this.productTarget.querySelector(".product__media img"),
        { opacity: [1, 0] },
        { duration: 0.1, easing: "ease-in" }
      );
      this.productTarget
        .querySelector(".product__media img")
        .setAttribute(
          "src",
          this.currentVariant.featured_media.preview_image.src
        );
      await new Promise((resolve) => {
        this.productTarget.querySelector(".product__media img").onload = () => {
          resolve();
        };
      });
      Motion.animate(
        this.productTarget.querySelector(".product__media img"),
        { opacity: [0, 1] },
        { duration: 0.1, easing: "ease-in" }
      );
    }
  }

  updateVariantInput() {
    const productForms = document.querySelectorAll(
      `#quick-add-bundle-${this.dataset.section}`
    );
    productForms.forEach((productForm) => {
      const input = productForm.querySelector('input[name="id"]');
      input.value = this.currentVariant.id;
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });
  }

  renderProductInfo(productTarget, variantQtyData, target) {
    if (!this.currentVariant) return;
    if (!productTarget) return;
    let qty = 0;
    let percent = 0;
    let sale = false;
    let soldOut = false;
    let pre_order = false;
    let av = this.currentVariant.available;
    let im = this.currentVariant.inventory_management;
    const compare_at_price = this.currentVariant.compare_at_price;
    const current_price = this.currentVariant.price;
    let avaiable = productTarget.querySelector(".available-value");
    const price_format = Shopify.formatMoney(
      this.currentVariant.price,
      cartStrings?.money_format
    );
    const typePercent = productTarget.querySelector(
      ".product__badges-type-percent"
    );
    productTarget.querySelector(".price-regular .price").innerHTML =
      price_format;
    const price = productTarget.querySelector(".price");
    price.classList.remove("price--sold-out", "price--on-sale");
    productTarget
      .querySelector(".price-regular .price")
      .classList.remove("special-price");
    variantQtyData.find((variantQty) => {
      if (variantQty.id === this.currentVariant.id) {
        qty = variantQty.qty;
      }
    });
    if (compare_at_price && compare_at_price > current_price) {
      sale = true;
      if (typePercent) {
        percent = ((compare_at_price - current_price) / compare_at_price) * 100;
      } else {
        percent = compare_at_price - current_price;
      }

      const compare_format = Shopify.formatMoney(
        compare_at_price,
        cartStrings?.money_format
      );
      if (!price.querySelector(".compare-price")) {
        var ps = price.querySelector(".price__sale");
        var sp = document.createElement("span");
        var cp = document.createElement("s");
        cp.classList.add("price-item", "compare-price");
        sp.appendChild(cp);
        if (ps) {
          ps.appendChild(sp);
        }
      }
      if (price.querySelector(".compare-price")) {
        price.querySelector(".compare-price").innerHTML = compare_format;
      }
      price.classList.add("price--on-sale");
      productTarget
        .querySelector(".price-regular .price")
        .classList.add("special-price");
    } else if (!this.currentVariant.available) {
      price.classList.add("price--sold-out");
    }
    if (im === null) {
      soldOut = false;
      pre_order = false;
      if (avaiable) {
        avaiable.innerHTML = window.variantStrings.inStock;
      }
    } else {
      if (av) {
        if (qty < 1) {
          pre_order = true;
          if (avaiable) {
            avaiable.innerHTML = window.variantStrings.preOrder;
          }
        } else {
          soldOut = false;
          pre_order = false;
          if (avaiable) {
            avaiable.innerHTML = window.variantStrings.inStock;
          }
          if (avaiable) {
            avaiable.innerHTML = window.variantStrings.inStock;
          }
        }
      } else {
        soldOut = true;
        if (avaiable) {
          avaiable.innerHTML = window.variantStrings.outStock;
        }
      }
    }
    this.toggleAddButton(
      !this.currentVariant.available,
      window.variantStrings?.soldOut
    );

    this.renderLabel(sale, pre_order, soldOut, percent, productTarget);
  }

  renderLabel(sale, pre_order, soldOut, percent, productTarget) {
    const label = productTarget.querySelector(".product__badges");
    const sale_badge = productTarget.querySelector(".sale_badge");
    const productBadgesScrolling = productTarget.querySelector(
      ".product__badges-sale-scrolling"
    );
    if (sale || pre_order || soldOut) {
      if (!label) {
        var element = document.createElement("div");
        element.classList.add(
          "product__badges",
          "fs-small",
          "flex",
          "flex-wrap",
          "gap-5",
          "uppercase"
        );
        if (sale_badge) {
          sale_badge.appendChild(element);
        }
      }
    }

    if (label) {
      const saleColor = label.dataset.saleColor;
      const soldOutColor = label.dataset.soldOutColor;
      const preOrderColor = label.dataset.preOrderColor;
      const saleBg = label.dataset.saleBg;
      const soldOutBg = label.dataset.soldOutBg;
      const preOrderBg = label.dataset.preOrderBg;
      const show_sale = label?.dataset.showSale === "true";
      const show_pre_order = label?.dataset.showPreorder === "true";
      const show_sold_out = label?.dataset.showSoldOut === "true";
      const prd = Shopify.formatMoney(
        percent,
        themeGlobalVariables.settings.money_format
      );
      const dsale = label.querySelector(".product__badges-sale");
      const dsoldout = label.querySelector(".product__badges-sold-out");
      const dpreorder = label.querySelector(".product__badges-pre-order");
      const typePrice = label.querySelector(".product__badges-type-price");
      const typePercent = label.querySelector(".product__badges-type-percent");
      if (sale && show_sale) {
        if (!dsale) {
          var elementsale = document.createElement("div");
          elementsale.classList.add(
            "product__badges-sale",
            "product__badges-inner",
            "py-8",
            "px-15",
            "align-self-start",
            "sale",
            "inline-flex",
            "content-center",
            "subheading_weight",
            "btn-rounded",
            "lh-normal",
            "text-center"
          );
          elementsale.style.setProperty("--badges-color", saleColor);
          elementsale.style.setProperty("--badges-bg", saleBg);
          elementsale.innerHTML = `${
            window.variantStrings.save ? window.variantStrings.save : "Save"
          } ${prd}`;
          if (dsoldout) {
            label.insertBefore(elementsale, dsoldout);
          } else if (dpreorder) {
            label.insertBefore(elementsale, dpreorder);
          } else {
            label.appendChild(elementsale);
          }
        } else {
          if (typePrice) {
            dsale.innerHTML = `${
              window.variantStrings.save ? window.variantStrings.save : "Save"
            } ${prd}`;
          } else if (typePercent) {
            dsale.innerHTML = -percent.toFixed(0) + "%";
          }
        }
      } else {
        dsale?.remove();
      }
      if (pre_order && show_pre_order) {
        if (!dpreorder) {
          var elementpo = document.createElement("div");
          elementpo.classList.add(
            "product__badges-pre-order",
            "product__badges-inner",
            "py-8",
            "px-15",
            "align-self-start",
            "pre-order",
            "inline-flex",
            "content-center",
            "subheading_weight",
            "btn-rounded",
            "lh-normal",
            "text-center"
          );
          elementpo.style.setProperty("--badges-color", preOrderColor);
          elementpo.style.setProperty("--badges-bg", preOrderBg);
          elementpo.innerHTML = window.variantStrings.preOrder
            ? window.variantStrings.preOrder
            : "Pre-order";
          label.appendChild(elementpo);
        } else {
          dpreorder.innerHTML = window.variantStrings.preOrder
            ? window.variantStrings.preOrder
            : "Pre-order";
        }
      } else {
        dpreorder?.remove();
      }
      if (soldOut && show_sold_out) {
        if (!dsoldout) {
          var elementso = document.createElement("div");
          elementso.classList.add(
            "product__badges-sold-out",
            "product__badges-inner",
            "py-8",
            "px-15",
            "align-self-start",
            "sold-out",
            "inline-flex",
            "content-center",
            "subheading_weight",
            "btn-rounded",
            "lh-normal",
            "text-center"
          );
          elementso.style.setProperty("--badges-color", soldOutColor);
          elementso.style.setProperty("--badges-bg", soldOutBg);
          elementso.innerHTML = window.variantStrings.soldOut
            ? window.variantStrings.soldOut
            : "Sold out";
          label.appendChild(elementso);
        } else {
          dsoldout.innerHTML = window.variantStrings.soldOut
            ? window.variantStrings.soldOut
            : "Sold out";
        }
      } else {
        dsoldout?.remove();
      }
    }

    if (productBadgesScrolling && sale) {
      const dataBadgesScrolling =
        productBadgesScrolling?.dataset.textProductScrolling;
      const allProductBadgesScrolling = productBadgesScrolling.querySelectorAll(
        ".content-badges-scrolling"
      );
      allProductBadgesScrolling.forEach((content) => {
        content.innerText = dataBadgesScrolling.replace(
          "[percent_sale]",
          percent.toFixed(0) + "%"
        );
      });
    }
  }

  toggleAddButton(disable = true, text, modifyClass = true) {
    const productForm = document.getElementById(
      `quick-add-bundle-${this.dataset.section}`
    );
    if (!productForm) return;
    const addButton = productForm.querySelector('[name="add"]');
    const addButtonText = productForm.querySelector('[name="add"] > span');
    const buttonPayment = productForm.querySelector(
      ".product-dynamic-checkout"
    );
    if (!addButton) return;

    if (disable) {
      addButton.setAttribute("disabled", "disabled");
      if (text) addButtonText.textContent = text;
    } else {
      addButton.removeAttribute("disabled");
      if (addButtonText) {
        addButtonText.textContent = window.variantStrings?.addToCartBundle;
      }
    }

    if (!modifyClass) return;
  }

  setUnavailable() {
    const button = document.getElementById(
      `quick-add-bundle-${this.dataset.section}`
    );
    const addButton = button.querySelector('[name="add"]');
    const addButtonText = button.querySelector('[name="add"] > span');
    const price = document.getElementById(`price-${this.dataset.section}`);
    if (!addButton) return;
    addButtonText.textContent = window.variantStrings?.unavailable;
    if (price) price.classList.add("visibility-hidden");
  }

  setAvailability(listOfOptions, listOfAvailableOptions) {
    listOfOptions.forEach((input) => {
      if (listOfAvailableOptions.includes(input.dataset.value)) {
        input.classList.remove("option-disabled");
      } else {
        input.classList.add("option-disabled");
      }
    });
  }

  updateVariantStatuses() {
    const selectedOptionOneVariants = this.getVariantData().filter(
      (variant) =>
        this.querySelector(".active").dataset.value === variant.option1
    );
    const inputWrappers = [...this.querySelectorAll(".product-form__input")];
    inputWrappers.forEach((option, index) => {
      if (index === 0) return;
      const optionInputs = [...option.querySelectorAll(".option-swatch-js")];
      const previousOptionSelected =
        inputWrappers[index - 1].querySelector(".active").dataset.value;
      const availableOptionInputsValue = selectedOptionOneVariants
        .filter(
          (variant) =>
            variant.available &&
            variant[`option${index}`] === previousOptionSelected
        )
        .map((variantOption) => variantOption[`option${index + 1}`]);
      this.setAvailability(optionInputs, availableOptionInputsValue);
    });
  }

  getVariantData() {
    this.variantData =
      this.variantData ||
      JSON.parse(this.querySelector('[type="application/json"]').textContent);
    return this.variantData;
  }

  variantHover(e) {
    const productTarget = e.closest(".product-item");
    if (!productTarget) return;

    const swiperElement = e.closest(".swiper");
    if (!swiperElement) return;

    let timeout;

    const handleMouseOut = () => {
      swiperElement.classList.remove("show-tooltip");
    };

    const handleMouseOver = () => {
      swiperElement.classList.add("show-tooltip");
    };

    e.addEventListener("mouseout", handleMouseOut, false);
    e.addEventListener("mouseover", handleMouseOver, false);
    e.addEventListener("mouseenter", handleMouseOver, false);
    e.addEventListener("mouseleave", handleMouseOut, false);
  }
}
customElements.define("variant-radios-bundle", VariantRadiosBundle);

if (!customElements.get("product-form-bundle")) {
  customElements.define(
    "product-form-bundle",
    class ProductForm extends PopupBase {
      constructor() {
        super();
        this.form = this.querySelector("form");
        this.form.querySelector("[name=id]").disabled = false;
        this.form.addEventListener("submit", this.onSubmitHandler.bind(this));
        this.cart =
          document.querySelector("cart-notification") ||
          document.querySelector("cart-drawer");
        this.submitButton = this.querySelector('[type="submit"]');
        this.hideErrors = this.dataset.hideErrors === "true";
        this.productItem =
          this.form.closest(".product-item") ||
          this.form.closest("sticky-add-cart");
      }

      updateBundleButtonStatus() {
        const productFormBundle = this.closest("product-form-bundle");
        const minimum = productFormBundle.dataset.minimum;
        const maximum = productFormBundle.dataset.maximum;
        const submitButton = document.querySelector("button-submit-bundle");
        if (!submitButton) return;

        const bundleItems = document.querySelectorAll(
          "[data-product-bundle-variant][data-variant-id]"
        );
        if (bundleItems.length >= minimum) {
          submitButton.classList.remove("disabled");
        } else {
          submitButton.classList.add("disabled");
        }
        const btnAddCart = this.closest("product-bundle").querySelectorAll(
          "product-form-bundle button"
        );
        if (bundleItems.length >= maximum) {
          btnAddCart.forEach((btn) => {
            btn.classList.add("disabled");
          });
        }
      }

      onSubmitHandler(evt) {
        evt.preventDefault();
        if (this.submitButton.getAttribute("aria-disabled") === "true") return;

        this.handleErrorMessage();

        this.submitButton.classList.add("disabled");
        this.submitButton.textContent =
          window.variantStrings?.addedToCartBundle;

        const formData = new FormData(this.form);
        const variantId = formData.get("id");
        const quantity = formData.get("quantity") || 1;
        const productHandle = this.dataset.handle || this.dataset.productHandle;

        fetch(
          `/products/${productHandle}?section_id=bundle-item&variant=${variantId}`
        )
          .then((response) => response.text())
          .then((responseText) => {
            const doc = parser.parseFromString(responseText, "text/html");
            const bundleContainers = document.querySelectorAll(
              "[data-product-bundle-variant]"
            );
            if (!bundleContainers.length) {
              console.error("No bundle container found");
              return;
            }

            let existingItemContainer = null;
            for (const container of bundleContainers) {
              if (container.getAttribute("data-variant-id") === variantId) {
                existingItemContainer = container;
                break;
              }
            }

            if (existingItemContainer) {
              const currentQty = parseInt(
                existingItemContainer.getAttribute("data-quantity") || 0
              );
              existingItemContainer.setAttribute(
                "data-quantity",
                currentQty + parseInt(quantity)
              );

              const quantityDisplay = existingItemContainer.querySelector(
                ".bundle-item-quantity"
              );
              if (quantityDisplay) {
                quantityDisplay.textContent = currentQty + parseInt(quantity);
              }

              existingItemContainer.classList.add("flash-highlight");
              setTimeout(() => {
                existingItemContainer.classList.remove("flash-highlight");
              }, 1500);
            } else {
              let targetContainer = null;
              for (const container of bundleContainers) {
                if (!container.hasAttribute("data-variant-id")) {
                  targetContainer = container;
                  break;
                }
              }

              if (!targetContainer) {
                this.handleErrorMessage(
                  "Bundle is full. Please remove an item first."
                );
                return;
              }

              const bundleImage = doc.querySelector(".bundle-image");
              const bundleContent = doc.querySelector(".bundle-content");
              const bundleRemoveButton = doc.querySelector(
                "bundle-cart-remove-button"
              );

              if (!bundleImage || !bundleContent) {
                console.error("Missing required elements in response", {
                  bundleImage,
                  bundleContent,
                });
                this.handleErrorMessage("Error processing product data");
                return;
              }

              targetContainer.setAttribute("data-variant-id", variantId);
              targetContainer.setAttribute("data-quantity", quantity);
              targetContainer.classList.add("bundle-item-dev");

              const mediaContainer = targetContainer.querySelector(
                "[data-product-bundle-variant-media]"
              );
              if (mediaContainer && bundleImage) {
                mediaContainer.classList.remove("skeleton");
                mediaContainer.innerHTML = bundleImage.innerHTML;
              }

              const contentContainer = targetContainer.querySelector(
                "[data-product-bundle-variant-content]"
              );
              if (contentContainer && bundleContent) {
                contentContainer
                  .querySelectorAll(".horizontal-product__skeleton")
                  .forEach((el) => el.remove());

                contentContainer.innerHTML = bundleContent.innerHTML;
                let bundleActionContainer =
                  targetContainer.querySelector(".bundle-action");
                if (!bundleActionContainer) {
                  bundleActionContainer = document.createElement("div");
                  bundleActionContainer.classList.add("bundle-action");
                  targetContainer.appendChild(bundleActionContainer);
                }
                if (bundleRemoveButton) {
                  const existingButtons =
                    bundleActionContainer.querySelectorAll(
                      "bundle-cart-remove-button"
                    );
                  existingButtons.forEach((button) => button.remove());
                  const removeButtonHTML = bundleRemoveButton.outerHTML;

                  bundleActionContainer.insertAdjacentHTML(
                    "beforeend",
                    removeButtonHTML
                  );

                  const newRemoveButton = bundleActionContainer.querySelector(
                    "bundle-cart-remove-button:last-child"
                  );

                  if (newRemoveButton) {
                    newRemoveButton.addEventListener("click", () => {
                      const _this = this;
                      targetContainer.removeAttribute("data-variant-id");
                      targetContainer.removeAttribute("data-quantity");

                      if (mediaContainer) {
                        mediaContainer.innerHTML = "";
                      }

                      if (contentContainer) {
                        contentContainer.innerHTML = `
                                                <span class="horizontal-product__skeleton skeleton-1"></span>
                                                <span class="horizontal-product__skeleton skeleton-2"></span>
                                                <span class="horizontal-product__skeleton skeleton-3"></span>
                                              `;
                      }
                      _this.submitButton.classList.remove("disabled");
                      _this.submitButton.textContent =
                        window.variantStrings?.addToCartBundle;
                      _this.updateContainerOrders();
                      _this.updateBundleTotal();
                      document.dispatchEvent(
                        new CustomEvent("bundle:item-changed")
                      );
                      const bundleItems = document.querySelectorAll(
                        "[data-product-bundle-variant][data-variant-id]"
                      );
                      const maximum = _this.closest("product-form-bundle")
                        .dataset.maximum;
                      if (bundleItems.length < maximum) {
                        const btnAddCart = _this
                          .closest("product-bundle")
                          .querySelectorAll(
                            "product-form-bundle button.disabled"
                          );
                        btnAddCart.forEach((btn) => {
                          const productForm = btn.closest(
                            "product-form-bundle"
                          );
                          const productId =
                            productForm.querySelector('input[name="id"]').value;
                          const isInBundle = Array.from(bundleItems).some(
                            (item) =>
                              item.getAttribute("data-variant-id") === productId
                          );
                          if (!isInBundle) {
                            btn.classList.remove("disabled");
                          }
                        });
                      }
                      _this.updateBundleButtonStatus();
                    });
                  }
                }
              }

              targetContainer.classList.add("flash-highlight");
              setTimeout(() => {
                targetContainer.classList.remove("flash-highlight");
              }, 1500);
            }

            this.form.reset();
            this.updateBundleTotal();
          })
          .catch((error) => {
            console.error("Error adding product to bundle:", error);
            this.handleErrorMessage("Could not add product to bundle");
          })
          .finally(() => {
            // this.submitButton.classList.remove('disabled');
            document.dispatchEvent(new CustomEvent("bundle:item-changed"));
            this.updateBundleButtonStatus();
          });
      }

      updateContainerOrders() {
        const bundleContainers = document.querySelectorAll(
          "[data-product-bundle-variant]"
        );

        bundleContainers.forEach((container) => {
          container.style.order = "";
        });

        let filledCount = 0;
        let emptyCount = 0;

        bundleContainers.forEach((container, index) => {
          if (container.hasAttribute("data-variant-id")) {
            container.style.order = filledCount.toString();
            filledCount++;
          } else {
            container.style.order = (
              bundleContainers.length + emptyCount
            ).toString();
            emptyCount++;
          }
        });
      }

      updateBundleTotal() {
        let totalPrice = 0;
        let itemTotalPrice = 0;
        const bundleItems = document.querySelectorAll(
          "[data-product-bundle-variant][data-variant-id]"
        );
        bundleItems.forEach((item) => {
          const priceElement = item.querySelector(".price-item--regular");
          const price = priceElement?.dataset.price;
          const quantity = parseInt(item.getAttribute("data-quantity")) || 1;
          itemTotalPrice += price * quantity;
          totalPrice = Shopify.formatMoney(
            itemTotalPrice,
            cartStrings?.money_format
          );
        });
        const totalElement = document.querySelector(".subtotal-price__bundle");
        if (itemTotalPrice > 0) {
          totalElement.textContent = totalPrice;
        } else {
          totalElement.textContent = Shopify.formatMoney(
            0,
            cartStrings?.money_format
          );
        }
      }

      getMainCartSectionRender() {
        return [
          {
            id: "main-cart-items",
            section: document.getElementById("main-cart-items")?.dataset.id,
            selector: ".js-contents",
          },
        ];
      }

      getSectionInnerHTML(html, selector) {
        return new DOMParser()
          .parseFromString(html, "text/html")
          .querySelector(selector).innerHTML;
      }

      handleErrorMessage(errorMessage = false) {
        if (this.hideErrors) return;

        this.errorMessageWrapper =
          this.errorMessageWrapper ||
          this.querySelector(".product-form__error-message-wrapper");
        if (!this.errorMessageWrapper) return;
        this.errorMessage =
          this.errorMessage ||
          this.errorMessageWrapper.querySelector(
            ".product-form__error-message"
          );

        this.errorMessageWrapper.toggleAttribute("hidden", !errorMessage);

        if (errorMessage) {
          this.errorMessage.textContent = errorMessage;
        }
      }

      handleErrorMessagePopup(errorMessage = false) {
        const url = `${window.location.pathname}?section_id=form-message`;
        fetch(url)
          .then((response) => response.text())
          .then((responseText) => {
            const html = new DOMParser().parseFromString(
              responseText,
              "text/html"
            );
            const elementErrorMessage = html.querySelector(
              ".product-form__error-message-wrapper"
            );
            const elementMessage = elementErrorMessage.querySelector(
              ".product-form__error-message"
            );
            elementMessage.textContent = errorMessage;
            showToast(elementErrorMessage.innerHTML, 3000, "modal-error");
          })
          .catch((e) => {
            throw e;
          });
      }
    }
  );
}

class QuantityInputBundle extends HTMLElement {
  constructor() {
    super();
    this.input = this.querySelector("input");
    this.changeEvent = new Event("change", { bubbles: true });

    this.previousValue = parseInt(this.input.value) || 1;

    this.input.addEventListener("change", this.onInputChange.bind(this));
    this.querySelectorAll("button").forEach((button) =>
      button.addEventListener("click", this.onButtonClick.bind(this))
    );
  }

  onInputChange() {
    this.updateBundleQuantity();
  }

  onButtonClick(event) {
    event.preventDefault();
    this.previousValue = parseInt(this.input.value);

    event.target.name === "plus" ||
    event.target.closest("button").name === "plus"
      ? this.input.stepUp()
      : this.input.stepDown();

    if (this.previousValue !== parseInt(this.input.value)) {
      this.input.dispatchEvent(this.changeEvent);
      this.updateBundleQuantity();
    }
  }

  updateBundleQuantity() {
    const bundleContainer = this.closest("[data-product-bundle-variant]");
    if (!bundleContainer) return;

    const currentValue = parseInt(this.input.value) || 1;
    bundleContainer.setAttribute("data-quantity", currentValue);

    this.updateBundleTotal();
  }

  updateBundleTotal() {
    let itemTotalPrice = 0;
    const bundleItems = document.querySelectorAll(
      "[data-product-bundle-variant][data-variant-id]"
    );

    bundleItems.forEach((item) => {
      const priceElement = item.querySelector(".price-item--regular");
      if (!priceElement || !priceElement.dataset.price) return;

      const price = parseFloat(priceElement.dataset.price);
      const quantity = parseInt(item.getAttribute("data-quantity")) || 1;

      if (!isNaN(price) && !isNaN(quantity)) {
        itemTotalPrice += price * quantity;
      }
    });

    const totalElement = document.querySelector(".subtotal-price__bundle");
    if (totalElement) {
      if (itemTotalPrice > 0) {
        totalElement.textContent = Shopify.formatMoney(
          itemTotalPrice,
          cartStrings?.money_format
        );
      } else {
        totalElement.textContent = Shopify.formatMoney(
          0,
          cartStrings?.money_format
        );
      }
    }
  }
}

customElements.define("quantity-input-bundle", QuantityInputBundle);

class ButtonSubmitBundle extends HTMLElement {
  constructor() {
    super();
    this.submitButton = this;
    this.addEventListener("click", this.onSubmitHandler.bind(this));
    this.minimum = this.dataset.minimum;
    this.maximum = this.dataset.maximum;
  }

  onSubmitHandler(evt) {
    evt.preventDefault();

    if (this.classList.contains("loading")) return;

    this.classList.add("loading");
    this.setAttribute("disabled", "");
    this.querySelector("span").textContent =
      window.variantStrings?.addingToCart || "Adding to cart...";

    const bundleItems = document.querySelectorAll(
      "[data-product-bundle-variant][data-variant-id]"
    );

    if (!bundleItems.length) {
      this.handleErrorMessagePopup("Please add products to your bundle first");
      this.resetButton();
      return;
    }

    const items = Array.from(bundleItems).map((item) => {
      return {
        id: item.getAttribute("data-variant-id"),
        quantity: parseInt(item.getAttribute("data-quantity")) || 1,
      };
    });

    this.addItemsToCart(items);
  }

  addItemsToCart(items) {
    this.cart =
      document.querySelector("cart-notification") ||
      document.querySelector("cart-drawer");

    const formData = {
      items: items,
      sections: this.cart
        ? this.cart.getSectionsToRender().map((section) => section.id)
        : [],
      sections_url: window.location.pathname,
    };

    fetch(`${routes?.cart_add_url}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then((response) => {
        if (response.status) {
          this.handleErrorMessagePopup(response.description);
          return;
        } else if (response.errors) {
          this.handleErrorMessagePopup(response.errors);
          return;
        }

        this.updateCartCount();

        this.clearBundle();

        if (this.cart) {
          this.updateCartSections(response);
        }

        if (this.cart) {
          this.cart.open();
        } else {
          window.location = window.routes.cart_url;
        }
      })
      .catch((error) => {
        throw error;
      })
      .finally(() => {
        this.resetButton();
      });
  }

  updateCartCount() {
    fetch("/cart.json")
      .then((res) => res.json())
      .then((cart) => {
        if (cart.item_count !== undefined) {
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

          const cartFreeShip = document.querySelector("free-ship-progress-bar");
          if (cartFreeShip) {
            cartFreeShip.init(cart.items_subtotal_price);
          }
        }
      })
      .catch((error) => {
        console.error("Error updating cart count:", error);
      });
  }

  updateCartSections(response) {
    this.cart.getSectionsToRender().forEach((section) => {
      const elementToReplace = document.getElementById(section.id);
      const html = new DOMParser().parseFromString(
        response.sections[section.id],
        "text/html"
      );

      if (elementToReplace) {
        elementToReplace.innerHTML =
          html.querySelector("#minicart-form").innerHTML;
      }
    });

    if (this.cart && typeof this.cart.cartAction === "function") {
      this.cart.cartAction();
    }
  }

  clearBundle() {
    const bundleContainers = document.querySelectorAll(
      "[data-product-bundle-variant]"
    );
    bundleContainers.forEach((container) => {
      container.removeAttribute("data-variant-id");
      container.removeAttribute("data-quantity");

      const mediaContainer = container.querySelector(
        "[data-product-bundle-variant-media]"
      );
      if (mediaContainer) {
        mediaContainer.innerHTML = "";
      }

      const contentContainer = container.querySelector(
        "[data-product-bundle-variant-content]"
      );
      if (contentContainer) {
        contentContainer.innerHTML = `
          <span class="horizontal-product__skeleton skeleton-1"></span>
          <span class="horizontal-product__skeleton skeleton-2"></span>
          <span class="horizontal-product__skeleton skeleton-3"></span>
        `;
      }

      const actionContainer = container.querySelector(".bundle-action");
      if (actionContainer) {
        actionContainer.innerHTML = "";
      }
    });

    const totalElement = document.querySelector(".subtotal-price__bundle");
    if (totalElement) {
      totalElement.textContent = Shopify.formatMoney(
        0,
        cartStrings?.money_format
      );
    }

    this.updateButtonStatus();
    document.dispatchEvent(new CustomEvent("bundle:item-changed"));
  }

  handleErrorMessagePopup(errorMessage = false) {
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
        showToast(elementErrorMessage.innerHTML, 3000, "modal-error");
      })
      .catch((e) => {
        throw e;
      });
  }

  resetButton() {
    this.classList.remove("loading");
    this.removeAttribute("disabled");
    this.querySelector("span").textContent =
      window.variantStrings?.addAllToCart || "Add all to cart";
    this.updateButtonStatus();
  }

  updateButtonStatus() {
    const bundleItems = document.querySelectorAll(
      "[data-product-bundle-variant][data-variant-id]"
    );
    const sectionId = this.dataset.sectionId;
    const bundleBtnAddCart = document.querySelectorAll(
      `#product-bundle-${sectionId} product-form-bundle button`
    );
    bundleBtnAddCart.forEach((button) => {
      if (button.classList.contains("disabled")) {
        button.classList.remove("disabled");
      }
    });
    let itemCount = 0;
    if (bundleItems.length > 0) {
      itemCount = bundleItems.length + 1;
    }

    if (itemCount >= this.minimum) {
      this.classList.remove("disabled");
    } else {
      this.classList.add("disabled");
    }
  }
}

customElements.define("button-submit-bundle", ButtonSubmitBundle);

class ProgressBundleBar extends HTMLElement {
  constructor() {
    super();
    this.minimum = parseInt(this.dataset.minimum) || 1;
    this.updateBundleProgress();

    document.addEventListener("bundle:item-changed", () =>
      this.updateBundleProgress()
    );
  }

  updateBundleProgress() {
    const bundleItems = Array.from(
      this.closest("sticky-element").querySelectorAll(
        "[data-product-bundle-variant][data-variant-id]"
      )
    );
    const itemCount = bundleItems.length;

    let progressPercentage;
    if (itemCount >= this.minimum) {
      progressPercentage = 100;
    } else {
      progressPercentage = (itemCount / this.minimum) * 100;
    }

    this.style.setProperty("--progress-width", `${progressPercentage}%`);

    if (progressPercentage >= 100) {
      this.classList.add("complete");
    } else {
      this.classList.remove("complete");
    }
  }
}

customElements.define("progress-bundle-bar", ProgressBundleBar);

if (!customElements.get("product-form-quick-edit")) {
  customElements.define(
    "product-form-quick-edit",
    class ProductForm extends HTMLElement {
      constructor() {
        super();
        this.form = this.querySelector("form");
        this.form.querySelector("[name=id]").disabled = false;
        this.form.addEventListener("submit", this.onSubmitHandler.bind(this));
        this.cart =
          document.querySelector("cart-notification") ||
          document.querySelector("cart-drawer");
        this.submitButton = this.querySelector('[type="submit"]');
      }

      onSubmitHandler(evt) {
        evt.preventDefault();
        this.submitButton.setAttribute("disabled", true);
        this.submitButton.classList.add("loading");
        const cartRecommend = document.querySelector(".cart-recommend");
        if (cartRecommend && cartRecommend.classList.contains("open")) {
          cartRecommend.classList.remove("open");
        }
        const quick = document.getElementById("product-form-quick-edit");
        const id = quick.getAttribute("data-line");
        const quantity = 0;
        const config_change = fetchConfig("json");
        config_change.body = JSON.stringify({
          id,
          quantity,
        });
        fetch(`${routes?.cart_change_url}`, config_change)
          .then((response) => {
            return response.text();
          })
          .catch((e) => {
            throw e;
          })
          .finally(() => {
            this.addCartAdd();
          });
      }

      addCartAdd() {
        const config = fetchConfig("json");
        config.headers["X-Requested-With"] = "XMLHttpRequest";
        delete config.headers["Content-Type"];
        const formData = new FormData(this.form);
        if (this.cart) {
          formData.append(
            "sections",
            this.cart.getSectionsToRender().map((section) => section.id)
          );
          formData.append("sections_url", window.location.pathname);
          this.cart.setActiveElement(document.activeElement);
        }
        config.body = formData;
        fetch(`${routes?.cart_add_url}`, config)
          .then((response) => {
            return response.text();
          })
          .then((state) => {
            this.submitButton.setAttribute("disabled", true);
            this.submitButton.querySelector("span").classList.add("hidden");
            fetch("/cart.json")
              .then((res) => res.json())
              .then((cart) => {
                if (cart.item_count != undefined) {
                  document.querySelectorAll(".cart-count").forEach((el) => {
                    if (el.classList.contains("cart-count-drawer")) {
                      el.innerHTML = `(${cart.item_count})`;
                    } else {
                      el.innerHTML =
                        cart.item_count > 100 ? "~" : cart.item_count;
                    }
                  });
                  if (document.querySelector("header-total-price")) {
                    document
                      .querySelector("header-total-price")
                      .updateTotal(cart);
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
            if (!parsedState.errors) {
              this.cart.getSectionsToRender().forEach((section) => {
                const elementToReplace = document.getElementById(section.id);
                const html = new DOMParser().parseFromString(
                  parsedState.sections[section.id],
                  "text/html"
                );
                elementToReplace.innerHTML =
                  html.querySelector("#minicart-form").innerHTML;
              });
              if (this.cart && typeof this.cart.cartAction === "function") {
                this.cart.cartAction();
              }
              document.querySelector(".tingle-modal__close").click();
            } else {
              this.submitButton.removeAttribute("disabled");
              this.submitButton.classList.remove("loading");
              this.submitButton
                .querySelector("span")
                .classList.remove("hidden");
              this.updateMessageQuickErrors(parsedState.errors);
            }
          })
          .catch((e) => {
            throw e;
          })
          .finally(() => {
            BlsLazyloadImg.init();
            this.submitButton.removeAttribute("disabled");
            this.submitButton.querySelector("span").classList.remove("hidden");
            this.cart.open();
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

      updateMessageQuickErrors(message) {
        this.querySelector(".cart-item__error-text").textContent = message;
      }
    }
  );
}

class ShowPassWord extends HTMLElement {
  constructor() {
    super();
    this.init();
  }
  init() {
    this.addEventListener("click", this.onClick.bind(this));
  }
  onClick() {
    var input = this.closest(".form-field").querySelector("input");
    if (input.type === "password") {
      input.type = "text";
      this.classList.add("text");
    } else {
      input.type = "password";
      this.classList.remove("text");
    }
  }
}
customElements.define("show-pass-word", ShowPassWord);

class BeforeYouLeave extends HTMLElement {
  constructor() {
    super();
    setTimeout(() => {
      this.init();
    }, 10000);
  }
  init() {
    const sectionId = this.dataset.sectionId;
    const before_you_leave = document.querySelector(`#${sectionId}`).innerHTML;
    document.querySelector("before-you-leave").innerHTML = before_you_leave;
    setTimeout(() => {
      this.initPopup();
      BlsLazyloadImg.init();
    }, 500);
  }
  initPopup() {
    const element = document.querySelector("before-you-leave");
    const delay = element?.dataset.timeDelay;
    var action = 0;
    if (element !== null) {
      var getPopup = setTimeout(() => {
        getTimeOut();
      }, (delay - 10) * 1000);

      const addMultipleListeners = (
        el,
        types,
        listener,
        options,
        useCapture
      ) => {
        types.forEach((type) =>
          el.addEventListener(type, listener, options, useCapture)
        );
      };

      addMultipleListeners(
        document.querySelector("body"),
        ["scroll", "click", "mousemove", "keydown"],
        () => {
          setAction();
        }
      );
      const closeBefore = document.querySelectorAll(".close-before");
      closeBefore.forEach((event) => {
        event.addEventListener("click", () => {
          clearTimeout(getPopup);
          element.classList.remove("open");
          document.documentElement.classList.remove("open-byl");
          setTimeout(() => {
            document.documentElement.classList.remove("open-drawer");
            root.style.removeProperty("padding-right");
          }, 550);
        });
      });

      function getTimeOut() {
        action = action + 1;
        if (action >= 1) {
          document.documentElement.classList.add("open-drawer", "open-byl");
          root.style.setProperty(
            "padding-right",
            getScrollBarWidth.init() + "px"
          );
          element.classList.add("open");
          const cp = element.querySelectorAll(".discount");
          if (cp !== null) {
            cp.forEach((e) => {
              e.addEventListener("click", (el) => {
                el.preventDefault();
                navigator.clipboard.writeText(e?.dataset.code);
                e.classList.add("action-copy");
                setTimeout(() => {
                  e.classList.remove("action-copy");
                }, 1500);
              });
            });
          }
        }
      }
      function setAction() {
        action = action - 1;
      }
    }
  }
}
customElements.define("before-you-leave", BeforeYouLeave);

class MiniCartRemoveButton extends HTMLElement {
  constructor() {
    super();
    this.addEventListener("click", (event) => {
      event.preventDefault();
      const wishlist_items = JSON.parse(
        localStorage.getItem("glozin__wishlist-items")
      );
      const productHandle = this.dataset.productHandle;
      let index = wishlist_items?.indexOf(productHandle);
      if (this.classList.contains("action-add-wishlist")) {
        if (index == -1 || index == undefined) {
          this.closest(".cart-item").querySelector(
            ".minicart__wishlist"
          ).style.display = "block";
          this.closest(".cart-item").querySelector(
            ".minicart__product-info"
          ).style.display = "none";
        } else {
          const cartItems = this.closest("cart-notification");
          cartItems.updateQuantity(this.dataset.index, 0);
        }
      } else {
        const cartItems = this.closest("cart-notification");
        cartItems.updateQuantity(this.dataset.index, 0);
      }
    });
  }
}
customElements.define("mini-cart-remove-button", MiniCartRemoveButton);

class MiniCartWishlistAction extends HTMLElement {
  constructor() {
    super();
    this.actionRemoveWishlist();
    this.actionAddWishlist();
    this.actionClose();
  }

  actionRemoveWishlist() {
    this.querySelector(".btn-minicart__remove-js").addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        const target = event.currentTarget;
        this.eventRemove(target);
      }
    );
  }

  actionAddWishlist() {
    this.querySelector(".btn-minicart__add-wishlist-js").addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        const target = event.currentTarget;
        const localListProductIds = localStorage.getItem(
          "glozin__wishlist-items"
        );
        let listProductIds = [];
        let productId = target.dataset.productId;
        if (localListProductIds) {
          const parseLocalListProductIds = JSON.parse(localListProductIds);
          let isProductIdContained =
            parseLocalListProductIds.includes(productId);
          if (!isProductIdContained) {
            listProductIds.push(...parseLocalListProductIds, productId);
          } else {
            listProductIds.push(...parseLocalListProductIds);
          }
        } else {
          listProductIds.push(productId);
        }
        const stringifyListProductIds = JSON.stringify(listProductIds);
        localStorage.setItem("glozin__wishlist-items", stringifyListProductIds);
        this.eventRemove(target);
      }
    );
  }

  eventRemove(target) {
    const cartItems = document.querySelector("cart-notification");
    cartItems.updateQuantity(target.dataset.index, 0);
  }

  actionClose() {
    document.querySelectorAll(".cart-close-wishlist").forEach((items) => {
      items.addEventListener("click", (e) => {
        const target = e.currentTarget;
        e.preventDefault();
        target
          .closest(".cart-item")
          .querySelector(".minicart__wishlist").style.display = "none";
        target
          .closest(".cart-item")
          .querySelector(".minicart__product-info").style.display = "block";
      });
    });
  }
}
customElements.define("minicart-wishlist-action", MiniCartWishlistAction);

class CookieBar extends HTMLElement {
  constructor() {
    super();
    this.init();
  }
  init() {
    var _this = this;
    if (!getCookie("cookie_bar")) {
      this.classList.remove("hidden");
    }
    this.querySelectorAll(".cookie-dismiss").forEach((closeCookie) => {
      closeCookie.addEventListener(
        "click",
        (e) => {
          e.preventDefault();
          const target = e.currentTarget;
          _this.remove();
          if (target.id == "cookie-refuse") {
            setCookie("cookie_bar", "dismiss", 7);
          } else {
            setCookie("cookie_bar", "dismiss", 30);
          }
        },
        false
      );
    });
  }
}
customElements.define("cookie-bar", CookieBar);

class TermsConditions extends PopupBase {
  constructor() {
    super();
    this.init();
  }
  init() {
    const terms = this.querySelector("a");
    if (terms) {
      terms.addEventListener("click", (e) => {
        const target = e.currentTarget;
        const popup = document.querySelector("#popup-terms-conditions");
        if (popup) {
          const header = popup.getAttribute("data-text");
          this.initPopup(
            popup.querySelector(".terms-conditions-content").outerHTML,
            `<h3 class="title-popup h5 my-0 px-20 px-md-30 py-20 border-bottom">${header}</h3>`
          );
          target.href = "javascript: (function(){})();";
          target.target = "_self";
        }
      });
    }
    const conditions =
      this.querySelector(".conditions_form_minicart") ||
      this.querySelector(".conditions_form_product");
    const bpb = document.querySelector(".btn-checkout");
    const dynamicCheckout = this.closest("product-form")?.querySelector(
      ".btn-checkout-dynamic"
    );
    if (conditions) {
      if (getCookie("term_conditions")) {
        conditions.setAttribute("checked", "");
        if (bpb) {
          bpb.removeAttribute("disabled");
        }
        if (dynamicCheckout) {
          dynamicCheckout.classList.remove("disabled");
        }
      }
      conditions.addEventListener("change", (event) => {
        if (bpb) {
          if (event.currentTarget.checked) {
            bpb.removeAttribute("disabled");
            setCookie("term_conditions", 1, 1);
          } else {
            bpb.setAttribute("disabled", "");
            deleteCookie("term_conditions");
          }
        }
        if (dynamicCheckout) {
          if (event.currentTarget.checked) {
            dynamicCheckout.classList.remove("disabled");
            setCookie("term_conditions", 1, 1);
          } else {
            dynamicCheckout.classList.add("disabled");
            deleteCookie("term_conditions");
          }
        }
      });
    }
  }
}
customElements.define("terms-conditions", TermsConditions);

var BlsGlozinAdminLi = (function () {
  return {
    init: function () {
      this.BlsCheckLi();
    },
    BlsCheckLi: function () {
      const _this = this;
      if (typeof glozin_app === "object") {
        if (glozin_app.mode === "admin") {
          if (glozin_app.action === "active") {
            if (_this.checkCookie(glozin_app.lic) === false) {
              let encrypted = "";
              if (glozin_app._e) {
                encrypted = glozin_app._e;
              }
              console.log("encrypted", encrypted);
              _this.BlsActive(encrypted);
            }
          } else {
            const url =
              "https://api.nextsky.co/glozin/api/remove-license/?code=" +
              glozin_app.lic +
              "&domain=" +
              glozin_app.shop;
            fetch(url)
              .then((response) => response.json())
              .then((responseText) => {
                if (responseText) {
                  const dateCreate = new Date(new Date().getTime() - 36e6);
                  _this.setCookie(glozin_app.lic, dateCreate);
                }
                _this.BlsRenderHtml(3);
              })
              .catch((e) => {
                console.log(e);
              });
          }
        }
      } else {
        _this.BlsRenderHtml(0);
      }
    },
    BlsRenderHtml: function (cs) {
      const shop = window.location.hostname.replace(/\./g, "-");
      if (!document.querySelector("#" + "bls__" + shop)) {
        const container = document.createElement("DIV");
        const wrapper = document.createElement("DIV");
        const title = document.createElement("h3");
        const introText = document.createElement("p");
        const messages = {
          1: "This purchase code was activated for another domain!",
          2: "This purchase code is invalid!",
          3: "Purchase Code deleted successfully!",
          0: "Welcome to Glozin - Shopify Themes OS 2.0 🎉 ",
        };
        title.textContent = messages[cs] || messages[0];
        title.setAttribute("class", `msg-${cs}`);
        introText.textContent =
          "Follow these simple steps to use Glozin theme:";
        const steps = [
          {
            title:
              "Step 1: Add Glozin theme file to your 'Online store' > 'Theme'.",
            content: "",
          },
          {
            title: "Step 2: Insert purchase code",
            content:
              "Go to 'Theme setting' > 'Purchase code' to insert your purchase code.",
          },
          {
            title: "Step 3: Activate purchase code",
            content:
              "Go to 'Theme setting' > 'Purchase code action' and select 'Active purchase code'.",
          },
        ];
        const stepElements = steps.map((step, index) => {
          const stepEl = document.createElement("DIV");
          stepEl.setAttribute("class", `step-${index + 1}`);
          const heading = document.createElement("h5");
          heading.textContent = step.title;
          stepEl.appendChild(heading);

          if (step.content) {
            const content = document.createElement("p");
            content.textContent = step.content;
            stepEl.appendChild(content);
          }
          return stepEl;
        });
        const purchaseLink = document.createElement("a");
        purchaseLink.setAttribute("target", "_blank");
        purchaseLink.setAttribute("class", "popup-btn");
        purchaseLink.setAttribute(
          "href",
          "https://nextsky.gitbook.io/glozin-theme/get-started/purchase-code-and-activation"
        );
        purchaseLink.textContent = "👉 Get Glozin purchase code";
        stepElements[1].appendChild(purchaseLink);
        wrapper.appendChild(title);
        wrapper.appendChild(introText);
        stepElements.forEach((step) => wrapper.appendChild(step));
        container.setAttribute("id", "bls__not-active");
        container.appendChild(wrapper);
        setInterval(() => {
          if (document.getElementById("bls__not-active")) {
            document
              .getElementById("bls__not-active")
              .setAttribute("style", "display: block !important;");
          } else {
            document.querySelector("body").appendChild(container);
          }
        }, 1000);
      } else {
        document.querySelector("#" + "bls__" + shop).remove();
      }
    },
    BlsActive: function (encrypted) {
      const _this = this;
      const salt = glozin_app._s || glozin_app.shop + "GlzSalt25";
      const url =
        "https://api.nextsky.co/glozin/api/check-license/?code=" +
        glozin_app.lic +
        "&domain=" +
        glozin_app.shop +
        "&e=" +
        encodeURIComponent(encrypted) +
        "&s=" +
        encodeURIComponent(salt);
      fetch(url)
        .then((response) => response.json())
        .then((responseText) => {
          if (responseText.d === false) {
            _this.BlsRenderHtml(responseText.s);
          } else if (responseText.d === true) {
            const dateCheck = new Date(new Date().getTime() + 36e6);
            _this.setCookie(glozin_app.lic, dateCheck);
          } else if (responseText.d === "err") {
            console.log(
              responseText.err
                ? responseText.err.message
                : "Please contact to server's adminstrator!!!"
            );
          }
        })
        .catch((e) => {
          console.log(e);
        });
    },
    setCookie: function (cvalue, d) {
      const v = btoa(cvalue);
      document.cookie =
        "UHVyY2hhc2VDb2Rl" + "=" + v + ";expires=" + d + ";path=/";
    },
    checkCookie: function (val) {
      const v = atob(getCookie("UHVyY2hhc2VDb2Rl"));
      if (val.length !== 0 && v == val) {
        return true;
      } else {
        return false;
      }
    },
  };
})();
// BlsGlozinAdminLi.init();

class QuickView extends PopupBase {
  constructor() {
    super();
    this.html = null;
  }

  onThisClick() {
    this.classList.add("loading");
    fetch(this.url)
      .then((response) => response.text())
      .then((text) => {
        this.html = parser
          .parseFromString(text, "text/html")
          .querySelector(
            "#shopify-section-product-quickview .product-quickview__content"
          );
        if (!this.html) return;
        // Load scripts in the HTML content
        this.loadScripts(this.html);
        this.html.classList.remove("hidden");
        this.initPopup(this.html);
      })
      .finally(() => {
        Shopify.PaymentButton.init();
        if (!document.querySelector('div[data-animation="slide_in"')) {
          BlsLazyloadImg.init();
        }
        this.classList.remove("loading");
      })
      .catch((e) => {
        this.classList.remove("loading");
        console.error(e);
      });
  }

  loadScripts(html) {
    const scripts = html.querySelectorAll("script");
    scripts.forEach((script) => {
      const newScript = document.createElement("script");
      newScript.src = script.src;
      newScript.textContent = script.textContent;
      document.body.appendChild(newScript).parentNode.removeChild(newScript);
    });
  }
}

class ButtonQuickView extends QuickView {
  constructor() {
    super();
    this.url = this.dataset.url;
    this.init();
  }

  init() {
    this.addEventListener("click", this.onThisClick.bind(this));
  }
}
customElements.define("button-quickview", ButtonQuickView);

class ButtonSelectOptions extends QuickView {
  constructor() {
    super();
    this.url = this.dataset.url;
    this.init();
  }

  init() {
    this.addEventListener("click", this.onThisClick.bind(this));
  }
}
customElements.define("select-option", ButtonSelectOptions);

class ButtonWishlist extends HTMLElement {
  constructor() {
    super();
    this.productId = this.dataset.productId;
    this.action = this.dataset.action || "remove";
    this.addTooltip = this.dataset.tooltipAdd || "Add to wishlist";
    this.removeTooltip = this.dataset.tooltipRemove || "Remove from wishlist";
    this.redirectTooltip = this.dataset.tooltipRedirect || "Browse wishlist";
    this.tooltipDiv = this.querySelector(".tooltip-content");
    this.init();
  }

  init() {
    this.initializeWishlistStatus();
    this.addEventListener("click", this.onThisClick.bind(this));
  }

  initializeWishlistStatus() {
    const localListProductIds = localStorage.getItem("glozin__wishlist-items");
    if (!localListProductIds) return;
    const parseLocalListProductIds = JSON.parse(localListProductIds);
    const isProductIdContained = parseLocalListProductIds.includes(
      this.productId
    );
    if (isProductIdContained) {
      this.classList.add("active");
      if (this.tooltipDiv) {
        if (this.action === "remove") {
          this.tooltipDiv.textContent = this.removeTooltip;
        } else {
          this.tooltipDiv.textContent = this.redirectTooltip;
        }
      }
    }
  }

  actionWhenClicked(allThisProductIds, isAdd) {
    allThisProductIds.forEach((_this) => {
      if (isAdd === true) {
        _this.classList.add("active");
        const tooltipDiv = _this.querySelector(".tooltip-content");
        if (tooltipDiv) {
          if (this.action === "remove") {
            tooltipDiv.textContent = this.removeTooltip;
          } else {
            tooltipDiv.textContent = this.redirectTooltip;
          }
        }
      } else {
        const tooltipDiv = _this.querySelector(".tooltip-content");
        if (tooltipDiv) {
          tooltipDiv.textContent = this.addTooltip;
        }
        _this.classList.remove("active");
      }
    });
  }

  onThisClick() {
    const localListProductIds = localStorage.getItem("glozin__wishlist-items");
    const allThisProductIds = document.querySelectorAll(
      `button-wishlist[data-product-id="${this.productId}"]`
    );
    let listProductIds = [];
    if (!this.productId) return;
    if (localListProductIds && allThisProductIds.length > 0) {
      // wishlist localstorage exists
      const parseLocalListProductIds = JSON.parse(localListProductIds);
      let isProductIdContained = parseLocalListProductIds.includes(
        this.productId
      );
      if (!isProductIdContained) {
        // case item is not in wishlist
        listProductIds.push(...parseLocalListProductIds, this.productId);
        this.actionWhenClicked(allThisProductIds, true);
      } else {
        // case item is in wishlist
        if (this.action) {
          if (this.action === "remove") {
            const indexOfProductId = parseLocalListProductIds.indexOf(
              this.productId
            );
            parseLocalListProductIds.splice(indexOfProductId, 1);
            listProductIds.push(...parseLocalListProductIds);
            if (this.closest(".wishlist-page-main")) {
              this.closest(".wishlist-list").remove();
              const product = document.querySelectorAll(
                `.wishlist-page-section .product-item__action button-wishlist`
              );
              if (product.length < 1) {
                document
                  .querySelector(".wishlist-no-product-js")
                  .classList.remove("hidden");
              }
            } else {
              this.actionWhenClicked(allThisProductIds, false);
            }
          } else {
            listProductIds.push(...parseLocalListProductIds);
            window.location.href = `${window.shopUrl}${window.Shopify.routes.root}pages/wishlist`;
          }
        } else {
          listProductIds.push(...parseLocalListProductIds);
        }
      }
    } else {
      // wishlist localstorage not exists ==> create new local storage
      listProductIds.push(this.productId);
      this.actionWhenClicked(allThisProductIds, true);
    }
    const stringifyListProductIds = JSON.stringify(listProductIds);
    localStorage.setItem("glozin__wishlist-items", stringifyListProductIds);
    wishlistHeader.init();
  }
}
customElements.define("button-wishlist", ButtonWishlist);

class ButtonCompare extends HTMLElement {
  constructor() {
    super();
    this.productId = this.dataset.productId;
    this.action = this.dataset.action || "remove";
    this.addTooltip = this.dataset.tooltipAdd || "Compare";
    this.removeTooltip = this.dataset.tooltipRemove || "Remove from compare";
    this.redirectTooltip = this.dataset.tooltipRedirect || "Browse compare";
    this.tooltipDiv = this.querySelector(".tooltip-content");
    this.action = this.dataset.action || "remove";
    this.init();
  }

  init() {
    this.initializeCompareStatus();
    this.addEventListener("click", this.onThisClick.bind(this));
  }

  initializeCompareStatus() {
    const localListProductIds = localStorage.getItem("glozin__compare-items");
    if (!localListProductIds) return;
    const parseLocalListProductIds = JSON.parse(localListProductIds);
    const isProductIdContained = parseLocalListProductIds.includes(
      this.productId
    );
    if (isProductIdContained) {
      this.classList.add("active");
      if (this.tooltipDiv) {
        if (this.action === "remove") {
          this.tooltipDiv.textContent = this.removeTooltip;
        } else {
          this.tooltipDiv.textContent = this.redirectTooltip;
        }
      }
    }
  }

  actionWhenClicked(allThisProductIds, isAdd) {
    allThisProductIds.forEach((_this) => {
      if (isAdd === true) {
        _this.classList.add("active");
        const tooltipDiv = _this.querySelector(".tooltip-content");
        if (tooltipDiv) {
          if (this.action === "remove") {
            tooltipDiv.textContent = this.removeTooltip;
          } else {
            tooltipDiv.textContent = this.redirectTooltip;
          }
        }
      } else {
        const tooltipDiv = _this.querySelector(".tooltip-content");
        if (tooltipDiv) {
          tooltipDiv.textContent = this.addTooltip;
        }
        _this.classList.remove("active");
      }
    });
  }

  onThisClick() {
    const localListProductIds = localStorage.getItem("glozin__compare-items");
    const allThisProductIds = document.querySelectorAll(
      `button-compare[data-product-id="${this.productId}"]`
    );
    let listProductIds = [];
    if (!this.productId) return;
    if (localListProductIds && allThisProductIds.length > 0) {
      // compare localstorage exists
      const parseLocalListProductIds = JSON.parse(localListProductIds);
      let isProductIdContained = parseLocalListProductIds.includes(
        this.productId
      );
      if (!isProductIdContained) {
        // case item is not in compare
        listProductIds.push(...parseLocalListProductIds, this.productId);
        this.actionWhenClicked(allThisProductIds, true);
      } else {
        // case item is in compare
        if (this.action) {
          if (this.action === "remove") {
            const indexOfProductId = parseLocalListProductIds.indexOf(
              this.productId
            );
            parseLocalListProductIds.splice(indexOfProductId, 1);
            listProductIds.push(...parseLocalListProductIds);
            this.actionWhenClicked(allThisProductIds, false);
          } else {
            listProductIds.push(...parseLocalListProductIds);
            window.location.href = `${window.shopUrl}${window.Shopify.routes.root}pages/compare`;
          }
        } else {
          listProductIds.push(...parseLocalListProductIds);
        }
      }
    } else {
      // compare localstorage not exists ==> create new local storage
      listProductIds.push(this.productId);
      this.actionWhenClicked(allThisProductIds, true);
    }
    const stringifyListProductIds = JSON.stringify(listProductIds);
    localStorage.setItem("glozin__compare-items", stringifyListProductIds);
  }
}
customElements.define("button-compare", ButtonCompare);

class SwatchFunctions extends SwatchInit {
  constructor() {
    super();
    this.init();
  }

  showColorSwatch() {
    const _this = this;
    if (_this.show_color_swatch != null) {
      _this.show_color_swatch.addEventListener("click", (e) => {
        e.currentTarget.classList.add("hidden");
        _this
          .querySelectorAll(".product__color-swatches--js.hidden")
          .forEach((btn) => {
            btn.classList.remove("hidden");

            setTimeout(() => {
              console.log(btn);
              btn.classList.remove("opacity-0");
            }, 100);
          });
      });
    }
  }

  init() {
    this.querySelectorAll(".product__color-swatches--js").forEach((btn) => {
      this.checkSwatches(btn);
    });
    this.initAction();
  }

  initAction() {
    this.addEventListener("change", this.onVariantChange);
  }

  onVariantChange(e) {
    this.productTarget = this.closest(".product__item-js");
    const target = e.target;
    const variantQtyData = JSON.parse(
      this.productTarget.querySelector(".productVariantsQty").textContent
    );
    this.groupFunctionsInit();
    if (!this.currentVariant) {
      this.groupFunctionsUnavailable(target);
    } else {
      this.groupFunctionsAvailable(variantQtyData, target);
    }
  }
  groupFunctionsInit() {
    this.updateOptions();
    this.updateMasterId();
    this.updatePickupAvailability();
    this.updateVariantStatuses();
    this.updateMediaSticky();
  }
  groupFunctionsUnavailable(target) {
    this.toggleAddButton(true, "", true);
    this.setUnavailable(target);
  }
  groupFunctionsAvailable(variantQtyData, target) {
    this.updateURL();
    this.updateVariantInput();
    this.updatePrice(this.productTarget);
    this.renderProductInfor(this.productTarget, variantQtyData, target);
    this.updateShareUrl();
    this.setAvailable();
  }
  updatePrice(productTarget) {
    if (!this.currentVariant) return;
    if (!productTarget) return;
    const p = document.getElementById(`price-${this.dataset.section}`);
    if (p) p.classList.remove("visibility-hidden");
    const compare_at_price = this.currentVariant.compare_at_price;
    const price = this.currentVariant.price;
    const unit_price = this.currentVariant.unit_price;
    const unit_price_measurement = this.currentVariant.unit_price_measurement;
    const price_format = Shopify.formatMoney(
      this.currentVariant.price,
      themeGlobalVariables.settings.money_format
    );
    if (unit_price && unit_price_measurement) {
      const price_num = Shopify.formatMoney(
        unit_price,
        themeGlobalVariables.settings.money_format
      );
      const price_unit =
        unit_price_measurement.reference_value != 1
          ? unit_price_measurement.reference_value
          : unit_price_measurement.reference_unit;
      if (productTarget.querySelector(".unit-price .number")) {
        productTarget.querySelector(".unit-price .number").innerHTML =
          price_num;
      }
      if (productTarget.querySelector(".unit-price .unit")) {
        productTarget.querySelector(".unit-price .unit").innerHTML = price_unit;
      }
    }
    if (productTarget.querySelector(".price-regular .price")) {
      productTarget.querySelector(".price-regular .price").innerHTML =
        price_format;
    }
    if (productTarget.classList.contains("video-item__popup")) {
      productTarget.querySelector(
        ".shopable-video__product-information .price-regular .price"
      ).innerHTML = price_format;
    }
    let bls__price = productTarget.querySelector(".card-product-price");
    if (productTarget.classList.contains("video-item__popup")) {
      bls__price = productTarget.querySelector(
        ".shopable-video__product-information .card-product-price"
      );
    }
    if (bls__price) {
      if (!bls__price.querySelector(".compare-price")) {
        var ps = document.createElement("div");
        var sp = document.createElement("span");
        var cp = document.createElement("s");
        cp.classList.add("price-item", "compare-price");
        sp.appendChild(cp);
        ps.appendChild(sp);
        ps.classList.add("price-regular");
        bls__price.appendChild(ps);
      }
      const cpp = bls__price.querySelector(".compare-price");

      if (cpp) {
        if (compare_at_price && compare_at_price > price) {
          const compare_format = Shopify.formatMoney(
            compare_at_price,
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
              .classList.add("price--special", "primary-color");
          }
        } else {
          cpp.innerHTML = "";
          if (bls__price.querySelector(".price-regular")) {
            bls__price
              .querySelector(".price-regular")
              .classList.remove("primary-color");
          }
          if (bls__price.querySelector(".price-regular .price")) {
            bls__price.querySelector(".price-regular .price").innerHTML =
              price_format;
            bls__price
              .querySelector(".price-regular .price")
              .classList.remove("price--special", "primary-color");
          }
        }
        if (!this.currentVariant.available) {
          bls__price.classList.add("price--sold-out");
        }
      }
    }
  }
  toggleAddButton(disable = true, text, modifyClass = true) {
    const productForm = document.getElementById(
      `product-form-${this.dataset.section}`
    );
    if (!productForm) return;
    const addButton = productForm.querySelector('[name="add"]');
    const addButtonText = productForm.querySelector('[name="add"] > span');
    if (!addButton) return;

    if (disable) {
      addButton.setAttribute("disabled", "disabled");
      if (text) addButtonText.textContent = text;
    } else {
      addButton.removeAttribute("disabled");
      addButtonText.textContent = window.variantStrings.addToCart;
    }

    if (!modifyClass) return;
  }
  setUnavailable(target) {
    const button = document.getElementById(
      `product-form-${this.dataset.section}`
    );
    const addButton = button.querySelector('[name="add"]');
    const addButtonText = button.querySelector('[name="add"] > span');
    const price = document.getElementById(`price-${this.dataset.section}`);
    const inventory = document.getElementById(
      `Inventory-${this.dataset.section}`
    );
    const sku = document.getElementById(`Sku-${this.dataset.section}`);
    const pricePerItem = document.getElementById(
      `Price-Per-Item-${this.dataset.section}`
    );
    const volumeNote = document.getElementById(
      `Volume-Note-${this.dataset.section}`
    );
    const volumeTable = document.getElementById(
      `Volume-${this.dataset.section}`
    );
    const qtyRules = document.getElementById(
      `Quantity-Rules-${this.dataset.section}`
    );

    if (target) {
      const fieldset = target.closest("fieldset");
      const val = target.value;
      const optionSelected = fieldset.querySelector(".option_value");
      optionSelected.textContent = val;
    }
    if (!addButton) return;
    addButtonText.textContent = window.variantStrings.unavailable;
    if (price) price.classList.add("hidden");
    if (inventory) inventory.classList.add("hidden");
    if (sku) sku.classList.add("hidden");
    if (pricePerItem) pricePerItem.classList.add("hidden");
    if (volumeNote) volumeNote.classList.add("hidden");
    if (volumeTable) volumeTable.classList.add("hidden");
    if (qtyRules) qtyRules.classList.add("hidden");
  }

  setAvailable() {
    const price = document.getElementById(`price-${this.dataset.section}`);
    const inventory = document.getElementById(
      `Inventory-${this.dataset.section}`
    );
    const sku = document.getElementById(`Sku-${this.dataset.section}`);
    const pricePerItem = document.getElementById(
      `Price-Per-Item-${this.dataset.section}`
    );
    const volumeNote = document.getElementById(
      `Volume-Note-${this.dataset.section}`
    );
    const volumeTable = document.getElementById(
      `Volume-${this.dataset.section}`
    );
    const qtyRules = document.getElementById(
      `Quantity-Rules-${this.dataset.section}`
    );

    if (price && price.classList.contains("hidden"))
      price.classList.remove("hidden");
    if (inventory && inventory.classList.contains("hidden"))
      inventory.classList.remove("hidden");
    if (sku && sku.classList.contains("hidden")) sku.classList.remove("hidden");
    if (pricePerItem && pricePerItem.classList.contains("hidden"))
      pricePerItem.classList.remove("hidden");
    if (volumeNote && volumeNote.classList.contains("hidden"))
      volumeNote.classList.remove("hidden");
    if (volumeTable && volumeTable.classList.contains("hidden"))
      volumeTable.classList.remove("hidden");
    if (qtyRules && qtyRules.classList.contains("hidden"))
      qtyRules.classList.remove("hidden");
  }
  updateMedia(variantGroup = false) {
    if (!this.productTarget) return;
    const mediaGalleries = this.productTarget.querySelector("media-gallery");
    const layout = mediaGalleries?.dataset.layout;
    if (!layout) return;
    if (layout === "thumbnail") {
      const swiper = mediaGalleries.querySelector("slide-with-thumbs");
      if (!swiper) return;
      const slide_items = swiper.querySelectorAll(
        ".swiper-wrapper-preview .media-gallery__image.swiper-slide"
      );

      if (slide_items.length == 0) return;

      if (!this.currentVariant?.featured_media) return;
      slide_items.forEach((e, index) => {
        const mediaId = e.getAttribute("data-media-id");
        if (
          mediaId &&
          mediaId ===
            `${this.dataset.section}-${this.currentVariant.featured_media.id}`
        ) {
          const position = e.getAttribute("data-position");
          swiper.functionGoto(!variantGroup ? position - 1 : index);
        }
      });
    } else {
      // mediaGalleries.setActiveMedia(
      //   `${this.dataset.section}-${this.currentVariant.featured_media.id}`,
      //   true
      // );
      const mediaElement = document.querySelector(
        `[data-media-id="${this.dataset.section}-${this.currentVariant.featured_media.id}"]`
      );
      if (mediaElement) {
        mediaElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }
  updateMediaSticky() {
    if (!this.productTarget) return;
    if (!this.currentVariant) return;
    const stickyAddCart = this.productTarget.querySelector("sticky-add-cart");
    if (!stickyAddCart) return;
    if (!this.currentVariant.featured_media) return;
    const imgQuery = stickyAddCart.querySelector("img");
    imgQuery.src = this.currentVariant.featured_media.preview_image.src;
    imgQuery.removeAttribute("srcset");
    imgQuery.removeAttribute("sizes");
  }
  renderProductInfor(productTarget, variantQtyData, target) {
    if (!this.currentVariant) return;
    if (!productTarget) return;
    let qty = 0;
    let percent = 0;
    let sale = false;
    let soldOut = false;
    let pre_order = false;
    let av = this.currentVariant.available;
    let sku = this.currentVariant.sku;
    let im = this.currentVariant.inventory_management;
    const compare_at_price = this.currentVariant.compare_at_price;
    const price = this.currentVariant.price;
    let avaiable = productTarget.querySelector(".available-value");
    let sku_area = productTarget.querySelector(".product__sku");
    // Update option labels
    const productDetailPicker = productTarget.querySelector(
      ".product-detail__variant-picker"
    );
    if (productDetailPicker) {
      const type = productDetailPicker.dataset.type || "swatches";

      const updateOptionValues = (selector) => {
        const optionElements = productTarget.querySelectorAll(selector);
        optionElements.forEach((element, index) => {
          const optionValue = this.currentVariant[`option${index + 1}`];
          if (optionValue) {
            element.innerHTML = optionValue;
          }
        });
      };

      if (type === "swatches") {
        updateOptionValues(".option_value");
      } else {
        updateOptionValues(".option_drop_value .option_value");
        updateOptionValues("swatch-dropdown-select-value .option_value");

        const closestSwatchDropdown = target.closest("swatch-dropdown");
        if (
          closestSwatchDropdown &&
          closestSwatchDropdown.classList.contains("active")
        ) {
          closestSwatchDropdown.classList.remove("active");
        }
      }
    }

    if (sku_area) sku_area.innerHTML = sku ? sku : "N/A";
    variantQtyData.find((variantQty) => {
      if (variantQty.id === this.currentVariant.id) {
        qty = variantQty.qty;
      }
    });

    const countdown = document.querySelector("stock-countdown");
    if (countdown) {
      const itemsLeft = countdown.dataset.itemsLeft;
      const message = countdown.dataset.message;
      if (itemsLeft >= qty && message && qty >= 1) {
        countdown.classList.add("block");
        countdown.classList.remove("hidden");
        const qt = countdown.querySelector("span.count");
        const progressbar = countdown.querySelector(".progressbar-stock");
        let widthProgress;
        if ((qty / itemsLeft) * 100 > 100) {
          widthProgress = 100;
        } else {
          widthProgress = (qty / itemsLeft) * 100;
        }
        progressbar.style.setProperty("--percent", `100%`);

        setTimeout(() => {
          progressbar.style.setProperty("--percent", `${widthProgress}%`);
        }, 850);
        if (qt) {
          qt.innerHTML = qty;
        }
      } else {
        countdown.classList.remove("block");
        countdown.classList.add("hidden");
      }
    }

    const typePercent =
      productTarget.querySelector(".product__badges")?.dataset.saleBadgeType;
    if (compare_at_price && compare_at_price > price && typePercent) {
      sale = true;
      if (typePercent === "percent") {
        percent = ((compare_at_price - price) / compare_at_price) * 100;
      } else if (typePercent === "price") {
        percent = compare_at_price - price;
      }
    }
    if (im === null) {
      soldOut = false;
      pre_order = false;
      if (avaiable) {
        avaiable.innerHTML = window.variantStrings.inStock;
      }
    } else {
      if (av) {
        if (qty < 1) {
          pre_order = true;
          if (avaiable) {
            avaiable.innerHTML = window.variantStrings.preOrder;
          }
        } else {
          soldOut = false;
          pre_order = false;
          if (avaiable) {
            avaiable.innerHTML = window.variantStrings.inStock;
          }
          if (avaiable) {
            avaiable.innerHTML = window.variantStrings.inStock;
          }
        }
      } else {
        soldOut = true;
        if (avaiable) {
          avaiable.innerHTML = window.variantStrings.outStock;
        }
      }
    }
    this.renderLabel(sale, pre_order, soldOut, percent, productTarget);
    this.renderBtnStatus(productTarget, im, av, qty);
  }
  renderLabel(sale, pre_order, soldOut, percent, productTarget) {
    const label = productTarget.querySelector(".product__badges");
    const sale_badge = productTarget.querySelector(".sale_badge");
    const productBadgesScrolling = productTarget.querySelector(
      ".product__badges-sale-scrolling"
    );
    if (sale || pre_order || soldOut) {
      if (!label) {
        var element = document.createElement("div");
        element.classList.add(
          "product__badges",
          "fs-small",
          "flex",
          "flex-wrap",
          "gap-5",
          "uppercase"
        );
        if (sale_badge) {
          sale_badge.appendChild(element);
        }
      }
    }

    if (label) {
      const saleColor = label.dataset.saleColor;
      const soldOutColor = label.dataset.soldOutColor;
      const preOrderColor = label.dataset.preOrderColor;
      const saleBg = label.dataset.saleBg;
      const soldOutBg = label.dataset.soldOutBg;
      const preOrderBg = label.dataset.preOrderBg;
      const show_sale = label?.dataset.showSale === "true";
      const show_pre_order = label?.dataset.showPreorder === "true";
      const show_sold_out = label?.dataset.showSoldOut === "true";
      const saleBadgeType = label?.dataset.saleBadgeType;
      const prd = Shopify.formatMoney(
        percent,
        themeGlobalVariables.settings.money_format
      );
      const dsale = label.querySelector(".product__badges-sale");
      const dsoldout = label.querySelector(".product__badges-sold-out");
      const dpreorder = label.querySelector(".product__badges-pre-order");
      if (sale && show_sale) {
        if (!dsale) {
          var elementsale = document.createElement("div");
          elementsale.classList.add(
            "product__badges-sale",
            "product__badges-inner",
            "py-8",
            "px-15",
            "align-self-start",
            "sale",
            "inline-flex",
            "content-center",
            "subheading_weight",
            "btn-rounded",
            "lh-normal",
            "text-center",
            `${
              saleBadgeType === "percent"
                ? "product__badges-type-percent"
                : "badges"
            }`
          );
          elementsale.style.setProperty("--badges-color", saleColor);
          elementsale.style.setProperty("--badges-bg", saleBg);
          if (saleBadgeType === "price") {
            elementsale.innerHTML = `${
              window.variantStrings.save ? window.variantStrings.save : "Save"
            } ${prd}`;
          } else if (saleBadgeType === "percent") {
            elementsale.innerHTML = -percent.toFixed(0) + "%";
          } else {
            elementsale.innerHTML = `${
              window.variantStrings.sale ? window.variantStrings.sale : "Sale"
            }`;
          }
          if (dsoldout) {
            label.insertBefore(elementsale, dsoldout);
          } else if (dpreorder) {
            label.insertBefore(elementsale, dpreorder);
          } else {
            label.appendChild(elementsale);
          }
        } else {
          if (saleBadgeType === "price") {
            dsale.innerHTML = `${
              window.variantStrings.save ? window.variantStrings.save : "Save"
            } ${prd}`;
          } else if (saleBadgeType === "percent") {
            dsale.innerHTML = -percent.toFixed(0) + "%";
          } else {
            dsale.innerHTML = `${
              window.variantStrings.sale ? window.variantStrings.sale : "Sale"
            }`;
          }
        }
      } else {
        dsale?.remove();
      }
      if (pre_order && show_pre_order) {
        if (!dpreorder) {
          var elementpo = document.createElement("div");
          elementpo.classList.add(
            "product__badges-pre-order",
            "product__badges-inner",
            "py-8",
            "px-15",
            "align-self-start",
            "pre-order",
            "inline-flex",
            "content-center",
            "subheading_weight",
            "btn-rounded",
            "lh-normal",
            "text-center"
          );
          elementpo.style.setProperty("--badges-color", preOrderColor);
          elementpo.style.setProperty("--badges-bg", preOrderBg);
          elementpo.innerHTML = window.variantStrings.preOrder
            ? window.variantStrings.preOrder
            : "Pre-order";
          label.appendChild(elementpo);
        } else {
          dpreorder.innerHTML = window.variantStrings.preOrder
            ? window.variantStrings.preOrder
            : "Pre-order";
        }
      } else {
        dpreorder?.remove();
      }
      if (soldOut && show_sold_out) {
        if (!dsoldout) {
          var elementso = document.createElement("div");
          elementso.classList.add(
            "product__badges-sold-out",
            "product__badges-inner",
            "py-8",
            "px-15",
            "align-self-start",
            "sold-out",
            "inline-flex",
            "content-center",
            "subheading_weight",
            "btn-rounded",
            "lh-normal",
            "text-center"
          );
          elementso.style.setProperty("--badges-color", soldOutColor);
          elementso.style.setProperty("--badges-bg", soldOutBg);
          elementso.innerHTML = window.variantStrings.soldOut
            ? window.variantStrings.soldOut
            : "Sold out";
          label.appendChild(elementso);
        } else {
          dsoldout.innerHTML = window.variantStrings.soldOut
            ? window.variantStrings.soldOut
            : "Sold out";
        }
      } else {
        dsoldout?.remove();
      }
    }

    if (productBadgesScrolling && sale) {
      const dataBadgesScrolling =
        productBadgesScrolling?.dataset.textProductScrolling;
      const allProductBadgesScrolling = productBadgesScrolling.querySelectorAll(
        ".content-badges-scrolling"
      );
      allProductBadgesScrolling.forEach((content) => {
        content.innerText = dataBadgesScrolling.replace(
          "[percent_sale]",
          percent.toFixed(0) + "%"
        );
      });
    }
  }
  renderBtnStatus(productTarget, im, av, qty) {
    if (!productTarget) return;
    let btns_add_cart = productTarget.querySelectorAll(
      ".product_submit_button"
    );
    btns_add_cart.forEach((btn_add_cart) => {
      if (btn_add_cart.querySelector(".btn-label")) {
        if (im === null) {
          btn_add_cart.querySelector(".btn-label").innerHTML =
            window.variantStrings.addToCart;
          btn_add_cart.disabled = false;
        } else {
          if (av) {
            if (qty < 1) {
              btn_add_cart.querySelector(".btn-label").innerHTML =
                window.variantStrings.preOrder;
              btn_add_cart.disabled = false;
            } else {
              btn_add_cart.querySelector(".btn-label").innerHTML =
                window.variantStrings.addToCart;
              btn_add_cart.disabled = false;
            }
          } else {
            btn_add_cart.querySelector(".btn-label").innerHTML =
              window.variantStrings.soldOut;
            btn_add_cart.disabled = true;
          }
        }
      }
    });
  }
  updateVariantStatuses() {
    const selectedOptionOneVariants = this.variantData.filter(
      (variant) => this.querySelector(":checked").value === variant.option1
    );
    const inputWrappers = [...this.querySelectorAll(".product-form__input")];
    inputWrappers.forEach((option, index) => {
      if (index === 0) return;
      const optionInputs = [
        ...option.querySelectorAll('input[type="radio"], option'),
      ];
      const previousOptionSelected =
        inputWrappers[index - 1].querySelector(":checked").value;
      const availableOptionInputsValue = selectedOptionOneVariants
        .filter(
          (variant) =>
            variant.available &&
            variant[`option${index}`] === previousOptionSelected
        )
        .map((variantOption) => variantOption[`option${index + 1}`]);
      this.setInputAvailability(optionInputs, availableOptionInputsValue);
    });
  }
  setInputAvailability(elementList, availableValuesList) {
    elementList.forEach((element) => {
      const value = element.getAttribute("value");
      const availableElement = availableValuesList.includes(value);

      if (element.tagName === "INPUT") {
        element.classList.toggle("option-disabled", !availableElement);
      } else if (element.tagName === "OPTION") {
        element.innerText = availableElement
          ? value
          : window.variantStrings.unavailable_with_option.replace(
              "[value]",
              value
            );
      }
    });
  }
  updateOptions() {
    this.options = [];
    Array.from(this.querySelectorAll("select, fieldset"), (element) => {
      if (element.tagName === "SELECT") {
        let array = element.value.split(" / ");
        array.forEach((item) => this.options.push(item));
      }
      if (element.tagName === "FIELDSET") {
        this.options.push(
          Array.from(element.querySelectorAll("input")).find(
            (radio) => radio.checked
          )?.value
        );
      }
    });
  }
  updateMasterId() {
    this.currentVariant = this.getVariantData().find((variant) => {
      return !variant.options
        .map((option, index) => {
          return this.options[index] === option;
        })
        .includes(false);
    });
  }
  updateURL() {
    if (!this.currentVariant || this.dataset.updateUrl === "false") return;
    window.history.replaceState(
      {},
      "",
      `${this.dataset.url}?variant=${this.currentVariant.id}`
    );
  }
  updateVariantInput() {
    const productForms = document.querySelectorAll(
      `#product-form-${this.dataset.section}, #sticky-addcart-form-${this.dataset.section}`
    );
    productForms.forEach((productForm) => {
      const input = productForm.querySelector('input[name="id"]');
      input.value = this.currentVariant.id;
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });
  }
  updateShareUrl() {
    const copyButton = document.getElementById(`Share-${this.dataset.section}`);
    if (!copyButton || !copyButton.updateUrl) return;
    copyButton.updateUrl(
      `${window.shopUrl}${this.dataset.url}?variant=${this.currentVariant.id}`
    );
    const copyParent = copyButton.closest(".share__content");
    if (!copyParent) return;
    const copySpan = copyParent.querySelector(".copy__url");
    if (!copySpan) return;
    copySpan.innerHTML = `${window.shopUrl}${this.dataset.url}?variant=${this.currentVariant.id}`;
  }
  updatePickupAvailability() {
    const pickUpAvailability = document.querySelector("pickup-availability");
    if (!pickUpAvailability) return;

    if (this.currentVariant && this.currentVariant.available) {
      pickUpAvailability.fetchAvailability(this.currentVariant.id);
    } else {
      pickUpAvailability.removeAttribute("available");
      pickUpAvailability.innerHTML = "";
    }
  }
  getVariantData() {
    this.variantData =
      this.variantData ||
      JSON.parse(this.querySelector('[type="application/json"]').textContent);
    return this.variantData;
  }
}
//Function click dropdown variant
class SwatchDropdownSelectValue extends HTMLElement {
  constructor() {
    super();
    this.addEventListener("click", this.activeFilterSort.bind(this), false);
  }

  activeFilterSort() {
    // Remove active class from all elements except the clicked one
    document.querySelectorAll(".select-custom.active").forEach((element) => {
      if (element !== this.closest(".select-custom")) {
        element.classList.remove("active");
      }
    });

    // Toggle active class on the clicked element
    if (this.closest(".select-custom").classList.contains("active")) {
      this.closest(".select-custom").classList.remove("active");
    } else {
      this.closest(".select-custom").classList.add("active");
    }
  }
}
customElements.define(
  "swatch-dropdown-select-value",
  SwatchDropdownSelectValue
);

// Function to remove active class when clicking outside
function handleClickOutside(event) {
  if (!event.target.closest(".select-custom")) {
    document.querySelectorAll(".select-custom.active").forEach((element) => {
      element.classList.remove("active");
    });
  }
}

// Add event listener to the document
document.addEventListener("click", handleClickOutside);
// End function click dropdown variant

class VariantRadios extends SwatchFunctions {
  constructor() {
    super();
    this.show_color_swatch = this.querySelector(".show_color_swatch");
    this.showColorSwatch();
  }

  init() {
    this.querySelectorAll(".product__color-swatches--js").forEach((btn) => {
      this.checkSwatches(btn);
      this.variantHover(btn);
      btn.addEventListener("click", this.onVariantChange.bind(this), false);
    });
  }

  variantHover(e) {
    const productTarget = e.closest(".product-item");
    if (!productTarget) return;

    const swiperElement = e.closest(".swiper");
    if (!swiperElement) return;

    let timeout;

    const handleMouseOut = () => {
      swiperElement.classList.remove("show-tooltip");
    };

    const handleMouseOver = () => {
      swiperElement.classList.add("show-tooltip");
    };

    e.addEventListener("mouseout", handleMouseOut, false);
    e.addEventListener("mouseover", handleMouseOver, false);
    e.addEventListener("mouseenter", handleMouseOver, false);
    e.addEventListener("mouseleave", handleMouseOut, false);
  }
  onVariantChange(e) {
    e.preventDefault();
    const target = e.currentTarget;
    this.productTarget = this.closest(".product__item-js");
    this.position_swatch = target.dataset.position;
    const variantQtyData = JSON.parse(
      this.productTarget.querySelector(".productItemVariantsQty").textContent
    );
    if (!target.classList.contains("active")) {
      const activeSwatches = target
        .closest(".product__color-swatches")
        .querySelectorAll(".product__color-swatches--js");
      activeSwatches.forEach((el) => {
        el.classList.remove("active");
      });
      target.classList.toggle("active");
      this.groupFunctionsInit(this.getVariantData());
      if (this.currentVariant) {
        this.groupFunctionsAvailable(variantQtyData);
      }
    }
  }
  groupFunctionsInit(variantData) {
    this.updateOptions();
    this.updateMasterId(variantData);
  }
  groupFunctionsAvailable(variantQtyData) {
    this.updatePrice();
    this.updateMedia();
    this.renderProductInfor(variantQtyData);
  }
  updatePrice() {
    if (!this.currentVariant) return;
    if (!this.productTarget) return;
    const p = document.getElementById(`price-${this.dataset.section}`);
    if (p) p.classList.remove("visibility-hidden");
    const compare_at_price = this.currentVariant.compare_at_price;
    const price = this.currentVariant.price;
    const unit_price = this.currentVariant.unit_price;
    const unit_price_measurement = this.currentVariant.unit_price_measurement;
    const price_format = Shopify.formatMoney(
      this.currentVariant.price,
      themeGlobalVariables.settings.money_format
    );
    if (unit_price && unit_price_measurement) {
      const price_num = Shopify.formatMoney(
        unit_price,
        themeGlobalVariables.settings.money_format
      );
      const price_unit =
        unit_price_measurement.reference_value != 1
          ? unit_price_measurement.reference_value
          : unit_price_measurement.reference_unit;
      if (this.productTarget.querySelector(".unit-price .number")) {
        this.productTarget.querySelector(".unit-price .number").innerHTML =
          price_num;
      }
      if (this.productTarget.querySelector(".unit-price .unit")) {
        this.productTarget.querySelector(".unit-price .unit").innerHTML =
          price_unit;
      }
    }
    if (this.productTarget.querySelector(".price-regular .price")) {
      this.productTarget.querySelector(".price-regular .price").innerHTML =
        price_format;
    }
    const bls__price = this.productTarget.querySelector(".card-product-price");
    if (bls__price) {
      if (!bls__price.querySelector(".compare-price")) {
        var ps = document.createElement("div");
        var sp = document.createElement("span");
        var cp = document.createElement("s");
        cp.classList.add("price-item", "dark-gray", "compare-price");
        sp.appendChild(cp);
        ps.appendChild(sp);
        ps.classList.add("price-sale");
        if (this.productTarget.querySelector(".card-product-price")) {
          this.productTarget
            .querySelector(".card-product-price")
            .appendChild(ps);
        }
      }
      const cpp = bls__price.querySelector(".compare-price");
      if (cpp) {
        if (compare_at_price && compare_at_price > price) {
          const compare_format = Shopify.formatMoney(
            compare_at_price,
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
            bls__price
              .querySelector(".price-regular .price")
              .classList.remove("price--special");
            bls__price.querySelector(".price-regular .price").innerHTML =
              price_format;
          }
        }
        if (!this.currentVariant.available) {
          bls__price.classList.add("price--sold-out");
        }
      }
    }
  }
  renderProductInfor(variantQtyData) {
    if (!this.currentVariant) return;
    if (!this.productTarget) return;
    let qty = 0;
    let percent = 0;
    let sale = false;
    let soldOut = false;
    let pre_order = false;
    let av = false;
    let im = false;
    const compare_at_price = this.currentVariant.compare_at_price;
    const price = this.currentVariant.price;
    const productTarget = this.productTarget;
    const productBadgesScrolling = productTarget.querySelector(
      ".product__badges-sale-scrolling"
    );
    const typePercent = productTarget.querySelector(
      ".product__badges-type-percent"
    );
    const vqd = variantQtyData.reduce((acc, item) => {
      const existingItem = acc.find((i) => i.option === item.option);
      if (existingItem) {
        existingItem.qty += item.qty;
        if (item.available === true) {
          existingItem.available = true;
        }
        if (item.mamagement === "") {
          existingItem.mamagement = "";
        }
      } else {
        acc.push(item);
      }
      return acc;
    }, []);
    vqd.find((variantQty) => {
      if (variantQty.option === this.currentVariant.option1) {
        qty = variantQty.qty;
        av = variantQty.available;
        im = variantQty.mamagement;
      }
    });
    if (compare_at_price && compare_at_price > price) {
      sale = true;
      if (productBadgesScrolling || typePercent) {
        percent = ((compare_at_price - price) / compare_at_price) * 100;
      } else {
        percent = compare_at_price - price;
      }
    }
    if (im === "") {
      soldOut = false;
      pre_order = false;
    } else {
      if (av && qty < 1) {
        pre_order = true;
      } else if (!av) {
        soldOut = true;
      }
    }
    this.renderLabel(sale, pre_order, soldOut, percent, this.productTarget);
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
  updateOptions() {
    this.options = Array.from(
      this.productTarget.querySelectorAll(
        ".product__color-swatches--js.active"
      ),
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
  async updateMedia() {
    if (!this.currentVariant) return;
    if (
      !this.productTarget
        .querySelector(".product__media img")
        .classList.contains("hidden")
    ) {
      const productItem = this.productTarget
        .querySelector(".product__media img")
        .closest(".product-item");
      if (
        productItem.querySelector("video") ||
        productItem.querySelector("iframe")
      ) {
        this.productTarget
          .querySelector(".product__media img")
          .classList.add("hidden");
        productItem.querySelector("video")?.classList.remove("hidden");
        productItem.querySelector("iframe")?.classList.remove("hidden");
      }
    }
    if (!this.currentVariant.featured_media) return;
    if (this.productTarget.querySelector(".product__media img")) {
      this.productTarget
        .querySelector(".product__media img")
        .removeAttribute("srcset");
    }
    if (
      this.productTarget
        .querySelector(".product__media img")
        .classList.contains("hidden")
    ) {
      this.productTarget
        .querySelector(".product__media img")
        .classList.remove("hidden");
      const productItem = this.productTarget
        .querySelector(".product__media img")
        .closest(".product-item");
      if (
        productItem.querySelector("video") ||
        productItem.querySelector("iframe")
      ) {
        productItem.querySelector("video")?.classList.add("hidden");
        productItem.querySelector("iframe")?.classList.add("hidden");
      }
    }
    if (this.productTarget.querySelector(".product__media img")) {
      await Motion.animate(
        this.productTarget.querySelector(".product__media img"),
        { opacity: [1, 0] },
        { duration: 0.1, easing: "ease-in" }
      );
      this.productTarget
        .querySelector(".product__media img")
        .setAttribute(
          "src",
          this.currentVariant.featured_media.preview_image.src
        );
      await new Promise((resolve) => {
        this.productTarget.querySelector(".product__media img").onload = () => {
          resolve();
        };
      });
      Motion.animate(
        this.productTarget.querySelector(".product__media img"),
        { opacity: [0, 1] },
        { duration: 0.1, easing: "ease-in" }
      );
    }
  }
}
customElements.define("variant-radios", VariantRadios);

class VariantRadiosDetail extends SwatchFunctions {
  constructor() {
    super();
  }
  groupFunctionsAvailable(variantQtyData, target) {
    this.updateURL();
    this.updateVariantInput();
    this.updatePrice(this.productTarget);
    this.renderProductInfor(this.productTarget, variantQtyData, target);
    this.updateMedia();
    this.updateShareUrl();
    this.mapStickyDropdown();
    this.setAvailable();
  }
  mapStickyDropdown() {
    if (!this.currentVariant || !this.productTarget) return;

    const stickyAddCart = this.productTarget.querySelector("sticky-add-cart");
    if (!stickyAddCart) return;

    const select = stickyAddCart.querySelector("select");
    const detailRadio = this.productTarget.querySelector(
      "variant-radios-detail, variant-group-detail"
    );
    if (!select && detailRadio) return;

    for (let i = 0; i < select.options.length; i++) {
      if (select.options[i].value === this.currentVariant.title) {
        select.options[i].selected = true;

        detailRadio.querySelectorAll("fieldset").forEach((fieldset, index) => {
          fieldset.querySelectorAll("input").forEach((input) => {
            input.removeAttribute("checked");
            if (input.value === this.currentVariant[`option${index + 1}`]) {
              input.checked = true;
            }
          });
        });
        break;
      }
    }
  }
}
customElements.define("variant-radios-detail", VariantRadiosDetail);

class VariantRadiosSingle extends SwatchFunctions {
  constructor() {
    super();
  }
  groupFunctionsAvailable(variantQtyData) {
    this.updateVariantInput();
    this.updatePrice(this.productTarget);
    this.renderProductInfor(this.productTarget, variantQtyData);
    this.updateMedia();
  }
}
customElements.define("variant-radios-single", VariantRadiosSingle);

class VariantGroupDetail extends VariantRadiosDetail {
  constructor() {
    super();
  }

  onVariantChange(e) {
    this.productTarget = this.closest(".product__item-js");
    const variantQtyData = JSON.parse(
      this.productTarget.querySelector(".productVariantsQty").textContent
    );
    this.groupFunctionsInit();

    if (!this.currentVariant) {
      this.groupFunctionsUnavailable(e.target);
      this.checkColorGroup(e);
    } else {
      this.checkColorGroup(e);
      this.updateURL();
      this.updateVariantInput();
      this.updatePrice(this.productTarget);
      this.renderProductInfor(this.productTarget, variantQtyData, e.target);
      this.updateShareUrl();
      this.mapStickyDropdown();
      this.setAvailable();
    }
  }

  checkColorGroup(e) {
    const colorString = this.productTarget.dataset.colorTrigger;
    if (colorString) {
      const colorArray = colorString.split(",");
      const colorSelector = this.productTarget.querySelector(
        `[data-value="${CSS.escape(e.target.value)}"]`
      );
      const dataName = colorSelector?.dataset.name;
      const isColorInput = colorArray.includes(
        dataName ? dataName : e.target.name
      );
      if (isColorInput) {
        const dataValue = colorSelector?.dataset.colorValue;
        this.updateMediaGroup(dataValue ? dataValue : e.target.value);
      } else {
        this.updateMedia();
      }
    }
  }

  updateMediaGroup(altValue) {
    const productHandle = this.dataset.productHandle;
    const desktopLayout = this.productTarget.dataset.desktopLayout;
    const mobileLayout = this.productTarget.dataset.mobileLayout;
    const zoom = this.productTarget.dataset.zoom;
    const sectionId = this.productTarget.dataset.section;
    const zoomAction = this.productTarget.querySelector("zoom-action");
    const elementFeatureProduct = this.productTarget.dataset.typeElement;
    if (!productHandle || !sectionId || !desktopLayout) return;
    if (
      desktopLayout !== "grid_1_column" &&
      desktopLayout !== "grid_2_column" &&
      desktopLayout !== "stack"
    ) {
      fetch(`/products/${productHandle}?section_id=media-gallery-slide`)
        .then((response) => response.text())
        .then((text) => {
          const html = parser.parseFromString(text, "text/html");
          if (!html) return;
          let parentDiv = html.querySelector("slide-with-thumbs");
          parentDiv.classList.add(desktopLayout);
          if (desktopLayout === "thumbnail_left") {
            parentDiv.classList.add(
              "flex-md",
              "gap-10",
              "overflow-hidden",
              "justify-content-right"
            );
          }
          parentDiv.dataset.thumbDirection =
            desktopLayout === "thumbnail_left" ? "vertical" : "horizontal";
          let parentContainer = parentDiv.querySelector(
            ".media-main-swiper .swiper-wrapper"
          );
          let wrapperFeatureProduct =
            this.productTarget.querySelector("slide-with-thumbs");
          let slidePreviewFeatureProduct = wrapperFeatureProduct.querySelector(
            ".media-main-swiper .swiper-wrapper"
          );
          if (zoom === "no_zoom") {
            const noZoomItems = html.querySelectorAll(
              "div.media-gallery__image[data-pane-container]"
            );
            noZoomItems.forEach((item) => {
              if (
                (item.dataset.alt && item.dataset.alt == altValue) ||
                !this.getAllButtonValue().includes(item.dataset.alt)
              ) {
                const mediaDefaultId = item.dataset.media;
                if (mediaDefaultId) {
                  item.setAttribute(
                    "data-media-id",
                    `${sectionId}-${mediaDefaultId}`
                  );
                }
                parentContainer.innerHTML += item.outerHTML;
              }
              if (elementFeatureProduct) {
                slidePreviewFeatureProduct.innerHTML =
                  parentContainer.innerHTML;
                wrapperFeatureProduct.updateSlide();
              }
            });
          } else if (zoom !== "open_lightbox") {
            const driftZoomItems = html.querySelectorAll(
              "div.media-gallery__image[data-pane-container]"
            );
            driftZoomItems.forEach((item) => {
              if (
                (item.dataset.alt && item.dataset.alt == altValue) ||
                !this.getAllButtonValue().includes(item.dataset.alt)
              ) {
                const mediaDefaultId = item.dataset.media;
                if (mediaDefaultId) {
                  item.setAttribute(
                    "data-media-id",
                    `${sectionId}-${mediaDefaultId}`
                  );
                }
                parentDiv.querySelector(".swiper-wrapper").innerHTML +=
                  item.outerHTML;
              }
            });
          } else {
            const zoomItems = html.querySelectorAll("a.media-gallery__image");
            zoomItems.forEach((item) => {
              if (
                (item.dataset.alt && item.dataset.alt == altValue) ||
                !this.getAllButtonValue().includes(item.dataset.alt)
              ) {
                const mediaDefaultId = item.dataset.media;
                if (mediaDefaultId) {
                  item.setAttribute(
                    "data-media-id",
                    `${sectionId}-${mediaDefaultId}`
                  );
                }
                parentContainer.innerHTML += item.outerHTML;
              }
            });
          }
          if (desktopLayout !== "hidden_thumbnail") {
            let thumbHtml = html.querySelector(
              ".media-gallery__append .media-thumb-swiper"
            );
            let thumbHtmlWrapper = thumbHtml.querySelector(".swiper-wrapper");
            let thumbHtmlFeatureProduct = wrapperFeatureProduct.querySelector(
              ".media-thumb-swiper .swiper-wrapper"
            );
            if (!thumbHtml || !thumbHtmlFeatureProduct) return;
            if (mobileLayout !== "show_thumbnails") {
              thumbHtml
                .querySelector(".thumbnail-slide")
                .classList.add("thumbnail-slide__mobile--hidden");
              parentDiv.innerHTML +=
                html.querySelector(".swiper-pagination").outerHTML;
            }
            if (desktopLayout === "thumbnail_bottom") {
              thumbHtml
                .querySelector(".thumbnail-slide")
                .classList.add("mt-10", "thumb-bottom");
              thumbHtml
                .querySelector(".thumbnail-slide")
                .setAttribute("style", "--gap: 15px");
            }
            if (desktopLayout === "thumbnail_left") {
              thumbHtml.classList.add("mt-10");
              if (
                thumbHtml
                  .querySelector(".thumbnail-slide")
                  ?.classList.contains("swiper-horizontal")
              ) {
                thumbHtml
                  .querySelector(".thumbnail-slide")
                  ?.classList.remove("swiper-horizontal");
                thumbHtml
                  .querySelector(".thumbnail-slide")
                  ?.classList.add("swiper-vertical");
              }
            }
            const noZoomItems = html.querySelectorAll(
              "div.media-gallery__image:not([data-pane-container])"
            );
            noZoomItems.forEach((item) => {
              if (
                (item.dataset.alt && item.dataset.alt == altValue) ||
                !this.getAllButtonValue().includes(item.dataset.alt)
              ) {
                const mediaDefaultId = item.dataset.media;
                if (mediaDefaultId) {
                  item.setAttribute(
                    "data-media-id",
                    `${sectionId}-${mediaDefaultId}`
                  );
                }
                thumbHtmlWrapper.innerHTML += item.outerHTML;
              }
            });
            parentDiv.innerHTML += thumbHtml.outerHTML;
            if (elementFeatureProduct) {
              thumbHtmlFeatureProduct.innerHTML = thumbHtmlWrapper.innerHTML;
              wrapperFeatureProduct.updateThumbSlide();
            }
          } else {
            parentDiv.innerHTML +=
              html.querySelector(".swiper-pagination").outerHTML;
          }
          if (!zoomAction) return;
          zoomAction.innerHTML = parentDiv.outerHTML;
          zoomAction.drift = null;
        })
        .finally(() => {
          this.updateMedia(true);
          BlsLazyloadImg.init();
          if (!zoomAction) return;
          if (zoom !== "open_lightbox" && zoom !== "no_zoom") {
            zoomAction.initDrift();
          }
          if (zoom === "open_lightbox" && zoom !== "no_zoom") {
            zoomAction.initLightBox();
          }
        })
        .catch((e) => {
          console.error(e);
        });
    } else {
      fetch(`/products/${productHandle}?section_id=media-gallery-grid`)
        .then((response) => response.text())
        .then((text) => {
          const html = parser.parseFromString(text, "text/html");
          if (!html) return;
          let parentDiv = document.createElement("div");
          if (desktopLayout === "stack") {
            parentDiv.classList.add(
              "stacked",
              "grid",
              "gap-10",
              "grid_scroll",
              "grid-cols"
            );
          }
          if (
            desktopLayout === "grid_1_column" ||
            desktopLayout === "grid_2_column"
          ) {
            parentDiv.classList.add("grid-cols", "grid", "gap", "grid_scroll");
          }
          if (
            desktopLayout === "stack" ||
            desktopLayout === "grid_1_column" ||
            desktopLayout === "grid_2_column"
          ) {
            parentDiv.id = `GalleryViewer-${sectionId}`;
          }
          if (desktopLayout === "grid_1_column") {
            parentDiv.setAttribute(
              "style",
              "--col-number: 1;--col-desktop: 1;--col-tablet: 1;--col-gap: 10px;"
            );
          }
          if (desktopLayout === "grid_2_column" || desktopLayout === "stack") {
            if (window.innerWidth > 768) {
              parentDiv.setAttribute(
                "style",
                "--col-number: 2;--col-tablet: 2;--col-gap: 10px;"
              );
            } else {
              parentDiv.setAttribute(
                "style",
                "--col-number: 1.2;--col-tablet: 2;--col-gap: 10px;"
              );
            }
          }
          if (zoom === "no_zoom") {
            const noZoomItems = html.querySelectorAll(
              "div.media-gallery__image:not([data-pane-container])"
            );
            noZoomItems.forEach((item) => {
              if (
                (item.dataset.alt && item.dataset.alt == altValue) ||
                !this.getAllButtonValue().includes(item.dataset.alt)
              ) {
                const mediaDefaultId = item.dataset.media;
                if (mediaDefaultId) {
                  item.setAttribute(
                    "data-media-id",
                    `${sectionId}-${mediaDefaultId}`
                  );
                }
                parentDiv.innerHTML += item.outerHTML;
              }
            });
            if (elementFeatureProduct) {
              const wrapperGrid = this.productTarget.querySelector(
                `#GalleryViewer-${sectionId}`
              );
              wrapperGrid.innerHTML = parentDiv.innerHTML;
            }
          } else if (zoom !== "open_lightbox") {
            const driftZoomItems = html.querySelectorAll(
              "div.media-gallery__image[data-pane-container]"
            );
            driftZoomItems.forEach((item) => {
              if (
                (item.dataset.alt && item.dataset.alt == altValue) ||
                !this.getAllButtonValue().includes(item.dataset.alt)
              ) {
                const mediaDefaultId = item.dataset.media;
                if (mediaDefaultId) {
                  item.setAttribute(
                    "data-media-id",
                    `${sectionId}-${mediaDefaultId}`
                  );
                }
                parentDiv.innerHTML += item.outerHTML;
              }
            });
          } else {
            const zoomItems = html.querySelectorAll("a.media-gallery__image");
            zoomItems.forEach((item) => {
              if (
                (item.dataset.alt && item.dataset.alt == altValue) ||
                !this.getAllButtonValue().includes(item.dataset.alt)
              ) {
                const mediaDefaultId = item.dataset.media;
                if (mediaDefaultId) {
                  item.setAttribute(
                    "data-media-id",
                    `${sectionId}-${mediaDefaultId}`
                  );
                }
                parentDiv.innerHTML += item.outerHTML;
              }
            });
          }
          if (!zoomAction) return;
          zoomAction.innerHTML = parentDiv.outerHTML;
          zoomAction.drift = null;
        })
        .finally(() => {
          this.updateMedia(true);
          BlsLazyloadImg.init();
          if (!zoomAction) return;
          if (zoom !== "open_lightbox" && zoom !== "no_zoom") {
            zoomAction.initDrift();
          }
          if (zoom === "open_lightbox" && zoom !== "no_zoom") {
            zoomAction.initLightBox();
          }
        })
        .catch((e) => {
          console.error(e);
        });
    }
  }
  getAllButtonValue() {
    const buttonArray = [];
    this.querySelectorAll(
      ".product__color-swatches--js, .product-sticky-js"
    ).forEach((btn) => {
      if (
        btn.classList.contains("product__color-swatches--js") &&
        btn.dataset.value
      ) {
        buttonArray.push(btn.dataset.value);
      } else if (
        btn.classList.contains("product-sticky-js") &&
        btn.dataset.colorValue
      ) {
        buttonArray.push(btn.dataset.colorValue);
      }
    });
    return buttonArray;
  }
}
customElements.define("variant-group-detail", VariantGroupDetail);

class VariantRadiosSticky extends VariantRadiosDetail {
  constructor() {
    super();
  }
}
customElements.define("variant-radios-sticky", VariantRadiosSticky);

class VariantGroupSticky extends VariantGroupDetail {
  constructor() {
    super();
  }
}
customElements.define("variant-group-sticky", VariantGroupSticky);

class CountdownTimer extends HTMLElement {
  constructor() {
    super();
    this.timeoutMessage = this.dataset.timeoutMessage;
    this.format = this.dataset.format || "dd:hh:mm:ss";
    this.interval = null;
    this.init();
  }
  init() {
    const cddl = this.dataset?.endtime;

    const minutesLeft = this.dataset.minutesLeft;
    const countdownAppend = this.querySelector(".countdown-inner");
    if (countdownAppend) {
      countdownAppend.innerHTML = this.appendChildHtml(minutesLeft).innerHTML;
    } else {
      this.innerHTML = this.appendChildHtml(minutesLeft).innerHTML;
    }

    if (cddl) {
      let isoDate = "";
      if (this.isISODate(cddl)) {
        isoDate = cddl;
        this.mainFunction(isoDate, minutesLeft);
      } else {
        if (this.isValidDateTime(cddl)) {
          isoDate = new Date(cddl).toISOString();
          this.mainFunction(isoDate, minutesLeft);
        } else if (this.isValidDate(cddl)) {
          const dateParts = cddl.split("-");
          isoDate =
            dateParts[2] +
            "-" +
            dateParts[0].padStart(2, "0") +
            "-" +
            dateParts[1].padStart(2, "0") +
            "T00:00:00Z";
          this.mainFunction(isoDate, minutesLeft);
        } else {
          this.mainFunction(isoDate, minutesLeft);
        }
      }
    } else {
      let isoDate = "";
      this.mainFunction(isoDate, minutesLeft);
    }
  }

  mainFunction(isoDate, minutesLeft) {
    let timeLeft = {};
    const calculateTimeLeft = (difference) => {
      let timeLeft = {};

      if (this.format.includes("dd")) {
        timeLeft.days_timer = Math.floor(difference / (1000 * 60 * 60 * 24));
      }

      if (this.format.includes("hh")) {
        if (this.format.includes("dd")) {
          timeLeft.hours_timer = Math.floor(
            (difference / (1000 * 60 * 60)) % 24
          );
        } else {
          timeLeft.hours_timer = Math.floor(difference / (1000 * 60 * 60));
        }
      }

      if (this.format.includes("mm")) {
        if (this.format === "mm:ss") {
          timeLeft.minutes_timer = Math.floor(difference / 1000 / 60);
        } else {
          timeLeft.minutes_timer = Math.floor((difference / 1000 / 60) % 60);
        }
      }

      if (this.format.includes("ss")) {
        timeLeft.seconds_timer = Math.floor((difference / 1000) % 60);
      }

      return timeLeft;
    };

    if (Date.parse(isoDate) || minutesLeft) {
      let deadline = new Date(isoDate);
      if (minutesLeft) {
        deadline = new Date(Date.now() + parseInt(minutesLeft) * 60000);
      }
      const updateCountdown = () => {
        const now = new Date();
        const difference = deadline - now;
        if (difference > 0) {
          timeLeft = calculateTimeLeft(difference);
        } else {
          timeLeft = calculateTimeLeft(0);
        }

        if (
          timeLeft.days_timer > 0 ||
          timeLeft.hours_timer > 0 ||
          timeLeft.minutes_timer > 0 ||
          timeLeft.seconds_timer > 0 ||
          !this.timeoutMessage
        ) {
          Object.entries(timeLeft).forEach(([key, value]) => {
            if (this.querySelector("." + key)) {
              this.querySelector("." + key).innerHTML = value
                .toString()
                .padStart(2, "0");
            }
          });
        } else if (this.timeoutMessage) {
          this.innerHTML = this.timeoutMessage;
          clearInterval(this.interval);
        } else {
          clearInterval(this.interval);
        }
        this.classList.remove("hidden");
        const badgesCountdown = this.closest(".product__badges-sale-countdown");
        if (badgesCountdown) {
          badgesCountdown.classList.remove("hidden");
          badgesCountdown.classList.add("inline-flex");
        }
      };
      this.interval = setInterval(updateCountdown, 1000);
      // Chạy ngay lập tức để tránh bị trễ
      updateCountdown();
    } else {
      timeLeft = calculateTimeLeft(0);
      Object.entries(timeLeft).forEach(([key, value]) => {
        if (this.querySelector("." + key)) {
          this.querySelector("." + key).innerHTML = value
            .toString()
            .padStart(2, "0");
        }
      });
    }
  }

  appendChildHtml(minutesLeft) {
    const days = this.dataset?.days;
    const hours = this.dataset?.hours;
    const mins = this.dataset?.mins;
    const secs = this.dataset?.secs;
    const container = document.createElement("div");
    container.innerHTML = `${
      !minutesLeft
        ? `${
            this.format.includes("dd")
              ? `<div class="countdown--container"><span class="days_timer count-timer"></span><span class="timer_announcementbar--text"> ${
                  days ? days : ""
                }</span></div>`
              : ""
          }${
            this.format.includes("hh")
              ? `<div class="countdown--container"><span class="hours_timer count-timer"></span><span class="timer_announcementbar--text"> ${
                  hours ? hours : ""
                }</span></div>`
              : ""
          }`
        : ""
    }<div class="countdown--container"><span class="minutes_timer count-timer"></span><span class="timer_announcementbar--text"> ${
      minutesLeft ? "m" : mins ? mins : ""
    }</span></div><div class="countdown--container"><span class="seconds_timer count-timer"></span><span class="timer_announcementbar--text"> ${
      minutesLeft ? "s" : secs ? secs : ""
    }</span></div>`;
    return container;
  }
  isISODate(dateString) {
    const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
    return isoRegex.test(dateString);
  }
  isValidDateTime(dateString) {
    const dateTimeRegex = /^\d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}$/;
    return dateTimeRegex.test(dateString);
  }
  isValidDate(dateString) {
    var regex = /^\d{2}-\d{2}-\d{4}$/;
    if (regex.test(dateString)) {
      return true;
    } else {
      return false;
    }
  }
}
customElements.define("countdown-timer", CountdownTimer);

// js for product form - not done yet
if (!customElements.get("product-form")) {
  customElements.define(
    "product-form",
    class ProductForm extends PopupBase {
      constructor() {
        super();
        this.form = this.querySelector("form");
        this.form.querySelector("[name=id]").disabled = false;
        this.form.addEventListener("submit", this.onSubmitHandler.bind(this));
        this.cart =
          document.querySelector("cart-notification") ||
          document.querySelector("cart-drawer");
        this.submitButton = this.querySelector('[type="submit"]');
        this.hideErrors = this.dataset.hideErrors === "true";
        this.productItem =
          this.form.closest(".product-item") ||
          this.form.closest("sticky-add-cart");
        this.cartPage = document.body.classList.contains("template-cart");
      }

      onSubmitHandler(evt) {
        evt.preventDefault();
        if (this.submitButton.getAttribute("aria-disabled") === "true") return;

        this.handleErrorMessage();
        this.submitButton.setAttribute("aria-disabled", true);
        const cartRecommend = document.querySelector(".cart-recommend");
        if (cartRecommend && cartRecommend.classList.contains("open")) {
          cartRecommend.classList.remove("open");
        }
        this.submitButton.classList.add("loading");
        const config = fetchConfig("javascript");
        config.headers["X-Requested-With"] = "XMLHttpRequest";
        delete config.headers["Content-Type"];

        const formData = new FormData(this.form);
        const productInfo = this.form.closest(".product-detail__information");
        if (productInfo) {
          productInfo
            .querySelectorAll("product-property input")
            .forEach((property) => {
              if (property.classList.contains("file") && property.files[0]) {
                formData.append(property.name, property.files[0]);
              } else if (
                property.classList.contains("text") &&
                property.value
              ) {
                formData.append(property.name, property.value);
              }
            });
        }
        if (this.cart) {
          formData.append(
            "sections",
            this.cart.getSectionsToRender().map((section) => section.id)
          );
          formData.append("sections_url", window.location.pathname);
          this.cart.setActiveElement(document.activeElement);
        }
        if (this.cartPage) {
          formData.append(
            "sections",
            this.getMainCartSectionRender().map((section) => section.id)
          );
        }
        config.body = formData;

        fetch(`${routes.cart_add_url}`, config)
          .then((response) => response.json())
          .then((response) => {
            if (response.status) {
              publish(PUB_SUB_EVENTS.cartError, {
                source: "product-form",
                productVariantId: formData.get("id"),
                errors: response.errors || response.description,
                message: response.message,
              });
              this.handleErrorMessage(response.description);
              if (this.productItem) {
                this.handleErrorMessagePopup(response.description);
              }
              return;
            } else if (response.sections) {
              if (!response.id && !response.items) {
                this.handleErrorMessagePopup(window.cartStrings.error);
                return;
              }
            } else if (!this.cart) {
              window.location = window.routes.cart_url;
              return;
            }

            fetch("/cart.json")
              .then((res) => res.json())
              .then((cart) => {
                if (cart.item_count != undefined) {
                  document.querySelectorAll(".cart-count").forEach((el) => {
                    if (el.classList.contains("cart-count-drawer")) {
                      el.innerHTML = `(${cart.item_count})`;
                    } else {
                      el.innerHTML =
                        cart.item_count > 100 ? "~" : cart.item_count;
                    }
                  });
                  if (document.querySelector("header-total-price")) {
                    document
                      .querySelector("header-total-price")
                      .updateTotal(cart);
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

            publish(PUB_SUB_EVENTS.cartUpdate, {
              source: "product-form",
              productVariantId: formData.get("id"),
              cartData: response,
            });
            const modalQuickview = document.querySelector(
              ".tingle-modal--visible.tingle-modal.quickview .tingle-modal__close"
            );
            const modalShopableVideo = document.querySelector(
              ".tingle-modal--visible.tingle-modal.shopable-video .tingle-modal__close"
            );
            let time = 0;
            if (modalQuickview || modalShopableVideo) {
              if (
                document.documentElement
                  .querySelector("body")
                  .classList.contains("tingle-enabled")
              ) {
                document.documentElement
                  .querySelector("body")
                  .classList.remove("tingle-enabled");
              }
              if (modalShopableVideo) {
                time += 250;
                modalShopableVideo.click();
              }
              if (modalQuickview) {
                time += 250;
                modalQuickview.click();
              }
            }
            if (!this.cartPage) {
              if (!response.errors) {
                this.cart.getSectionsToRender().forEach((section) => {
                  const elementToReplace = document.getElementById(section.id);
                  const html = new DOMParser().parseFromString(
                    response.sections[section.id],
                    "text/html"
                  );
                  if (elementToReplace) {
                    elementToReplace.innerHTML =
                      html.querySelector("#minicart-form").innerHTML;
                  }
                });
                this.cart.cartAction();
                if (this.cart && this.cart.classList.contains("is-empty")) {
                  this.cart.classList.remove("is-empty");
                }

                setTimeout(() => {
                  this.cart.open();
                  const cartRecommend =
                    document.querySelector(".cart-recommend");
                  if (
                    cartRecommend &&
                    !cartRecommend.classList.contains("hidden-recommend")
                  ) {
                    if (
                      cartRecommend.classList.contains("cart-recommend-custom")
                    ) {
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
                }, time);
              }
            } else {
              if (!response.errors) {
                this.getMainCartSectionRender().forEach((section) => {
                  if (section.selector != undefined) {
                    const elementToReplace =
                      document
                        .getElementById(section.id)
                        .querySelector(section.selector) ||
                      document.getElementById(section.id);
                    elementToReplace.innerHTML = this.getSectionInnerHTML(
                      response.sections[section.id],
                      section.selector
                    );
                    const cart_gift_html = new DOMParser()
                      .parseFromString(
                        response.sections[section.id],
                        "text/html"
                      )
                      .querySelector("#gift");
                    const cart_gift = document.getElementById("gift");
                    if (cart_gift) {
                      cart_gift.innerHTML = cart_gift_html.innerHTML;
                      const gift_form_minicart =
                        document.getElementById("gift_form_minicart");
                      if (gift_form_minicart) {
                        gift_form_minicart.addEventListener(
                          "change",
                          (event) => {
                            if (event.currentTarget.checked) {
                              this.addGiftwrapCartClick(gift_form_minicart);
                            } else {
                              this.updateQuantity(
                                event.currentTarget.dataset.index,
                                0
                              );
                            }
                          }
                        );
                      }
                    }
                  }
                });
                var wrapperDiv = document.createElement("div");
                var messageDiv = document.createElement("div");
                messageDiv.className = `mt-10 newsletter-form__message--success success form__message inline-flex align-center`;
                messageDiv.setAttribute("tabindex", "-1");
                messageDiv.innerHTML = `
               <svg width="18" height="18" fill="none">
              <g stroke="#137F24" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.3"><path d="m6.033 8.992 1.972 1.98 3.952-3.96"/><path d="M7.973 1.178c.565-.482 1.49-.482 2.062 0l1.293 1.113c.245.213.704.385 1.03.385h1.392c.867 0 1.579.712 1.579 1.579v1.39c0 .32.172.786.384 1.032l1.113 1.292c.483.565.483 1.49 0 2.062l-1.113 1.293a1.813 1.813 0 0 0-.384 1.03v1.392c0 .867-.712 1.579-1.58 1.579h-1.39c-.32 0-.786.172-1.031.384l-1.293 1.113c-.564.483-1.489.483-2.062 0L6.681 15.71a1.813 1.813 0 0 0-1.031-.384H4.234c-.867 0-1.579-.712-1.579-1.58v-1.398c0-.32-.172-.778-.376-1.023l-1.105-1.301c-.474-.565-.474-1.48 0-2.045L2.28 6.677c.204-.246.376-.704.376-1.023V4.247c0-.868.712-1.58 1.58-1.58H5.65c.319 0 .785-.171 1.03-.384l1.293-1.105Z"/></g>
            </svg>
              `;
                var span = document.createElement("span");
                span.className = "ml-5";
                span.textContent = window.variantStrings.addSuccess;
                messageDiv.appendChild(span);
                wrapperDiv.appendChild(messageDiv);
                if (this.cartPage) {
                  showToast(wrapperDiv.innerHTML, 3000, "modal-success");
                }

                const totals = this.getSectionInnerHTML(
                  response.sections["main-cart-items"],
                  ".cart-info .totals"
                );
                const totals_content =
                  document.querySelector(".cart-info .totals");
                if (totals && totals_content) totals_content.innerHTML = totals;
              }
            }
          })
          .catch((e) => {
            console.error(e);
          })
          .finally(() => {
            BlsLazyloadImg.init();
            if (document.documentElement.classList.contains("open-popup")) {
              document.documentElement.classList.remove("open-popup");
            }
            this.submitButton.classList.remove("loading");
            if (this.cart && this.cart.classList.contains("is-empty"))
              this.cart.classList.remove("is-empty");
            this.submitButton.removeAttribute("aria-disabled");
          });
      }

      getMainCartSectionRender() {
        return [
          {
            id: "main-cart-items",
            section: document.getElementById("main-cart-items")?.dataset.id,
            selector: ".js-contents",
          },
        ];
      }

      getSectionInnerHTML(html, selector) {
        return new DOMParser()
          .parseFromString(html, "text/html")
          .querySelector(selector).innerHTML;
      }

      handleErrorMessage(errorMessage = false) {
        if (this.hideErrors) return;

        this.errorMessageWrapper =
          this.errorMessageWrapper ||
          this.querySelector(".product-form__error-message-wrapper");
        if (!this.errorMessageWrapper) return;
        this.errorMessage =
          this.errorMessage ||
          this.errorMessageWrapper.querySelector(
            ".product-form__error-message"
          );

        this.errorMessageWrapper.toggleAttribute("hidden", !errorMessage);

        if (errorMessage) {
          this.errorMessage.textContent = errorMessage;
        }
      }

      handleErrorMessagePopup(errorMessage = false) {
        const url = `${window.location.pathname}?section_id=form-message`;
        fetch(url)
          .then((response) => response.text())
          .then((responseText) => {
            const html = new DOMParser().parseFromString(
              responseText,
              "text/html"
            );
            const elementErrorMessage = html.querySelector(
              ".product-form__error-message-wrapper"
            );
            const elementMessage = elementErrorMessage.querySelector(
              ".product-form__error-message"
            );
            elementMessage.textContent = errorMessage;
            showToast(elementErrorMessage.innerHTML, 3000, "modal-error");
          })
          .catch((e) => {
            throw e;
          });
      }
    }
  );
}

// js loadmor product for collection and section product grid
class Loadmore extends HTMLElement {
  constructor() {
    super();
    this.button = this.querySelector("button");
    this.collectionUrl = this.dataset.collectionUrl;
    this.sectionId = this.dataset.sectionId;
    this.all = this.dataset.allProducts;
    this.limit = this.dataset.limit;
    this.blockId = this.dataset.blockId;
    this.init();
  }
  init() {
    const _this = this;
    if (!this.button) return;
    this.button.addEventListener("click", function () {
      _this.scanData();
    });
  }
  scanData() {
    const _this = this;
    let url = this.dataset.url;
    if (!url) return;
    let sectionContainer = document.querySelector(
      `#shopify-section-${this.sectionId}`
    );
    sectionContainer?.classList.add("bls-image-js");
    this.querySelector("button").classList.add("loading");
    fetch(this.collectionUrl + url + `&section_id=${this.sectionId}`)
      .then((response) => response.text())
      .then((text) => {
        const html = parser.parseFromString(text, "text/html");
        let parentDiv = this.closest(".sec__products-loadmore");
        if (!parentDiv) return;
        let elements,
          itemDiv,
          fetchDiv,
          page,
          times,
          limit,
          remainder,
          end_load;
        if (this.blockId) {
          itemDiv = parentDiv.querySelector(
            `.collection-tab-${this.blockId} .product-ajax__append`
          );
          fetchDiv = html.querySelector(
            `.sec__products-loadmore .collection-tab-${this.blockId} .product-ajax__append`
          );
          elements = fetchDiv.querySelectorAll(".grid-custom-item");
        } else {
          itemDiv = parentDiv.querySelector(".product-ajax__append");
          fetchDiv = html.querySelector(
            ".sec__products-loadmore .product-ajax__append"
          );
          elements = fetchDiv.querySelectorAll(".grid-custom-item");
        }
        if (!itemDiv || !fetchDiv) return;
        page = Number(this.dataset.url.replace("?page=", ""));
        times = page * this.limit;
        limit = this.limit;
        end_load = false;
        if (times >= this.all) {
          end_load = true;
          limit = this.limit - (times - this.all);
        }
        elements.forEach((prodNode, index) => {
          index = index + 1;
          if (end_load && limit < index) {
            return;
          }
          itemDiv.appendChild(prodNode);
        });
      })
      .finally(() => {
        _this.updateUrl(Number(this.dataset.url.replace("?page=", "")));
        this.querySelector("button")?.classList.remove("loading");
        BlsAnimations.init();
        initLazyloadItem();
        BlsLazyloadImg.init();
      })
      .catch((e) => {
        console.error(e);
      });
  }
  updateUrl(e) {
    if (this.all && this.limit && this.all > 0) {
      const times = ~~(this.all / this.limit);
      const remainder = this.all % this.limit;
      let pages = times;
      if (remainder > 0) {
        pages = times + 1;
      }
      if (e < pages) {
        this.dataset.url = "?page=" + ++e;
      } else {
        const btn = this.querySelector("button");
        if (btn) {
          btn.remove();
        }
      }
    }
  }

  handleCountItemToShow(pages) {
    if (this.all && this.limit && pages) {
      if (Number(this.all) < Number(this.limit) * pages) {
        const itemsNeedToRemove = Number(this.limit) * pages - Number(this.all);
        return itemsNeedToRemove;
      }
    }
    return 0;
  }
}
customElements.define("loadmore-function", Loadmore);

// js lookbook item
class LookbookItem extends HTMLElement {
  constructor() {
    super();
    this.itemPopup = this.querySelector(".lookbook-item__popup");
    this.type = this.dataset.type;
    this.position = this.dataset.productPosition;
    this.lookbookProductDiv = this.closest(".sec__lookbook-product");
    this.instagramShop = this.closest(".popup-content");
    this.allDots = this.closest(".sec__lookbook-product");
    this.currentAnimation = null;
    this.activeTooltip = null;
    this.isAnimating = false;
    this.init();
    document.body.addEventListener("click", this.onClickOutside.bind(this));
  }
  init() {
    if (this.type === "open" || this.type === "slide") {
      const atag = this.querySelector("a");
      if (!atag) return;
      atag.addEventListener("click", this.onClick.bind(this));
      this.addEventListener("mouseover", this.onMouseoverPopup.bind(this));
      this.addEventListener("mouseleave", this.hideProductInfo.bind(this));
      const closeButton = this.querySelector("icon-close");
      if (!closeButton) return;
      closeButton.addEventListener("click", this.onClose.bind(this));
    }
  }
  onClickOutside(event) {
    if (!event.target.closest("lookbook-item")) {
      this.onClose();
    }
  }
  onClick() {
    if (this.type === "open") {
      if (this.itemPopup) {
        const thisSection = this.closest("section");
        if (!thisSection) return;
        const allPopups = thisSection.querySelectorAll(".lookbook-item__popup");
        if (window.innerWidth >= 1024) {
          allPopups.forEach((popup) => {
            if (popup !== this.itemPopup) {
              popup.classList.add("invisible");
              const thisClosest = popup.closest("lookbook-item");
              if (thisClosest) {
                thisClosest.classList.remove("open");
              }
            }
          });
          this.onToggle();
        } else {
          const modal = new tingle.modal({
            footer: false,
            stickyFooter: false,
            closeMethods: ["overlay", "button", "escape"],
            closeLabel: "Close",
            cssClass: ["lookbook-modal"],
            onOpen: function () {},
            onClose: function () {},
            beforeClose: function () {
              return true;
            },
          });
          modal.setContent(
            this.itemPopup.querySelector(".product-item").innerHTML
          );
          modal.open();
        }
      }
    } else {
      if (this.lookbookProductDiv && this.position) {
        const slideSEction = this.lookbookProductDiv.querySelector(
          "slide-section-lookbook"
        );
        const allDots = this.lookbookProductDiv.querySelectorAll(
          `lookbook-item[data-type="slide"]`
        );
        allDots.forEach((dot) => {
          dot.classList.remove("active");
        });
        this.classList.add("active");
        if (slideSEction) {
          slideSEction.functionGoto(this.position);
        }
      } else if (this.instagramShop && this.position) {
        const slideSEction = this.instagramShop.querySelector(
          "slide-section-instagram"
        );
        if (slideSEction) {
          slideSEction.functionGoto(this.position);
        }
        const allDots = this.instagramShop.querySelectorAll(
          `lookbook-item[data-type="slide"]`
        );
        allDots.forEach((dot) => {
          dot.classList.remove("active");
        });
        this.classList.add("active");
      }
    }
  }
  onToggle() {
    this.itemPopup?.classList.toggle("invisible");
    this.classList.toggle("open");
  }
  onClose() {
    this.itemPopup?.classList.add("invisible");
    this.classList.remove("open");
  }
  onMouseoverPopup(e) {
    const _this = this;
    if (window.innerWidth < 1024) return;
    _this.showProductInfo(this);
  }
  showProductInfo(container) {
    const existingTooltip = document.querySelector(".product-tooltip");
    if (existingTooltip) {
      return;
    }

    if (this.isAnimating) {
      this.forceCleanupTooltips();
    }
    const template = container.querySelector("template");
    const content = document.createElement("div");
    content.className = "product-tooltip";
    content.appendChild(template.content.firstElementChild.cloneNode(true));

    content.style.opacity = "0";
    content.style.transform = "translateY(20px)";

    const tooltip = document.body.appendChild(content);
    this.activeTooltip = tooltip;

    const triggerRect = container.getBoundingClientRect();
    const tooltipWidth = tooltip.offsetWidth;
    tooltip.style.zIndex = "9999";
    tooltip.style.left =
      24 + triggerRect.left + triggerRect.width / 2 - tooltipWidth / 2 + "px";
    tooltip.style.top = triggerRect.bottom + 10 + window.scrollY + "px";

    tooltip.setAttribute("tabindex", "-1");

    setTimeout(() => {
      if (this.activeTooltip === tooltip) {
        this.isAnimating = true;
        this.currentAnimation = Motion.animate(
          tooltip,
          {
            opacity: 1,
            y: 0,
          },
          {
            duration: 0.2,
            easing: "ease-out",
            onComplete: () => {
              tooltip
                .querySelector(".lookbook-item__hover")
                .classList.add("active");
              this.isAnimating = false;
              this.currentAnimation = null;
            },
          }
        );
      }
    }, 10);
  }
  forceCleanupTooltips() {
    const tooltips = document.querySelectorAll(".product-tooltip");
    tooltips.forEach((tooltip) => {
      if (tooltip.parentNode) {
        Motion.animate(
          tooltip,
          {
            opacity: 0,
            y: 20,
          },
          {
            duration: 0.3,
            easing: "ease-in",
            onComplete: () => {
              if (tooltip.parentNode) {
                tooltip.parentNode.removeChild(tooltip);
              }
            },
          }
        );
      }
    });

    if (this.currentAnimation) {
      this.currentAnimation.cancel();
      this.currentAnimation = null;
    }
    this.isAnimating = false;
    this.activeTooltip = null;
  }
  hideProductInfo() {
    if (this.currentAnimation) {
      this.currentAnimation.cancel();
      this.currentAnimation = null;
    }

    const tooltip = document.querySelector(".product-tooltip");
    if (tooltip) {
      if (this.isAnimating) {
        if (tooltip.parentNode) {
          tooltip.parentNode.removeChild(tooltip);
        }
        this.isAnimating = false;
        this.activeTooltip = null;
        return;
      }

      this.isAnimating = true;
      this.currentAnimation = Motion.animate(
        tooltip,
        {
          opacity: 0,
          y: 20,
        },
        {
          duration: 0.2,
          easing: "ease-in",
          onComplete: () => {
            if (tooltip.parentNode) {
              tooltip.parentNode.removeChild(tooltip);
            }
            this.isAnimating = false;
            this.currentAnimation = null;
            this.activeTooltip = null;
          },
        }
      );
    }
  }
}
customElements.define("lookbook-item", LookbookItem);

// js lookbook item
class SectionSlideLookbook extends SlideSection {
  constructor() {
    super();
    this.init();
  }
  init() {
    this.initSlide();
  }
  functionGoto(position) {
    this.globalSlide.slideTo(position - 1, 500);
  }
}
customElements.define("slide-section-lookbook", SectionSlideLookbook);

class SectionSlideInstagramShop extends SlideSection {
  constructor() {
    super();
    this.init();
  }
  init() {
    this.initSlide();
  }
  functionGoto(position) {
    this.globalSlide.slideTo(position - 1, 500);
  }
}
customElements.define("slide-section-instagram", SectionSlideInstagramShop);

// js for tab item
class TabItems extends HTMLElement {
  constructor() {
    super();
    this.tabs = this.querySelectorAll(".collection-tab__tab-item");
    this.select = this.querySelector(".select-collection-tab");
    this.content = this.querySelectorAll(".collection-tab__tab-content");
    this.select_li = this.querySelectorAll(".collection_title_input");
    this.type = this.dataset.type;
    this.init();
  }
  init() {
    if (this.type === "horizontal") {
      const self = this;
      this.tabs.forEach((tab) => {
        tab.addEventListener("click", function () {
          self.onClick(this);
        });
      });
    } else {
      const self = this;
      this.select.addEventListener("click", function (e) {
        if (e.target.classList.contains("select__selected_title")) {
          let select__dropdown = this.querySelector(".select-custom__content");
          this.classList.toggle("active");
          select__dropdown.classList.toggle("invisible");
        }
      });
      document.addEventListener("click", function (event) {
        if (!event.target.closest(".select-collection-tab")) {
          self.select.classList.remove("active");
          document
            .querySelectorAll(".select-collection-tab .select-custom__content")
            ?.forEach((item) => {
              item.classList.add("invisible");
            });
        }
      });
      this.select_li.forEach((item) => {
        item.addEventListener("click", function () {
          self.onClickBySelect(this);
          self.select.classList.remove("active");
          document
            .querySelectorAll(".select-collection-tab .select-custom__content")
            ?.forEach((item) => {
              item.classList.add("invisible");
            });
        });
      });
    }
  }
  onClick(tab) {
    const blockId = tab.dataset.blockId;
    this.showContent(blockId);
    this.tabs.forEach((t) => {
      t.classList.remove("active");
    });
    tab.classList.add("active");
  }

  onClickBySelect(selectedBlockId) {
    let select__selected_title = this.querySelector(".select__selected_title");
    select__selected_title.innerHTML =
      selectedBlockId.innerHTML +
      `<svg class="icon-down transition active-rotated" width="10" height="6">
    <use href="#icon-arrow-down"></use>
  </svg>`;
    this.showContent(selectedBlockId.dataset.id);
  }

  showContent(blockId) {
    this.content.forEach((content) => {
      if (content.dataset.blockId === blockId) {
        content.classList.add("active");
        let motion_element = content.querySelectorAll("motion-element");
        motion_element.forEach((motion) => {
          Motion.refreshAnimation();
        });
      } else {
        content.classList.remove("active");
      }
    });
  }
}
customElements.define("tab-items", TabItems);

// js for shopable video
class ShopableVideo extends PopupBase {
  constructor() {
    super();
    this.popupDiv = this.querySelector(".video-item__popup");
    this.productPopupDiv = this.querySelector(".video-item__product-mobile");
    this.init();
  }
  init() {
    if (this.popupDiv || !this.classList.contains("instagram-item")) {
      window.addEventListener("resize", this.responsive.bind(this));
      window.addEventListener("load", this.responsive.bind(this));
      this.addEventListener("click", this.onClick.bind(this));
      this.connectedCallback();
    }
    if (this.productPopupDiv) {
      this.productPopupDiv.addEventListener(
        "click",
        this.onClickMobile.bind(this.productPopupDiv)
      );
    }
  }
  onClick() {
    if (this.popupDiv) {
      const html = this.popupDiv;
      const popup = document.querySelector(".tingle-modal.shopable-video");
      if (!html || popup) return;
      html.classList.remove("hidden");
      this.initPopup(html);
    } else {
      if (this.classList.contains("instagram-item")) {
        const sectionId = this.dataset.sectionId;
        const index = this.dataset.index;
        const url = `${window.location.pathname}?section_id=${sectionId}&ajax=1`;
        var _this = this;
        fetch(`${url}`)
          .then((response) => {
            if (!response.ok) {
              var error = new Error(response.status);
              throw error;
            }
            return response.text();
          })
          .then((responseText) => {
            const newSection = new DOMParser()
              .parseFromString(responseText, "text/html")
              .querySelector(`.popup-index-${index}`);
            _this.appendChild(newSection);
          })
          .catch((error) => {
            throw error;
          })
          .finally(() => {
            const html = _this.querySelector(".popup-content");
            if (html) {
              html.classList.remove("hidden");
              this.initPopup(html);
            }
          });
      }
    }
  }
  onCloseEvent() {
    const popup = document.querySelector(".tingle-modal.shopable-video");
    if (!popup) return;
    const productInformation = popup.querySelector(
      ".shopable-video__product-information"
    );
    if (!productInformation) return;
    productInformation.classList.add("hidden");
  }
  connectedCallback() {
    const handleIntersection = (entries, observer) => {
      if (!entries[0].isIntersecting) return;
      observer.unobserve(this);
      const videos = this.querySelectorAll("video");
      videos.forEach((video) => {
        const dataSrc = video.dataset.src;
        if (dataSrc) {
          video.src = dataSrc;
          video.removeAttribute("data-src");
        }
      });
    };

    new IntersectionObserver(handleIntersection.bind(this), {
      rootMargin: "0px 0px 200px 0px",
    }).observe(this);
  }
  responsive() {
    const productDivs = document.querySelectorAll(
      ".shopable-video__product-information"
    );
    if (productDivs.length != 0) {
      if (window.innerWidth >= 768) {
        const flexDiv = this.popupDiv?.querySelector(
          ".video-item__popup--flex"
        );
        if (!flexDiv) return;
        productDivs.forEach((div) => {
          div.classList.remove("hidden");
        });
      } else {
        const flexDiv = this.popupDiv?.querySelector(
          ".video-item__popup--flex"
        );
        if (!flexDiv) return;
        productDivs.forEach((div) => {
          div.classList.add("hidden");
        });
      }
    }
  }
  onClickMobile() {
    const popup = this.closest(".video-item__popup");
    if (!popup) return;
    const productInformation = popup.querySelector(
      ".shopable-video__product-information"
    );
    if (!productInformation) return;
    productInformation.classList.toggle("hidden");
  }
}
customElements.define("shopable-video", ShopableVideo);

// js for shopable video
class InstagramShop extends ShopableVideo {
  constructor() {
    super();
    this.popupDiv = this.querySelector(".popup-content");
    if (this.popupDiv || this.classList.contains("instagram-item")) {
      this.addEventListener("click", this.onClick.bind(this));
    }
  }
}
customElements.define("instagram-shop", InstagramShop);

// js for grid custom
class GridCustom extends SlideSection {
  constructor() {
    super();
    this.enable = this.dataset.enable;
    this.parentElementt = document.querySelector(
      `#shopify-section-${this.dataset?.sectionId}`
    );
    this.loadmore = this.parentElementt?.querySelectorAll("loadmore-function");
    this.viewAll = this.parentElementt?.querySelector(".view_all");
    this.swiperSlideInnerHtml = this.innerHTML;
    this.init();
  }
  init() {
    if (this.enable == "true") {
      let width = window.innerWidth;
      window.addEventListener("resize", () => {
        const newWidth = window.innerWidth;
        if (newWidth <= 767 && width > 767) {
          this.actionOnMobile();
        }
        if (newWidth > 767 && width <= 767) {
          this.actionOutMobile();
        }
        width = newWidth;
      });
      if (width <= 767) {
        this.actionOnMobile();
      }
    }
  }
  actionOnMobile() {
    this.classList.add("swiper");
    this.classList.remove("grid", "grid-cols");
    if (this.viewAll) {
      this.viewAll.classList.add("hidden");
    }
    if (this.loadmore && this.loadmore.length > 0) {
      this.loadmore.forEach((button) => {
        button.classList.add("hidden");
        button.classList.remove("block");
      });
    }
    const html = this.swiperSlideInnerHtml.replaceAll(
      "grid-custom-item",
      "swiper-slide"
    );
    const wrapper = `<div class='swiper-wrapper'>${html}</div> <div
    class="swiper-pagination  ${
      this.enable && this.dataset.mobile != 1.5 ? "flex" : "hidden"
    } px-15 lh-1 bottom-30 justify-content-center"
    style="--swiper-pagination-bottom: 3rem;--swiper-pagination-position: static;"
  ></div> `;
    this.innerHTML = wrapper;
    this.initSlide();
  }
  actionOutMobile() {
    this.classList.remove("swiper");
    this.classList.add("grid", "grid-cols");
    if (this.viewAll) {
      this.viewAll.classList.remove("hidden");
    }
    this.innerHTML = this.swiperSlideInnerHtml;
    if (this.loadmore && this.loadmore.length > 0) {
      this.loadmore.forEach((button) => {
        button.classList.add("block");
        button.classList.remove("hidden");
      });
    }
  }
}
customElements.define("grid-custom", GridCustom);

// js for slide with thumbnails
class SlideWithThumbs extends HTMLElement {
  constructor() {
    super();
    this.globalSlide = null;
    this.thumbnailSlide = null;
    this.init();
  }
  init() {
    const nothumb = this.dataset?.nothumb;
    if (!nothumb) {
      this.initThumbnail();
      if (Shopify.designMode) {
        document.addEventListener("shopify:section:load", () =>
          this.initThumbnail()
        );
      }
    }

    this.initSlide();
    this.pauseMedia();
    this.playMedia();
  }

  initSlide() {
    var autoplaying = this?.dataset.autoplay === "true";
    const loop = this?.dataset.loop === "true";
    const itemMobile = this?.dataset.mobile ? this?.dataset.mobile : 1;
    const itemDesktop = this?.dataset.desktop ? this?.dataset.desktop : 4;
    var itemTablet = this?.dataset.tablet ? this?.dataset.tablet : "";
    var direction = this?.dataset.direction
      ? this?.dataset.direction
      : "horizontal";
    var autoplaySpeed = this?.dataset.autoplaySpeed
      ? this?.dataset.autoplaySpeed * 1000
      : 3000;
    var speed = this?.dataset.speed ? this?.dataset.speed : 400;
    const effect = this?.dataset.effect ? this?.dataset.effect : "slide";
    var spacing = this?.dataset.spacing ? this?.dataset.spacing : 30;
    spacing = Number(spacing);
    autoplaySpeed = Number(autoplaySpeed);
    speed = Number(speed);
    if (autoplaying) {
      autoplaying = { delay: autoplaySpeed };
    }
    if (window.innerWidth < 767) {
      direction = "horizontal";
    }
    const container = this.querySelector(".main-slide__navigation");
    const initSwiper = this.querySelector(".swiper-wrapper-preview");
    var _this = this;
    this.globalSlide = new Swiper(initSwiper, {
      slidesPerView: itemMobile,
      spaceBetween: spacing >= 15 ? 15 : spacing,
      autoplay: autoplaying,
      direction: direction,
      loop: loop,
      effect: effect,
      speed: speed,
      watchSlidesProgress: true,
      watchSlidesVisibility: true,
      navigation: {
        nextEl: container?.querySelector(".swiper-button-next"),
        prevEl: container?.querySelector(".swiper-button-prev"),
      },
      pagination: {
        clickable: true,
        el: this.querySelector(".swiper-pagination"),
        type: "custom",
        renderCustom: function (swiper, current, total) {
          return current + "/" + total;
        },
      },
      breakpoints: {
        768: {
          slidesPerView: itemTablet,
        },
        1025: {
          slidesPerView: itemDesktop,
        },
      },
      on: {
        init: function () {
          var slide_visibles = _this.querySelectorAll(
            ".swiper-slide:not(.swiper-slide-visible) motion-element"
          );
          slide_visibles?.forEach((slide) => {
            if (typeof slide?.initialize === "function") slide?.initialize();
          });
          const currentSlide = this.slides[this.activeIndex];
          if (
            currentSlide &&
            currentSlide.classList.contains("cloudimage-360")
          ) {
            this.allowTouchMove = false;
          } else {
            this.allowTouchMove = true;
          }
        },
        slideChange: function () {
          const currentSlide = this.slides[this.activeIndex];
          if (currentSlide) {
            if (
              currentSlide.classList.contains("media-gallery__model") ||
              currentSlide.classList.contains("cloudimage-360")
            ) {
              this.allowTouchMove = false;
            } else {
              this.allowTouchMove = true;
            }
          }
        },
      },
      thumbs: {
        swiper: this.thumbnailSlide ? this.thumbnailSlide : null,
      },
    });
  }

  initThumbnail() {
    const container = this.querySelector(".thumbnail-slide");
    if (!container) return;
    var direction = this.dataset.thumbDirection
      ? this.dataset.thumbDirection
      : "horizontal";
    const slidesPerView = this.dataset.thumbSlidesPerView
      ? this.dataset.thumbSlidesPerView
      : 4;
    const spaceBetween = this.dataset.thumbSpaceBetween
      ? this.dataset.thumbSpaceBetween
      : 10;
    const watchSlidesVisibility = this.dataset.thumbWatchSlidesVisibility
      ? this.dataset.thumbWatchSlidesVisibility
      : true;
    const watchOverflow = this.dataset.thumbWatchOverflow
      ? this.dataset.thumbWatchOverflow
      : true;
    this.thumbnailSlide = new Swiper(container, {
      // centeredSlides: true,
      // centeredSlidesBounds: true,
      direction: "horizontal",
      spaceBetween: spaceBetween,
      slidesPerView: 5,
      watchSlidesVisibility: watchSlidesVisibility,
      watchSlidesProgress: true,
      watchOverflow: watchOverflow,
      breakpoints: {
        768: {
          direction: direction,
          slidesPerView: direction == "vertical" ? 10 : 6,
        },
      },
    });
  }

  pauseMedia() {
    this.globalSlide.on("slideChange", function () {
      window.pauseAllMedia();
    });
  }

  playMedia() {
    const autoplay = this?.dataset.autoPlayVideo === "true";
    if (!autoplay) return;
    // Load Vimeo API
    var vimeoTag = document.createElement("script");
    vimeoTag.src = "https://player.vimeo.com/api/player.js";
    document.head.appendChild(vimeoTag);
    this.globalSlide.on("slideChangeTransitionEnd", function () {
      var activeSlide = this.slides[this.activeIndex];
      var video = activeSlide.querySelector(".media-video");
      if (video) {
        if (video.tagName === "VIDEO") {
          video.play();
        } else if (video.tagName === "IFRAME") {
          // Play Vimeo
          if (video.src.includes("vimeo")) {
            var vimeoPlayer = new Vimeo.Player(video);
            vimeoPlayer.play();
          }
          // Play YouTube
          if (video.src.includes("youtube")) {
            video.contentWindow.postMessage(
              '{"event":"command","func":"playVideo","args":""}',
              "*"
            );
          }
        }
      }
    });
  }

  playActiveSlideVideo(swiper) {}

  functionGoto(position) {
    this.globalSlide.slideTo(position, 500);
  }

  updateSlide() {
    this.globalSlide.update();
  }

  updateThumbSlide() {
    this.thumbnailSlide.update();
  }

  appendSlide(item) {
    this.globalSlide.appendSlide(item);
  }
}
customElements.define("slide-with-thumbs", SlideWithThumbs);

class ProductRecentlyViewed extends SlideSection {
  constructor() {
    super();
  }
  init() {
    this.call();
  }
  initData() {
    var savedProductsArr = JSON.parse(
      localStorage.getItem("glozin__recently-viewed-products")
    );
    this.getStoredProducts(savedProductsArr);
  }
  getStoredProducts(p) {
    const limit = this.dataset?.limit;

    if (limit) {
      var query = "";
      var productAjaxURL = "";

      if (p && p.length > 0) {
        const sortedIds = p.slice();
        const idsToUse = sortedIds.slice(0, limit);
        query = idsToUse.join("%20OR%20id:");
        productAjaxURL = `&q=id:${query}`;
      }
    }
    fetch(`${this.dataset.url}${productAjaxURL}`)
      .then((response) => response.text())
      .then((text) => {
        const html = document.createElement("div");
        html.innerHTML = text;
        const recentlyViewedProducts = html.querySelector(
          "recently-viewed-products"
        );
        if (
          recentlyViewedProducts &&
          recentlyViewedProducts.innerHTML.trim().length
        ) {
          this.innerHTML = recentlyViewedProducts.innerHTML;
        }
        if (recentlyViewedProducts.innerHTML.trim().length === 0) {
          this.remove();
        }
      })
      .finally(() => {
        if (this.querySelector(".swiper-wrapper")) {
          this.initSlide();
        }
        initLazyloadItem();
        BlsLazyloadImg.init();
      })
      .catch((e) => {
        console.error(e);
      });
  }
  call() {
    const __this = this;
    const handleIntersection = (entries, observer) => {
      if (!entries[0].isIntersecting) return;
      observer.unobserve(this);
      __this.initData();
    };

    new IntersectionObserver(handleIntersection.bind(this), {
      rootMargin: "0px 0px 400px 0px",
    }).observe(this);
  }
}
customElements.define("recently-viewed-products", ProductRecentlyViewed);

// js gallery
class MediaGallery extends HTMLElement {
  constructor() {
    super();
  }
  setActiveMedia(mediaId, prepend) {
    const activeMedia = this.querySelector(
      '[id^="GalleryViewer"]'
    ).querySelector(`[data-media-id="${mediaId}"]`);
    if (!activeMedia) return;
    this.querySelector('[id^="GalleryViewer"]')
      .querySelectorAll("[data-media-id]")
      .forEach((element) => {
        element.classList.remove("is-active");
      });
    activeMedia.classList.add("is-active");

    if (prepend) {
      activeMedia.parentElement.prepend(activeMedia);
    }
  }
}
customElements.define("media-gallery", MediaGallery);

function pauseAllMedia() {
  document.querySelectorAll(".js-youtube").forEach((video) => {
    video.contentWindow.postMessage(
      '{"event":"command","func":"' + "pauseVideo" + '","args":""}',
      "*"
    );
  });
  document.querySelectorAll(".js-vimeo").forEach((video) => {
    video.contentWindow.postMessage('{"method":"pause"}', "*");
  });
  document.querySelectorAll("video").forEach((video) => video.pause());
  document.querySelectorAll("product-model").forEach((model) => {
    if (model.modelViewerUI) model.modelViewerUI.pause();
  });
}

var BlsCustomer = (function () {
  return {
    init: function () {
      this.toggleForm(), this.deleteAddresses(), this.addAddresses();
    },
    toggleForm: function () {
      const e = document.querySelector(".add-address");
      const c = document.querySelector(".cancel-add");
      if (e !== null && c !== null) {
        e.addEventListener("click", () => {
          if (e.getAttribute("aria-expanded") === "false") {
            e.setAttribute("aria-expanded", "true");
            e.closest(".bls-customer__address").classList.add("active");
          } else {
            e.setAttribute("aria-expanded", "false");
            e.closest(".bls-customer__address").classList.remove("active");
          }
        });
        c.addEventListener("click", () => {
          if (
            c.closest(".bls-customer__address").classList.contains("active")
          ) {
            e.closest(".bls-customer__address").classList.remove("active");
            e.closest(".add-address").setAttribute("aria-expanded", "false");
          }
        });
      }
    },
    deleteAddresses: function () {
      const btn = document.querySelectorAll(".address-delete");
      btn.forEach((e) => {
        e.addEventListener("click", () => {
          const id = e?.dataset.formId;
          const msg = e?.dataset.confirmMessage;
          if (confirm(msg || "Are you sure you wish to delete this address?")) {
            Shopify.postLink("/account/addresses/" + id, {
              parameters: { _method: "delete" },
            });
          }
        });
      });
    },
    addAddresses: function () {
      if (Shopify && document.getElementById("AddressCountryNew")) {
        new Shopify.CountryProvinceSelector(
          "AddressCountryNew",
          "AddressProvinceNew",
          {
            hideElement: "AddressProvinceNewContainer",
          }
        );
      }
      const edit = document.querySelectorAll(".edit-country-option");
      edit.forEach((e) => {
        const formId = e?.dataset.formId;
        const editCountry = "AddressCountry_" + formId;
        const editProvince = "AddressProvince_" + formId;
        const editContainer = "AddressProvinceContainer_" + formId;
        new Shopify.CountryProvinceSelector(editCountry, editProvince, {
          hideElement: editContainer,
        });
      });
    },
  };
})();
BlsCustomer.init();
class IdeaProducts extends PopupBase {
  constructor() {
    super();
    this.view_idea_product = this.querySelector(".view_idea_product");
    this.content = this.querySelector(".idea-product-list");
    this.close = this.querySelector(".close");
    this.header = this.dataset.contentHeader;
    this.popup = this.dataset.popup == "true";
    this.init();
  }
  init() {
    const _this = this;
    this.view_idea_product.addEventListener("click", (e) => {
      _this.toggleViewIdeaProducts("show");
    });
    this.close.addEventListener("click", (e) => {
      _this.toggleViewIdeaProducts.bind(_this)();
    });
    document.addEventListener(
      "modal:opened",
      this.handleModalOpened.bind(this)
    );
  }

  toggleViewIdeaProducts(type = "hidden") {
    if (type == "hidden") {
      this.classList.remove("active");
    } else {
      if (this.popup) {
        if (window.innerWidth <= 767) {
          const content =
            this.querySelector("template").content.firstElementChild.cloneNode(
              true
            ).outerHTML;
          if (content) {
            this.initPopup(
              content,
              `<h3 class="title-popup h5 my-0 px-20 px-md-30 py-20 border-bottom">${this.header}</h3>`,
              "popup-idea-product"
            );
          }
        } else {
          this.classList.add("active");
        }
      } else {
        this.classList.add("active");
      }
    }
  }

  handleModalOpened() {
    BlsLazyloadImg.init();
  }
}

customElements.define("idea-product", IdeaProducts);

const outfit_idea = document.querySelector(".outfit_idea");
if (outfit_idea) {
  document.body.addEventListener("click", function (event) {
    if (!event.target.closest(".idea-product")) {
      const ideaProductInstances = document.querySelectorAll("idea-product");
      ideaProductInstances.forEach((instance) => {
        instance.toggleViewIdeaProducts();
      });
    }
  });
}

class GridList extends HTMLElement {
  constructor() {
    super();
    if (!this.hasAttribute("hold")) {
      Motion.inView(this, this.showGridItems.bind(this), {
        margin: "0px 0px -5px 0px",
      });
    }
  }

  get gridItems() {
    return this.querySelectorAll(
      "motion-element[hold]:not([data-image]):not([style*='opacity: 1']"
    );
  }

  get visibleGridItems() {
    return this.querySelectorAll(
      "motion-element:not([data-image])[style*='opacity: 1']"
    );
  }
  hideGrid() {
    Motion.animate(
      this.gridItems,
      { transform: "translateY(3.5rem)", opacity: 0.01, visibility: "hidden" },
      { duration: 0 }
    );
  }

  hideGridItems() {
    if (!this.hasAttribute("hold")) {
      Motion.animate(
        this.visibleGridItems,
        {
          transform: ["translateY(0)", "translateY(3.5rem)"],
          opacity: [1, 0.01],
          visibility: ["visible", "hidden"],
        },
        {
          duration: 0.4,
          delay: Motion.stagger(0.1),
          easing: [0, 0, 0.3, 1],
        }
      );
    }
  }

  showGridItems() {
    if (!this.hasAttribute("hold")) {
      Motion.animate(
        this.gridItems,
        {
          transform: ["translateY(3.5rem)", "translateY(0)"],
          opacity: [0.01, 1],
          visibility: ["hidden", "visible"],
        },
        {
          duration: 0.47,
          delay: Motion.stagger(0.15, { startDelay: 0.1 }),
          easing: [0, 0, 0.3, 1],
        }
      );
    }
  }
}
customElements.define("grid-list", GridList);
class ProgressStockBar extends HTMLElement {
  constructor() {
    super();
    Motion.inView(this, this.init.bind(this), { margin: "0px 0px -10px 0px" });
  }

  init() {
    this.style.setProperty("--percent", `100%`);

    setTimeout(() => {
      this.style.setProperty("--percent", `${this.dataset.progress}%`);
    }, 200);
  }
}
customElements.define("progress-stock-bar", ProgressStockBar);
class HeaderTotalPrice extends HTMLElement {
  constructor() {
    super();
  }
  updateTotal(cart) {
    this.minicart_total = this.querySelector("[data-cart-subtotal-price]");
    if (!this.minicart_total) return;
    if (cart.total_price == undefined) return;
    const price_format = Shopify.formatMoney(
      cart.total_price,
      cartStrings?.money_format
    );
    this.minicart_total.innerHTML = price_format;
  }
}
customElements.define("header-total-price", HeaderTotalPrice);
class ProductWithBanner extends HTMLElement {
  constructor() {
    super();
    this.bannerImages = this.querySelectorAll(".product-banner__image");
    this.init();
  }

  init() {
    this.waitForSlideSection();
  }

  waitForSlideSection() {
    const slideSection = this.querySelector("slide-section");
    if (!slideSection || !slideSection.globalSlide) {
      setTimeout(() => this.waitForSlideSection(), 100);
      return;
    }
    slideSection.updateActiveBanner = () => {};
    slideSection.globalSlide.on("slideChange", () => {
      this.updateActiveBanner(slideSection.globalSlide);
    });
    this.updateActiveBanner(slideSection.globalSlide, true);
  }

  updateActiveBanner(swiper, isInitial = false) {
    if (!swiper || !this.bannerImages || this.bannerImages.length <= 0) return;
    if (isInitial) {
    } else {
      const activeSlide = swiper.slides[swiper.activeIndex];
      if (!activeSlide) return;
      const blockIdFromSlide = activeSlide.dataset.blockId;
      const backgroundColor = activeSlide.dataset.backgroundColor;
      this.style.setProperty(
        "--content_bg_color",
        backgroundColor || "#ffffff"
      );
      const blockId =
        blockIdFromSlide ||
        activeSlide.querySelector(".block-content__item")?.dataset.blockId ||
        this.querySelectorAll(".swiper-slide")[swiper.realIndex]?.dataset
          .blockId;
      this.bannerImages.forEach((image) => {
        image.classList.remove("active");
      });
      let matchingBanner;
      if (blockId) {
        matchingBanner = Array.from(this.bannerImages).find(
          (image) => image.dataset.blockId === blockId
        );
      }

      if (matchingBanner) {
        matchingBanner.classList.add("active");
      } else {
        const index = swiper.realIndex;
        if (this.bannerImages[index]) {
          this.bannerImages[index].classList.add("active");
        }
      }
    }
  }
}
customElements.define("product-with-banner", ProductWithBanner);
