import { openDB } from 'idb';

export const CURRENCY_TABLE_NAME = 'currencies';

const tablesList = [CURRENCY_TABLE_NAME];

class DB {
    constructor(name, tables, version = 1) {
        this.name = name;
        this.version = version;
    }

    async connect() {
        this.db = await openDB(this.name, this.version, {
            upgrade(db) {
                tablesList.forEach(tableName => {
                    db.createObjectStore(tableName, {
                        keyPath: 'id',
                        autoIncrement: true
                    })
                })
            },
        })
    }

    add(tableName, value) {
        return this.db.add(tableName, value);
    }

    delete(tableName, id) {
        return this.db.delete(tableName, id);
    }

    getAll(tableName) {
        return this.db.getAll(tableName);
    }

}

export default new DB('currency-db')
