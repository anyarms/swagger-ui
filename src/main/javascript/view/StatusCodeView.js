'use strict';

SwaggerUi.Views.StatusCodeView = Backbone.View.extend({
  initialize: function (opts) {
    this.options = opts || {};
    this.router = this.options.router;
  },

  render: function(){
    var value = this.router.api.models[this.model.responseModel];
    $(this.el).html(Handlebars.templates.status_code(this.model));

    if (this.router.api.models.hasOwnProperty(this.model.responseModel)) {
      var responseModel = {
        sampleJSON: JSON.stringify(SwaggerUi.partials.signature.createJSONSample(value), void 0, 2),
        sampleXML: this.model.isXML ? SwaggerUi.partials.signature.createXMLSample(this.model.schema, value.models) : false,
        isParam: false,
        signature: SwaggerUi.partials.signature.getModelSignature(this.model.responseModel, value, this.router.api.models),
        defaultRendering: this.model.defaultRendering
      };

      var responseModelView = new SwaggerUi.Views.SignatureView({model: responseModel, tagName: 'div'});
      $('.model-signature', this.$el).append(responseModelView.render().el);
      if (responseModel.sampleJSON) {
        $('.statuscode-sample', this.$el).append(responseModel.sampleJSON);
      } else {
        $('.statuscode-sample', this.$el).html('');
      }
    } else {
      $('.model-signature', this.$el).html('');
    }

    if (this.model.code === '400') {
      $('.http-status', this.$el).append('Bad Request');
    }
    if (this.model.code === '401') {
      $('.http-status', this.$el).append('Unauthorized');
    }
    if (this.model.code === '500') {
      $('.http-status', this.$el).append('Internal Server Error');
    }
    if (this.model.code === '403') {
      $('.http-status', this.$el).append('Forbidden');
    }
    return this;
  }
});