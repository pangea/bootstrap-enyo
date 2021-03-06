enyo.kind({
	name: "bootstrap.Nav",
	classes: "nav",
	tag: 'ul',
	published: {
		type: 'tabs', // or pills
		justified: false,
		stacked: false
	},
  handlers: {
    onNavItemClicked: "changeActiveTab"
  },
	create: function() {
		this.inherited(arguments);
		this.setupClasses();
	},
	setupClasses: function(){
		this.addClass('nav-' + this.type);
		if(this.justified){
			this.addClass('nav-justified');
		}
		if(this.stacked && this.type === 'pills'){
			this.addClass('nav-stacked');
		}
	},
  changeActiveTab: function(inSender, inEvent){
    this.waterfall("changeActiveTab", inEvent);
  }
});

enyo.kind({
	name: "bootstrap.MenuItem",
	tag: 'li',
  handlers: {
    changeActiveTab: "changeActiveTab"
  },
	published: {
		disabled: false,
		active: false,
		text: "",
		href: "javascript:;",
    icon: null
	},
	components: [
		{ kind: "bootstrap.MenuLink", name: 'link' },
	],
	create: function() {
		this.inherited(arguments);
		this.setupLink();
		this.disabledChanged();
		this.activeChanged();
	},
	disabledChanged: function(){
		this.addRemoveClass('disabled', this.disabled);
	},
	activeChanged: function(){
		this.addRemoveClass('active', this.active);
	},
  textChanged: function() {
    this.setupLink();
  },
  iconChanged: function() {
    this.setupLink();
  },
	setupLink: function(){
    if(this.icon) {
		  this.$.link.setContent(
        "<span class='fa " + this.icon + "'></span>" + this.text
      );
    } else {
		  this.$.link.setContent(this.text);
    }
		this.$.link.setAttribute("href", this.href);
	},
  changeActiveTab: function(inSender, inEvent){
    if(this.href === inEvent.originator.getAttribute('href')){
      this.setActive(true);
    }else{
      this.setActive(false);
    }
    return true;
  }
});

enyo.kind({
	name: "bootstrap.MenuLink",
	tag: 'a',
  allowHtml: true,
	attributes: {
		href: 'javascript:;',
	},
  handlers: {
    onclick: "navItemClicked"
  },
  events: {
    onNavItemClicked: ""
  },
  navItemClicked: function(inSender, inEvent) {
    inEvent.preventDefault(); //prevent adding of href to url
    this.doNavItemClicked();
  }
});

enyo.kind({
	name: "bootstrap.DropdownMenuToggleLink",
	kind: "bootstrap.MenuLink",
	mixins: [
		"bootstrap.DropdownToggle",
	],
	components: [
		{ tag: "span", name: "text" },
		{ kind: "bootstrap.Carat" },
	],
})

enyo.kind({
	name: "bootstrap.NavDropdown",
	kind: "bootstrap.MenuItem",
	mixins: [
		"bootstrap.Dropdown"
	],
	published: {
		text: ""
	},
	components: [
		{ kind: "bootstrap.DropdownMenuToggleLink", name: "link" },
	],
	create: function() {
		this.inherited(arguments);
		this.disabledChanged();
		this.textChanged();
	},
	setupLink: function(){
		this.$.link.$.text.setContent(this.text + " ");
	},
	textChanged: function(){
    this.setupLink();
	}
});

enyo.kind({
	name: "bootstrap.Badge",
	tag: 'span',
	classes: 'badge'
});
