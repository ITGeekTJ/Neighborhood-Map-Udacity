// Array of all of the locations listed
var locations = [
    {
        title : 'Indianapolis Motor Speedway',
        address: '4790 W. 16th St. Indianapolis, IN 46222',
        locale: {lat : 39.78977746416131, lng : -86.23399395765476},
        venueID: '4ad4bff8f964a52011ea20e3'
    },
    {
        title : 'Lucas Oil Stadium',
        address: '500 S. Capitol Ave. Indianapolis, IN 46225',
        locale: {lat : 39.759975771677055, lng : -86.16354426702111},
        venueID: '4b154fdcf964a5205faf23e3'
    },
    {
        title : 'Monument Circle',
        address: '1 Monument Cir. Indianapolis, IN 46204',
        locale: {lat : 39.76838243284741, lng : -86.15805911401239},
        venueID: '4adc9080f964a520482d21e3'
    },
    {
        title : 'Indianapolis Zoo',
        address: '1200 W. Washington St. Indianapolis, IN 46222',
        locale: {lat : 39.76762824223296, lng : -86.17995500564575},
        venueID: '58daa1558bbb0b01f18ec1fd'
    },
    {
        title : 'White River State Park',
        address: '650 W. Washington St. Indianapolis, IN 46204',
        locale: {lat : 39.76757876221424, lng : -86.1701488494873},
        venueID: '4d123f40ffa36ea85898f7da'
    },
    {
        title : 'Indiana State Museum',
        address: '500 W. Washington St. Indianapolis, IN 46204',
        locale: {lat : 39.76906093768051, lng : -86.16933360715025},
        venueID: '4ae08848f964a5200c8021e3'
    },
    {
        title : 'Indiana State Fairgrounds',
        address: '1202 E. 38th St. Indianapolis, IN 46205',
        locale: {lat : 39.82758608941335, lng : -86.13514095010628},
        venueID: '4ad4bff9f964a5201cea20e3'
	}
]

Location = function(data) {
    this.title = data.title;
    this.lat = data.lat;
    this.lng = data.lng;
    this.marker = data.marker;
};

// Create View Model
var ViewModel = function() {

    var self = this;

    // Create a new blank array for location markers
    this.markers = ko.observableArray([]);

    // Push the marker to our arry of markers.
    locations.forEach(function(locationItem) {
        self.markers.push( new Location(locationItem));
    });

    this.currentLocation = ko.observable(this.markers()[0]);

    this.setLocation = function(clickedLoc) {
        self.currentLocation(clickedLoc);
    };

    this.showMarker = function(location) {
        google.maps.event.trigger(location.marker, 'click');
    }

    // Filter through locations
    this.filter = ko.observable('');

    this.filteredList = ko.computed(function() {
        var filter = self.filter().toLowerCase();
        return ko.utils.arrayFilter(self.markers(), function(item) {
            const isVisible = item.title.toLowerCase().indexOf(filter) > -1 || !filter;
            item.marker.setVisible(isVisible);
            return isVisible;
        })
    });
};

// Map variable
var map;

// Create a blank array for all venues
var markers = [];

// Initiate Map
var initMap = function() {
    //Constructor creates a new map - only center and zoom are required.
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 39.790278, lng: -86.164108},
        zoom: 13,
        mapTypeControl: false
    });

    var largeInfoWindow = new google.maps.InfoWindow();

    var bounds = new google.maps.LatLngBounds();

    // Go through locations and get position of each location
    for (var i = 0; i < locations.length; i++) {
        var title = locations[i].title;
        var position = locations[i].locale;
        var address = locations[i].address;
        var venueID = locations[i].venueID;

        // Create markers for locations and store in an array
        var marker = new google.maps.Marker({
            map: map,
            position: position,
            title: title,
            address: address,
            id: venueID,
            animation: google.maps.Animation.DROP,
        });

        // Push marker to array of markers
        locations[i].marker = marker;

        // Extend boundries on the map for markers
        bounds.extend(marker.position);

        // Add event listener for onclick event to open an infowindow
        marker.addListener('click', function() {
            markerBounce(this, marker);
            foursquareRequest(this);
        });
    }
    ko.applyBindings(new ViewModel());

    // Creates info window
    var populateInfoWindow = function(marker, infowindow) {
        if (infowindow.marker != marker) {
            infowindow.marker = marker;

            infowindow.setContent('<div>' + marker.title + '</div>' +
                '<div>' + marker.address + '</div>' +
                '<div>' + 'Description: ' + marker.description + '</div>');

            infowindow.open(map, marker);

            infowindow.addListener('closeclick', function() {
            });
        }
    };

    // Foursquare API
    var foursquareRequest = function(marker) {
        var apiURL = 'https://api.foursquare.com/v2/venues/';
        var clientID = 'Y4OZ0UCZWBLDXA4CUSPKH2XQOMY1AEIKES4JGFZKSCP1BN4V';
        var clientSecret = 'TV40WIAUUMSRJGMQMJHRY3JXEDIDYSZUF1H0YWXWHPT5CUR3';
        var version = '20170413';
        var venueFoursquareID = marker.id;
        
        var foursquareURL = apiURL + venueFoursquareID + '?client_id=' + clientID + '&client_secret=' + clientSecret + '&v=' + version;

        $.ajax({
            url: foursquareURL,
            success: function(data) {

                marker.description = data.response.venue.description;
                populateInfoWindow(marker, largeInfoWindow);
            },

            error: function(error) {
                largeInfoWindow.setContent('<div>' + marker.title + '</div>' +
                '<div>' + marker.address + '</div>' +
                '<div>' + 'Description: ' + 'FourSquare cannot be reached' + '</div>');
                largeInfoWindow.open(map, marker);
            }
        });
    }

    // Makes marker bounce when maker is clicked
    var markerBounce = function(marker) {
        if (marker.getAnimation() === null) {
            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function() {
                marker.setAnimation(null);
            }, 2100);
        } else {
            marker.setAnimation(google.maps.Animation.NULL);
        }
    };
};

var mapError = function(error) {
    alert("Uh-oh! Something went wrong! Please try again later.")
};