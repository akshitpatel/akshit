var listViewModule = {

    loaded: 0,
    listViewNo: 1,
    nextPageXhr: null,

    init: function() {

        // Security check
        if(this.loaded != 0) {
            return ;
        }
        this.loaded = 1;

        this.handler();
        return this.loaded;
    },

    // Button click handlers in list view
    handler: function() {

        // On External link click
        $(document).on("click","#listView .iframeOpenOffer",function(){
            app.openInIFrame($(this).attr('data-url'),'#listView');
        });

        // On business page link click
        $(document).on("click","#listView .iframeOpenBusiness",function(){
            app.openInIFrameTransition($(this).attr('data-url'), '#listView', '#iframePage')
        });

        // When going to list view not from iframePage
        $(document).on("pageshow","#listView",function(){
            if(app.appPreviousPage != 'iframePage' && app.appPreviousPage != 'neighbourhoodsPage') {
                app.listViewScreen();
            }
        });

        // Open reviews
        $(document).on("click","#listView .read-reviews-link",function(){
            var offerBox = $(this).closest(".offer");
            $(".review-opened",offerBox).show();
        });

        // Close reviews
        $(document).on("click","#listView .review-close-button",function(){
            $(this).closest(".review-opened").hide();
        });

    },

    // Render list from object
    renderListViewPage: function(obj) {

        var template = $("#listView #offerTemplate").html();
        var discountTemplate = $("#listView #discountTemplate").html();

        // Print neighbourhoods
        $.each(obj, function( index, value ) {
            $("#listView #list").append(template);
            selector = $( "#listView #list .offer" ).last();
            $(".number",selector).text(listViewModule.listViewNo);
            $(".main .info .title",selector).text(value.businessName);
            $(".image img",selector).attr("src", value.image);
            $(".main .info .business-location",selector).text(value.location);
            $(".main .info .opening-time",selector).text(value.openingHours);
            $(".main .info .business-category",selector).text(value.businessType);
            $(".main .info .business-distance",selector).text(value.distance+' miles away');
            $(".geo-url",selector).attr('data-url','http://maps.google.com/maps?ll='+value.lat+','+value.lng+'&q='+value.lat+','+value.lng);
            if(value.phone.length == 0 || app.isIPad) {
                $(".phone-url",selector).remove();
            } else {
                $(".phone-url",selector).attr('href','tel:'+value.phone);
            }

            // Keywords
            if(value.keywords.length > 0) {
                $.each(value.keywords, function( ind, keyword ) {
                    $(".keywords ul",selector).append("<li>"+keyword+"</li>")
                });
            }

            // Links to business page
            $(".image, .title, .keywords li, .description .text",selector).attr('data-url',value.businessUrl);
            $(".image, .title, .keywords li, .description .text",selector).addClass('iframeOpenBusiness');

            // Ratings
            $(".review-opener .stars",selector).text(value.rating);

            //Reviews
            if(value.review.length == 0) {
                $(".review-opener .ui-link",selector).remove();
            } else {
                $(".review-opened .review strong",selector).text(value.review.author);
                $(".review-opened .review .review-message",selector).text(value.review.text);
                $(".review-opened .close .more-reviews",selector).attr('data-url',value.review.moreReviews).addClass('iframeOpenBusiness');
            }

            // Offers list
            if(value.offers.length > 0) {
                $.each(value.offers, function( ind, offer ) {
                    $(".discount-list",selector).append(discountTemplate);
                    offerSelector = $( ".discount-list .discount", selector).last();
                    $(".weekdays li",offerSelector).each(function(index){
                        if(offer.days[index] == 1) {
                            $(this).addClass("special");
                        }
                    });
                    $(".image img",offerSelector).attr("src", offer.image);
                    $(".image span",offerSelector).text(offer.discount+' off');
                    $(".title",offerSelector).text(offer.title);
                    $(".time",offerSelector).text(offer.hours);
                    $(".get-offer a",offerSelector).attr('data-url',offer.url);
                    $("a.click-to-check",offerSelector).attr('data-url',offer.url);

                    if(offer.isActive == false) {
                        $(".disableOffer",offerSelector).removeClass("hide");
                    }
                });
            }

            listViewModule.listViewNo = listViewModule.listViewNo + 1;
        });

        $('span.stars').stars();
    },

    // Load new page on scroll
    loadListViewNextPage: function() {
        nid = app.selectedNid;
        lng = app.listViewLng;
        lat = app.listViewLat;

        // Loading security
        if(app.listViewLoading == true || app.listViewNoMore == true) {
            return ;
        }

        // Increase page
        app.listViewPage = app.listViewPage+1;

        // Loader
        app.listViewLoading = true;
        $(".listViewLoader .custom-loader").show();

        // Load new page
        listViewModule.nextPageXhr = $.ajax({
            type: "GET",
            url: app.appUrl+"provider/offerList",
            data: {nid: nid, lng: lng, lat: lat, page: app.listViewPage, date: app.listDate[2], filters: filtersModule.filters, type: offersNavigation.offersType},
            success: function (obj) {

                // Render new objects
                listViewModule.renderListViewPage(obj.data.offers);

                // No offers
                if(obj.data.offers.length == 0) {
                    app.listViewNoMore = true;
                }

                // Loader
                app.listViewLoading = false;
                $(".listViewLoader .custom-loader").hide();
            },
            error: function() {
                // Loader
                app.listViewLoading = false;
                app.listViewNoMore = true;
                $(".listViewLoader .custom-loader").hide();
            }
        });
    }
};