export class W3IUpgrade {
    /** @param {CDataView} view */
    read(view) {
        /**
         * Игроки    От младшего бита к старшему (0=на игрока не действует улучшение, 1=на игрока действует улучшение)
         * @type {number}
         */
        this.players = view.uint32;

        /**
         * Равкод улучшения
         * @type {number}
         */
        this.id = view.uint32BE;

        this.level = view.uint32;

        /**
         * Доступность улучшения    0=Недоступно, 1=Доступно, 2=Исследовано
         * @type {number}
         */
        this.state = view.uint32;
    }

    /** @param {CDataView} view */
    write(view) {
        view.uint32 = this.players;
        view.uint32BE = this.id;
        view.uint32 = this.level;
        view.uint32 = this.state;
    }

    toJSON() {
        return {
            players: this.players,
            id: this.id,
            level: this.level,
            state: this.state,
        };
    }
}
