interface Document {
    onmousewheel: ((this: Document, ev: Event) => any) | null;
}