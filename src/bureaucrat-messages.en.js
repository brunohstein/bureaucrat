var BureaucratMessages = {
  required: function() {
    return 'can not be empty';
  },
  minLength: function(requirement) {
    return 'can not contain less than ' + requirement + ' characters';
  },
  maxLength: function(requirement) {
    return 'can not contain more than ' + requirement + ' characters';
  },
  greater: function(requirement) {
    return 'can not be lower than ' + requirement;
  },
  greaterOrEqual: function(requirement) {
    return 'can not be lower than ' + (requirement - 1);
  },
  lower: function(requirement) {
    return 'can not be greater than ' + requirement;
  },
  lowerOrEqual: function(requirement) {
    return 'can not be greater than ' + (requirement - 1);
  },
  equalField: function(requirement) {
    return 'fields do not match';
  },
  pattern: function(requirement) {
    switch (requirement) {
      case 'fullName':
        return "is not a valid name";
        break;
      case 'email':
        return "is not a valid email";
        break;
      case 'number':
        return "is not a valid number";
        break;
      case 'cep':
      case 'cepNumbers':
        return "is not a valid CEP";
        break;
      case 'cpf':
      case 'cpfNumbers':
        return "is not a valid CPF";
        break;
      case 'cnpj':
      case 'cnpjNumbers':
        return "is not a valid CNPJ";
        break;
      case 'url':
        return "is not a valid URL";
        break;
    }
  }
}
