var app;

require(["esri/Color",
  "dojo/string",
  "dijit/registry", 
  "dojo/on",
  "dojo/parser",
  "esri/config",
  "esri/map",
  "esri/layers/ArcGISDynamicMapServiceLayer",
  "esri/graphic",
  "esri/tasks/Geoprocessor",
  "esri/tasks/FeatureSet",
  "esri/toolbars/draw",
  "esri/symbols/SimpleLineSymbol",
  "esri/symbols/SimpleFillSymbol"
  ],
  function(Color, string, registry, on, parser, esriConfig, Map, ArcGISDynamicMapServiceLayer, Graphic, Geoprocessor, FeatureSet, Draw, SimpleLineSymbol, SimpleFillSymbol){

    var map, gp, toolbar, graphic;
    var featureSet = new FeatureSet();
    var features= [];

    parser.parse();

    app = {
      "map": map,
      "toolbar": toolbar
    };

    /*Initialize map, GP & image params*/
    app.map = map = new Map("mapDiv", { 
      basemap: "topo", 
      center: [-87.572, 33.329],
      zoom: 6
    });


    document.getElementById("count").addEventListener("click", function(){
      compute();
    });

    document.getElementById("clean").addEventListener("click", function(){
      clean();
    });

    map.on("load", initTools);

    var populationMap = new ArcGISDynamicMapServiceLayer("https://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Demographics/ESRI_Population_World/MapServer");
    populationMap.setOpacity(0);
    map.addLayer(populationMap);

    //identify proxy page to use if the toJson payload to the geoprocessing service is greater than 2000 characters.
    //If this null or not available the gp.execute operation will not work.  Otherwise it will do a http post to the proxy.
    esriConfig.defaults.io.proxyUrl = "/proxy/";
    esriConfig.defaults.io.alwaysUseProxy = false;

    function initTools(evtObj) {
      gp = new Geoprocessor("https://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Demographics/ESRI_Population_World/GPServer/PopulationSummary");
      gp.setOutSpatialReference({wkid:102100}); 
      gp.on("execute-complete", displayResults);

      app.toolbar = toolbar = new Draw(evtObj.map);
      toolbar.on("draw-complete", computeZonalStats);
    }

    function computeZonalStats(evtObj) {
      var geometry = evtObj.geometry;
      map.showZoomSlider();

      var symbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
        new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID).setWidth(1.5),
        new Color([0, 0, 0, 0.25])
        );
      graphic = new Graphic(geometry,symbol);

      map.graphics.add(graphic);
      toolbar.deactivate();

      features.push(graphic);

      featureSet.features = features;
    }

    function displayResults(evtObj) {
      var results = evtObj.results;
      var content = string.substitute("The population in the user defined polygon is ${number:dojo.number.format}.",{number:results[0].value.features[0].attributes.SUM});

      alert(content);
    }

    function compute(){
      var params = { "inputPoly":featureSet };
      gp.execute(params);
    }


    function clean(){
      features= [];
      featureSet = new FeatureSet();
      map.graphics.clear();
    }
  });

// Soninio meniu atidarymas, uzdarymas
function openNav() {
  if(document.getElementById("mySidenav").style.width == "0px"){
    document.getElementById("mySidenav").style.width = "250px";
    document.getElementById("main").style.marginLeft = "250px";
    $('#arrow').removeClass('glyphicon glyphicon-chevron-right').addClass('glyphicon glyphicon-chevron-left');
  }else{
    document.getElementById("mySidenav").style.width = "0px";
    document.getElementById("main").style.marginLeft = "0px";
    $('#arrow').removeClass('glyphicon glyphicon-chevron-left').addClass('glyphicon glyphicon-chevron-right');
  }
}