define([
  'core/js/adapt',
  './completionCalculations',
  './PageLevelProgressView',
  './PageLevelProgressIndicatorView',
  './PageLevelProgressCounterView'
], function(Adapt, completionCalculations, PageLevelProgressView, PageLevelProgressIndicatorView, PageLevelProgressCounterView) {

  var PageLevelProgressNavigationView = Backbone.View.extend({

    tagName: 'button',

    className: 'btn-icon nav__btn nav__pagelevelprogress-btn pagelevelprogress__nav-btn',

    events: {
      'click': 'onProgressClicked'
    },

    initialize: function() {
      _.bindAll(this, 'updateProgressBar');
      this.setUpEventListeners();
      this.render();
      this.addIndicator();
      this.addCounter();
      this.deferredUpdate();
    },

    setUpEventListeners: function() {
      this.listenTo(Adapt, {
        'remove': this.remove,
        'router:location': this.updateProgressBar,
        'view:childAdded pageLevelProgress:update': this.refreshProgressBar
      });
    },

    render: function() {
      var template = Handlebars.templates['pageLevelProgressNavigation'];
      this.$el.html(template({}));
    },

    addIndicator: function() {
      this.indicatorView = new PageLevelProgressIndicatorView({
        model: this.model,
        collection: this.collection,
        calculatePercentage: this._getPageCompletionPercentage,
        ariaLabel: Adapt.course.get('_globals')._extensions._pageLevelProgress.pageLevelProgressIndicatorBar
      });
      this.$el.prepend(this.indicatorView.$el);
    },

    addCounter: function() {
      // Do not proceed if the counter is not enabled for the content object
      var isEnabled = this.model.get('_pageLevelProgress')._isCompletionCounterEnabled;
      if (!isEnabled) return;

      this.counterView = new PageLevelProgressCounterView({
        model: this.model,
        collection: this.collection,
        calculateCompleted: this._getPageCompleted,
        calculateTotal: this._getPageCompletionTotal
      });
      this.$el.append(this.counterView.$el);

      this.$el.addClass('is-counter');
    },

    _getPageCompleted: function() {
      return completionCalculations.calculateCompleted(this.model);
    },

    _getPageCompletionTotal: function() {
      return completionCalculations.calculateTotal(this.model);
    },

    _getPageCompletionPercentage: function() {
      return completionCalculations.calculatePercentageComplete(this.model);
    },

    deferredUpdate: function() {
      _.defer(this.updateProgressBar);
    },

    updateProgressBar: function() {
      this.indicatorView.refresh();
    },

    refreshProgressBar: function() {
      this.collection.repopulate();
      this.updateProgressBar();
    },

    onProgressClicked: function(event) {
      if (event && event.preventDefault) event.preventDefault();
      Adapt.drawer.triggerCustomView(new PageLevelProgressView({
        collection: this.collection
      }).$el, false);
    },

    remove: function() {
      Backbone.View.prototype.remove.call(this);
      this.collection.reset();
    }

  });

  return PageLevelProgressNavigationView;

});
