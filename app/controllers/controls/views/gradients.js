import { logger } from 'logger';

let normalizedCenterX;
let normalizedCenterY;
let colors;
let Gradient;
let gradientTypes;
let selectedGradient;

/**
 * The scoped constructor of the controller.
 **/
(function constructor() {
	normalizedCenterX = 0.5;
	normalizedCenterY = 0.5;
	colors = [ 'red', 'blue' ];
	Gradient = { RADIAL: 0, LINEAR: 1 };
	gradientTypes = [ 'radial', 'linear' ];
	selectedGradient = Gradient.RADIAL;
}());

function updateGradient() {
	const size = $.gradientView.rect;
	const minDimension = Math.min(size.width, size.height);
	const centerPoint = {
		x: size.width * normalizedCenterX,
		y: size.height * normalizedCenterY,
	};

	const startRadius = (minDimension / 2) * ($.startRadiusSlider.value / 100);
	const endRadius = (minDimension / 2) * ($.endRadiusSlider.value / 100);

	const gradient = {
		type: gradientTypes[selectedGradient]
	};

	// Linear gradients support colors with offsets and start-point / end-point
	// Radial gradients support raw colors, start-radius / end-radius and backfill-start / backfill-end
	// Read more: http://docs.appcelerator.com/platform/latest/#!/api/Titanium.UI.View-property-backgroundGradient
	if (selectedGradient === Gradient.LINEAR) {
		const startPoint = { x: precisionRound($.startRadiusSlider.value, -1) + '%', y: '50%' };
		const endPoint = { x: precisionRound($.endRadiusSlider.value, -1) + '%', y: '50%' };

		gradient.colors = [ { color: colors[0], offset: 0.0 }, { color: colors[1], offset: 1.0 } ];
		gradient.startPoint = startPoint;
		gradient.endPoint = endPoint;

		logger.log('Linear gradient updated: ' + JSON.stringify(centerPoint) + ', start-point: ' + JSON.stringify(startPoint) + ', end-point: ' + JSON.stringify(endPoint));
	} else {
		gradient.startPoint = centerPoint;
		gradient.endPoint = centerPoint;
		gradient.startRadius = startRadius;
		gradient.endRadius = endRadius;
		gradient.backfillStart = $.startFillSwitch.value;
		gradient.backfillEnd = $.endFillSwitch.value;
		gradient.colors = colors;

		logger.log('Radial gradient updated: ' + JSON.stringify(centerPoint) + ', start-radius: ' + startRadius + ', end-radius: ' + endRadius);
	}

	$.gradientView.backgroundGradient = gradient;
}

// eslint-disable-next-line no-unused-vars
function handleTouchMove(e) {
	const size = $.gradientView.rect;

	if (OS_ANDROID && Ti.UI.defaultunit !== 'px') {
		e.x /= Ti.Platform.displayCaps.logicalDensityFactor;
		e.y /= Ti.Platform.displayCaps.logicalDensityFactor;
	}

	normalizedCenterX = (size.width > 0) ? (e.x / size.width) : 0.5;
	normalizedCenterY = (size.height > 0) ? (e.y / size.height) : 0.5;

	updateGradient();
}

// eslint-disable-next-line no-unused-vars
function pickRandomColor() {
	colors = [ generateRandomColor(), generateRandomColor() ];
	updateGradient();
}

// CREDITS: https://stackoverflow.com/a/1484514/5537752
// eslint-disable-next-line no-unused-vars
function generateRandomColor() {
	const letters = '0123456789ABCDEF';
	let color = '#';

	for (var i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	}

	return color;
}

// eslint-disable-next-line no-unused-vars
function handleGradientType(e) {
	let isLinear;
	if (OS_IOS) {
		isLinear = e.index === Gradient.LINEAR;
		selectedGradient = e.index;
	} else if ($.gradientTypeSwitch.value) {
		isLinear = true;
		selectedGradient = Gradient.LINEAR;
		$.gradientTypeLabel.text = 'Linear';
	} else {
		isLinear = false;
		selectedGradient = Gradient.RADIAL;
		$.gradientTypeLabel.text = 'Radial';
	}
	$.startFillSwitch.enabled = !isLinear;
	$.endFillSwitch.enabled = !isLinear;
	$.startRadiusLabel.text = isLinear ? 'Start Point:' : 'Start Radius:';
	$.endRadiusLabel.text = isLinear ? 'End Point' : 'End Radius';

	updateGradient();
}

function precisionRound(number, precision) {
	var factor = Math.pow(10, precision);
	return Math.round(number * factor) / factor;
}
