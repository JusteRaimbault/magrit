"use strict";

function handle_click_layer(layer_name){
    if(current_layers[layer_name].renderer
        && (strContains(current_layers[layer_name].renderer, "PropSymbol")
            || strContains(current_layers[layer_name].renderer, "Dorling")))
        createStyleBox_ProbSymbol(layer_name);
    else
        createStyleBox(layer_name);
    return;
};

let setSelected = function(selectNode, value)
{
    selectNode.value = value;
    selectNode.dispatchEvent(new Event('change'));
}


function make_single_color_menu(layer, fill_prev, symbol = "path"){
    var fill_color_section = d3.select("#fill_color_section"),
        g_lyr_name = "#" + layer,
        last_color = fill_prev.single ? fill_prev.single : undefined;
    fill_color_section.insert('p')
          .html('Fill color<br>')
          .insert('input').attr({type: 'color', "value": last_color})
          .on('change', function(){
                d3.select(g_lyr_name).selectAll(symbol).style("fill", this.value);
                current_layers[layer].fill_color = {"single": this.value};
          });
}

function make_random_color(layer, symbol = "path"){
    d3.select("#fill_color_section")
        .style("text-align", "center")
        .html('<b><i>Click to toggle colors</b></i>')
        .on("click", function(d,i){
            d3.select("#" + layer)
                .selectAll(symbol)
                .style("fill", function(){ return Colors.names[Colors.random()]; });
            current_layers[layer].fill_color = {"random": true};
            make_random_color(layer, symbol);
        });
}

function fill_categorical(layer, field_name, symbol, color_cat_map, ref_layer){
    let data_layer = ref_layer ? user_data[ref_layer] : user_data[layer] ? user_data[layer] : result_data[layer];

    if(ref_layer && current_layers[layer].features_order){
        let features_order = current_layers[layer].features_order;
        d3.select("#"+layer)
            .selectAll(symbol)
            .style("fill", function(d, i){
                let idx = features_order[i];
                return color_cat_map.get(data_layer[idx][field_name]);
            });
    } else if (ref_layer)
        d3.select("#"+layer)
            .selectAll(symbol)
            .style("fill", function(d, i){
                return color_cat_map.get(data_layer[i][field_name]);
            });
    else
        d3.select("#"+layer)
            .selectAll(symbol)
            .style("fill", d => color_cat_map.get(d.properties[field_name]));
}

function make_categorical_color_menu(fields, layer, fill_prev, symbol = "path", ref_layer){
    var fill_color_section = d3.select("#fill_color_section");
    var field_selec = fill_color_section.insert("p").html("Categorical field :")
            .insert("select");
    fields.forEach(function(field){
        field_selec.append("option").text(field).attr("value", field)
    });
    if(fill_prev.categorical && fill_prev.categorical instanceof Array)
        setSelected(field_selec.node(), fill_prev.categorical[0])
    field_selec.on("change", function(){
        let field_name = this.value,
            data_layer = ref_layer ? user_data[ref_layer] : user_data[layer],
            values = data_layer.map(i => i[field_name]),
            cats = new Set(values),
            txt = [cats.size, " cat."].join('');
        console.log(values); console.log(cats)
        d3.select("#nb_cat_txt").html(txt)
        var color_cat_map = new Map();
        for(let val of cats)
            color_cat_map.set(val, Colors.names[Colors.random()])

        current_layers[layer].fill_color = { "categorical": [field_name, color_cat_map] };
        fill_categorical(layer, field_name, symbol, color_cat_map, ref_layer)
    });
    fill_color_section.append("p").attr("id", "nb_cat_txt").html("")
    fill_color_section.append("p").html("Color palette :")
};

let cloneObj = function(obj){
    let tmp;
    if(obj === null || typeof obj !== "object")
        return obj;
    else if(obj.toString() == "[object Map]"){
        tmp = new Map(obj.entries());
    } else {
        tmp = obj.constructor();
        for(let k in obj)
            tmp[k] = cloneObj(obj[k]);
    }
    return tmp;
}


function createStyleBox(layer_name){
    var type = current_layers[layer_name].type,
        rendering_params = null,
        renderer = current_layers[layer_name].renderer;

    if(renderer !== undefined){
        let rep = confirm("The selected layer seems to have been already rendered (with " + renderer + " method). Want to continue ?");
        // Todo : do not ask this but display a choice of palette instead
        if(!rep) return undefined;
    }

    var g_lyr_name = "#" + layer_name,
        selection = d3.select(g_lyr_name).selectAll("path"),
        opacity = selection.style('fill-opacity');

    var fill_prev = cloneObj(current_layers[layer_name].fill_color),
        prev_col_breaks;

    if(current_layers[layer_name].colors_breaks && current_layers[layer_name].colors_breaks instanceof Array)
        prev_col_breaks = current_layers[layer_name].colors_breaks.concat([]);


    var stroke_prev = selection.style('stroke'),
        border_opacity = selection.style('stroke-opacity'),
        stroke_width = current_layers[layer_name]['stroke-width-const'];

    if(stroke_prev.startsWith("rgb")) stroke_prev = rgb2hex(stroke_prev)
    if(stroke_width.endsWith("px")) stroke_width = stroke_width.substring(0, stroke_width.length-2);

    make_confirm_dialog("", "Save", "Close without saving", "Layer style options", "styleBox", undefined, undefined, true)
        .then(function(confirmed){
            if(confirmed){
                // Update the object holding the properties of the layer if Yes is clicked
                if(stroke_width != current_layers[layer_name]['stroke-width-const'])
                    current_layers[layer_name].fixed_stroke = true;
                if(current_layers[layer_name].renderer != undefined && rendering_params != undefined){
                    current_layers[layer_name].fill_color = {"class": rendering_params.colorsByFeature};
                    let colors_breaks = [];
                    for(let i = 0; i<rendering_params['breaks'].length-1; ++i)
                        colors_breaks.push([rendering_params.breaks[i] + " - " + rendering_params.breaks[i+1], rendering_params.colors[i]]);
                    current_layers[layer_name].colors_breaks = colors_breaks;
                    current_layers[layer_name].rendered_field = rendering_params.field;
                    // Also change the legend if there is one displayed :
                    let lgd_choro = d3.select("#legend_root").node();
                    if(lgd_choro){
                        lgd_choro.remove();
                        createLegend_choro(layer_name, rendering_params.field);
                    }
                    if(current_layers[layer_name].rendered_field
                            && current_layers[layer_name].renderer != "Gridded"
                            && current_layers[layer_name].renderer != "Stewart")
                        field_selec.node().selectedOption = current_layers[layer_name].rendered_field;
                }
                sendPreferences();
                zoom_without_redraw();
                console.log(stroke_prev)
            } else {
                // Reset to original values the rendering parameters if "no" is clicked
                selection.style('fill-opacity', opacity)
                             .style('stroke-opacity', border_opacity);
                d3.select(g_lyr_name).style('stroke-width', stroke_width);
                current_layers[layer_name]['stroke-width-const'] = stroke_width;
                let fill_meth = Object.getOwnPropertyNames(fill_prev)[0];
                if(fill_meth == "single") {
                    selection.style('fill', fill_prev.single)
                             .style('stroke', stroke_prev);
                } else if(fill_meth == "class" && renderer != "Links") {
                    selection.style('fill-opacity', opacity)
                           .style("fill", function(d, i){ return current_layers[layer_name].fill_color.class[i] })
                           .style('stroke-opacity', previous_stroke_opacity)
                           .style("stroke", stroke_prev);
                } else if(fill_meth == "class" && renderer == "Links"){
                    selection.style('stroke-opacity', function(d, i){ return current_layers[layer_name].linksbyId[i][0]})
                           .style("stroke", stroke_prev);
                } else if(fill_meth == "random"){
                    selection.style('fill', function(){return Colors.name[Colors.random()];})
                             .style('stroke', stroke_prev);
                } else if(fill_meth == "categorical"){
                    fill_categorical(layer_name, fill_prev.categorical[0], "path", fill_prev.categorical[1])
                } else if(fill_meth == "class"){
                    current_layers[layer_name].colors_breaks = prev_col_breaks;
                }
                current_layers[layer_name].fill_color = fill_prev;
                zoom_without_redraw();
                console.log(stroke_prev);
            }
    });

     var popup = d3.select(".styleBox");
     popup.append('h4').style({"font-size": "15px", "text-align": "center", "font-weight": "bold"}).html("Layer style option");
     popup.append("p").html(['Layer name : <b>', layer_name,'</b><br>',
                             'Geometry type : <b><i>', type, '</b></i>'].join(''));

     if(type !== 'Line'){
        if(current_layers[layer_name].colors_breaks == undefined){
            if(sample_no_values.get(layer_name)){
                popup.append('div').attr({id: "fill_color_section"})
                make_single_color_menu(layer_name, fill_prev);
            } else {
                let fields = type_col(layer_name, "string");
                let fill_method = popup.append("p").html("Fill color").insert("select");
                [["Single color", "single"],
                 ["Color according to a categorical field", "categorical"],
                 ["Random color on each feature", "random"]].forEach(function(d,i){
                        fill_method.append("option").text(d[0]).attr("value", d[1])  });
                popup.append('div').attr({id: "fill_color_section"})
                fill_method.on("change", function(){
                    d3.select("#fill_color_section").html("").on("click", null);
                    if (this.value == "single")
                        make_single_color_menu(layer_name, fill_prev);
                    else if (this.value == "categorical")
                        make_categorical_color_menu(fields, layer_name, fill_prev);
                    else if (this.value == "random")
                        make_random_color(layer_name);
                    });
                setSelected(fill_method.node(), Object.getOwnPropertyNames(fill_prev)[0])
            }
         } else {
            let field_to_discretize;
            if(renderer == "Gridded")
                field_to_discretize = "densitykm";
            else if(renderer == "Stewart")
                field_to_discretize = "center";
            else {
                var fields = type_col(layer_name, "number"),
                    field_selec = popup.append('p').html('Field :').insert('select').attr('class', 'params').on("change", function(){ field_to_discretize = this.value; });
                field_to_discretize = fields[0];
                fields.forEach(function(field){ field_selec.append("option").text(field).attr("value", field); });
                if(current_layers[layer_name].rendered_field && fields.indexOf(current_layers[layer_name].rendered_field) > -1)
                    setSelected(field_selec.node(), current_layers[layer_name].rendered_field)
            }

             popup.append('p').style("margin", "auto").html("")
                .append("button")
                .attr("class", "button_disc")
                .html("Display and arrange class")
                .on("click", function(){
                    display_discretization(layer_name, field_to_discretize, current_layers[layer_name].colors_breaks.length, "Quantiles")
                        .then(function(confirmed){
                            console.log(confirmed);
                            if(confirmed){
                                rendering_params = {
                                    nb_class: confirmed[0],
                                    type: confirmed[1],
                                    breaks: confirmed[2],
                                    colors:confirmed[3],
                                    colorsByFeature: confirmed[4],
                                    renderer:"Choropleth",
                                    field: field_to_discretize
                                };
                                selection.style('fill-opacity', 0.9)
                                         .style("fill", function(d, i){ return rendering_params.colorsByFeature[i] })
                            }
                        });
                });
         }
         popup.append('p').html('Fill opacity<br>')
                          .insert('input').attr('type', 'range')
                          .attr("min", 0).attr("max", 1).attr("step", 0.1).attr("value", opacity)
                          .on('change', function(){selection.style('fill-opacity', this.value)});
    } else if (type === "Line" && renderer == "Links"){
        var prev_min_display = current_layers[layer_name].min_display || 0;
        let max_val = 0,
            previous_stroke_opacity = selection.style("stroke-opacity");
        selection.each(function(d){if(d.properties.fij > max_val) max_val = d.properties.fij;})
        popup.append('p').html('Only display flows larger than ...')
                        .insert('input').attr({type: 'range', min: 0, max: max_val, step: 0.5, value: prev_min_display})
                        .on("change", function(){
                            let val = this.value;
                            d3.select("#larger_than").html(["<i> ", val, " </i>"].join(''));
                            selection.style("stroke-opacity", function(d, i){
                                if(+d.properties.fij > +val)
                                    return 1;
                                return 0;
                            });
                            current_layers[layer_name].min_display = val;
                        });
        popup.append('label').attr("id", "larger_than").html('<i> 0 </i>')
     }

     popup.append('p').html(type === 'Line' ? 'Color<br>' : 'Border color<br>')
                      .insert('input').attr('type', 'color').attr("value", stroke_prev)
                      .on('change', function(){selection.style("stroke", this.value)});
     popup.append('p').html(type === 'Line' ? 'Opacity<br>' : 'Border opacity<br>')
                      .insert('input').attr('type', 'range').attr("min", 0).attr("max", 1).attr("step", 0.1).attr("value", border_opacity)
                      .on('change', function(){selection.style('stroke-opacity', this.value)});
     popup.append('p').html(type === 'Line' ? 'Width (px)<br>' : 'Border width<br>')
                      .insert('input').attr('type', 'number').attr("value", stroke_width).attr("step", 0.1)
                      .on('change', function(){d3.select(g_lyr_name).style("stroke-width", this.value+"px");current_layers[layer_name]['stroke-width-const'] = this.value+"px"});
}


function deactivate(forpopup){
    for(var i=0; i < forpopup.length; i++){
        var elem = forpopup[i];
        elem.remove();
    }
}

function viewport(){
    var  innerw = window.innerWidth
        ,body   = document.documentElement || document.body
        ,root   = innerw  ? window : body
        ,which  = innerw ? 'inner' : 'client';
    return {  width : root[ which+'Width' ]
             ,height : root[ which+'Height' ]
             ,scrollTop: body.scrollTop
             ,scrollLeft: body.scrollLeft };
}

function center(el){
  var dims = viewport(),
      h = Math.floor((0.20*dims.height));
  el.style.right= '0px';
  el.style.top =  h+'px';
  return true;
}

function createStyleBox_ProbSymbol(layer_name){
    var g_lyr_name = "#" + layer_name,
        ref_layer_name = current_layers[layer_name].ref_layer_name || layer_name.substring(0, layer_name.indexOf("_Prop")),
        type_method = current_layers[layer_name].renderer,
        type_symbol = current_layers[layer_name].symbol,
        field_used = current_layers[layer_name].rendered_field,
        selection = d3.select(g_lyr_name).selectAll(type_symbol),
        rendering_params;

     var stroke_prev = selection.style('stroke'),
         opacity = selection.style('fill-opacity'),
         border_opacity = selection.style('stroke-opacity'),
         stroke_width = selection.style('stroke-width');

    var fill_prev = cloneObj(current_layers[layer_name].fill_color),
        prev_col_breaks;

    if(current_layers[layer_name].colors_breaks && current_layers[layer_name].colors_breaks instanceof Array)
        prev_col_breaks = current_layers[layer_name].colors_breaks.concat([]);

    if(stroke_prev.startsWith("rgb")) stroke_prev = rgb2hex(stroke_prev)
    if(stroke_width.endsWith("px")) stroke_width = stroke_width.substring(0, stroke_width.length-2);

    make_confirm_dialog("", "Save", "Close without saving", "Layer style options", "styleBox", undefined, undefined, true)
        .then(function(confirmed){
            if(confirmed){
                let max_val = d3.select("#max_size_range").node().value;
                current_layers[layer_name].size[1] = max_val;
                console.log(rendering_params, type_method)
                if(type_method == "PropSymbolsChoro"){
                    current_layers[layer_name].fill_color = {"class": rendering_params.colorsByFeature };
                    let colors_breaks = [];
                    for(let i = 0; i<rendering_params['breaks'].length-1; ++i)
                        colors_breaks.push([rendering_params.breaks[i] + " - " + rendering_params.breaks[i+1], rendering_params.colors[i]]);
                    current_layers[layer_name].colors_breaks = colors_breaks;
                    current_layers[layer_name].rendered_field2 = rendering_params.field;
                    // Also change the legend if there is one displayed :
                    let lgd_choro = d3.select("#legend_root").node();
                    if(lgd_choro){
                        lgd_choro.remove();
                        createLegend_choro(layer_name, rendering_params.field);
                    }
                }
            } else {
                selection.style('fill-opacity', opacity)
                             .style('stroke-opacity', border_opacity);
                d3.select(g_lyr_name).style('stroke-width', stroke_width);
                current_layers[layer_name]['stroke-width-const'] = stroke_width + "px";
                let fill_meth = Object.getOwnPropertyNames(fill_prev)[0];
                if(fill_meth == "single") {
                    selection.style('fill', fill_prev.single)
                             .style('stroke', stroke_prev);
                } else if(fill_meth == "class" && renderer != "Links") {
                    selection.style('fill-opacity', opacity)
                           .style("fill", function(d, i){ return current_layers[layer_name].fill_color.class[i] })
                           .style('stroke-opacity', previous_stroke_opacity)
                           .style("stroke", stroke_prev);
                } else if(fill_meth == "class" && renderer == "Links"){
                    selection.style('stroke-opacity', function(d, i){ return current_layers[layer_name].linksbyId[i][0]})
                           .style("stroke", stroke_prev);
                } else if(fill_meth == "random"){
                    selection.style('fill', function(){return Colors.name[Colors.random()];})
                             .style('stroke', stroke_prev);
                } else if(fill_meth == "categorical"){
                    fill_categorical(layer_name, fill_prev.categorical[0],
                                     type_symbol, fill_prev.categorical[1],
                                     ref_layer_name)
                } else if(fill_meth == "class"){
                    current_layers[layer_name].colors_breaks = prev_col_breaks;
                }
                current_layers[layer_name].fill_color = fill_prev;
            }
            zoom_without_redraw();
        });

    var d_values = [],
        comp = function(a, b){return b-a};
    for(let i = 0, i_len = user_data[ref_layer_name].length; i < i_len; ++i)
        d_values.push(+user_data[ref_layer_name][i][field_used]);

    d_values.sort(comp);

    var popup = d3.select(".styleBox");
    popup.append('h4').style({"font-size": "15px", "text-align": "center", "font-weight": "bold"}).html("Layer style option");
    popup.append("p").html(['Rendered layer : <b>', ref_layer_name,'</b><br>'].join(''));
    popup.append('p').html('Symbol color<br>');
    if(type_method === "PropSymbolsChoro"){
        let field_color = current_layers[layer_name].rendered_field2;
         popup.append('p').style("margin", "auto").html("Field used for symbol colors : <i>" + field_color + "</i><br>")
            .append("button").attr("class", "button_disc").html("Display and arrange class")
            .on("click", function(){display_discretization(ref_layer_name, field_color, current_layers[layer_name].colors_breaks.length, "Quantiles")
          .then(function(confirmed){
            if(confirmed){
                rendering_params = {
                    nb_class: confirmed[0], type: confirmed[1],
                    breaks: confirmed[2], colors:confirmed[3],
                    colorsByFeature: confirmed[4],
                    renderer:"PropSymbolsChoro",
                    field: field_color
                    };
                selection.style('fill-opacity', 0.9)
                         .style("fill", function(d, i){
                    let ft_id = +current_layers[layer_name].features_order[i];
                    return rendering_params.colorsByFeature[ft_id];
                });
             }
            }); });
    } else {
        /*
        popup.insert('input').attr('type', 'color').attr("value", fill_prev)
             .on('change', function(){selection.style("fill", this.value)});
        */
        let fields = type_col(ref_layer_name, "string");
        let fill_method = popup.append("p").html("Fill color").insert("select");
        [["Single color", "single"],
         ["Color according to a categorical field", "categorical"],
         ["Random color on each feature", "random"]].forEach(function(d,i){
                fill_method.append("option").text(d[0]).attr("value", d[1])  });
        popup.append('div').attr({id: "fill_color_section"})
        fill_method.on("change", function(){
            d3.select("#fill_color_section").html("").on("click", null);
            if (this.value == "single")
                make_single_color_menu(layer_name, fill_prev, type_symbol);
            else if (this.value == "categorical")
                make_categorical_color_menu(fields, layer_name, fill_prev, type_symbol, ref_layer_name);
            else if (this.value == "random")
                make_random_color(layer_name, type_symbol);
        });
        setSelected(fill_method.node(), Object.getOwnPropertyNames(fill_prev)[0])
    }
    popup.append('p').html('Fill opacity<br>')
                      .insert('input').attr('type', 'range')
                      .attr("min", 0).attr("max", 1).attr("step", 0.1).attr("value", opacity)
                      .on('change', function(){selection.style('fill-opacity', this.value)});

    popup.append('p').html('Border color<br>')
                      .insert('input').attr('type', 'color').attr("value", stroke_prev)
                      .on('change', function(){selection.style("stroke", this.value)});
    popup.append('p').html('Border opacity<br>')
                      .insert('input').attr('type', 'range').attr("min", 0).attr("max", 1).attr("step", 0.1).attr("value", border_opacity)
                      .on('change', function(){selection.style('stroke-opacity', this.value)});
    popup.append('p').html('Border width<br>')
                      .insert('input').attr('type', 'number').attr("value", stroke_width).attr("step", 0.1)
                      .on('change', function(){selection.style("stroke-width", this.value+"px");current_layers[layer_name]['stroke-width-const'] = this.value+"px"});
    popup.append("p").html("Field used for proportionals values : <i>" + current_layers[layer_name].rendered_field + "</i>")
    popup.append('p').html('Symbol max size<br>')
                      .insert('input').attr("type", "range").attr({id: "max_size_range", min: 1, max: 50, step: 0.1, value: current_layers[layer_name].size[1]})
                      .on("change", function(){
                          let z_scale = zoom.scale(),
                              prop_values = prop_sizer(d_values, Number(current_layers[layer_name].size[0] / z_scale), Number(this.value / z_scale));
                          if(type_method.indexOf("Dorling") > -1){
                            d3.select(g_lyr_name).sele
                            make_dorling_demers(ref_layer_name, current_layers[layer_name].rendered_field, this.value, current_layers[layer_name].size[0], layer_name)
                          } else {
                              if(type_symbol === "circle") {
                                  for(let i=0, len = prop_values.length; i < len; i++){
                                      selection[0][i].setAttribute('r', +current_layers[layer_name].size[0] / z_scale + prop_values[i])
                                  }
                              } else if(type_symbol === "rect") {
                                  for(let i=0, len = prop_values.length; i < len; i++){
                                      let sz = +current_layers[layer_name].size[0] / z_scale + prop_values[i],
                                          old_size = +selection[0][i].getAttribute('height'),
                                          centr = [+selection[0][i].getAttribute("x") + (old_size/2) - (sz / 2),
                                                   +selection[0][i].getAttribute("y") + (old_size/2) - (sz / 2)];
                                      selection[0][i].setAttribute('x', centr[0]);
                                      selection[0][i].setAttribute('y', centr[1]);
                                      selection[0][i].setAttribute('height', sz);
                                      selection[0][i].setAttribute('width', sz);
                                  }
                              }
                            }
                      });
}