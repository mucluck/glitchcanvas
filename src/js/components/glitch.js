'use strict';

const Glitch = (($) => {
	class Glitch {
		constructor(canvas, options = {}) {
			this._canvas = canvas;
			this._width = canvas.width;
			this._height = canvas.height;
			this._options = $.extend({}, {
				rank: 6,
				coordinates: {
					x: 0,
					y: 0
				},
				complete: () => {},
			}, options);

			this._templateCanvas = document.createElement('canvas');
			this._templateContext = tempCanvas.getContext('2d');
		}

		_init() {
			this._templateCanvas.width = this._width;
			this._templateCanvas.height = this._height;
			this._templateContext.drawImage(this._canvas, options.coordinates.x, options.coordinates.y, this._width, this._height);
			this._templateSourceData = this._templateContext.getImageData(options.coordinates.x, options.coordinates.y, this._width, this._height).data;
		}

		_glitched() {
			for (let i = 0; i < this._options.rank; i++) {
				let y = Glitch.randomInteger(-this._height, this._height);
				let chunkHeight = Math.min(Glitch.randomInteger(1, this._height / 4), this._height - y);
				let x = Glitch.randomInteger(1, this._options.rank * this._options.rank / 100 * this._width);
				let chunkWidth = this._width - x;

				this._templateContext.drawImage(this._canvas,
					0, y, chunkWidth, chunkHeight,
					x, y, chunkWidth, chunkHeight);

				this._templateContext.drawImage(this._canvas,
					chunkWidth, y, x, chunkHeight,
					0, y, x, chunkHeight);
			}
		}

		static randomInteger(min, max) {
			return (Math.floor(Math.random() * (max - min) + min));
		}

	}

	return Glitch;
})(jQuery);

export default Glitch;

(function ($) {
	var noop = function () {},
		defaults = function (obj, defaults) {
			for (var prop in defaults) {
				if (obj[prop] == null)
					obj[prop] = defaults[prop];
			}
			return obj;
		},
		getRandInt = function (min, max) {
			return (Math.floor(Math.random() * (max - min) + min));
		};

	var _glitch = function (canvas, amount) {
		var x, y, w = canvas.width,
			h = canvas.height,
			i, _len = amount || 6,
			channelOffset = (getRandInt(-_len * 2, _len * 2) * w * +getRandInt(-_len, _len)) * 4,
			maxOffset = _len * _len / 100 * w,
			chunkWidth, chunkHeight,
			tempCanvas = document.createElement("canvas"),
			tempCtx = tempCanvas.getContext("2d"),
			srcData, targetImageData, data;

		tempCanvas.width = w;
		tempCanvas.height = h;

		tempCtx.drawImage(canvas, 0, 0, w, h);

		srcData = tempCtx.getImageData(0, 0, w, h).data;

		for (i = 0; i < _len; i++) {
			y = getRandInt(0, h);
			chunkHeight = Math.min(getRandInt(1, h / 4), h - y);
			x = getRandInt(1, maxOffset);
			chunkWidth = w - x;
			tempCtx.drawImage(canvas,
				0, y, chunkWidth, chunkHeight,
				x, y, chunkWidth, chunkHeight);
			tempCtx.drawImage(canvas,
				chunkWidth, y, x, chunkHeight,
				0, y, x, chunkHeight);
		}

		targetImageData = tempCtx.getImageData(0, 0, w, h);

		data = targetImageData.data;

		for (i = getRandInt(0, 3), _len = srcData.length; i < _len; i += 4) {
			data[i + channelOffset] = srcData[i];
		}

		for (i = 0; i < _len; i++) {
			data[i++] *= 2;
			data[i++] *= 2;
			data[i++] *= 2;
		}

		tempCtx.putImageData(targetImageData, 0, 0);

		tempCtx.fillStyle = "rgb(0,0,0)";
		for (i = 0; i < h; i += 2) {
			tempCtx.fillRect(0, i, w, 1);
		}

		return tempCanvas;
	};

	var glitch = function (el, options) {
		options = defaults(options || {}, {
			amount: 6,
			complete: noop
		});

		options.onrendered = function (canvas) {
			options.complete(_glitch(canvas, options.amount));
		};

		html2canvas(el[0] ? el : [el], options);
	};

	glitch.replace = function (el, options) {
		options = options || {};
		var _complete = options.complete;
		options.complete = function (canvas) {
			if ($ && el instanceof $) {
				el.after(canvas).detach();
			} else {
				el.parentNode.insertBefore(canvas, el);
				el.parentNode.removeChild(el);
			}
			if (_complete) {
				_complete();
			}
		};

		glitch(el, options);
	};

	glitch.transition = function (el, newEl, options) {
		options = defaults(options || {}, {
			amount: 6,
			complete: noop,
			delay: 300,
			duration: 500,
			zIndex: 1000,
			effect: "fade",
			borderSize: 2,
			borderColor: "green"
		});

		newEl.insertAfter(el);

		var _complete = options.complete,
			origHeight = el.outerHeight(true),
			origWidth = el.outerWidth(true),
			targetHeight = newEl.outerHeight(true),
			targetWidth = newEl.outerWidth(true),
			origOverflow = newEl.css("overflow");

		newEl.detach();

		options.complete = function (canvas) {
			var $canvas = $(canvas).css("position", "absolute"),
				offset = el.offset(),
				container = $("<div>").css({
					"border-top": options.borderSize ? options.borderSize + "px solid " +
						options.borderColor : "none",
					position: "absolute",
					left: offset.left,
					top: offset.top - options.borderSize,
					width: canvas.width,
					height: canvas.height,
					overflow: "hidden",
					"z-index": options.zIndex
				})
				.html(canvas)
				.appendTo("body")
				.delay(options.delay),

				targetContainer = $("<div>").css({
					width: origWidth,
					height: origHeight,
					overflow: "hidden",
					border: "none",
					"box-sizing": "border-box"
				})
				.html(newEl),

				animation = {
					opacity: 0
				},
				animateOptions = {
					duration: options.duration,
					complete: function () {
						container.remove();
						targetContainer.animate({
							height: targetHeight,
							width: targetWidth
						}, {
							duration: 100,
							complete: function () {
								newEl.detach().insertAfter(targetContainer);
								targetContainer.remove();
								_complete();
								options = $canvas = container = null;

							}
						});

					}
				};

			if (options.effect === "slide") {
				animation = {
					top: offset.top + canvas.height,
					height: 0
				};
				animateOptions.step = function (now, fx) {
					if (fx.prop === "top") {
						$canvas.css("top", fx.start - now);
					}
				};
			}

			container.animate(animation, animateOptions);
			targetContainer.insertAfter(el);
			el.detach();

		};

		glitch(el, options);
	};

	window.glitch = glitch;

	if ($) {
		$.fn.glitch = function (method) {
			var args = Array.prototype.splice.call(arguments, 1);
			method = method || 'replace';
			return this.each(function () {
				if (method instanceof $) {
					glitch.transition($(this), method, args[0]);
				} else if (typeof method == 'function') {
					// just a callback passed in
					glitch($(this), {
						complete: method
					});
				} else if (typeof method == 'object') {
					// an options object passed in
					glitch($(this), method);
				} else if (glitch.hasOwnProperty(method)) {
					// explicitly call a method
					glitch[method].apply(null, [$(this)].concat(args));
				} else {
					$.error('Method ' + method + ' does not exist on jQuery.glitch');
				}
			});
		};
	}
})(jQuery);
