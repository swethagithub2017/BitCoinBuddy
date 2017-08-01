const LCHART = document.getElementById("lineChart");
const MCHART = document.getElementById("mixedChart");

var bitcoinData= [];
var myBitcoinData= [700, 900, 1000, 500, 700, 600, 800];
//var myBitcoinData= [];
//var dateLabels= ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov','Dec'];
var dateLabels=[];
//var profitLossData = [-200, -100, 330, 200];
var profitLossData = [];
var JSONbitcoinData = JSON.stringify(bitcoinData);
   localStorage.setItem('bitcoinData',JSONbitcoinData)

var fromLocal = JSON.parse(localStorage['bitcoinData']);
//console.log(bitcoinData);


// CoinDesk API ================================================================

//var rangePrice = [];
var start = '2017-06-01';
var end = '2017-06-30';

var queryUrl = "http://api.coindesk.com/v1/bpi/historical/close.json?start="+start+"&end="+end;

$.ajax({
      url: queryUrl,
      method: "GET"
    }).done(function(body) {

    var JSONObject = JSON.parse(body);
    var historicalPrice = JSONObject["bpi"]; 
    
    for (key in historicalPrice) {
      if (historicalPrice.hasOwnProperty(key)) {
          dateLabels.push(key); 
          bitcoinData.push(historicalPrice[key]);
        }
    }
    console.log(bitcoinData);
    console.log(dateLabels);
    //console.log(rangePrice);
});

    
  



// request(queryUrl, function(error, response, body) {

// var JSONObject = JSON.parse(body);
// var historicalPrice = JSONObject["bpi"];

//   for (key in historicalPrice) {
//       if (historicalPrice.hasOwnProperty(key)) {
//       dateLabels.push(key); 
//     rangePrice.push(historicalPrice[key]);
//       }
//   }
  
//     //console.log(dateLabels);
//     console.log(rangePrice);
// });








var lineChart = new Chart(LCHART, {
  type: 'bar',

  data: {
    datasets: [{
          label: 'BitCoin Price',  
          type: 'line',
          borderColor: 'blue',
          backgroundColor: 'blue',
          fill: false,
          data: bitcoinData

        }

        // {


        //   label: 'Profit and Loss',
        //   borderColor: 'green',
        //   backgroundColor: 'green',
        //   borderWidth: 2,
        //   data: profitLossData
        // }, 
        // {

        //   label: 'My BitCoin',
        //   type: 'line',
        //   borderColor: 'red',
        //   backgroundColor: 'red',
        //   fill: false,
        //   borderWidth: 2,
        //   data: myBitcoinData


        // }
        ],
    labels: dateLabels
  },

});

//-----------

var mixedChart = new Chart(MCHART, {
  type: 'line',

  data: {
    datasets: [{
          label: 'BitCoin Price',  
          type: 'line',
          borderColor: 'blue',
          fill: false,
          data: bitcoinData

        } 

        // {
        //   // label: 'My BitCoin',
        //   // borderColor: 'green',
        //   // backgroundColor: 'green',
        //   // fill: false,
        //   // borderWidth: 2,
        //   // data: myBitcoinData

        // }
        ],
    labels: dateLabels
  },

});
    