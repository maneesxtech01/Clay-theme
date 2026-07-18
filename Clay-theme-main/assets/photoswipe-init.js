'use-strict';

import PhotoSwipeLightbox from './photoswipe-lightbox.esm.min.js';
import Photoswipe from './photoswipe.esm.min.js';
// js gallery
class ZoomAction extends HTMLElement {
  constructor() {
    super();
    this.type = this.dataset.type || 'no_zoom';
    this.zoomOption = this.dataset.zoomOption || 'external';
    this.lightbox = null;
    this.drift = null;
    this.init();
  }
  init() {
    if (this.type === 'no_zoom') return;
    window.addEventListener('resize', this.responsive.bind(this));
    window.addEventListener('load', this.responsive.bind(this));
  }
  initLightBox() {
    if (this.lightbox !== null) return;
    this.querySelectorAll('a.media-gallery__image').forEach((a) => {
      var position = 0;
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const target = e.currentTarget;
        if (target.getAttribute('data-position')) {
          position = target.getAttribute('data-position');
        } else if (
          target.closest('media-gallery').querySelector('.swiper-slide-active')
        ) {
          position = target
            .closest('media-gallery')
            .querySelector('.swiper-slide-active')
            .getAttribute('data-position');
        } else if (target.closest('media-gallery').firstChild) {
          position = target
            .closest('media-gallery')
            .firstChild?.getAttribute('data-position');
        }
        this.lightbox = new PhotoSwipeLightbox({
          gallery: this,
          children: 'a',
          pswpModule: () => Photoswipe,
          counter: false,
          zoom: false,
          preloader: false,
          arrowPrev: false,
          arrowNext: false,
          close: false,
          loop: false,
          bgOpacity: 1,
        });
        this.lightbox.on('uiRegister', () => {
          const { pswp } = this.lightbox;
          pswp?.ui.registerElement({
            name: 'bls--close',
            isButton: true,
            tagName: 'button',
            html: '<svg width="13" height="13" viewBox="0 0 13 13" fill="none" class="transition"><use href="#icon-close"></use></svg>',
            onClick: () => {
              pswp.close();
            },
          });
          pswp?.ui.registerElement({
            name: 'bottomBar',
            className: 'pswp__bottom-bar',
            appendTo: 'wrapper',
            onInit: (el, pswp) => {
              let next, prev, counter, useIconPrev;
              let iconNext, iconPrev, useIconNext;
              next = document.createElement('button');
              next.setAttribute('type', 'button');
              next.className = 'pswp__button pswp__button-next';
              next.innerHTML = `<svg width="6" height="11" fill="none">
              <use href="#icon-next"></use>
            </svg>`;
              next.onclick = () => {
                pswp.next();
              };
              el.appendChild(next);

              counter = document.createElement('span');
              counter.className = 'pswp__counter';
              pswp.on('change', () => {
                counter.innerText =
                  pswp.currIndex +
                  1 +
                  pswp.options.indexIndicatorSep +
                  pswp.getNumItems();
              });
              el.appendChild(counter);

              prev = document.createElement('button');
              prev.setAttribute('type', 'button');
              prev.className = 'pswp__button pswp__button-prev';
              prev.innerHTML = `<svg width="6" height="11" fill="none">
              <use href="#icon-back"></use>
            </svg>`;
              prev.onclick = () => {
                pswp.prev();
              };
              el.appendChild(prev);
            },
          });
        });
        this.lightbox.init();
        this.lightbox.loadAndOpen(position-1);
      });
    });
  }
   initDrift() {
    if (this.drift !== null) return;
    var allTriggers = this.querySelectorAll('.drift-trigger');
    var paneContainer = this.closest('.sec__featured-product').querySelector(
      '.zoom-external-area'
    );
    if (allTriggers.length != 0) {
      allTriggers.forEach( (trigger) => {
        const inlineContainer = trigger.closest('[data-pane-container]');
        const zoomOption = this.zoomOption;
        if (zoomOption === 'inner-2') {
          this.drift = new Drift(trigger, {
            inlinePane: zoomOption === 'inner-2',
            zoomFactor: 3,
            containInline: paneContainer,
            paneContainer: inlineContainer,
            hoverBoundingBox: zoomOption === 'external',
            onShow: function () {
              inlineContainer.classList.add('relative');
            },
            onHide: function () {
              inlineContainer.classList.remove('relative');
            },
          });
        } else {
          this.drift = new Drift(trigger, {
            inlinePane: zoomOption,
            zoomFactor: 5,
            containInline: !!paneContainer,
            paneContainer:
              zoomOption === 'external' ? paneContainer : inlineContainer,
            hoverBoundingBox: zoomOption === 'external',
            onShow: function () {
              inlineContainer.classList.add('relative');
            },
            onHide: function () {
              inlineContainer.classList.remove('relative');
            },
          });
        }
      });
    }
  }
  responsive() {
    if (window.innerWidth >= 768) {
      if (this.type === 'open_lightbox') {
        this.initLightBox();
      } else {
        if (this.lightbox !== null) {
          this.lightbox.destroy();
          this.lightbox = null;
        }
        this.initDrift();
      }
    } else {
      if (this.type !== 'open_lightbox') {
        if (this.drift !== null) {
          this.drift.destroy();
          this.drift == null;
        }
        this.initLightBox();
      } else {
        this.initLightBox();
      }
    }
    this.updateSwiper();
  }

  updateSwiper() {
    if (typeof Swiper !== 'undefined') {
      if (this.querySelector('.thumbnail-slide')) {
        this.querySelector('.thumbnail-slide').swiper.update();
      }
    }
  }

  disconnectedCallback() {
    window.removeEventListener('resize', this.responsive.bind(this));
    window.removeEventListener('load', this.responsive.bind(this));
  }
}
customElements.define('zoom-action', ZoomAction);
