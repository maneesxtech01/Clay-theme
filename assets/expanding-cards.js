/* Expanding Cards Section JavaScript Component */

if (!customElements.get("expanding-card")) {
  class ComponentExpandingCard extends HTMLElement {
    constructor() {
      super();
      this.video = this.querySelector("video");
      if (this.video) {
        this.addEventListener("mouseenter", () => {
          // Play video on desktop hover
          if (window.innerWidth > 1056) {
            this.video.play().catch(e => {});
          }
        });
        this.addEventListener("mouseleave", () => {
          if (window.innerWidth > 1056) {
            this.video.pause();
          }
        });
      }
    }
  }
  customElements.define("expanding-card", ComponentExpandingCard);
}

(function() {
  function bindRow(row) {
    if (row.getAttribute("data-expanding-cards-row-initialized") === "true") return;
    
    var scroller = row.querySelector(".cards-container");
    var dotsWrap = row.querySelector(".expanding-cards-dots");
    var dots = dotsWrap ? dotsWrap.querySelectorAll(".keen-dots-dot") : [];
    var cards = scroller ? scroller.querySelectorAll("expanding-card") : [];

    if (!scroller || cards.length < 2) return;
    
    row.setAttribute("data-expanding-cards-row-initialized", "true");

    function setScrollableUi() {
      var scrollable = scroller.scrollWidth > scroller.clientWidth + 5;
      if (dotsWrap) {
        if (scrollable) {
          dotsWrap.removeAttribute("hidden");
          dotsWrap.style.display = "flex";
        } else {
          dotsWrap.setAttribute("hidden", "");
          dotsWrap.style.display = "none";
        }
      }
    }

    function setActive(index) {
      dots.forEach(function(dot, idx) {
        var on = idx === index;
        dot.classList.toggle("active", on);
        dot.setAttribute("aria-current", on ? "true" : "false");
      });
    }

    function updateActiveFromScroll() {
      var mid = scroller.scrollLeft + scroller.clientWidth * 0.5;
      var best = 0;
      var bestDist = Infinity;
      for (var c = 0; c < cards.length; c++) {
        var card = cards[c];
        var cardMid = card.offsetLeft + card.offsetWidth * 0.5;
        var dist = Math.abs(cardMid - mid);
        if (dist < bestDist) {
          bestDist = dist;
          best = c;
        }
      }
      setActive(best);
    }

    // Scroll throttle handler
    var throttleTimeout = null;
    function onScroll() {
      if (throttleTimeout) return;
      throttleTimeout = setTimeout(function() {
        updateActiveFromScroll();
        throttleTimeout = null;
      }, 50);
    }

    scroller.addEventListener("scroll", onScroll, { passive: true });

    // Resize handler
    var resizeTimeout = null;
    window.addEventListener("resize", function() {
      if (resizeTimeout) return;
      resizeTimeout = setTimeout(function() {
        setScrollableUi();
        updateActiveFromScroll();
        resizeTimeout = null;
      }, 150);
    });

    // Dot click listeners
    dots.forEach(function(dot, i) {
      dot.addEventListener("click", function() {
        if (cards[i]) {
          cards[i].scrollIntoView({
            behavior: "smooth",
            inline: "center",
            block: "nearest"
          });
        }
      });
    });

    // Initialize UI states
    setScrollableUi();
    updateActiveFromScroll();
  }

  function scan(root) {
    var scope = root && root.querySelectorAll ? root : document;
    scope.querySelectorAll("[data-expanding-cards-row]").forEach(bindRow);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() {
      scan(document);
    });
  } else {
    scan(document);
  }

  // Bind customizer reload events
  document.addEventListener("shopify:section:load", function(ev) {
    if (ev.target && ev.target.querySelectorAll) {
      scan(ev.target);
    }
  });
})();
