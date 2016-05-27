"use strict";
////////////////////////////////////////////////////////////////////////
// Browse and upload buttons + related actions (conversion + displaying)
////////////////////////////////////////////////////////////////////////
const MAX_INPUT_SIZE = 12582912; // max allowed input size in bytes

function add_layer(d){
    var res = [],
        input = d3.select(document.createElement('input'))
                    .attr("type", "file").attr("multiple", "").attr("name", "file[]")
                    .attr("enctype", "multipart/form-data")
                    .on('change', function(){ prepareUpload(d3.event) });

    target_layer_on_add = (this.id === "img_in_geom_big") ? true :
                          (this.id === "img_in_geom") ? true :
                          (this.id === "img_data_ext") ? true : false;

    function prepareUpload(event){
        let files = event.target.files;
        for(let i=0; i < files.length; i++){
            if(files[i].size > MAX_INPUT_SIZE){
                alert("Too large input file (should currently be under 12Mb");
                return;
            }
        }
        if(strContains(files[0].name, 'topojson')){
            handle_TopoJSON_files(files);
        } else if(files.length == 1 && (strContains(files[0].name, 'geojson')
                            || strContains(files[0].name, 'zip') || strContains(files[0].name, 'kml'))){
            handle_single_file(files[0]);
        } else if((strContains(files[0].name.toLowerCase(), '.csv')
                    || strContains(files[0].name.toLowerCase(), '.tsv'))
                    && target_layer_on_add) {
            handle_dataset(files[0])
            target_layer_on_add = false;
        }
        else if(files.length >= 4){
            let filenames = Array.prototype.map.call(files, f => f.name),
                res = strArraysContains(filenames, ['.shp', '.dbf', '.shx', '.prj']);
            if(res.length >= 4)
                handle_shapefile(files);
            else
                alert('Layers have to be uploaded one by one and all mandatory files (.shp, .dbf, .shx, .prj) have been provided for reading a Shapefile');
        } else {
            alert('Invalid datasource (No GeoJSON/TopoJSON/zip/Shapefile detected)');
        }
    };
    input.node().dispatchEvent(new MouseEvent("click"))
}


function prepare_drop_section(){
    Array.prototype.forEach.call(
        document.querySelectorAll("#section1,#section3"),
        function(elem){
            elem.addEventListener("dragenter", function(e){
                e.preventDefault();
                e.stopPropagation();
                target_layer_on_add = false;
                elem.style.border = '3px dashed green';
            });
            elem.addEventListener("dragover", function(e){
                e.preventDefault();
                e.stopPropagation();
                elem.style.border = '3px dashed green';
            });
            elem.addEventListener("dragleave", function(e){
                e.preventDefault();
                e.stopPropagation();
                elem.style.border = '';
            });
            elem.addEventListener("drop", function(e) {
                e.preventDefault();
                let files = e.dataTransfer.files,
                    self_section = elem.id;

                e.stopPropagation();

                if(self_section === "section1")
                    target_layer_on_add = true;

                for(let i=0; i < files.length; i++){
                    if(files[i].size > MAX_INPUT_SIZE){
                        alert("Too large input file (should currently be under 12Mb");
                        return;
                    }
                }

                if(!(files.length == 1)){
                    var filenames = Array.prototype.map.call(files, f => f.name),
                        result = strArraysContains(filenames, ['.shp', '.dbf', '.shx', '.prj']);

                    if(result.length == 4){
                        elem.style.border = '';
                        handle_shapefile(files);
                    } else {
                        alert('Layers have to be uploaded one by one and all mandatory files (.shp, .dbf, .shx, .prj) have been provided for reading a Shapefile');
                        elem.style.border = '';
                    }
                }
                else if(strContains(files[0].name.toLowerCase(), 'topojson')){
                       elem.style.border = '';
                       if(target_layer_on_add && targeted_layer_added)
                           alert("Only one layer can be added by this functionnality");
                       // Most direct way to add a layer :
                       else handle_TopoJSON_files(files);
               }
               else if(strContains(files[0].name.toLowerCase(), 'geojson') ||
                    strContains(files[0].type.toLowerCase(), 'application/zip') ||
                    strContains(files[0].name.toLowerCase(), 'kml')){
                       elem.style.border = '';

                       if(target_layer_on_add && targeted_layer_added)
                           alert("Only one layer can be added by this functionnality");
                       // Send the file to the server for conversion :
                       else handle_single_file(files[0]);
               }
              else if(strContains(files[0].name.toLowerCase(), '.csv')
                || strContains(files[0].name.toLowerCase(), '.tsv')) {
                    elem.style.border = '';
                    if(self_section === "section1")
                        handle_dataset(files[0]);
                    else
                        alert('Only layout layers can be added here');
                    target_layer_on_add = false;
               }
              else {
                    elem.style.border = '3px dashed red';
                    alert('Invalid datasource (No GeoJSON/TopoJSON/zip/Shapefile detected)');
                    elem.style.border = '';
                }
            }, true);
    });
}

////////////////////////////////////////////////////////////////////////
// Functions to handles files according to their type
////////////////////////////////////////////////////////////////////////

function handle_shapefile(files){
    var ajaxData = new FormData();
    ajaxData.append("action", "submit_form");
    for(let j=0; j<files.length; j++){
        ajaxData.append('file['+j+']', files[j]);
    }
     $.ajax({
        processData: false,
        contentType: false,
        url: '/convert_to_topojson',
        data: ajaxData,
        type: 'POST',
        success: function(data) {add_layer_topojson(data);},
        error: function(error) {console.log(error); }
        });

}

// - By trying directly to add it if it's a TopoJSON :
function handle_TopoJSON_files(files) {
    var f = files[0],
        name = files[0].name,
        reader = new FileReader(),
        ajaxData = new FormData();
    ajaxData.append('file[]', f);
    $.ajax({
        processData: false,
        contentType: false,
        global: false,
        url: '/cache_topojson/user',
        data: ajaxData,
        type: 'POST',
        error: function(error) { console.log(error); }
    });

    reader.onloadend = function(){
        var text = reader.result;
        add_layer_topojson(text);
        }
    reader.readAsText(f);
};

function handle_dataset(f){
    if(joined_dataset.length !== 0){
        var rep = confirm("An additional dataset as already been provided. Replace by this one ?");
        if(!rep){ return; }
        else joined_dataset = [];
    }
    var reader = new FileReader(),
        name = f.name;

    reader.onload = function(e) {
        var data = e.target.result;
        dataset_name = name.substring(0, name.indexOf('.csv'));
        joined_dataset.push(d3.csv.parse(data))

        let field_name = Object.getOwnPropertyNames(joined_dataset[0][0]);
        if(field_name.indexOf("x") > -1 || field_name.indexOf("X") > -1 || field_name.indexOf("lat") > -1 || field_name.indexOf("latitude") > -1){
            if(field_name.indexOf("y") > -1 || field_name.indexOf("Y") > -1 || field_name.indexOf("lon") > -1 || field_name.indexOf("longitude") > -1 || field_name.indexOf("long") > -1){
                add_csv_geom(data, dataset_name);
                return;
            }
        }
        let d_name = dataset_name.length > 20 ? [dataset_name.substring(0, 17), "(...)"].join('') : dataset_name,
            nb_features = joined_dataset[0].length;
        d3.select('#data_ext')
            .attr("name-tooltip", dataset_name + '.csv')
            .html([' <b>', d_name,
                   '</b> - <i><span style="font-size:9.5px;"> ',
                   nb_features, ' features - ',
                   field_name.length, " fields</i></span>"].join(''));
        valid_join_check_display(false);
        if(targeted_layer_added){
            document.getElementById("join_button").disabled = false;
            d3.select(".s1").html("").on("click", null)
            d3.select("#sample_link").html("").on("click", null);
            d3.select("#section1").style({"height": "145px", "padding-top": "25px"})
        } else {
            document.getElementById("join_button").disabled = true;
            d3.select("#section1").style("height", "165px");
        }
        fields_handler.fill();
        if(browse_table.node().disabled === true) browse_table.node().disabled = false;
        $("[name-tooltip!='']").qtip( {content: { attr: "name-tooltip" }, style: { classes: 'qtip-tipsy' } } );
    };
    reader.readAsText(f);
}

function add_csv_geom(file, name){
    var ajaxData = new FormData();
    ajaxData.append('filename', name);
    ajaxData.append('csv_file', file);
    $.ajax({
        processData: false,
        contentType: false,
        url: '/convert_csv_geo',
        data: ajaxData,
        type: 'POST',
        error: function(error) {  console.log(error);  },
        success: function(data) {
            joined_dataset = [];
            target_layer_on_add = true;
            add_layer_topojson(data);
            target_layer_on_add = false;
        }
    });
}

// - By sending it to the server for conversion (GeoJSON to TopoJSON)
function handle_single_file(file) {
    var ajaxData = new FormData();
    ajaxData.append("action", "single_file");
    ajaxData.append('file[]', file);
    $.ajax({
        processData: false,
        contentType: false,
        url: '/convert_to_topojson',
        data: ajaxData,
        type: 'POST',
        success: function(data) {add_layer_topojson(data);},
        error: function(error) {console.log(error);}
    });
};

// Add the TopoJSON to the 'svg' element :
function add_layer_topojson(text, options){
    var parsedJSON = JSON.parse(text),
        result_layer_on_add = options ? options.result_layer_on_add : false;


    if(parsedJSON.Error){  // Server returns a JSON reponse like {"Error":"The error"} if something went bad during the conversion
        alert(parsedJSON.Error);
        return;
    }
    var type = "", data_to_load = false,
        layers_names = Object.getOwnPropertyNames(parsedJSON.objects);

    // Add an ID if the input topojson is provided without :
    layers_names.forEach(function(l_name, j){
        if(!parsedJSON.objects[l_name].geometries[0].id){
            for(var i=0, len = parsedJSON.objects[l_name].geometries.length,
                         tgt = parsedJSON.objects[l_name].geometries; i < len; i++){
                tgt[i].id = i;
                }
        }
    });

    if(target_layer_on_add && menu_option.add_options && menu_option.add_options == "keep_file")
        window._target_layer_file = parsedJSON;

    // Loop over the layers to add them all ?
    // Probably better open an alert asking to the user which one to load ?
    for(let i=0; i < layers_names.length; i++){
        var random_color1 = Colors.names[Colors.random()],
            lyr_name = layers_names[i],
            field_names = parsedJSON.objects[lyr_name].geometries[0].properties ? Object.getOwnPropertyNames(parsedJSON.objects[lyr_name].geometries[0].properties) : [];

        if(strContains(parsedJSON.objects[lyr_name].geometries[0].type, 'oint')) type = 'Point';
        else if(strContains(parsedJSON.objects[lyr_name].geometries[0].type, 'tring')) type = 'Line';
        else if(strContains(parsedJSON.objects[lyr_name].geometries[0].type, 'olygon')) type = 'Polygon';

//        if(parsedJSON.objects[lyr_name].geometries[0].properties && target_layer_on_add){
        current_layers[lyr_name] = {"type": type,
                                    "n_features": parsedJSON.objects[lyr_name].geometries.length,
                                    "stroke-width-const": "0.4px",
                                    "fill_color":  {"single": random_color1},
                                    };

        if(target_layer_on_add){
            current_layers[lyr_name].targeted = true;
            user_data[lyr_name] = [];
            data_to_load = true;
        } else if(result_layer_on_add){
            result_data[lyr_name] = [];
            current_layers[lyr_name].is_result = true;
        }

        map.append("g").attr("id", lyr_name)
              .attr("class", function(d) { return data_to_load ? "targeted_layer layer" : "layer"; })
              .style({"stroke-linecap": "round", "stroke-linejoin": "round"})
              .selectAll(".subunit")
              .data(topojson.feature(parsedJSON, parsedJSON.objects[lyr_name]).features)
              .enter().append("path")
              .attr("d", path)
              .attr("id", function(d, ix) {
                    if(data_to_load){
                        if(field_names.length > 0){
                            if(d.properties.hasOwnProperty('id') && d.id !== d.properties.id)
                                d.properties["_uid"] = d.id;
                            d.properties["pkuid"] = ix;
                            user_data[lyr_name].push(d.properties);
                        } else {
                            user_data[lyr_name].push({"id": d.id});
                        }
                    } else if(result_layer_on_add)
                        result_data[lyr_name].push(d.properties);

                    return "feature_" + ix;
                })
              .style("stroke", function(){if(type != 'Line') return("rgb(0, 0, 0)");
                                          else return(random_color1);})
              .style("stroke-opacity", .4)
              .style("fill", function(){if(type != 'Line') return(random_color1);
                                        else return(null);})
              .style("fill-opacity", function(){if(type != 'Line') return(0.5);
                                                else return(0);})
              .attr("height", "100%")
              .attr("width", "100%");

        let class_name = [
            "ui-state-default ",
            target_layer_on_add ? "sortable_target " : result_layer_on_add ? "sortable_result " : null,
            lyr_name
            ].join('');

        let layers_listed = layer_list.node(),
            li = document.createElement("li"),
            nb_ft = parsedJSON.objects[lyr_name].geometries.length;
        li.setAttribute("class", class_name);
        li.setAttribute("layer-tooltip", ["<b>", lyr_name, "</b> - ", type, " - ", nb_ft, " features - ", field_names.length, " fields"].join(''))
        if(target_layer_on_add){
            current_layers[lyr_name].original_fields = new Set(Object.getOwnPropertyNames(user_data[lyr_name][0]));
            if(browse_table.node().disabled === true)
                browse_table.node().disabled = false;

            if(joined_dataset.length != 0){
                document.getElementById("join_button").disabled = false;
                d3.select(".s1").html("").on("click", null)
                d3.select("#sample_link").html("").on("click", null);
                d3.select("#section1").style({"height": "145px", "padding-top": "25px"})
            }

            let _button = button_type[type],
                _lyr_name_display = lyr_name.length > 24 ? [lyr_name.substring(0, 19), '(...)'].join('') : lyr_name;

            _button = _button.substring(10, _button.indexOf("class") - 2);
            d3.select("#img_in_geom").attr({"src": _button, "width": "28", "height": "28"}).on("click", null);
            d3.select('#input_geom').html(['<b>', lyr_name,'</b> - <i><span style="font-size:9.5px;">', nb_ft, ' features - ', field_names.length, ' fields</i></span>'].join(''));
            targeted_layer_added = true;
            li.innerHTML = ['<div class="layer_buttons">', sys_run_button_t2, button_trash, button_zoom_fit, button_active, button_type_blank[type], "</div> ",lyr_name].join('')
            fields_handler.fill(lyr_name);
        } else {
            li.innerHTML = ['<div class="layer_buttons">', result_layer_on_add ? sys_run_button_t2 : button_style, button_trash, button_zoom_fit, button_active, result_layer_on_add ? button_type_blank[type] : button_type[type], "</div> ",lyr_name].join('')
            fields_handler.fill();
        }
        layers_listed.insertBefore(li, layers_listed.childNodes[0])
    }

    if(target_layer_on_add) {
        scale_to_lyr(lyr_name);
        center_map(lyr_name);
    } else if (result_layer_on_add) {
        center_map(lyr_name);
    }
    zoom_without_redraw();
    binds_layers_buttons();
    target_layer_on_add = false;
    alert('Layer successfully added to the canvas');
};

function scale_to_lyr(name){
    var bbox_layer_path = undefined;
    if(name.endsWith("_PropSymbols"))
        name = name.substring(0, name.length - 12);
    d3.select("#"+name).selectAll('path').each(function(d, i){
        var bbox_path = path.bounds(d);
        if(bbox_layer_path === undefined){
            bbox_layer_path = bbox_path;
        }
        else {
            bbox_layer_path[0][0] = bbox_path[0][0] < bbox_layer_path[0][0] ? bbox_path[0][0] : bbox_layer_path[0][0];
            bbox_layer_path[0][1] = bbox_path[0][1] < bbox_layer_path[0][1] ? bbox_path[0][1] : bbox_layer_path[0][1];
            bbox_layer_path[1][0] = bbox_path[1][0] > bbox_layer_path[1][0] ? bbox_path[1][0] : bbox_layer_path[1][0];
            bbox_layer_path[1][1] = bbox_path[1][1] > bbox_layer_path[1][1] ? bbox_path[1][1] : bbox_layer_path[1][1];
        }
    });
    let prev_trans = proj.translate(),
        prev_scale = proj.scale(),
        s = 0.95 / Math.max((bbox_layer_path[1][0] - bbox_layer_path[0][0]) / w, (bbox_layer_path[1][1] - bbox_layer_path[0][1]) / h) * proj.scale();
    proj.scale(s);
    map.selectAll("g:not(.legend_feature)").selectAll("path").attr("d", path);
};


function center_map(name){
    var bbox_layer_path = undefined;
    if(name.indexOf("_PropSymbols") != -1 || name.indexOf("MTA") != -1)
        name = current_layers[name].ref_layer_name
    d3.select("#"+name).selectAll('path').each(function(d, i){
        var bbox_path = path.bounds(d);
        if(bbox_layer_path === undefined){
            bbox_layer_path = bbox_path;
        }
        else {
            bbox_layer_path[0][0] = bbox_path[0][0] < bbox_layer_path[0][0] ? bbox_path[0][0] : bbox_layer_path[0][0];
            bbox_layer_path[0][1] = bbox_path[0][1] < bbox_layer_path[0][1] ? bbox_path[0][1] : bbox_layer_path[0][1];
            bbox_layer_path[1][0] = bbox_path[1][0] > bbox_layer_path[1][0] ? bbox_path[1][0] : bbox_layer_path[1][0];
            bbox_layer_path[1][1] = bbox_path[1][1] > bbox_layer_path[1][1] ? bbox_path[1][1] : bbox_layer_path[1][1];
        }
    });
    var s = .95 / Math.max((bbox_layer_path[1][0] - bbox_layer_path[0][0]) / w, (bbox_layer_path[1][1] - bbox_layer_path[0][1]) / h),
        t = [(w - s * (bbox_layer_path[1][0] + bbox_layer_path[0][0])) / 2, (h - s * (bbox_layer_path[1][1] + bbox_layer_path[0][1])) / 2];
    zoom.scale(s);
    zoom.translate(t);
};

// Some helpers
function strContains(string1, substring){
    return string1.indexOf(substring) >= 0;
};

function strArraysContains(ArrString1, ArrSubstrings){
    var result = [];
    for(var i=0; i < ArrString1.length; i++){
        for(var j=0; j < ArrSubstrings.length; j++){
            if(strContains(ArrString1[i], ArrSubstrings[j])){
            result[result.length] = ArrSubstrings[j];
            }
        }
    }
    return result;
};

function add_layout_features(){
    var available_features = ["North arrow", "Scale", "Sphere background"],
        selected_ft = undefined;

    make_confirm_dialog("", "Valid", "Cancel", "Layout features to be add ...", "sampleLayoutFtDialogBox", 4*w/5, h-10).then(
        function(confirmed){ null; });

    var box_body = d3.select(".sampleLayoutFtDialogBox");

    box_body.append('h3').html("Choose features to be added : ");
    box_body.append("p").style("color", "grey").html("<i>(multiple features can be selected)</i>");

    var layout_ft_selec = box_body.append('p').html('').insert('select').attr({class: 'sample_layout', multiple: "multiple", size: available_features.length});
    available_features.forEach(function(ft){layout_ft_selec.append("option").html(ft).attr("value", ft);});
    layout_ft_selec.on("change", function(){
        let selected_asArray = Array.prototype.slice.call(this.selectedOptions);
        selected_ft = selected_asArray.map(elem => elem.value);
        console.log(selected_ft);
    });


}

function add_layout_layers(){
    var selec = {layout: null, target: null},
        sample_datasets = undefined;

    d3.json('/static/json/sample_layers.json', function(error, json){
        sample_datasets = json[0];
        });

    var layout_layers = [["Nuts 0 (2013) European Country <i>(Polygons)</i>", "nuts0"],
                         ["Nuts 1 (2013) European subdivisions <i>(Polygons)</i>", "nuts1"],
                         ["Nuts 2 (2013) European subdivisions <i>(Polygons)</i>", "nuts2"],
                         ["World countries simplified <i>(Polygons)</i>", "world_country"],
                         ["World country capitals <i>(Points)</i>", "world_cities"],
                         ["Water coverage (sea, lakes and major rivers) <i>(Polygons)</i>", "water_coverage"],
                         ["Graticule", "graticule"]];


    var a = make_confirm_dialog("", "Valid", "Cancel", "Collection of sample layers...", "sampleLayoutDialogBox", 4*w/5, h-10).then(
        function(confirmed){
            if(confirmed){
                let url = undefined;
                if(selec.layout && selec.layout.length > 0){
                    for(let i = 0; i < selec.layout.length; ++i){
                        if(selec.layout[i] === "graticule"){
                            if(current_layers["Graticule"] != undefined)
                                continue
                            map.append("g").attr({id: "Graticule", class: "layer"})
                                   .append("path")
                                   .attr("class", "graticule")
                                   .datum(d3.geo.graticule())
                                   .attr("d", path);
                           current_layers["Graticule"] = {"type": "Line", "n_features":1, "stroke-width-const": "1px"};
                           layer_list.append("li").attr("class", "ui-state-default Graticule").html('<div class="layer_buttons">'+ button_style + button_trash + button_active + "</div> Graticule");
                           zoom_without_redraw();
                           binds_layers_buttons();
                        }
                        else {
                            url = sample_datasets[selec.layout[i]];
                            cache_sample_layer(selec.layout[i]);
                            d3.text(url, function(txt_layer){ add_layer_topojson(txt_layer); })
                        }
                    }
                }
            }
        });

    var box_body = d3.select(".sampleLayoutDialogBox");

    box_body.append('h3').html("Choose layer(s) to be used as layout : ");
    box_body.append("p").style("color", "grey").html("<i>(multiple layers can be selected)</i>");

    var layout_layer_selec = box_body.append('p').html('').insert('select').attr({class: 'sample_layout', multiple: "multiple", size: layout_layers.length});
    layout_layers.forEach(function(layer_info){layout_layer_selec.append("option").html(layer_info[0]).attr("value", layer_info[1]);});
    layout_layer_selec.on("change", function(){
        let selected_asArray = Array.prototype.slice.call(this.selectedOptions);
        selec.layout = selected_asArray.map(elem => elem.value)
    });
}


function add_sample_layer(){
    var dialog_res = [],
        selec = {layout: null, target: null},
        sample_datasets = undefined;

    d3.json('/static/json/sample_layers.json', function(error, json){
        sample_datasets = json[0];
        });

    var target_layers = [["<i>Target layer</i>",""],
                    ["Paris hospital locations <i>(Points)</i>", "paris_hospitals"],
                    ["Grand Paris municipalities <i>(Polygons)</i>", "GrandParisMunicipalities"],
                    ["Nuts 2 (2013) European subdivisions <i>(Polygons)</i>", "nuts2_data"],
                    ["World countries <i>(Polygons)</i>", "world_countries_50m"]];

    var tabular_datasets = [["<i>Tabular dataset</i>",""],
                    ["International Twinning Agreements Between Cities <i>(To link with nuts2 geometries)</i>", "twincities"],
                    ['"Grand Paris" incomes dataset <i>(To link with Grand Paris municipality geometries)</i>', 'gpm_dataset']];

    var a = make_confirm_dialog("", "Valid", "Cancel", "Collection of sample layers...", "sampleDialogBox", 700, 295).then(
        function(confirmed){
            if(confirmed){
                let url = undefined;
                if(selec.target){
                    cache_sample_layer(selec.target);
                    url = sample_datasets[selec.target];
                    d3.text(url, function(txt_layer){
                        target_layer_on_add = true;
                        add_layer_topojson(txt_layer);
                    });
                }
                if(selec.dataset){
                    url = sample_datasets[selec.dataset];
                    d3.csv(url, function(error, data){
                        joined_dataset.push(data);
                        dataset_name = selec.dataset;
                        let field_name = Object.getOwnPropertyNames(joined_dataset[0][0]),
                            d_name = dataset_name.length > 20 ? [dataset_name.substring(0, 17), "(...)"].join('') : dataset_name,
                            nb_features = joined_dataset[0].length;
                        d3.select('#data_ext')
                            .attr("name-tooltip", dataset_name + '.csv')
                            .html([' <b>', d_name,
                                   '</b> - <i><span style="font-size:9.5px;"> ',
                                   nb_features, ' features - ',
                                   field_name.length, " fields</i></span>"].join(''));
                        valid_join_check_display(false);
                        if(targeted_layer_added){
                            document.getElementById("join_button").disabled = false;
                            d3.select(".s1").html("").on("click", null)
                            d3.select("#sample_link").html("").on("click", null);
                            d3.select("#section1").style({"height": "145px", "padding-top": "25px"})
                        } else {
                            document.getElementById("join_button").disabled = true;
                            d3.select("#section1").style("height", "165px");
                        }
                        fields_handler.fill();
                        $("[name-tooltip!='']").qtip( {content: { attr: "name-tooltip" }, style: { classes: 'qtip-tipsy' } } );
                    });
                }
            }
        });

    var box_body = d3.select(".sampleDialogBox");

    var title_tgt_layer = box_body.append('h3').html("Choose a layer to be rendered : ");

    var t_layer_selec = box_body.append('p').html("").insert('select').attr('class', 'sample_target');
    target_layers.forEach(function(layer_info){t_layer_selec.append("option").html(layer_info[0]).attr("value", layer_info[1]);});
    t_layer_selec.on("change", function(){selec.target = this.value;});

    if(targeted_layer_added){
        title_tgt_layer.style("color", "grey").html("<i>Choose a layer to be rendered : </i>");
        t_layer_selec.node().disabled = true;
        }

    box_body.append('h3').html("Choose a dataset to link with geometries: ");

    var dataset_selec = box_body.append('p').html('').insert('select').attr("class", "sample_dataset");
    tabular_datasets.forEach(function(layer_info){dataset_selec.append("option").html(layer_info[0]).attr("value", layer_info[1]);});
    dataset_selec.on("change", function(){selec.dataset = this.value;});
}

function cache_sample_layer(name_layer){
    var formToSend = new FormData();
    formToSend.append("layer_name", name_layer)
    $.ajax({
        processData: false,
        contentType: false,
        global: false,
        url: '/cache_topojson/sample_data',
        data: formToSend,
        type: 'POST',
        error: function(error) { console.log(error); }
    });
}