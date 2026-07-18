class ShopableVideoSticky extends HTMLElement {
    constructor() {
        super();
        this.miniVideo = this.querySelector('.mini-video__video');
        this.closeButton = this.querySelector('.close-mini-video');
        this.isVisible = false;
        this.scrollThreshold = 300;
        this.actionClose = this.getAttribute('data-action-close') === 'true';
        this.cookieName = 'video_sticky_closed';
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        
        if (this.actionClose && this.checkClosedCookie()) {
            return;
        }
        
        this.handleScroll();
    }

    setupEventListeners() {
        window.addEventListener('scroll', this.handleScroll.bind(this));
        
        if (this.closeButton) {
            this.closeButton.addEventListener('click', () => {
                this.hideVideo();
                
                if (this.actionClose) {
                    this.setClosedCookie();
                }
            });
        }
    }

    handleScroll() {
        if (window.scrollY > this.scrollThreshold && !this.checkClosedCookie()) {
            this.showVideo();
        }
    }

    showVideo() {
        if (!this.isVisible && this.miniVideo) {
            this.miniVideo.classList.add('is-visible');
            this.isVisible = true;
        }
    }

    hideVideo() {
        if (this.isVisible && this.miniVideo) {
            this.miniVideo.classList.remove('is-visible');
            this.isVisible = false;
        }
    }

    setClosedCookie() {
        const expiryDate = new Date();
        expiryDate.setTime(expiryDate.getTime() + (24 * 60 * 60 * 1000)); // 24 giờ
        
        document.cookie = `${this.cookieName}=true; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
    }

    checkClosedCookie() {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.indexOf(`${this.cookieName}=`) === 0) {
                return cookie.substring(this.cookieName.length + 1) === 'true';
            }
        }
        return false;
    }
}

customElements.define('shopable-video-sticky', ShopableVideoSticky);