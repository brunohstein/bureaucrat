(function(global, bureaucrat) {
  'use strict';

  if (typeof define === 'function' && define.amd)
    define('bureaucrat-js', [], bureaucrat);
  else if (typeof exports !== 'undefined')
    exports.Bureaucrat = bureaucrat();
  else
    global.Bureaucrat = bureaucrat();
}(window, function() {
  'use strict';

  var Form = function(element) {
    this.element = element;
    this.fields = [];

    this.options = {
      formSelector:     this.element.getAttribute('data-form-selector')    || '.js-bureaucrat-form',
      fieldSelector:    this.element.getAttribute('data-field-selector')   || '.js-bureaucrat-field',
      wrapperSelector:  this.element.getAttribute('data-wrapper-selector') || '.js-bureaucrat-wrapper',
      submitSelector:   this.element.getAttribute('data-submit-selector')  || '.js-bureaucrat-submit',
      trigger:          this.element.getAttribute('data-trigger')          || 'submit'
    };

    this.init();
  };

  Form.prototype = {
    init: function() {
      var _this = this;
      var fields = document.querySelectorAll(this.options.fieldSelector);

      for (var i = 0; i < fields.length; i++) {
        this.fields.push(new Field(fields[i]));
      }

      var triggers = {
        submit: function() {
          _this.element.addEventListener('submit', function(e) {
            e.preventDefault();
            _this.testAll();
          });
        },
        blur: function() {
          for (var i = 0; i < _this.fields.length; i++) {
            var field = _this.fields[i];

            field.element.addEventListener('blur', function(e) {
              _this.testOne(field);
            });
          }
        },
        live: function() {
          for (var i = 0; i < _this.fields.length; i++) {
            var field = _this.fields[i];

            field.element.addEventListener('keyup', function(e) {
              if (e.keyCode == 9) e.preventDefault();
              _this.testOne(field);
            });

            field.element.addEventListener('change', function(e) {
              _this.testOne(field);
            });
          }
        }
      };

      triggers[this.options.trigger]();
    },
    destroy: function() {
      var _this = this;

      var triggers = {
        submit: function() {

        },
        blur: function() {

        },
        live: function() {

        }
      };

      triggers[this.options.trigger]();
    },
    enableSubmit: function() {

    },
    disableSubmit: function() {

    },
    testOne: function(field) {

    },
    testAll: function() {

    }
  };

  var Field = function(element) {
    this.element = element;
  };

  return Form;
}));
