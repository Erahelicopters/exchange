
    var errorCallBack = function (problems) {
        var msg = 'Something went wrong:';
        if (problems[0].status == 404 || problems[0].status == 502 || problems[0].status == 500) {
            msg = "<div class='alert alert-danger' style='margin-bottom:0'>" +
                "<span class='glyphicon glyphicon-exclamation-sign' style='padding-right: 6px;' aria-hidden='true'></span>" +
                "<span>" +
                "The mapping server did not respond properly. It is likely temporarily down, " +
                "but should be up soon. If this problem persists please let the administrators know." +
                "</span></div>";
        }
    };

    var createGeometryCollection = function (features) {

        for (var i = 0; i < features.length; i++) {
            var feature = features[i];

            var coords = [];
            var d_to_d = feature.get('DEPARTURE_TO_DESTINATION_GEOM');

            var lineString = new ol.geom.LineString(coords);
            var temparature = feature.get('T');

            if (d_to_d) {
                lineString = new ol.geom.LineString(feature.get('DEPARTURE_TO_DESTINATION_GEOM').coordinates);
                lineString.transform('EPSG:4326', 'EPSG:3857');
            }

            var rangeInNauticalMiles = feature.get('REMAININGFUELMILES');
            var rangeInMeters = rangeInNauticalMiles * ol.proj.METERS_PER_UNIT['m'] * 1852;

            var circle = new ol.geom.Circle(ol.proj.transform([feature.get('GPS_LON'), feature.get('GPS_LAT')], 'EPSG:4326', 'EPSG:3857'), rangeInMeters);

            var geomCollection = new ol.geom.GeometryCollection([
                new ol.geom.Point(ol.proj.transform([feature.get('GPS_LON'), feature.get('GPS_LAT')],
                    'EPSG:4326', 'EPSG:3857')),
                new ol.geom.Point(ol.proj.transform([feature.get('DEPARTURE_LON'), feature.get('DEPARTURE_LAT')],
                    'EPSG:4326', 'EPSG:3857')),
                new ol.geom.Point(ol.proj.transform([feature.get('DESTINATION_LON'), feature.get('DESTINATION_LAT')],
                    'EPSG:4326', 'EPSG:3857')),
                lineString, circle]);

            features[i].set('geometry', geomCollection);
        }

        return features;

    };

    var fuelStyleFunc = function (feature) {

        var color = 'rgba(255, 154, 0, 0.1)';

        switch (feature.get('STATUS')) {
            case 'AVAILABLE':
                color = 'rgba(0, 204, 102, 1)';
                break;
            case 'OFF-LINE':
                color = 'rgba(255, 0, 0, 1)';
                break;
            case 'RESTRICTED':
                color = 'rgba(255, 255, 51, 1)';
                break;
            case 'EMERGENCY ONLY':
                color = 'rgba(255, 255, 51, 1)';
                break;
            default:
                color = 'rgba(255, 154, 0, 1)';

        }

        var style = new ol.style.Style({
            image: new ol.style.RegularShape({
                fill: new ol.style.Fill({color: color}),
                stroke: new ol.style.Stroke({color: 'rgba(0, 0, 0, 0.7)', width: 1}),
                points: 3,
                radius: 5,
                rotation: Math.PI / 4,
                angle: 0
            })
        });


        return [style];
    };
    //ZZ-KMANDALI-10/26 code for styling and coloring the buoy data
    //Start
    var buoyStyleFunc = function (feature) {
        var color = 'rgba(255, 154, 0, 0.1)';
        switch (feature.get('FEATURECOLOR')) {
           case 'BLACK':
                color = 'rgba(0, 0, 0, 1)';
                break;
            case 'WHITE':
                color = 'rgba(255, 255, 255, 1)';
                break;
            case 'RED':
                color = 'rgba(255, 0, 0, 1)';
                break;
           case 'LIME':
                color = 'rgba(0, 255, 0, 1)';
                break;
            case 'BLUE':
                color = 'rgba(0, 0, 255, 1)';
                break;
            case 'YELLOW':
                color = 'rgba(255, 255, 0, 1)';
                break;
            case 'CYAN':
                color = 'rgba(0, 255, 255, 1)';
                break;
            case 'MAGENTA':
                color = 'rgba(255, 0, 255, 1)';
                break;
            case 'MAROON':
                color = 'rgba(128, 0, 0, 1)';
                break;
            case 'OLIVE':
                color = 'rgba(128, 128, 0, 1)';
                break;
            case 'LIME':
                color = 'rgba(0, 255, 0, 1)';
                break;
            case 'GREEN':
                color = 'rgba(0, 128, 0, 1)';
                break;
            case 'PURPLE':
                color = 'rgba(128, 0, 128, 1)';
                break;
           case 'GREY':
                color = 'rgba(128,128,128, 1)';
                break;
            case 'NAVY':
                   color = 'rgba(0, 0, 128, 1)';
                   break;

            default:
                color = 'rgba(255, 154, 0, 1)';

        }

        // var selectedval = 'T'
        if (feature.get('T')!==null){
           var style = new ol.style.Style({
                image: new ol.style.Circle({
                    fill: new ol.style.Fill({color: color}),
                    stroke: new ol.style.Stroke({color: '#000000', width: 1}),
                    points: 4,
                    radius: 12,
                    angle: Math.PI / 4
                }),

                  text: new ol.style.Text({
                      text: (feature.get('T')),
                      fill: new ol.style.Fill({color: 'white'}),
                      font: 'Bold' + ' ' + '14px' + ' ' + 'Century Gothic',
                      stroke: new ol.style.Stroke({color: '#000000', width: 1}),
                      offsetX: 0,
                      offsetY: 1
                  }),
                });


            return [style];
        };
      }
      //End

      //kris mandali - 11/21 - Code for defining a style to the layer based on the resolution
        var metarStyleFunc = function (feature,resolution) {
          var res = resolution;
          
            var color = 'rgba(255, 154, 0, 0.1)';
            if(res <= 2000)
            {
              if (feature.get('FEATURECOLOR')) {

                // && feature.get('FEATURECOLOR')!='BLUE' && feature.get('FEATURECOLOR')!='GRAY'
              switch (feature.get('FEATURECOLOR')) {
                 case 'BLACK':
                      color = 'rgba(0, 0, 0, 1)';
                      break;
                  case 'WHITE':
                      color = 'rgba(255, 255, 255, 1)';
                      break;
                  case 'RED':
                      color = 'rgba(255, 0, 0, 1)';
                      break;
                 case 'LIME':
                      color = 'rgba(0, 255, 0, 1)';
                      break;
                  case 'BLUE':
                      color = 'rgba(0, 0, 255, 1)';
                      break;
                  case 'YELLOW':
                      color = 'rgba(255, 255, 0, 1)';
                      break;
                  case 'CYAN':
                      color = 'rgba(0, 255, 255, 1)';
                      break;
                  case 'MAGENTA':
                      color = 'rgba(255, 0, 255, 1)';
                      break;
                  case 'MAROON':
                      color = 'rgba(128, 0, 0, 1)';
                      break;
                  case 'OLIVE':
                      color = 'rgba(128, 128, 0, 1)';
                      break;
                  case 'LIME':
                      color = 'rgba(0, 255, 0, 1)';
                      break;
                   case 'GREEN':
                      color = 'rgba(0, 128, 0, 1)';
                       break;
                  case 'PURPLE':
                      color = 'rgba(128, 0, 128, 1)';
                      break;
                  case 'GRAY':
                       color = 'rgba(128,128,128, 1)';
                       break;
                  case 'NAVY':
                         color = 'rgba(0, 0, 128, 1)';
                         break;

                  default:
                      color = 'rgba(255, 154, 0, 1)';
                      break;
              }

                 var style1 = new ol.style.Style({
                      image: new ol.style.Circle({
                          fill: new ol.style.Fill({color: color}),
                          stroke: new ol.style.Stroke({color: '#000000', width: 1}),
                          points: 10,
                          radius: 10,
                          angle: Math.PI / 4
                      }),

                        text: new ol.style.Text({
                          text: feature.get('TC'),
                          fill: new ol.style.Fill({color: 'white'}),
                          font: 'Bold' + ' ' + '14px' + ' ' + 'Century Gothic',
                          stroke: new ol.style.Stroke({color: '#000000', width: 1}),
                          offsetX: 0,
                          offsetY: 1
                    }),

                      });


                        // return [style1,style2];
                          //  if(Temp_F == true)
                          //  {
                             return [style1];
                            console.log(style1);
                          //  }
                          //  else
                          // {
                          //     return [style2];
                          //     console.log(style2);
                          //
                          //  }

              // };
            // }
            }
            }
            else {

              if (feature.get('FEATURECOLOR')!='GREEN' ) {

                // && feature.get('FEATURECOLOR')!='BLUE' && feature.get('FEATURECOLOR')!='GRAY'

              switch (feature.get('FEATURECOLOR')) {
                 case 'BLACK':
                      color = 'rgba(0, 0, 0, 1)';
                      break;
                  case 'WHITE':
                      color = 'rgba(255, 255, 255, 1)';
                      break;
                  case 'RED':
                      color = 'rgba(255, 0, 0, 1)';
                      break;
                 case 'LIME':
                      color = 'rgba(0, 255, 0, 1)';
                      break;
                  case 'BLUE':
                      color = 'rgba(0, 0, 255, 1)';
                      break;
                  case 'YELLOW':
                      color = 'rgba(255, 255, 0, 1)';
                      break;
                  case 'CYAN':
                      color = 'rgba(0, 255, 255, 1)';
                      break;
                  case 'MAGENTA':
                      color = 'rgba(255, 0, 255, 1)';
                      break;
                  case 'MAROON':
                      color = 'rgba(128, 0, 0, 1)';
                      break;
                  case 'OLIVE':
                      color = 'rgba(128, 128, 0, 1)';
                      break;
                  case 'LIME':
                      color = 'rgba(0, 255, 0, 1)';
                      break;
                   case 'GREEN':
                      color = 'rgba(0, 128, 0, 1)';
                       break;
                  case 'PURPLE':
                      color = 'rgba(128, 0, 128, 1)';
                      break;
                  case 'GRAY':
                       color = 'rgba(128,128,128, 1)';
                       break;
                  case 'NAVY':
                         color = 'rgba(0, 0, 128, 1)';
                         break;

                  default:
                      color = 'rgba(255, 154, 0, 1)';
                      break;
              }

                 var style1 = new ol.style.Style({
                      image: new ol.style.Circle({
                          fill: new ol.style.Fill({color: color}),
                          stroke: new ol.style.Stroke({color: '#000000', width: 1}),
                          points: 10,
                          radius: 4,
                          angle: Math.PI / 4
                      }),
                      });

                      var style2 = new ol.style.Style({
                           image: new ol.style.Circle({
                               fill: new ol.style.Fill({color: color}),
                               stroke: new ol.style.Stroke({color: '#000000', width: 1}),
                               points: 4,
                               radius: 10,
                               angle: Math.PI / 4
                           }),

                             text: new ol.style.Text({
                               text: feature.get('TF'),
                               fill: new ol.style.Fill({color: 'white'}),
                               font: 'Bold' + ' ' + '14px' + ' ' + 'Century Gothic',
                               stroke: new ol.style.Stroke({color: '#000000', width: 1}),
                               offsetX: 0,
                               offsetY: 5
                         }),

                           });

                        // return [style1,style2];
                          //  if(Temp_F == true)
                          //  {
                             return [style1];

            }

        }
      }
    var styleFunc = function (feature) {

        if (feature.getGeometry().getType() == 'GeometryCollection') {
            var geometries = feature.getGeometry().getGeometries();
            var departureStyle = new ol.style.Style({
                geometry: geometries[1],
                image: new ol.style.RegularShape({
                    stroke: new ol.style.Stroke({
                        color: 'black',
                        width: 1
                    }),
                    fill: new ol.style.Fill({color: '#7E3F0C'}),
                    points: 3,
                    radius: 5,
                    rotation: Math.PI / 4,
                    angle: 0
                })
            });
            var lineStyle = new ol.style.Style({
                geometry: geometries[3],
                stroke: new ol.style.Stroke({
                    color: '#FF00FF',
                    width: 2
                })
            });

            var circleStyle = new ol.style.Style({
                geometry: geometries[4],
                stroke: new ol.style.Stroke({
                    color: '#ffa000',
                    width: 2
                }),
                fill: new ol.style.Fill({color: [255, 160, 0, 0.3]})
            });


            var destinationStyle = new ol.style.Style({
                geometry: geometries[2],
                image: new ol.style.RegularShape({
                    stroke: new ol.style.Stroke({
                        color: 'black',
                        width: 1
                    }),
                    fill: new ol.style.Fill({color: '#0F7F12'}),
                    points: 4,
                    radius: 5,
                    rotation: Math.PI / 4,
                    angle: 0
                })
            });

            var colors = ['Green'];
            if (feature.get('APPROACH') === 1) {
                colors = ['Red'];
            }
            feature.set('color', colors[0]);

            var canvas = feature.get('color') ? document.getElementById('canvas' + feature.get('color')) : document.getElementById('canvas');

            var airCraftStyle = new ol.style.Style({
                geometry: geometries[0],
                image: new ol.style.Icon({
                    rotation: 0.01745329251 * parseInt(feature.get('HEADING'), 10),
                    img: canvas,
                    imgSize: [
                        30.5,
                        32
                    ]
                }),
                text: new ol.style.Text({
                    text: feature.get('TITLE'),
                    fill: new ol.style.Fill({color: 'black'}),
                    font: 'Normal' + ' ' + '10px' + ' ' + 'Arial',
                    stroke: new ol.style.Stroke({color: '#ffffff', width: 3}),
                    offsetX: -20,
                    offsetY: 20
                })
            });

            return [
                airCraftStyle,
                departureStyle,
                destinationStyle,
                lineStyle/*,
                 circleStyle*/
            ];

        } else {
            return styles['circle'];
        }
    };

    var styleCache = {};
    var clusterStyle = function (feature, resolution) {
        var size = feature.get('features').length;
        var style = styleCache[size];
        if (!style) {
            if (size === 1) {
                style = [new ol.style.Style({
                    image: new ol.style.RegularShape({
                        fill: new ol.style.Fill({color: 'rgba(255, 2, 2, 0.1)'}),
                        stroke: new ol.style.Stroke({color: 'rgba(255, 2, 2, 1)', width: 2}),
                        points: 4,
                        radius: 5,
                        radius2: 0,
                        angle: 0
                    })
                })];
            }
            else {
                style = [new ol.style.Style({
                    image: new ol.style.RegularShape({
                        radius: 10,
                        points: 4,
                        fill: new ol.style.Fill({color: 'rgba(255, 2, 2, 0.5)'}),
                        stroke: new ol.style.Stroke({color: 'rgba(255, 2, 2, 1)'})
                    }),
                    text: new ol.style.Text({
                        text: size.toString(),
                        fill: new ol.style.Fill({
                            color: '#fff'
                        })
                    })
                })];
            }

            styleCache[size] = style;
        }
        return style;
    };

    var styleCache2 = {};
    var clusterStyle2 = function (feature, resolution) {
        var size = feature.get('features').length;
        var style = styleCache2[size];
        if (!style) {
            if (size === 1) {
                style = [new ol.style.Style({
                    image: new ol.style.Circle({
                        fill: new ol.style.Fill({color: 'rgba(0, 0, 0, 0.1)'}),
                        stroke: new ol.style.Stroke({color: 'rgba(0, 0, 0, 1)', width: 1}),
                        points: 4,
                        radius: 5,
                        angle: Math.PI / 4
                    })
                })];
            }
            else {
                style = [new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: 8,
                        points: 4,
                        fill: new ol.style.Fill({color: 'rgba(0, 0, 0, 0.5)'}),
                        stroke: new ol.style.Stroke({color: 'rgba(0, 0, 0, 1)'})
                    }),
                    text: new ol.style.Text({
                        text: size.toString(),
                        fill: new ol.style.Fill({
                            color: '#fff'
                        })
                    })
                })];
            }
            styleCache2[size] = style;
        }
        return style;
    };

    var checkStyleFunc = function (feature) {

        var image_src = '/static/img/aircraft-check-small.png';

        if (feature.get('SPEED') && feature.get('SPEED') > 0) {
            image_src = '/static/img/aircraft-air-small.png';
        }

        var style = new ol.style.Style({
            image: new ol.style.Icon({
                geometry: feature.getGeometry(),
                rotation: 0.01745329251 * parseInt(feature.get('HEADING'), 10),
                src: image_src,
                size: [
                    30.5,
                    32
                ],
                color:  new ol.color.asArray('#00FFFF'),
                scale: 0.25
            }),
            text: new ol.style.Text({
                text: feature.get('TITLE'),
                fill: new ol.style.Fill({color: 'black'}),
                font: 'Normal' + ' ' + '10px' + ' ' + 'Arial',
                stroke: new ol.style.Stroke({color: '#ffffff', width: 3}),
                offsetX: -20,
                offsetY: 20
            })
        })

        return [style];
    };

    var styles = {
        'circle': new ol.style.Style({
            image: new ol.style.Circle({
                fill: new ol.style.Fill({color: 'rgba(0, 0, 0, 0.1)'}),
                stroke: new ol.style.Stroke({color: 'rgba(0, 0, 0, 1)', width: 1}),
                points: 4,
                radius: 5,
                angle: Math.PI / 4
            })
        }),
        'square': new ol.style.Style({
            image: new ol.style.RegularShape({
                fill: new ol.style.Fill({color: 'rgba(0, 153, 225, 0.1)'}),
                stroke: new ol.style.Stroke({color: 'rgba(0, 153, 255, 1)', width: 1}),
                points: 4,
                radius: 5,
                angle: Math.PI / 4
            })
        }),
        'triangle': new ol.style.Style({
            image: new ol.style.RegularShape({
                fill: new ol.style.Fill({color: 'rgba(255, 154, 0, 0.1)'}),
                stroke: new ol.style.Stroke({color: 'rgba(255, 154, 0, 1)', width: 1}),
                points: 3,
                radius: 5,
                rotation: Math.PI / 4,
                angle: 0
            })
        }),
        'star': new ol.style.Style({
            image: new ol.style.RegularShape({
                fill: new ol.style.Fill({color: 'rgba(255, 0, 0, 0.1)'}),
                stroke: new ol.style.Stroke({color: 'red', width: 1}),
                points: 5,
                radius: 5,
                radius2: 4,
                angle: 0
            })
        }),
        'cross': new ol.style.Style({
            image: new ol.style.RegularShape({
                fill: new ol.style.Fill({color: 'rgba(255, 2, 2, 0.1)'}),
                stroke: new ol.style.Stroke({color: 'rgba(255, 2, 2, 1)', width: 2}),
                points: 4,
                radius: 5,
                radius2: 0,
                angle: 0
            })
        }),
        'x': new ol.style.Style({
            image: new ol.style.RegularShape({
                fill: new ol.style.Fill({color: 'rgba(255, 0, 0, 0.1)'}),
                stroke: new ol.style.Stroke({color: 'red', width: 1}),
                points: 4,
                radius: 5,
                radius2: 0,
                angle: Math.PI / 4
            })
        })
    };
