goog.provide('annotorious.Editor');

goog.require('goog.dom.classes');
goog.require('goog.style');
goog.require('goog.dom');
goog.require('goog.dom.query');
goog.require('goog.soy');
goog.require('goog.string.html.htmlSanitize');
goog.require('goog.style');
goog.require('goog.ui.Textarea');

goog.require('annotorious.templates');

/**
 * Annotation edit form.
 * @param {Object} annotator reference to the annotator
 * @constructor
 */
annotorious.Editor = function (annotator) {
    this.element = goog.soy.renderAsElement(annotorious.templates.editform);
    // console.log(this.element, 'this.element')
    /** @private **/
    this._annotator = annotator;

    /** @private **/
    this._item = annotator.getItem();
    /** @private **/
    this._original_annotation;

    /** @private **/
    this._current_annotation;

    /** @private **/
    this._labelText;

    /** @private **/
    this._labelColor;

    /** @private **/
    this._textarea = new goog.ui.Textarea('');

    /** @private **/
    this._items = goog.dom.query('.label_item', this.element); // 列表
    // console.log(this._items, 'this._item')

    /** @private **/
    this._btnCancel = goog.dom.query('.annotorious-editor-button-cancel', this.element)[0];

    this._btnClose = goog.dom.query('.label_close', this.element)[0];

    /** @private **/
    this._btnSave = goog.dom.query('.annotorious-editor-button-save', this.element)[0];

    /** @private **/
    this._btnContainer = goog.dom.getParentElement(this._btnSave);

    /** @private **/
    this._extraFields = [];

    var self = this;

    for (var i = 0; i < self._items.length; i++) {
        goog.events.listen(self._items[i], goog.events.EventType.CLICK, function (event) { // 点击选择
            event.preventDefault();
            // console.log(event.currentTarget.firstChild.childNodes, '点击');
            for (var j = 0; j < self._items.length; j++) {
                var item = self._items[j];
                if (item.getAttribute('class') === 'active_label') {
                    item.setAttribute('class', 'label_item');
                }
                if (item.firstChild.childNodes[0].getAttribute('class') === 'color_active') {
                    item.firstChild.childNodes[0].setAttribute('class', '');
                }
            }

            event.currentTarget.setAttribute('class', 'active_label');
            event.currentTarget.firstChild.childNodes[0].className = 'color_active';

            self._labelText = event.currentTarget.innerText;
            self._labelColor = event.currentTarget.firstChild.childNodes[0].style.background
        });
    }

    goog.events.listen(this._btnCancel, goog.events.EventType.CLICK, function (event) { // 取消
        event.preventDefault();
        annotator.stopSelection(self._original_annotation);
        self.close();
    });

    goog.events.listen(this._btnClose, goog.events.EventType.CLICK, function (event) { // 关闭
        event.preventDefault();
        annotator.stopSelection(self._original_annotation);
        self.close();
    });

    goog.events.listen(this._btnSave, goog.events.EventType.CLICK, function (event) { // 保存
        event.preventDefault();
        var annotation = self.getAnnotation();
        // console.log(self._original_annotation, 'self._original_annotation');
        // console.log(annotator.getItem(), 'annotator.getItem()');
       
        if(!annotation.label) {
            return
        }
        annotator.addAnnotation(annotation);
        annotator.stopSelection();

        if (self._original_annotation)
            annotator.fireEvent(annotorious.events.EventType.ANNOTATION_UPDATED, annotation, annotator.getItem());
        else
            annotator.fireEvent(annotorious.events.EventType.ANNOTATION_CREATED, annotation, annotator.getItem());
        self.close();
        //  console.log(annotation, 'annotation');
    });

    goog.style.showElement(this.element, false);
    goog.dom.appendChild(annotator.element, this.element);

    this._textarea.decorate(goog.dom.query('.annotorious-editor-text', this.element)[0]);
    annotorious.dom.makeHResizable(this.element, function () {
        self._textarea.resize()
    });
};

/**
 * Adds a field to the editor GUI widget. A field can be either an (HTML) string, or
 * a function that takes an Annotation as argument and returns an (HTML) string or
 * a DOM element.
 * @param {string | Function} field the field
 */
annotorious.Editor.prototype.addField = function (field) {
    var fieldEl = goog.dom.createDom('div', 'annotorious-editor-field');

    if (goog.isString(field)) {
        fieldEl.innerHTML = field;
    } else if (goog.isFunction(field)) {
        this._extraFields.push({el: fieldEl, fn: field});
    } else if (goog.dom.isElement(field)) {
        goog.dom.appendChild(fieldEl, field);
    }

    goog.dom.insertSiblingBefore(fieldEl, this._btnContainer);
};

/**
 * Opens the edit form with an annotation.
 * @param {annotorious.Annotation=} opt_annotation the annotation to edit (or undefined)
 * @param {Object=} opt_event the event, if any
 */
annotorious.Editor.prototype.open = function (opt_annotation, opt_event) {
    // console.log(opt_annotation, 'open')
    this._annotator.fireEvent(annotorious.events.EventType.BEFORE_EDITOR_SHOWN, opt_annotation);

    this._original_annotation = opt_annotation;
    this._current_annotation = opt_annotation;

    if (opt_annotation)
        this._textarea.setValue(opt_annotation.text);

    goog.style.showElement(this.element, true);
    this._textarea.getElement().focus();

    // Update extra fields (if any)
    goog.array.forEach(this._extraFields, function (field) {
        var f = field.fn(opt_annotation);
        if (goog.isString(f)) {
            field.el.innerHTML = f;
        } else if (goog.dom.isElement(f)) {
            goog.dom.removeChildren(field.el);
            goog.dom.appendChild(field.el, f);
        }
    });
    this._annotator.fireEvent(annotorious.events.EventType.EDITOR_SHOWN, opt_annotation);
};

/**
 * Closes the editor.
 */
annotorious.Editor.prototype.close = function () {
    goog.style.showElement(this.element, false);
    this._textarea.setValue('');
};

/**
 * Sets the position (i.e. CSS left/top value) of the editor element.
 * @param {annotorious.shape.geom.Point} xy the viewport coordinate
 */
annotorious.Editor.prototype.setPosition = function (xy) {
    goog.style.setPosition(this.element, xy.x, xy.y);
};

/**
 * Returns the annotation that is the current state of the editor.
 * @return {annotorious.Annotation} the annotation
 */
annotorious.Editor.prototype.getAnnotation = function () {
    var sanitized = goog.string.html.htmlSanitize(this._textarea.getValue(), function (url) {
        return url;
    });
    var label = this._labelText;

    var color = this._labelColor;

    var name
    if (!JSON.parse(localStorage.getItem('userData'))) {
        name = '无'
    } else {
        name = JSON.parse(localStorage.getItem('userData')).name;
    }

    if (this._current_annotation) {
        this._current_annotation.text = sanitized;
        this._current_annotation.label = label;
        this._current_annotation.name = name;
        this._current_annotation.color = color;
    } else {
        this._current_annotation =
            new annotorious.Annotation(this._item.src, sanitized, this._annotator.getActiveSelector().getShape(), label, name, color);
    }

    return this._current_annotation;
};

/** API exports **/
annotorious.Editor.prototype['addField'] = annotorious.Editor.prototype.addField;
annotorious.Editor.prototype['getAnnotation'] = annotorious.Editor.prototype.getAnnotation;
