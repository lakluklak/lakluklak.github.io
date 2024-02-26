export class W3IClan {
    /** @param {CDataView} view */
    read(view) {
        /** TODO:
         * 0x0001    Союзник
         * 0x0002    Общая победа
         * 0x0004    Неизвестно
         * 0x0008    Общее поле зрения
         * 0x0010    Общие войска
         * 0x0020    Общие войска:все
         * @type {number}
         */
        this.flag = view.uint32;

        /**
         * Игроки    От младшего бита к старшему (0=игрока нету в клане, 1=игрок есть в клане), но надо учитывать наличие самого игрока в игре, т.к в первом клане по умолчанию присутствуют все игроки (от 0 до 31), которых нету в других кланах
         * @type {number}
         */
        this.players = view.uint32;

        this.name = view.string;
    }

    /** @param {CDataView} view */
    write(view) {
        view.uint32 = this.flag;
        view.uint32 = this.players;
        view.string = this.name;
    }

    toJSON() {
        return {
            flag: this.flag,
            players: this.players,
            name: this.name,
        };
    }
}
