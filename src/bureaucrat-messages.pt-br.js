var BureaucratMessages = {
  required: function() {
    return 'não pode ficar em branco';
  },
  minlength: function(requirement) {
    return 'não pode conter menos do que ' + requirement + ' caracteres';
  },
  maxlength: function(requirement) {
    return 'não pode conter mais do que ' + requirement + ' caracteres';
  },
  greater: function(requirement) {
    return 'não pode ser menor do que ' + requirement;
  },
  lower: function(requirement) {
    return 'não pode ser maior do que ' + requirement;
  },
  equalField: function(requirement) {
    return 'dados não conferem';
  }
}
