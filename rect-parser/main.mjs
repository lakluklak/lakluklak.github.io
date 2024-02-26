// native Rect takes real minx, real miny, real maxx, real maxy returns rect

const input = document.querySelector('.input')
const output = document.querySelector('.output')
/** @type {HTMLAnchorElement} */ const button = document.querySelector('.save')

const prefix = 'gg_rct_'

class Rect {
    name = ''
    minx = 0
    miny = 0
    maxx = 0
    maxy = 0

    /**
     * @param {string} name
     * @param {string} minx
     * @param {string} miny
     * @param {string} maxx
     * @param {string} maxy
     */
    constructor(name, minx, miny, maxx, maxy) {
        this.name = name
        this.minx = parseFloat(minx)
        this.miny = parseFloat(miny)
        this.maxx = parseFloat(maxx)
        this.maxy = parseFloat(maxy)
    }

    get valid() {
        return !isNaN(this.minx) && !isNaN(this.miny) && !isNaN(this.maxx) && !isNaN(this.maxy)
    }

    toString() {
        return `${this.name} (${Math.trunc(this.minx)}, ${Math.trunc(this.miny)}, ${Math.trunc(this.maxx)}, ${Math.trunc(this.maxy)})`
    }
}

const rex = /set\s+([_a-zA-Z\d]+)\s*=\s*Rect\s*\(([^)]+)\)/gm

/** @type {Rect[]} */ const rects = []

const parse = () => {
    const list = [...input.value.matchAll(rex)]

    rects.splice(0, rects.length)
    for (const item of list) {
        if (item.length !== 3) continue
        const values = item[2].split(',').map(v => parseFloat(v.replace(/[^-.\d]/g, '')))
        if (values.length !== 4) continue
        let name = item[1]
        if (name.startsWith(prefix)) name = name.substring(prefix.length, name.length)
        const r = new Rect(name, ...values)
        if (!r.valid) continue
        rects.push(r)
    }

    output.textContent = ''
    for (const rect of rects) {
        output.textContent += `${rect}\n`
    }
}
input.addEventListener('input', parse)

if (location.host.startsWith('localhost')) {
    input.value = 'set gg_rct_dwfwf = Rect( -   1.0 , - .0 , -3 , -    .4)'
    parse()
}

class BlobWriter {
    constructor() {
        this.#view = new DataView(this.#buffer)
    }

    /** @type {TextEncoder} */ #encoder = new TextEncoder('utf-8')
    #buffer = new ArrayBuffer(4)
    /** @type {DataView} */ #view
    /** @type {Uint8Array[]} */ list = []

    /**
     * @param {number} value
     * @param {boolean} littleEndian
     * @param {boolean} integer
     */
    number(value, littleEndian, integer) {
        if (integer) this.#view.setInt32(0, value, littleEndian)
        else this.#view.setFloat32(0, value, littleEndian)
        const list = new Uint8Array(4)
        for (let i = 0; i < 4; i++) {
            list[i] = this.#view.getUint8(i)
        }
        this.list.push(list)
    }

    string(value) {
        this.list.push(this.#encoder.encode(value))
        this.list.push(new Uint8Array([0]))
    }
}

// https://xgm.guru/p/wc3/w3-file-format
button.addEventListener('click', () => {
    const writer = new BlobWriter()

    writer.number(5, true, true) // Версия формата
    writer.number(rects.length, true, true) // Количество областей

    for (let i = 0; i < rects.length; i++) {
        const rect = rects[i]
        writer.number(rect.minx, true, false) // Влево
        writer.number(rect.miny, true, false) // Вниз
        writer.number(rect.maxx, true, false) // Вправо
        writer.number(rect.maxy, true, false) // Вверх
        writer.string(rect.name) // Название
        writer.number(i, true, true) // Номер области
        writer.number(0, true, true) // Равкод погоды
        writer.string('') // Фоновый звук
        writer.number(0x11D933FF, false, true) // Цвет rgba
    }

    const url = URL.createObjectURL(new Blob(writer.list))
    button.target = '_blank'
    button.href = url
    button.download = 'war3map.w3r'
})

export {}
