/*
 * Copyright (C) 2012 Klokan Technologies GmbH (info@klokantech.com)
 *
 * The JavaScript code in this page is free software: you can
 * redistribute it and/or modify it under the terms of the GNU
 * General Public License (GNU GPL) as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option)
 * any later version.  The code is distributed WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU GPL for more details.
 *
 * USE OF THIS CODE OR ANY PART OF IT IN A NONFREE SOFTWARE IS NOT ALLOWED
 * WITHOUT PRIOR WRITTEN PERMISSION FROM KLOKAN TECHNOLOGIES GMBH.
 *
 * As additional permission under GNU GPL version 3 section 7, you
 * may distribute non-source (e.g., minimized or compacted) forms of
 * that code without the copy of the GNU GPL normally required by
 * section 4, provided you include this license notice and a URL
 * through which recipients can access the Corresponding Source.
 *
 */

/**
 * @fileoverview The polygon editable with markers.
 *
 * @author petr.sloup@klokantech.com (Petr Sloup)
 *
 */

goog.provide('we.ui.EditablePolygon');

goog.require('we.ui.markers.PolyDragger');
goog.require('we.ui.markers.PolyIcon');



/**
 * @param {!we.scene.Scene} scene Scene where the polygon is to be rendered.
 * @param {!we.ui.markers.MarkerManager} markermanager MarkerManager to use.
 * @constructor
 */
we.ui.EditablePolygon = function(scene, markermanager) {
  /**
   * @type {!we.scene.Scene}
   * @private
   */
  this.scene_ = scene;

  /**
   * @type {!we.ui.markers.MarkerManager}
   * @private
   */
  this.markermanager_ = markermanager;

  /**
   * @type {!we.scene.Polygon}
   * @private
   */
  this.polygon_ = new we.scene.Polygon(scene.context);

  scene.additionalDrawables.push(this.polygon_);

  /**
   * @type {!Object.<number, string>}
   * @private
   */
  this.draggers_ = {};

  /**
   * @type {!Object.<number, !Array.<we.ui.markers.PolyDragger>>}
   * @private
   */
  this.neighborMids_ = {};

  /**
   * @type {boolean}
   * @private
   */
  this.clickToAddMode_ = true;

  // when mouse is down, wait for mouseup and check, if it wasn't a dragging..
  goog.events.listen(scene.context.canvas, goog.events.EventType.MOUSEDOWN,
      function(e) {
        goog.events.listen(scene.context.canvas, goog.events.EventType.MOUSEUP,
            function(e_) {
              if (e_.button == 0 && this.clickToAddMode_) {
                if (Math.max(Math.abs(e.offsetX - e_.offsetX),
                    Math.abs(e.offsetY - e_.offsetY)) <= 3) {
                  var coords = scene.getLatLongForXY(e_.offsetX, e_.offsetY);
                  if (coords) {
                    this.addPoint(coords[0], coords[1]);
                    e_.preventDefault();
                  }
                }
              }
            }, false, this);
      }, false, this);

  /*this.polygon_.addPoint(40, 40);
  this.polygon_.addPoint(40, 50);
  this.polygon_.addPoint(30, 50);
  this.polygon_.addPoint(30, 40);
  this.polygon_.addPoint(35, 40);//*/
  /*this.addPoint(9.0, 9.0);
  this.addPoint(5.0, 5.0);
  this.addPoint(-10.0, 5.0);
  this.addPoint(-5.0, 3.5);
  this.addPoint(5.5, -7.5);
  this.addPoint(3.0, -2.5);//*/

  /**
   * @type {!we.ui.markers.PolyIcon}
   * @private
   */
  this.icon_ = new we.ui.markers.PolyIcon(0, 0, scene);
  this.icon_.setImage('47.png', 100);
  this.markermanager_.addMarker(null, this.icon_);
  this.icon_.enable(false);
};


/**
 * @private
 */
we.ui.EditablePolygon.prototype.repositionIcon_ = function() {
  var avg = this.polygon_.calcAverage();

  this.icon_.lat = avg[1];
  this.icon_.lon = avg[0];
  this.icon_.enable(this.polygon_.isValid());
};


/**
 * @param {number} lat .
 * @param {number} lng .
 * @return {number} fixedId.
 */
we.ui.EditablePolygon.prototype.addPoint = function(lat, lng) {
  var fixedId = this.polygon_.addPoint(lat, lng);

  var dragger = new we.ui.markers.PolyDragger(lat, lng, this.scene_, fixedId,
                                              goog.bind(this.movePoint_, this),
                                              goog.bind(this.removePoint_, this)
      );
  this.draggers_[fixedId] = this.markermanager_.addMarker(null, dragger);

  this.repositionIcon_();

  /*
  var neighs = this.polygon_.getNeighbors(fixedId);
  var oldMid;
  var newMid = new we.ui.markers.PolyDragger(lat, lng, this.scene_, null,
                                             goog.bind(this.movePoint_, this),
                                             goog.bind(this.removePoint_, this),
                                             goog.bind(this.addPoint_, this));
  if (neighs.length == 0) {
    oldMid = new we.ui.markers.PolyDragger(lat, lng, this.scene_, null,
                                           goog.bind(this.movePoint_, this),
                                           goog.bind(this.removePoint_, this),
                                           goog.bind(this.addPoint_, this));
  } else {
    if (this.neighborMids_[neighs[0]][1] == this.neighborMids_[neighs[1]][0]) {
      oldMid = this.neighborMids_[neighs[0]][1];
      this.neighborMids_[neighs[1]][0] = newMid;
    } else if (
        this.neighborMids_[neighs[0]][0] == this.neighborMids_[neighs[1]][1]) {
      oldMid = this.neighborMids_[neighs[0]][0];
      this.neighborMids_[neighs[1]][1] = newMid;
    }
  }
  this.neighborMids_[fixedId][0] = oldMid;
  this.neighborMids_[fixedId][1] = newMid;
  */

  return fixedId;
};


/**
 * @param {number} fixedId .
 * @param {number} lat .
 * @param {number} lng .
 * @private
 */
we.ui.EditablePolygon.prototype.movePoint_ = function(fixedId, lat, lng) {
  this.polygon_.movePoint(fixedId, lat, lng);
  this.repositionIcon_();
};


/**
 * @param {number} fixedId .
 * @private
 */
we.ui.EditablePolygon.prototype.removePoint_ = function(fixedId) {
  this.polygon_.removePoint(fixedId);
  this.repositionIcon_();
  if (goog.isDefAndNotNull(this.draggers_[fixedId])) {
    this.markermanager_.removeMarker(this.draggers_[fixedId]);
    delete this.draggers_[fixedId];
  }
};
