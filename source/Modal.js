enyo.kind({
	name: "bootstrap.Modal",
	classes: 'modal fade',
	attributes: {
		"tabindex": "-1",
		"aria-hidden": true,
	},
	published: {
		backdrop: true,
		keyboard: true,
		title: null,
		bodyComponents: null,
		footerComponents: null
	},
	handlers: {
		onShowModal: "show",
		onHideModal: "hide",
		ontransitionend: "transitionComplete",
		onkeyup: "handleKeyUp",
	},
	components: [
		{kind: "bootstrap.ModalDialog", components: [
			{kind: "bootstrap.ModalContent", components: [
				{ kind: "bootstrap.ModalHeader", classes: "clearfix" },
				{ kind: "bootstrap.ModalBody", classes: "clearfix" },
			]}
		]},
	],
	create: function(){
		this.inherited(arguments);
    if(this.title) {
		  this.$.modalHeader.$.modalTitle.content = this.title;
    }
    if (this.backdrop) {
      this.createComponent({kind: "bootstrap.ModalBackdrop"});
    }
		if (this.bodyComponents) {
			this.$.modalBody.createComponents(this.bodyComponents);
		}
		if (this.footerComponents) {
			this.$.modalContent.createComponent({kind: "bootstrap.ModalFooter", classes: "clearfix"});
			this.$.modalContent.$.modalFooter.createComponents(this.footerComponents);
		}
	},
	isShown: false,
	hiding: false,
  remove: false,
	handleKeyUp: function(inSender, inEvent){
		if(this.isShown && this.keyboard && inEvent.keyCode == 27) { // escape
			this.hide();
		}
	},
	show: function(){
		if(this.isShown){
			return;
		}
		this.isShown = true;
		this.applyStyle("display", "block");
		this.focus();
		setTimeout(this.bindSafely(this.fadeIn), 10);
	},
	fadeIn: function(){
		this.addClass("in");
    if (this.backdrop) {
		  this.$.modalBackdrop.addClass("in");
    }
		this.setAttribute("aria-hidden", false);
	},
	hide: function(){
		if(!this.isShown){
			return;
		}
		this.isShown = false;
		this.hiding = true;
		this.removeClass("in");
    if (this.backdrop) {
		  this.$.modalBackdrop.removeClass("in");
    }
		this.addClass("out");
		this.setAttribute("aria-hidden", true);
	},
	transitionComplete: function(inSender, inEvent) {
		if (inEvent.originator === this) {
			if (this.hiding) {
				this.hiding = false;
				this.removeClass("out");
				this.setAttribute("style", false);
        if(this.remove){
          this.destroy();
        }
			}
		}
	}
});

bootstrap.ModalCloser = {
	events: {
		"onHideModal": "",
	},
	handlers: {
		"ontap": "doHideModal"
	}
}

enyo.kind({
	name: "bootstrap.ModalCloseIcon",
	kind: "bootstrap.CloseIcon",
	mixins: [
		"bootstrap.ModalCloser"
	]
});

enyo.kind({
	name: "bootstrap.ModalDialog",
	classes: 'modal-dialog',
});

enyo.kind({
	name: "bootstrap.ModalContent",
	classes: 'modal-content',
});

enyo.kind({
	name: "bootstrap.ModalHeader",
	classes: 'modal-header',
	components: [
		{ kind: "bootstrap.ModalCloseIcon" },
		{ kind: "bootstrap.ModalTitle" },
	]
});

enyo.kind({
	name: "bootstrap.ModalTitle",
	tag: "h4",
	classes: 'modal-title',
  allowHtml: true
});

enyo.kind({
	name: "bootstrap.ModalBody",
	classes: 'modal-body',
});

enyo.kind({
	name: "bootstrap.ModalFooter",
	classes: 'modal-footer',
});

enyo.kind({
	name: "bootstrap.ModalCloseButton",
	kind: "bootstrap.Button",
	mixins: [
		"bootstrap.ModalCloser",
	]
});

enyo.kind({
	name: "bootstrap.ModalBackdrop",
	classes: 'modal-backdrop fade',
});
