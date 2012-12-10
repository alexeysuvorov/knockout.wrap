///<reference path="knockout-2.2.0.js"/>
/// <reference path="jasmine.js" />

jasmine.Matchers.prototype.toBeObservable = function () {
    return ko.isObservable(this.actual);
};