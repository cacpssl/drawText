"use strict";
//TODO: When drag browser out screen or scroll page.
var Text = {
    create: function(t) {
        var text = {};
        text.top = t.top || "36px";
        text.left = t.left || "24px";
        text.color = t.color || "#333";
        text.font = t.font || "12px arial";
        text.lineHeight = t.font.match(/[\d]{1,}px/)[0];
        text.content = t.content || "";
        text.width = t.width || "36px";
        text.height = t.height || "24px";
        text.maxWidth = t.maxWidth || "600px";
        text.maxHeight = t.maxHeight || "400px";
        text.parent = t.parent;
        return text;
    }
};

var TextInput = {
    create: function() {
        var textInput = document.createElement("textarea");

        textInput.init = function(t, p) {
            //this.text = t;
            this.id = "__textInput";
            this.style.resize = "none";
            this.style.outline = "none";
            this.style.border = "dashed 1px #000";
            this.style.padding = 0;
            this.style.margin = 0;
            this.style.position = "absolute";
            this.style.backgroundColor = "transparent";
            this.style.overflow = "hidden";
            this.style.color = t.color;
            this.style.font = t.font;
            this.style.top = (parseInt(t.top) - 1) + "px";
            this.style.left = (parseInt(t.left) - 1) + "px";
            this.style.width = t.width;
            this.style.height = t.height;
            this.style.maxWidth = t.maxWidth;
            this.style.maxHeight = t.maxHeight;
            this.style.lineHeight = t.lineHeight;
            this.value = t.content;
            this.parent = p || t.parent;
        };

        textInput.toText = function() {
            return Text.create({
                top: (parseInt(this.style.top) + 1) + "px",
                left: (parseInt(this.style.left) + 1) + "px",
                color: this.style.color,
                font: this.style.font,
                content: this.value,
                width: (this.offsetWidth - 2) + "px",
                height: (this.offsetHeight - 2) + "px",
                maxWidth: this.style.maxWidth,
                maxHeight: this.style.maxHeight,
                parent: this.parent
            });
        };

        textInput.parseValue = function() {
            var strArr = this.value.split("\n");
            var i, rows = strArr.length, maxLine = 0, len;
            for ( i = 0; i < rows; i++ ) {
                len = this.getStrLength(strArr[i]);
                if (len > maxLine) {
                    maxLine = len;
                }
            }
            //this.maxLine = maxLine;
            return [rows, maxLine];
        };

        textInput.getStrLength = function(str) {
            var span = document.createElement("span");
            span.style.font = this.style.font;
            span.innerHTML = str;
            span.style.display = "hidden";
            span.style.border = 0;
            span.style.padding = 0;
            span.style.margin = 0;
            document.body.appendChild(span);
            var width = span.offsetWidth;
            document.body.removeChild(span);

            return width;
        };

        textInput.show = function() {
            document.body.appendChild(this);
            this.addEventListener("keyup", function(e) {
                var maxWidth = parseInt(this.style.maxWidth);
                /**fix:bug 001*/
                if ( e.keyCode == 32 || e.keyCode == 13 || e.keyCode == 16 || (e.keyCode > 47 && e.keyCode < 58)
                    || e.keyCode == 188 || e.keyCode == 190 || e.keyCode == 186  ) {
                    var span = document.createElement("span"),
                        buffer = "";
                    span.style.font = this.style.font;
                    span.innerHTML = "";
                    span.style.display = "hidden";
                    span.style.border = 0;
                    span.style.padding = 0;
                    span.style.margin = 0;
                    document.body.appendChild(span);
                    var value = this.value.split("\n");
                    for ( var i = 0; i < value.length - 1; i++ ) {
                        buffer += (value[i] + "\n");
                    }
                    value = value[value.length - 1];
                    for ( i = 0; i < value.length; i++ ) {
                        span.innerHTML += value[i];
                        if ( span.offsetWidth + parseInt(this.style.font.match(/([\d]{1,})px/)[1]) > maxWidth ) {
                            buffer += span.innerHTML + "\n";
                            span.innerHTML = "";
                        }
                    }
                    buffer += span.innerHTML;
                    this.value = buffer;
                    document.body.removeChild(span);
                }
                var r = this.parseValue();
                if ( r[1] >  maxWidth ) {
                    this.style.width = this.style.maxWidth;
                    /**bug:001 IME preview show */
                        //this.buffer = this.value.substr(0, this.value.length - 1) + "\n" + this.value.substr(-1, 1);
                    r[0] = r[0] +   r[1] / maxWidth + 1;
                } else {
                    this.style.width = (r[1] +  parseInt(this.style.lineHeight)) + "px";
                }
                this.style.height = (r[0] * parseInt(this.style.lineHeight)) + "px";
            });

            this.addEventListener("blur", function() {
                this.parent.drawText(this.toText());
                document.body.removeChild(this);
                delete this;
            });
            this.addEventListener("focus", function() {
                this.removeEventListener("mouseout", this.mouseOut);
                this.parent.removeEventListener("mouseup", this.parent.leftMouseDown);
                this.parent.removeEventListener("mousemove", this.parent.mouseMove);
                //textInput.listenInput();
            });
        };

        textInput.listenInput = function() {
            this.focus();
        };

        textInput.preShow = function() {
            this.addEventListener("mouseout", this.mouseOut);
            this.show();
        };

        textInput.mouseOut = function() {
            var text = this.toText();
            document.body.removeChild(this);
            delete this;
            this.parent.drawText(text);
        };

        return textInput;
    }
};

var TextCanvas = {
    opts: {
        fontSize: "18px",
        fontFamily: "arial",//"\u5B8B\u4F53";
        width: 300,
        height : 200,
        color : "#000"
    },
    create: function(p) {
        p = p || {};
        var canvas = p.canvas || document.createElement("canvas");
        //var div = canvas.parent || document.createElement("div");
        canvas.fontSize = p.fontSize || TextCanvas.opts.fontSize;
        canvas.fontFamily = p.fontFamily || TextCanvas.opts.fontFamily;
        canvas.width = p.width || TextCanvas.opts.width;
        canvas.height = p.height || TextCanvas.opts.height;
        canvas.color = p.color || TextCanvas.opts.color;
        canvas.style.border = "solid 1px #000";
        //canvas.content = p.content || "";
        canvas.top = p.top;
        canvas.left = p.left;
        canvas.graphics2D = canvas.getContext("2d");
        /**/
        canvas.parent = p.parent;
        canvas.texts = [];
        canvas.selectText = undefined;

        /*div.style.width = canvas.width;
        div.style.height = canvas.width;
        div.style.position = "relative";
        div.style.overflow = "hidden";*/

        canvas.toTextInput = function(t) {
            var textInput = TextInput.create();
            textInput.init(t);
            return textInput;
        };

        canvas.clear = function(text) {
            canvas.graphics2D.globalCompositeOperation = "destination-out";
            canvas.graphics2D.fillRect(parseInt(text.left) - this.getBoundingClientRect().left,
                                        parseInt(text.top) - this.getBoundingClientRect().top,
                                        parseInt(text.width), parseInt(text.height));
        };

        canvas.clearAll = function() {
            for ( var i = 0; i < canvas.texts.length; i++) {
                this.clear(i);
            }
        };

        canvas.drawText = function(t) {
            if ( !t.content ) {
                window.setTimeout(function(){canvas.addEventListener("mouseup", canvas.leftMouseDown)}, 200);
                return;
            }
            canvas.texts.push(t);
            canvas.graphics2D.textBaseline = "top";
            canvas.graphics2D.textAlign = "left";

            canvas.graphics2D.fillStyle = t.color;
            canvas.graphics2D.font =  t.font;
            canvas.graphics2D.globalCompositeOperation = "source-over";
            var cArr = t.content.split("\n"),
                left = parseInt(t.left) - this.getBoundingClientRect().left,
                top = parseInt(t.top) - this.getBoundingClientRect().top;
            for ( var i = 0; i < cArr.length; i++ ) {
                canvas.graphics2D.fillText(cArr[i], left, top);
                top = top + parseInt(this.fontSize);
            }

            window.setTimeout(function(){
                canvas.addEventListener("mouseup", canvas.leftMouseDown);
                canvas.addEventListener("mousemove", canvas.mouseMove);
            }, 200);
        };

        canvas.overText = function(x, y) {
            var text, x1, y1;
            for ( var i = 0; i < canvas.texts.length; i++ ) {
                text = canvas.texts[i];
                x1 = x - parseInt(text.left);
                y1 = y - parseInt(text.top);
                if ( x1 > 0 && x1 < parseInt(text.width) && y1 > 0 && y1 < parseInt(text.height) ) {
                    return [text, i];
                }
            }

            return 0;
        };

        /**event function*/
        canvas.leftMouseDown = function(e) {
            if ( e.button == 0 /* && e.buttons == 1 */ ) {
                var t = Text.create({
                    top: e.clientY + "px",
                    left: e.clientX + "px",
                    color: this.color,
                    font: this.fontSize + " " + this.fontFamily,
                    width: parseInt(this.fontSize) * 3 + "px",
                    height: parseInt(this.fontSize) * 2 + "px",
                    maxWidth: (this.width - e.clientX + this.getBoundingClientRect().left) + "px",
                    maxHeight: (this.height - e.clientY + this.getBoundingClientRect().top) + "px"
                });
                var textInput = TextInput.create();
                textInput.init(t, this);
                textInput.show();
                textInput.listenInput();
            }
            //canvas.removeEventListener("mouseup", canvas.leftMouseDown);
        };

        canvas.mouseMove = function(e) {
            var x = e.clientX, y = e.clientY;
            var o = canvas.overText(x, y);
            if ( o ) {
                var text = o[0];
                canvas.clear(text);
                canvas.texts.splice(o[1], 1);
                var textInput = canvas.toTextInput(text);
                textInput.preShow();
                canvas.removeEventListener("mouseup", canvas.leftMouseDown);
            }
        };


        /**add event*/
        canvas.listenTextInput = function() {
            canvas.style.cursor = "crosshair";
            canvas.addEventListener("mouseup", canvas.leftMouseDown);
            canvas.addEventListener("mousemove", canvas.mouseMove);
        };

        return canvas;
    }
};
