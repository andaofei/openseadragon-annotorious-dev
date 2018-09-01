goog.provide('annotorious.events');

goog.require('goog.array');
goog.require('goog.events');

/**
 * A central 'event bus' to distribute the annotation lifecycle events.
 * @constructor
 */
annotorious.events.EventBroker = function() {
  /** @private **/
  this._handlers = [];
}

/**
 * Adds an event handler.
 * @param {annotorious.events.EventType} type the event type
 * @param {Function} handler the handler function to add
 */
annotorious.events.EventBroker.prototype.addHandler = function(type, handler) {
  // console.log(this._handlers[type], 'this._handlers[type]')
  if (!this._handlers[type])
    this._handlers[type] = [];

  this._handlers[type] = []; //清空
  this._handlers[type].push(handler);
}

/**
 * Removes an event handler.
 * @param {annotorious.events.EventType} type the event type
 * @param {Function} handler the handler function to remove
 */
annotorious.events.EventBroker.prototype.removeHandler = function(type, handler) {
  var handlers = this._handlers[type];
  if (handlers)
    goog.array.remove(handlers, handler);  
}

/**
 * Fires an event, triggering execution of all registered handlers.
 * Event handlers may optionally return a boolean value to indicate whether
 * further steps following the event should be canceled (e.g. in case of 
 * annotation removal). If there is no return value (or the return value is
 * 'true'), no action will be taken by Annotorious. 
 * @param {annotorious.events.EventType} type the event type
  * @param {Object=} opt_extra the event object
 * @param {Object=} opt_event the event object
 * @return {boolean} the 'cancel event' flag
 */
annotorious.events.EventBroker.prototype.fireEvent = function(type, opt_event, opt_extra) {
  // console.log(type, opt_event, opt_extra)
  // this._handlers = [];
  var cancelEvent = false;

  var handlers = this._handlers[type];
  // console.log(handlers,'handlers')
  if (handlers) {
    goog.array.forEach(handlers, function(handler, idx, array) {
      // console.log(handler,'handler')
      var retVal = handler(opt_event, opt_extra);
      if (goog.isDef(retVal) && !retVal)
        cancelEvent = true;
    });
  }
  // console.log(cancelEvent, 'cancelEvent')
  return cancelEvent;
};

/**
 * Annotation lifecycle events.
 * @enum {string}
 */
annotorious.events.EventType = {

  /**
   * The mouse entered the annotatable media area
   */
  MOUSE_OVER_ANNOTATABLE_ITEM: 'onMouseOverItem',

  /**
   * The mouse moved out of the annotatable media area
   */
  MOUSE_OUT_OF_ANNOTATABLE_ITEM: 'onMouseOutOfItem',

  /** 
   * The mouse entered an annotation
   */ 
  MOUSE_OVER_ANNOTATION: 'onMouseOverAnnotation',

  /** 
   * The mouse moved out of an annotation
   */ 
  MOUSE_OUT_OF_ANNOTATION: 'onMouseOutOfAnnotation',

  /**
   * A new selection was started
   */
  SELECTION_STARTED: 'onSelectionStarted',
  
  /**
   * The current selection was canceled
   */
  SELECTION_CANCELED: 'onSelectionCanceled',
  
  /** 
   * The current selection was completed
   */
  SELECTION_COMPLETED: 'onSelectionCompleted',
  
  /** 
   * The current selection was changed
   */
  SELECTION_CHANGED: 'onSelectionChanged',

    
  /**
   * The annotation editor is opening.  Pass the annotation object if it exists.
   */
  BEFORE_EDITOR_SHOWN: 'beforeEditorShown',

  /**
   * The annotation editor was opened.  Pass the annotation object if it exists.
   */
  EDITOR_SHOWN: 'onEditorShown',
  
  /**
   * The annotation popop was opened.  Pass the annotation object.
   */
  POPUP_SHOWN: 'onPopupShown',

  /**
   * The annotation popup widget is about to hide
   */
  BEFORE_POPUP_HIDE: 'beforePopupHide',

  /**
   * The annotation is about to be removed
   */
  BEFORE_ANNOTATION_REMOVED: 'beforeAnnotationRemoved',

  /**
   * An annotation was removed
   */
  ANNOTATION_REMOVED: 'onAnnotationRemoved',

  /**
   * An annotation was created
   */
  ANNOTATION_CREATED: 'onAnnotationCreated',
  
  /**
   * An existing annotation was updated
   */
  ANNOTATION_UPDATED: 'onAnnotationUpdated',

  /**
   * The annotation was clicked.  Pass the annotation object.
   */
  ANNOTATION_CLICKED: 'onAnnotationClicked'
  
};
