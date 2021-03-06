$('#messages').hide(); // .show() the latest messages after they load
$('.btn').hide();

var palette = new Rickshaw.Color.Palette({"scheme": "spectrum2001"});
window.graph_data  = [];
window.leaderboard = [];

function sanitizeDataPoints(serverUpdate){
  if(!serverUpdate || serverUpdate.length < 1){
    setTimeout(function(){
      if($('#err_msg').length < 1){
        console.log('woops')
        $('#loader').hide();
        $('.btn').hide();
        var err_msg = document.createElement('div');
        err_msg.setAttribute('id', err_msg);
        err_msg.style.display = 'none';
        document.getElementById('chart_container').appendChild(err_msg);
        $(err_msg).text('Sorry, no graph data.');
        $(err_msg).css('margin-left', '360px');
        $(err_msg).css('margin-top', '90px');
        $(err_msg).show();
      }
    }, 1000);
  } else {
    for(var i in serverUpdate){
      var team = {};
      team.repoName   = serverUpdate[i].repoName;
      team.userName   = serverUpdate[i].userName;
      team.numCommits = serverUpdate[i].numCommits;

      window.graph_data.push(serverUpdate[i]);
      window.leaderboard.push(team);

      serverUpdate[i].name = serverUpdate[i].repoName;
      delete serverUpdate[i].repoName;
      delete serverUpdate[i].userName;
      delete serverUpdate[i].numCommits;
      delete serverUpdate[i]._id;
      serverUpdate[i].color = palette.color();
    }
    setTimeout(function(){
      $('#loader').hide();
      createGraph();
      $('.btn-group').show();
      $('.btn').show();
      $('.btn-group').css('display', 'inline-block');
    }, 1000);
  }
}

var socket = io.connect('/');
socket.on('connect', function(){
  console.log('on_connect');
});
socket.on('graph_load', function(load_data){
  console.log('on_graph_load');
  sanitizeDataPoints(load_data);
  updateLeaderboard(window.leaderboard, document.getElementById('leaders_tbody'));
});
socket.on('graph_update', function(delta){
  console.log('on_graph_update');
  delete window.graph_data;
  delete window.leaderboard;
  window.graph_data  = [];
  window.leaderboard = [];
  sanitizeDataPoints(delta);
  $('#leaders_tbody').empty();
  updateLeaderboard(window.leaderboard, document.getElementById('leaders_tbody'));
  $('.btn-group').show();
  $('.btn-group').css('display', 'inline-block');
});
socket.on('feed_update', function(commit){
  console.log('on_feed');
  updateFeed(commit);
});
socket.on('feed_load', function(commit){
  commit.splice(10, (commit.length-10));
  commit.reverse();
  for(var i in commit){
    updateFeed(commit[i]);
  }
  $('#messages').fadeIn('slow');
});

function updateFeed(commit){
  if(!commit){return;}
  var td0 = document.createElement('td');
  td0.innerHTML = commit.userName;
  var td1 = document.createElement('td');
  td1.innerHTML = commit.message;
  var new_row = document.createElement('tr');
  new_row.appendChild(td0);
  new_row.appendChild(td1);
  $('#messages_tbody').prepend(new_row);
  if($('#messages_tbody tr').length > 10){
    var num_trs = $('#messages_tbody tr').length-10;
    for(var i = 0; i < num_trs; i++){
      $('#messages_tbody tr:last-child').remove();
    }
  }
  $(td0).effect('highlight', {}, 1000);
  $(td1).effect('highlight', {}, 1000);
}

function updateLeaderboard(c, tbody_handle) {
  for(var i in c){
    var new_row = document.createElement('tr');
    var td0 = document.createElement('td');
    var td1 = document.createElement('td');
    var td2 = document.createElement('td');
    var td3 = document.createElement('td');
    td0.innerHTML = i;
    td1.innerHTML = c[i].repoName;
    td2.innerHTML = c[i].userName;
    td3.innerHTML = c[i].numCommits;
    new_row.appendChild(td0);
    new_row.appendChild(td1);
    new_row.appendChild(td2);
    new_row.appendChild(td3);
    tbody_handle.appendChild(new_row);
  }
  return tbody_handle;
}