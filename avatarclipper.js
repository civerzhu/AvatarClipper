/**
 @filename: canvasapp.js
 @version: v1.0
 @author: civerzhu
 @summary: my first project for testing HTML5 canvas.
 **/

var G = { //this object contains all the G variable
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
	canvasPic: null,
	canvasResult: null,
	canvasResult2: null,
	canvasMask: null,
	isClick: false,
	img: null,
	isTL: null,
	isTR: null,
	isBR: null,
	isBL: null,
	isInner: null,
	currentX: 0,
	currentY: 0,
	zoomScale: 1
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
	bind(G.canvasMask, 'mousemove', onMouseMove, false);
	bind(G.canvasMask, 'mousedown', onMouseDown, false);
	bind(G.canvasMask, 'mouseup', onMouseUp, false);
	bind(document.getElementById("zoomOut"), 'click', onZoomOut, false);
	bind(document.getElementById("zoomIn"), 'click', onZoomIn, false);
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
	G.canvasPic = myCanvasPic;
	var ctxPic = myCanvasPic.getContext("2d");
	G.ctxPic = ctxPic;
	
	var myCanvasMask = document.getElementById("canvasMask");
	G.canvasMask = myCanvasMask;
	var ctxMask = myCanvasMask.getContext("2d");
	G.ctxMask = ctxMask;
	
	var myCanvasResult = document.getElementById("canvasResult");
	G.canvasResult = myCanvasResult;
	var ctxResult = myCanvasResult.getContext("2d");
	G.ctxResult = ctxResult;
	
	var myCanvasResult2 = document.getElementById("canvasResult2");
	G.canvasResult2 = myCanvasResult2;
	var ctxResult2 = myCanvasResult2.getContext("2d");
	G.ctxResult2 = ctxResult2;
	
	resetImage();
	
	//bind the function for the output image button
	var outputImgBtn = document.getElementById("outputImg");
	bind(outputImgBtn, 'click', outputImage, false);
	
	//bind the function for the reset image button
	var resetImgBtn = document.getElementById("resetImg");
	bind(resetImgBtn, 'click', resetImage, false);
	
	var img = new Image();
	G.img = img;
	//dragImage();
}


function onMouseDown(e){
	e = e? e : event;
	e.preventDefault();
	var target = e.target? e.target : e.sreElement;
	G.isClick = true;

	var pX = e.pageX? e.pageX : e.offsetX;
	var pY = e.pageY? e.pageY : e.offsetY;

	checkMouseHit(pX, pY, target);
}


function onMouseMove(e){
	e = e?e:event;
	e.preventDefault();
	var target = e.target?e.target:e.srcElement;
	var pX = e.pageX?e.pageX:e.offsetX;
	var pY = e.pageY?e.pageY:e.offsetY;
	
	if(G.isClick){
		
		updateRect(pX, pY, target);

		showRect();
	}else{
		checkMouseHit(pX, pY, target);
		if(G.isTL || G.isBR){
			document.body.style.cursor = "nw-resize";
		}else if(G.isTR || G.isBL){
			document.body.style.cursor = "sw-resize";
		}else if(G.isInner){
			document.body.style.cursor = "move";			
		}else{
			document.body.style.cursor = "default";
		}

		G.isTL = false;
		G.isTR = false;
		G.isBR = false;
		G.isBL = false;
	}
}


function onMouseUp(e){
	e = e?e:event;
	e.preventDefault();
	var target = e.target?e.target:e.srcElement;
	G.isClick = false;
	
	var pX = e.pageX?e.pageX:e.offsetX;
	var pY = e.pageY?e.pageY:e.offsetY;
	
	updateRect(pX, pY, target);

	showRect();

	generateResult();

	document.body.style.cursor = "default";
}


/*the function output the clip result(which is be seen in canvasResult) to image files*/
function outputImage(){
	if(!G.img.src){
		return;
	}
	var output_pixel = document.forms[0].outputpic[0].checked;
	if(output_pixel){
		window.open(G.canvasResult.toDataURL(), "clipImage 100*100pixel");
	}else{
		window.open(G.canvasResult2.toDataURL(), "clipImage 200*200pixel");
	}
}


/**/
function resetImage(){
	G.img = new Image();
	
	G.ctxPic.clearRect(0, 0, G.getWidth(), G.getHeight());
	
	G.ctxPic.save();
	G.ctxPic.font = "normal bold 20px cursive";
	var message = "Drag an image file here.";
	var metrics = G.ctxPic.measureText(message);
	G.ctxPic.fillText(message, (G.getWidth()/2)-(metrics.width/2), G.getHeight()/2+6);
	G.ctxPic.restore();

	G.ctxMask.clearRect(0, 0, G.getWidth(), G.getHeight());
	G.ctxMask.fillStyle = "rgba(0, 0, 0, 0.4)";
	G.ctxMask.fillRect(0, 0, G.getWidth(), G.getHeight());

	G.ctxResult.clearRect(0, 0, 100, 100);
	G.ctxResult2.clearRect(0, 0, 200, 200);

	dragImage();
}


/*Drag image file to the canvas*/
function dragImage(){
	if(typeof window.FileReader == 'undefined'){
		console.log("ERROR:FileReader not support.");
		return;
	}
	
	bind(G.canvasMask, 'dragover', function(e){
		e.preventDefault();
		return false;
	}, false);
	
	bind(G.canvasMask, 'dragend', function(e){
		e.preventDefault();
		return false;
	}, false);
	
	bind(G.canvasMask, 'drop', function(e){
		e = e?e:event;
		e.preventDefault();
		
		var file = e.dataTransfer.files[0];
		var reader = new FileReader();
		
		reader.onload = function(ev){
			G.img.src = ev.target.result;
			bind(G.img, 'load', function(){
				drawImage();
				initRect();
				showRect();
				generateResult();
			}, false);
		}
		reader.readAsDataURL(file);

		return false;
	}, false);
}


/*Draw Image on the canvas*/
function drawImage(){
	var imgWidth = G.img.width;
	var imgHeight = G.img.height;
	var sx = 0, sy = 0, sw = imgWidth, sh = imgHeight, dx, dy, dw, dh;
	if(imgWidth >= imgHeight){ 		//fill the width or height of the image to the canvas
		dw = G.getWidth();
		dh = dw*imgHeight/imgWidth;
	}else{
		dh = G.getHeight();
		dw = dh*imgWidth/imgHeight;
	}

	dw = dw * G.zoomScale;
	dh = dh * G.zoomScale;

	dx = Math.floor((G.getWidth() - dw) / 2);
	dy = Math.floor((G.getHeight() - dh) / 2);

	G.ctxPic.drawImage(G.img, sx, sy, sw, sh, dx, dy, dw, dh);
	/*G.ctxMask.fillStyle = "rgba(0, 0, 0, 0.4)";
	G.ctxMask.fillRect(0, 0, G.getWidth(), G.getHeight());*/
}


function generateResult(){
	//generate the image result
	G.ctxResult.clearRect(0, 0, 100, 100);
	G.ctxResult2.clearRect(0, 0, 200, 200);
	
	var dw = 100, dh = 100;
	G.ctxResult.drawImage(G.canvasPic, RECT.x, RECT.y, RECT.width, RECT.height, 0, 0, dw, dh);
	G.ctxResult2.drawImage(G.canvasPic, RECT.x, RECT.y, RECT.width, RECT.height, 0, 0, dw*2, dh*2);
}


function initRect(){
	RECT.width = 200;
	RECT.height = 200;
	RECT.x = Math.floor(( G.getWidth() - 200 ) / 2);
	RECT.y = Math.floor(( G.getHeight() - 200 ) / 2);
}

function showRect() {
	G.ctxMask.save();
	G.ctxMask.fillStyle = "rgba(0, 0, 0, 0.4)";
	G.ctxMask.strokeStyle = "rgba(255, 255, 255, 1)";
	//earse the mask first
	G.ctxMask.clearRect(0, 0, G.getWidth(), G.getHeight());
	G.ctxMask.fillRect(0, 0, G.getWidth(), G.getHeight());

	G.ctxMask.clearRect(RECT.x, RECT.y, RECT.width, RECT.height);
	G.ctxMask.strokeRect(RECT.x, RECT.y, RECT.width, RECT.height);
	//draw four square grid
	G.ctxMask.strokeRect(RECT.x - 5, RECT.y - 5, 10, 10);
	G.ctxMask.strokeRect(RECT.x + RECT.width - 5, RECT.y - 5, 10, 10);
	G.ctxMask.strokeRect(RECT.x + RECT.width - 5, RECT.y + RECT.height - 5, 10, 10);
	G.ctxMask.strokeRect(RECT.x - 5, RECT.y + RECT.height - 5, 10, 10);
	G.ctxMask.restore();
}

function checkMouseHit(px, py, target){
	G.isTL = false;
	G.isTR = false;
	G.isBR = false;
	G.isBL = false;
	G.isInner = false;
	var tx = RECT.x + target.offsetLeft;
	var ty = RECT.y + target.offsetTop;
	if(px >= tx - 5 && px <= tx + 5 && py >= ty - 5 && py <= ty + 5){
		G.isTL = true;
		document.body.style.cursor = "nw-resize";
	}else if(px >= tx + RECT.width - 5 && px <= tx + RECT.width + 5 && py >= ty - 5 && py <= ty + 5){
		G.isTR = true;
		document.body.style.cursor = "sw-resize";
	}else if(px >= tx + RECT.width - 5 && px <= tx + RECT.width + 5 && py >= ty + RECT.height - 5 && py <= ty + RECT.height + 5){
		G.isBR = true;
		document.body.style.cursor = "nw-resize";
	}else if(px >= tx - 5 && px <= tx + 5 && py >= ty + RECT.height - 5 && py <= ty + RECT.height + 5){
		G.isBL = true;
		document.body.style.cursor = "sw-resize";
	}else if(px > tx + 5 && px < tx + RECT.width - 5 && py > ty + 5 && py < ty + RECT.height - 5){
		G.isInner = true;
		G.currentX = px;
		G.currentY = py;
		document.body.style.cursor = "move";
	}
}

function updateRect(pX, pY, target){
	var maxLength = RECT.width;
	var w = RECT.width;
	var h = RECT.height;

	if(G.isTL){
		w = pX - (target.offsetLeft + RECT.x + RECT.width);
		h = pY - (target.offsetTop + RECT.y + RECT.height);
		if(Math.abs(w) < 20 || Math.abs(h) < 20){
			return;
		}
		maxLength = Math.abs(w) >= Math.abs(h)? Math.abs(w) : Math.abs(h);
		RECT.x = RECT.x + RECT.width + maxLength * w / Math.abs(w);
		RECT.y = RECT.y + RECT.height + maxLength * h / Math.abs(h);
	}else if(G.isTR){
		w = pX - (target.offsetLeft + RECT.x);
		h = pY - (target.offsetTop + RECT.y + RECT.height);
		if(Math.abs(w) < 20 || Math.abs(h) < 20){
			return;
		}
		maxLength = Math.abs(w) >= Math.abs(h)? Math.abs(w) : Math.abs(h);
		RECT.y = RECT.y + RECT.height + maxLength * h / Math.abs(h);
	}else if(G.isBR){
		w = pX - (target.offsetLeft + RECT.x);
		h = pY - (target.offsetTop + RECT.y);
		if(Math.abs(w) < 20 || Math.abs(h) < 20){
			return;
		}
		maxLength = Math.abs(w) >= Math.abs(h)? Math.abs(w) : Math.abs(h);
	}else if(G.isBL){
		w = pX - (target.offsetLeft + RECT.x + RECT.width);
		h = pY - (target.offsetTop + RECT.y);
		if(Math.abs(w) < 20 || Math.abs(h) < 20){
			return;
		}
		maxLength = Math.abs(w) >= Math.abs(h)? Math.abs(w) : Math.abs(h);
		RECT.x = RECT.x + RECT.width + maxLength * w / Math.abs(w);
	}else if(G.isInner){
		var diffX = pX - G.currentX;
		var diffY = pY - G.currentY;
		RECT.x += diffX;
		RECT.y += diffY;
		G.currentX = pX;
		G.currentY = pY;
	}
	RECT.width = maxLength;
	RECT.height = maxLength;
}



function onZoomOut(){
	if(!G.img.src){
		return;
	}
	if(G.zoomScale < 2){
		G.zoomScale += 0.1;
		G.ctxPic.clearRect(0, 0, G.getWidth(), G.getHeight());
		drawImage();
		generateResult();
	}
}


function onZoomIn(){
	if(!G.img.src){
		return;
	}
	if(G.zoomScale > 0.5){
		G.zoomScale -= 0.1;
		G.ctxPic.clearRect(0, 0, G.getWidth(), G.getHeight());
		drawImage();
		generateResult();
	}
}