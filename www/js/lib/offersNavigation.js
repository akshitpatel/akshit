var offersNavigation = {

    loaded: 0,
    offersType: "ALL",

    init: function() {

        // Security check
        if(this.loaded != 0) {
            return ;
        }
        this.loaded = 1;

        this.setActiveButton();
        this.handler();
    },

    setOpenPlacesType: function() {

        this.offersType = "OPENPLACES";
        offersNavigation.setActiveButton();
    },

    setAllOffersType: function() {

        this.offersType = "ALL";
        offersNavigation.setActiveButton();
    },

    setActiveButton: function() {

        $(".offersNavigation li").removeClass("active");
        $(".offersNavigation li[nav-type='"+this.offersType+"']").addClass("active");
    },

    handler: function() {

        $(document).on("click",".offersNavigation ul li a",function(){

            var li = $(this).parent("li");
            if(li.hasClass('active') == false) {
                offersNavigation.offersType = li.attr("nav-type");
                offersNavigation.setActiveButton();

                if(app.appCurrentPage == "listView") {
                    app.listViewScreen();
                }

                if(app.appCurrentPage == "mapPage") {
                    mapModule.reloadMapPage();
                }
            }
            return false;
        });
    }
};