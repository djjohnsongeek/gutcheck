const DB_NAME = 'foodChoicesDb';
const DB_VERSION = 1;
const STORE_NAME = 'foodChoices';

// uses IndexedDB via the idb library
class FoodChoicesRepo {
    constructor() {
        this.dbPromise = idb.openDB(DB_NAME, DB_VERSION, {
            upgrade(db) {
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    const objectStore = db.createObjectStore(STORE_NAME, {
                        keyPath: 'id',
                        autoIncrement: true,
                    });

                    objectStore.createIndex('date', 'date', { unique: false });
                }
            },
        });
    }

    async addFoodChoice(date, foodItem, score) {
        const db = await this.dbPromise;

        return db.add(STORE_NAME, {
            date: date,
            foodItem: foodItem,
            healthScore: score,
        });
    }

    async getAllFoodChoices() {
        const db = await this.dbPromise;
        return db.getAllFromIndex(STORE_NAME, 'date');
    }

    async deleteFoodChoice(id) {
        console.log(`Deleting food choice with id: ${id}`);
        const db = await this.dbPromise;
        return db.delete(STORE_NAME, Number(id));
    }
}
