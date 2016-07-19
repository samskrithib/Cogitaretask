var app = angular.module("myApp", ['ngRoute'])
    .config(['$routeProvider', function($routeProvider){
        $routeProvider
        .when('/constSpeed', {

            templateUrl: 'constSpeed.html',

            controller: 'mainCtrl'

        })
            .when('/variedSpeed', {

                templateUrl: 'variedSpeed.html',

                controller: 'vSpeedCtrl'

            })
            .otherwise({redirectTo: '/constSpeed'});

    }])


    .controller("mainCtrl", ['$scope', function ($scope) {
        $scope.title = "Train Simulation Exercise";
        $scope.dot= "Yellow dot represents train travelling from Harrow to Elephant & Castle";
        $scope.dot1 = "Purple dot represents train travelling from Elephant & Castle to Harrow";

        //test comment - pranav


        queue()
            .defer(d3.xml, "Bakerloo_Line.svg", "image/svg+xml")
            .await(ready);

        function ready(error, xml) {

            //Adding our svg file to HTML document
            var importedNode = document.importNode(xml.documentElement, true);
            d3.select("#pathAnimation").node().appendChild(importedNode);

            var svg = d3.select("svg");

            // Store all Stations and Distance between Stations in arrays.

            for(var k = 10; k<=56; k = k+2) {
                SVGPATHS = svg.select("path#path"+ k);
                var pathlength = SVGPATHS.node().getTotalLength();
                //console.log(SVGPATHS.node());
                SVGPATHNODES.push(SVGPATHS.node());
                ARRAY_LENGTHS.push(pathlength);

                //Get path start point for placing marker
                var d = SVGPATHS.attr("d"),
                    dsplitted = d.split(" ");
                var n = dsplitted[1].split(",");
                ARRAY_PATHSTARTPOINTS.push(n);
            }


            // Store time taken to travel from one station to next in an array ( Harrow to Elephant & Castle )

            for (var i = 0; i < 24; i++){
                ARRAY_ADDED_DURATION[0] = 0;
                var time = (ARRAY_LENGTHS[i]/SPEED)*1000;

                ARRAY_DURATIONS.push(time);
                ARRAY_FIXEDTIME.push(TIME);
                ARRAY_ADDED_DURATION[i+1] = ARRAY_ADDED_DURATION[i] + ARRAY_DURATIONS[i] + ARRAY_FIXEDTIME[i];

               // console.log("ARRAY_DURATIONS: "+ ARRAY_DURATIONS[i] + "  duration : "+ ARRAY_ADDED_DURATION[i]);
                //console.log("ARRAY_FIXEDTIME[" + i + "]: " + ARRAY_FIXEDTIME[i] )

            }

            // Store time taken to travel from one station to next in an array ( Elephant & Castle to Harrow )

            for(var i = 24; i>=0; i--){
                ARRAY_ETOH_ADDED_DURATION[0] = 0;
                ARRAY_ETOH_ADDED_DURATION.push(ARRAY_ETOH_ADDED_DURATION[24-i] + ARRAY_DURATIONS[i-1]+ ARRAY_FIXEDTIME[i-1])
                //console.log("i : " + [24-i] + "array: " + ARRAY_ETOH_ADDED_DURATION[24-i]);
            }

            // Train Travel from Harrow to Elephant & Castle

            var HTOE = function () {

                var marker = svg.append("circle");
                marker.attr("r", 8);
                var k = 0;

                do {
                    setTimeout(function (x) {
                        return function () {
                            path = svg.select("path#path"+ ((x+5)*2));
                            var startPoint = ARRAY_PATHSTARTPOINTS[x];
                            transition();
                            marker.attr("transform", "translate(" + startPoint + ")");
                            //console.log("PATHDURATION: " + (ARRAY_DURATIONS[x]));

                            function transition() {
                                var length = path.node().getTotalLength();
                                var dur = (length*1000)/SPEED;
                                //console.log(dur);
                                marker.transition()
                                    .duration(ARRAY_DURATIONS[x])
                                    .attrTween("transform", translateAlong(path.node()))
                                //.delay(3000);
                                //.each("end", transition);// infinite loop

                            }
                        }
                    }(k), ARRAY_ADDED_DURATION[k]);

                    k ++;
                }while (k <=24)


                function translateAlong(path) {
                    var l = path.getTotalLength();
                    return function(i) {
                        return function(t) {

                            var p = path.getPointAtLength(t * l);
                            var posX = p.x - 122;
                            var posY = p.y - 5;

                            return "translate(" + posX + "," + posY + ")"; //Move marker

                        }
                    }

                }
            };



            // Train Travel from Elephant & Castle to Harrow & Wealdstone

            var ETOH = function () {

                var marker2 = svg.append("circle")
                                    .attr("r", 7)
                                    .style("fill", "purple");

                for(var j = 24; j>=0; j--){
                        setTimeout(function (x) {
                            return function () {
                                path = svg.select("path#path"+(x -1+5)*2),
                                    startPoint = pathstartpoint(path);
                                //console.log((x-1+5)*2);
                                    transition();
                                marker2.attr("transform", "translate(" + startPoint + ")");
                                //console.log("PATHDURATION: " + ARRAY_ETOH_ADDED_DURATION[24-x]);
                            }

                        }(j), ARRAY_ETOH_ADDED_DURATION[24-j]);

                }
                function pathstartpoint(path) {
                    var d = path.attr("d"),
                        dsplitted = d.split(" ");
                    var n = dsplitted[1].split(",");
                    //console.log(n);
                    return n;
                   }

                function transition() {
                    var length = path.node().getTotalLength();
                    var dur = (length*6000)/SPEED;
                    //console.log(dur);
                    marker2.transition()
                        .duration(dur)
                        .attrTween("transform", translateAlong2(path.node()))
                    //.delay(3000);
                    //.each("end", transition);// infinite loop

                }

                function translateAlong2(path) {
                    var l = path.getTotalLength();
                    return function(i) {
                        return function(t) {
                            var p = path.getPointAtLength(1/t * 1/l);
                            var posX = p.x - 122;
                            var posY = p.y - 5;
                            return "translate(" + posX + "," + posY + ")"; //Move marker

                        }
                    }

                }
            }


            HTOE();
            ETOH();

            //  Start new train from origin after a fixed time duration in both directions.

            var count = 1;
            var loop = setInterval(function() {

                HTOE();
                ETOH();

                count++;
                if (count == 6) {
                    clearInterval(loop);
                }

            }, 30000);
        }

    }]);