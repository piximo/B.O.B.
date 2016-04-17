// Quoting JS

Vue.component('places', {
	template: '<input type="text" class="form-control" v-model="place" :placeholder="placeholder" />',
	props: ['model', 'placeholder'],
	data: {
		place: '',
		set: false
	},
	watch: {
		place: function(val, old) {
			if (this.set) {
				this.$parent.$data[this.model] = val;
			}
		}
	},
	attached: function() {
		
		var self = this;
		var autocomplete = new google.maps.places.Autocomplete(self.$el);

		google.maps.event.addListener(autocomplete, 'place_changed', function() {
			self.set = true;
			self.place = self.$el.value;
		});

	}

});

Vue.transition('fade', {
	enterClass: 'zoomInDown',
	leaveClass: 'fadeOutDown'
});

new Vue({
	el: '#app',
	data: {
		passengers: '',
		type: '',
		start: '',
		end: '',
		distance: '',
		time: '',
		estimate: ''
	},
	methods: {
		getQuote: getQuote
	}
});

// Calculate quote
function getQuote() {

	var self = this;

	calculateDistance(self.start, self.end, function(err, distance){

		if (err) {
			console.log('ERR:', err);
			return alert('Sorry, we couldn\'t calculate a distance between your two address\'s. Try an address closer to you.');
		}

		var miles = distance.miles;
		var minutes = distance.minutes;
		var rates = getRates(self.passengers);

		var quote = rates.base + (miles * rates.mile) + (minutes * rates.minute);

		if (quote < 75) {
			quote = 75;
		}

		console.log('D:', miles, 'miles');
		console.log('T:', minutes, 'minutes');
		console.log('Quote is', quote);

		self.estimate = {
			miles: miles,
			minutes: minutes,
			quote: quote
		}

	});

}

// Get base rate
function getRates(passengers) {

	var rates = {};

	if (passengers === '11') {

		rates.base = 12;
		rates.mile = 2.5;
		rates.minute = .4;

	}
	else {

		rates.base = 15;
		rates.mile = 2.85;
		rates.minute = .5;

	}

	return rates;

}

// Calculate Distance
function calculateDistance(start, end, calculated) {

	var service = new google.maps.DistanceMatrixService();
	var meterToMiles = 0.000621371;
	var secondToMinutes = 0.0166667;

	service.getDistanceMatrix({
		origins: [start],
		destinations: [end],
		travelMode: google.maps.TravelMode.DRIVING,
		unitSystem: google.maps.UnitSystem.IMPERIAL
	}, function(response, status){

		if (status !== google.maps.DistanceMatrixStatus.OK) {
			return calculated('Not ok');
		}

		try {

			var results = response.rows[0].elements[0];
			var miles = results.distance.value * meterToMiles;
			var minutes = results.duration.value * secondToMinutes;

			return calculated(null, { miles: miles, minutes: minutes });

		}
		catch (err) {
			calculated(err);
		}

	});

}