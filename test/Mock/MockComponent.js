'use strict';

let cxComponent = require('../../Complex').cxComponent;

module.exports = class MockComponent extends cxComponent{
    constructor(){
        super();
        this.tag = 'mock.component';
    }
}