#!/usr/bin/env python3.5
# -*- coding: utf-8 -*-
from ujson import loads as json_loads
from functools import partial
from osgeo.ogr import GetDriverByName, Feature as OgrFeature
from osgeo.osr import SpatialReference, CoordinateTransformation
from pyproj import transform as pyproj_transform, Proj as pyproj_Proj
from shapely.geometry import shape, mapping
from shapely.ops import transform
from shapely.affinity import scale
from io import StringIO
from pandas import read_csv as pd_read_csv
from geopandas import GeoDataFrame


def draw_links(ref_layer_geojson, csv_table, field_i, field_j, field_fij, join_field):
    gdf = GeoDataFrame(ref_layer_geojson)
    csv_table = pd_read_csv(StringIO(csv_table))


def olson_transform(geojson, scale_values):
    """
    Inplace scaling transformation of each polygon of the geojson provided
    according to the "scale values" also provided.

    Args:
        geojson, dict:
            The geojson of polygon to transform
            (it might be useful to have choosen an appropriate projection as we
            want to deal with the area)
        scale_values:
            The pre-computed scale values for olson transformation
            (1 = no transformation)
    Return:
        Nothing
    """
    if len(geojson["features"]) != len(scale_values):
        raise ValueError("Inconsistent number of features/values")
    for ix, feature in enumerate(geojson["features"]):
        geom = shape(feature["geometry"])
        val = scale_values[ix]
        feature["geometry"] = mapping(scale(geom, xfact=val, yfact=val))


def reproj_convert_layer(geojson_path, output_path,
                         file_format, output_crs, input_crs="epsg:4326"):
    layer_name = output_path.split('/')
    layer_name = layer_name[len(layer_name) - 1].split('.')[0]

    in_driver = GetDriverByName("GeoJSON")
    out_driver = GetDriverByName(file_format)

    inSpRef = SpatialReference()
    inSpRef.ImportFromEPSG(int(input_crs.split("epsg:")[1]))

    outSpRef = SpatialReference()
    ret_val = outSpRef.ImportFromProj4(output_crs)
    if not ret_val == 0:
        raise ValueError("Error when importing the output crs")

    coords_transform = CoordinateTransformation(inSpRef, outSpRef)

    f_in = in_driver.Open(geojson_path)
    input_layer = f_in.GetLayer()
    f_out = out_driver.CreateDataSource(output_path)
    output_layer = f_out.CreateLayer(layer_name, outSpRef)

    input_lyr_defn = input_layer.GetLayerDefn()
    for i in range(input_lyr_defn.GetFieldCount()):
        fieldDefn = input_lyr_defn.GetFieldDefn(i)
        output_layer.CreateField(fieldDefn)

    output_lyr_defn = output_layer.GetLayerDefn()

    for inFeature in input_layer:
        geom = inFeature.GetGeometryRef()
        geom.Transform(coords_transform)
        outFeature = OgrFeature(output_lyr_defn)
        outFeature.SetGeometry(geom)
        for i in range(output_lyr_defn.GetFieldCount()):
            outFeature.SetField(output_lyr_defn.GetFieldDefn(i).GetNameRef(),
                                inFeature.GetField(i))
        output_layer.CreateFeature(outFeature)
        outFeature.Destroy()
        inFeature.Destroy()
    f_in.Destroy()
    f_out.Destroy()

    if "Shapefile" in file_format:
        outSpRef.MorphToESRI()
        with open(output_path.replace(".shp", ".prj"), 'w') as file_proj:
            file_proj.write(outSpRef.ExportToWkt())
        with open(output_path.replace(".shp", ".cpg"), "w") as encoding_file:
            encoding_file.write("UTF-8")
    return 0


def reproj_layer(geojson, output_crs, input_crs="epsg:4326"):
    if isinstance(geojson, str):
        geojson = json_loads(geojson)

    reproj = partial(pyproj_transform,
                     pyproj_Proj(init=input_crs),
                     pyproj_Proj(output_crs))
    for feature in geojson["features"]:
        feature["geometry"] = mapping(transform(
            reproj, shape(feature["geometry"])))


def check_projection(proj4string):
    if "epsg:" in proj4string[:5]:
        proj4string = "".join(["+init=", proj4string])
    try:
        pyproj_Proj(proj4string)
        return proj4string
    except:
        return False
