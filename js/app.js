// Quoting JS

Vue.component('places', {
	template: '<input :id="id" type="text" class="form-control place" v-model="place" :placeholder="placeholder" />',
	props: ['id', 'model', 'placeholder'],
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
	leaveClass: 'zoomOut'
});

new Vue({
	el: '#app',
	data: init(),
	methods: {
		getQuote: getQuote,
		reset: reset,
		clearPlace: clearPlace
	}
});

// Initial Data
function init() {
	return {
		passengers: '',
		type: '',
		start: '',
		end: '',
		distance: '',
		time: '',
		estimate: '',
		roundTrip: '',
		contact: ''
	}
}

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
		var rates = getRates(self.type, self.passengers);

		var quote = rates.base + (miles * rates.mile) + (minutes * rates.minute);

		if (quote < rates.minimum) {
			quote = rates.minimum;
		}

		console.log('D:', miles, 'miles');
		console.log('T:', minutes, 'minutes');
		console.log('Quote is', quote);

		if (self.roundTrip) {
			quote *= 2;
		}

		self.estimate = {
			miles: miles,
			minutes: minutes,
			quote: quote
		}

		var subject = 'B.O.B. Fare Estimate';
		var body = 	'I received a quote of $' + self.estimate.quote.toFixed(2) + '.\n\n' + 
					'Here is my information:\n' +
					'Passengers: ' + self.passengers + '\n' +
					'Reserved or On Demand: ' + self.type + '\n' +
					'Starting address: ' + self.start + '\n' +
					'Destination address: ' + self.end + '\n';

		self.contact = 'mailto:heath@bigorangebus.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);

	});

}

// Reset to try again
function reset() {
	$('.place').val('');
	this.$data = init();
}

// Get base rate
function getRates(type, passengers) {

	var rates = {};

	console.log('Type:', type);

	if (type === 'Reserved') {
		rates.minimum = 75;
	}
	else {
		rates.minimum = 25;
	}

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

// Clears out the google place input
function clearPlace(input) {
	this.$data[input] = '';
	$('#' + input).val('');
}
