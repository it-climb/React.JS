'use strict';
const
    _ = require('lodash'),
    oneMileInLat = 0.015,
    oneMileInLng = 0.0185;

let GeoUtils = {

    /**
     * fake location coordinates
     * @param location
     * @param radius - in miles
     * @returns {{location: {lan: number, lng: number}}}
     */
    fakeLocation: (location, radius=0.25) => {

        let latPercent = Math.floor(Math.random() * 100) + 1,
            lngPercent = 100 - latPercent,
            latOffset = (oneMileInLat * radius) * latPercent / 100,
            lngOffset = (oneMileInLng * radius) * lngPercent / 100;
            if(Math.floor(Math.random()*2)==1){
                latOffset = -latOffset;
            }
            if(Math.floor(Math.random()*2)==1){
                lngOffset = -lngOffset;
            }

        return {
            location : {
                lat: location.lat + latOffset,
                lng: location.lng + lngOffset
            }
        }
    }

};

module.exports = GeoUtils;