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
	ctxResult2: null,
	ctxMask: null,
	ctxPattern: null,
	isClick: false,
	canvasResult: null,
	canvasResult2: null,
	canvasMask: null,
	canvasPattern: null,
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
	bind(GLOBAL.canvasMask, 'mousemove', onMouseMove, false);
	bind(GLOBAL.canvasMask, 'mousedown', onMouseDown, false);
	bind(GLOBAL.canvasMask, 'mouseup', onMouseUp, false);
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
	
	var myCanvasMask = document.getElementById("canvasMask");
	GLOBAL.canvasMask = myCanvasMask;
	var ctxMask = myCanvasMask.getContext("2d");
	GLOBAL.ctxMask = ctxMask;
	
	var myCanvasResult = document.getElementById("canvasResult");
	GLOBAL.canvasResult = myCanvasResult;
	var ctxResult = myCanvasResult.getContext("2d");
	GLOBAL.ctxResult = ctxResult;
	
	var myCanvasResult2 = document.getElementById("canvasResult2");
	GLOBAL.canvasResult2 = myCanvasResult2;
	var ctxResult2 = myCanvasResult2.getContext("2d");
	GLOBAL.ctxResult2 = ctxResult2;
	
	//var myCanvasPattern = document.getElementById("canvasPattern");
	var myCanvasPattern = document.createElement("canvas");
	myCanvasPattern.width = 20;
	myCanvasPattern.height = 20;
	var ctxPattern = myCanvasPattern.getContext("2d");
	
	//Draw the grid pattern background
	ctxPattern.fillStyle="rgba(122, 122, 122, 0.5)";
	ctxPattern.fillRect(0, 0, 10, 10);
	ctxPattern.fillRect(10, 10, 20, 20);
	GLOBAL.ctxPattern = ctxPattern;
	GLOBAL.canvasPattern = myCanvasPattern;
	
	resetImage();
	/*GLOBAL.ctxPic.save();
	GLOBAL.ctxPic.fillStyle = GLOBAL.ctxPic.createPattern(GLOBAL.canvasPattern, 'repeat');
	GLOBAL.ctxPic.fillRect(0, 0, GLOBAL.getWidth(), GLOBAL.getHeight());
	GLOBAL.ctxPic.restore();*/
	
	//bind the function for the output image button
	var outputImgBtn = document.getElementById("outputImg");
	bind(outputImgBtn, 'click', outputImage, false);
	
	//bind the function for the reset image button
	var resetImgBtn = document.getElementById("resetImg");
	bind(resetImgBtn, 'click', resetImage, false);
	
	var img = new Image();
	GLOBAL.img = img;
	dragImage();
	
	//Draw the image
	/*
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
	*/
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
		//set the cursor to the crosshair
		//var computedStyle = document.defaultView.getComputedStyle(GLOBAL.canvasMask, null);
		//computedStyle.cursor = "crosshair";
		
		//earse the background first
		GLOBAL.ctxMask.fillStyle = "rgba(0, 0, 0, 0.4)";
		GLOBAL.ctxMask.strokeStyle = "rgba(255, 255, 255, 1)";
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
	GLOBAL.ctxResult2.clearRect(0, 0, 200, 200);
	
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
	GLOBAL.ctxResult2.drawImage(GLOBAL.img, RECT.x, RECT.y, RECT.width, RECT.height, 0, 0, dw*2, dh*2);
	
	//var resultImg = document.getElementById("resultImg");
	//resultImg.setAttribute("src", GLOBAL.canvasResult.toDataURL());
		
	
	//reset the attributes of RECT object
	RECT.x = 0;
	RECT.y = 0;
	RECT.width = 0;
	RECT.height = 0;
}


/*the function output the clip result(which is be seen in canvasResult) to image files*/
function outputImage(){
	window.open(GLOBAL.canvasResult2.toDataURL(), "clipImage");
}


/**/
function resetImage(){
	GLOBAL.img = null;
	
	GLOBAL.ctxPic.clearRect(0, 0, GLOBAL.getWidth(), GLOBAL.getHeight());
	GLOBAL.ctxPic.save();
	GLOBAL.ctxPic.fillStyle = GLOBAL.ctxPic.createPattern(GLOBAL.canvasPattern, 'repeat');
	GLOBAL.ctxPic.fillRect(0, 0, GLOBAL.getWidth(), GLOBAL.getHeight());
	GLOBAL.ctxPic.restore();
	
	GLOBAL.ctxPic.save();
	GLOBAL.ctxPic.font = "normal bold 20px cursive";
	var message = "Drag an image file here.";
	var metrics = GLOBAL.ctxPic.measureText(message);
	GLOBAL.ctxPic.fillText(message, (GLOBAL.getWidth()/2)-(metrics.width/2), GLOBAL.getHeight()/2+6);
	GLOBAL.ctxPic.restore();
	dragImage();
}


/*Drag image file to the canvas*/
function dragImage(){
	if(typeof window.FileReader == 'undefined'){
		console.log("ERROR:FileReader not support.");
		return;
	}
	
	bind(GLOBAL.canvasMask, 'dragover', function(e){
		e.preventDefault();
		return false;
	}, false);
	
	bind(GLOBAL.canvasMask, 'dragend', function(e){
		e.preventDefault();
		return false;
	}, false);
	
	bind(GLOBAL.canvasMask, 'drop', function(e){
		e = e?e:event;
		e.preventDefault();
		
		var file = e.dataTransfer.files[0];
		var reader = new FileReader();
		reader.onload = function(event){
			GLOBAL.img.src = event.target.result;
			bind(GLOBAL.img, 'load', drawImage, false);
			//drawImage();
		}
		reader.readAsDataURL(file);
		return false;
	}, false);
}


/*Draw Image on the canvas*/
function drawImage(){
	var imgWidth = GLOBAL.img.width;
	var imgHeight = GLOBAL.img.height;
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
	GLOBAL.ctxPic.drawImage(GLOBAL.img, sx, sy, sw, sh, dx, dy, dw, dh);
	GLOBAL.ctxMask.fillStyle = "rgba(0, 0, 0, 0.4)";
	GLOBAL.ctxMask.fillRect(0, 0, GLOBAL.getWidth(), GLOBAL.getHeight());
}
