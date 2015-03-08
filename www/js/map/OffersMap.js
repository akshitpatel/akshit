
function OffersMap (options) {
    this.haltPosition = false;
    this.options = options;
    this.markers = [];
    this.mapBoxes = [];
    this.labels = [];
    this.zindex = 1;

    this.map = new google.maps.Map(document.getElementById(this.options.mapId),{
        zoom: this.options.zoom,
        disableDefaultUI: true,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        scrollwheel: this.options.scrollwheel,
        center: new google.maps.LatLng(this.options.Lat, this.options.Lng)
    });
    var mcOptions = {
        gridSize: 36,
        styles: [{
            url: 'src/img/cluster-marker-blue.png',
            width: 36,
            height: 36,
            anchor: [36, 36],
            textSize: 11,
            textColor: '#ffffff'
        }]
    };
    this.mc = new MarkerClusterer(this.map, [], mcOptions);

    /**
     * Label
     */
    Label.prototype = new google.maps.OverlayView;
    Label.prototype.onAdd = function() {
        var pane = this.getPanes().overlayImage;
        pane.appendChild(this.div_);

        // Ensures the label is redrawn if the text or position is changed.
        var me = this;
        this.listeners_ = [
            google.maps.event.addListener(this, 'position_changed',
                function() { me.draw(); }),
            google.maps.event.addListener(this, 'text_changed',
                function() { me.draw(); }),
            google.maps.event.addListener(this, 'zindex_changed',
                function() { me.draw(); }),
            google.maps.event.addListener(this, 'img_changed',
                function() { me.draw(); })
        ];
    };
    Label.prototype.onRemove = function() {
        this.div_.parentNode.removeChild(this.div_);
        // Label is removed from the map, stop updating its position/text.
        for (var i = 0, I = this.listeners_.length; i < I; ++i) {
            google.maps.event.removeListener(this.listeners_[i]);
        }
    };
    Label.prototype.draw = function() {
        var projection = this.getProjection();
        var position = projection.fromLatLngToDivPixel(this.get('position'));
        var div = this.div_;
        div.style.left = position.x + 'px'; //
        div.style.top = position.y + 'px';
        div.style.display = 'block';
        div.style.zIndex = this.get('zIndex'); //ALLOW LABEL TO OVERLAY MARKER
        this.span_.style.background = "url('"+this.get('img')+"')";
        this.span_.style.height = "47px";
        this.span_.style.width = "33px";
        if(this.get('type') == "business") {
            this.span_.innerHTML = "<div style='text-align: right;padding-top: 2px; padding-right: 2px; font-size: 9px;'>"+this.get('text').toString()+"</div>";
        } else {
            this.span_.innerHTML = "<div style='text-align: center; padding-top: 3px'>"+this.get('text').toString()+"</div>";
        }
    };
};




// Define the overlay, derived from google.maps.OverlayView
function Label(opt_options, icon) {
    // Initialization
    this.setValues(opt_options);
    this.icon = icon;

    // Here go the label styles
    var span = this.span_ = document.createElement('div');
    span.style.cssText = 'position: relative; left: -51%; top: -47px; ' +
        'white-space: nowrap;color:#ffffff;' +
        'padding: 0px;font-family: Arial; font-weight: bold;' +
        'font-size: 12px;';

    var div = this.div_ = document.createElement('div');
    div.appendChild(span);
    div.style.cssText = 'position: absolute; display: none';
};

OffersMap.prototype.getBoxContent = function(data,type) {

    var additionalClass = "";
    var getOfferText = "Get Offer";
    if(type == "inactive") {
        additionalClass = " inactive-map-offer";
        getOfferText = "Valid offer times";
    }

    var div = document.createElement("div");
    content = '\
            <div style="position: absolute; z-index: -40" class="map-offer" data-tap-toggle="false" >\
            <div class="offer-details'+additionalClass+'" data-tap-toggle="false" >\
                <div class="offer-text" data-tap-toggle="false" >\
                    <h5 class="offer-title">'+data.title+'</h5>\
                    <small class="valid-time">'+data.hours+'</small>\
                    <h6 class="place-name" onClick="app.openInIFrameTransition(\''+data.businessUrl+'\', \'#mapPage\', \'#iframePage\')">'+data.businessName+', '+data.businessType+'</h6>\
                    <small class="place-distance">'+data.distance+' miles away</small>\
                    <a href="javascript:void(0)" onClick="app.openInIFrameTransition(\''+data.businessUrl+'\', \'#mapPage\', \'#iframePage\')" class="chevron-right">\
                        <img src="src/img/offer-chevron-right.png" alt=">">\
                        </a>\
                    </div>\
                    <a href="javascript:void(0)" onClick="app.openInIFrameTransition(\''+data.url+'\', \'#mapPage\', \'#iframePage\')" class="offer-link">\
                        <span class="text">'+getOfferText+'</span>\
                    </a>\
                </div>\
            </div> <div style="clear:both"></div> \
            ';
    $(div).html(content);

    return div;
}

OffersMap.prototype.addMarker = function(markerData) {
    var myLatLng = new google.maps.LatLng(markerData.lat,markerData.lng);

    this.zindex = this.zindex + 1;

    var icon = this.options.pointer;
    if(markerData.type == "business") {
        icon = this.options.businessPointer;
        markerData.discount = "Open<br/>Now";
    } else if (markerData.type == "inactive") {
        icon = this.options.inactivePointer;
    }

    marker = new google.maps.Marker({
        position: myLatLng,
        icon: icon,
        zIndex: this.zindex*10000,
        visible: true
    });

    var label = new Label();
    label.set('zIndex', this.zindex);
    label.bindTo('position', marker, 'position');
    label.bindTo('map', marker);
    label.set('text', markerData.discount);
    label.set('img', icon);
    label.set('type', markerData.type);

    if(markerData.type == "business") {

        google.maps.event.addListener(marker, 'click', function() {
            app.openInIFrameTransition(markerData.pageUrl, '#mapPage', '#iframePage')
        });
    } else {
        var mapBoxObtions = {
            content: this.getBoxContent(markerData.offersList,markerData.type)
            ,disableAutoPan: false
            ,maxWidth: 0
            ,pixelOffset: new google.maps.Size(-16, -47)
            ,zIndex: null
            ,closeBoxMargin: "10px 2px 2px 2px"
            ,infoBoxClearance: new google.maps.Size(1, 1)
            ,isHidden: false
            ,pane: "floatPane"
            ,enableEventPropagation: false
        };
        var mapBox = new InfoBox(mapBoxObtions);
        mapBox.bindTo('position', marker, 'position');

        that = this;
        google.maps.event.addListener(marker, 'click', function() {
            that.closeAllBoxes(null);
            mapBox.open(this.map, this);
        });
        this.mapBoxes.push(mapBox);
    }

    this.markers.push(marker);
    this.labels.push(label);
};

OffersMap.prototype.closeAllBoxes = function(map) {
    for (var i = 0; i < this.mapBoxes.length; i++) {
        this.mapBoxes[i].setMap(map);
    }
};

OffersMap.prototype.setAllMap = function(map) {
    for (var i = 0; i < this.markers.length; i++) {
        this.markers[i].setMap(map);
        this.markers[i] = null;
    }
    for (var i = 0; i < this.labels.length; i++) {
        this.labels[i].setMap(map);
        this.labels[i] = null;
    }
    for (var i = 0; i < this.mapBoxes.length; i++) {
        this.mapBoxes[i].setMap(map);
    }
};

OffersMap.prototype.triggerResize = function() {

    google.maps.event.trigger(this.map, 'resize');
}

OffersMap.prototype.clearMarkers = function() {

    this.mc.clearMarkers();
    this.setAllMap(null);
    var zoom = this.map.getZoom();
    this.haltPosition = true;
    this.map.setZoom(zoom+1);
    this.map.setZoom(zoom);
};

OffersMap.prototype.showMarkers = function() {
    this.setAllMap(this.map);
};

OffersMap.prototype.returnMap = function() {
    return this.map;
};
OffersMap.prototype.deleteMarkers = function() {
    this.clearMarkers();
    this.markers = [];
    this.markersData = [];
    this.markersOffers = [];
    this.labelsData = [];
    this.labels = [];
//    this.mapBoxes = [];
};
OffersMap.prototype.getLabelsData = function() {
    return this.labelsData;
};
OffersMap.prototype.getLabels = function() {
    return this.labels;
};
OffersMap.prototype.getMarkersData = function() {
    return this.markersData;
};
OffersMap.prototype.getMarkersOffers = function() {
    return this.markersOffers;
};
OffersMap.prototype.getMarkers = function() {
    return this.markers;
};
OffersMap.prototype.addMarkers = function(markers) {
    obj = this;
    $.each(markers, function( index, marker ) {
        obj.addMarker(marker);
    });
    obj.mc.addMarkers(this.markers);

    google.maps.event.addListener(this.map, "click", function () {
        obj.closeAllBoxes(null);
    });
};