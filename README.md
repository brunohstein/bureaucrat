### How to install

#### Using Bower

`bower install bureaucrat`

#### Other

Download and import `src/bureaucrat.js` and `src/bureaucrat-messages.your-language.js` to your HTML, before the `</body>` tag.

### How it works

Demo: http://brunohstein.github.io/bureaucrat/examples/index.html

Initiate Bureaucrat passing a `<form>` element to it as a parameter.

```
var form = document.querySelector('form');
var bureaucrat = new Bureaucrat(form);
```

The `<form>` element accepts the following options through `data-attributes`:

- `trigger` _string_ **(required)** defines when the fields will be tested:

    - `live` test the field while user are inputting data
    - `blur` test the field when the user leaves the field
    - `submit` test all fields when the user submit the form

    <small>Example: `<form data-trigger="blur"></form>`</small>

- `message-class` _string_ **(optional)** set the class of the error message element.

    <small>Example: `<form data-message-class="form__message"></form>`</small>

- `error-class` _string_ **(optional)** set the class of the wrapper of a field with error.

    <small>Example: `<form data-error-class="has-error"></form>`</small>

- `wrapper-class` _string_ **(optional)** set the class of all the wrappers.

    <small>Example: `<form data-wrapper-class="form__wrapper"></form>`</small>

Fields accept the following options through `data-attributes`:

- `rules` _json_ **(required)** defines the rules of the field:

    - `required` _boolean_
    - `maxLength` _number_
    - `minLength` _number_
    - `greater` _number_
    - `greaterOrEqual` _number_
    - `lower` _number_
    - `lowerOrEqual` _number_
    - `equalField` _string_
    - `pattern` _string_

    <small>Example: `<input type="text" name="url" data-rules='{ "required": "true", "minLength": "10", "pattern": "url" }'>`</small>

- `valid-keys` _string_ **(optional)** limit the type of input allowed.

    <small>Example: `<input type="text" name="age" data-valid-keys="numbers">`</small>

- `wrapper-class` _string_ **(optional)** add a class to the wrapper of this specific field.

    <small>Example: `<input type="text" name="birthday" data-wrapper-class="form__wrapper--small">`</small>
