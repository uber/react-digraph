'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _radium = require('radium');

var _radium2 = _interopRequireDefault(_radium);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // Copyright (c) 2016 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

/*
  Zoom slider and zoom to fit controls for GraphView
*/

// Only old-style imports for react-icons seem to work with gulp
var FaExpand = require('react-icons/lib/fa/expand');
var FaInfoCircle = require('react-icons/lib/fa/info-circle');

var steps = 100; // Slider steps


function makeStyles(primary) {
  return {
    controls: {
      position: 'absolute',
      bottom: '30px',
      left: '15px',
      zIndex: 100,
      display: 'grid',
      gridTemplateColumns: 'auto auto',
      gridGap: '15px',
      alignItems: 'center'
    },
    sliderWrapper: {
      backgroundColor: 'white',
      color: primary,
      border: 'solid 1px lightgray',
      padding: '6.5px',
      borderRadius: '2px'
    },
    slider: {
      position: 'relative',
      top: '6px',
      marginLeft: 5,
      marginRight: 5,
      cursor: 'pointer'
    },
    button: {
      backgroundColor: 'white',
      color: primary,
      border: 'solid 1px lightgray',
      outline: 'none',
      width: 31,
      height: 31,
      borderRadius: '2px',
      cursor: 'pointer'
    }
  };
}

var GraphControls = function (_Component) {
  _inherits(GraphControls, _Component);

  function GraphControls(props) {
    _classCallCheck(this, GraphControls);

    var _this = _possibleConstructorReturn(this, (GraphControls.__proto__ || Object.getPrototypeOf(GraphControls)).call(this, props));

    _this.state = {
      styles: makeStyles(props.primary)
    };
    return _this;
  }

  // Convert slider val (0-steps) to original zoom value range


  _createClass(GraphControls, [{
    key: 'sliderToZoom',
    value: function sliderToZoom(val) {
      return val * (this.props.maxZoom - this.props.minZoom) / steps + this.props.minZoom;
    }

    // Convert zoom val (minZoom-maxZoom) to slider range

  }, {
    key: 'zoomToSlider',
    value: function zoomToSlider(val) {
      return (val - this.props.minZoom) * steps / (this.props.maxZoom - this.props.minZoom);
    }

    // Center graph-view on contents of svg > view

  }, {
    key: 'zoomToFit',
    value: function zoomToFit() {
      this.props.zoomToFit();
    }

    // Modify current zoom of graph-view

  }, {
    key: 'zoom',
    value: function zoom(e) {
      var sliderVal = e.target.value;
      var zoomLevelNext = this.sliderToZoom(sliderVal);
      var delta = zoomLevelNext - this.props.zoomLevel;

      if (zoomLevelNext <= this.props.maxZoom && zoomLevelNext >= this.props.minZoom) {
        this.props.modifyZoom(delta);
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var styles = this.state.styles;

      return _react2.default.createElement(
        'div',
        { style: styles.controls, className: 'graphControls' },
        _react2.default.createElement(
          'div',
          { style: styles.sliderWrapper },
          '-',
          _react2.default.createElement('input', {
            type: 'range',
            style: styles.slider,
            min: this.zoomToSlider(this.props.minZoom),
            max: this.zoomToSlider(this.props.maxZoom),
            value: this.zoomToSlider(this.props.zoomLevel),
            onChange: this.zoom.bind(this),
            step: '1' }),
          '+'
        ),
        _react2.default.createElement(
          'button',
          { style: styles.button, onMouseDown: this.props.zoomToFit },
          _react2.default.createElement(FaExpand, null)
        )
      );
    }
  }]);

  return GraphControls;
}(_react.Component);

GraphControls.propTypes = {
  primary: _propTypes2.default.string,
  minZoom: _propTypes2.default.number,
  maxZoom: _propTypes2.default.number,
  zoomLevel: _propTypes2.default.number.isRequired,
  zoomToFit: _propTypes2.default.func.isRequired,
  modifyZoom: _propTypes2.default.func.isRequired
};

GraphControls.defaultProps = {
  primary: 'dodgerblue',
  minZoom: 0.15,
  maxZoom: 1.5
};

exports.default = (0, _radium2.default)(GraphControls);
//# sourceMappingURL=graph-controls.js.map