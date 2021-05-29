import {ReactiveSurface, xc, IReactor, PropAction, PropDef, PropDefMap} from 'xtal-element/lib/XtalCore.js';

export class RefTo extends HTMLElement implements ReactiveSurface{
    static is = 'ref-to';
    self = this;
    propActions = propActions;
    reactor: IReactor = new xc.Rx(this);
    //wr: any;//WeakRef<Element> | undefined;
    ref: Element | undefined; //TODO, switch with weakref as advertised.
    placeHolderMap = new WeakMap<Element, Element>();
    a: string | undefined;
    get deref(){
        //if(this.wr === undefined){
        if(this.ref === undefined){
            if(this.a !== undefined){
                onA(this);
            }else{
                return undefined;
            }
            
        }
        //const element = this.wr.deref();
        const element = this.ref;//TODO:  use weakref
        if(!element){
            setTimeout(() => {
                //const test = this.wr.deref(); //TODO: use weakref
                const test = this.ref;
                if(!test){
                    this.remove();
                }
                return;
            }, 500);
        }
        return element;
    }
    connectedCallback(){
        xc.mergeProps(this, slicedPropDefs);
    }
    disconnectedCallback(){
        this.deref?.remove();
    }
    onPropChange(n: string, prop: PropDef, nv: any){
        this.reactor.addToQueue(prop, nv);
    }
}
const onA = ({a, self}: RefTo) => {
    const newElement = document.createElement(a!);
    //self.wr = new WeakRef<Element>(newElement); //TODO:  Use weakref
    self.ref = newElement;
    const childNodes = Array.from(self.childNodes);
    for(const node of childNodes){
        if(node instanceof RefTo){
            if(!node.deref){
                const ph = document.createElement('place--holder');
                self.placeHolderMap.set(newElement, ph);
                node.addEventListener('element-created', e => {
                    const createdElement = (<any>e).detail.createdElement;
                    if(self.placeHolderMap.has(createdElement)){
                        const ph = self.placeHolderMap.get(createdElement);
                        ph!.insertAdjacentElement('afterend', createdElement);
                        ph!.remove();
                    }else{
                        throw 'NotImplementedYet'; // extra dynamic elements?
                    }
                }, {once: true});
                newElement.appendChild(ph);
            }else{
                newElement.appendChild(node.deref);
            }
        }else{
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
] as PropAction[];
const propDefMap: PropDefMap<RefTo> = {
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
