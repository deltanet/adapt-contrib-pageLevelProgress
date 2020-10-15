define([
  'core/js/adapt'
], function(Adapt) {

  var Completion = Backbone.Controller.extend({

    subProgressCompleted: 0,
    subProgressTotal: 0,
    nonAssessmentCompleted: 0,
    nonAssessmentTotal: 0,
    assessmentCompleted: 0,
    assessmentTotal: 0

  });

    // Calculate completion of a contentObject
    function calculateCompletion(contentObjectModel) {

        var completion = new Completion();

        var viewType = contentObjectModel.get('_type');
        var isComplete = contentObjectModel.get('_isComplete') ? 1 : 0;
        var children;

        switch (viewType) {
            case 'page':
                // If it's a page
                children = contentObjectModel.findDescendantModels('components', {
                    where: {
                        _isAvailable: true,
                        _isOptional: false
                    }
                });

                var availableChildren = filterAvailableChildren(children);
                var components = getPageLevelProgressEnabledModels(availableChildren);

                var nonAssessmentComponents = getNonAssessmentComponents(components);

                completion.nonAssessmentTotal = nonAssessmentComponents.length;
                completion.nonAssessmentCompleted = getComponentsCompleted(nonAssessmentComponents).length;

                var assessmentComponents = getAssessmentComponents(components);

                completion.assessmentTotal = assessmentComponents.length;
                completion.assessmentCompleted = getComponentsInteractionCompleted(assessmentComponents).length;

                // only include assessments if _excludeAssessments is explicitly set to false
                if (typeof contentObjectModel.get('_pageLevelProgress')._excludeAssessments === 'boolean' && contentObjectModel.get('_pageLevelProgress')._excludeAssessments === false) {
                    completion.subProgressCompleted = contentObjectModel.get('_subProgressComplete') || 0;
                    completion.subProgressTotal = contentObjectModel.get('_subProgressTotal') || 0;
                }

                var showPageCompletionCourse = Adapt.course.get('_pageLevelProgress') && Adapt.course.get('_pageLevelProgress')._showPageCompletion !== false;
                var showPageCompletionPage = contentObjectModel.get('_pageLevelProgress') && contentObjectModel.get('_pageLevelProgress')._showPageCompletion !== false;

                if (showPageCompletionCourse && showPageCompletionPage) {
                    // optionally add one point extra for page completion to eliminate incomplete pages and full progress bars
                    // if _showPageCompletion is true then the progress bar should also consider it so add 1 to nonAssessmentTotal
                    completion.nonAssessmentCompleted += isComplete;
                    completion.nonAssessmentTotal += 1;
                }

                break;
            case 'menu': case 'course':
                // If it's a sub-menu
                children = contentObjectModel.get('_children').models;
                children.forEach(function(contentObject) {
                    var completionObject = calculateCompletion(contentObject);
                    completion.subProgressCompleted += completionObject.subProgressCompleted || 0;
                    completion.subProgressTotal += completionObject.subProgressTotal || 0;
                    completion.nonAssessmentTotal += completionObject.nonAssessmentTotal;
                    completion.nonAssessmentCompleted += completionObject.nonAssessmentCompleted;
                    completion.assessmentTotal += completionObject.assessmentTotal;
                    completion.assessmentCompleted += completionObject.assessmentCompleted;
                });
                break;

    var completion = new Completion();

    var viewType = contentObjectModel.get('_type');
    var isComplete = contentObjectModel.get('_isComplete') ? 1 : 0;
    var children;

    switch (viewType) {
      case 'page':
        // If it's a page
        children = contentObjectModel.getAllDescendantModels().filter(function(model) {
          return model.get('_isAvailable') && !model.get('_isOptional');
        });

        var availableChildren = filterAvailableChildren(children);
        var components = getPageLevelProgressEnabledModels(availableChildren);

        var nonAssessmentComponents = getNonAssessmentComponents(components);

        completion.nonAssessmentTotal = nonAssessmentComponents.length;
        completion.nonAssessmentCompleted = getComponentsCompleted(nonAssessmentComponents).length;

        var assessmentComponents = getAssessmentComponents(components);

        completion.assessmentTotal = assessmentComponents.length;
        completion.assessmentCompleted = getComponentsInteractionCompleted(assessmentComponents).length;

        if (contentObjectModel.get('_pageLevelProgress')._excludeAssessments !== true) {
          completion.subProgressCompleted = contentObjectModel.get('_subProgressComplete') || 0;
          completion.subProgressTotal = contentObjectModel.get('_subProgressTotal') || 0;
        }

        var showPageCompletionCourse = Adapt.course.get('_pageLevelProgress') && Adapt.course.get('_pageLevelProgress')._showPageCompletion !== false;
        var showPageCompletionPage = contentObjectModel.get('_pageLevelProgress') && contentObjectModel.get('_pageLevelProgress')._showPageCompletion !== false;

        if (showPageCompletionCourse && showPageCompletionPage) {
          // optionally add one point extra for page completion to eliminate incomplete pages and full progress bars
          // if _showPageCompletion is true then the progress bar should also consider it so add 1 to nonAssessmentTotal
          completion.nonAssessmentCompleted += isComplete;
          completion.nonAssessmentTotal += 1;
        }

        break;
      case 'menu': case 'course':
        // If it's a sub-menu
        children = contentObjectModel.get('_children').models;
        children.forEach(function(contentObject) {
          var completionObject = calculateCompletion(contentObject);
          completion.subProgressCompleted += completionObject.subProgressCompleted || 0;
          completion.subProgressTotal += completionObject.subProgressTotal || 0;
          completion.nonAssessmentTotal += completionObject.nonAssessmentTotal;
          completion.nonAssessmentCompleted += completionObject.nonAssessmentCompleted;
          completion.assessmentTotal += completionObject.assessmentTotal;
          completion.assessmentCompleted += completionObject.assessmentCompleted;
        });
        break;

    }

    return completion;
  }

  function getNonAssessmentComponents(models) {
    return models.filter(function(model) {
      return !model.get('_isPartOfAssessment');
    });
  }

  function getAssessmentComponents(models) {
    return models.filter(function(model) {
      return model.get('_isPartOfAssessment');
    });
  }

  function getComponentsCompleted(models) {
    return models.filter(function(item) {
      return item.get('_isComplete');
    });
  }

  function getComponentsInteractionCompleted(models) {
    return models.filter(function(item) {
      return item.get('_isComplete');
    });
  }

  //Get only those models who were enabled for pageLevelProgress
  function getPageLevelProgressEnabledModels(models) {
    return models.filter(function(model) {
      var config = model.get('_pageLevelProgress');
      return config && config._isEnabled;
    });
  }

  function unavailableInHierarchy(parents) {
    if (!parents) return;
    return parents.some(function(parent) {
      return !parent.get('_isAvailable');
    });
  }

  function filterAvailableChildren(children) {
    var availableChildren = [];

    for (var i = 0, count = children.length; i < count; i++) {
      var parents = children[i].getAncestorModels();
      if (unavailableInHierarchy(parents)) continue;
      availableChildren.push(children[i]);
    }

    function calculateCompleted(model) {
        var completionObject = calculateCompletion(model);

        var completed = completionObject.nonAssessmentCompleted + completionObject.assessmentCompleted + completionObject.subProgressCompleted;
        return completed;
    }

    function calculateTotal(model) {
        var completionObject = calculateCompletion(model);

        var total  = completionObject.nonAssessmentTotal + completionObject.assessmentTotal + completionObject.subProgressTotal;
        return total;
    }

    return {
        calculateCompletion: calculateCompletion,
        calculatePercentageComplete: calculatePercentageComplete,
        calculateCompleted: calculateCompleted,
        calculateTotal: calculateTotal,
        getPageLevelProgressEnabledModels: getPageLevelProgressEnabledModels,
        filterAvailableChildren: filterAvailableChildren
    };

});
