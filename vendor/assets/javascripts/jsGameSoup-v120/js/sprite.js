/**
 	@class A sprite class with different image/animation sequences based upon defined 'actions'.
	@description Allows you to associate a set of animations with a particular entity. To do vector graphics, use the canvas tag methods instead.
	@param anchor selects which side of the sprite's rectangle to 'anchor' the animation to. e.g. ["center", "bottom"] will anchor the sprite to the ground (side view) whilst ["right", "center"] would anchor it to the right hand side.
	@param frames is a dictionary containing all actions and their associated set of images and the number of frames to show each image for. For instance: {"stand": [["img/stand.png", 0],], "walk": [["img/walk1.png", 3], ["img/walk2.png", 3],]} where each walk frame is shown for three frames.
	@param loadedcallback is a function that is called once all of the frames in all action animations are successfully loaded.
*/
function Sprite(anchor, frames, loadedcallback) {
	var loadcount = 0;
	var action = "";
	var framecount = -1;
	var frame = 0;
	var sprite = this;
	this.loaded = false;
	this.width = 0;
	this.height = 0;
	
	// load up all of the images
	for (var a in frames) {
		for (var f=0; f<frames[a].length; f++) {
			loadcount += 1;
			var img = new Image();
			img.src = frames[a][f][0];
			frames[a][f][0] = img;
			img.onload = function () {
				loadcount -= 1;
				if (loadcount == 0) {
					if (loadedcallback) {
						sprite.loaded = true;
						sprite.width = parseInt(img.width);
						sprite.height = parseInt(img.height);
						loadedcallback();
					}
				}
			}
		}
	}
	
	// calculate offsets (center, right, left, top, bottom)
	var calc_x = {
		"left": function(frame) {
			return 0;
		},
		"right": function(frame) {
			return frame.width;
		},
		"center": function(frame) {
			return frame.width / 2;
		}
	}
	
	var calc_y = {
		"top": function(frame) {
			return 0;
		},
		"bottom": function(frame) {
			return frame.height;
		},
		"center": function(frame) {
			return frame.height / 2;
		}
	}
	
	// set which action to play
	this.action = function(a, reset) {
		action = a;
		if (reset) {
			framecount = frames[a][0][1];
			frame = 0
		} else {
			frame = frame % frames[a].length;
		}
		sprite.update = sprite._update;
		sprite.draw = sprite._draw;
		sprite.aabb = sprite._aabb;
	}
	
	// increment frame counter etc.
	this._update = function() {
		framecount -= 1;
		if (framecount <= 0) {
			frame = (frame + 1) % frames[action].length;
			framecount = frames[action][frame][1];
		}
	}
	
	// draw this sprite on canvas c at position with respect to the anchor specified
	this._draw = function(c, pos) {
		var i = frames[action][frame][0];
		c.drawImage(i, pos[0] - calc_x[anchor[0]](i), pos[1] - calc_y[anchor[1]](i));
	}
	
	// returns the axis-aligned bounding-box of this sprite	for the current frame
	this._aabb = function(pos) {
		var i = frames[action][frame][0];
		return [pos[0] - calc_x[anchor[0]](i), pos[1] - calc_y[anchor[1]](i), i.width, i.height];
	}
	
	/** Call this method from inside the owner entity's update() method. */
	this.update = function() {};
	
	/** 
		Draw the sprite. Call this method from inside the owner entity's draw() method.
		@param c is the canvas to draw on (passed to the entity's draw(c) method)
		@param pos is the position to draw at relative to the anchor point.
	 **/
	this.draw = function() {};
	
	/**
		Returns the axis aligned bounding box of this sprite at its current frame.
		@param pos is the position to get the aabb relative to (factors the anchor point in too).
	**/
	this.aabb = function() { return [0, 0, 0, 0]; };
}

/**
	@method preload
	@description Pre-loads a whole array of images. Provides feedback on which images are loaded via the progresscallback, which returns the number of images left to load each time one is loaded, and 0 when the final image is loaded.
	@param images is an array of strings containing the URLs of images to load.
	@param progresscallback is a function accepting an integer, which is the count of images left to load.
*/
Sprite.preload = function(images, progresscallback) {
	var loadcount = images.length - 1;
	for (var i=0; i<images.length; i++) {
		var img = new Image();
		img.src = images[i];
		img.onload = function () {
			loadcount -= 1;
			if (progresscallback)
				progresscallback(images.length - loadcount - 1);
		}
	}
}
