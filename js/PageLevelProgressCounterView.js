define([
  'core/js/adapt'
], function(Adapt) {

  var PageLevelProgressCounterView = Backbone.View.extend({

    initialize: function(options) {
      options = options || {};
      this.calculateCompleted = options.calculateCompleted;
      this.calculateTotal = options.calculateTotal;
      this.addClasses();
      this.setUpEventListeners();
      this.render();
      this.refresh();
    },

    addClasses: function() {
      this.$el.addClass([
        'pagelevelprogress__counter'
      ].join(' '));
    },

    setUpEventListeners: function() {
      if (this.parent) {
        this.listenToOnce(this.parent, 'postRemove', this.remove);
      } else {
        this.listenTo(Adapt, 'remove', this.remove);
      }
      this.listenTo(this.model, 'change:_isComplete', this.refresh);
      if (!this.collection) return;
      this.listenTo(this.collection, 'change:_isComplete', this.refresh);
    },

    getRenderData: function() {
      var data = this.model.toJSON();
      return data;
    },

    render: function() {
      var data = this.model.toJSON();
      data.ariaLabel = this.ariaLabel;
      var template = Handlebars.templates[this.constructor.template];
      this.$el.html(template(data));
    },

    refresh: function() {
      this.checkCompletion();
      this.render();
    },

    checkCompletion: function() {
      var completed = this.calculateCompleted();
      var total = this.calculateTotal();

      this.model.set('completed', completed);
      this.model.set('total', total);
    }

  }, {
        template: 'pageLevelProgressCounter'
  });

  return PageLevelProgressCounterView;

});
