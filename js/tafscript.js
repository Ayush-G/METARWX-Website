console.log("Running JS");
var getTAFbtn = document.getElementById("getTAF");
var getTAFLocbtn = document.getElementById("getTAFLoc");
var promise

getTAFbtn.addEventListener('click', function(event) {
    $('#tafResultBox').remove()
    var station = document.getElementById("tafStationID").value;
    getTAF(station);
})

getTAFLocbtn.addEventListener('click', function(event) {
    getLocation();

})

document.getElementById('tafStationID').onkeypress=function(e){
	if (e.keyCode == 13){
		document.getElementById('getTAF').click();
		document.getElementById('tafStationID').blur(); // To hide the software keyboard after user presses enter
	}
}


function onlineRequest(url, headers="") {
    var xmlhttp = new XMLHttpRequest();
    var userInformation = "";
    return new Promise(function(resolve, reject) {
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
               if (xmlhttp.status == 200) {
                   var Response = (xmlhttp.responseText);
                   resolve(Response);
               }
               else {
                addAlert("Unable to retrieve data.")
               }
            }

        };
        xmlhttp.open("GET", url, true);
        if (headers !== "") {
            xmlhttp.setRequestHeader(headers);
        };
        xmlhttp.send();
    });
};


function getTAF(params) {
    showLoading();
    url = "https://avwx.rest/api/taf/" + params + "?options=info,translate";
    console.log(url);
    onlineRequest(url).then(function(result) {
        result = JSON.parse(result);
        if (result["Raw-Report"] !== undefined) {
            var retrievedTAF = result["Raw-Report"];
            $("#tafMain").append(
              '<div id="airportTitle"></div>' +
              '<div id="airportInfo"></div>' +
              '<div id="RawTAF"></div>' +
              '<div id="demo"><strong></strong><br></div>'
            )
            if (result.Info["Name"].split(' ')[0] === result.Info["City"]){
              document.getElementById("airportTitle").innerHTML = result.Info["Name"];
            } else {
              document.getElementById("airportTitle").innerHTML = result.Info["City"] + " " + result.Info["Name"];

            }
            document.getElementById("airportInfo").innerHTML = "Location: " + result.Info["City"] + ", " + result.Info["State"] + ", " + result.Info["Country"] + "<br>" + "Elevation: " + Math.round(parseInt(result.Info["Elevation"])*3.28) + "ft";
            document.getElementById("RawTAF").innerHTML = retrievedTAF;
            document.getElementById("demo").innerHTML = "";
            //translateTAF(retrievedTAF);
            translateTAF(retrievedTAF);
            hideLoading();
        } else {
            addAlert("Invalid ICAO Code");
            $('#tafResultBox').remove();
        };
    }).catch(function(error) {
        addAlert(error);
    });

}

getLocation();

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        addAlert("Geolocation is not supported by this browser.");
    }
}
function showPosition(position) {
    getTAF(position.coords.latitude + "," + position.coords.longitude);
}


function showError(error) {
  $('#tafResultBox').remove()
    switch(error.code) {
        case error.PERMISSION_DENIED:
            addAlert("Please enable geolocation to get closest data.")
            break;
        case error.POSITION_UNAVAILABLE:
            addAlert("Location information is unavailable.")
            break;
        case error.TIMEOUT:
            addAlert("Location request timed out.")
            break;
        case error.UNKNOWN_ERROR:
            addAlert("An unknown error occurred.")
            break;
    }
}


function addAlert(message) {
    $('#tafMain').prepend(
        '<div id="alert" class="alert alert-danger alert-dismissable fade in" role="alert">' +
            '<button type="button" class="close" data-dismiss="alert" aria-label="Close">' +
            '<span aria-hidden="true">' +
              '&times;</span>' +
              '</button>' +
              message + '</div>');

    $("#alert").fadeTo(5000, 500).slideUp(500, function(){
        $("#alert").slideUp(500);
    });
}

function showLoading(){
  $('#tafResultBox').remove();
  $('#tafMain').empty();
  $('#loading').empty();
  $('#loading').append(
    '<div class="sk-cube-grid">' +
      '<div class="sk-cube sk-cube1"></div>' +
      '<div class="sk-cube sk-cube2"></div>' +
      '<div class="sk-cube sk-cube3"></div>' +
      '<div class="sk-cube sk-cube4"></div>' +
      '<div class="sk-cube sk-cube5"></div>' +
      '<div class="sk-cube sk-cube6"></div>' +
      '<div class="sk-cube sk-cube7"></div>' +
      '<div class="sk-cube sk-cube8"></div>' +
      '<div class="sk-cube sk-cube9"></div>' +
    '</div>'
  );
}

function hideLoading(){
  $('#loading').empty();
}
//Translate Script Below
var dictDescriptors = {'-': 'Light',
                    '+': 'Heavy',
                    'MI': 'Shallow',
                    'BC': 'Patches',
                    'DR': 'Drifting',
                    'BL': 'Blowing',
                    'SH': 'Shower',
                    'TS': 'Thunderstorm',
                    'PR': 'Partial',
                    'FZ': 'Freezing'};
var dictConditions = {'DZ': 'Drizzle',
                    'RA': 'Rain',
                    'SN': 'Snow',
                    'SG': 'Snow Grains',
                    'PL': 'Ice Pellets',
                    'GR': 'Hail',
                    'GS': 'Snow Pellets',
                    'IC': 'Ice Crystals',
                    'UP': 'Unknown',
                    'HZ': 'Haze',
                    'FU': 'Smoke',
                    'SA': 'Sand',
                    'DU': 'Dust',
                    'FG': 'Fog',
                    'BR': 'Mist',
                    'VA': 'Volcanic Ash',
                    'PO': 'Dust/Sand Whirls',
                    'SS': 'Sandstorm',
                    'DS': 'Duststorm',
                    'SQ': 'Squalls',
                    'FC': 'Funnel Cloud',
                    'SH': 'Showers',
                     'TS': 'Thunderstorms'};
var dictClouds = {'CLR': 'Sky Clear',
                'SKC': 'Sky Clear',
                'FEW': 'Few Clouds',
                'SCT': 'Scattered Clouds',
                'BKN': 'Broken Clouds',
                'OVC': 'Overcast Clouds'};
var dictCloudType = {'CB': 'Cumulonimbus',
                    'TCU': 'Towering Cumulus',
                    'CU': 'Cumulus',
                    'CF': 'Cumulus Fractus',
                    'SC': 'Stratocumulus',
                    'NS': 'Nimbostratus',
                    'ST': 'Stratus',
                    'SF': 'Stratus Fractus',
                    'AS': 'Altostratus',
                    'AC': 'Altocumulus',
                    'ACC': 'Altocumulus Castellanus',
                    'CI': 'Cirrus',
                    'CC': 'Cirrocumulus',
                    'FG': 'Fog',
                    'BR': 'Mist',
                    'SN': 'Snow'};



function translateTAF(TAF) {
  //var TAF = "TAF CYOW 062338Z 0700/0724 25006KT 6SM -RA BR BKN010 OVC025 TEMPO 0700/0704 3SM SHRA BR BKN005 OVC010 FM070400 29010KT 4SM -RA BR OVC005 TEMPO 0704/0713 P6SM -DZ OVC010 FM071300 28015KT P6SM -DZ OVC012 TEMPO 0713/0716 3SM -RA BR OVC006 FM071600 28012KT P6SM -SHRA OVC020 FM071900 29010KT P6SM BKN030 BECMG 0720/0723 04010KT RMK NXT FCST BY 070300Z"
  var TAFarr = TAF.split(' ');
  var x = 0;
  var TAFsplit = [];
  var tafTranslate = {};
  for(var i=0; i < TAFarr.length; i++){
    if (TAFarr[i].indexOf('FM') != -1 || TAFarr[i].indexOf('BECMG') != -1 || TAFarr[i] === 'TEMPO'|| TAFarr[i] === 'RMK'){
      x++;
    };
    if(TAFsplit[x] == undefined){
      TAFsplit[x] = TAFarr[i];
    } else {
      TAFsplit[x] += " " + TAFarr[i];
    };
  }
  TAFsplit[0] = TAFsplit[0].replace('TAF', "");
  TAFsplit[0] = TAFsplit[0].replace('AMD', "");
  TAFsplit[0] = TAFsplit[0].slice(5);
  TAFsplit[0] = TAFsplit[0].trim();

  //Publish time and validity period
  tafTranslate.Publish = {}
  tafTranslate.Publish.Date = TAFsplit[0].slice(0,2);
  tafTranslate.Publish.Time = TAFsplit[0].slice(2,4) + ":" + TAFsplit[0].slice(4,6) + " Z";
  tafTranslate.Validity = {}
  tafTranslate.Validity.Start = {}
  tafTranslate.Validity.Start.Date = TAFsplit[0].slice(8,10);
  tafTranslate.Validity.Start.Time = TAFsplit[0].slice(10,12) + ":00 Z";
  tafTranslate.Validity.End = {};
  tafTranslate.Validity.End.Date = TAFsplit[0].slice(13,15);
  tafTranslate.Validity.End.Time = TAFsplit[0].slice(15,17) + ":00 Z";
  TAFsplit[0] = TAFsplit[0].slice(18);
  TAFsplit[0] = TAFsplit[0].trim();
  var a = 0;

  for(var i=0; i < TAFsplit.length; i++) {
    tafTranslate[a] = {};
    if(TAFsplit[a].indexOf('FM') != -1) {
      tafTranslate[a].From = {};
      tafTranslate[a].From.Date = TAFsplit[a].slice(2,4);
      tafTranslate[a].From.Time = TAFsplit[a].slice(4,8);
      TAFsplit[a] = TAFsplit[a].slice(9);
    } else if(TAFsplit[a].indexOf('BECMG') != -1) {
      tafTranslate[a]['BECMG'] = {};
      tafTranslate[a]['BECMG'].Date1 = TAFsplit[a].slice(6,8);
      tafTranslate[a]['BECMG'].Time1 = TAFsplit[a].slice(8,10);
      tafTranslate[a]['BECMG'].Date2 = TAFsplit[a].slice(11,13);
      tafTranslate[a]['BECMG'].Time2 = TAFsplit[a].slice(13,15);
      TAFsplit[a] = TAFsplit[a].slice(16);
    } else if(TAFsplit[a].indexOf('TEMPO') != -1){
      tafTranslate[a]['TEMPO'] = {};
      tafTranslate[a]['TEMPO'].Date1 = TAFsplit[a].slice(6,8);
      tafTranslate[a]['TEMPO'].Time1 = TAFsplit[a].slice(8,10);
      tafTranslate[a]['TEMPO'].Date2 = TAFsplit[a].slice(11,13);
      tafTranslate[a]['TEMPO'].Time2 = TAFsplit[a].slice(13,15);
      TAFsplit[a] = TAFsplit[a].slice(16);
    } else if(TAFsplit[a].indexOf('RMK') != -1 ){
      tafTranslate[a]['Next FCST'] = {};
      tafTranslate[a]['Next FCST'].Date = TAFsplit[a].slice(-7,-5);
      tafTranslate[a]['Next FCST'].Time = TAFsplit[a].slice(-5);
    }
    a++
  }
    //TODO:decode

  console.log(tafTranslate)
  console.log(TAFsplit)
  }
