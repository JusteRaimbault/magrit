"use strict";

const available_projections = new Map([
	["Armadillo", "d3.geoArmadillo().scale(400)"],
	["AzimuthalEqualArea",  "d3.geoAzimuthalEqualArea().rotate([-10,-52]).scale(700).translate([240, 290])"],
	["Baker", "d3.geoBaker().scale(400)"],
	["Boggs", "d3.geoBoggs().scale(400)"],
	["InterruptedBoggs", "d3.geoInterruptedBoggs().scale(400)"],
	["Bonne", "d3.geoBonne().scale(400)"],
	["Bromley", "d3.geoBromley().scale(400)"],
	["Collignon", "d3.geoCollignon().scale(400)"],
	["ConicConformal", "d3.geoConicConformal().scale(400).parallels([43, 49])"],
	["ConicEqualArea", "d3.geoConicEqualArea().scale(400)"],
	["ConicEquidistant", "d3.geoConicEquidistant().scale(400)"],
	["CrasterParabolic", "d3.geoCraster().scale(400)"],
	["EckertI", "d3.geoEckert1().scale(400).translate([300, 250])"],
	["EckertII", "d3.geoEckert2().scale(400).translate([300, 250])"],
	["EckertIII", "d3.geoEckert3().scale(525).translate([150, 125])"],
	["EckertIV", "d3.geoEckert4().scale(525).translate([150, 125])"],
	["EckertV", "d3.geoEckert5().scale(400)"],
	["EckertVI", "d3.geoEckert6().scale(400)"],
	["Eisenlohr", "d3.geoEisenlohr().scale(400)"],
	["Gnomonic", "d3.geoGnomonic().scale(400)"],
	["Gringorten", "d3.geoGringorten().scale(400)"],
	["HEALPix", "d3.geoHealpix().scale(400)"],
	["Homolosine", "d3.geoHomolosine().scale(400)"],
	["InterruptedHomolosine", "d3.geoInterruptedHomolosine().scale(400)"],
	["Loximuthal", "d3.geoLoximuthal().scale(400)"],
	["Mercator",  "d3.geoMercator().scale(375).translate([525, 350])"],
	["NaturalEarth", "d3.geoNaturalEarth().scale(400).translate([375, 50])"],
	["Orthographic",  "d3.geoOrthographic().scale(475).translate([480, 480]).clipAngle(90)"],
	["Peircequincuncial", "d3.geoPeirceQuincuncial().scale(400)"],
	["Robinson", "d3.geoRobinson().scale(400)"],
	["InterruptedSinuMollweide", "d3.geoInterruptedSinuMollweide().scale(400)"],
	["Sinusoidal", "d3.geoSinusoidal().scale(400)"],
	["InterruptedSinusoidal", "d3.geoInterruptedSinusoidal().scale(400)"]
]);