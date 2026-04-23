import { MigrationObject } from "../types"

const migration: MigrationObject = {
    type: 'schema',
    schema: {
        name: 'courses',
        fields: [
            { name: 'id', type: 'string', index: false },
            { name: 'slug', type: 'string', index: false },
            { name: 'updatedAt', type: 'int64' },
            { name: 'lectureAccesibility', type: 'string', facet: true },
            { name: 'title', type: 'string' },
            { name: 'description', type: 'string' },
            { name: 'poster', type: 'string' },
            { name: 'language', type: 'string', facet: true },
            { name: 'lecturesAmmount', type: 'int32' },
            { name: 'price', type: 'int32' },
            { name: 'discountPercent', type: 'int32' },
            { name: 'discountedPrice', type: 'int32' },
            { name: 'tags', type: 'string[]', facet: true },
            { name: 'author', type: 'string', facet: true },
            { name: 'avgRating', type: 'float' },
            { name: 'totalReviews', type: 'int64' },
            { name: 'totalPurchases', type: 'int64' },
            { name: 'totalViews', type: 'int64' },
            { name: 'totalImpressions', type: 'int64' },
            {
                name: 'course_embedding',
                type: 'float[]',
                embed: {
                    from: ['title', 'description', 'tags'],
                    model_config: {
                        model_name: 'ts/multilingual-e5-base',
                    },
                },
            },
        ],
    },
}

export default migration