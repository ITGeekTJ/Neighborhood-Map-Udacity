// Global variable for the map.
var map;

// Global variable for all locations on the map.
var Location 

// Global variables for authentication on Foursqure API.
var clientID;
var clientSecret;

// Array of all of the locations listed
var locations = [
    {
        title : 'Indianapolis Motor Speedway',
        lat : 39.78977746416131, lng : -86.23399395765476
    },
    {
        title : 'Lucas Oil Stadium',
        lat : 39.759975771677055, lng : -86.16354426702111
    },
    {
        title : 'Monument Circle',
        lat : 39.76838243284741, lng : -86.15805911401239
    },
    {
        title : 'Indianapolis Zoo',
        lat : 39.76762824223296, lng : -86.17995500564575
    },
    {
        title : 'White River State Park',
        lat : 39.76757876221424, lng : -86.1701488494873
    },
    {
        title : 'Indiana State Museum',
        lat : 39.76906093768051, lng : -86.16933360715025
    },
    {
        title : 'Indiana State Fairgrounds',
        lat : 39.82758608941335, lng : -86.13514095010628
	}
];

// Foursquare API 

Location = function(data) {
	var self = this;
	this.title = data.title;
	this.lat = data.lat;
	this.lng = data.lng;
	this.street = '';
	this.city = '';

	// Sets all of the markers visible by default
	this.visible = ko.observable(true);

	// Foursquare authentication credentials
	clientID = 'Y4OZ0UCZWBLDXA4CUSPKH2XQOMY1AEIKES4JGFZKSCP1BN4V';
	clientSecret = 'TV40WIAUUMSRJGMQMJHRY3JXEDIDYSZUF1H0YWXWHPT5CUR3';

	// Link to call Foursquare API
	var foursquareURL = 'https://api.foursquare.com/v2/venues/search?ll=' + this.lat + ',' + this.lng + '&client_id=' + clientID + '&client_secret=' + clientSecret + '&v=20170413' + '&query=' + this.title;

	// Retrieves Foursquare data and stores it.
	$.getJSON(foursquareURL).done(function(data) {
		var results = data.response.venues[0];
		self.street = results.location.formattedAddress[0] || 'No Address Provided';
		self.city = results.location.formattedAddress[1] || 'No Address Provided';
	}).fail(function () {
		$('.list').html('There was an error with your request. Please try again.');
	});

	// Content that will be contained in the infowindow
	this.contentString = '<div class="info-window-content"><div class="title"><b>' + data.title + "</b></div>" +
		'<div class="content">' + self.street + "</div>" +
        '<div class="content">' + self.city + "</div>";

    // Puts content into the infowindow.
    this.infoWindow = new google.maps.InfoWindow({content: self.contentString});

    // Puts marker on the map
    this.marker = new google.maps.Marker({
    	position: new google.maps.LatLng(data.lat, data.lng),
    	map: map,
    	title: data.title
    });

    // Only makes the one selected marker visible.
    this.showMarker = ko.computed(function() {
        if(this.visible() === true) {
            this.marker.setMap(map);
        } else {
            this.marker.setMap(null);
        }
        return true;
    }, this);

    // Add event listener for when a marker is clicked to display the infowindow
    this.marker.addListener('click', function() {
    	self.contentString = '<div class="info-window-content"><div class="title"><strong>' + data.title + "</strong></div>" +
		'<div class="content">' + self.street + "</div>" +
        '<div class="content">' + self.city + "</div>";

        self.infoWindow.setContent(self.contentString);

        self.infoWindow.open(map, this);

        self.marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
        	self.marker.setAnimation(null);
        }, 2000);
    });

    // Function to make the marker bounce when clicked.
    this.bounce = function(place) {
    	google.maps.event.trigger(self.marker, 'click');
    };

};

//Initiate Map
function initMap() {

	var self = this;

	//Holds value for list togglings
    this.toggleSymbol = ko.observable('hide');

	// Sets search input to blank.
	this.searchInput = ko.observable('');

	// Create a new blank array for location markers
	this.markers = ko.observableArray([]);

	//Constructor creates a new map - only center and zoom are required.
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 39.790278, lng: -86.164108},
		zoom: 13,
		mapTypeControl: false
	});

	var bounds = new google.maps.LatLngBounds();

	// Toggles the list view
    this.listToggle = function() {
        if(self.toggleSymbol() === 'hide') {
            self.toggleSymbol('show');
        } else {
            self.toggleSymbol('hide');
        }
    };

	// Push the marker to our arry of markers.
	locations.forEach(function(locationItem) {
		self.markers.push( new Location(locationItem));
	});

	// Searches for what user typed in the input bar using the locationlist array.
    // Only displaying the exact item results that user type if available in the locationlist array.
    this.filteredList = ko.computed( function() {
        var filter = self.searchInput().toLowerCase();
        if (!filter) {
            self.markers().forEach(function(locationItem){
                locationItem.visible(true);
            });
            return self.markers();
        } else {
            return ko.utils.arrayFilter(self.markers(), function(locationItem) {
                var string = locationItem.title.toLowerCase();
                var result = (string.search(filter) >= 0);
                locationItem.visible(result);
                return result;
            });
        }
    }, self);
	
}

// Error handling if map doesn't load.
function errorHandlingMap() {
    $('#map').html('We had trouble loading Google Maps. Please refresh your browser and try again.');
}

function startApp() {
    ko.applyBindings(new initMap());
}