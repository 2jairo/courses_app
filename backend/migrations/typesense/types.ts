import { CollectionCreateOptions, CollectionCreateSchema } from "typesense/lib/Typesense/Collections"
import { NLSearchModelCreateSchema } from "typesense/lib/Typesense/NLSearchModels"

export type MigrationObject = {
    type: 'nl'
    nl: NLSearchModelCreateSchema
} | {
    type: 'schema'
    schema: CollectionCreateSchema<CollectionCreateOptions>
}