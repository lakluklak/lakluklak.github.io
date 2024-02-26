export class W3IPlayer {
    /** @param {number} formatVersion */
    constructor(formatVersion) {
        this.#formatVersion = formatVersion;
    }

    /** @type {number} */ #formatVersion;

    /** @param {CDataView} view */
    read(view) {
        this.number = view.uint32;
        /**
         * Тип игрока    1=Человек, 2=Компьютер, 3=Нейтрал, 4=Резерв
         * @type {number}
         */
        this.type = view.uint32;
        /**
         * Раса игрока    0=Случайная раса, 1=Альянс, 2=Орда, 3=Нежить, 4=Ночные эльфы
         * @type {number}
         */
        this.race = view.uint32;

        /**
         * Фиксированная исходная позиция    Самый младший бит (0=нет, 1=да)
         * @type {number}
         */
        this.fixed = view.uint32;

        this.name = view.string;

        this.x = view.float32;
        this.y = view.float32;

        /**
         * Низкие приоритеты союзников    От младшего бита к старшему (0=приоритета на игрока нету, 1=приоритет на игрока есть)
         * @type {number}
         */
        this.lowPrio = view.uint32;

        /**
         * Высокие приоритеты союзников    От младшего бита к старшему (0=приоритета на игрока нету, 1=приоритет на игрока есть)
         * @type {number}
         */
        this.hightPrio = view.uint32;

        if (this.#formatVersion >= 31) {
            this.unknownA = view.uint32;
            this.unknownB = view.uint32;
        }
    }

    /** @param {CDataView} view */
    write(view) {
        view.uint32 = this.number;
        view.uint32 = this.type;
        view.uint32 = this.race;
        view.uint32 = this.fixed;
        view.string = this.name;
        view.float32 = this.x;
        view.float32 = this.y;
        view.uint32 = this.lowPrio;
        view.uint32 = this.hightPrio;
        if (this.#formatVersion >= 31) {
            view.uint32 = this.unknownA;
            view.uint32 = this.unknownB;
        }
    }

    toJSON() {
        return {
            number: this.number,
            type: this.type,
            race: this.race,
            fixed: this.fixed,
            name: this.name,
            x: this.x,
            y: this.y,
            lowPrio: this.lowPrio,
            hightPrio: this.hightPrio,
            unknownA: this.unknownA,
            unknownB: this.unknownB,
        };
    }
}
