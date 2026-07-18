if (!customElements.get('pickup-availability')) {
  customElements.define(
    'pickup-availability',
    class PickupAvailability extends HTMLElement {
      constructor() {
        super();

        if (!this.hasAttribute('available')) return;

        this.errorHtml =
          this.querySelector('template').content.firstElementChild.cloneNode(
            true
          );
        this.onClickRefreshList = this.onClickRefreshList.bind(this);
        this.fetchAvailability(this.dataset.variantId);
      }

      fetchAvailability(variantId) {
        let rootUrl = this.dataset.rootUrl;
        if (!rootUrl.endsWith('/')) {
          rootUrl = rootUrl + '/';
        }
        const variantSectionUrl = `${rootUrl}variants/${variantId}/?section_id=pickup-availability`;
        fetch(variantSectionUrl)
          .then((response) => response.text())
          .then((text) => {
            const sectionInnerHTML = new DOMParser()
              .parseFromString(text, 'text/html')
              .querySelector('.shopify-section');
            this.renderPreview(sectionInnerHTML);
          })
          .catch((e) => {
            const button = this.querySelector('button');
            if (button)
              button.removeEventListener('click', this.onClickRefreshList);
            this.renderError();
          });
      }

      onClickRefreshList(evt) {
        this.fetchAvailability(this.dataset.variantId);
      }

      renderError() {
        this.innerHTML = '';
        this.appendChild(this.errorHtml);

        this.querySelector('button').addEventListener(
          'click',
          this.onClickRefreshList
        );
      }

      renderPreview(sectionInnerHTML) {
        const drawer = document.querySelector('.pickup-availability-drawer');
        if (drawer) drawer.remove();
        if (!sectionInnerHTML.querySelector('.pickup-availability-preview')) {
          this.innerHTML = '';
          this.removeAttribute('available');
          return;
        }

        this.innerHTML = sectionInnerHTML.querySelector(
          'pickup-availability-preview'
        ).outerHTML;
        this.setAttribute('available', '');

        document.body.appendChild(
          sectionInnerHTML.querySelector('.pickup-availability-drawer')
        );

        const button = this.querySelector('button');
        const overlay = document
          .querySelector('.pickup-availability-drawer')
          .querySelector('.overlay');
        setTimeout(() => {
          if (button) {
            button.addEventListener('click', (event) => {
              event.preventDefault();
              const target = event.currentTarget;
              if (!target.classList.contains('open')) {
                document.querySelector('pickup-availability-drawer').show();
              } else {
                document.querySelector('pickup-availability-drawer').hide();
              }
            });
          }
          if (overlay) {
            overlay.addEventListener('click', (event) => {
              event.preventDefault();
              if (
                document
                  .querySelector('pickup-availability-drawer')
                  .classList.contains('open')
              ) {
                document.querySelector('pickup-availability-drawer').hide();
              }
            });
          }
        }, 800);
      }
    }
  );
}

if (!customElements.get('pickup-availability-drawer')) {
  customElements.define(
    'pickup-availability-drawer',
    class PickupAvailabilityDrawer extends HTMLElement {
      constructor() {
        super();
        this.closeTimeout = null;
        this.addEventListener('keyup', (event) => {
          if (event.code.toUpperCase() === 'ESCAPE') this.hide();
        });

        const close_button = this.querySelector('close-button');
        close_button.addEventListener('click', (e) => {
          this.hide();
        });
      }

      hide() {
        
        if (!this.classList.contains('open')) return;
        document
          .querySelector('#ShowPickupAvailabilityDrawer')
          .classList.remove('open');
        document.documentElement.classList.remove('open-sidebar');
        this.classList.remove('open');
        if(this.closeTimeout){
          document.documentElement.classList.remove('open-drawer');
          root.style.removeProperty('padding-right');
          clearTimeout(this.closeTimeout);
          return;
        }
        this.closeTimeout = setTimeout(() => {
          document.documentElement.classList.remove('open-drawer');
          root.style.removeProperty('padding-right');
        }, 300);

       
      }

      show() {
        document
          .querySelector('#ShowPickupAvailabilityDrawer')
          .classList.add('open');
        document.documentElement.classList.add('open-drawer', 'open-sidebar');
        root.style.setProperty(
          'padding-right',
          getScrollBarWidth.init() + 'px'
        );
        this.classList.add('open');
      }
    }
  );
}
