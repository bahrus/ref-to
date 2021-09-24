import {XE} from 'xtal-element/src/XE.js';
import {RefToProps, RefToActions} from './types';

/**
 * @element ref-to
 * @tag ref-to
 */
export class RefToCore extends HTMLElement implements RefToActions{

    get deref(){
        if(this.weakRef === undefined){
            if(this.a !== undefined){
                this.onA(this);
            }else{
                return;
            }
        }
        if(this.weakRef === undefined) return;
        const element = this.weakRef.deref();
        if(!element){
            setTimeout(() => {
                const test = this.weakRef?.deref();
                if(!test){
                    this.remove();
                }
                return;
            }, 500);
        }
        return element;
    }
    placeHolderMap = new WeakMap<Element, Element>();
    onA({a}: this){
        if(this.weakRef !== undefined){
            const el = this.weakRef.deref();
            if(el !== undefined && el.localName === a) return;
        }
        const newElement = document.createElement(a!);
        this.weakRef = new WeakRef<Element>(newElement);
        const childNodes = Array.from(this.childNodes);
        for(const node of childNodes){
            if(node instanceof RefToCore){
                if(!node.deref){
                    const ph = document.createElement('place--holder');
                    this.placeHolderMap.set(newElement, ph);
                    node.addEventListener('deref-changed', e => {
                        const createdElement = (<any>e).detail.createdElement;
                        if(this.placeHolderMap.has(createdElement)){
                            const ph = this.placeHolderMap.get(createdElement);
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
        self.dispatchEvent(new CustomEvent('deref-changed', {
            bubbles: true,
            detail: {
                createdElement: newElement
            }
        }));
    }
    onNewElement({newRef}: this){
        this.weakRef = new WeakRef<Element>(newRef!);
    }
    doInsertAdjacent({weakRef, insertAdjacent}: this){
        const el = this.deref;
        if(el === undefined) return;
        this.insertAdjacentElement(insertAdjacent as InsertPosition, el);
    }
    disconnectedCallback(){
        this.deref?.remove();
    }
}

export interface RefToCore extends RefToProps{}

const xe = new XE<RefToProps, RefToActions>({
    config:{
        tagName: 'ref-to',
        propDefaults:{
            a: '',
            insertAdjacent: '',
        },
        propInfo:{
            an:{
                notify:{
                    echoTo: 'a'
                }
            }
        },
        actions:{
            onA:{
                ifAllOf: ['a']
            },
            onNewElement:{
                ifAllOf: ['newRef']
            },
            doInsertAdjacent:{
                ifAllOf: ['weakRef', 'insertAdjacent']
            }
        },
        style:{
            display:'none'
        }
    },
    superclass:RefToCore,
});

export const RefTo = xe.classDef!;

declare global {
    interface HTMLElementTagNameMap {
        'ref-to': RefToCore;
    }
}