var geolocationModule = {

    loaded: 0,

    init: function() {

        // Security check
        if(this.loaded != 0) {
            return ;
        }
        this.loaded = 1;

        this.handler();
    },

    handler: function() {

        // On location button click, show new list
        $(document).on("click","#gpsButton",function(){
            geolocationModule.listViewCurrentPosition();
            return false;
        });

        // On location button click, show new list
        $(document).on("click","#mapGpsButton",function(){
            app.showLoader();
            navigator.geolocation.getCurrentPosition(app.mapScreen_onSuccess, app.mapScreen_onError);
            return false;
        });
    },

    // Action when loading list view using GPS
    listViewCurrentPosition: function() {
        app.showLoader();
        navigator.geolocation.getCurrentPosition(app.listViewScreen_onSuccess, app.listViewScreen_onErrorButton);
    }
};