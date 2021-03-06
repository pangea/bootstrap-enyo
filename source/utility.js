enyo.arrayContains = function(inElement, inArray){
  return enyo.indexOf(inElement, inArray) !== -1;
};

var  bootstrap = bootstrap || {};

bootstrap.TipTrigger = {
  tip: null,
  timeout: null,
  hoverState: null,
  create: enyo.inherit(function(sup) {
    return function() {
      sup.apply(this, arguments);

      // _handlers holds any handlers that were already defined for the events
      // we're going to be squashing
      this._handlers = {};

      // enyo kinds share their handlers object.  We don't want to modify it for
      // all of them, just this one.
      if(!this.hasOwnProperty('handlers')) {
        this.handlers = enyo.clone(this.handlers);
      }

      if (enyo.arrayContains('hover', this.triggers)) {
        this.defHandler('onenter');
        this.defHandler('onleave');
      }

      if(enyo.arrayContains('click', this.triggers)) {
        this.defHandler('ontap');
      }

      if(enyo.arrayContains('focus', this.triggers)) {
        this.defHandler('onfocus');
        this.defHandler('onblur');
      }
    };
  }),
  defHandler: function(event) {
    this._handlers[event] = this[event] || this.handlers[event];
    this.handlers[event] = event.slice(2); // 'onfoo'.slice(2) => 'foo'
  },
  execHandler: function(event, args) {
    var fn = enyo.nop,
        handler = this._handlers[event];

    // if an old handler was defined for this event
    if(handler) {
      // determine if it was a function itself or a reference to one
      fn = handler.apply ? handler : this[handler];
    }

    // run it!
    return fn.apply(this, args);
  },
  enter: function(){
    clearTimeout(this.timeout);

    this.hoverState = "in";

    this.initializeTip();

    if(this.tip.delay.show) {
      this.timeout = setTimeout(this.bindSafely(this.enterDelayCallback), this.tip.delay.show);
    } else {
      this.openTip();
    }

    return this.execHandler('onenter', arguments);
  },
  enterDelayCallback: function(){
    if (this.hoverState === "in") {
      this.openTip();
    }
  },
  leave: function(){
    clearTimeout(this.timeout);

    this.hoverState = "out";

    if(this.tip.delay.hide) {
      this.timeout = setTimeout(this.bindSafely(this.leaveDelayCallback), this.tip.delay.hide);
    } else {
      this.closeTip();
    }

    return this.execHandler('onleave', arguments);
  },
  leaveDelayCallback: function(){
    if (this.hoverState === "out") {
      this.closeTip();
    }
  },
  tap: function(){
    this.toggleTip();
    return this.execHandler('ontap', arguments);
  },
  focus: function(){
    this.openTip();
    return this.execHandler('onfocus', arguments);
  },
  blur: function(){
    this.closeTip();
    return this.execHandler('onblur', arguments);
  },
  openTip: function(){
    this.initializeTip();
    this.tip.show();
  },
  closeTip: function(){
    if(this.tip){
      this.tip.hide();
    }
  },
  toggleTip: function(){
    if(this.tip && this.tip.isShown) {
      this.closeTip();
    } else {
      this.openTip();
    }
  }
};

bootstrap.TipPositioner = {
  published: {
    content: "",
    placement: "top", // top, top-left, top-right, right, left, bottom, bottom-left, bottom-left
    delay: 0,
    enabled: true,
    animate: true
  },
  handlers: {
    ontransitionend: "transitionComplete",
  },
  constructor: enyo.inherit(function(sup){
    return function(){
      sup.apply(this, arguments);

      if(typeof this.delay === "number") {
        this.delay = {
          show: this.delay,
          hide: this.delay
        };
      }
    }
  }),
  create: enyo.inherit(function(sup){
    return function(){
      sup.apply(this, arguments);

      if(this.animate) {
        this.addClass('fade');
      }

      this.applyContent();

      // Cache the current parent as the target for the tooltip
      this.target = this.parent;

      // set this tooltip to live on the floating layer so it can be accurately
      // positioned anywhere on the whole window.
      this.setParent(pCore.$.floatingLayer);
    }
  }),
  isShown: false,
  show: function() {
    if (this.content && this.enabled) {
      this.applyStyle("display","block");
      this.addClass(this.placement);
      var elementBounds = this.getAbsoluteBounds();
      var targetBounds = this.target.getAbsoluteBounds();

      // Adjust tooltip position based on whether or not the tooltip will be visible.
      var originalPlacement = this.placement;
      var containerWidth = enyo.dom.getWindowWidth();
      var containerHeight = enyo.dom.getWindowHeight();
      this.placement = this.placement == 'bottom' && targetBounds.top   + targetBounds.height + elementBounds.height > containerHeight  ? 'top'    :
               this.placement == 'top'    && targetBounds.top   - elementBounds.height < 0                                      ? 'bottom' :
               this.placement == 'right'  && targetBounds.right + elementBounds.width > containerWidth                          ? 'left'   :
               this.placement == 'left'   && targetBounds.left  - elementBounds.width < 0                                       ? 'right'  :
               this.placement;
      if(this.placement !== originalPlacement){
          this.removeClass(originalPlacement);
        this.addClass(this.placement);
      }

      var newBounds = this.getCalculatedBounds(targetBounds, elementBounds);
      this.applyPlacement(newBounds);
    }
  },
  applyPlacement: function(newBounds){
    this.setBounds(newBounds);
    this.addClass(this.placement);
    this.addClass('in');
    this.isShown = true;
  },
  getCalculatedBounds: function(targetBounds, elementBounds){
    // Calculate the new bounds
    return this.placement == 'bottom' ? { top: targetBounds.top + targetBounds.height,                                left: targetBounds.left + targetBounds.width / 2 - elementBounds.width / 2 } :
         this.placement == 'top'    ? { top: targetBounds.top - elementBounds.height,                               left: targetBounds.left + targetBounds.width / 2 - elementBounds.width / 2 } :
         this.placement == 'left'   ? { top: targetBounds.top + targetBounds.height / 2 - elementBounds.height / 2, left: targetBounds.left - elementBounds.width } :
      /* this.placement == 'right' */ { top: targetBounds.top + targetBounds.height / 2 - elementBounds.height / 2, left: targetBounds.left + targetBounds.width };
  },
  hide: function() {
    if (this.isShown) {
      this.removeClass('in');
      this.isShown = false;
      this.hiding = true;
    }
  },
  hideComplete: function(){
    this.hiding = false;
    this.applyStyle("display", "none");
  },
  transitionComplete: function(inSender, inEvent){
    if (inEvent.originator === this && this.hiding) {
      this.hideComplete();
    }
  },
  enable: function(){
    this.enabled = true;
  },
  disable: function(){
    this.enabled = false;
  }
};
