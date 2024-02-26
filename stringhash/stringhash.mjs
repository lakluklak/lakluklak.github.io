// noinspection DuplicatedCode

function Storm_590(a1) {
    let v1 = a1;
    let v2 = a1[0];
    let v3 = 0;
    let v6 = new Array(1024);

    for (let i = 0; v1[i]; ++v3) {
        if (v3 >= 1023) break;

        if (v2 < 'a') {
            if (v2 === '/') v2 = '\\';
        } else {
            v2 = String.fromCharCode(v2.charCodeAt(0) - 32);
        }

        v6[v3] = v2;
        v2 = a1[++i];
    }

    v6[v3] = '\0';

    return sub_15034690(v6, v3, 0);
}

function sub_15034690(a1, a2, a3) {
    let v3 = a3;
    let v4 = -0x61C88647;
    let v5 = a2;
    let v6 = -0x61C88647;

    if (a2 >= 12) {
        let v24 = Math.floor(a2 / 12);

        while (v24 > 0) {
            let v7 = v4 + a1[4] + ((a1[5] + ((a1[6] + (a1[7] << 8)) << 8)) << 8);
            let v8 = v3 + a1[8] + ((a1[9] + ((a1[10] + (a1[11] << 8)) << 8)) << 8);
            let v9 = (v8 >> 13) ^ (v6 + a1[0] + ((a1[1] + ((a1[2] + (a1[3] << 8)) << 8)) << 8) - v8 - v7);
            let v10 = (v9 << 8) ^ (v7 - v8 - v9);
            let v11 = (v10 >> 13) ^ (v8 - v10 - v9);
            let v12 = (v11 >> 12) ^ (v9 - v11 - v10);
            let v13 = (v12 << 16) ^ (v10 - v11 - v12);
            let v14 = (v13 >> 5) ^ (v11 - v13 - v12);
            v6 = (v14 >> 3) ^ (v12 - v14 - v13);
            v4 = (v6 << 10) ^ (v13 - v14 - v6);
            v3 = (v4 >> 15) ^ (v14 - v4 - v6);
            a1 = a1.slice(12);
            v5 -= 12;
            v24--;
        }
    }

    v5 += v3;

    switch (v5) {
        case 1:
            return sub_15034690_step(a1, v6, v4);
        case 2:
            return sub_15034690_step(a1, v6, v4) ^ (a1[1] << 8);
        case 3:
            return sub_15034690_step(a1, v6, v4) ^ (a1[1] << 8) ^ (a1[2] << 16);
        case 4:
            return sub_15034690_step(a1, v6, v4) ^ (a1[1] << 8) ^ (a1[2] << 16) ^ (a1[3] << 24);
        case 5:
            return sub_15034690_step(a1, v6, v4) ^ (a1[1] << 8) ^ (a1[2] << 16) ^ (a1[3] << 24) ^ (a1[4]);
        case 6:
            return sub_15034690_step(a1, v6, v4) ^ (a1[1] << 8) ^ (a1[2] << 16) ^ (a1[3] << 24) ^ (a1[4]) ^ (a1[5] << 8);
        case 7:
            return sub_15034690_step(a1, v6, v4) ^ (a1[1] << 8) ^ (a1[2] << 16) ^ (a1[3] << 24) ^ (a1[4]) ^ (a1[5] << 8) ^ (a1[6] << 16);
        case 8:
            return sub_15034690_step(a1, v6, v4) ^ (a1[1] << 8) ^ (a1[2] << 16) ^ (a1[3] << 24) ^ (a1[4]) ^ (a1[5] << 8) ^ (a1[6] << 16) ^ (a1[7] << 24);
        case 9:
            return sub_15034690_step(a1, v6, v4) ^ (a1[1] << 8) ^ (a1[2] << 16) ^ (a1[3] << 24) ^ (a1[4]) ^ (a1[5] << 8) ^ (a1[6] << 16) ^ (a1[7] << 24) ^ (a1[8] << 8);
        case 10:
            return sub_15034690_step(a1, v6, v4) ^ (a1[1] << 8) ^ (a1[2] << 16) ^ (a1[3] << 24) ^ (a1[4]) ^ (a1[5] << 8) ^ (a1[6] << 16) ^ (a1[7] << 24) ^ (a1[8] << 8) ^ (a1[9] << 16);
        case 11:
            return sub_15034690_step(a1, v6, v4) ^ (a1[1] << 8) ^ (a1[2] << 16) ^ (a1[3] << 24) ^ (a1[4]) ^ (a1[5] << 8) ^ (a1[6] << 16) ^ (a1[7] << 24) ^ (a1[8] << 8) ^ (a1[9] << 16) ^ (a1[10] << 24);
        default:
            return sub_15034690_step(a1, v6, v4);
    }
}

function sub_15034690_step(a1, v6, v4) {
    let v15 = v4 + a1[0] + ((a1[1] + ((a1[2] + (a1[3] << 8)) << 8)) << 8);
    let v16 = (v15 >> 13) ^ (v6 - v15 - v4);
    let v17 = (v16 << 8) ^ (v4 - v15 - v16);
    let v18 = (v17 >> 13) ^ (v15 - v17 - v16);
    let v19 = (v18 >> 12) ^ (v16 - v18 - v17);
    let v20 = (v19 << 16) ^ (v17 - v18 - v19);
    let v21 = (v20 >> 5) ^ (v18 - v20 - v19);
    let v22 = (v21 >> 3) ^ (v19 - v21 - v20);
    let result = (((v22 << 10) ^ (v20 - v21 - v22)) >> 15) ^ (v21 - ((v22 << 10) ^ (v20 - v21 - v22)) - v22);

    return result;
}
/*
[19:32:43]: StringHash( anal ) = int = -1265060182 | uint = 3029907114 | B498B6AA
[19:32:46]: StringHash( анал ) = int = -1401905730 | uint = 2893061566 | AC709DBE
 */
