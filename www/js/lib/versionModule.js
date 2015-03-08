var versionModule = {

    loaded: 0,
    versionUrl: "",


    init: function() {
        versionModule.versionUrl = app.appHost+"/versionCheck",
        this.load();
    },

    // Trigger an event on model loaded
    moduleLoaded: function() {
        filtersModule.timeout = setTimeout(function() {
            $.event.trigger({
                type: "moduleLoaded",
                time: new Date()
            });
        }, 10);
    },
    // Capture all data
    load: function() {

        // Security check
        if(this.loaded != 0) {
            return ;
        }
        this.loaded = 1;

        var data = {};

        // Api version
        data.apiVersion = app.appApiVersion;

        // Device information
        if (typeof device == 'undefined') {
            data.cordova    = "None";
            data.model      = "None";
            data.name       = "None";
            data.platform   = "None";
            data.uuid       = "None";
            data.version    = "None";
        } else {
            data.cordova    = device.cordova;
            data.model      = device.model;
            data.name       = device.name;
            data.platform   = device.platform;
            data.uuid       = device.uuid;
            data.version    = device.version;
        }

        var t = new Date().getTime();
        $.ajax({
            type: "GET",
            url: "info.xml",
            dataType: "xml",
            cache: false,
            data: {t: t},
            success: function(xml) {
                data.appVersion = $(xml).find('widget').attr('version');
                data.appId = $(xml).find('widget').attr('id');
                versionModule.checkVersion(data);
            },
            error: function(xhr, status, text) {
                navigator.notification.alert(
                    'Service is temporarily unavailable please try again later. (#1)',
                    app.closeApp,
                    'Alert',
                    'OK'
                );
            }
        });
    },

    // Check version
    checkVersion: function(data) {
        $.ajax({
            type: "GET",
            url: versionModule.versionUrl,
            data: data,
            success: function (obj) {

                versionModule.handleResponse(obj.data);
            },
            error: function() {
                navigator.notification.alert(
                    'Service is temporarily unavailable please try again later.  (#2)',
                    app.closeApp,
                    'Alert',
                    'OK'
                );
            }
        });
    },

    // Handle response
    handleResponse: function(obj) {

        if(obj.status == "OK") {
            versionModule.moduleLoaded();
        } else {
            if(obj.data.type == "ALERT") {

                var action = obj.data.exitOnClose ? app.closeApp : versionModule.moduleLoaded;
                navigator.notification.alert(
                    obj.data.msg,
                    action,
                    obj.data.title,
                    obj.data.button
                );

            } else if(obj.data.type == "INFO") {
                $("#info-alert-box .alert-text").html(obj.data.msg);
                $("#info-alert-box").show();
                $("#info-alert-box .alert-close-button").click(function(){
                    if(obj.data.exitOnClose) {
                        app.closeApp();
                    } else {
                        $("#info-alert-box .alert-text").html();
                        $("#info-alert-box").hide();

                        versionModule.moduleLoaded();
                    }
                });
            } else if(obj.data.type == "NEWVERSION") {
                $("#info-alert-box .alert-text").html($("#newVersionWindow"));
                $("#info-alert-box").show();
                $("#info-alert-box .alert-text .new-version-text").html(obj.data.msg);
                $("a.new-version-android").attr("data-url",obj.data.androidLink);
                $("a.new-version-ios").attr("data-url",obj.data.iosLink);

                if(obj.data.exitOnClose) {
                    $(".close-new-version span").text("Close");
                } else {
                    $(".close-new-version span").text("Continue...");
                }

                $(window.document).on("click",".close-new-version",function(){
                    if(obj.data.exitOnClose) {
                        app.closeApp();
                    } else {
                        $("#info-alert-box .alert-text").html();
                        $("#info-alert-box").hide();
                        versionModule.moduleLoaded();
                    }
                });
            }
        }
    }



};