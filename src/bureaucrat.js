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
    this.messages = BureaucratMessages;

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

      this.elements.form.addEventListener('test', function(e) {
        var index = _this.errors.indexOf(e.detail.name);

        if (e.detail.isValid) {
          if (index > -1) _this.errors.splice(index, 1);
        } else {
          if (index === -1) _this.errors.push(e.detail.name);
        }
      });

      for (var i = 0; i < fields.length; i++) {
        this.fields.push(new Field(this, fields[i]));
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
            _this.fields[i].elements.field.addEventListener('blur', function(e) {
              var field;

              _this.fields.some(function(object) {
                if (object.name === e.target.getAttribute('name')) field = object;
              });

              _this.testOne(field);
            });
          }

          _this.elements.form.addEventListener('test', function() {
            _this.setSubmit();
          });
        },
        live: function() {
          for (var i = 0; i < _this.fields.length; i++) {
            _this.fields[i].elements.field.addEventListener('keyup', function(e) {
              if (e.keyCode == 9) e.preventDefault();

              var field;

              _this.fields.some(function(object) {
                if (object.name === e.target.getAttribute('name')) field = object;
              });

              _this.testOne(field);
            });

            _this.fields[i].elements.field.addEventListener('change', function(e) {
              var field;

              _this.fields.some(function(object) {
                if (object.name === e.target.getAttribute('name')) field = object;
              });

              _this.testOne(field);
            });
          }

          _this.elements.form.addEventListener('test', function() {
            _this.setSubmit();
          });
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
    setSubmit: function() {
      if (this.errors.length === 0)
        this.elements.submit.removeAttribute('disabled');
      else
        this.elements.submit.setAttribute('disabled', true);
    },
    testOne: function(field) {
      field.test();
      field.feedback();
    },
    testAll: function() {
      for (var i = 0; i < this.fields.length; i++) {
        this.fields[i].test();
        this.fields[i].feedback();
      }
    },
    isValid: function() {
      var isValid = true;

      for (var i = 0; i < this.fields.length; i++) {
        isValid = this.fields[i].isValid();
      }

      return isValid;
    }
  };

  var Field = function(form, element) {
    this.form = form;

    this.elements = {
      form: this.form.elements.form,
      field: element
    };

    this.options = {
      wrapperClass: this.elements.field.getAttribute('data-wrapper-class') || '',
      messageClass: this.elements.field.getAttribute('data-message-class') || '',
      rules: JSON.parse(this.elements.field.getAttribute('data-rules')) || {}
    };

    this.name = this.elements.field.getAttribute('name');

    this.errors = [];

    this.init();
  };

  Field.prototype = {
    init: function() {
      this.elements.wrapper = document.createElement('div');
      this.elements.wrapper.appendChild(this.elements.field.parentNode.replaceChild(this.elements.wrapper, this.elements.field));
      this.elements.wrapper.className = this.options.wrapperClass;

      this.elements.message = document.createElement('div');
      this.elements.message.style.display = 'none';
      this.elements.message.className = this.options.messageClass;

      this.elements.wrapper.appendChild(this.elements.message);

      if (this.options.rules.required) {
        this.errors.push('required');
        this.trigger('test', {name: this.name, isValid: false});
      }
    },
    isValid: function() {
      this.test();
      return this.errors.length === 0;
    },
    test: function() {
      var _this = this;
      var value = this.elements.field.value;

      var validations = {
        required: function(requirement) {
          return value !== '' && value !== undefined && value !== null ? true : false;
        },
        minLength: function(requirement) {
          return value.length >= requirement ? true : false;
        },
        maxLength: function(requirement) {
          return value.length <= requirement ? true : false;
        },
        greater: function(requirement) {
          return value > requirement || value === '' ? true : false;
        },
        greaterOrEqual: function(requirement) {
          return value >= requirement || value === '' ? true : false;
        },
        lower: function(requirement) {
          return value < requirement || value === '' ? true : false;
        },
        lowerOrEqual: function(requirement) {
          return value <= requirement || value === '' ? true : false;
        },
        equalField: function(requirement) {
          var matchField = _this.elements.form.querySelector('[name=' + requirement + ']');
          return matchField.value === value ? true : false;
        },
        pattern: function(requirement) {
          var regex;

          switch (requirement) {
            case 'fullName':
              regex = /^[A-z]([-']?[A-z]+)*( [A-z]([-']?[A-z]+)*)+$/;
              break;
            case 'email':
              regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
              break;
            case 'number':
              regex = /^\d+$/;
              break;
            case 'cep':
              regex = /^[0-9]{5}-[0-9]{3}$/;
              break;
            case 'cepNumbers':
              regex = /^[0-9]{8}$/;
              break;
            case 'cpf':
              regex = /^\d{3}\.\d{3}\.\d{3}\-\d{2}$/;
              break;
            case 'cpfNumbers':
              regex = /^\d{11}$/;
              break;
            case 'cnpj':
              regex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$/;
              break;
            case 'cnpjNumbers':
              regex = /^\d{14}$/;
              break;
            case 'url':
              regex = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
              break;
          }

          return regex.test(value) || value === '' ? true : false;
        }
      };

      var error;

      for (error in this.options.rules) {
        var index = this.errors.indexOf(error);

        if (validations[error](this.options.rules[error])) {
          if (index > -1) this.errors.splice(index, 1);
        } else {
          if (index === -1) this.errors.push(error);;
        }
      }

      this.trigger('test', {name: this.name, isValid: this.errors.length === 0});
    },
    feedback: function() {
      if (this.errors.length === 0) {
        this.elements.message.style.display = 'none';
      } else {
        var error = this.errors[0];
        this.elements.message.innerHTML = this.getMessage(error);
        this.elements.message.style.display = 'block';
      }
    },
    getMessage: function(error) {
      return this.form.messages[error](this.options.rules[error]);
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
