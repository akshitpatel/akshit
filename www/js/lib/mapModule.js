var mapModule = {

    loaded: 0,
    mapViewDate: null,
    mapViewMap: null,
    mapViewLat: 0,
    mapViewLng: 0,
    mapViewAcc: 0,
    mapViewDefLat: 0,
    mapViewDefLng: 0,
    mapViewZoom : 15,
    mapViewCurrentLocMarker: null,
    mapViewCurrentLocCircle: null,
    usingGPS: false,

    init: function() {

        // Security check
        if(this.loaded != 0) {
            return ;
        }
        this.loaded = 1;

        mapModule.mapUpdateDate();
        this.handler();
    },

    // Map page handlers
    handler: function() {

        // Make map canvas
        $(document).on("pageshow","#mapPage",function(){

            if(mapModule.mapViewMap != null) {
                mapModule.mapSetGPSLocation();
                return ;
            }

            $("#app-map-canvas").html("");
            mapModule.mapViewMap = null;
            mapModule.loadMap();
        });
    },

    // Load map
    loadMap: function() {
        var pointer = "src/img/pointer.png";
        var businessPointer = "src/img/bg-open-now2.png";
        var inactivePointer = "src/img/discount-arrow4.png";

        // Map already loaded
        if(mapModule.mapViewMap != null) {
            return ;
        }

        // Load map
        mapModule.mapViewMap = new TagsMap({
            mapId: 'app-map-canvas',
            Lat: mapModule.mapViewLat,
            Lng: mapModule.mapViewLng,
            zoom: mapModule.mapViewZoom,
            scrollwheel: true,
            pointer: pointer,
            businessPointer: businessPointer,
            inactivePointer: inactivePointer,
            requestUrl: app.appUrl+"provider/map",
            requestParams: {
                nid: app.selectedNid
            }
        });

        mapModule.mapSetGPSLocation();
    },


    // Set GPS location if needed
    mapSetGPSLocation: function() {

        // If using GPS - set current location on the map
        if(mapModule.usingGPS == true) {
            mapModule.loadMapMyLocation(mapModule.mapViewLat,mapModule.mapViewLng,mapModule.mapViewAcc);
        }
    },

    // Load current location
    loadMapMyLocation: function(lat,lng, accuracy) {

        var userLatLng = new google.maps.LatLng(lat, lng);

        // Create markers if not exist
        if(mapModule.mapViewCurrentLocMarker == null) {
            var circleOpts = {
                center: userLatLng,
                radius: accuracy,
                map: mapModule.mapViewMap.googleMap,
                strokeColor: '#1bb6ff',
                strokeOpacity: .4,
                fillColor: '#BED2F7',
                fillOpacity: .4,
                strokeWeight: 1
            };
            var markerOpts = {
                'clickable': false,
                'cursor': 'pointer',
                'draggable': false,
                'flat': true,
                'icon': {
                    'url': 'img/gpsloc.png',
                    'size': new google.maps.Size(34, 34),
                    'scaledSize': new google.maps.Size(17, 17),
                    'origin': new google.maps.Point(0, 0),
                    'anchor': new google.maps.Point(8, 8)
                },
                'optimized': false,
                'position': userLatLng,
                'title': 'Current location',
                'zIndex': 2
            };

            mapModule.mapViewCurrentLocMarker = new google.maps.Marker(markerOpts);
            mapModule.mapViewCurrentLocCircle = new google.maps.Circle(circleOpts);
            mapModule.mapViewCurrentLocMarker.setMap(mapModule.mapViewMap.googleMap);
            mapModule.mapViewCurrentLocCircle.setMap(mapModule.mapViewMap.googleMap);
        }

        // Set new values
        if(mapModule.mapViewCurrentLocMarker != null) {
            mapModule.mapViewCurrentLocMarker.setPosition(userLatLng);
        }

        if(mapModule.mapViewCurrentLocCircle != null) {
            mapModule.mapViewCurrentLocCircle.setCenter(userLatLng);
        }

        mapModule.centerMapView();
    },

    // Clears GPS data
    clearGPSData: function() {

        app.listViewLat = 0;
        app.listViewLng = 0;
        mapModule.usingGPS = false;
        mapModule.mapViewCurrentLocMarker = null;
        mapModule.mapViewCurrentLocCircle = null;
    },

    // Update map date
    mapUpdateDate: function() {

        // Get current time
        app.listDate = app.getCurrentDate();

        mapModule.mapViewDate = app.listDate[2];
    },

    // Set center when GPS button clicked
    centerMapView: function() {

        var userLatLng = new google.maps.LatLng(mapModule.mapViewLat, mapModule.mapViewLng);
        mapModule.mapViewMap.googleMap.setCenter(userLatLng);
        mapModule.mapViewMap.googleMap.setZoom(16);

        app.hideLoader();
    },

    // Reload map
    reloadMapPage: function() {

        mapModule.mapViewMap.reloadMap();
    }
};