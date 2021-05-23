import {ReactiveSurface, xc, IReactor, PropAction, PropDef, PropDefMap} from 'xtal-element/lib/XtalCore.js';

export class RefTo extends HTMLElement implements ReactiveSurface{
    static is = 'ref-to';
    self = this;
    propActions = propActions;
    reactor: IReactor = new xc.Rx(this);
    wr: any;//WeakRef<Element> | undefined;
    doneProcessing = new WeakSet<RefTo>();
    a: string | undefined;
    get deref(){
        const element = this.wr.deref();
        if(!element){
            setTimeout(() => {
                const test = this.wr.deref();
                if(!test){
                    this.remove();
                }
                return;
            }, 500);
        }
        return element;
    }
    disconnectedCallback(){
        this.deref?.remove();
    }
    onPropChange(n: string, prop: PropDef, nv: any){
        this.reactor.addToQueue(prop, nv);
    }
}
const onA = ({a, self}: RefTo) => {
    const newElement = document.createElement(a);
    self.wr = new WeakRef<Element>(newElement);
    for(const node of self.childNodes){
        if(node instanceof RefTo){
            if(!node.deref){
                const ph = document.createElement('place--holder');
                newElement.appendChild(ph);
            }else{
                newElement.appendChild(node.deref);
            }
        }else{
            newElement.appendChild(node.cloneNode(true));
        }
        
    }
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
xc.define(RefTo);