"use strict";

var BlsPasswordPopup = (function () {
    return {
      init: function () {
        this.handleCountdown()
        this.showPassword();
      },
      showPassword: function () {
        const action = document.querySelector("#DialogHeading");
        const _this = this;
        if (action !== null) {
          action.addEventListener("click", (e) => {
            e.preventDefault();
            _this.getContentPassword();
          });
        }
      },
      getContentPassword: function(){
        const content = document.querySelector('.password-modal__content').innerHTML;
        let modal = new tingle.modal({
          footer: false,
          stickyFooter: false,
          closeMethods: ["overlay", "button", "escape"],
          cssClass: [this.customClass],
          onOpen: function () {},
          onClose: function () {},
          beforeClose: function () {
            return true;
          },
        }); 
        modal.setContent(content);
        modal.open();
      },
      handleCountdown: function () {
        var second = 1000,
          minute = second * 60,
          hour = minute * 60,
          day = hour * 24;
        const timer = document.querySelectorAll(".bls__timer");
        if(timer){
          timer.forEach((e) => {
            const { timer } = e?.dataset;
            const dateParts = timer.split("-");
            const isoDate =
              dateParts[2] +
              "-" +
              dateParts[0].padStart(2, "0") +
              "-" +
              dateParts[1].padStart(2, "0") +
              "T00:00:00Z";
            if (Date.parse(isoDate)) {
              var countDown = new Date(isoDate).getTime();
              if (countDown) {
                setInterval(function () {
                  var now = new Date().getTime(),
                    distance = countDown - now;
                  if (countDown >= now) {
                    (e.querySelector(".js-timer-days").innerText =
                      Math.floor(distance / day) < 10
                        ? ("0" + Math.floor(distance / day)).slice(-2)
                        : Math.floor(distance / day)),
                      (e.querySelector(".js-timer-hours").innerText = (
                        "0" + Math.floor((distance % day) / hour)
                      ).slice(-2)),
                      (e.querySelector(".js-timer-minutes").innerText = (
                        "0" + Math.floor((distance % hour) / minute)
                      ).slice(-2)),
                      (e.querySelector(".js-timer-seconds").innerText = (
                        "0" + Math.floor((distance % minute) / second)
                      ).slice(-2));
                  }
                }, second);
              }
            }
          });
        }
      
      },
       
    };
  })();
  BlsPasswordPopup.init();


  