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

    async getTwoWeeksOfFoodChoices() {
        const db = await this.dbPromise;

        const toDateKey = (date) =>
            `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

        const end = new Date();
        const start = new Date(end);
        start.setDate(end.getDate() - 13);

        const range = IDBKeyRange.bound(toDateKey(start), toDateKey(end));
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const index = transaction.store.index('date');
        const choices = [];

        let cursor = await index.openCursor(range, 'prev');
        while (cursor) {
            choices.push(cursor.value);
            cursor = await cursor.continue();
        }

        await transaction.done;
        return choices;
    }
    
    async deleteFoodChoice(id) {
        console.log(`Deleting food choice with id: ${id}`);
        const db = await this.dbPromise;
        return db.delete(STORE_NAME, Number(id));
    }

    async getFoodChoiceById(id) {
        const db = await this.dbPromise;
        return db.get(STORE_NAME, Number(id));
    }
}
