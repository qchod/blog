import { DecoratorNode } from 'lexical';

function ImageComponent({ src, altText }) {
    return (
        <img src={src} alt={altText} className="editor-image" />
    );
}

export class ImageNode extends DecoratorNode {
    static getType() {
        return 'image';
    }

    static clone(node) {
        return new ImageNode(node.__src, node.__altText, node.__key);
    }

    constructor(src, altText, key) {
        super(key);
        this.__src = src;
        this.__altText = altText || '';
    }

    createDOM() {
        const span = document.createElement('span');
        span.className = 'editor-image-wrapper';
        return span;
    }

    updateDOM() {
        return false;
    }

    exportJSON() {
        return {
            type: 'image',
            src: this.__src,
            altText: this.__altText,
            version: 1,
        };
    }

    static importJSON(data) {
        return $createImageNode(data.src, data.altText);
    }

    decorate() {
        return <ImageComponent src={this.__src} altText={this.__altText} />;
    }
}

export function $createImageNode(src, altText) {
    return new ImageNode(src, altText);
}
