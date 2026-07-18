const options = {
    navTabs: ".nav-tabs a",
    accorditionTabs: ".data.accordition",
    productInfomationTab: ".bls__product-tabs-content",
    productInfomationTabLayoutSecond: ".bls__products-tabs",
    tabContent: ".tab-content .tab-item",
    tabContentActive: ".tab-content .tab-item.active",
  };
   
  var BlsTab = (function(){
     return {
      eventProductTabs: function () {
        document.querySelectorAll(options.navTabs).forEach((tabToggle) => {
          tabToggle.addEventListener(
            "click",
            (e) => {
              e.preventDefault();
              const target = e.currentTarget;
              const tab_id = target.getAttribute("data-block-id");
              if (!target.closest(".data.item").classList.contains("active")) {
                for (var item of document.querySelectorAll(".data.item")) {
                  item.classList.remove("active");
                }
                for (var item of document.querySelectorAll(options.tabContent)) {
                  item.classList.remove("active");
                  item.querySelector(".tab-panel").style.display = "none";
                }
                const conditions = document.getElementById(tab_id);
                conditions.classList.add("active");
                conditions.querySelector(".tab-panel").style.display = "block";
                target.closest(".data.item").classList.add("active");
              }
            },
            false
          );
        });
      }
     }
  })()
  BlsTab.eventProductTabs()