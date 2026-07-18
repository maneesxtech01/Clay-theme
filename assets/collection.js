'use strict';
const options_collection = {
  collectionsLoadMore: '.collections-load-more',
  rangeSlider: '.price-range .range-slider',
  rangeSliderMin: '.range-slider-min',
  rangeSliderMax: '.range-slider-max',
  minPriceRange: '.min-price-range',
  maxPriceRange: '.max-price-range',
  collectionSidebar: '#CollectionSidebar',
  collectionFilterBlocks: '.filter-blocks',
  productgridcontainer: '#productgridcontainer',
  collectionFiltersForm: '#CollectionFiltersForm',
  section: '.sec__collection-main',
};

class BtnFilter extends HTMLElement {
  constructor() {
    super();
    this.collectionSidebar = document.getElementById('CollectionSidebar');
    this.addEventListener('click', this.onOpen.bind(this), false);
  }
  onOpen() {
    if (!this.classList.contains('open')) {
      this.collectionSidebar.classList.add('open');
      document.documentElement.classList.add('open-drawer', 'open-sidebar');
      root.style.setProperty('padding-right', getScrollBarWidth.init() + 'px');
      this.classList.add('open');
    } else {
      this.collectionSidebar.classList.remove('open');
      document.documentElement.classList.remove('open-drawer', 'open-sidebar');
      root.style.removeProperty('padding-right');
      this.classList.remove('open');
    }
  }
}
customElements.define('btn-filter', BtnFilter);
class CloseFilter extends HTMLElement {
  constructor() {
    super();
    this.collectionSidebar = document.getElementById('CollectionSidebar');
    this.addEventListener('click', this.onClose.bind(this), false);
  }
  onClose() {
    this.collectionSidebar.classList.remove('open');
    document.documentElement.classList.remove('open-drawer', 'open-sidebar');
    document.querySelector('.btn-filter').classList.remove('open');
    root.style.removeProperty('padding-right');
  }
}
customElements.define('close-filter', CloseFilter);

class FacetApplyCanvas extends CloseFilter {
  constructor() {
    super();
    this.addEventListener('click', this.onClose.bind(this), false);
  }
}
customElements.define('facet-apply-canvas', FacetApplyCanvas);

class GridMode extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('click', this.gridMode.bind(this), false);
  }
  async gridMode() {
    if (this.classList.contains('active')) return;
    const view_mode = this.getAttribute('data-grid-mode');
    if (view_mode == 1) return;
  await Motion.animate(
      document.querySelectorAll(
        'motion-element.product-item__wrapper.slide_in'
      ),
      {
        transform: ['translateY(0)', 'translateY(3.5rem)'],
        opacity: [1, 0.01],
        visibility: ['visible', 'hidden'],
      },
      {
        duration: 0.3,
        delay: Motion.stagger(0.05),
        easing: [0, 0, 0.3, 1],
      }
    );


    for (var item of document.querySelectorAll('grid-mode')) {
      item.classList.remove('active');
    }
    const container_switch = document.querySelector(
      '.container-products-switch'
    );
    this.classList.add('active');
    const data_view_mode = container_switch.getAttribute('data-view-mode');
    container_switch.classList.remove('grid-columns-' + data_view_mode);
    container_switch.setAttribute('data-view-mode', view_mode);
    container_switch.classList.add('grid-columns-' + view_mode);
    Motion.animate(
      document.querySelectorAll(
        'motion-element.product-item__wrapper.slide_in'
      ),
      {
        transform: ['translateY(3.5rem)', 'translateY(0)'],
        opacity: [0.01, 1],
        visibility: ['hidden', 'visible'],
      },
      {
        duration: 0.3,
        delay: Motion.stagger(0.1),
        easing: [0, 0, 0.3, 1],
      }
    );
  }
}
customElements.define('grid-mode', GridMode);

class ViewMode extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('click', this.viewMode.bind(this), false);
  }
  viewMode() {
    const view_mode = this.getAttribute('data-view');
    if (this.classList.contains('active')) return;
    var queryString = window.location.search;
    queryString = eventCollectionShopify.removeParam('view', queryString);
    if (view_mode == 'list') {
      var searchParams = queryString.replace('?', '') + '&view=list';
    } else {
      var searchParams = queryString.replace('?', '') + '&view=grid';
    }
    const url = eventCollectionShopify.renderUrl(searchParams);
    eventCollectionShopify.renderSectionFilter(url, searchParams);
  }
}
customElements.define('view-mode', ViewMode);

class FilterItem extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('click', this.filterItem.bind(this), false);
  }
  filterItem() {
    if (this.querySelector('.tooltip')) {
      this.querySelector('.tooltip').classList.toggle('current-filter');
    } else {
      if (this.closest('li')) {
        this.closest('li').classList.toggle('current-filter');
      }
    }
    const url = this.getAttribute('data-href');
    eventCollectionShopify.renderSectionFilter(url);
  }
}
customElements.define('filter-item', FilterItem);

class FacetClearAll extends CloseFilter {
  constructor() {
    super();
    this.addEventListener('click', this.filterItem.bind(this), false);
  }
  filterItem() {
    const url = this.getAttribute('data-href');
    eventCollectionShopify.renderSectionFilter(url);
    this.onClose();
  }
}
customElements.define('facet-clear-all', FacetClearAll);

class FilterSort extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('click', this.filterSort.bind(this), false);
  }
  filterSort() {
    const value = this.getAttribute('value');
    let queryString = window.location.search;
    queryString = eventCollectionShopify.removeParam('sort_by', queryString);
    const searchParams = queryString.replace('?', '') + '&sort_by=' + value;
    const url = eventCollectionShopify.renderUrl(searchParams);
    eventCollectionShopify.renderSectionFilter(url, searchParams);
  }
}
customElements.define('filter-sort', FilterSort);

class SelectSorter extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('click', this.activeFilterSort.bind(this), false);
  }
  activeFilterSort() {
    if (this.closest('.select-custom').classList.contains('active')) {
      this.closest('.select-custom').classList.remove('active');
    } else {
      this.closest('.select-custom').classList.add('active');
    }
  }
}
customElements.define('select-sorter', SelectSorter);

var eventCollectionShopify = (function () {
  return {
    init: function () {
      this.ionRangeSlider();
      let windowWidth = window.innerWidth;
      if (windowWidth <= 1024) {
        const horizontal = document.querySelector('.horizontal-filter');
        if (horizontal) {
          const collapsible = document.querySelectorAll('collapsible-block');
          collapsible.forEach((e) => {
            e.classList.add('active');
          });
        }
      }
    },

    ionRangeSlider: function () {
      const price_range = document.querySelector('.price-range');
      const maxRange = document.querySelector(
        options_collection.rangeSliderMax
      );
      const minRange = document.querySelector(
        options_collection.rangeSliderMin
      );
      const minPrice = document.querySelector('.min-price-range');
      const maxPrice = document.querySelector('.max-price-range');
      var minPriceRange = 0;
      var maxPriceRange = 0;
      if (!price_range) return;
      document.querySelector(options_collection.minPriceRange).addEventListener(
        'change',
        (event) => {
          event.preventDefault();
          const target = event.currentTarget;
          target.value = target.value.replace(',', '');
          if (Number(minRange.min) + Number(target.value) >= 0) {
            if (Number(target.value) > Number(maxRange.max)) {
              minPrice.value = Number(maxRange.max);
            } else {
              minPrice.value = Number(target.value);
            }
          } else {
            minPrice.value = Number(minRange.min);
          }
          const formData = new FormData(
            document.querySelector(options_collection.collectionFiltersForm)
          );
          const params = new URLSearchParams(formData).toString();
          const nameMin = minPrice.getAttribute('name');
          const nameMax = maxPrice.getAttribute('name');
          var queryString = window.location.search;
          queryString = this.removeParam(nameMin, queryString);
          queryString = this.removeParam(nameMax, queryString);
          var searchParams = queryString.replace('?', '') + '&' + params;
          const url = this.renderUrl(searchParams);
          this.renderSectionFilter(url, searchParams);
        },
        false
      );
      document.querySelector(options_collection.maxPriceRange).addEventListener(
        'change',
        (event) => {
          event.preventDefault();
          const target = event.currentTarget;
          target.value = target.value.replace(',', '');
          if (Number(maxRange.max) - Number(target.value) >= 0) {
            maxPrice.value = Number(target.value);
          } else {
            maxPrice.value = Number(maxRange.max);
          }
          const formData = new FormData(
            document.querySelector(options_collection.collectionFiltersForm)
          );
          const params = new URLSearchParams(formData).toString();
          const nameMin = minPrice.getAttribute('name');
          const nameMax = maxPrice.getAttribute('name');
          var queryString = window.location.search;
          queryString = this.removeParam(nameMin, queryString);
          queryString = this.removeParam(nameMax, queryString);
          var searchParams = queryString.replace('?', '') + '&' + params;
          const url = this.renderUrl(searchParams);
          this.renderSectionFilter(url, searchParams);
        },
        false
      );
      document
        .querySelector(options_collection.rangeSliderMin)
        .addEventListener(
          'input',
          (event) => {
            event.preventDefault();
            const target = event.currentTarget;
            if (Number(maxRange.value) - Number(target.value) >= 1) {
              minPrice.value = Number(target.value);
              minPriceRange = Number(target.value) * 100;
            } else {
              target.value = Number(maxRange.value) - 1;
              minPriceRange = (Number(maxRange.value) - 1) * 100;
            }
            const price_format = Shopify.formatMoney(
              minPriceRange,
              cartStrings.money_format
            );
            document.querySelector('.price-lable .min').innerHTML =
              price_format;
            target
              .closest('.price-range')
              .style.setProperty(
                '--range-from',
                (minRange.value / Number(target.getAttribute('max'))) * 100 +
                  '%'
              );
          },
          false
        );
      document
        .querySelector(options_collection.rangeSliderMax)
        .addEventListener(
          'input',
          (event) => {
            event.preventDefault();
            const target = event.currentTarget;
            if (target.value - minRange.value >= 1) {
              maxPrice.value = target.value;
              maxPriceRange = Number(target.value) * 100;
            } else {
              target.value = Number(minRange.value) + Number(1);
              maxPriceRange = (Number(minRange.value) + Number(1)) * 100;
            }
            const price_format = Shopify.formatMoney(
              maxPriceRange,
              cartStrings.money_format
            );
            document.querySelector('.price-lable .max').innerHTML =
              price_format;
            target
              .closest('.price-range')
              .style.setProperty(
                '--range-to',
                (maxRange.value / Number(target.getAttribute('max'))) * 100 +
                  '%'
              );
          },
          false
        );
      document
        .querySelectorAll(options_collection.rangeSlider)
        .forEach((sliderRange) => {
          sliderRange.addEventListener(
            'change',
            (event) => {
              event.preventDefault();
              const target = event.currentTarget;
              const formData = new FormData(
                document.querySelector(options_collection.collectionFiltersForm)
              );
              const params = new URLSearchParams(formData).toString();
              const nameMin = minPrice.getAttribute('name');
              const nameMax = maxPrice.getAttribute('name');
              var queryString = window.location.search;
              queryString = this.removeParam(nameMin, queryString);
              queryString = this.removeParam(nameMax, queryString);
              var searchParams = queryString.replace('?', '') + '&' + params;
              const url = this.renderUrl(searchParams);
              this.renderSectionFilter(url, searchParams);
            },
            false
          );
        });
    },

    removeParam: function (key, sourceURL) {
      var rtn = sourceURL.split('?')[0],
        param,
        params_arr = [],
        queryString =
          sourceURL.indexOf('?') !== -1 ? sourceURL.split('?')[1] : '';
      if (queryString !== '') {
        params_arr = queryString.split('&');
        for (var i = params_arr.length - 1; i >= 0; i -= 1) {
          param = params_arr[i].split('=')[0];
          if (param === key) {
            params_arr.splice(i, 1);
          }
        }
        if (params_arr.length) rtn = rtn + '?' + params_arr.join('&');
      }
      return rtn;
    },

    renderUrl: function (searchParams) {
      const sectionId = document.querySelector(options_collection.section)
        .dataset.sectionId;
      const url = `${window.location.pathname}?section_id=${sectionId}&${searchParams}`;
      return url;
    },

    renderSectionFilter: function (url, searchParams) {
      this.toggleLoading(document.body, true);
      const grid_list = document.querySelector('grid-list')
      grid_list.hideGridItems();
      fetch(`${url}`)
        .then((response) => {
          if (!response.ok) {
            var error = new Error(response.status);
            throw error;
          }
          return response.text();
        })
        .then((responseText) => {
          if (window.innerWidth <= 1024) {
            const collectionFilterBlocks = new DOMParser()
              .parseFromString(responseText, 'text/html')
              .querySelector(options_collection.collectionFilterBlocks);
            document.querySelector(
              options_collection.collectionFilterBlocks
            ).innerHTML = collectionFilterBlocks.innerHTML;
            const productgridcontainer = new DOMParser()
              .parseFromString(responseText, 'text/html')
              .querySelector(options_collection.productgridcontainer);
            document.querySelector(
              options_collection.productgridcontainer
            ).innerHTML = productgridcontainer.innerHTML;
            if (
              document
                .querySelector(options_collection.collectionSidebar)
                .classList.contains('open')
            ) {
              document.querySelector(options_collection.collectionSidebar).classList.remove('open')
            }
          } else {
            const newSection = new DOMParser()
              .parseFromString(responseText, 'text/html')
              .querySelector(options_collection.section);
            document
              .querySelector(options_collection.section)
              .replaceWith(newSection);
          }
          document.documentElement.classList.remove('hside_opened', 'open-drawer', 'open-sidebar');
          const sectionElement = document.querySelector(
            '#productgridcontainer'
          );
          
          if (sectionElement) {
            const elementPosition = sectionElement.getBoundingClientRect().top;
            const offsetPosition = window.pageYOffset;
            const extraOffset = 100;
            const scrollToPosition =
              elementPosition + offsetPosition - extraOffset;
            window.scrollTo({
              top: scrollToPosition,
              behavior: 'smooth',
            });
          }
          this.toggleLoading(document.body, false);
          
        })
        .catch((error) => {
          throw error;
        })
        .finally(() => {
          grid_list?.showGridItems();
          initLazyloadItem();
          BlsLazyloadImg.init();
          eventCollectionShopify.ionRangeSlider();
        });
      this.updateUrl(url, searchParams);
    },

    toggleLoading: function (event, loading) {
      if (event) {
        if (loading) {
          event.classList.add('start', 'loading');
        } else {
          event.classList.add('finish');
          setTimeout(function () {
            event.classList.remove('start', 'loading', 'finish');
          }, 500);
        }
      }
    },

    updateUrl: function (url, searchParams = false) {
      if (searchParams) {
        const urlUpdate = `${window.location.pathname}?${searchParams}`;
        window.history.pushState({ url: urlUpdate }, '', urlUpdate);
      } else {
        window.history.pushState({ url: url }, '', url);
      }
    },
  };
})();
eventCollectionShopify.init();

// Collapsible nested category tree navigation toggles
document.addEventListener('click', function (e) {
  const toggle = e.target.closest('.category-toggle-icon');
  if (toggle) {
    e.preventDefault();
    e.stopPropagation();
    const parentItem = toggle.closest('li');
    if (parentItem) {
      // Toggle active status on the toggle wrapper (animates + to -)
      toggle.classList.toggle('active');
      
      // Find the direct child sub-list (ul)
      let subList = null;
      for (let i = 0; i < parentItem.children.length; i++) {
        if (parentItem.children[i].tagName === 'UL') {
          subList = parentItem.children[i];
          break;
        }
      }
      if (subList) {
        subList.classList.toggle('open');
      }
    }
  }
});

class MobileColumnSwitch extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('click', this.toggleColumns.bind(this), false);
  }
  
  connectedCallback() {
    const cols = this.getAttribute('data-columns');
    const savedCols = sessionStorage.getItem('mobile-columns') || '2';
    
    // Set active class accordingly
    if (cols === savedCols) {
      this.classList.add('active');
    } else {
      this.classList.remove('active');
    }
    
    // Apply layout style property to grid
    const grid = document.querySelector('.products-grid__items, .grid.grid-cols');
    if (grid) {
      grid.style.setProperty('--col-number', savedCols);
      grid.style.setProperty('--col-mobile', savedCols);
    }
  }

  toggleColumns() {
    const cols = this.getAttribute('data-columns');
    sessionStorage.setItem('mobile-columns', cols);
    
    // Set columns on the product grid
    const grid = document.querySelector('.products-grid__items, .grid.grid-cols');
    if (grid) {
      grid.style.setProperty('--col-number', cols);
      grid.style.setProperty('--col-mobile', cols);
    }
    
    // Toggle active class on buttons
    document.querySelectorAll('mobile-column-switch').forEach(btn => {
      if (btn.getAttribute('data-columns') === cols) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }
}
customElements.define('mobile-column-switch', MobileColumnSwitch);
