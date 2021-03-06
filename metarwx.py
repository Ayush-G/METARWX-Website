import ui

view = ui.load_view('metarwx')
view.present('fullscreen')

import xml.etree.ElementTree as ET
import requests
from bs4 import BeautifulSoup
import urllib.request
import urllib.parse
import csv
import re
import sys
import flask

dictDescriptors = {'-': 'Light',
                    '+': 'Heavy',
                    'MI': 'Shallow',
                    'BC': 'Patches',
                    'DR': 'Drifting',
                    'BL': 'Blowing',
                    'SH': 'Shower',
                    'TS': 'Thunderstorm',
                    'PR': 'Partial',
                    'FZ': 'Freezing'}
dictConditions = {'DZ': 'Drizzle',
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
                    'SH': 'Showers'}
dictClouds = {'CLR': 'Sky Clear',
                'SKC': 'Sky Clear',
                'FEW': 'Few Clouds',
                'SCT': 'Scattered Clouds',
                'BKN': 'Broken Clouds',
                'OVC': 'Overcast Clouds',
                'CAVOK': 'Ceiling and Visibility OK'}


dictCloudType = {'CB': 'Cumulonimbus',
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
                    'SN': 'Snow'}


#Uses the user ip to get the city and time zone
def getLoc():
	url = 'http://freegeoip.net/json/'
	r = requests.get(url)
	js = r.json()
	city = js['city']
	return(city)
def getCountry():
	url = 'http://freegeoip.net/json/'
	r = requests.get(url)
	js = r.json()
	country = js['country_name']
	return(country)

def getLatLong():
	url = 'http://freegeoip.net/json/'
	r = requests.get(url)
	js = r.json()
	LatLong = {'Longitude': js['longitude'], 'Latitude': js['latitude']}
	return(LatLong)


#Organizes the METAR and translates it to plain english
def translateMetar(METAR):
	METAR = str(METAR.strip())
	if not "RMK" in METAR:
		rmkTemp = ""
		metRMK = ""
		metMETAR = METAR
	else:
		rmkTemp = METAR.split('RMK')
		metRMK = rmkTemp[1]
		metMETAR = rmkTemp[0]
	metInfo = {}
	metIMC = False
	
	#Station
	metInfo['Station'] = metMETAR[:4]
	metStation = metInfo['Station']
	metMETAR = metMETAR[4:]
	metMETAR = str(metMETAR.strip())
	
	
	#Time
	metInfo['Time'] = metMETAR[:7]
	metMETAR = metMETAR[8:]
	metTime = [0, 0]
	metTime = '%s:%s' % (metInfo['Time'][2:4], metInfo['Time'][4:6])
	metMETAR = metMETAR.strip()
	view['lblStationTime'].text = view['lblStationTime'].text + "\n at " + metTime + " GMT"
	
	#Remove AUTO and CCA
	if "AUTO" in metMETAR:
		metMETAR = metMETAR.replace('AUTO', '')
	if "CCA" in metMETAR:
		metMETAR = metMETAR.replace('CCA', '')
	metMETAR = metMETAR.strip()
	
	
	#Winds
	metInfo['Winds'] = metMETAR.split()[0]
	metMETAR = metMETAR.replace(metInfo['Winds'], "")
	if metInfo['Winds'] == '00000KT':
		metWinds = ['Calm']
		metWinds = 'Calm'
	elif 'VRB' in metInfo['Winds']:
		metWindsDir = 'Variable'
		metWindsVel = metInfo['Winds'][3:5]
		metWinds = '%s @ %s KT' % (metWindsDir, metWindsVel)
	else:
		metWindsDir = metInfo['Winds'][:3]
		metWindsVel = metInfo['Winds'][3:5]
		if 'G' in metInfo['Winds']:
			metWindsGust = metInfo['Winds'][6:8]
			metWinds = '%s @ %s KT, Gusting to %s' % (metWindsDir, metWindsVel, metWindsGust)
		else:
			metWinds = '%s @ %s KT' % (metWindsDir, metWindsVel)
	if len(metMETAR.split()[0]) == 7:
		metInfo['VarWinds'] = metMETAR.split()[0]
		metMETAR = metMETAR.replace(metInfo['VarWinds'], "")
		metWindsVar = metInfo['VarWinds']
		if 'G' in metInfo['Winds']:
			metWindsGust = metInfo['Winds'][6:8]
			metWinds = '%s, Variable between %s and %s @ %s KT, Gusting to %s' % (metWindsDir, metWindsVar[:3], metWindsVar[4:], metWindsVel, metWindsGust)
		else:
			metWinds = '%s, Variable between %s and %s @ %s KT' % (metWindsDir, metWindsVar[:3], metWindsVar[4:], metWindsVel)
	view['lblWinds'].text = "Winds are from: " + metWinds
	metMETAR = metMETAR.strip()
	
	
	#Visibility
	if "SM" in metMETAR.split()[1]:
		metVisibility = metMETAR.split()[0] + " " + metMETAR.split()[1]
	else:
		metVisibility = metMETAR.split()[0]
	metMETAR = metMETAR.replace(metVisibility, "")
	if "SM" in metVisibility:
		metVisibility = metVisibility[:-2]
		if "/" in metVisibility:
			metIMC = True
		else:
			if int(metVisibility) <= 3.1:
				metIMC = True
		metVisibility = metVisibility + "SM"
	else:
		if "9999" in metVisibility:
			metVisibility = ">10 KM"
		elif "0000" in metVisibility:
			metVisibility = "<50 metres"
		elif metVisibility[1:] == "000":
			metVisibility = metVisibility[1] + " KM"
		else:
			metVisibility = metVisibility + "metres" 
	view['lblVisibility'].text = "Visibility is: " + metVisibility
	metMETAR = metMETAR.strip()
	
	
	metRVRtext = 'None'
	if '/' in metMETAR.split()[0]:
		metRVR = ['0', '0', '0']
		metIMC = True
		while '/' in metMETAR.split()[0]:
			metInfo['RVR'] = metMETAR.split()[0]
			metMETAR = metMETAR.replace(metInfo['RVR'], "")
			if metRVR != ['0', '0', '0']:
				metRVR[0] = metInfo['RVR'].split('/')[0][1:]
				metRVR[1] = metInfo['RVR'].split('/')[1]
				if "V" in metRVR[1]:
					metRVR[1] = "Between " + metRVR[1][:4] + " and " + metRVR[1][5:]
					if "P" in metRVR[1]:
						metRVR[1] = metRVR[1].replace("P", "greater than ")
				metRVR[2] = metInfo['RVR'][-1]
				if metRVR[2] == "U":
					metRVR[2] = "Upward"
				elif metRVR[2] == "D":
					metRVR[2] = "Downward"
				else:
					metRVR[2] = "Neutral"
				metRVRtext = metRVRtext + ';\n\n Runway %s, Visibility is %s, Tendency: %s' % (metRVR[0], metRVR[1], metRVR[2])
			else:
				metRVR[0] = metInfo['RVR'].split('/')[0][1:]
				metRVR[1] = metInfo['RVR'].split('/')[1]
				if "V" in metRVR[1]:
					metRVR[1] = "Between " + metRVR[1][:4] + " and " + metRVR[1][5:]
					if "P" in metRVR[1]:
						metRVR[1] = metRVR[1].replace("P", "greater than ")
				metRVR[2] = metInfo['RVR'][-1]
				if metRVR[2] == "U":
					metRVR[2] = "Upward"
				elif metRVR[2] == "D":
					metRVR[2] = "Downward"
				else:
					metRVR[2] = "Neutral"
				metRVRtext = '\nRunway %s, Visibility is %s, Tendency: %s' % (metRVR[0], metRVR[1], metRVR[2])
		metMETAR = metMETAR.strip()
	view['lblRVR'].text = "Runway Visual Range: " + metRVRtext
	
	
	#Vicinity wx
	metVicinity = 'None'
	if 'VC' in metMETAR.split()[0] and not 'OVC' in metMETAR.split()[0]:
		metInfo['Vicinity'] = metMETAR.split()[0]
		metMETAR = metMETAR.replace(metInfo['Vicinity'], "")
		metVicinity = metInfo['Vicinity'][2:]
		if len(metVicinity) == 4:
			metVicinity = (dictDescriptors.get(metVicinity[:2], 'Unknown')) + ' ' + (dictConditions.get(metVicinity[2:], 'Unknown'))
		else:
			metVicinity = (dictConditions.get(metVicinity, 'Unknown'))
	elif 'VC' in metRMK:
		metVicIndex = metRMK.find("VC", 0, len(metRMK))
		metVicinity = metRMK[metVicIndex:metVicIndex+4]
		metRMK = metRMK.replace(metVicinity, "")
		metVicinity = metVicinity[2:]
		if len(metVicinity) == 4:
			metVicinity = (dictDescriptors.get(metVicinity[:2], 'Unknown')) + ' ' + (dictConditions.get(metVicinity[2:], 'Unknown'))
		else:
			metVicinity = (dictConditions.get(metVicinity, 'Unknown'))
	metMETAR = metMETAR.strip()
	view['lblVicinityWX'].text = "Vicinity Weather: " + metVicinity
	
	
	#Weather conditions
	metCondition = "None"
	if metMETAR.split()[0][:1] in dictDescriptors or metMETAR.split()[0][-2:] in dictConditions:
		metCondition = ''
		metInfo['Condition'] = metMETAR.split()[0]
		metMETAR = metMETAR.replace(metInfo['Condition'], "")
		metWeather = metInfo['Condition']
		if metWeather[:1] in dictDescriptors:
			metCondition = metCondition + ' ' + (dictDescriptors.get(metWeather[:1], 'Unknown'))
			if metWeather[1:3] in dictDescriptors:
				metCondition = metCondition + ' ' + (dictDescriptors.get(metWeather[1:3], 'Unknown'))
		if metWeather[:2] in dictDescriptors:
			metCondition = metCondition + ' ' + (dictDescriptors.get(metWeather[:2], 'Unknown'))
		metCondition = metCondition + ' ' + (dictConditions.get(metWeather[-2:], 'Unknown'))
		while metMETAR.split()[0][:1] in dictDescriptors or metMETAR.split()[0][-2:] in dictConditions:
			metInfo['Condition'] = metMETAR.split()[0]
			metMETAR = metMETAR.replace(metInfo['Condition'], "")
			metWeather = metInfo['Condition']
			metCondition += ' &'
			if metWeather[:1] in dictDescriptors:
				metCondition = metCondition + ' ' + (dictDescriptors.get(metWeather[:1], 'Unknown'))
				if metWeather[1:3] in dictDescriptors:
					metCondition = metCondition + ' ' + (dictDescriptors.get(metWeather[1:3], 'Unknown'))
			if metWeather[:2] in dictDescriptors:
				metCondition = metCondition + ' ' + (dictDescriptors.get(metWeather[:2], 'Unknown'))
			metCondition = metCondition + ' ' + (dictConditions.get(metWeather[-2:], 'Unknown'))
		metMETAR = metMETAR.strip()
	view['lblConditions'].text = "Weather Phenomena: " + metCondition
	
	#Cloud coverage and altitude
	metClouds = 'None'
	metCloudDetails = 'None'
	if "NSC" in metMETAR.split()[0]:
		metClouds = "No significant cloud"
		metMETAR = metMETAR.replace("NSC", "")
	elif "NCD" in metMETAR.split()[0]:
		metClouds = "No cloud detected"
		metMETAR = metMETAR.replace("NCD", "")
	if metMETAR.split()[0][:3] in dictClouds:
		metClouds = ''
		metInfo['Clouds'] = metMETAR.split()[0]
		metMETAR = metMETAR.replace(metInfo['Clouds'], "")
		metSkyCondition = metInfo['Clouds']
		if "CB" in metSkyCondition:
			metSkyCondition = metSkyCondition[:-2]
			metCloudDetails = "Cumulonimbus"
		elif "TCU" in metSkyCondition:
			metSkyCondition = metSkyCondition[:-3]
			metCloudDetails = "Towering Cumulus"
		metClouds = (dictClouds.get(metSkyCondition[:3], 'Unknown'))
		metCloudHeight = metSkyCondition[3:6].lstrip('0') + '00'
		if (int(metCloudHeight) < 1500) and ((metClouds == "Broken Clouds") or (metClouds == "Overcast Clouds")):
			metIMC = True
		if metClouds == "Sky Clear":
			metClouds = metClouds
		else:
			metClouds = metClouds + ' at ' + metCloudHeight + 'ft'
		while metMETAR.split()[0][:3] in dictClouds:
			metInfo['Clouds'] = metMETAR.split()[0]
			metMETAR = metMETAR.replace(metInfo['Clouds'], "")
			metSkyCondition = metInfo['Clouds']
			if "CB" in metSkyCondition:
				metSkyCondition = metSkyCondition[:-2]
				metCloudDetails = metCloudDetails + " & Cumulonimbus"
			elif "TCU" in metSkyCondition:
				metSkyCondition = metSkyCondition[:-3]
				metCloudDetails = metCloudDetails + " & Towering Cumulus"
			metClouds += ' &'
			metClouds = metClouds + ' ' + (dictClouds.get(metSkyCondition[:3], 'Unknown'))
			metCloudHeight = metSkyCondition[-3:].lstrip('0') + '00'
			if (int(metCloudHeight) < 1500) and ((metClouds == "Broken") or (metClouds == "Overcast")):
				metIMC = True
			if metClouds == "Sky Clear":
				metClouds = metClouds
			else:
				metClouds = metClouds + ' at ' + metCloudHeight + 'ft'
	view['lblClouds'].text = "Clouds: " + metClouds
	metMETAR = metMETAR.strip()
	if metIMC == True:
		view['lblICAOConditions'].text = "Instrument Meteorological Conditions"
		view['lblICAOConditions'].background_color = 'ff0000'
	else: 
		view['lblICAOConditions'].text = "Visual Meteorological Conditions"
		view['lblICAOConditions'].background_color = '00ff00'
	#VV
	if metMETAR.split()[0][:2] == "VV":
		metIMC = True
		metVV = metMETAR.split()[0]
		metMETAR = metMETAR.replace(metVV, "")
		metVV = metVV[2:]
		metVV = metVV.lstrip('0')
		metVV = metVV + "00 ft"
		metMETAR = metMETAR.strip()
		view['lblVisibility'].text = view['lblVisibility'].text + "\n Vertical Visibility: " + metVV
	#Temperature
	metTempDew = metMETAR.split()[0]
	metMETAR = metMETAR.replace(metTempDew, "")
	metTemperatureDewpoint = metTempDew.split("/")
	metTemperature = metTemperatureDewpoint[0]
	metDewpoint = metTemperatureDewpoint[1]
	if metTemperature[0] == "M" and metTemperature[1] == "0":
		metTemperature = metTemperature[2:]
		metTemperature = "-" + metTemperature + "C"
	elif metTemperature[0] == "0":
		metTemperature = metTemperature[1:]
		metTemperature = metTemperature + "C"
	else:
		metTemperature = metTemperature + "C"
	if metDewpoint[0] == "M" and metDewpoint[1] == "0":
		metDewpoint = metDewpoint[2:]
		metDewpoint = "-" + metDewpoint + "C"
	elif metDewpoint[0] == "0":
		metDewpoint = metDewpoint[1:]
		metDewpoint = metDewpoint + "C"
	else:
		metTemperature = metTemperature + "C"
	metMETAR = metMETAR.strip()
	view['lblTemp'].text = "Temperature: " + metTemperature + " \nDewpoint: " + metDewpoint

	#Altimeter Setting
	if len(metMETAR) == 5:
		metAltimeter = metMETAR
		if "Q" in metAltimeter:
			metAltimeter = metAltimeter[1:]
			metAltimeter = metAltimeter + " hPa"
		else:
			metAltimeter = '%s.%s"Hg' % (metAltimeter[1:3], metAltimeter[3:])
	else:
		metAltimeter = metMETAR.split()[0]
		metMETAR = metMETAR.replace(metAltimeter, "")
		if "Q" in metAltimeter:
			metAltimeter = metAltimeter[1:]
			metAltimeter = metAltimeter + " hPa"
		else:
			metAltimeter = '%s.%s"Hg' % (metAltimeter[1:3], metAltimeter[3:])
	metMETAR = metMETAR.strip()
	
	#Recent Wx
	metRecent = 'None'
	if 'RE' in metMETAR.split():
		metRecent = metMETAR.split()[0]
		metMETAR = metMETAR.replace(metRecent, "")
		metRecent = metRecent[2:]
		if len(metRecent) == 4:
			metRecent = 'Recent ' + (dictDescriptors.get(metRecent[:2], 'Unknown')) + ' ' + (dictConditions.get(metRecent[2:], 'Unknown'))
		else:
			metRecent = 'Recent ' + (dictConditions.get(metRecent, 'Unknown'))
	metMETAR = metMETAR.strip()
	view['lblRecentWX'].text = "Recent Weather: " + metRecent
	
	
	#Wind Shear
	if 'WS' in metMETAR.split():
		metWindShear = metMETAR
		metMETAR = metMETAR.replace(metWindShear, "")
		if 'ALL RWY' in metWindShear:
			metWindShear = 'Wind Shear: All Runways'
		else:
			metWindShear = 'Wind Shear: Runway ' + metWindShear[6:]
	else: metWindShear = 'None'
	view['lblWindShear'].text = "Wind Shear: " + metWindShear
	
	#RMK
	#CloudDetails
	if not metRMK == "":
		if (re.findall(r'\D+', metRMK.split()[0])[0]) in dictCloudType:
			metCloudType = metRMK.split()[0]
			metRMK = metRMK.strip()
			metCTOctas = (re.findall(r'\d+', metCloudType))
			metCTCover = (re.findall(r'\D+', metCloudType))
			cloudTypesNum = len(metCTCover)
			iternum = 0
			metCloudDetails = ""
			for clouds in metCTCover:
				metCloudDetails = metCloudDetails + dictCloudType.get(clouds) + ' ' + metCTOctas[iternum] + '/8 coverage; '
				iternum += 1
			metCloudDetails = metCloudDetails[:-2]
			metRMK = metRMK.replace(metCloudType, "")

	metRMK = metRMK.strip()
	if not metRMK == "":
		while metRMK.split()[0] in dictCloudType:
			if metRMK.split()[1] == "TR":
				metCloudDetails = metCloudDetails + "; "
				metCloudType = metRMK.split()[0]
				metRMK = metRMK.strip()
				metCloudDetails = metCloudDetails + dictCloudType.get(metCloudType) + " Trace; "
				metRMK = metRMK.replace(metCloudType, "")
				metRMK = metRMK.strip()
				metRMK = metRMK.replace("TR", "", 1)
				metCloudDetails = metCloudDetails[:-2]
			else:
				break
	view['lblClouds'].text = view['lblClouds'].text + "\n" + metCloudDetails
	
	
	#Density altitude
	metDensityAlt = "None"
	if not metRMK == "":
		if 'FT' in metRMK.split()[-1]:
			metDensityAlt = metRMK.split()[-1]
			metRMK = metRMK.strip()
			metRMK = metRMK.replace('DENSITY', "")
			metRMK = metRMK.replace('ALT', "")
			metRMK = metRMK.replace(metDensityAlt, "")
	metRMK = metRMK.strip()
	view['lblDensityAlt'].text = "Density Altitude: " + metDensityAlt
	
	
	#Sea Level Pressure
	metSLP = "N/A"
	if not metRMK == "":
		if metRMK.find("SLP",0,len(metRMK)) != -1:
			metSLPIndex = metRMK.find("SLP",0,len(metRMK))
			metSLP = metRMK[metSLPIndex:metSLPIndex+6]
		else:
			metSLP = metRMK.split()[-1]
		metRMK = metRMK.replace(metSLP, '')
		metSLP = metSLP[3:]
		metRMK = metRMK.strip()
		if metSLP[0] == '5' or metSLP[0] == '4' or metSLP[0] == '3' or metSLP[0] == '2' or metSLP[0] == '1' or metSLP[0] == '0':
			metSLP = "10" + metSLP[:-1] + "." + metSLP[-1] + ' hPa'
		else:
			metSLP = "9" + metSLP[:-1] + "." + metSLP[-1] + ' hPa'
	view['lblAltimeter'].text = "Pressure: " + metAltimeter + " | " + metSLP
	if metRMK == "":
		metRMK = "None"
	view['lblRMK'].text = "Remarks: " + metRMK
	
	#msgMETAR = 'Station: %s / %s | Time of Observation: %s GMT | Winds: %s | Visibility: %s SM | Runway Visual Range: %s| Vicinity: %s| Present Weather Condition: %s | Cloud Heights: %s | Temperature: %s | Dewpoint: %s | Pressure: %s / %s | Recent Weather: %s | Wind Shear: %s | Cloud Details: %s | Density Altitude: %s | Remarks: %s' % (metStation, metStnName, metTime, metWinds, metVisibility, metRVRtext, metVicinity, metCondition, metClouds, metTemperature, metDewpoint, metAltimeter, metSLP, metRecent, metWindShear, metCloudDetails, metDensityAlt, metRMK)
	
#Submits ICAO code to get METAR
def getMetar(ICAO):
	url = 'https://aviationweather.gov/metar/data?'  #encodes the URL with the ICAO code
	values = {'ids': ICAO,
	'format': 'raw',
	'date': '0',
	'hours': '0',
	'taf': 'off'}
	data = urllib.parse.urlencode(values)
	data = data.encode('utf-8')
	headers = {}
	headers['User-Agent'] = "Mozilla/5.0 (X11; Linux i686) AppleWebKit/537.17 (KHTML, like Gecko) Chrome/24.0.1312.27 Safari/537.17" #Makes script look human
	req = urllib.request.Request(url, data, headers = headers)
	r = urllib.request.urlopen(req).read() #Gets the website data
	soup = BeautifulSoup(r, "html5lib")
	letters = soup.find_all("div", {"id": "awc_main_content"})
	for item in letters:
		METAR =(item.text[738:]) #gets only the text, trims to only the metar
		METAR = METAR.strip()
	view['lblRawMETAR'].text = METAR
	return(METAR)

def getStation(userLong, userLat, Country):
	dist = '8'
	url = 'https://www.aviationweather.gov/adds/dataserver_current/httpparam?dataSource=stations&requestType=retrieve&format=xml&radialDistance=' + dist + ';' + userLong + ',' + userLat
	headers = {}
	headers['User-Agent'] = "Mozilla/5.0 (X11; Linux i686) AppleWebKit/537.17 (KHTML, like Gecko) Chrome/24.0.1312.27 Safari/537.17" #Makes script look human
	req = urllib.request.Request(url, headers = headers)
	r = urllib.request.urlopen(req).read()
	soup = BeautifulSoup(r, "html5lib")
	root = ET.fromstring(r)
	x = 0
	if Country == "Canada":
		while not (root[6][x][0].text[1]) == "Y":
			x = x + 1
		else:
			userStn = root[6][x][0].text
	else:
		userStn = root[6][0][0].text
	view['lblStationTime'].text = str(soup.findAll('site')[x])[6:-7]
	return(userStn)

	
"""	
def getICAO(userCity, userCountry, delimiter=None):
	import csv
	if userCountry == "Canada":
		with open('canairports.csv', encoding="utf-8") as csvfile:
			spamreader = csv.reader(csvfile, delimiter=',')
			result = dict(filter(None, csv.reader(csvfile)))
			ICAO = result.get(userCity, 'CYOW')
	else:
		with open('airports.csv', encoding="utf-8") as csvfile:
			spamreader = csv.reader(csvfile, delimiter=',')
			result = dict(filter(None, csv.reader(csvfile)))
			ICAO = result.get(userCity, 'CYOW')
	return(ICAO)
"""

	
	
userCity = getLoc()
userCountry = getCountry()
userLatLong = getLatLong()
userLong = str(userLatLong.get("Longitude"))
userLat = str(userLatLong.get("Latitude"))
userStation = getStation(userLong, userLat, userCountry)
#userApCode = getICAO(userCity, userCountry)
#userStnName = getStnName(userStation)
updatedMETAR = getMetar(userStation)

returnMETAR = translateMetar(updatedMETAR)

