/*
  Written by Bruno Henrique Stein
  http://github.com/brunohstein/bureaucrat
*/

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

    this.messages = BureaucratMessages;
    this.fields = [];
    this.errors = [];

    this.options = {
      wrapperClass: this.elements.form.getAttribute('data-wrapper-class') || '',
      messageClass: this.elements.form.getAttribute('data-message-class') || '',
      errorClass: this.elements.form.getAttribute('data-error-class') || '',
      trigger: this.elements.form.getAttribute('data-trigger') || 'submit'
    };

    this.elements.submit = this.elements.form.querySelector('[type="submit"]');

    this.init();
  };

  Form.prototype = {
    init: function() {
      var _this = this;
      var fields = this.elements.form.querySelectorAll('[name]');

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

              _this.testOne(_this.findField(e.target.getAttribute('name')));
            });

            _this.fields[i].elements.field.addEventListener('change', function(e) {
              _this.testOne(_this.findField(e.target.getAttribute('name')));
            });
          }

          _this.elements.form.addEventListener('test', function() {
            _this.setSubmit();
          });
        }
      };

      triggers[this.options.trigger]();
    },
    findField: function(name) {
      var field;

      this.fields.some(function(object) {
        if (object.name === name) field = object;
      });

      return field;
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
      rules: JSON.parse(this.elements.field.getAttribute('data-rules')) || {},
      validKeys: this.elements.field.getAttribute('data-valid-keys') || false,
      startError: this.elements.field.getAttribute('data-start-error') || false
    };

    this.name = this.elements.field.getAttribute('name');

    this.errors = [];

    this.init();
  };

  Field.prototype = {
    init: function() {
      var _this = this;
      var wrappedContent;

      this.elements.field.parentNode.tagName === 'LABEL' ? wrappedContent = this.elements.field.parentNode : wrappedContent = this.elements.field;
      this.elements.wrapper = document.createElement('div');
      this.elements.wrapper.appendChild(wrappedContent.parentNode.replaceChild(this.elements.wrapper, wrappedContent));
      this.elements.wrapper.className = this.options.wrapperClass + ' ' + this.form.options.wrapperClass;

      this.elements.message = document.createElement('div');
      this.elements.message.style.display = 'none';
      this.elements.message.className = this.form.options.messageClass;

      this.elements.wrapper.appendChild(this.elements.message);

      this.elements.field.addEventListener('keydown', function(e) {
        if (!_this.isValidKey(e)) e.preventDefault();
      });

      if (this.options.rules.required) {
        this.errors.push('required');
        this.trigger('test', {name: this.name, isValid: false});
      }

      if (this.options.startError) {
        this.errors.push('custom');
        this.feedback(this.options.startError);
        this.trigger('test', {name: this.name, isValid: false});
      }
    },
    isValidKey: function(e) {
      var freeKeys = [8, 9, 13, 16, 17, 18, 19, 20, 27, 33, 34, 35, 36, 37, 38, 39, 40, 45, 46, 91, 92, 144, 145];

      if (!this.options.validKeys) return true;
      if (e.metaKey) return true;
      if (freeKeys.indexOf(e.keyCode) > -1) return true;

      switch (this.options.validKeys) {
        case 'numbers':
          return (!e.shiftKey && ((e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 96 && e.keyCode <= 105))) ? true : false;
          break;
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
          if (_this.elements.field.type && (_this.elements.field.type === 'checkbox' || _this.elements.field.type === 'radio')) {
            var isFilled = false;
            var fields = _this.form.elements.form.querySelectorAll('[name="' + _this.name + '"]');

            for (var i = 0; i < fields.length; i++) {
              if (fields[i].checked) isFilled = true;
            }

            return isFilled;
          } else {
            return value !== '' && value !== undefined && value !== null ? true : false;
          }
        },
        minLength: function(requirement) {
          return value.length >= requirement ? true : false;
        },
        maxLength: function(requirement) {
          return value.length <= requirement ? true : false;
        },
        greater: function(requirement) {
          if (_this.elements.field.type && (_this.elements.field.type === 'date' || _this.elements.field.type === 'month')) {
            var requirement = requirement.split('-');
            requirement = new Date(requirement[0], requirement[1] - 1, requirement[2]);
            value = value.split('-');
            value = new Date(value[0], value[1] - 1, value[2]);
          }

          return value > requirement || value === '' ? true : false;
        },
        greaterOrEqual: function(requirement) {
          if (_this.elements.field.type && (_this.elements.field.type === 'date' || _this.elements.field.type === 'month')) {
            var requirement = requirement.split('-');
            requirement = new Date(requirement[0], requirement[1] - 1, requirement[2]);
            value = value.split('-');
            value = new Date(value[0], value[1] - 1, value[2]);
          }

          return value >= requirement || value === '' ? true : false;
        },
        lower: function(requirement) {
          if (_this.elements.field.type && (_this.elements.field.type === 'date' || _this.elements.field.type === 'month')) {
            var requirement = requirement.split('-');
            requirement = new Date(requirement[0], requirement[1] - 1, requirement[2]);
            value = value.split('-');
            value = new Date(value[0], value[1] - 1, value[2]);
          }

          return value < requirement || value === '' ? true : false;
        },
        lowerOrEqual: function(requirement) {
          if (_this.elements.field.type && (_this.elements.field.type === 'date' || _this.elements.field.type === 'month')) {
            var requirement = requirement.split('-');
            requirement = new Date(requirement[0], requirement[1] - 1, requirement[2]);
            value = value.split('-');
            value = new Date(value[0], value[1] - 1, value[2]);
          }

          return value <= requirement || value === '' ? true : false;
        },
        equalField: function(requirement) {
          var matchField = _this.elements.form.querySelector('[name=' + requirement + ']');
          return matchField.value === value ? true : false;
        },
        pattern: function(requirement) {
          var patterns = {
            fullName: function() {
              return /^[A-z]([-']?[A-z]+)*( [A-z]([-']?[A-z]+)*)+$/;
            },
            email: function() {
              return /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            },
            number: function() {
              return /^\d+$/;
            },
            zipcodeUS: function() {
              return /^\d{5}([\-]?\d{4})?$/;
            },
            zipcodeBR: function() {
              return /^[0-9]{5}-?[0-9]{3}$/;
            },
            cpf: function() {
              return /^\d{3}\.?\d{3}\.?\d{3}\-?\d{2}$/;
            },
            cnpj: function() {
              return /^\d{2}\.?\d{3}\.?\d{3}\/?\d{4}\-?\d{2}$/;
            },
            url: function() {
              return /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
            },
            date: function() {
              return /^[0-9]{4}\-[0-1]{1}[0-12]{1}\-[0-1]{1}[0-12]{1}/;
            }
          };

          return patterns[requirement]().test(value) || value === '' ? true : false;
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
    feedback: function(customError) {
      if (customError) {
        this.elements.message.innerHTML = customError;
        this.showMessage();
      } else {
        var customErrorIndex = this.errors.indexOf('custom');
        if (customErrorIndex > -1) this.errors.splice(customErrorIndex, 1);

        if (this.errors.length === 0) {
          this.hideMessage();
        } else {
          var error = this.errors[0];
          this.elements.message.innerHTML = this.getMessage(error);
          this.showMessage();
        }
      }
    },
    showMessage: function() {
      this.elements.message.style.display = 'block';
      if (this.elements.wrapper.classList)
        this.elements.wrapper.classList.add(this.form.options.errorClass);
      else
        this.elements.wrapper.className += ' ' + this.form.options.errorClass;
    },
    hideMessage: function() {
      this.elements.message.style.display = 'none';
      if (this.elements.wrapper.classList)
        this.elements.wrapper.classList.remove(this.form.options.errorClass);
      else
        this.elements.wrapper.className = this.elements.wrapper.className.replace(new RegExp('(^|\\b)' + this.form.options.errorClass.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
    },
    getMessage: function(error) {
      var message = (this.options.rules[error].length > 2 && this.options.rules[error].slice(0, -2) === 'zipcode') ? 'zipcode' : this.options.rules[error];

      return this.form.messages[error](message);
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
