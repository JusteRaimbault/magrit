"use strict";
/*
* Memoization functions (naive LRU implementation)
*
*/

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

Function.prototype.memoized = function () {
    var max_size = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 25;

    this._memo = this._memo || { values: new Map(), stack: [], max_size: max_size };
    var key = JSON.stringify(Array.prototype.slice.call(arguments));
    var cache_value = this._memo.values.get(key);
    if (cache_value !== undefined) {
        return JSON.parse(cache_value);
    } else {
        cache_value = this.apply(this, arguments);
        this._memo.values.set(key, JSON.stringify(cache_value));
        this._memo.stack.push(key);
        if (this._memo.stack.length >= this._memo.max_size) {
            var old_key = this._memo.stack.shift();
            this._memo.values.delete(old_key);
        }
        return cache_value;
    }
};
Function.prototype.memoize = function () {
    var fn = this;
    return function () {
        return fn.memoized.apply(fn, arguments);
    };
};

/**
* Function setting-up main elements of the interface
*
* Some of the variables created here are put in global/window scope
* as they are gonna be frequently used
*
*/
function setUpInterface(resume_project) {
    // Only ask for confirmation before leaving page if things have been done
    // (layer added, etc..)
    window.addEventListener("beforeunload", beforeUnloadWindow);

    // Remove some layers from the server when user leave the page
    // (ie. result layers are removed but targeted layer and layout layers stay
    // in cache as they have more chance to be added again)
    window.addEventListener("unload", function () {
        var layer_names = Object.getOwnPropertyNames(current_layers).filter(function (name) {
            if (sample_no_values.has(name) || !current_layers[name].hasOwnProperty("key_name")) return 0;else if (current_layers[name].targeted) return 0;else if (current_layers[name].renderer && (current_layers[name].renderer.indexOf("PropSymbols") > -1 || current_layers[name].renderer.indexOf("Dorling") > -1 || current_layers[name].renderer.indexOf("Choropleth") > -1 || current_layers[name].renderer.indexOf("Categorical") > -1)) return 0;
            return 1;
        });
        if (layer_names.length) {
            (function () {
                var formToSend = new FormData();
                layer_names.forEach(function (name) {
                    formToSend.append("layer_name", current_layers[name].key_name);
                });
                navigator.sendBeacon("/layers/delete", formToSend);
            })();
        }
    }, false);
    var bg = document.createElement('div');
    bg.id = 'overlay';
    bg.style.display = "none";
    bg.style.textAlign = "center";
    bg.innerHTML = '<span class="i18n" style="color: white; z-index: 2;margin-top:185px;display: inline-block;" data-i18n="[html]app_page.common.loading_results"></span>' + '<span style="color: white; z-index: 2;">...<br></span>' + '<span class="i18n" style="color: white; z-index: 2;display: inline-block;" data-i18n="[html]app_page.common.long_computation"></span><br>' + '<div class="load-wrapp" style="left: calc(50% - 60px);position: absolute;top: 50px;"><div class="load-1"><div class="line"></div>' + '<div class="line"></div><div class="line"></div></div></div>';
    var btn = document.createElement("button");
    btn.style.fontSize = '13px';
    btn.style.background = '#4b9cdb';
    btn.style.border = '1px solid #298cda';
    btn.style.fontWeight = 'bold';
    btn.className = "button_st3 i18n";
    btn.setAttribute("data-i18n", "[html]app_page.common.cancel");
    bg.appendChild(btn);
    document.body.appendChild(bg);

    btn.onclick = function () {
        if (_app.xhr_to_cancel) {
            _app.xhr_to_cancel.abort();
            _app.xhr_to_cancel = undefined;
        }
        if (_app.webworker_to_cancel) {
            _app.webworker_to_cancel.onmessage = null;
            _app.webworker_to_cancel.terminate();
            _app.webworker_to_cancel = undefined;
        }
        document.getElementById('overlay').style.display = 'none';
    };

    var bg_drop = document.createElement('div');
    bg_drop.className = "overlay_drop";
    bg_drop.id = 'overlay_drop';
    bg_drop.style = "background: black; opacity:0.6;display: none;padding: 10px;";
    var inner_div = document.createElement("div");
    inner_div.style.border = "dashed 2px white";
    inner_div.style.margin = "10px";
    inner_div.style.background = "rgba(0, 0, 0, 0.33)";
    inner_div.style.borderRadius = "1%";
    inner_div.className = "overlay_drop";
    var inner_p = document.createElement("p");
    inner_p.style = "position: fixed;top: 50%;left: 50%;transform: translateX(-50%)translateY(-50%);font-size: 14px;width: auto;bottom: 0px;opacity: 0.85;text-align: center;color: white;padding: 0.5em;";
    inner_p.innerHTML = "Drop your file(s) in the window ...";
    inner_div.appendChild(inner_p);
    bg_drop.appendChild(inner_div);
    document.body.appendChild(bg_drop);

    var proj_options = d3.select(".header_options_projection").append("div").attr("id", "const_options_projection").style("display", "inline-flex");;

    var proj_select = proj_options.append("div").attrs({ class: 'styled-select' }).insert("select").attrs({ class: 'i18n', 'id': 'form_projection' }).styles({ "width": "calc(100% + 20px)" }).on("change", function () {
        current_proj_name = this.value;
        change_projection(this.value);
    });
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = available_projections.keys()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var proj_name = _step.value;

            proj_select.append('option').attrs({ class: 'i18n', value: proj_name, 'data-i18n': 'app_page.projection_name.' + proj_name }).text(i18next.t('app_page.projection_name.' + proj_name));
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }

    proj_select.node().value = "NaturalEarth";

    var proj_options2 = proj_options.append("div");
    proj_options2.append("input").attrs({ type: "range", id: "form_projection_center", value: 0.0,
        min: -180.0, max: 180.0, step: 0.1 }).styles({ width: window.innerWidth && window.innerWidth > 1024 ? "120px" : '60px',
        'margin': "0 0 0 15px",
        "vertical-align": "text-top" }).on("input", function () {
        handle_proj_center_button([this.value, null, null]);
        document.getElementById("proj_center_value_txt").value = +this.value;
    });

    proj_options2.append("input").attrs({ type: "number", class: "without_spinner", id: "proj_center_value_txt",
        min: -180.0, max: 180.0, value: 0, step: "any" }).styles({ width: "40px", "margin": "0 10px",
        "color": " white", "background-color": "#000",
        "vertical-align": "calc(20%)" }).on("change", function () {
        var val = +this.value,
            old_value = +document.getElementById('form_projection_center').value;
        if (this.value.length == 0 || val > 180 || val < -180) {
            this.value = old_value;
            return;
        } else {
            // Should remove trailing zeros (right/left) if any :
            this.value = +this.value;
        }
        handle_proj_center_button([this.value, null, null]);
        document.getElementById("form_projection_center").value = this.value;
    });
    proj_options2.append("span").style("vertical-align", "calc(20%)").html("°");

    proj_options2.append('img').attrs({ 'id': 'btn_customize_projection', 'src': '/static/img/High-contrast-system-run.png' }).styles({ 'vertical-align': 'calc(-15%)', 'margin-right': '5px', 'width': '20px', 'height': '20px' }).on('click', createBoxCustomProjection);

    var const_options = d3.select(".header_options_right").append("div").attr("id", "const_options").style("display", "inline");

    const_options.append('button').attrs({ class: 'const_buttons i18n', id: 'new_project', 'data-i18n': '[tooltip-title]app_page.tooltips.new_project', 'data-placement': 'bottom' }).styles({ cursor: 'pointer', background: 'transparent', 'margin-top': '5px' }).html('<img src="/static/img/File_font_awesome_blank.png" width="25" height="auto" alt="Load project file"/>').on('click', function () {
        window.localStorage.removeItem("magrit_project");
        window.removeEventListener("beforeunload", beforeUnloadWindow);
        location.reload();
    });

    const_options.append('button').attrs({ class: 'const_buttons i18n', id: 'load_project', 'data-i18n': '[tooltip-title]app_page.tooltips.load_project_file', 'data-placement': 'bottom' }).styles({ cursor: 'pointer', background: 'transparent', 'margin-top': '5px' }).html('<img src="/static/img/Folder_open_alt_font_awesome.png" width="25" height="auto" alt="Load project file"/>').on('click', load_map_template);

    const_options.append('button').attrs({ class: 'const_buttons i18n', id: 'save_file_button', 'data-i18n': '[tooltip-title]app_page.tooltips.save_file', 'data-placement': 'bottom' }).styles({ cursor: 'pointer', background: 'transparent', 'margin': 'auto' }).html('<img src="/static/img/Breezeicons-actions-22-document-save-blank.png" width="25" height="auto" alt="Save project to disk"/>').on('click', save_map_template);

    const_options.append('button').attrs({ class: 'const_buttons i18n', id: 'documentation_link', 'data-i18n': '[tooltip-title]app_page.tooltips.documentation', 'data-placement': 'bottom' }).styles({ cursor: 'pointer', background: 'transparent', 'margin-top': '5px' }).html('<img src="/static/img/Documents_icon_-_noun_project_5020_white.png" width="20" height="auto" alt="Documentation"/>').on('click', function () {
        window.open('/static/book/index.html', 'DocWindow', "toolbar=yes,menubar=yes,resizable=yes,scrollbars=yes,status=yes").focus();
    });

    const_options.append("button").attrs({ id: "help_btn", class: "const_buttons i18n",
        "data-i18n": "[tooltip-title]app_page.help_box.tooltip_btn",
        "data-placement": "bottom" }).styles({ cursor: "pointer", background: "transparent" }).html('<img src="/static/img/High-contrast-help-browser_blank.png" width="20" height="20" alt="export_load_preferences" style="margin-bottom:3px;"/>').on("click", function () {
        if (document.getElementById("menu_lang")) document.getElementById("menu_lang").remove();
        var click_func = function click_func(window_name, target_url) {
            window.open(target_url, window_name, "toolbar=yes,menubar=yes,resizable=yes,scrollbars=yes,status=yes").focus();
        };
        var box_content = '<div class="about_content">' + '<p style="font-size: 0.8em; margin-bottom:auto;"><span>' + i18next.t('app_page.help_box.version', { version: "0.1.0" }) + '</span></p>' + '<p><b>' + i18next.t('app_page.help_box.useful_links') + '</b></p>' +
        // '<p><button class="swal2-styled swal2_blue btn_doc">' + i18next.t('app_page.help_box.doc') + '</button></p>' +
        '<p><button class="swal2-styled swal2_blue btn_doc">' + i18next.t('app_page.help_box.carnet_hypotheses') + '</button></p>' + '<p><button class="swal2-styled swal2_blue btn_contact">' + i18next.t('app_page.help_box.contact') + '</button></p>' + '<p><button class="swal2-styled swal2_blue btn_gh">' + i18next.t('app_page.help_box.gh_link') + '</button></p>' + '<p style="font-size: 0.8em; margin:auto;"><span>' + i18next.t('app_page.help_box.credits') + '</span></p></div>';
        swal({
            title: i18next.t("app_page.help_box.title"),
            html: box_content,
            showCancelButton: true,
            showConfirmButton: false,
            cancelButtonText: i18next.t('app_page.common.close'),
            animation: "slide-from-top",
            onOpen: function onOpen() {
                var content = document.getElementsByClassName('about_content')[0];
                var credit_link = content.querySelector('#credit_link');
                credit_link.style.fontWeight = "bold";
                credit_link.style.cursor = "pointer";
                credit_link.color = "#000";
                credit_link.onclick = function () {
                    window.open('http://riate.cnrs.fr', 'RiatePage', "toolbar=yes,menubar=yes,resizable=yes,scrollbars=yes,status=yes").focus();
                };
                content.querySelector('.btn_doc').onclick = function () {
                    window.open('http://magrit.hypotheses.org/', "Carnet hypotheses", "toolbar=yes,menubar=yes,resizable=yes,scrollbars=yes,status=yes").focus();
                };
                content.querySelector('.btn_contact').onclick = function () {
                    window.open('/contact', 'ContactWindow', "toolbar=yes,menubar=yes,resizable=yes,scrollbars=yes,status=yes").focus();
                };
                content.querySelector('.btn_gh').onclick = function () {
                    window.open('https://www.github.com/riatelab/magrit', 'GitHubPage', "toolbar=yes,menubar=yes,resizable=yes,scrollbars=yes,status=yes").focus();
                };
            }
        }).then(function (inputValue) {
            null;
        }, function (dismissValue) {
            null;
        });
    });

    const_options.append("button").attrs({ id: "current_app_lang", class: "const_buttons" }).styles({ color: "white", cursor: 'pointer',
        "font-size": "14px", "vertical-align": "super",
        background: "transparent", "font-weight": "bold" }).html(i18next.language).on("click", function () {
        if (document.getElementById("menu_lang")) document.getElementById("menu_lang").remove();else {
            (function () {
                var current_lang = i18next.language;
                var other_langs = current_lang == "en" ? ["es", "fr"] : current_lang == "fr" ? ["en", "es"] : ["en", "fr"];
                var actions = [{ "name": current_lang, "callback": change_lang }, { "name": other_langs[0], "callback": change_lang }, { "name": other_langs[1], "callback": change_lang }];
                var menu = document.createElement("div");
                menu.style.top = "40px";
                menu.style.right = "0px";
                menu.className = "context-menu";
                menu.id = "menu_lang";
                menu.style.minWidth = "30px";
                menu.style.width = "50px";
                menu.style.background = "#000";
                var list_elems = document.createElement("ul");
                menu.appendChild(list_elems);

                var _loop = function _loop(i) {
                    var item = document.createElement("li"),
                        name = document.createElement("span");
                    list_elems.appendChild(item);
                    item.setAttribute("data-index", i);
                    item.style.textAlign = "right";
                    item.style.paddingRight = "16px";
                    name.className = "context-menu-item-name";
                    name.style.color = "white";
                    name.textContent = actions[i].name;
                    item.appendChild(name);
                    item.onclick = function () {
                        actions[i].callback();
                        menu.remove();
                    };
                };

                for (var i = 0; i < actions.length; i++) {
                    _loop(i);
                }
                document.querySelector("body").appendChild(menu);
            })();
        }
    });

    var menu = d3.select("#menu"),
        b_accordion1 = menu.append("button").attr("id", "btn_s1").attr("class", "accordion i18n").attr("data-i18n", "app_page.section1.title"),
        accordion1 = menu.append("div").attr("class", "panel").attr("id", "accordion1"),
        b_accordion2_pre = menu.append("button").attr("id", "btn_s2").attr("class", "accordion i18n").attr("data-i18n", "app_page.section2.title"),
        accordion2_pre = menu.append("div").attr("class", "panel").attr("id", "accordion2_pre"),
        b_accordion2 = menu.append("button").attr("id", "btn_s2b").attr("class", "accordion i18n").style('display', 'none'),
        accordion2 = menu.append("div").attr("class", "panel").attr("id", "accordion2b").style('display', 'none'),
        b_accordion3 = menu.append("button").attr("id", "btn_s3").attr("class", "accordion i18n").attr("data-i18n", "app_page.section3.title"),
        accordion3 = menu.append("div").attr("class", "panel").attr("id", "accordion3"),
        b_accordion4 = menu.append("button").attr("id", "btn_s4").attr("class", "accordion i18n").attr("data-i18n", "app_page.section4.title"),
        accordion4 = menu.append("div").attr("class", "panel").attr("id", "accordion4"),
        b_accordion5 = menu.append("button").attr("id", "btn_s5").attr("class", "accordion i18n").attr("data-i18n", "app_page.section5b.title"),
        accordion5 = menu.append("div").attr("class", "panel").attr("id", "accordion5b");

    window.section1 = accordion1.append("div").attr("id", "section1").attr("class", "i18n").attr("data-i18n", "[tooltip-title]app_page.tooltips.section1").attr("data-placement", "right");
    window.section2_pre = accordion2_pre.append("div").attr("id", "section2_pre");
    window.section2 = accordion2.append('div').attr('id', 'section2');
    accordion3.append("div").attrs({ id: "section3" }), accordion4.append("div").attr("id", "section4");
    accordion5.append("div").attr("id", "section5");

    var dv1 = section1.append("div"),
        dv11 = dv1.append("div").style("width", "auto");

    dv11.append("img").attrs({ "id": "img_in_geom", "class": "user_panel", "src": "/static/img/b/addgeom.png", "width": "26", "height": "26", "alt": "Geometry layer" }).style("cursor", "pointer").on('click', click_button_add_layer);

    dv11.append("p").attrs({ id: "input_geom", class: "user_panel i18n" }).styles({ display: "inline", cursor: "pointer", "margin-left": "5px", "vertical-align": "super", "font-weight": "bold" }).attr("data-i18n", "[html]app_page.section1.add_geom").on('click', click_button_add_layer);

    var dv12 = dv1.append("div");
    dv12.append("img").attrs({ "id": "img_data_ext", "class": "user_panel", "src": "/static/img/b/addtabular.png", "width": "26", "height": "26", "alt": "Additional dataset" }).style("cursor", "pointer").on('click', click_button_add_layer);

    dv12.append("p").attrs({ "id": "data_ext", "class": "user_panel i18n", "data-i18n": "[html]app_page.section1.add_ext_dataset" }).styles({ display: "inline", cursor: "pointer", "margin-left": "5px", "vertical-align": "super", "font-weight": "bold" }).on('click', click_button_add_layer);

    var div_sample = dv1.append("div").attr("id", "sample_zone");
    div_sample.append("img").attrs({ "id": "sample_button", "class": "user_panel", "src": "/static/img/b/addsample.png", "width": "26", "height": "26", "alt": "Sample layers" }).style("cursor", "pointer").on('click', add_sample_layer);

    div_sample.append("span").attrs({ "id": "sample_link", "class": "user_panel i18n" }).styles({ display: "inline", cursor: "pointer", "margin-left": "5px", "vertical-align": "super", "font-weight": "bold" }).attr("data-i18n", "[html]app_page.section1.add_sample_data").on('click', add_sample_layer);

    dv1.append("p").attr("id", "join_section").styles({ "text-align": "center", "margin-top": "2px" }).html("");

    dv1.append('p').styles({ 'text-align': 'center', 'margin': '5px' }).insert('button').attrs({ 'id': 'btn_type_fields', 'class': 'i18n',
        'data-i18n': '[html]app_page.box_type_fields.title',
        'disabled': true }).styles({ cursor: 'pointer',
        'border-radius': '4px',
        'border': '1px solid lightgrey',
        'padding': '3.5px' }).html(i18next.t('app_page.box_type_fields.title')).on('click', function () {
        var layer_name = Object.getOwnPropertyNames(user_data)[0];
        make_box_type_fields(layer_name);
    });

    make_ico_choice();
    add_simplified_land_layer();

    var section3 = d3.select("#section3");

    window.layer_list = section3.append("div").attrs({ class: "i18n",
        "data-i18n": "[tooltip-title]app_page.tooltips.section3",
        "data-placement": "right" }).append("ul").attrs({ id: "sortable", class: "layer_list" });

    var dv3 = section3.append("div").style("padding-top", "10px").html('');

    dv3.append("img").attrs({ "src": "/static/img/b/addsample_t.png", class: 'i18n',
        "data-i18n": "[tooltip-title]app_page.tooltips.section3_add_layout_sample",
        "data-placement": "right" }).styles({ cursor: "pointer", margin: "2.5px", float: "right", "border-radius": "10%" }).on('click', add_layout_layers);
    dv3.append("img").attrs({ "src": "/static/img/b/addgeom_t.png", 'id': 'input_layout_geom', class: 'i18n',
        "data-i18n": "[tooltip-title]app_page.tooltips.section3_add_layout",
        "data-placement": "right" }).styles({ cursor: "pointer", margin: "2.5px", float: "right", "border-radius": "10%" }).on("click", click_button_add_layer);

    var section4 = d3.select("#section4");
    var dv4 = section4.append("div").attr("class", "form-item").style("margin", "auto").append("ul").styles({ "list-style": "outside none none",
        display: "inline-block",
        padding: "0px",
        width: "100%",
        "margin-top": "0px" });

    var e = dv4.append("li").styles({ margin: "1px", padding: "4px", "text-align": "center" });
    e.append("input").attrs({ "id": "title", "class": "list_elem_section4 i18n",
        "placeholder": "", "data-i18n": "[placeholder]app_page.section4.map_title" }).styles({ "margin": "0px 0px 0px 3px", "width": "160px" }).on("keyup", function () {
        handle_title(this.value);
    });
    e.append("span").styles({ display: "inline", top: "4px", cursor: "pointer", "vertical-align": "sub" }).html(sys_run_button.replace("submit", "Title properties")).on("click", handle_title_properties);

    var f = dv4.append("li").styles({ margin: "1px", padding: "4px" });
    f.append("p").attr("class", "list_elem_section4 i18n").attr("data-i18n", "[html]app_page.section4.background_color");
    f.append("input").styles({ position: "absolute", right: "20px", "width": "60px", "margin-left": "15px" }).attrs({ type: "color", id: "bg_color", value: "#ffffff", "class": "list_elem_section4 m_elem_right" }).on("change", function () {
        handle_bg_color(this.value);
    });

    var a1 = dv4.append("li").styles({ margin: "1px", padding: "4px" });
    a1.append("p").attr("class", "list_elem_section4 i18n").attr("data-i18n", "[html]app_page.section4.map_width");
    a1.append("input").attrs({ id: "input-width", type: "number", value: w, "class": "list_elem_section4 m_elem_right" }).on("change", function () {
        var new_width = +this.value;
        if (new_width == 0 || isNaN(new_width)) {
            this.value = w;
            return;
        }
        var ratio_type = document.getElementById("map_ratio_select").value;
        if (ratio_type == "portrait") {
            h = round_value(new_width / 0.70707, 0);
            canvas_mod_size([new_width, h]);
        } else if (ratio_type == "landscape") {
            h = round_value(new_width * 0.70707, 0);
            canvas_mod_size([new_width, h]);
        } else {
            canvas_mod_size([new_width, null]);
        }
        document.getElementById("input-height").value = h;
    });

    var a2 = dv4.append("li").styles({ margin: "1px", padding: "4px" });
    a2.append("p").attr("class", "list_elem_section4 i18n").attr("data-i18n", "[html]app_page.section4.map_height");
    a2.append("input").attrs({ id: "input-height", type: "number", "value": h, class: "m_elem_right list_elem_section4" }).on("change", function () {
        var new_height = +this.value;
        if (new_height == 0 || isNaN(new_height)) {
            this.value = h;
            return;
        }
        var ratio_type = document.getElementById("map_ratio_select").value;
        if (ratio_type == "portrait") {
            w = round_value(new_height * 0.70707, 0);
            canvas_mod_size([w, new_height]);
        } else if (ratio_type == "landscape") {
            w = round_value(new_height / 0.70707, 0);
            canvas_mod_size([w, new_height]);
        } else {
            canvas_mod_size([null, new_height]);
        }
        document.getElementById("input-width").value = w;
    });

    var b = dv4.append("li").styles({ margin: "1px", padding: "4px 0" });
    b.append("p").attr("class", "list_elem_section4 i18n").style("padding", "4px").attr("data-i18n", "[html]app_page.section4.map_ratio");
    var ratio_select = b.append("select").attrs({ "class": "list_elem_section4 i18n m_elem_right", "id": "map_ratio_select" });

    ratio_select.append("option").text("").attr("data-i18n", "[html]app_page.section4.ratio_user").attr("value", "ratio_user");
    ratio_select.append("option").text("").attr("data-i18n", "[html]app_page.section4.ratio_landscape").attr("value", "landscape");;
    ratio_select.append("option").text("").attr("data-i18n", "[html]app_page.section4.ratio_portait").attr("value", "portrait");
    ratio_select.on("change", function () {
        var map_xy = get_map_xy0();
        var dispo_w = document.innerWidth - map_xy.x - 1;
        var dispo_h = document.innerHeight - map_xy.y - 1;
        var diff_w = dispo_w - w;
        var diff_h = dispo_h - h;
        if (this.value == "portrait") {
            if (round_value(w / h, 1) == 1.4) {
                var _t2 = h;
                h = w;
                w = _t2;
            } else if (diff_h >= diff_w) {
                w = round_value(h * 0.70707, 0);
            } else {
                h = round_value(w / 0.70707, 0);
            }
        } else if (this.value == "landscape") {
            if (round_value(h / w, 1) == 1.4) {
                var _t3 = h;
                h = w;
                w = _t3;
            } else if (diff_h <= diff_w) {
                w = round_value(h / 0.70707, 0);
            } else {
                h = round_value(w * 0.70707, 0);
            }
        }
        canvas_mod_size([w, h]);
        document.getElementById("input-width").value = w;
        document.getElementById("input-height").value = h;
        fill_export_png_options(this.value);
    });
    var zoom_prop = svg_map.__zoom;

    var c = dv4.append("li").styles({ margin: "1px", padding: "4px" });
    c.append("p").attr("class", "list_elem_section4 i18n").attr("data-i18n", "[html]app_page.section4.map_center_menu").style("cursor", "pointer");
    c.append("span").attr("id", "map_center_menu_ico").style("display", "inline-table").style("cursor", "pointer");
    c.on("click", function () {
        var sections = document.getElementsByClassName("to_hide"),
            arg = void 0;
        if (sections[0].style.display == "none") {
            arg = "";
            document.getElementById("map_center_menu_ico").classList = "active";
        } else {
            arg = "none";
            document.getElementById("map_center_menu_ico").classList = "";
        }
        sections[0].style.display = arg;
        sections[1].style.display = arg;
        sections[2].style.display = arg;
    });

    var c1 = dv4.append("li").style("display", "none").attr("class", "to_hide");
    c1.append("p").attr("class", "list_elem_section4 i18n").attr("data-i18n", "[html]app_page.section4.map_center_x");
    c1.append("input").style("width", "80px").attrs({ id: "input-center-x", class: "m_elem_right",
        type: "number", value: round_value(zoom_prop.x, 2), step: "any" }).on("change", function () {
        svg_map.__zoom.x = +this.value;
        zoom_without_redraw();
    });

    var c2 = dv4.append("li").style("display", "none").attr("class", "to_hide");
    c2.append("p").attr("class", "list_elem_section4 i18n").attr("data-i18n", "[html]app_page.section4.map_center_y");

    c2.append("input").attrs({ id: "input-center-y", class: "list_elem_section4 m_elem_right",
        type: "number", "value": round_value(zoom_prop.y, 2), step: "any" }).style("width", "80px").on("change", function () {
        svg_map.__zoom.y = +this.value;
        zoom_without_redraw();
    });;

    var d = dv4.append("li").style("display", "none").attr("class", "to_hide");
    d.append("p").attr("class", "list_elem_section4 i18n").attr("data-i18n", "[html]app_page.section4.map_scale_k");
    d.append("input").attrs({ id: "input-scale-k",
        class: "list_elem_section4 m_elem_right",
        type: "number",
        value: round_value(zoom_prop.k * proj.scale(), 2),
        step: "any" }).style("width", "80px").on("change", function () {
        svg_map.__zoom.k = +this.value / proj.scale();
        zoom_without_redraw();
    });

    var d2 = dv4.append("li").styles({ margin: "1px", padding: "4px" });
    d2.append("p").attr("class", "list_elem_section4 i18n").attr("data-i18n", "[html]app_page.section4.resize_fit");
    d2.append("button").styles({ margin: 0, padding: 0 }).attrs({ id: "resize_fit", type: "number", "value": h,
        class: "m_elem_right list_elem_section4 button_st4 i18n",
        'data-i18n': '[html]app_page.common.ok' }).on('click', function () {
        document.getElementById('btn_s4').click();
        window.scrollTo(0, 0);
        w = Math.round(window.innerWidth - 361);
        h = window.innerHeight - 55;
        canvas_mod_size([w, h]);
        document.getElementById('map_ratio_select').value = "ratio_user";
    });

    var g = dv4.append("li").styles({ margin: "1px", padding: "4px" });
    g.append("p").attr("class", "list_elem_section4 i18n").attr("data-i18n", "[html]app_page.section4.canvas_rotation");

    g.append("span").style("float", "right").html("°");

    g.append("input").attrs({ id: "canvas_rotation_value_txt", class: "without_spinner", type: 'number',
        value: 0, min: 0, max: 360, step: "any" }).styles({ width: "30px", "margin-left": "10px", "float": "right", "font-size": "11.5px" }).on("change", function () {
        var val = +this.value,
            old_value = document.getElementById("form_rotate").value;
        if (isNaN(val) || val < -361) {
            this.value = old_value;
            return;
        } else if (val < 0 && val > -361) {
            this.value = 360 + val;
        } else if (val > 360) {
            this.value = 360;
        } else {
            // Should remove trailing zeros (right/left) if any :
            this.value = +this.value;
        }
        rotate_global(this.value);
        document.getElementById("form_rotate").value = this.value;
    });

    g.append("input").attrs({ type: "range", id: "form_rotate", value: 0,
        min: 0, max: 360, step: 1 }).styles({ width: "80px", margin: "0px 10px 9px 15px",
        float: "right", "vertical-align": "middle" }).on("input", function () {
        rotate_global(this.value);
        document.getElementById("canvas_rotation_value_txt").value = this.value;
    });

    var _i = dv4.append('li').styles({ 'text-align': 'center' });
    _i.insert('p').styles({ clear: 'both', display: 'block', margin: 0 }).attrs({ class: 'i18n', "data-i18n": "[html]app_page.section4.layout_features" });
    _i.insert('span').insert('img').attrs({ id: 'btn_arrow', src: '/static/img/layout_icons/arrow-01.png', class: 'layout_ft_ico i18n', 'data-i18n': '[title]app_page.layout_features_box.arrow' }).on('click', function () {
        return add_layout_feature('arrow');
    });
    // _i.insert('span').insert('img').attrs({id: 'btn_free_draw', src: '/static/img/layout_icons/draw-01.png', class:'layout_ft_ico i18n', 'data-i18n': '[title]app_page.layout_features_box.free_draw'}).on('click', () => add_layout_feature('free_draw'));
    _i.insert('span').insert('img').attrs({ id: 'btn_ellipse', src: '/static/img/layout_icons/ellipse-01.png', class: 'layout_ft_ico i18n', 'data-i18n': '[title]app_page.layout_features_box.ellipse' }).on('click', function () {
        return add_layout_feature('ellipse');
    });
    _i.insert('span').insert('img').attrs({ id: 'btn_graticule', src: '/static/img/layout_icons/graticule-01.png', class: 'layout_ft_ico i18n', 'data-i18n': '[title]app_page.layout_features_box.graticule' }).on('click', function () {
        return add_layout_feature('graticule');
    });
    _i.insert('span').insert('img').attrs({ id: 'btn_north', src: '/static/img/layout_icons/north-01.png', class: 'layout_ft_ico i18n', 'data-i18n': '[title]app_page.layout_features_box.north_arrow' }).on('click', function () {
        return add_layout_feature('north_arrow');
    });
    _i.insert('span').insert('img').attrs({ id: 'btn_scale', src: '/static/img/layout_icons/scale.png', class: 'layout_ft_ico i18n', 'data-i18n': '[title]app_page.layout_features_box.scale' }).on('click', function () {
        return add_layout_feature('scale');
    });
    _i.insert('span').insert('img').attrs({ id: 'btn_sphere', src: '/static/img/layout_icons/sphere-01.png', class: 'layout_ft_ico i18n', 'data-i18n': '[title]app_page.layout_features_box.sphere' }).on('click', function () {
        return add_layout_feature('sphere');
    });
    _i.insert('span').insert('img').attrs({ id: 'btn_symbol', src: '/static/img/layout_icons/symbols-01.png', class: 'layout_ft_ico i18n', 'data-i18n': '[title]app_page.layout_features_box.symbol' }).on('click', function () {
        return add_layout_feature('symbol');
    });
    _i.insert('span').insert('img').attrs({ id: 'btn_text_annot', src: '/static/img/layout_icons/text-01.png', class: 'layout_ft_ico i18n', 'data-i18n': '[title]app_page.layout_features_box.text_annot' }).on('click', function () {
        return add_layout_feature('text_annot');
    });

    var section5b = d3.select("#section5");
    var dv5b = section5b.append("div").attr("class", "form-item");

    var type_export = dv5b.append("p");
    type_export.append("span").attr("class", "i18n").attr("data-i18n", "[html]app_page.section5b.type");
    var select_type_export = type_export.append("select").attrs({ "id": "select_export_type", "class": "m_elem_right" }).on("change", function () {
        var type = this.value,
            export_filename = document.getElementById("export_filename");
        if (type === "svg") {
            document.getElementById('export_options_geo').style.display = 'none';
            document.getElementById("export_options_png").style.display = "none";
            export_filename.value = "export.svg";
            export_filename.style.display = "";
            export_filename.previousSibling.style.display = "";
        } else if (type === "png") {
            document.getElementById('export_options_geo').style.display = 'none';
            document.getElementById("export_options_png").style.display = "";
            export_filename.value = "export.png";
            export_filename.style.display = "";
            export_filename.previousSibling.style.display = "";
        } else if (type === "geo") {
            document.getElementById("export_options_png").style.display = "none";
            document.getElementById('export_options_geo').style.display = '';
            export_filename.style.display = "none";
            export_filename.previousSibling.style.display = "none";
        }
    });

    select_type_export.append("option").text("SVG").attr("value", "svg");
    select_type_export.append("option").text("PNG").attr("value", "png");
    select_type_export.append("option").text("GEO").attr("value", "geo");

    var export_png_options = dv5b.append("p").attr("id", "export_options_png").style("display", "none");
    export_png_options.append("span").attrs({ "class": "i18n", "data-i18n": "[html]app_page.section5b.format" });

    var select_size_png = export_png_options.append("select").attrs({ "id": "select_png_format", "class": "m_elem_right" });
    fill_export_png_options("user_defined");

    select_size_png.on("change", function () {
        var value = this.value,
            unit = value === "web" ? " (px)" : " (cm)",
            in_h = document.getElementById("export_png_height"),
            in_w = document.getElementById("export_png_width");
        if (value === "web") {
            in_h.value = h;
            in_w.value = w;
        } else if (value === "user_defined") {
            in_h.value = Math.round(h / 118.11 * 10) / 10;
            in_w.value = Math.round(w / 118.11 * 10) / 10;
        } else if (value === "A4_landscape") {
            in_h.value = 21.0;
            in_w.value = 29.7;
        } else if (value === "A4_portrait") {
            in_h.value = 29.7;
            in_w.value = 21.0;
        } else if (value === "A3_landscape") {
            in_h.value = 42.0;
            in_w.value = 29.7;
        } else if (value === "A3_portrait") {
            in_h.value = 29.7;
            in_w.value = 42.0;
        } else if (value === "A5_landscape") {
            in_h.value = 14.8;
            in_w.value = 21.0;
        } else if (value === "A5_portrait") {
            in_h.value = 21.0;
            in_w.value = 14.8;
        }
        document.getElementById("export_png_width_txt").innerHTML = unit;
        document.getElementById("export_png_height_txt").innerHTML = unit;
        if (value.indexOf("portrait") > -1 || value.indexOf("landscape") > -1) {
            in_h.disabled = "disabled";
            in_w.disabled = "disabled";
        } else {
            in_h.disabled = undefined;
            in_w.disabled = undefined;
        }
    });

    var exp_a = export_png_options.append("p");
    exp_a.append("span").attrs({ "class": "i18n", "data-i18n": "[html]app_page.section5b.width" });

    exp_a.append("input").style("width", "60px").attrs({ "id": "export_png_width", "class": "m_elem_right", "type": "number", step: 0.1, value: w }).on("change", function () {
        var ratio = h / w,
            export_png_height = document.getElementById("export_png_height");
        export_png_height.value = Math.round(+this.value * ratio * 10) / 10;
    });

    exp_a.append("span").attr("id", "export_png_width_txt").html(" (px)");

    var exp_b = export_png_options.append("p");
    exp_b.append("span").attrs({ "class": "i18n", "data-i18n": "[html]app_page.section5b.height" });

    exp_b.append("input").style("width", "60px").attrs({ "id": "export_png_height", "class": "m_elem_right", "type": "number", step: 0.1, value: h }).on("change", function () {
        var ratio = h / w,
            export_png_width = document.getElementById("export_png_width");
        export_png_width.value = Math.round(+this.value / ratio * 10) / 10;
    });

    exp_b.append("span").attr("id", "export_png_height_txt").html(" (px)");

    var export_name = dv5b.append("p");
    export_name.append("span").attrs({ class: "i18n", "data-i18n": "[html]app_page.section5b.filename" });

    export_name.append("input").attrs({ "id": "export_filename", "class": "m_elem_right", "type": "text" });

    var export_geo_options = dv5b.append("p").attr("id", "export_options_geo").style("display", "none");

    var geo_a = export_geo_options.append('p').style('margin-bottom', '0');
    geo_a.append('span').attrs({ 'class': 'i18n', 'data-i18n': '[html]app_page.export_box.option_layer' });

    var selec_layer = export_geo_options.insert("select").styles({ 'position': 'sticky', 'float': 'right' }).attrs({ id: "layer_to_export", class: 'i18n m_elem_right' });

    var geo_b = export_geo_options.append('p').styles({ 'clear': 'both' }); // 'margin-top': '35px !important'
    geo_b.append('span').attrs({ 'class': 'i18n', 'data-i18n': '[html]app_page.export_box.option_datatype' });
    var selec_type = geo_b.insert("select").attrs({ id: 'datatype_to_use', class: 'i18n m_elem_right' }).style('margin-top', '5px');

    export_geo_options.append('p').style('margin', 'auto').attrs({ 'class': 'i18n', 'data-i18n': '[html]app_page.export_box.option_projection' });
    var geo_c = export_geo_options.append('p').style('margin', 'auto');
    var selec_projection = geo_c.insert("select").styles({ position: 'relative', float: 'right', 'margin-right': '5px', 'font-size': '10.5px' }).attrs({ id: "projection_to_use", disabled: true, class: 'i18n' });

    var proj4_input = export_geo_options.append('p').style('margin', 'auto').insert("input").attrs({ id: 'proj4str' }).styles({ display: 'none', width: '275px', position: 'relative', float: 'right', 'margin-right': '5px', 'font-size': '10.5px' }).on('keyup', function () {
        ok_button.disabled = this.value.length == 0 ? 'true' : '';
    });

    ["GeoJSON", "TopoJSON", "ESRI Shapefile", "GML", "KML"].forEach(function (name) {
        // ["GeoJSON", "TopoJSON", "ESRI Shapefile", "GML"].forEach( name => {
        selec_type.append("option").attr("value", name).text(name);
    });

    [["app_page.section5b.wgs84", "epsg:4326"], ["app_page.section5b.web_mercator", "epsg:3857"], ["app_page.section5b.laea_europe", "epsg:3035"], ["app_page.section5b.usa_albers", "+proj=aea +lat_1=29.5 +lat_2=45.5 +lat_0=37.5 +lon_0=-96 +x_0=0 +y_0=0 +datum=NAD83 +units=m +no_defs"], ["app_page.section5b.british_national_grid", "epsg:27700"], ["app_page.section5b.lambert93", "epsg:2154"], ["app_page.section5b.eckert_4", "+proj=eck4 +lon_0=0 +x_0=0 +y_0=0 +ellps=WGS84 +datum=WGS84 +units=m +no_defs "], ["app_page.section5b.proj4_prompt", "proj4string"]].forEach(function (projection) {
        selec_projection.append("option").attrs({ class: 'i18n', value: projection[1], 'data-i18n': projection[0] }).text(i18next.t(projection[0]));
    });

    selec_type.on("change", function () {
        if (this.value == "TopoJSON" || this.value == "KML" || this.value == "GeoJSON") {
            selec_projection.node().options.selectedIndex = 0;
            selec_projection.attr("disabled", true);
            ok_button.disabled = "";
        } else {
            selec_projection.attr("disabled", null);
        }
    });

    selec_projection.on("change", function () {
        if (this.value == "proj4string") {
            proj4_input.style("display", "initial");
            if (proj4_input.node().value == '' || proj4_input.node().value == undefined) ok_button.disabled = "true";
        } else {
            proj4_input.style("display", "none");
            ok_button.disabled = "";
        }
    });
    var ok_button = dv5b.append('p').style('float', 'left').append("button").attrs({ "id": "export_button_section5b", "class": "i18n button_st4", "data-i18n": "[html]app_page.section5b.export_button" }).on("click", function () {
        var type_export = document.getElementById("select_export_type").value,
            export_name = document.getElementById("export_filename").value;
        if (type_export === "svg") {
            export_compo_svg(export_name);
        } else if (type_export === "geo") {
            var layer_name = document.getElementById('layer_to_export').value,
                type = document.getElementById('datatype_to_use').value,
                _proj = document.getElementById('projection_to_use').value,
                proj4value = document.getElementById('proj4str').value;
            export_layer_geo(layer_name, type, _proj, proj4value);
            //make_export_layer_box()
        } else if (type_export === "png") {
            var _type_export = document.getElementById("select_png_format").value,
                ratio = void 0;
            if (_type_export === "web") {
                ratio = +document.getElementById("export_png_height").value / +h;
            } else {
                _type_export = "paper";
                ratio = +document.getElementById("export_png_height").value * 118.11 / +h;
            }
            _export_compo_png(_type_export, ratio, export_name);
        }
    });

    // Zoom-in, Zoom-out, Info, Hand-Move and RectZoom buttons (on the top of the map) :
    var lm = map_div.append("div").attr("class", "light-menu").styles({ position: "absolute", right: "0px", bottom: "0px" });

    var lm_buttons = [{ id: "zoom_out", "i18n": "[tooltip-title]app_page.lm_buttons.zoom-", "tooltip_position": "left", class: "zoom_button i18n", html: "-" }, { id: "zoom_in", "i18n": "[tooltip-title]app_page.lm_buttons.zoom+", "tooltip_position": "left", class: "zoom_button i18n", html: "+" }, { id: "info_button", "i18n": "[tooltip-title]app_page.lm_buttons.i", "tooltip_position": "left", class: "info_button i18n", html: "i" }, { id: "brush_zoom_button", class: "brush_zoom_button", "i18n": "[tooltip-title]app_page.lm_buttons.zoom_rect", "tooltip_position": "left", html: '<img src="/static/img/Inkscape_icons_zoom_fit_selection_blank.png" width="18" height="18" alt="Zoom_select"/>' }, { id: "hand_button", "i18n": "[tooltip-title]app_page.lm_buttons.hand_button", "tooltip_position": "left", class: "hand_button active i18n", html: '<img src="/static/img/Twemoji_1f513.png" width="18" height="18" alt="Hand_closed"/>' }];

    var selec = lm.selectAll("input").data(lm_buttons).enter().append('p').style("margin", "auto").insert("button").attrs(function (d, i) {
        return {
            "data-placement": d.tooltip_position,
            "class": d.class,
            "data-i18n": d.i18n,
            "id": d.id };
    }).html(function (d) {
        return d.html;
    });

    // Trigger actions when buttons are clicked and set-up the initial view :
    d3.selectAll(".zoom_button").on("click", zoomClick);
    document.getElementById("info_button").onclick = displayInfoOnMove;
    document.getElementById("hand_button").onclick = handle_click_hand;
    document.getElementById("brush_zoom_button").onclick = handleZoomRect;

    // Already append the div for displaying information on features,
    // setting it currently unactive until it will be requested :
    d3.select("body").append("div").attr("id", "info_features").classed("active", false).style("display", "none").html("");

    //
    accordionize(".accordion");
    document.getElementById("btn_s1").dispatchEvent(new MouseEvent("click"));
    prepare_drop_section();

    new Sortable(document.getElementById("sortable"), {
        animation: 100,
        onUpdate: function onUpdate(a) {
            // Set the layer order on the map in concordance with the user changes
            // in the layer manager with a pretty rusty 'sorting' algorythm :
            var at_end = null;
            if (document.getElementById("info_features").className == "active") {
                displayInfoOnMove();
                at_end = true;
            }
            var desired_order = [],
                actual_order = [],
                layers = svg_map.getElementsByClassName("layer");

            for (var i = 0, len_i = a.target.childNodes.length; i < len_i; i++) {
                var n = a.target.childNodes[i].getAttribute("layer_name");
                desired_order[i] = _app.layer_to_id.get(n);
                actual_order[i] = layers[i].id;
            }
            for (var _i2 = 0, len = desired_order.length; _i2 < len; _i2++) {
                var lyr1 = document.getElementById(desired_order[_i2]),
                    lyr2 = document.getElementById(desired_order[_i2 + 1]) || document.getElementById(desired_order[_i2]);
                svg_map.insertBefore(lyr2, lyr1);
            }
            if (at_end) displayInfoOnMove();
        },
        onStart: function onStart(event) {
            document.body.classList.add("no-drop");
        },
        onEnd: function onEnd(event) {
            document.body.classList.remove("no-drop");
        }
    });

    // Check if there is a project to reload in the localStorage :
    var last_project = window.localStorage.getItem("magrit_project");
    if (resume_project === true && last_project) {
        apply_user_preferences(json_params);
    } else if (last_project && last_project.length && last_project.length > 0) {
        swal({ title: "",
            // text: i18next.t("app_page.common.resume_last_project"),
            allowOutsideClick: false,
            allowEscapeKey: false,
            type: "question",
            showConfirmButton: true,
            showCancelButton: true,
            confirmButtonText: i18next.t("app_page.common.new_project"),
            cancelButtonText: i18next.t("app_page.common.resume_last")
        }).then(function () {
            null;
        }, function (dismiss) {
            apply_user_preferences(last_project);
        });
    } else {
        // If we don't want to resume from the last project, we can
        // remove it :
        window.localStorage.removeItem("magrit_project");
    }
}

function encodeId(s) {
    if (s === '') return '_';
    return s.replace(/[^a-zA-Z0-9_-]/g, function (match) {
        return '_' + match[0].charCodeAt(0).toString(16) + '_';
    });
}

function bindTooltips() {
    var dataAttr = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "tooltip-title";

    // bind the mains tooltips
    // let existing_tooltips = document.querySelectorAll(".bs_tooltip");
    // for(let i = existing_tooltips.length - 1; i > -1; i--){
    //     existing_tooltips[i].remove();
    // }
    var tooltips_elem = document.querySelectorAll("[" + dataAttr + "]");
    for (var i = tooltips_elem.length - 1; i > -1; i--) {
        new Tooltip(tooltips_elem[i], {
            dataAttr: dataAttr,
            animation: "slideNfade",
            duration: 50,
            delay: 100,
            container: document.getElementById("twbs")
        });
    }
}

function make_eye_button(state) {
    if (state == "open") {
        var eye_open = document.createElement("img");
        eye_open.setAttribute("src", "/static/img/b/eye_open.png");
        eye_open.setAttribute("class", "active_button i18n");
        eye_open.setAttribute("id", "eye_open");
        eye_open.setAttribute("width", 17);
        eye_open.setAttribute("height", 17);
        eye_open.setAttribute("alt", "Visible");
        return eye_open;
    } else if (state == "closed") {
        var eye_closed = document.createElement("img");
        eye_closed.setAttribute("src", "/static/img/b/eye_closed.png");
        eye_closed.setAttribute("class", "active_button i18n");
        eye_closed.setAttribute("id", "eye_closed");
        eye_closed.setAttribute("width", 17);
        eye_closed.setAttribute("height", 17);
        eye_closed.setAttribute("alt", "Not visible");
        return eye_closed;
    }
}

function change_lang() {
    var new_lang = this.name;
    if (new_lang == i18next.language) {
        return;
    } else {
        docCookies.setItem("user_lang", new_lang, 31536e3, "/");
        i18next.changeLanguage(new_lang, function () {
            localize(".i18n");
            bindTooltips();
        });
        document.getElementById("current_app_lang").innerHTML = new_lang;
        var menu = document.getElementById("menu_lang");
        if (menu) menu.remove();
    }
}

function make_ico_choice() {
    var list_fun_ico = ['prop.png', 'choro.png', 'typo.png', 'choroprop.png', 'proptypo.png', 'grid.png', 'cartogram.png', 'smooth.png', 'discont.png', 'typosymbol.png', 'flow.png'];

    var function_panel = section2_pre.append("div").attr("id", "list_ico_func");

    var _loop2 = function _loop2(i, len_i) {
        var ico_name = list_fun_ico[i],
            func_name = ico_name.split('.')[0],
            func_desc = get_menu_option(func_name).desc,
            margin_value = i == 8 ? '5px 16px 5px 55px' : '5px 16px';
        function_panel.insert("img").styles({ margin: margin_value, cursor: 'pointer', width: '50px', "float": "left", "list-style": "none" }).attrs({ class: 'i18n', 'data-i18n': ['[title]app_page.func_description.', func_name].join(''),
            src: ['/static/img/func_icons2/', ico_name].join(''), id: 'button_' + func_name }).on("click", function () {
            var fill_menu = true;
            // Do some clean-up related to the previously displayed options :
            if (window.fields_handler) {
                if (this.classList.contains('active')) {
                    switch_accordion_section('btn_s2b');
                    return;
                } else {
                    clean_menu_function();
                }
            }

            document.getElementById('accordion2b').style.display = '';

            // Get the function to fill the menu with the appropriate options (and do it):
            _app.current_functionnality = get_menu_option(func_name);
            var make_menu = eval(_app.current_functionnality.menu_factory);
            window.fields_handler = eval(_app.current_functionnality.fields_handler);
            make_menu();

            // Replace the title of the section:
            var selec_title = document.getElementById("btn_s2b");
            selec_title.innerHTML = '<span class="i18n" data-i18n="app_page.common.representation">' + i18next.t("app_page.common.representation") + '</span><span> : </span><span class="i18n" data-i18n="app_page.func_title.' + _app.current_functionnality.name + '">' + i18next.t("app_page.func_title." + _app.current_functionnality.name) + '</span>';
            selec_title.style.display = '';

            // // Bind the help tooltip (displayed when mouse over the 'i' icon) :
            // let btn_info = document.getElementById("btn_info");
            // btn_info.setAttribute("data-title", i18next.t("app_page.func_help." + func_name + ".title"));
            // btn_info.setAttribute("data-content", i18next.t("app_page.func_help." + func_name + ".block"));
            // new Popover(btn_info,{
            //     container: document.getElementById("twbs"),
            //     customClass: "help-popover",
            //     dismiss: "true",
            //     dismissOutsideClick: true,
            //     placement: "right"
            // });

            // Don't fill the menu / don't highlight the icon if the type of representation is not authorizhed :
            if (this.style.filter == "grayscale(100%)") {} else {
                this.classList.add('active');
                // Highlight the icon of the selected functionnality :
                this.style.filter = "invert(100%) saturate(200%)";

                // Fill the field of the functionnality with the field
                // of the targeted layer if already uploaded by the user :
                if (_app.targeted_layer_added) {
                    var target_layer = Object.getOwnPropertyNames(user_data)[0];
                    fields_handler.fill(target_layer);
                }

                // Specific case for flow/link functionnality as we are also
                // filling the fields with data from the uploaded tabular file if any :
                if (func_name == "flow" && joined_dataset) {
                    fields_handler.fill();
                }
            }
            switch_accordion_section('btn_s2b');
        });
    };

    for (var i = 0, len_i = list_fun_ico.length; i < len_i; i++) {
        _loop2(i, len_i);
    }
}

var w = Math.round(window.innerWidth - 361),
    h = window.innerHeight - 55;

var existing_lang = ["en", "es", "fr"];

var proj = d3.geoNaturalEarth().scale(1).translate([0, 0]);

var path = d3.geoPath().projection(proj).pointRadius(4),
    t = proj.translate(),
    s = proj.scale(),
    current_proj_name = "NaturalEarth",
    zoom = d3.zoom().on("zoom", zoom_without_redraw),
    sample_no_values = new Set(["Sphere", "Graticule", "World"]);

/*
A bunch of global variable, storing oftently reused informations :
    - user_data[layer_name] : will be an Array of Objects containing data for each features of the targeted layer
            (+ the joined features if a join is done)
    - result_data[layer_name] : the same but for any eventual result layers (like Stewart, gridded, etc.)
    - joined_dataset : the joined dataset (read with d3.csv then pushed in the first slot of this array)
    - field_join_map : an array containg mapping between index of geom layer and index of ext. dataset
    - current_layers : the main object describing **all** the layers on the map (incunding detailed (ie. by features) styling properties if needed)
*/

var user_data = new Object(),
    result_data = new Object(),
    joined_dataset = [],
    field_join_map = [],
    current_layers = new Object(),
    dataset_name = undefined,
    canvas_rotation_value = undefined,
    map_div = d3.select("#map");

// The "map" (so actually the `map` variable is a reference to the main `svg` element on which we are drawing)
var map = map_div.style("width", w + "px").style("height", h + "px").append("svg").attrs({ 'id': 'svg_map', 'width': w, 'height': h }).style("position", "absolute").on("contextmenu", function (event) {
    d3.event.preventDefault();
}).call(zoom);

// map.on("contextmenu", function(event){ d3.event.preventDefault(); });

var defs = map.append("defs");

var _app = {
    to_cancel: undefined,
    targeted_layer_added: false,
    current_functionnality: undefined,
    layer_to_id: new Map([["Sphere", "Sphere"], ["World", "World"], ["Graticule", "Graticule"]]),
    id_to_layer: new Map([["Sphere", "Sphere"], ["World", "World"], ["Graticule", "Graticule"]])
};

// A bunch of references to the buttons used in the layer manager
// and some mapping to theses reference according to the type of geometry :
var button_trash = ' <img src="/static/img/Trash_font_awesome.png" id="trash_button" width="15" height="15" alt="trash_button"/>',
    button_legend = ' <img src="/static/img/qgis_legend.png" id="legend_button" width="17" height="17" alt="legend_button"/>',
    button_zoom_fit = ' <img src="/static/img/Inkscape_icons_zoom_fit_page.png" id="zoom_fit_button" width="16" height="16" alt="zoom_button"/></button>',
    button_table = ' <img src="/static/img/dataset.png" id="browse_data_button" width="16" height="16" alt="dataset_button"/></button>',
    button_type = new Map([["Point", '<img src="/static/img/type_geom/dot.png" class="ico_type" width="17" height="17" alt="Point"/>'], ["Line", '<img src="/static/img/type_geom/line.png" class="ico_type" width="17" height="17" alt="Line"/>'], ["Polygon", '<img src="/static/img/type_geom/poly.png" class="ico_type" width="17" height="17" alt="Polygon"/>']]);

var button_result_type = new Map([["flow", '<img src="/static/img/type_geom/layer_flow.png" class="ico_type" width="17" height="17" alt="flow"/>'], ["symbol", '<img src="/static/img/type_geom/layer_symbol.png" class="ico_type" width="17" height="17" alt="symbol"/>'], ["grid", '<img src="/static/img/type_geom/layer_grid.png" class="ico_type" width="17" height="17" alt="grid"/>'], ["propchoro", '<img src="/static/img/type_geom/layer_propchoro.png" class="ico_type" width="17" height="17" alt="propchoro"/>'], ["typo", '<img src="/static/img/type_geom/layer_typo.png" class="ico_type" width="17" height="17" alt="typo"/>'], ["discont", '<img src="/static/img/type_geom/layer_disc.png" class="ico_type" width="17" height="17" alt="discont"/>'], ["cartogram", '<img src="/static/img/type_geom/layer_cartogram.png" class="ico_type" width="17" height="17" alt="cartogram"/>'], ["label", '<img src="/static/img/type_geom/layer_label.png" class="ico_type" width="17" height="17" alt="label"/>'], ["choro", '<img src="/static/img/type_geom/layer_choro.png" class="ico_type" width="17" height="17" alt="choro"/>'], ["smooth", '<img src="/static/img/type_geom/layer_smooth.png" class="ico_type" width="17" height="17" alt="smooth"/>'], ["prop", '<img src="/static/img/type_geom/layer_prop.png" class="ico_type" width="17" height="17" alt="prop"/>']]);

var eye_open0 = '<img src="/static/img/b/eye_open.png" class="active_button" id="eye_open"  width="17" height="17" alt="Visible"/>';

// Reference to the sys run button already in two requested sizes are they are called many times :
var sys_run_button = '<img src="/static/img/High-contrast-system-run.png" width="22" height="22" style="vertical-align: inherit;" alt="submit"/>',
    sys_run_button_t2 = '<img src="/static/img/High-contrast-system-run.png" class="style_target_layer" width="18" height="18" alt="Layer_rendering" style="float:right;"/>';

// Shortcut to the name of the methods offered by geostats library:
var discretiz_geostats_switch = new Map([["jenks", "getJenks"], ["equal_interval", "getEqInterval"],
//["std_dev", "getStdDeviation"],
["quantiles", "getQuantile"], ["arithmetic_progression", "getArithmeticProgression"], ["Q6", "getBreaksQ6"], ["geometric_progression", "getGeometricProgression"]]);

// Reference to the available fonts that the user could select :
var available_fonts = [['Arial', 'Arial,Helvetica,sans-serif'], ['Arial Black', 'Arial Black,Gadget,sans-serif'], ['Arimo', 'Arimo,sans-serif'], ['Baloo Bhaina', 'Baloo Bhaina,sans-serif'], ['Bitter', 'Bitter,sans-serif'], ['Dosis', 'Dosis,sans-serif'], ['Roboto', 'Roboto,sans-serif'], ['Lobster', 'Lobster,sans-serif'], ['Impact', 'Impact,Charcoal,sans-serif'], ['Inconsolata', 'Inconsolata,sans-serif'], ['Georgia', 'Georgia,serif'], ['Lobster', 'Lobster,serif'], ['Lucida', 'Lucida Sans Unicode,Lucida Grande,sans-serif'], ['Palatino', 'Palatino Linotype,Book Antiqua,Palatino,serif'], ['Roboto', 'Roboto'], ['Scope One', 'Scope One'], ['Tahoma', 'Tahoma,Geneva,sans-serif'], ['Trebuchet MS', 'Trebuchet MS,elvetica,sans-serif'], ['Verdana', 'Verdana,Geneva,sans-serif']];

// This variable have to be (well, we could easily do this in an other way!) up to date
// with the style-fonts.css file as we are using their order to lookup for their definition
// the .css file.
var customs_fonts = ['Arimo', 'Baloo Bhaina', 'Bitter', 'Dosis', 'Inconsolata', 'Lobster', 'Roboto', 'Scope One'];

(function () {
    var lang = docCookies.getItem('user_lang') || window.navigator.language.split('-')[0],
        resume_project = undefined;

    document.querySelector("noscript").remove();

    if (window.location.search) {
        var old_url = window.location.search;
        if (old_url.indexOf("?resume") > -1) {
            resume_project = true;
        }
        if (typeof history.replaceState != "undefined") {
            // replaceState should avoid creating a new entry on the history
            var obj = { Page: window.location.search, Url: window.location.pathname };
            history.replaceState(obj, obj.Page, obj.Url);
        }
    }

    lang = existing_lang.indexOf(lang) > -1 ? lang : 'en';
    i18next.use(i18nextXHRBackend).init({
        debug: true,
        lng: lang,
        fallbackLng: existing_lang[0],
        backend: {
            loadPath: "/static/locales/{{lng}}/translation.json"
        }
    }, function (err, t) {
        if (err) throw err;else {
            window.localize = locI18next.init(i18next);
            setUpInterface(resume_project);
            localize(".i18n");
            bindTooltips();
        }
    });
})();

function up_legends() {
    var legend_features = svg_map.getElementsByClassName('legend');
    for (var i = 0; i < legend_features.length; i++) {
        svg_map.appendChild(legend_features[i], null);
    }
}

////////////////
// To sort:
////////////////

// To bind the set of small buttons (trash icon, paint icon, active/deactive visibility, info tooltip, etc..)
// which are on each feature representing a layer in the layer manager
// (the function is called each time that a new feature is put in this layer manager)
function binds_layers_buttons(layer_name) {
    if (layer_name == undefined) {
        alert("This shouldn't happend");
        return;
    }
    var layer_id = _app.layer_to_id.get(layer_name);
    var sortable_elem = d3.select("#sortable").select("." + layer_id);
    sortable_elem.on("dblclick", function () {
        handle_click_layer(layer_name);
    });
    sortable_elem.on("contextmenu", function () {
        d3.event.preventDefault();return;
    });
    sortable_elem.select("#trash_button").on("click", function () {
        remove_layer(layer_name);
    });
    sortable_elem.select(".active_button").on("click", function () {
        handle_active_layer(layer_name);
    });
    sortable_elem.select(".style_button").on("click", function () {
        handle_click_layer(layer_name);
    });
    sortable_elem.select(".style_target_layer").on("click", function () {
        handle_click_layer(layer_name);
    });
    sortable_elem.select("#legend_button").on("click", function () {
        handle_legend(layer_name);
    });
    sortable_elem.select("#browse_data_button").on("click", function () {
        boxExplore2.create(layer_name);
    });
    sortable_elem.select("#zoom_fit_button").on("click", function () {
        center_map(layer_name);
        zoom_without_redraw();
    });
    // TODO : re-add a tooltip when the mouse is over that sortable element ?
}

// Function to display information on the top layer (in the layer manager)
function displayInfoOnMove() {
    var info_features = d3.select("#info_features");
    if (info_features.classed("active")) {
        map.selectAll(".layer").selectAll("path").on("mouseover", null);
        map.selectAll(".layer").selectAll("circle").on("mouseover", null);
        map.selectAll(".layer").selectAll("rect").on("mouseover", null);
        info_features.classed("active", false);
        info_features.style("display", "none").html("");
        svg_map.style.cursor = "";
    } else {
        var _ret5 = function () {
            map.select('.brush').remove();
            var layers = svg_map.getElementsByClassName("layer"),
                nb_layer = layers.length,
                top_visible_layer = null;

            for (var i = nb_layer - 1; i > -1; i--) {
                if (layers[i].style.visibility != "hidden") {
                    top_visible_layer = _app.id_to_layer.get(layers[i].id);
                    break;
                }
            }

            if (!top_visible_layer) {
                swal("", i18next.t("app_page.common.error_no_visible"), "error");
                return {
                    v: void 0
                };
            }

            var id_top_layer = "#" + _app.layer_to_id.get(top_visible_layer),
                symbol = current_layers[top_visible_layer].symbol || "path";

            map.select(id_top_layer).selectAll(symbol).on("mouseover", function (d, i) {
                var txt_info = ["<h3>", top_visible_layer, "</h3><i>Feature ", i + 1, "/", current_layers[top_visible_layer].n_features, "</i><p>"];
                var properties = result_data[top_visible_layer] ? result_data[top_visible_layer][i] : d.properties;
                Object.getOwnPropertyNames(properties).forEach(function (el) {
                    txt_info.push("<br><b>" + el + "</b> : " + properties[el]);
                });
                txt_info.push("</p>");
                info_features.style("display", null).html(txt_info.join(''));
            });

            map.select(id_top_layer).selectAll(symbol).on("mouseout", function () {
                info_features.style("display", "none").html("");
            });

            info_features.classed("active", true);
            svg_map.style.cursor = "help";
        }();

        if ((typeof _ret5 === "undefined" ? "undefined" : _typeof(_ret5)) === "object") return _ret5.v;
    }
}

/*
function reproj_lgd_elem(){
    let scalable_elem = document.querySelectorAll(".scalable-legend");
    for(let i = scalable_elem.length - 1; i > -1; i--){
        let className = scalable_elem[i].className;
        if(className.indexOf("arrow") > -1){

        } else if (className.indexOf("user_ellipse") > -1){
            let ellipse = scalable_elem[i].querySelector("ellipse");
            ellipse.cx.baseVal.value = ;
            ellipse.cy.baseVal.value = ;
        }
    }
}
*/

/**
*  Function redrawing the prop symbol / img / labels when the projection changes
*   (also taking care of redrawing point layer with appropriate 'pointRadius')
*
*/
function reproj_symbol_layer() {
    for (var lyr_name in current_layers) {
        if (current_layers[lyr_name].renderer && (current_layers[lyr_name].renderer.indexOf('PropSymbol') > -1 || current_layers[lyr_name].renderer.indexOf('TypoSymbols') > -1 || current_layers[lyr_name].renderer.indexOf('Label') > -1)) {
            var symbol = current_layers[lyr_name].symbol;

            if (symbol == "text") {
                // Reproject the labels :
                map.select('#' + _app.layer_to_id.get(lyr_name)).selectAll(symbol).attrs(function (d) {
                    var pt = path.centroid(d.geometry);
                    return { 'x': pt[0], 'y': pt[1] };
                });
            } else if (symbol == "image") {
                // Reproject pictograms :
                map.select('#' + _app.layer_to_id.get(lyr_name)).selectAll(symbol).attrs(function (d, i) {
                    var coords = path.centroid(d.geometry),
                        size = +this.getAttribute('width').slice(0, -2) / 2;
                    return { 'x': coords[0] - size, 'y': coords[1] - size };
                });
            } else if (symbol == "circle") {
                // Reproject Prop Symbol :
                map.select("#" + _app.layer_to_id.get(lyr_name)).selectAll(symbol).style('display', function (d) {
                    return isNaN(+path.centroid(d)[0]) ? "none" : undefined;
                }).attrs(function (d) {
                    var centroid = path.centroid(d);
                    return {
                        'r': d.properties.prop_value,
                        'cx': centroid[0],
                        'cy': centroid[1]
                    };
                });
            } else if (symbol == "rect") {
                // Reproject Prop Symbol :
                map.select("#" + _app.layer_to_id.get(lyr_name)).selectAll(symbol).style('display', function (d) {
                    return isNaN(+path.centroid(d)[0]) ? "none" : undefined;
                }).attrs(function (d) {
                    var centroid = path.centroid(d),
                        size = d.properties.prop_value;
                    return {
                        'height': size,
                        'width': size,
                        'x': centroid[0] - size / 2,
                        'y': centroid[1] - size / 2
                    };
                });
            }
        } else if (current_layers[lyr_name].pointRadius != undefined) {
            map.select("#" + _app.layer_to_id.get(lyr_name)).selectAll("path").attr('d', path.pointRadius(current_layers[lyr_name].pointRadius));
        }
    }
}

function make_dialog_container(id_box, title, class_box) {
    id_box = id_box || "dialog";
    title = title || "";
    class_box = class_box || "dialog";
    var container = document.createElement("div");
    container.setAttribute("id", id_box);
    container.setAttribute("class", "twbs modal fade" + " " + class_box);
    container.setAttribute("tabindex", "-1");
    container.setAttribute("role", "dialog");
    container.setAttribute("aria-labelledby", "myModalLabel");
    container.setAttribute("aria-hidden", "true");
    container.innerHTML = '<div class="modal-dialog"><div class="modal-content"></div></div>';
    document.getElementById("twbs").appendChild(container);

    container = document.getElementById(id_box);
    var modal_box = new Modal(container, {
        content: '<div class="modal-header">' + '<button type="button" id="xclose" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button>' + '<h4 class="modal-title" id="gridModalLabel">' + title + '</h4>' + '</div>' + '<div class="modal-body">' + '</div>' + '<div class="modal-footer">' + '<button type="button" class="btn btn-default btn_ok" data-dismiss="modal">' + i18next.t("app_page.common.confirm") + '</button>' + '<button type="button" class="btn btn-primary btn_cancel">' + i18next.t("app_page.common.cancel") + '</button>' + '</div>'
    });
    modal_box.show();
    return modal_box;
}

var overlay_under_modal = function () {
    var twbs_div = document.querySelector('.twbs');
    var bg = document.createElement('div');
    bg.id = 'overlay_twbs';
    bg.style.width = "100%";
    bg.style.height = "100%";
    bg.style.position = "fixed";
    bg.style.zIndex = 99;
    bg.style.top = 0;
    bg.style.left = 0;
    bg.style.background = "rgba(0,0,0,0.4)";
    bg.style.display = "none";
    twbs_div.insertBefore(bg, twbs_div.childNodes[0]);
    return {
        display: function display() {
            bg.style.display = "";
        },
        hide: function hide() {
            bg.style.display = "none";
        }
    };
}();

var make_confirm_dialog2 = function (class_box, title, options) {
    var existing = new Set();
    var get_available_id = function get_available_id() {
        for (var i = 0; i < 50; i++) {
            if (!existing.has(i)) {
                existing.add(i);
                return i;
            }
        }
    };
    return function (class_box, title, options) {
        class_box = class_box || "dialog";
        title = title || i18next.t("app_page.common.ask_confirm");
        options = options || {};

        var container = document.createElement("div");
        var new_id = get_available_id();

        container.setAttribute("id", "myModal_" + new_id);
        container.setAttribute("class", "twbs modal fade " + class_box);
        container.setAttribute("tabindex", "-1");
        container.setAttribute("role", "dialog");
        container.setAttribute("aria-labelledby", "myModalLabel");
        container.setAttribute("aria-hidden", "true");
        container.innerHTML = options.widthFitContent ? '<div class="modal-dialog fitContent"><div class="modal-content"></div></div>' : '<div class="modal-dialog"><div class="modal-content"></div></div>';
        document.getElementById("twbs").appendChild(container);

        container = document.getElementById("myModal_" + new_id);
        var deferred = Q.defer();
        var html_content = options.html_content || "";
        var text_ok = options.text_ok || i18next.t("app_page.common.confirm");
        var text_cancel = options.text_cancel || i18next.t("app_page.common.cancel");
        var modal_box = new Modal(container, {
            backdrop: true,
            keyboard: false,
            content: '<div class="modal-header">' + '<button type="button" id="xclose" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button>' + '<h4 class="modal-title" id="gridModalLabel">' + title + '</h4>' + '</div>' + '<div class="modal-body">' + '<p>' + html_content + '</p>' + '</div>' + '<div class="modal-footer">' + '<button type="button" class="btn btn-default btn_ok" data-dismiss="modal">' + text_ok + '</button>' + '<button type="button" class="btn btn-primary btn_cancel">' + text_cancel + '</button>' + '</div>'
        });
        modal_box.show();
        container.modal = modal_box;
        overlay_under_modal.display();
        var func_cb = function func_cb(evt) {
            helper_esc_key_twbs_cb(evt, _onclose_false);
        };
        var clean_up_box = function clean_up_box() {
            document.removeEventListener('keydown', func_cb);
            existing.delete(new_id);
            overlay_under_modal.hide();
            container.remove();
        };
        var _onclose_false = function _onclose_false() {
            deferred.resolve(false);
            clean_up_box();
        };
        container.querySelector(".btn_cancel").onclick = _onclose_false;
        container.querySelector("#xclose").onclick = _onclose_false;
        container.querySelector(".btn_ok").onclick = function () {
            deferred.resolve(true);
            clean_up_box();
        };
        document.addEventListener('keydown', func_cb);
        return deferred.promise;
    };
}();

// Wrapper to obtain confirmation before actually removing a layer :
function remove_layer(name) {
    name = name || this.parentElement.parentElement.getAttribute("layer_name");
    swal({
        title: "",
        text: i18next.t("app_page.common.remove_layer", { layer: name }),
        type: "warning",
        customClass: 'swal2_custom',
        showCancelButton: true,
        allowOutsideClick: false,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: i18next.t("app_page.common.delete") + "!",
        cancelButtonText: i18next.t("app_page.common.cancel")
    }).then(function () {
        remove_layer_cleanup(name);
    }, function () {
        null;
    }); // ^^^^^^^^^^^^ Do nothing on cancel, but this avoid having an "uncaught exeption (cancel)" comming in the console if nothing is set here
    //  ^^^^^^^^^^^^^^^^^^^^^^^ Not sure anymore :/
}

function remove_ext_dataset() {
    swal({
        title: "",
        text: i18next.t("app_page.common.remove_tabular"),
        type: "warning",
        showCancelButton: true,
        allowOutsideClick: false,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: i18next.t("app_page.common.delete") + "!",
        cancelButtonText: i18next.t("app_page.common.cancel")
    }).then(function () {
        remove_ext_dataset_cleanup();
    }, function () {
        null;
    });
}

function remove_ext_dataset_cleanup() {
    field_join_map = new Array();
    joined_dataset = new Array();
    dataset_name = undefined;
    var ext_dataset_img = document.getElementById("img_data_ext");
    ext_dataset_img.setAttribute("src", "/static/img/b/addtabular.png");
    ext_dataset_img.setAttribute("alt", "Additional dataset");
    ext_dataset_img.style.cursor = "pointer";
    ext_dataset_img.onclick = click_button_add_layer;
    var data_ext_txt = document.getElementById("data_ext");
    data_ext_txt.innerHTML = i18next.t("app_page.section1.add_ext_dataset");
    data_ext_txt.onclick = click_button_add_layer;
    data_ext_txt.classList.add('i18n');
    data_ext_txt.setAttribute('data-i18n', '[html]app_page.section1.add_ext_dataset');
    document.getElementById("remove_dataset").remove();
    document.getElementById("join_section").innerHTML = "";
}

// Do some clean-up when a layer is removed
// Most of the job is to do when it's the targeted layer which is removed in
// order to restore functionnalities to their initial states
function remove_layer_cleanup(name) {
    var layer_id = _app.layer_to_id.get(name);
    // Making some clean-up regarding the result layer :
    if (current_layers[name].is_result) {
        map.selectAll([".lgdf_", layer_id].join('')).remove();
        if (result_data.hasOwnProperty(name)) delete result_data[name];
        if (current_layers[name].hasOwnProperty("key_name") && current_layers[name].renderer.indexOf("Choropleth") < 0 && current_layers[name].renderer.indexOf("Categorical") < 0) send_remove_server(name);
    }
    // Remove the layer from the map and from the layer manager :
    map.select('#' + layer_id).remove();
    document.querySelector('#sortable .' + _app.layer_to_id.get(name)).remove();

    // Remove the layer from the "geo export" menu :
    var a = document.getElementById('layer_to_export').querySelector('option[value="' + name + '"]');
    if (a) a.remove();

    // Remove the layer from the "mask" section if the "smoothed map" menu is open :
    if (_app.current_functionnality && _app.current_functionnality.name == 'smooth') {
        var _a = document.getElementById('stewart_mask').querySelector('option[value="' + name + '"]');
        if (_a) _a.remove();
        //Array.prototype.forEach.call(document.getElementById('stewart_mask').options, el => { if(el.value == name) el.remove(); });
    }

    // Reset the panel displaying info on the targeted layer if she"s the one to be removed :
    if (current_layers[name].targeted) {
        // Updating the top of the menu (section 1) :
        //$("#input_geom").qtip("destroy");
        document.getElementById("remove_target").remove();
        d3.select("#img_in_geom").attrs({ "id": "img_in_geom", "class": "user_panel", "src": "/static/img/b/addgeom.png", "width": "24", "height": "24", "alt": "Geometry layer" }).on('click', click_button_add_layer);
        d3.select("#input_geom").attrs({ 'class': 'user_panel i18n', 'data-i18n': '[html]app_page.section1.add_geom' }).html(i18next.t("app_page.section1.add_geom")).on('click', click_button_add_layer);
        // Unfiling the fields related to the targeted functionnality:
        if (_app.current_functionnality) {
            clean_menu_function();
        }

        // Update some global variables :
        field_join_map = [];
        user_data = new Object();
        _app.targeted_layer_added = false;

        // Redisplay the bottom of the section 1 in the menu allowing user to select a sample layer :
        document.getElementById('sample_zone').style.display = null;

        // Restore the state of the bottom of the section 1 :
        document.getElementById("join_section").innerHTML = "";

        // Disabled the button allowing the user to choose type for its layer :
        document.getElementById('btn_type_fields').setAttribute('disabled', 'true');

        reset_user_values();
    }

    // There is probably better ways in JS to delete the object,
    // but in order to make it explicit that we are removing it :
    delete current_layers[name];
}

// Change color of the background (ie the parent "svg" element on the top of which group of elements have been added)
function handle_bg_color(color) {
    map.style("background-color", color);
}

function handle_click_hand(behavior) {
    var hb = d3.select('.hand_button');
    behavior = behavior && (typeof behavior === "undefined" ? "undefined" : _typeof(behavior)) !== "object" ? behavior : !hb.classed("locked") ? "lock" : "unlock";
    if (behavior == "lock") {
        hb.classed("locked", true);
        hb.html('<img src="/static/img/Twemoji_1f512.png" width="18" height="18" alt="locked"/>');
        map.select('.brush').remove();
        document.getElementById("zoom_in").parentElement.style.display = "none";
        document.getElementById("zoom_out").parentElement.style.display = "none";
        document.getElementById("brush_zoom_button").parentElement.style.display = "none";
        zoom.on("zoom", function () {
            var blocked = svg_map.__zoom;return function () {
                this.__zoom = blocked;
            };
        }());
    } else {
        hb.classed("locked", false);
        hb.html('<img src="/static/img/Twemoji_1f513.png" width="18" height="18" alt="unlocked"/>');
        zoom.on("zoom", zoom_without_redraw);
        document.getElementById("zoom_in").parentElement.style.display = "";
        document.getElementById("zoom_out").parentElement.style.display = "";
        document.getElementById("brush_zoom_button").parentElement.style.display = "";
        map.select('.brush').remove();
    }
}

//////////////////////////////////////////////////////////////////////////////
// Zooming functions (some from http://bl.ocks.org/linssen/7352810)
//////////////////////////////////////////////////////////////////////////////

function zoom_without_redraw() {
    var rot_val = canvas_rotation_value || "";
    var transform;
    if (!d3.event || !d3.event.transform || !d3.event.sourceEvent) {
        transform = d3.zoomTransform(svg_map);
        map.selectAll(".layer").transition().duration(50).style("stroke-width", function () {
            var lyr_name = _app.id_to_layer.get(this.id);
            return current_layers[lyr_name].fixed_stroke ? this.style.strokeWidth : current_layers[lyr_name]['stroke-width-const'] / transform.k + "px";
        }).attr("transform", transform.toString() + rot_val);
        map.selectAll(".scalable-legend").transition().duration(50).attr("transform", transform.toString() + rot_val);
    } else {
        map.selectAll(".layer").transition().duration(50).style("stroke-width", function () {
            var lyr_name = _app.id_to_layer.get(this.id);
            return current_layers[lyr_name].fixed_stroke ? this.style.strokeWidth : current_layers[lyr_name]['stroke-width-const'] / d3.event.transform.k + "px";
        }).attr("transform", d3.event.transform + rot_val);
        map.selectAll(".scalable-legend").transition().duration(50).attr("transform", d3.event.transform + rot_val);
    }
    if (scaleBar.displayed) {
        scaleBar.update();
    }
    // if(scaleBar.displayed){
    //     if(proj.invert) {
    //         scaleBar.update();
    //     } else {
    //         scaleBar.remove()
    //     }
    // }
    if (window.legendRedrawTimeout) {
        clearTimeout(legendRedrawTimeout);
    }
    window.legendRedrawTimeout = setTimeout(redraw_legends_symbols, 650);
    var zoom_params = svg_map.__zoom;
    var zoom_k_scale = proj.scale() * zoom_params.k;
    document.getElementById("input-center-x").value = round_value(zoom_params.x, 2);
    document.getElementById("input-center-y").value = round_value(zoom_params.y, 2);
    document.getElementById("input-scale-k").value = round_value(zoom_k_scale, 2);
    document.getElementById('form_projection').querySelector('option[value="ConicConformal"]').disabled = zoom_k_scale > 200 && (window._target_layer_file != undefined || result_data.length > 1) ? '' : 'disabled';
};

function redraw_legends_symbols(targeted_node) {
    if (!targeted_node) var legend_nodes = document.querySelectorAll("#legend_root_symbol");else var legend_nodes = [targeted_node];

    for (var i = 0; i < legend_nodes.length; ++i) {
        var layer_id = legend_nodes[i].classList[2].split('lgdf_')[1],
            layer_name = _app.id_to_layer.get(layer_id),
            rendered_field = current_layers[layer_name].rendered_field,
            nested = legend_nodes[i].getAttribute("nested"),
            display_value = legend_nodes[i].getAttribute("display"),
            visible = legend_nodes[i].style.visibility;

        var transform_param = legend_nodes[i].getAttribute("transform"),
            rounding_precision = legend_nodes[i].getAttribute('rounding_precision'),
            lgd_title = legend_nodes[i].querySelector("#legendtitle").innerHTML,
            lgd_subtitle = legend_nodes[i].querySelector("#legendsubtitle").innerHTML,
            notes = legend_nodes[i].querySelector("#legend_bottom_note").innerHTML;

        var rect_fill_value = legend_nodes[i].getAttribute("visible_rect") == "true" ? {
            color: legend_nodes[i].querySelector("#under_rect").style.fill,
            opacity: legend_nodes[i].querySelector("#under_rect").style.fillOpacity
        } : undefined;

        legend_nodes[i].remove();
        createLegend_symbol(layer_name, rendered_field, lgd_title, lgd_subtitle, nested, rect_fill_value, rounding_precision, notes);
        var new_lgd = document.querySelector(["#legend_root_symbol.lgdf_", layer_id].join(''));
        new_lgd.style.visibility = visible;
        if (display_value) new_lgd.setAttribute("display", display_value);
        if (transform_param) new_lgd.setAttribute("transform", transform_param);
    }
}

function interpolateZoom(translate, scale) {
    var self = this;
    var transform = d3.zoomTransform(svg_map);
    return d3.transition().duration(225).tween("zoom", function () {
        var iTranslate = d3.interpolate([transform.x, transform.y], translate),
            iScale = d3.interpolate(transform.k, scale);
        return function (t) {
            svg_map.__zoom.k = iScale(t);
            var _t = iTranslate(t);
            svg_map.__zoom.x = _t[0];
            svg_map.__zoom.y = _t[1];
            zoom_without_redraw();
        };
    });
}

function zoomClick() {
    if (map_div.select("#hand_button").classed("locked")) return;
    var direction = this.id === 'zoom_in' ? 1 : -1,
        factor = 0.1,
        target_zoom = 1,
        center = [w / 2, h / 2],
        transform = d3.zoomTransform(svg_map),
        translate = [transform.x, transform.y],
        translate0 = [],
        l = [],
        view = { x: translate[0], y: translate[1], k: transform.k };

    d3.event.preventDefault();
    target_zoom = transform.k * (1 + factor * direction);

    translate0 = [(center[0] - view.x) / view.k, (center[1] - view.y) / view.k];
    view.k = target_zoom;
    l = [translate0[0] * view.k + view.x, translate0[1] * view.k + view.y];

    view.x += center[0] - l[0];
    view.y += center[1] - l[1];

    interpolateZoom([view.x, view.y], view.k);
}

//////////////////////////////////////////////////////////////////////////////
// Rotation functions :
//////////////////////////////////////////////////////////////////////////////

function rotate_global(angle) {
    canvas_rotation_value = ["rotate(", angle, ")"].join('');
    var zoom_transform = d3.zoomTransform(svg_map);

    map.selectAll("g.layer").transition().duration(10).attr("transform", [canvas_rotation_value, ",translate(", [zoom_transform.x, zoom_transform.y], "),", "scale(", zoom_transform.k, ")"].join(''));
    if (northArrow.displayed) {
        var current_rotate = !isNaN(+northArrow.svg_node.attr("rotate")) ? +northArrow.svg_node.attr("rotate") : 0;
        northArrow.svg_node.attr("transform", ["rotate(", +angle + current_rotate, ",", northArrow.x_center, ",", northArrow.y_center, ")"].join(''));
    }
    zoom_without_redraw();
};

function isInterrupted(proj_name) {
    return proj_name.indexOf("interrupted") > -1 || proj_name.indexOf("armadillo") > -1 || proj_name.indexOf("healpix") > -1;
}

function handleClipPath(proj_name, main_layer) {
    proj_name = proj_name.toLowerCase();
    var defs_sphere = defs.node().querySelector("#sphere"),
        defs_extent = defs.node().querySelector("#extent"),
        defs_clipPath = defs.node().querySelector("clipPath");
    if (defs_sphere) {
        defs_sphere.remove();
    }
    if (defs_extent) {
        defs_extent.remove();
    }
    if (defs_clipPath) {
        defs_clipPath.remove();
    }

    if (isInterrupted(proj_name)) {
        defs.append("path").datum({ type: "Sphere" }).attr("id", "sphere").attr("d", path);

        defs.append("clipPath").attr("id", "clip").append("use").attr("xlink:href", "#sphere");

        map.selectAll(".layer").attr("clip-path", "url(#clip)");

        svg_map.insertBefore(defs.node(), svg_map.childNodes[0]);
    } else if (proj_name.indexOf('conicconformal') > -1) {

        var outline = d3.geoGraticule().extentMajor([[-180, -60], [180, 90]]).outline();

        // proj.fitSize([w, h], outline);
        proj.scale(s).translate(t);
        path.projection(proj);

        defs.append("path").attr("id", "extent").attr("d", path(outline));
        defs.append("clipPath").attr("id", "clip").append("use").attr("xlink:href", "#extent");

        map.selectAll(".layer").attr("clip-path", "url(#clip)");

        map.selectAll('.layer').selectAll('path').attr('d', path);

        reproj_symbol_layer();
        if (main_layer) {
            center_map(main_layer);
            zoom_without_redraw();
        }
    } else {
        map.selectAll(".layer").attr("clip-path", null);
    }
}

function change_projection(new_proj_name) {
    // Disable the zoom by rectangle selection if the user is using it :
    map.select('.brush').remove();

    // Only keep the first argument of the rotation parameter :
    var prev_rotate = [proj.rotate()[0], 0, 0],
        def_proj = available_projections.get(new_proj_name);

    // Update global variables:
    proj = d3[def_proj.name]();
    if (def_proj.parallels) proj = proj.parallels(def_proj.parallels);
    if (def_proj.clipAngle) proj = proj.clipAngle(def_proj.clipAngle);

    path = d3.geoPath().projection(proj).pointRadius(4);

    // Do the reprojection :
    proj.translate(t).scale(s).rotate(prev_rotate);
    map.selectAll(".layer").selectAll("path").attr("d", path);

    // Enable or disable the "brush zoom" button allowing to zoom according to a rectangle selection:
    document.getElementById('brush_zoom_button').style.display = proj.invert !== undefined ? "" : "none";

    // Reset the zoom on the targeted layer (or on the top layer if no targeted layer):
    var layer_name = Object.getOwnPropertyNames(user_data)[0];
    if (!layer_name) {
        var layers_active = Array.prototype.filter.call(svg_map.getElementsByClassName('layer'), function (f) {
            return f.style.visibility != "hidden";
        });
        layer_name = layers_active.length > 0 ? layers_active[layers_active.length - 1].id : undefined;
    }
    if (layer_name) {
        scale_to_lyr(layer_name);
        center_map(layer_name);
        zoom_without_redraw();
    } else {
        reproj_symbol_layer();
    }
    // Set or remove the clip-path according to the projection:
    handleClipPath(new_proj_name, layer_name);
}

// Function to switch the visibility of a layer the open/closed eye button
function handle_active_layer(name) {
    var fill_value, parent_div, selec, at_end;

    if (document.getElementById("info_features").className == "active") {
        displayInfoOnMove();
        at_end = true;
    }
    if (!name) {
        selec = this;
        parent_div = selec.parentElement;
        name = parent_div.parentElement.getAttribute("layer_name");
    } else {
        selec = document.querySelector("#sortable ." + _app.layer_to_id.get(name) + " .active_button");
        parent_div = selec.parentElement;
    }
    var func = function func() {
        handle_active_layer(name);
    };
    if (selec.id == "eye_closed") {
        fill_value = 1;
        var eye_open = make_eye_button("open");
        eye_open.onclick = func;
        parent_div.replaceChild(eye_open, selec);
    } else {
        fill_value = 0;
        var eye_closed = make_eye_button("closed");
        eye_closed.onclick = func;
        parent_div.replaceChild(eye_closed, selec);
    }
    map.select("#" + _app.layer_to_id.get(name)).style("visibility", fill_value == 0 ? "hidden" : "initial");
    map.selectAll(".lgdf_" + _app.layer_to_id.get(name)).style("visibility", fill_value == 0 ? "hidden" : "initial");

    if (at_end) {
        displayInfoOnMove();
    }
}

// Function to handle the title add and changes
function handle_title(txt) {
    var title = d3.select("#map_title").select("text");
    if (title.node()) {
        title.text(txt);
    } else {
        map.append("g").attrs({ "class": "legend title", "id": "map_title" }).style("cursor", "pointer").insert("text").attrs({ x: w / 2, y: h / 12,
            "alignment-baseline": "middle", "text-anchor": "middle" }).styles({ "font-family": "Arial, Helvetica, sans-serif",
            "font-size": "20px", position: "absolute", color: "black" }).text(txt).on("contextmenu dblclick", function () {
            d3.event.preventDefault();
            d3.event.stopPropagation();
            handle_title_properties();
        }).call(drag_elem_geo);
    }
}

function handle_title_properties() {
    var title = d3.select("#map_title").select("text");
    if (!title.node() || title.text() == "") {
        swal({ title: "",
            text: i18next.t("app_page.common.error_no_title"),
            type: "error",
            allowOutsideClick: true,
            allowEscapeKey: true
        }).then(function () {
            null;
        }, function () {
            null;
        });
        return;
    }
    var title_props = {
        size: title.style("font-size"),
        font_weight: title.style('font-weight'),
        font_style: title.style('font-style'),
        text_decoration: title.style('text-decoration'),
        color: title.style("fill"),
        position_x: title.attr("x"),
        position_x_pct: round_value(+title.attr("x") / w * 100, 1),
        position_y: title.attr("y"),
        position_y_pct: round_value(+title.attr("y") / h * 100, 1),
        font_family: title.style("font-family"),
        stroke: title.style('stroke'),
        stroke_width: title.style('stroke-width')
    };
    title_props.font_weight = title_props.font_weight == "400" || title_props.font_weight == "" ? "" : "bold";

    // Properties on the title are changed in real-time by the user then it will be rollback to original properties if Cancel is clicked
    make_confirm_dialog2("mapTitleitleDialogBox", i18next.t("app_page.title_box.title"), { widthFitContent: true }).then(function (confirmed) {
        if (!confirmed) title.attrs({ x: title_props.position_x, y: title_props.position_y }).styles({
            "font-size": title_props.size, "fill": title_props.color,
            "font-family": title_props.font_family, 'font-style': title_props.font_style,
            'text-decoration': title_props.text_decoration, 'font-weight': title_props.font_weight,
            'stroke': title_props.stroke, 'stroke-width': title_props.stroke_width
        });
    });
    var box_content = d3.select(".mapTitleitleDialogBox").select(".modal-body").append("div").style("margin", "15x");

    box_content.append("p").html(i18next.t("app_page.title_box.font_size")).insert("input").attrs({ type: "number", min: 2, max: 40, step: 1, value: +title_props.size.split("px")[0] }).style("width", "65px").on("change", function () {
        title.style("font-size", this.value + "px");
    });
    box_content.append("p").html(i18next.t("app_page.title_box.xpos")).insert("input").attrs({ type: "number", min: 0, max: 100, step: 1, value: title_props.position_x_pct }).style("width", "65px").on("change", function () {
        title.attr("x", w * +this.value / 100);
    });
    box_content.append("p").html(i18next.t("app_page.title_box.ypos")).insert("input").attrs({ type: "number", min: 0, max: 100, step: 1, value: title_props.position_y_pct }).style("width", "65px").on("change", function () {
        title.attr("y", h * +this.value / 100);
    });
    box_content.append("p").html(i18next.t("app_page.title_box.font_color")).insert("input").attrs({ type: "color", value: rgb2hex(title_props.color) }).on("change", function () {
        title.style("fill", this.value);
    });
    var font_select = box_content.append("p").html(i18next.t("app_page.title_box.font_family")).insert("select").attr("class", "params").on("change", function () {
        title.style("font-family", this.value);
    });
    available_fonts.forEach(function (font) {
        font_select.append("option").text(font[0]).attr("value", font[1]);
    });
    font_select.node().selectedIndex = available_fonts.map(function (d) {
        return d[1] == title_props.font_family ? "1" : "0";
    }).indexOf("1");
    // TODO : Allow the display a rectangle (resizable + selection color) under the title
    var options_format = box_content.append('p'),
        btn_bold = options_format.insert('span').attr('class', title_props.font_weight == "bold" ? 'active button_disc' : 'button_disc').html('<img title="Bold" src="data:image/gif;base64,R0lGODlhFgAWAID/AMDAwAAAACH5BAEAAAAALAAAAAAWABYAQAInhI+pa+H9mJy0LhdgtrxzDG5WGFVk6aXqyk6Y9kXvKKNuLbb6zgMFADs=">'),
        btn_italic = options_format.insert('span').attr('class', title_props.font_style == "italic" ? 'active button_disc' : 'button_disc').html('<img title="Italic" src="data:image/gif;base64,R0lGODlhFgAWAKEDAAAAAF9vj5WIbf///yH5BAEAAAMALAAAAAAWABYAAAIjnI+py+0Po5x0gXvruEKHrF2BB1YiCWgbMFIYpsbyTNd2UwAAOw==">'),
        btn_underline = options_format.insert('span').attr('class', title_props.text_decoration == "underline" ? 'active button_disc' : 'button_disc').html('<img title="Underline" src="data:image/gif;base64,R0lGODlhFgAWAKECAAAAAF9vj////////yH5BAEAAAIALAAAAAAWABYAAAIrlI+py+0Po5zUgAsEzvEeL4Ea15EiJJ5PSqJmuwKBEKgxVuXWtun+DwxCCgA7">');

    btn_bold.on('click', function () {
        if (this.classList.contains('active')) {
            this.classList.remove('active');
            title.style('font-weight', '');
        } else {
            this.classList.add('active');
            title.style('font-weight', 'bold');
        }
    });
    btn_italic.on('click', function () {
        if (this.classList.contains('active')) {
            this.classList.remove('active');
            title.style('font-style', '');
        } else {
            this.classList.add('active');
            title.style('font-style', 'italic');
        }
    });
    btn_underline.on('click', function () {
        if (this.classList.contains('active')) {
            this.classList.remove('active');
            title.style('text-decoration', '');
        } else {
            this.classList.add('active');
            title.style('text-decoration', 'underline');
        }
    });

    var hasBuffer = title_props.stroke !== "none";
    var buffer_section1 = box_content.append("p");
    var buffer_section2 = box_content.append('p').style('display', hasBuffer ? '' : 'none');
    box_content.append('p').style('clear', 'both');

    buffer_section1.append('input').attrs({ type: 'checkbox', id: 'title_buffer_chkbox', checked: hasBuffer ? true : null }).on('change', function () {
        if (this.checked) {
            buffer_section2.style('display', '');
            title.style('stroke', buffer_color.node().value).style('stroke-width', buffer_width.node().value + 'px');
            console.log(buffer_color.attr('value'), buffer_color.node().value);
        } else {
            buffer_section2.style('display', 'none');
            title.style('stroke', 'none').style('stroke-width', '1px');
        }
    });

    buffer_section1.append('label').attrs({ for: 'title_buffer_chkbox' }).text(i18next.t('app_page.title_box.buffer'));

    var buffer_color = buffer_section2.insert('input').style('float', 'left').attrs({ type: 'color', value: hasBuffer ? rgb2hex(title_props.stroke) : "#ffffff" }).on('change', function () {
        title.style('stroke', this.value);
    });

    buffer_section2.insert('span').style('float', 'right').html(' px');

    var buffer_width = buffer_section2.insert('input').styles({ 'float': 'right', 'width': '60px' }).attrs({ type: 'number', step: '0.1', value: hasBuffer ? +title_props.stroke_width.replace('px', '') : 1 }).on('change', function () {
        title.style('stroke-width', this.value + 'px');
    });

    return;
}

/** Function triggered by the change of map/canvas size
* @param {Array} shape - An Array of two elements : [width, height] to use;
*                generally only used once at the time so `shape` values
*                are like [null, 750] or [800, null]
*                but also works with the 2 params together like [800, 750])
*/
function canvas_mod_size(shape) {
    if (shape[0]) {
        w = +shape[0];
        map.attr("width", w).call(zoom_without_redraw);
        map_div.style("width", w + "px");
        if (w + 360 + 30 < window.innerWidth) {
            document.querySelector(".light-menu").style.right = '-30px';
        } else {
            document.querySelector(".light-menu").style.right = '0px';
        }
    }
    if (shape[1]) {
        h = +shape[1];
        map.attr("height", h).call(zoom_without_redraw);
        map_div.style("height", h + "px");
    }
    move_legends();

    // Lets update the corresponding fields in the export section :
    var ratio = void 0,
        format = document.getElementById("select_png_format").value;
    if (format === "web") {
        ratio = 1;
    } else if (format === "user_defined") {
        ratio = 118.11;
    } else {
        return;
    }
    document.getElementById("export_png_width").value = Math.round(w * ratio * 10) / 10;
    document.getElementById("export_png_height").value = Math.round(h * ratio * 10) / 10;
}

function patchSvgForFonts() {
    function getListUsedFonts() {
        var elems = [svg_map.getElementsByTagName('text'), svg_map.getElementsByTagName('p')];
        var needed_definitions = [];
        elems.map(function (d) {
            return d ? d : [];
        });
        for (var j = 0; j < 2; j++) {
            var _loop3 = function _loop3(i) {
                var font_elem = elems[j][i].style.fontFamily;
                customs_fonts.forEach(function (font) {
                    if (font_elem.indexOf(font) > -1 && needed_definitions.indexOf(font) == -1) {
                        needed_definitions.push(font);
                    }
                });
            };

            for (var i = 0; i < elems[j].length; i++) {
                _loop3(i);
            }
        }
        return needed_definitions;
    }

    var needed_definitions = getListUsedFonts();
    if (needed_definitions.length == 0) {
        return;
    } else {
        (function () {
            var fonts_definitions = Array.prototype.filter.call(document.styleSheets, function (i) {
                return i.href && i.href.indexOf("style-fonts.css") > -1 ? i : null;
            })[0].cssRules;
            var fonts_to_add = needed_definitions.map(function (name) {
                return String(fonts_definitions[customs_fonts.indexOf(name)].cssText);
            });
            var style_elem = document.createElement("style");
            style_elem.innerHTML = fonts_to_add.join(' ');
            svg_map.querySelector("defs").appendChild(style_elem);
        })();
    }
}

function unpatchSvgForFonts() {
    var defs_style = svg_map.querySelector("defs").querySelector("style");
    if (defs_style) defs_style.remove();
}

function patchSvgForInkscape() {
    svg_map.setAttribute("xmlns:inkscape", "http://www.inkscape.org/namespaces/inkscape");
    var elems = svg_map.getElementsByTagName("g");
    for (var i = elems.length - 1; i > -1; i--) {
        if (elems[i].id == "") {
            continue;
        } else if (elems[i].classList.contains("layer")) {
            elems[i].setAttribute("inkscape:label", elems[i].id);
        } else if (elems[i].id.indexOf("legend") > -1) {
            var layer_name = elems[i].className.baseVal.split("lgdf_")[1];
            elems[i].setAttribute("inkscape:label", "legend_" + layer_name);
        } else {
            elems[i].setAttribute("inkscape:label", elems[i].id);
        }
        elems[i].setAttribute("inkscape:groupmode", "layer");
    }
}

function unpatchSvgForInkscape() {
    svg_map.removeAttribute("xmlns:inkscape");
    var elems = svg_map.getElementsByTagName("g");
    for (var i = elems.length - 1; i > -1; i--) {
        if (elems[i].id == "") {
            continue;
        } else {
            elems[i].removeAttribute("inkscape:label");
            elems[i].removeAttribute("inkscape:groupmode");
        }
    }
}

function check_output_name(name, extension) {
    var _part = name.split("."),
        regexp_name = new RegExp(/^[a-z0-9_]+$/i);
    if (regexp_name.test(_part[0]) && _part[0].length < 250) {
        return _part[0] + "." + extension;
    } else {
        return "export." + extension;
    }
}

function patchSvgForForeignObj() {
    var elems = document.getElementsByTagName("foreignObject");
    var originals = [];
    for (var i = 0; i < elems.length; i++) {
        var el = elems[i];
        originals.push([el.getAttribute('width'), el.getAttribute('height')]);
        el.setAttribute('width', '100%');
        el.setAttribute('height', '100%');
    }
    return originals;
}

function unpatchSvgForForeignObj(originals) {
    var elems = document.getElementsByTagName("foreignObject");
    for (var i = 0; i < originals.length; i++) {
        var el = elems[i];
        el.setAttribute('width', originals[i][0]);
        el.setAttribute('height', originals[i][1]);
    }
}

function export_compo_svg(output_name) {
    output_name = check_output_name(output_name, "svg");
    patchSvgForInkscape();
    patchSvgForFonts();
    var dimensions_foreign_obj = patchSvgForForeignObj();
    var targetSvg = document.getElementById("svg_map"),
        serializer = new XMLSerializer(),
        source = serializer.serializeToString(targetSvg);

    if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
        source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    if (!source.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)) {
        source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
    }

    source = ['<?xml version="1.0" standalone="no"?>\r\n', source].join('');

    var url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);
    clickLinkFromDataUrl(url, output_name).then(function (a) {
        unpatchSvgForFonts();
        unpatchSvgForForeignObj(dimensions_foreign_obj);
        unpatchSvgForInkscape();
    });
}

// Maybe PNGs should be rendered on server side in order to avoid limitations that
//   could be encountered in the browser (as "out of memory" error)
function _export_compo_png() {
    var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "web";
    var scalefactor = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
    var output_name = arguments[2];

    document.getElementById("overlay").style.display = "";
    output_name = check_output_name(output_name, "png");
    var dimensions_foreign_obj = patchSvgForForeignObj();
    patchSvgForFonts();
    var targetCanvas = d3.select("body").append("canvas").attrs({ id: "canvas_map_export", height: h, width: w }).node(),
        targetSVG = document.querySelector("#svg_map"),
        mime_type = "image/png",
        svg_xml,
        ctx,
        img;

    // At this point it might be better to wrap the whole function in a try catch ?
    // (as it seems it could fail on various points (XMLSerializer()).serializeToString, toDataURL, changeResolution, etc.)
    try {
        svg_xml = new XMLSerializer().serializeToString(targetSVG), ctx = targetCanvas.getContext('2d'), img = new Image();
    } catch (err) {
        document.getElementById("overlay").style.display = "none";
        display_error_during_computation(String(err));
        return;
    }
    if (scalefactor != 1) {
        try {
            changeResolution(targetCanvas, scalefactor);
        } catch (err) {
            document.getElementById("overlay").style.display = "none";
            display_error_during_computation(i18next.t('app_page.common.error_too_high_resolution') + ' ' + String(err));
            return;
        }
    }
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg_xml);
    img.onload = function () {
        ctx.drawImage(img, 0, 0);
        try {
            var imgUrl = targetCanvas.toDataURL(mime_type);
        } catch (err) {
            document.getElementById("overlay").style.display = "none";
            display_error_during_computation(String(err));
            return;
        }
        clickLinkFromDataUrl(imgUrl, output_name).then(function (_) {
            unpatchSvgForFonts();
            unpatchSvgForForeignObj(dimensions_foreign_obj);
            document.getElementById("overlay").style.display = "none";
            targetCanvas.remove();
        });
    };
}

function export_layer_geo(layer, type, projec, proj4str) {
    var formToSend = new FormData();
    formToSend.append("layer", layer);
    formToSend.append("layer_name", current_layers[layer].key_name);
    formToSend.append("format", type);
    if (projec == "proj4string") formToSend.append("projection", JSON.stringify({ "proj4string": proj4str }));else formToSend.append("projection", JSON.stringify({ "name": projec }));

    var extensions = new Map([["GeoJSON", "geojson"], ["TopoJSON", "topojson"], ["ESRI Shapefile", "zip"], ["GML", "zip"], ["KML", "kml"]]);

    xhrequest("POST", '/get_layer2', formToSend, true).then(function (data) {
        if (data.indexOf('{"Error"') == 0 || data.length == 0) {
            var error_message = void 0;
            if (data.indexOf('{"Error"') < 5) {
                data = JSON.parse(data);
                error_message = i18next.t(data.Error);
            } else {
                error_message = i18next.t('app_page.common.error_msg');
            }
            swal({ title: "Oops...",
                text: error_message,
                type: "error",
                allowOutsideClick: false,
                allowEscapeKey: false
            }).then(function () {
                null;
            }, function () {
                null;
            });
            return;
        }
        var ext = extensions.get(type),
            filename = [layer, ext].join('.'),
            dataStr = void 0;
        if (ext.indexOf("json") > -1) {
            dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(data);
        } else if (ext.indexOf("kml") > -1) {
            dataStr = "data:text/xml;charset=utf-8," + encodeURIComponent(data);
        } else {
            dataStr = "data:application/zip;base64," + data;
        }
        clickLinkFromDataUrl(dataStr, filename);
    }, function (error) {
        console.log(error);
    });
}

/*
* Straight from http://stackoverflow.com/a/26047748/5050917
*
*/
function changeResolution(canvas, scaleFactor) {
    // Set up CSS size if it's not set up already
    if (!canvas.style.width) canvas.style.width = canvas.width + 'px';
    if (!canvas.style.height) canvas.style.height = canvas.height + 'px';

    canvas.width = Math.ceil(canvas.width * scaleFactor);
    canvas.height = Math.ceil(canvas.height * scaleFactor);
    var ctx = canvas.getContext('2d');
    ctx.scale(scaleFactor, scaleFactor);
}

function fill_export_png_options(displayed_ratio) {
    var select_size_png = d3.select("#select_png_format");
    select_size_png.selectAll("option").remove();

    select_size_png.append("option").attrs({ value: "web", class: "i18n", "data-i18n": "[text]app_page.section5b.web" });
    select_size_png.append("option").attrs({ value: "user_defined", class: "i18n", "data-i18n": "[text]app_page.section5b.user_defined" });

    if (displayed_ratio == "portrait") {
        select_size_png.append("option").attrs({ value: "A5_portrait", class: "i18n", "data-i18n": "[text]app_page.section5b.A5_portrait" });
        select_size_png.append("option").attrs({ value: "A4_portrait", class: "i18n", "data-i18n": "[text]app_page.section5b.A4_portrait" });
        select_size_png.append("option").attrs({ value: "A3_portrait", class: "i18n", "data-i18n": "[text]app_page.section5b.A3_portrait" });
    } else if (displayed_ratio == "landscape") {
        select_size_png.append("option").attrs({ value: "A5_landscape", class: "i18n", "data-i18n": "[text]app_page.section5b.A5_landscape" });
        select_size_png.append("option").attrs({ value: "A4_landscape", class: "i18n", "data-i18n": "[text]app_page.section5b.A4_landscape" });
        select_size_png.append("option").attrs({ value: "A3_landscape", class: "i18n", "data-i18n": "[text]app_page.section5b.A3_landscape" });
    }
    localize("#select_png_format > .i18n");
}

var beforeUnloadWindow = function beforeUnloadWindow(event) {
    get_map_template().then(function (json_params) {
        window.localStorage.removeItem("magrit_project");
        window.localStorage.setItem("magrit_project", json_params);
    });
    event.returnValue = _app.targeted_layer_added || Object.getOwnPropertyNames(result_data).length > 0 ? "Confirm exit" : undefined;
};
;
"use strict";
// Helper function in order to have a colorbrewer color ramp with
// non-supported number of value using interpolation between the colorbrewer color
// to fit the requested number of classes.
// If the number of class fit the size of a colorbrewer ramp (3 < nb_class < 9)
// the genuine colorbrewer array is directly returned.

var getColorBrewerArray = function getColorBrewerArray(nb_class, name) {
    if (nb_class < 10 && nb_class >= 3) {
        var colors = colorbrewer[name][nb_class];
        return colors;
    } else if (nb_class < 3) {
        var colors = colorbrewer[name][3];
        return [rgb2hex(interpolateColor(hexToRgb(colors[0]), hexToRgb(colors[1]))), rgb2hex(interpolateColor(hexToRgb(colors[1]), hexToRgb(colors[2])))];
    } else if (nb_class > 9 && nb_class < 18) {
        var colors = colorbrewer[name][9],
            diff = nb_class - 9;
        return interp_n(colors, diff, 9);
    } else if (nb_class >= 18) {
        var colors = colorbrewer[name][9];
        colors = interp_n(colors, 8, 9);
        return interp_n(colors, nb_class - colors.length, nb_class);
    }
};

// Function to make color interpolation from "colors" (an array of n colors)
// to a larger array of "k" colors (using same start and stop than the original)
var interp_n = function interp_n(colors, diff, k) {
    var tmp = [],
        new_colors = [];
    for (var i = 0; i < diff; ++i) {
        tmp.push(rgb2hex(interpolateColor(hexToRgb(colors[i]), hexToRgb(colors[i + 1]))));
    }
    for (var i = 0; i < k; ++i) {
        new_colors.push(colors[i]);
        if (tmp[i]) new_colors.push(tmp[i]);
    }
    return new_colors;
};

function rgb2hex(rgb) {
    // Originally from  http://jsfiddle.net/mushigh/myoskaos/
    if (typeof rgb === "string") {
        if (rgb.indexOf("#") > -1 || rgb.indexOf("rgb") < 0) {
            return rgb;
        }
        rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
        return rgb && rgb.length === 4 ? "#" + ("0" + parseInt(rgb[1], 10).toString(16)).slice(-2) + ("0" + parseInt(rgb[2], 10).toString(16)).slice(-2) + ("0" + parseInt(rgb[3], 10).toString(16)).slice(-2) : '';
    } else {
        return rgb && rgb.length === 3 ? "#" + ("0" + parseInt(rgb[0], 10).toString(16)).slice(-2) + ("0" + parseInt(rgb[1], 10).toString(16)).slice(-2) + ("0" + parseInt(rgb[2], 10).toString(16)).slice(-2) : '';
    }
}

function hexToRgb(hex, out) {
    // Originally from http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (out === 'string') {
        return result ? ["rgb(", parseInt(result[1], 16), ",", parseInt(result[2], 16), ",", parseInt(result[3], 16), ")"].join('') : null;
    } else {
        return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : null;
    }
}

// Return the interpolated value at "factor" (0<factor<1) between color1 and color2
// (if no factor is provided the default value of 0.5 is used,
// corresponding to the middle between the two colors).
// Args :
//    - color1 : array of 3 integer for rgb color as [R, G, B]
//    - color2 : array of 3 integer for rgb color as [R, G, B]
var interpolateColor = function interpolateColor(color1, color2) {
    var factor = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0.5;

    var result = color1.slice();
    for (var i = 0; i < 3; i++) {
        result[i] = Math.round(result[i] + factor * (color2[i] - color1[i]));
    }
    return result;
};

// Just a "Colors" object with a convenience "random" method
// ... when a random color is needed (they aren't specialy pretty colors though!)
var Colors = {
    names: {
        aqua: "#00ffff",
        azure: "#f0ffff",
        beige: "#f5f5dc",
        black: "#000000",
        blue: "#0000ff",
        brown: "#a52a2a",
        cyan: "#00ffff",
        darkblue: "#00008b",
        darkcyan: "#008b8b",
        darkgrey: "#a9a9a9",
        darkgreen: "#006400",
        darkkhaki: "#bdb76b",
        darkmagenta: "#8b008b",
        darkolivegreen: "#556b2f",
        darkorange: "#ff8c00",
        darkorchid: "#9932cc",
        darkred: "#8b0000",
        darksalmon: "#e9967a",
        darkviolet: "#9400d3",
        fuchsia: "#ff00ff",
        gold: "#ffd700",
        green: "#008000",
        indigo: "#4b0082",
        khaki: "#f0e68c",
        lightblue: "#add8e6",
        lightcyan: "#e0ffff",
        lightgreen: "#90ee90",
        lightgrey: "#d3d3d3",
        lightpink: "#ffb6c1",
        lightyellow: "#ffffe0",
        lime: "#00ff00",
        magenta: "#ff00ff",
        maroon: "#800000",
        navy: "#000080",
        olive: "#808000",
        orange: "#ffa500",
        pink: "#ffc0cb",
        purple: "#800080",
        violet: "#800080",
        red: "#ff0000",
        silver: "#c0c0c0",
        white: "#ffffff",
        yellow: "#ffff00"
    },
    random: function random() {
        var result;
        var count = 0;
        for (var prop in this.names) {
            if (Math.random() < 1 / ++count) result = prop;
        }return result;
    }
};

var ColorsSelected = {
    // These colors came from "Pastel1" and "Pastel2" coloramps from ColorBrewer
    colorCodes: ["#b3e2cd", "#fdcdac", "#cbd5e8", "#f4cae4", "#e6f5c9", "#fff2ae", "#f1e2cc", "#cccccc", "#fbb4ae", "#b3cde3", "#ccebc5", "#decbe4", "#fed9a6", "#ffffcc", "#e5d8bd", "#fddaec", "#f2f2f2"],
    seen: new Set(), // In order to avoid randomly returning the same color as the last one, at least for the first layers
    random: function random() {
        var to_rgb = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

        var nb_color = this.colorCodes.length,
            seen = this.seen,
            result_color = this.colorCodes[0],
            attempts = 40; // To avoid a while(true) if it went wrong for any reason
        if (seen.size == nb_color) seen = new Set();
        while (attempts > 0) {
            var ix = Math.round(Math.random() * (nb_color - 1));
            result_color = this.colorCodes[ix];
            if (!seen.has(result_color)) {
                seen.add(result_color);
                break;
            } else {
                --attempts;
            }
        }
        return to_rgb ? hexToRgb(result_color) : result_color;
    }
};
"use strict";

function ContextMenu() {

	this.items = new Array();

	this.addItem = function (item) {
		this.items.push({
			"isSimpleItem": true,
			"name": item["name"],
			"action": item.action
		});
	};

	this.addSubMenu = function (item) {
		this.items.push({
			"isSimpleItem": false,
			"name": item["name"],
			"menu": new ContextMenu()
		});
		this.items[this.items.length - 1]["menu"].setItems(item.items);
	};

	this.removeItemByName = function (name) {
		for (var i = items.length - 1; i > 0; i--) {
			if (this.items[i].name.valueOf() == name.valueOf()) {
				this.items.splice(i, 1);
				break;
			}
		}
	};

	this.setItems = function (items) {
		this.items = new Array();
		for (var i = 0; i < items.length; i++) {
			if (items[i]["name"]) {
				if (items[i].action) this.addItem(items[i]);else if (items[i].items) this.addSubMenu(items[i]);
			}
		}
	};

	this.showMenu = function (event, parent, items) {
		if (items) this.setItems(items);

		if (event.preventDefault) event.preventDefault();else event.returnValue = false;

		if (event.stopPropagation) event.stopPropagation();

		this.initMenu(parent);
		this.DOMObj.style.top = event.clientY + document.body.scrollTop + "px";
		this.DOMObj.style.left = event.clientX + "px";
		var self = this;
		var hideMenu = function hideMenu() {
			if (self.DOMObj && self.DOMObj.parentNode && self.DOMObj.parentNode.removeChild) {
				self.DOMObj.parentNode.removeChild(self.DOMObj);
			}
			self.onclick = undefined;
			document.removeEventListener("click", hideMenu);
		};
		setTimeout(function () {
			document.addEventListener("click", hideMenu);
		}, 150);
	};

	this.initMenu = function (parent) {
		if (this.DOMObj && this.DOMObj.parentNode && this.DOMObj.parentNode.removeChild) {
			this.DOMObj.parentNode.removeChild(this.DOMObj);
		}
		var self = this;
		var menu = document.createElement("div");
		menu.className = "context-menu";
		var list = document.createElement("ul");
		menu.appendChild(list);
		for (var i = 0; i < this.items.length; i++) {
			var item = document.createElement("li");
			list.appendChild(item);
			item.setAttribute("data-index", i);
			var name = document.createElement("span");
			name.className = "context-menu-item-name";
			name.textContent = this.items[i]["name"];
			item.appendChild(name);
			if (this.items[i].isSimpleItem) {
				item.onclick = function () {
					var ix = this.getAttribute("data-index");
					self.items[ix].action();
				};
			} else {
				var arrow = document.createElement("span");
				arrow.className = "arrow";
				arrow.innerHTML = "&#9658;";
				name.appendChild(arrow);
				this.items[i]["menu"].initMenu(item);
				this.items[i]["menu"].DOMObj.style.display = "none";
				item.onmouseover = function () {
					var _this = this;

					setTimeout(function () {
						_this.getElementsByClassName("context-menu")[0].style.display = "";
					}, 500);
				};
				item.onmouseout = function () {
					var _this2 = this;

					setTimeout(function () {
						_this2.getElementsByClassName("context-menu")[0].style.display = "none";
					}, 500);
				};
			}
		}
		this.DOMObj = menu;
		parent.appendChild(menu);
	};
}
"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function getBreaks(values, type, nb_class) {
    var _values = values.filter(function (v) {
        return v;
    }),
        no_data = values.length - _values.length,
        serie = new geostats(_values),
        nb_class = +nb_class || getOptNbClass(_values.length),
        breaks = [];
    if (type === "Q6") {
        var tmp = getBreaksQ6(serie.sorted(), serie.precision);
        breaks = tmp.breaks;
        breaks[0] = serie.min();
        breaks[nb_class] = serie.max();
        serie.setClassManually(breaks);
    } else if (type == "S5") {
        var _tmp = getBreaksS5(serie, serie.precision);
        breaks = _tmp.breaks;
        serie.setClassManually(breaks);
    } else {
        var _func = discretiz_geostats_switch.get(type);
        breaks = serie[_func](nb_class);
        if (serie.precision) breaks = breaks.map(function (val) {
            return round_value(val, serie.precision);
        });
    }
    return [serie, breaks, nb_class, no_data];
}

function discretize_to_size(values, type, nb_class, min_size, max_size) {
    var _getBreaks = getBreaks(values, type, nb_class),
        _getBreaks2 = _slicedToArray(_getBreaks, 3),
        serie = _getBreaks2[0],
        breaks = _getBreaks2[1],
        nb_class = _getBreaks2[2];

    var step = (max_size - min_size) / (nb_class - 1),
        class_size = Array(nb_class).fill(0).map(function (d, i) {
        return min_size + i * step;
    }),
        breaks_prop = [];

    for (var i = 0; i < breaks.length - 1; ++i) {
        breaks_prop.push([[breaks[i], breaks[i + 1]], class_size[i]]);
    }return [nb_class, type, breaks_prop, serie];
}

var discretize_to_colors = function discretize_to_colors(values, type, nb_class, col_ramp_name) {
    col_ramp_name = col_ramp_name || "Reds";

    var _getBreaks3 = getBreaks(values, type, nb_class),
        _getBreaks4 = _slicedToArray(_getBreaks3, 4),
        serie = _getBreaks4[0],
        breaks = _getBreaks4[1],
        nb_class = _getBreaks4[2],
        nb_no_data = _getBreaks4[3],
        color_array = getColorBrewerArray(nb_class, col_ramp_name),
        no_data_color = nb_no_data > 0 ? '#e7e7e7' : null,
        colors_map = [];

    for (var j = 0; j < values.length; ++j) {
        if (values[j] != null && values[j] != "") {
            var idx = serie.getClass(values[j]);
            colors_map.push(color_array[idx]);
        } else {
            colors_map.push(no_data_color);
        }
    }
    return [nb_class, type, breaks, color_array, colors_map, no_data_color];
}.memoize();

// Todo: let the user choose if he wants a regular histogram or a "beeswarm" plot ?
var display_discretization = function display_discretization(layer_name, field_name, nb_class, options) {
    var make_no_data_section = function make_no_data_section() {
        var section = d3.select("#color_div").append("div").attr("id", "no_data_section").append("p").html(i18next.t("disc_box.withnodata", { count: +no_data }));

        section.append("input").attrs({ type: "color", value: "#ebebcd", id: "no_data_color" }).style("margin", "0px 10px");
    };

    var make_sequ_button = function make_sequ_button() {
        var col_div = d3.select("#color_div");
        col_div.selectAll('.color_params').remove();
        col_div.selectAll('.color_txt').remove();
        col_div.selectAll('.color_txt2').remove();
        col_div.selectAll('.central_class').remove();
        col_div.selectAll('.central_color').remove();
        col_div.selectAll('#reverse_pal_btn').remove();
        var sequential_color_select = col_div.insert("p").attr("class", "color_txt").style("margin-left", "10px").html(i18next.t("disc_box.color_palette")).insert("select").attr("class", "color_params").styles({ 'background-image': 'url(/static/img/palettes/Blues.png)', 'width': '116px' }).on("change", function () {
            this.style.backgroundImage = 'url(/static/img/palettes/' + this.value + '.png)';
            redisplay.draw();
        });

        ['Blues', 'BuGn', 'BuPu', 'GnBu', 'OrRd', 'PuBu', 'PuBuGn', 'PuRd', 'RdPu', 'YlGn', 'Greens', 'Greys', 'Oranges', 'Purples', 'Reds'].forEach(function (name) {
            sequential_color_select.append("option").text(name).attrs({ value: name, title: name }).styles({ 'background-image': 'url(/static/img/palettes/' + name + '.png)' });
        });
        var button_reverse = d3.select(".color_txt").insert('p').style('text-align', 'center').insert("button").styles({ "margin-top": "10px" }).attrs({ "class": "button_st3", "id": "reverse_pal_btn" }).html(i18next.t("disc_box.reverse_palette")).on("click", function () {
            to_reverse = true;
            redisplay.draw();
        });
    };

    var make_diverg_button = function make_diverg_button() {
        var col_div = d3.select("#color_div");
        col_div.selectAll('.color_params').remove();
        col_div.selectAll('.color_txt').remove();
        col_div.selectAll('.color_txt2').remove();
        col_div.selectAll('#reverse_pal_btn').remove();
        col_div.insert('p').attr("class", "central_class").html(i18next.t("disc_box.break_on")).insert("input").attrs({
            type: "number", class: "central_class", id: "centr_class",
            min: 1, max: nb_class - 1, step: 1, value: Math.round(nb_class / 2)
        }).style("width", "40px").on("change", function () {
            redisplay.draw();
        });

        var pal_names = ['Blues', 'BuGn', 'BuPu', 'GnBu', 'OrRd', 'PuBu', 'PuBuGn', 'PuRd', 'RdPu', 'YlGn', 'Greens', 'Greys', 'Oranges', 'Purples', 'Reds'];
        var left_color_select = col_div.insert("p").attr("class", "color_txt").style("display", "inline").html(i18next.t("disc_box.left_colramp")).insert("select").style('width', '116px').attr("class", "color_params_left").on("change", function () {
            this.style.backgroundImage = 'url(/static/img/palettes/' + this.value + '.png)';
            redisplay.draw();
        });
        var right_color_select = col_div.insert("p").styles({ display: "inline", "margin-left": "70px" }).attr("class", "color_txt2").html(i18next.t("disc_box.right_colramp")).insert("select").style('width', '116px').attr("class", "color_params_right").on("change", function () {
            this.style.backgroundImage = 'url(/static/img/palettes/' + this.value + '.png)';
            redisplay.draw();
        });
        pal_names.forEach(function (name) {
            left_color_select.append("option").text(name).attrs({ value: name, title: name }).styles({ 'background-image': 'url(/static/img/palettes/' + name + '.png)' });
            right_color_select.append("option").text(name).attrs({ value: name, title: name }).styles({ 'background-image': 'url(/static/img/palettes/' + name + '.png)' });
        });
        document.getElementsByClassName("color_params_right")[0].selectedIndex = 14;

        var central_color = col_div.insert('p').attr("class", "central_color");
        central_color.insert("input").attrs({ "type": "checkbox", "id": "central_color_chkbx" }).on("change", function () {
            redisplay.draw();
            if (this.checked) col_div.select("#central_color_val").style("display", "");else {
                col_div.select('#central_color_val').style('display', 'none');
            }
        });
        central_color.select("input").node().checked = true;
        central_color.insert("label").attr("for", "central_color_chkbx").html(i18next.t("disc_box.colored_central_class"));
        central_color.insert("input").attrs({ type: "color", id: "central_color_val", value: "#e5e5e5" }).style("margin", "0px 10px").on("change", redisplay.draw);
    };

    var make_box_histo_option = function make_box_histo_option() {

        var histo_options = newBox.append('div').attrs({ id: 'histo_options', class: 'row equal' }).styles({ 'margin': '5px 5px 10px 15px', 'width': '100%' });
        var a = histo_options.append('div').attr('class', 'col-xs-6 col-sm-3'),
            b = histo_options.append('div').attr('class', 'col-xs-6 col-sm-3'),
            c = histo_options.append('div').attr('class', 'col-xs-6 col-sm-3'),
            d = histo_options.append('div').attr('class', 'col-xs-6 col-sm-3');

        a.insert('button').attrs({ class: 'btn_population' }).html(i18next.t('disc_box.disp_rug_pop')).on('click', function () {
            if (this.classList.contains('active')) {
                this.classList.remove('active');
                rug_plot.style('display', 'none');
                rug_plot.classed('active', false);
            } else {
                this.classList.add('active');
                rug_plot.style('display', '');
                rug_plot.classed('active', true);
            }
        });

        b.insert('button').attrs({ class: 'btn_mean' }).html(i18next.t('disc_box.disp_mean')).on('click', function () {
            if (this.classList.contains('active')) {
                this.classList.remove('active');
                line_mean.style("stroke-width", 0);
                txt_mean.style("fill", "none");
                line_mean.classed("active", false);
            } else {
                this.classList.add('active');
                line_mean.style("stroke-width", 2);
                txt_mean.style("fill", "blue");
                line_mean.classed("active", true);
            }
        });

        c.insert('button').attrs({ class: 'btn_median' }).html(i18next.t('disc_box.disp_median')).on('click', function () {
            if (this.classList.contains('active')) {
                this.classList.remove('active');
                line_median.style('stroke-width', 0).classed('active', false);
                txt_median.style('fill', 'none');
            } else {
                this.classList.add('active');
                line_median.style('stroke-width', 2).classed('active', true);
                txt_median.style('fill', 'darkgreen');
            }
        });

        d.insert('button').attrs({ class: 'btn_stddev' }).html(i18next.t('disc_box.disp_sd')).on('click', function () {
            if (this.classList.contains('active')) {
                this.classList.remove('active');
                line_std_left.style("stroke-width", 0);
                line_std_left.classed("active", false);
                line_std_right.style("stroke-width", 0);
                line_std_right.classed("active", false);
            } else {
                this.classList.add('active');
                line_std_left.style("stroke-width", 2);
                line_std_left.classed("active", true);
                line_std_right.style("stroke-width", 2);
                line_std_right.classed("active", true);
            }
        });
    };

    var update_axis = function update_axis(group) {
        group.call(d3.axisBottom().scale(x).tickFormat(formatCount));
    };

    var update_overlay_elements = function update_overlay_elements() {
        var x_mean = x(serie.mean()),
            x_med = x(serie.median()),
            x_std_left = x(serie.mean() - serie.stddev()),
            x_std_right = x(serie.mean() + serie.stddev());
        line_mean.transition().attrs({ x1: x_mean, x2: x_mean });
        txt_mean.transition().attr('x', x_mean);
        line_median.transition().attrs({ x1: x_med, x2: x_med });
        txt_median.transition().attr('x', x_med);
        line_std_left.transition().attrs({ x1: x_std_left, x2: x_std_left });
        line_std_right.transition().attrs({ x1: x_std_right, x2: x_std_right });
        rug_plot.selectAll('.indiv').attrs(function (d) {
            return { x1: x(d.value), x2: x(d.value) };
        });
    };

    var make_overlay_elements = function make_overlay_elements() {

        var mean_val = serie.mean(),
            stddev = serie.stddev();

        line_mean = overlay_svg.append("line").attr("class", "line_mean").attr("x1", x(mean_val)).attr("y1", 10).attr("x2", x(mean_val)).attr("y2", svg_h - margin.bottom).styles({ "stroke-width": 0, stroke: "blue", fill: "none" }).classed("active", false);

        txt_mean = overlay_svg.append("text").attr("y", 0).attr("dy", "0.75em").attr("x", x(mean_val)).style("fill", "none").attr("text-anchor", "middle").text(i18next.t("disc_box.mean"));

        line_median = overlay_svg.append("line").attr("class", "line_med").attr("x1", x(serie.median())).attr("y1", 10).attr("x2", x(serie.median())).attr("y2", svg_h - margin.bottom).styles({ "stroke-width": 0, stroke: "darkgreen", fill: "none" }).classed("active", false);

        txt_median = overlay_svg.append("text").attr("y", 0).attr("dy", "0.75em").attr("x", x(serie.median())).style("fill", "none").attr("text-anchor", "middle").text(i18next.t("disc_box.median"));

        line_std_left = overlay_svg.append("line").attr("class", "lines_std").attr("x1", x(mean_val - stddev)).attr("y1", 10).attr("x2", x(mean_val - stddev)).attr("y2", svg_h - margin.bottom).styles({ "stroke-width": 0, stroke: "grey", fill: "none" }).classed("active", false);

        line_std_right = overlay_svg.append("line").attr("class", "lines_std").attr("x1", x(mean_val + stddev)).attr("y1", 10).attr("x2", x(mean_val + stddev)).attr("y2", svg_h - margin.bottom).styles({ "stroke-width": 0, stroke: "grey", fill: "none" }).classed("active", false);

        rug_plot = overlay_svg.append('g').style('display', 'none');
        rug_plot.selectAll('.indiv').data(values.map(function (i) {
            return { value: +i };
        })).enter().insert('line').attrs(function (d) {
            return { class: 'indiv', x1: x(d.value), y1: svg_h - margin.bottom - 10, x2: x(d.value), y2: svg_h - margin.bottom };
        }).styles({ 'stroke': 'red', 'fill': 'none', 'stroke-width': 1 });
    };

    var make_summary = function make_summary() {
        var content_summary = make_content_summary(serie);
        newBox.append("div").attr("id", "summary").styles({ 'font-size': '11px', 'float': 'right', 'margin': '10px 10px 0px 10px' }).insert("p").html(["<b>", i18next.t("disc_box.summary"), "</b><br>", content_summary].join(""));
    };

    var redisplay = {
        compute: function compute() {
            serie = new geostats(values);
            breaks = [];
            values = serie.sorted();

            if (type === "Q6") {
                var tmp = getBreaksQ6(values, serie.precision);
                stock_class = tmp.stock_class;
                breaks = tmp.breaks;
                breaks[0] = serie.min();
                breaks[6] = serie.max();
                serie.setClassManually(breaks);
            } else if (type === "S5") {
                var tmp = getBreaksS5(serie, serie.precision);
                stock_class = tmp.stock_class;
                breaks = tmp.breaks;
                var should_warn = void 0;
                var min = serie.min(),
                    max = serie.max();
                if (breaks[1] < min) {
                    should_warn = true;
                    breaks.shift();
                    stock_class.shift();
                    if (breaks[1] < min) {
                        breaks.shift();
                        stock_class.shift();
                    }
                } else if (breaks[4] > max) {
                    should_warn = true;
                    breaks.pop();
                    stock_class.pop();
                    if (breaks[3] > max) {
                        breaks.pop();
                        stock_class.pop();
                    }
                }
                if (breaks[0] < min) breaks[0] = min;
                if (breaks[breaks.length - 1] > max) breaks[breaks.length - 1] = max;
                if (should_warn) {
                    swal({ title: "",
                        text: i18next.t("app_page.common.warning_not_adapted_classification"),
                        type: "warning",
                        showCancelButton: false,
                        allowOutsideClick: false,
                        confirmButtonColor: "#DD6B55"
                    }).then(function (_) {
                        return null;
                    }, function (dismiss) {
                        return null;
                    });
                }
                serie.setClassManually(breaks);
            } else if (type === "user_defined") {
                var tmp = getBreaks_userDefined(serie.sorted(), user_break_list);
                stock_class = tmp.stock_class;
                breaks = tmp.breaks;

                nb_class = tmp.breaks.length - 1;
                txt_nb_class.node().value = +nb_class;

                if (breaks[0] > serie.min()) breaks[0] = serie.min();
                if (breaks[nb_class] < serie.max()) breaks[nb_class] = serie.max();

                var breaks_serie = breaks.slice();
                if (breaks_serie[0] < serie.min()) {
                    breaks_serie[0] = serie.min();
                }
                if (breaks_serie[nb_class] > serie.max()) {
                    breaks_serie[nb_class] = serie.max();
                }
                serie.setClassManually(breaks_serie);
            } else {
                var _func = discretiz_geostats_switch.get(type);
                breaks = serie[_func](nb_class);
                // if(serie.precision) breaks = breaks.map(val => round_value(val, serie.precision));
                serie.doCount();
                stock_class = Array.prototype.slice.call(serie.counter);
                if (stock_class.length == 0) {
                    return;
                }
            }
            // In order to avoid class limit falling out the serie limits with Std class :
            //            breaks[0] = breaks[0] < serie.min() ? serie.min() : breaks[0];
            //            ^^^ well finally not ?
            bins = [];
            for (var i = 0, len = stock_class.length, offset = 0; i < len; i++) {
                var bin = {};
                bin.val = stock_class[i];
                bin.offset = i == 0 ? 0 : bins[i - 1].width + bins[i - 1].offset;
                bin.width = breaks[i + 1] - breaks[i];
                bin.height = bin.val / (breaks[i + 1] - breaks[i]);
                bins[i] = bin;
            }
            return true;
        },
        draw: function draw(provided_colors) {
            // Clean-up previously made histogram :
            newBox.select("#svg_discretization").selectAll(".bar").remove();
            newBox.select("#svg_discretization").selectAll(".text_bar").remove();

            if (!provided_colors) {
                var col_scheme = newBox.select('.color_params_left').node() ? "diverging" : "sequential";
                if (col_scheme === "sequential") {
                    if (to_reverse) {
                        color_array = color_array.reverse();
                        to_reverse = false;
                    } else {
                        var selected_palette = document.querySelector('.color_params').value;
                        color_array = getColorBrewerArray(nb_class, selected_palette);
                        color_array = color_array.slice(0, nb_class);
                    }
                } else if (col_scheme === "diverging") {
                    var left_palette = document.querySelector('.color_params_left').value,
                        right_palette = document.querySelector('.color_params_right').value,
                        ctl_class_value = +document.getElementById('centr_class').value,
                        ctl_class_color = document.querySelector(".central_color > input").checked ? document.getElementById("central_color_val").value : [];

                    var class_right = nb_class - ctl_class_value + 1,
                        class_left = ctl_class_value - 1,
                        max_col_nb = Math.max(class_right, class_left),
                        right_pal = getColorBrewerArray(max_col_nb, right_palette),
                        left_pal = getColorBrewerArray(max_col_nb, left_palette);

                    left_pal = left_pal.slice(0, class_left).reverse();
                    right_pal = right_pal.slice(0, class_right);

                    color_array = [].concat(left_pal, ctl_class_color, right_pal);
                }
            } else {
                color_array = provided_colors.slice();
            }
            for (var i = 0, len = bins.length; i < len; ++i) {
                bins[i].color = color_array[i];
            }x.domain([breaks[0], breaks[breaks.length - 1]]);
            y.domain([0, d3.max(bins.map(function (d) {
                return d.height + d.height / 3;
            }))]);

            svg_histo.select('.x_axis').transition().call(update_axis);
            update_overlay_elements();

            var xx = d3.scaleLinear().range([0, svg_w]).domain([0, d3.max(bins.map(function (d) {
                return d.offset + d.width;
            }))]);

            var bar = svg_histo.selectAll(".bar").data(bins).enter().append("rect").attrs(function (d, i) {
                return {
                    "class": "bar", "id": "bar_" + i, "transform": "translate(0, -7.5)",
                    "x": xx(d.offset), "y": y(d.height) - margin.bottom,
                    "width": xx(d.width), "height": svg_h - y(d.height)
                };
            }).styles(function (d) {
                return {
                    "opacity": 0.95,
                    "stroke-opacity": 1,
                    "fill": d.color
                };
            }).on("mouseover", function () {
                this.parentElement.querySelector("#text_bar_" + this.id.split('_')[1]).style.display = null;
            }).on("mouseout", function () {
                this.parentElement.querySelector("#text_bar_" + this.id.split('_')[1]).style.display = "none";
            });

            svg_histo.selectAll(".txt_bar").data(bins).enter().append("text").attrs(function (d, i) {
                return {
                    "id": "text_bar_" + i, "class": "text_bar", "text-anchor": "middle",
                    "dy": ".75em", "x": xx(d.offset + d.width / 2), "y": y(d.height) - margin.top * 2 - margin.bottom - 1.5
                };
            }).styles({ "color": "black", "cursor": "default", "display": "none" }).text(function (d) {
                return formatCount(d.val);
            });

            document.getElementById("user_breaks_area").value = breaks.join(' - ');
            return true;
        }
    };

    //////////////////////////////////////////////////////////////////////////

    var modal_box = make_dialog_container("discretiz_charts", [i18next.t("disc_box.title"), " - ", layer_name, " - ", field_name].join(''), "discretiz_charts_dialog");

    var newBox = d3.select("#discretiz_charts").select(".modal-body");

    if (result_data.hasOwnProperty(layer_name)) var db_data = result_data[layer_name];else if (user_data.hasOwnProperty(layer_name)) var db_data = user_data[layer_name];else {
        var layer = svg_map.querySelector('#' + _app.idLayer.get(layer_name));
        var db_data = Array.prototype.map.call(layer.children, function (d) {
            return d.__data__.properties;
        });
    }
    var color_array = [],
        nb_values = db_data.length,
        indexes = [],
        values = [],
        no_data;

    var type = options.type;

    for (var i = 0; i < nb_values; i++) {
        if (db_data[i][field_name] != null && db_data[i][field_name] != "") {
            values.push(+db_data[i][field_name]);
            indexes.push(i);
        }
    }

    if (nb_values == values.length) {
        no_data = 0;
    } else {
        no_data = nb_values - values.length;
        nb_values = values.length;
    }

    var serie = new geostats(values),
        breaks = [],
        stock_class = [],
        bins = [],
        user_break_list = null,
        max_nb_class = 20 < nb_values ? 20 : nb_values;

    if (serie.variance() == 0 && serie.stddev() == 0) {
        var serie = new geostats(values);
    }

    values = serie.sorted();
    var available_functions = [[i18next.t("app_page.common.equal_interval"), "equal_interval"], [i18next.t("app_page.common.quantiles"), "quantiles"],
    //  [i18next.t("app_page.common.S5"), "S5"],
    [i18next.t("app_page.common.Q6"), "Q6"], [i18next.t("app_page.common.arithmetic_progression"), "arithmetic_progression"], [i18next.t("app_page.common.jenks"), "jenks"]];

    if (!serie._hasZeroValue() && !serie._hasNegativeValue()) {
        available_functions.push([i18next.t("app_page.common.geometric_progression"), "geometric_progression"]);
    }
    var precision_axis = get_precision_axis(serie.min(), serie.max(), serie.precision);
    var formatCount = d3.format(precision_axis);
    var discretization = newBox.append('div').attr("id", "discretization_panel").insert("p").insert("select").attr("class", "params").on("change", function () {
        type = this.value;
        if (type === "Q6") {
            nb_class = 6;
            txt_nb_class.node().value = 6;
            document.getElementById("nb_class_range").value = 6;
        } else if (type === "S5") {
            nb_class = 5;
            txt_nb_class.node().value = 5;
            document.getElementById("nb_class_range").value = 5;
        }
        redisplay.compute();
        redisplay.draw();
    });

    available_functions.forEach(function (func) {
        discretization.append("option").text(func[0]).attr("value", func[1]);
    });

    var txt_nb_class = d3.select("#discretization_panel").append("input").attrs({ type: "number", class: "without_spinner", min: 2, max: max_nb_class, value: nb_class, step: 1 }).styles({ width: "30px", "margin": "0 10px", "vertical-align": "calc(20%)" }).on("change", function () {
        var a = disc_nb_class.node();
        a.value = this.value;
        a.dispatchEvent(new Event('change'));
    });

    d3.select("#discretization_panel").append('span').html(i18next.t("disc_box.class"));

    var disc_nb_class = d3.select("#discretization_panel").insert("input").styles({ display: "inline", width: "60px", "vertical-align": "middle", margin: "10px" }).attrs({ id: "nb_class_range", type: "range" }).attrs({ min: 2, max: max_nb_class, value: nb_class, step: 1 }).on("change", function () {
        type = discretization.node().value;
        var old_nb_class = nb_class;
        if (type === "Q6") {
            this.value = 6;
            txt_nb_class.node().value = 6;
            return;
        } else if (type === "S5") {
            this.value = 5;
            txt_nb_class.node().value = 5;
            return;
        }
        nb_class = +this.value;
        txt_nb_class.node().value = nb_class;
        var ret_val = redisplay.compute();
        if (!ret_val) {
            this.value = old_nb_class;
            txt_nb_class.node().value = +old_nb_class;
        } else {
            redisplay.draw();
            var ctl_class = document.getElementById("centr_class");
            if (ctl_class) {
                ctl_class.max = nb_class;
                if (ctl_class > nb_class) ctl_class.value = Math.round(nb_class / 2);
            }
        }
    });

    var ref_histo_box = newBox.append('div').attr("id", "ref_histo_box");
    ref_histo_box.append('div').attr('id', 'inner_ref_histo_box');

    discretization.node().value = type;
    make_summary();
    var refDisplay = prepare_ref_histo(newBox, serie, formatCount);
    refDisplay("histogram");

    var svg_h = h / 5 > 100 ? h / 5 : 100,
        svg_w = 760 < window.innerWidth - 40 ? 760 : window.innerWidth - 40,
        margin = { top: 7.5, right: 30, bottom: 7.5, left: 30 },
        height = svg_h - margin.top - margin.bottom;

    d3.select("#discretiz_charts").select(".modal-dialog").styles({ width: svg_w + margin.top + margin.bottom + 90 + "px",
        height: window.innerHeight - 60 + "px" });

    if (values.length < 500) {
        (function () {
            // Only allow for beeswarm plot if there isn't too many values
            // as it seems to be costly due to the "simulation" + the voronoi
            var current_histo = "histogram",
                choice_histo = ref_histo_box.append('p').style('text-align', 'center');
            choice_histo.insert('button').attrs({ id: 'button_switch_plot', class: 'i18n button_st4', 'data-i18n': '[text]disc_box.switch_ref_histo' }).styles({ padding: '3px', 'font-size': '10px' }).html(i18next.t('disc_box.switch_ref_histo')).on('click', function () {
                var str_tr = void 0;
                if (current_histo == 'histogram') {
                    refDisplay("box_plot");
                    current_histo = "box_plot";
                    str_tr = "_boxplot";
                } else if (current_histo == "box_plot") {
                    refDisplay("beeswarm");
                    current_histo = "beeswarm";
                    str_tr = '_beeswarm';
                } else if (current_histo == "beeswarm") {
                    refDisplay("histogram");
                    current_histo = "histogram";
                    str_tr = '';
                }
                document.getElementById('ref_histo_title').innerHTML = '<b>' + i18next.t('disc_box.hist_ref_title' + str_tr) + '</b>';
            });
        })();
    }
    var div_svg = newBox.append('div').append("svg").attr("id", "svg_discretization").attr("width", svg_w + margin.left + margin.right).attr("height", svg_h + margin.top + margin.bottom);

    make_box_histo_option();

    var svg_histo = div_svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scaleLinear().domain([serie.min(), serie.max()]).range([0, svg_w]);

    var y = d3.scaleLinear().range([svg_h, 0]);

    var overlay_svg = div_svg.append("g").attr('transform', 'translate(30, 0)'),
        line_mean,
        line_std_right,
        line_std_left,
        line_median,
        txt_median,
        txt_mean,
        rug_plot,
        x;

    make_overlay_elements();

    svg_histo.append("g").attr("class", "x_axis").attr("transform", "translate(0," + height + ")").call(d3.axisBottom().scale(x).tickFormat(formatCount));

    var b_accordion_colors = newBox.append("button").attrs({ "class": "accordion_disc active", "id": "btn_acc_disc_color" }).style("padding", "0 6px").html(i18next.t("disc_box.title_color_scheme")),
        accordion_colors = newBox.append("div").attrs({ "class": "panel show", "id": "accordion_colors" }).style("width", "98%"),
        color_scheme = d3.select("#accordion_colors").append("div").attr("id", "color_div").style("text-align", "center");

    [[i18next.t("disc_box.sequential"), "sequential"], [i18next.t("disc_box.diverging"), "diverging"]].forEach(function (el) {
        color_scheme.insert("label").style("margin", "20px").html(el[0]).insert('input').attrs({ type: "radio", name: "color_scheme", value: el[1], id: "button_" + el[1] }).on("change", function () {
            this.value === "sequential" ? make_sequ_button() : make_diverg_button();
            redisplay.draw();
        });
    });
    var to_reverse = false;
    document.getElementById("button_sequential").checked = true;

    var b_accordion_breaks = newBox.append("button").attrs({ "class": "accordion_disc", "id": "btn_acc_disc_break" }).style("padding", "0 6px").html(i18next.t("disc_box.title_break_values")),
        accordion_breaks = newBox.append("div").attrs({ "class": "panel", "id": "accordion_breaks_vals" }).style("width", "98%");

    var user_defined_breaks = accordion_breaks.append("div").attr("id", "user_breaks");

    user_defined_breaks.insert("textarea").attr("id", "user_breaks_area").attr("placeholder", i18next.t("app_page.common.expected_class")).style("width", "600px");

    user_defined_breaks.insert("button").text(i18next.t("app_page.common.valid")).on("click", function () {
        var old_nb_class = nb_class;
        user_break_list = document.getElementById("user_breaks_area").value;
        type = "user_defined";
        // nb_class = user_break_list.split('-').length - 1;
        // txt_nb_class.node().value = +nb_class;
        // txt_nb_class.html(i18next.t("disc_box.class", {count: +nb_class}));
        document.getElementById("nb_class_range").value = nb_class;
        redisplay.compute();
        redisplay.draw();
    });

    accordionize(".accordion_disc", d3.select("#discretiz_charts").node());

    if (no_data > 0) {
        make_no_data_section();
        if (options.no_data) {
            document.getElementById("no_data_color").value = options.no_data;
        }
    }

    if (!options.schema) {
        make_sequ_button();
    } else if (options.schema.length == 1) {
        make_sequ_button();
        document.querySelector(".color_params").value = options.schema[0];
        document.querySelector(".color_params").style.backgroundImage = 'url(/static/img/palettes/' + options.schema[0] + '.png)';
    } else if (options.schema.length > 1) {
        make_diverg_button();
        document.getElementById("button_diverging").checked = true;
        var tmp = 0;
        setSelected(document.querySelector(".color_params_left"), options.schema[0]);
        // document.querySelector(".color_params_left").value = options.schema[0];
        if (options.schema.length > 2) {
            var e = document.getElementById('central_color_val');
            e.style.display = '';
            e.value = options.schema[1];
            tmp = 1;
            document.querySelector(".central_color").querySelector("input").checked = true;
        } else {
            document.querySelector(".central_color").querySelector("input").checked = false;
        }
        setSelected(document.querySelector(".color_params_right"), options.schema[1 + tmp]);
        // document.querySelector(".color_params_right").value = options.schema[1 + tmp];
    }

    if (options.type && options.type == "user_defined") {
        user_break_list = options.breaks;
    }

    redisplay.compute();
    redisplay.draw(options.colors);

    var deferred = Q.defer(),
        container = document.getElementById("discretiz_charts");

    container.querySelector(".btn_ok").onclick = function () {
        breaks = breaks.map(function (i) {
            return +i;
        });
        var colors_map = [];
        var no_data_color = null;
        if (no_data > 0) {
            no_data_color = document.getElementById("no_data_color").value;
        }
        for (var j = 0; j < db_data.length; ++j) {
            var value = db_data[j][field_name];
            if (value !== null && isFinite(value) && value != "") {
                var idx = serie.getClass(+value);
                colors_map.push(color_array[idx]);
            } else {

                colors_map.push(no_data_color);
            }
        }
        var col_schema = [];
        if (!d3.select('.color_params_left').node()) {
            col_schema.push(document.querySelector(".color_params").value);
        } else {
            col_schema.push(document.querySelector(".color_params_left").value);
            if (document.querySelector(".central_color").querySelector("input").checked) {
                col_schema.push(document.getElementById("central_color_val").value);
            }
            col_schema.push(document.querySelector(".color_params_right").value);
        }
        deferred.resolve([nb_class, type, breaks, color_array, colors_map, col_schema, no_data_color]);
        document.removeEventListener('keydown', helper_esc_key_twbs);
        container.remove();
        var p = reOpenParent();
        if (!p) overlay_under_modal.hide();
    };

    var _onclose = function _onclose() {
        deferred.resolve(false);
        document.removeEventListener('keydown', helper_esc_key_twbs);
        container.remove();
        var p = reOpenParent();
        if (!p) overlay_under_modal.hide();
    };
    container.querySelector(".btn_cancel").onclick = _onclose;
    container.querySelector("#xclose").onclick = _onclose;
    function helper_esc_key_twbs(evt) {
        evt = evt || window.event;
        var isEscape = "key" in evt ? evt.key == "Escape" || evt.key == "Esc" : evt.keyCode == 27;
        if (isEscape) {
            evt.stopPropagation();
            _onclose();
        }
    }
    document.addEventListener('keydown', helper_esc_key_twbs);
    overlay_under_modal.display();
    return deferred.promise;
};

function fetch_categorical_colors() {
    var categ = document.getElementsByClassName("typo_class"),
        color_map = new Map();
    for (var i = 0; i < categ.length; i++) {
        var color = rgb2hex(categ[i].querySelector(".color_square").style.backgroundColor),
            new_name = categ[i].querySelector(".typo_name").value,
            nb_features = categ[i].querySelector('.typo_count_ft').getAttribute('data-count');
        color_map.set(categ[i].__data__.name, [color, new_name, nb_features]);
    }
    return color_map;
}

function display_categorical_box(data_layer, layer_name, field, cats) {
    console.log(data_layer, layer_name, field, cats);
    var nb_features = current_layers[layer_name].n_features,
        nb_class = cats.length;

    var modal_box = make_dialog_container("categorical_box", i18next.t("app_page.categorical_box.title", { layer: layer_name, nb_features: nb_features }), "dialog");

    var newbox = d3.select("#categorical_box").select(".modal-body").styles({ 'overflow-y': 'scroll', 'max-height': window.innerHeight - 145 + 'px' });

    newbox.append("h3").html("");
    newbox.append("p").html(i18next.t("app_page.symbol_typo_box.field_categ", { field: field, nb_class: +nb_class, nb_features: +nb_features }));

    newbox.append("ul").style("padding", "unset").attr("id", "sortable_typo_name").selectAll("li").data(cats).enter().append("li").styles({ margin: "auto", "list-style": "none" }).attr("class", "typo_class").attr("id", function (d, i) {
        return ["line", i].join('_');
    });

    newbox.selectAll(".typo_class").append("input").styles({ width: "140px", height: "auto", display: "inline-block", "vertical-align": "middle", "margin-right": "20px" }).attrs(function (d) {
        return { class: 'typo_name', value: d.display_name, id: d.name };
    });

    newbox.selectAll(".typo_class").insert("p").attr("class", "color_square").style("background-color", function (d) {
        return d.color;
    }).styles({ width: "22px", height: "22px", margin: 'auto', 'vertical-align': 'middle',
        "border-radius": "10%", display: "inline-block" }).on("click", function () {
        var self = this;
        var this_color = self.style.backgroundColor;
        var input_col = document.createElement("input");
        input_col.setAttribute("type", "color");
        input_col.setAttribute("value", rgb2hex(this_color));
        input_col.className = "color_input";
        input_col.onchange = function (change) {
            self.style.backgroundColor = hexToRgb(change.target.value, "string");
        };
        var t = input_col.dispatchEvent(new MouseEvent("click"));
    });

    newbox.selectAll(".typo_class").insert("span").attrs(function (d) {
        return { class: 'typo_count_ft', 'data-count': d.nb_elem };
    }).html(function (d) {
        return i18next.t("app_page.symbol_typo_box.count_feature", { nb_features: +d.nb_elem });
    });

    newbox.insert("p").insert("button").attr("class", "button_st3").html(i18next.t("app_page.categorical_box.new_random_colors")).on("click", function () {
        var lines = document.getElementsByClassName("typo_class");
        for (var i = 0; i < lines.length; ++i) {
            lines[i].querySelector(".color_square").style.backgroundColor = Colors.names[Colors.random()];
        }
    });

    new Sortable(document.getElementById("sortable_typo_name"));

    var deferred = Q.defer(),
        container = document.getElementById("categorical_box"),
        _onclose = function _onclose() {
        deferred.resolve(false);
        document.removeEventListener('keydown', helper_esc_key_twbs);
        container.remove();
        var p = reOpenParent();
        if (!p) overlay_under_modal.hide();
    };

    container.querySelector(".btn_ok").onclick = function () {
        var color_map = fetch_categorical_colors();
        var colorByFeature = data_layer.map(function (ft) {
            return color_map.get(ft[field])[0];
        });
        deferred.resolve([nb_class, color_map, colorByFeature]);
        document.removeEventListener('keydown', helper_esc_key_twbs);
        container.remove();
        var p = reOpenParent();
        if (!p) overlay_under_modal.hide();
    };

    container.querySelector(".btn_cancel").onclick = _onclose;
    container.querySelector("#xclose").onclick = _onclose;
    function helper_esc_key_twbs(evt) {
        evt = evt || window.event;
        var isEscape = "key" in evt ? evt.key == "Escape" || evt.key == "Esc" : evt.keyCode == 27;
        if (isEscape) {
            evt.stopPropagation();
            _onclose();
        }
    }
    document.addEventListener('keydown', helper_esc_key_twbs);
    overlay_under_modal.display();
    return deferred.promise;
};

function reOpenParent(css_selector) {
    var parent_style_box = css_selector !== undefined ? document.querySelector(css_selector) : document.querySelector('.styleBox');
    if (parent_style_box && parent_style_box.modal && parent_style_box.modal.show) {
        parent_style_box.modal.show();
        return true;
    } else {
        return false;
    }
}

var prepare_ref_histo = function prepare_ref_histo(parent_node, serie, formatCount) {
    var svg_h = h / 7.25 > 80 ? h / 7.25 : 80,
        svg_w = w / 4 > 320 ? 320 : w / 4,
        values = serie.sorted(),
        nb_bins = 51 < values.length / 3 ? 50 : Math.ceil(Math.sqrt(values.length)) + 1;
    var q5 = serie.getQuantile(4).map(function (v) {
        return +v;
    });

    var m_margin = { top: 10, right: 20, bottom: 10, left: 20 },
        m_width = svg_w - m_margin.right - m_margin.left,
        m_height = svg_h - m_margin.top - m_margin.bottom;

    var ref_histo = parent_node.select("#ref_histo_box").select('#inner_ref_histo_box');
    // ref_histo.node().innerHTML = "";
    ref_histo.append('p').attrs({ id: 'ref_histo_title' }).styles({ "margin": "auto", "text-align": "center" }).html('<b>' + i18next.t('disc_box.hist_ref_title') + '</b>');

    var c = ref_histo.append("svg").attr("id", "svg_ref_histo").attr("width", svg_w + m_margin.left + m_margin.right).attr("height", svg_h + m_margin.top + m_margin.bottom);
    var svg_ref_histo = c.append("g").attr("transform", "translate(" + (m_margin.left + m_margin.right) + "," + m_margin.top + ")");

    var x = d3.scaleLinear().domain([serie.min(), serie.max()]).rangeRound([0, m_width]);

    return function (type) {
        svg_ref_histo.remove();
        svg_ref_histo = c.append("g").attr("transform", "translate(" + (m_margin.left + m_margin.right) + "," + m_margin.top + ")");
        if (type == 'histogram') {
            var data = d3.histogram().domain(x.domain()).thresholds(x.ticks(nb_bins))(values);

            var y = d3.scaleLinear().domain([0, d3.max(data, function (d) {
                return d.length;
            })]).range([m_height, 0]);

            var bar = svg_ref_histo.selectAll(".bar").data(data).enter().append("rect").attrs(function (d) {
                return {
                    "class": "bar", "width": Math.abs(x(d.x1)) - Math.abs(x(d.x0)), "height": m_height - y(d.length), "x": 0,
                    "transform": "translate(" + x(d.x0) + "," + y(d.length) + ")"
                };
            }).styles({ fill: "beige", stroke: "black", "stroke-width": "0.4px" });

            svg_ref_histo.append("g").style("font-size", "10px").attrs({ 'class': 'x_axis', 'transform': 'translate(0,' + m_height + ')' }).call(d3.axisBottom().scale(x).ticks(4).tickFormat(formatCount)).selectAll("text").attr("y", 4).attr("x", -4).attr("dy", ".45em").attr("transform", "rotate(-40)").style("text-anchor", "end");

            svg_ref_histo.append("g").attr("class", "y_axis").style("font-size", "10px").call(d3.axisLeft().scale(y).ticks(5).tickFormat(d3.format(".0f")));
        } else if (type == "box_plot") {
            svg_ref_histo.append("g").style("font-size", "10px").attrs({ 'class': 'x_axis', 'transform': 'translate(0,' + m_height + ')' }).call(d3.axisBottom().scale(x).ticks(4).tickFormat(formatCount)).selectAll("text").attr("y", 4).attr("x", -4).attr("dy", ".45em").attr("transform", "rotate(-40)").style("text-anchor", "end");

            var y_mid = (m_margin.top + m_height - m_margin.bottom) / 2;

            var min = svg_ref_histo.append('g').insert('line').attrs({ x1: x(q5[0]), y1: m_margin.top * 2, x2: x(q5[0]), y2: m_height - m_margin.bottom * 2 }).styles({ "stroke-width": 1, stroke: "black", fill: "none" });

            var rect = svg_ref_histo.append('g').insert('rect').attrs({ x: x(q5[1]), y: m_margin.top, width: x(q5[2]) - x(q5[1]), height: m_height - m_margin.bottom - m_margin.top }).styles({ "stroke-width": 1, stroke: "black", fill: "lightblue" });

            var med = svg_ref_histo.append('g').insert('line').attrs({ x1: x(q5[2]), y1: m_margin.top, x2: x(q5[2]), y2: m_height - m_margin.bottom }).styles({ "stroke-width": 3, stroke: "black", fill: "none" });

            var rect = svg_ref_histo.append('g').insert('rect').attrs({ x: x(q5[2]), y: m_margin.top, width: x(q5[3]) - x(q5[2]), height: m_height - m_margin.bottom - m_margin.top }).styles({ "stroke-width": 1, stroke: "black", fill: "lightblue" });

            var max = svg_ref_histo.append('g').insert('line').attrs({ x1: x(q5[4]), y1: m_margin.top * 2, x2: x(q5[4]), y2: m_height - m_margin.bottom * 2 }).styles({ "stroke-width": 1, stroke: "black", fill: "none" });

            var interline_min = svg_ref_histo.append('g').insert('line').attrs({ x1: x(q5[0]), y1: y_mid, x2: x(q5[1]), y2: y_mid }).styles({ "stroke-width": 1, stroke: "black", fill: "none", 'stroke-dasharray': '3,3' });

            var interline_max = svg_ref_histo.append('g').insert('line').attrs({ x1: x(q5[3]), y1: y_mid, x2: x(q5[4]), y2: y_mid }).styles({ "stroke-width": 1, stroke: "black", fill: "none", 'stroke-dasharray': '3,3' });
        } else if (type == "beeswarm") {
            var data = values.map(function (v) {
                return { value: +v };
            });

            var simulation = d3.forceSimulation(data).force("x", d3.forceX(function (d) {
                return x(d.value);
            }).strength(1)).force("y", d3.forceY(m_height / 2).strength(2)).force("collide", d3.forceCollide(4)).stop();

            for (var i = 0; i < 75; ++i) {
                simulation.tick();
            }svg_ref_histo.append("g").style("font-size", "10px").attrs({ 'class': 'x_axis', 'transform': 'translate(0,' + m_height + ')' }).call(d3.axisBottom().scale(x).ticks(4).tickFormat(formatCount)).selectAll("text").attr("y", 4).attr("x", -4).attr("dy", ".45em").attr("transform", "rotate(-40)").style("text-anchor", "end");

            var cell = svg_ref_histo.append("g").attr("class", "cells").selectAll("g").data(d3.voronoi().extent([[0, 0], [m_width, m_height]]).x(function (d) {
                return d.x;
            }).y(function (d) {
                return d.y;
            }).polygons(data)).enter().append("g");

            cell.append("circle").attrs(function (d) {
                if (d) return {
                    r: data.lenght < 250 ? 2.5 : data.lenght < 500 ? 1.5 : 1, transform: 'translate(' + d.data.x + ',' + d.data.y + ')' };
            });

            cell.append("path").attr('d', function (d) {
                if (d) return 'M' + d.join('L') + 'Z';
            });
        }
    };
};
"use strict";

var display_discretization_links_discont = function display_discretization_links_discont(layer_name, field_name, nb_class, type) {
    var make_box_histo_option = function make_box_histo_option() {
        var histo_options = newBox.append('div').attrs({ id: 'histo_options', class: 'row equal' }).styles({ 'margin': '5px 5px 10px 15px', 'width': '100%' });
        var a = histo_options.append('div').attr('class', 'col-xs-6 col-sm-3'),
            b = histo_options.append('div').attr('class', 'col-xs-6 col-sm-3'),
            c = histo_options.append('div').attr('class', 'col-xs-6 col-sm-3'),
            d = histo_options.append('div').attr('class', 'col-xs-6 col-sm-3');

        a.insert('button').attrs({ class: 'btn_population' }).html(i18next.t('disc_box.disp_rug_pop')).on('click', function () {
            if (this.classList.contains('active')) {
                this.classList.remove('active');
                rug_plot.style('display', 'none');
                rug_plot.classed('active', false);
            } else {
                this.classList.add('active');
                rug_plot.style('display', '');
                rug_plot.classed('active', true);
            }
        });

        b.insert('button').attrs({ class: 'btn_mean' }).html(i18next.t('disc_box.disp_mean')).on('click', function () {
            if (this.classList.contains('active')) {
                this.classList.remove('active');
                line_mean.style("stroke-width", 0);
                txt_mean.style("fill", "none");
                line_mean.classed("active", false);
            } else {
                this.classList.add('active');
                line_mean.style("stroke-width", 2);
                txt_mean.style("fill", "blue");
                line_mean.classed("active", true);
            }
        });

        c.insert('button').attrs({ class: 'btn_median' }).html(i18next.t('disc_box.disp_median')).on('click', function () {
            if (this.classList.contains('active')) {
                this.classList.remove('active');
                line_median.style('stroke-width', 0).classed('active', false);
                txt_median.style('fill', 'none');
            } else {
                this.classList.add('active');
                line_median.style('stroke-width', 2).classed('active', true);
                txt_median.style('fill', 'darkgreen');
            }
        });

        d.insert('button').attrs({ class: 'btn_stddev' }).html(i18next.t('disc_box.disp_sd')).on('click', function () {
            if (this.classList.contains('active')) {
                this.classList.remove('active');
                line_std_left.style("stroke-width", 0);
                line_std_left.classed("active", false);
                line_std_right.style("stroke-width", 0);
                line_std_right.classed("active", false);
            } else {
                this.classList.add('active');
                line_std_left.style("stroke-width", 2);
                line_std_left.classed("active", true);
                line_std_right.style("stroke-width", 2);
                line_std_right.classed("active", true);
            }
        });
    };

    var make_overlay_elements = function make_overlay_elements() {

        var mean_val = serie.mean(),
            stddev = serie.stddev();

        line_mean = overlay_svg.append("line").attr("class", "line_mean").attr("x1", x(mean_val)).attr("y1", 10).attr("x2", x(mean_val)).attr("y2", svg_h - margin.bottom).styles({ "stroke-width": 0, stroke: "blue", fill: "none" }).classed("active", false);

        txt_mean = overlay_svg.append("text").attr("y", 0).attr("dy", "0.75em").attr("x", x(mean_val)).style("fill", "none").attr("text-anchor", "middle").text(i18next.t("disc_box.mean"));

        line_median = overlay_svg.append("line").attr("class", "line_med").attr("x1", x(serie.median())).attr("y1", 10).attr("x2", x(serie.median())).attr("y2", svg_h - margin.bottom).styles({ "stroke-width": 0, stroke: "darkgreen", fill: "none" }).classed("active", false);

        txt_median = overlay_svg.append("text").attr("y", 0).attr("dy", "0.75em").attr("x", x(serie.median())).style("fill", "none").attr("text-anchor", "middle").text(i18next.t("disc_box.median"));

        line_std_left = overlay_svg.append("line").attr("class", "lines_std").attr("x1", x(mean_val - stddev)).attr("y1", 10).attr("x2", x(mean_val - stddev)).attr("y2", svg_h - margin.bottom).styles({ "stroke-width": 0, stroke: "grey", fill: "none" }).classed("active", false);

        line_std_right = overlay_svg.append("line").attr("class", "lines_std").attr("x1", x(mean_val + stddev)).attr("y1", 10).attr("x2", x(mean_val + stddev)).attr("y2", svg_h - margin.bottom).styles({ "stroke-width": 0, stroke: "grey", fill: "none" }).classed("active", false);

        rug_plot = overlay_svg.append('g').style('display', 'none');
        rug_plot.selectAll('.indiv').data(values.map(function (i) {
            return { value: +i };
        })).enter().insert('line').attrs(function (d) {
            return { class: 'indiv', x1: x(d.value), y1: svg_h - margin.bottom - 10, x2: x(d.value), y2: svg_h - margin.bottom };
        }).styles({ 'stroke': 'red', 'fill': 'none', 'stroke-width': 1 });
    };

    var make_summary = function make_summary() {
        var content_summary = make_content_summary(serie);
        newBox.append("div").attr("id", "summary").styles({ "margin-left": "25px", "margin-right": "50px",
            "font-size": "10px", "float": "right" }).insert("p").html(["<b>", i18next.t("disc_box.summary"), "</b><br>", content_summary].join(""));
    };

    var update_breaks = function update_breaks(user_defined) {
        if (!user_defined) {
            make_min_max_tableau(values, nb_class, type, last_min, last_max, "sizes_div", undefined, callback);
        }
        var tmp_breaks = fetch_min_max_table_value("sizes_div");
        var len_breaks = tmp_breaks.sizes.length;
        breaks_info = [];
        last_min = tmp_breaks.sizes[0];
        last_max = tmp_breaks.sizes[tmp_breaks.sizes.length - 1];
        if (+tmp_breaks.mins[0] > +serie.min()) {
            nb_class += 1;
            txt_nb_class.node().value = nb_class;
            // txt_nb_class.html(i18next.t("disc_box.class", {count: nb_class}));
            breaks_info.push([[serie.min(), +tmp_breaks.mins[0]], 0]);
        }

        for (var i = 0; i < len_breaks; i++) {
            breaks_info.push([[tmp_breaks.mins[i], tmp_breaks.maxs[i]], tmp_breaks.sizes[i]]);
        }breaks = [breaks_info[0][0][0]].concat(breaks_info.map(function (ft) {
            return ft[0][1];
        }));
        if (user_defined) {
            make_min_max_tableau(null, nb_class, type, last_min, last_max, "sizes_div", breaks_info, callback);
        }
    };

    var redisplay = {
        compute: function compute() {
            bins = [];
            for (var i = 0, len = breaks_info.length; i < len; i++) {
                var bin = {};
                bin.offset = i == 0 ? 0 : bins[i - 1].width + bins[i - 1].offset;
                bin.width = breaks[i + 1] - breaks[i];
                bin.height = breaks_info[i][1];
                bins[i] = bin;
            }
            return true;
        },
        draw: function draw() {
            // Clean-up previously made histogram :
            d3.select("#svg_discretization").selectAll(".bar").remove();

            for (var i = 0, len = bins.length; i < len; ++i) {
                bins[i].color = array_color[i];
            }var x = d3.scaleLinear().domain([serie.min(), serie.max()]).range([0, svg_w]);

            var y = d3.scaleLinear().range([svg_h, 0]);

            x.domain([0, d3.max(bins.map(function (d) {
                return d.offset + d.width;
            }))]);
            y.domain([0, d3.max(bins.map(function (d) {
                return d.height + d.height / 5;
            }))]);

            var bar = svg_histo.selectAll(".bar").data(bins).enter().append("rect").attrs(function (d, i) {
                return {
                    "class": "bar", "id": "bar_" + i, "transform": "translate(0, -17.5)",
                    "x": x(d.offset), "y": y(d.height) - margin.bottom,
                    "width": x(d.width), "height": svg_h - y(d.height)
                };
            }).styles(function (d) {
                return {
                    "opacity": 0.95,
                    "stroke-opacity": 1,
                    "fill": d.color
                };
            });

            return true;
        }
    };

    //////////////////////////////////////////////////////////////////////////

    var title_box = [i18next.t("disc_box.title"), " - ", layer_name, " - ", field_name].join('');
    var modal_box = make_dialog_container("discretiz_charts", title_box, "discretiz_charts_dialog");

    var newBox = d3.select("#discretiz_charts").select(".modal-body");

    if (result_data.hasOwnProperty(layer_name)) var db_data = result_data[layer_name];else if (user_data.hasOwnProperty(layer_name)) var db_data = user_data[layer_name];

    var color_array = [],
        nb_values = db_data.length,
        indexes = [],
        values = [],
        no_data;

    for (var i = 0; i < nb_values; i++) {
        if (db_data[i][field_name] != null) {
            values.push(+db_data[i][field_name]);
            indexes.push(i);
        }
    }

    if (nb_values == values.length) {
        no_data = 0;
    } else {
        no_data = nb_values - values.length;
        nb_values = values.length;
    }

    var serie = new geostats(values),
        breaks_info = [].concat(current_layers[layer_name].breaks),
        breaks = [+breaks_info[0][0][0]],
        stock_class = [],
        bins = [],
        max_nb_class = 20 < nb_values ? 20 : nb_values,
        sizes = current_layers[layer_name].breaks.map(function (el) {
        return el[1];
    }),
        last_min = min_fast(sizes),
        last_max = max_fast(sizes),
        array_color = d3.schemeCategory20.slice();

    breaks_info.forEach(function (elem) {
        breaks.push(elem[0][1]);
    });

    if (serie.variance() == 0 && serie.stddev() == 0) {
        var serie = new geostats(values);
    }

    values = serie.sorted();
    //    serie.setPrecision(6);
    var available_functions = [[i18next.t("app_page.common.equal_interval"), "equal_interval"], [i18next.t("app_page.common.quantiles"), "quantiles"], [i18next.t("app_page.common.user_defined"), "user_defined"],
    //     [i18next.t("app_page.common.std_dev"), "std_dev"],
    [i18next.t("app_page.common.Q6"), "Q6"], [i18next.t("app_page.common.arithmetic_progression"), "arithmetic_progression"], [i18next.t("app_page.common.jenks"), "jenks"]];

    if (!serie._hasZeroValue() && !serie._hasZeroValue()) {
        available_functions.push([i18next.t("app_page.common.geometric_progression"), "geometric_progression"]);
    }
    var precision_axis = get_precision_axis(serie.min(), serie.max(), serie.precision);
    var formatCount = d3.format(precision_axis);

    var discretization = newBox.append('div').attr("id", "discretization_panel").insert("p").html("Type ").insert("select").attr("class", "params").on("change", function () {
        var old_type = type;
        if (this.value == "user_defined") {
            this.value = old_type;
            return;
        }
        type = this.value;
        if (type === "Q6") {
            nb_class = 6;
            txt_nb_class.node().value = nb_class;
            // txt_nb_class.html(i18next.t("disc_box.class", {count: nb_class}));
            document.getElementById("nb_class_range").value = 6;
        }
        update_breaks();
        redisplay.compute();
        redisplay.draw();
    });

    available_functions.forEach(function (func) {
        discretization.append("option").text(func[0]).attr("value", func[1]);
    });

    var ref_histo_box = newBox.append('div').attr("id", "ref_histo_box");
    ref_histo_box.append('div').attr('id', 'inner_ref_histo_box');

    discretization.node().value = type;

    make_summary();

    var refDisplay = prepare_ref_histo(newBox, serie, formatCount);
    refDisplay("histogram");

    if (values.length < 750) {
        (function () {
            // Only allow for beeswarm plot if there isn't too many values
            // as it seems to be costly due to the "simulation" + the voronoi
            var current_histo = "histogram",
                choice_histo = ref_histo_box.append('p').style('text-align', 'center');
            choice_histo.insert('button').attrs({ id: 'button_switch_plot', class: 'i18n button_st4', 'data-i18n': '[text]disc_box.switch_ref_histo' }).styles({ padding: '3px', 'font-size': '10px' }).html(i18next.t('disc_box.switch_ref_histo')).on('click', function () {
                if (current_histo == 'histogram') {
                    refDisplay("box_plot");
                    current_histo = "box_plot";
                } else if (current_histo == "box_plot") {
                    refDisplay("beeswarm");
                    current_histo = "beeswarm";
                } else if (current_histo == "beeswarm") {
                    refDisplay("histogram");
                    current_histo = "histogram";
                }
            });
        })();
    }

    var txt_nb_class = d3.select("#discretization_panel").append("input").attrs({ type: "number", class: "without_spinner", min: 2, max: max_nb_class, value: nb_class, step: 1 }).styles({ width: "30px", "margin": "0 10px", "vertical-align": "calc(20%)" }).on("change", function () {
        var a = disc_nb_class.node();
        a.value = this.value;
        a.dispatchEvent(new Event('change'));
    });

    d3.select("#discretization_panel").append('span').html(i18next.t("disc_box.class"));

    var disc_nb_class = d3.select("#discretization_panel").insert("input").styles({ display: "inline", width: "60px", "vertical-align": "middle", margin: "10px" }).attrs({ id: "nb_class_range", type: "range",
        min: 2, max: max_nb_class, value: nb_class, step: 1 }).on("change", function () {
        type = discretization.node().value;
        if (type == "user_defined") {
            type = "equal_interval";
            discretization.node().value = "equal_interval";
        }
        var old_nb_class = nb_class;
        if (type === "Q6") {
            this.value = 6;
            return;
        }
        nb_class = +this.value;
        txt_nb_class.node().value = nb_class;
        // txt_nb_class.html(i18next.t("disc_box.class", {count: nb_class}));
        update_breaks();
        redisplay.compute();
        redisplay.draw();
    });

    var svg_h = h / 5 > 90 ? h / 5 : 90,
        svg_w = w - w / 8,
        margin = { top: 17.5, right: 30, bottom: 7.5, left: 30 },
        height = svg_h - margin.top - margin.bottom;

    d3.select("#discretiz_charts").select(".modal-dialog").styles({ width: svg_w + margin.top + margin.bottom + 90 + "px",
        height: window.innerHeight - 60 + "px" });

    var div_svg = newBox.append('div').append("svg").attr("id", "svg_discretization").attr("width", svg_w + margin.left + margin.right).attr("height", svg_h + margin.top + margin.bottom);

    make_box_histo_option();

    var svg_histo = div_svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scaleLinear().domain([serie.min(), serie.max()]).range([0, svg_w]);

    var overlay_svg = div_svg.append("g").attr('transform', 'translate(30, 0)'),
        line_mean,
        line_std_right,
        line_std_left,
        line_median,
        txt_median,
        txt_mean,
        rug_plot;

    make_overlay_elements();

    // As the x axis and the mean didn't change, they can be drawn only once :
    svg_histo.append("g").attr("class", "x axis").attr("transform", "translate(0," + height + ")").call(d3.axisBottom().scale(x).tickFormat(formatCount));

    var box_content = newBox.append("div").attr("id", "box_content");
    box_content.append("h3").style("margin", "0").html(i18next.t("disc_box.line_size"));
    var sizes_div = d3.select("#box_content").append("div").attr("id", "sizes_div");
    var callback = function callback() {
        discretization.node().value = type;
        update_breaks(true);
        redisplay.compute();
        redisplay.draw();
    };
    make_min_max_tableau(null, nb_class, type, null, null, "sizes_div", breaks_info, callback);

    redisplay.compute();
    redisplay.draw();

    var deferred = Q.defer(),
        container = document.getElementById("discretiz_charts");

    container.querySelector(".btn_ok").onclick = function () {
        breaks[0] = serie.min();
        breaks[nb_class] = serie.max();
        deferred.resolve([serie, breaks_info, breaks]);
        document.removeEventListener('keydown', helper_esc_key_twbs);
        container.remove();
        var p = reOpenParent('.styleBox');
        if (!p) overlay_under_modal.hide();
    };
    var _onclose = function _onclose() {
        deferred.resolve(false);
        document.removeEventListener('keydown', helper_esc_key_twbs);
        container.remove();
        var p = reOpenParent('.styleBox');
        if (!p) overlay_under_modal.hide();
    };
    container.querySelector(".btn_cancel").onclick = _onclose;
    container.querySelector("#xclose").onclick = _onclose;
    function helper_esc_key_twbs(evt) {
        evt = evt || window.event;
        var isEscape = "key" in evt ? evt.key == "Escape" || evt.key == "Esc" : evt.keyCode == 27;
        if (isEscape) {
            evt.preventDefault();
            _onclose();
        }
    }
    document.addEventListener('keydown', helper_esc_key_twbs);
    return deferred.promise;
};
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function get_menu_option(func) {
    var menu_option = {
        "smooth": {
            "name": "smooth",
            "title": i18next.t("app_page.func_title.smooth"),
            "menu_factory": "fillMenu_Stewart",
            "fields_handler": "fields_Stewart"
        },
        "prop": {
            "name": "prop",
            "title": i18next.t("app_page.func_title.prop"),
            "menu_factory": "fillMenu_PropSymbol",
            "fields_handler": "fields_PropSymbol"
        },
        "choroprop": {
            "name": "choroprop",
            "title": i18next.t("app_page.func_title.choroprop"),
            "menu_factory": "fillMenu_PropSymbolChoro",
            "fields_handler": "fields_PropSymbolChoro"
        },
        "proptypo": {
            "name": "proptypo",
            "title": i18next.t("app_page.func_title.proptypo"),
            "menu_factory": "fillMenu_PropSymbolTypo",
            "fields_handler": "fields_PropSymbolTypo"
        },
        "choro": {
            "name": "choro",
            "title": i18next.t("app_page.func_title.choro"),
            "menu_factory": "fillMenu_Choropleth",
            "fields_handler": "fields_Choropleth"
        },
        "cartogram": {
            "name": "cartogram",
            "title": i18next.t("app_page.func_title.cartogram"),
            "menu_factory": "fillMenu_Anamorphose",
            "fields_handler": "fields_Anamorphose",
            "add_options": "keep_file"
        },
        "grid": {
            "name": "grid",
            "title": i18next.t("app_page.func_title.grid"),
            "menu_factory": "fillMenu_griddedMap",
            "fields_handler": "fields_griddedMap"
        },
        "flow": {
            "name": "flow",
            "title": i18next.t("app_page.func_title.flow"),
            "menu_factory": "fillMenu_FlowMap",
            "fields_handler": "fields_FlowMap"
        },
        "discont": {
            "name": "discont",
            "title": i18next.t("app_page.func_title.discont"),
            "menu_factory": "fillMenu_Discont",
            "fields_handler": "fields_Discont",
            "add_options": "keep_file"
        },
        "typo": {
            "name": "typo",
            "title": i18next.t("app_page.func_title.typo"),
            "menu_factory": "fillMenu_Typo",
            "fields_handler": "fields_Typo"
        },
        "typosymbol": {
            "name": "typosymbol",
            "title": i18next.t("app_page.func_title.typosymbol"),
            "menu_factory": "fillMenu_TypoSymbol",
            "fields_handler": "fields_TypoSymbol"
        }
    };
    return menu_option[func.toLowerCase()] || {};
}

/**
* Remove the div on which we are displaying the options related to each
* kind of rendering.
*
*/
function clean_menu_function() {
    if (fields_handler && fields_handler.unfill) {
        fields_handler.unfill();
        fields_handler = undefined;
    }
    if (_app.current_functionnality && _app.current_functionnality.name) {
        var previous_button = document.getElementById("button_" + _app.current_functionnality.name);
        if (previous_button.style.filter !== "grayscale(100%)") previous_button.style.filter = "invert(0%) saturate(100%)";
        previous_button.classList.remove('active');
        _app.current_functionnality = undefined;
    }
    section2.select(".form-rendering").remove();
    document.getElementById('accordion2b').style.display = 'none';
    var btn_s2b = document.getElementById('btn_s2b');
    btn_s2b.innerHTML = i18next.t('app_page.section2_.title_no_choice');
    btn_s2b.setAttribute('data-i18n', 'app_page.section2_.title_no_choice');
    btn_s2b.style.display = 'none';
}

/**
*  Reset the user choosen values remembered for its ease
*  (like discretization choice, symbols, etc. which are redisplayed as they
*   were selected by the user)
*
*/
function reset_user_values() {
    //
    fields_TypoSymbol.box_typo = undefined;
    fields_TypoSymbol.rendering_params = {};
    fields_TypoSymbol.cats = {};
    fields_PropSymbolChoro.rendering_params = {};
    fields_Typo.rendering_params = {};
    fields_Choropleth.rendering_params = {};
    fields_PropSymbolTypo.rendering_params = {};
}
/**
* Function to remove each node (each <option>) of a <select> HTML element :
*
*/
function unfillSelectInput(select_node) {
    for (var i = select_node.childElementCount - 1; i > -1; i--) {
        select_node.removeChild(select_node.children[i]);
    }
}

/** Function trying to avoid layer name collision by adding a suffix
* to the layer name if already exists and incrementing it if necessary
* (MyLayer -> MyLayer_1 -> MyLayer_2 etc.)
*
* @param {string} name - The original wanted name of the layer to add
* @return {string} new_name - An available name to safely add the layer
*     (the input name if possible or a slightly modified
*        one to avoid collision or unwanted characters)
*/
function check_layer_name(name) {
    if (name.match(/^\d+/)) {
        name = "_" + name;
    }
    // if([...new Set([...["World", "Graticule", "Sphere"], ...Object.getOwnPropertyNames(current_layers)])].indexOf(name) < 0)
    if (!current_layers.hasOwnProperty(name) && ["Graticule", "Sphere", "World"].indexOf(name) < 0) return name;else {
        var i = 1;
        var match = name.match(/_\d+$/);
        if (match) {
            i = match[0];
            name = name.substring(name, name.indexOf(i));
            return check_layer_name([name, parseInt(i.slice(1, i.length)) + 1].join('_'));
        } else {
            return check_layer_name([name, i].join('_'));
        }
    }
}

/**
* Display a message when switching between functionnalitiesif the layer to render
* doesn't have any interesting field to use.
*/
function display_error_num_field() {
    swal({ title: "",
        text: i18next.t("app_page.common.error_type_fields"),
        type: "error" });
};

/**
* Return an approximate value (based on the bbox of the targeted layer)
* to fill the "span" field in stewart functionnality
* as well as the "resolution" field in grid functionnality.
*
*/
var get_first_guess_span = function get_first_guess_span(func_name) {
    var bbox = _target_layer_file.bbox,
        layer_name = Object.getOwnPropertyNames(_target_layer_file.objects),
        abs = Math.abs;
    if (layer_name == "us_states" && func_name == "grid") {
        return 650;
    }
    var const_mult = func_name == "grid" ? 0.08 : 0.04;
    var width_km = haversine_dist([bbox[0], abs(bbox[3]) - abs(bbox[1])], [bbox[2], abs(bbox[3]) - abs(bbox[1])]),
        height_km = haversine_dist([abs(bbox[2]) - abs(bbox[0]), bbox[1]], [abs(bbox[2]) - abs(bbox[0]), bbox[3]]),
        val = Math.max(width_km, height_km) * const_mult;
    return val > 10 ? Math.round(val / 10) * 10 : Math.round(val);
};

/**
* Check if the wanted resolution isn't too big before sending the request
* to the server.
*
*/
function test_maxmin_resolution(cell_value) {
    var bbox = _target_layer_file.bbox,
        abs = Math.abs;
    var width_km = haversine_dist([bbox[0], abs(bbox[3]) - abs(bbox[1])], [bbox[2], abs(bbox[3]) - abs(bbox[1])]);
    var height_km = haversine_dist([abs(bbox[2]) - abs(bbox[0]), bbox[1]], [abs(bbox[2]) - abs(bbox[0]), bbox[3]]);
    var area = width_km * height_km,
        bigger_side = Math.max(height_km, width_km);
    if (area / (cell_value * cell_value) > 15000) return "higher";else if (cell_value > bigger_side / 1.66) return "lower";
    return;
}

/*
* Set the appropriate discretisation icon as selected
*
*/
var color_disc_icons = function () {
    var types = new Set(['q6', 'equal_interval', 'jenks', 'quantiles']);
    return function (type_disc) {
        if (!type_disc) return;
        type_disc = type_disc.toLowerCase();
        if (!types.has(type_disc)) {
            return;
        } else {
            document.getElementById('ico_' + type_disc).style.border = "solid 1px green";
        }
    };
}();

function make_template_functionnality(parent_node) {
    return parent_node.append('div').attr('class', 'form-rendering');
}

function make_layer_name_button(parent, id, margin_top) {
    var a = parent.append('p').style('clear', 'both');
    a.append('span').attrs({ class: 'i18n', 'data-i18n': '[html]app_page.func_options.common.output' }).html(i18next.t('app_page.func_options.common.output'));
    a.insert('input').styles({ 'width': '240px', 'font-size': '11.5px', "margin-top": margin_top }).attrs({ class: 'params', id: id });
}

function make_discretization_icons(discr_section) {
    var subsection1 = discr_section.append('p');
    subsection1.insert('span').attrs({ 'data-i18n': '[html]app_page.func_options.common.discretization_choice' }).html(i18next.t("app_page.func_options.common.discretization_choice"));
    var subsection2 = discr_section.append('p');
    subsection2.append('img').styles({ 'margin': '0 7.5px', 'cursor': 'pointer' }).attrs({ 'src': '/static/img/discr_icons/q6.png', 'id': 'ico_q6' });
    subsection2.append('img').styles({ 'margin': '0 7.5px', 'cursor': 'pointer' }).attrs({ 'src': '/static/img/discr_icons/jenks.png', 'id': 'ico_jenks' });
    subsection2.append('img').styles({ 'margin': '0 7.5px', 'cursor': 'pointer' }).attrs({ 'src': '/static/img/discr_icons/equal_intervals.png', 'id': 'ico_equal_interval' });
    subsection2.append('img').styles({ 'margin': '0 7.5px', 'cursor': 'pointer' }).attrs({ 'src': '/static/img/discr_icons/quantiles.png', 'id': 'ico_quantiles' });
    subsection2.append('img').styles({ 'margin': '0 7.5px', 'cursor': 'pointer' }).attrs({ 'src': '/static/img/discr_icons/others.png', 'id': 'ico_others' });
    subsection2.append('span').attrs({ id: 'choro_mini_choice_disc' }).styles({ float: 'right', 'margin-top': '5px', 'margin-left': '15px' });
    subsection2.append('img').styles({ width: '15px', position: 'absolute', right: '5px' }).attrs({ 'id': 'img_choice_disc', 'src': '/static/img/Red_x.png' });
}

function make_ok_button(parent, id) {
    var disabled = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

    var a = parent.append('p').styles({ "text-align": "right", margin: "auto" });
    a.append('button').attrs({ 'id': id, 'class': 'params button_st3 i18n',
        'data-i18n': '[html]app_page.func_options.common.render',
        'disabled': disabled ? true : null }).html(i18next.t('app_page.func_options.common.render'));
}

function insert_legend_button(layer_name) {
    var selec = d3.select("#sortable").select(['.', layer_name, ' .layer_buttons'].join('')),
        inner_html = selec.node().innerHTML,
        const_delim = ' <img src="/static/img/Inkscape_icons_zoom_fit_page.png"',
        split_content = inner_html.split();
    selec.node().innerHTML = [split_content[0], button_legend, const_delim, split_content[1]].join('');
}

function make_min_max_tableau(values, nb_class, discontinuity_type, min_size, max_size, id_parent, breaks, callback) {
    document.getElementById(id_parent).innerHTML = "";
    if (values && breaks == undefined) {
        var disc_result = discretize_to_size(values, discontinuity_type, nb_class, min_size, max_size);
        breaks = disc_result[2];
        if (!breaks) return false;
    }

    var parent_nd = document.getElementById(id_parent);
    parent_nd.style = "margin-top: 3px; amargin-bottom: 3px;";

    var title = document.createElement('p');
    title.style = "margin: 1px; word-spacing: 1.8em;";
    title.innerHTML = "Min - Max - Size";
    parent_nd.appendChild(title);

    var div_table = document.createElement('div');
    parent_nd.appendChild(div_table);
    for (var i = 0; i < breaks.length; i++) {
        var inner_line = document.createElement('p');
        inner_line.setAttribute('class', 'breaks_vals');
        inner_line.id = ["line", i].join('_');
        inner_line.style = "margin: 0px;";

        var input1 = document.createElement('input');
        input1.setAttribute('type', 'number');
        input1.setAttribute('class', 'min_class');
        input1.setAttribute('step', 'any');
        input1.value = (+breaks[i][0][0]).toFixed(2);
        input1.style = 'width: 60px; position: unset;';
        inner_line.appendChild(input1);

        var input2 = document.createElement('input');
        input2.setAttribute('type', 'number');
        input2.setAttribute('class', 'max_class');
        input2.setAttribute('step', 'any');
        input2.value = (+breaks[i][0][1]).toFixed(2);
        input2.style = 'width: 60px; position: unset;';
        inner_line.appendChild(input2);

        var input3 = document.createElement('input');
        input3.setAttribute('type', 'number');
        input3.setAttribute('class', 'size_class');
        input3.setAttribute('step', 'any');
        input3.value = (+breaks[i][1]).toFixed(2);
        input3.style = 'margin-left: 20px; width: 55px; position: unset;';
        inner_line.appendChild(input3);

        var px = document.createElement('span');
        px.innerHTML = " px";
        inner_line.appendChild(px);
        div_table.appendChild(inner_line);
    }

    var mins = document.getElementById(id_parent).getElementsByClassName("min_class"),
        maxs = document.getElementById(id_parent).getElementsByClassName("max_class");

    for (var _i = 0; _i < mins.length; _i++) {
        if (_i > 0) {
            (function () {
                var prev_ix = _i - 1;
                mins[_i].onchange = function () {
                    maxs[prev_ix].value = this.value;
                    if (callback) callback();
                };
            })();
        }
        if (_i < mins.length - 1) {
            (function () {
                var next_ix = _i + 1;
                maxs[_i].onchange = function () {
                    mins[next_ix].value = this.value;
                    if (callback) callback();
                };
            })();
        }
    }
    if (callback) {
        var sizes = document.getElementById(id_parent).getElementsByClassName("size_class");
        for (var _i2 = 0; _i2 < sizes.length; _i2++) {
            sizes[_i2].onchange = callback;
        }
    }
}

function fetch_min_max_table_value(parent_id) {
    var parent_node = parent_id ? document.getElementById(parent_id) : _app.current_functionnality.name == "flow" ? document.getElementById("FlowMap_discTable") : _app.current_functionnality.name == "discont" ? document.getElementById("Discont_discTable") : null;

    if (!parent_node) return;

    var mins = Array.prototype.map.call(parent_node.getElementsByClassName("min_class"), function (el) {
        return +el.value;
    }),
        maxs = Array.prototype.map.call(parent_node.getElementsByClassName("max_class"), function (el) {
        return +el.value;
    }),
        sizes = Array.prototype.map.call(parent_node.getElementsByClassName("size_class"), function (el) {
        return +el.value;
    }),
        nb_class = mins.length,
        comp_fun = function comp_fun(a, b) {
        return a - b;
    };

    // Some verification regarding the input values provided by the user :
    // - Values are ordered :
    if (mins != mins.sort(comp_fun) || maxs != maxs.sort(comp_fun) || sizes != sizes.sort(comp_fun)) {
        swal("", i18next.t("app_page.common.error_values_order"), "error");
        return false;
    }

    return { "mins": mins.sort(comp_fun), "maxs": maxs.sort(comp_fun), "sizes": sizes.sort(comp_fun) };
}

function fillMenu_PropSymbolChoro(layer) {
    var dv2 = make_template_functionnality(section2);

    var a = dv2.append('p').attr('class', 'params_section2');
    a.append("span").attrs({ class: 'i18n', 'data-i18n': '[html]app_page.func_options.choroprop.field1' }).html(i18next.t("app_page.func_options.choroprop.field1"));
    var field1_selec = a.insert('select').attrs({ class: 'params', id: 'PropSymbolChoro_field_1' });

    var b = dv2.append('p').attr('class', 'params_section2');
    b.append("span").attrs({ class: 'i18n', 'data-i18n': '[html]app_page.func_options.choroprop.fixed_size' }).html(i18next.t("app_page.func_options.choroprop.fixed_size"));
    var ref_size = b.insert('input').attrs({ type: 'number', class: 'params', id: 'PropSymbolChoro_ref_size',
        min: 0.1, max: 100.0, value: 60.0, step: "any" }).style("width", "50px");
    b.append('span').html(' (px)');

    var c = dv2.append('p').attr('class', 'params_section2');
    c.append("span").attrs({ class: 'i18n', 'data-i18n': '[html]app_page.func_options.choroprop.on_value' }).html(i18next.t("app_page.func_options.choroprop.on_value"));
    var ref_value = c.insert('input').styles({ 'width': '100px', "margin-left": "10px" }).attrs({ type: 'number', class: 'params', id: 'PropSymbolChoro_ref_value' }).attrs({ min: 0.1, step: 0.1 });

    // Other symbols could probably easily be proposed :
    var d = dv2.append('p').attr('class', 'params_section2');
    d.append('span').attrs({ class: 'i18n', 'data-i18n': '[html]app_page.func_options.choroprop.symbol_type' }).html(i18next.t("app_page.func_options.choroprop.symbol_type"));
    var symb_selec = d.insert('select').attrs({ class: 'params i18n', id: 'PropSymbolChoro_symbol_type' });

    var e = dv2.append('p').attr('class', 'params_section2');
    e.append('span').attrs({ class: 'i18n', 'data-i18n': '[html]app_page.func_options.choroprop.field2' }).html(i18next.t("app_page.func_options.choroprop.field2"));

    var field2_selec = e.insert('select').attrs({ class: 'params', id: 'PropSymbolChoro_field_2' });

    var discr_section = dv2.insert('p').style("margin", "auto");
    discr_section.insert("span").attr("id", "container_sparkline_propsymbolchoro").styles({ "margin": "16px 50px 0px 4px", "float": "right" });
    make_discretization_icons(discr_section);
    // let f = dv2.insert('p').attr('class', 'params_section2');
    // f.append("button")
    //     .attrs({id: 'PropSymbolChoro_btn_disc', class: 'params button_disc i18n', 'data-i18n': '[html]app_page.func_options.common.discretization_choice'})
    //     .styles({"font-size": "0.8em", "text-align": "center"})
    //     .html(i18next.t("app_page.func_options.common.discretization_choice"));

    make_layer_name_button(dv2, "PropSymbolChoro_output_name", "15px");
    make_ok_button(dv2, 'propChoro_yes');
    dv2.selectAll(".params").attr("disabled", true);
}

var fields_PropSymbolChoro = {
    fill: function fill(layer) {
        if (!layer) return;
        section2.selectAll(".params").attr("disabled", null);
        var self = this,
            fields_stock = getFieldsType('stock', layer),
            fields_ratio = getFieldsType('ratio', layer),
            nb_features = user_data[layer].length,
            field_size = section2.select("#PropSymbolChoro_field_1"),
            field_color = section2.select("#PropSymbolChoro_field_2"),
            ico_disc = section2.select('#ico_others'),
            ico_jenks = section2.select('#ico_jenks'),
            ico_quantiles = section2.select('#ico_quantiles'),
            ico_equal_interval = section2.select('#ico_equal_interval'),
            ico_q6 = section2.select('#ico_q6'),
            uo_layer_name = section2.select('#PropSymbolChoro_output_name'),
            ref_value_field = section2.select('#PropSymbolChoro_ref_value'),
            symb_selec = section2.select('#PropSymbolChoro_symbol_type'),
            ref_size = section2.select('#PropSymbolChoro_ref_size'),
            choro_mini_choice_disc = section2.select('#choro_mini_choice_disc'),
            img_valid_disc = section2.select('#img_choice_disc'),
            ok_button = section2.select('#propChoro_yes');

        var uncolor_icons = function uncolor_icons() {
            ico_jenks.style('border', null);
            ico_q6.style('border', null);
            ico_quantiles.style('border', null);
            ico_equal_interval.style('border', null);
        };

        if (current_layers[layer].type == "Line") {
            ref_size.attr('value', 10.0);
            [['app_page.func_options.common.symbol_line', 'line'], ['app_page.func_options.common.symbol_circle', 'circle'], ['app_page.func_options.common.symbol_square', 'rect']].forEach(function (symb) {
                symb_selec.append("option").text(i18next.t(symb[0])).attrs({ "value": symb[1], 'data-i18n': '[text]' + symb[0] });
            });
        } else {
            ref_size.attr('value', 60.0);
            [['app_page.func_options.common.symbol_circle', 'circle'], ['app_page.func_options.common.symbol_square', 'rect']].forEach(function (symb) {
                symb_selec.append("option").text(i18next.t(symb[0])).attrs({ "value": symb[1], 'data-i18n': '[text]' + symb[0] });
            });
        }

        var prepare_disc_quantiles = function prepare_disc_quantiles(field) {
            var _values = user_data[layer].map(function (v) {
                return v[field];
            }),
                n_class = getOptNbClass(_values.length);

            var _discretize_to_colors = discretize_to_colors(_values, "quantiles", n_class),
                _discretize_to_colors2 = _slicedToArray(_discretize_to_colors, 6),
                nb_class = _discretize_to_colors2[0],
                type = _discretize_to_colors2[1],
                breaks = _discretize_to_colors2[2],
                color_array = _discretize_to_colors2[3],
                colors_map = _discretize_to_colors2[4],
                no_data_color = _discretize_to_colors2[5];

            self.rendering_params[field] = {
                nb_class: nb_class, type: 'quantiles', colors: color_array,
                breaks: breaks, no_data: no_data_color,
                colorsByFeature: colors_map, renderer: 'Choropleth',
                rendered_field: field, schema: ["Reds"]
            };
            choro_mini_choice_disc.html(i18next.t('app_page.common.quantiles') + ", " + i18next.t('app_page.common.class', { count: nb_class }));
            ok_button.attr("disabled", null);
            img_valid_disc.attr('src', '/static/img/Light_green_check.png');
            uncolor_icons();
            ico_quantiles.style('border', 'solid 1px green');
        };

        if (fields_stock.length == 0 || fields_ratio.length == 0) {
            display_error_num_field();
            return;
        }

        // Set some default colors in order to not force to open the box for selecting them :
        {
            var first_field = fields_ratio[0];
            prepare_disc_quantiles(first_field);
            ok_button.attr('disabled', self.rendering_params[first_field] ? null : true);
        }

        fields_stock.forEach(function (field) {
            field_size.append("option").text(field).attr("value", field);
        });
        fields_ratio.forEach(function (field) {
            field_color.append('option').text(field).attr('value', field);
        });
        field_size.on("change", function () {
            var field_name = this.value,
                max_val_field = max_fast(user_data[layer].map(function (obj) {
                return +obj[field_name];
            }));

            ref_value_field.attrs({ "max": max_val_field, 'value': max_val_field });
            uo_layer_name.attr('value', ["PropSymbols", field_name, field_color.node().value, layer].join('_'));
        });

        field_color.on("change", function () {
            var field_name = this.value,
                vals = user_data[layer].map(function (a) {
                return +a[field_name];
            });
            render_mini_chart_serie(vals, document.getElementById("container_sparkline_propsymbolchoro"));
            uo_layer_name.attr('value', ["PropSymbols", field_size.node().value, field_name, layer].join('_'));
            if (self.rendering_params[field_name] !== undefined) {
                // ok_button.attr('disabled', null);
                img_valid_disc.attr('src', '/static/img/Light_green_check.png');
                choro_mini_choice_disc.html(i18next.t('app_page.common.' + self.rendering_params[field_name].type) + ", " + i18next.t('app_page.common.class', { count: self.rendering_params[field_name].nb_class }));
                uncolor_icons();
                color_disc_icons(self.rendering_params[field_name].type);
                // console.log(section2); console.log(self.rendering_params[field_name].type);
            } else {
                prepare_disc_quantiles(field_name);
                // ok_button.attr('disabled', true);
                // img_valid_disc.attr('src', '/static/img/Red_x.png');
                // choro_mini_choice_disc.html('');
            }
        });

        ico_jenks.on('click', function () {
            uncolor_icons();
            this.style.border = 'solid 1px green';
            var selected_field = field_color.node().value,
                _values = user_data[layer].map(function (v) {
                return v[selected_field];
            }),
                n_class = getOptNbClass(_values.length);

            var _discretize_to_colors3 = discretize_to_colors(_values, "jenks", n_class, 'BuGn'),
                _discretize_to_colors4 = _slicedToArray(_discretize_to_colors3, 6),
                nb_class = _discretize_to_colors4[0],
                type = _discretize_to_colors4[1],
                breaks = _discretize_to_colors4[2],
                color_array = _discretize_to_colors4[3],
                colors_map = _discretize_to_colors4[4],
                no_data_color = _discretize_to_colors4[5];

            self.rendering_params[selected_field] = {
                nb_class: nb_class, type: 'jenks', colors: color_array,
                breaks: breaks, no_data: no_data_color,
                colorsByFeature: colors_map, renderer: 'PropSymbolsChoro',
                rendered_field: selected_field, schema: ["BuGn"]
            };
            choro_mini_choice_disc.html(i18next.t('app_page.common.jenks') + ", " + i18next.t('app_page.common.class', { count: nb_class }));
            ok_button.attr("disabled", null);
            img_valid_disc.attr('src', '/static/img/Light_green_check.png');
        });

        ico_quantiles.on('click', function () {
            uncolor_icons();
            this.style.border = 'solid 1px green';
            var selected_field = field_color.node().value,
                _values = user_data[layer].map(function (v) {
                return v[selected_field];
            }),
                n_class = getOptNbClass(_values.length);

            var _discretize_to_colors5 = discretize_to_colors(_values, "quantiles", n_class, 'BuGn'),
                _discretize_to_colors6 = _slicedToArray(_discretize_to_colors5, 6),
                nb_class = _discretize_to_colors6[0],
                type = _discretize_to_colors6[1],
                breaks = _discretize_to_colors6[2],
                color_array = _discretize_to_colors6[3],
                colors_map = _discretize_to_colors6[4],
                no_data_color = _discretize_to_colors6[5];

            self.rendering_params[selected_field] = {
                nb_class: nb_class, type: 'quantiles', colors: color_array,
                breaks: breaks, no_data: no_data_color,
                colorsByFeature: colors_map, renderer: 'PropSymbolsChoro',
                rendered_field: selected_field, schema: ["BuGn"]
            };
            choro_mini_choice_disc.html(i18next.t('app_page.common.quantiles') + ", " + i18next.t('app_page.common.class', { count: nb_class }));
            ok_button.attr("disabled", null);
            img_valid_disc.attr('src', '/static/img/Light_green_check.png');
        });

        ico_equal_interval.on('click', function () {
            uncolor_icons();
            this.style.border = 'solid 1px green';
            var selected_field = field_color.node().value,
                _values = user_data[layer].map(function (v) {
                return v[selected_field];
            }),
                n_class = getOptNbClass(_values.length);

            var _discretize_to_colors7 = discretize_to_colors(_values, "equal_interval", n_class, 'BuGn'),
                _discretize_to_colors8 = _slicedToArray(_discretize_to_colors7, 6),
                nb_class = _discretize_to_colors8[0],
                type = _discretize_to_colors8[1],
                breaks = _discretize_to_colors8[2],
                color_array = _discretize_to_colors8[3],
                colors_map = _discretize_to_colors8[4],
                no_data_color = _discretize_to_colors8[5];

            self.rendering_params[selected_field] = {
                nb_class: nb_class, type: 'equal_interval', colors: color_array,
                breaks: breaks, no_data: no_data_color,
                colorsByFeature: colors_map, renderer: 'PropSymbolsChoro',
                rendered_field: selected_field, schema: ["BuGn"]
            };
            choro_mini_choice_disc.html(i18next.t('app_page.common.equal_interval') + ", " + i18next.t('app_page.common.class', { count: nb_class }));
            ok_button.attr("disabled", null);
            img_valid_disc.attr('src', '/static/img/Light_green_check.png');
        });

        ico_q6.on('click', function () {
            uncolor_icons();
            this.style.border = 'solid 1px green';
            var selected_field = field_color.node().value,
                _values = user_data[layer].map(function (v) {
                return v[selected_field];
            });

            var _discretize_to_colors9 = discretize_to_colors(_values, "Q6", 6, 'BuGn'),
                _discretize_to_colors10 = _slicedToArray(_discretize_to_colors9, 6),
                nb_class = _discretize_to_colors10[0],
                type = _discretize_to_colors10[1],
                breaks = _discretize_to_colors10[2],
                color_array = _discretize_to_colors10[3],
                colors_map = _discretize_to_colors10[4],
                no_data_color = _discretize_to_colors10[5];

            self.rendering_params[selected_field] = {
                nb_class: nb_class, type: 'Q6', colors: color_array,
                breaks: breaks, no_data: no_data_color,
                colorsByFeature: colors_map, renderer: 'PropSymbolsChoro',
                rendered_field: selected_field, schema: ["BuGn"]
            };
            choro_mini_choice_disc.html(i18next.t('app_page.common.Q6') + ", " + i18next.t('app_page.common.class', { count: nb_class }));
            ok_button.attr("disabled", null);
            img_valid_disc.attr('src', '/static/img/Light_green_check.png');
        });

        ico_disc.on("click", function () {
            var selected_field = field_color.node().value,
                opt_nb_class = Math.floor(1 + 3.3 * Math.log10(user_data[layer].length)),
                conf_disc_box = void 0;

            if (self.rendering_params[selected_field]) conf_disc_box = display_discretization(layer, selected_field, self.rendering_params[selected_field].nb_class, { schema: self.rendering_params[selected_field].schema,
                colors: self.rendering_params[selected_field].colors,
                no_data: self.rendering_params[selected_field].no_data,
                type: self.rendering_params[selected_field].type,
                breaks: self.rendering_params[selected_field].breaks });else conf_disc_box = display_discretization(layer, selected_field, opt_nb_class, { type: "quantiles" });

            conf_disc_box.then(function (confirmed) {
                if (confirmed) {
                    // ok_button.attr("disabled", null);
                    uncolor_icons();
                    color_disc_icons(confirmed[1]);
                    self.rendering_params[selected_field] = {
                        nb_class: confirmed[0], type: confirmed[1],
                        schema: confirmed[5], no_data: confirmed[6],
                        breaks: confirmed[2], colors: confirmed[3],
                        colorsByFeature: confirmed[4],
                        renderer: "PropSymbolsChoro"
                    };
                } else return;
            });
        });
        ok_button.on("click", function () {
            if (!ref_value_field.node().value) return;
            var rendering_params = self.rendering_params;
            if (rendering_params[field_color.node().value]) {
                var _layer = Object.getOwnPropertyNames(user_data)[0],
                    symbol_to_use = symb_selec.node().value,
                    _nb_features = user_data[_layer].length,
                    rd_params = {},
                    color_field = field_color.node().value,
                    new_layer_name = uo_layer_name.node().value;

                new_layer_name = new_layer_name.length > 0 && /^\w+$/.test(new_layer_name) ? check_layer_name(new_layer_name) : check_layer_name(_layer + "_PropSymbolsChoro");

                rd_params.field = field_size.node().value;
                rd_params.new_name = new_layer_name;
                rd_params.nb_features = _nb_features;
                rd_params.ref_layer_name = _layer;
                rd_params.symbol = symbol_to_use;
                rd_params.ref_value = +ref_value_field.node().value;
                rd_params.ref_size = +ref_size.node().value;
                rd_params.fill_color = rendering_params[color_field]['colorsByFeature'];
                rd_params.color_field = color_field;

                if (symbol_to_use == "line") make_prop_line(rd_params);else make_prop_symbols(rd_params);

                var colors_breaks = [];
                for (var i = rendering_params[color_field]['breaks'].length - 1; i > 0; --i) {
                    colors_breaks.push([[rendering_params[color_field]['breaks'][i - 1], " - ", rendering_params[color_field]['breaks'][i]].join(''), rendering_params[color_field]['colors'][i - 1]]);
                }

                var options_disc = { schema: rendering_params[color_field].schema,
                    colors: rendering_params[color_field].colors,
                    no_data: rendering_params[color_field].no_data,
                    type: rendering_params[color_field].type,
                    breaks: rendering_params[color_field].breaks };

                Object.assign(current_layers[new_layer_name], {
                    renderer: "PropSymbolsChoro",
                    options_disc: options_disc,
                    rendered_field: field_size.node().value,
                    rendered_field2: field_color.node().value,
                    colors_breaks: colors_breaks
                });
                zoom_without_redraw();
                switch_accordion_section();
                handle_legend(new_layer_name);
            }
        });
        setSelected(field_size.node(), fields_stock[0]);
        setSelected(field_color.node(), fields_ratio[0]);
    },

    unfill: function unfill() {
        unfillSelectInput(document.getElementById("PropSymbolChoro_field_1"));
        unfillSelectInput(document.getElementById("PropSymbolChoro_field_2"));
        unfillSelectInput(document.getElementById('PropSymbolChoro_symbol_type'));
        section2.selectAll(".params").attr("disabled", true);
    },
    rendering_params: {}
};

var fillMenu_Typo = function fillMenu_Typo() {
    var dv2 = make_template_functionnality(section2);

    var a = dv2.append('p').attr('class', 'params_section2');
    a.append('span').attrs({ class: 'i18n', 'data-i18n': '[html]app_page.func_options.typo.field' }).html(i18next.t("app_page.func_options.typo.field"));
    a.insert('select').attrs({ id: 'Typo_field_1', class: 'params' });

    var b = dv2.insert('p').styles({ "margin": "auto", "text-align": "center" });
    b.append("button").attrs({ id: "Typo_class", class: "button_disc params i18n",
        'data-i18n': '[html]app_page.func_options.typo.color_choice' }).styles({ "font-size": "0.8em", "text-align": "center" }).html(i18next.t("app_page.func_options.typo.color_choice"));

    make_layer_name_button(dv2, "Typo_output_name");
    make_ok_button(dv2, 'Typo_yes');
    dv2.selectAll(".params").attr("disabled", true);
};

var fields_Typo = {
    fill: function fill(layer) {
        if (!layer) return;
        var self = this,
            g_lyr_name = "#" + layer,
            fields_name = getFieldsType('category', layer),
            field_selec = section2.select("#Typo_field_1"),
            ok_button = section2.select('#Typo_yes'),
            btn_typo_class = section2.select('#Typo_class'),
            uo_layer_name = section2.select('#Typo_output_name');

        var prepare_colors = function prepare_colors(field) {
            var _prepare_categories_a = prepare_categories_array(layer, field, null),
                _prepare_categories_a2 = _slicedToArray(_prepare_categories_a, 2),
                cats = _prepare_categories_a2[0],
                col_map = _prepare_categories_a2[1];

            var nb_class = col_map.size;
            var colorByFeature = user_data[layer].map(function (ft) {
                return col_map.get(ft[field])[0];
            });
            self.rendering_params[field] = {
                nb_class: nb_class, color_map: col_map, colorByFeature: colorByFeature,
                renderer: 'Categorical', rendered_field: field, skip_alert: false
            };
        };

        fields_name.forEach(function (f_name) {
            field_selec.append("option").text(f_name).attr("value", f_name);
        });

        field_selec.on("change", function () {
            var selected_field = this.value;
            uo_layer_name.attr('value', ["Typo", selected_field, layer].join('_'));
            prepare_colors(selected_field);
        });

        // Set some default colors in order to not force to open the box for selecting them :
        {
            var first_field = fields_name[0];
            prepare_colors(first_field);
            ok_button.attr('disabled', self.rendering_params[first_field] ? null : true);
        }

        btn_typo_class.on("click", function () {
            var selected_field = field_selec.node().value,
                nb_features = current_layers[layer].n_features,
                col_map = self.rendering_params[selected_field] ? self.rendering_params[selected_field].color_map : undefined,
                cats = void 0;

            var _prepare_categories_a3 = prepare_categories_array(layer, selected_field, col_map);

            var _prepare_categories_a4 = _slicedToArray(_prepare_categories_a3, 2);

            cats = _prepare_categories_a4[0];
            col_map = _prepare_categories_a4[1];

            if (cats.length > 15) {
                swal({ title: "",
                    text: i18next.t("app_page.common.error_too_many_features_color"),
                    type: "warning",
                    showCancelButton: true,
                    allowOutsideClick: false,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: i18next.t("app_page.common.valid") + "!",
                    cancelButtonText: i18next.t("app_page.common.cancel")
                }).then(function () {
                    display_categorical_box(user_data[layer], layer, selected_field, cats).then(function (confirmed) {
                        if (confirmed) {
                            self.rendering_params[selected_field] = {
                                nb_class: confirmed[0], color_map: confirmed[1], colorByFeature: confirmed[2],
                                renderer: "Categorical", rendered_field: selected_field, skip_alert: true
                            };
                        }
                    });
                }, function (dismiss) {
                    return;
                });
            } else {
                display_categorical_box(user_data[layer], layer, selected_field, cats).then(function (confirmed) {
                    if (confirmed) {
                        self.rendering_params[selected_field] = {
                            nb_class: confirmed[0], color_map: confirmed[1], colorByFeature: confirmed[2],
                            renderer: "Categorical", rendered_field: selected_field, skip_alert: true
                        };
                    }
                });
            }
        });

        ok_button.on('click', function () {
            var selected_field = field_selec.node().value;
            var render = function render() {
                if (self.rendering_params[selected_field]) {
                    var _layer2 = Object.getOwnPropertyNames(user_data)[0],
                        output_name = uo_layer_name.node().value;
                    if (output_name.length > 0 && /^\w+$/.test(output_name)) {
                        self.rendering_params[selected_field].new_name = check_layer_name(output_name);
                    } else {
                        self.rendering_params[selected_field].new_name = check_layer_name(["Typo", selected_field, _layer2].join('_'));
                    }
                    render_categorical(_layer2, self.rendering_params[selected_field]);
                    switch_accordion_section();
                    handle_legend(self.rendering_params[selected_field].new_name);
                }
            };
            if (self.rendering_params[selected_field].color_map.size > 15 && !self.rendering_params[selected_field].skip_alert) {
                swal({ title: "",
                    text: i18next.t("app_page.common.error_too_many_features_color"),
                    type: "warning",
                    showCancelButton: true,
                    allowOutsideClick: false,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: i18next.t("app_page.common.valid") + "!",
                    cancelButtonText: i18next.t("app_page.common.cancel")
                }).then(function () {
                    render();
                }, function (dismiss) {
                    return;
                });
            } else {
                render();
            }
        });
        uo_layer_name.attr('value', "Typo_" + layer);
        section2.selectAll(".params").attr("disabled", null);
        setSelected(field_selec.node(), fields_name[0]);
    },
    unfill: function unfill() {
        var field_selec = document.getElementById("Typo_field_1"),
            nb_fields = field_selec.childElementCount;

        for (var i = nb_fields - 1; i > -1; --i) {
            field_selec.removeChild(field_selec.children[i]);
        }section2.selectAll(".params").attr("disabled", true);
    },
    rendering_params: {}
};

function fillMenu_Choropleth() {
    var dv2 = make_template_functionnality(section2);

    var field_selec_section = dv2.append('p').attr('class', 'params_section2');
    field_selec_section.insert("span").attrs({ class: "i18n", "data-i18n": "[html]app_age.func_options.common.field" }).html(i18next.t("app_page.func_options.common.field"));

    field_selec_section.insert('select').attrs({ id: 'choro_field1', class: 'params' });

    var discr_section = dv2.insert('p').style("margin", "auto");
    discr_section.insert("span").attr("id", "container_sparkline_choro").styles({ "margin": "16px 50px 0px 4px", "float": "right" });
    make_discretization_icons(discr_section);

    make_layer_name_button(dv2, 'Choro_output_name', "15px");
    make_ok_button(dv2, 'choro_yes');
    dv2.selectAll(".params").attr("disabled", true);
}

var fields_Choropleth = {
    fill: function fill(layer) {
        if (!layer) return;
        var self = this,
            g_lyr_name = "#" + layer,
            fields = getFieldsType("ratio", layer),

        // fields = type_col(layer, "number"),
        field_selec = section2.select("#choro_field1"),
            uo_layer_name = section2.select('#Choro_output_name'),
            ok_button = section2.select('#choro_yes'),
            img_valid_disc = section2.select("#img_choice_disc"),
            ico_jenks = section2.select('#ico_jenks'),
            ico_quantiles = section2.select('#ico_quantiles'),
            ico_q6 = section2.select('#ico_q6'),
            ico_equal_interval = section2.select('#ico_equal_interval'),
            btn_class = section2.select('#ico_others'),
            choro_mini_choice_disc = section2.select('#choro_mini_choice_disc');

        var uncolor_icons = function uncolor_icons() {
            ico_jenks.style('border', null);
            ico_q6.style('border', null);
            ico_quantiles.style('border', null);
            ico_equal_interval.style('border', null);
        };

        var prepare_disc_quantiles = function prepare_disc_quantiles(field) {
            var _values = user_data[layer].map(function (v) {
                return v[field];
            }),
                n_class = getOptNbClass(_values.length);

            var _discretize_to_colors11 = discretize_to_colors(_values, "quantiles", n_class),
                _discretize_to_colors12 = _slicedToArray(_discretize_to_colors11, 6),
                nb_class = _discretize_to_colors12[0],
                type = _discretize_to_colors12[1],
                breaks = _discretize_to_colors12[2],
                color_array = _discretize_to_colors12[3],
                colors_map = _discretize_to_colors12[4],
                no_data_color = _discretize_to_colors12[5];

            self.rendering_params[field] = {
                nb_class: nb_class, type: 'quantiles', colors: color_array,
                breaks: breaks, no_data: no_data_color,
                colorsByFeature: colors_map, renderer: 'Choropleth',
                rendered_field: field, schema: ["Reds"]
            };
            choro_mini_choice_disc.html(i18next.t('app_page.common.quantiles') + ", " + i18next.t('app_page.common.class', { count: nb_class }));
            ok_button.attr("disabled", null);
            img_valid_disc.attr('src', '/static/img/Light_green_check.png');
            uncolor_icons();
            ico_quantiles.style('border', 'solid 1px green');
        };

        if (fields.length === 0) {
            display_error_num_field();
            return;
        }
        section2.selectAll(".params").attr("disabled", null);
        fields.forEach(function (field) {
            field_selec.append("option").text(field).attr("value", field);
        });

        // Set some default colors in order to not force to open the box for selecting them :
        {
            var first_field = fields[0];
            prepare_disc_quantiles(first_field);
            ok_button.attr('disabled', self.rendering_params[first_field] ? null : true);
        }

        field_selec.on("change", function () {
            var field_name = this.value,
                vals = user_data[layer].map(function (a) {
                return +a[field_name];
            });
            render_mini_chart_serie(vals, document.getElementById("container_sparkline_choro"));
            uo_layer_name.attr('value', ["Choro", field_name, layer].join('_'));
            if (self.rendering_params[field_name] !== undefined) {
                // ok_button.attr('disabled', null);
                img_valid_disc.attr('src', '/static/img/Light_green_check.png');
                choro_mini_choice_disc.html(i18next.t('app_page.common.' + self.rendering_params[field_name].type) + ", " + i18next.t('app_page.common.class', { count: self.rendering_params[field_name].nb_class }));
                uncolor_icons();
                color_disc_icons(self.rendering_params[field_name].type);
            } else {
                prepare_disc_quantiles(field_name);
            }
        });

        ico_jenks.on('click', function () {
            uncolor_icons();
            this.style.border = 'solid 1px green';
            var selected_field = field_selec.node().value,
                _values = user_data[layer].map(function (v) {
                return v[selected_field];
            }),
                n_class = getOptNbClass(_values.length);

            var _discretize_to_colors13 = discretize_to_colors(_values, "jenks", n_class),
                _discretize_to_colors14 = _slicedToArray(_discretize_to_colors13, 6),
                nb_class = _discretize_to_colors14[0],
                type = _discretize_to_colors14[1],
                breaks = _discretize_to_colors14[2],
                color_array = _discretize_to_colors14[3],
                colors_map = _discretize_to_colors14[4],
                no_data_color = _discretize_to_colors14[5];

            self.rendering_params[selected_field] = {
                nb_class: nb_class, type: 'jenks', colors: color_array,
                breaks: breaks, no_data: no_data_color,
                colorsByFeature: colors_map, renderer: 'Choropleth',
                rendered_field: selected_field, schema: ["Reds"]
            };
            choro_mini_choice_disc.html(i18next.t('app_page.common.jenks') + ", " + i18next.t('app_page.common.class', { count: nb_class }));
            ok_button.attr("disabled", null);
            img_valid_disc.attr('src', '/static/img/Light_green_check.png');
        });

        ico_quantiles.on('click', function () {
            uncolor_icons();
            this.style.border = 'solid 1px green';
            var selected_field = field_selec.node().value,
                _values = user_data[layer].map(function (v) {
                return v[selected_field];
            }),
                n_class = getOptNbClass(_values.length);

            var _discretize_to_colors15 = discretize_to_colors(_values, "quantiles", n_class),
                _discretize_to_colors16 = _slicedToArray(_discretize_to_colors15, 6),
                nb_class = _discretize_to_colors16[0],
                type = _discretize_to_colors16[1],
                breaks = _discretize_to_colors16[2],
                color_array = _discretize_to_colors16[3],
                colors_map = _discretize_to_colors16[4],
                no_data_color = _discretize_to_colors16[5];

            self.rendering_params[selected_field] = {
                nb_class: nb_class, type: 'quantiles', colors: color_array,
                breaks: breaks, no_data: no_data_color,
                colorsByFeature: colors_map, renderer: 'Choropleth',
                rendered_field: selected_field, schema: ["Reds"]
            };
            choro_mini_choice_disc.html(i18next.t('app_page.common.quantiles') + ", " + i18next.t('app_page.common.class', { count: nb_class }));
            // ok_button.attr("disabled", null);
            img_valid_disc.attr('src', '/static/img/Light_green_check.png');
        });

        ico_equal_interval.on('click', function () {
            uncolor_icons();
            this.style.border = 'solid 1px green';
            var selected_field = field_selec.node().value,
                _values = user_data[layer].map(function (v) {
                return v[selected_field];
            }),
                n_class = getOptNbClass(_values.length);

            var _discretize_to_colors17 = discretize_to_colors(_values, "equal_interval", n_class),
                _discretize_to_colors18 = _slicedToArray(_discretize_to_colors17, 6),
                nb_class = _discretize_to_colors18[0],
                type = _discretize_to_colors18[1],
                breaks = _discretize_to_colors18[2],
                color_array = _discretize_to_colors18[3],
                colors_map = _discretize_to_colors18[4],
                no_data_color = _discretize_to_colors18[5];

            self.rendering_params[selected_field] = {
                nb_class: nb_class, type: 'equal_interval', colors: color_array,
                breaks: breaks, no_data: no_data_color,
                colorsByFeature: colors_map, renderer: 'Choropleth',
                rendered_field: selected_field, schema: ["Reds"]
            };
            choro_mini_choice_disc.html(i18next.t('app_page.common.equal_interval') + ", " + i18next.t('app_page.common.class', { count: nb_class }));
            // ok_button.attr("disabled", null);
            img_valid_disc.attr('src', '/static/img/Light_green_check.png');
        });

        ico_q6.on('click', function () {
            uncolor_icons();
            this.style.border = 'solid 1px green';
            var selected_field = field_selec.node().value,
                _values = user_data[layer].map(function (v) {
                return v[selected_field];
            });

            var _discretize_to_colors19 = discretize_to_colors(_values, "Q6", 6),
                _discretize_to_colors20 = _slicedToArray(_discretize_to_colors19, 6),
                nb_class = _discretize_to_colors20[0],
                type = _discretize_to_colors20[1],
                breaks = _discretize_to_colors20[2],
                color_array = _discretize_to_colors20[3],
                colors_map = _discretize_to_colors20[4],
                no_data_color = _discretize_to_colors20[5];

            self.rendering_params[selected_field] = {
                nb_class: nb_class, type: 'Q6', colors: color_array,
                breaks: breaks, no_data: no_data_color,
                colorsByFeature: colors_map, renderer: 'Choropleth',
                rendered_field: selected_field, schema: ["Reds"]
            };
            choro_mini_choice_disc.html(i18next.t('app_page.common.Q6') + ", " + i18next.t('app_page.common.class', { count: nb_class }));
            // ok_button.attr("disabled", null);
            img_valid_disc.attr('src', '/static/img/Light_green_check.png');
        });

        btn_class.on("click", function () {
            var selected_field = field_selec.node().value,
                opt_nb_class = getOptNbClass(user_data[layer].length),
                conf_disc_box = void 0;

            if (self.rendering_params[selected_field]) {
                conf_disc_box = display_discretization(layer, selected_field, self.rendering_params[selected_field].nb_class, { schema: self.rendering_params[selected_field].schema,
                    colors: self.rendering_params[selected_field].colors,
                    type: self.rendering_params[selected_field].type,
                    no_data: self.rendering_params[selected_field].no_data,
                    breaks: self.rendering_params[selected_field].breaks });
            } else {
                conf_disc_box = display_discretization(layer, selected_field, opt_nb_class, { type: "quantiles" });
            }
            conf_disc_box.then(function (confirmed) {
                if (confirmed) {
                    // ok_button.attr("disabled", null);
                    img_valid_disc.attr('src', '/static/img/Light_green_check.png');
                    choro_mini_choice_disc.html(i18next.t('app_page.common.' + confirmed[1]) + ", " + i18next.t('app_page.common.class', { count: confirmed[0] }));
                    uncolor_icons();
                    color_disc_icons(confirmed[1]);
                    self.rendering_params[selected_field] = {
                        nb_class: confirmed[0], type: confirmed[1],
                        breaks: confirmed[2], colors: confirmed[3],
                        schema: confirmed[5], no_data: confirmed[6],
                        colorsByFeature: confirmed[4], renderer: "Choropleth",
                        rendered_field: selected_field, new_name: ""
                    };
                }
            });
        });

        ok_button.on("click", function () {
            var field_to_render = field_selec.node().value;
            if (self.rendering_params[field_to_render]) {
                var user_new_layer_name = uo_layer_name.node().value;
                self.rendering_params[field_to_render].new_name = check_layer_name(user_new_layer_name.length > 0 && /^\w+$/.test(user_new_layer_name) ? user_new_layer_name : ["Choro", field_to_render, layer].join('_'));
                render_choro(layer, self.rendering_params[field_to_render]);
                handle_legend(self.rendering_params[field_to_render].new_name);
                switch_accordion_section();
            }
        });
        setSelected(field_selec.node(), fields[0]);
    },

    unfill: function unfill() {
        var field_selec = document.getElementById("choro_field1"),
            nb_fields = field_selec.childElementCount;

        for (var i = nb_fields - 1; i > -1; --i) {
            //            delete this.rendering_params[field_selec.children[i]];
            field_selec.removeChild(field_selec.children[i]);
        }
        d3.selectAll(".params").attr("disabled", true);
    },
    rendering_params: {}
};

var fields_Stewart = {
    fill: function fill(layer) {
        var other_layers = get_other_layer_names(),
            mask_selec = d3.select("#stewart_mask"),
            default_selected_mask = void 0;

        unfillSelectInput(mask_selec.node());
        mask_selec.append("option").text("None").attr("value", "None");
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = other_layers[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var lyr_name = _step.value;

                if (current_layers[lyr_name].type === "Polygon") {
                    mask_selec.append("option").text(lyr_name).attr("value", lyr_name);
                    if (current_layers[lyr_name].targeted) {
                        default_selected_mask = lyr_name;
                    }
                }
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }

        if (default_selected_mask) setSelected(mask_selec.node(), default_selected_mask);

        if (layer) {
            var _ret3 = function () {
                // let fields = type_col(layer, "number"),
                var fields = getFieldsType("stock", layer),
                    field_selec = section2.select("#stewart_field"),
                    field_selec2 = section2.select("#stewart_field2");

                if (fields.length == 0) {
                    display_error_num_field();
                    return {
                        v: void 0
                    };
                }

                field_selec2.append("option").text(" ").attr("value", "None");
                fields.forEach(function (field) {
                    field_selec.append("option").text(field).attr("value", field);
                    field_selec2.append("option").text(field).attr("value", field);
                });
                document.getElementById("stewart_span").value = get_first_guess_span('stewart');

                field_selec.on("change", function () {
                    document.getElementById("stewart_output_name").value = ["Smoothed", this.value, layer].join('_');
                });
                section2.select('#stewart_yes').on('click', render_stewart);
            }();

            if ((typeof _ret3 === "undefined" ? "undefined" : _typeof(_ret3)) === "object") return _ret3.v;
        }
        section2.selectAll(".params").attr("disabled", null);
    },

    unfill: function unfill() {
        unfillSelectInput(document.getElementById("stewart_field"));
        unfillSelectInput(document.getElementById("stewart_field2"));
        unfillSelectInput(document.getElementById("stewart_mask"));
        d3.selectAll(".params").attr("disabled", true);
    }
};

function render_stewart() {
    var formToSend = new FormData(),
        doc = document,
        field1_n = doc.getElementById('stewart_field').value,
        field2_n = doc.getElementById('stewart_field2').value,
        var1_to_send = {},
        var2_to_send = {},
        layer = Object.getOwnPropertyNames(user_data)[0],
        bval = doc.getElementById('stewart_breaks').value.trim(),
        reso = +doc.getElementById('stewart_resolution').value,
        span = +doc.getElementById('stewart_span').value,
        beta = +doc.getElementById('stewart_beta').value,
        nb_class = doc.getElementById('stewart_nb_class').value,
        func_selec = doc.getElementById('stewart_func').value,
        mask_name = doc.getElementById('stewart_mask').value,
        new_user_layer_name = document.getElementById("stewart_output_name").value;

    if (nb_class != (nb_class | 0)) {
        nb_class = nb_class | 0;
        doc.getElementById('stewart_nb_class').value = nb_class;
    }

    if (reso && reso > 0) {
        var res_test = test_maxmin_resolution(reso);
        if (res_test) {
            var message = res_test === "low" ? i18next.t("app_page.common.error_too_low_resolution") : i18next.t("app_page.common.error_too_high_resolution");
            display_error_during_computation(message);
            return;
        }
        reso = reso * 1000;
    } else {
        reso = null;
    }
    bval = bval.length > 0 ? bval.split('-').map(function (val) {
        return +val.trim();
    }) : null;

    var1_to_send[field1_n] = current_layers[layer].original_fields.has(field1_n) ? [] : user_data[layer].map(function (i) {
        return +i[field1_n];
    });
    if (field2_n != "None") {
        var2_to_send[field2_n] = current_layers[layer].original_fields.has(field2_n) ? [] : user_data[layer].map(function (i) {
            return +i[field2_n];
        });
    }

    formToSend.append("json", JSON.stringify({
        "topojson": current_layers[layer].key_name,
        "variable1": var1_to_send,
        "variable2": var2_to_send,
        "span": span * 1000,
        "beta": beta,
        "typefct": func_selec,
        "resolution": reso,
        "nb_class": nb_class,
        "user_breaks": bval,
        "mask_layer": mask_name !== "None" ? current_layers[mask_name].key_name : "" }));

    xhrequest("POST", '/compute/stewart', formToSend, true).then(function (res) {
        var data_split = res.split('|||'),
            raw_topojson = data_split[0],
            options = { result_layer_on_add: true };
        if (new_user_layer_name.length > 0 && /^\w+$/.test(new_user_layer_name)) {
            options["choosed_name"] = new_user_layer_name;
        }
        var n_layer_name = add_layer_topojson(raw_topojson, options);
        if (!n_layer_name) return;
        var class_lim = JSON.parse(data_split[1]),
            col_pal = getColorBrewerArray(class_lim.min.length, "Oranges"),
            nb_class = class_lim['min'].length,
            colors_breaks = [];
        for (var i = 0; i < nb_class; i++) {
            colors_breaks.push([class_lim['min'][i] + " - " + class_lim['max'][i], col_pal[nb_class - 1 - i]]);
        }

        current_layers[n_layer_name].fill_color = { "class": [] };
        current_layers[n_layer_name].renderer = "Stewart";
        current_layers[n_layer_name].colors_breaks = colors_breaks;
        current_layers[n_layer_name].rendered_field = field1_n;
        current_layers[n_layer_name].color_palette = { name: "Oranges", reversed: true };
        current_layers[n_layer_name].options_disc = { breaks: [].concat(class_lim['max'][0], class_lim['min']).reverse() };
        map.select("#" + _app.layer_to_id.get(n_layer_name)).selectAll("path").styles(function (d, i) {
            return { 'fill': col_pal[nb_class - 1 - i], 'fill_opacity': 1, 'stroke-opacity': 0 };
        });
        handle_legend(n_layer_name);
        switch_accordion_section();
        // Todo : use the function render_choro to render the result from stewart too
    }, function (error) {
        display_error_during_computation();
        console.log(error);
    }).catch(function (err) {
        display_error_during_computation();
        console.log(err);
    });;
}

function fillMenu_Stewart() {
    var dialog_content = make_template_functionnality(section2);

    var a = dialog_content.append('p').attr('class', 'params_section2');
    a.append('span').style("margin", "10px 0px 0px").attrs({ class: 'i18n', 'data-i18n': '[html]app_page.func_options.smooth.field' }).html(i18next.t("app_page.func_options.smooth.field"));
    a.append('span').insert('select').attrs({ class: 'params marg_auto', id: "stewart_field" });

    var b = dialog_content.append('p').attr('class', 'params_section2');
    b.append('span').style("margin", "10px 0px 0px").attrs({ class: 'i18n', 'data-i18n': '[html]app_page.func_options.smooth.divide_field' }).html(i18next.t("app_page.func_options.smooth.divide_field"));
    b.insert('select').attrs({ class: 'params marg_auto', id: "stewart_field2" });

    var p_span = dialog_content.append("p").attr('class', 'params_section2');
    p_span.append('span').attrs({ class: 'i18n', 'data-i18n': '[html]app_page.func_options.smooth.span' }).text(i18next.t("app_page.func_options.smooth.span"));
    p_span.append('input').style("width", "60px").attrs({ type: 'number', class: 'params', id: "stewart_span", value: 5, min: 0, max: 100000, step: "any" });
    p_span.append("span").html(" (km)");

    var d = dialog_content.append('p').attr('class', 'params_section2');
    d.append('span').styles({ "margin-right": "35px" }).attrs({ class: 'i18n', 'data-i18n': '[html]app_page.func_options.smooth.beta' }).html(i18next.t("app_page.func_options.smooth.beta"));
    d.insert('input').style("width", "60px").attrs({ type: 'number', class: 'params', id: "stewart_beta", value: 2, min: 0, max: 11, step: "any" });

    var p_reso = dialog_content.append('p').attr('class', 'params_section2');
    p_reso.append('span').attrs({ class: 'i18n', 'data-i18n': '[html]app_page.func_options.smooth.resolution' }).text(i18next.t("app_page.func_options.smooth.resolution"));
    p_reso.insert('input').style("width", "60px").attrs({ type: 'number', class: 'params', id: "stewart_resolution", min: 1, max: 1000000, step: "any" });
    p_reso.insert("label").html(" (km)");

    var f = dialog_content.append('p').attr('class', 'params_section2');
    f.append('span').attrs({ class: 'i18n', 'data-i18n': '[html]app_page.func_options.smooth.func_options' }).html(i18next.t("app_page.func_options.smooth.function"));
    var func_selec = f.insert('select').attrs({ class: 'params i18n', id: "stewart_func" });

    var g = dialog_content.append("p").attr('class', 'params_section2');
    g.append('span').attrs({ class: 'i18n', 'data-i18n': '[html]app_page.func_options.smooth.nb_class' }).html(i18next.t("app_page.func_options.smooth.nb_class"));
    g.insert("input").style("width", "50px").attrs({ type: "number", class: 'params', id: "stewart_nb_class", value: 8, min: 1, max: 22, step: 1 });

    var bvs = dialog_content.append("p").attr('class', 'params_section2');
    bvs.append('span').attrs({ class: 'i18n', 'data-i18n': '[html]app_page.func_options.smooth.break_values' }).html(i18next.t("app_page.func_options.smooth.break_values"));
    bvs.insert("textarea").styles({ width: "100%", height: "2.2em", "font-size": "0.9em" }).attrs({ class: 'params i18n', id: "stewart_breaks",
        "data-i18n": "[placeholder]app_page.common.expected_class",
        "placeholder": i18next.t("app_page.common.expected_class") });
    var m = dialog_content.append('p').attr('class', 'params_section2').style('margin', 'auto');
    m.append('span').attrs({ class: 'i18n', 'data-i18n': '[html]app_page.func_options.smooth.mask' }).html(i18next.t("app_page.func_options.smooth.mask"));

    dialog_content.insert('select').attrs({ class: 'params', id: "stewart_mask" }).styles({ position: 'relative', float: 'right', margin: '1px 0px 10px 0px' });

    [['exponential', 'app_page.func_options.smooth.func_exponential'], ['pareto', 'app_page.func_options.smooth.func_pareto']].forEach(function (fun_name) {
        func_selec.append("option").text(i18next.t(fun_name[1])).attrs({ value: fun_name[0], 'data-i18n': '[text]' + fun_name[1] });
    });

    make_layer_name_button(dialog_content, 'stewart_output_name');
    make_ok_button(dialog_content, 'stewart_yes', false);
    dialog_content.selectAll(".params").attr("disabled", true);
}

var fields_Anamorphose = {
    fill: function fill(layer) {
        if (!layer) return;
        // let fields = type_col(layer, "number"),
        var fields = getFieldsType('stock', layer),
            field_selec = section2.select("#Anamorph_field"),
            algo_selec = section2.select('#Anamorph_algo'),
            ok_button = section2.select("#Anamorph_yes");

        if (fields.length == 0) {
            display_error_num_field();
            return;
        }
        algo_selec.on('change', function () {
            if (this.value === "olson") {
                section2.selectAll('.opt_dougenik').style('display', 'none');
                section2.selectAll('.opt_olson').style('display', undefined);
            } else if (this.value === "dougenik") {
                section2.selectAll('.opt_olson').style('display', 'none');
                section2.selectAll('.opt_dougenik').style('display', undefined);
            }
        });
        section2.selectAll(".params").attr("disabled", null);
        fields.forEach(function (field) {
            field_selec.append("option").text(field).attr("value", field);
        });

        field_selec.on("change", function () {
            var field_name = this.value,
                ref_value_field = document.getElementById("Anamorph_opt3");

            document.getElementById("Anamorph_output_name").value = ["Cartogram", this.value, layer].join('_');

            if (ref_value_field) {
                var max_val_field = max_fast(user_data[layer].map(function (obj) {
                    return +obj[field_name];
                }));
                ref_value_field.setAttribute("max", max_val_field);
                ref_value_field.value = max_val_field;
            }
        });

        ok_button.on("click", function () {
            var algo = algo_selec.node().value,
                nb_features = user_data[layer].length,
                field_name = field_selec.node().value,
                new_user_layer_name = document.getElementById("Anamorph_output_name").value;

            if (algo === "olson") {
                (function () {
                    // let ref_size = document.getElementById("Anamorph_olson_scale_kind").value,
                    // let opt_scale_max = document.getElementById("Anamorph_opt2");
                    // if(opt_scale_max.value > 100){
                    //     opt_scale_max.value = 100;
                    // }
                    // let scale_max = +document.getElementById("Anamorph_opt2").value / 100,
                    var nb_ft = current_layers[layer].n_features,
                        dataset = user_data[layer];

                    // if(contains_empty_val(dataset.map(a => a[field_name]))){
                    //   discard_rendering_empty_val();
                    //   return;
                    // }

                    var layer_select = document.getElementById(_app.layer_to_id.get(layer)).getElementsByTagName("path"),
                        sqrt = Math.sqrt,
                        abs = Math.abs,
                        d_val = [],
                        transform = [];

                    for (var i = 0; i < nb_ft; ++i) {
                        var val = +dataset[i][field_name];
                        // We deliberatly use 0 if this is a missing value :
                        if (isNaN(val) || !isFinite(val)) val = 0;
                        d_val.push([i, val, +path.area(layer_select[i].__data__.geometry)]);
                    }
                    d_val.sort(function (a, b) {
                        return b[1] - a[1];
                    });
                    var ref = d_val[0][1] / d_val[0][2];
                    d_val[0].push(1);

                    for (var _i3 = 0; _i3 < nb_ft; ++_i3) {
                        var _val = d_val[_i3][1] / d_val[_i3][2];
                        var scale = sqrt(_val / ref);
                        d_val[_i3].push(scale);
                    }
                    d_val.sort(function (a, b) {
                        return a[0] - b[0];
                    });
                    var formToSend = new FormData();
                    formToSend.append("json", JSON.stringify({
                        topojson: current_layers[layer].key_name,
                        scale_values: d_val.map(function (ft) {
                            return ft[3];
                        }),
                        field_name: field_name }));
                    xhrequest("POST", '/compute/olson', formToSend, true).then(function (result) {
                        var options = { result_layer_on_add: true };
                        if (new_user_layer_name.length > 0 && /^\w+$/.test(new_user_layer_name)) {
                            options["choosed_name"] = new_user_layer_name;
                        }
                        var n_layer_name = add_layer_topojson(result, options);
                        current_layers[n_layer_name].renderer = "OlsonCarto";
                        current_layers[n_layer_name].rendered_field = field_name;
                        current_layers[n_layer_name].scale_max = 1;
                        current_layers[n_layer_name].ref_layer_name = layer;
                        current_layers[n_layer_name].scale_byFeature = transform;
                        map.select("#" + _app.layer_to_id.get(n_layer_name)).selectAll("path").style("fill-opacity", 0.8).style("stroke", "black").style("stroke-opacity", 0.8);
                        switch_accordion_section();
                    }, function (err) {
                        display_error_during_computation();
                        console.log(err);
                    });
                })();
            } else if (algo === "dougenik") {
                var formToSend = new FormData(),
                    var_to_send = {},
                    nb_iter = document.getElementById("Anamorph_dougenik_iterations").value;

                var_to_send[field_name] = [];
                if (!current_layers[layer].original_fields.has(field_name)) {
                    var table = user_data[layer],
                        to_send = var_to_send[field_name];
                    for (var i = 0, i_len = table.length; i < i_len; ++i) {
                        to_send.push(+table[i][field_name]);
                    }
                }
                formToSend.append("json", JSON.stringify({
                    "topojson": current_layers[layer].key_name,
                    "var_name": var_to_send,
                    "iterations": nb_iter }));

                xhrequest("POST", '/compute/carto_doug', formToSend, true).then(function (data) {
                    var options = { result_layer_on_add: true };
                    if (new_user_layer_name.length > 0 && /^\w+$/.test(new_user_layer_name)) {
                        options["choosed_name"] = new_user_layer_name;
                    }
                    var n_layer_name = add_layer_topojson(data, options);
                    current_layers[n_layer_name].fill_color = { "random": true };
                    current_layers[n_layer_name].is_result = true;
                    current_layers[n_layer_name]['stroke-width-const'] = 0.8;
                    current_layers[n_layer_name].renderer = "Carto_doug";
                    current_layers[n_layer_name].rendered_field = field_name;
                    map.select("#" + _app.layer_to_id.get(n_layer_name)).selectAll("path").style("fill", function () {
                        return Colors.random();
                    }).style("fill-opacity", 0.8).style("stroke", "black").style("stroke-opacity", 0.8);
                    switch_accordion_section();
                }, function (error) {
                    display_error_during_computation();
                    console.log(error);
                });
            }
        });
        setSelected(field_selec.node(), field_selec.node().options[0].value);
    },
    unfill: function unfill() {
        var field_selec = document.getElementById("Anamorph_field");
        section2.selectAll(".params").attr("disabled", true);
        unfillSelectInput(field_selec);
    }
};

function fillMenu_Anamorphose() {
    var dialog_content = make_template_functionnality(section2);

    var algo_choice = dialog_content.append('p').attr('class', 'params_section2');
    algo_choice.append('span').attrs({ class: 'i18n', 'data-i18n': '[html]app_page.func_options.cartogram.algo' }).html(i18next.t("app_page.func_options.cartogram.algo"));
    var algo_selec = algo_choice.insert('select').attrs({ id: 'Anamorph_algo', class: 'params i18n' });

    var field_choice = dialog_content.append('p').attr('class', 'params_section2');
    field_choice.append('span').attrs({ class: 'i18n', 'data-i18n': '[html]app_page.func_options.cartogram.field' }).html(i18next.t("app_page.func_options.cartogram.field"));
    var field_selec = field_choice.insert('select').attrs({ class: 'params', id: 'Anamorph_field' });

    // Options for Dougenik mode :
    var doug1 = dialog_content.append('p').attr('class', 'params_section2 opt_dougenik');
    doug1.append('span').attrs({ class: 'i18n', 'data-i18n': '[html]app_page.func_options.cartogram.dougenik_iterations' }).html(i18next.t("app_page.func_options.cartogram.dougenik_iterations"));
    doug1.insert('input').attrs({ type: 'number', class: 'params', value: 5, min: 1, max: 12, step: 1, id: "Anamorph_dougenik_iterations" });

    // let o2 = dialog_content.append('p').attr('class', 'params_section2 opt_olson');

    [['Dougenik & al. (1985)', 'dougenik'], ['Olson (2005)', 'olson']].forEach(function (fun_name) {
        algo_selec.append("option").text(fun_name[0]).attr("value", fun_name[1]);
    });

    make_layer_name_button(dialog_content, "Anamorph_output_name");
    make_ok_button(dialog_content, 'Anamorph_yes', false);

    dialog_content.selectAll(".params").attr("disabled", true);
    dialog_content.selectAll(".opt_olson").style('display', 'none');
}

function getCentroids(ref_layer_selection) {
    var centroids = [];
    for (var i = 0, nb_features = ref_layer_selection.length; i < nb_features; ++i) {
        var geom = ref_layer_selection[i].__data__.geometry;
        if (geom.type.indexOf('Multi') < 0) {
            centroids.push(path.centroid(geom));
        } else {
            var areas = [];
            for (var j = 0; j < geom.coordinates.length; j++) {
                areas.push(path.area({
                    type: geom.type,
                    coordinates: [geom.coordinates[j]]
                }));
            }
            var ix_max = areas.indexOf(max_fast(areas));
            centroids.push(path.centroid({
                type: geom.type,
                coordinates: [geom.coordinates[ix_max]]
            }));
        }
    }
    return centroids;
}

function make_prop_line(rendering_params, geojson_line_layer) {
    var layer = rendering_params.ref_layer_name,
        field = rendering_params.field,
        color_field = rendering_params.color_field,
        t_field_name = 'prop_value',
        nb_features = rendering_params.nb_features,
        abs = Math.abs,
        ref_size = rendering_params.ref_size,
        ref_value = rendering_params.ref_value,
        symbol_type = rendering_params.symbol,
        layer_to_add = rendering_params.new_name,
        zs = d3.zoomTransform(svg_map).k,
        propSize = new PropSizer(ref_value, ref_size, symbol_type);

    if (!geojson_line_layer) {
        (function () {
            var make_geojson_line_layer = function make_geojson_line_layer() {
                var ref_layer_selection = document.getElementById(_app.layer_to_id.get(layer)).getElementsByTagName("path"),
                    result = [];
                for (var i = 0, _nb_features2 = ref_layer_selection.length; i < _nb_features2; ++i) {
                    var ft = ref_layer_selection[i].__data__,
                        value = +ft.properties[field],
                        new_obj = {
                        id: i,
                        type: "Feature",
                        properties: {},
                        geometry: cloneObj(ft.geometry)
                    };
                    if (f_ix_len) {
                        for (var f_ix = 0; f_ix < f_ix_len; f_ix++) {
                            new_obj.properties[fields_id[f_ix]] = ft.properties[fields_id[f_ix]];
                        }
                    }
                    new_obj.properties[field] = value;
                    new_obj.properties[t_field_name] = propSize.scale(value);
                    new_obj.properties['color'] = get_color(value, i);
                    if (color_field) new_obj.properties[color_field] = ft.properties[color_field];
                    result.push([value, new_obj]);
                }
                result.sort(function (a, b) {
                    return abs(b[0]) - abs(a[0]);
                });
                return {
                    type: "FeatureCollection",
                    features: result.map(function (d) {
                        return d[1];
                    })
                };
            };

            var get_color = void 0,
                col1 = void 0,
                col2 = void 0,
                fields_id = getFieldsType('id', layer),
                f_ix_len = fields_id ? fields_id.length : 0;

            if (rendering_params.break_val != undefined && rendering_params.fill_color.two) {
                col1 = rendering_params.fill_color.two[0], col2 = rendering_params.fill_color.two[1];
                get_color = function get_color(val, ix) {
                    return val > rendering_params.break_val ? col2 : col1;
                };
            } else if (rendering_params.fill_color instanceof Array && rendering_params.fill_color.length == nb_features) {
                get_color = function get_color(val, ix) {
                    return rendering_params.fill_color[ix];
                };
            } else {
                get_color = function get_color() {
                    return rendering_params.fill_color;
                };
            }

            geojson_line_layer = make_geojson_line_layer();
        })();
    }

    var layer_id = encodeId(layer_to_add);
    _app.layer_to_id.set(layer_to_add, layer_id);
    _app.id_to_layer.set(layer_id, layer_to_add);
    result_data[layer_to_add] = [];
    map.insert("g", '.legend').attrs({ id: layer_id, class: 'result_layer layer' }).styles({ 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }).selectAll('path').data(geojson_line_layer.features).enter().append('path').attr('d', path).styles(function (d) {
        result_data[layer_to_add].push(d.properties);
        return {
            fill: 'transparent', stroke: d.properties.color, 'stroke-width': d.properties[t_field_name] };
    });

    current_layers[layer_to_add] = {
        "n_features": nb_features,
        "renderer": rendering_params.renderer || "PropSymbols",
        "symbol": symbol_type,
        "rendered_field": field,
        "size": [ref_value, ref_size],
        // "stroke-width-const": 1,
        "is_result": true,
        "ref_layer_name": layer,
        "type": "Line"
    };

    if (rendering_params.fill_color.two != undefined) {
        current_layers[layer_to_add]["fill_color"] = cloneObj(rendering_params.fill_color);
    } else if (rendering_params.fill_color instanceof Array) {
        current_layers[layer_to_add]["fill_color"] = { 'class': geojson_line_layer.features.map(function (v) {
                return v.properties.color;
            }) };
    } else {
        current_layers[layer_to_add]["fill_color"] = { "single": rendering_params.fill_color };
    }
    if (rendering_params.break_val != undefined) {
        current_layers[layer_to_add]["break_val"] = rendering_params.break_val;
    }
    create_li_layer_elem(layer_to_add, nb_features, ["Line", "prop"], "result");
    return;
}

function make_prop_symbols(rendering_params, geojson_pt_layer) {
    var layer = rendering_params.ref_layer_name,
        field = rendering_params.field,
        color_field = rendering_params.color_field,
        t_field_name = 'prop_value',
        nb_features = rendering_params.nb_features,
        abs = Math.abs,
        ref_size = rendering_params.ref_size,
        ref_value = rendering_params.ref_value,
        symbol_type = rendering_params.symbol,
        layer_to_add = rendering_params.new_name,
        zs = d3.zoomTransform(svg_map).k,
        propSize = new PropSizer(ref_value, ref_size, symbol_type);

    if (!geojson_pt_layer) {
        (function () {
            var make_geojson_pt_layer = function make_geojson_pt_layer() {
                var ref_layer_selection = document.getElementById(_app.layer_to_id.get(layer)).getElementsByTagName("path"),
                    result = [];
                for (var i = 0, _nb_features3 = ref_layer_selection.length; i < _nb_features3; ++i) {
                    var ft = ref_layer_selection[i].__data__,
                        value = +ft.properties[field],
                        new_obj = {
                        id: i,
                        type: "Feature",
                        properties: {},
                        geometry: { type: 'Point' }
                    };
                    if (ft.geometry.type.indexOf('Multi') < 0) {
                        if (f_ix_len) {
                            for (var f_ix = 0; f_ix < f_ix_len; f_ix++) {
                                new_obj.properties[fields_id[f_ix]] = ft.properties[fields_id[f_ix]];
                            }
                        }
                        new_obj.properties[field] = value;
                        new_obj.properties[t_field_name] = propSize.scale(value);
                        new_obj.geometry['coordinates'] = d3.geoCentroid(ft.geometry);
                        new_obj.properties['color'] = get_color(value, i);
                        if (color_field) new_obj.properties[color_field] = ft.properties[color_field];
                        result.push([value, new_obj]);
                    } else {
                        var areas = [];
                        for (var j = 0; j < ft.geometry.coordinates.length; j++) {
                            areas.push(path.area({
                                type: ft.geometry.type,
                                coordinates: [ft.geometry.coordinates[j]]
                            }));
                        }
                        var ix_max = areas.indexOf(max_fast(areas));
                        if (f_ix_len) {
                            for (var _f_ix = 0; _f_ix < f_ix_len; _f_ix++) {
                                new_obj.properties[fields_id[_f_ix]] = ft.properties[fields_id[_f_ix]];
                            }
                        }
                        new_obj.properties[field] = value;
                        new_obj.properties[t_field_name] = propSize.scale(value);
                        new_obj.geometry['coordinates'] = d3.geoCentroid({ type: ft.geometry.type, coordinates: [ft.geometry.coordinates[ix_max]] });
                        new_obj.properties['color'] = get_color(value, i);
                        if (color_field) new_obj.properties[color_field] = ft.properties[color_field];
                        result.push([value, new_obj]);
                    }
                }
                result.sort(function (a, b) {
                    return abs(b[0]) - abs(a[0]);
                });
                return {
                    type: "FeatureCollection",
                    features: result.map(function (d) {
                        return d[1];
                    })
                };
            };

            var get_color = void 0,
                col1 = void 0,
                col2 = void 0,
                fields_id = getFieldsType('id', layer),
                f_ix_len = fields_id ? fields_id.length : 0;

            if (rendering_params.break_val != undefined && rendering_params.fill_color.two) {
                col1 = rendering_params.fill_color.two[0], col2 = rendering_params.fill_color.two[1];
                get_color = function get_color(val, ix) {
                    return val > rendering_params.break_val ? col2 : col1;
                };
            } else if (rendering_params.fill_color instanceof Array && rendering_params.fill_color.length == nb_features) {
                get_color = function get_color(val, ix) {
                    return rendering_params.fill_color[ix];
                };
            } else {
                get_color = function get_color() {
                    return rendering_params.fill_color;
                };
            }

            geojson_pt_layer = make_geojson_pt_layer();
        })();
    }
    var layer_id = encodeId(layer_to_add);
    _app.layer_to_id.set(layer_to_add, layer_id);
    _app.id_to_layer.set(layer_id, layer_to_add);
    result_data[layer_to_add] = [];
    if (symbol_type === 'circle') {
        map.insert("g", '.legend').attr("id", layer_id).attr("class", "result_layer layer").selectAll('circle').data(geojson_pt_layer.features).enter().append('circle').attrs(function (d, i) {
            result_data[layer_to_add].push(d.properties);
            return {
                'id': ['PropSymbol_', i, ' feature_', d.id].join(''),
                'r': d.properties[t_field_name],
                'cx': path.centroid(d)[0],
                'cy': path.centroid(d)[1]
            };
        }).style("fill", function (d) {
            return d.properties.color;
        }).style("stroke", "black").style("stroke-width", 1 / zs);
    } else if (symbol_type === "rect") {
        map.insert("g", '.legend').attr("id", layer_id).attr("class", "result_layer layer").selectAll('circle').data(geojson_pt_layer.features).enter().append('rect').attrs(function (d, i) {
            var size = d.properties[t_field_name];
            result_data[layer_to_add].push(d.properties);
            return {
                'id': ['PropSymbol_', i, ' feature_', d.id].join(''),
                'height': size,
                'width': size,
                'x': path.centroid(d)[0] - size / 2,
                'y': path.centroid(d)[1] - size / 2
            };
        }).style("fill", function (d) {
            return d.properties.color;
        }).style("stroke", "black").style("stroke-width", 1 / zs);
    }

    current_layers[layer_to_add] = {
        "n_features": nb_features,
        "renderer": rendering_params.renderer || "PropSymbols",
        "symbol": symbol_type,
        "rendered_field": field,
        "size": [ref_value, ref_size],
        "stroke-width-const": 1,
        "is_result": true,
        "ref_layer_name": layer
    };

    if (rendering_params.fill_color.two != undefined) {
        current_layers[layer_to_add]["fill_color"] = cloneObj(rendering_params.fill_color);
    } else if (rendering_params.fill_color instanceof Array) {
        current_layers[layer_to_add]["fill_color"] = { 'class': geojson_pt_layer.features.map(function (v) {
                return v.properties.color;
            }) };
    } else {
        current_layers[layer_to_add]["fill_color"] = { "single": rendering_params.fill_color };
    }
    if (rendering_params.break_val != undefined) {
        current_layers[layer_to_add]["break_val"] = rendering_params.break_val;
    }
    create_li_layer_elem(layer_to_add, nb_features, ["Point", "prop"], "result");
    return;
}

function render_categorical(layer, rendering_params) {
    if (rendering_params.new_name) {
        var fields = [].concat(getFieldsType('id', layer), rendering_params['rendered_field']);
        copy_layer(layer, rendering_params.new_name, "typo", fields);
        current_layers[rendering_params.new_name].key_name = current_layers[layer].key_name;
        current_layers[rendering_params.new_name].type = current_layers[layer].type;
        layer = rendering_params.new_name;
    }

    var colorsByFeature = rendering_params.colorByFeature,
        color_map = rendering_params.color_map,
        field = rendering_params.rendered_field;
    var layer_to_render = map.select("#" + _app.layer_to_id.get(layer));
    layer_to_render.style("opacity", 1).style("stroke-width", 0.75 / d3.zoomTransform(svg_map).k + "px");
    if (current_layers[layer].type == "Line") {
        layer_to_render.selectAll("path").styles({ 'fill': 'transparent', 'stroke-opacity': 1 }).style("stroke", function (d, i) {
            return colorsByFeature[i];
        });
    } else {
        layer_to_render.selectAll("path").style("fill", function (d, i) {
            return colorsByFeature[i];
        }).styles({ 'fill-opacity': 0.9, 'stroke-opacity': 0.9, 'stroke': '#000' });
    }
    current_layers[layer].renderer = rendering_params['renderer'];
    current_layers[layer].rendered_field = field;
    current_layers[layer].fill_color = { "class": rendering_params['colorByFeature'] };
    current_layers[layer]['stroke-width-const'] = 0.75;
    current_layers[layer].is_result = true;
    current_layers[layer].color_map = color_map;
    zoom_without_redraw();
}

// Function to render the `layer` according to the `rendering_params`
// (layer should be the name of group of path, ie. not a PropSymbol layer)
// Currently used fo "choropleth", "MTA - relative deviations", "gridded map" functionnality
function render_choro(layer, rendering_params) {
    if (rendering_params.new_name) {
        var fields = [].concat(getFieldsType('id', layer), rendering_params['rendered_field']);
        copy_layer(layer, rendering_params.new_name, "choro", fields);
        //Assign the same key to the cloned layer so it could be used transparently on server side
        // after deletion of the reference layer if needed :
        current_layers[rendering_params.new_name].key_name = current_layers[layer].key_name;
        current_layers[rendering_params.new_name].type = current_layers[layer].type;
        layer = rendering_params.new_name;
    }
    var breaks = rendering_params["breaks"];
    var options_disc = { schema: rendering_params.schema,
        colors: rendering_params.colors,
        no_data: rendering_params.no_data,
        type: rendering_params.type,
        breaks: breaks };
    var layer_to_render = map.select("#" + _app.layer_to_id.get(layer));
    layer_to_render.style("opacity", 1).style("stroke-width", 0.75 / d3.zoomTransform(svg_map).k, +"px");
    if (current_layers[layer].type == "Line") {
        layer_to_render.selectAll("path").styles({ 'fill': 'transparent', 'stroke-opacity': 1 }).style("stroke", function (d, i) {
            return rendering_params['colorsByFeature'][i];
        });
    } else {
        layer_to_render.selectAll("path").styles({ 'fill-opacity': 1, 'stroke-opacity': 1, 'stroke': '#000' }).style("fill", function (d, i) {
            return rendering_params['colorsByFeature'][i];
        });
    }
    current_layers[layer].renderer = rendering_params['renderer'];
    current_layers[layer].rendered_field = rendering_params['rendered_field'];
    current_layers[layer].fill_color = { "class": rendering_params['colorsByFeature'] };
    current_layers[layer]['stroke-width-const'] = 0.75;
    current_layers[layer].is_result = true;
    current_layers[layer].options_disc = options_disc;
    var colors_breaks = [];
    for (var i = breaks.length - 1; i > 0; --i) {
        colors_breaks.push([[breaks[i - 1], " - ", breaks[i]].join(''), rendering_params['colors'][i - 1]]);
    }
    current_layers[layer].colors_breaks = colors_breaks;
    zoom_without_redraw();
}

function render_mini_chart_serie(values, parent, cap, bins) {
    bins = bins || values.length > 20 ? 16 : values.length > 15 ? 10 : 5;
    var class_count = getBinsCount(values, bins),
        background = '#f1f1f1',
        color = '#6633ff',
        width = 3 * bins - 3,
        height = 25,
        canvas = document.createElement('canvas');
    cap = cap || max_fast(class_count.counts);
    canvas.width = width;
    canvas.height = height;

    var old = parent.querySelector("canvas");
    if (old) old.remove();
    parent.append(canvas);

    var ctx = canvas.getContext('2d');
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    var x = 0,
        y = 0,
        barwidth = 2,
        barspace = 1;

    ctx.fillStyle = color;
    for (var i = 0; i < bins; i++) {
        var barheight = Math.floor(Math.min(class_count.counts[i] / cap, 1) * (height - 1));
        x += barspace;
        ctx.fillRect(x, height, barwidth, -barheight);
        x += barwidth;
    }
    canvas.setAttribute("tooltip-info", make_mini_summary(class_count));
    new Tooltip(canvas, {
        dataAttr: "tooltip-info",
        animation: "slideNfade",
        duration: 50,
        delay: 100,
        container: document.getElementById("twbs"),
        placement: "top"
    });
}

function make_mini_summary(summary) {
    var p = Math.max(get_nb_decimals(summary.min), get_nb_decimals(summary.max)),
        props = { min: summary.min, max: summary.max, mean: summary.mean.toFixed(p),
        median: summary.median.toFixed(p), stddev: summary.stddev.toFixed(p) };
    return i18next.t('app_page.stat_summary.mini_summary', props);
}

function fillMenu_PropSymbolTypo(layer) {
    var dv2 = make_template_functionnality(section2);

    var a = dv2.append('p').attr('class', 'params_section2').style('margin-top', '2px');
    a.append('span').attrs({ class: 'i18n', 'data-i18n': '[html]app_page.func_options.proptypo.field1' }).html(i18next.t("app_page.func_options.proptypo.field1"));
    var field1_selec = a.insert('select').attrs({ class: 'params', id: 'PropSymbolTypo_field_1' });

    var b = dv2.append('p').attr('class', 'params_section2');
    b.append('span').attrs({ class: 'i18n', 'data-i18n': '[html]app_page.func_options.proptypo.fixed_size' }).html(i18next.t("app_page.func_options.proptypo.fixed_size"));
    var ref_size = b.insert('input').attrs({ type: 'number', class: 'params', id: 'PropSymbolTypo_ref_size',
        min: 0.1, max: 100.0, value: 60.0, step: "any" }).style("width", "50px");
    b.append('span').html(' (px)');

    var c = dv2.append('p').attr('class', 'params_section2');
    c.append('span').attrs({ class: 'i18n', 'data-i18n': '[html]app_page.func_options.proptypo.on_value' }).html(i18next.t("app_page.func_options.proptypo.on_value"));
    var ref_value = c.insert('input').styles({ 'width': '100px', "margin-left": "10px" }).attrs({ type: 'number', class: 'params', id: 'PropSymbolTypo_ref_value' }).attrs({ min: 0.1, step: 0.1 });

    // Other symbols could probably easily be proposed :
    var d = dv2.append('p').attr('class', 'params_section2');
    d.append('span').attrs({ class: 'i18n', 'data-i18n': '[html]app_page.func_options.proptypo.symbol_type' }).html(i18next.t("app_page.func_options.proptypo.symbol_type"));
    var symb_selec = d.insert('select').attrs({ 'class': 'params', 'id': 'PropSymbolTypo_symbol_type' });

    var e = dv2.append('p').attr('class', 'params_section2');
    e.append('span').attrs({ class: 'i18n', 'data-i18n': '[html]app_page.func_options.proptypo.field2' }).html(i18next.t("app_page.func_options.proptypo.field2"));
    var field2_selec = e.insert('select').attrs({ class: 'params', id: 'PropSymbolTypo_field_2' });

    var f = dv2.insert('p').styles({ 'margin': 'auto', 'text-align': 'center' });
    f.append("button").attrs({ id: "Typo_class", class: "button_disc params i18n",
        'data-i18n': '[html]app_page.func_options.typo.color_choice' }).styles({ "font-size": "0.8em", "text-align": "center" }).html(i18next.t("app_page.func_options.typo.color_choice"));

    make_layer_name_button(dv2, 'PropSymbolTypo_output_name');
    make_ok_button(dv2, 'propTypo_yes');
    section2.selectAll(".params").attr("disabled", true);
}

function prepare_categories_array(layer_name, selected_field, col_map) {
    var cats = [];
    if (!col_map) {
        col_map = new Map();
        for (var i = 0, data_layer = user_data[layer_name]; i < data_layer.length; ++i) {
            var value = data_layer[i][selected_field],
                ret_val = col_map.get(value);
            col_map.set(value, ret_val ? [ret_val[0] + 1, [i].concat(ret_val[1])] : [1, [i]]);
        }
        col_map.forEach(function (v, k) {
            cats.push({ name: k, display_name: k, nb_elem: v[0], color: Colors.names[Colors.random()] });
        });
        col_map = new Map();
        for (var _i4 = 0; _i4 < cats.length; _i4++) {
            col_map.set(cats[_i4].name, [cats[_i4].color, cats[_i4].name, cats[_i4].nb_elem]);
        }
    } else {
        col_map.forEach(function (v, k) {
            cats.push({ name: k, display_name: v[1], nb_elem: v[2], color: v[0] });
        });
    }
    return [cats, col_map];
}

var fields_PropSymbolTypo = {
    fill: function fill(layer) {
        if (!layer) return;
        section2.selectAll(".params").attr("disabled", null);
        var self = this,
            fields_num = getFieldsType('stock', layer),
            fields_categ = getFieldsType('category', layer),
            nb_features = user_data[layer].length,
            field1_selec = section2.select("#PropSymbolTypo_field_1"),
            field2_selec = section2.select("#PropSymbolTypo_field_2"),
            ref_value_field = section2.select('#PropSymbolTypo_ref_value'),
            ref_size = section2.select("#PropSymbolTypo_ref_size"),
            symb_selec = section2.select('#PropSymbolTypo_symbol_type'),
            uo_layer_name = section2.select('#PropSymbolTypo_output_name'),
            btn_typo_class = section2.select('#Typo_class'),
            ok_button = section2.select('#propTypo_yes');

        var prepare_colors = function prepare_colors(field) {
            var _prepare_categories_a5 = prepare_categories_array(layer, field, null),
                _prepare_categories_a6 = _slicedToArray(_prepare_categories_a5, 2),
                cats = _prepare_categories_a6[0],
                col_map = _prepare_categories_a6[1];

            var nb_class = col_map.size;
            var colorByFeature = user_data[layer].map(function (ft) {
                return col_map.get(ft[field])[0];
            });
            self.rendering_params[field] = {
                nb_class: nb_class, color_map: col_map, colorByFeature: colorByFeature,
                renderer: 'Categorical', rendered_field: field, skip_alert: false
            };
        };

        if (fields_categ.length == 0 || fields_num.length == 0) {
            display_error_num_field();
            return;
        }

        if (current_layers[layer].type == "Line") {
            ref_size.attr('value', 10.0);
            [['app_page.func_options.common.symbol_line', 'line'], ['app_page.func_options.common.symbol_circle', 'circle'], ['app_page.func_options.common.symbol_square', 'rect']].forEach(function (symb) {
                symb_selec.append("option").text(i18next.t(symb[0])).attrs({ "value": symb[1], 'data-i18n': '[text]' + symb[0] });
            });
        } else {
            ref_size.attr('value', 60.0);
            [['app_page.func_options.common.symbol_circle', 'circle'], ['app_page.func_options.common.symbol_square', 'rect']].forEach(function (symb) {
                symb_selec.append("option").text(i18next.t(symb[0])).attrs({ "value": symb[1], 'data-i18n': '[text]' + symb[0] });
            });
        }

        fields_num.forEach(function (field) {
            field1_selec.append("option").text(field).attr("value", field);
        });

        fields_categ.forEach(function (field) {
            field2_selec.append('option').text(field).attr('value', field);
        });

        // Set some default colors in order to not force to open the box for selecting them :
        {
            var first_field = fields_categ[0];
            prepare_colors(first_field);
            ok_button.attr('disabled', self.rendering_params[first_field] ? null : true);
        }

        field1_selec.on("change", function () {
            var field_name = this.value,
                max_val_field = max_fast(user_data[layer].map(function (obj) {
                return +obj[field_name];
            }));
            ref_value_field.attrs({ max: max_val_field, value: max_val_field });
            uo_layer_name.attr('value', ['Typo', field_name, field2_selec.node().value, layer].join('_'));
        });

        field2_selec.on("change", function () {
            var field_name = this.value;
            prepare_colors(field_name);
            // ok_button.attr("disabled", self.rendering_params[field_name] ? null : true);
            uo_layer_name.attr('value', ['Typo', field1_selec.node().value, field_name, layer].join('_'));
        });

        btn_typo_class.on("click", function () {
            var selected_field = field2_selec.node().value,
                new_layer_name = check_layer_name(['Typo', field1_selec.node().value, selected_field, layer].join('_')),
                col_map = self.rendering_params[selected_field] ? self.rendering_params[selected_field].color_map : undefined,
                cats = void 0;

            var _prepare_categories_a7 = prepare_categories_array(layer, selected_field, col_map);

            var _prepare_categories_a8 = _slicedToArray(_prepare_categories_a7, 2);

            cats = _prepare_categories_a8[0];
            col_map = _prepare_categories_a8[1];


            if (cats.length > 15) {
                swal({ title: "",
                    text: i18next.t("app_page.common.error_too_many_features_color"),
                    type: "warning",
                    showCancelButton: true,
                    allowOutsideClick: false,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: i18next.t("app_page.common.valid") + "!",
                    cancelButtonText: i18next.t("app_page.common.cancel")
                }).then(function () {
                    display_categorical_box(user_data[layer], layer, selected_field, cats).then(function (confirmed) {
                        if (confirmed) {
                            // ok_button.attr("disabled", null);
                            self.rendering_params[selected_field] = {
                                nb_class: confirmed[0], color_map: confirmed[1], colorByFeature: confirmed[2],
                                renderer: "Categorical", rendered_field: selected_field, new_name: new_layer_name, skip_alert: true
                            };
                        }
                    });
                }, function (dismiss) {
                    return;
                });
            } else {
                display_categorical_box(user_data[layer], layer, selected_field, cats).then(function (confirmed) {
                    if (confirmed) {
                        // ok_button.attr("disabled", null);
                        self.rendering_params[selected_field] = {
                            nb_class: confirmed[0], color_map: confirmed[1], colorByFeature: confirmed[2],
                            renderer: "Categorical", rendered_field: selected_field, new_name: new_layer_name, skip_alert: true
                        };
                    }
                });
            }
        });

        ok_button.on('click', function () {
            var render = function render() {
                render_PropSymbolTypo(field1_selec.node().value, field2_selec.node().value, uo_layer_name.node().value, ref_value_field.node().value, section2.select('#PropSymbolTypo_ref_size').node().value, section2.select('#PropSymbolTypo_symbol_type').node().value);
            };
            var field_color = field2_selec.node().value;
            if (self.rendering_params[field_color].color_map.size > 15 && !self.rendering_params[field_color].skip_alert) {
                swal({ title: "",
                    text: i18next.t("app_page.common.error_too_many_features_color"),
                    type: "warning",
                    showCancelButton: true,
                    allowOutsideClick: false,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: i18next.t("app_page.common.valid") + "!",
                    cancelButtonText: i18next.t("app_page.common.cancel")
                }).then(function () {
                    render();
                }, function (dismiss) {
                    return;
                });
            } else {
                render();
            }
        });
        setSelected(field1_selec.node(), fields_num[0]);
        setSelected(field2_selec.node(), fields_categ[0]);
    },

    unfill: function unfill() {
        unfillSelectInput(document.getElementById("PropSymbolTypo_field_1"));
        unfillSelectInput(document.getElementById("PropSymbolTypo_field_2"));
        unfillSelectInput(document.getElementById("PropSymbolTypo_symbol_type"));
        section2.selectAll(".params").attr("disabled", true);
    },
    rendering_params: {}
};

function render_PropSymbolTypo(field1, color_field, new_layer_name, ref_value, ref_size, symb_selec) {
    if (!ref_value || !color_field || !fields_PropSymbolTypo.rendering_params[color_field]) return;
    var layer = Object.getOwnPropertyNames(user_data)[0],
        nb_features = user_data[layer].length,
        rendering_params = fields_PropSymbolTypo.rendering_params[color_field],
        rd_params = {};

    new_layer_name = new_layer_name.length > 0 && /^\w+$/.test(new_layer_name) ? check_layer_name(new_layer_name) : check_layer_name(["PropSymbolsTypo", field1, color_field, layer].join('_'));

    rd_params.field = field1;
    rd_params.new_name = new_layer_name;
    rd_params.nb_features = nb_features;
    rd_params.ref_layer_name = layer;
    rd_params.symbol = symb_selec;
    rd_params.ref_value = +ref_value;
    rd_params.color_field = color_field;
    rd_params.ref_size = +ref_size;
    rd_params.fill_color = rendering_params.colorByFeature;

    if (symb_selec === "line") make_prop_line(rd_params);else make_prop_symbols(rd_params);

    Object.assign(current_layers[new_layer_name], {
        renderer: "PropSymbolsTypo",
        rendered_field: field1,
        rendered_field2: color_field,
        color_map: rendering_params.color_map
    });
    zoom_without_redraw();
    switch_accordion_section();
    handle_legend(new_layer_name);
}

function fillMenu_Discont() {
    var dv2 = make_template_functionnality(section2);

    var a = dv2.append('p').attr('class', 'params_section2').style('margin-top', '2px');
    a.append('span').attrs({ class: 'i18n', 'data-i18n': '[html]app_page.func_options.discont.field' }).html(i18next.t('app_page.func_options.discont.field'));
    a.insert('select').attrs({ class: 'params', id: 'field_Discont' });

    // let b = dv2.append('p').attr('class', 'params_section2');
    // b.append('span')
    //   .attrs({class: 'i18n', 'data-i18n': '[html]app_page.func_options.discont.id_field'})
    //   .html(i18next.t('app_page.func_options.discont.id_field'));
    // b.insert('select')
    //   .attrs({class: 'params', id: 'field_id_Discont'});

    var c = dv2.append('p').attr('class', 'params_section2');
    c.append('span').attrs({ class: 'i18n', 'data-i18n': '[html]app_page.func_options.discont.type_discontinuity' }).html(i18next.t('app_page.func_options.discont.type_discontinuity'));
    var discontinuity_type = c.insert('select').attrs({ class: 'params i18n', id: 'kind_Discont' });

    [['app_page.func_options.discont.type_relative', 'rel'], ['app_page.func_options.discont.type_absolute', 'abs']].forEach(function (k) {
        discontinuity_type.append('option').text(i18next.t(k[0])).attrs({ 'value': k[1], 'data-i18n': '[text]' + k[0] });
    });

    // let d = dv2.append('p').attr('class', 'params_section2');
    // d.append('span')
    //   .attrs({class: 'i18n', 'data-i18n': '[html]app_page.func_options.discont.nb_class'})
    //   .html(i18next.t('app_page.func_options.discont.nb_class'));
    // d.insert('input')
    //   .attrs({type: 'number', class: 'params', id: 'Discont_nbClass', min: 1, max: 33, value: 4})
    //   .style('width', '50px');

    var e = dv2.append('p').attr('class', 'params_section2');
    e.append('span').attrs({ class: 'i18n', 'data-i18n': '[html]app_page.func_options.discont.discretization' }).html(i18next.t('app_page.func_options.discont.discretization'));
    var disc_type = e.insert('select').attrs({ 'class': 'params i18n', 'id': 'Discont_discKind' });

    [['app_page.common.equal_interval', 'equal_interval'], ['app_page.common.quantiles', 'quantiles'], ['app_page.common.Q6', 'Q6'], ['app_page.common.arithmetic_progression', 'arithmetic_progression'], ['app_page.common.jenks', 'jenks']].forEach(function (field) {
        disc_type.append('option').text(i18next.t(field[0])).attrs({ 'value': field[1], 'data-i18n': '[text]' + field[0] });
    });

    var f = dv2.append('p').attr('class', 'params_section2');
    f.append('span').attrs({ class: 'i18n', 'data-i18n': '[html]app_page.func_options.discont.color' }).html(i18next.t('app_page.func_options.discont.color'));
    f.insert('input').attrs({ class: 'params', id: 'color_Discont', type: 'color', value: ColorsSelected.random() });

    make_layer_name_button(dv2, 'Discont_output_name');
    make_ok_button(dv2, 'yes_Discont', false);

    dv2.selectAll('.params').attr('disabled', true);
}

var fields_Discont = {
    fill: function fill(layer) {
        if (!layer) return;
        var fields_num = getFieldsType('stock', layer).concat(getFieldsType('ratio', layer)),
            fields_id = getFieldsType('id', layer),
            field_discont = section2.select("#field_Discont"),

        // field_id = section2.select("#field_id_Discont"),
        ok_button = section2.select('#yes_Discont');

        if (fields_num.length == 0) {
            display_error_num_field();
            return;
        }

        fields_num.forEach(function (field) {
            field_discont.append("option").text(field).attr("value", field);
        });
        // if(fields_id.length == 0){
        //     field_id.append("option").text(i18next.t("app_page.common.default")).attrs({"value": "__default__", "class": "i18n", "data-i18n": "[text]app_page.common.default"});
        // } else {
        //   fields_id.forEach(function(field){
        //       field_id.append("option").text(field).attr("value", field);
        //   });
        // }
        field_discont.on("change", function () {
            var discontinuity_type = document.getElementById("kind_Discont").value;
            document.getElementById("Discont_output_name").value = ["Disc", this.value, discontinuity_type, layer].join('_');
        });
        ok_button.on('click', render_discont);
        section2.selectAll(".params").attr("disabled", null);
        document.getElementById("Discont_output_name").value = ["Disc", layer].join('_');
    },
    unfill: function unfill() {
        unfillSelectInput(document.getElementById("field_Discont"));
        // unfillSelectInput(document.getElementById("field_id_Discont"));
        section2.selectAll(".params").attr("disabled", true);
    }
};

var render_discont = function render_discont() {
    var layer = Object.getOwnPropertyNames(user_data)[0],
        field = document.getElementById("field_Discont").value,

    // field_id = document.getElementById("field_id_Discont").value,
    min_size = 1,
        max_size = 10,
        discontinuity_type = document.getElementById("kind_Discont").value,
        discretization_type = document.getElementById('Discont_discKind').value,
        nb_class = 4,
        user_color = document.getElementById("color_Discont").value,
        new_layer_name = document.getElementById("Discont_output_name").value;

    new_layer_name = new_layer_name.length > 0 && /^\w+$/.test(new_layer_name) ? check_layer_name(new_layer_name) : check_layer_name(["Disc", field, discontinuity_type, layer].join('_'));

    var id_layer = encodeId(new_layer_name);
    _app.layer_to_id.set(new_layer_name, id_layer);
    _app.id_to_layer.set(id_layer, new_layer_name);

    // field_id = field_id == "__default__" ? undefined : field_id;
    var field_id = undefined;

    var result_value = new Map(),
        result_geom = {},
        topo_mesh = topojson.mesh,
        math_max = Math.max,
        topo_to_use = _target_layer_file;

    document.getElementById("overlay").style.display = "";

    // Discontinuity are computed in another thread to avoid blocking the ui (and so error message on large layer)
    // (a waiting message is displayed during this time to avoid action from the user)
    var discont_worker = new Worker('/static/js/webworker_discont.js');
    _app.webworker_to_cancel = discont_worker;
    discont_worker.postMessage([topo_to_use, layer, field, discontinuity_type, discretization_type, field_id]);
    discont_worker.onmessage = function (e) {
        var _e$data = _slicedToArray(e.data, 2),
            arr_tmp = _e$data[0],
            d_res = _e$data[1];

        _app.webworker_to_cancel = undefined;
        var nb_ft = arr_tmp.length,
            step = (max_size - min_size) / (nb_class - 1),
            class_size = Array(nb_class).fill(0).map(function (d, i) {
            return min_size + i * step;
        });

        var _discretize_to_size = discretize_to_size(arr_tmp, discretization_type, nb_class, min_size, max_size),
            _discretize_to_size2 = _slicedToArray(_discretize_to_size, 4),
            breaks = _discretize_to_size2[2],
            serie = _discretize_to_size2[3];

        if (!serie || !breaks) {
            var opt_nb_class = Math.floor(1 + 3.3 * Math.log10(nb_ft));
            var w = nb_class > opt_nb_class ? i18next.t("app_page.common.smaller") : i18next.t("app_page.common.larger");
            swal("", i18next.t("app_page.common.error_discretization", { arg: w }), "error");
            return;
        }

        breaks = breaks.map(function (ft) {
            return [ft[0], ft[1]];
        }).filter(function (d) {
            return d[1] !== undefined;
        });
        var result_layer = map.insert("g", '.legend').attr("id", id_layer).styles({ "stroke-linecap": "round", "stroke-linejoin": "round" }).attr("class", "result_layer layer");

        result_data[new_layer_name] = [];
        var data_result = result_data[new_layer_name],
            result_lyr_node = result_layer.node();

        for (var i = 0; i < nb_ft; i++) {
            var val = d_res[i][0],
                p_size = class_size[serie.getClass(val)],
                elem = result_layer.append("path").datum(d_res[i][2]).attrs({ d: path, id: ["feature", i].join('_') }).styles({ stroke: user_color, "stroke-width": p_size, "fill": "transparent", "stroke-opacity": 1 });
            data_result.push(d_res[i][1]);
            elem.node().__data__.geometry = d_res[i][2];
            elem.node().__data__.properties = data_result[i];
            elem.node().__data__.properties['prop_val'] = p_size;
        }
        document.getElementById("overlay").style.display = "none";
        current_layers[new_layer_name] = {
            "renderer": "DiscLayer",
            "breaks": breaks,
            "min_display": 0, // FIXME
            "type": "Line",
            "rendered_field": field,
            "size": [0.5, 10],
            "is_result": true,
            "fixed_stroke": true,
            "ref_layer_name": layer,
            "fill_color": { "single": user_color },
            "n_features": nb_ft
        };
        create_li_layer_elem(new_layer_name, nb_ft, ["Line", "discont"], "result");

        {
            (function () {
                // Only display the 50% most important values :
                // TODO : reintegrate this upstream in the layer creation :
                var lim = 0.5 * current_layers[new_layer_name].n_features;
                result_layer.selectAll('path').style("display", function (d, i) {
                    return i <= lim ? null : "none";
                });
                current_layers[new_layer_name].min_display = 0.5;
            })();
        }

        d3.select('#layer_to_export').append('option').attr('value', new_layer_name).text(new_layer_name);
        zoom_without_redraw();
        switch_accordion_section();
        handle_legend(new_layer_name);
        send_layer_server(new_layer_name, "/layers/add");
        discont_worker.terminate();
    };
};

function fillMenu_PropSymbol(layer) {
    var dialog_content = make_template_functionnality(section2),
        max_allowed_size = Math.round(h / 2 - h / 10);

    var a = dialog_content.append('p').attr('class', 'params_section2').style('margin-top', '2px');
    a.append('span').attrs({ class: 'i18n', 'data-i18n': '[html]app_page.func_options.common.field' }).html(i18next.t("app_page.func_options.common.field"));
    var field_selec = a.insert('select').attrs({ class: 'params', 'id': "PropSymbol_field_1" });

    var b = dialog_content.append('p').attr('class', 'params_section2');
    b.append('span').attrs({ class: 'i18n', 'data-i18n': '[html]app_page.func_options.prop.fixed_size' }).html(i18next.t("app_page.func_options.prop.fixed_size"));
    var ref_size = b.insert('input').attrs({ id: 'PropSymbol_ref_size', type: 'number', class: 'params', min: 0.2, max: max_allowed_size, value: 60.0, step: 0.1 }).style("width", "50px");
    b.append('span').html(" px");

    var c = dialog_content.append('p').attr('class', 'params_section2');
    c.append('span').attrs({ class: 'i18n', 'data-i18n': '[html]app_page.func_options.prop.on_value' }).html(i18next.t("app_page.func_options.prop.on_value"));
    var ref_value = c.insert('input').styles({ 'width': '100px', "margin-left": "10px" }).attrs({ id: 'PropSymbol_ref_value', type: 'number', class: "params", min: 0.1, step: 0.1 });

    var d = dialog_content.append('p').attr('class', 'params_section2');
    d.append('span').attrs({ class: 'i18n', 'data-i18n': '[html]app_page.func_options.prop.symbol_type' }).html(i18next.t("app_page.func_options.prop.symbol_type"));
    var symb_selec = d.insert('select').attrs({ 'class': 'params i18n', "id": "PropSymbol_symbol" });

    // [['app_page.func_options.common.symbol_circle', 'circle'],
    //  ['app_page.func_options.common.symbol_square', 'rect']
    // ].forEach(function(symb){
    //     symb_selec.append("option").text(i18next.t(symb[0])).attrs({"value": symb[1], 'data-i18n': '[text]' + symb[0]});});

    var color_section = dialog_content.append('p').attr('class', 'params_section2');
    color_section.append("span").attrs({ class: 'i18n', 'data-i18n': '[html]app_page.func_options.prop.symbol_color' }).html(i18next.t("app_page.func_options.prop.symbol_color"));
    var color_par = color_section.append('select').attrs({ id: 'PropSymbol_nb_colors', class: 'params' });
    color_par.append("option").attrs({ value: 1, class: 'i18n', 'data-i18n': '[text]app_page.func_options.prop.options_one_color' }).text(i18next.t("app_page.func_options.prop.options_one_color"));
    color_par.append("option").attrs({ value: 2, class: 'i18n', 'data-i18n': '[text]app_page.func_options.prop.options_two_colors' }).text(i18next.t("app_page.func_options.prop.options_two_colors"));

    var col_p = dialog_content.append("p").attr('class', 'params_section2').styles({ 'padding-top': '5px', 'margin-bottom': '-5px', 'text-align': 'center' });
    col_p.insert('input').styles({ "position": "unset" }).attrs({ type: "color", class: "params", id: "PropSymbol_color1", value: ColorsSelected.random() });
    col_p.insert('input').styles({ "display": "none", "position": "unset" }).attrs({ type: "color", class: "params", id: "PropSymbol_color2", value: ColorsSelected.random() });

    var col_b = dialog_content.insert("p").attr('class', 'params_section2');
    col_b.insert("span").style("display", "none").attrs({ id: 'PropSymbol_color_txt', class: 'i18n', 'data-i18n': '[html]app_page.func_options.prop.options_break_two_colors' }).html(i18next.t("app_page.func_options.prop.options_break_two_colors"));
    col_b.insert('input').attrs({ id: 'PropSymbol_break_val', 'type': 'number', class: "params" }).styles({ "display": "none", "width": "75px" });

    make_layer_name_button(dialog_content, 'PropSymbol_output_name');
    make_ok_button(dialog_content, 'PropSymbol_yes', false);
    dialog_content.selectAll(".params").attr("disabled", true);
}

var fields_PropSymbol = {
    fill: function fill(layer) {
        if (!layer) return;
        section2.selectAll(".params").attr("disabled", null);
        // let fields = type_col(layer, "number"),
        var fields = getFieldsType('stock', layer),
            nb_features = user_data[layer].length,
            field_selec = section2.select("#PropSymbol_field_1"),
            nb_color = section2.select('#PropSymbol_nb_colors'),
            ok_button = section2.select('#PropSymbol_yes'),
            ref_value_field = section2.select('#PropSymbol_ref_value'),
            ref_size = section2.select('#PropSymbol_ref_size'),
            symb_selec = section2.select('#PropSymbol_symbol'),
            uo_layer_name = section2.select('#PropSymbol_output_name'),
            fill_color = section2.select('#PropSymbol_color1'),
            fill_color2 = section2.select('#PropSymbol_color2'),
            fill_color_opt = section2.select('#PropSymbol_break_val'),
            fill_color_text = section2.select('#PropSymbol_color_txt');

        if (current_layers[layer].type == "Line") {
            ref_size.attr('value', 10.0);
            [['app_page.func_options.common.symbol_line', 'line'], ['app_page.func_options.common.symbol_circle', 'circle'], ['app_page.func_options.common.symbol_square', 'rect']].forEach(function (symb) {
                symb_selec.append("option").text(i18next.t(symb[0])).attrs({ "value": symb[1], 'data-i18n': '[text]' + symb[0] });
            });
        } else {
            ref_size.attr('value', 60.0);
            [['app_page.func_options.common.symbol_circle', 'circle'], ['app_page.func_options.common.symbol_square', 'rect']].forEach(function (symb) {
                symb_selec.append("option").text(i18next.t(symb[0])).attrs({ "value": symb[1], 'data-i18n': '[text]' + symb[0] });
            });
        }

        fields.forEach(function (field) {
            field_selec.append("option").text(field).attr("value", field);
        });

        field_selec.on("change", function () {
            var field_name = this.value,
                field_values = user_data[layer].map(function (obj) {
                return +obj[field_name];
            }),
                max_val_field = max_fast(field_values);

            uo_layer_name.attr('value', ["PropSymbol", this.value, layer].join('_'));
            ref_value_field.attrs({ "max": max_val_field, 'value': max_val_field });
            if (has_negative(field_values)) {
                setSelected(nb_color.node(), 2);
                break_val.attr('value', 0);
            } else {
                setSelected(nb_color.node(), 1);
            }
        });

        nb_color.on("change", function () {
            if (this.value == 1) {
                fill_color2.style("display", "none");
                fill_color_opt.style("display", "none");
                fill_color_text.style("display", "none");
            } else {
                fill_color2.style("display", null);
                fill_color_opt.style("display", null);
                fill_color_text.style("display", "inline");
            }
        });
        ok_button.on("click", function () {
            var nb_features = user_data[layer].length,
                field_to_render = field_selec.node().value,
                symbol_to_use = symb_selec.node().value,
                user_new_layer_name = uo_layer_name.node().value,
                new_layer_name = check_layer_name(user_new_layer_name.length > 0 && /^\w+$/.test(user_new_layer_name) ? user_new_layer_name : ["PropSymbols", field_to_render, layer].join('_')),
                rendering_params = { "field": field_to_render,
                "nb_features": nb_features,
                "new_name": new_layer_name,
                "ref_layer_name": layer,
                "symbol": symbol_to_use,
                "ref_size": +ref_size.node().value,
                "ref_value": +ref_value_field.node().value,
                "fill_color": fill_color.node().value };
            if (+nb_color.node().value == 2) {
                rendering_params["break_val"] = +fill_color_opt.node().value;
                rendering_params["fill_color"] = { "two": [fill_color.node().value, fill_color2.node().value] };
            }
            if (symbol_to_use == "line") make_prop_line(rendering_params);else make_prop_symbols(rendering_params);
            zoom_without_redraw();
            switch_accordion_section();
            handle_legend(new_layer_name);
        });
        uo_layer_name.attr('value', ["PropSymbols", layer].join('_'));
        setSelected(field_selec.node(), fields[0]);
    },

    unfill: function unfill() {
        unfillSelectInput(document.getElementById("PropSymbol_field_1"));
        unfillSelectInput(document.getElementById('PropSymbol_symbol'));
        section2.selectAll(".params").attr("disabled", true);
    }
};

function fillMenu_TypoSymbol() {
    var dv2 = make_template_functionnality(section2);
    var a = dv2.append("p").attr('class', 'params_section2').style('margin-top', '2px');
    a.append('span').attrs({ "class": "i18n", "data-i18n": "[html]app_page.func_options.typosymbol.field" }).html(i18next.t("app_page.func_options.typosymbol.field"));
    var field_selec = a.insert('select').attrs({ class: "params", id: "field_Symbol" });

    var b = dv2.insert('p').attr('class', 'params_section2').styles({ 'text-align': 'center', 'margin': 'auto' });
    b.append("button").attrs({ id: "selec_Symbol", class: "button_disc params i18n",
        "data-i18n": "[html]app_page.func_options.typosymbol.symbols_choice" }).styles({ "font-size": "0.8em", "text-align": "center" }).html(i18next.t("app_page.func_options.typosymbol.symbols_choice"));

    make_layer_name_button(dv2, 'TypoSymbols_output_name');
    make_ok_button(dv2, 'yesTypoSymbols');
    dv2.selectAll(".params").attr("disabled", true);
    if (!window.default_symbols) {
        window.default_symbols = [];
        prepare_available_symbols();
    }
}

function discard_rendering_empty_val() {
    swal({ title: "", type: "error",
        text: i18next.t("app_page.common.error_empty_vals") });
}

var fields_TypoSymbol = {
    fill: function fill(layer) {
        if (!layer) return;
        var fields_all = Object.getOwnPropertyNames(user_data[layer][0]),
            field_to_use = section2.select("#field_Symbol"),
            selec_symbol = section2.select("#selec_Symbol"),
            uo_layer_name = section2.select('#TypoSymbols_output_name'),
            ok_button = section2.select('#yesTypoSymbols'),
            self = this;

        section2.selectAll(".params").attr("disabled", null);
        fields_all.forEach(function (field) {
            field_to_use.append("option").text(field).attr("value", field);
        });
        field_to_use.on("change", function () {
            var field = this.value;
            ok_button.attr('disabled', self.rendering_params[field] ? null : true);
        });
        selec_symbol.on("click", function () {
            swal({ title: "",
                text: i18next.t("app_page.common.error_too_many_features"),
                type: "warning",
                showCancelButton: true,
                allowOutsideClick: false,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: i18next.t("app_page.common.valid") + "!",
                cancelButtonText: i18next.t("app_page.common.cancel")
            }).then(function () {
                var field = document.getElementById("field_Symbol").value,
                    symbol_map = self.rendering_params[field] ? self.rendering_params[field].symbols_map : undefined;
                display_box_symbol_typo(layer, field, symbol_map).then(function (confirmed) {
                    if (confirmed) {
                        document.getElementById("yesTypoSymbols").disabled = null;
                        self.rendering_params[field] = {
                            nb_cat: confirmed[0],
                            symbols_map: confirmed[1],
                            field: field
                        };
                    }
                });
            }, function () {
                return;
            });
        });
        ok_button.on('click', function () {
            var field = field_to_use.node().value;
            render_TypoSymbols(self.rendering_params[field], uo_layer_name.node().value);
        });
        setSelected(field_to_use.node(), fields_all[0]);
        uo_layer_name.attr('value', ["Symbols", layer].join('_'));
    },
    unfill: function unfill() {
        unfillSelectInput(document.getElementById("field_Symbol"));
        section2.selectAll(".params").attr("disabled", true);
    },
    rendering_params: {}
};

function render_TypoSymbols(rendering_params, new_name) {
    var layer_name = Object.getOwnPropertyNames(user_data)[0];
    var ref_layer_id = _app.layer_to_id.get(layer_name);
    var field = rendering_params.field;
    var layer_to_add = check_layer_name(new_name.length > 0 && /^\w+$/.test(new_name) ? new_name : ["Symbols", field, layer_name].join("_"));
    var ref_selection = document.getElementById(_app.layer_to_id.get(ref_layer_id)).getElementsByTagName("path");
    var nb_ft = ref_selection.length;

    function make_geojson_pt_layer() {
        var result = [];
        for (var i = 0, nb_features = ref_selection.length; i < nb_features; ++i) {
            var ft = ref_selection[i].__data__,
                value = ft.properties[field],
                new_obj = {
                id: i,
                type: "Feature",
                properties: {},
                geometry: { type: 'Point' }
            };
            if (ft.geometry.type.indexOf('Multi') < 0) {
                new_obj.properties['symbol_field'] = value;
                new_obj.properties['id_parent'] = ft.id;
                new_obj.geometry['coordinates'] = d3.geoCentroid(ft.geometry);
                result.push(new_obj);
            } else {
                var areas = [];
                for (var j = 0; j < ft.geometry.coordinates.length; j++) {
                    areas.push(path.area({
                        type: ft.geometry.type,
                        coordinates: [ft.geometry.coordinates[j]]
                    }));
                }
                var ix_max = areas.indexOf(max_fast(areas));
                new_obj.properties['symbol_field'] = value;
                new_obj.properties['id_parent'] = ft.id;
                new_obj.geometry['coordinates'] = d3.geoCentroid({ type: ft.geometry.type, coordinates: [ft.geometry.coordinates[ix_max]] });
                result.push(new_obj);
            }
        }
        return {
            type: "FeatureCollection",
            features: result
        };
    }

    var new_layer_data = make_geojson_pt_layer();
    var layer_id = encodeId(layer_to_add);
    _app.layer_to_id.set(layer_to_add, layer_id);
    _app.id_to_layer.set(layer_id, layer_to_add);
    var context_menu = new ContextMenu(),
        getItems = function getItems(self_parent) {
        return [{ "name": i18next.t("app_page.common.edit_style"), "action": function action() {
                make_style_box_indiv_symbol(self_parent);
            } }, { "name": i18next.t("app_page.common.delete"), "action": function action() {
                self_parent.style.display = "none";
            } }];
    };

    map.insert("g", '.legend').attrs({ id: layer_id, class: "layer" }).selectAll("image").data(new_layer_data.features).enter().insert("image").attrs(function (d) {
        var symb = rendering_params.symbols_map.get(d.properties.symbol_field),
            coords = path.centroid(d.geometry);
        return {
            "x": coords[0] - symb[1] / 2,
            "y": coords[1] - symb[1] / 2,
            "width": symb[1] + "px",
            "height": symb[1] + "px",
            "xlink:href": symb[0]
        };
    }).on("mouseover", function () {
        this.style.cursor = "pointer";
    }).on("mouseout", function () {
        this.style.cursor = "initial";
    }).on("contextmenu dblclick", function () {
        context_menu.showMenu(d3.event, document.querySelector("body"), getItems(this));
    }).call(drag_elem_geo);

    create_li_layer_elem(layer_to_add, nb_ft, ["Point", "symbol"], "result");

    current_layers[layer_to_add] = {
        "n_features": current_layers[layer_name].n_features,
        "renderer": "TypoSymbols",
        "symbols_map": rendering_params.symbols_map,
        "rendered_field": field,
        "is_result": true,
        "symbol": "image",
        "ref_layer_name": layer_name
    };
    handle_legend(layer_to_add);
    zoom_without_redraw();
    switch_accordion_section();
}

function fillMenu_griddedMap(layer) {
    var dialog_content = make_template_functionnality(section2);

    var a = dialog_content.append('p').attr('class', 'params_section2').style('margin-top', '2px');
    a.append('span').attrs({ class: 'i18n', 'data-i18n': '[html]app_page.func_options.common.field' }).html(i18next.t("app_page.func_options.common.field"));
    a.insert('select').attrs({ class: 'params', id: "Gridded_field" });

    var b = dialog_content.append('p').attr('class', 'params_section2');
    b.append('span').attrs({ class: 'i18n', 'data-i18n': '[html]app_page.func_options.grid.cellsize' }).html(i18next.t("app_page.func_options.grid.cellsize"));
    b.insert('input').style("width", "100px").attrs({ type: 'number', class: 'params', id: "Gridded_cellsize",
        value: 10.0, min: 1.000, max: 7000, step: "any" });

    var c = dialog_content.append('p').attr('class', 'params_section2');
    c.append('span').attrs({ class: 'i18n', 'data-i18n': '[html]app_page.func_options.grid.shape' }).html(i18next.t("app_page.func_options.grid.shape"));

    var grid_shape = c.insert('select').attrs({ class: 'params i18n', id: "Gridded_shape" });

    var d = dialog_content.append('p').attr('class', 'params_section2');
    d.append('span').attrs({ class: 'i18n', 'data-i18n': '[html]app_page.func_options.grid.coloramp' }).html(i18next.t("app_page.func_options.grid.coloramp"));
    var col_pal = d.insert('select').attrs({ 'class': 'params', 'id': 'Gridded_color_pal' });

    ['Blues', 'BuGn', 'BuPu', 'GnBu', 'OrRd', 'PuBu', 'PuBuGn', 'PuRd', 'RdPu', 'YlGn', 'Greens', 'Greys', 'Oranges', 'Purples', 'Reds'].forEach(function (color) {
        col_pal.append("option").text(color).attr("value", color);
    });

    [['app_page.func_options.grid.square', 'Square'], ['app_page.func_options.grid.diamond', 'Diamond'], ['app_page.func_options.grid.hexagon', 'Hexagon']].forEach(function (shape) {
        grid_shape.append("option").text(i18next.t(shape[0])).attrs({ 'value': shape[1], 'data-i18n': '[text]' + shape[0] });
    });

    make_layer_name_button(dialog_content, 'Gridded_output_name');
    make_ok_button(dialog_content, 'Gridded_yes', false);
    section2.selectAll(".params").attr("disabled", true);
}

var fields_griddedMap = {
    fill: function fill(layer) {
        if (!layer) return;

        // let fields = type_col(layer, "number"),
        var fields = getFieldsType('stock', layer),
            field_selec = section2.select("#Gridded_field"),
            output_name = section2.select('#Gridded_output_name'),
            grip_shape = section2.select('#Gridded_shape'),
            ok_button = section2.select('#Gridded_yes');

        fields.forEach(function (field) {
            field_selec.append("option").text(field).attr("value", field);
        });
        field_selec.on("change", function () {
            output_name.attr('value', ["Gridded", this.value, layer].join('_'));
        });
        ok_button.on("click", function () {
            render_Gridded(field_selec.node().value, document.getElementById('Gridded_cellsize').value, grip_shape.node().value, document.getElementById('Gridded_color_pal').value, output_name.node().value);
        });
        output_name.attr('value', ["Gridded", layer].join('_'));
        document.getElementById("Gridded_cellsize").value = get_first_guess_span('grid');
        section2.selectAll(".params").attr("disabled", null);
    },
    unfill: function unfill() {
        var field_selec = document.getElementById("Gridded_field");
        unfillSelectInput(field_selec);
        section2.selectAll(".params").attr("disabled", true);
    }
};

function render_Gridded(field_n, resolution, cell_shape, color_palette, new_user_layer_name) {
    var layer = Object.getOwnPropertyNames(user_data)[0],
        formToSend = new FormData(),
        var_to_send = {},
        res_test = test_maxmin_resolution(resolution);

    if (res_test) {
        var message = res_test === "low" ? i18next.t("app_page.common.error_too_low_resolution") : i18next.t("app_page.common.error_too_high_resolution");
        display_error_during_computation(message);
        return;
    }

    if (current_layers[layer].original_fields.has(field_n)) var_to_send[field_n] = [];else var_to_send[field_n] = user_data[layer].map(function (i) {
        return i[field_n];
    });

    formToSend.append("json", JSON.stringify({
        "topojson": current_layers[layer].key_name,
        "var_name": var_to_send,
        "cellsize": resolution * 1000,
        "grid_shape": cell_shape
    }));
    xhrequest("POST", '/compute/gridded', formToSend, true).then(function (data) {
        var options = { result_layer_on_add: true };
        if (new_user_layer_name.length > 0 && /^\w+$/.test(new_user_layer_name)) {
            options["choosed_name"] = new_user_layer_name;
        }
        var rendered_field = field_n + "_densitykm";
        var n_layer_name = add_layer_topojson(data, options);
        if (!n_layer_name) return;
        var res_data = result_data[n_layer_name],
            nb_ft = res_data.length,
            opt_nb_class = Math.floor(1 + 3.3 * Math.log10(nb_ft)),
            d_values = [];

        for (var i = 0; i < nb_ft; i++) {
            d_values.push(+res_data[i][rendered_field]);
        }

        current_layers[n_layer_name].renderer = "Gridded";
        var disc_result = discretize_to_colors(d_values, "quantiles", opt_nb_class, color_palette),
            rendering_params = {
            nb_class: opt_nb_class,
            type: "quantiles",
            schema: [color_palette],
            breaks: disc_result[2],
            colors: disc_result[3],
            colorsByFeature: disc_result[4],
            renderer: "Gridded",
            rendered_field: rendered_field
        };
        render_choro(n_layer_name, rendering_params);
        handle_legend(n_layer_name);
        switch_accordion_section();
    }, function (error) {
        display_error_during_computation();
        console.log(error);
    });
}

function fillMenu_FlowMap() {
    var dv2 = make_template_functionnality(section2);

    var subtitle = dv2.append('p').attr('class', 'params_section2').style('margin-top', '2px');
    subtitle.append('span').attrs({ class: 'i18n', 'data-i18n': '[html]app_page.func_options.flow.subtitle1' }).html(i18next.t("app_page.func_options.flow.subtitle1"));

    var origin_section = dv2.append('p').attr('class', 'params_section2');
    origin_section.append('span').attrs({ 'class': 'i18n', 'data-i18n': '[html]app_page.func_options.flow.origin_field' }).html(i18next.t('app_page.func_options.flow.origin_field'));
    origin_section.insert('select').attrs({ id: 'FlowMap_field_i', class: 'params' });

    var destination_section = dv2.append('p').attr('class', 'params_section2');
    destination_section.append('span').attrs({ class: 'i18n', 'data-i18n': '[html]app_page.func_options.flow.destination_field' }).html(i18next.t('app_page.func_options.flow.destination_field'));
    destination_section.append('select').attrs({ class: 'params', id: 'FlowMap_field_j' });

    var intensity_section = dv2.append('p').attr('class', 'params_section2');
    intensity_section.append('span').attrs({ class: 'i18n', 'data-i18n': '[html]app_page.func_options.flow.intensity_field' }).html(i18next.t('app_page.func_options.flow.intensity_field'));
    intensity_section.append('select').attrs({ class: 'params', id: 'FlowMap_field_fij' });

    var discretization_section = dv2.append('p').attr('class', 'params_section2');
    discretization_section.append('span').attrs({ class: 'i18n', 'data-i18n': '[html]app_page.func_options.flow.discretization' }).html(i18next.t("app_page.func_options.flow.discretization"));
    var disc_type = discretization_section.insert('select').attrs({ class: 'params i18n', id: "FlowMap_discKind" });

    [["app_page.common.equal_interval", "equal_interval"], ["app_page.common.quantiles", "quantiles"], ["app_page.common.Q6", "Q6"], ["app_page.common.arithmetic_progression", "arithmetic_progression"], ["app_page.common.jenks", "jenks"]].forEach(function (field) {
        disc_type.append("option").text(i18next.t(field[0])).attrs({ "value": field[1], 'data-i18n': '[text]' + field[0] });
    });

    var nb_class_section = dv2.append('p').attr('class', 'params_section2');
    nb_class_section.append('span').attrs({ class: 'i18n', 'data-i18n': '[html]app_page.func_options.flow.nb_class' }).html(i18next.t("app_page.func_options.flow.nb_class"));
    nb_class_section.insert('input').attrs({ type: "number", class: 'params', id: "FlowMap_nbClass", min: 1, max: 33, value: 8 }).style("width", "50px");

    dv2.append('p').attrs({ class: 'params', id: 'FlowMap_discTable' });
    dv2.append('p').attr('class', 'params_section2').insert('span').attrs({ class: 'i18n', 'data-i18n': '[html]app_page.func_options.flow.ref_layer_field' }).html(i18next.t('app_page.func_options.flow.ref_layer_field'));

    var join_field_section = dv2.append('p').attr('class', 'params_section2');
    join_field_section.append('span').attrs({ class: 'i18n', 'data-i18n': '[html]app_page.func_options.flow.join_field' }).html(i18next.t('app_page.func_options.flow.join_field'));
    join_field_section.insert('select').attrs({ class: 'params', id: 'FlowMap_field_join' });

    make_layer_name_button(dv2, "FlowMap_output_name");
    make_ok_button(dv2, 'FlowMap_yes', false);

    d3.selectAll(".params").attr("disabled", true);
}

var fields_FlowMap = {
    fill: function fill(layer) {
        var self = this,
            field_i = section2.select('#FlowMap_field_i'),
            field_j = section2.select('#FlowMap_field_j'),
            field_fij = section2.select('#FlowMap_field_fij'),
            join_field = section2.select('#FlowMap_field_join'),
            nb_class_input = section2.select('#FlowMap_nbClass'),
            disc_type = section2.select('#FlowMap_discKind'),
            ok_button = section2.select('#FlowMap_yes'),
            uo_layer_name = section2.select('#FlowMap_output_name');

        if (joined_dataset.length > 0 && document.getElementById("FlowMap_field_i").options.length == 0) {
            var fields = Object.getOwnPropertyNames(joined_dataset[0][0]);
            fields.forEach(function (field) {
                field_i.append("option").text(field).attr("value", field);
                field_j.append("option").text(field).attr("value", field);
                field_fij.append("option").text(field).attr("value", field);
            });
        }
        if (layer) {
            var ref_fields = Object.getOwnPropertyNames(user_data[layer][0]);

            ref_fields.forEach(function (field) {
                join_field.append("option").text(field).attr("value", field);
            });
        }
        if (layer || joined_dataset.length > 0) {
            section2.selectAll(".params").attr("disabled", null);
            uo_layer_name.attr('value', ["Links", layer].join('_'));
        }
        var values_fij;

        field_fij.on("change", function () {
            var name = this.value,
                nclass = nb_class_input.node().value,
                disc = disc_type.node().value,
                min_size = 0.5,
                max_size = 10;
            values_fij = joined_dataset[0].map(function (obj) {
                return +obj[name];
            });
            make_min_max_tableau(values_fij, nclass, disc, min_size, max_size, "FlowMap_discTable");
        });

        disc_type.on("change", function () {
            var name = field_fij.node().value,
                nclass = nb_class_input.node().value,
                disc = this.value,
                min_size = 0.5,
                max_size = 10;
            if (disc == "Q6") {
                nclass = 6;
                nb_class_input.attr("value", 6);
            }
            make_min_max_tableau(values_fij, nclass, disc, min_size, max_size, "FlowMap_discTable");
        });

        nb_class_input.on("change", function () {
            var name = field_fij.node().value,
                nclass = this.value,
                disc = disc_type.node().value,
                min_size = 0.5,
                max_size = 10;
            make_min_max_tableau(values_fij, nclass, disc, min_size, max_size, "FlowMap_discTable");
        });

        ok_button.on('click', function () {
            render_FlowMap(field_i.node().value, field_j.node().value, field_fij.node().value, join_field.node().value, disc_type.node().value, uo_layer_name.node().value);
        });
    },

    unfill: function unfill() {
        var field_i = document.getElementById('FlowMap_field_i'),
            field_j = document.getElementById('FlowMap_field_j'),
            field_fij = document.getElementById('FlowMap_field_fij'),
            join_field = document.getElementById('FlowMap_field_join');

        for (var i = field_i.childElementCount - 1; i > -1; --i) {
            field_i.removeChild(field_i.children[i]);
            field_j.removeChild(field_j.children[i]);
            field_fij.removeChild(field_fij.children[i]);
        }
        unfillSelectInput(join_field);
        document.getElementById("FlowMap_discTable").innerHTML = "";
        document.getElementById("FlowMap_output_name").value = "";
        section2.selectAll(".params").attr("disabled", true);
    }
};

function render_FlowMap(field_i, field_j, field_fij, name_join_field, disc_type, new_user_layer_name) {
    var ref_layer = Object.getOwnPropertyNames(user_data)[0],
        formToSend = new FormData(),
        join_field_to_send = {};

    var disc_params = fetch_min_max_table_value("FlowMap_discTable"),
        mins = disc_params.mins,
        maxs = disc_params.maxs,
        sizes = disc_params.sizes,
        nb_class = mins.length,
        user_breaks = [].concat(mins, maxs[nb_class - 1]),
        min_size = min_fast(sizes),
        max_size = max_fast(sizes);

    join_field_to_send[name_join_field] = user_data[ref_layer].map(function (obj) {
        return obj[name_join_field];
    });

    formToSend.append("json", JSON.stringify({
        "topojson": current_layers[ref_layer].key_name,
        "csv_table": JSON.stringify(joined_dataset[0]),
        "field_i": field_i,
        "field_j": field_j,
        "field_fij": field_fij,
        "join_field": join_field_to_send
    }));

    xhrequest("POST", '/compute/links', formToSend, true).then(function (data) {
        // FIXME : should use the user selected new name if any
        var options = { result_layer_on_add: true };
        if (new_user_layer_name.length > 0 && /^\w+$/.test(new_user_layer_name)) {
            options["choosed_name"] = new_user_layer_name;
        }

        var new_layer_name = add_layer_topojson(data, options);
        if (!new_layer_name) return;
        var layer_to_render = map.select("#" + _app.layer_to_id.get(new_layer_name)).selectAll("path"),
            fij_field_name = field_fij,
            fij_values = result_data[new_layer_name].map(function (obj) {
            return +obj[fij_field_name];
        }),
            nb_ft = fij_values.length,
            serie = new geostats(fij_values);

        if (user_breaks[0] < serie.min()) user_breaks[0] = serie.min();

        if (user_breaks[nb_class] > serie.max()) user_breaks[nb_class] = serie.max();

        serie.setClassManually(user_breaks);

        current_layers[new_layer_name].fixed_stroke = true;
        current_layers[new_layer_name].renderer = "Links";
        current_layers[new_layer_name].breaks = [];
        current_layers[new_layer_name].linksbyId = [];
        current_layers[new_layer_name].size = [min_size, max_size];
        current_layers[new_layer_name].rendered_field = fij_field_name;
        current_layers[new_layer_name].ref_layer_name = ref_layer;
        current_layers[new_layer_name].min_display = 0;

        var links_byId = current_layers[new_layer_name].linksbyId;

        for (var i = 0; i < nb_ft; ++i) {
            var val = +fij_values[i];
            links_byId.push([i, val, sizes[serie.getClass(val)]]);
        }

        for (var _i5 = 0; _i5 < nb_class; ++_i5) {
            current_layers[new_layer_name].breaks.push([[user_breaks[_i5], user_breaks[_i5 + 1]], sizes[_i5]]);
        }layer_to_render.style('fill-opacity', 0).style('stroke-opacity', 0.8).style("stroke-width", function (d, i) {
            return links_byId[i][2];
        });
        switch_accordion_section();
        handle_legend(new_layer_name);
    }, function (error) {
        display_error_during_computation();
        console.log(error);
    });
};

var render_label = function render_label(layer, rendering_params, options) {
    var label_field = rendering_params.label_field;
    var txt_color = rendering_params.color;
    var selected_font = rendering_params.font;
    var font_size = rendering_params.ref_font_size + "px";
    var new_layer_data = [];
    var layer_to_add = rendering_params.uo_layer_name && rendering_params.uo_layer_name.length > 0 ? check_layer_name(rendering_params.uo_layer_name) : check_layer_name("Labels_" + layer);
    var layer_id = encodeId(layer_to_add);
    _app.layer_to_id.set(layer_to_add, layer_id);
    _app.id_to_layer.set(layer_id, layer_to_add);
    var nb_ft = void 0;
    if (options && options.data) {
        new_layer_data = options.data;
        nb_ft = new_layer_data.length;
    } else if (layer) {
        var type_ft_ref = current_layers[layer].symbol || "path";
        var ref_selection = document.getElementById(_app.layer_to_id.get(layer)).getElementsByTagName(type_ft_ref);

        nb_ft = ref_selection.length;
        for (var i = 0; i < nb_ft; i++) {
            var ft = ref_selection[i].__data__;
            var coords = void 0;
            if (ft.geometry.type.indexOf('Multi') == -1) {
                coords = d3.geoCentroid(ft.geometry);
            } else {
                var areas = [];
                for (var j = 0; j < ft.geometry.coordinates.length; j++) {
                    areas.push(path.area({
                        type: ft.geometry.type,
                        coordinates: [ft.geometry.coordinates[j]]
                    }));
                }
                var ix_max = areas.indexOf(max_fast(areas));
                coords = d3.geoCentroid({ type: ft.geometry.type, coordinates: [ft.geometry.coordinates[ix_max]] });
            }

            new_layer_data.push({
                id: i,
                type: "Feature",
                properties: { label: ft.properties[label_field], x: coords[0], y: coords[1] },
                geometry: { type: "Point", coordinates: coords }
            });
            // new_layer_data.push({label: ft.properties[label_field], coords: d3.geoCentroid(ft.geometry)});
        }
    }
    var context_menu = new ContextMenu(),
        getItems = function getItems(self_parent) {
        return [{ "name": i18next.t("app_page.common.edit_style"), "action": function action() {
                make_style_box_indiv_label(self_parent);
            } }, { "name": i18next.t("app_page.common.delete"), "action": function action() {
                self_parent.style.display = "none";
            } }];
    };

    map.insert("g", '.legend').attrs({ id: layer_id, class: "layer result_layer" }).selectAll("text").data(new_layer_data).enter().insert("text").attrs(function (d, i) {
        var centroid = path.centroid(d.geometry);
        return {
            "id": "Feature_" + i,
            "x": centroid[0],
            "y": centroid[1],
            "alignment-baseline": "middle",
            "text-anchor": "middle"
        };
    }).styles({ "font-size": font_size, "font-family": selected_font, fill: txt_color }).text(function (d) {
        return d.properties.label;
    }).on("mouseover", function () {
        this.style.cursor = "pointer";
    }).on("mouseout", function () {
        this.style.cursor = "initial";
    }).on("dblclick contextmenu", function () {
        context_menu.showMenu(d3.event, document.querySelector("body"), getItems(this));
    }).call(drag_elem_geo);
    create_li_layer_elem(layer_to_add, nb_ft, ["Point", "label"], "result");
    current_layers[layer_to_add] = {
        "n_features": new_layer_data.length,
        "renderer": "Label",
        "symbol": "text",
        "fill_color": txt_color,
        "rendered_field": label_field,
        "is_result": true,
        "ref_layer_name": layer,
        "default_size": font_size,
        "default_font": selected_font
    };
    zoom_without_redraw();
    return layer_to_add;
};
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var drag_elem_geo = d3.drag().subject(function () {
    var t = d3.select(this);
    return {
        x: t.attr("x"), y: t.attr("y"),
        map_locked: map_div.select("#hand_button").classed("locked") ? true : false
    };
}).on("start", function () {
    d3.event.sourceEvent.stopPropagation();
    d3.event.sourceEvent.preventDefault();
    handle_click_hand("lock");
}).on("end", function () {
    if (d3.event.subject && !d3.event.subject.map_locked) handle_click_hand("unlock");
}).on("drag", function () {
    d3.select(this).attr("x", d3.event.x).attr("y", d3.event.y);
});

function setSelected(selectNode, value) {
    selectNode.value = value;
    selectNode.dispatchEvent(new Event('change'));
}

// Function to be called after clicking on "render" in order to close the section 2
// and to have the section 3 opened
function switch_accordion_section(id_elem) {
    id_elem = id_elem || 'btn_s3';
    document.getElementById(id_elem).dispatchEvent(new MouseEvent("click"));
}

function path_to_geojson(layer_name) {
    var id_layer = ["#", _app.layer_to_id.get(layer_name)].join('');
    var result_geojson = [];
    d3.select(id_layer).selectAll("path").each(function (d, i) {
        result_geojson.push({
            type: "Feature",
            id: i,
            properties: d.properties,
            geometry: { type: d.type, coordinates: d.coordinates }
        });
    });
    return JSON.stringify({
        type: "FeatureCollection",
        crs: { type: "name", properties: { name: "urn:ogc:def:crs:OGC:1.3:CRS84" } },
        features: result_geojson
    });
}

function display_error_during_computation(msg) {
    msg = msg ? ["<br><i>", i18next.t("app_page.common.details"), ":</i> ", msg].join("") : "";
    swal({ title: i18next.t("app_page.common.error") + "!",
        text: i18next.t("app_page.common.error_message") + msg,
        customClass: 'swal2_custom',
        type: "error",
        allowOutsideClick: false });
}

/**
* Perform an asynchronous request
*
* @param {String} method - the method like "GET" or "POST"
* @param {String} url - the targeted url
* @param {FormData} data - Optionnal, the data to be send
* @return {Promise} response
*/
function request_data(method, url, data) {
    return new Promise(function (resolve, reject) {
        var request = new XMLHttpRequest();
        request.open(method, url, true);
        request.onload = resolve;
        request.onerror = reject;
        request.send(data);
    });
}

/**
* Perform an asynchronous request
*
* @param {String} method - the method like "GET" or "POST"
* @param {String} url - the targeted url
* @param {FormData} data - Optionnal, the data to be send
* @param {Boolean} wainting_message - Optionnal, whether to display or not a waiting message while the request is proceeded
* @return {Promise} response
*/
function xhrequest(method, url, data, waiting_message) {
    if (waiting_message) {
        document.getElementById("overlay").style.display = "";
    }
    return new Promise(function (resolve, reject) {
        var request = new XMLHttpRequest();
        _app.xhr_to_cancel = request;
        request.open(method, url, true);
        request.onload = function (resp) {
            resolve(resp.target.responseText);
            _app.xhr_to_cancel = undefined;
            if (waiting_message) {
                document.getElementById("overlay").style.display = "none";
            }
        };
        request.onerror = function (err) {
            reject(err);
            _app.xhr_to_cancel = undefined;
            if (waiting_message) {
                document.getElementById("overlay").style.display = "none";
            }
        };
        request.send(data);
    });
}

function make_content_summary(serie) {
    var precision = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 6;

    return [i18next.t("app_page.stat_summary.population"), " : ", round_value(serie.pop(), precision), "<br>", i18next.t("app_page.stat_summary.min"), " : ", round_value(serie.min(), precision), " | ", i18next.t("app_page.stat_summary.max"), " : ", round_value(serie.max(), precision), "<br>", i18next.t("app_page.stat_summary.mean"), " : ", round_value(serie.mean(), precision), "<br>", i18next.t("app_page.stat_summary.median"), " : ", round_value(serie.median(), precision), "<br>", i18next.t("app_page.stat_summary.variance"), " : ", round_value(serie.variance(), precision), "<br>", i18next.t("app_page.stat_summary.stddev"), " : ", round_value(serie.stddev(), precision), "<br>", i18next.t("app_page.stat_summary.cov"), " : ", round_value(serie.cov(), precision)].join('');
}

function copy_layer(ref_layer, new_name, type_result, fields_to_copy) {
    var id_new_layer = encodeId(new_name),
        id_ref_layer = _app.layer_to_id.get(ref_layer),
        node_ref_layer = svg_map.querySelector("#" + id_ref_layer);
    _app.layer_to_id.set(new_name, id_new_layer);
    _app.id_to_layer.set(id_new_layer, new_name);
    svg_map.appendChild(node_ref_layer.cloneNode(true));
    svg_map.lastChild.setAttribute("id", id_new_layer);
    var node_new_layer = document.getElementById(id_new_layer);
    svg_map.insertBefore(node_new_layer, svg_map.querySelector('.legend'));
    node_new_layer.setAttribute("class", "result_layer layer");
    result_data[new_name] = [];
    current_layers[new_name] = { n_features: current_layers[ref_layer].n_features,
        type: current_layers[ref_layer].type,
        ref_layer_name: ref_layer };
    if (current_layers[ref_layer].pointRadius) current_layers[new_name].pointRadius = current_layers[ref_layer].pointRadius;
    var selec_src = node_ref_layer.getElementsByTagName("path"),
        selec_dest = node_new_layer.getElementsByTagName("path");
    if (!fields_to_copy) {
        for (var i = 0; i < selec_src.length; i++) {
            selec_dest[i].__data__ = selec_src[i].__data__;
            result_data[new_name].push(selec_dest[i].__data__.properties);
        }
    } else {
        for (var _i = 0; _i < selec_src.length; _i++) {
            selec_dest[_i].__data__ = { type: "Feature", properties: {}, geometry: cloneObj(selec_src[_i].__data__.geometry) };
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = fields_to_copy[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var f = _step.value;

                    selec_dest[_i].__data__.properties[f] = selec_src[_i].__data__.properties[f];
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            result_data[new_name].push(selec_dest[_i].__data__.properties);
        }
    }
    node_new_layer.style.visibility = "";
    create_li_layer_elem(new_name, current_layers[new_name].n_features, [current_layers[new_name].type, type_result], "result");
}

/**
* Send a geo result layer computed client-side (currently only discontinuities)
* to the server in order to use it as other result layers computed server side
* @param {string} layer_name
* @param {string} url
*/
function send_layer_server(layer_name, url) {
    var formToSend = new FormData();
    var JSON_layer = path_to_geojson(layer_name);
    formToSend.append("geojson", JSON_layer);
    formToSend.append("layer_name", layer_name);
    xhrequest("POST", url, formToSend, false).then(function (e) {
        var key = JSON.parse(e).key;
        current_layers[layer_name].key_name = key;
    }).catch(function (err) {
        display_error_during_computation();
        console.log(err);
    });
}

// Function returning the name of all current layers (excepted the sample layers used as layout)
function get_other_layer_names() {
    var other_layers = Object.getOwnPropertyNames(current_layers),
        tmp_idx = null;

    tmp_idx = other_layers.indexOf("Graticule");
    if (tmp_idx > -1) other_layers.splice(tmp_idx, 1);

    tmp_idx = other_layers.indexOf("World");
    if (tmp_idx > -1) other_layers.splice(tmp_idx, 1);

    tmp_idx = other_layers.indexOf("Sphere");
    if (tmp_idx > -1) other_layers.splice(tmp_idx, 1);

    return other_layers;
}
/**
* function triggered in order to add a new layer
* in the "layer manager" (with appropriates icons regarding to its type, etc.)
*
*/
function create_li_layer_elem(layer_name, nb_ft, type_geom, type_layer) {
    var _list_display_name = get_display_name_on_layer_list(layer_name),
        layer_id = encodeId(layer_name),
        layers_listed = layer_list.node(),
        li = document.createElement("li");

    li.setAttribute("layer_name", layer_name);
    if (type_layer == "result") {
        li.setAttribute("class", ["sortable_result ", layer_id].join(''));
        // li.setAttribute("layer-tooltip",
        //         ["<b>", layer_name, "</b> - ", type_geom[0] ," - ", nb_ft, " features"].join(''));
        li.innerHTML = [_list_display_name, '<div class="layer_buttons">', button_trash, sys_run_button_t2, button_zoom_fit, button_table, eye_open0, button_legend, button_result_type.get(type_geom[1]), "</div> "].join('');
    } else if (type_layer == "sample") {
        li.setAttribute("class", ["sortable ", layer_id].join(''));
        // li.setAttribute("layer-tooltip",
        //         ["<b>", layer_name, "</b> - Sample layout layer"].join(''));
        li.innerHTML = [_list_display_name, '<div class="layer_buttons">', button_trash, sys_run_button_t2, button_zoom_fit, button_table, eye_open0, button_type.get(type_geom), "</div> "].join('');
    }
    layers_listed.insertBefore(li, layers_listed.childNodes[0]);
    binds_layers_buttons(layer_name);
}

var type_col = function type_col(layer_name, target) {
    var skip_if_empty_values = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    // Function returning an object like {"field1": "field_type", "field2": "field_type"},
    //  for the fields of the selected layer.
    // If target is set to "number" it should return an array containing only the name of the numerical fields
    // ------------------- "string" ---------------------------------------------------------non-numerial ----
    var table = user_data.hasOwnProperty(layer_name) ? user_data[layer_name] : result_data.hasOwnProperty(layer_name) ? result_data[layer_name] : joined_dataset[0],
        fields = Object.getOwnPropertyNames(table[0]),
        nb_features = table.length,
        deepth_test = 100 < nb_features ? 100 : nb_features - 1,
        result = {},
        field = undefined,
        tmp_type = undefined;
    for (var j = 0, len = fields.length; j < len; ++j) {
        field = fields[j];
        result[field] = [];
        for (var i = 0; i < deepth_test; ++i) {
            tmp_type = _typeof(table[i][field]);
            if (tmp_type == "string" && table[i][field].length == 0) tmp_type = "empty";else if (tmp_type === "string" && !isNaN(Number(table[i][field]))) tmp_type = "number";else if (tmp_type === "object" && isFinite(table[i][field])) tmp_type = "empty";
            result[fields[j]].push(tmp_type);
        }
    }

    for (var _j = 0, _len = fields.length; _j < _len; ++_j) {
        field = fields[_j];
        if (result[field].every(function (ft) {
            return ft === "number" || ft === "empty";
        }) && result[field].indexOf("number") > -1) result[field] = "number";else result[field] = "string";
    }
    if (target) {
        var res = [];
        for (var k in result) {
            if (result[k] === target && k != "_uid") res.push(k);
        }return res;
    } else return result;
};

var type_col2 = function type_col2(table, field) {
    var skip_if_empty_values = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    // Function returning an object like {"field1": "field_type", "field2": "field_type"},
    //  for the fields of the selected layer.
    var tmp_type = undefined,
        result = [],
        nb_features = table.length,
        deepth_test = nb_features,

    // deepth_test = 100 < nb_features ? 100 : nb_features - 1,
    tmp = {};
    if (!field) {
        var fields = Object.getOwnPropertyNames(table[0]).filter(function (v) {
            return v != '_uid';
        });
        field = undefined;
    } else {
        var fields = [field];
        field = undefined;
    }
    var dups = {};
    for (var j = 0, len = fields.length; j < len; ++j) {
        field = fields[j];
        tmp[field] = [];
        dups[field] = false;
        var h = {};
        for (var i = 0; i < deepth_test; ++i) {
            var val = table[i][field];
            if (h[val]) dups[field] = true;else h[val] = true;
            tmp_type = typeof val === "undefined" ? "undefined" : _typeof(val);
            if (tmp_type === "object" && isFinite(val)) {
                tmp_type = "empty";
            } else if (tmp_type === "string" && val.length == 0) {
                tmp_type = "empty";
            } else if (tmp_type === "string" && !isNaN(Number(val)) || tmp_type === 'number') {
                var _val = Number(table[i][field]);
                tmp_type = (_val | 0) == val ? "stock" : "ratio";
            }
            tmp[fields[j]].push(tmp_type);
        }
    }
    for (var _j2 = 0, _len2 = fields.length; _j2 < _len2; ++_j2) {
        field = fields[_j2];
        var has_dup = dups[field];
        if (tmp[field].every(function (ft) {
            return ft === "stock" || ft === "empty";
        }) && tmp[field].indexOf("stock") > -1) result.push({ name: field, type: "stock", has_duplicate: has_dup });else if (tmp[field].every(function (ft) {
            return ft === "string" || ft === "empty";
        }) && tmp[field].indexOf("string") > -1) result.push({ name: field, type: "category", has_duplicate: has_dup });else if (tmp[field].every(function (ft) {
            return ft === "ratio" || ft === "stock" || ft === "empty";
        }) && tmp[field].indexOf("ratio") > -1) result.push({ name: field, type: "ratio" });else result.push({ name: field, type: "unknown", has_duplicate: has_dup });
    }
    return result;
};

function getFieldsType(type, layer_name, ref) {
    if (!layer_name && !ref) return;
    ref = ref || current_layers[layer_name].fields_type;
    return ref.filter(function (d) {
        return d.type === type;
    }).map(function (d) {
        return d.name;
    });
}

function make_box_type_fields(layer_name) {
    var modal_box = make_dialog_container("box_type_fields", i18next.t("app_page.box_type_fields.title"), "dialog");
    d3.select('#box_type_fields').select('modal-dialog').style('width', '400px');
    var newbox = d3.select("#box_type_fields").select(".modal-body"),
        tmp = type_col2(user_data[layer_name]),
        fields_type = current_layers[layer_name].fields_type,
        f = fields_type.map(function (v) {
        return v.name;
    }),
        ref_type = ['id', 'stock', 'ratio', 'category', 'unknown'];

    var deferred = Q.defer(),
        container = document.getElementById("box_type_fields");

    var clean_up_box = function clean_up_box() {
        container.remove();
        overlay_under_modal.hide();
        document.removeEventListener('keydown', helper_esc_key_twbs);
    };

    if (f.length === 0) {
        // If the user dont have already selected the type :
        fields_type = tmp.slice();
        container.querySelector('.btn_cancel').remove(); // Disabled cancel button to force the user to choose
        var _onclose = function _onclose() {
            // Or use the default values if he use the X  close button
            current_layers[layer_name].fields_type = tmp.slice();
            getAvailablesFunctionnalities(layer_name);
            deferred.resolve(false);
            clean_up_box();
        };
        container.querySelector("#xclose").onclick = _onclose;
    } else if (tmp.length > fields_type.length) {
        // There is already types selected but new fields where added :
        tmp.forEach(function (d) {
            if (f.indexOf(d.name) === -1) fields_type.push(d);
        });
        container.querySelector('.btn_cancel').remove(); // Disabled cancel button to force the user to choose
        var _onclose2 = function _onclose2() {
            // Or use the default values if he use the X  close button
            current_layers[layer_name].fields_type = tmp.slice();
            getAvailablesFunctionnalities(layer_name);
            deferred.resolve(false);
            clean_up_box();
        };
        container.querySelector("#xclose").onclick = _onclose2;
    } else {
        // There is already types selected and no new fields (so this is a modification) :
        // Use the previous values if the user close the window without confirmation (cancel or X button)
        var _onclose3 = function _onclose3() {
            current_layers[layer_name].fields_type = fields_type;
            deferred.resolve(false);
            clean_up_box();
        };
        container.querySelector(".btn_cancel").onclick = _onclose3;
        container.querySelector("#xclose").onclick = _onclose3;
    }

    // Fetch and store the selected values when 'Ok' button is clicked :
    container.querySelector(".btn_ok").onclick = function () {
        var r = [];
        Array.prototype.forEach.call(document.getElementById('fields_select').getElementsByTagName('p'), function (elem) {
            r.push({ name: elem.childNodes[0].innerHTML.trim(), type: elem.childNodes[1].value });
        });
        deferred.resolve(true);
        current_layers[layer_name].fields_type = r.slice();
        getAvailablesFunctionnalities(layer_name);
        if (window.fields_handler) {
            fields_handler.unfill();
            fields_handler.fill(layer_name);
        }
        clean_up_box();
    };
    function helper_esc_key_twbs(evt) {
        evt = evt || window.event;
        var isEscape = "key" in evt ? evt.key == "Escape" || evt.key == "Esc" : evt.keyCode == 27;
        if (isEscape) {
            evt.stopPropagation();
            current_layers[layer_name].fields_type = tmp.slice();
            getAvailablesFunctionnalities(layer_name);
            deferred.resolve(false);
            clean_up_box();
        }
    }
    document.addEventListener('keydown', helper_esc_key_twbs);
    document.getElementById('btn_type_fields').removeAttribute('disabled');

    newbox.append("h3").html(i18next.t("app_page.box_type_fields.message_invite"));

    var box_select = newbox.append("div").attr("id", "fields_select");

    var a = box_select.selectAll("p").data(fields_type).enter().append('p').style('margin', '15px');

    box_select.selectAll("p").insert('span').html(function (d) {
        return d.name;
    });

    box_select.selectAll('p').insert('select').style('float', 'right').selectAll('option').data(ref_type).enter().insert('option').attr('value', function (d) {
        return d;
    }).text(function (d) {
        return i18next.t('app_page.box_type_fields.' + d);
    }).exit();

    box_select.selectAll('select').each(function (d) {
        this.value = d.type;
    });

    for (var i = 0; i < fields_type.length; i++) {
        if (fields_type[i].type == "category" || fields_type[i].not_number) {
            box_select.node().childNodes[i].childNodes[1].options.remove(2);
            box_select.node().childNodes[i].childNodes[1].options.remove(1);
        }
        if (fields_type[i].has_duplicate) {
            box_select.node().childNodes[i].childNodes[1].options.remove(0);
        }
    }
    overlay_under_modal.display();
    return deferred.promise;
};

function getAvailablesFunctionnalities(layer_name) {
    var fields_stock = getFieldsType('stock', layer_name),
        fields_ratio = getFieldsType('ratio', layer_name),
        fields_categ = getFieldsType('category', layer_name),
        section = document.getElementById('section2_pre');

    if (current_layers[layer_name].type == "Line") {
        // Layer type is Line
        var elems = section.querySelectorAll('#button_grid, #button_discont, #button_smooth, #button_cartogram, #button_typosymbol, #button_flow');
        for (var i = 0, len_i = elems.length; i < len_i; i++) {
            elems[i].style.filter = "grayscale(100%)";
        }
        var func_stock = section.querySelectorAll('#button_prop'),
            func_ratio = section.querySelectorAll('#button_choro, #button_choroprop'),
            func_categ = section.querySelectorAll('#button_typo, #button_proptypo');
    } else if (current_layers[layer_name].type == "Point") {
        // layer type is Point
        var _elems = section.querySelectorAll('#button_grid, #button_discont, #button_cartogram');
        for (var _i2 = 0, _len_i = _elems.length; _i2 < _len_i; _i2++) {
            _elems[_i2].style.filter = "grayscale(100%)";
        }
        var func_stock = section.querySelectorAll('#button_smooth, #button_prop'),
            func_ratio = section.querySelectorAll('#button_choro, #button_choroprop'),
            func_categ = section.querySelectorAll('#button_typo, #button_proptypo, #button_typosymbol');
    } else {
        // Layer type is Polygon
        var func_stock = section.querySelectorAll('#button_smooth, #button_prop, #button_grid, #button_cartogram, #button_discont'),
            func_ratio = section.querySelectorAll('#button_choro, #button_choroprop, #button_discont'),
            func_categ = section.querySelectorAll('#button_typo, #button_proptypo, #button_typosymbol');
    }
    if (fields_stock.length === 0) {
        Array.prototype.forEach.call(func_stock, function (d) {
            return d.style.filter = "grayscale(100%)";
        });
    } else {
        Array.prototype.forEach.call(func_stock, function (d) {
            return d.style.filter = "invert(0%) saturate(100%)";
        });
    }
    if (fields_ratio.length === 0) {
        Array.prototype.forEach.call(func_ratio, function (d) {
            return d.style.filter = "grayscale(100%)";
        });
    } else {
        Array.prototype.forEach.call(func_ratio, function (d) {
            return d.style.filter = "invert(0%) saturate(100%)";
        });
    }
    if (fields_categ.length === 0) {
        Array.prototype.forEach.call(func_categ, function (d) {
            return d.style.filter = "grayscale(100%)";
        });
    } else {
        Array.prototype.forEach.call(func_categ, function (d) {
            return d.style.filter = "invert(0%) saturate(100%)";
        });
    }
    if (fields_stock.length === 0 && fields_ratio.length === 0) {
        document.getElementById('button_choroprop').style.filter = "grayscale(100%)";
    } else {
        document.getElementById('button_choroprop').style.filter = "invert(0%) saturate(100%)";
    }
    if (fields_stock.length === 0 && fields_categ.length === 0) {
        document.getElementById('button_proptypo').style.filter = "grayscale(100%)";
    } else {
        document.getElementById('button_proptypo').style.fiter = 'invert(0%) saturate(100%)';
    }
}

var clickLinkFromDataUrl = function clickLinkFromDataUrl(url, filename) {
    return fetch(url).then(function (res) {
        return res.blob();
    }).then(function (blob) {
        var blobUrl = URL.createObjectURL(blob);
        var dlAnchorElem = document.createElement('a');
        dlAnchorElem.style.display = 'none';
        dlAnchorElem.setAttribute("href", blobUrl);
        dlAnchorElem.setAttribute("download", filename);
        document.body.appendChild(dlAnchorElem);
        dlAnchorElem.click();
        dlAnchorElem.remove();
        URL.revokeObjectURL(blobUrl);
    });
};

var helper_esc_key_twbs_cb = function helper_esc_key_twbs_cb(evt, callback) {
    evt = evt || window.event;
    var isEscape = "key" in evt ? evt.key == "Escape" || evt.key == "Esc" : evt.keyCode == 27;
    if (isEscape) {
        evt.stopPropagation();
        if (callback) {
            callback();
        }
    }
};
"use strict";

/**
* Function computing the min of an array of values (tking care of empty/null/undefined slot)
*  - no fancy functionnalities here (it doesn't add anything comparing to Math.min.apply()
*    or d3.min() except a little speed-up)
*
* @param {Array} arr
* @return {Number} min
*/

function min_fast(arr) {
    var min = arr[0];
    for (var i = 1, len_i = arr.length; i < len_i; ++i) {
        var val = +arr[i];
        if (val && val < min) min = val;
    }
    return min;
}

/**
* Return the maximum value of an array of numbers
*
* @param {Array} arr - the array of numbers
* @return {Number} max
*/
function max_fast(arr) {
    var max = arr[0];
    for (var i = 1, len_i = arr.length; i < len_i; ++i) {
        var val = +arr[i];
        if (val > max) max = arr[i];
    }
    return max;
}

/**
* Test an array of numbers for negative values
*
* @param {Array} arr - the array of numbers
* @return {Bool} result - True or False, whether it contains negatives values or not
*/
function has_negative(arr) {
    for (var i = 0; i < arr.length; ++i) {
        if (+arr[i] < 0) return true;
    }return false;
}

/**
* @param {Array} arr - The array to test
* @return {Boolean} result - True or False, according to whether it contains empty values or not
*/
var contains_empty_val = function contains_empty_val(arr) {
    for (var i = arr.length - 1; i > -1; --i) {
        if (arr[i] == null) return true;else if (isNaN(+arr[i])) return true;
    }return false;
};

/**
* @param {Array} arr - The array to test
* @return {Boolean} result - True or False, according to whether it contains duplicate or not
*/
function has_duplicate(arr) {
    var h = {},
        len_arr = arr.length;
    for (var i = 0; i < len_arr; i++) {
        if (h[arr[i]]) return true;else h[arr[i]] = true;
    }
    return false;
}

/**
* Round a given value with the given precision
*
* @param {Number} val - The value to be rounded.
* @param {Number} precision - The wanted precision.
* @return {Number} value - The rounded value.
*/
var round_value = function round_value(val, nb) {
    if (nb == undefined) return val;
    var dec_mult = +["1", Array(Math.abs(nb)).fill("0").join('')].join('');
    return nb >= 0 ? Math.round(+val * dec_mult) / dec_mult : Math.round(+val / dec_mult) * dec_mult;
};

function get_nb_decimals(nb) {
    var tmp = nb.toString().split('.');
    return tmp.length < 2 ? 0 : tmp[1].length;
}

function get_nb_left_separator(nb) {
    var tmp = nb.toString().split('.');
    return tmp[0].length;
}

/**
* Get the decimal separator in user's locale.
* and compute the number of item in each bin.
*
* @return {String} separator - The decimal separator (dot or comma)
*/
function getDecimalSeparator() {
    return 1.1.toLocaleString().substr(1, 1);
}

var get_precision_axis = function get_precision_axis(serie_min, serie_max, precision) {
    var range_serie = serie_max - serie_min;
    if (serie_max > 1 && range_serie > 100) {
        return ".0f";
    } else if (range_serie > 10) {
        if (precision == 0) {
            return ".0f";
        }
        return ".1f";
    } else if (range_serie > 1) {
        if (precision < 2) {
            return ".1f";
        }
        return ".2f";
    } else if (range_serie > 0.1) {
        return ".3f";
    } else if (range_serie > 0.01) {
        return ".4f";
    } else if (range_serie > 0.001) {
        return ".5f";
    } else if (range_serie > 0.0001) {
        return ".6f";
    } else if (range_serie > 0.00001) {
        return ".7f";
    } else {
        return ".8f";
    }
};

var PropSizer = function PropSizer(fixed_value, fixed_size, type_symbol) {
    var _this = this;

    this.fixed_value = fixed_value;
    var sqrt = Math.sqrt,
        abs = Math.abs,
        pi = Math.PI;
    if (type_symbol === "circle") {
        this.smax = fixed_size * fixed_size * pi;
        this.scale = function (val) {
            return sqrt(abs(val) * _this.smax / _this.fixed_value) / pi;
        };
        this.get_value = function (size) {
            return Math.pow(size * pi, 2) / _this.smax * _this.fixed_value;
        };
    } else if (type_symbol === "line") {
        this.smax = fixed_size;
        this.scale = function (val) {
            return abs(val) * _this.smax / _this.fixed_value;
        };
        this.get_value = function (size) {
            return size / _this.smax * _this.fixed_value;
        };
    } else {
        this.smax = fixed_size * fixed_size;
        this.scale = function (val) {
            return sqrt(abs(val) * _this.smax / _this.fixed_value);
        };
        this.get_value = function (size) {
            return Math.pow(size, 2) / _this.smax * _this.fixed_value;
        };
    }
};

function prop_sizer3_e(arr, fixed_value, fixed_size, type_symbol) {
    var pi = Math.PI,
        abs = Math.abs,
        sqrt = Math.sqrt,
        arr_len = arr.length,
        res = [];

    if (!fixed_value || fixed_value == 0) fixed_value = max_fast(arr);

    if (type_symbol == "circle") {
        var smax = fixed_size * fixed_size * pi;
        var t = smax / fixed_value;
        for (var i = 0; i < arr_len; ++i) {
            res.push(sqrt(abs(arr[i]) * t) / pi);
        }
    } else if (type_symbol == "line") {
        var _t = fixed_size / fixed_value;
        for (var _i = 0; _i < arr_len; ++_i) {
            res.push(abs(arr[_i]) * _t);
        }
    } else {
        var _smax = fixed_size * fixed_size;
        var _t2 = _smax / fixed_value;
        for (var _i2 = 0; _i2 < arr_len; ++_i2) {
            res.push(sqrt(abs(arr[_i2]) * _t2));
        }
    }
    return res;
}

function getOptNbClass(len_serie) {
    return Math.floor(1 + 3.3 * Math.log10(len_serie));
}

/**
* Compute breaks according to "Q6" methods
* and compute the number of item in each bin.
*
* @param {Array} serie - An array of ordered values.
* @param {Number} precision - An integer value decribing the precision of the serie.
* @return {Object} summary - Object containing the breaks and the stock in each class.
*/
function getBreaksQ6(serie) {
    var precision = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

    var breaks = [],
        tmp = 0,
        j = undefined,
        len_serie = serie.length,
        stock_class = [],
        q6_class = [1, 0.05 * len_serie, 0.275 * len_serie, 0.5 * len_serie, 0.725 * len_serie, 0.95 * len_serie, len_serie];
    for (var i = 0; i < 7; ++i) {
        j = Math.round(q6_class[i]) - 1;
        breaks.push(+serie[j]);
        stock_class.push(j - tmp);
        tmp = j;
    }
    stock_class.shift();
    if (breaks[0] == breaks[1]) {
        // breaks[1] = breaks[0] + (breaks[2] - breaks[1]) / 2;
        breaks[1] = (+serie[1] + breaks[0]) / 2;
    }
    if (breaks[6] == breaks[5]) {
        breaks[5] = serie[len_serie - 2];
        // breaks[5] = breaks[4] + (breaks[5] - breaks[4]) / 2;
    }
    if (precision != null) {
        breaks = breaks.map(function (val) {
            return round_value(val, precision);
        });
    }
    return {
        breaks: breaks,
        stock_class: stock_class
    };
}

function getBreaksS5(serie) {
    var precision = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

    var min = serie.min(),
        max = serie.max(),
        mean = serie.mean(),
        std_dev = serie.stddev(),
        range = serie.max() - serie.min(),
        range_left = mean - min,
        range_right = max - mean;

    var ref = Math.max(range_left, range_right);
    var class_range = ref / 2.5;
    // var breaks = [
    //   [mean - (class_range * 2.5), mean - (class_range * 1.5)]
    //   [mean - (class_range * 1.5), mean - (class_range * 0.5)],
    //   [mean - (class_range * 0.5), mean + (class_range * 0.5)],
    //   [mean + (class_range * 0.5), mean + (class_range * 1.5)],
    //   [mean + (class_range * 1.5), mean + (class_range * 2.5)]
    // ];
    var breaks = [mean - class_range * 2.5, mean - class_range * 1.5, mean - class_range * 0.5, mean + class_range * 0.5, mean + class_range * 1.5, mean + class_range * 2.5];
    var values = serie.sorted();
    var stock_class = [0, 0, 0, 0, 0];
    for (var i = 0, len_i = values.length; i < len_i; ++i) {
        var val = values[i];
        if (val <= breaks[1]) {
            stock_class[0] = stock_class[0] + 1;
        } else if (val <= breaks[2]) {
            stock_class[1] = stock_class[1] + 1;
        } else if (val <= breaks[3]) {
            stock_class[2] = stock_class[2] + 1;
        } else if (val <= breaks[4]) {
            stock_class[3] = stock_class[3] + 1;
        } else if (val <= breaks[5]) {
            stock_class[4] = stock_class[4] + 1;
        }
    }

    return {
        breaks: breaks,
        stock_class: stock_class
    };
}

function getBinsCount(_values) {
    var bins = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 16;

    _values = _values.filter(function (a) {
        return a;
    }).sort(function (a, b) {
        return a - b;
    });
    var nb_ft = _values.length,
        mean = undefined,
        stddev = undefined,
        min = _values[0],
        max = _values[nb_ft - 1],
        extend = max - min,
        bin_size = extend / bins,
        counts = new Array(bins),
        break_values = [min],
        sum = 0,
        ix_med = (nb_ft + 1) / 2;

    for (var i = 0; i < bins; i++) {
        break_values.push(break_values[i] + bin_size);
    }
    for (var _i3 = 1, j = 0; _i3 < nb_ft; _i3++) {
        var class_max = break_values[_i3 - 1];
        counts[_i3 - 1] = 0;
        while (_values[j] <= class_max) {
            sum += _values[j];
            counts[_i3 - 1] += 1;
            j++;
        }
    }
    mean = sum / nb_ft;
    stddev = getStdDev(_values, mean);

    return {
        breaks: break_values,
        counts: counts,
        min: min,
        max: max,
        mean: mean,
        median: (ix_med | 0) == ix_med ? _values[ix_med] : (_values[Math.floor(ix_med)] + _values[Math.ceil(ix_med)]) / 2,
        stddev: stddev
    };
}

function parseUserDefinedBreaks(serie, breaks_list) {
    var separator = has_negative(serie) ? '- ' : '-';
    return breaks_list.split(separator).map(function (el) {
        return +el.trim();
    });
}

function getBreaks_userDefined(serie, break_values) {
    if (typeof break_values === "string") {
        break_values = parseUserDefinedBreaks(serie, break_values);
    }
    var len_serie = serie.length,
        j = 0,
        len_break_val = break_values.length,
        stock_class = new Array(len_break_val - 1);

    for (var i = 1; i < len_break_val; ++i) {
        var class_max = break_values[i];
        stock_class[i - 1] = 0;
        while (serie[j] <= class_max) {
            stock_class[i - 1] += 1;
            j++;
        }
    }
    return {
        breaks: break_values,
        stock_class: stock_class
    };
}

/**
* Return the haversine distance in kilometers between two points (lat/long coordinates)
*
* @param {Array} A - Coordinates of the 1st point as [latitude, longitude]
* @param {Array} B - Coordinates of the 2nd point as [latitude, longitude]
* @return {Number} distance - The distance in km between A and B
*/
function haversine_dist(A, B) {
    var pi_dr = Math.PI / 180;

    var lat1 = +A[0],
        lon1 = +A[1],
        lat2 = +B[0],
        lon2 = +B[1];

    var x1 = lat2 - lat1,
        dLat = x1 * pi_dr,
        x2 = lon2 - lon1,
        dLon = x2 * pi_dr;

    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * pi_dr) * Math.cos(lat2 * pi_dr) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
* Return the distance in kilometers between two points (lat/long coordinates)
* according to the spherical law of cosines
*
* @param {Array} A - Coordinates of the 1st point as [latitude, longitude]
* @param {Array} B - Coordinates of the 2nd point as [latitude, longitude]
* @return {Number} distance - The distance in km between A and B
*/
function coslaw_dist(A, B) {
    var pi_dr = Math.PI / 180;

    var lat1 = +A[0],
        lon1 = +A[1],
        lat2 = +B[0],
        lon2 = +B[1];
    var phi1 = lat1 * pi_dr,
        phi2 = lat2 * pi_dr,
        d_lambda = (lon2 - lon1) * pi_dr;
    return Math.acos(Math.sin(phi1) * Math.sin(phi2) + Math.cos(phi1) * Math.cos(phi2) * Math.cos(d_lambda)) * 6371;
}

/**
* Return the eclidian distance between pt1 and pt2, in the unit provided
*
* @param {Array} pt1 - Coordinates of the 1st point as [x, y].
* @param {Array} pt2 - Coordinates of the 2nd point as [x, y].
* @return {Number} distance - The distance between pt1 and pt2.
*/
function get_distance(pt1, pt2) {
    var xs = pt2[0] - pt1[1],
        ys = pt2[1] - pt1[1];
    return Math.sqrt(xs * xs + ys * ys);
}

function getStdDev(values, mean_val) {
    var nb_val = values.length,
        pow = Math.pow,
        s = 0;
    for (var i = 0; i < nb_val; i++) {
        s += pow(values[i] - mean_val, 2);
    }
    return Math.sqrt(1 / nb_val * s);
}

/**
* Return the maximal available rectangle in the map
*  in order to locate a new legend without covering existing ones.
*
* Implementation taken from http://www.codinghands.co.uk/blog/2013/02/javascript-implementation-omn-maximal-rectangle-algorithm/
*/
function getMaximalAvailableRectangle(legend_nodes) {
    function getMaxRect() {
        var matrix = mat;
        var bestUpperLeft = { x: -1, y: -1 };
        var bestLowerRight = { x: -1, y: -1 };

        var cache = new Array(rows + 1),
            stack = [];
        for (var i = 0; i < cache.length; i++) {
            cache[i] = 0;
        }for (var x = cols - 1; x >= 0; x--) {
            updateCache(x, cache);
            var width = 0;
            for (var y = 0; y < rows + 1; y++) {
                if (cache[y] > width) {
                    stack.push({ y: y, width: width });
                    width = cache[y];
                }
                if (cache[y] < width) {
                    while (true) {
                        var pop = stack.pop();
                        var y0 = pop.y,
                            w0 = pop.width;
                        if (width * (y - y0) > area(bestUpperLeft, bestLowerRight) && y - y0 >= minQuadY && width >= minQuadX) {
                            bestUpperLeft = { x: x, y: y0 };
                            bestLowerRight = { x: x + width - 1, y: y - 1 };
                        }
                        width = w0;
                        if (cache[y] >= width) break;
                    }
                    width = cache[y];
                    if (width != 0) stack.push({ y: y0, width: w0 });
                }
            }
        }
        return { x: bestUpperLeft.x, y: bestUpperLeft.y, lenX: bestLowerRight.x - bestUpperLeft.x + 1, lenY: bestLowerRight.y - bestUpperLeft.y + 1, area: area(bestUpperLeft, bestLowerRight) };
    }

    function area(upperLeft, lowerRight) {
        if (upperLeft.x > lowerRight.x || upperLeft.y > lowerRight.y) return 0;
        return (lowerRight.x + 1 - upperLeft.x) * (lowerRight.y + 1 - upperLeft.y);
    }

    function updateCache(x, cache) {
        for (var y = 0; y < rows; y++) {
            if (mat[x][y] == 1) cache[y]++;else cache[y] = 0;
        }
    }

    function fillMat(xs, ys) {
        for (var x = xs[0]; x < xs[1]; x++) {
            for (var y = ys[0]; y < ys[1]; y++) {
                mat[x][y] = 0;
            }
        }
    }
    var xy0 = get_map_xy0(),
        x0 = Math.abs(xy0.x),
        y0 = Math.abs(xy0.y);
    var cols = Math.abs(w),
        rows = Math.abs(h),
        minQuadY = 100,
        minQuadX = 40;
    var mat = new Array(cols);
    for (var i = 0; i < cols; i++) {
        mat[i] = new Array(rows);
        for (var j = 0; j < rows; j++) {
            mat[i][j] = 1;
        }
    }
    for (var _i4 = 0; _i4 < legend_nodes.length; _i4++) {
        var bbox = legend_nodes[_i4].getBoundingClientRect(),
            bx = Math.floor(bbox.left - x0),
            by = Math.floor(bbox.top - y0);
        fillMat([bx, bx + Math.floor(bbox.width)], [by, by + Math.floor(bbox.height)]);
    }
    return getMaxRect(mat);
}

function getTranslateNewLegend() {
    var legends = svg_map.querySelectorAll('.legend_feature');
    if (legends.length == 0) {
        return [0, 0];
    } else {
        var max_rect = getMaximalAvailableRectangle(legends);
        return max_rect;
    }
}
"use strict";
////////////////////////////////////////////////////////////////////////
// Browse and upload buttons + related actions (conversion + displaying)
////////////////////////////////////////////////////////////////////////

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var MAX_INPUT_SIZE = 20200000; // max allowed input size in bytes
// const ALERT_INPUT_SIZE = 870400; // If the input is larger than this size, the user will receive an alert
/**
* Function triggered when some images of the interface are clicked
* in order to create an <input> element, simulate a click on it, let the user
* browse its file and dispatch the files to the appropriate handler according
* to the file type
*/
function click_button_add_layer() {
    var self = this,
        input = document.createElement('input');

    var target_layer_on_add = false;

    if (self.id == "img_data_ext" || self.id == "data_ext") {
        input.setAttribute("accept", ".xls,.xlsx,.csv,.tsv,.ods,.txt");
        target_layer_on_add = true;
    } else if (self.id === "input_geom" || self.id === "img_in_geom") {
        input.setAttribute("accept", ".kml,.geojson,.topojson,.shp,.dbf,.shx,.prj,.cpg");
        target_layer_on_add = true;
    } else if (self.id == "input_layout_geom") {
        input.setAttribute("accept", ".kml,.geojson,.topojson,.shp,.dbf,.shx,.prj,.cpg");
    }
    input.setAttribute('type', 'file');
    input.setAttribute('multiple', '');
    input.setAttribute('name', 'file[]');
    input.setAttribute('enctype', 'multipart/form-data');
    input.onchange = function (event) {
        var files = event.target.files;
        handle_upload_files(files, target_layer_on_add, self);
        input.remove();
    };
    input.click();
}

function handle_upload_files(files, target_layer_on_add, elem) {

    for (var i = 0; i < files.length; i++) {
        if (files[i].size > MAX_INPUT_SIZE) {
            // elem.style.border = '3px dashed red';
            elem.style.border = '';
            return swal({ title: i18next.t("app_page.common.error") + "!",
                text: i18next.t("app_page.common.too_large_input"),
                type: "error",
                customClass: 'swal2_custom',
                allowEscapeKey: false,
                allowOutsideClick: false });
        }
    }

    if (!(files.length == 1)) {
        var files_to_send = [];
        Array.prototype.forEach.call(files, function (f) {
            return f.name.indexOf('.shp') > -1 || f.name.indexOf('.dbf') > -1 || f.name.indexOf('.shx') > -1 || f.name.indexOf('.prj') > -1 ? files_to_send.push(f) : null;
        });
        elem.style.border = '';
        if (target_layer_on_add && _app.targeted_layer_added) {
            swal({ title: i18next.t("app_page.common.error") + "!",
                text: i18next.t('app_page.common.error_only_one'),
                customClass: 'swal2_custom',
                type: "error",
                allowEscapeKey: false,
                allowOutsideClick: false });
        } else if (files_to_send.length == 4) {
            handle_shapefile(files_to_send, target_layer_on_add);
            elem.style.border = '';
        } else {
            // elem.style.border = '3px dashed red';
            elem.style.border = '';
            return swal({ title: i18next.t("app_page.common.error") + "!",
                text: i18next.t("app_page.common.alert_upload1"),
                customClass: 'swal2_custom',
                type: "error",
                allowEscapeKey: false,
                allowOutsideClick: false });
        }
    } else if (files[0].name.toLowerCase().indexOf('topojson') > -1) {
        elem.style.border = '';
        if (target_layer_on_add && _app.targeted_layer_added) swal({ title: i18next.t("app_page.common.error") + "!",
            text: i18next.t('app_page.common.error_only_one'),
            customClass: 'swal2_custom',
            type: "error",
            allowEscapeKey: false,
            allowOutsideClick: false });
        // Most direct way to add a layer :
        else handle_TopoJSON_files(files, target_layer_on_add);
    } else if (files[0].name.toLowerCase().indexOf('geojson') > -1 || files[0].name.toLowerCase().indexOf('zip') > -1 || files[0].name.toLowerCase().indexOf('gml') > -1 || files[0].name.toLowerCase().indexOf('kml') > -1) {
        elem.style.border = '';

        if (target_layer_on_add && _app.targeted_layer_added) swal({ title: i18next.t("app_page.common.error") + "!",
            text: i18next.t('app_page.common.error_only_one'),
            customClass: 'swal2_custom',
            type: "error",
            allowEscapeKey: false,
            allowOutsideClick: false });
        // Send the file to the server for conversion :
        else handle_single_file(files[0], target_layer_on_add);
    } else if (files[0].name.toLowerCase().indexOf('.csv') > -1 || files[0].name.toLowerCase().indexOf('.tsv') > -1) {
        elem.style.border = '';
        if (target_layer_on_add) handle_dataset(files[0], target_layer_on_add);else swal({ title: i18next.t("app_page.common.error") + "!",
            text: i18next.t('app_page.common.error_only_layout'),
            type: "error",
            customClass: 'swal2_custom',
            allowEscapeKey: false,
            allowOutsideClick: false });
    } else if (files[0].name.toLowerCase().indexOf('.xls') > -1 || files[0].name.toLowerCase().indexOf('.ods') > -1) {
        elem.style.border = '';
        if (target_layer_on_add) convert_dataset(files[0]);else swal({ title: i18next.t("app_page.common.error") + "!",
            text: i18next.t('app_page.common.error_only_layout'),
            type: "error",
            customClass: 'swal2_custom',
            allowEscapeKey: false,
            allowOutsideClick: false });
    } else {
        elem.style.border = '';
        var shp_part = void 0;
        Array.prototype.forEach.call(files, function (f) {
            return f.name.indexOf('.shp') > -1 || f.name.indexOf('.dbf') > -1 || f.name.indexOf('.shx') > -1 || f.name.indexOf('.prj') > -1 ? shp_part = true : null;
        });
        if (shp_part) {
            return swal({ title: i18next.t("app_page.common.error") + "!",
                text: i18next.t('app_page.common.alert_upload_shp'),
                type: "error",
                customClass: 'swal2_custom',
                allowOutsideClick: false,
                allowEscapeKey: false }).then(function (valid) {
                null;
            }, function (dismiss) {
                null;
            });
        } else {
            return swal({ title: i18next.t("app_page.common.error") + "!",
                text: i18next.t('app_page.common.alert_upload_invalid'),
                type: "error",
                customClass: 'swal2_custom',
                allowOutsideClick: false,
                allowEscapeKey: false });
        }
    }
}

function handleOneByOneShp(files, target_layer_on_add) {
    function populate_shp_slot(slots, file) {
        if (file.name.indexOf(".shp") > -1) {
            slots.set(".shp", file);
            document.getElementById("f_shp").className = "mini_button_ok";
        } else if (file.name.indexOf(".shx") > -1) {
            slots.set(".shx", file);
            document.getElementById("f_shx").className = "mini_button_ok";
        } else if (file.name.indexOf(".prj") > -1) {
            slots.set(".prj", file);
            document.getElementById("f_prj").className = "mini_button_ok";
        } else if (file.name.indexOf(".dbf") > -1) {
            slots.set(".dbf", file);
            document.getElementById("f_dbf").className = "mini_button_ok";
        } else return false;
    }

    swal({
        title: "",
        html: '<div style="border: dashed 1px green;border-radius: 1%;" id="dv_drop_shp">' + '<strong>Shapefile detected - Missing files to upload</strong><br>' + '<p><i>Drop missing files in this area</i></p><br>' + '<image id="img_drop" src="/static/img/Ic_file_download_48px.svg"><br>' + '<p id="f_shp" class="mini_button_none">.shp</p>' + '<p id="f_shx" class="mini_button_none">.shx</p>' + '<p id="f_dbf" class="mini_button_none">.dbf</p>' + '<p id="f_prj" class="mini_button_none">.prj</p>' + '</div>',
        type: "info",
        showCancelButton: true,
        showCloseButton: false,
        allowEscapeKey: true,
        allowOutsideClick: false,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: i18next.t("app_page.common.confirm"),
        preConfirm: function preConfirm() {
            return new Promise(function (resolve, reject) {
                setTimeout(function () {
                    if (shp_slots.size < 4) {
                        reject('Missing files');
                    } else {
                        resolve();
                    }
                }, 50);
            });
        }
    }).then(function (value) {
        var file_list = [shp_slots.get(".shp"), shp_slots.get(".shx"), shp_slots.get(".dbf"), shp_slots.get(".prj")];
        for (var i = 0; i < file_list.length; i++) {
            if (file_list[i].size > MAX_INPUT_SIZE) {
                overlay_drop.style.display = "none";
                return swal({ title: i18next.t("app_page.common.error") + "!",
                    text: i18next.t("app_page.common.too_large_input"),
                    type: "error",
                    allowEscapeKey: false,
                    allowOutsideClick: false });
            }
        }

        if (target_layer_on_add) {
            handle_shapefile(file_list, target_layer_on_add);
        } else {
            var opts = _app.targeted_layer_added ? { 'layout': i18next.t("app_page.common.layout_l") } : { 'target': i18next.t("app_page.common.target_l"), 'layout': i18next.t("app_page.common.layout_l") };
            swal({
                title: "",
                text: i18next.t("app_page.common.layer_type_selection"),
                type: "info",
                showCancelButton: true,
                showCloseButton: false,
                allowEscapeKey: true,
                allowOutsideClick: false,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: i18next.t("app_page.common.confirm"),
                input: 'select',
                inputPlaceholder: i18next.t("app_page.common.layer_type_selection"),
                inputOptions: opts,
                inputValidator: function inputValidator(value) {
                    return new Promise(function (resolve, reject) {
                        if (value.indexOf('target') < 0 && value.indexOf('layout') < 0) {
                            reject(i18next.t("app_page.common.no_value"));
                        } else {
                            resolve();
                            // let file_list = [shp_slots.get(".shp"), shp_slots.get(".shx"), shp_slots.get(".dbf"), shp_slots.get(".prj")];
                            handle_shapefile(file_list, value === "target");
                        }
                    });
                }
            }).then(function (value) {
                overlay_drop.style.display = "none";
            }, function (dismiss) {
                overlay_drop.style.display = "none";
                console.log(dismiss);
            });
        }
    }, function (dismiss) {
        overlay_drop.style.display = "none";
        console.log(dismiss);
    });
    var shp_slots = new Map();
    populate_shp_slot(shp_slots, files[0]);
    document.getElementById("dv_drop_shp").addEventListener("drop", function (event) {
        event.preventDefault();event.stopPropagation();
        var next_files = event.dataTransfer.files;
        for (var f_ix = 0; f_ix < next_files.length; f_ix++) {
            var file = next_files[f_ix];
            populate_shp_slot(shp_slots, file);
        }
        if (shp_slots.size == 4) {
            document.getElementById("dv_drop_shp").innerHTML = document.getElementById("dv_drop_shp").innerHTML.replace('Ic_file_download_48px.svg', 'Ic_check_36px.svg');
        }
    });
    document.getElementById("dv_drop_shp").addEventListener("dragover", function (event) {
        this.style.border = "dashed 2.5px green";
        event.preventDefault();event.stopPropagation();
    });
    document.getElementById("dv_drop_shp").addEventListener("dragleave", function (event) {
        this.style.border = "dashed 1px green";
        event.preventDefault();event.stopPropagation();
    });
}

/**
* Function called to bind the "drop zone" on the 2 desired menu elements
*
*/
function prepare_drop_section() {
    var timeout;
    Array.prototype.forEach.call(document.querySelectorAll("#map,.overlay_drop"), function (elem) {
        elem.addEventListener("dragenter", function (e) {
            e.preventDefault();e.stopPropagation();
            if (document.body.classList.contains("no-drop")) return;
            document.getElementById("overlay_drop").style.display = "";
        });

        elem.addEventListener("dragover", function (e) {
            e.preventDefault();e.stopPropagation();
            if (document.body.classList.contains("no-drop")) return;
            if (timeout) {
                clearTimeout(timeout);
                timeout = setTimeout(function () {
                    e.preventDefault();e.stopPropagation();
                    document.getElementById("overlay_drop").style.display = "none";
                    timeout = null;
                }, 2500);
            }
        });

        elem.addEventListener("dragleave", function (e) {
            e.preventDefault();e.stopPropagation();
            if (document.body.classList.contains("no-drop")) {
                document.body.classList.remove("no-drop");
                return;
            }
            timeout = setTimeout(function () {
                document.getElementById("overlay_drop").style.display = "none";
                timeout = null;
            }, 2500);
        });

        elem.addEventListener("drop", function _drop_func(e) {
            e.preventDefault();e.stopPropagation();
            if (timeout) {
                clearTimeout(timeout);
            }
            if (document.body.classList.contains("no-drop") || !e.dataTransfer.files.length) {
                document.getElementById("overlay_drop").style.display = "none";
                return;
            }
            var overlay_drop = document.getElementById("overlay_drop");
            overlay_drop.style.display = "";
            var files = e.dataTransfer.files;
            if (files.length == 1 && (files[0].name.indexOf(".shp") > -1 || files[0].name.indexOf(".shx") > -1 || files[0].name.indexOf(".dbf") > -1 || files[0].name.indexOf(".prj") > -1)) {
                Array.prototype.forEach.call(document.querySelectorAll("#map,.overlay_drop"), function (_elem) {
                    _elem.removeEventListener('drop', _drop_func);
                });
                handleOneByOneShp(files);
            } else {
                var opts = void 0;
                if (files[0].name.indexOf(".csv") > -1 || files[0].name.indexOf(".tsv") > -1 || files[0].name.indexOf(".txt") > -1 || files[0].name.indexOf(".xls") > -1 || files[0].name.indexOf(".xlsx") > -1 || files[0].name.indexOf(".ods") > -1) {
                    opts = { 'target': i18next.t("app_page.common.ext_dataset") };
                } else {
                    opts = _app.targeted_layer_added ? { 'layout': i18next.t("app_page.common.layout_l") } : { 'target': i18next.t("app_page.common.target_l"), 'layout': i18next.t("app_page.common.layout_l") };
                }
                swal({
                    title: "",
                    text: i18next.t("app_page.common.layer_type_selection"),
                    type: "info",
                    showCancelButton: true,
                    showCloseButton: false,
                    allowEscapeKey: true,
                    allowOutsideClick: false,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: i18next.t("app_page.common.confirm"),
                    input: 'select',
                    inputPlaceholder: i18next.t("app_page.common.layer_type_selection"),
                    inputOptions: opts,
                    inputValidator: function inputValidator(value) {
                        return new Promise(function (resolve, reject) {
                            if (value.indexOf('target') < 0 && value.indexOf('layout') < 0) {
                                reject(i18next.t("app_page.common.no_value"));
                            } else {
                                // resolve();
                                // handle_upload_files(files, value === "target", elem);
                                resolve(handle_upload_files(files, value === "target", elem));
                            }
                        });
                    }
                }).then(function (value) {
                    overlay_drop.style.display = "none";
                    console.log(value);
                }, function (dismiss) {
                    overlay_drop.style.display = "none";
                    console.log(dismiss);
                });
            }
        });
    });

    Array.prototype.forEach.call(document.querySelectorAll("#section1,#section3"), function (elem) {
        elem.addEventListener("dragenter", function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (document.body.classList.contains("no-drop")) return;
            elem.style.border = '3px dashed green';
        });
        elem.addEventListener("dragover", function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (document.body.classList.contains("no-drop")) return;
            elem.style.border = '3px dashed green';
        });
        elem.addEventListener("dragleave", function (e) {
            e.preventDefault();
            e.stopPropagation();
            elem.style.border = '';
            if (document.body.classList.contains("no-drop")) document.body.classList.remove("no-drop");
        });
        elem.addEventListener("drop", function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (!e.dataTransfer.files.length) {
                elem.style.border = '';
                return;
            }
            var files = e.dataTransfer.files,
                target_layer_on_add = elem.id === "section1" ? true : false;
            if (files.length == 1 && (files[0].name.indexOf(".shp") > -1 || files[0].name.indexOf(".shx") > -1 || files[0].name.indexOf(".dbf") > -1 || files[0].name.indexOf(".prj") > -1)) {
                handleOneByOneShp(files, target_layer_on_add);
            } else {
                handle_upload_files(files, target_layer_on_add, elem);
            }
        }, true);
    });
}

function ask_replace_dataset() {
    return swal({
        title: "",
        text: i18next.t("app_page.common.ask_replace_dataset"),
        type: "warning",
        showCancelButton: true,
        allowOutsideClick: false,
        allowEscapeKey: false,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: i18next.t("app_page.common.confirm")
    });
}

function convert_dataset(file) {
    var do_convert = function do_convert() {
        var ajaxData = new FormData();
        ajaxData.append("action", "submit_form");
        ajaxData.append('file[]', file);
        xhrequest("POST", '/convert_tabular', ajaxData, true).then(function (data) {
            data = JSON.parse(data);
            dataset_name = data.name;
            swal({ title: "",
                text: i18next.t('app_page.common.warn_xls_sheet') + (data.message ? '\n' + i18next.t(data.message[0], { sheet_name: data.message[1][0] }) : ''),
                type: "info",
                allowOutsideClick: false,
                allowEscapeKey: false
            }).then(function () {
                add_dataset(d3.csvParse(data.file));
            }, function (dismiss) {
                null;
            });
        }, function (error) {
            display_error_during_computation();
        });
    };

    if (joined_dataset.length !== 0) {
        ask_replace_dataset().then(function (_) {
            remove_ext_dataset_cleanup();
            do_convert();
        }, function (_) {
            null;
        });
    } else {
        do_convert();
    }
}

function handle_shapefile(files, target_layer_on_add) {
    var ajaxData = new FormData();
    ajaxData.append("action", "submit_form");
    for (var j = 0; j < files.length; j++) {
        ajaxData.append('file[' + j + ']', files[j]);
    }
    xhrequest("POST", '/convert_to_topojson', ajaxData, true).then(function (data) {
        add_layer_topojson(data, { target_layer_on_add: target_layer_on_add });
    }, function (error) {
        display_error_during_computation();
    });
}

function handle_TopoJSON_files(files, target_layer_on_add) {
    var f = files[0],
        name = files[0].name,
        reader = new FileReader(),
        ajaxData = new FormData();
    ajaxData.append('file[]', f);
    xhrequest("POST", '/cache_topojson/user', ajaxData, false).then(function (res) {
        var key = JSON.parse(res).key;
        reader.onloadend = function () {
            var text = reader.result;
            var topoObjText = ['{"key": ', key, ',"file":', text, '}'].join('');
            add_layer_topojson(topoObjText, { target_layer_on_add: target_layer_on_add });
        };
        reader.readAsText(f);
    }, function (error) {
        display_error_during_computation();
    });
};

function handle_reload_TopoJSON(text, param_add_func) {
    var ajaxData = new FormData();
    var f = new Blob([text], { type: "application/json" });
    ajaxData.append('file[]', f);

    return xhrequest("POST", '/cache_topojson/user', ajaxData, false).then(function (response) {
        var res = response,
            key = JSON.parse(res).key,
            topoObjText = ['{"key": ', key, ',"file":', text, '}'].join('');
        var layer_name = add_layer_topojson(topoObjText, param_add_func);
        return layer_name;
    });
}

//var UTF8 = {
//    encode: function(s){
//        for(let c, i = -1, l = (s = s.split("")).length, o = String.fromCharCode; ++i < l;
//            s[i] = (c = s[i].charCodeAt(0)) >= 127 ? o(0xc0 | (c >>> 6)) + o(0x80 | (c & 0x3f)) : s[i]
//		);
//		return s.join("");
//    },
//    decode: function(s){
//        for(let a, b, i = -1, l = (s = s.split("")).length, o = String.fromCharCode, c = "charCodeAt"; ++i < l;
//            ((a = s[i][c](0)) & 0x80) &&
//            (s[i] = (a & 0xfc) == 0xc0 && ((b = s[i + 1][c](0)) & 0xc0) == 0x80 ?
//            o(((a & 0x03) << 6) + (b & 0x3f)) : o(128), s[++i] = "")
//            );
//		return s.join("");
//	}
//};

/**
* Handle a csv dataset by parsing it as an array of Object (ie features) or by
* converting it to topojson if it contains valid x/y/lat/lon/etc. columns and
* adding it to the map
* @param {File} f - The input csv file
*/
function handle_dataset(f, target_layer_on_add) {

    function check_dataset() {
        var reader = new FileReader(),
            name = f.name;

        reader.onload = function (e) {
            var data = e.target.result;
            var sep = data.split("\n")[0];
            if (sep.indexOf("\t") > -1) {
                sep = "\t";
            } else if (sep.indexOf(";") > -1) {
                sep = ";";
            } else {
                sep = ",";
            }

            var tmp_dataset = d3.dsvFormat(sep).parse(data);
            var field_name = Object.getOwnPropertyNames(tmp_dataset[0]);
            if (field_name.indexOf("x") > -1 || field_name.indexOf("X") > -1 || field_name.indexOf("lat") > -1 || field_name.indexOf("latitude") > -1) {
                if (field_name.indexOf("y") > -1 || field_name.indexOf("Y") > -1 || field_name.indexOf("lon") > -1 || field_name.indexOf("longitude") > -1 || field_name.indexOf("long") > -1) {
                    if (target_layer_on_add && _app.targeted_layer_added) {
                        swal({ title: i18next.t("app_page.common.error") + "!",
                            text: i18next.t('app_page.common.error_only_one'),
                            customClass: 'swal2_custom',
                            type: "error",
                            allowEscapeKey: false,
                            allowOutsideClick: false });
                    } else {
                        add_csv_geom(data, dataset_name);
                    }
                    return;
                }
            }
            dataset_name = name.substring(0, name.indexOf('.csv'));
            add_dataset(tmp_dataset);
        };
        reader.readAsText(f);
    }

    if (joined_dataset.length !== 0) {
        ask_replace_dataset().then(function () {
            remove_ext_dataset_cleanup();
            check_dataset();
        }, function () {
            null;
        });
    } else {
        check_dataset();
    }
}

// function handle_dataset(f, target_layer_on_add){
//     function box_dataset(){
//         createBoxTextImportWizard(f).then(confirm => {
//             if(confirm){
//                 let [tmp_dataset, valid] = confirm;
//                 console.log(tmp_dataset, valid);
//                 let field_name = Object.getOwnPropertyNames(tmp_dataset[0]);
//                 if(field_name.indexOf("x") > -1 || field_name.indexOf("X") > -1 || field_name.indexOf("lat") > -1 || field_name.indexOf("latitude") > -1){
//                     if(field_name.indexOf("y") > -1 || field_name.indexOf("Y") > -1 || field_name.indexOf("lon") > -1 || field_name.indexOf("longitude") > -1 || field_name.indexOf("long") > -1){
//                         if(target_layer_on_add && _app.targeted_layer_added){
//                             swal({title: i18next.t("app_page.common.error") + "!",
//                                   text: i18next.t('app_page.common.error_only_one'),
//                                   customClass: 'swal2_custom',
//                                   type: "error",
//                                   allowEscapeKey: false,
//                                   allowOutsideClick: false});
//
//                         } else {
//                             let reader = new FileReader(),
//                                 name = f.name;
//
//                             reader.onload = function(e) {
//                                 add_csv_geom(e.target.result, f.name.substring(0, name.indexOf('.csv')));
//                             }
//                             reader.readAsText();
//                         }
//                         return;
//                     }
//                 }
//                 dataset_name = f.name.substring(0, f.name.indexOf('.csv'));
//                 add_dataset(tmp_dataset);
//             }
//         });
//     }
//
//     if(joined_dataset.length !== 0){
//         ask_replace_dataset().then(() => {
//             remove_ext_dataset_cleanup();
//             box_dataset();
//           }, () => { null; });
//     } else {
//         box_dataset();
//     }
// }

function update_menu_dataset() {
    var d_name = dataset_name.length > 20 ? [dataset_name.substring(0, 17), "(...)"].join('') : dataset_name,
        nb_features = joined_dataset[0].length,
        field_names = Object.getOwnPropertyNames(joined_dataset[0][0]);

    var data_ext = document.getElementById("data_ext");

    d3.select(data_ext.parentElement.firstChild).attrs({ "id": "img_data_ext",
        "class": "user_panel",
        "src": "/static/img/b/tabular.png",
        "width": "26", "height": "26",
        "alt": "Additional dataset" });

    data_ext.classList.remove('i18n');
    data_ext.removeAttribute('data-i18n');
    d3.select(data_ext).html([' <b>', d_name, '</b> - <i><span style="font-size:9px;">', nb_features, ' ', i18next.t("app_page.common.feature", { count: +nb_features }), ' - ', field_names.length, ' ', i18next.t("app_page.common.field", { count: +field_names.length }), '</i></span>'].join(''));
    data_ext.parentElement.innerHTML = data_ext.parentElement.innerHTML + '<img width="13" height="13" src="/static/img/Trash_font_awesome.png" id="remove_dataset" style="float:right;margin-top:10px;opacity:0.5">';

    document.getElementById("remove_dataset").onclick = function () {
        remove_ext_dataset();
    };
    document.getElementById("remove_dataset").onmouseover = function () {
        this.style.opacity = 1;
    };
    document.getElementById("remove_dataset").onmouseout = function () {
        this.style.opacity = 0.5;
    };
    if (_app.targeted_layer_added) {
        valid_join_check_display(false);
    }
}

/**
*
*
*/
function add_dataset(readed_dataset) {
    // Check if their is an empty name in the columns name (typically the first one) and replace it by UID:
    if (readed_dataset[0].hasOwnProperty('')) {
        var new_col_name = !readed_dataset[0].hasOwnProperty('UID') ? 'UID' : 'Undefined_Name';
        for (var i = 0; i < readed_dataset.length; ++i) {
            readed_dataset[i][new_col_name] = readed_dataset[i][''];
            delete readed_dataset[i][''];
        }
    }

    var cols = Object.getOwnPropertyNames(readed_dataset[0]);

    // Test if there is an empty last line and remove it if its the case :
    if (cols.map(function (f) {
        return readed_dataset[readed_dataset.length - 1][f];
    }).every(function (f) {
        return f == "";
    })) {
        readed_dataset = readed_dataset.slice(0, readed_dataset.length - 1);
    }

    // Suboptimal way to convert an eventual comma decimal separator to a point decimal separator :
    for (var _i = 0; _i < cols.length; _i++) {
        var tmp = [];
        // Check that all values of this field can be coerced to Number :
        for (var j = 0; j < readed_dataset.length; j++) {
            if (readed_dataset[j][cols[_i]].replace && (!isNaN(+readed_dataset[j][cols[_i]].replace(",", ".")) || !isNaN(+readed_dataset[j][cols[_i]].split(' ').join(''))) || !isNaN(+readed_dataset[j][cols[_i]])) {
                // Add the converted value to temporary field if its ok ...
                var t_val = readed_dataset[j][cols[_i]].replace(",", ".").split(' ').join('');
                tmp.push(isFinite(t_val) && t_val != "" && t_val != null ? +t_val : t_val);
            } else {
                // Or break early if a value can't be coerced :
                break; // So no value of this field will be converted
            }
        }
        // If the whole field has been converted successfully, apply the modification :
        if (tmp.length === readed_dataset.length) {
            for (var _j = 0; _j < readed_dataset.length; _j++) {
                readed_dataset[_j][cols[_i]] = tmp[_j];
            }
        }
    }
    joined_dataset.push(readed_dataset);

    update_menu_dataset();

    if (_app.current_functionnality && _app.current_functionnality.name == "flow") fields_handler.fill();

    if (_app.targeted_layer_added) {
        var layer_name = Object.getOwnPropertyNames(user_data)[0];
        ask_join_now(layer_name, 'dataset');
    }
}

function add_csv_geom(file, name) {
    var ajaxData = new FormData();
    ajaxData.append('filename', name);
    ajaxData.append('csv_file', file);
    xhrequest("POST", '/convert_csv_geo', ajaxData, true).then(function (data) {
        dataset_name = undefined;
        add_layer_topojson(data, { target_layer_on_add: true });
    }, function (error) {
        display_error_during_computation();
    });
}

/**
* Send a single file (.zip / .kml / .gml / .geojson) to the server in order to get
* the converted layer added to the map
* @param {File} file
*/
function handle_single_file(file, target_layer_on_add) {
    var ajaxData = new FormData();
    ajaxData.append("action", "single_file");
    ajaxData.append('file[]', file);
    xhrequest("POST", '/convert_to_topojson', ajaxData, true).then(function (data) {
        add_layer_topojson(data, { target_layer_on_add: target_layer_on_add });
    }, function (error) {
        display_error_during_computation();
    });
};

function get_display_name_on_layer_list(layer_name_to_add) {
    return +layer_name_to_add.length > 40 ? [layer_name_to_add.substring(0, 37), '(...)'].join('') : layer_name_to_add;
}

function ask_join_now(layer_name) {
    var on_add = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'layer';

    swal({ title: "",
        text: i18next.t("app_page.join_box.before_join_ask"),
        allowOutsideClick: false,
        allowEscapeKey: true,
        type: "question",
        showConfirmButton: true,
        showCancelButton: true,
        confirmButtonText: i18next.t("app_page.common.yes"),
        cancelButtonText: i18next.t("app_page.common.no")
    }).then(function () {
        createJoinBox(layer_name);
    }, function (dismiss) {
        if (on_add == 'layer') make_box_type_fields(layer_name);
    });
}

function ask_existing_feature(feature_name) {
    return swal({
        title: "",
        text: i18next.t('app_page.common.error_existing_' + feature_name),
        allowOutsideClick: false,
        allowEscapeKey: false,
        type: "question",
        showConfirmButton: true,
        showCancelButton: true,
        confirmButtonText: i18next.t("app_page.common.yes"),
        cancelButtonText: i18next.t("app_page.common.no")
    });
}

// Add the TopoJSON to the 'svg' element :
function add_layer_topojson(text) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};


    var parsedJSON = JSON.parse(text);
    var result_layer_on_add = options.result_layer_on_add ? true : false,
        target_layer_on_add = options.target_layer_on_add ? true : false,
        skip_alert = options.skip_alert ? true : false,
        skip_rescale = options.skip_rescale === true ? true : false,
        fields_type = options.fields_type ? options.fields_type : undefined;

    if (parsedJSON.Error) {
        // Server returns a JSON reponse like {"Error":"The error"} if something went bad during the conversion
        display_error_during_computation(parsedJSON.Error);
        return;
    }
    var type = "",
        topoObj = parsedJSON.file,
        data_to_load = false,
        layers_names = Object.getOwnPropertyNames(topoObj.objects);

    if (layers_names.length > 1) {
        swal("", i18next.t("app_page.common.warning_multiple_layers"), "warning");
    }

    var random_color1 = ColorsSelected.random(),
        lyr_name = layers_names[0],
        lyr_name_to_add = check_layer_name(options.choosed_name ? options.choosed_name : lyr_name),
        lyr_id = encodeId(lyr_name_to_add);

    _app.layer_to_id.set(lyr_name_to_add, lyr_id);
    _app.id_to_layer.set(lyr_id, lyr_name_to_add);

    var nb_ft = topoObj.objects[lyr_name].geometries.length,
        topoObj_objects = topoObj.objects[lyr_name];

    if (!topoObj_objects.geometries || topoObj_objects.geometries.length == 0) {
        display_error_during_computation(i18next.t('app_page.common.error_invalid_empty'));
        return;
    }

    var field_names = topoObj_objects.geometries[0].properties ? Object.getOwnPropertyNames(topoObj_objects.geometries[0].properties) : [];

    if (topoObj_objects.geometries[0].type.indexOf('Point') > -1) type = 'Point';else if (topoObj_objects.geometries[0].type.indexOf('LineString') > -1) type = 'Line';else if (topoObj_objects.geometries[0].type.indexOf('Polygon') > -1) type = 'Polygon';

    current_layers[lyr_name_to_add] = {
        "type": type,
        "n_features": nb_ft,
        "stroke-width-const": type === "Line" ? 1.5 : 0.4,
        "fill_color": { "single": random_color1 },
        "key_name": parsedJSON.key
    };

    if (target_layer_on_add) {
        current_layers[lyr_name_to_add].targeted = true;
        user_data[lyr_name_to_add] = [];
        data_to_load = true;
        current_layers[lyr_name_to_add].fields_type = [];
    } else if (result_layer_on_add) {
        result_data[lyr_name_to_add] = [];
        current_layers[lyr_name_to_add].is_result = true;
    }

    var path_to_use = options.pointRadius ? path.pointRadius(options.pointRadius) : path;

    map.insert("g", '.legend').attr("id", lyr_id).attr("class", data_to_load ? "targeted_layer layer" : "layer").styles({ "stroke-linecap": "round", "stroke-linejoin": "round" }).selectAll(".subunit").data(topojson.feature(topoObj, topoObj_objects).features).enter().append("path").attrs({ "d": path_to_use, "height": "100%", "width": "100%" }).attr("id", function (d, ix) {
        if (data_to_load) {
            if (field_names.length > 0) {
                if (d.id != undefined && d.id != ix) {
                    d.properties["_uid"] = d.id;
                    d.id = +ix;
                }
                user_data[lyr_name_to_add].push(d.properties);
            } else {
                user_data[lyr_name_to_add].push({ "id": d.id || ix });
            }
        } else if (result_layer_on_add) result_data[lyr_name_to_add].push(d.properties);

        return "feature_" + ix;
    }).styles({ "stroke": type != 'Line' ? "rgb(0, 0, 0)" : random_color1,
        "stroke-opacity": 1,
        "fill": type != 'Line' ? random_color1 : null,
        "fill-opacity": type != 'Line' ? 0.90 : 0 });

    var class_name = [target_layer_on_add ? "sortable_target " : result_layer_on_add ? "sortable_result " : null, lyr_id].join('');

    var layers_listed = layer_list.node(),
        li = document.createElement("li"),
        nb_fields = field_names.length,
        _lyr_name_display_menu = get_display_name_on_layer_list(lyr_name_to_add);

    li.setAttribute("class", class_name);
    li.setAttribute("layer_name", lyr_name_to_add);
    d3.select('#layer_to_export').append('option').attr('value', lyr_name_to_add).text(lyr_name_to_add);
    if (target_layer_on_add) {
        current_layers[lyr_name_to_add].original_fields = new Set(Object.getOwnPropertyNames(user_data[lyr_name_to_add][0]));

        if (joined_dataset.length != 0) {
            valid_join_check_display(false);console.log(section1.select(".s1"));
            section1.select(".s1").html("").on("click", null);
        }

        document.getElementById('sample_zone').style.display = "none";

        var _button = button_type.get(type),
            _nb_fields = field_names.length,
            nb_char_display = lyr_name_to_add.length + _nb_fields.toString().length + nb_ft.toString().length,
            _lyr_name_display = +nb_char_display > 23 ? [lyr_name_to_add.substring(0, 18), '(...)'].join('') : lyr_name_to_add;

        _button = _button.substring(10, _button.indexOf("class") - 2);
        var _input_geom = document.getElementById("input_geom");
        _input_geom.classList.remove('i18n');
        _input_geom.removeAttribute('data-i18n');
        d3.select(_input_geom).attrs({ "src": _button, "width": "26", "height": "26" }).html(['<b>', _lyr_name_display, '</b> - <i><span style="font-size:9px;">', nb_ft, ' ', i18next.t("app_page.common.feature", { count: +nb_ft }), ' - ', _nb_fields, ' ', i18next.t("app_page.common.field", { count: +_nb_fields }), '</i></span>'].join('')).on("click", null);
        _input_geom.parentElement.innerHTML = _input_geom.parentElement.innerHTML + '<img width="13" height="13" src="/static/img/Trash_font_awesome.png" id="remove_target" style="float:right;margin-top:10px;opacity:0.5">';
        var remove_target = document.getElementById("remove_target");
        remove_target.onclick = function () {
            remove_layer(lyr_name_to_add);
        };
        remove_target.onmouseover = function () {
            this.style.opacity = 1;
        };
        remove_target.onmouseout = function () {
            this.style.opacity = 0.5;
        };
        _app.targeted_layer_added = true;
        li.innerHTML = [_lyr_name_display_menu, '<div class="layer_buttons">', button_trash, sys_run_button_t2, button_zoom_fit, button_table, eye_open0, button_type.get(type), "</div>"].join('');

        window._target_layer_file = topoObj;
        if (!skip_rescale) {
            scale_to_lyr(lyr_name_to_add);
            center_map(lyr_name_to_add);
        }
        handle_click_hand("lock");
        if (_app.current_functionnality != undefined) fields_handler.fill(lyr_name_to_add);
    } else if (result_layer_on_add) {
        li.innerHTML = [_lyr_name_display_menu, '<div class="layer_buttons">', button_trash, sys_run_button_t2, button_zoom_fit, button_table, eye_open0, button_legend, button_result_type.get(options.func_name ? options.func_name : _app.current_functionnality.name), "</div>"].join('');
        if (!skip_rescale) {
            center_map(lyr_name_to_add);
        }
        handle_click_hand("lock");
    } else {
        li.innerHTML = [_lyr_name_display_menu, '<div class="layer_buttons">', button_trash, sys_run_button_t2, button_zoom_fit, button_table, eye_open0, button_type.get(type), "</div>"].join('');
    }

    if (!target_layer_on_add && _app.current_functionnality != undefined && _app.current_functionnality.name == "smooth") {
        fields_handler.fill();
    }

    if (type === "Point") {
        current_layers[lyr_name_to_add].pointRadius = options.pointRadius || path.pointRadius();
    }

    layers_listed.insertBefore(li, layers_listed.childNodes[0]);
    handleClipPath(current_proj_name);
    binds_layers_buttons(lyr_name_to_add);
    if (!skip_rescale) {
        zoom_without_redraw();
    }

    if (!skip_alert) {
        if (fields_type != undefined) {
            current_layers[lyr_name_to_add].fields_type = fields_type;
        }
        swal({ title: "",
            text: i18next.t("app_page.common.layer_success"),
            allowOutsideClick: true,
            allowEscapeKey: true,
            type: "success"
        }).then(function () {
            if (target_layer_on_add && joined_dataset.length > 0) ask_join_now(lyr_name_to_add);else if (target_layer_on_add) make_box_type_fields(lyr_name_to_add);
        }, function (dismiss) {
            if (target_layer_on_add && joined_dataset.length > 0) ask_join_now(lyr_name_to_add);else if (target_layer_on_add) make_box_type_fields(lyr_name_to_add);
        });
    }
    return lyr_name_to_add;
};

/**
*  Get the bounding box (in map/svg coordinates) of a layer using path.bounds()
*
*  @param {string} name - The name of layer
*/
function get_bbox_layer_path(name) {
    var bbox_layer_path = [[Infinity, Infinity], [-Infinity, -Infinity]],
        selec = svg_map.querySelector("#" + _app.layer_to_id.get(name)).childNodes;
    for (var i = 0, len_i = selec.length; i < len_i; i++) {
        var bbox_path = path.bounds(selec[i].__data__);
        bbox_layer_path[0][0] = bbox_path[0][0] < bbox_layer_path[0][0] ? bbox_path[0][0] : bbox_layer_path[0][0];
        bbox_layer_path[0][1] = bbox_path[0][1] < bbox_layer_path[0][1] ? bbox_path[0][1] : bbox_layer_path[0][1];
        bbox_layer_path[1][0] = bbox_path[1][0] > bbox_layer_path[1][0] ? bbox_path[1][0] : bbox_layer_path[1][0];
        bbox_layer_path[1][1] = bbox_path[1][1] > bbox_layer_path[1][1] ? bbox_path[1][1] : bbox_layer_path[1][1];
    }
    if (current_proj_name == "ConicConformal") {
        var s1 = Math.max((bbox_layer_path[1][0] - bbox_layer_path[0][0]) / w, (bbox_layer_path[1][1] - bbox_layer_path[0][1]) / h);
        var bbox_layer_path2 = path.bounds({ "type": "MultiPoint", "coordinates": [[-69.3, -55.1], [20.9, -36.7], [147.2, -42.2], [162.1, 67.0], [-160.2, 65.7]] });
        var s2 = Math.max((bbox_layer_path2[1][0] - bbox_layer_path2[0][0]) / w, (bbox_layer_path2[1][1] - bbox_layer_path2[0][1]) / h);
        if (s2 < s1) bbox_layer_path = bbox_layer_path2;
    } else if (current_proj_name == "Armadillo") {
        var _s = Math.max((bbox_layer_path[1][0] - bbox_layer_path[0][0]) / w, (bbox_layer_path[1][1] - bbox_layer_path[0][1]) / h);
        var _bbox_layer_path = path.bounds({ "type": "MultiPoint", "coordinates": [[-69.3, -35.0], [20.9, -35.0], [147.2, -35.0], [175.0, 75.0], [-175.0, 75.0]] });
        var _s2 = Math.max((_bbox_layer_path[1][0] - _bbox_layer_path[0][0]) / w, (_bbox_layer_path[1][1] - _bbox_layer_path[0][1]) / h);
        if (_s2 < _s) bbox_layer_path = _bbox_layer_path;
    }
    // }
    return bbox_layer_path;
}

/**
* Change the projection scale and translate properties in order to fit the layer.
* Redraw the path from all the current layers to reflect the change.
*
* @param {string} name - The name of layer to scale on
*/
function scale_to_lyr(name) {
    var bbox_layer_path = get_bbox_layer_path(name);
    if (!bbox_layer_path) return;
    s = 0.95 / Math.max((bbox_layer_path[1][0] - bbox_layer_path[0][0]) / w, (bbox_layer_path[1][1] - bbox_layer_path[0][1]) / h) * proj.scale();
    t = [0, 0];
    proj.scale(s).translate(t);
    map.selectAll(".layer").selectAll("path").attr("d", path);
    reproj_symbol_layer();
};

/**
* Center and zoom to a layer (using zoom scale and translate properties).
* Projection properties stay unchanged.
*
* @param {string} name - The name of layer to zoom on
*/
function center_map(name) {
    var bbox_layer_path = get_bbox_layer_path(name);
    var zoom_scale = .95 / Math.max((bbox_layer_path[1][0] - bbox_layer_path[0][0]) / w, (bbox_layer_path[1][1] - bbox_layer_path[0][1]) / h);
    var zoom_translate = [(w - zoom_scale * (bbox_layer_path[1][0] + bbox_layer_path[0][0])) / 2, (h - zoom_scale * (bbox_layer_path[1][1] + bbox_layer_path[0][1])) / 2];
    var _zoom = svg_map.__zoom;
    _zoom.k = zoom_scale;
    _zoom.x = zoom_translate[0];
    _zoom.y = zoom_translate[1];
};

function setSphereBottom() {
    var layers_list = document.querySelector(".layer_list");
    layers_list.appendChild(layers_list.childNodes[0]);
    svg_map.insertBefore(svg_map.querySelector('#Sphere'), svg_map.childNodes[0]);
    svg_map.insertBefore(defs.node(), svg_map.childNodes[0]);
}

function add_layout_feature(selected_feature) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    if (selected_feature == "text_annot") {
        var existing_annotation = document.getElementsByClassName("txt_annot"),
            existing_id = [],
            new_id = void 0;
        if (existing_annotation) existing_id = Array.prototype.map.call(existing_annotation, function (elem) {
            return +elem.childNodes[0].id.split('text_annotation_')[1];
        });
        for (var i = 0; i < 50; i++) {
            if (existing_id.indexOf(i) == -1) {
                existing_id.push(i);
                new_id = ["text_annotation_", i].join('');
                break;
            } else continue;
        }
        if (!new_id) {
            swal(i18next.t("app_page.common.error") + "!", i18next.t("app_page.common.error_max_text_annot"), "error");
            return;
        }
        handleClickTextBox(new_id);
    } else if (selected_feature == "sphere") {
        if (current_layers.Sphere) return;
        options.fill = options.fill || "#add8e6";
        options.fill_opacity = options.fill_opacity || 0.2;
        options.stroke_width = options.stroke_width || "0.5px";
        options.stroke_opacity = options.stroke_opacity || 1;
        options.stroke = options.stroke || "#ffffff";
        current_layers["Sphere"] = { "type": "Polygon", "n_features": 1, "stroke-width-const": +options.stroke_width.slice(0, -2), "fill_color": { single: options.fill } };
        map.append("g").attrs({ id: "Sphere", class: "layer" }).styles({ 'stroke-width': options.stroke_width }).append("path").datum({ type: "Sphere" }).styles({ fill: options.fill, "fill-opacity": options.fill_opacity, 'stroke-opacity': options.stroke_opacity, stroke: options.stroke }).attrs({ id: 'sphere', d: path, 'clip-path': 'url(#clip)' });
        create_li_layer_elem("Sphere", null, "Polygon", "sample");
        zoom_without_redraw();
        setSphereBottom();
    } else if (selected_feature == "graticule") {
        if (current_layers["Graticule"] != undefined) return;
        options.stroke = options.stroke || '#808080';
        options.stroke_width = options.stroke_width || "1px";
        options.stroke_opacity = options.stroke_opacity || 1;
        options.stroke_dasharray = options.stroke_dasharray || 5;
        options.step = options.step || 10;
        map.insert("g", '.legend').attrs({ id: "Graticule", class: "layer" }).styles({ 'stroke-width': options.stroke_width }).append("path").datum(d3.geoGraticule().step([options.step, options.step])).attrs({ 'class': 'graticule', 'clip-path': 'url(#clip)', 'd': path }).styles({ 'stroke-dasharray': options.stroke_dasharray, 'fill': 'none', 'stroke': options.stroke });
        current_layers["Graticule"] = {
            "type": "Line",
            "n_features": 1,
            "stroke-width-const": +options.stroke_width.slice(0, -2),
            "fill_color": { single: options.stroke },
            opacity: options.stroke_opacity,
            step: options.step,
            dasharray: options.stroke_dasharray
        };
        create_li_layer_elem("Graticule", null, "Line", "sample");
        zoom_without_redraw();
    } else if (selected_feature == "scale") {
        if (!scaleBar.displayed) {
            scaleBar.create();
        } else {
            ask_existing_feature('scalebar').then(function () {
                scaleBar.remove();
                scaleBar.create();
            }, function (dismiss) {
                null;
            });
        }
    } else if (selected_feature == "north_arrow") {
        if (!northArrow.displayed) {
            northArrow.display();
        } else {
            ask_existing_feature('north_arrow').then(function (_) {
                northArrow.remove();
                northArrow.display();
            }, function (dismiss) {
                null;
            });
        }
    } else if (selected_feature == "arrow") {
        handleClickAddArrow();
    } else if (selected_feature == "ellipse") {
        handleClickAddEllipse();
    } else if (selected_feature == "symbol") {
        if (!window.default_symbols) {
            window.default_symbols = [];
            var a = prepare_available_symbols();
            a.then(function (confirmed) {
                var a = box_choice_symbol(window.default_symbols).then(function (result) {
                    if (result) {
                        add_single_symbol(result.split("url(")[1].substring(1).slice(0, -2));
                    }
                });
            });
        } else {
            var _a = box_choice_symbol(window.default_symbols).then(function (result) {
                if (result) {
                    add_single_symbol(result.split("url(")[1].substring(1).slice(0, -2));
                }
            });
        }
    } else {
        swal(i18next.t("app_page.common.error") + "!", i18next.t("app_page.common.error"), "error");
    }
}

// function handleCreateFreeDraw(){
//     let start_point,
//         tmp_start_point,
//         active_line,
//         drawing_data = { "lines": [] };
//
//     let render_line = d3.line().x(d => d[0]).y(d => d[1]);
//     let draw_calc = map.append("g")
//                         .append("rect")
//                         .attrs({class: "draw_calc", x: 0, y: 0, width: w, height: h})
//                         .style("opacity", 0.1).style("fill", "grey");
//
//     function redraw() {
//       var lines;
//       lines = draw_calc.selectAll('.line').data(drawing_data.lines);
//       lines.enter().append('path').attrs({
//         "class": 'line',
//         stroke: function(d) {
//           return d.color;
//         }
//       });
//       lines.attr("d", function(d) { return render_line(d.points);});
//       return lines.exit();
//     };
//
//     let drag = d3.drag()
//            .on('start', function() {
//               active_line = {
//                 points: [],
//                 color: "black"
//               };
//               drawing_data.lines.push(active_line);
//               return redraw();
//             })
//             .on('drag', function() {
//               active_line.points.push([d3.event.x, d3.event.y]);
//               console.log(drawing_data);
//               return redraw();
//             })
//             .on('end', function() {
//               if (active_line.points.length === 0) {
//                 drawing_data.lines.pop();
//               }
//               active_line = null;
//               console.log(drawing_data);
//               return;
//             });
//     zoom.on("zoom", null);
//     draw_calc.call(drag);
// }

function add_single_symbol(symbol_dataurl, x, y) {
    var width = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "30px";
    var height = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : "30px";

    var context_menu = new ContextMenu(),
        getItems = function getItems(self_parent) {
        return [{ "name": i18next.t("app_page.common.options"), "action": function action() {
                make_style_box_indiv_symbol(self_parent);
            } }, { "name": i18next.t("app_page.common.up_element"), "action": function action() {
                up_legend(self_parent.parentElement);
            } }, { "name": i18next.t("app_page.common.down_element"), "action": function action() {
                down_legend(self_parent.parentElement);
            } }, { "name": i18next.t("app_page.common.delete"), "action": function action() {
                self_parent.parentElement.remove();
            } }];
    };

    x = x || w / 2;
    y = y || h / 2;
    return map.append("g").attrs({ class: "legend single_symbol" }).insert("image").attrs({ "x": x, "y": y, "width": width, "height": width,
        "xlink:href": symbol_dataurl }).on("mouseover", function () {
        this.style.cursor = "pointer";
    }).on("mouseout", function () {
        this.style.cursor = "initial";
    }).on("dblclick contextmenu", function () {
        context_menu.showMenu(d3.event, document.querySelector("body"), getItems(this));
    }).call(drag_elem_geo);
}

function add_layout_layers() {
    var existing_box = document.querySelector(".sampleLayoutDialogBox");
    if (existing_box) {
        existing_box.remove();
    }

    var selec = { layout: null };
    var layout_layers = [[i18next.t("app_page.layout_layer_box.nuts0"), "nuts0"], [i18next.t("app_page.layout_layer_box.nuts1"), "nuts1"], [i18next.t("app_page.layout_layer_box.nuts2"), "nuts2"], [i18next.t("app_page.layout_layer_box.brazil"), "brazil"], [i18next.t("app_page.layout_layer_box.world_countries"), "world_country"], [i18next.t("app_page.layout_layer_box.world_capitals"), "world_cities"], [i18next.t("app_page.layout_layer_box.tissot"), "tissot"]];

    make_confirm_dialog2("sampleLayoutDialogBox", i18next.t("app_page.layout_layer_box.title")).then(function (confirmed) {
        if (confirmed) {
            if (selec.layout && selec.layout.length > 0) {
                for (var i = 0; i < selec.layout.length; ++i) {
                    add_sample_geojson(selec.layout[i]);
                }
            }
        }
    });

    var box_body = d3.select(".sampleLayoutDialogBox").select(".modal-body").style("text-align", "center");
    box_body.node().parentElement.style.width = "auto";
    box_body.append('h3').html(i18next.t("app_page.layout_layer_box.msg_select_layer"));
    box_body.append("p").style("color", "grey").html(i18next.t("app_page.layout_layer_box.msg_select_multi"));

    var layout_layer_selec = box_body.append('p').html('').insert('select').attrs({ class: 'sample_layout', multiple: "multiple", size: layout_layers.length });
    layout_layers.forEach(function (layer_info) {
        layout_layer_selec.append("option").html(layer_info[0]).attr("value", layer_info[1]);
    });
    layout_layer_selec.on("change", function () {
        var selected_asArray = Array.prototype.slice.call(this.selectedOptions);
        selec.layout = selected_asArray.map(function (elem) {
            return elem.value;
        });
    });
    box_body.append("span").style("font-size", "0.65rem").html(i18next.t("app_page.layout_layer_box.disclamer_nuts"));
}

function add_sample_layer() {
    var existing_dialog = document.querySelector(".sampleDialogBox");
    if (existing_dialog) existing_dialog.remove();

    var fields_type_sample = new Map([['GrandParisMunicipalities', [{ "name": "DEP", "type": "category", "has_duplicate": true }, { "name": "IDCOM", "type": "id" }, { "name": "EPT", "type": "category", "has_duplicate": true }, { "name": "INC", "type": "stock" }, { "name": "LIBCOM", "type": "id" }, { "name": "LIBEPT", "type": "category", "has_duplicate": true }, { "name": "TH", "type": "stock" }, { "name": "UID", "type": "id" }, { "name": "IncPerTH", "type": "ratio" }]], ['martinique', [{ "name": "INSEE_COM", "type": "id" }, { "name": "NOM_COM", "type": "id", "not_number": true }, { "name": "STATUT", "type": "category", "has_duplicate": true }, { "name": "SUPERFICIE", "type": "stock" }, { "name": "P13_POP", "type": "stock" }, { "name": "P13_LOG", "type": "stock" }, { "name": "P13_LOGVAC", "type": "stock" }, { "name": "Part_Logements_Vacants", "type": "ratio" }]], ['nuts2-2013-data', [{ "name": "id", "type": "id", "not_number": true }, { "name": "name", "type": "id", "not_number": true }, { "name": "POP", "type": "stock" }, { "name": "GDP", "type": "stock" }, { "name": "UNEMP", "type": "ratio" }, { "name": "COUNTRY", "type": "category", "has_duplicate": true }]], ['brazil', [{ "name": "ADMIN_NAME", "type": "id", "not_number": true }, { "name": "Abbreviation", "type": "id", "not_number": true }, { "name": "Capital", "type": "id", "not_number": true }, { "name": "GDP_per_capita_2012", "type": "stock" }, { "name": "Life_expectancy_2014", "type": "ratio" }, { "name": "Pop2014", "type": "stock" }, { "name": "REGIONS", "type": "category", "has_duplicate": true }, { "name": "STATE2010", "type": "id" }, { "name": "popdensity2014", "type": "ratio" }]], ['world_countries_data', [{ "name": "ISO2", "type": "id", "not_number": true }, { "name": "ISO3", "type": "id", "not_number": true }, { "name": "ISONUM", "type": "id" }, { "name": "NAMEen", "type": "id", "not_number": true }, { "name": "NAMEfr", "type": "id", "not_number": true }, { "name": "UNRegion", "type": "category", "has_duplicate": true }, { "name": "GrowthRate", "type": "ratio" }, { "name": "PopDensity", "type": "ratio" }, { "name": "PopTotal", "type": "stock" }, { "name": "JamesBond", "type": "stock" }]], ['us_states', [{ "name": "NAME", "type": "id", "not_number": true }, { "name": "POPDENS1", "type": "ratio" }, { "name": "POPDENS2", "type": "ratio" }, { "name": "STUSPS", "type": "id", "not_number": true }, { "name": "pop2015_est", "type": "stock" }]]]);

    var dialog_res = [],
        selec,
        target_layers = [[i18next.t("app_page.sample_layer_box.target_layer"), ""], [i18next.t("app_page.sample_layer_box.grandparismunicipalities"), "GrandParisMunicipalities"], [i18next.t("app_page.sample_layer_box.martinique"), "martinique"], [i18next.t("app_page.sample_layer_box.nuts2_data"), "nuts2-2013-data"], [i18next.t("app_page.sample_layer_box.brazil"), "brazil"], [i18next.t("app_page.sample_layer_box.world_countries"), "world_countries_data"], [i18next.t("app_page.sample_layer_box.us_states"), "us_states"]];

    make_confirm_dialog2("sampleDialogBox", i18next.t("app_page.sample_layer_box.title")).then(function (confirmed) {
        if (confirmed) {
            if (selec) {
                add_sample_geojson(selec, { target_layer_on_add: true, fields_type: fields_type_sample.get(selec) });
            }
        }
    });

    var box_body = d3.select(".sampleDialogBox").select(".modal-body");
    var title_tgt_layer = box_body.append('h3').html(i18next.t("app_page.sample_layer_box.subtitle1"));

    var t_layer_selec = box_body.append('p').html("").insert('select').attr('class', 'sample_target');
    target_layers.forEach(function (layer_info) {
        t_layer_selec.append("option").html(layer_info[0]).attr("value", layer_info[1]);
    });
    t_layer_selec.on("change", function () {
        selec = this.value;
    });

    if (_app.targeted_layer_added) {
        title_tgt_layer.style("color", "grey").html("<i>" + i18next.t("app_page.sample_layer_box.subtitle1") + "</i>");
        t_layer_selec.node().disabled = true;
    }
}

function add_simplified_land_layer() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    options.skip_rescale = options.skip_rescale || false;
    options.stroke = options.stroke || "rgb(0,0,0)";
    options.fill = options.fill || "#d3d3d3";
    options.stroke_opacity = options.stroke_opacity || 0.0;
    options.fill_opacity = options.fill_opacity || 0.75;
    options.stroke_width = options.stroke_width || "0.3px";
    options.visible = options.visible === false ? false : true;

    d3.json("/static/data_sample/World.topojson", function (error, json) {
        _app.layer_to_id.set('World', 'World');
        _app.id_to_layer.set('World', 'World');
        current_layers["World"] = {
            "type": "Polygon",
            "n_features": 125,
            "stroke-width-const": +options.stroke_width.slice(0, -2),
            "fill_color": { single: options.fill }
        };
        map.insert("g", '.legend').attrs({ id: "World", class: "layer", "clip-path": "url(#clip)" }).style("stroke-width", options.stroke_width).selectAll('.subunit').data(topojson.feature(json, json.objects.World).features).enter().append('path').attr('d', path).styles({ stroke: options.stroke, fill: options.fill,
            "stroke-opacity": options.stroke_opacity, "fill-opacity": options.fill_opacity });
        create_li_layer_elem("World", null, "Polygon", "sample");
        if (!options.skip_rescale) {
            scale_to_lyr("World");
            center_map("World");
        }
        if (!options.visible) {
            handle_active_layer('World');
        }
        zoom_without_redraw();
    });
}

function add_sample_geojson(name, options) {
    var formToSend = new FormData();
    formToSend.append("layer_name", name);
    xhrequest("POST", '/cache_topojson/sample_data', formToSend, true).then(function (data) {
        add_layer_topojson(data, options);
    }).catch(function (err) {
        display_error_during_computation();
        console.log(err);
    });
}

function send_remove_server(layer_name) {
    var formToSend = new FormData();
    formToSend.append("layer_name", current_layers[layer_name].key_name);
    xhrequest("POST", '/layers/delete', formToSend, true).then(function (data) {
        data = JSON.parse(data);
        if (!data.code || data.code != "Ok") console.log(data);
    }).catch(function (err) {
        console.log(err);
    });
}

function get_map_xy0() {
    var bbox = svg_map.getBoundingClientRect();
    return { x: bbox.left, y: bbox.top };
}

function handleClickAddEllipse() {
    var getId = function getId() {
        var ellipses = document.getElementsByClassName("user_ellipse");
        if (!ellipses) {
            return 0;
        } else if (ellipses.length > 30) {
            swal(i18next.t("app_page.common.error"), i18next.t("app_page.common.error_max_arrows"), "error").catch(swal.noop);
            return null;
        } else {
            var ids = [];
            for (var i = 0; i < ellipses.length; i++) {
                ids.push(+ellipses[i].id.split("user_ellipse_")[1]);
            }
            if (ids.indexOf(ellipses.length) == -1) {
                return ellipses.length;
            } else {
                for (var _i2 = 0; _i2 < ellipses.length; _i2++) {
                    if (ids.indexOf(_i2) == -1) {
                        return _i2;
                    }
                }
            }
            return null;
        }
        return null;
    };

    var start_point = void 0,
        tmp_start_point = void 0,
        ellipse_id = getId();

    if (ellipse_id === null) {
        swal(i18next.t("app_page.common.error"), i18next.t("app_page.common.error_message", { msg: "" }), "error").catch(swal.noop);
        return;
    } else {
        ellipse_id = "user_ellipse_" + ellipse_id;
    }
    document.body.style.cursor = "not-allowed";
    map.style("cursor", "crosshair").on("click", function () {
        start_point = [d3.event.layerX, d3.event.layerY];
        tmp_start_point = map.append("rect").attrs({ x: start_point[0] - 2, y: start_point[1] - 2, height: 4, width: 4 }).style("fill", "red");
        setTimeout(function () {
            tmp_start_point.remove();
        }, 1000);
        map.style("cursor", "").on("click", null);
        document.body.style.cursor = "";
        new UserEllipse(ellipse_id, start_point, svg_map);
    });
}

function handleClickTextBox(text_box_id) {
    document.body.style.cursor = "not-allowed";
    map.style("cursor", "crosshair").on("click", function () {
        map.style("cursor", "").on("click", null);
        document.body.style.cursor = "";
        var text_box = new Textbox(svg_map, text_box_id, [d3.event.layerX, d3.event.layerY]);
        setTimeout(function (_) {
            text_box.editStyle();
        }, 350);
    });
}

function handleClickAddArrow() {
    var getId = function getId() {
        var arrows = document.getElementsByClassName("arrow");
        if (!arrows) {
            return 0;
        } else if (arrows.length > 30) {
            swal(i18next.t("app_page.common.error"), i18next.t("app_page.common.error_max_arrows"), "error").catch(swal.noop);
            return null;
        } else {
            var ids = [];
            for (var i = 0; i < arrows.length; i++) {
                ids.push(+arrows[i].id.split("arrow_")[1]);
            }
            if (ids.indexOf(arrows.length) == -1) {
                return arrows.length;
            } else {
                for (var _i3 = 0; _i3 < arrows.length; _i3++) {
                    if (ids.indexOf(_i3) == -1) {
                        return _i3;
                    }
                }
            }
            return null;
        }
        return null;
    };

    var start_point = void 0,
        tmp_start_point = void 0,
        end_point = void 0,
        tmp_end_point = void 0,
        arrow_id = getId();

    if (arrow_id === null) {
        swal(i18next.t("app_page.common.error"), i18next.t("app_page.common.error_message", { msg: "" }), "error").catch(swal.noop);
        return;
    } else {
        arrow_id = "arrow_" + arrow_id;
    }
    document.body.style.cursor = "not-allowed";
    map.style("cursor", "crosshair").on("click", function () {
        if (!start_point) {
            start_point = [d3.event.layerX, d3.event.layerY];
            tmp_start_point = map.append("rect").attrs({ x: start_point[0] - 2, y: start_point[1] - 2, height: 4, width: 4 }).style("fill", "red");
        } else {
            end_point = [d3.event.layerX, d3.event.layerY];
            tmp_end_point = map.append("rect").attrs({ x: end_point[0] - 2, y: end_point[1] - 2, height: 4, width: 4 }).style("fill", "red");
        }
        if (start_point && end_point) {
            setTimeout(function () {
                tmp_start_point.remove();
                tmp_end_point.remove();
            }, 1000);
            map.style("cursor", "").on("click", null);
            document.body.style.cursor = "";
            new UserArrow(arrow_id, start_point, end_point, svg_map);
        }
    });
}

function prepare_available_symbols() {
    return xhrequest('GET', '/static/json/list_symbols.json', null).then(function (list_res) {
        list_res = JSON.parse(list_res);
        return Q.all(list_res.map(function (name) {
            return xhrequest('GET', "/static/img/svg_symbols/" + name, null);
        })).then(function (symbols) {
            for (var i = 0; i < list_res.length; i++) {
                default_symbols.push([list_res[i], symbols[i]]);
            }
        });
    });
}

function accordionize() {
    var css_selector = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : ".accordion";
    var parent = arguments[1];

    parent = parent && (typeof parent === "undefined" ? "undefined" : _typeof(parent)) === "object" ? parent : parent && typeof parent === "string" ? document.querySelector(parent) : document;
    var acc = parent.querySelectorAll(css_selector),
        opened_css_selector = css_selector + ".active";
    for (var i = 0; i < acc.length; i++) {
        acc[i].onclick = function () {
            var opened = parent.querySelector(opened_css_selector);
            if (opened) {
                opened.classList.toggle("active");
                opened.nextElementSibling.classList.toggle("show");
            }
            if (!opened || opened.id != this.id) {
                this.classList.toggle("active");
                this.nextElementSibling.classList.toggle("show");
            }
        };
    }
}
"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function handle_join() {
    var layer_name = Object.getOwnPropertyNames(user_data);

    if (!(layer_name.length === 1 && joined_dataset.length === 1)) {
        swal("", i18next.t("app_page.join_box.unable_join"), "error");
        return;
    } else if (field_join_map.length != 0) {
        make_confirm_dialog2("dialogBox", undefined, { html_content: i18next.t("app_page.join_box.ask_forget_join") }).then(function (confirmed) {
            if (confirmed) {
                valid_join_check_display();
                field_join_map = [];
                remove_existing_jointure(layer_name);
                createJoinBox(layer_name[0]);
            }
        });
    } else if (user_data[layer_name].length != joined_dataset[0].length) {
        make_confirm_dialog2("dialogBox", undefined, { html_content: i18next.t("app_page.join_box.ask_diff_nb_features") }).then(function (confirmed) {
            if (confirmed) {
                createJoinBox(layer_name[0]);
            }
        });
    } else {
        createJoinBox(layer_name[0]);
    }
}

// Function called to update the menu according to user operation (triggered when layers/dataset are added and after a join operation)
function valid_join_check_display(val, prop) {
    if (!val) {
        var ext_dataset_img = document.getElementById("img_data_ext");
        ext_dataset_img.setAttribute("src", "/static/img/b/joinfalse.png");
        ext_dataset_img.setAttribute("alt", "Non-validated join");
        ext_dataset_img.style.width = "28px";
        ext_dataset_img.style.height = "28px";
        ext_dataset_img.onclick = handle_join;

        var join_sec = document.getElementById("join_section");
        join_sec.innerHTML = [prop, i18next.t('app_page.join_box.state_not_joined')].join('');

        var button = document.createElement("button");
        button.setAttribute("id", "join_button");
        button.style.display = "inline";
        button.innerHTML = '<button style="font-size: 11px;" class="button_st3" id="_join_button">' + i18next.t("app_page.join_box.button_join") + '</button>';
        button.onclick = handle_join;
        join_sec.appendChild(button);
    } else {
        var _ext_dataset_img = document.getElementById("img_data_ext");
        _ext_dataset_img.setAttribute("src", "/static/img/b/jointrue.png");
        _ext_dataset_img.setAttribute("alt", "Validated join");
        _ext_dataset_img.style.width = "28px";
        _ext_dataset_img.style.height = "28px";
        _ext_dataset_img.onclick = null;

        var _prop$split$map = prop.split("/").map(function (d) {
            return +d;
        }),
            _prop$split$map2 = _slicedToArray(_prop$split$map, 2),
            v1 = _prop$split$map2[0],
            v2 = _prop$split$map2[1];

        var _join_sec = document.getElementById("join_section");
        _join_sec.innerHTML = [' <b>', prop, i18next.t("app_page.join_box.match", { count: v1 }), '</b>'].join(' ');

        var _button = document.createElement("button");
        _button.setAttribute("id", "join_button");
        _button.style.display = "inline";
        _button.innerHTML = [" - <i> ", i18next.t("app_page.join_box.change_field"), " </i>"].join('');
        _button.onclick = handle_join;
        _join_sec.appendChild(_button);
    }
}

// Where the real join is done
// Its two main results are:
//    -the update of the global "field_join_map" array
//       (storing the relation between index of the geometry layer and index of the external dataset)
//    -the update of the global "user_data" object, adding actualy the value to each object representing each feature of the layer
function valid_join_on(layer_name, field1, field2) {
    var join_values1 = [],
        join_values2 = [],
        hits = 0,
        val = undefined;

    field_join_map = [];

    for (var i = 0, len = joined_dataset[0].length; i < len; i++) {
        join_values2.push(joined_dataset[0][i][field2]);
    }
    for (var _i = 0, _len = user_data[layer_name].length; _i < _len; _i++) {
        join_values1.push(user_data[layer_name][_i][field1]);
    }

    if (has_duplicate(join_values1) || has_duplicate(join_values2)) {
        swal("", i18next.t("app_page.join_box.error_not_uniques"), "warning");
        return;
    }

    if (typeof join_values1[0] === "number" && typeof join_values2[0] === "string") {
        for (var _i2 = 0, _len2 = join_values1.length; _i2 < _len2; _i2++) {
            val = join_values2.indexOf(String(join_values1[_i2]));
            if (val != -1) {
                field_join_map.push(val);hits++;
            } else {
                field_join_map.push(undefined);
            }
        }
    } else if (typeof join_values2[0] === "number" && typeof join_values1[0] === "string") {
        for (var _i3 = 0, _len3 = join_values1.length; _i3 < _len3; _i3++) {
            val = join_values2.indexOf(Number(join_values1[_i3]));
            if (val != -1) {
                field_join_map.push(val);hits++;
            } else {
                field_join_map.push(undefined);
            }
        }
    } else if (typeof join_values2[0] === "number" && typeof join_values1[0] === "number") {
        for (var _i4 = 0, _len4 = join_values1.length; _i4 < _len4; _i4++) {
            val = join_values2.indexOf(join_values1[_i4]);
            if (val != -1) {
                field_join_map.push(val);hits++;
            } else {
                field_join_map.push(undefined);
            }
        }
    } else {
        for (var _i5 = 0, _len5 = join_values1.length; _i5 < _len5; _i5++) {
            val = join_values2.indexOf(String(join_values1[_i5]));
            if (val != -1) {
                field_join_map.push(val);hits++;
            } else {
                field_join_map.push(undefined);
            }
        }
    }

    var prop = [hits, "/", join_values1.length].join(""),
        f_name = "";

    if (hits == join_values1.length) {
        swal({ title: "",
            text: i18next.t("app_page.common.success"),
            type: "success",
            allowOutsideClick: true });
        var fields_name_to_add = Object.getOwnPropertyNames(joined_dataset[0][0]);
        for (var _i6 = 0, _len6 = join_values1.length; _i6 < _len6; _i6++) {
            val = field_join_map[_i6];
            for (var j = 0, leng = fields_name_to_add.length; j < leng; j++) {
                f_name = fields_name_to_add[j];
                if (f_name.length > 0) {
                    user_data[layer_name][_i6][f_name] = joined_dataset[0][val][f_name];
                }
            }
        }
        valid_join_check_display(true, prop);
        return Promise.resolve(true);
    } else if (hits > 0) {
        return swal({ title: i18next.t("app_page.common.confirm") + "!",
            text: i18next.t("app_page.join_box.partial_join", { ratio: prop }),
            allowOutsideClick: false,
            allowEscapeKey: true,
            type: "question",
            showConfirmButton: true,
            showCancelButton: true,
            confirmButtonText: i18next.t("app_page.common.yes"),
            cancelButtonText: i18next.t("app_page.common.no")
        }).then(function () {
            var fields_name_to_add = Object.getOwnPropertyNames(joined_dataset[0][0]);
            // ,i_id = fields_name_to_add.indexOf("id");

            // if(i_id > -1){ fields_name_to_add.splice(i_id, 1); }
            for (var _i7 = 0, _len7 = field_join_map.length; _i7 < _len7; _i7++) {
                val = field_join_map[_i7];
                for (var _j = 0, _leng = fields_name_to_add.length; _j < _leng; _j++) {
                    f_name = fields_name_to_add[_j];
                    if (f_name.length > 0) {
                        var t_val = void 0;
                        if (val == undefined) t_val = null;else if (joined_dataset[0][val][f_name] == "") t_val = null;else t_val = joined_dataset[0][val][f_name];
                        user_data[layer_name][_i7][f_name] = val != undefined ? joined_dataset[0][val][f_name] : null;
                    }
                }
            }
            valid_join_check_display(true, prop);
            return Promise.resolve(true);
        }, function (dismiss) {
            field_join_map = [];
            return Promise.resolve(false);
        });
    } else {
        swal("", i18next.t("app_page.join_box.no_match", { field1: field1, field2: field2 }), "error");
        field_join_map = [];
        return Promise.resolve(false);
    }
}

// Function creating the join box , filled by to "select" input linked one to
// the geometry layer and the other to the external dataset, in order to choose
// the common field to do the join.
function createJoinBox(layer) {
    var geom_layer_fields = [].concat(_toConsumableArray(current_layers[layer].original_fields.keys())),
        ext_dataset_fields = Object.getOwnPropertyNames(joined_dataset[0][0]),
        button1 = ["<select id=button_field1>"],
        button2 = ["<select id=button_field2>"],
        last_choice = { "field1": geom_layer_fields[0], "field2": ext_dataset_fields[0] };

    for (var i = 0, len = geom_layer_fields.length; i < len; i++) {
        button1.push(['<option value="', geom_layer_fields[i], '">', geom_layer_fields[i], '</option>'].join(''));
    }button1.push("</select>");

    for (var _i8 = 0, _len8 = ext_dataset_fields.length; _i8 < _len8; _i8++) {
        if (ext_dataset_fields[_i8].length > 0) button2.push(['<option value="', ext_dataset_fields[_i8], '">', ext_dataset_fields[_i8], '</option>'].join(''));
    }button2.push("</select>");

    var inner_box = ['<p><b><i>', i18next.t("app_page.join_box.select_fields"), '</i></b></p>', '<div style="padding:10px"><p>', i18next.t("app_page.join_box.geom_layer_field"), '</p>', button1.join(''), '<em style="float:right;">(', layer, ')</em></div>', '<div style="padding:15px 10px 10px"><p>', i18next.t("app_page.join_box.ext_dataset_field"), '<br></p>', button2.join(''), '<em style="float:right;">(', dataset_name, '.csv)</em></div>', '<br><p><strong>', i18next.t("app_page.join_box.ask_join"), '<strong></p></div>'].join('');

    make_confirm_dialog2("joinBox", i18next.t("app_page.join_box.title"), { html_content: inner_box, widthFitContent: true }).then(function (confirmed) {
        if (confirmed) {
            valid_join_on(layer, last_choice.field1, last_choice.field2).then(function (valid) {
                if (valid) make_box_type_fields(layer);
            });
        }
    });

    d3.select(".joinBox").styles({ "text-align": "center", "line-height": "0.9em" });
    d3.select("#button_field1").style("float", "left").on("change", function () {
        last_choice.field1 = this.value;
    });
    d3.select("#button_field2").style("float", "left").on("change", function () {
        last_choice.field2 = this.value;
    });
}

var remove_existing_jointure = function remove_existing_jointure(layer_name) {
    if (!user_data[layer_name] || user_data[layer_name].length < 1) return;
    var data_layer = user_data[layer_name],
        original_fields = current_layers[layer_name].original_fields,
        field_difference = Object.getOwnPropertyNames(data_layer[0]).filter(function (f) {
        return !original_fields.has(f);
    }),
        nb_fields = field_difference.length;
    for (var i = 0, nb_ft = data_layer.length; i < nb_ft; i++) {
        for (var j = 0; j < nb_fields; j++) {
            delete data_layer[i][field_difference[j]];
        }
    }
};
"use strict";
// TODO : refactor some functions in this file (they are really too messy)

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function handle_click_layer(layer_name) {
    if (layer_name == "Graticule") createStyleBoxGraticule();else if (current_layers[layer_name].type == "Line") createStyleBox_Line(layer_name);else if (current_layers[layer_name].renderer && current_layers[layer_name].renderer.indexOf("PropSymbol") > -1) createStyleBox_ProbSymbol(layer_name);else if (current_layers[layer_name].renderer && current_layers[layer_name].renderer == "Label") createStyleBoxLabel(layer_name);else if (current_layers[layer_name].renderer && current_layers[layer_name].renderer == "TypoSymbols") createStyleBoxTypoSymbols(layer_name);else createStyleBox(layer_name);
    return;
};

function make_single_color_menu(layer, fill_prev) {
    var symbol = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "path";

    var fill_color_section = d3.select("#fill_color_section"),
        g_lyr_name = "#" + _app.layer_to_id.get(layer),
        last_color = fill_prev && fill_prev.single ? fill_prev.single : "#FFF";
    var block = fill_color_section.insert('p');
    block.insert("span").html(i18next.t("app_page.layer_style_popup.fill_color"));
    block.insert('input').style("float", "right").attrs({ type: 'color', "value": last_color }).on('change', function () {
        map.select(g_lyr_name).selectAll(symbol).transition().style("fill", this.value);
        current_layers[layer].fill_color = { "single": this.value };
    });
}

function make_random_color(layer) {
    var symbol = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "path";

    var block = d3.select("#fill_color_section");
    block.selectAll('span').remove();
    block.insert("span").styles({ "cursor": "pointer", "text-align": "center" }).html(i18next.t("app_page.layer_style_popup.toggle_colors")).on("click", function (d, i) {
        map.select("#" + _app.layer_to_id.get(layer)).selectAll(symbol).transition().style("fill", function () {
            return Colors.names[Colors.random()];
        });
        current_layers[layer].fill_color = { "random": true };
        make_random_color(layer, symbol);
    });
}

function fill_categorical(layer, field_name, symbol, color_cat_map) {
    map.select("#" + _app.layer_to_id.get(layer)).selectAll(symbol).transition().style("fill", function (d) {
        return color_cat_map.get(d.properties[field_name]);
    });
}

function make_categorical_color_menu(fields, layer, fill_prev) {
    var symbol = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "path";

    var fill_color_section = d3.select("#fill_color_section").append("p");
    fill_color_section.insert("span").html(i18next.t("app_page.layer_style_popup.categorical_field"));
    var field_selec = fill_color_section.insert("select");
    fields.forEach(function (field) {
        if (field != "id") field_selec.append("option").text(field).attr("value", field);
    });
    if (fill_prev.categorical && fill_prev.categorical instanceof Array) setSelected(field_selec.node(), fill_prev.categorical[0]);

    field_selec.on("change", function () {
        var field_name = this.value,
            data_layer = current_layers[layer].is_result ? result_data[layer] : user_data[layer],
            values = data_layer.map(function (i) {
            return i[field_name];
        }),
            cats = new Set(values),
            txt = [cats.size, " cat."].join('');
        d3.select("#nb_cat_txt").html(txt);
        var color_cat_map = new Map();
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = cats[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var val = _step.value;

                color_cat_map.set(val, Colors.names[Colors.random()]);
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }

        current_layers[layer].fill_color = { "categorical": [field_name, color_cat_map] };
        fill_categorical(layer, field_name, symbol, color_cat_map);
    });

    if ((!fill_prev || !fill_prev.categorical) && field_selec.node().options.length > 0) setSelected(field_selec.node(), field_selec.node().options[0].value);

    fill_color_section.append("span").attr("id", "nb_cat_txt").html("");
};

var cloneObj = function cloneObj(obj) {
    if (obj === null || (typeof obj === "undefined" ? "undefined" : _typeof(obj)) !== "object") return obj;else if (obj.toString() == "[object Map]") {
        return new Map(obj.entries());
    } else {
        return Object.assign({}, obj);
    }
};

function createStyleBoxTypoSymbols(layer_name) {
    function get_prev_settings() {
        var features = selection._groups[0];
        for (var i = 0; i < features.length; i++) {
            prev_settings.push({
                "display": features[i].style.display ? features[i].style.display : null,
                "size": features[i].getAttribute("width"),
                "position": [features[i].getAttribute("x"), features[i].getAttribute("y")]
            });
        }
        prev_settings_defaults["size"] = current_layers[layer_name].default_size;
    }

    function restore_prev_settings() {
        var features = selection._groups[0];
        for (var i = 0; i < features.length; i++) {
            features[i].setAttribute("width", prev_settings[i]["size"]);
            features[i].setAttribute("height", prev_settings[i]["size"]);
            features[i].setAttribute("x", prev_settings[i]["position"][0]);
            features[i].setAttribute("y", prev_settings[i]["position"][1]);
            features[i].style.display = prev_settings[i]["display"];
        }
        current_layers[layer_name].default_size = prev_settings_defaults.size;
    }

    var existing_box = document.querySelector(".styleBox");
    if (existing_box) existing_box.remove();

    var selection = map.select("#" + _app.layer_to_id.get(layer_name)).selectAll("image"),
        ref_layer_name = current_layers[layer_name].ref_layer_name,
        symbols_map = current_layers[layer_name].symbols_map,
        rendered_field = current_layers[layer_name].rendered_field;

    var prev_settings = [],
        prev_settings_defaults = {},
        zs = d3.zoomTransform(svg_map).k;

    get_prev_settings();

    make_confirm_dialog2("styleBox", layer_name, { top: true, widthFitContent: true, draggable: true }).then(function (confirmed) {
        if (!confirmed) {
            restore_prev_settings();
        }
    });

    var container = document.querySelector(".twbs > .styleBox");
    var popup = d3.select(container).select(".modal-content").style("width", "300px").select(".modal-body");

    popup.append("p").styles({ "text-align": "center", "color": "grey" }).html([i18next.t("app_page.layer_style_popup.rendered_field", { field: rendered_field }), i18next.t("app_page.layer_style_popup.reference_layer", { layer: ref_layer_name })].join(''));

    popup.append("p").style("text-align", "center").insert("button").attrs({ id: 'reset_symb_loc', class: 'button_st4' }).text(i18next.t("app_page.layer_style_popup.reset_symbols_location")).on("click", function () {
        selection.transition().attrs(function (d) {
            var centroid = path.centroid(d.geometry),
                size_symbol = symbols_map.get(d.properties.symbol_field)[1] / 2;
            return { x: centroid[0] - size_symbol, y: centroid[1] - size_symbol };
        });
    });

    popup.append("p").style("text-align", "center").insert("button").attr("id", "reset_symb_display").attr("class", "button_st4").text(i18next.t("app_page.layer_style_popup.redraw_symbols")).on("click", function () {
        selection.style("display", undefined);
    });

    var size_section = popup.append('p');
    size_section.append('span').html('Symbol sizes (will be applyed to all symbols)');
    size_section.append('input').attrs({ min: 0, max: 200, step: 'any', value: 32, type: 'number' }).styles({ width: '60px', margin: 'auto' }).on('change', function () {
        var value = this.value;
        selection.transition().attrs(function () {
            var current_size = this.height.baseVal.value;
            return { 'width': value + 'px', 'height': value + 'px',
                'x': this.x.baseVal.value + current_size / 2 - value / 2,
                'y': this.y.baseVal.value + current_size / 2 - value / 2 };
        });
    });
}
//    popup.append("p").style("text-align", "center")
//            .insert("button")
//            .attr("id","modif_symb")
//            .attr("class", "button_st4")
//            .text(i18next.t("app_page.layer_style_popup.modify_symbols"))
//            .on("click", function(){
//                display_box_symbol_typo(ref_layer_name, rendered_field)().then(function(confirmed){
//                    if(confirmed){
//                        rendering_params = {
//                            nb_cat: confirmed[0],
//                            symbols_map: confirmed[1],
//                            field: rendered_field
//                        };
//                        map.select("#" + layer_name)
//                            .selectAll("image")
//                            .attr("x", d => d.coords[0] - rendering_params.symbols_map.get(d.Symbol_field)[1] / 2)
//                            .attr("y", d => d.coords[1] - rendering_params.symbols_map.get(d.Symbol_field)[1] / 2)
//                            .attr("width", d => rendering_params.symbols_map.get(d.Symbol_field)[1] + "px")
//                            .attr("height", d => rendering_params.symbols_map.get(d.Symbol_field)[1] + "px")
//                            .attr("xlink:href", (d,i) => rendering_params.symbols_map.get(d.Symbol_field)[0]);
//                    }
//                });
//            });
//
// }

function createStyleBoxLabel(layer_name) {
    function get_prev_settings() {
        var features = selection._groups[0];
        prev_settings = [];
        for (var i = 0; i < features.length; i++) {
            prev_settings.push({
                "color": features[i].style.fill,
                "size": features[i].style.fontSize,
                "display": features[i].style.display ? features[i].style.display : null,
                "position": [features[i].getAttribute("x"), features[i].getAttribute("y")],
                "font": features[i].style.fontFamily
            });
        }
        prev_settings_defaults = {
            "color": current_layers[layer_name].fill_color,
            "size": current_layers[layer_name].default_size,
            "font": current_layers[layer_name].default_font
        };
    };

    function restore_prev_settings() {
        var features = selection._groups[0];
        for (var i = 0; i < features.length; i++) {
            features[i].style.fill = prev_settings[i]["color"];
            features[i].style.fontSize = prev_settings[i]["size"];
            features[i].style.display = prev_settings[i]["display"];
            features[i].setAttribute("x", prev_settings[i]["position"][0]);
            features[i].setAttribute("y", prev_settings[i]["position"][1]);
            features[i].style.fontFamily = prev_settings[i]["font"];
        }

        current_layers[layer_name].fill_color = prev_settings_defaults.color;
        current_layers[layer_name].default_size = prev_settings_defaults.size;
        current_layers[layer_name].default_font = prev_settings_defaults.font;
    };

    var existing_box = document.querySelector(".styleBox");
    if (existing_box) existing_box.remove();

    var selection = map.select("#" + _app.layer_to_id.get(layer_name)).selectAll("text"),
        ref_layer_name = current_layers[layer_name].ref_layer_name;

    var prev_settings = [],
        prev_settings_defaults = {},
        rendering_params = {};

    get_prev_settings();

    make_confirm_dialog2("styleBox", layer_name, { top: true, widthFitContent: true, draggable: true }).then(function (confirmed) {
        if (!confirmed) {
            restore_prev_settings();
        }
    });

    var container = document.querySelector(".twbs > .styleBox");
    var popup = d3.select(container).select(".modal-content").style("width", "300px").select(".modal-body");

    popup.append("p").styles({ "text-align": "center", "color": "grey" }).html([i18next.t("app_page.layer_style_popup.rendered_field", { field: current_layers[layer_name].rendered_field }), i18next.t("app_page.layer_style_popup.reference_layer", { layer: ref_layer_name })].join(''));
    popup.append("p").style("text-align", "center").insert("button").attr("id", "reset_labels_loc").attr("class", "button_st4").text(i18next.t("app_page.layer_style_popup.reset_labels_location")).on("click", function () {
        selection.transition().attrs(function (d) {
            var coords = path.centroid(d.geometry);
            return { x: coords[0], y: coords[1] };
        });
    });

    popup.append("p").style("text-align", "center").insert("button").attr("id", "reset_labels_display").attr("class", "button_st4").text(i18next.t("app_page.layer_style_popup.redraw_labels")).on("click", function () {
        selection.style("display", undefined);
    });

    popup.insert("p").style("text-align", "center").style("font-size", "9px").html(i18next.t("app_page.layer_style_popup.overrride_warning"));
    var label_sizes = popup.append("p").attr("class", "line_elem");
    label_sizes.append("span").html(i18next.t("app_page.layer_style_popup.labels_default_size"));
    label_sizes.insert("span").style("float", "right").html(" px");
    label_sizes.insert("input").styles({ "float": "right", "width": "70px" }).attr("type", "number").attr("value", +current_layers[layer_name].default_size.replace("px", "")).on("change", function () {
        var size = this.value + "px";
        current_layers[layer_name].default_size = size;
        selection.style("font-size", size);
    });

    var default_color = popup.insert("p").attr("class", "line_elem");
    default_color.append("span").html(i18next.t("app_page.layer_style_popup.labels_default_color"));
    default_color.insert("input").style('float', 'right').attrs({ "type": "color", "value": current_layers[layer_name].fill_color }).on("change", function () {
        current_layers[layer_name].fill_color = this.value;
        selection.transition().style("fill", this.value);
    });

    var font_section = popup.insert("p").attr("class", "line_elem");
    font_section.append("span").html(i18next.t("app_page.layer_style_popup.labels_default_font"));
    var choice_font = font_section.insert("select").style("float", "right").on("change", function () {
        current_layers[layer_name].default_font = this.value;
        selection.transition().style("font-family", this.value);
    });

    available_fonts.forEach(function (name) {
        choice_font.append("option").attr("value", name[1]).text(name[0]);
    });
    choice_font.node().value = current_layers[layer_name].default_font;
}

function createStyleBoxGraticule(layer_name) {
    var existing_box = document.querySelector(".styleBox");
    if (existing_box) existing_box.remove();
    var current_params = cloneObj(current_layers["Graticule"]);
    var selection = map.select("#Graticule > path");
    var selection_strokeW = map.select("#Graticule");

    make_confirm_dialog2("styleBox", layer_name, { top: true, widthFitContent: true, draggable: true }).then(function (confirmed) {
        if (confirmed) {
            null;
        } else {
            null;
        }
    });

    var container = document.querySelector(".twbs > .styleBox");
    var popup = d3.select(container).select(".modal-content").style("width", "300px").select(".modal-body");

    var color_choice = popup.append("p").attr("class", "line_elem");
    color_choice.append("span").html(i18next.t("app_page.layer_style_popup.color"));
    color_choice.append("input").style("float", "right").attrs({ type: "color", value: current_params.fill_color.single }).on("change", function () {
        selection.style("stroke", this.value);
        current_layers["Graticule"].fill_color.single = this.value;
    });

    var opacity_choice = popup.append("p").attr("class", "line_elem");
    opacity_choice.append("span").html(i18next.t("app_page.layer_style_popup.opacity"));
    opacity_choice.append("input").attrs({ type: "range", value: current_params.opacity, min: 0, max: 1, step: 0.1 }).styles({ "width": "58px", "vertical-align": "middle", "display": "inline", "float": "right" }).on("change", function () {
        selection.style("stroke-opacity", this.value);
        current_layers["Graticule"].opacity = +this.value;
        popup.select("#graticule_opacity_txt").html(+this.value * 100 + "%");
    });
    opacity_choice.append("span").attr("id", "graticule_opacity_txt").style("float", "right").html(current_params.opacity * 100 + '%');

    var stroke_width_choice = popup.append("p").attr("class", "line_elem");
    stroke_width_choice.append("span").html(i18next.t("app_page.layer_style_popup.width"));
    stroke_width_choice.append("input").attrs({ type: "number", value: current_params["stroke-width-const"] }).styles({ "width": "60px", "float": "right" }).on("change", function () {
        selection_strokeW.style("stroke-width", this.value);
        current_layers["Graticule"]["stroke-width-const"] = +this.value;
    });

    var steps_choice = popup.append("p").attr("class", "line_elem");
    steps_choice.append("span").html(i18next.t("app_page.layer_style_popup.graticule_steps"));
    steps_choice.append("input").attrs({ id: "graticule_range_steps", type: "range", value: current_params.step, min: 0, max: 100, step: 1 }).styles({ "vertical-align": "middle", "width": "58px", "display": "inline", "float": "right" }).on("change", function () {
        var next_layer = selection_strokeW.node().nextSibling;
        var step_val = +this.value,
            dasharray_val = +document.getElementById("graticule_dasharray_txt").value;
        current_layers["Graticule"].step = step_val;
        map.select("#Graticule").remove();
        map.append("g").attrs({ id: "Graticule", class: "layer" }).append("path").datum(d3.geoGraticule().step([step_val, step_val])).attrs({ class: "graticule", d: path, "clip-path": "url(#clip)" }).styles({ fill: "none", "stroke": current_layers["Graticule"].fill_color.single, "stroke-dasharray": dasharray_val });
        zoom_without_redraw();
        selection = map.select("#Graticule").selectAll("path");
        selection_strokeW = map.select("#Graticule");
        svg_map.insertBefore(selection_strokeW.node(), next_layer);
        popup.select("#graticule_step_txt").attr("value", step_val);
    });
    steps_choice.append("input").attrs({ type: "number", value: current_params.step, min: 0, max: 100, step: "any", class: "without_spinner", id: "graticule_step_txt" }).styles({ width: "30px", "margin-left": "10px", "float": "right" }).on("change", function () {
        var grat_range = document.getElementById("graticule_range_steps");
        grat_range.value = +this.value;
        grat_range.dispatchEvent(new MouseEvent("change"));
    });

    var dasharray_choice = popup.append("p").attr("class", "line_elem");
    dasharray_choice.append("span").html(i18next.t("app_page.layer_style_popup.graticule_dasharray"));
    dasharray_choice.append("input").attrs({ type: "range", value: current_params.dasharray, min: 0, max: 50, step: 0.1, id: "graticule_range_dasharray" }).styles({ "vertical-align": "middle", "width": "58px", "display": "inline", "float": "right" }).on("change", function () {
        selection.style("stroke-dasharray", this.value);
        current_layers["Graticule"].dasharray = +this.value;
        popup.select("#graticule_dasharray_txt").attr("value", this.value);
    });
    dasharray_choice.append("input").attrs({ type: "number", value: current_params.dasharray, min: 0, max: 100, step: "any", class: "without_spinner", id: "graticule_dasharray_txt" }).styles({ width: "30px", "margin-left": "10px", "float": "right" }).on("change", function () {
        var grat_range = document.getElementById("graticule_range_dasharray");
        grat_range.value = +this.value;
        grat_range.dispatchEvent(new MouseEvent("change"));
    });
}

function redraw_legend(type_legend, layer_name, field) {
    var _ref = type_legend === "default" ? [["#legend_root.lgdf_", _app.layer_to_id.get(layer_name)].join(''), createLegend_choro] : type_legend === "line_class" ? [["#legend_root_lines_class.lgdf_", _app.layer_to_id.get(layer_name)].join(''), createLegend_discont_links] : type_legend === "line_symbol" ? [["#legend_root_lines_symbol.lgdf_", _app.layer_to_id.get(layer_name)].join(''), createLegend_line_symbol] : undefined,
        _ref2 = _slicedToArray(_ref, 2),
        selector = _ref2[0],
        func = _ref2[1];

    var lgd = document.querySelector(selector);
    if (lgd) {
        var transform_param = lgd.getAttribute("transform"),
            lgd_title = lgd.querySelector("#legendtitle").innerHTML,
            lgd_subtitle = lgd.querySelector("#legendsubtitle").innerHTML,
            rounding_precision = lgd.getAttribute("rounding_precision"),
            note = lgd.querySelector("#legend_bottom_note").innerHTML,
            boxgap = lgd.getAttribute("boxgap");
        var rect_fill_value = lgd.getAttribute("visible_rect") == "true" ? {
            color: lgd.querySelector("#under_rect").style.fill,
            opacity: lgd.querySelector("#under_rect").style.fillOpacity
        } : undefined;

        if (type_legend == "default") {
            var no_data_txt = lgd.querySelector("#no_data_txt");
            no_data_txt = no_data_txt != null ? no_data_txt.textContent : null;

            lgd.remove();
            func(layer_name, field, lgd_title, lgd_subtitle, boxgap, rect_fill_value, rounding_precision, no_data_txt, note);
        } else {
            lgd.remove();
            func(layer_name, current_layers[layer_name].rendered_field, lgd_title, lgd_subtitle, rect_fill_value, rounding_precision, note);
        }
        lgd = document.querySelector(selector);
        if (transform_param) {
            lgd.setAttribute("transform", transform_param);
        }
    }
}

function createStyleBox_Line(layer_name) {
    var existing_box = document.querySelector(".styleBox");
    if (existing_box) existing_box.remove();
    var rendering_params = null,
        renderer = current_layers[layer_name].renderer,
        g_lyr_name = "#" + _app.layer_to_id.get(layer_name),
        selection = map.select(g_lyr_name).selectAll("path"),
        opacity = selection.style('fill-opacity');

    var lgd_to_change;

    var fill_prev = cloneObj(current_layers[layer_name].fill_color),
        prev_col_breaks;

    if (current_layers[layer_name].colors_breaks && current_layers[layer_name].colors_breaks instanceof Array) prev_col_breaks = current_layers[layer_name].colors_breaks.concat([]);

    var stroke_prev = selection.style('stroke'),
        border_opacity = selection.style('stroke-opacity'),
        stroke_width = +current_layers[layer_name]['stroke-width-const'],
        prev_min_display,
        prev_size,
        prev_breaks;

    if (stroke_prev.startsWith("rgb")) stroke_prev = rgb2hex(stroke_prev);

    var table = [];
    Array.prototype.forEach.call(svg_map.querySelector(g_lyr_name).querySelectorAll('path'), function (d) {
        table.push(d.__data__.properties);
    });

    var redraw_prop_val = function redraw_prop_val(prop_values) {
        var selec = selection._groups[0];
        for (var i = 0, len = prop_values.length; i < len; i++) {
            selec[i].style.strokeWidth = prop_values[i];
        }
    };

    make_confirm_dialog2("styleBox", layer_name, { top: true, widthFitContent: true, draggable: true }).then(function (confirmed) {
        if (confirmed) {
            if (renderer != undefined && rendering_params != undefined && renderer != "Categorical" && renderer != "PropSymbolsTypo") {
                current_layers[layer_name].fill_color = { "class": rendering_params.colorsByFeature };
                var colors_breaks = [];
                for (var i = rendering_params['breaks'].length - 1; i > 0; --i) {
                    colors_breaks.push([[rendering_params['breaks'][i - 1], " - ", rendering_params['breaks'][i]].join(''), rendering_params['colors'][i - 1]]);
                }
                current_layers[layer_name].colors_breaks = colors_breaks;
                current_layers[layer_name].rendered_field = rendering_params.field;
                current_layers[layer_name].options_disc = {
                    schema: rendering_params.schema,
                    colors: rendering_params.colors,
                    no_data: rendering_params.no_data,
                    type: rendering_params.type,
                    breaks: rendering_params.breaks
                };
                redraw_legend('default', layer_name, rendering_params.field);
            } else if (renderer == "Categorical" || renderer == "PropSymbolsTypo") {
                current_layers[layer_name].color_map = rendering_params.color_map;
                current_layers[layer_name].fill_color = { 'class': [].concat(rendering_params.colorsByFeature) };
                redraw_legend('default', layer_name, rendering_params.field);
            } else if (renderer == "DiscLayer") {
                selection.each(function (d) {
                    d.properties.prop_val = this.style.strokeWidth;
                });
                // Also change the legend if there is one displayed :
                redraw_legend('line_class', layer_name);
            } else if (renderer == "Links") {
                selection.each(function (d, i) {
                    current_layers[layer_name].linksbyId[i][2] = this.style.strokeWidth;
                });
                // Also change the legend if there is one displayed :
                redraw_legend('line_class', layer_name);
            }

            if (renderer.startsWith('PropSymbols')) {
                redraw_legend('line_symbol', layer_name);
            }

            zoom_without_redraw();
        } else {
            // Reset to original values the rendering parameters if "no" is clicked
            selection.style('fill-opacity', opacity).style('stroke-opacity', border_opacity);
            var zoom_scale = +d3.zoomTransform(map.node()).k;
            map.select(g_lyr_name).style('stroke-width', stroke_width / zoom_scale + "px");
            current_layers[layer_name]['stroke-width-const'] = stroke_width;
            var fill_meth = Object.getOwnPropertyNames(fill_prev)[0];

            if (current_layers[layer_name].renderer == "Links" && prev_min_display != undefined) {
                current_layers[layer_name].min_display = prev_min_display;
                current_layers[layer_name].breaks = prev_breaks;
                selection.style('fill-opacity', 0).style("stroke", fill_prev.single).style("display", function (d) {
                    return +d.properties.fij > prev_min_display ? null : "none";
                }).style("stroke-opacity", border_opacity).style("stroke-width", function (d, i) {
                    return current_layers[layer_name].linksbyId[i][2];
                });
            } else if (current_layers[layer_name].renderer == "DiscLayer" && prev_min_display != undefined) {
                (function () {
                    current_layers[layer_name].min_display = prev_min_display;
                    current_layers[layer_name].size = prev_size;
                    current_layers[layer_name].breaks = prev_breaks;
                    var lim = prev_min_display != 0 ? prev_min_display * current_layers[layer_name].n_features : -1;
                    selection.style('fill-opacity', 0).style("stroke", fill_prev.single).style("stroke-opacity", border_opacity).style("display", function (d, i) {
                        return +i <= lim ? null : "none";
                    }).style('stroke-width', function (d) {
                        return d.properties.prop_val;
                    });
                })();
            } else {
                if (fill_meth == "single") selection.style("stroke", fill_prev.single).style("stroke-opacity", border_opacity);else if (fill_meth == "random") selection.style("stroke-opacity", border_opacity).style("stroke", function () {
                    return Colors.name[Colors.random()];
                });else if (fill_meth == "class" && renderer == "Links") selection.style('stroke-opacity', function (d, i) {
                    return current_layers[layer_name].linksbyId[i][0];
                }).style("stroke", stroke_prev);
            }
            if (current_layers[layer_name].colors_breaks) current_layers[layer_name].colors_breaks = prev_col_breaks;
            current_layers[layer_name].fill_color = fill_prev;
            zoom_without_redraw();
        }
    });

    var container = document.querySelector(".twbs > .styleBox");
    var popup = d3.select(container).select(".modal-content").style("width", "300px").select(".modal-body");

    if (renderer == "Categorical" || renderer == "PropSymbolsTypo") {
        (function () {
            var color_field = renderer === "Categorical" ? current_layers[layer_name].rendered_field : current_layers[layer_name].rendered_field2;

            popup.insert('p').style("margin", "auto").html("").append("button").attr("class", "button_disc").styles({ "font-size": "0.8em", "text-align": "center" }).html(i18next.t("app_page.layer_style_popup.choose_colors")).on("click", function () {
                var _prepare_categories_a = prepare_categories_array(layer_name, color_field, current_layers[layer_name].color_map),
                    _prepare_categories_a2 = _slicedToArray(_prepare_categories_a, 2),
                    cats = _prepare_categories_a2[0],
                    _ = _prepare_categories_a2[1];

                container.modal.hide();
                display_categorical_box(result_data[layer_name], layer_name, color_field, cats).then(function (confirmed) {
                    container.modal.show();
                    if (confirmed) {
                        rendering_params = {
                            nb_class: confirmed[0], color_map: confirmed[1], colorsByFeature: confirmed[2],
                            renderer: "Categorical", rendered_field: color_field
                        };
                        selection.transition().style('stroke', function (d, i) {
                            return rendering_params.colorsByFeature[i];
                        });
                        lgd_to_change = true;
                    }
                });
            });
        })();
    } else if (renderer == "Choropleth" || renderer == "PropSymbolsChoro") {
        popup.append('p').styles({ margin: 'auto', 'text-align': 'center' }).append("button").attr("class", "button_disc").html(i18next.t("app_page.layer_style_popup.choose_discretization")).on("click", function () {
            container.modal.hide();
            display_discretization(layer_name, current_layers[layer_name].rendered_field, current_layers[layer_name].colors_breaks.length, current_layers[layer_name].options_disc).then(function (confirmed) {
                container.modal.show();
                if (confirmed) {
                    rendering_params = {
                        nb_class: confirmed[0],
                        type: confirmed[1],
                        breaks: confirmed[2],
                        colors: confirmed[3],
                        colorsByFeature: confirmed[4],
                        schema: confirmed[5],
                        no_data: confirmed[6],
                        //  renderer:"Choropleth",
                        field: current_layers[layer_name].rendered_field
                    };
                    selection.transition().style("stroke", function (d, i) {
                        return rendering_params.colorsByFeature[i];
                    });
                }
            });
        });
    } else {
        var c_section = popup.append('p').attr("class", "line_elem");
        c_section.insert("span").html(i18next.t("app_page.layer_style_popup.color"));
        c_section.insert('input').attrs({ type: "color", value: stroke_prev }).style("float", "right").on('change', function () {
            lgd_to_change = true;
            selection.style("stroke", this.value);
            current_layers[layer_name].fill_color.single = this.value;
        });
    }

    if (renderer == "Links") {
        (function () {
            prev_min_display = current_layers[layer_name].min_display || 0;
            prev_breaks = current_layers[layer_name].breaks.slice();
            var max_val = 0;
            selection.each(function (d) {
                if (+d.properties.fij > max_val) max_val = d.properties.fij;
            });
            var threshold_section = popup.append('p').attr("class", "line_elem");
            threshold_section.append("span").html(i18next.t("app_page.layer_style_popup.display_flow_larger"));
            // The legend will be updated in order to start on the minimum value displayed instead of
            //   using the minimum value of the serie (skipping unused class if necessary)
            threshold_section.insert('input').attrs({ type: 'range', min: 0, max: max_val, step: 0.5, value: prev_min_display }).styles({ width: "58px", "vertical-align": "middle", "display": "inline", "float": "right", "margin-right": "0px" }).on("change", function () {
                lgd_to_change = true;
                var val = +this.value;
                popup.select("#larger_than").html(["<i> ", val, " </i>"].join(''));
                selection.style("display", function (d) {
                    return +d.properties.fij > val ? null : "none";
                });
                current_layers[layer_name].min_display = val;
            });
            threshold_section.insert('label').attr("id", "larger_than").style("float", "right").html(["<i> ", prev_min_display, " </i>"].join(''));
            popup.append('p').style('text-align', 'center').append("button").attr("class", "button_disc").html(i18next.t("app_page.layer_style_popup.modify_size_class")).on("click", function () {
                container.modal.hide();
                display_discretization_links_discont(layer_name, current_layers[layer_name].rendered_field, current_layers[layer_name].breaks.length, "user_defined").then(function (result) {
                    container.modal.show();
                    if (result) {
                        (function () {
                            var serie = result[0],
                                sizes = result[1].map(function (ft) {
                                return ft[1];
                            }),
                                links_byId = current_layers[layer_name].linksbyId;

                            lgd_to_change = true;
                            serie.setClassManually(result[2]);
                            current_layers[layer_name].breaks = result[1];
                            selection.style('fill-opacity', 0).style("stroke-width", function (d, i) {
                                return sizes[serie.getClass(+links_byId[i][1])];
                            });
                        })();
                    }
                });
            });
        })();
    } else if (renderer == "DiscLayer") {
        prev_min_display = current_layers[layer_name].min_display || 0;
        prev_size = current_layers[layer_name].size.slice();
        prev_breaks = current_layers[layer_name].breaks.slice();
        var max_val = Math.max.apply(null, result_data[layer_name].map(function (i) {
            return i.disc_value;
        }));
        var disc_part = popup.append("p").attr("class", "line_elem");
        disc_part.append("span").html(i18next.t("app_page.layer_style_popup.discont_threshold"));
        disc_part.insert("input").attrs({ type: "range", min: 0, max: 1, step: 0.1, value: prev_min_display }).styles({ width: "58px", "vertical-align": "middle", "display": "inline", "float": "right", "margin-right": "0px" }).on("change", function () {
            lgd_to_change = true;
            var val = +this.value;
            var lim = val != 0 ? val * current_layers[layer_name].n_features : -1;
            popup.select("#larger_than").html(["<i> ", val * 100, " % </i>"].join(''));
            selection.style("display", function (d, i) {
                return i <= lim ? null : "none";
            });
            current_layers[layer_name].min_display = val;
        });
        disc_part.insert('label').attr("id", "larger_than").style("float", "right").html(["<i> ", prev_min_display * 100, " % </i>"].join(''));
        popup.append('p').style('text-align', 'center').append("button").attr("class", "button_disc").html(i18next.t("app_page.layer_style_popup.choose_discretization")).on("click", function () {
            container.modal.hide();
            display_discretization_links_discont(layer_name, "disc_value", current_layers[layer_name].breaks.length, "user_defined").then(function (result) {
                container.modal.show();
                if (result) {
                    (function () {
                        var serie = result[0],
                            sizes = result[1].map(function (ft) {
                            return ft[1];
                        });

                        lgd_to_change = true;
                        serie.setClassManually(result[2]);
                        current_layers[layer_name].breaks = result[1];
                        current_layers[layer_name].size = [sizes[0], sizes[sizes.length - 1]];
                        selection.style('fill-opacity', 0).style("stroke-width", function (d, i) {
                            return sizes[serie.getClass(+d.properties.disc_value)];
                        });
                    })();
                }
            });
        });
    }

    var opacity_section = popup.append('p').attr("class", "line_elem");
    opacity_section.insert("span").html(i18next.t("app_page.layer_style_popup.opacity"));
    opacity_section.insert('input').attrs({ type: "range", min: 0, max: 1, step: 0.1, value: border_opacity }).styles({ "width": "58px", "vertical-align": "middle", "display": "inline", "float": "right" }).on('change', function () {
        opacity_section.select("#opacity_val_txt").html(" " + this.value);
        selection.style('stroke-opacity', this.value);
    });

    opacity_section.append("span").attr("id", "opacity_val_txt").style("display", "inline").style("float", "right").html(" " + border_opacity);

    if (!renderer || !renderer.startsWith('PropSymbols') && renderer != "DiscLayer" && renderer != "Links") {
        var width_section = popup.append('p');
        width_section.append("span").html(i18next.t("app_page.layer_style_popup.width"));
        width_section.insert('input').attrs({ type: "number", min: 0, step: 0.1, value: stroke_width }).styles({ "width": "60px", "float": "right" }).on('change', function () {
            var val = +this.value;
            var zoom_scale = +d3.zoomTransform(map.node()).k;
            map.select(g_lyr_name).style("stroke-width", val / zoom_scale + "px");
            current_layers[layer_name]['stroke-width-const'] = val;
        });
    } else if (renderer.startsWith('PropSymbols')) {
        (function () {
            var field_used = current_layers[layer_name].rendered_field;
            var d_values = result_data[layer_name].map(function (f) {
                return +f[field_used];
            });
            var prop_val_content = popup.append("p");
            prop_val_content.append("span").html(i18next.t("app_page.layer_style_popup.field_symbol_size", { field: current_layers[layer_name].rendered_field }));
            prop_val_content.append('span').html(i18next.t("app_page.layer_style_popup.symbol_fixed_size"));
            prop_val_content.insert('input').styles({ width: "60px", float: "right" }).attrs({ type: "number", id: "max_size_range", min: 0.1, step: "any", value: current_layers[layer_name].size[1] }).on("change", function () {
                var f_size = +this.value,
                    prop_values = prop_sizer3_e(d_values, current_layers[layer_name].size[0], f_size, "line");
                current_layers[layer_name].size[1] = f_size;
                redraw_prop_val(prop_values);
            });
            prop_val_content.append("span").style("float", "right").html('(px)');

            var prop_val_content2 = popup.append("p").attr("class", "line_elem");
            prop_val_content2.append("span").html(i18next.t("app_page.layer_style_popup.on_value"));
            prop_val_content2.insert("input").styles({ width: "100px", float: "right" }).attrs({ type: "number", min: 0.1, step: 0.1, value: +current_layers[layer_name].size[0] }).on("change", function () {
                var f_val = +this.value,
                    prop_values = prop_sizer3_e(d_values, f_val, current_layers[layer_name].size[1], "line");
                redraw_prop_val(prop_values);
                current_layers[layer_name].size[0] = f_val;
            });
        })();
    }

    make_generate_labels_section(popup, layer_name);
}

function createStyleBox(layer_name) {
    var existing_box = document.querySelector(".styleBox");
    if (existing_box) existing_box.remove();
    var type = current_layers[layer_name].type,
        rendering_params = null,
        renderer = current_layers[layer_name].renderer,
        g_lyr_name = "#" + _app.layer_to_id.get(layer_name),
        selection = map.select(g_lyr_name).selectAll("path"),
        opacity = selection.style('fill-opacity');

    var lgd_to_change;

    var fill_prev = cloneObj(current_layers[layer_name].fill_color),
        prev_col_breaks;

    if (current_layers[layer_name].colors_breaks && current_layers[layer_name].colors_breaks instanceof Array) prev_col_breaks = current_layers[layer_name].colors_breaks.concat([]);

    var stroke_prev = selection.style('stroke'),
        border_opacity = selection.style('stroke-opacity'),
        stroke_width = +current_layers[layer_name]['stroke-width-const'],
        prev_min_display,
        prev_size,
        prev_breaks;

    if (stroke_prev.startsWith("rgb")) stroke_prev = rgb2hex(stroke_prev);

    var table = [];
    Array.prototype.forEach.call(svg_map.querySelector(g_lyr_name).querySelectorAll('path'), function (d) {
        table.push(d.__data__.properties);
    });
    if (layer_name != "Sphere") var fields_layer = current_layers[layer_name].fields_type || type_col2(table);else {
        var fields_layer = [];
    }
    make_confirm_dialog2("styleBox", layer_name, { top: true, widthFitContent: true, draggable: true }).then(function (confirmed) {
        if (confirmed) {
            // Update the object holding the properties of the layer if Yes is clicked
            if (type === "Point" && current_layers[layer_name].pointRadius) {
                current_layers[layer_name].pointRadius = +current_pt_size;
            }
            if (renderer != undefined && rendering_params != undefined && renderer != "Stewart" && renderer != "Categorical") {
                current_layers[layer_name].fill_color = { "class": rendering_params.colorsByFeature };
                var colors_breaks = [];
                for (var i = rendering_params['breaks'].length - 1; i > 0; --i) {
                    colors_breaks.push([[rendering_params['breaks'][i - 1], " - ", rendering_params['breaks'][i]].join(''), rendering_params['colors'][i - 1]]);
                }
                current_layers[layer_name].colors_breaks = colors_breaks;
                current_layers[layer_name].rendered_field = rendering_params.field;
                current_layers[layer_name].options_disc = {
                    schema: rendering_params.schema,
                    colors: rendering_params.colors,
                    no_data: rendering_params.no_data,
                    type: rendering_params.type,
                    breaks: rendering_params.breaks
                };
            } else if (renderer == "Stewart") {
                current_layers[layer_name].colors_breaks = rendering_params.breaks;
                current_layers[layer_name].fill_color.class = rendering_params.breaks.map(function (obj) {
                    return obj[1];
                });
            } else if (renderer == "Categorical") {
                current_layers[layer_name].color_map = rendering_params.color_map;
                current_layers[layer_name].fill_color = { 'class': [].concat(rendering_params.colorsByFeature) };
            }

            if (lgd_to_change || rendering_params) {
                redraw_legend('default', layer_name, rendering_params.field);
            }
            zoom_without_redraw();
        } else {
            // Reset to original values the rendering parameters if "no" is clicked
            selection.style('fill-opacity', opacity).style('stroke-opacity', border_opacity);
            var zoom_scale = +d3.zoomTransform(map.node()).k;
            map.select(g_lyr_name).style('stroke-width', stroke_width / zoom_scale + "px");
            current_layers[layer_name]['stroke-width-const'] = stroke_width;
            var fill_meth = Object.getOwnPropertyNames(fill_prev)[0];
            if (type === "Point" && current_layers[layer_name].pointRadius) {
                selection.attr("d", path.pointRadius(+current_layers[layer_name].pointRadius));
            } else {
                if (current_layers[layer_name].renderer == "Stewart") {
                    recolor_stewart(prev_palette.name, prev_palette.reversed);
                } else if (fill_meth == "single") {
                    selection.style('fill', fill_prev.single).style('stroke', stroke_prev);
                } else if (fill_meth == "class") {
                    selection.style('fill-opacity', opacity).style("fill", function (d, i) {
                        return fill_prev.class[i];
                    }).style('stroke-opacity', border_opacity).style("stroke", stroke_prev);
                } else if (fill_meth == "random") {
                    selection.style('fill', function () {
                        return Colors.name[Colors.random()];
                    }).style('stroke', stroke_prev);
                } else if (fill_meth == "categorical") {
                    fill_categorical(layer_name, fill_prev.categorical[0], "path", fill_prev.categorical[1]);
                }
            }
            if (current_layers[layer_name].colors_breaks) current_layers[layer_name].colors_breaks = prev_col_breaks;
            current_layers[layer_name].fill_color = fill_prev;
            zoom_without_redraw();
        }
    });

    var container = document.querySelector(".twbs > .styleBox");
    var popup = d3.select(container).select(".modal-content").style("width", "300px").select(".modal-body");

    if (type === "Point") {
        var current_pt_size = current_layers[layer_name].pointRadius;
        var pt_size = popup.append("p").attr("class", "line_elem");
        pt_size.append("span").html(i18next.t("app_page.layer_style_popup.point_radius"));
        pt_size.append("input").attrs({ type: "range", min: 0, max: 80, value: current_pt_size, id: 'point_radius_size' }).styles({ "width": "58px", "vertical-align": "middle", "display": "inline", "float": "right", "margin-right": "0px" }).on("change", function () {
            current_pt_size = +this.value;
            document.getElementById("point_radius_size_txt").value = current_pt_size;
            selection.attr("d", path.pointRadius(current_pt_size));
        });
        pt_size.append("input").attrs({ type: "number", value: +current_pt_size, min: 0, max: 80, step: "any", class: "without_spinner", id: 'point_radius_size_txt' }).styles({ width: "30px", "margin-left": "10px", "float": "right" }).on("change", function () {
            var pt_size_range = document.getElementById("point_radius_size"),
                old_value = pt_size_range.value;
            if (this.value == "" || isNaN(+this.value)) {
                this.value = old_value;
            } else {
                this.value = round_value(+this.value, 2);
                pt_size_range.value = this.value;
                selection.attr("d", path.pointRadius(this.value));
            }
        });
    }

    if (current_layers[layer_name].colors_breaks == undefined && renderer != "Categorical") {
        if (current_layers[layer_name].targeted || current_layers[layer_name].is_result) {
            (function () {
                var fields = getFieldsType('category', null, fields_layer);
                var fill_method = popup.append("p").html(i18next.t("app_page.layer_style_popup.fill_color")).insert("select");
                [[i18next.t("app_page.layer_style_popup.single_color"), "single"], [i18next.t("app_page.layer_style_popup.categorical_color"), "categorical"], [i18next.t("app_page.layer_style_popup.random_color"), "random"]].forEach(function (d, i) {
                    fill_method.append("option").text(d[0]).attr("value", d[1]);
                });
                popup.append('div').attrs({ id: "fill_color_section" });
                fill_method.on("change", function () {
                    d3.select("#fill_color_section").html("").on("click", null);
                    if (this.value == "single") make_single_color_menu(layer_name, fill_prev);else if (this.value == "categorical") make_categorical_color_menu(fields, layer_name, fill_prev);else if (this.value == "random") make_random_color(layer_name);
                });
                setSelected(fill_method.node(), Object.getOwnPropertyNames(fill_prev)[0]);
            })();
        } else {
            popup.append('div').attrs({ id: "fill_color_section" });
            make_single_color_menu(layer_name, fill_prev);
        }
    } else if (renderer == "Categorical") {
        (function () {
            var rendered_field = current_layers[layer_name].rendered_field;

            popup.insert('p').styles({ "margin": "auto", "text-align": "center" }).html("").append("button").attr("class", "button_disc").html(i18next.t("app_page.layer_style_popup.choose_colors")).on("click", function () {
                container.modal.hide();

                var _prepare_categories_a3 = prepare_categories_array(layer_name, rendered_field, current_layers[layer_name].color_map),
                    _prepare_categories_a4 = _slicedToArray(_prepare_categories_a3, 2),
                    cats = _prepare_categories_a4[0],
                    _ = _prepare_categories_a4[1];

                display_categorical_box(result_data[layer_name], layer_name, rendered_field, cats).then(function (confirmed) {
                    container.modal.show();
                    if (confirmed) {
                        rendering_params = {
                            nb_class: confirmed[0], color_map: confirmed[1], colorsByFeature: confirmed[2],
                            renderer: "Categorical", rendered_field: rendered_field
                        };
                        selection.transition().style('fill', function (d, i) {
                            return rendering_params.colorsByFeature[i];
                        });
                        lgd_to_change = true;
                    }
                });
            });
        })();
    } else if (renderer == "Choropleth") {
        popup.append('p').styles({ margin: 'auto', 'text-align': 'center' }).append("button").attr("class", "button_disc").html(i18next.t("app_page.layer_style_popup.choose_discretization")).on("click", function () {
            container.modal.hide();
            display_discretization(layer_name, current_layers[layer_name].rendered_field, current_layers[layer_name].colors_breaks.length,
            //  "quantiles",
            current_layers[layer_name].options_disc).then(function (confirmed) {
                container.modal.show();
                if (confirmed) {
                    rendering_params = {
                        nb_class: confirmed[0],
                        type: confirmed[1],
                        breaks: confirmed[2],
                        colors: confirmed[3],
                        colorsByFeature: confirmed[4],
                        schema: confirmed[5],
                        no_data: confirmed[6],
                        //  renderer:"Choropleth",
                        field: current_layers[layer_name].rendered_field
                    };
                    var opacity_val = fill_opacity_section ? +fill_opacity_section.node().value : 0.9;
                    selection.transition().style("fill", function (d, i) {
                        return rendering_params.colorsByFeature[i];
                    });
                }
            });
        });
    } else if (renderer == "Gridded") {
        (function () {
            var field_to_discretize = current_layers[layer_name].rendered_field;
            popup.append('p').style("margin", "auto").style("text-align", "center").append("button").attr("class", "button_disc").html(i18next.t("app_page.layer_style_popup.choose_discretization")).on("click", function () {
                container.modal.hide();
                display_discretization(layer_name, field_to_discretize, current_layers[layer_name].colors_breaks.length,
                //  "quantiles",
                current_layers[layer_name].options_disc).then(function (confirmed) {
                    container.modal.show();
                    if (confirmed) {
                        rendering_params = {
                            nb_class: confirmed[0],
                            type: confirmed[1],
                            breaks: confirmed[2],
                            colors: confirmed[3],
                            colorsByFeature: confirmed[4],
                            schema: confirmed[5],
                            no_data: confirmed[6],
                            renderer: "Choropleth",
                            field: field_to_discretize
                        };
                        var opacity_val = fill_opacity_section ? +fill_opacity_section.node().value : 0.9;
                        selection.transition().style("fill", function (d, i) {
                            return rendering_params.colorsByFeature[i];
                        });
                    }
                });
            });
        })();
    } else if (renderer == "Stewart") {
        var prev_palette;
        var recolor_stewart;
        var color_palette_section;

        (function () {
            var field_to_colorize = "min",
                nb_ft = current_layers[layer_name].n_features;
            prev_palette = cloneObj(current_layers[layer_name].color_palette);

            rendering_params = { breaks: [].concat(current_layers[layer_name].colors_breaks) };

            recolor_stewart = function recolor_stewart(coloramp_name, reversed) {
                var new_coloramp = getColorBrewerArray(nb_ft, coloramp_name);
                if (reversed) new_coloramp.reverse();
                for (var i = 0; i < nb_ft; ++i) {
                    rendering_params.breaks[i][1] = new_coloramp[i];
                }selection.transition().style("fill", function (d, i) {
                    return new_coloramp[i];
                });
                current_layers[layer_name].color_palette = { name: coloramp_name, reversed: reversed };
            };

            color_palette_section = popup.insert("p").attr("class", "line_elem");

            color_palette_section.append("span").html(i18next.t("app_page.layer_style_popup.color_palette"));
            var seq_color_select = color_palette_section.insert("select").attr("id", "coloramp_params").style('float', 'right').on("change", function () {
                recolor_stewart(this.value, false);
            });

            ['Blues', 'BuGn', 'BuPu', 'GnBu', 'OrRd', 'PuBu', 'PuBuGn', 'PuRd', 'RdPu', 'YlGn', 'Greens', 'Greys', 'Oranges', 'Purples', 'Reds'].forEach(function (name) {
                seq_color_select.append("option").text(name).attr("value", name);
            });
            seq_color_select.node().value = prev_palette.name;
            popup.insert('p').attr('class', 'line_elem').styles({ 'text-align': 'center', 'margin': '0 !important' }).insert("button").attrs({ "class": "button_st3", "id": "reverse_colramp" }).html(i18next.t("app_page.layer_style_popup.reverse_palette")).on("click", function () {
                var pal_name = document.getElementById("coloramp_params").value;
                recolor_stewart(pal_name, true);
            });
        })();
    }
    var fill_opacity_section = popup.append('p').attr("class", "line_elem");
    fill_opacity_section.append("span").html(i18next.t("app_page.layer_style_popup.fill_opacity"));
    fill_opacity_section.insert('input').attrs({ type: "range", min: 0, max: 1, step: 0.1, value: opacity }).styles({ "width": "58px", "vertical-align": "middle", "display": "inline", "float": "right", "margin-right": "0px" }).on('change', function () {
        selection.style('fill-opacity', this.value);
        fill_opacity_section.select("#fill_opacity_txt").html(+this.value * 100 + "%");
    });
    fill_opacity_section.append("span").style("float", "right").attr("id", "fill_opacity_txt").html(+opacity * 100 + "%");

    var c_section = popup.append('p').attr("class", "line_elem");
    c_section.insert("span").html(i18next.t("app_page.layer_style_popup.border_color"));
    c_section.insert('input').attrs({ type: "color", value: stroke_prev }).style("float", "right").on('change', function () {
        lgd_to_change = true;
        selection.style("stroke", this.value);
        current_layers[layer_name].fill_color.single = this.value;
    });

    var opacity_section = popup.append('p').attr("class", "line_elem");
    opacity_section.insert("span").html(i18next.t("app_page.layer_style_popup.border_opacity"));
    opacity_section.insert('input').attrs({ type: "range", min: 0, max: 1, step: 0.1, value: border_opacity }).styles({ "width": "58px", "vertical-align": "middle", "display": "inline", "float": "right" }).on('change', function () {
        opacity_section.select("#opacity_val_txt").html(" " + this.value);
        selection.style('stroke-opacity', this.value);
    });

    opacity_section.append("span").attr("id", "opacity_val_txt").style("display", "inline").style("float", "right").html(" " + border_opacity);

    var width_section = popup.append('p');
    width_section.append("span").html(i18next.t("app_page.layer_style_popup.border_width"));
    width_section.insert('input').attrs({ type: "number", min: 0, step: 0.1, value: stroke_width }).styles({ "width": "60px", "float": "right" }).on('change', function () {
        var val = +this.value;
        var zoom_scale = +d3.zoomTransform(map.node()).k;
        map.select(g_lyr_name).style("stroke-width", val / zoom_scale + "px");
        current_layers[layer_name]['stroke-width-const'] = val;
    });
    make_generate_labels_section(popup, layer_name);
}

function make_generate_labels_section(parent_node, layer_name) {
    var _fields = get_fields_name(layer_name);
    if (_fields && _fields.length > 0) {
        (function () {
            var labels_section = parent_node.append("p");
            var input_fields = {};
            for (var i = 0; i < _fields.length; i++) {
                input_fields[_fields[i]] = _fields[i];
            }
            labels_section.append("span").attr("id", "generate_labels").styles({ "cursor": "pointer", "margin-top": "15px" }).html(i18next.t("app_page.layer_style_popup.generate_labels")).on("mouseover", function () {
                this.style.fontWeight = "bold";
            }).on("mouseout", function () {
                this.style.fontWeight = "";
            }).on("click", function () {
                var fields = swal({
                    title: "",
                    text: i18next.t("app_page.layer_style_popup.field_label"),
                    type: "question",
                    customClass: 'swal2_custom',
                    showCancelButton: true,
                    showCloseButton: false,
                    allowEscapeKey: false,
                    allowOutsideClick: false,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: i18next.t("app_page.common.confirm"),
                    input: 'select',
                    inputPlaceholder: i18next.t("app_page.common.field"),
                    inputOptions: input_fields,
                    inputValidator: function inputValidator(value) {
                        return new Promise(function (resolve, reject) {
                            if (_fields.indexOf(value) < 0) {
                                reject(i18next.t("app_page.common.no_value"));
                            } else {
                                var options_labels = {
                                    label_field: value,
                                    color: "#000",
                                    font: "Arial,Helvetica,sans-serif",
                                    ref_font_size: 12,
                                    uo_layer_name: ["Labels", value, layer_name].join('_')
                                };
                                render_label(layer_name, options_labels);
                                resolve();
                            }
                        });
                    }
                }).then(function (value) {
                    console.log(value);
                }, function (dismiss) {
                    console.log(dismiss);
                });
            });
        })();
    }
}

function get_fields_name(layer_name) {
    var elem = document.getElementById(_app.layer_to_id.get(layer_name)).childNodes[0];
    if (!elem.__data__ || !elem.__data__.properties) {
        return null;
    } else {
        return Object.getOwnPropertyNames(elem.__data__.properties);
    }
}

function createStyleBox_ProbSymbol(layer_name) {
    var existing_box = document.querySelector(".styleBox");
    if (existing_box) existing_box.remove();

    var g_lyr_name = "#" + _app.layer_to_id.get(layer_name),
        ref_layer_name = current_layers[layer_name].ref_layer_name,
        type_method = current_layers[layer_name].renderer,
        type_symbol = current_layers[layer_name].symbol,
        field_used = current_layers[layer_name].rendered_field,
        selection = map.select(g_lyr_name).selectAll(type_symbol),
        rendering_params,
        old_size = [current_layers[layer_name].size[0], current_layers[layer_name].size[1]];

    var stroke_prev = selection.style('stroke'),
        opacity = selection.style('fill-opacity'),
        border_opacity = selection.style('stroke-opacity'),
        stroke_width = selection.style('stroke-width');

    var fill_prev = cloneObj(current_layers[layer_name].fill_color),
        prev_col_breaks;

    var d_values = result_data[layer_name].map(function (v) {
        return +v[field_used];
    });

    var redraw_prop_val = function redraw_prop_val(prop_values) {
        var selec = selection._groups[0];

        if (type_symbol === "circle") {
            for (var i = 0, len = prop_values.length; i < len; i++) {
                selec[i].setAttribute('r', prop_values[i]);
            }
        } else if (type_symbol === "rect") {
            for (var _i = 0, _len = prop_values.length; _i < _len; _i++) {
                var old_rect_size = +selec[_i].getAttribute('height'),
                    centr = [+selec[_i].getAttribute("x") + old_rect_size / 2 - prop_values[_i] / 2, +selec[_i].getAttribute("y") + old_rect_size / 2 - prop_values[_i] / 2];

                selec[_i].setAttribute('x', centr[0]);
                selec[_i].setAttribute('y', centr[1]);
                selec[_i].setAttribute('height', prop_values[_i]);
                selec[_i].setAttribute('width', prop_values[_i]);
            }
        }
    };

    if (current_layers[layer_name].colors_breaks && current_layers[layer_name].colors_breaks instanceof Array) prev_col_breaks = [].concat(current_layers[layer_name].colors_breaks);else if (current_layers[layer_name].break_val != undefined) prev_col_breaks = current_layers[layer_name].break_val;

    if (stroke_prev.startsWith("rgb")) stroke_prev = rgb2hex(stroke_prev);
    if (stroke_width.endsWith("px")) stroke_width = stroke_width.substring(0, stroke_width.length - 2);

    make_confirm_dialog2("styleBox", layer_name, { top: true, widthFitContent: true, draggable: true }).then(function (confirmed) {
        if (confirmed) {
            if (current_layers[layer_name].size != old_size) {
                var lgd_prop_symb = document.querySelector(["#legend_root_symbol.lgdf_", layer_name].join(''));
                if (lgd_prop_symb) {
                    redraw_legends_symbols(lgd_prop_symb);
                }
                if (type_symbol === "circle") {
                    selection.each(function (d, i) {
                        d.properties.prop_value = this.getAttribute('r');
                    });
                } else {
                    selection.each(function (d, i) {
                        d.properties.prop_value = this.getAttribute('height');
                    });
                }
            }
            if (type_method == "PropSymbolsChoro" || type_method == "PropSymbolsTypo") {
                if (type_method == "PropSymbolsChoro") {
                    current_layers[layer_name].fill_color = { "class": [].concat(rendering_params.colorsByFeature) };
                    current_layers[layer_name].colors_breaks = [];
                    for (var i = rendering_params['breaks'].length - 1; i > 0; --i) {
                        current_layers[layer_name].colors_breaks.push([[rendering_params['breaks'][i - 1], " - ", rendering_params['breaks'][i]].join(''), rendering_params['colors'][i - 1]]);
                    }
                    current_layers[layer_name].options_disc = {
                        schema: rendering_params.schema,
                        colors: rendering_params.colors,
                        no_data: rendering_params.no_data,
                        type: rendering_params.type,
                        breaks: rendering_params.breaks
                    };
                } else if (type_method == "PropSymbolsTypo") {
                    current_layers[layer_name].fill_color = { 'class': [].concat(rendering_params.colorsByFeature) };
                    current_layers[layer_name].color_map = rendering_params.color_map;
                }
                current_layers[layer_name].rendered_field2 = rendering_params.field;
                // Also change the legend if there is one displayed :
                redraw_legend('default', layer_name, rendering_params.field);
            }
            if (selection._groups[0][0].__data__.properties.color) {
                selection.each(function (d, i) {
                    d.properties.color = rendering_params.colorsByFeature[i];
                });
            }
        } else {
            selection.style('fill-opacity', opacity);
            map.select(g_lyr_name).style('stroke-width', stroke_width);
            current_layers[layer_name]['stroke-width-const'] = stroke_width;
            var fill_meth = Object.getOwnPropertyNames(fill_prev)[0];
            if (fill_meth == "single") {
                selection.style('fill', fill_prev.single).style('stroke-opacity', border_opacity).style('stroke', stroke_prev);
            } else if (fill_meth == "two") {
                current_layers[layer_name].break_val = prev_col_breaks;
                current_layers[layer_name].fill_color = { "two": [fill_prev.two[0], fill_prev.two[1]] };
                selection.style('fill', function (d, i) {
                    return d_values[i] > prev_col_breaks ? fill_prev.two[1] : fill_prev.two[0];
                }).style('stroke-opacity', border_opacity).style('stroke', stroke_prev);
            } else if (fill_meth == "class") {
                selection.style('fill-opacity', opacity).style("fill", function (d, i) {
                    return current_layers[layer_name].fill_color.class[i];
                }).style('stroke-opacity', border_opacity).style("stroke", stroke_prev);
                current_layers[layer_name].colors_breaks = prev_col_breaks;
            } else if (fill_meth == "random") {
                selection.style('fill', function () {
                    return Colors.name[Colors.random()];
                }).style('stroke-opacity', border_opacity).style('stroke', stroke_prev);
            } else if (fill_meth == "categorical") {
                fill_categorical(layer_name, fill_prev.categorical[0], type_symbol, fill_prev.categorical[1]);
            }
            current_layers[layer_name].fill_color = fill_prev;
            if (current_layers[layer_name].size[1] != old_size[1]) {
                var prop_values = prop_sizer3_e(d_values, old_size[0], old_size[1], type_symbol);
                redraw_prop_val(prop_values);
                current_layers[layer_name].size = [old_size[0], old_size[1]];
            }
        }
        zoom_without_redraw();
    });

    var container = document.querySelector(".twbs > .styleBox");
    var popup = d3.select(container).select(".modal-content").style("width", "300px").select(".modal-body");

    popup.append("p").styles({ "text-align": "center", "color": "grey" }).html([i18next.t("app_page.layer_style_popup.rendered_field", { field: current_layers[layer_name].rendered_field }), i18next.t("app_page.layer_style_popup.reference_layer", { layer: ref_layer_name })].join(''));
    if (type_method === "PropSymbolsChoro") {
        (function () {
            var field_color = current_layers[layer_name].rendered_field2;
            popup.append('p').style("margin", "auto").html(i18next.t("app_page.layer_style_popup.field_symbol_color", { field: field_color })).append("button").attr("class", "button_disc").html(i18next.t("app_page.layer_style_popup.choose_discretization")).on("click", function () {
                container.modal.hide();
                display_discretization(layer_name, field_color, current_layers[layer_name].colors_breaks.length,
                //  "quantiles",
                current_layers[layer_name].options_disc).then(function (confirmed) {
                    container.modal.show();
                    if (confirmed) {
                        rendering_params = {
                            nb_class: confirmed[0],
                            type: confirmed[1],
                            breaks: confirmed[2],
                            colors: confirmed[3],
                            colorsByFeature: confirmed[4],
                            schema: confirmed[5],
                            no_data: confirmed[6],
                            renderer: "PropSymbolsChoro",
                            field: field_color
                        };
                        selection.style("fill", function (d, i) {
                            return rendering_params.colorsByFeature[i];
                        });
                    }
                });
            });
        })();
    } else if (current_layers[layer_name].break_val != undefined) {
        var fill_color_section = popup.append('div').attr("id", "fill_color_section");
        fill_color_section.append("p").style("text-align", "center").html(i18next.t("app_page.layer_style_popup.color_break"));
        var p2 = fill_color_section.append("p").style("display", "inline");
        var col1 = p2.insert("input").attr("type", "color").attr("id", "col1").attr("value", current_layers[layer_name].fill_color.two[0]).on("change", function () {
            var _this = this;

            var new_break_val = +b_val.node().value;
            current_layers[layer_name].fill_color.two[0] = this.value;
            selection.transition().style("fill", function (d, i) {
                return d_values[i] > new_break_val ? col2.node().value : _this.value;
            });
        });
        var col2 = p2.insert("input").attr("type", "color").attr("id", "col2").attr("value", current_layers[layer_name].fill_color.two[1]).on("change", function () {
            var _this2 = this;

            var new_break_val = +b_val.node().value;
            current_layers[layer_name].fill_color.two[1] = this.value;
            selection.transition().style("fill", function (d, i) {
                return d_values[i] > new_break_val ? _this2.value : col1.node().value;
            });
        });
        fill_color_section.insert("span").html(i18next.t("app_page.layer_style_popup.break_value"));
        var b_val = fill_color_section.insert("input").attrs({ type: "number", value: current_layers[layer_name].break_val }).style("width", "75px").on("change", function () {
            var new_break_val = +this.value;
            current_layers[layer_name].break_val = new_break_val;
            selection.transition().style("fill", function (d, i) {
                return d_values[i] > new_break_val ? col2.node().value : col1.node().value;
            });
        });
    } else if (type_method === "PropSymbolsTypo") {
        (function () {
            var field_color = current_layers[layer_name].rendered_field2;
            popup.append('p').style("margin", "auto").html(i18next.t("app_page.layer_style_popup.field_symbol_color", { field: field_color }));
            popup.append('p').style('text-align', 'center').insert('button').attr("class", "button_disc").html(i18next.t("app_page.layer_style_popup.choose_colors")).on("click", function () {
                var _prepare_categories_a5 = prepare_categories_array(layer_name, field_color, current_layers[layer_name].color_map),
                    _prepare_categories_a6 = _slicedToArray(_prepare_categories_a5, 2),
                    cats = _prepare_categories_a6[0],
                    _ = _prepare_categories_a6[1];

                container.modal.hide();
                display_categorical_box(result_data[layer_name], layer_name, field_color, cats).then(function (confirmed) {
                    container.modal.show();
                    if (confirmed) {
                        rendering_params = {
                            nb_class: confirmed[0], color_map: confirmed[1], colorsByFeature: confirmed[2],
                            renderer: "Categorical", rendered_field: field_color
                        };
                        selection.style("fill", function (d, i) {
                            return rendering_params.colorsByFeature[i];
                        });
                        lgd_to_change = true;
                    }
                });
            });
        })();
    } else {
        (function () {
            var fields_all = type_col2(result_data[layer_name]),
                fields = getFieldsType('category', null, fields_all),
                fill_method = popup.append("p").html(i18next.t("app_page.layer_style_popup.fill_color")).insert("select");

            [[i18next.t("app_page.layer_style_popup.single_color"), "single"], [i18next.t("app_page.layer_style_popup.random_color"), "random"]].forEach(function (d, i) {
                fill_method.append("option").text(d[0]).attr("value", d[1]);
            });
            popup.append('div').attr("id", "fill_color_section");
            fill_method.on("change", function () {
                popup.select("#fill_color_section").html("").on("click", null);
                if (this.value == "single") {
                    make_single_color_menu(layer_name, fill_prev, type_symbol);
                    map.select(g_lyr_name).selectAll(type_symbol).transition().style("fill", fill_prev.single);
                    current_layers[layer_name].fill_color = cloneObj(fill_prev);
                } else if (this.value == "random") {
                    make_random_color(layer_name, type_symbol);
                }
            });
            setSelected(fill_method.node(), Object.getOwnPropertyNames(fill_prev)[0]);
        })();
    }

    var fill_opct_section = popup.append('p').attr("class", "line_elem");
    fill_opct_section.append("span").html(i18next.t("app_page.layer_style_popup.fill_opacity"));

    fill_opct_section.insert('input').attrs({ type: "range", min: 0, max: 1, step: 0.1, value: opacity }).styles({ width: "58px", "vertical-align": "middle", "display": "inline", "float": "right" }).on('change', function () {
        selection.style('fill-opacity', this.value);
        fill_opct_section.select("#fill_opacity_txt").html(+this.value * 100 + "%");
    });

    fill_opct_section.append("span").attr("id", "fill_opacity_txt").style("float", "right").html(+opacity * 100 + "%");

    var border_color_section = popup.append('p').attr("class", "line_elem");
    border_color_section.append("span").html(i18next.t("app_page.layer_style_popup.border_color"));
    border_color_section.insert('input').attrs({ type: "color", "value": stroke_prev }).style("float", "right").on('change', function () {
        selection.transition().style("stroke", this.value);
    });

    var border_opacity_section = popup.append('p');
    border_opacity_section.append("span").html(i18next.t("app_page.layer_style_popup.border_opacity"));

    border_opacity_section.insert('input').attrs({ type: "range", min: 0, max: 1, step: 0.1, value: border_opacity }).styles({ width: "58px", "vertical-align": "middle", "display": "inline", float: "right" }).on('change', function () {
        selection.style('stroke-opacity', this.value);
        border_opacity_section.select("#border_opacity_txt").html(+this.value * 100 + "%");
    });

    border_opacity_section.append("span").attr("id", "border_opacity_txt").style("float", "right").html(+border_opacity * 100 + "%");

    var border_width_section = popup.append('p').attr("class", "line_elem");
    border_width_section.append("span").html(i18next.t("app_page.layer_style_popup.border_width"));
    border_width_section.insert('input').attrs({ type: "number", min: 0, step: 0.1, value: stroke_width }).styles({ width: "60px", float: "right" }).on('change', function () {
        selection.style("stroke-width", this.value + "px");
        current_layers[layer_name]['stroke-width-const'] = +this.value;
    });

    var prop_val_content = popup.append("p");
    prop_val_content.append("span").html(i18next.t("app_page.layer_style_popup.field_symbol_size", { field: field_used }));
    prop_val_content.append('span').html(i18next.t("app_page.layer_style_popup.symbol_fixed_size"));
    prop_val_content.insert('input').styles({ width: "60px", float: "right" }).attrs({ type: "number", id: "max_size_range", min: 0.1, step: "any", value: current_layers[layer_name].size[1] }).on("change", function () {
        var f_size = +this.value,
            prop_values = prop_sizer3_e(d_values, current_layers[layer_name].size[0], f_size, type_symbol);
        current_layers[layer_name].size[1] = f_size;
        redraw_prop_val(prop_values);
    });
    prop_val_content.append("span").style("float", "right").html('(px)');

    var prop_val_content2 = popup.append("p").attr("class", "line_elem");
    prop_val_content2.append("span").html(i18next.t("app_page.layer_style_popup.on_value"));
    prop_val_content2.insert("input").styles({ width: "100px", float: "right" }).attrs({ type: "number", min: 0.1, step: 0.1, value: +current_layers[layer_name].size[0] }).on("change", function () {
        var f_val = +this.value,
            prop_values = prop_sizer3_e(d_values, f_val, current_layers[layer_name].size[1], type_symbol);
        redraw_prop_val(prop_values);
        current_layers[layer_name].size[0] = f_val;
    });

    make_generate_labels_section(popup, layer_name);
}

function make_style_box_indiv_label(label_node) {
    var current_options = { size: label_node.style.fontSize,
        content: label_node.textContent,
        font: label_node.style.fontFamily,
        color: label_node.style.fill };

    if (current_options.color.startsWith("rgb")) current_options.color = rgb2hex(current_options.color);

    var new_params = {};

    var existing_box = document.querySelector(".styleTextAnnotation");
    if (existing_box) existing_box.remove();

    make_confirm_dialog2("styleTextAnnotation", i18next.t("app_page.func_options.label.title_box_indiv"), { widthFitContent: true, draggable: true }).then(function (confirmed) {
        if (!confirmed) {
            label_node.style.fontsize = current_options.size;
            label_node.textContent = current_options.content;
            label_node.style.fill = current_options.color;
            label_node.style.fontFamily = current_options.font;
        }
    });
    var box_content = d3.select(".styleTextAnnotation").select(".modal-content").style("width", "300px").select(".modal-body").insert('div');
    var a = box_content.append("p").attr('class', 'line_elem');
    a.insert('span').html(i18next.t("app_page.func_options.label.font_size"));
    a.append("input").attrs({ type: "number", id: "font_size", min: 0, max: 34, step: "any", value: +label_node.style.fontSize.slice(0, -2) }).styles({ "width": "70px", "float": "right" }).on("change", function () {
        label_node.style.fontSize = this.value + "px";
    });
    var b = box_content.append("p").attr('class', 'line_elem');
    b.insert('span').html(i18next.t("app_page.func_options.label.content"));
    b.append("input").attrs({ "value": label_node.textContent, id: "label_content" }).styles({ "width": "70px", "float": "right" }).on("keyup", function () {
        label_node.textContent = this.value;
    });
    var c = box_content.append("p").attr('class', 'line_elem');
    c.insert('span').html(i18next.t("app_page.func_options.common.color"));
    c.append("input").attrs({ "type": "color", "value": rgb2hex(label_node.style.fill), id: "label_color" }).styles({ "width": "70px", "float": "right" }).on("change", function () {
        label_node.style.fill = this.value;
    });
    var d = box_content.append("p").attr('class', 'line_elem');
    d.insert('span').html(i18next.t("app_page.func_options.label.font_type"));
    var selec_fonts = d.append("select").style('float', 'right').on("change", function () {
        label_node.style.fontFamily = this.value;
    });

    available_fonts.forEach(function (name) {
        selec_fonts.append("option").attr("value", name[1]).text(name[0]);
    });
    selec_fonts.node().value = label_node.style.fontFamily;
};

/**
* Return the id of a gaussian blur filter with the desired size (stdDeviation attribute)
* if one with the same param already exists, its id is returned,
* otherwise a new one is created, and its id is returned
*/
var getBlurFilter = function (size) {
    var count = 0;
    return function (size) {
        var blur_filts = defs.node().getElementsByClassName("blur");
        var blur_filt_to_use = void 0;
        for (var i = 0; i < blur_filts.length; i++) {
            if (blur_filts[i].querySelector("feGaussianBlur").getAttributeNS(null, "stdDeviation") == size) {
                blur_filt_to_use = blur_filts[i];
            }
        }
        if (!blur_filt_to_use) {
            count = count + 1;
            blur_filt_to_use = document.createElementNS("http://www.w3.org/2000/svg", "filter");
            blur_filt_to_use.setAttribute("id", "blurfilt" + count);
            blur_filt_to_use.setAttribute("class", "blur");
            var gaussianFilter = document.createElementNS("http://www.w3.org/2000/svg", "feGaussianBlur");
            gaussianFilter.setAttributeNS(null, "in", "SourceGraphic");
            gaussianFilter.setAttributeNS(null, "stdDeviation", size);
            blur_filt_to_use.appendChild(gaussianFilter);
            defs.node().appendChild(blur_filt_to_use);
        }
        return blur_filt_to_use.id;
    };
}();
"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var UserArrow = function () {
    function UserArrow(id, origin_pt, destination_pt) {
        var parent = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : undefined;
        var untransformed = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;

        _classCallCheck(this, UserArrow);

        this.parent = parent || svg_map;
        this.svg_elem = d3.select(this.parent);
        this.id = id;
        this.lineWeight = 4;
        this.color = "rgb(0, 0, 0)";

        if (!untransformed) {
            var zoom_param = svg_map.__zoom;
            this.pt1 = [(origin_pt[0] - zoom_param.x) / zoom_param.k, (origin_pt[1] - zoom_param.y) / zoom_param.k], this.pt2 = [(destination_pt[0] - zoom_param.x) / zoom_param.k, (destination_pt[1] - zoom_param.y) / zoom_param.k];
        } else {
            this.pt1 = origin_pt;
            this.pt2 = destination_pt;
        }
        var self = this;
        this.drag_behavior = d3.drag().subject(function () {
            var t = d3.select(this.querySelector("line"));
            return { x: +t.attr("x2") - +t.attr("x1"),
                y: +t.attr("y2") - +t.attr("y1"),
                x1: t.attr("x1"), x2: t.attr("x2"),
                y1: t.attr("y1"), y2: t.attr("y2"),
                map_locked: map_div.select("#hand_button").classed("locked") ? true : false
            };
        }).on("start", function () {
            d3.event.sourceEvent.stopPropagation();
            handle_click_hand("lock");
        }).on("end", function () {
            if (d3.event.subject && !d3.event.subject.map_locked) handle_click_hand("unlock"); // zoom.on("zoom", zoom_without_redraw);
        }).on("drag", function () {
            d3.event.sourceEvent.preventDefault();
            var _t = this.querySelector("line"),
                subject = d3.event.subject,
                tx = (+d3.event.x - +subject.x) / svg_map.__zoom.k,
                ty = (+d3.event.y - +subject.y) / svg_map.__zoom.k;
            self.pt1 = [+subject.x1 + tx, +subject.y1 + ty];
            self.pt2 = [+subject.x2 + tx, +subject.y2 + ty];
            _t.x1.baseVal.value = self.pt1[0];
            _t.x2.baseVal.value = self.pt2[0];
            _t.y1.baseVal.value = self.pt1[1];
            _t.y2.baseVal.value = self.pt2[1];
        });

        var defs = parent.querySelector("defs"),
            markers = defs ? defs.querySelector("marker") : null;

        if (!markers) {
            this.add_defs_marker();
        }
        this.draw();
    }

    _createClass(UserArrow, [{
        key: "add_defs_marker",
        value: function add_defs_marker() {
            defs.append("marker").attrs({ "id": "arrow_head", "viewBox": "0 -5 10 10",
                "refX": 5, "refY": 0, "orient": "auto",
                "markerWidth": 4, "markerHeight": 4 }).style("stroke-width", 1).append("path").attr("d", "M0,-5L10,0L0,5").attr("class", "arrowHead");
            if (this.parent.childNodes[0].tagName != "defs") {
                this.parent.insertBefore(defs.node(), this.parent.childNodes[0]);
            }
        }
    }, {
        key: "draw",
        value: function draw() {
            var _this = this;

            var context_menu = new ContextMenu(),
                getItems = function getItems() {
                return [{ "name": i18next.t("app_page.common.edit_style"), "action": function action() {
                        _this.editStyle();
                    } }, { "name": i18next.t("app_page.common.up_element"), "action": function action() {
                        _this.up_element();
                    } }, { "name": i18next.t("app_page.common.down_element"), "action": function action() {
                        _this.down_element();
                    } }, { "name": i18next.t("app_page.common.delete"), "action": function action() {
                        _this.arrow.remove();
                    } }];
            };

            this.arrow = this.svg_elem.append('g').style("cursor", "all-scroll").attrs({ "class": "arrow legend scalable-legend", "id": this.id, transform: svg_map.__zoom.toString() });

            this.arrow.insert("line").attrs({ "marker-end": "url(#arrow_head)",
                "x1": this.pt1[0], "y1": this.pt1[1],
                "x2": this.pt2[0], "y2": this.pt2[1] }).styles({ "stroke-width": this.lineWeight, stroke: "rgb(0, 0, 0)" });

            this.arrow.call(this.drag_behavior);

            this.arrow.on("contextmenu", function () {
                context_menu.showMenu(d3.event, document.querySelector("body"), getItems());
            });
            this.arrow.on("dblclick", function () {
                d3.event.preventDefault();
                d3.event.stopPropagation();
                _this.handle_ctrl_pt();
            });
        }
    }, {
        key: "up_element",
        value: function up_element() {
            up_legend(this.arrow.node());
        }
    }, {
        key: "down_element",
        value: function down_element() {
            down_legend(this.arrow.node());
        }
    }, {
        key: "handle_ctrl_pt",
        value: function handle_ctrl_pt() {
            var self = this,
                line = self.arrow.node().querySelector("line"),
                zoom_params = svg_map.__zoom,
                map_locked = map_div.select("#hand_button").classed("locked") ? true : false;

            // New behavior if the user click on the lock to move on the map :
            var cleanup_edit_state = function cleanup_edit_state() {
                self.pt1 = [line.x1.baseVal.value, line.y1.baseVal.value];
                self.pt2 = [line.x2.baseVal.value, line.y2.baseVal.value];
                map.select('#arrow_start_pt').remove();
                map.select('#arrow_end_pt').remove();

                // Reactive the ability to move the arrow :
                self.arrow.call(self.drag_behavior);
                // Restore the ability to edit the control points on dblclick on the arrow :
                self.arrow.on("dblclick", function () {
                    d3.event.preventDefault();
                    d3.event.stopPropagation();
                    self.handle_ctrl_pt();
                });
                // Restore the previous behiavor for the 'lock' button :
                document.getElementById("hand_button").onclick = handle_click_hand;
            };

            document.getElementById("hand_button").onclick = function () {
                cleanup_edit_state();
                handle_click_hand();
            };

            // Desactive the ability to drag the arrow :
            self.arrow.on('.drag', null);
            // Desactive the ability to zoom/move on the map ;
            handle_click_hand('lock');

            // Append two red squares for the start point and the end point of the arrow :
            map.append("rect").attrs({ x: self.pt1[0] * zoom_params.k + zoom_params.x - 3, y: self.pt1[1] * zoom_params.k + zoom_params.y - 3, height: 6, width: 6, id: 'arrow_start_pt' }).styles({ fill: 'red', cursor: 'grab' }).call(d3.drag().on("drag", function () {
                var t = d3.select(this),
                    nx = d3.event.x,
                    ny = d3.event.y;
                t.attrs({ x: nx - 3, y: ny - 3 });
                line.x1.baseVal.value = (nx - zoom_params.x) / zoom_params.k;
                line.y1.baseVal.value = (ny - zoom_params.y) / zoom_params.k;
            }));
            map.append("rect").attrs({ x: self.pt2[0] * zoom_params.k + zoom_params.x - 3, y: self.pt2[1] * zoom_params.k + zoom_params.y - 3, height: 6, width: 6, id: 'arrow_end_pt' }).styles({ fill: 'red', cursor: 'grab' }).call(d3.drag().on("drag", function () {
                var t = d3.select(this),
                    nx = d3.event.x,
                    ny = d3.event.y;
                t.attrs({ x: nx - 3, y: ny - 3 });
                line.x2.baseVal.value = (nx - zoom_params.x) / zoom_params.k;
                line.y2.baseVal.value = (ny - zoom_params.y) / zoom_params.k;
            }));

            // Exit the "edit" state by double clicking again on the arrow :
            self.arrow.on("dblclick", function () {
                d3.event.stopPropagation();
                d3.event.preventDefault();
                cleanup_edit_state();
                if (!map_locked) {
                    handle_click_hand('unlock');
                }
            });
        }
    }, {
        key: "calcAngle",
        value: function calcAngle() {
            var dx = this.pt2[0] - this.pt1[0],
                dy = this.pt2[1] - this.pt1[1];
            return Math.atan2(dy, dx) * (180 / Math.PI);
        }
    }, {
        key: "calcDestFromOAD",
        value: function calcDestFromOAD(origin, angle, distance) {
            var theta = angle / (180 / Math.PI),
                dx = distance * Math.cos(theta),
                dy = distance * Math.sin(theta);
            return [origin[0] + dx, origin[1] + dy];
        }
    }, {
        key: "editStyle",
        value: function editStyle() {
            var current_options = { pt1: this.pt1.slice(),
                pt2: this.pt2.slice() };
            var self = this,
                line = self.arrow.node().querySelector("line"),
                angle = (-this.calcAngle()).toFixed(0),
                map_locked = map_div.select("#hand_button").classed("locked") ? true : false;

            if (!map_locked) handle_click_hand('lock');

            var existing_box = document.querySelector(".styleBoxArrow");
            if (existing_box) existing_box.remove();

            make_confirm_dialog2("styleBoxArrow", i18next.t("app_page.arrow_edit_box.title"), { widthFitContent: true }).then(function (confirmed) {
                if (confirmed) {
                    // Store shorcut of useful values :
                    self.lineWeight = line.style.strokeWidth;
                    self.color = line.style.stroke;
                    self.pt1 = [line.x1.baseVal.value, line.y1.baseVal.value];
                    self.pt2 = [line.x2.baseVal.value, line.y2.baseVal.value];
                } else {
                    //Rollback on initials parameters :
                    line.x1.baseVal.value = current_options.pt1[0];
                    line.y1.baseVal.value = current_options.pt1[1];
                    line.x2.baseVal.value = current_options.pt2[0];
                    line.y2.baseVal.value = current_options.pt2[1];
                    self.pt1 = current_options.pt1.slice();
                    self.pt2 = current_options.pt2.slice();
                    line.style.strokeWidth = self.lineWeight;
                    line.style.stroke = self.color;
                }
                map.select('#arrow_start_pt').remove();
                map.select('#arrow_end_pt').remove();
                if (!map_locked) handle_click_hand('unlock');
            });

            var box_content = d3.select(".styleBoxArrow").select(".modal-body").style("width", "295px").insert("div").attr("id", "styleBoxArrow");
            var s1 = box_content.append("p").attr('class', 'line_elem');
            s1.append("span").html(i18next.t("app_page.arrow_edit_box.arrowWeight"));
            s1.insert("span").styles({ 'float': 'right', 'width': '13px' }).html("px");
            s1.insert("input").attrs({ id: "arrow_weight_text", class: "without_spinner", value: self.lineWeight, min: 0, max: 34, step: 0.1 }).styles({ width: "30px", "margin-left": "10px", 'float': 'right' }).on("input", function () {
                var elem = document.getElementById("arrow_lineWeight");
                elem.value = this.value;
                elem.dispatchEvent(new Event('change'));
            });

            s1.append("input").attrs({ type: "range", id: "arrow_lineWeight", min: 0, max: 34, step: 0.1, value: self.lineWeight }).styles({ width: "80px", "vertical-align": "middle", 'float': 'right' }).on("change", function () {
                line.style.strokeWidth = this.value;
                document.getElementById("arrow_weight_text").value = +this.value;
            });

            var s2 = box_content.append("p").attr('class', 'line_elem');
            s2.append("span").html(i18next.t("app_page.arrow_edit_box.arrowAngle"));
            s2.insert("span").styles({ 'float': 'right', 'width': '13px' }).html("&nbsp;°");
            s2.insert("input").attrs({ id: "arrow_angle_text", class: "without_spinner", value: angle, min: 0, max: 1, step: 1 }).styles({ width: "30px", "margin-left": "10px", 'float': 'right' }).on("input", function () {
                var elem = document.getElementById("arrow_angle");
                elem.value = this.value;
                elem.dispatchEvent(new Event('change'));
            });
            s2.insert("input").attrs({ id: "arrow_angle", type: "range", value: angle, min: 0, max: 360, step: 1 }).styles({ width: "80px", "vertical-align": "middle", 'float': 'right' }).on("change", function () {
                var distance = Math.sqrt((self.pt1[0] - self.pt2[0]) * (self.pt1[0] - self.pt2[0]) + (self.pt1[1] - self.pt2[1]) * (self.pt1[1] - self.pt2[1]));
                var angle = -+this.value;

                var _self$calcDestFromOAD = self.calcDestFromOAD(self.pt1, angle, distance),
                    _self$calcDestFromOAD2 = _slicedToArray(_self$calcDestFromOAD, 2),
                    nx = _self$calcDestFromOAD2[0],
                    ny = _self$calcDestFromOAD2[1];

                line.x2.baseVal.value = nx;
                line.y2.baseVal.value = ny;
                document.getElementById("arrow_angle_text").value = +this.value;
            });
        }
    }]);

    return UserArrow;
}();

var Textbox = function () {
    function Textbox(parent, new_id_txt_annot) {
        var _this2 = this;

        var position = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [10, 30];

        _classCallCheck(this, Textbox);

        this.x = position[0];
        this.y = position[1];
        this.fontsize = 14;

        // function end_edit_action(){
        //     inner_ft.attr("contentEditable", "false");
        //     inner_ft.style("background-color", "transparent");
        //     inner_ft.style("border", "");
        //     // Recompute the size of the p inside the foreignObj
        //     let inner_bbox = inner_p.getBoundingClientRect();
        //     foreign_obj.setAttributeNS(null, "width", [inner_bbox.width + 2, "px"].join('')); // +2px are for the border
        //     foreign_obj.setAttributeNS(null, "height", [inner_bbox.height + 2, "px"].join(''));
        //     d3.select("body").classed("noselect", false);
        //     state = null;
        // };

        var current_timeout;
        var context_menu = new ContextMenu(),
            getItems = function getItems() {
            return [{ "name": i18next.t("app_page.common.edit_style"), "action": function action() {
                    _this2.editStyle();
                } }, { "name": i18next.t("app_page.common.up_element"), "action": function action() {
                    _this2.up_element();
                } }, { "name": i18next.t("app_page.common.down_element"), "action": function action() {
                    _this2.down_element();
                } }, { "name": i18next.t("app_page.common.delete"), "action": function action() {
                    _this2.text_annot.remove();
                } }];
        };

        var drag_txt_annot = d3.drag().subject(function () {
            var t = d3.select(this.parentElement);
            return {
                x: t.attr("x"), y: t.attr("y"),
                map_locked: map_div.select("#hand_button").classed("locked") ? true : false
            };
        }).on("start", function () {
            d3.event.sourceEvent.stopPropagation();
            handle_click_hand("lock");
        }).on("end", function () {
            if (d3.event.subject && !d3.event.subject.map_locked) handle_click_hand("unlock");
        }).on("drag", function () {
            d3.event.sourceEvent.preventDefault();
            d3.select(this.parentElement).attrs({ x: +d3.event.x, y: +d3.event.y });
            // let x = +d3.event.x,
            //     y = +d3.event.y,
            //     t = d3.select(this.parentElement);
            // t.attrs({x: x, y: y});
        });

        var foreign_obj = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
        foreign_obj.setAttributeNS(null, "x", this.x);
        foreign_obj.setAttributeNS(null, "y", this.y);
        foreign_obj.setAttributeNS(null, "overflow", "visible");
        foreign_obj.setAttributeNS(null, "width", "100%");
        foreign_obj.setAttributeNS(null, "height", "100%");
        foreign_obj.setAttributeNS(null, "class", "legend txt_annot");
        foreign_obj.id = new_id_txt_annot;
        foreign_obj.style.cursor = "pointer";

        var inner_p = document.createElement("p");
        inner_p.setAttribute("id", "in_" + new_id_txt_annot);
        inner_p.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");
        inner_p.style = "display:table-cell;padding:10px;color:#000;" + "opacity:1;font-family:'Verdana,Geneva,sans-serif';font-size:14px;white-space: pre;" + "word-wrap: normal; overflow: visible; overflow-y: visible; overflow-x: visible;";
        inner_p.innerHTML = i18next.t("app_page.text_box_edit_box.constructor_default");
        foreign_obj.appendChild(inner_p);
        parent.appendChild(foreign_obj);

        // foreignObj size was set to 100% for fully rendering its content,
        // now we can reduce its size to the inner content
        // (it will avoid it to overlay some other svg elements)
        {
            var inner_bbox = inner_p.getBoundingClientRect();
            foreign_obj.setAttributeNS(null, "width", [inner_bbox.width + 2, "px"].join('')); // +2px are for the border
            foreign_obj.setAttributeNS(null, "height", [inner_bbox.height + 2, "px"].join(''));
        }

        var frgn_obj = map.select("#" + new_id_txt_annot),
            inner_ft = frgn_obj.select('p');
        inner_ft.call(drag_txt_annot);

        inner_ft.on("contextmenu", function () {
            context_menu.showMenu(d3.event, document.querySelector("body"), getItems());
        });

        inner_ft.on('dblclick', function () {
            d3.event.preventDefault();
            d3.event.stopPropagation();
            _this2.editStyle();
        });

        inner_ft.on("mouseover", function () {
            inner_ft.style("background-color", "#0080001a");
            // toogle the size of the container to 100% while we are using it :
            foreign_obj.setAttributeNS(null, "width", "100%");
            foreign_obj.setAttributeNS(null, "height", "100%");
        });

        inner_ft.on("mouseout", function () {
            inner_ft.style("background-color", null);
            // Recompute the size of the p inside the foreignObj
            var inner_bbox = inner_p.getBoundingClientRect();
            foreign_obj.setAttributeNS(null, "width", [inner_bbox.width + 2, "px"].join('')); // +2px are for the border
            foreign_obj.setAttributeNS(null, "height", [inner_bbox.height + 2, "px"].join(''));
        });

        this.text_annot = frgn_obj;
        this.font_family = 'Verdana,Geneva,sans-serif';
        this.buffer = undefined;
        this.id = new_id_txt_annot;
        return this;
    }

    _createClass(Textbox, [{
        key: "editStyle",
        value: function editStyle() {
            var _this3 = this;

            var map_xy0 = get_map_xy0();
            var self = this,
                inner_p = this.text_annot.select('p');

            var existing_box = document.querySelector(".styleTextAnnotation");
            if (existing_box) existing_box.remove();

            var current_options = {
                size: inner_p.style("font-size").split('px')[0],
                color: inner_p.style("color"),
                content: unescape(inner_p.html()),
                transform_rotate: this.text_annot.attr('transform'),
                x: this.text_annot.attr('x'), y: this.text_annot.attr('y'),
                font_weight: inner_p.style('font-weight'),
                font_style: inner_p.style('font-style'),
                text_decoration: inner_p.style('text-decoration'),
                buffer: self.buffer != undefined ? cloneObj(self.buffer) : undefined,
                text_shadow: inner_p.style('text-shadow'),
                font_family: self.font_family
            };
            current_options.font_weight = current_options.font_weight == "400" || current_options.font_weight == "" ? '' : 'bold';
            make_confirm_dialog2("styleTextAnnotation", i18next.t("app_page.text_box_edit_box.title"), { widthFitContent: true }).then(function (confirmed) {
                if (!confirmed) {
                    self.text_annot.select('p').text(current_options.content).styles({ 'color': current_options.color, 'font-size': current_options.size + 'px',
                        'font-weight': current_options.font_weight, 'text-decoration': current_options.text_decoration,
                        'font-style': current_options.font_style, 'text-shadow': current_options.text_shadow });
                    self.fontsize = current_options.size;
                    self.font_family = current_options.font_family;
                    self.text_annot.attr('transform', current_options.transform_rotate);
                    self.buffer = current_options.buffer;
                } else {
                    if (!buffer_txt_chk.node().checked) {
                        self.buffer = undefined;
                    }
                }
            });
            var box_content = d3.select(".styleTextAnnotation").select(".modal-body").style("width", "295px").insert("div").attr("id", "styleTextAnnotation");

            var current_rotate = typeof current_options.transform_rotate == "string" ? current_options.transform_rotate.match(/[-.0-9]+/g) : 0;
            if (current_rotate && current_rotate.length == 3) {
                current_rotate = +current_rotate[0];
            } else {
                current_rotate = 0;
            }

            var bbox = inner_p.node().getBoundingClientRect(),
                nx = bbox.left - map_xy0.x,
                ny = bbox.top - map_xy0.y,
                x_center = nx + bbox.width / 2,
                y_center = ny + bbox.height / 2;

            var option_rotation = box_content.append('p').attr('class', 'line_elem');
            option_rotation.append("span").html(i18next.t("app_page.text_box_edit_box.rotation"));
            option_rotation.append('span').style('float', 'right').html(' °');
            option_rotation.append("input").attrs({ type: "number", min: 0, max: 360, step: "any", value: current_rotate,
                class: "without_spinner", id: "textbox_txt_rotate" }).styles({ 'width': '40px', 'float': 'right' }).on("change", function () {
                var rotate_value = +this.value;
                self.text_annot.attrs({ x: nx, y: ny, 'transform': "rotate(" + [rotate_value, x_center, y_center] + ")" });
                document.getElementById("textbox_range_rotate").value = rotate_value;
            });

            option_rotation.append("input").attrs({ type: "range", min: 0, max: 360, step: 0.1, id: "textbox_range_rotate", value: current_rotate }).styles({ "vertical-align": "middle", "width": "100px", "float": "right", "margin": "auto 10px" }).on("change", function () {
                var rotate_value = +this.value;
                self.text_annot.attrs({ x: nx, y: ny, 'transform': "rotate(" + [rotate_value, x_center, y_center] + ")" });
                document.getElementById("textbox_txt_rotate").value = rotate_value;
            });

            var options_font = box_content.append('p'),
                font_select = options_font.insert("select").on("change", function () {
                inner_p.style("font-family", this.value);
                self.font_family = this.value;
            });

            available_fonts.forEach(function (font) {
                font_select.append("option").text(font[0]).attr("value", font[1]);
            });
            font_select.node().selectedIndex = available_fonts.map(function (d) {
                return d[1] == _this3.font_family ? "1" : "0";
            }).indexOf("1");

            options_font.append("input").attrs({ type: "number", id: "font_size", min: 0, max: 34, step: 0.1, value: this.fontsize }).style('width', '60px').on("change", function () {
                self.fontsize = +this.value;
                inner_p.style("font-size", self.fontsize + "px");
            });

            options_font.append("input").attrs({ type: "color", id: "font_color", value: rgb2hex(current_options.color) }).style('width', '60px').on("change", function () {
                inner_p.style("color", this.value);
            });

            var options_format = box_content.append('p').style('text-align', 'center'),
                btn_bold = options_format.insert('span').attr('class', current_options.font_weight == 'bold' ? 'active button_disc' : 'button_disc').html('<img title="Bold" src="data:image/gif;base64,R0lGODlhFgAWAID/AMDAwAAAACH5BAEAAAAALAAAAAAWABYAQAInhI+pa+H9mJy0LhdgtrxzDG5WGFVk6aXqyk6Y9kXvKKNuLbb6zgMFADs=">'),
                btn_italic = options_format.insert('span').attr('class', current_options.font_style == 'italic' ? 'active button_disc' : 'button_disc').html('<img title="Italic" src="data:image/gif;base64,R0lGODlhFgAWAKEDAAAAAF9vj5WIbf///yH5BAEAAAMALAAAAAAWABYAAAIjnI+py+0Po5x0gXvruEKHrF2BB1YiCWgbMFIYpsbyTNd2UwAAOw==">'),
                btn_underline = options_format.insert('span').attr('class', current_options.text_decoration == 'underline' ? 'active button_disc' : 'button_disc').html('<img title="Underline" src="data:image/gif;base64,R0lGODlhFgAWAKECAAAAAF9vj////////yH5BAEAAAIALAAAAAAWABYAAAIrlI+py+0Po5zUgAsEzvEeL4Ea15EiJJ5PSqJmuwKBEKgxVuXWtun+DwxCCgA7">');

            var content_modif_zone = box_content.append("p");
            content_modif_zone.append("span").html(i18next.t("app_page.text_box_edit_box.content"));
            content_modif_zone.append("span").html("<br>");
            // let textarea = content_modif_zone.append("textarea")
            content_modif_zone.append("textarea").attr("id", "annotation_content").styles({ "margin": "5px 0px 0px", "width": "100%" }).on("keyup", function () {
                inner_p.html(this.value);
            });
            // textarea = textarea.node();
            document.getElementById("annotation_content").value = current_options.content;

            var buffer_text_zone = box_content.append('p');
            var buffer_txt_chk = buffer_text_zone.append('input').attrs({ type: 'checkbox', id: 'buffer_txt_chk', checked: current_options.buffer != undefined ? true : null }).on('change', function () {
                if (this.checked) {
                    buffer_color.style('display', '');
                    if (self.buffer == undefined) {
                        self.buffer = { color: "#fff", size: 1 };
                    } else {
                        var color = self.buffer.color,
                            size = self.buffer.size;
                        inner_p.style('text-shadow', "-" + size + "px 0px 0px " + color + ", 0px " + size + "px 0px " + color + ", " + size + "px 0px 0px " + color + ", 0px -" + size + "px 0px " + color);
                    }
                } else {
                    buffer_color.style('display', 'none');
                    inner_p.style('text-shadow', 'none');
                }
            });

            buffer_text_zone.append('label').attrs({ for: 'buffer_txt_chk' }).text(i18next.t('app_page.text_box_edit_box.buffer'));

            var buffer_color = buffer_text_zone.append('input').style('float', 'right').style('display', current_options.buffer != undefined ? '' : 'none').attrs({ type: 'color', value: current_options.buffer != undefined ? current_options.buffer.color : "#fff" }).on('change', function () {
                self.buffer.color = this.value;
                var color = self.buffer.color,
                    size = self.buffer.size;
                inner_p.style('text-shadow', "-" + size + "px 0px 0px " + color + ", 0px " + size + "px 0px " + color + ", " + size + "px 0px 0px " + color + ", 0px -" + size + "px 0px " + color);
            });
            // buffer_text_zone2.append('input')
            //     .attrs({type: 'number', class: 'without_spinner', value: current_options.buffer != undefined ? current_options.buffer.size : 1})
            //     .on('change', function(){
            //         self.buffer.size = +this.value;
            //         let color = self.buffer.color, size = self.buffer.size;
            //         let t = `-${size}px 0px 0px ${color}, 0px ${size}px 0px ${color}, ${size}px 0px 0px ${color}, 0px -${size}px 0px ${color}`;
            //         inner_p.style('text-shadow', t);
            //     });

            btn_bold.on('click', function () {
                if (this.classList.contains('active')) {
                    this.classList.remove('active');
                    inner_p.style('font-weight', '');
                } else {
                    this.classList.add('active');
                    inner_p.style('font-weight', 'bold');
                }
            });

            btn_italic.on('click', function () {
                if (this.classList.contains('active')) {
                    this.classList.remove('active');
                    inner_p.style('font-style', '');
                } else {
                    this.classList.add('active');
                    inner_p.style('font-style', 'italic');
                }
            });
            btn_underline.on('click', function () {
                if (this.classList.contains('active')) {
                    this.classList.remove('active');
                    inner_p.style('text-decoration', '');
                } else {
                    this.classList.add('active');
                    inner_p.style('text-decoration', 'underline');
                }
            });
        }
    }, {
        key: "up_element",
        value: function up_element() {
            up_legend(this.text_annot.node());
        }
    }, {
        key: "down_element",
        value: function down_element() {
            down_legend(this.text_annot.node());
        }
    }]);

    return Textbox;
}();

/**
* Handler for the scale bar (only designed for one scale bar)
*
*/


var scaleBar = {
    create: function create() {
        var _this4 = this;

        if (!proj.invert) {
            swal({ title: "",
                text: i18next.t("app_page.common.error_interrupted_projection_scalebar"),
                type: "error",
                allowOutsideClick: false,
                allowEscapeKey: false
            }).then(function () {
                null;
            }, function () {
                null;
            });
            return;
        }
        var scale_gp = map.append("g").attr("id", "scale_bar").attr("class", "legend scale"),
            x_pos = 40,
            y_pos = h - 100,
            bar_size = 50,
            self = this;

        this.x = x_pos;
        this.y = y_pos;
        this.bar_size = bar_size;
        this.unit = "km";
        this.precision = 0;
        this.start_end_bar = false;
        this.fixed_size = false;
        this.getDist();

        var getItems = function getItems() {
            return [{ "name": i18next.t("app_page.common.edit_style"), "action": function action() {
                    _this4.editStyle();
                } }, { "name": i18next.t("app_page.common.delete"), "action": function action() {
                    _this4.remove();
                } }];
        };

        var scale_context_menu = new ContextMenu();
        this.under_rect = scale_gp.insert("rect").attrs({ x: x_pos - 2.5, y: y_pos - 20, height: 30, width: this.bar_size + 5 }).styles({ "fill": "green", "fill-opacity": 0 });
        scale_gp.insert("rect").attr("id", "rect_scale").attrs({ x: x_pos, y: y_pos, height: 2, width: this.bar_size }).style("fill", "black");
        scale_gp.insert("text").attr("id", "text_limit_sup_scale").attrs({ x: x_pos + bar_size, y: y_pos - 5 }).styles({ "font": "11px 'Enriqueta', arial, serif",
            "text-anchor": "middle" }).text(this.dist_txt + " km");

        scale_gp.call(drag_legend_func(scale_gp));
        scale_gp.on("mouseover", function () {
            this.style.cursor = "pointer";
            self.under_rect.style("fill-opacity", 0.1);
        }).on("mouseout", function () {
            this.style.cursor = "pointer";
            self.under_rect.style("fill-opacity", 0);
        }).on("contextmenu dblclick", function (d, i) {
            d3.event.preventDefault();
            d3.event.stopPropagation();
            return scale_context_menu.showMenu(d3.event, document.querySelector("body"), getItems());
        });
        this.Scale = scale_gp;
        this.displayed = true;
        if (this.dist > 100) {
            this.resize(Math.round(this.dist / 100) * 100);
        } else if (this.dist > 10) {
            this.resize(Math.round(this.dist / 10) * 10);
        } else if (Math.round(this.dist) > 1) {
            this.resize(Math.round(this.dist));
        } else if (Math.round(this.dist * 10) / 10 > 0.1) {
            this.precision = 1;
            this.resize(Math.round(this.dist * 10) / 10);
        } else {
            var t = this.dist.toString().split('.');
            this.precision = t && t.length > 1 ? t[1].length : ("" + this.dist).length;
            this.resize(this.dist);
        }
    },
    getDist: function getDist() {
        var x_pos = w / 2,
            y_pos = h / 2,
            transform = d3.zoomTransform(svg_map),
            z_trans = [transform.x, transform.y],
            z_scale = transform.k;

        if (isNaN(this.bar_size)) {
            console.log("scaleBar.bar_size : NaN");
            this.bar_size = 50;
        }

        var pt1 = proj.invert([(x_pos - z_trans[0]) / z_scale, (y_pos - z_trans[1]) / z_scale]),
            pt2 = proj.invert([(x_pos + this.bar_size - z_trans[0]) / z_scale, (y_pos - z_trans[1]) / z_scale]);
        if (!pt1 || !pt2) {
            this.remove();
            return true;
        }
        this.dist = coslaw_dist([pt1[1], pt1[0]], [pt2[1], pt2[0]]);
        var mult = this.unit == "km" ? 1 : this.unit == "m" ? 1000 : this.unit == "mi" ? 0.621371 : 1;
        this.dist_txt = (this.dist * mult).toFixed(this.precision);
    },
    resize: function resize(desired_dist) {
        desired_dist = desired_dist || this.fixed_size;
        var ratio = +this.dist / desired_dist;
        var new_size = this.bar_size / ratio;

        this.Scale.select("#rect_scale").attr("width", new_size);
        this.Scale.select("#text_limit_sup_scale").attr("x", this.x + new_size / 2);
        this.bar_size = new_size;
        this.fixed_size = desired_dist;
        this.under_rect.attr("width", new_size + 5);
        var err = this.getDist();
        if (err) {
            this.remove();
            return;
        }
        this.Scale.select("#text_limit_sup_scale").text(this.fixed_size + " " + this.unit);
        this.handle_start_end_bar();
    },
    update: function update() {
        if (this.fixed_size) {
            this.getDist();
            this.resize();
        } else {
            var err = this.getDist();
            if (err) {
                this.remove();
                return;
            }
            this.Scale.select("#text_limit_sup_scale").text(this.dist_txt + " " + this.unit);
        }
    },
    remove: function remove() {
        this.Scale.remove();
        this.Scale = null;
        this.displayed = false;
    },
    handle_start_end_bar: function handle_start_end_bar() {
        this.Scale.selectAll(".se_bar").remove();
        if (this.start_end_bar) {
            this.Scale.insert("rect").attrs({ class: 'start_bar se_bar', x: this.x, y: this.y - 4.5, width: '1.5px', height: '4.5px' });

            this.Scale.insert("rect").attrs({ class: 'end_bar se_bar', x: this.x + this.bar_size - 1.5, y: this.y - 4.5, width: '1.5px', height: '4.5px' });
        }
    },
    editStyle: function editStyle() {
        var new_val,
            self = this,
            redraw_now = function redraw_now() {
            if (new_val) self.resize(new_val);else {
                self.fixed_size = false;
                self.update();
            }
        };
        make_confirm_dialog2("scaleBarEditBox", i18next.t("app_page.scale_bar_edit_box.title"), { widthFitContent: true }).then(function (confirmed) {
            if (confirmed) {
                redraw_now();
            }
        });
        var box_body = d3.select(".scaleBarEditBox").select(".modal-body").style("width", "295px");
        // box_body.node().parentElement.style.width = "auto";
        box_body.append("h3").html(i18next.t("app_page.scale_bar_edit_box.title"));
        var a = box_body.append("p").attr('class', 'line_elem');
        a.append('span').html(i18next.t("app_page.scale_bar_edit_box.fixed_size"));
        a.append("input").style('float', 'right').attrs({ id: 'scale_fixed_field', type: 'number', disabled: self.fixed_size ? null : true, value: +this.dist_txt }).on("change", function () {
            new_val = +this.value;
            redraw_now();
        });
        a.append("input").style('float', 'right').attrs({ type: 'checkbox', "checked": self.fixed_size ? true : null }).on("change", function () {
            if (box_body.select("#scale_fixed_field").attr("disabled")) {
                box_body.select("#scale_fixed_field").attr("disabled", null);
                new_val = +box_body.select("#scale_fixed_field").attr("value");
            } else {
                box_body.select("#scale_fixed_field").attr("disabled", true);
                new_val = false;
            }
            redraw_now();
        });

        var b = box_body.append("p").attr('class', 'line_elem');
        b.insert("span").html(i18next.t("app_page.scale_bar_edit_box.precision"));
        b.insert("input").style('float', 'right').attrs({ id: 'scale_precision', type: "number", min: 0, max: 6, step: 1, value: +this.precision }).style("width", "60px").on("change", function () {
            self.precision = +this.value;
            redraw_now();
        });

        var c = box_body.append("p").attr('class', 'line_elem');
        c.insert("span").html(i18next.t("app_page.scale_bar_edit_box.unit"));
        var unit_select = c.insert("select").style('float', 'right').attr('id', "scale_unit").on("change", function () {
            self.unit = this.value;
            redraw_now();
        });
        unit_select.append("option").text("km").attr("value", "km");
        unit_select.append("option").text("m").attr("value", "m");
        unit_select.append("option").text("mi").attr("value", "mi");
        unit_select.node().value = self.unit;

        var e = box_body.append("p").attr('class', 'line_elem');
        e.append("span").html(i18next.t("app_page.scale_bar_edit_box.start_end_bar"));
        e.append("input").style('float', 'right').attrs({ id: 'checkbox_start_end_bar', type: 'checkbox' }).on("change", function (a) {
            self.start_end_bar = self.start_end_bar == true ? false : true;
            self.handle_start_end_bar();
        });
        document.getElementById("checkbox_start_end_bar").checked = self.start_end_bar;
    },
    displayed: false
};

var northArrow = {
    display: function display() {
        var _this5 = this;

        var x_pos = w - 100,
            y_pos = h - 100,
            self = this;

        var arrow_gp = map.append("g").attr("id", "north_arrow").attr("class", "legend").attr("scale", 1).attr("rotate", null).style("cursor", "all-scroll");

        this.svg_node = arrow_gp;
        this.displayed = true;

        this.arrow_img = arrow_gp.insert("image").attr("x", x_pos).attr("y", y_pos).attr("height", "30px").attr("width", "30px").attr("xlink:href", "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxOC4xLjEsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0iQ2FscXVlXzIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB2aWV3Qm94PSIzMTEgMjc4LjYgMzYuOSA1MC41IiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDMxMSAyNzguNiAzNi45IDUwLjUiIHhtbDpzcGFjZT0icHJlc2VydmUiPg0KPHBvbHlnb24gZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHBvaW50cz0iMzEyLjMsMzI3LjkgMzI4LjksMzE4LjUgMzI4LjksMjk2LjQgIi8+DQo8cG9seWdvbiBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgcG9pbnRzPSIzMjkuOSwyOTYuNCAzMjkuOSwzMTguNSAzNDYuNywzMjcuOCAiLz4NCjxnPg0KCTxwYXRoIGQ9Ik0zMjIuOCwyNzguNmgyLjlsNi43LDEwLjN2LTEwLjNoM3YxNS43aC0yLjlsLTYuNy0xMC4zdjEwLjNoLTNWMjc4LjZ6Ii8+DQo8L2c+DQo8L3N2Zz4NCg==");

        this.drag_behavior = d3.drag().subject(function () {
            var t = d3.select(this.querySelector("image"));
            return {
                x: +t.attr("x"),
                y: +t.attr("y"),
                map_locked: map_div.select("#hand_button").classed("locked") ? true : false
            };
        }).on("start", function () {
            d3.event.sourceEvent.stopPropagation();
            handle_click_hand("lock"); // zoom.on("zoom", null);
        }).on("end", function () {
            if (d3.event.subject && !d3.event.subject.map_locked) handle_click_hand("unlock"); // zoom.on("zoom", zoom_without_redraw);
        }).on("drag", function () {
            d3.event.sourceEvent.preventDefault();
            var t1 = this.querySelector("image"),
                t2 = this.querySelector("rect"),
                tx = +d3.event.x,
                ty = +d3.event.y,
                dim = t2.width.baseVal.value / 2;
            if (tx < 0 - dim || tx > w + dim || ty < 0 - dim || ty > h + dim) return;
            t1.x.baseVal.value = tx;
            t1.y.baseVal.value = ty;
            t2.x.baseVal.value = tx;
            t2.y.baseVal.value = ty;
            self.x_center = tx + dim;
            self.y_center = ty + dim;
        });

        var getItems = function getItems() {
            return [{ "name": i18next.t("app_page.common.options"), "action": function action() {
                    _this5.editStyle();
                } }, { "name": i18next.t("app_page.common.up_element"), "action": function action() {
                    _this5.up_element();
                } }, { "name": i18next.t("app_page.common.down_element"), "action": function action() {
                    _this5.down_element();
                } }, { "name": i18next.t("app_page.common.delete"), "action": function action() {
                    _this5.remove();
                } }];
        };

        var arrow_context_menu = new ContextMenu();

        var bbox = document.getElementById("north_arrow").getBoundingClientRect(),
            xy0_map = get_map_xy0();

        this.under_rect = arrow_gp.append("g").insert("rect").style("fill", "green").style("fill-opacity", 0).attr("x", bbox.left - xy0_map.x).attr("y", bbox.top - xy0_map.y).attr("height", bbox.height).attr("width", bbox.width);

        this.x_center = bbox.left - xy0_map.x + bbox.width / 2;
        this.y_center = bbox.top - xy0_map.y + bbox.height / 2;

        arrow_gp.call(this.drag_behavior);

        arrow_gp.on("mouseover", function () {
            self.under_rect.style("fill-opacity", 0.1);
        }).on("mouseout", function () {
            self.under_rect.style("fill-opacity", 0);
        }).on("contextmenu dblclick", function (d, i) {
            d3.event.preventDefault();
            return arrow_context_menu.showMenu(d3.event, document.querySelector("body"), getItems());
        });
    },
    up_element: function up_element() {
        up_legend(this.svg_node.node());
    },
    down_element: function down_element() {
        down_legend(this.svg_node.node());
    },
    remove: function remove() {
        this.svg_node.remove();
        this.displayed = false;
    },
    editStyle: function editStyle() {
        var self = this,
            old_dim = +self.under_rect.attr("width"),
            old_rotate = !isNaN(+self.svg_node.attr("rotate")) ? +self.svg_node.attr("rotate") : 0,
            x_pos = +self.x_center - old_dim / 2,
            y_pos = +self.y_center - old_dim / 2;

        make_confirm_dialog2("arrowEditBox", i18next.t("app_page.north_arrow_edit_box.title"), { widthFitContent: true }).then(function (confirmed) {
            if (confirmed) {
                null;
            }
        });

        var box_body = d3.select(".arrowEditBox").select(".modal-body").style("width", "295px");
        box_body.append("h3").html(i18next.t("app_page.north_arrow_edit_box.title"));
        var a = box_body.append('p').attr('class', 'line_elem');
        a.append('span').html(i18next.t("app_page.north_arrow_edit_box.size"));
        a.append("span").style('float', 'right').html(" px");
        a.append("input").attrs({ type: "number", min: 0, max: 200, step: 1, value: old_dim,
            class: "without_spinner", id: "txt_size_n_arrow" }).styles({ float: 'right', width: '40px' }).on("change", function () {
            var elem = document.getElementById("range_size_n_arrow");
            elem.value = +this.value;
            elem.dispatchEvent(new Event("change"));
        });
        a.append("input").attrs({ type: "range", min: 1, max: 200, step: 1,
            value: old_dim, id: "range_size_n_arrow" }).styles({ "vertical-align": "middle", "width": "140px", 'float': 'right' }).on("change", function () {
            var new_size = +this.value;
            self.arrow_img.attr("width", new_size);
            self.arrow_img.attr("height", new_size);
            self.under_rect.attr("width", new_size);
            self.under_rect.attr("height", new_size);
            self.x_center = x_pos + new_size / 2;
            self.y_center = y_pos + new_size / 2;
            document.getElementById("txt_size_n_arrow").value = new_size;
        });

        var b = box_body.append("p").attr('class', 'line_elem');
        b.append('span').html(i18next.t("app_page.north_arrow_edit_box.rotation"));
        b.append("span").style('float', 'right').html(" °");
        b.append("input").attrs({ type: "number", min: 0, max: 360, step: "any", value: old_rotate,
            class: "without_spinner", id: "txt_rotate_n_arrow" }).styles({ float: 'right', width: '40px' }).on("change", function () {
            var rotate_value = +this.value;
            self.svg_node.attr("rotate", rotate_value);
            self.svg_node.attr("transform", "rotate(" + [rotate_value, self.x_center, self.y_center] + ")");
            document.getElementById("range_rotate_n_arrow").value = rotate_value;
        });
        b.append("input").attrs({ type: "range", min: 0, max: 360, step: 0.1, id: "range_rotate_n_arrow", value: old_rotate }).styles({ "vertical-align": "middle", "width": "140px", 'float': 'right' }).on("change", function () {
            var rotate_value = +this.value;
            self.svg_node.attr("rotate", rotate_value);
            self.svg_node.attr("transform", "rotate(" + [rotate_value, self.x_center, self.y_center] + ")");
            document.getElementById("txt_rotate_n_arrow").value = rotate_value;
        });
    },
    displayed: false
};

var UserEllipse = function () {
    function UserEllipse(id, origin_pt) {
        var parent = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;
        var untransformed = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

        _classCallCheck(this, UserEllipse);

        this.parent = parent || svg_map;
        this.svg_elem = d3.select(this.parent);
        this.id = id;
        this.strokeWeight = 4;
        this.stroke_color = "rgb(0, 0, 0)";

        if (!untransformed) {
            var zoom_param = svg_map.__zoom;
            this.pt1 = [(origin_pt[0] - zoom_param.x) / zoom_param.k, (origin_pt[1] - zoom_param.y) / zoom_param.k];
        } else {
            this.pt1 = origin_pt;
        }
        var self = this;
        this.drag_behavior = d3.drag().subject(function () {
            var t = d3.select(this.querySelector("ellipse"));
            return {
                x: +t.attr("cx"),
                y: +t.attr("cy"),
                map_locked: map_div.select("#hand_button").classed("locked") ? true : false
            };
        }).on("start", function () {
            d3.event.sourceEvent.stopPropagation();
            handle_click_hand("lock");
        }).on("end", function () {
            if (d3.event.subject && !d3.event.subject.map_locked) handle_click_hand("unlock"); // zoom.on("zoom", zoom_without_redraw);
        }).on("drag", function () {
            d3.event.sourceEvent.preventDefault();
            var _t = this.querySelector("ellipse"),
                subject = d3.event.subject,
                tx = (+d3.event.x - +subject.x) / svg_map.__zoom.k,
                ty = (+d3.event.y - +subject.y) / svg_map.__zoom.k;
            self.pt1 = [+subject.x + tx, +subject.y + ty];
            _t.cx.baseVal.value = self.pt1[0];
            _t.cy.baseVal.value = self.pt1[1];
        });

        this.draw();
        return this;
    }

    _createClass(UserEllipse, [{
        key: "draw",
        value: function draw() {
            var _this6 = this;

            var context_menu = new ContextMenu(),
                getItems = function getItems() {
                return [{ "name": i18next.t("app_page.common.edit_style"), "action": function action() {
                        _this6.editStyle();
                    } }, { "name": i18next.t("app_page.common.up_element"), "action": function action() {
                        _this6.up_element();
                    } }, { "name": i18next.t("app_page.common.down_element"), "action": function action() {
                        _this6.down_element();
                    } }, { "name": i18next.t("app_page.common.delete"), "action": function action() {
                        _this6.ellipse.remove();
                    } }];
            };

            this.ellipse = this.svg_elem.append('g').attrs({ "class": "user_ellipse legend scalable-legend", "id": this.id, transform: svg_map.__zoom.toString() });

            this.ellipse.insert("ellipse").attrs({ "rx": 30, "ry": 40,
                "cx": this.pt1[0], "cy": this.pt1[1] }).styles({ "stroke-width": this.strokeWeight,
                stroke: this.stroke_color, fill: "rgb(255, 255, 255)",
                "fill-opacity": 0 });

            this.ellipse.call(this.drag_behavior);

            this.ellipse.on("contextmenu", function () {
                context_menu.showMenu(d3.event, document.body, getItems());
            });
            this.ellipse.on('dblclick', function () {
                d3.event.preventDefault();
                d3.event.stopPropagation();
                _this6.handle_ctrl_pt();
            });
        }
    }, {
        key: "up_element",
        value: function up_element() {
            up_legend(this.ellipse.node());
        }
    }, {
        key: "down_element",
        value: function down_element() {
            down_legend(this.ellipse.node());
        }
    }, {
        key: "calcAngle",
        value: function calcAngle() {
            var ellipse_elem = this.ellipse.node().querySelector("ellipse");
            var dx = ellipse_elem.rx.baseVal.value - this.pt1[0],
                dy = ellipse_elem.ry.baseVal.value - this.pt1[1];
            return Math.atan2(dy, dx) * (180 / Math.PI);
        }
    }, {
        key: "calcDestFromOAD",
        value: function calcDestFromOAD(origin, angle, distance) {
            var theta = angle / (180 / Math.PI),
                dx = distance * Math.cos(theta),
                dy = distance * Math.sin(theta);
            return [origin[0] + dx, origin[1] + dy];
        }
    }, {
        key: "editStyle",
        value: function editStyle() {
            var self = this,
                ellipse_elem = self.ellipse.node().querySelector("ellipse"),
                zoom_param = svg_map.__zoom,
                map_locked = map_div.select("#hand_button").classed("locked") ? true : false,
                current_options = {
                pt1: this.pt1.slice(),
                rx: ellipse_elem.rx.baseVal.value,
                ry: ellipse_elem.ry.baseVal.value
            };
            var angle = (-this.calcAngle()).toFixed(0);

            if (!map_locked) handle_click_hand('lock');
            make_confirm_dialog2("styleBoxEllipse", i18next.t("app_page.ellipse_edit_box.title"), { widthFitContent: true }).then(function (confirmed) {
                map.selectAll(".ctrl_pt").remove();
                if (confirmed) {
                    // Store shorcut of useful values :
                    self.strokeWeight = ellipse_elem.style.strokeWidth;
                    self.stroke_color = ellipse_elem.style.stroke;
                } else {
                    //Rollback on initials parameters :
                    self.pt1 = current_options.pt1.slice();
                    ellipse_elem.style.strokeWidth = self.strokeWeight;
                    ellipse_elem.style.stroke = self.stroke_color;
                }
                if (!map_locked) handle_click_hand('unlock');
            });
            var box_content = d3.select(".styleBoxEllipse").select(".modal-body").insert("div").attr("id", "styleBoxEllipse");
            var s1 = box_content.append("p");
            s1.append("p").style("margin", "auto").html(i18next.t("app_page.ellipse_edit_box.stroke_width"));
            s1.append("input").attrs({ type: "range", id: "ellipse_strokeWeight", min: 0, max: 34, step: 0.1, value: self.strokeWeight }).styles({ width: "80px", "vertical-align": "middle" }).on("change", function () {
                ellipse_elem.style.strokeWidth = this.value;
                txt_line_weight.html(this.value + "px");
            });
            var txt_line_weight = s1.append("span").html(self.strokeWeight + " px");

            var s2 = box_content.append("p").style("margin", "auto");
            s2.append("p").style("margin", "auto").html(i18next.t("app_page.ellipse_edit_box.stroke_color"));
            s2.append("input").attrs({ type: "color", id: "ellipse_strokeColor", value: self.stroke_color }).on("change", function () {
                ellipse_elem.style.stroke = this.value;
            });
            //  let s2b = box_content.append("p").attr('class', 'line_elem')
            //  s2b.append("span").html(i18next.t("app_page.ellipse_edit_box.ellispeAngle"))
            //  s2b.insert("span").styles({float: 'right', 'width': '12px'}).html("&nbsp;°");
            //  s2b.insert("input")
            //      .attrs({id: "ellipse_angle_text", class: "without_spinner", value: angle, min: 0, max: 1, step: 1})
            //      .styles({width: "30px", "margin-left": "10px", 'float': 'right'})
            //      .on("input", function(){
            //          let elem = document.getElementById("ellipse_angle");
            //          elem.value = this.value;
            //          elem.dispatchEvent(new Event('change'));
            //      });
            //  s2b.insert("input")
            //      .attrs({id: "ellipse_angle", type: "range", value: Math.abs(angle), min: 0, max: 360, step: 1})
            //      .styles({width: "80px", "vertical-align": "middle", 'float': 'right'})
            //      .on("change", function(){
            //         let pt2 = [self.pt1[0] - ellipse_elem.rx.baseVal.value, self.pt1[1]],
            //             distance = Math.sqrt((self.pt1[0] - pt2[0]) * (self.pt1[0] - pt2[0]) + (self.pt1[1] - pt2[1]) * (self.pt1[1] - pt2[1])),
            //             angle = Math.abs(+this.value);
            //          let [nx, ny] = self.calcDestFromOAD(self.pt1, angle, distance);
            //          console.log("angle :", angle); console.log("pt2 :", pt2); console.log("distance :", distance);
            //          console.log(ellipse_elem.rx.baseVal.value, self.pt1[0], nx);
            //          console.log(ellipse_elem.ry.baseVal.value, self.pt1[1], ny);
            //          ellipse_elem.rx.baseVal.value = nx;
            //          ellipse_elem.ry.baseVal.value = ny;
            //          document.getElementById("ellipse_angle_text").value = +this.value;
            //      });
        }
    }, {
        key: "handle_ctrl_pt",
        value: function handle_ctrl_pt() {
            var self = this,
                ellipse_elem = self.ellipse.node().querySelector("ellipse"),
                zoom_param = svg_map.__zoom,
                map_locked = map_div.select("#hand_button").classed("locked") ? true : false;

            var cleanup_edit_state = function cleanup_edit_state() {
                map.selectAll('.ctrl_pt').remove();
                self.ellipse.call(self.drag_behavior);
                self.ellipse.on('dblclick', function () {
                    d3.event.preventDefault();
                    d3.event.stopPropagation();
                    self.handle_ctrl_pt();
                });
                document.getElementById('hand_button').onclick = handle_click_hand;
            };

            // Change the behavior of the 'lock' button :
            document.getElementById('hand_button').onclick = function () {
                cleanup_edit_state();
                handle_click_hand();
            };

            // Desactive the ability to drag the ellipse :
            self.ellipse.on('.drag', null);
            // Desactive the ability to zoom/move on the map ;
            handle_click_hand('lock');

            var tmp_start_point = map.append("rect").attr("class", "ctrl_pt").attr('id', 'pt1').attr("x", (self.pt1[0] - ellipse_elem.rx.baseVal.value) * zoom_param.k + zoom_param.x - 4).attr("y", self.pt1[1] * zoom_param.k + zoom_param.y - 4).attr("height", 8).attr("width", 8).call(d3.drag().on("drag", function () {
                var t = d3.select(this);
                t.attr("x", d3.event.x - 4);
                var dist = self.pt1[0] - (d3.event.x - zoom_param.x) / zoom_param.k;
                // let dist = self.pt1[0] - (d3.event.x / zoom_param.k - zoom_param.x);
                ellipse_elem.rx.baseVal.value = dist;
            }));
            var tmp_end_point = map.append("rect").attrs({ class: 'ctrl_pt', height: 8, width: 8, id: 'pt2',
                x: self.pt1[0] * zoom_param.k + zoom_param.x - 4, y: (self.pt1[1] - ellipse_elem.ry.baseVal.value) * zoom_param.k + zoom_param.y - 4 }).call(d3.drag().on("drag", function () {
                var t = d3.select(this);
                t.attr("y", d3.event.y - 4);
                var dist = self.pt1[1] - (d3.event.y - zoom_param.y) / zoom_param.k;
                ellipse_elem.ry.baseVal.value = dist;
            }));

            self.ellipse.on('dblclick', function () {
                d3.event.stopPropagation();
                d3.event.preventDefault();
                cleanup_edit_state();
                if (!map_locked) {
                    handle_click_hand('unlock');
                }
            });
        }
    }]);

    return UserEllipse;
}();
"use strict";
/**
* Function called on clicking on the legend button of each layer
* - toggle the visibility of the legend (or create the legend if doesn't currently exists)
*
* @param {String} layer - The layer name
*
*/

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function handle_legend(layer) {
    var state = current_layers[layer].renderer;
    if (state != undefined) {
        var class_name = ["lgdf", _app.layer_to_id.get(layer)].join('_');
        var legends = svg_map.getElementsByClassName(class_name);
        if (legends.length > 0) {
            if (legends[0].getAttribute('display') == null) Array.prototype.forEach.call(legends, function (el) {
                return el.setAttribute('display', 'none');
            });else {
                Array.prototype.forEach.call(legends, function (el) {
                    return el.removeAttribute('display');
                });
                // Redisplay the legend(s) and also
                // verify if still in the visible part
                // of the map, if not, move them in:
                // .. so it's actually a feature if the legend is redrawn on its origin location
                // after being moved too close to the outer border of the map :
                var tol = 7.5,
                    map_xy0 = get_map_xy0(),
                    limit_left = map_xy0.x - tol,
                    limit_right = map_xy0.x + +w + tol,
                    limit_top = map_xy0.y - tol,
                    limit_bottom = map_xy0.y + +h + tol;

                for (var i = 0; i < legends.length; i++) {
                    var bbox_legend = legends[i].getBoundingClientRect();
                    if (bbox_legend.left < limit_left || bbox_legend.left > limit_right || bbox_legend.top < limit_top || bbox_legend.top > limit_bottom) legends[i].setAttribute("transform", "translate(0, 0)");
                }
            }
        } else {
            createLegend(layer, "");
            up_legends();
        }
    }
}

/**
* Function called on the first click on the legend button of each layer
* - delegate legend creation according to the type of function
*
* @param {String} layer - The layer name
* @param {String} title - The desired title (default: empty - can be modified later)
*
*/
function createLegend(layer, title) {
    var renderer = current_layers[layer].renderer,
        field = current_layers[layer].rendered_field,
        field2 = current_layers[layer].rendered_field2,
        type_layer = current_layers[layer].type,
        el,
        el2,
        lgd_pos,
        lgd_pos2;

    lgd_pos = getTranslateNewLegend();

    if (renderer.indexOf("Choropleth") > -1 || renderer.indexOf('Gridded') > -1 || renderer.indexOf('Stewart') > -1 || renderer.indexOf('TypoSymbols') > -1) {
        el = createLegend_choro(layer, field, title, field, 0);
    } else if (renderer.indexOf('Categorical') > -1) {
        el = createLegend_choro(layer, field, title, field, 4);
    } else if (renderer.indexOf("Links") != -1 || renderer.indexOf("DiscLayer") != -1) {
        el = createLegend_discont_links(layer, field, title, field);
    } else if (renderer.indexOf("PropSymbolsChoro") != -1) {
        el = createLegend_choro(layer, field2, title, field2, 0);
        el2 = type_layer === "Line" ? createLegend_line_symbol(layer, field, title, field) : createLegend_symbol(layer, field, title, field);
    } else if (renderer.indexOf("PropSymbolsTypo") != -1) {
        el = createLegend_choro(layer, field2, title, field2, 4);
        el2 = type_layer === "Line" ? createLegend_line_symbol(layer, field, title, field) : createLegend_symbol(layer, field, title, field);
    } else if (renderer.indexOf("PropSymbols") != -1) {
        el = type_layer === "Line" ? createLegend_line_symbol(layer, field, title, field) : createLegend_symbol(layer, field, title, field);
    } else {
        swal("Oops..", i18next.t("No legend available for this representation") + ".<br>" + i18next.t("Want to make a <a href='/'>suggestion</a> ?"), "warning");
    }

    if (el && lgd_pos && lgd_pos.x) {
        el.attr('transform', 'translate(' + lgd_pos.x + ',' + lgd_pos.y + ')');
    }
    if (el2) {
        var _lgd_pos = getTranslateNewLegend(),
            prev_bbox = el.node().getBoundingClientRect(),
            dim_h = lgd_pos.y + prev_bbox.height,
            dim_w = lgd_pos.x + prev_bbox.width;
        if (_lgd_pos.x != lgd_pos.x || _lgd_pos.y != lgd_pos.y) {
            el2.attr('transform', 'translate(' + _lgd_pos.x + ',' + _lgd_pos.y + ')');
        } else if (dim_h < h) {
            el2.attr('transform', 'translate(' + lgd_pos.x + ',' + dim_h + ')');
        } else if (dim_w < w) {
            el2.attr('transform', 'translate(' + dim_w + ',' + lgd_pos.y + ')');
        }
    }
}

function up_legend(legend_node) {
    var lgd_features = svg_map.getElementsByClassName("legend"),
        nb_lgd_features = +lgd_features.length,
        self_position = void 0;
    for (var i = 0; i < nb_lgd_features; i++) {
        if (lgd_features[i].id == legend_node.id && lgd_features[i].classList == legend_node.classList) {
            self_position = i;
        }
    }
    if (self_position == nb_lgd_features - 1) {
        return;
    } else {
        svg_map.insertBefore(lgd_features[self_position + 1], lgd_features[self_position]);
    }
}

function down_legend(legend_node) {
    var lgd_features = svg_map.getElementsByClassName("legend"),
        nb_lgd_features = +lgd_features.length,
        self_position = void 0;
    for (var i = 0; i < nb_lgd_features; i++) {
        if (lgd_features[i].id == legend_node.id && lgd_features[i].classList == legend_node.classList) {
            self_position = i;
        }
    }
    if (self_position == 0) {
        return;
    } else {
        svg_map.insertBefore(lgd_features[self_position], lgd_features[self_position - 1]);
    }
}

function make_legend_context_menu(legend_node, layer) {
    var context_menu = new ContextMenu(),
        getItems = function getItems() {
        return [{ "name": i18next.t("app_page.common.edit_style"), "action": function action() {
                createlegendEditBox(legend_node.attr("id"), layer);
            } }, { "name": i18next.t("app_page.common.up_element"), "action": function action() {
                up_legend(legend_node.node());
            } }, { "name": i18next.t("app_page.common.down_element"), "action": function action() {
                down_legend(legend_node.node());
            } }, { "name": i18next.t("app_page.common.hide"), "action": function action() {
                if (!(legend_node.attr("display") == "none")) legend_node.attr("display", "none");else legend_node.attr("display", null);
            } }];
    };
    legend_node.on("dblclick", function () {
        d3.event.stopPropagation();
        d3.event.preventDefault();
        createlegendEditBox(legend_node.attr("id"), layer);
    });

    legend_node.on("contextmenu", function () {
        context_menu.showMenu(d3.event, document.querySelector("body"), getItems());
    });
}

var drag_legend_func = function drag_legend_func(legend_group) {
    return d3.drag().subject(function () {
        var t = d3.select(this),
            prev_translate = t.attr("transform");
        prev_translate = prev_translate ? prev_translate.slice(10, -1).split(',').map(function (f) {
            return +f;
        }) : [0, 0];
        return {
            x: t.attr("x") + prev_translate[0], y: t.attr("y") + prev_translate[1],
            map_locked: map_div.select("#hand_button").classed("locked") ? true : false,
            map_offset: get_map_xy0()
        };
    }).on("start", function () {
        d3.event.sourceEvent.stopPropagation();
        d3.event.sourceEvent.preventDefault();
        handle_click_hand("lock");
    }).on("end", function () {
        if (d3.event.subject && !d3.event.subject.map_locked) handle_click_hand("unlock");
        legend_group.style("cursor", "grab");
    }).on("drag", function () {
        var prev_value = legend_group.attr("transform");
        prev_value = prev_value ? prev_value.slice(10, -1).split(',').map(function (f) {
            return +f;
        }) : [0, 0];
        legend_group.attr('transform', 'translate(' + [d3.event.x, d3.event.y] + ')').style("cursor", "grabbing");

        var bbox_elem = legend_group.node().getBoundingClientRect(),
            map_offset = d3.event.subject.map_offset,
            val_x = d3.event.x,
            val_y = d3.event.y,
            change = void 0;

        if (bbox_elem.left < map_offset.x || bbox_elem.left + bbox_elem.width > map_offset.x + w) {
            val_x = prev_value[0];
            change = true;
        }
        if (bbox_elem.top < map_offset.y || bbox_elem.top + bbox_elem.height > map_offset.y + h) {
            val_y = prev_value[1];
            change = true;
        }
        if (change) legend_group.attr('transform', 'translate(' + [val_x, val_y] + ')');
    });
};

function createLegend_discont_links(layer, field, title, subtitle, rect_fill_value, rounding_precision, note_bottom) {
    var space_elem = 18,
        boxgap = 12,
        xpos = 30,
        ypos = 30,
        y_pos2 = ypos + space_elem,
        tmp_class_name = ["legend", "legend_feature", "lgdf_" + _app.layer_to_id.get(layer)].join(' '),
        breaks = current_layers[layer].breaks,
        nb_class = breaks.length;

    if (rounding_precision == undefined) {
        var b_val = breaks.map(function (v, i) {
            return v[0][0];
        }).concat(breaks[nb_class - 1][0][1]);
        rounding_precision = get_lgd_display_precision(b_val);
    }

    var legend_root = map.insert('g').attrs({ id: 'legend_root_lines_class', class: tmp_class_name, transform: 'translate(0,0)', rounding_precision: rounding_precision, layer_field: field, layer_name: layer }).styles({ cursor: 'grab', font: '11px "Enriqueta",arial,serif' });

    var rect_under_legend = legend_root.insert("rect");

    legend_root.insert('text').attr("id", "legendtitle").text(title || "Title").style("font", "bold 12px 'Enriqueta', arial, serif").attrs(subtitle != "" ? { x: xpos + space_elem, y: ypos } : { x: xpos + space_elem, y: ypos + 15 });

    legend_root.insert('text').attr("id", "legendsubtitle").text(subtitle).style("font", "italic 12px 'Enriqueta', arial, serif").attrs({ x: xpos + space_elem, y: ypos + 15 });

    var ref_symbols_params = [];

    // Prepare symbols for the legend, taking care of not representing values
    // under the display threshold defined by the user (if any) :
    var current_min_value = +current_layers[layer].min_display;
    if (current_layers[layer].renderer == "DiscLayer") {
        // Todo use the same way to store the threshold for links and disclayer
        // in order to avoid theses condition
        var values = Array.prototype.map.call(svg_map.querySelector('#' + _app.layer_to_id.get(layer)).querySelectorAll('path'), function (d) {
            return +d.__data__.properties["disc_value"];
        });
        current_min_value = current_min_value != 1 ? values[Math.round(current_min_value * current_layers[layer].n_features)] : values[values.length - 1];
    }
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = breaks[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var _b_val = _step.value;

            if (_b_val[1] != 0) {
                if (current_min_value >= +_b_val[0][0] && current_min_value < +_b_val[0][1]) {
                    ref_symbols_params.push({ value: [current_min_value, _b_val[0][1]], size: _b_val[1] });
                } else if (current_min_value < +_b_val[0][0] && current_min_value < +_b_val[0][1]) {
                    ref_symbols_params.push({ value: _b_val[0], size: _b_val[1] });
                }
            }
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }

    ref_symbols_params.reverse();

    var legend_elems = legend_root.selectAll('.legend').append("g").data(ref_symbols_params).enter().insert('g').attr('class', function (d, i) {
        return "lg legend_" + i;
    });

    var max_size = current_layers[layer].size[1],
        last_size = 0,
        last_pos = y_pos2,
        color = current_layers[layer].fill_color.single,
        xrect = xpos + space_elem + max_size / 2;

    legend_elems.append("rect").styles({ fill: color, stroke: "rgb(0, 0, 0)", "fill-opacity": 1, "stroke-width": 0 }).attrs(function (d) {
        last_pos = boxgap + last_pos + last_size;
        last_size = d.size;
        return { x: xrect, y: last_pos, width: 45, height: d.size };
    });

    last_pos = y_pos2;
    last_size = 0;

    var x_text_pos = xpos + space_elem + max_size * 1.5 + 45;
    var tmp_pos = void 0;
    legend_elems.append("text").attrs(function (d) {
        last_pos = boxgap + last_pos + last_size;
        last_size = d.size;
        tmp_pos = last_pos - d.size / 4;
        return { x: x_text_pos, y: tmp_pos };
    }).styles({ 'alignment-baseline': 'middle', 'font-size': '10px' }).text(function (d) {
        return round_value(d.value[1], rounding_precision).toLocaleString();
    });

    legend_root.insert('text').attr("id", "lgd_choro_min_val").attr("x", x_text_pos).attr("y", tmp_pos + boxgap).styles({ 'alignment-baseline': 'middle', 'font-size': '10px' }).text(round_value(ref_symbols_params[ref_symbols_params.length - 1].value[0], rounding_precision).toLocaleString());

    legend_root.call(drag_legend_func(legend_root));

    legend_root.append("g").insert("text").attr("id", "legend_bottom_note").attrs({ x: xpos + space_elem, y: last_pos + 2 * space_elem }).style("font", "11px 'Enriqueta', arial, serif").text(note_bottom != null ? note_bottom : '');
    make_underlying_rect(legend_root, rect_under_legend, rect_fill_value);
    legend_root.select('#legendtitle').text(title || "");
    make_legend_context_menu(legend_root, layer);
    return legend_root;
}

/**
* Function computing the size of the rectangle to be put under the legend
* (called on each change modifying the size of the legend box,
* eg. longer title, switching to nested symbols, etc..)
*
*/
function make_underlying_rect(legend_root, under_rect, fill) {
    under_rect.attrs({ "width": 0, height: 0 });
    var bbox_legend = legend_root.node().getBoundingClientRect(),
        translate = legend_root.attr("transform"),
        map_xy0 = get_map_xy0();

    translate = translate ? translate.split("translate(")[1].split(")")[0].split(",").map(function (d) {
        return +d;
    }) : [0, 0];

    var bbox = {
        x_top_left: bbox_legend.left - map_xy0.x - 5 - translate[0],
        y_top_left: bbox_legend.top - map_xy0.y - 5 - translate[1],
        x_top_right: bbox_legend.right - map_xy0.x + 5 - translate[0],
        y_top_right: bbox_legend.top - map_xy0.y - 5 - translate[1],
        x_bottom_left: bbox_legend.left - map_xy0.x - 5 - translate[0],
        y_bottom_left: bbox_legend.bottom - map_xy0.y + 5 - translate[1]
    };
    var rect_height = get_distance([bbox.x_top_left, bbox.y_top_left], [bbox.x_bottom_left, bbox.y_bottom_left]),
        rect_width = get_distance([bbox.x_top_left, bbox.y_top_left], [bbox.x_top_right, bbox.y_top_right]);

    under_rect.attrs({ "id": "under_rect", "height": rect_height, "width": rect_width });
    under_rect.attr("x", bbox.x_top_left).attr("y", bbox.y_top_left);

    if (!fill || !fill.color || !fill.opacity) {
        under_rect.style("fill", "green").style("fill-opacity", 0);
        legend_root.attr("visible_rect", "false");
        legend_root.on("mouseover", function () {
            under_rect.style("fill-opacity", 0.1);
        }).on("mouseout", function () {
            under_rect.style("fill-opacity", 0);
        });
    } else {
        under_rect.style("fill", fill.color).style("fill-opacity", fill.opacity);
        legend_root.attr("visible_rect", "true");
        legend_root.on("mouseover", null).on("mouseout", null);
    }
}

function createLegend_symbol(layer, field, title, subtitle) {
    var nested = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : "false";
    var rect_fill_value = arguments[5];
    var rounding_precision = arguments[6];
    var note_bottom = arguments[7];
    var options = arguments.length > 8 && arguments[8] !== undefined ? arguments[8] : {};

    var parent = options.parent || window.map;
    var space_elem = 18,
        boxgap = 4,
        xpos = 30,
        ypos = 30,
        y_pos2 = ypos + space_elem * 1.5,
        nb_features = current_layers[layer].n_features,
        tmp_class_name = ["legend", "legend_feature", "lgdf_" + _app.layer_to_id.get(layer)].join(' '),
        symbol_type = current_layers[layer].symbol;

    var color_symb_lgd = current_layers[layer].renderer === "PropSymbolsChoro" || current_layers[layer].renderer === "PropSymbolsTypo" || current_layers[layer].fill_color.two !== undefined || current_layers[layer].fill_color.random !== undefined ? "#FFF" : current_layers[layer].fill_color.single;

    var legend_root = parent.insert('g').styles({ cursor: 'grab', font: '11px "Enriqueta",arial,serif' }).attrs({ id: 'legend_root_symbol', class: tmp_class_name, transform: 'translate(0,0)', layer_name: layer,
        nested: nested, rounding_precision: rounding_precision, layer_field: field });

    var rect_under_legend = legend_root.insert("rect");
    legend_root.insert('text').attr("id", "legendtitle").text(title).style("font", "bold 12px 'Enriqueta', arial, serif").attrs(subtitle != "" ? { x: xpos + space_elem, y: ypos } : { x: xpos + space_elem, y: ypos + 15 });
    legend_root.insert('text').attr("id", "legendsubtitle").text(subtitle).style("font", "italic 12px 'Enriqueta', arial, serif").attrs({ x: xpos + space_elem, y: ypos + 15 });

    var ref_symbols = document.getElementById(_app.layer_to_id.get(layer)).getElementsByTagName(symbol_type),
        type_param = symbol_type === 'circle' ? 'r' : 'width',
        z_scale = +d3.zoomTransform(map.node()).k,
        _current_layers$layer = _slicedToArray(current_layers[layer].size, 2),
        ref_value = _current_layers$layer[0],
        ref_size = _current_layers$layer[1],
        propSize = new PropSizer(ref_value, ref_size, symbol_type);


    if (!current_layers[layer].size_legend_symbol) {
        var non_empty = Array.prototype.filter.call(ref_symbols, function (d, i) {
            if (d[type_param].baseVal.value != 0) return d[type_param].baseVal.value;
        }),
            size_max = +non_empty[0].getAttribute(type_param),
            size_min = +non_empty[non_empty.length - 1].getAttribute(type_param),
            sqrt = Math.sqrt,
            val_max = Math.abs(+non_empty[0].__data__.properties[field]),
            val_min = Math.abs(+non_empty[non_empty.length - 1].__data__.properties[field]),
            r = Math.max(get_nb_decimals(val_max), get_nb_decimals(val_min)),
            diff_size = sqrt(size_max) - sqrt(size_min),
            size_interm1 = sqrt(size_min) + diff_size / 3,
            size_interm2 = Math.pow(size_interm1 + diff_size / 3, 2);
        size_interm1 = Math.pow(size_interm1, 2);
        current_layers[layer].size_legend_symbol = [{ value: val_max }, { value: round_value(propSize.get_value(size_interm2), r) }, { value: round_value(propSize.get_value(size_interm1), r) }, { value: val_min }];
    }
    var t = current_layers[layer].size_legend_symbol;
    var ref_symbols_params = [{ size: propSize.scale(t[0].value) * z_scale, value: t[0].value }, { size: propSize.scale(t[1].value) * z_scale, value: t[1].value }, { size: propSize.scale(t[2].value) * z_scale, value: t[2].value }, { size: propSize.scale(t[3].value) * z_scale, value: t[3].value }];

    var legend_elems = legend_root.selectAll('.legend').append("g").data(ref_symbols_params).enter().insert('g').attr('class', function (d, i) {
        return "lg legend_" + i;
    });

    var max_size = ref_symbols_params[0].size,
        last_size = 0;

    if (symbol_type === "rect") {
        y_pos2 = y_pos2 - max_size / 2;
    }

    var last_pos = y_pos2;

    if (nested == "false") {
        if (symbol_type === "circle") {
            legend_elems.append("circle").styles({ fill: color_symb_lgd, stroke: "rgb(0, 0, 0)", "fill-opacity": 1 }).attrs(function (d, i) {
                last_pos = i * boxgap + d.size + last_pos + last_size;
                last_size = d.size;
                return {
                    "cx": xpos + space_elem + boxgap + max_size / 2,
                    "cy": last_pos,
                    "r": d.size
                };
            });

            last_pos = y_pos2;last_size = 0;
            legend_elems.append("text").attrs(function (d, i) {
                last_pos = i * boxgap + d.size + last_pos + last_size;
                last_size = d.size;
                return {
                    "x": xpos + space_elem + boxgap + max_size * 1.5 + 5,
                    "y": last_pos + i * 2 / 3
                };
            }).styles({ 'alignment-baseline': 'middle', 'font-size': '10px' }).text(function (d) {
                return round_value(d.value, rounding_precision).toLocaleString();
            });
        } else if (symbol_type === "rect") {
            legend_elems.append("rect").styles({ fill: color_symb_lgd, stroke: "rgb(0, 0, 0)", "fill-opacity": 1 }).attrs(function (d, i) {
                last_pos = i * boxgap + d.size / 2 + last_pos + last_size;
                last_size = d.size;
                return {
                    "x": xpos + space_elem + boxgap + max_size / 2 - last_size / 2,
                    "y": last_pos,
                    "width": last_size,
                    "height": last_size
                };
            });

            last_pos = y_pos2;last_size = 0;
            var x_text_pos = xpos + space_elem + max_size * 1.25;
            legend_elems.append("text").attr("x", x_text_pos).attr("y", function (d, i) {
                last_pos = i * boxgap + d.size / 2 + last_pos + last_size;
                last_size = d.size;
                return last_pos + d.size * 0.6;
            }).styles({ 'alignment-baseline': 'middle', 'font-size': '10px' }).text(function (d) {
                return round_value(d.value, rounding_precision).toLocaleString();
            });
        }
    } else if (nested == "true") {
        if (symbol_type === "circle") {
            legend_elems.append("circle").attrs(function (d) {
                return {
                    cx: xpos + space_elem + boxgap + max_size / 2,
                    cy: ypos + 45 + max_size + max_size / 2 - d.size,
                    r: d.size
                };
            }).styles({ fill: color_symb_lgd, stroke: "rgb(0, 0, 0)", "fill-opacity": 1 });
            last_pos = y_pos2;last_size = 0;
            legend_elems.append("text").attr("x", xpos + space_elem + boxgap + max_size * 1.5 + 5).attr("y", function (d) {
                return ypos + 45 + max_size * 2 - max_size / 2 - d.size * 2;
            }).styles({ 'alignment-baseline': 'middle', 'font-size': '10px' }).text(function (d) {
                return round_value(d.value, rounding_precision).toLocaleString();
            });
            last_pos = ypos + 30 + max_size + max_size / 2;
        } else if (symbol_type === "rect") {
            legend_elems.append("rect").attrs(function (d) {
                return {
                    x: xpos + space_elem + boxgap,
                    y: ypos + 45 + max_size - d.size,
                    width: d.size, height: d.size };
            }).styles({ fill: color_symb_lgd, stroke: "rgb(0, 0, 0)", "fill-opacity": 1 });
            last_pos = y_pos2;last_size = 0;
            legend_elems.append("text").attr("x", xpos + space_elem + max_size * 1.25).attr("y", function (d) {
                return ypos + 46 + max_size - d.size;
            }).styles({ 'alignment-baseline': 'middle', 'font-size': '10px' }).text(function (d) {
                return round_value(d.value, rounding_precision).toLocaleString();
            });
            last_pos = ypos + 30 + max_size;
        }
    }

    if (current_layers[layer].break_val != undefined) {
        var bottom_colors = legend_root.append("g");
        bottom_colors.insert("text").attr("id", "col1_txt").attr("x", xpos + space_elem).attr("y", last_pos + 1.75 * space_elem).styles({ 'alignment-baseline': 'middle', 'font-size': '10px' }).html('< ' + current_layers[layer].break_val.toLocaleString());
        bottom_colors.insert("rect").attr("id", "col1").attr("x", xpos + space_elem).attr("y", last_pos + 2 * space_elem).attrs({ "width": space_elem, "height": space_elem }).style("fill", current_layers[layer].fill_color.two[0]);
        bottom_colors.insert("text").attr("id", "col1_txt").attr("x", xpos + 3 * space_elem).attr("y", last_pos + 1.75 * space_elem).styles({ 'alignment-baseline': 'middle', 'font-size': '10px' }).html('> ' + current_layers[layer].break_val.toLocaleString());
        bottom_colors.insert("rect").attr("id", "col2").attr("x", xpos + 3 * space_elem).attr("y", last_pos + 2 * space_elem).attrs({ "width": space_elem, "height": space_elem }).style("fill", current_layers[layer].fill_color.two[1]);
        last_pos = last_pos + 2.5 * space_elem;
    }
    legend_root.append("g").insert("text").attr("id", "legend_bottom_note").attrs({ x: xpos + space_elem, y: last_pos + 2 * space_elem }).style("font", "11px 'Enriqueta', arial, serif").text(note_bottom != null ? note_bottom : '');

    legend_root.call(drag_legend_func(legend_root));
    make_underlying_rect(legend_root, rect_under_legend, rect_fill_value);
    legend_root.select('#legendtitle').text(title || "");
    if (parent == map) make_legend_context_menu(legend_root, layer);
    return legend_root;
}

function createLegend_line_symbol(layer, field, title, subtitle, rect_fill_value, rounding_precision, note_bottom) {
    var space_elem = 18,
        boxgap = 12,
        xpos = 30,
        ypos = 30,
        y_pos2 = ypos + space_elem,
        tmp_class_name = ["legend", "legend_feature", "lgdf_" + _app.layer_to_id.get(layer)].join(' ');

    var ref_symbols = document.getElementById(_app.layer_to_id.get(layer)).getElementsByTagName("path"),
        type_param = "strokeWidth";

    var non_empty = Array.prototype.filter.call(ref_symbols, function (d, i) {
        if (d.style[type_param] != "0") return true;
    }),
        size_max = +non_empty[0].style[type_param],
        size_min = +non_empty[non_empty.length - 1].style[type_param],
        val_max = Math.abs(+non_empty[0].__data__.properties[field]),
        val_min = Math.abs(+non_empty[non_empty.length - 1].__data__.properties[field]),
        diff_size = size_max - size_min,
        diff_val = val_max - val_min,
        val_interm1 = val_min + diff_val / 3,
        val_interm2 = val_interm1 + diff_val / 3,
        size_interm1 = size_min + diff_size / 3,
        size_interm2 = size_interm1 + diff_size / 3,
        ref_symbols_params = [{ size: size_max, value: val_max }, { size: size_interm2, value: val_interm2 }, { size: size_interm1, value: val_interm1 }, { size: size_min, value: val_min }];

    if (rounding_precision == undefined) {
        rounding_precision = get_lgd_display_precision(ref_symbols_params.map(function (d) {
            return d.value;
        }));
    }

    var legend_root = map.insert('g').attrs({ id: 'legend_root_lines_symbol', class: tmp_class_name, transform: 'translate(0,0)', rounding_precision: rounding_precision, layer_field: field, layer_name: layer }).styles({ cursor: 'grab', font: '11px "Enriqueta",arial,serif' });

    var rect_under_legend = legend_root.insert("rect");

    legend_root.insert('text').attr("id", "legendtitle").text(title || "Title").style("font", "bold 12px 'Enriqueta', arial, serif").attrs(subtitle != "" ? { x: xpos + space_elem, y: ypos } : { x: xpos + space_elem, y: ypos + 15 });

    legend_root.insert('text').attr("id", "legendsubtitle").text(subtitle).style("font", "italic 12px 'Enriqueta', arial, serif").attrs({ x: xpos + space_elem, y: ypos + 15 });

    var legend_elems = legend_root.selectAll('.legend').append("g").data(ref_symbols_params).enter().insert('g').attr('class', function (d, i) {
        return "lg legend_" + i;
    });

    var last_size = 0,
        last_pos = y_pos2,
        color = current_layers[layer].fill_color.single,
        xrect = xpos + space_elem;

    legend_elems.append("rect").styles({ fill: color, stroke: "rgb(0, 0, 0)", "fill-opacity": 1, "stroke-width": 0 }).attrs(function (d) {
        last_pos = boxgap + last_pos + last_size;
        last_size = d.size;
        return { x: xrect, y: last_pos, width: 45, height: d.size };
    });

    last_pos = y_pos2;last_size = 0;
    var x_text_pos = xrect + 55;
    legend_elems.append("text").attrs(function (d) {
        last_pos = boxgap + last_pos + d.size;
        return { x: x_text_pos, y: last_pos + 4 - d.size / 2 };
    }).styles({ 'alignment-baseline': 'middle', 'font-size': '10px' }).text(function (d) {
        return round_value(d.value, rounding_precision).toLocaleString();
    });

    legend_root.append("g").insert("text").attr("id", "legend_bottom_note").attrs({ x: xpos + space_elem, y: last_pos + space_elem }).style("font", "11px 'Enriqueta', arial, serif").text(note_bottom != null ? note_bottom : '');

    legend_root.call(drag_legend_func(legend_root));
    make_underlying_rect(legend_root, rect_under_legend, rect_fill_value);
    legend_root.select('#legendtitle').text(title || "");
    make_legend_context_menu(legend_root, layer);
    return legend_root;
}

var get_lgd_display_precision = function get_lgd_display_precision(breaks) {
    // Set rounding precision to 0 if they are all integers :
    if (breaks.filter(function (b) {
        return (b | 0) == b;
    }).length == breaks.length) {
        return 0;
    }
    // Compute the difference between each break to set
    // ... the rounding precision in order to differenciate each class :
    var diff = void 0;
    for (var i = 0; i < breaks.length - 1; i++) {
        var d = +breaks[i + 1] - +breaks[i];
        if (!diff) diff = d;else if (d < diff) diff = d;
    }
    if (diff > 1 || diff > 0.1) {
        return 1;
    } else if (diff > 0.01) {
        return 2;
    } else if (diff > 0.001) {
        return 3;
    } else if (diff > 0.0001) {
        return 4;
    } else if (diff > 0.00001) {
        return 5;
    } else if (diff > 0.000001) {
        return 6;
    } else if (diff > 0.0000001) {
        return 7;
    } else {
        return undefined;
    }
};

function createLegend_choro(layer, field, title, subtitle) {
    var boxgap = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;
    var rect_fill_value = arguments[5];
    var rounding_precision = arguments[6];
    var no_data_txt = arguments[7];
    var note_bottom = arguments[8];

    var boxheight = 18,
        boxwidth = 18,
        xpos = 30,
        ypos = 30,
        last_pos = null,
        y_pos2 = ypos + boxheight * 1.8,
        tmp_class_name = ["legend", "legend_feature", "lgdf_" + _app.layer_to_id.get(layer)].join(' '),
        nb_class,
        data_colors_label;

    boxgap = +boxgap;

    if (current_layers[layer].renderer.indexOf('Categorical') > -1 || current_layers[layer].renderer.indexOf('PropSymbolsTypo') > -1) {
        data_colors_label = [];
        current_layers[layer].color_map.forEach(function (v, k) {
            data_colors_label.push({ value: v[1], color: v[0] });
        });
        nb_class = current_layers[layer].color_map.size;
    } else if (current_layers[layer].renderer.indexOf('TypoSymbols') > -1) {
        data_colors_label = [];
        current_layers[layer].symbols_map.forEach(function (v, k) {
            data_colors_label.push({ value: k, image: v });
        });
        nb_class = current_layers[layer].symbols_map.size;
    } else {
        data_colors_label = current_layers[layer].colors_breaks.map(function (obj) {
            return { value: obj[0], color: obj[1] };
        });
        nb_class = current_layers[layer].colors_breaks.length;
        if (rounding_precision == undefined) {
            var breaks = current_layers[layer].options_disc.breaks;
            rounding_precision = get_lgd_display_precision(breaks);
        }
    }

    var legend_root = map.insert('g').styles({ cursor: 'grab', font: '11px "Enriqueta",arial,serif' }).attrs({ id: 'legend_root', class: tmp_class_name, layer_field: field,
        transform: 'translate(0,0)', 'boxgap': boxgap,
        'rounding_precision': rounding_precision, layer_name: layer });

    var rect_under_legend = legend_root.insert("rect");

    legend_root.insert('text').attr("id", "legendtitle").text(title || "Title").style("font", "bold 12px 'Enriqueta', arial, serif").attrs(subtitle != "" ? { x: xpos + boxheight, y: ypos } : { x: xpos + boxheight, y: ypos + 15 });

    legend_root.insert('text').attr("id", "legendsubtitle").text(subtitle).style("font", "italic 12px 'Enriqueta', arial, serif").attrs({ x: xpos + boxheight, y: ypos + 15 });

    var legend_elems = legend_root.selectAll('.legend').append("g").data(data_colors_label).enter().insert('g').attr('class', function (d, i) {
        return "lg legend_" + i;
    });

    if (current_layers[layer].renderer.indexOf('TypoSymbols') == -1) legend_elems.append('rect').attr("x", xpos + boxwidth).attr("y", function (d, i) {
        last_pos = y_pos2 + i * boxgap + i * boxheight;
        return last_pos;
    }).attr('width', boxwidth).attr('height', boxheight).styles(function (d) {
        return {
            "fill": d.color, "stroke": d.color
        };
    });else legend_elems.append('image').attrs(function (d, i) {
        return {
            "x": xpos + boxwidth,
            "y": y_pos2 + i * boxgap + i * boxheight,
            "width": boxwidth,
            "height": boxheight,
            "xlink:href": d.image[0]
        };
    });

    if (current_layers[layer].renderer.indexOf('Choropleth') > -1 || current_layers[layer].renderer.indexOf('PropSymbolsChoro') > -1 || current_layers[layer].renderer.indexOf('Gridded') > -1 || current_layers[layer].renderer.indexOf('Stewart') > -1) {
        (function () {
            var tmp_pos = void 0;
            legend_elems.append('text').attr("x", xpos + boxwidth * 2 + 10).attr("y", function (d, i) {
                tmp_pos = y_pos2 + i * boxheight + i * boxgap;
                return tmp_pos;
            }).styles({ 'alignment-baseline': 'middle', 'font-size': '10px' }).text(function (d) {
                return round_value(+d.value.split(' - ')[1], rounding_precision).toLocaleString();
            });

            legend_root.insert('text').attr("id", "lgd_choro_min_val").attr("x", xpos + boxwidth * 2 + 10).attr("y", tmp_pos + boxheight + boxgap).styles({ 'alignment-baseline': 'middle', 'font-size': '10px' }).text(function (d) {
                return round_value(data_colors_label[data_colors_label.length - 1].value.split(' - ')[0], rounding_precision).toLocaleString();
            });
        })();
    } else legend_elems.append('text').attr("x", xpos + boxwidth * 2 + 10).attr("y", function (d, i) {
        return y_pos2 + i * boxheight + i * boxgap + boxheight * 2 / 3;
    }).styles({ 'alignment-baseline': 'middle', 'font-size': '10px' }).text(function (d) {
        return d.value;
    });

    if (current_layers[layer].options_disc && current_layers[layer].options_disc.no_data) {
        var gp_no_data = legend_root.append("g");
        gp_no_data.append('rect').attrs({ x: xpos + boxheight, y: last_pos + 2 * boxheight }).attr('width', boxwidth).attr('height', boxheight).style('fill', current_layers[layer].options_disc.no_data).style('stroke', current_layers[layer].options_disc.no_data);

        gp_no_data.append('text').attrs({ x: xpos + boxwidth * 2 + 10, y: last_pos + 2.7 * boxheight, id: "no_data_txt" }).styles({ 'alignment-baseline': 'middle', 'font-size': '10px' }).text(no_data_txt != null ? no_data_txt : "No data");

        last_pos = last_pos + 2 * boxheight;
    }

    legend_root.append("g").insert("text").attr("id", "legend_bottom_note").attrs({ x: xpos + boxheight, y: last_pos + 2 * boxheight }).style("font", "11px 'Enriqueta', arial, serif").text(note_bottom != null ? note_bottom : '');
    legend_root.call(drag_legend_func(legend_root));
    make_underlying_rect(legend_root, rect_under_legend, rect_fill_value);
    legend_root.select('#legendtitle').text(title || "");
    make_legend_context_menu(legend_root, layer);
    return legend_root;
}

function display_box_value_symbol(layer_name) {
    var symbol_type = current_layers[layer_name].symbol,
        field = current_layers[layer_name].rendered_field,
        ref_symbols = document.getElementById(_app.layer_to_id.get(layer_name)).getElementsByTagName(symbol_type),
        type_param = symbol_type === 'circle' ? 'r' : 'width',
        non_empty = Array.prototype.filter.call(ref_symbols, function (d, i) {
        if (d[type_param].baseVal.value != 0) return d[type_param].baseVal.value;
    }),
        val_max = Math.abs(+non_empty[0].__data__.properties[field]);

    var redraw_sample_legend = function () {
        var legend_node = svg_map.querySelector(["#legend_root_symbol.lgdf_", _app.layer_to_id.get(layer_name)].join(''));
        var rendered_field = current_layers[layer_name].rendered_field;
        var nested = legend_node.getAttribute("nested");
        var rounding_precision = legend_node.getAttribute("rounding_precision");
        var lgd_title = legend_node.querySelector("#legendtitle").innerHTML,
            lgd_subtitle = legend_node.querySelector("#legendsubtitle").innerHTML,
            note = legend_node.querySelector('#legend_bottom_note').innerHTML;
        return function (values) {
            if (values) {
                current_layers[layer_name].size_legend_symbol = values.sort(function (a, b) {
                    return b.value - a.value;
                });
                val1.node().value = values[0].value;
                val2.node().value = values[1].value;
                val3.node().value = values[2].value;
                val4.node().value = values[3].value;
            }
            sample_svg.selectAll('g').remove();
            createLegend_symbol(layer_name, rendered_field, lgd_title, lgd_subtitle, nested, {}, rounding_precision, note, { parent: sample_svg });
            sample_svg.select('g').select('#under_rect').remove();
        };
    }();

    var prom = make_confirm_dialog2("legend_symbol_values_box", layer_name + " - " + i18next.t("app_page.legend_symbol_values_box.title")).then(function (confirmed) {
        current_layers[layer_name].size_legend_symbol = confirmed ? current_layers[layer_name].size_legend_symbol : original_values;
        return Promise.resolve(confirmed);
    });

    var box_body = d3.select('.legend_symbol_values_box').select('.modal-content').style('width', '400px').select('.modal-body');
    box_body.append('p').style('text-align', 'center').insert('h3');
    // .html(i18next.t("app_page.legend_symbol_values_box.subtitle"));
    var sample_svg = box_body.append('div').attr('id', 'sample_svg').style('float', 'left').append('svg').attrs({ width: 200, height: 300, id: 'svg_sample_legend' });

    var values_to_use = [].concat(current_layers[layer_name].size_legend_symbol.map(function (f) {
        return cloneObj(f);
    })),
        original_values = [].concat(values_to_use);

    var _current_layers$layer2 = _slicedToArray(current_layers[layer_name].size, 2),
        ref_value = _current_layers$layer2[0],
        ref_size = _current_layers$layer2[1];

    var propSize = new PropSizer(ref_value, ref_size, symbol_type);

    var input_zone = box_body.append('div').styles({ 'float': 'right', 'top': '100px', right: '20px', position: 'relative' });
    var a = input_zone.append('p');
    var b = input_zone.append('p');
    var c = input_zone.append('p');
    var d = input_zone.append('p');

    var val1 = a.insert('input').style('width', '80px').attrs({ class: "without_spinner", type: 'number', max: val_max }).on('change', function () {
        var val = +this.value;
        if (isNaN(val)) return;
        values_to_use[0] = { size: propSize.scale(val), value: val };
        val2.attr('max', val);
        redraw_sample_legend(values_to_use);
    });
    var val2 = b.insert('input').style('width', '80px').attrs({ class: "without_spinner", type: 'number', max: values_to_use[0].value, min: values_to_use[2] }).on('change', function () {
        var val = +this.value;
        if (isNaN(val)) return;
        values_to_use[1] = { size: propSize.scale(val), value: val };
        val1.attr('min', val);
        val3.attr('max', val);
        redraw_sample_legend(values_to_use);
    });
    var val3 = c.insert('input').style('width', '80px').attrs({ class: "without_spinner", type: 'number', max: values_to_use[1].value, min: values_to_use[3].value }).on('change', function () {
        var val = +this.value;
        if (isNaN(val)) return;
        values_to_use[2] = { size: propSize.scale(val), value: val };
        val2.attr('min', val);
        val4.attr('max', val);
        redraw_sample_legend(values_to_use);
    });
    var val4 = d.insert('input').style('width', '80px').attrs({ class: "without_spinner", type: 'number', min: 0, max: values_to_use[2].value }).on('change', function () {
        var val = +this.value;
        if (isNaN(val)) return;
        values_to_use[3] = { size: propSize.scale(val), value: val };
        val3.attr('min', val);
        redraw_sample_legend(values_to_use);
    });
    box_body.append('div').styles({ 'clear': 'both', 'text-align': 'center' }).append('p').styles({ 'text-align': 'center' }).insert('span').attrs({ class: 'button_st3' }).html(i18next.t('app_page.legend_symbol_values_box.reset')).on('click', function () {
        current_layers[layer_name].size_legend_symbol = undefined;
        redraw_sample_legend();
    });
    val1.node().value = values_to_use[0].value;
    val2.node().value = values_to_use[1].value;
    val3.node().value = values_to_use[2].value;
    val4.node().value = values_to_use[3].value;
    redraw_sample_legend();
    return prom;
}

// Todo : find a better organization for the options in this box
//       (+ better alignement)
function createlegendEditBox(legend_id, layer_name) {
    function bind_selections() {
        box_class = [layer_id, "_legend_popup"].join('');
        legend_node = svg_map.querySelector(["#", legend_id, ".lgdf_", layer_id].join(''));
        title_content = legend_node.querySelector("#legendtitle");
        subtitle_content = legend_node.querySelector("#legendsubtitle");
        note_content = legend_node.querySelector("#legend_bottom_note");
        no_data_txt = legend_node.querySelector("#no_data_txt");
        legend_node_d3 = d3.select(legend_node);
        legend_boxes = legend_node_d3.selectAll(["#", legend_id, " .lg"].join('')).select("text");
    };
    var layer_id = _app.layer_to_id.get(layer_name);
    var box_class, legend_node, title_content, subtitle_content, note_content, source_content;
    var legend_node_d3,
        legend_boxes,
        no_data_txt,
        rect_fill_value = {},
        original_rect_fill_value;

    bind_selections();
    if (document.querySelector("." + box_class)) document.querySelector("." + box_class).remove();
    var original_params = {
        title_content: title_content.textContent,
        y_title: title_content.y.baseVal[0].value,
        subtitle_content: subtitle_content.textContent,
        y_subtitle: subtitle_content.y.baseVal[0].value,
        note_content: note_content.textContent,
        no_data_txt: no_data_txt != null ? no_data_txt.textContent : null
    }; //, source_content: source_content.textContent ? source_content.textContent : ""

    if (legend_node.getAttribute("visible_rect") == "true") {
        rect_fill_value = {
            color: legend_node.querySelector("#under_rect").style.fill,
            opacity: legend_node.querySelector("#under_rect").style.fillOpacity
        };
        original_rect_fill_value = cloneObj(rect_fill_value);
    }

    make_confirm_dialog2(box_class, layer_name).then(function (confirmed) {
        if (!confirmed) {
            title_content.textContent = original_params.title_content;
            title_content.y.baseVal[0].value = original_params.y_title;
            subtitle_content.textContent = original_params.subtitle_content;
            subtitle_content.y.baseVal[0].value = original_params.y_subtitle;
            note_content.textContent = original_params.note_content;
            if (no_data_txt) {
                no_data_txt.textContent = original_params.no_data_txt;
            }
            rect_fill_value = original_rect_fill_value;
        }
        make_underlying_rect(legend_node_d3, legend_node_d3.select("#under_rect"), rect_fill_value);
        bind_selections();
    });
    var container = document.getElementsByClassName(box_class)[0];
    var box_body = d3.select(container).select('.modal-dialog').style('width', '375px').select(".modal-body");
    var current_nb_dec;

    box_body.append('p').style('text-align', 'center').insert('h3').html(i18next.t("app_page.legend_style_box.subtitle"));

    var a = box_body.append('p');
    a.append('span').html(i18next.t("app_page.legend_style_box.lgd_title"));

    a.append('input').styles({ float: "right" }).attr("value", title_content.textContent).on("keyup", function () {
        title_content.textContent = this.value;
    });

    var b = box_body.append('p');
    b.insert('span').html(i18next.t("app_page.legend_style_box.var_name"));
    b.insert('input').attr("value", subtitle_content.textContent).styles({ float: "right" }).on("keyup", function () {
        var empty = subtitle_content.textContent == "";
        // Move up the title to its original position if the subtitle isn't empty :
        if (empty && this.value != "") {
            title_content.y.baseVal[0].value = title_content.y.baseVal[0].value - 15;
        }
        // Change the displayed content :
        subtitle_content.textContent = this.value;
        // Move down the title (if it wasn't already moved down), if the new subtitle is empty
        if (!empty && subtitle_content.textContent == "") {
            title_content.y.baseVal[0].value = title_content.y.baseVal[0].value + 15;
        }
    });

    var c = box_body.insert('p');
    c.insert('span').html(i18next.t("app_page.legend_style_box.additionnal_notes"));
    c.insert('input').attr("value", note_content.textContent).styles({ float: "right", "font-family": "12px Gill Sans Extrabold, sans-serif" }).on("keyup", function () {
        note_content.textContent = this.value;
    });

    if (no_data_txt) {
        var d = box_body.insert('p');
        d.insert('span').html(i18next.t("app_page.legend_style_box.no_data"));
        d.insert('input').attr("value", no_data_txt.textContent).styles({ float: "right", "font-family": "12px Gill Sans Extrabold, sans-serif" }).on("keyup", function () {
            no_data_txt.textContent = this.value;
        });
    }

    if (current_layers[layer_name].renderer != "Categorical" && current_layers[layer_name].renderer != "TypoSymbols" && !(current_layers[layer_name].renderer == "PropSymbolsTypo" && legend_id.indexOf("2"))) {
        // Float precision for label in the legend
        // (actually it's not really the float precision but an estimation based on
        // the string representation of only two values but it will most likely do the job in many cases)
        var max_nb_decimals = 0,
            max_nb_left = 0;
        if (legend_id.indexOf("2") === -1 && legend_id.indexOf("links") === -1) {
            max_nb_decimals = get_max_nb_dec(layer_name);
            max_nb_left = get_max_nb_left_sep(layer_name);
        } else {
            (function () {
                var nb_dec = [],
                    nb_left = [];
                legend_boxes.each(function (d) {
                    nb_dec.push(get_nb_decimals(d.value));
                    nb_left.push(get_nb_left_separator(d.value));
                });
                max_nb_decimals = max_fast(nb_dec);
                max_nb_left = min_fast(nb_left);
            })();
        }
        max_nb_left = max_nb_left > 2 ? max_nb_left : 2;
        if (max_nb_decimals > 0 || max_nb_left >= 2) {
            if (legend_node.getAttribute("rounding_precision")) current_nb_dec = legend_node.getAttribute("rounding_precision");else {
                (function () {
                    var nbs = [],
                        nb_dec = [];
                    legend_boxes.each(function () {
                        nbs.push(this.textContent);
                    });
                    for (var i = 0; i < nbs.length; i++) {
                        nb_dec.push(get_nb_decimals(nbs[i]));
                    }
                    current_nb_dec = max_fast(nb_dec);
                })();
            }
            if (max_nb_decimals > +current_nb_dec && max_nb_decimals > 18) max_nb_decimals = 18;
            var e = box_body.append('p');
            e.append('span').html(i18next.t("app_page.legend_style_box.float_rounding"));

            e.append('input').attrs({ id: "precision_range", type: "range", min: -+max_nb_left, max: max_nb_decimals, step: 1, value: current_nb_dec }).styles({ float: "right", width: "90px", "vertical-align": "middle", "margin-left": "10px" }).on('change', function () {
                var nb_float = +this.value;
                d3.select("#precision_change_txt").html(nb_float);
                legend_node.setAttribute("rounding_precision", nb_float);
                if (legend_id === "legend_root") {
                    for (var i = 0; i < legend_boxes._groups[0].length; i++) {
                        var values = legend_boxes._groups[0][i].__data__.value.split(' - ');
                        legend_boxes._groups[0][i].innerHTML = round_value(+values[1], nb_float).toLocaleString();
                    }
                    var min_val = +legend_boxes._groups[0][legend_boxes._groups[0].length - 1].__data__.value.split(' - ')[0];
                    legend_node.querySelector('#lgd_choro_min_val').innerHTML = round_value(min_val, nb_float).toLocaleString();
                } else if (legend_id === "legend_root_symbol") {
                    for (var _i = 0; _i < legend_boxes._groups[0].length; _i++) {
                        var value = legend_boxes._groups[0][_i].__data__.value;
                        legend_boxes._groups[0][_i].innerHTML = round_value(+value, nb_float).toLocaleString();
                    }
                } else if (legend_id === "legend_root_lines_class") {
                    for (var _i2 = 0; _i2 < legend_boxes._groups[0].length; _i2++) {
                        var _value = legend_boxes._groups[0][_i2].__data__.value[1];
                        legend_boxes._groups[0][_i2].innerHTML = round_value(+_value, nb_float).toLocaleString();
                    }
                    var _min_val = +legend_boxes._groups[0][legend_boxes._groups[0].length - 1].__data__.value[0];
                    legend_node.querySelector('#lgd_choro_min_val').innerHTML = round_value(_min_val, nb_float).toLocaleString();
                }
            });
            e.append('span').styles({ float: 'right' }).attr("id", "precision_change_txt").html(current_nb_dec + "");
        }
    }

    if (legend_id === "legend_root") {
        var current_state = +legend_node.getAttribute("boxgap") == 0 ? true : false;
        var gap_section = box_body.insert("p");
        gap_section.append("input").style('margin-left', '0px').attrs({ "type": "checkbox", id: 'style_lgd' }).on("change", function () {
            var rendered_field = current_layers[layer_name].rendered_field2 ? current_layers[layer_name].rendered_field2 : current_layers[layer_name].rendered_field;
            legend_node = svg_map.querySelector(["#legend_root.lgdf_", _app.layer_to_id.get(layer_name)].join(''));
            var boxgap = +legend_node.getAttribute("boxgap") == 0 ? 4 : 0;
            var rounding_precision = legend_node.getAttribute("rounding_precision");
            var transform_param = legend_node.getAttribute("transform"),
                lgd_title = legend_node.querySelector("#legendtitle").innerHTML,
                lgd_subtitle = legend_node.querySelector("#legendsubtitle").innerHTML,
                note = legend_node.querySelector('#legend_bottom_note').innerHTML;
            var no_data_txt = legend_node.querySelector("#no_data_txt");
            no_data_txt = no_data_txt != null ? no_data_txt.textContent : null;
            legend_node.remove();
            createLegend_choro(layer_name, rendered_field, lgd_title, lgd_subtitle, boxgap, rect_fill_value, rounding_precision, no_data_txt, note);
            bind_selections();
            if (transform_param) svg_map.querySelector(["#legend_root.lgdf_", _app.layer_to_id.get(layer_name)].join('')).setAttribute("transform", transform_param);
        });
        gap_section.append('label').attrs({ 'for': 'style_lgd', 'class': 'i18n', 'data-i18n': '[html]app_page.legend_style_box.gap_boxes' }).html(i18next.t('app_page.legend_style_box.gap_boxes'));

        document.getElementById("style_lgd").checked = current_state;
    } else if (legend_id == "legend_root_symbol") {
        // let choice_break_value_section1 = box_body.insert('p');
        // choice_break_value_section1.append('span')
        //     .styles({cursor: 'pointer'})
        //     .html(i18next.t('app_page.legend_style_box.choice_break_symbol'))
        //     .on('click', function(){
        //         container.modal.hide();
        //         display_box_value_symbol(layer_name).then(confirmed => {
        //             container.modal.show();
        //             if(confirmed){
        //                 redraw_legends_symbols(svg_map.querySelector(["#legend_root_symbol.lgdf_", _app.layer_to_id.get(layer_name)].join('')));
        //             }
        //         });
        //     });

        var _current_state = legend_node.getAttribute("nested") == "true" ? true : false;
        var _gap_section = box_body.insert("p");
        _gap_section.append("input").style('margin-left', '0px').attrs({ id: 'style_lgd', type: 'checkbox' }).on("change", function () {
            legend_node = svg_map.querySelector(["#legend_root_symbol.lgdf_", _app.layer_to_id.get(layer_name)].join(''));
            var rendered_field = current_layers[layer_name].rendered_field;
            var nested = legend_node.getAttribute("nested") == "true" ? "false" : "true";
            var rounding_precision = legend_node.getAttribute("rounding_precision");
            var transform_param = legend_node.getAttribute("transform"),
                lgd_title = legend_node.querySelector("#legendtitle").innerHTML,
                lgd_subtitle = legend_node.querySelector("#legendsubtitle").innerHTML,
                note = legend_node.querySelector('#legend_bottom_note').innerHTML;

            legend_node.remove();
            createLegend_symbol(layer_name, rendered_field, lgd_title, lgd_subtitle, nested, rect_fill_value, rounding_precision, note);
            bind_selections();
            if (transform_param) svg_map.querySelector(["#legend_root_symbol.lgdf_", _app.layer_to_id.get(layer_name)].join('')).setAttribute("transform", transform_param);
        });
        _gap_section.append('label').attrs({ 'for': 'style_lgd', 'class': 'i18n', 'data-i18n': '[html]app_page.legend_style_box.nested_symbols' }).html(i18next.t("app_page.legend_style_box.nested_symbols"));
        document.getElementById("style_lgd").checked = _current_state;
    }
    // Todo : Reactivate this functionnality :
    //    box_body.insert("p").html("Display features count ")
    //            .insert("input").attr("type", "checkbox")
    //            .on("change", function(){
    //                alert("to be done!");
    //            });

    var rectangle_options1 = box_body.insert('p');
    rectangle_options1.insert("input").style('margin-left', '0px').attrs({ type: "checkbox",
        checked: rect_fill_value.color === undefined ? null : true,
        id: "rect_lgd_checkbox" }).on("change", function () {
        if (this.checked) {
            rectangle_options2.style('display', "");
            var _a = document.getElementById("choice_color_under_rect");
            rect_fill_value = _a ? { color: _a.value, opacity: 1 } : { color: "#ffffff", opacity: 1 };
        } else {
            rectangle_options2.style("display", "none");
            rect_fill_value = {};
        }
        make_underlying_rect(legend_node_d3, legend_node_d3.select("#under_rect"), rect_fill_value);
    });
    rectangle_options1.append('label').attrs({ for: "rect_lgd_checkbox", class: 'i18n', 'data-i18n': '[html]app_page.legend_style_box.under_rectangle' }).html(i18next.t("app_page.legend_style_box.under_rectangle"));

    var rectangle_options2 = rectangle_options1.insert('span').styles({ 'float': 'right', 'display': rect_fill_value.color === undefined ? "none" : "" });
    rectangle_options2.insert("input").attrs({ id: "choice_color_under_rect",
        type: "color",
        value: rect_fill_value.color === undefined ? "#ffffff" : rgb2hex(rect_fill_value.color) }).on("change", function () {
        rect_fill_value = { color: this.value, opacity: 1 };
        make_underlying_rect(legend_node_d3, legend_node_d3.select("#under_rect"), rect_fill_value);
    });
}

function move_legends() {
    var legends = [svg_map.querySelectorAll(".legend_feature"), svg_map.querySelectorAll('#scale_bar.legend')];

    var xy0_map = get_map_xy0(),
        dim_width = w + xy0_map.x,
        dim_heght = h + xy0_map.y;

    for (var j = 0; j < 2; ++j) {
        var legends_type = legends[j];
        for (var i = 0, i_len = legends_type.length; i < i_len; ++i) {
            var legend_bbox = legends_type[i].getBoundingClientRect();
            if (legend_bbox.left + legend_bbox.width > dim_width) {
                var current_transform = legends_type[i].getAttribute("transform");

                var _$exec$1$split = /\(([^\)]+)\)/.exec(current_transform)[1].split(","),
                    _$exec$1$split2 = _slicedToArray(_$exec$1$split, 2),
                    val_x = _$exec$1$split2[0],
                    val_y = _$exec$1$split2[1];

                var trans_x = legend_bbox.left + legend_bbox.width - dim_width;
                legends_type[i].setAttribute("transform", ["translate(", [+val_x - trans_x, val_y], ")"].join(''));
            }
            if (legend_bbox.top + legend_bbox.height > dim_heght) {
                var _current_transform = legends_type[i].getAttribute("transform");

                var _$exec$1$split3 = /\(([^\)]+)\)/.exec(_current_transform)[1].split(","),
                    _$exec$1$split4 = _slicedToArray(_$exec$1$split3, 2),
                    _val_x = _$exec$1$split4[0],
                    _val_y = _$exec$1$split4[1];

                var trans_y = legend_bbox.top + legend_bbox.height - dim_heght;
                legends_type[i].setAttribute("transform", ["translate(", [_val_x, +_val_y - trans_y], ")"].join(''));
            }
        }
    }
}

var get_max_nb_dec = function get_max_nb_dec(layer_name) {
    if (!current_layers[layer_name] || !current_layers[layer_name].colors_breaks) return;
    var max = 0;
    current_layers[layer_name].colors_breaks.forEach(function (el) {
        var tmp = el[0].split(' - ');
        var p1 = tmp[0].indexOf("."),
            p2 = tmp[1].indexOf(".");
        if (p1 > -1) if (tmp[0].length - 1 - p1 > max) max = tmp[0].length - 1 - tmp[0].indexOf('.');
        if (p2 > -1) if (tmp[1].length - 1 - p2 > max) max = tmp[1].length - 1 - tmp[1].indexOf('.');
    });
    return max;
};

function _get_max_nb_left_sep(values) {
    return max_fast(values.map(function (d) {
        return ('' + d).split('.')[0].length;
    }));
}

var get_max_nb_left_sep = function get_max_nb_left_sep(layer_name) {
    if (!current_layers[layer_name] || !current_layers[layer_name].colors_breaks) return;
    var nb_left = [];
    current_layers[layer_name].colors_breaks.forEach(function (el) {
        var tmp = el[0].split(' - ');
        var p1 = tmp[0].indexOf("."),
            p2 = tmp[1].indexOf(".");
        nb_left.push(p1);
        nb_left.push(p2);
    });
    return min_fast(nb_left);
};
"use strict";

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function get_map_template() {
    var map_config = new Object(),
        layers_style = [],
        layers = map.selectAll("g.layer"),
        map_title = document.getElementById('map_title'),
        layout_features = document.querySelectorAll('.legend:not(.title):not(.legend_feature)'),
        zoom_transform = d3.zoomTransform(svg_map);

    function get_legend_info(lgd_node) {
        var type_lgd = lgd_node.id,
            rect_fill_value = lgd_node.getAttribute("visible_rect") == "true" ? {
            color: lgd_node.querySelector("#under_rect").style.fill,
            opacity: lgd_node.querySelector("#under_rect").style.fillOpacity
        } : undefined,
            result = {
            type: type_lgd,
            display: lgd_node.getAttribute('display'),
            transform: lgd_node.getAttribute('transform'),
            field: lgd_node.getAttribute('layer_field'),
            rounding_precision: lgd_node.getAttribute('rounding_precision'),
            rect_fill_value: rect_fill_value,
            title: lgd_node.querySelector('#legendtitle').innerHTML,
            subtitle: lgd_node.querySelector('#legendsubtitle').innerHTML,
            bottom_note: lgd_node.querySelector('#legend_bottom_note').innerHTML
        };
        if (type_lgd == 'legend_root') {
            result['box_gap'] = lgd_node.getAttribute('box_gap');
            var no_data = lgd_node.querySelector('#no_data_txt');
            if (no_data) result['no_data_txt'] = no_data.innerHTML;
        } else if (type_lgd == 'legend_root_symbol') {
            result['nested_symbols'] = lgd_node.getAttribute('nested');
        }
        return result;
    }

    map_config.projection = current_proj_name;
    map_config.projection_scale = proj.scale();
    map_config.projection_translate = proj.translate();
    map_config.projection_center = proj.center();
    map_config.projection_rotation = proj.rotate();
    map_config.projection_parallels = proj.parallels != undefined ? proj.parallels() : undefined;
    map_config.zoom_translate = [zoom_transform.x, zoom_transform.y];
    map_config.zoom_scale = zoom_transform.k;
    map_config.div_width = +w;
    map_config.div_height = +h;
    map_config.n_layers = layers._groups[0].length;
    map_config.background_color = map.style("background-color");
    map_config.canvas_rotation = typeof canvas_rotation_value == "string" ? canvas_rotation_value.match(/\d+/) : undefined;

    if (map_title) {
        map_config.title = {
            "content": map_title.textContent,
            "x": map_title.getElementsByTagName('text')[0].getAttribute("x"),
            "y": map_title.getElementsByTagName('text')[0].getAttribute("y"),
            "style": map_title.getElementsByTagName('text')[0].getAttribute("style")
        };
    }

    // Save the provided dataset if it wasn't joined to the geo layer :
    if (joined_dataset.length > 0 && field_join_map.length == 0) {
        map_config.joined_dataset = joined_dataset[0];
        map_config.dataset_name = dataset_name;
    }

    map_config.layout_features = {};
    if (layout_features) {
        for (var i = 0; i < layout_features.length; i++) {
            var ft = layout_features[i];
            if (ft.id === "scale_bar") {
                map_config.layout_features.scale_bar = {
                    bar_size: scaleBar.bar_size,
                    displayed: scaleBar.displayed,
                    dist: scaleBar.dist,
                    dist_txt: scaleBar.dist_txt,
                    fixed_size: scaleBar.fixed_size,
                    precision: scaleBar.precision,
                    unit: scaleBar.unit,
                    x: scaleBar.x,
                    y: scaleBar.y,
                    transform: scaleBar.Scale._groups[0][0].getAttribute('transform') || ""
                };
            } else if (ft.id === "north_arrow") {
                var n_arr = northArrow.arrow_img._groups[0][0];
                map_config.layout_features.north_arrow = {
                    arrow_img: ft.getAttribute('href'),
                    displayed: northArrow.displayed,
                    x_img: n_arr.getAttribute('x'),
                    y_img: n_arr.getAttribute('y'),
                    x_center: northArrow.x_center,
                    y_center: northArrow.y_center,
                    size: n_arr.getAttribute('width')
                };
            } else if (ft.classList.contains('user_ellipse')) {
                if (!map_config.layout_features.user_ellipse) map_config.layout_features.user_ellipse = [];
                var ellps = ft.childNodes[0];
                map_config.layout_features.user_ellipse.push({
                    rx: ellps.getAttribute('rx'),
                    ry: ellps.getAttribute('ry'),
                    cx: ellps.getAttribute('cx'),
                    cy: ellps.getAttribute('cy'),
                    stroke: ellps.style.stroke,
                    stroke_width: ellps.style.strokeWidth,
                    id: ft.id
                });
            } else if (ft.classList.contains('arrow')) {
                if (!map_config.layout_features.arrow) map_config.layout_features.arrow = [];
                var line = ft.childNodes[0];
                map_config.layout_features.arrow.push({
                    lineWeight: line.style.strokeWidth,
                    stroke: line.style.stroke,
                    pt1: [line.x1.baseVal.value, line.y1.baseVal.value],
                    pt2: [line.x2.baseVal.value, line.y2.baseVal.value],
                    id: ft.id
                });
            } else if (ft.classList.contains('txt_annot')) {
                if (!map_config.layout_features.text_annot) map_config.layout_features.text_annot = [];
                var inner_p = ft.childNodes[0];
                map_config.layout_features.text_annot.push({
                    id: ft.id,
                    content: inner_p.innerHTML,
                    style: inner_p.getAttribute('style'),
                    position_x: ft.x.baseVal.value,
                    position_y: ft.y.baseVal.value,
                    transform: ft.getAttribute('transform')
                });
            } else if (ft.classList.contains('single_symbol')) {
                if (!map_config.layout_features.single_symbol) map_config.layout_features.single_symbol = [];
                var img = ft.childNodes[0];
                map_config.layout_features.single_symbol.push({
                    x: img.getAttribute('x'),
                    y: img.getAttribute('y'),
                    width: img.getAttribute('width'),
                    height: img.getAttribute('height'),
                    href: img.getAttribute('href'),
                    scalable: ft.classList.contains('scalable-legend')
                });
                // console.log(map_config.layout_features.single_symbol);
            }
        }
    }
    for (var _i = map_config.n_layers - 1; _i > -1; --_i) {
        layers_style[_i] = new Object();
        var layer_style_i = layers_style[_i],
            layer_id = layers._groups[0][_i].id,
            layer_name = _app.id_to_layer.get(layer_id),
            current_layer_prop = current_layers[layer_name],
            nb_ft = current_layer_prop.n_features,
            selection = void 0;

        layer_style_i.layer_name = layer_name;
        layer_style_i.n_features = nb_ft;
        layer_style_i.visible = layers._groups[0][_i].style.visibility;
        var lgd = document.getElementsByClassName('lgdf_' + layer_id);
        if (lgd.length == 0) {
            layer_style_i.legend = undefined;
        } else if (lgd.length == 1) {
            layer_style_i.legend = [get_legend_info(lgd[0])];
        } else if (lgd.length == 2) {
            layer_style_i.legend = lgd[0].id == "legend_root" ? [get_legend_info(lgd[0]), get_legend_info(lgd[1])] : [get_legend_info(lgd[1]), get_legend_info(lgd[0])];
        }

        if (current_layer_prop["stroke-width-const"]) layer_style_i["stroke-width-const"] = current_layer_prop["stroke-width-const"];

        if (current_layer_prop.pointRadius != undefined) layer_style_i.pointRadius = current_layer_prop.pointRadius;

        if (current_layer_prop.fixed_stroke != undefined) layer_style_i.fixed_stroke = current_layer_prop.fixed_stroke;

        if (current_layer_prop.colors_breaks) layer_style_i.colors_breaks = current_layer_prop.colors_breaks;

        if (current_layer_prop.options_disc !== undefined) layer_style_i.options_disc = current_layer_prop.options_disc;

        if (current_layer_prop.targeted) {
            selection = map.select("#" + layer_id).selectAll("path");
            layer_style_i.fill_opacity = selection.style("fill-opacity");
            layer_style_i.targeted = true;
            layer_style_i.topo_geom = JSON.stringify(_target_layer_file);
            layer_style_i.fill_color = current_layer_prop.fill_color;
            layer_style_i.fields_type = current_layer_prop.fields_type;
        } else if (layer_name == "Sphere" || layer_name == "Graticule" || layer_name == "World") {
            selection = map.select("#" + layer_name).selectAll("path");
            layer_style_i.fill_color = rgb2hex(selection.style("fill"));
            layer_style_i.stroke_color = rgb2hex(selection.style("stroke"));
            if (layer_name == "Graticule") {
                layer_style_i.stroke_dasharray = current_layers.Graticule.dasharray;
                layer_style_i.step = current_layers.Graticule.step;
            }
        } else if (!current_layer_prop.renderer) {
            selection = map.select("#" + layer_id).selectAll("path");
            layer_style_i.fill_opacity = selection.style("fill-opacity");
            layer_style_i.fill_color = current_layer_prop.fill_color;
            layer_style_i.topo_geom = String(current_layer_prop.key_name);
        } else if (current_layer_prop.renderer.indexOf("PropSymbols") > -1 && current_layer_prop.type != "Line") {
            var type_symbol = current_layer_prop.symbol;
            selection = map.select("#" + layer_id).selectAll(type_symbol);
            var features = Array.prototype.map.call(svg_map.querySelector("#" + layer_id).getElementsByTagName(type_symbol), function (d) {
                return d.__data__;
            });
            layer_style_i.symbol = type_symbol;
            layer_style_i.rendered_field = current_layer_prop.rendered_field;
            if (current_layer_prop.rendered_field2) layer_style_i.rendered_field2 = current_layer_prop.rendered_field2;
            layer_style_i.renderer = current_layer_prop.renderer;
            layer_style_i.size = current_layer_prop.size;
            layer_style_i.fill_color = current_layer_prop.fill_color;
            layer_style_i.ref_layer_name = current_layer_prop.ref_layer_name;
            layer_style_i.geo_pt = {
                type: "FeatureCollection",
                features: features
            };
            if (current_layer_prop.renderer === "PropSymbolsTypo") {
                layer_style_i.color_map = [].concat(_toConsumableArray(current_layer_prop.color_map));
            }
            if (current_layer_prop.break_val) layer_style_i.break_val = current_layer_prop.break_val;
        } else if (current_layer_prop.renderer.indexOf("PropSymbols") > -1 && current_layer_prop.type == "Line") {
            var _type_symbol = current_layer_prop.symbol;
            selection = map.select("#" + layer_id).selectAll('path');
            var _features = Array.prototype.map.call(svg_map.querySelector("#" + layer_id).getElementsByTagName('path'), function (d) {
                return d.__data__;
            });
            layer_style_i.symbol = _type_symbol;
            layer_style_i.rendered_field = current_layer_prop.rendered_field;
            if (current_layer_prop.rendered_field2) layer_style_i.rendered_field2 = current_layer_prop.rendered_field2;
            layer_style_i.renderer = current_layer_prop.renderer;
            layer_style_i.size = current_layer_prop.size;
            layer_style_i.fill_color = current_layer_prop.fill_color;
            layer_style_i.ref_layer_name = current_layer_prop.ref_layer_name;
            layer_style_i.geo_line = {
                type: "FeatureCollection",
                features: _features
            };
            if (current_layer_prop.renderer === "PropSymbolsTypo") {
                layer_style_i.color_map = [].concat(_toConsumableArray(current_layer_prop.color_map));
            }
            if (current_layer_prop.break_val) layer_style_i.break_val = current_layer_prop.break_val;
        } else if (current_layer_prop.renderer == "Stewart" || current_layer_prop.renderer == "Gridded" || current_layer_prop.renderer == "Choropleth" || current_layer_prop.renderer == "Categorical" || current_layer_prop.renderer == "Carto_doug" || current_layer_prop.renderer == "OlsonCarto") {
            (function () {
                selection = map.select("#" + layer_id).selectAll("path");
                layer_style_i.renderer = current_layer_prop.renderer;
                layer_style_i.topo_geom = String(current_layer_prop.key_name);
                layer_style_i.fill_color = current_layer_prop.fill_color;
                layer_style_i.rendered_field = current_layer_prop.rendered_field;
                layer_style_i.ref_layer_name = current_layer_prop.ref_layer_name;
                var color_by_id = [],
                    params = current_layer_prop.type == "Line" ? "stroke" : "fill";
                selection.each(function () {
                    color_by_id.push(rgb2hex(this.style[params]));
                });
                layer_style_i.color_by_id = color_by_id;
                if (current_layer_prop.renderer == "Stewart") {
                    layer_style_i.current_palette = current_layer_prop.current_palette;
                }
                if (current_layer_prop.renderer !== "Categorical") {
                    layer_style_i.options_disc = current_layer_prop.options_disc;
                } else {
                    layer_style_i.color_map = [].concat(_toConsumableArray(current_layer_prop.color_map));
                }
                if (current_layer_prop.renderer == "OlsonCarto") {
                    layer_style_i.scale_max = current_layer_prop.scale_max;
                    layer_style_i.scale_byFeature = current_layer_prop.scale_byFeature;
                }
            })();
        } else if (current_layer_prop.renderer == "Links" || current_layer_prop.renderer == "DiscLayer") {
            selection = map.select("#" + layer_id).selectAll("path");
            layer_style_i.renderer = current_layer_prop.renderer;
            layer_style_i.fill_color = current_layer_prop.fill_color;
            layer_style_i.topo_geom = String(current_layer_prop.key_name);
            layer_style_i.rendered_field = current_layer_prop.rendered_field;
            layer_style_i.ref_layer_name = current_layer_prop.ref_layer_name;
            layer_style_i.size = current_layer_prop.size;
            layer_style_i.min_display = current_layer_prop.min_display;
            layer_style_i.breaks = current_layer_prop.breaks;
            // layer_style_i.topo_geom = String(current_layer_prop.key_name);
            if (current_layer_prop.renderer == "Links") {
                layer_style_i.linksbyId = current_layer_prop.linksbyId.slice(0, nb_ft);
            }
        } else if (current_layer_prop.renderer == "TypoSymbols") {
            selection = map.select("#" + layer_id).selectAll("image");
            layer_style_i.renderer = current_layer_prop.renderer;
            layer_style_i.symbols_map = [].concat(_toConsumableArray(current_layer_prop.symbols_map));
            layer_style_i.rendered_field = current_layer_prop.rendered_field;
            layer_style_i.ref_layer_name = current_layer_prop.ref_layer_name;

            var state_to_save = [];
            var selec = selection._groups[0];
            for (var _i2 = 0; _i2 < selec.length; _i2++) {
                var _ft = selec[_i2];
                state_to_save.push({ display: _ft.style.display,
                    data: _ft.__data__,
                    pos: [_ft.getAttribute('x'), _ft.getAttribute('y')],
                    size: _ft.getAttribute('width')
                });
            }
            layer_style_i.current_state = state_to_save;
        } else if (current_layer_prop.renderer == "Label") {
            selection = map.select("#" + layer_id).selectAll("text");
            var _selec = document.getElementById(layer_id).getElementsByTagName('text');
            layer_style_i.renderer = current_layer_prop.renderer;
            layer_style_i.rendered_field = current_layer_prop.rendered_field;
            layer_style_i.default_font = current_layer_prop.default_font;
            layer_style_i.default_size = +current_layer_prop.default_size.slice(0, 2);
            layer_style_i.fill_color = current_layer_prop.fill_color;
            var _features2 = [],
                current_position = [];
            for (var j = _selec.length - 1; j > -1; j--) {
                var _s = _selec[j];
                _features2.push(_s.__data__);
                current_position.push([_s.getAttribute('y'), _s.getAttribute('y'), _s.style.display]);
            }
            layer_style_i.data_labels = _features2;
            layer_style_i.current_position = current_position;
        } else {
            selection = map.select("#" + layer_id).selectAll("path");
        }
        layer_style_i.stroke_opacity = selection.style("stroke-opacity");
        layer_style_i.fill_opacity = selection.style("fill-opacity");
    }

    return Q.all(layers_style.map(function (obj) {
        return obj.topo_geom && !obj.targeted ? xhrequest("GET", "/get_layer/" + obj.topo_geom, null, false) : null;
    })).then(function (result) {
        for (var _i3 = 0; _i3 < layers_style.length; _i3++) {
            if (result[_i3]) {
                layers_style[_i3].topo_geom = result[_i3];
            }
        }
        // console.log(JSON.stringify({"map_config": map_config, "layers": layers_style}))
        return JSON.stringify({ "map_config": map_config, "layers": layers_style });;
    });
}

// Function triggered when the user request a download of its map preferences
function save_map_template() {
    document.getElementById("overlay").style.display = "";
    get_map_template().then(function (json_params) {
        var url = "data:text/json;charset=utf-8," + encodeURIComponent(json_params);
        document.getElementById("overlay").style.display = "none";
        clickLinkFromDataUrl(url, 'magrit_project.json');
    });
}

function load_map_template() {
    var input_button = d3.select(document.createElement('input')).attr("type", "file").attr("name", "file").attr("accept", ".json")
    // .attr("enctype", "text/json")
    .on('change', function () {
        prepareReading(d3.event);
    });

    var prepareReading = function prepareReading(event) {
        var file = event.target.files[0],
            reader = new FileReader();
        reader.onloadend = function () {
            apply_user_preferences(reader.result);
        };
        reader.readAsText(file);
    };

    input_button.node().dispatchEvent(new MouseEvent("click"));
}

function display_error_loading_project(error) {
    error = error || "Unknown";
    swal({ title: i18next.t("app_page.common.error") + "!",
        text: i18next.t("app_page.common.error_map_project") + error,
        type: "error",
        allowOutsideClick: false });
}

function apply_user_preferences(json_pref) {
    var preferences = void 0;
    try {
        preferences = JSON.parse(json_pref);
    } catch (err) {
        display_error_loading_project(i18next.t("app_page.common.error_invalid_map_project") + err);
        return;
    }
    var map_config = preferences.map_config,
        layers = preferences.layers;
    if (!layers || !map_config) {
        display_error_loading_project(i18next.t("app_page.common.error_invalid_map_project"));
        return;
    }
    // Restore the state of the page (without open functionnality)
    if (window.fields_handler) {
        clean_menu_function();
    }
    // Clean the values remembered for the user from the previous rendering if any :
    reset_user_values();
    {
        var layer_names = Object.getOwnPropertyNames(current_layers);
        for (var i = 0, nb_layers = layer_names.length; i < nb_layers; i++) {
            remove_layer_cleanup(layer_names[i]);
        }
        var _l = void 0,
            _ll = void 0;
        // Make sure there is no layers and legend/layout features on the map :
        _l = svg_map.childNodes;_ll = _l.length;
        for (var _i4 = _ll - 1; _i4 > -1; _i4--) {
            _l[_i4].remove();
        }
        // And in the layer manager :
        _l = layer_list.node().childNodes;_ll = _l.length;
        for (var _i5 = _ll - 1; _i5 > -1; _i5--) {
            _l[_i5].remove();
        }
        // Get a new object for where we are storing the main properties :
        current_layers = new Object();
    }

    var a = document.getElementById("overlay");
    a.style.display = "";
    a.querySelector("button").style.display = "none";

    var g_timeout = void 0;
    var set_final_param = function set_final_param() {
        g_timeout = setTimeout(function () {
            var _zoom = svg_map.__zoom;
            _zoom.k = map_config.zoom_scale;
            _zoom.x = map_config.zoom_translate[0];
            _zoom.y = map_config.zoom_translate[1];
            zoom_without_redraw();
            s = map_config.projection_scale;
            t = map_config.projection_translate;
            proj.scale(s).translate(t).rotate(map_config.projection_rotation);
            path = d3.geoPath().projection(proj).pointRadius(4);
            map.selectAll(".layer").selectAll("path").attr("d", path);
            handleClipPath(current_proj_name);
            reproj_symbol_layer();
            if (layers.length > 1) {
                var desired_order = layers.map(function (i) {
                    return i.layer_name;
                });
                reorder_elem_list_layer(desired_order);
                desired_order.reverse();
                reorder_layers(desired_order);
            }
            apply_layout_lgd_elem();
            if (map_config.canvas_rotation) {
                document.getElementById("form_rotate").value = map_config.canvas_rotation;
                document.getElementById("canvas_rotation_value_txt").value = map_config.canvas_rotation;
                rotate_global(map_config.canvas_rotation);
            }
            var a = document.getElementById("overlay");
            a.style.display = "none";
            a.querySelector("button").style.display = "";
            var targeted_layer = Object.getOwnPropertyNames(user_data)[0];
            if (targeted_layer) getAvailablesFunctionnalities(targeted_layer);
        }, layers.length > 1 ? 125 : 250);
    };

    function apply_layout_lgd_elem() {
        if (map_config.title) {
            // Create the title object :
            handle_title(map_config.title.content);
            // Use its old properties :
            var title = document.getElementById("map_title").getElementsByTagName('text')[0];
            title.setAttribute('x', map_config.title.x);
            title.setAttribute('y', map_config.title.y);
            title.setAttribute('style', map_config.title.style);
            // Also fill the input field on the left menu :
            document.querySelector("input#title.list_elem_section4").value = map_config.title.content;
        }
        if (map_config.layout_features) {
            if (map_config.layout_features.scale_bar) {
                scaleBar.create();
                scaleBar.bar_size = map_config.layout_features.scale_bar.bar_size;
                scaleBar.displayed = map_config.layout_features.scale_bar.displayed;
                scaleBar.dist = map_config.layout_features.scale_bar.dist;
                scaleBar.dist_txt = map_config.layout_features.scale_bar.dist_txt;
                scaleBar.fixed_size = map_config.layout_features.scale_bar.fixed_size;
                scaleBar.precision = map_config.layout_features.scale_bar.precision;
                scaleBar.x = map_config.layout_features.scale_bar.x;
                scaleBar.y = map_config.layout_features.scale_bar.y;
                scaleBar.Scale._groups[0][0].setAttribute('transform', map_config.layout_features.scale_bar.transform);
                scaleBar.resize();
            }
            if (map_config.layout_features.north_arrow) {
                northArrow.display();
                northArrow.arrow_img._groups[0][0].setAttribute('x', map_config.layout_features.north_arrow.x_img);
                northArrow.arrow_img._groups[0][0].setAttribute('y', map_config.layout_features.north_arrow.y_img);
                northArrow.arrow_img._groups[0][0].setAttribute('width', map_config.layout_features.north_arrow.size);
                northArrow.arrow_img._groups[0][0].setAttribute('height', map_config.layout_features.north_arrow.size);
                northArrow.under_rect._groups[0][0].setAttribute('x', map_config.layout_features.north_arrow.x_img);
                northArrow.under_rect._groups[0][0].setAttribute('y', map_config.layout_features.north_arrow.y_img);
                northArrow.x_center = map_config.layout_features.north_arrow.x_center;
                northArrow.y_center = map_config.layout_features.north_arrow.y_center;
                northArrow.displayed = map_config.layout_features.north_arrow.displayed;
            }
            if (map_config.layout_features.arrow) {
                for (var _i6 = 0; _i6 < map_config.layout_features.arrow.length; _i6++) {
                    var ft = map_config.layout_features.arrow[_i6];
                    new UserArrow(ft.id, ft.pt1, ft.pt2, svg_map, true);
                }
            }
            if (map_config.layout_features.user_ellipse) {
                for (var _i7 = 0; _i7 < map_config.layout_features.user_ellipse.length; _i7++) {
                    var _ft2 = map_config.layout_features.user_ellipse[_i7];
                    var ellps = new UserEllipse(_ft2.id, [_ft2.cx, _ft2.cy], svg_map, true);
                    var ellps_node = ellps.ellipse.node().querySelector("ellipse");
                    ellps_node.setAttribute('rx', _ft2.rx);
                    ellps_node.setAttribute('ry', _ft2.ry);
                    ellps_node.style.stroke = _ft2.stroke;
                    ellps_node.style.strokeWidth = _ft2.stroke_width;
                }
            }
            if (map_config.layout_features.text_annot) {
                for (var _i8 = 0; _i8 < map_config.layout_features.text_annot.length; _i8++) {
                    var _ft3 = map_config.layout_features.text_annot[_i8];
                    var new_txt_box = new Textbox(svg_map, _ft3.id, [_ft3.position_x, _ft3.position_y]);
                    var inner_p = new_txt_box.text_annot.select("p").node();
                    inner_p.innerHTML = _ft3.content;
                    inner_p.style = _ft3.style;
                    new_txt_box.text_annot.attr('transform', _ft3.transform);
                    new_txt_box.fontsize = +_ft3.style.split('font-size: ')[1].split('px')[0];
                    new_txt_box.font_family = _ft3.style.split('font-family: ')[1].split(';')[0];
                }
            }
            if (map_config.layout_features.single_symbol) {
                for (var _i9 = 0; _i9 < map_config.layout_features.single_symbol.length; _i9++) {
                    var _ft4 = map_config.layout_features.single_symbol[_i9];
                    var symb = add_single_symbol(_ft4.href, _ft4.x, _ft4.y, _ft4.width, _ft4.height);
                    if (_ft4.scalable) {
                        var parent_symb = symb.node().parentElement;
                        parent_symb.classList.add('scalable-legend');
                        parent_symb.setAttribute('transform', ['translate(', map_config.zoom_translate[0], ',', map_config.zoom_translate[1], ') scale(', map_config.zoom_scale, ',', map_config.zoom_scale, ')'].join(''));
                    }
                }
            }
        }
    }

    var done = 0;
    var func_name_corresp = new Map([["Links", "flow"], ["Carto_doug", "cartogram"], ["OlsonCarto", "cartogram"], ["Stewart", "smooth"], ["Gridded", "grid"], ["DiscLayer", "discont"], ["Choropleth", "choro"], ["Categorical", "typo"]]);

    // Set the dimension of the map (width and height) :
    w = +map_config.div_width;
    h = +map_config.div_height;
    canvas_mod_size([w, h]);
    document.getElementById("input-width").value = w;
    document.getElementById("input-height").value = h;

    // Projection were slightly changed in a last version :
    map_config.projection = map_config.projection.replace(/ /g, '');

    // Set the variables/fields related to the projection :
    current_proj_name = map_config.projection;
    proj = d3[available_projections.get(current_proj_name).name]();
    if (map_config.projection_parallels) proj = proj.parallels(map_config.projection_parallels);
    if (map_config.projection_clipAngle) proj = proj.clipAngle(map_config.projection_clipAngle);
    s = map_config.projection_scale;
    t = map_config.projection_translate;
    proj.scale(s).translate(t).rotate(map_config.projection_rotation);
    document.getElementById('form_projection_center').value = map_config.projection_rotation[0];
    document.getElementById('proj_center_value_txt').value = map_config.projection_rotation[0];
    defs = map.append("defs");
    document.getElementById('form_projection').value = current_proj_name;
    path = d3.geoPath().projection(proj).pointRadius(4);
    map.selectAll(".layer").selectAll("path").attr("d", path);

    // Set the background color of the map :
    map.style("background-color", map_config.background_color);
    document.querySelector("input#bg_color").value = rgb2hex(map_config.background_color);

    // Reload the external (not-joined) dataset if there is one :
    if (map_config.joined_dataset) {
        field_join_map = [];
        joined_dataset = [map_config.joined_dataset.slice()];
        dataset_name = map_config.dataset_name;
        update_menu_dataset();
    }

    // Add each layer :

    var _loop = function _loop(_i10) {
        var _layer = layers[_i10],
            layer_name = _layer.layer_name,
            symbol = void 0;

        var fill_opacity = _layer.fill_opacity,
            stroke_opacity = _layer.stroke_opacity;

        // This is a layer for which a geometries have been stocked as TopoJSON :
        if (_layer.topo_geom) {
            var tmp = {
                skip_alert: true,
                choosed_name: layer_name,
                skip_rescale: true
            };
            if (_layer.targeted) {
                tmp['target_layer_on_add'] = true;
            } else if (_layer.renderer) {
                tmp['func_name'] = func_name_corresp.get(_layer.renderer);
                tmp['result_layer_on_add'] = true;
            }
            if (_layer.pointRadius != undefined) tmp['pointRadius'] = _layer.pointRadius;

            handle_reload_TopoJSON(_layer.topo_geom, tmp).then(function (n_layer_name) {
                layer_name = n_layer_name;
                var current_layer_prop = current_layers[layer_name];
                if (_layer.renderer) {
                    current_layer_prop.renderer = _layer.renderer;
                }
                if (_layer.targeted && _layer.fields_type) {
                    current_layer_prop.fields_type = _layer.fields_type;
                    document.getElementById('btn_type_fields').removeAttribute('disabled');
                }
                var layer_id = _app.layer_to_id.get(layer_name);
                var layer_selec = map.select("#" + layer_id);

                current_layer_prop.rendered_field = _layer.rendered_field;
                if (_layer['stroke-width-const']) {
                    current_layer_prop['stroke-width-const'] = _layer['stroke-width-const'];
                    layer_selec.style('stroke-width', _layer['stroke-width-const']);
                }
                if (_layer.fixed_stroke) current_layer_prop.fixed_stroke = _layer.fixed_stroke;
                if (_layer.ref_layer_name) current_layer_prop.ref_layer_name = _layer.ref_layer_name;
                if (_layer.size) current_layer_prop.size = _layer.size;
                if (_layer.colors_breaks) current_layer_prop.colors_breaks = _layer.colors_breaks;
                if (_layer.options_disc) current_layer_prop.options_disc = _layer.options_disc;
                if (_layer.fill_color) current_layer_prop.fill_color = _layer.fill_color;
                if (_layer.renderer) {
                    if (_layer.renderer == "Choropleth" || _layer.renderer == "Stewart" || _layer.renderer == "Gridded") {
                        layer_selec.selectAll("path").style(current_layer_prop.type != "Line" ? "fill" : "stroke", function (d, j) {
                            return _layer.color_by_id[j];
                        });
                    } else if (_layer.renderer == "Links") {
                        current_layer_prop.linksbyId = _layer.linksbyId;
                        current_layer_prop.min_display = _layer.min_display;
                        current_layer_prop.breaks = _layer.breaks;
                        layer_selec.selectAll("path").styles(function (d, j) {
                            return {
                                display: +d.properties.fij > _layer.min_display ? null : "none",
                                stroke: _layer.fill_color.single,
                                'stroke-width': current_layer_prop.linksbyId[j][2]
                            };
                        });
                    } else if (_layer.renderer == "DiscLayer") {
                        (function () {
                            current_layer_prop.min_display = _layer.min_display || 0;
                            current_layer_prop.breaks = _layer.breaks;
                            var lim = current_layer_prop.min_display != 0 ? current_layer_prop.min_display * current_layers[layer_name].n_features : -1;
                            layer_selec.selectAll("path").styles(function (d, j) {
                                return {
                                    fill: "none",
                                    stroke: _layer.fill_color.single,
                                    display: j <= lim ? null : 'none',
                                    'stroke-width': d.properties.prop_val
                                };
                            });
                        })();
                    } else if (_layer.renderer && _layer.renderer.startsWith("Categorical")) {
                        var rendering_params = {
                            colorByFeature: _layer.color_by_id,
                            color_map: new Map(_layer.color_map),
                            rendered_field: _layer.rendered_field,
                            renderer: "Categorical"
                        };
                        render_categorical(layer_name, rendering_params);
                    }
                    if (_layer.legend) {
                        rehandle_legend(layer_name, _layer.legend);
                    }
                }

                if (_layer.fill_color && _layer.fill_color.single && _layer.renderer != "DiscLayer") {
                    layer_selec.selectAll('path').style(current_layer_prop.type != "Line" ? "fill" : "stroke", _layer.fill_color.single);
                } else if (_layer.fill_color && _layer.fill_color.random) {
                    layer_selec.selectAll('path').style(current_layer_prop.type != "Line" ? "fill" : "stroke", function () {
                        return Colors.names[Colors.random()];
                    });
                }
                layer_selec.selectAll('path').styles({ 'fill-opacity': fill_opacity,
                    'stroke-opacity': stroke_opacity });
                if (_layer.visible == 'hidden') {
                    handle_active_layer(layer_name);
                }
                done += 1;
                if (done == map_config.n_layers) set_final_param();
            });
        } else if (layer_name == "World") {
            add_simplified_land_layer({ skip_rescale: true, 'fill': _layer.fill_color, 'stroke': _layer.stroke_color, 'fill_opacity': fill_opacity, 'stroke_opacity': stroke_opacity, stroke_width: _layer['stroke-width-const'] + "px", visible: _layer.visible != 'hidden' });
            done += 1;
            if (done == map_config.n_layers) set_final_param();
            // ... or this is a layer provided by the application :
        } else {
            if (layer_name == "Sphere" || layer_name == "Graticule") {
                var options = {
                    'stroke': _layer.stroke_color,
                    'fill_opacity': fill_opacity,
                    'stroke_opacity': stroke_opacity,
                    'stroke_width': _layer['stroke-width-const'] + 'px'
                };
                if (layer_name == "Graticule") {
                    options.fill = "none";
                    options.stroke_dasharray = _layer.stroke_dasharray;
                    options.step = _layer.step;
                } else {
                    options.fill = _layer.fill_color;
                }
                add_layout_feature(layer_name.toLowerCase(), options);
                // ... or this is a layer of proportionnals symbols :
            } else if (_layer.renderer && _layer.renderer.startsWith("PropSymbol")) {
                var geojson_layer = _layer.symbol == 'line' ? _layer.geo_line : _layer.geo_pt;
                var rendering_params = {
                    new_name: layer_name,
                    field: _layer.rendered_field,
                    ref_value: _layer.size[0],
                    ref_size: _layer.size[1],
                    symbol: _layer.symbol,
                    nb_features: geojson_layer.features.length,
                    ref_layer_name: _layer.ref_layer_name,
                    renderer: _layer.renderer
                };
                if (_layer.renderer == "PropSymbolsChoro" || _layer.renderer == "PropSymbolsTypo") rendering_params.fill_color = _layer.fill_color.class;else if (_layer.fill_color.random) rendering_params.fill_color = "#fff";else if (_layer.fill_color.single != undefined) rendering_params.fill_color = _layer.fill_color.single;else if (_layer.fill_color.two) {
                    rendering_params.fill_color = _layer.fill_color;
                    rendering_params.break_val = _layer.break_val;
                }

                if (_layer.symbol == 'line') make_prop_line(rendering_params, geojson_layer);else make_prop_symbols(rendering_params, geojson_layer);

                if (_layer.renderer == "PropSymbolsTypo") {
                    current_layers[layer_name].color_map = new Map(_layer.color_map);
                }
                if (_layer.options_disc) {
                    current_layers[layer_name].options_disc = _layer.options_disc;
                }
                if (_layer.rendered_field2) {
                    current_layers[layer_name].rendered_field2 = _layer.rendered_field2;
                }
                if (_layer.colors_breaks) {
                    current_layers[layer_name].colors_breaks = _layer.colors_breaks;
                }
                if (_layer.legend) {
                    rehandle_legend(layer_name, _layer.legend);
                }
                current_layers[layer_name]['stroke-width-const'] = _layer['stroke-width-const'];
                map.select('#' + _app.layer_to_id.get(layer_name)).selectAll(_layer.symbol).styles({ 'stroke-width': _layer['stroke-width-const'] + "px",
                    'fill-opacity': fill_opacity,
                    'stroke-opacity': stroke_opacity });
                if (_layer.fill_color.random) {
                    map.select('#' + _app.layer_to_id.get(layer_name)).selectAll(_layer.symbol).style('fill', function (_) {
                        return Colors.names[Colors.random()];
                    });
                }
                // ... or this is a layer of labels :
            } else if (_layer.renderer && _layer.renderer.startsWith("Label")) {
                var _rendering_params = {
                    uo_layer_name: layer_name,
                    label_field: _layer.rendered_field,
                    color: _layer.fill_color,
                    ref_font_size: _layer.default_size,
                    font: _layer.default_font
                };
                render_label(null, _rendering_params, { data: _layer.data_labels });
            } else if (_layer.renderer && _layer.renderer.startsWith("TypoSymbol")) {
                (function () {
                    var symbols_map = new Map(_layer.symbols_map);
                    var new_layer_data = {
                        type: "FeatureCollection",
                        features: _layer.current_state.map(function (d) {
                            return d.data;
                        })
                    };

                    var nb_features = new_layer_data.features.length;
                    var context_menu = new ContextMenu(),
                        getItems = function getItems(self_parent) {
                        return [{ "name": i18next.t("app_page.common.edit_style"), "action": function action() {
                                make_style_box_indiv_symbol(self_parent);
                            } }, { "name": i18next.t("app_page.common.delete"), "action": function action() {
                                self_parent.style.display = "none";
                            } }];
                    };
                    var layer_id = encodeId(layer_name);
                    _app.layer_to_id.set(layer_name, layer_id);
                    _app.id_to_layer.set(layer_id, layer_name);
                    // Add the features at there original positions :
                    map.append("g").attrs({ id: layer_id, class: "layer" }).selectAll("image").data(new_layer_data.features).enter().insert("image").attrs(function (d, j) {
                        var symb = symbols_map.get(d.properties.symbol_field),
                            prop = _layer.current_state[j],
                            coords = prop.pos;
                        return {
                            "x": coords[0] - symb[1] / 2,
                            "y": coords[1] - symb[1] / 2,
                            "width": prop.size,
                            "height": prop.size,
                            "xlink:href": symb[0]
                        };
                    }).style('display', function (d, j) {
                        return _layer.current_state[j].display;
                    }).on("mouseover", function () {
                        this.style.cursor = "pointer";
                    }).on("mouseout", function () {
                        this.style.cursor = "initial";
                    }).on("contextmenu dblclick", function () {
                        context_menu.showMenu(d3.event, document.querySelector("body"), getItems(this));
                    }).call(drag_elem_geo);

                    create_li_layer_elem(layer_name, nb_features, ["Point", "symbol"], "result");
                    current_layers[layer_name] = {
                        "n_features": nb_features,
                        "renderer": "TypoSymbols",
                        "symbols_map": symbols_map,
                        "rendered_field": _layer.rendered_field,
                        "is_result": true,
                        "symbol": "image",
                        "ref_layer_name": _layer.ref_layer_name
                    };
                    if (_layer.legend) {
                        rehandle_legend(layer_name, _layer.legend);
                    }
                })();
            } else {
                null;
            }
            // Was the layer visible when the project was saved :
            if (_layer.visible == 'hidden') {
                handle_active_layer(layer_name);
            }
            // This function is called on each layer added
            //   to delay the call to the function doing a final adjusting of the zoom factor / translate values / layers orders :
            done += 1;
            if (done == map_config.n_layers) set_final_param();
        }
    };

    for (var _i10 = map_config.n_layers - 1; _i10 > -1; --_i10) {
        _loop(_i10);
    }
}

function reorder_layers(desired_order) {
    var layers = svg_map.getElementsByClassName('layer'),
        parent = layers[0].parentNode,
        nb_layers = desired_order.length;
    desired_order = desired_order.map(function (el) {
        return _app.layer_to_id.get(el);
    });
    for (var i = 0; i < nb_layers; i++) {
        if (document.getElementById(desired_order[i])) parent.insertBefore(document.getElementById(desired_order[i]), parent.firstChild);
    }
    svg_map.insertBefore(defs.node(), svg_map.childNodes[0]);
}

function reorder_elem_list_layer(desired_order) {
    var parent = document.getElementsByClassName('layer_list')[0],
        layers = parent.childNodes,
        nb_layers = desired_order.length;
    for (var i = 0; i < nb_layers; i++) {
        var selec = "li." + _app.layer_to_id.get(desired_order[i]);
        if (parent.querySelector(selec)) parent.insertBefore(parent.querySelector(selec), parent.firstChild);
    }
}

function rehandle_legend(layer_name, properties) {
    for (var i = 0; i < properties.length; i++) {
        var prop = properties[i];
        if (prop.type == 'legend_root') {
            createLegend_choro(layer_name, prop.field, prop.title, prop.subtitle, prop.box_gap, prop.rect_fill_value, prop.rounding_precision, prop.no_data_txt, prop.bottom_note);
        } else if (prop.type == 'legend_root_symbol') {
            createLegend_symbol(layer_name, prop.field, prop.title, prop.subtitle, prop.nested_symbols, prop.rect_fill_value, prop.rounding_precision, prop.bottom_note);
        } else if (prop.type == 'legend_root_lines_class') {
            createLegend_discont_links(layer_name, prop.field, prop.title, prop.subtitle, prop.rect_fill_value, prop.rounding_precision, prop.bottom_note);
        } else if (prop.type == 'legend_root_lines_symbol') {
            createLegend_line_symbol(layer_name, prop.field, prop.title, prop.subtitle, prop.rect_fill_value, prop.rounding_precision, prop.bottom_note);
        }
        var lgd = svg_map.querySelector('#' + prop.type + '.lgdf_' + _app.layer_to_id.get(layer_name));
        lgd.setAttribute('transform', prop.transform);
        if (prop.display == "none") lgd.setAttribute('display', "none");
    }
}
"use strict";

var display_box_symbol_typo = function display_box_symbol_typo(layer, field, categories) {
    var fetch_symbol_categories = function fetch_symbol_categories() {
        var categ = document.getElementsByClassName("typo_class"),
            symbol_map = new Map();
        for (var i = 0; i < categ.length; i++) {
            var selec = categ[i].querySelector(".symbol_section"),
                new_name = categ[i].querySelector(".typo_name").value;
            if (selec.style.backgroundImage.length > 7) {
                var img = selec.style.backgroundImage.split("url(")[1].substring(1).slice(0, -2);
                var size = +categ[i].querySelector("#symbol_size").value;
                symbol_map.set(categ[i].__data__.name, [img, size, new_name, cats[i].nb_elem]);
            } else {
                symbol_map.set(categ[i].__data__.name, [null, 0, new_name, cats[i].nb_elem]);
            }
        }
        return symbol_map;
    };
    var nb_features = current_layers[layer].n_features,
        data_layer = user_data[layer],
        cats = [],
        res_symbols = window.default_symbols,
        default_d_url = 'url("data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJmbGFnIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjMycHgiIGhlaWdodD0iMzJweCIgdmlld0JveD0iMCAwIDU3OS45OTcgNTc5Ljk5NyIgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAwIDAgNTc5Ljk5NyA1NzkuOTk3IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPHBhdGggZmlsbD0icGFyYW0oZmlsbCkgIzAwMCIgZmlsbC1vcGFjaXR5PSJwYXJhbShmaWxsLW9wYWNpdHkpIiBzdHJva2U9InBhcmFtKG91dGxpbmUpICNGRkYiIHN0cm9rZS1vcGFjaXR5PSJwYXJhbShvdXRsaW5lLW9wYWNpdHkpIiBzdHJva2Utd2lkdGg9InBhcmFtKG91dGxpbmUtd2lkdGgpIDAiIGQ9Ik0yMzEuODQ2LDQ3Mi41NzJWMzEuODA2aC0yMi4xOHY0NDAuNTU3JiMxMDsmIzk7Yy0zNC4wMTYsMi42NDktNTkuNDE5LDE4Ljc2Ny01OS40MTksMzguODcxYzAsMjIuMDIxLDMwLjQ1NiwzOS4yNzEsNjkuMzM3LDM5LjI3MWMzOC44NzcsMCw2OS4zMzItMTcuMjUsNjkuMzMyLTM5LjI3MSYjMTA7JiM5O0MyODguOTE3LDQ5MS41OTUsMjY0LjY3NCw0NzUuNzY0LDIzMS44NDYsNDcyLjU3MnoiLz4KPHBvbHlnb24gZmlsbD0icGFyYW0oZmlsbCkgIzAwMCIgZmlsbC1vcGFjaXR5PSJwYXJhbShmaWxsLW9wYWNpdHkpIiBzdHJva2U9InBhcmFtKG91dGxpbmUpICNGRkYiIHN0cm9rZS1vcGFjaXR5PSJwYXJhbShvdXRsaW5lLW9wYWNpdHkpIiBzdHJva2Utd2lkdGg9InBhcmFtKG91dGxpbmUtd2lkdGgpIDAiIHBvaW50cz0iMjM1LjI0MywyOS40OTIgMjMzLjcyMywyMDcuNjI4IDQyOS43NDksMjEwLjMyOSAiLz4KPC9zdmc+")';

    if (!categories) {
        categories = new Map();
        for (var i = 0; i < nb_features; ++i) {
            var value = data_layer[i][field];
            var ret_val = categories.get(value);
            if (ret_val) categories.set(value, [ret_val[0] + 1, [i].concat(ret_val[1])]);else categories.set(value, [1, [i]]);
        }
        categories.forEach(function (v, k) {
            cats.push({ name: k, new_name: k, nb_elem: v[0], img: default_d_url });
        });
    } else {
        categories.forEach(function (v, k) {
            cats.push({ name: k, new_name: v[2], nb_elem: v[3], img: "url(" + v[0] + ")" });
        });
    }
    var nb_class = cats.length;

    var modal_box = make_dialog_container("symbol_box", i18next.t("app_page.symbol_typo_box.title", { layer: layer, nb_features: nb_features }), "dialog");
    var newbox = d3.select("#symbol_box").select(".modal-body").styles({ 'overflow-y': 'scroll', 'max-height': window.innerHeight - 145 + 'px' });

    newbox.append("h3").html("");
    newbox.append("p").html(i18next.t("app_page.symbol_typo_box.field_categ", { field: field, nb_class: nb_class, nb_features: nb_features }));
    newbox.append("ul").style("padding", "unset").attr("id", "typo_categories").selectAll("li").data(cats).enter().append("li").styles({ margin: "auto", "list-style": "none" }).attr("class", "typo_class").attr("id", function (d, i) {
        return ["line", i].join('_');
    });

    newbox.selectAll(".typo_class").append("span").attrs({ "class": "three_dots" }).style("cursor", "grab");

    newbox.selectAll(".typo_class").append("input").styles({ width: "100px", height: "auto", display: "inline-block", "vertical-align": "middle", "margin-right": "7.5px" }).attrs(function (d) {
        return { class: 'typo_name', value: d.new_name, id: d.name };
    });

    newbox.selectAll(".typo_class").insert("p").attrs({ class: 'symbol_section', 'title': i18next.t('app_page.symbol_typo_box.title_click') }).style("background-image", function (d) {
        return d.img;
    }).styles({ width: "32px", height: "32px", margin: "0px 1px 0px 1px",
        "border-radius": "10%", border: "1px dashed blue",
        display: "inline-block", "background-size": "32px 32px",
        'vertical-align': 'middle' }).on("click", function () {
        var _this = this;

        modal_box.hide();
        box_choice_symbol(res_symbols, ".dialog").then(function (confirmed) {
            modal_box.show();
            if (confirmed) {
                _this.style.backgroundImage = confirmed;
            }
        });
    });

    newbox.selectAll(".typo_class").insert("span").html(function (d) {
        return i18next.t("app_page.symbol_typo_box.count_feature", { nb_features: d.nb_elem });
    });

    newbox.selectAll(".typo_class").insert('input').attrs({ type: 'number', id: 'symbol_size', value: 50 }).styles({ width: '50px', display: 'inline-block' });

    newbox.selectAll(".typo_class").insert("span").style("display", "inline-block").html(" px");
    new Sortable(document.getElementById("typo_categories"));

    var deferred = Q.defer(),
        container = document.getElementById("symbol_box"),
        fn_cb = function fn_cb(evt) {
        helper_esc_key_twbs_cb(evt, _onclose);
    };

    var clean_up_box = function clean_up_box() {
        container.remove();
        overlay_under_modal.hide();
        document.removeEventListener('keydown', fn_cb);
    };

    var _onclose = function _onclose() {
        deferred.resolve(false);
        clean_up_box();
    };

    container.querySelector(".btn_ok").onclick = function () {
        var symbol_map = fetch_symbol_categories();
        deferred.resolve([nb_class, symbol_map]);
        clean_up_box();
    };
    container.querySelector(".btn_cancel").onclick = _onclose;
    container.querySelector("#xclose").onclick = _onclose;
    document.addEventListener('keydown', fn_cb);
    overlay_under_modal.display();
    return deferred.promise;
};

function box_choice_symbol(sample_symbols, parent_css_selector) {
    var modal_box = make_dialog_container("box_choice_symbol", i18next.t("app_page.box_choice_symbol.title"), "dialog");
    overlay_under_modal.display();
    var container = document.getElementById("box_choice_symbol");
    container.querySelector('.modal-dialog').classList.add('fitContent');
    var newbox = d3.select(container).select(".modal-body").style('width', '220px');

    newbox.append("p").html('<b>' + i18next.t("app_page.box_choice_symbol.select_symbol") + '</b>');

    var box_select = newbox.append("div").styles({ width: "190px", height: "100px", overflow: "auto", border: "1.5px solid #1d588b" }).attr("id", "symbols_select");

    box_select.selectAll("p").data(sample_symbols).enter().append("p").attrs(function (d) {
        return {
            "id": "p_" + d[0].replace(".svg", ""),
            "title": d[0]
        };
    }).html(function (d) {
        return d[1];
    }).styles({ width: "32px", height: "32px",
        margin: "auto", display: "inline-block" });

    box_select.selectAll("svg").attr("id", function () {
        return this.parentElement.id.slice(2);
    }).attrs({ height: "32px", width: "32px" }).on("click", function () {
        box_select.selectAll("svg").each(function () {
            this.parentElement.style.border = "";
            this.parentElement.style.padding = "0px";
        });
        this.parentElement.style.padding = "-1px";
        this.parentElement.style.border = "1px dashed red";
        var svg_dataUrl = ['url("data:image/svg+xml;base64,', btoa(new XMLSerializer().serializeToString(this)), '")'].join('');
        newbox.select("#current_symb").style("background-image", svg_dataUrl);
    });

    newbox.append("p").attr("display", "inline").html('<b>' + i18next.t("app_page.box_choice_symbol.upload_symbol") + '</b>');
    newbox.append("p").styles({ margin: 'auto', 'text-align': 'center' }).append("button").html(i18next.t("app_page.box_choice_symbol.browse")).on("click", function () {
        var input = document.createElement('input');
        input.setAttribute("type", "file");
        input.onchange = function (event) {
            var file = event.target.files[0];
            var file_name = file.name;
            var reader = new FileReader();
            reader.onloadend = function () {
                var result = reader.result;
                var dataUrl_res = ['url("', result, '")'].join('');
                newbox.select("#current_symb").style("background-image", dataUrl_res);
            };
            reader.readAsDataURL(file);
        };
        input.dispatchEvent(new MouseEvent("click"));
    });

    newbox.insert("p").style('text-align', 'center').html(i18next.t("app_page.box_choice_symbol.selected_symbol"));
    newbox.insert('div').style('text-align', 'center').append("p").attrs({ "class": "symbol_section", "id": "current_symb" }).styles({ width: "32px", height: "32px", display: "inline-block",
        "border-radius": "10%", "background-size": "32px 32px",
        "vertical-align": "middle", "margin": "auto", "background-image": "url('')"
    });

    var deferred = Q.defer();
    var fn_cb = function fn_cb(evt) {
        helper_esc_key_twbs_cb(evt, _onclose);
    };
    var clean_up_box = function clean_up_box() {
        container.remove();
        if (parent_css_selector) {
            reOpenParent(parent_css_selector);
        } else {
            overlay_under_modal.hide();
        }
        document.removeEventListener('keydown', fn_cb);
    };

    container.querySelector(".btn_ok").onclick = function () {
        var res_url = newbox.select("#current_symb").style("background-image");
        deferred.resolve(res_url);
        clean_up_box();
    };

    var _onclose = function _onclose() {
        deferred.resolve(false);
        clean_up_box();
    };
    container.querySelector(".btn_cancel").onclick = _onclose;
    container.querySelector("#xclose").onclick = _onclose;
    document.addEventListener('keydown', fn_cb);
    return deferred.promise;
}

function make_style_box_indiv_symbol(symbol_node) {
    var parent = symbol_node.parentElement;
    var type_obj = parent.classList.contains("layer") ? 'layer' : 'layout';
    var current_options = {
        size: symbol_node.getAttribute("width"),
        scalable: type_obj == 'layout' && parent.classList.contains('scalable-legend') ? true : false
    };
    var ref_coords = { x: +symbol_node.getAttribute("x") + +current_options.size.slice(0, -2) / 2,
        y: +symbol_node.getAttribute("y") + +current_options.size.slice(0, -2) / 2 };
    var new_params = {};
    var self = this;
    make_confirm_dialog2("styleTextAnnotation", i18next.t('app_page.single_symbol_edit_box.title')).then(function (confirmed) {
        if (!confirmed) {
            symbol_node.setAttribute("width", current_options.size);
            symbol_node.setAttribute("height", current_options.size);
            symbol_node.setAttribute("x", ref_coords.x - +current_options.size.slice(0, -2) / 2);
            symbol_node.setAttribute("y", ref_coords.y - +current_options.size.slice(0, -2) / 2);
            if (current_options.scalable) {
                var zoom_scale = svg_map.__zoom;
                parent.setAttribute('transform', ['translate(', zoom_scale.x, ',', ') scale(', zoom_scale.k, ',', zoom_scale.k, ')'].join(''));
            } else {
                parent.setAttribute('transform', undefined);
            }
        }
    });
    var box_content = d3.select(".styleTextAnnotation").select(".modal-body").insert("div");
    var a = box_content.append("p").attr('class', 'line_elem');
    a.append('span').html(i18next.t('app_page.single_symbol_edit_box.image_size'));
    a.append("input").style('float', 'right').attrs({ type: "number", id: "font_size", min: 0, max: 150, step: "any", value: +symbol_node.getAttribute("width").slice(0, -2) }).on("change", function () {
        var new_val = this.value + "px";
        symbol_node.setAttribute("width", new_val);
        symbol_node.setAttribute("height", new_val);
        symbol_node.setAttribute("x", ref_coords.x - +this.value / 2);
        symbol_node.setAttribute("y", ref_coords.y - +this.value / 2);
    });
    if (type_obj == 'layout') {
        var current_state = parent.classList.contains('scalable-legend');
        var b = box_content.append('p').attr('class', 'line_elem');
        b.append('label').attrs({ for: 'checkbox_symbol_zoom_scale', class: 'i18n', 'data-i18n': '[html]app_page.single_symbol_edit_box.scale_on_zoom' }).html(i18next.t('app_page.single_symbol_edit_box.scale_on_zoom'));
        b.append('input').style('float', 'right').attrs({ type: 'checkbox', id: 'checkbox_symbol_zoom_scale' }).on('change', function () {
            var zoom_scale = svg_map.__zoom;
            if (this.checked) {
                symbol_node.setAttribute('x', (symbol_node.x.baseVal.value - zoom_scale.x) / zoom_scale.k);
                symbol_node.setAttribute('y', (symbol_node.y.baseVal.value - zoom_scale.y) / zoom_scale.k);
                parent.setAttribute('transform', ['translate(', zoom_scale.x, ', ', zoom_scale.y, ') scale(', zoom_scale.k, ',', zoom_scale.k, ')'].join(''));
                parent.classList.add('scalable-legend');
            } else {
                symbol_node.setAttribute('x', (zoom_scale.x + symbol_node.x.baseVal.value) * zoom_scale.k);
                symbol_node.setAttribute('y', (zoom_scale.y + symbol_node.y.baseVal.value) * zoom_scale.k);
                parent.setAttribute('transform', undefined);
                parent.classList.remove('scalable-legend');
            }
        });
        document.getElementById("checkbox_symbol_zoom_scale").checked = current_options.scalable;
    }
};
"use strict";

var available_projections = new Map([["Armadillo", { 'name': 'geoArmadillo', 'scale': '400' }], ["AzimuthalEquidistant", { 'name': 'geoAzimuthalEquidistant', 'scale': '700' }], ["AzimuthalEqualArea", { 'name': 'geoAzimuthalEqualArea', 'scale': '700' }], ["Baker", { 'name': 'geoBaker', 'scale': '400' }], ["Boggs", { 'name': 'geoBoggs', 'scale': '400' }], ["InterruptedBoggs", { 'name': 'geoInterruptedBoggs', 'scale': '400' }], ["Bonne", { 'name': 'geoBonne', 'scale': '400' }], ["Bromley", { 'name': 'geoBromley', 'scale': '400' }], ["Collignon", { 'name': 'geoCollignon', 'scale': '400' }], ["ConicConformal", { 'name': 'geoConicConformal', 'scale': '400', 'parallels': [44, 49] }], ["ConicEqualArea", { 'name': 'geoConicEqualArea', 'scale': '400' }], ["ConicEquidistant", { 'name': 'geoConicEquidistant', 'scale': '400' }], ["CrasterParabolic", { 'name': 'geoCraster', 'scale': '400' }], ["EckertI", { 'name': 'geoEckert1', 'scale': '400' }], ["EckertII", { 'name': 'geoEckert2', 'scale': '400' }], ["EckertIII", { 'name': 'geoEckert3', 'scale': '525' }], ["EckertIV", { 'name': 'geoEckert4', 'scale': '525' }], ["EckertV", { 'name': 'geoEckert5', 'scale': '400' }], ["EckertVI", { 'name': 'geoEckert6', 'scale': '400' }], ["Eisenlohr", { 'name': 'geoEisenlohr', 'scale': '400' }], ["Gnomonic", { 'name': 'geoGnomonic', 'scale': '400' }], ["Gringorten", { 'name': 'geoGringorten', 'scale': '400' }], ["HEALPix", { 'name': 'geoHealpix', 'scale': '400' }], ["Homolosine", { 'name': 'geoHomolosine', 'scale': '400' }], ["InterruptedHomolosine", { 'name': 'geoInterruptedHomolosine', 'scale': '400' }], ["Loximuthal", { 'name': 'geoLoximuthal', 'scale': '400' }], ["Mercator", { 'name': 'geoMercator', 'scale': '375' }], ["NaturalEarth", { 'name': 'geoNaturalEarth', 'scale': '400' }], ["Orthographic", { 'name': 'geoOrthographic', 'scale': '475', 'clipAngle': 90 }], ["Peircequincuncial", { 'name': 'geoPeirceQuincuncial', 'scale': '400' }], ["Robinson", { 'name': 'geoRobinson', 'scale': '400' }], ["InterruptedSinuMollweide", { 'name': 'geoInterruptedSinuMollweide', 'scale': '400' }], ["Sinusoidal", { 'name': 'geoSinusoidal', 'scale': '400' }], ["InterruptedSinusoidal", { 'name': 'geoInterruptedSinusoidal', 'scale': '400' }], ["TransverseMercator", { 'name': 'geoTransverseMercator', 'scale': '400' }]]);

var createBoxCustomProjection = function createBoxCustomProjection() {
		var prev_rotate = proj.rotate(),
		    prev_parallels = void 0;
		var modal_box = make_dialog_container("box_projection_customization", i18next.t("app_page.section5.title"), "dialog");
		var container = document.getElementById("box_projection_customization"),
		    dialog = container.querySelector('.modal-dialog');

		var content = d3.select(container).select(".modal-body").attr('id', 'box_projection');

		dialog.style.width = undefined;
		dialog.style.maxWidth = '400px';
		dialog.style.minWidth = '250px';

		var lambda_section = content.append('p');
		lambda_section.append('span').style('float', 'left').html(i18next.t('app_page.section5.projection_center_lambda'));
		lambda_section.append('input').styles({ 'width': '60px', 'float': 'right' }).attrs({ type: 'number', value: prev_rotate[0], min: -180, max: 180, step: 0.50 }).on("input", function () {
				if (this.value > 180) this.value = 180;else if (this.value < -180) this.value = -180;
				handle_proj_center_button([this.value, null, null]);
				document.getElementById('form_projection_center').value = this.value;
				document.getElementById('proj_center_value_txt').value = this.value;
		});

		var phi_section = content.append('p').style('clear', 'both');
		phi_section.append('span').style('float', 'left').html(i18next.t('app_page.section5.projection_center_phi'));
		phi_section.append('input').styles({ 'width': '60px', 'float': 'right' }).attrs({ type: 'number', value: prev_rotate[1], min: -180, max: 180, step: 0.5 }).on("input", function () {
				if (this.value > 180) this.value = 180;else if (this.value < -180) this.value = -180;
				handle_proj_center_button([null, this.value, null]);
		});

		var gamma_section = content.append('p').style('clear', 'both');
		gamma_section.append('span').style('float', 'left').html(i18next.t('app_page.section5.projection_center_gamma'));
		gamma_section.append('input').styles({ 'width': '60px', 'float': 'right' }).attrs({ type: 'number', value: prev_rotate[2], min: -90, max: 90, step: 0.5 }).on("input", function () {
				if (this.value > 90) this.value = 90;else if (this.value < -90) this.value = -90;
				handle_proj_center_button([null, null, this.value]);
		});

		if (current_proj_name.indexOf('Conic') > -1) {
				prev_parallels = proj.parallels();
				var parallels_section = content.append('p').styles({ 'text-align': 'center', 'clear': 'both' });
				parallels_section.append('span').html(i18next.t('app_page.section5.parallels'));
				var inputs = parallels_section.append('p').styles({ 'text-align': 'center', 'margin': 'auto' });
				inputs.append('input').styles({ width: '60px', display: 'inline', 'margin-right': '2px' }).attrs({ type: 'number', value: prev_parallels[0], min: -90, max: 90, step: 0.5 }).on("input", function () {
						if (this.value > 90) this.value = 90;else if (this.value < -90) this.value = -90;
						handle_parallels_change([this.value, null]);
				});
				inputs.append('input').styles({ width: '60px', display: 'inline', 'margin-left': '2px' }).attrs({ type: 'number', value: prev_parallels[1], min: -90, max: 90, step: 0.5 }).on("input", function () {
						if (this.value > 90) this.value = 90;else if (this.value < -90) this.value = -90;
						handle_parallels_change([null, this.value]);
				});
		}

		var clean_up_box = function clean_up_box() {
				container.remove();
				overlay_under_modal.hide();
				document.removeEventListener('keydown', fn_cb);
		};
		var fn_cb = function fn_cb(evt) {
				helper_esc_key_twbs_cb(evt, _onclose_cancel);
		};
		var _onclose_cancel = function _onclose_cancel() {
				clean_up_box();
				handle_proj_center_button(prev_rotate);
				if (prev_parallels != undefined) {
						handle_parallels_change(prev_parallels);
				}
		};
		container.querySelector(".btn_cancel").onclick = _onclose_cancel;
		container.querySelector("#xclose").onclick = _onclose_cancel;
		container.querySelector(".btn_ok").onclick = clean_up_box;
		document.addEventListener('keydown', fn_cb);
		overlay_under_modal.display();
};

// Function to change (one of more of) the three rotations axis of a d3 projection
// and redraw all the path (+ move symbols layers) in respect to that
function handle_proj_center_button(param) {
		// Fetch the current rotation params :
		var current_rotation = proj.rotate();
		// Reuse it for the missing value passed in arguments :
		param = param.map(function (val, i) {
				return val ? val : current_rotation[i];
		});
		// Do the rotation :
		proj.rotate(param);
		// Redraw the path and move the symbols :
		map.selectAll(".layer").selectAll("path").attr("d", path);
		reproj_symbol_layer();
}

function handle_parallels_change(parallels) {
		var current_values = proj.parallels();
		parallels = parallels.map(function (val, i) {
				return val ? val : current_values[i];
		});
		proj.parallels(parallels);
		map.selectAll(".layer").selectAll("path").attr("d", path);
		reproj_symbol_layer();
}
"use strict";

/**
* Return a basic operator as a function, each one taking two numbers in arguments
*
* @param {String} operator
* @return {function}
*/

function get_fun_operator(operator) {
    var operators = new Map([["+", function (a, b) {
        return a + b;
    }], ["-", function (a, b) {
        return a - b;
    }], ["/", function (a, b) {
        if (b === 0) {
            return "";
        } else {
            return a / b;
        }
    }], ["*", function (a, b) {
        return a * b;
    }], ["^", function (a, b) {
        return Math.pow(a, b);
    }]]);
    return operators.get(operator);
}

/**
* Function to add a field to the targeted layer
*
* @param {Array} table - A reference to the "table" to work on
* @param {String} layer - The name of the layer
* @param {Object} parent - A reference to the parent box in order to redisplay the table according to the changes
*
*/
function add_field_table(table, layer_name, parent) {
    function check_name() {
        if (regexp_name.test(this.value) || this.value == "") chooses_handler.new_name = this.value;else {
            // Rollback to the last correct name  :
            this.value = chooses_handler.new_name;
            swal({ title: i18next.t("Error") + "!",
                text: i18next.t("Unauthorized character!"),
                type: "error",
                allowOutsideClick: false });
        }
    };

    function compute_and_add() {
        var options = chooses_handler,
            fi1 = options.field1,
            fi2 = options.field2,
            new_name_field = options.new_name,
            operation = options.operator,
            opt_val = options.opt_val;

        if (!regexp_name.test(new_name_field)) {
            swal({ title: "",
                text: i18next.t("app_page.explore_box.add_field_box.invalid_name"),
                type: "error",
                allowOutsideClick: false });
            return Promise.reject("Invalid name");
        }

        if (options.type_operation === "math_compute" && table.length > 3200) {
            var formToSend = new FormData();
            var var1 = [],
                var2 = fi2 == "user_const_value" ? +opt_val : [];
            for (var i = 0; i < table.length; i++) {
                var1.push(+table[i][fi1]);
            }
            if (fi2 != "user_const_value") {
                for (var _i = 0; _i < table.length; _i++) {
                    var2.push(+table[_i][fi2]);
                }
            }
            formToSend.append('var1', JSON.stringify(var1));
            formToSend.append('var2', JSON.stringify(var2));
            formToSend.append('operator', operation);
            return xhrequest("POST", "/helpers/calc", formToSend, false).then(function (data) {
                data = JSON.parse(data);
                for (var _i2 = 0; _i2 < table.length; _i2++) {
                    table[_i2][new_name_field] = data[_i2];
                }return true;
            });
        } else if (options.type_operation === "math_compute") {
            var math_func = get_fun_operator(operation);
            if (fi2 != "user_const_value") {
                for (var _i3 = 0; _i3 < table.length; _i3++) {
                    if (table[_i3][fi1] != null && table[_i3][fi1] != "" && table[_i3][fi2] != null && table[_i3][fi2] != "") {
                        table[_i3][new_name_field] = math_func(+table[_i3][fi1], +table[_i3][fi2]);
                    } else {
                        table[_i3][new_name_field] = "";
                    }
                }
            } else {
                opt_val = +opt_val;
                for (var _i4 = 0; _i4 < table.length; _i4++) {
                    if (table[_i4][fi1] != null && table[_i4][fi1] != "") {
                        table[_i4][new_name_field] = math_func(+table[_i4][fi1], opt_val);
                    } else {
                        table[_i4][new_name_field] = "";
                    }
                }
            }
            return Promise.resolve(true);
        } else {
            if (operation == "truncate") {
                opt_val = +opt_val;
                if (opt_val >= 0) {
                    for (var _i5 = 0; _i5 < table.length; _i5++) {
                        table[_i5][new_name_field] = table[_i5][fi1].substring(0, opt_val);
                    }
                } else {
                    for (var _i6 = 0; _i6 < table.length; _i6++) {
                        table[_i6][new_name_field] = table[_i6][fi1].substr(opt_val);
                    }
                }
            } else if (operation == "concatenate") {
                for (var _i7 = 0; _i7 < table.length; _i7++) {
                    table[_i7][new_name_field] = [table[_i7][fi1], table[_i7][fi2]].join(opt_val);
                }
            }
            return Promise.resolve(true);
        }
        return Promise.reject("Unknown error");
    };

    function refresh_type_content(type) {
        field1.node().remove();operator.node().remove();field2.node().remove();
        field1 = div1.append("select").on("change", function () {
            chooses_handler.field1 = this.value;
        });
        operator = div1.append("select").on("change", function () {
            chooses_handler.operator = this.value;
            refresh_subtype_content(chooses_handler.type_operation, this.value);
        });
        field2 = div1.append("select").on("change", function () {
            chooses_handler.field2 = this.value;
            if (this.value == "user_const_value") {
                val_opt.style("display", null);
            }
        });
        if (type == "math_compute") {
            math_operation.forEach(function (op) {
                operator.append("option").text(op).attr("value", op);
            });
            for (var k in fields_type) {
                if (fields_type[k] == "number") {
                    field1.append("option").text(k).attr("value", k);
                    field2.append("option").text(k).attr("value", k);
                }
            }
            field2.append("option").attr("value", "user_const_value").text(i18next.t("app_page.explore_box.add_field_box.constant_value"));
            val_opt.style("display", "none");
            txt_op.text("");
            chooses_handler.operator = math_operation[0];
        } else {
            string_operation.forEach(function (op) {
                operator.append("option").text(op[0]).attr("value", op[1]);
            });
            for (var _k in fields_type) {
                if (fields_type[_k] == "string") {
                    field1.append("option").text(_k).attr("value", _k);
                    field2.append("option").text(_k).attr("value", _k);
                }
            }
            val_opt.style("display", null);
            txt_op.html(i18next.t("app_page.explore_box.add_field_box.join_char"));
            chooses_handler.operator = string_operation[0];
        }
        chooses_handler.field1 = field1.node().value;
        chooses_handler.field2 = field2.node().value;
    };

    function refresh_subtype_content(type, subtype) {
        if (type != "string_field") {
            if (field2.node().value != "user_const_value") {
                val_opt.style("display", "none");
                txt_op.text("");
            }
        } else {
            if (subtype == "truncate") {
                txt_op.html(i18next.t("app_page.explore_box.add_field_box.keep_char"));
                field2.attr("disabled", true);
            } else {
                txt_op.html("app_page.explore_box.add_field_box.join_char");
                field2.attr("disabled", null);
            }
        }
    };

    var chooses_handler = {
        field1: undefined, field2: undefined,
        operator: undefined, type_operation: undefined,
        opt_val: undefined, new_name: 'NewFieldName'
    };

    make_confirm_dialog2("addFieldBox", i18next.t("app_page.explore_box.button_add_field"), { width: 430 < w ? 430 : undefined, height: 280 < h ? 280 : undefined }).then(function (valid) {
        reOpenParent("#browse_data_box");
        if (valid) {
            document.querySelector("body").style.cursor = "wait";
            compute_and_add(chooses_handler).then(function (resolved) {
                if (current_layers[layer_name].targeted) {
                    current_layers[layer_name].fields_type.push(type_col2(user_data[layer_name], chooses_handler.new_name)[0]);
                    if (window.fields_handler) {
                        fields_handler.unfill();
                        fields_handler.fill(layer_name);
                    }
                }
                if (parent) {
                    parent.modal_box.show();
                    parent.display_table(layer_name);
                }
            }, function (error) {
                if (error != "Invalid name") display_error_during_computation();
                console.log(error);
                document.querySelector("body").style.cursor = "";
            }).done(function () {
                document.querySelector("body").style.cursor = "";
            });
        }
    });

    var current_fields = Object.getOwnPropertyNames(table),
        fields_type = type_col(layer_name),
        regexp_name = new RegExp(/^[a-z0-9_]+$/i),
        // Only allow letters (lower & upper cases), number and underscore in the field name
    container = document.querySelector(".twbs > .addFieldBox"),
        box_content = d3.select(container).select(".modal-body").append("div"),
        div1 = box_content.append("div").attr("id", "field_div1"),
        div2 = box_content.append("div").attr("id", "field_div2");

    var new_name = div1.append("p").html(i18next.t("app_page.explore_box.add_field_box.new_name")).insert("input").attr('value', 'NewFieldName').on("keyup", check_name);
    var type_content = div1.append("p").html(i18next.t("app_page.explore_box.add_field_box.new_content")).insert("select").attr("id", "type_content_select").on("change", function () {
        chooses_handler.type_operation = this.value;
        refresh_type_content(this.value);
    });

    [[i18next.t("app_page.explore_box.add_field_box.between_numerical"), "math_compute"], [i18next.t("app_page.explore_box.add_field_box.between_string"), "string_field"]].forEach(function (d, i) {
        type_content.append("option").text(d[0]).attr("value", d[1]);
    });

    var field1 = div1.append("select").on("change", function () {
        chooses_handler.field1 = this.value;
    }),
        operator = div1.append("select").on("change", function () {
        chooses_handler.operator = this.value;
        refresh_subtype_content(chooses_handler.type_operation, this.value);
    }),
        field2 = div1.append("select").on("change", function () {
        chooses_handler.field2 = this.value;
    });

    var txt_op = div2.append("p").attr("id", "txt_opt").text(""),
        val_opt = div2.append("input").attr("id", "val_opt").style("display", "none").on("change", function () {
        chooses_handler.opt_val = this.value;
    });

    var math_operation = ["+", "-", "*", "/", "^"];

    var string_operation = [[i18next.t("app_page.explore_box.add_field_box.concatenate"), "concatenate"], [i18next.t("app_page.explore_box.add_field_box.truncate"), "truncate"]];
    {
        var a = type_content.node(),
            b = false;
        for (var fi in fields_type) {
            if (fields_type[fi] == "number") {
                b = true;
                break;
            }
        }
        a.value = b ? "math_compute" : "string_field";
        a.dispatchEvent(new Event('change'));
    }
    return;
}

function createTableDOM(data, options) {
    options = options || {};
    options.id = options.id || "myTable";
    var doc = document,
        nb_features = data.length,
        column_names = Object.getOwnPropertyNames(data[0]),
        nb_columns = column_names.length;
    var myTable = doc.createElement("table"),
        headers = doc.createElement("thead"),
        body = doc.createElement("tbody"),
        headers_row = doc.createElement("tr");
    for (var i = 0; i < nb_columns; i++) {
        var cell = doc.createElement("th");
        cell.innerHTML = column_names[i];
        headers_row.appendChild(cell);
    }
    headers.appendChild(headers_row);
    myTable.appendChild(headers);
    for (var _i8 = 0; _i8 < nb_features; _i8++) {
        var row = doc.createElement("tr");
        for (var j = 0; j < nb_columns; j++) {
            var _cell = doc.createElement("td");
            _cell.innerHTML = data[_i8][column_names[j]];
            row.appendChild(_cell);
        }
        body.appendChild(row);
    }
    myTable.appendChild(body);
    myTable.setAttribute("id", options.id);
    return myTable;
}

function make_table(layer_name) {
    var features = svg_map.querySelector("#" + _app.layer_to_id.get(layer_name)).childNodes,
        table = [];
    if (!features[0].__data__.properties || Object.getOwnPropertyNames(features[0].__data__.properties).length === 0) {
        for (var i = 0, nb_ft = features.length; i < nb_ft; i++) {
            table.push({ id: features[i].__data__.id || i });
        }
    } else {
        for (var _i9 = 0, _nb_ft = features.length; _i9 < _nb_ft; _i9++) {
            table.push(features[_i9].__data__.properties);
        }
    }
    return table;
}

var boxExplore2 = {
    display_table: function display_table(table_name) {
        var _this = this;

        document.querySelector("body").style.cursor = "";
        var the_table = this.tables.get(table_name);
        the_table = the_table ? the_table[1] : make_table(table_name);

        this.nb_features = the_table.length;
        this.columns_names = Object.getOwnPropertyNames(the_table[0]);
        this.columns_headers = [];
        for (var i = 0, col = this.columns_names, len = col.length; i < len; ++i) {
            this.columns_headers.push({ data: col[i], title: col[i] });
        }if (this.top_buttons.select("#add_field_button").node()) {
            this.top_buttons.select("#add_field_button").remove();
            document.getElementById("table_intro").remove();
            document.querySelector(".dataTable-wrapper").remove();
        }

        // TODO : allow to add_field on all the layer instead of just targeted / result layers :
        if (this.tables.get(table_name)) {
            this.top_buttons.insert("button").attrs({ id: "add_field_button", class: "button_st3" }).html(i18next.t("app_page.explore_box.button_add_field")).on('click', function () {
                _this.modal_box.hide();
                add_field_table(the_table, table_name, _this);
            });
        }
        var txt_intro = ["<b>", table_name, "</b><br>", this.nb_features, " ", i18next.t("app_page.common.feature", { count: this.nb_features }), " - ", this.columns_names.length, " ", i18next.t("app_page.common.field", { count: this.columns_names.length })].join('');
        this.box_table.append("p").attr('id', 'table_intro').html(txt_intro);
        this.box_table.node().appendChild(createTableDOM(the_table, { id: "myTable" }));

        var myTable = document.getElementById("myTable");
        this.datatable = new DataTable(myTable, {
            sortable: true,
            searchable: true,
            fixedHeight: true
        });
        // Adjust the size of the box (on opening and after adding a new field)
        // and/or display scrollbar if its overflowing the size of the window minus a little margin :
        setTimeout(function () {
            var box = document.getElementById("browse_data_box");
            // box.querySelector(".dataTable-pagination").style.width = "80%";
            var bbox = box.querySelector("#myTable").getBoundingClientRect(),
                new_width = bbox.width,
                new_height = bbox.height + box.querySelector(".dataTable-pagination").getBoundingClientRect().height;

            if (new_width > window.innerWidth * 0.85) {
                box.querySelector(".modal-content").style.overflow = "auto";
                box.querySelector(".modal-dialog").style.width = window.innerWidth * 0.9 + "px";
            } else if (new_width > 560) {
                box.querySelector(".modal-dialog").style.width = new_width + 80 + "px";
            }

            if (new_height > 350 || new_height > window.innerHeight * 0.80) {
                box.querySelector(".modal-body").style.height = new_height + 175 + "px";
                box.querySelector(".modal-body").style.overflow = "auto";
            }
            setSelected(document.querySelector(".dataTable-selector"), "10");
            // let datatable_info = box.querySelector(".dataTable-bottom");
            // box.querySelector(".modal-footer").insertBefore(datatable_info, box.querySelector(".btn_ok"));
        }, 225);
    },
    get_available_tables: function get_available_tables() {
        var target_layer = Object.getOwnPropertyNames(user_data),
            ext_dataset = dataset_name,
            result_layers = Object.getOwnPropertyNames(result_data),
            available = new Map();
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = target_layer[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var lyr_name = _step.value;

                available.set(lyr_name, [i18next.t("app_page.common.target_layer"), user_data[lyr_name]]);
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }

        if (ext_dataset) available.set(dataset_name, [i18next.t("app_page.common.ext_dataset"), joined_dataset[0]]);
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
            for (var _iterator2 = result_layers[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var _lyr_name = _step2.value;

                available.set(_lyr_name, [i18next.t("app_page.common.result_layer"), result_data[_lyr_name]]);
            }
        } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                    _iterator2.return();
                }
            } finally {
                if (_didIteratorError2) {
                    throw _iteratorError2;
                }
            }
        }

        return available;
    },
    create: function create(layer_name) {
        this.columns_headers = [];
        this.nb_features = undefined;
        this.columns_names = undefined;
        this.tables = this.get_available_tables();
        this.modal_box = make_dialog_container("browse_data_box", i18next.t("app_page.explore_box.title"), "discretiz_charts_dialog");
        var container = document.getElementById("browse_data_box");
        this.box_table = d3.select(container).select(".modal-body");
        this.top_buttons = this.box_table.append('p').styles({ "margin-left": "15px", "display": "inline", "font-size": "12px" });

        var fn_cb = function fn_cb(evt) {
            helper_esc_key_twbs_cb(evt, _onclose);
        },
            _onclose = function _onclose() {
            container.remove();
            overlay_under_modal.hide();
            document.removeEventListener('keydown', fn_cb);
        };
        container.querySelector(".btn_cancel").onclick = _onclose;
        container.querySelector("#xclose").onclick = _onclose;
        container.querySelector(".btn_ok").onclick = _onclose;
        document.addEventListener('keydown', fn_cb);
        overlay_under_modal.display();
        this.display_table(layer_name);
    }
};
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function createBoxTextImportWizard(file) {
    var modal_box = make_dialog_container("box_text_import_wizard", i18next.t("app_page.box_text_import.title"), "dialog");

    if (!file) {
        file = new File(['id;val1;val2\r\n"foo";2;3\r\n"bar";5;6\r\n'], "filename.csv");
    }

    var box_content = d3.select("#box_text_import_wizard").select(".modal-body");
    var a = new TextImportWizard(box_content.node(), file);
    var deferred = Q.defer(),
        container = document.getElementById("box_text_import_wizard"),
        dialog = container.querySelector('.modal-dialog');
    dialog.style.width = undefined;
    dialog.style.maxWidth = '620px';
    dialog.style.minWidth = '380px';

    var clean_up_box = function clean_up_box() {
        container.remove();
        overlay_under_modal.hide();
        document.removeEventListener('keydown', fn_cb);
    };
    var fn_cb = function fn_cb(evt) {
        helper_esc_key_twbs_cb(evt, _onclose);
    };
    var _onclose = function _onclose() {
        clean_up_box();
        deferred.resolve(false);
    };
    container.querySelector(".btn_cancel").onclick = _onclose;
    container.querySelector("#xclose").onclick = _onclose;
    container.querySelector(".btn_ok").onclick = function () {
        clean_up_box();
        deferred.resolve([a.parsed_data, a.valid]);
    };
    document.addEventListener('keydown', fn_cb);
    overlay_under_modal.display();

    return deferred.promise;
}

// let encoding = jschardet.detect(data);
// if(encoding.encoding != "utf-8"
//         || encoding.confidence){
//     console.log(encoding);
//    //  Todo : do something in order to get a correct encoding
// }

function firstGuessSeparator(line) {
    if (line.indexOf('\t') > -1) {
        return 'tab';
    } else if (line.indexOf(';') > -1) {
        return 'semi-collon';
    } else {
        return 'comma';
    }
}

var TextImportWizard = function () {
    function TextImportWizard(parent_element, file_txt) {
        _classCallCheck(this, TextImportWizard);

        if (!parent_element) parent_element = document.body;
        var self = this;
        self.delim_char = { "tab": "\t", "comma": ",", "semi-collon": ";", "space": " " };
        var handle_change_delimiter = function handle_change_delimiter() {
            var buttons = document.getElementsByName('txtwzrd_delim_char'),
                n_buttons = buttons.length,
                delim = void 0;
            for (var i = 0; i < n_buttons; i++) {
                if (buttons[i].checked) delim = self.delim_char[buttons[i].value];
            }
            if (delim) self.change_delimiter(delim);
        };
        var html_content = "<div>" + "<p style=\"font-weight: bold;\"><span>Import</span><span style=\"float: right;\" id=\"txtwzrd_filename\"></span></p>" + "<p><span>Encodage</span><select id=\"txtwzrd_encoding\" style=\"position: absolute; left: 200px;\"></select></p>" + "<p><span>A partir de la ligne</span><input style=\"position: absolute; left: 200px;width: 60px;\" type=\"number\" value=\"1\" min=\"1\" step=\"1\" id=\"txtwzrd_from_line\"/></p>" + "</div>" + "<div>" + "<p style=\"font-weight: bold;\"><span>Délimiteur</span></p>" +
        // "<p><input type=\"radio\" name=\"txtwzrd_radio_delim\" value=\"fixed\">Taille de colonne fixe</input><input type=\"radio\" name=\"txtwzrd_radio_delim\" value=\"char\">Caractère</input></p>" +
        "<p><input type=\"radio\" name=\"txtwzrd_delim_char\" value=\"tab\" style=\"margin-left: 10px;\">Tabulation</input>" + "<input type=\"radio\" name=\"txtwzrd_delim_char\" value=\"comma\" style=\"margin-left: 10px;\">Virgule</input>" + "<input type=\"radio\" name=\"txtwzrd_delim_char\" value=\"semi-collon\" style=\"margin-left: 10px;\">Point-virgule</input>" + "<input type=\"radio\" name=\"txtwzrd_delim_char\" value=\"space\" style=\"margin-left: 10px;\">Espace</input></p>" + "<p><span>Séparateur de texte</span><select id=\"txtwzrd_txt_sep\" style=\"position: absolute; left: 200px;\"><option value=\"&quot;\">&quot;</option><option value=\"'\">'</option></select></p>" + "<p><span>Séparateur des décimales</span><select id=\"txtwzrd_decimal_sep\" style=\"position: absolute; left: 200px;\"><option value=\".\">.</option><option value=\",\">,</option></select></p>" + "</div>" + "<p style=\"font-weight: bold;clear: both;\"><span>Table</span><span id=\"valid_message\" style=\"float: right; color: red; font-weight: bold;\"></span></p>" + "<div style=\"max-height: 160px; overflow-y: scroll; margin-top: 12px;\">" + "<table id=\"txtwzr_table\" style=\"font-size: 14px; margin: 0 5px 0 5px;\"><thead></thead><tbody></tbody>" + "</div>";

        var div_content = document.createElement('div');
        div_content.setAttribute('class', '.txtwzrd_box_content');
        div_content.style = "minWidth: 400px; maxWidth: 600px; minHeight: 400px; maxHeight: 600px";
        div_content.innerHTML = html_content;
        parent_element.appendChild(div_content);
        parent_element.querySelector('#txtwzrd_filename').innerHTML = file_txt.name;
        parent_element.querySelector('#txtwzrd_from_line').onchange = function () {
            var val = +this.value;
            if (isNaN(val) || val < 1 || (val | 0) != val) {
                this.value = self.from_line;
            } else {
                self.from_line = val;
                self.parse_data();
                self.update_table();
            }
        };
        parent_element.querySelector('#txtwzrd_txt_sep').onchange = function () {
            self.text_separator = this.value;
            self.parse_data();
            self.update_table();
        };
        Array.prototype.forEach.call(document.getElementsByName('txtwzrd_delim_char'), function (el) {
            el.onclick = handle_change_delimiter;
        });
        this.content = div_content;
        this.table = div_content.querySelector('table');
        this.file = file_txt;
        this.readed_text = null;
        this.encoding = document.characterSet;
        this.delimiter = undefined;
        this.from_line = 1;
        this.line_separator = undefined;
        this.text_separator = '"';
        this.parsed_data = undefined;
        this.valid = undefined;
        this.valid_message;
        self.add_encodage_to_selection([self.encoding]);
        self.read_file_to_text({ first_read: true, update: true });
        return this;
    }

    _createClass(TextImportWizard, [{
        key: "add_encodage_to_selection",
        value: function add_encodage_to_selection(encodage) {
            var select = this.content.querySelector('#txtwzrd_encoding');
            if (typeof encodage == "string") encodage = [encodage];
            for (var i = 0; i < encodage.length; i++) {
                var o = document.createElement('option');
                o.value = encodage[i];
                o.innerText = encodage[i];
                select.append(o);
            }
        }
    }, {
        key: "set_first_guess_delimiter",
        value: function set_first_guess_delimiter() {
            var self = this;
            var delim = firstGuessSeparator(self.readed_text.split(self.line_separator)[0]);
            self.delimiter = self.delim_char[delim];
            Array.prototype.forEach.call(document.getElementsByName('txtwzrd_delim_char'), function (el) {
                if (el.value == delim) {
                    el.checked = true;
                }
            });
        }
    }, {
        key: "set_line_separator",
        value: function set_line_separator() {
            this.line_separator = this.readed_text.indexOf('\r\n') > -1 ? '\r\n' : '\n';
        }
    }, {
        key: "read_file_to_text",
        value: function read_file_to_text() {
            var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            var self = this;
            var reader = new FileReader();
            reader.onloadend = function () {
                self.readed_text = reader.result;
                if (options.first_read == true) {
                    self.set_line_separator();
                    self.set_first_guess_delimiter();
                }
                if (options.update == true) {
                    self.parse_data();
                    self.update_table();
                }
            };
            reader.readAsText(self.file, self.encoding);
        }
    }, {
        key: "change_delimiter",
        value: function change_delimiter(new_delim) {
            var self = this;
            self.delimiter = new_delim;
            self.parse_data();
            self.update_table();
        }
    }, {
        key: "parse_data",
        value: function parse_data() {
            var strip_text_separator = function strip_text_separator(line) {
                var len = line.length;
                for (var i = 0; i < len; i++) {
                    var val = line[i];
                    if (val.startsWith(self.text_separator) && val.endsWith(self.text_separator)) {
                        line[i] = val.slice(1, -1);
                    }
                }
            };
            var self = this,
                lines = self.readed_text.split(self.line_separator),
                fields = lines[self.from_line - 1].split(self.delimiter),
                tmp_nb_fields = fields.length,
                nb_ft = void 0;

            strip_text_separator(fields);

            lines = lines.slice(self.from_line).filter(function (line) {
                return line != "";
            });
            nb_ft = lines.length;
            self.parsed_data = [];
            self.valid = true;
            for (var i = 0; i < nb_ft; i++) {
                var values = lines[i].split(self.delimiter);
                strip_text_separator(values);
                var ft = {};
                if (values.length != tmp_nb_fields) {
                    self.valid = false;
                    self.valid_message = "Nombre de colonne différent (en-tetes / valeurs)";
                }
                for (var j = 0; j < tmp_nb_fields; j++) {
                    ft[fields[j] || "Field" + j] = values[j];
                }
                self.parsed_data.push(ft);
            }
        }
    }, {
        key: "update_table",
        value: function update_table() {
            var self = this;
            var doc = document;

            self.table.parentElement.scrollTop = 0;
            self.table.innerHTML = "<thead></thead><tbody></tbody>";

            var field_names = Object.getOwnPropertyNames(self.parsed_data[0]);
            var headers = self.table.querySelector('thead');
            var tbody = self.table.querySelector('tbody');
            var length_table = self.parsed_data.length < 10 ? self.parsed_data.length : 10;
            var headers_row = doc.createElement('tr');

            for (var i = 0; i < field_names.length; i++) {
                var cell = doc.createElement("th");
                cell.innerHTML = field_names[i];
                headers_row.appendChild(cell);
            }
            headers.append(headers_row);

            for (var _i = 0; _i < length_table; _i++) {
                var row = doc.createElement("tr"),
                    values = self.parsed_data[_i],
                    fields = Object.getOwnPropertyNames(values);
                for (var j = 0; j < fields.length; j++) {
                    var _cell = doc.createElement("td");
                    _cell.innerHTML = values[fields[j]];
                    row.appendChild(_cell);
                }
                tbody.appendChild(row);
            }
            self.content.querySelector('#valid_message').innerHTML = self.valid === false ? self.valid_message : "";
        }
    }]);

    return TextImportWizard;
}();
"use strict";

var handleZoomRect = function handleZoomRect() {
    var b = map.select('.brush');
    if (b.node()) {
        b.remove();
    } else {
        makeZoomRect();
    }
};

var makeZoomRect = function makeZoomRect() {
    if (!proj.invert) return;
    function idled() {
        idleTimeout = null;
    };
    function brushended() {
        var s = d3.event.selection;
        if (!s) {
            if (!idleTimeout) return idleTimeout = setTimeout(idled, idleDelay);
        } else {
            var x_min = s[0][0],
                x_max = s[1][0];
            var y_min = s[1][1],
                y_max = s[0][1];
            var transform = d3.zoomTransform(svg_map),
                z_trans = [transform.x, transform.y],
                z_scale = transform.k;

            var pt1 = proj.invert([(x_min - z_trans[0]) / z_scale, (y_min - z_trans[1]) / z_scale]),
                pt2 = proj.invert([(x_max - z_trans[0]) / z_scale, (y_max - z_trans[1]) / z_scale]);
            var path_bounds = path.bounds({ "type": "MultiPoint", "coordinates": [pt1, pt2] });
            // Todo : use these two points to make zoom on them
            map.select(".brush").call(brush.move, null);

            var zoom_scale = .95 / Math.max((path_bounds[1][0] - path_bounds[0][0]) / w, (path_bounds[1][1] - path_bounds[0][1]) / h);
            var zoom_translate = [(w - zoom_scale * (path_bounds[1][0] + path_bounds[0][0])) / 2, (h - zoom_scale * (path_bounds[1][1] + path_bounds[0][1])) / 2];
            svg_map.__zoom.k = zoom_scale;
            svg_map.__zoom.x = zoom_translate[0];
            svg_map.__zoom.y = zoom_translate[1];
            zoom_without_redraw();
        }
    }

    var brush = d3.brush().on("end", brushended),
        idleTimeout,
        idleDelay = 350;
    map.append("g").attr("class", "brush").call(brush);
};

