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
    this.elements = {
      form: element
    };

    this.fields = [];

    this.options = {
      formSelector: this.elements.form.getAttribute('data-form-selector') || '.js-bureaucrat-form',
      fieldSelector: this.elements.form.getAttribute('data-field-selector') || '.js-bureaucrat-field',
      submitSelector: this.elements.form.getAttribute('data-submit-selector') || '.js-bureaucrat-submit',
      trigger: this.elements.form.getAttribute('data-trigger') || 'submit'
    };

    this.elements.submit = this.elements.form.querySelector(this.options.submitSelector);

    this.init();
  };

  Form.prototype = {
    init: function() {
      var _this = this;
      var fields = this.elements.form.querySelectorAll(this.options.fieldSelector);

      for (var i = 0; i < fields.length; i++) {
        this.fields.push(new Field(fields[i]));
      }

      var triggers = {
        submit: function() {
          _this.elements.form.addEventListener('submit', function(e) {
            e.preventDefault();
            _this.testAll();
          });
        },
        blur: function() {
          for (var i = 0; i < _this.fields.length; i++) {
            var field = _this.fields[i];

            field.elements.field.addEventListener('blur', function(e) {
              _this.testOne(field);
            });
          }
        },
        live: function() {
          for (var i = 0; i < _this.fields.length; i++) {
            var field = _this.fields[i];

            field.elements.field.addEventListener('keyup', function(e) {
              if (e.keyCode == 9) e.preventDefault();
              _this.testOne(field);
            });

            field.elements.field.addEventListener('change', function(e) {
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
      this.elements.submit.setAttribute('disabled', false);
    },
    disableSubmit: function() {
      this.elements.submit.setAttribute('disabled', true);
    },
    testOne: function(field) {
      field.test();
    },
    testAll: function() {

    }
  };

  var Field = function(element) {
    this.elements = {
      field: element
    };

    this.options = {
      wrapperClass: this.elements.field.getAttribute('data-wrapper-class') || '',
      rules: JSON.parse(this.elements.field.getAttribute('data-rules')) || {}
    };

    this.errors = [];

    this.init();
  };

  Field.prototype = {
    init: function() {
      this.wrap(this.elements.field, 'div', this.elements.field);
    },
    wrap: function(element, wrapper, wrapperClass) {
      var element = element;
      var wrapper = document.createElement(wrapper);

      wrapper.appendChild(element.parentNode.replaceChild(wrapper, element));
      wrapper.className = wrapperClass;

      return wrapper;
    },
    isValid: function() {
      this.errors.length === 0
    },
    test: function() {
      var _this = this;
      var value = this.elements.field.value;

      this.errors = [];

      var rules = {
        required: function(requirement) {
          return value !== '' && value !== undefined && value !== null ? true : false;
        }
      };

      var keys = Object.keys(this.options.rules);

      for (var i = 0; i < keys.length; i++) {
        console.log(keys[i], rules[keys[i]](this.options.rules[keys[i]]));
      }
    }
  };

  return Form;
}));
