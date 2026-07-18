
  class SocialShare extends HTMLElement {
    constructor() {
        super();
        this.init();
    }
    init() {
        this.querySelectorAll('.btn-sharing').forEach(share => {
            share.addEventListener("click", event => {
              event.preventDefault();
              const target = event.currentTarget;
              const social = target.getAttribute('data-social');
              window.open(social);
            }, false);
        });
    }
  }
  customElements.define("social-share", SocialShare);
  