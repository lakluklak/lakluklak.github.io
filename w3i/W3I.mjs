import fromBuffer from '../utils/bufffer-to-buffer.mjs';
import {CDataView} from '../utils/c-data-view.mjs';
import {CDataViewFake} from '../utils/c-data-view-fake.mjs';
import {W3IPlayer} from './W3IPlayer.mjs';
import {W3IClan} from './W3IClan.mjs';
import {W3IUpgrade} from './W3IUpgrade.mjs';

export class W3I {
    /** @param {Buffer|ArrayBuffer} buffer */
    constructor(buffer) {
        this.#buffer = fromBuffer(buffer);
    }

    /** @type {ArrayBuffer} */ #buffer;
    /** @type {Error[]} */ errors = [];
    /** @type {W3IPlayer[]} */ players = [];
    /** @type {W3IClan[]} */ clans = [];
    /** @type {W3IUpgrade[]} */ upgrades = [];

    #read() {
        const view = new CDataView(this.#buffer);
        this.formatVersion = view.uint32;

        //ROC=18, TFT=25, 1.31=28, 1.32=31
        if ([18, 25, 28, 31].indexOf(this.formatVersion) < 0) {
            throw new Error(`This format is unsupported: ${this.formatVersion}`);
        }

        this.saveCount = view.uint32;
        this.editorVersion = view.uint32;

        if (this.formatVersion >= 28) {
            this.gameVersionA = view.uint32;
            this.gameVersionB = view.uint32;
            this.gameVersionC = view.uint32;
            this.gameVersionD = view.uint32;
        }

        this.name = view.string;
        this.author = view.string;
        this.description = view.string;
        this.playersDescription = view.string;

        this.camL1 = view.float32;
        this.camB1 = view.float32;
        this.camR1 = view.float32;
        this.camU1 = view.float32;
        this.camL2 = view.float32;
        this.camU2 = view.float32;
        this.camR2 = view.float32;
        this.camB2 = view.float32;

        this.unboundA = view.uint32;
        this.unboundB = view.uint32;
        this.unboundC = view.uint32;
        this.unboundD = view.uint32;
        this.unboundE = view.uint32; // Ширина игровой области карты , ширина карты = A+E+B
        this.unboundF = view.uint32; //int	Высота игровой области карты , высота карты = C+F+D

        /** TODO: fix flags
         * 0x000001    Скрыть мини-карту на экранах предпросмотра
         * 0x000002    Изменить приоритеты союзников
         * 0x000004    Карта подходит для режима "Сражения"
         * 0x000008    Использовать нестандартный тип ландшафта
         * 0x000010    Скрытые области частично видимы
         * 0x000020    Фикс. параметры игрока
         * 0x000040    Нестандартные кланы
         * 0x000080    Нестандартные технологии
         * 0x000100    Нестандартные способности
         * 0x000200    Нестандартные улучшения
         * 0x000400    Неизвестно
         * 0x000800    Показывать волны на крутых берегах
         * 0x001000    Показывать волны на пологих берегах
         * 0x002000    Используется туман на местности
         * 0x004000    Требуется дополнение
         * 0x008000    Классификация предметов
         * 0x010000    Фоновый цвет воды
         * @type {number}
         */
        this.flags = view.uint32;

        /**
         * Основной тип ландшафта карты    Пример: 'A' - Ашенваль, 'L' - Летний Лордерон
         *    A: ashenvale
         *     B: barrens
         *     C: felwood
         *     D: dungeon
         *     F: lordaeronFall
         *     G: underground
         *     L: lordaeronSummer
         *     N: northrend
         *     Q: villageFall
         *     V: village
         *     W: lordaeronWinter
         *     X: dalaran
         *     Y: cityscape
         *     Z: sunkenRuins
         *     I: icecrown
         *     J: dalaranRuins
         *     O: outland
         *     k: blackCitadel
         * @type {number}
         */
        this.landscape = view.uint8;

        /**
         * Номер загрузочного экрана от стандартных кампаний    -1 = нету или используется импортированный загрузочный экран
         * @type {number}
         */
        this.loadscreen = view.uint32;
        if (this.formatVersion >= 25) this.loadscreenPath = view.string;
        this.loadscreenText = view.string;
        this.loadscreenHead = view.string;
        this.loadscreenSubHead = view.string;

        /**
         * Используемый набор игровых данных    Номер предустановки, 0=Стандартный
         * @type {number}
         */
        this.gameData = view.uint32;

        if (this.formatVersion >= 25) this.prologuePath = view.string;
        this.prologueText = view.string;
        this.prologueHead = view.string;
        this.prologueSubHead = view.string;

        if (this.formatVersion >= 25) {
            /**
             * Туман на местности    0=Не используется, больше нуля = номер в списке стилей тумана
             * @type {number}
             */
            this.fog = view.uint32;
            this.fogStartZ = view.float32;
            this.fogEndZ = view.float32;
            this.fogDensity = view.float32;
            this.fogR = view.uint8;
            this.fogG = view.uint8;
            this.fogB = view.uint8;
            this.fogA = view.uint8;

            /**
             * Равкод глобальной погоды на карте    0=нету
             * @type {number}
             */
            this.weather = view.uint32BE;
            /**
             * Нест. звуковое окружение
             * @type {string}
             */
            this.sound = view.string;

            /**
             * Нестандартное освещение    Пример: 'A' - Ашенваль, 'L' - Летний Лордерон
             * @type {number}
             */
            this.light = view.uint8;

            this.waterR = view.uint8;
            this.waterG = view.uint8;
            this.waterB = view.uint8;
            this.waterA = view.uint8;
        }

        if (this.formatVersion >= 28) {
            /**
             * 0=JASS, 1=Lua
             * @type {number}
             */
            this.lua = view.uint32;
        }

        if (this.formatVersion >= 31) {
            this.unknownA = view.uint32;
            this.unknownB = view.uint32;
        }

        for (let i = view.uint32; i > 0; i--) {
            const p = new W3IPlayer(this.formatVersion);
            p.read(view);
            this.players.push(p);
        }

        for (let i = view.uint32; i > 0; i--) {
            const c = new W3IClan();
            c.read(view);
            this.clans.push(c);
        }

        for (let i = view.uint32; i > 0; i--) {
            const u = new W3IUpgrade();
            u.read(view);
            this.upgrades.push(u);
        }

        if (view.uint32) {
            /*
            int	Кол-во нестандартных технологий	Переменная i
            i раз, см. данные о нестандартных технологиях
             */
            throw new Error('Tech not impliement');
        }

        if (view.uint32) {
            /*
            int	Кол-во случайных групп	Переменная i
            i раз, см. данные о случайных группах
             */
            throw new Error('Random group not impliement');
        }

        if (this.formatVersion >= 25) {
            if (view.uint32) {
                /*
                int	Кол-во таблиц предметов	Переменная i
                i раз, см. данные о таблицах предметов
                 */
                throw new Error('Item table not impliement');
            }
        }

        if (view.cursor !== view.byteLength) {
            throw new Error(`Read not complete: ${view.cursor} !== ${view.byteLength}`);
        }
    }

    read() {
        try {
            this.#read();
        } catch (e) {
            this.errors.push(e);
        }
    }

    /** @param {CDataView} view */
    #write(view) {
        view.uint32 = this.formatVersion;
        view.uint32 = this.saveCount;
        view.uint32 = this.editorVersion;
        if (this.formatVersion > 28) {
            view.uint32 = this.gameVersionA;
            view.uint32 = this.gameVersionB;
            view.uint32 = this.gameVersionC;
            view.uint32 = this.gameVersionD;
        }

        view.string = this.name;
        view.string = this.author;
        view.string = this.description;
        view.string = this.playersDescription;

        view.float32 = this.camL1;
        view.float32 = this.camB1;
        view.float32 = this.camR1;
        view.float32 = this.camU1;
        view.float32 = this.camL2;
        view.float32 = this.camU2;
        view.float32 = this.camR2;
        view.float32 = this.camB2;

        view.uint32 = this.unboundA;
        view.uint32 = this.unboundB;
        view.uint32 = this.unboundC;
        view.uint32 = this.unboundD;
        view.uint32 = this.unboundE;
        view.uint32 = this.unboundF;

        view.uint32 = this.flags;
        view.uint8 = this.landscape;

        view.uint32 = this.loadscreen;
        if (this.formatVersion >= 25) view.string = this.loadscreenPath;
        view.string = this.loadscreenText;
        view.string = this.loadscreenHead;
        view.string = this.loadscreenSubHead;

        view.uint32 = this.gameData;

        if (this.formatVersion >= 25) view.string = this.prologuePath;
        view.string = this.prologueText;
        view.string = this.prologueHead;
        view.string = this.prologueSubHead;

        if (this.formatVersion >= 25) {
            view.uint32 = this.fog;
            view.float32 = this.fogStartZ;
            view.float32 = this.fogEndZ;
            view.float32 = this.fogDensity;
            view.uint8 = this.fogR;
            view.uint8 = this.fogG;
            view.uint8 = this.fogB;
            view.uint8 = this.fogA;
            view.uint32BE = this.weather;
            view.string = this.sound;
            view.uint8 = this.light;
            view.uint8 = this.waterR;
            view.uint8 = this.waterG;
            view.uint8 = this.waterB;
            view.uint8 = this.waterA;
        }

        view.uint32 = this.lua;

        view.uint32 = this.unknownA;
        view.uint32 = this.unknownB;

        view.uint32 = this.players.length;
        for (const p of this.players) p.write(view);

        view.uint32 = this.clans.length;
        for (const c of this.clans) c.write(view);

        view.uint32 = this.upgrades.length;
        for (const u of this.upgrades) u.write(view);

        view.uint32 = 0; // Tech
        view.uint32 = 0; // Random group

        if (this.formatVersion >= 25) view.uint32 = 0; // Item table
    }

    write() {
        /** @type {CDataView} */
        const dvf = new CDataViewFake();
        this.#write(dvf);

        const ab = new ArrayBuffer(dvf.cursor);
        const dv = new CDataView(ab);
        this.#write(dv);

        return ab;
    }

    toJSON() {
        return {
            formatVersion: this.formatVersion,
            saveCount: this.saveCount,
            editorVersion: this.editorVersion,
            gameVersion: [this.gameVersionA, this.gameVersionB, this.gameVersionC, this.gameVersionD],
            name: this.name,
            author: this.author,
            description: this.description,
            playersDescription: this.playersDescription,
            cameraBounds: [this.camL1, this.camB1, this.camR1, this.camU1, this.camL2, this.camU2, this.camR2, this.camB2],
            unbound: [this.unboundA, this.unboundB, this.unboundC, this.unboundD, this.unboundE, this.unboundF],
            flags: this.flags,
            landscape: String.fromCharCode(this.landscape),
            loadscreen: this.loadscreen,
            loadscreenPath: this.loadscreenPath,
            loadscreenText: this.loadscreenText,
            loadscreenHead: this.loadscreenHead,
            loadscreenSubHead: this.loadscreenSubHead,
            gameData: this.gameData,
            prologuePath: this.prologuePath,
            prologueText: this.prologueText,
            prologueHead: this.prologueHead,
            prologueSubHead: this.prologueSubHead,
            fog: this.fog,
            fogStartZ: this.fogStartZ,
            fogEndZ: this.fogEndZ,
            fogDensity: this.fogDensity,
            fogColor: [this.fogR, this.fogG, this.fogB, this.fogA],
            weather: this.weather,
            sound: this.sound,
            light: this.light,
            waterColor: [this.waterR, this.waterG, this.waterB, this.waterA],
            lua: this.lua > 0,
            unknownA: this.unknownA,
            unknownB: this.unknownB,
            players: this.players,
            clans: this.clans,
            upgrades: this.upgrades,
        };
    }
}