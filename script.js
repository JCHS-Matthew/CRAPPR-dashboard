let players = {
  Andrew: {mean: 14.913, sd: 1.485, change: -3}, 
  Ben: {mean: 23.429, sd: 0.941, change: -2}, 
  Chloe: {mean: 10.489, sd: 1.745, change: -4}, 
  Gustavo: {mean: 24.299, sd: 1.007, change: -1}, 
  Isabel: {mean: 14.606, sd: 1.105, change: 0}, 
  Jeff: {mean: 21.903, sd: 1.687, change: 0}, 
  Jessica: {mean: 17.955, sd: 3.797, change: 'NR'}, 
  Laury: {mean: 19.311, sd: 2.144, change: 3}, 
  Lena: {mean: 26.283, sd: 3.557, change: 'NR'}, 
  Mark: {mean: 26.303, sd: 1.448, change: 7}, 
  Matt: {mean: 22.342, sd: 0.915, change: -1}, 
  Neil: {mean: 16.518, sd: 1.36, change: -4}, 
  Peter: {mean: 24.039, sd: 1.037, change: 0}, 
  Sherry: {mean: 17.8, sd: 0.972, change: -3}, 
  Steve: {mean: 16.299, sd: 1.111, change: 0}, 
}

let skill_array = []

$(document).ready(function () {
  Object.keys(players).forEach(function (player, idx) {
    $('#player1').append(`<option value="${player}">${player}</option>`)
    $('#player2').append(`<option value="${player}">${player}</option>`)
    $('#player3').append(`<option value="${player}">${player}</option>`)
    $('#player4').append(`<option value="${player}">${player}</option>`)
    player_data = players[player]
    skill_array.push([player, player_data.mean - 3*player_data.sd, player_data.change, player_data.mean, player_data.sd])
  })

  skill_array
    .sort(function (a, b) {
      return b[1] - a[1]
    })
    .forEach(function (player, idx) {  
      // Leaderboard
      var table = $('#leaderboard > tbody')
      var new_row = table.append('<tr>')
      new_row.append(`<th scope="row">${idx+1}</th><td>${player[0]}</td><td>${player[1].toFixed(1)}</td>`)
      var change_indicator = ""
      if (player[2] != undefined & player[2] != 0 & player[2] != 'NR') {
        if (player[2] > 0) {change_indicator += '<span data-feather="arrow-up" style="color: green;"></span>'}
        if (player[2] < 0) {change_indicator += '<span data-feather="arrow-down" style="color: red;"></span>'}
        change_indicator += Math.abs(player[2])
      } else if (player[2] == 'NR') {
        change_indicator = 'NR'
      } else {
        change_indicator = '-'
      }
      new_row.append(`<td>${change_indicator}</td>`)
      table.append('</tr>')
    })

  createChart1()

  feather.replace()

}) // end document.ready

$('#input_teams').change(function (e){
  let p1 = players[$('#player1').val()]
  let p2 = players[$('#player2').val()]
  let p3 = players[$('#player3').val()]
  let p4 = players[$('#player4').val()]

  let skill_diff = (p1.mean + p2.mean) - (p3.mean + p4.mean)
  let game_denom = Math.sqrt(4*(25/6)**2 + (p1.sd**2 + p2.sd**2 + p3.sd**2 + p4.sd**2))
  let predict = (1 - math.erf((0 - (skill_diff/game_denom) ) / Math.sqrt(2) )) / 2

  $('#predict').html((100*predict).toFixed(1)+'%')

})

$('#btn_random_matchup').click(function () {
  let player_names = skill_array.map(function (x) {
    return x[0]
  })
  
  $('#input_teams').find('select').each(function (idx, player_select) {
    let randomIndex = Math.floor(Math.random()*player_names.length)
    let randomPlayer = player_names.splice(randomIndex, 1)[0]
    $(`#${player_select.id} option[value="${randomPlayer}"]`).attr('selected', true)
  })
  
  $('#input_teams').trigger('change')
  
})


function createChart1 () {
  let player_names = []
  let player_range = []
  let player_mean = []

  skill_array.forEach(function (player) {
    player_names.push(player[0])
    player_range.push([player[3] - 3*player[4], player[3] + 3*player[4]])
    player_mean.push(player[3])
  })
  Highcharts.chart('chart1', {

    chart: {
      type: 'columnrange'
    },

    title: {
      text: null // 'Estimate Range'
    },

    subtitle: {
      text: null // 'Official CRAPPR score is the lower bound'
    },

    xAxis: {
      categories: player_names
    },

    yAxis: {
      title: {
        text: 'CRAPPR'
      }
    },

    tooltip: {
      valueDecimals: 1,
      backgroundColor: '#efefef',
      formatter: function () {
        let tooltip_text = ''
        let low = this.point.low
        let high = this.point.high
        let mean = (high + low) / 2
        let range = high - low
        tooltip_text += `<b>${this.key}</b><br>`
        tooltip_text += `Mean: ${mean.toFixed(1)}<br>`
        tooltip_text += `99% CI: ${low.toFixed(1)}`
        tooltip_text += ` - ${high.toFixed(1)}<br>`
        tooltip_text += `Range: ${range.toFixed(1)}`

        return tooltip_text
      }
    },

    plotOptions: {
      series: {
        enableMouseTracking: false
      },
      columnrange: {
        dataLabels: {
          enabled: true,
          format: '{y:.1f}'
        }
      }
    },

    legend: {
      enabled: true
    },

    series: [
      {
        name: '99% Confidence Interval',
        data: player_range,
        //color: '#17a2b8',
        enableMouseTracking: true
      },
      {
        name: 'Estimate Mean',
        data: player_mean,
        type: 'scatter',
        //color: '#444',
        enableMouseTracking: false
      }
    ]

  }) // end chart1

}
