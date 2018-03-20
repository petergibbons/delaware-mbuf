// current federal gas tax in dollars per gallon //
var currentfederalgastax = 0.284; // $0.184

// current state gas tax in dollars per gallon //
var state_prices = new Array();
  state_prices["select"] = 0;
  state_prices["colorado"] = 0.445;

// state road use charge in dollars per mile //
var state_RCprices = new Array();
  state_RCprices["select"]=0;
  state_RCprices["colorado"]=0.012;


$(window).load(function () {
  $('#state').val('colorado');
  $('.state-field').hide();
  calculateTotal();

  var de_calc = $('.de-calc');
  de_calc.hide();

 // $(".show-calc").click(function(){
      de_calc.show();
    //var link = $(this).attr('href');
 //   var posi = de_calc.offset().top+25;
   // $('body,html').animate({scrollTop:posi},700);
   $(".show-calc").hide();
 // });
});



$( document ).ready(function() {

// simulate click

  setTimeout(function() {
    $(".show-calc").trigger( "click" );
  },10);

// get vehicle's MPG from fueleconomy.gov
   function getVehicle() {

      var id = $( "#mnuOptions" ).val();
      //var myurl = "";
      //var vehdesc = "";
      //var fuelprice = 0.0;

        $.ajax({ 
        url: 'https://www.fueleconomy.gov/ws/rest/vehicle/'+id, 
          async: false, 
          dataType: 'json',
          success: function (veh) {

            $("#fempgresult").html("");

              $("#fempgresult").append("<div class='model'>"+veh.year+" "+veh.make+" "+veh.model+"</div>");
              $("#fempgresult").append("<div class='specs'>"+veh.fuelType1+"</div>");
              $("#fempgresult").append("<div class='fueleconomy'>");
                $(".fueleconomy").append("<div class='fueleconomy-header'>EPA Fuel Economy</div>");
                var html ="<table class='results1'>";
                html+="<col style='width: 50%'>";
                html+="<col style='width: 25%'>";
                html+="<col style='width: 25%'>";

                var combstr = "MPG";
                if (veh.fuelType=='Electricity') {
                  combstr+="e";
                }
                html+="<tr>";
                  html+="<td rowspan='2' class='combined'><span class='context'>Combined "+combstr+"</span><div class='combMPGresult'>"+veh.comb08+"</div></td>";
                  html+="<td colspan='2' class='unitsLabel'>"+combstr+"</td>";

                html+="</tr>";

                html+="<tr>";
                  html+="<td class='ctyhwy'>"+veh.city08+"</td>";
                  html+="<td class='ctyhwy'>"+veh.highway08+"</td>";
                html+="</tr>";

                html+="<tr>";
                  html+="<td class='rating-type text-center'>combined</td>";
                  html+="<td class='rating-type'>city</td>";
                  html+="<td class='rating-type'>hwy</td>";
                html+="</tr>";

                html+="</table>";
                
                $(html).appendTo(".fueleconomy");
              $("#fempgresult").append("</div>"); // closes the fueleconomy div
          }
      });
    }

      fillYears();

      $('#mnuYear').change(function() {
        chgYears ();
        calculateTotal();
      });

      $('#mnuMake').change(function() {
        chgMake();
        calculateTotal();
      });

      $('#mnuModel').change(function() {
        chgModel();
      });

      $("#mnuOptions").change(function() {
          getVehicle();
          calculateTotal();
          $('#fempgresult').show();
      });

// fill years in select dropdown for years greater than 1984
    function fillYears () {
      $.getJSON('https://www.fueleconomy.gov/ws/rest/vehicle/menu/year', function (data) {
        var mylen = data.menuItem.length;
       // $('#mnuYear').append($('<option>--Select Year--</option>'
        for(var i=0;i < mylen;i++) {
          $('#mnuYear').append($('<option>', { 
            value: data.menuItem[i].value,
            text :data.menuItem[i].text
          }));
        }
      });
    }

    function  chgYears () {
      var myyear = $( "#mnuYear option:selected" ).text();

      if ($( "#mnuYear option:selected" ).text() == "Select Year") {
        $('#mnuMake option').remove();
        $('#mnuMake').append($('<option>', { 
          value: '',
          text :'Select Make'
        }));
        $('#mnuMake').prop("disabled", true);
        $('#mnuModel').prop("disabled", true);
        $('#mnuOptions').prop("disabled", true);
      } else {
        fillMakes(myyear);

        $('#mnuModel option').remove();
        $('#mnuModel').append($('<option>', { 
          value: '',
          text :'Select Model'
        }));

        $('#mnuOptions option').remove();
        $('#mnuOptions').append($('<option>', { 
          value: '',
          text :'Select Option'
        }));

        $('#mnuMake').prop("disabled", false);
        $('#mnuModel').prop("disabled", true);
        $('#mnuOptions').prop("disabled", true);
        $('#fempgresult').hide();
      }
    }

// fill makes in select dropdown for years greater than 1984
    function fillMakes (year) {
      if (new Number(year) > 1984) {
        var mySelect = document.getElementById('mnuMake');
        mySelect.options.length = 0;
        mySelect.options[0] = new Option ("Select Make", "");
        mySelect.options[0].selected="true";

        $.getJSON('https://www.fueleconomy.gov/ws/rest/vehicle/menu/make?year='+year, function (data) {

          var mylen = data.menuItem.length;
          for(var i=0;i < mylen;i++) {

            $('#mnuMake').append($('<option>', { 
              value: data.menuItem[i].value,
              text :data.menuItem[i].text
            }));
          }
        });
      } 
    }
    
    function chgMake () {
      var myyear = $( "#mnuYear option:selected" ).text();
      var mymake = $( "#mnuMake option:selected" ).text();

      $('#mnuModel').prop("disabled", false);
      $('#mnuOptions').prop("disabled", true);

      calculateTotal();

      fillModels(myyear,mymake);
    } 

    function fillModels (year,make) {

      var mySelect = document.getElementById('mnuModel');
      mySelect.options.length = 0;
      mySelect.options[0] = new Option ("Select Model", "");
      mySelect.options[0].selected="true";
      var count=0;
      var mymodel = "";
      var myurl = "https://www.fueleconomy.gov/ws/rest/vehicle/menu/model?year="+year+'&make='+make;
      $.ajax({
        type: "GET",
        url: myurl,
        async: false, 
        dataType: "xml",
        success: function(xml) {
          $(xml).find('menuItem').each(function(){
            count=count+1;
            mymodel= $(this).find('value').text();
          });
          if (count<2){
            $('#mnuModel option').remove();
            fillOptions(year,make, mymodel);
            $('#mnuOptions').prop("disabled", false);
          } 

          $(xml).find('menuItem').each(function(){
            var myvalue = $(this).find('value').text();
            var mytext = $(this).find('text').text();
            $('#mnuModel').append($('<option>', { 
              value: myvalue,
              text : mytext
            }));
          });

        }
      });
    }

    function chgModel () {
      var myyear = $( "#mnuYear option:selected" ).text();
      var mymake = $( "#mnuMake option:selected" ).text();
      var mymodel = $( "#mnuModel option:selected" ).text();

      fillOptions(myyear,mymake, mymodel);
      $('#mnuOptions').prop("disabled", false);
      calculateTotal();
      //$('#fempgresult').hide();
    }

    function fillOptions (year,make,model) {
      
      var mySelect = document.getElementById('mnuOptions');
      mySelect.options.length = 0;
      mySelect.options[0] = new Option ("Select Option", "");
      mySelect.options[0].selected="true";

      var myurl = "https://www.fueleconomy.gov/ws/rest/vehicle/menu/options?year="+year+"&make="+make+"&model="+model; 
      var count = 0;

      $.ajax({
        type: "GET",
        url: myurl,
        async: false,
        dataType: "xml",
        success: function(xml) {
          $(xml).find('menuItem').each(function(){
            count=count+1;
          });

          $(xml).find('menuItem').each(function(){
            var myvalue = $(this).find('value').text();
            var mytext = $(this).find('text').text();
            $('#mnuOptions').append($('<option>', { 
              value: myvalue,
              text : mytext
            }));
          });

        }
      });
    }

});

// Get form
var calc_form = $("#de-calc-form"); // Getting form information using jquery for use in functions
var the_calc_Form = document.forms["de-calc-form"]; // Getting form information for array constructor

// function for retrieving value for selected state
function getStatePrice() {
    var incomeStatePrice=0;
    var selectedState = the_calc_Form.elements["state"];
    incomeStatePrice = state_prices[selectedState.value];
    return incomeStatePrice;
}

function getStateRCPrice() {
    var incomeStateRCPrice=0;
    var selectedState = the_calc_Form.elements["state"];
    incomeStateRCPrice = state_RCprices[selectedState.value];
    return incomeStateRCPrice;
}

function getMiles() {
    var val_input_miles=0;
    val_input_miles = $(".value-miles").val();
    return val_input_miles;
}

function getPercentDriven() {
    var val_percent=0;
    val_percent = $("#percent-outside").val();
    return val_percent;
}

function getMPG() {
    var val_input_mpg=0;
if ($("#radio_1").is(":checked")) {
        val_input_mpg = $(".value-mpg").val();
} else if ($("#radio_2").is(":checked")) {
  val_input_mpg = $(".combMPGresult").text();
}
getMPGtype();
    return val_input_mpg;
}

function getMPGtype() {
    var val_mpg_type=0;
if ($("#radio_2").is(":checked")) {
    val_mpg_type = $(".unitsLabel").text();
}
    return val_mpg_type;
}

function validateForm() {

  // Configure the validator globally. Requires jquery.validate
  // Validate form, add custom error message
  calc_form.validate({
      debug: true,
      success: "valid",
      //validation rules
          messages: {
              "miles": {
                  required: "You must your how many miles you drive per month",
                  min: "Invalid. Enter number of miles between 1 and 50,000",
                  max: "Invalid. Enter number of miles between 1 and 50,000"
              },
              "mpg": {
                  required: "You must your vehicle's MPG",
                  min: "Invalid. Enter MPG between 1 and 300",
                  max: "Invalid. Enter MPG between 1 and 300"
              }
          }
      });
}


// perform calculation
function calculateTotal() {

  validateForm();

  // calculate monthly Gal by monthly miles driven by avg. MPG 
  var GalPerMonth = getMiles() / getMPG();

  var RCperMilesresult=0;


  var gasPrice = GalPerMonth * getStatePrice();
  RCperMilesresult = getStateRCPrice();
  var RCgasPrice = getMiles() * RCperMilesresult;
  var statewcountytablename = "State";

  // calculate Federal Gas Tax
  var federalgastax = GalPerMonth * currentfederalgastax;
  var totalgaswfed = federalgastax + gasPrice;
  var totalRCwfed = federalgastax + RCgasPrice;
  var rcvsgasresult=0;
  var rcvsgasresultdiff=0;

  if (RCgasPrice == gasPrice || roundclean(RCgasPrice,4) == roundclean(gasPrice,4) ) {
    rcvsgasresult = "equal to";
    rcvsgasresultdiff=' ';
  } else if (RCgasPrice > gasPrice) {
    rcvsgasresult = "more than";
    rcvsgasresultdiff=RCgasPrice - gasPrice;
    rcvsgasresultdiff=' $'+roundclean(rcvsgasresultdiff,2);
  } else if (RCgasPrice < gasPrice) {
    rcvsgasresult = "less than";
    rcvsgasresultdiff=gasPrice - RCgasPrice;
    rcvsgasresultdiff=' $'+roundclean(rcvsgasresultdiff,2);
  }

  var gasPricechecktype=0;
  var gasPricechecktypeFed=0;
  var gasPricechecktypeFedTotal=0;
  var RCgasPricechecktypeFedTotal=0;
  if ( getMPGtype() == 'MPGe') {
    gasPrice=0;
    gasPricechecktype = 'Fully-electric vehicle';
    gasPricechecktypeFed = 'Fully-electric vehicle';
    gasPricechecktypeFedTotal = 'Fully-electric vehicle';
    RCgasPricechecktypeFedTotal = ' $'+roundclean(RCgasPrice,2);
    rcvsgasresult = "more than";
    rcvsgasresultdiff=' $'+roundclean(RCgasPrice,2);
  } else {
    gasPricechecktype = ' $'+roundclean(gasPrice,2);
    gasPricechecktypeFed = ' $'+roundclean(federalgastax,2);
    gasPricechecktypeFedTotal = ' $'+roundclean(totalgaswfed,2);
    RCgasPricechecktypeFedTotal = ' $'+roundclean(totalRCwfed,2);
  }

  // create results for optional EVtoggle
  var rcvsgasresult_EVtoggle=0;
  var rcvsgasresultdiff_EVtoggle=0;
  var gasPrice_EVtoggle=0;
  var isEVfee='';

  if (RCgasPrice > gasPrice_EVtoggle) {
    rcvsgasresult_EVtoggle = "more than";
    rcvsgasresultdiff_EVtoggle=RCgasPrice - gasPrice_EVtoggle;
    rcvsgasresultdiff_EVtoggle=' $'+roundclean(rcvsgasresultdiff_EVtoggle,2);
    gasPrice_EVtoggle = ' $'+roundclean(gasPrice_EVtoggle,2)+''+isEVfee;
  } else if (RCgasPrice == gasPrice_EVtoggle) {
    rcvsgasresult_EVtoggle = "equal to";
    rcvsgasresultdiff_EVtoggle=' ';
    gasPrice_EVtoggle = ' $'+roundclean(gasPrice_EVtoggle,2)+''+isEVfee;
  } else if (RCgasPrice < gasPrice_EVtoggle) {
    rcvsgasresult_EVtoggle = "less than";
    rcvsgasresultdiff_EVtoggle=gasPrice_EVtoggle - RCgasPrice;
    rcvsgasresultdiff_EVtoggle=' $'+roundclean(rcvsgasresultdiff_EVtoggle,2);
    gasPrice_EVtoggle = ' $'+roundclean(gasPrice_EVtoggle,2)+''+isEVfee;
  }

  if( getMiles() == 0 || getMPG() == 0 || getStatePrice() == 0 || calc_form.valid() == 0) {
    hideTotal();
  } else if (calc_form.valid() == 0) {
    hideTotal();
  } else {



      // state taxes
        var carMPG = getMPG(); //b7
        var percentOutside = getPercentDriven(); //b5
        var milesDrivenPerMonth = getMiles();  //b3

        var percentOutsideMinusOne = percentOutside-1;
        var milesPercent = milesDrivenPerMonth*percentOutside; //b3*b5
        var milesPercentMinusOne = milesDrivenPerMonth*percentOutsideMinusOne;
        
        var stateGasTax1 = (milesPercent/carMPG)*0.4675;
        var stateGasTax2 = (milesPercentMinusOne/carMPG)*0.23;
        var stateGasTotal = stateGasTax2 + stateGasTax1;

        //var stateGasTotalDisplay = parseFloat(stateGasTotal);

        var stateGasTotal = stateGasTotal *= -1; // convert to positive

        /*=(((B3*B5)/B7)*0.4675)+(((B3*(1-B5))/B7)*0.23)
        //=((($1*$2)/$3)*0.4675)+((($1*(1-$2))/$3)*0.23)

     */

        //  console.log("percentOutside: " + percentOutside);
        //  console.log("MPM: " + milesDrivenPerMonth);
        //  console.log("MPG: " + carMPG);
          var stateGasTax = stateGasTotal;
          console.log("State Gas total: " + stateGasTax.toFixed(2));
        
     




    // MBUF

   //   =(B3*B5*0.0213)+(B3*(1-B5)*0.0105)
        mbuf1 = (milesPercent/carMPG) * 0.0213;
        mbuf2 = milesPercentMinusOne*0.0105;
        mbufTotal = mbuf1+mbuf2;

        var MBUFTAX = mbufTotal;

       // var MBUFTAX = MBUFTAX *= -1; // convert to positive
          console.log("MBUF total: " + MBUFTAX.toFixed(2));
          console.log("- - - - - - - - - - - - - - - - - - - - - -")



    $('#totalPrice').html("<div class='table-responsive-js'><table class='table table-striped table-bordered table-hover'><tr><th>Gas Tax</th><th>MBUF</th><tr><tr><td>"+stateGasTax.toFixed(2)+"</td><td>$"+MBUFTAX.toFixed(2)+"</td></tr></tbody></table></div>");



    if (getMPGtype() != 'MPGe'){
      $('#totalPriceEVtoggle').html('<a role="button" data-toggle="collapse" href="#EVcollapse" aria-expanded="false" aria-controls="EVcollapse">Compare to a Fully-electric vehicle</a>');
      $('#totalPriceEVcompare').html("<h4><strong>How Much A Fully-Electric Vehicle Would Pay:</strong></h4><div class='table-responsive-js'><table class='table table-striped table-bordered table-hover'><tr><th></th><th>Gas Tax</th><th>MBUF</th><tr><tr><th>"+statewcountytablename+"</th><td>"+gasPrice_EVtoggle+"</td><td>$"+roundclean(RCgasPrice,2)+"</td></tr></tbody></table></div>");

    }
  }
}

function IsPostiveInteger(n) {
  var n = new Number(n);
  return !isNaN(n) && n===parseInt(n,10) && n>0;
} 

function hideTotal() {
    $('#totalPrice').html("<div class='table-responsive-js'><table class='table table-striped table-bordered table-hover'><tbody><tr><td colspan='3'><h4>Please enter your selection for Location, Mileage, and your vehicle's MPG in order to see your results.</h4></td></tr></tbody></table></div>");
    $('#totalPriceEVtoggle').html('');
    $('#totalPriceEVcompare').html('');
}

function roundclean(e, t) {
    var val_clean = Number(Math.round(e + "e" + t) + "e-" + t);
    return val_clean.toFixed(2);
}

function rctaxroundclean(e, t) {
    var val_clean = Number(Math.round(e + "e" + t) + "e-" + t);
    return val_clean.toFixed(4);
}

function formatNumber (num) {
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
}

// toggle to #radio_2 for MPG lookup
function toggleMpgTypeRadio(){
  $( "#radio_2" ).click();
}

// toggle to lookup vehicle's MPG using fuel economy API
function toggleMpgType(){
    $("#radio_1, #radio_2").change(function () {
        if ($("#radio_1").is(":checked")) {
            $('#combMpgRow').show();
            $('#cityMpgRow').hide();
            calculateTotal();
        }
        else if ($("#radio_2").is(":checked")) {
            $('#cityMpgRow').show();
            $('#combMpgRow').hide();
            calculateTotal();
        }
    });   
}