import OpenAI from "openai"
import { DataAPIClient } from "@datastax/astra-db-ts"

const openai = new OpenAI({ apiKey: process.env.REACT_APP_OPENAI_API_KEY, dangerouslyAllowBrowser: true });
const client = new DataAPIClient(process.env.REACT_APP_ASTRA_DB_APPLICATION_TOKEN)


const db = client.db(process.env.REACT_APP_ASTRA_DB_API_ENPOINT!, {namespace: process.env.REACT_APP_ASTRA_DB_NAMESPACE})

export async function interfaceRag(_value: any){
	try{
        let docContext = ""

        const embedding = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: _value,
            encoding_format: "float"
        })
		console.log("embedding")
    console.log(embedding.data[0].embedding)
    console.log(embedding.data)
        try{
            const collection = db.collection(process.env.REACT_APP_ASTRA_DB_COLLECTION!)
            const cursor = collection.find({
                sort: {
                    $vector: embedding.data[0].embedding,
                },
                limit: 10
            })
            console.log(cursor)
            console.log(collection)
            const documents = await cursor.toArray()
            console.log(documents)
            const docsMap = documents?.map(doc => doc.text)
            console.log(docsMap)
            docContext = JSON.stringify(docsMap)
			console.log(docContext)
        }catch(err){
            console.log("Error querying db...")
        }
		console.log("db")
        const template = {
            role: "system",
            content: `You are an AI assistant who knows everything about Cashi.
            Use the below context to augment what you know about Cashi.
            The context will provide you with the most recent page data from the official database,
            If the context doesn't include the information you need answer based on your 
            existing knowledge and don't mention the source of your information or
            what the context does or doesn't include.
            Format responses using markdown where applicable and don't return 
            images.
        ----------------
        START CONTEXT
        ${docContext}
        END CONTEXT
        ----------------
        QUESTION ${_value}
        -----------------
        `
        }
		console.log(template)
		return template
		

    }catch (err){
        throw err
    }
  }
