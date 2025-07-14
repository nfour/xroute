"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.diffMerge = diffMerge;
const jsondiffpatch = require("jsondiffpatch");
const compat_1 = require("es-toolkit/compat");
const microdiff_1 = require("microdiff");
/** Merges by using `microdiff` */
function diffMerge(prev, next, method = true) {
    switch (method) {
        case true:
        case 'microdiff': {
            const diff = (0, microdiff_1.default)(prev, next);
            for (const event of diff) {
                switch (event.type) {
                    case 'CREATE':
                    case 'CHANGE':
                        (0, compat_1.set)(prev, event.path, event.value);
                        break;
                    case 'REMOVE':
                        (0, compat_1.unset)(prev, event.path);
                        break;
                }
            }
        }
        case 'jsondiffpatch': {
            const diff = jsondiffpatch.diff(prev, next);
            jsondiffpatch.patch(prev, diff);
        }
    }
}
