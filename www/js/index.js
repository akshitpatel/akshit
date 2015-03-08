var app = {

    appHost: "http://app.locappy.com",
//    appHost: "http://app.locappy.dev",
//    appHost: "http://locappy-app.53.datajob.lt",
    appApiVersion: "v1.1",
    appUrl: "",
    listViewLat: 0,
    listViewLng: 0,
    listViewPage: 1,
    listViewLoading: false,
    listViewNoMore: false,
    listViewLoadCurrentPosition: false,
    appCurrentPage: "indexPage",
    appPreviousPage: "indexPage",
    selectedNid: 0,
    isIPad: false,

    // Application loading screen
    loadingScreen: function() {

        // On system link click
        $(document).on("click",".system-link", function(){
            window.open($(this).attr('data-url'), '_system');
        });

        // Generate app Url
        app.appUrl = app.appHost+"/"+app.appApiVersion+"/";

        // Initialize current page handler
        app.currentPageHandler();

        // Initialize back button handler
        app.backButtonHandler();

        // Check internet connection status
        if(!app.testConnectionStatus()) {
            return false;
        }

        // App version control module
        versionModule.init();

        // If everything OK with version
        $(document).on("moduleLoaded", function(){

            // iOS7 status bar fix
            app.iosFix();

            // Load offers type navigation
            offersNavigation.init();

            // Load GPS functions
            geolocationModule.init();

            // Load Filters
            filtersModule.init();

            // Load List View
            listViewModule.init();

            // Load Map
            mapModule.init();

            // Init right panel
            rightPanel.init();

            // Show neighbourhood page
            setTimeout(app.loadNeighbourhoodPage,1300);
        });
    },

    testConnectionStatus: function() {

        if(typeof navigator.connection != "undefined") {
            var networkState = navigator.connection.type;
            if (networkState == Connection.NONE)
            {
                navigator.notification.alert(
                    'Seems like you are not connected to the Internet, please try again later',
                    app.closeApp,
                    'Alert',
                    'OK'
                );
                return false;
            }
        }
        return true;
    },

    closeApp: function() {
        navigator.app.exitApp();
    },

    // Load neighbourhood page
    loadNeighbourhoodPage: function() {

        // Get current date
        listDate = app.getCurrentDate();
        date = listDate[2];

        $.ajax({
            type: "GET",
            url: app.appUrl+"provider/neighbourhoods",
            data: {date: date},
            success: function (obj) {
                // Get template
                var template = $("#neighbourhoodsContainer .area-list").html();
                $("#neighbourhoodsContainer .area-list").html("");

                // Print neighbourhoods
                $.each(obj.data.neighbourhoods, function( index, value ) {

                    mapModule.mapViewLat = mapModule.mapViewDefLat = value.map_lat;
                    mapModule.mapViewLng = mapModule.mapViewDefLng = value.map_lng;
                    mapModule.mapViewZoom = parseInt(value.map_zoom);
                    app.selectedNid = value.id;

                    $("#openListViewLink").click();
                    mapModule.mapViewMap = null;
                    offersNavigation.setOpenPlacesType();
                    app.listViewLoadCurrentPosition = true;
                    app.listViewScreen();
                    return false;
                });
            },
            error: function() {
                // Alert
            }
        });
    },

    // Current page handler
    currentPageHandler: function() {

        $(document).on("pageshow","#neighbourhoodsPage",function(){
            app.appPreviousPage = app.appCurrentPage;
            app.appCurrentPage = "neighbourhoodsPage";

            // Clear GPS data
            mapModule.clearGPSData();
        });

        $(document).on("pageshow","#listView",function(){
            app.appPreviousPage = app.appCurrentPage;
            app.appCurrentPage = "listView";
        });

        $(document).on("pageshow","#iframePage",function(){
            app.appPreviousPage = app.appCurrentPage;
            app.appCurrentPage = "iframePage";
        });

        $(document).on("pageshow","#mapPage",function(){
            app.appPreviousPage = app.appCurrentPage;
            app.appCurrentPage = "mapPage";

            if(mapModule.mapViewMap != null) {
                mapModule.reloadMapPage();
            }
        });
    },

    // Back button handler
    backButtonHandler: function() {

        // Back button handler
        document.addEventListener("backbutton", this.list_backButtonHandler, false);
    },

    // Show offers list view
    listViewScreen: function() {

        // No.
        listViewModule.listViewNo = 1;

        // Show Loader
        this.showLoader();

        // Get current time
        this.listDate = this.getCurrentDate();

        // Getting offers
        if(app.listViewLoadCurrentPosition == true) {
            app.listViewLoadCurrentPosition = false;
            geolocationModule.listViewCurrentPosition();
        } else {
            app.loadListViewPage(app.listViewLng, app.listViewLat);
        }
    },

    // Loads list view page
    loadListViewPage: function(lng, lat) {

        this.listViewLng = lng;
        this.listViewLat = lat;
        this.listViewPage = 1;
        listViewModule.listViewNo = 1;
        this.noMore = false;
        this.listViewLoading = true;
        app.listViewNoMore = false;
        $( "#listView #list" ).html("");

        if(listViewModule.nextPageXhr && listViewModule.nextPageXhr.readystate != 4){
            listViewModule.nextPageXhr.abort();
        }

        $.ajax({
            type: "GET",
            url: app.appUrl+"provider/offerList",
            data: {nid: app.selectedNid, lng: lng, lat: lat, page: this.listViewPage, date: this.listDate[2], filters: filtersModule.filters, type: offersNavigation.offersType},
            success: function (obj) {

                $("#listView #list").html("");
                listViewModule.listViewNo = 1;
                listViewModule.renderListViewPage(obj.data.offers);

                // No offers
                if(obj.data.offers.length == 0) {
                    $("#listView #list").html("<div class='small-thin-title text-center'><b>No offers found</b></div>");
                    app.listViewNoMore = true;
                }

                // Show page
                app.showListViewPage();
            },
            error: function() {
                // Alert
//                alert('Unable to connect to the server. Please check your network connection and try again.');
            }
        });
    },



    // Show list view Page
    showListViewPage: function() {

        // Page loaded
        this.hideLoader();
        this.listViewLoading = false;

        // Load more on scroll
        $("#listView #scrollDiv").scroll(function(){
            if(($("#listView #scrollDiv").scrollTop()+$("#listView #scrollDiv").height()+50)>=$("#listView #list").height()){
                listViewModule.loadListViewNextPage();
            }
        });
    },

    // Open page in iframe
    openInIFrame: function(url, backTo) {
        // Show page in iframe
        $(document).on("pageshow","#iframePage",function(){
            $(".iframeBack").attr('href',backTo);
            app.showLoader();
            $("#iframePage #iframeDiv").html('<iframe src="'+url+'" class="full-height" scrolling="no"></iframe>');
            $("#iframePage #iframeDiv iframe").load(function (){

                app.hideLoader();
            });
        });

        // On back click, clean it up
        $(document).on("click",".iframeBack",function(){
            $("#iframePage #iframeDiv").html("");
        });
    },

    // Open page in iframe
    openInIFrameTransition: function(url, backTo, open) {

        $("#transitionButton").attr("href", open);
        $("#transitionButton").click();
        app.openInIFrame(url,backTo);
    },



    /**
     * Helpers
     */

    // On successful GPS request (list orders)
    listViewScreen_onSuccess: function (position) {

        // Update map location as well
        mapModule.mapViewLat = position.coords.latitude;
        mapModule.mapViewLng = position.coords.longitude;
        mapModule.mapViewAcc = position.coords.accuracy;

        // Using GPS
        mapModule.usingGPS = true;

        app.loadListViewPage(mapModule.mapViewLng, mapModule.mapViewLat);
    },

    // On GPS request error (list orders)
    listViewScreen_onError: function(error) {

        app.loadListViewPage(0, 0);
    },

    // On GPS request error (list orders)
    listViewScreen_onErrorButton: function(error) {

        // Alert
        alert('Unable to find your current location');

        app.loadListViewPage(0, 0);
    },

    // On successful GPS request (map screen)
    mapScreen_onSuccess: function (position) {

        mapModule.mapViewLat = position.coords.latitude;
        mapModule.mapViewLng = position.coords.longitude;
        mapModule.mapViewAcc = position.coords.accuracy;

        // Update list view as well
        app.listViewLng = position.coords.longitude;
        app.listViewLat = position.coords.latitude;

        // Using GPS
        mapModule.usingGPS = true;

        mapModule.loadMapMyLocation(position.coords.latitude, position.coords.longitude, position.coords.accuracy);
    },

    // On GPS request error (map screen)
    mapScreen_onError: function(error) {

        // Alert
        alert('Unable to find your current location');

        mapModule.mapViewLat = mapModule.mapViewDefLat;
        mapModule.mapViewLng = mapModule.mapViewDefLng;

        mapModule.centerMapView();
    },

    // Ger url parameter
    getParam: function ( sname )
    {
        var params = location.search.substr(location.search.indexOf("?")+1);
        var sval = "";
        params = params.split("&");
        // split param and value into individual pieces
        for (var i=0; i<params.length; i++)
        {
            temp = params[i].split("=");
            if ( [temp[0]] == sname ) { sval = temp[1]; }
        }
        return sval;
    },

    // Show Loader
    showLoader: function()
    {
        $.mobile.loading( 'show', { text: 'foo' });
    },

    // Hide loader
    hideLoader: function()
    {
        $.mobile.loading( 'hide', { text: 'foo' });
    },

    // Get current date
    getCurrentDate: function()
    {
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth()+1; //January is 0!
        var yyyy = today.getFullYear();
        var hh = today.getHours();
        var ii = today.getMinutes();

        if(dd<10){dd='0'+dd}
        if(mm<10){mm='0'+mm}
        if(hh<10){hh='0'+hh}
        if(ii<10){ii='0'+ii}
        var date = dd+'/'+mm+'/'+yyyy;
        var hours = hh+':'+ii;

        return [date,hours,today.getTime()];
    },

    // Back button handler on list view screen
    list_backButtonHandler: function()
    {
        if(app.appCurrentPage == "listView") {
            return;
        }

        if(app.appCurrentPage == "mapPage") {
            $("#openListViewLink").click();
            return;
        }

        if(app.appCurrentPage == "neighbourhoodsPage" || app.appCurrentPage == "indexPage") {
            navigator.app.exitApp();
            return;
        }

        navigator.app.backHistory();
        return;
    },

    iosFix: function() {
        if (navigator.userAgent.match(/(iPad.*|iPhone.*|iPod.*);.*CPU.*OS 7_\d/i)) {
            $("body").addClass("ios7");
            $("body").prepend("<div id='ios7statusbar'></div>");
        }
        if (navigator.userAgent.match(/(iPad.*);.*/i)) {
            app.isIPad = true;
        }
    }
};
