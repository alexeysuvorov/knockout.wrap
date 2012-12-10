/// <reference path="jasmine.js" />
/// <reference path="knockout-2.2.0.js"/>
/// <reference path="../knockout.wrap.js"/>
/// <reference path="knockout.extensions.js"/>

describe("Mapping observable test", function () {
    var simpleObject = { a: 1, b: 2 };
    var hierarchicalObject = {
        a: { x: 1, y: 2 },
        b: "234"
    };
    var arrayContainer = { a: [10, 20, 30, 40] };
    var objectsStorage = { items: [ { a: 10 }, { a: 20 }, { a: 30 }, { a: 40 } ] };
    var widgetContainer = {
        widget: {
            report: { id: 10, name: "Top 10 winners" }
        }
    };

    it("Should map primitive objects", function() {
        var result = ko.wrap.fromJS(simpleObject);
        expect(result).toBeDefined();
        expect(result).toBeObservable();
        expect(result().a).toBeObservable();
        expect(result().b).toBeObservable();
    });
    
    it("Should map hierarchical object recursive", function () {
        var result = ko.wrap.fromJS(hierarchicalObject);
        expect(result).toBeDefined();
        expect(result).toBeObservable();
        expect(result().a).toBeObservable();
        expect(result().a().x).toBeObservable();
        expect(result().a().y).toBeObservable();
    });

    it("Should map array properties properly", function() {
        var result = ko.wrap.fromJS(arrayContainer);
        expect(result).toBeDefined();
        expect(result).toBeObservable();
        expect(result().a).toBeObservable();
        for (var i = 0; i < result().a.length; i++)
            expect(result().a[i]).toBeObservable();
    });

    it("Should map empty arrays as observable array", function () {
        var data = { a: [] };
        var res = ko.wrap.fromJS(data);
        expect(res).toBeObservable();
        expect(res().a).toBeObservable();
    });

    it("Should use options on mapping", function() {
        var computedFunctions = {
            "/widget/report": function (e) { return e; }
        };
        spyOn(computedFunctions, "/widget/report");
        ko.wrap.fromJS(widgetContainer, computedFunctions);
        expect(computedFunctions["/widget/report"]).toHaveBeenCalled();
    });
    
    it("Should use root option on mapping", function () {
        var computedFunctions = {
            "": function (e) { return e; }
        };
        spyOn(computedFunctions, "");
        ko.wrap.fromJS(widgetContainer, computedFunctions);
        expect(computedFunctions[""]).toHaveBeenCalled();
    });

    it("Should use mapping for array items", function () {
        var mappings = {
            "/items": function (item) {
                return item;
            }
        };
        var res = ko.wrap.fromJS(objectsStorage, mappings);
        expect(res().items).toBeObservable();
        res().items().forEach(function (x) {
            expect(x).not.toBeObservable();
        });
    });

    it("Should not mapp argument before pass it to computed function", function () {
        var computedFunctions = {
            "/widget/report": function (e) {
                expect(e).toBeDefined();
                expect(e).not.toBeObservable();
                
                expect(e.id).toBeDefined();
                expect(e.id).not.toBeObservable();
                
                expect(e.name).toBeDefined();
                expect(e.name).not.toBeObservable();
                return e;
            }
        };
        ko.wrap.fromJS(widgetContainer, computedFunctions);
    });

    it("Should correctly process when options contains mappings", function () {
        var mappings = {
            "/widget": function(widget) {
                return ko.wrap.fromJS(widget, mappings);
            },
            "/report": function(report) {
                return report;
            }
        };
        var cSpy = spyOn(mappings, "/report");
        var res = ko.wrap.fromJS(widgetContainer, mappings);
        expect(res().widget).toBeObservable();
        expect(res().widget().report).not.toBeObservable();
        
        expect(cSpy).toHaveBeenCalled();
    });
});