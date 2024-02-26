// https://github.com/bryanburgers/bin-pack
export class GrowingPacker {

    width = 0;
    height = 0;
    items = [];

    set item(item) {
        this.items.push(item);
    }

    pack() {
        this.items.sort((a, b) => b.width * b.height - a.width * a.height);

        this.fit(this.items);

        this.width = this.items.reduce((curr, item) => Math.max(curr, item.x + item.width), 0);
        this.height = this.items.reduce((curr, item) => Math.max(curr, item.y + item.height), 0);

        this.items.sort((a, b) => a.index - b.index);
    }

    fit(blocks) {
        let n, node, block, len = blocks.length, fit;
        const width = len > 0 ? blocks[0].width : 0;
        const height = len > 0 ? blocks[0].height : 0;
        this.root = {x: 0, y: 0, width: width, height: height};
        for (n = 0; n < len; n++) {
            block = blocks[n];
            node = this.findNode(this.root, block.width, block.height);
            if (node) {
                fit = GrowingPacker.splitNode(node, block.width, block.height);
                block.x = fit.x;
                block.y = fit.y;
            } else {
                fit = this.growNode(block.width, block.height);
                block.x = fit.x;
                block.y = fit.y;
            }
        }
    }

    findNode(root, width, height) {
        if (root.used)
            return this.findNode(root.right, width, height) || this.findNode(root.down, width, height);
        else if (width <= root.width && height <= root.height)
            return root;
        else
            return null;
    }

    static splitNode(node, width, height) {
        node.used = true;
        node.down = {x: node.x, y: node.y + height, width: node.width, height: node.height - height};
        node.right = {x: node.x + width, y: node.y, width: node.width - width, height: height};
        return node;
    }

    growNode(width, height) {
        const canGrowDown = width <= this.root.width;
        const canGrowRight = height <= this.root.height;

        const shouldGrowRight = canGrowRight && this.root.height >= this.root.width + width; // attempt to keep square-ish by growing right when height is much greater than width
        const shouldGrowDown = canGrowDown && this.root.width >= this.root.height + height; // attempt to keep square-ish by growing down  when width  is much greater than height

        if (shouldGrowRight) return this.growRight(width, height);
        if (shouldGrowDown) return this.growDown(width, height);
        if (canGrowRight) return this.growRight(width, height);
        if (canGrowDown) return this.growDown(width, height);

        return null; // need to ensure sensible root starting size to avoid this happening
    }

    growRight(width, height) {
        this.root = {
            used: true,
            x: 0,
            y: 0,
            width: this.root.width + width,
            height: this.root.height,
            down: this.root,
            right: {x: this.root.width, y: 0, width: width, height: this.root.height},
        };
        const node = this.findNode(this.root, width, height);
        return node ? GrowingPacker.splitNode(node, width, height) : null;
    }

    growDown(width, height) {
        this.root = {
            used: true,
            x: 0,
            y: 0,
            width: this.root.width,
            height: this.root.height + height,
            down: {x: 0, y: this.root.height, width: this.root.width, height: height},
            right: this.root,
        };
        const node = this.findNode(this.root, width, height);
        return node ? GrowingPacker.splitNode(node, width, height) : null;
    }
}



