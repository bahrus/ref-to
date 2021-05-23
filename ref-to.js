import { xc } from 'xtal-element/lib/XtalCore.js';
export class RefTo extends HTMLElement {
    static is = 'ref-to';
    self = this;
    propActions = propActions;
    reactor = new xc.Rx(this);
    wr; //WeakRef<Element> | undefined;
    placeHolderMap = new WeakMap();
    a;
    get deref() {
        const element = this.wr.deref();
        if (!element) {
            setTimeout(() => {
                const test = this.wr.deref();
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
const onA = ({ a, self }) => {
    const newElement = document.createElement(a);
    self.wr = new WeakRef(newElement);
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
        detail: {
            createdElement: newElement
        }
    }));
};
const propActions = [
    onA
];
const propDefMap = {
    a: {
        type: String,
        stopReactionsIfFalsy: true,
        async: true,
        dry: true
    }
};
const slicedPropDefs = xc.getSlicedPropDefs(propDefMap);
xc.letThereBeProps(RefTo, slicedPropDefs, 'onPropChange');
xc.define(RefTo);
