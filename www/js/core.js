// ons.disableAutoStatusBarFill(); - Disable the status bar margin.
var app = angular.module('app', ['onsen', 'angular-carousel', 'ngMap']);

app.directive('datePicker', function () {
    return {
        link: function postLink(scope, element, attrs) {
            scope.$watch(attrs.datePicker, function () {
                if (attrs.datePicker === 'start') {
                    //element.pickadate();
                }
            });
        }
    };
});

// Map Markers Controller

app.controller('markersController', function($scope, $compile){
	
	$scope.infoWindow = {
		title: 'title',
		content: 'content'
	};

	$scope.markers = [
		{
			'title' : 'Location #1',
			'content' : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras a viverra magna',
			'location'	: [40.7112, -74.213]
		}, 
		{
			'title' : 'Location #2',
			'content' : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras a viverra magna',
			'location'	: [40.7243, -74.2014]
		}, 
		{
			'title' : 'Location #3',
			'content' : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras a viverra magna',
			'location'	: [40.7312, -74.1923]
		}
    ];

    $scope.showMarker = function(event){

		$scope.marker = $scope.markers[this.id];
    	$scope.infoWindow = {
			title: $scope.marker.title,
			content: $scope.marker.content
		};
		$scope.$apply();
		$scope.showInfoWindow(event, 'marker-info', this.getPosition());
    }

});



app.controller('pluginsController', function($scope, $compile){

    $scope.openWebsite = function(){
		var ref = window.open('http://google.com', '_blank', 'location=yes');
    }

    $scope.openSocialSharing = function(){
		
		window.plugins.socialsharing.share('Message, image and link', null, 'https://www.google.com/images/srpr/logo4w.png', 'http://www.google.com');

		/*
		 * 	Social Sharing Examples
		 * 	For more examples check the documentation: https://github.com/EddyVerbruggen/SocialSharing-PhoneGap-Plugin
 
			window.plugins.socialsharing.share('Message only')
			window.plugins.socialsharing.share('Message and subject', 'The subject')
			window.plugins.socialsharing.share(null, null, null, 'http://www.google.com')
			window.plugins.socialsharing.share('Message and link', null, null, 'http://www.google.com')
			window.plugins.socialsharing.share(null, null, 'https://www.google.com/images/srpr/logo4w.png', null)
			window.plugins.socialsharing.share('Message and image', null, 'https://www.google.com/images/srpr/logo4w.png', null)
			window.plugins.socialsharing.share('Message, image and link', null, 'https://www.google.com/images/srpr/logo4w.png', 'http://www.google.com')
			window.plugins.socialsharing.share('Message, subject, image and link', 'The subject', 'https://www.google.com/images/srpr/logo4w.png', 'http://www.google.com')
		*
		*/

	}


	$scope.openEmailClient = function(){

		ons.ready(function() {
			cordova.plugins.email.open({
			    to:      'han@solo.com',
			    subject: 'Hey!',
			    body:    'May the <strong>force</strong> be with you',
			    isHtml:  true
			});
		});

	}

	$scope.getDirectionsApple = function(){
		
        window.location.href = "maps://maps.apple.com/?q=37.774929,-122.419416";

	}

	$scope.getDirectionsGoogle = function(){

		var ref = window.open('http://maps.google.com/maps?q=37.774929,-122.419416', '_system', 'location=yes');

	}


	$scope.getDate = function(){
		
		var options = {
		  date: new Date(),
		  mode: 'date'
		};

		datePicker.show(options, function(date){
		  alert("date result " + date);  
		});

	}

});


app.controller('bookingController', function($scope, $compile, $filter){

	$scope.bookdate = 'Pick Reservation Date';
	$scope.booktime = 'Pick Reservation Time';

	$scope.chooseDate = function(){
		
		var options = {
		  date: new Date(),
		  mode: 'date'
		};

		datePicker.show(options, function(date){
			
			var day 	= date.getDate();
		    var month 	= date.getMonth() + 1;
		    var year 	= date.getFullYear();

		    $scope.$apply(function(){
		    	$scope.bookdate = $filter('date')(date, 'MMMM d, yyyy');      
		    });

		});

	}

	$scope.chooseTime = function(){
		
		var options = {
		  date: new Date(),
		  mode: 'time'
		};

		datePicker.show(options, function(time){
		  	$scope.$apply(function(){
		    	$scope.booktime = $filter('date')(time, 'hh:mm a');
		    });
		});

	}

});
