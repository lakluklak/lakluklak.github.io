function encodeUTF8(s) {
    var i = 0, bytes = new Uint8Array(s.length * 4);
    for (var ci = 0; ci != s.length; ci++) {
        var c = s.charCodeAt(ci);        
        if (c < 128) {
            bytes[i++] = c;
            continue;
        }
        if (c < 2048) {
            bytes[i++] = c >> 6 | 192;
        }
        else {
            if (c > 0xd7ff && c < 0xdc00) {
                if (++ci >= s.length)
                    throw new Error('UTF-8 encode: incomplete surrogate pair');
                var c2 = s.charCodeAt(ci);
                if (c2 < 0xdc00 || c2 > 0xdfff)
                    throw new Error('UTF-8 encode: second surrogate character 0x' + c2.toString(16) + ' at index ' + ci + ' out of range');
                c = 0x10000 + ((c & 0x03ff) << 10) + (c2 & 0x03ff);
                bytes[i++] = c >> 18 | 240;
                bytes[i++] = c >> 12 & 63 | 128;
            }
            else
                bytes[i++] = c >> 12 | 224;
            bytes[i++] = c >> 6 & 63 | 128;
        }
        bytes[i++] = c & 63 | 128;
    }
    return bytes.subarray(0, i);
};
function decodeUTF8(bytes) {
    var i = 0, s = '';
    while (i < bytes.length) {
        var c = bytes[i++];
        if (c > 127) {
            if (c > 191 && c < 224) {
                if (i >= bytes.length)
                    throw new Error('UTF-8 decode: incomplete 2-byte sequence');
                c = (c & 31) << 6 | bytes[i++] & 63;
            }
            else if (c > 223 && c < 240) {
                if (i + 1 >= bytes.length)
                    throw new Error('UTF-8 decode: incomplete 3-byte sequence');
                c = (c & 15) << 12 | (bytes[i++] & 63) << 6 | bytes[i++] & 63;
            }
            else if (c > 239 && c < 248) {
                if (i + 2 >= bytes.length)
                    throw new Error('UTF-8 decode: incomplete 4-byte sequence');
                c = (c & 7) << 18 | (bytes[i++] & 63) << 12 | (bytes[i++] & 63) << 6 | bytes[i++] & 63;
            }
            else
                throw new Error('UTF-8 decode: unknown multibyte start 0x' + c.toString(16) + ' at index ' + (i - 1));
        }
        if (c <= 0xffff)
            s += String.fromCharCode(c);
        else if (c <= 0x10ffff) {
            c -= 0x10000;
            s += String.fromCharCode(c >> 10 | 0xd800);
            s += String.fromCharCode(c & 0x3FF | 0xdc00);
        }
        else
            throw new Error('UTF-8 decode: code point 0x' + c.toString(16) + ' exceeds UTF-16 reach');
    }
    return s;
};
function longToByteArray(long) {
    // we want to represent the input as a 8-bytes array
    var byteArray = [0, 0, 0, 0, 0, 0, 0, 0];
    for (var index = 0; index < byteArray.length; index++) {
        var byte = long & 0xff;
        byteArray[index] = byte;
        long = (long - byte) / 256;
    }
    return byteArray;
};
function byteArrayToLong(byteArray) {
    var value = 0n;
    var usesbyte = 256n;
    for (var i = byteArray.length - 1; i >= 0; i--) {
        value = (value * 256n) + BigInt(byteArray[i]);
    }
    return value;
};
function StringHash(s) {
    if (s === "")
        return 0;
    var ss = encodeUTF8(s);
    for (var index = 0; index < ss.length; index++) {
        if (ss[index] >= 97 && ss[index] <= 122) {
            ss[index] -= 32;
        }
        else if (ss[index] == 47) {
            ss[index] = 92;
        }
    }
    var l = BigInt(ss.length);
    var a = 0n;
    var b = 0x9e3779b9n;
    var c = b;
    var p = [0n, 8n, 16n, 24n, 0n, 8n, 16n, 24n, 8n, 16n, 24n];
    var r = [-13n, 8n, -13n, -12n, 16n, -5n, -3, 10n, -15n];
    while (ss.length >= 12) {
        a += byteArrayToLong([ss[8], ss[9], ss[10], ss[11]]);
        b += byteArrayToLong([ss[4], ss[5], ss[6], ss[7]]);
        c += byteArrayToLong([ss[0], ss[1], ss[2], ss[3]]);
        r.forEach(function (i) {
            var is = i > 0n;
            var aa = a;
            var bb = b;
            a = aa;
            b = bb;
            //a = (c - b - a) ^ (a << (is?i :(a & 0xFFFFFFFF  )) >> -i);
            a = (c - b - a) ^ (is ? a << BigInt(i) : (a & 0xffffffffn) >> BigInt(-i));
            b = aa;
            c = bb & 0xffffffffn;
        });
        ss = ss.slice(12, ss.length);
    }
    var d = [c, b, a + l];
    for (var i = 0; i < ss.length; i++) {
        d[Math.floor(i / 4)] += BigInt(ss[i]) << p[i];
    }
    c = d[0];
    b = d[1];
    a = d[2];
    r.forEach(function (i) {
        var is = i > 0;
        var aa = a;
        var bb = b;
        a = aa;
        b = bb;
        //a = (c - b - a) ^ (a << (is?i :(a & 0xFFFFFFFF )) >> -i);
        a = (c - b - a) ^ (is ? a << BigInt(i) : (a & 0xffffffffn) >> BigInt(-i));
        b = aa;
        c = bb & 0xffffffffn;
    });
    var e = a & 0xffffffffn;
    return e - (1n << 32n) * (e >> 31n);
};