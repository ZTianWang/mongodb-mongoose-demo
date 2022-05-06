import { MongoClient } from 'mongodb'

const url = 'mongodb://localhost:27017'
const db_name = 'wnwn'

async function testMongodb() {
    const client = new MongoClient(url)
    try {
        await client.connect()
        const db = client.db(db_name)
        const collection_products = db.collection('product')
        const productList = collection_products.find()
        productList.forEach(product => {
            console.log(product.name);
        })
    } catch (e) {
        console.log(e.stack);
    }
}
// testMongodb()

new MongoClient(url).connect()
.then((client) => {
    const db = client.db(db_name)
    const collection_products = db.collection('products')
    const productList = collection_products.find()
    productList.forEach(product => {
        console.log(product.name);
    })
})
.catch((err) => { 
    console.log(err.stack)
 })
