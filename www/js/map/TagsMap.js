
function TagsMap(options){

    this.options = options;
    this.offersMap = null;
    this.googleMap = null;
    this.loading = false;
    this.page = 1;
    this.noMore = false;

    // Initialize Offers Map
    this.initializeMap();

    // Add google map listeners
    this.addGoogleListeners('idle', 'mapPositionChanged');
}

/**
 * Offers map Init
 */
TagsMap.prototype.initializeMap = function(){
    this.offersMap = new OffersMap({
            mapId: this.options.mapId,
            Lat: this.options.Lat,
            Lng: this.options.Lng,
            zoom: this.options.zoom,
            scrollwheel: this.options.scrollwheel,
            pointer: this.options.pointer,
            businessPointer: this.options.businessPointer,
            inactivePointer: this.options.inactivePointer
        });

    this.googleMap = this.offersMap.returnMap();
}

/**
 * Add map listeners
 * @param event
 * @param func
 */
TagsMap.prototype.addGoogleListeners = function(event, func){
    tagsMap = this;
    google.maps.event.addListener(this.googleMap, event, function () {
        var fn = tagsMap[func];
        if(typeof fn === 'function') {
            fn(tagsMap);
        }
    });
}

/**
 * Event handler when map position has changed
 * @param tagsMap
 */
TagsMap.prototype.mapPositionChanged = function(tagsMap){

    if(tagsMap.offersMap.haltPosition == true) {
        tagsMap.offersMap.haltPosition = false;
        return ;
    }
    tagsMap.resetPage();
    mapModule.mapUpdateDate();
    tagsMap.offersMap.closeAllBoxes();
    tagsMap.loadOffers();
}

/**
 *
 * @param tagsMap
 */
TagsMap.prototype.reloadMap = function(){

    app.showLoader();
    this.resetPage();
    mapModule.mapUpdateDate();
    tagsMap.offersMap.closeAllBoxes();
    tagsMap.offersMap.triggerResize();
    this.loadOffers();
}


/**
 * Reset map pagination
 */
TagsMap.prototype.resetPage = function(){

    this.page = 1;
}

/**
 * Event handler when map position has changed
 * @param tagsMap
 */
TagsMap.prototype.setRequestParam = function(param, value){

    var requestParams = this.options.requestParams;
    requestParams[param] = value;
    this.options.requestParams = requestParams;
}

/**
 * Load offers
 */
TagsMap.prototype.loadOffers = function(){

    this.loading = true;

    var requestParams = this.options.requestParams;
    var offersMap = this.offersMap;
    var that = this;

    var bounds = this.googleMap.getBounds();
    requestParams.NE_lng = bounds.getNorthEast().lng();
    requestParams.NE_lat = bounds.getNorthEast().lat();
    requestParams.SW_lng = bounds.getSouthWest().lng();
    requestParams.SW_lat = bounds.getSouthWest().lat();

    // Pagination
    requestParams.page = this.page;

    // Date
    requestParams.date = mapModule.mapViewDate;

    // Filters
    requestParams.filters = filtersModule.filters;

    // Coords
    requestParams.lat = mapModule.mapViewLat;
    requestParams.lng = mapModule.mapViewLng;

    // Type
    requestParams.type = offersNavigation.offersType;

    // Device id
    if (typeof device == 'undefined') {
        requestParams.uuid = "None";
    } else {
        requestParams.uuid = device.uuid;
    }

    $.ajax({
        type: "GET",
        url: this.options.requestUrl,
        data: requestParams,
        success: function (data) {

            if(that.page == 1) {
                offersMap.deleteMarkers();
            }

            offersMap.addMarkers(data.data.offers);

            app.hideLoader();
            that.loading = false;
        },
        error: function() {
            // Alert
//            alert('Unable to connect to the server. Please check your network connection and try again.');
        }
    });

}


TagsMap.prototype.loadNextPage = function() {

    if(this.loading == true || this.noMore == true) {
        return ;
    }

    this.page = this.page+1;
    this.loadOffers();
}
