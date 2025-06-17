import * as jsondiffpatch from 'jsondiffpatch';
import { set, unset } from 'es-toolkit/compat';
import microdiff from 'microdiff';
/** Merges by using `microdiff` */
export function diffMerge(prev, next, method = true) {
    switch (method) {
        case true:
        case 'microdiff': {
            const diff = microdiff(prev, next);
            for (const event of diff) {
                switch (event.type) {
                    case 'CREATE':
                    case 'CHANGE':
                        set(prev, event.path, event.value);
                        break;
                    case 'REMOVE':
                        unset(prev, event.path);
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
