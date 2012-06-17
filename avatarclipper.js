/**
 @filename: canvasapp.js
 @version: v1.0
 @author: civerzhu
 @summary: my first project for testing HTML5 canvas.
 **/

var GLOBAL = { //this object contains all the global variable
	getWidth: function(){
		return document.getElementById("canvasPic").getAttribute('width');
	},
	getHeight: function(){
		return document.getElementById('canvasPic').getAttribute('height');
	},
	counter: 0,
	ctxPic: null,
	ctxResult: null,
	ctxMask: null,
	isClick: false,
	canvasResult: null,
	canvasMask: null,
	img: null
};


var RECT = { //this object contains the region of clip
	x: 0, 
	y: 0,
	width: 0,
	height: 0
};


(function(){
	bind(window, 'load', eventWindowLoaded, false);
})();


/*the addEeventListener function for IE compat*/
function bind(src, e, f, isCapture){
	if(document.all){
		src.attachEvent("on"+e, f);
	}else{
		src.addEventListener(e, f, isCapture);
	}
}


/*the load function when document is ready*/
function eventWindowLoaded(){
	canvasApp();
	bind(canvasMask, 'mousemove', onMouseMove, false);
	bind(canvasMask, 'mousedown', onMouseDown, false);
	bind(canvasMask, 'mouseup', onMouseUp, false);
}


/*to test the browser support HTML5 canvas*/
function canvasSupport(){
	return !!document.createElement('canvas').getContext;
}



/*the main function of draw canvas*/
function canvasApp(){
	if(!canvasSupport){ //test whether browser support the canvas 
		console.log("error:canvas does not be supported.")
		return;	
	}
	
	var myCanvasPic = document.getElementById("canvasPic");
	var ctxPic = myCanvasPic.getContext("2d");
	GLOBAL.ctxPic = ctxPic;
	
	var myCanvasResult = document.getElementById("canvasResult");
	GLOBAL.canvasResult = myCanvasResult;
	var ctxResult = myCanvasResult.getContext("2d");
	GLOBAL.ctxResult = ctxResult;
	
	var myCanvasMask = document.getElementById("canvasMask");
	GLOBAL.canvasMask = myCanvasMask;
	var ctxMask = myCanvasMask.getContext("2d");
	GLOBAL.ctxMask = ctxMask;
	
	var myCanvasPattern = document.getElementById("canvasPattern");
	var ctxPattern = myCanvasPattern.getContext("2d");
	
	//Draw the grid pattern background
	ctxPattern.fillStyle="rgba(122, 122, 122, 0.5)";
	ctxPattern.fillRect(0, 0, 10, 10);
	ctxPattern.fillRect(10, 10, 20, 20);
	ctxPic.save();
	ctxPic.fillStyle = ctxPic.createPattern(myCanvasPattern, 'repeat');
	ctxPic.fillRect(0, 0, GLOBAL.getWidth(), GLOBAL.getHeight());
	ctxPic.restore();
	
	//Draw the image
	var img = new Image();
	img.src = "1.jpg";
	bind(img, "load", function(){
		GLOBAL.img = img;
		
		var imgWidth = img.width;
		var imgHeight = img.height;
		var sx = 0, sy = 0, sw = imgWidth, sh = imgHeight, dx, dy, dw, dh;
		if(imgWidth >= imgHeight){ 		//fill the width or height of the image to the canvas
			dw = GLOBAL.getWidth();
			dh = dw*imgHeight/imgWidth;
			dx = 0;
			dy = Math.floor((GLOBAL.getHeight() - dh) / 2);
		}else{
			dh = GLOBAL.getHeight();
			dw = dh*imgWidth/imgHeight;
			dy = 0;
			dx = Math.floor((GLOBAL.getWidth() - dw) / 2);
		}
		GLOBAL.ctxPic.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
		GLOBAL.ctxMask.fillStyle = "rgba(0, 0, 0, 0.4)";
		GLOBAL.ctxMask.fillRect(0, 0, GLOBAL.getWidth(), GLOBAL.getHeight());
	}, false);
}


function onMouseDown(e){
	e = e?e:event;
	var target = e.target?e.target:e.sreElement;
	GLOBAL.isClick = true;
	
	var pX = e.pageX?e.pageX:e.offsetX;
	var pY = e.pageY?e.pageY:e.offsetY;
	RECT.x = pX - target.offsetLeft;
	RECT.y = pY - target.offsetTop;
	
	//earse the background of the gray color	
	GLOBAL.ctxMask.clearRect(0, 0, GLOBAL.getWidth(), GLOBAL.getHeight());
	GLOBAL.ctxMask.fillStyle = "rgba(0, 0, 0, 0.4)";
	GLOBAL.ctxMask.fillRect(0, 0, GLOBAL.getWidth(), GLOBAL.getHeight());
}


function onMouseMove(e){
	e = e?e:event;
	var target = e.target?e.target:e.srcElement;
	
	if(GLOBAL.isClick){
		//earse the background first
		GLOBAL.ctxMask.fillStyle = "rgba(0, 0, 0, 0.4)";
		GLOBAL.ctxMask.strokeStyle = "rgba(255, 0, 0, 0.6)";
		GLOBAL.ctxMask.clearRect(0, 0, GLOBAL.getWidth(), GLOBAL.getHeight());
		GLOBAL.ctxMask.fillRect(0, 0, GLOBAL.getWidth(), GLOBAL.getHeight());
		
		var pX = e.pageX?e.pageX:e.offsetX;
		var pY = e.pageY?e.pageY:e.offsetY;
		RECT.width = pX - target.offsetLeft - RECT.x;
		RECT.height = pY - target.offsetTop - RECT.y;
		
		//clear the rectangle and draw the border
		GLOBAL.ctxMask.clearRect(RECT.x, RECT.y, RECT.width, RECT.height);
		GLOBAL.ctxMask.strokeRect(RECT.x, RECT.y, RECT.width, RECT.height);
	}
}


function onMouseUp(e){
	e = e?e:event;
	var target = e.target?e.target:e.srcElement;
	GLOBAL.isClick = false;
	
	var pX = e.pageX?e.pageX:e.offsetX;
	var pY = e.pageY?e.pageY:e.offsetY;
	RECT.width = pX - target.offsetLeft - RECT.x;
	RECT.height = pY - target.offsetTop - RECT.y;
			
	GLOBAL.ctxResult.clearRect(0, 0, 100, 100);
	
	//var imagedata = GLOBAL.ctxPic.getImageData(RECT.x, RECT.y, RECT.width, RECT.height);
	//GLOBAL.ctxResult.putImageData(imagedata, 0, 0);
	//window.open(GLOBAL.canvasResult.toDataURL(), "clipImage");
	
	var dw, dh;
	if(Math.abs(RECT.width) >= Math.abs(RECT.height)){
		dw = 100;
		dh = Math.abs(100 * RECT.height / RECT.width);
	}else{
		dh = 100;
		dw = Math.abs(100 * RECT.width / RECT.height);
	}
	GLOBAL.ctxResult.drawImage(GLOBAL.img, RECT.x, RECT.y, RECT.width, RECT.height, 0, 0, dw, dh);
	
	//var resultImg = document.getElementById("resultImg");
	//resultImg.setAttribute("src", GLOBAL.canvasResult.toDataURL());
		
	
	//reset the attributes of RECT object
	RECT.x = 0;
	RECT.y = 0;
	RECT.width = 0;
	RECT.height = 0;
}



