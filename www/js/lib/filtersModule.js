var filtersModule = {

    loaded: 0, // Automatically changes when filters are loaded. 0 - not loaded, 1 - loading, 2 - loaded
    timeout: null,
    filters: "",

    init: function() {

        // Security check
        if(this.loaded != 0) {
            return ;
        }

        this.loadFilters();
        this.loadListeners();
    },

    // Load filters to div
    loadFilters: function() {

        // Security check
        if(filtersModule.loaded != 0) {
            return ;
        }
        filtersModule.loaded = 1;

        $.ajax({
            type: "GET",
            url: "http://antipiracy.in/v1.1/filters.php",
            success: function (obj) {

                var template = $("#filter-footer-collapse .filter-list").html();
                $("#filter-footer-collapse .filter-list").html("");

                // Print neighbourhoods
                $.each(obj.data, function( index, value ) {
                    $("#filter-footer-collapse .filter-list").append(template);
                    selector = $( "#filter-footer-collapse .filter-list div.filter-wrapper" ).last();

                    $("button",selector).text(value.title);
                    $("button",selector).attr("data-filter",value.id);

                    if(value.checked_in_app == 1) {
                        $("button",selector).addClass("active");
                        $("button",selector).attr("filter-active","active");
                        $("#filter-footer-collapse .all-filters").removeClass("active");
                    }
                });

                $(".filter-collapse-btn").show();
                filtersModule.loaded = 2;
                filtersModule.filtersHandler();
                filtersModule.filterEvent();
            },
            error: function() {
                // If there is problem with loading filters
                // hiding button (it will be shown, when filters load successfully)
                $(".filter-collapse-btn").hide();
                filtersModule.loaded = 0;
            }
        });
    },

    // Load filter listeners
    loadListeners: function() {

        // Closing filters on link with class hide-filters click
        $(document).on("click",".hide-filters",function() {
            $("#filter-footer-collapse").removeClass('open');
        });

        // Closing filters when page changes
        $(document).on("pageshow",function(){
            $("#filter-footer-collapse").removeClass('open');
        });

        // Filters events listener
        $(document).on("filtersChanged", filtersModule.filtersChangedListener);
    },

    // On filters click handler
    filtersHandler: function() {

        $(document).on("click","#filter-footer-collapse .all-filters",function(){
            $(this).addClass("active");
            $("#filter-footer-collapse .single-filter").removeClass("active");
            $("#filter-footer-collapse .single-filter").attr("filter-active","notactive");
            filtersModule.filterEvent();
        });

        $(document).on("click","#filter-footer-collapse .single-filter",function(){
            if($(this).hasClass("active")) {
                $(this).removeClass("active");
                $(this).attr("filter-active","notactive");
                has = $("#filter-footer-collapse .single-filter").hasClass('active');
                if(has == false) {
                    $("#filter-footer-collapse .all-filters").addClass("active");
                }
            } else {
                $(this).addClass("active");
                $(this).attr("filter-active","active");
                $("#filter-footer-collapse .all-filters").removeClass("active");
            }
            filtersModule.filterEvent();
        });
    },

    // When filters Changed event is triggered
    filtersChangedListener: function() {

        // Reload list view
        if(app.appCurrentPage == "listView") {
            app.listViewScreen();
        }

        // Relad map
        if(app.appCurrentPage == "mapPage") {
            mapModule.reloadMapPage();
        }
    },

    // Event when filters are checked
    filterEvent: function() {

        filters = "";
        $('.map-filters .single-filter[filter-active="active"]').each(function() {
            filters += $(this).attr('data-filter')+",";
        });
        filtersModule.filters = filters;

        if (filtersModule.timeout) {
            clearTimeout(filtersModule.timeout);
        }

        // Event with delay
        filtersModule.timeout = setTimeout(function() {
            $.event.trigger({
                type: "filtersChanged",
                time: new Date()
            });
        }, 600);
    },
};