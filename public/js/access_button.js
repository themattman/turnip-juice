$('.btn.btn-success').click(function(){
  console.log('suc');
  $.post('/start', { password: $('#password').val() });
});

$('.btn.btn-danger').click(function(){
  console.log('dan');
  $.post('/stop', { password: $('#password').val() });
});