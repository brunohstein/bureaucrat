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
    this.errors = [];

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
        this.fields.push(new Field(this.elements.form, fields[i]));
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

      this.elements.form.addEventListener('test', function(e) {
        var index = _this.errors.indexOf(e.detail.name);

        if (e.detail.isValid) {
          if (index > -1) _this.errors.splice(index, 1);
        } else {
          if (index === -1) _this.errors.push(e.detail.name);
        }

        if (_this.errors.length === 0)
          _this.enableSubmit();
        else
          _this.disableSubmit();
      });
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
      this.elements.submit.removeAttribute('disabled');
    },
    disableSubmit: function() {
      this.elements.submit.setAttribute('disabled');
    },
    testOne: function(field) {
      field.test();
    },
    testAll: function() {

    }
  };

  var Field = function(form, element) {
    this.elements = {
      form: form,
      field: element
    };

    this.options = {
      wrapperClass: this.elements.field.getAttribute('data-wrapper-class') || '',
      rules: JSON.parse(this.elements.field.getAttribute('data-rules')) || {}
    };

    this.name = this.elements.field.getAttribute('name');

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
      return this.errors.length === 0;
    },
    test: function() {
      var value = this.elements.field.value;

      var validations = {
        required: function(requirement) {
          return value !== '' && value !== undefined && value !== null ? true : false;
        }
      };

      var error;

      for (error in this.options.rules) {
        var index = this.errors.indexOf(error);

        if (validations[error](this.options.rules[error])) {
          if (index > -1) this.removeError(error);
        } else {
          if (index === -1) this.addError(error);
        }
      }

      this.trigger('test', {name: this.name, isValid: this.errors.length === 0});
    },
    removeError: function(error) {
      var index = this.errors.indexOf(error);
      this.errors.splice(index, 1);

      // if (this.errors.length === 0)
      //   this.elements.message.display = 'none';
      // else
      //   this.elements.message.display = 'block';
    },
    addError: function(error) {
      var index = this.errors.indexOf(error);
      this.errors.push(error);

      // this.elements.message.display = 'block';
    },
    trigger: function(name, data) {
      if (!data) data = {}

      if (window.CustomEvent) {
        var event = new CustomEvent(name, {detail: data});
      } else {
        var event = document.createEvent('CustomEvent');
        event.initCustomEvent(name, true, true, data);
      }

      this.elements.form.dispatchEvent(event);
    }
  };

  return Form;
}));
