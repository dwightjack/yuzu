const tsumami = require('tsumami-real'); //eslint-disable-line
const expect = require('expect');

const obj = {};

Object.keys(tsumami).forEach((m) => {

    if (typeof tsumami[m] === 'function') {

        const shim = (...args) => {
            if (shim.spy) {
                const ret = shim.spy(...args);
                if (ret !== undefined) { return ret; }
            }
            return tsumami[m](...args);
        };

        Object.defineProperty(shim, 'mock', {
            enumerable: false,
            value(implementation = expect.createSpy) {
                shim.spy = implementation();
                return shim.spy;
            }
        });

        Object.defineProperty(shim, 'restore', {
            enumerable: false,
            value() {
                shim.spy = null;
            }
        });


        Object.defineProperty(obj, m, {
            get() {
                return shim;
            }
        });

    } else {
        obj[m] = tsumami[m];
    }

});


module.exports.byId = obj.byId;
module.exports.byClassName = obj.byClassName;
module.exports.qs = obj.qs;
module.exports.qsa = obj.qsa;
module.exports.data = obj.data;
module.exports.toArray = obj.toArray;
module.exports.matches = obj.matches;
module.exports.parents = obj.parents;
module.exports.closest = obj.closest;
module.exports.addClass = obj.addClass;
module.exports.removeClass = obj.removeClass;
module.exports.hasClass = obj.hasClass;
module.exports.toggleClass = obj.toggleClass;