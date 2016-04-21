'use strict';

SwaggerUi.Views.MainView = Backbone.View.extend({
  apisSorter : {
    alpha   : function(a,b){ return a.name.localeCompare(b.name); }
  },
  operationsSorters : {
    alpha   : function(a,b){ return a.path.localeCompare(b.path); },
    method  : function(a,b){ return a.method.localeCompare(b.method); }
  },
  initialize: function(opts){
    var sorterOption, sorterFn, key, value;
    opts = opts || {};

    this.router = opts.router;

    document.addEventListener('click', this.onLinkClick, true);
    // Sort APIs
    if (opts.swaggerOptions.apisSorter) {
      sorterOption = opts.swaggerOptions.apisSorter;
      if (_.isFunction(sorterOption)) {
        sorterFn = sorterOption;
      } else {
        sorterFn = this.apisSorter[sorterOption];
      }
      if (_.isFunction(sorterFn)) {
        this.model.apisArray.sort(sorterFn);
      }
    }
    // Sort operations of each API
    if (opts.swaggerOptions.operationsSorter) {
      sorterOption = opts.swaggerOptions.operationsSorter;
      if (_.isFunction(sorterOption)) {
        sorterFn = sorterOption;
      } else {
        sorterFn = this.operationsSorters[sorterOption];
      }
      if (_.isFunction(sorterFn)) {
        for (key in this.model.apisArray) {
          this.model.apisArray[key].operationsArray.sort(sorterFn);
        }
      }
    }

    // set up the UI for input
    this.model.auths = [];

    for (key in this.model.securityDefinitions) {
      value = this.model.securityDefinitions[key];

      this.model.auths.push({
        name: key,
        type: value.type,
        value: value
      });
    }

    if ('validatorUrl' in opts.swaggerOptions) {
      // Validator URL specified explicitly
      this.model.validatorUrl = opts.swaggerOptions.validatorUrl;
    } else if (this.model.url.indexOf('localhost') > 0 || this.model.url.indexOf('127.0.0.1') > 0) {
      // Localhost override
      this.model.validatorUrl = null;
    } else {
      // Default validator
      if(window.location.protocol === 'https:') {
        this.model.validatorUrl = 'https://online.swagger.io/validator';
      }
      else {
        this.model.validatorUrl = 'http://online.swagger.io/validator';
      }
    }

    // JSonEditor requires type='object' to be present on defined types, we add it if it's missing
    // is there any valid case were it should not be added ?
    var def;
    for(def in this.model.definitions){
      if (!this.model.definitions[def].type){
        this.model.definitions[def].type = 'object';
      }
    }

  },

  render: function(){
    if (this.model.securityDefinitions) {
      for (var name in this.model.securityDefinitions) {
        var auth = this.model.securityDefinitions[name];
        var button;

        if (auth.type === 'apiKey' && $('#apikey_button').length === 0) {
          button = new SwaggerUi.Views.ApiKeyButton({model: auth, router:  this.router}).render().el;
          $('.auth_main_container').append(button);
          var keyAuth = new SwaggerClient.ApiKeyAuthorization(
            this.model.name,
            'apiKey',
            this.model.in
          );
          this.router.api.clientAuthorizations.add(this.model.name, keyAuth);
          this.router.load();
        }

        if (auth.type === 'basicAuth' && $('#basic_auth_button').length === 0) {
          button = new SwaggerUi.Views.BasicAuthButton({model: auth, router: this.router}).render().el;
          $('.auth_main_container').append(button);
          var basicAuth = new SwaggerClient.PasswordAuthorization('basic', 'username', 'password');
          this.router.api.clientAuthorizations.add(this.model.type, basicAuth);
          this.router.load();
        }
      }
    }

    $('.left-nav-menu').append('left nav');
    // Render the outer container for resources
    $(this.el).html(Handlebars.templates.main(this.model));

    // Render each resource

    var resources = {};
    var counter = 0;
    for (var i = 0; i < this.model.apisArray.length; i++) {
      var resource = this.model.apisArray[i];
      var id = resource.name;
      while (typeof resources[id] !== 'undefined') {
        id = id + '_' + counter;
        counter += 1;
      }
      resource.id = id;
      resources[id] = resource;
      this.addResource(resource, this.model.auths);
    }

    $('.propWrap').hover(function onHover(){
      $('.optionsWrapper', $(this)).show();
    }, function offhover(){
      $('.optionsWrapper', $(this)).hide();
    });
    return this;
  },

  addResource: function(resource, auths){
    // Render a resource and add it to resources li
    resource.id = resource.id.replace(/\s/g, '_');

    // Make all definitions available at the root of the resource so that they can
    // be loaded by the JSonEditor
    resource.definitions = this.model.definitions;

    var resourceView = new SwaggerUi.Views.ResourceView({
      model: resource,
      router: this.router,
      tagName: 'li',
      id: 'resource_' + resource.id,
      className: 'resource',
      auths: auths,
      swaggerOptions: this.options.swaggerOptions
    });
    $('#resources', this.el).append(resourceView.render().el);
  },

  leftNav: function(){
  var html = '';
  var apis = [];
  apis.push({
    name: 'avatax15rest',
    location: 'https://raw.githubusercontent.com/Avalara/Swagger/master/avatax15/rest.yaml'
  });
  html +=   '<dl class="level1">';
  for (var i = apis.length - 1; i >= 0; i--) {
    html += '<dt class="level1 parent first"><span class="outer"><span class="inner"><span>';
    html += apis[i].name ;
    html += '</span></span></span></dt>';
  }
          // <% if defined? apis %>
          // <% apis.each do |api| %>
          //   <dt class="level1 parent first"><span class="outer"><span class="inner"><span><%= link_to get_title(api), "/#{api}.#{development? ? 'html' : 'php'}" %></span></span></span>
          //     </dt>
          //   <dd class="level1 parent first">
          //     <dl class="level2">
          //     <% tocify(api).each do |method| %>

          //      <dt class="level2 notparent"><span class="outer"><span class="inner"><span><%= link_to method[0], "/#{api}.#{development? ? 'html' : 'php'}##{method[1]}" %></span></span></span></dt>
          //      <dd></dd>
          //     <% end %>
          //     </dl>
          //   </dd>
          //     <% end %>
            
            
          //   <% end %>
  html += '</dl>';
  return html;
  },

  clear: function(){
    $(this.el).html('');
  },

  onLinkClick: function (e) {
    var el = e.target;
    if (el.tagName === 'A') {
      if (location.hostname !== el.hostname || location.port !== el.port) {
        e.preventDefault();
        window.open(el.href, '_blank');
      }
    }
  }
});
