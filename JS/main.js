var map;
var ShowInfo;

//View Map
var MapView = function () {

    // set the map center
    var mapCenter = {
        center: { lat: 24.713552, lng: 46.67529 },
        zoom: 11,
    };

    map = new google.maps.Map(document.getElementById('map'), mapCenter);

    // infowindow
    ShowInfo = new google.maps.InfoWindow({
    });

    return true;
};

var ViewModel = function () {
    var self = this;

    this.Place = function (name, lat, lng, street, city) {

        this.name = ko.observable(name);
        this.lat = ko.observable(lat);
        this.lng = ko.observable(lng);
        this.street = ko.observable(street);
        this.city = ko.observable(city);

        // Create marker
        this.marker = new google.maps.Marker({
            position: new google.maps.LatLng(lat, lng),
            animation: google.maps.Animation.DROP,
            name: name,
        });

        //Street View
        this.streetViewImg = ko.observable('<img class="bgimg" src="http://maps.googleapis.com/maps/api/streetview?size=600x400&location=' + street + ', ' + city + '">');

        this.wikiInfo = ko.observable('');

        var self = this;

        // Infowindow
        this.info = ko.computed(function () {
            return '<div class="infowindow-height">' +
            '<h3>' + self.name() + '</h3>' +
            '<div><p>' +
              self.wikiInfo() +
              '<div>' + self.streetViewImg() + '</div>' +
            '</p></div>' +
          '</div>';
        });

        //show info window
        google.maps.event.addListener(this.marker, 'click', function () {
            self.getPlace();
        });

        this.getPlace = function () {
            map.setCenter(self.marker.getPosition());
            ShowInfo.setContent(self.info());
            ShowInfo.open(map, self.marker);
        };

        // Set marker map
        this.marker.setMap(map);
    };

    // list of all places
    this.placesList = function () {

        var arrPlaces = [];

        // Instantiate all locations
        arrPlaces.push(ko.observable(new self.Place('Princess Nourah Bint Abdulrahman University', 24.846461, 46.724731, 'Airport Road, Al Narjis', 'Riyadh')));

        arrPlaces.push(ko.observable(new self.Place('King Saud University', 24.716241, 46.619108, 'King Khalid Road', 'Riyadh')));

        arrPlaces.push(ko.observable(new self.Place('Imam Muhammad ibn Saud Islamic University', 24.814587, 46.711373, 'Airport Road', 'Riyadh')));

        arrPlaces.push(ko.observable(new self.Place('Prince Sultan University', 24.735681, 46.699572, 'Prince Nasser Bin Farhan st', 'Riyadh')));

        arrPlaces.push(ko.observable(new self.Place('Dar Al Uloom University', 24.795804, 46.711291, 'Al Mizan st', 'Riyadh')));

        return arrPlaces;
    };
    this.placeslst = ko.observable(this.placesList());

    // Initial value for search input
    var searchName = '';

    // Search place
    this.searchPlace = ko.observable(searchName);

    this.places = ko.computed(function () {

        var filteredPlaces = ko.observableArray();

        var filter = self.searchPlace().toLowerCase();

        self.placeslst().forEach(function (place) {
            place().marker.setVisible(false);

            if (place().name().toLowerCase().indexOf(filter) != -1 || self.searchPlace() == searchName) {
                filteredPlaces.push(place());
                place().marker.setVisible(true);
            }
            else {
                var words = place().name();

                for (var i = 0; i < words.length; i++) {
                    if (words[i].toLowerCase().indexOf(filter) != -1) {
                        filteredPlaces.push(place());
                        place().marker.setVisible(true);
                    }
                }
            }
        });
        return filteredPlaces();
    });

    //wikipedia information
    this.wikipedia = function () {
        var wikipediaRequest = function (index) {

            var wikiRequestTimeout = setTimeout(function () {
                self.places()[index].wikiInfo('No Wiki info to dispay.<br>');
            }, 1000);

            // Request
            $.ajax({
                url: wikiUrl,
                dataType: 'jsonp',
                success: function (response) {
                    // replace wikInfo
                    var newInfo = self.places()[index].wikiInfo();
                    newInfo = 'Wikipedia:';
                    newInfo = newInfo.concat('<ul style="padding-left: 16px;">');
                    var articleLst = response[1];
                    for (var j = 0; j < articleLst.length; j++) {
                        if (j > 2) {
                        }
                        var article = articleLst[j];
                        var url = 'http://en.wikipedia.org/wiki/' + article;
                        newInfo = newInfo.concat('<li> <a href="' + url + '">' + article + '</a></li>');
                    }
                    clearTimeout(wikiRequestTimeout);
                    newInfo = newInfo.concat('</ul>');
                    self.places()[index].wikiInfo(newInfo);
                }
            });
        };


        for (var i = 0; i < self.places().length; i++) {
            var wikiUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + self.places()[i].name() + '&format=json&callback=wikiCallBack';
            wikipediaRequest(i);
        }
    };
    this.wikipedia();
};

$(document).ready(function () {
    if (MapView()) {
        ko.applyBindings(new ViewModel());
    }
});