goog.provide('annotorious.Annotation');

goog.require('annotorious.shape');

/**
 * A 'domain class' implementation of the external annotation interface.
 * @param {string} src the source URL of the annotated object
 * @param {string} text the annotation text
 * @param {string} label the annotation label
 * @param {string} name the annotation name
 * @param {string} color the annotation color
 * @param {annotorious.shape.Shape} shape the annotated fragment shape
 * @constructor
 */
annotorious.Annotation = function(src, text, shape, label, name, color) {
  this.src = src;
  this.text = text;
  this.shapes = [ shape ];
  this.label = label;
  this.name = name;
  this.color = color;
  this['context'] = document.URL; // Prevents dead code removal
}
