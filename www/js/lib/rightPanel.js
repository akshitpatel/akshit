var rightPanel = {

    loaded: 0,

    init: function() {

        this.load();
    },

    load: function() {

        // Security check
        if(this.loaded != 0) {
            return ;
        }
        this.loaded = 1;

        $.ajax({
            type: "GET",
            url: app.appUrl+"provider/appInfo",
            success: function (obj) {

                $("#rightPanelData .panelText").text(obj.data.text);
                $(document).on("click",".fb-link", function(){
                    window.open(encodeURI(obj.data.social.facebook), '_system');
                });
                $(document).on("click",".tw-link", function(){
                    window.open(encodeURI(obj.data.social.twitter), '_system');
                });
                $("#rightPanelData address").text(obj.data.copyright);

                this.loaded = 2;
            },
            error: function() {
                this.loaded = 0;
            }
        });
        this.handler();
    },

    handler: function() {

        // When opening left panel
        $(document).on("click",".show-right-panel",function(){
            $("#"+app.appCurrentPage+" .rightPanel").html($("#rightPanelData").html());
            $("#"+app.appCurrentPage+" .right-panel-box").panel("open");
        });
    }
};