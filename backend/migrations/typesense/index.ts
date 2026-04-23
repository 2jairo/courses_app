import { Client } from 'typesense'
import dotenv from 'dotenv'
import { MIGRATIONS } from './migrations/index'

dotenv.config({ path: '../.env' })

const typesenseUrl = new URL(process.env.TYPESENSE_URL!)

const client = new Client({
    apiKey: process.env.TYPESENSE_API_KEY!,
    nodes: [{
        host: typesenseUrl.hostname,
        port: parseInt(typesenseUrl.port),
        protocol: typesenseUrl.protocol.replace(':' , ''),
    }]
})

type ErrorWithHttpStatus = {
    httpStatus?: number
}

const isErrorWithHttpStatus = (error: unknown): error is ErrorWithHttpStatus =>
    typeof error === 'object' && error !== null && 'httpStatus' in error

const loadFiles = async () => {
    const schemas = []
    const nls = []

    for (const migration of MIGRATIONS) {
        switch (migration.type) {
            case "schema":
                schemas.push(migration.schema)
                break;
        
            case "nl":
                nls.push(migration.nl)
                break;
        }        
    }

    return { nls, schemas }
}

const up = async () => {
    const { nls, schemas } = await loadFiles()

    for (const schema of schemas) {
        try {
            await client.collections().create(schema)
            console.log(`Created collection: ${schema.name}`)
        } catch (error) {
            if (isErrorWithHttpStatus(error) && error.httpStatus === 409) {
                console.log(`Collection already exists: ${schema.name}`)
                continue
            }

            throw error
        }
    }
    for (const nl of nls) {
        try {
            await client.nlSearchModels().create(nl)
            console.log(`Created nl search model: ${nl.id}`)
        } catch (error) {
            if (isErrorWithHttpStatus(error) && error.httpStatus === 409) {
                console.log(`nl already exists: ${nl.id}`)
                continue
            }

            throw error
        }
    }
}

const down = async () => {
    const { nls, schemas } = await loadFiles()

    for (const schema of schemas) {
        try {
            await client.collections(schema.name).delete()
            console.log(`Deleted collection: ${schema.name}`)
        } catch (error) {
            if (isErrorWithHttpStatus(error) && error.httpStatus === 404) {
                console.log(`Collection not found: ${schema.name}`)
                continue
            }

            throw error
        }
    }
    for (const nl of nls) {
        try {
            await client.nlSearchModels(nl.id!).delete()
            console.log(`Deleted nl search model: ${nl.id!}`)
        } catch (error) {
            if (isErrorWithHttpStatus(error) && error.httpStatus === 404) {
                console.log(`nl not found: ${nl.id!}`)
                continue
            }

            throw error
        }
    }    
}

const command = process.argv[2]

if (!command || !['up', 'down'].includes(command)) {
    console.error('Usage: node index.js <up|down>')
    process.exit(1)
}

try {
    if (command === 'up') {
        await up()
    } else {
        await down()
    }
} catch (error) {
    console.error(error)
    process.exit(1)
}

