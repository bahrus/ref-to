import { xc } from 'xtal-element/lib/XtalCore.js';
export class RefTo extends HTMLElement {
    constructor() {
        super(...arguments);
        this.self = this;
        this.propActions = propActions;
        this.reactor = new xc.Rx(this);
        //ref: Element | undefined; //TODO, switch with weakref as advertised.
        this.placeHolderMap = new WeakMap();
    }
    get deref() {
        if (this.wr === undefined) {
            //if(this.ref === undefined){
            if (this.a !== undefined) {
                onA(this);
            }
            else {
                return undefined;
            }
        }
        if (this.wr === undefined)
            return;
        const element = this.wr.deref();
        //const element = this.ref;//TODO:  use weakref
        if (!element) {
            setTimeout(() => {
                const test = this.wr?.deref(); //TODO: use weakref
                //const test = this.ref;
                if (!test) {
                    this.remove();
                }
                return;
            }, 500);
        }
        return element;
    }
    connectedCallback() {
        xc.mergeProps(this, slicedPropDefs);
    }
    disconnectedCallback() {
        this.deref?.remove();
    }
    onPropChange(n, prop, nv) {
        this.reactor.addToQueue(prop, nv);
    }
}
RefTo.is = 'ref-to';
const onA = ({ a, self }) => {
    // if(self.ref !== undefined){ //TODO: use weakref
    //     if(self.ref.localName === a) return;
    // }
    if (self.wr !== undefined) {
        const el = self.wr.deref();
        if (el !== undefined && el.localName === a)
            return;
    }
    const newElement = document.createElement(a);
    self.wr = new WeakRef(newElement); //TODO:  Use weakref
    //self.ref = newElement;
    const childNodes = Array.from(self.childNodes);
    for (const node of childNodes) {
        if (node instanceof RefTo) {
            if (!node.deref) {
                const ph = document.createElement('place--holder');
                self.placeHolderMap.set(newElement, ph);
                node.addEventListener('element-created', e => {
                    const createdElement = e.detail.createdElement;
                    if (self.placeHolderMap.has(createdElement)) {
                        const ph = self.placeHolderMap.get(createdElement);
                        ph.insertAdjacentElement('afterend', createdElement);
                        ph.remove();
                    }
                    else {
                        throw 'NotImplementedYet'; // extra dynamic elements?
                    }
                }, { once: true });
                newElement.appendChild(ph);
            }
            else {
                newElement.appendChild(node.deref);
            }
        }
        else {
            newElement.appendChild(node.cloneNode(true));
        }
    }
    //TODO:  add mutation observer for additional ref-to direct children.
    self.dispatchEvent(new CustomEvent('element-created', {
        bubbles: true,
        detail: {
            createdElement: newElement
        }
    }));
};
const onNewElement = ({ self, newRef }) => {
    self.wr = new WeakRef(newRef);
};
const propActions = [
    onA, onNewElement
];
const propDefMap = {
    a: {
        type: String,
        stopReactionsIfFalsy: true,
        async: true,
        dry: true
    },
    newRef: {
        type: Object,
        stopReactionsIfFalsy: true,
        async: true,
        dry: true,
    }
};
const slicedPropDefs = xc.getSlicedPropDefs(propDefMap);
xc.letThereBeProps(RefTo, slicedPropDefs, 'onPropChange');
xc.define(RefTo);
