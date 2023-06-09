import { MongoClient } from 'mongodb';

class DbHandler {
    constructor(url, tlsOptions) {
        this.url = url;
        this.tlsOptions = tlsOptions;
    
        this.client = new MongoClient(this.url, this.tlsOptions);
        this.db = null;

        this.connect()
        
  }

  async connect(dbName) {
    try {
      await this.client.connect();
      this.db = this.client.db(dbName);
      console.log('Connected successfully to the server');
    } catch (err) {
        console.error('err connecting to the server');
      throw err;
    }
  }

  async dropCollection(collection) {
    await this.db.collection(collection).drop();
  }

  async __nuclearAlternative() {
    const collections = await this.listCollections();
    for (let collection of collections) {
      await this.dropCollection(collection.name);
    }
  }

  async listCollections() {
    return await this.db.listCollections().toArray();
  }

  async findAll(collection, fields) {
    return await this.db.collection(collection).find({}, { projection: fields}).toArray();
  }

  async documentExists(collection, data) {
    const result = await this.db.collection(collection).findOne(data);
    return result !== null;
  }

  async findOne(collection, data = {}, fields = {}) {
    return await this.db.collection(collection).findOne(data, {projection: fields});
  }

  async insertOne(collection, data) {
    return await this.db.collection(collection).insertOne(data);
  }
}

export default DbHandler;
