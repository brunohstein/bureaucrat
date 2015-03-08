var BureaucratMessages = {
  required:       function(requirement) { return 'não pode ficar em branco'; },
  minLength:      function(requirement) { return 'não pode conter menos do que ' + requirement + ' caracteres'; },
  maxLength:      function(requirement) { return 'não pode conter mais do que ' + requirement + ' caracteres'; },
  greater:        function(requirement) { return 'não pode ser menor do que ' + requirement; },
  greaterOrEqual: function(requirement) { return 'não pode ser menor do que ' + (requirement - 1); },
  lower:          function(requirement) { return 'não pode ser maior do que ' + requirement; },
  lowerOrEqual:   function(requirement) { return 'não pode ser maior do que ' + (requirement + 1); },
  equalField:     function(requirement) { return 'dados não conferem'; },
  pattern:        function(requirement) { switch (requirement) {
    case 'fullName': return "não é um nome válido"; break;
    case 'email':    return "não é um email válido"; break;
    case 'number':   return "não é um número válido"; break;
    case 'zipcode':  return "não é um CEP válido"; break;
    case 'cpf':      return "não é um CPF válido"; break;
    case 'cnpj':     return "não é um CNPJ válido"; break;
    case 'url':      return "não é uma URL válida"; break;
    case 'date':     return "não é uma data válida"; break;
  }}
}
