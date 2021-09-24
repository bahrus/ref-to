export interface RefToProps{
    a: string | undefined;
    an: string | undefined;
    newRef: Element | undefined;
    insertAdjacent: InsertPosition | '';
    weakRef: WeakRef<Element>;
}

export interface RefToActions{
    onA(self: this): void;
    onNewElement(self: this): void;
    doInsertAdjacent(self: this): void;
}