const Collection = require('../models/Collection');
const Movie = require('../models/Movie');
const Series = require('../models/Series');
const slugify = require('slugify');

// ================= GET ALL COLLECTIONS =================
exports.getAllCollections = async (req, res) => {
    try {
        const { active } = req.query;

        const filter = {};
        if (active === 'true') {
            filter.isActive = true;
        }

        const collections = await Collection.find(filter)
            .sort({ order: 1, createdAt: -1 })
            .lean();

        res.json(collections);
    } catch (error) {
        console.error('Error fetching collections:', error);
        res.status(500).json({ error: 'Failed to fetch collections' });
    }
};

// ================= GET COLLECTION BY SLUG (WITH POPULATED ITEMS) =================
exports.getCollectionBySlug = async (req, res) => {
    try {
        const { slug } = req.params;

        const collection = await Collection.findOne({ slug, isActive: true });

        if (!collection) {
            return res.status(404).json({ error: 'Collection not found' });
        }

        // Populate Movies and Series
        const populatedItems = [];

        for (const item of collection.items) {
            let content = null;

            if (item.contentType === 'Movie') {
                content = await Movie.findById(item.contentId).lean();
            } else if (item.contentType === 'Series') {
                content = await Series.findById(item.contentId).lean();
            }

            if (content) {
                populatedItems.push({
                    ...content,
                    type: item.contentType.toLowerCase(),
                    addedAt: item.addedAt
                });
            }
        }

        res.json({
            ...collection.toObject(),
            items: populatedItems
        });
    } catch (error) {
        console.error('Error fetching collection:', error);
        res.status(500).json({ error: 'Failed to fetch collection' });
    }
};

// ================= CREATE COLLECTION =================
exports.createCollection = async (req, res) => {
    try {
        const { title, description, poster, backdrop, order } = req.body;

        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }

        // Generate slug
        const slug = slugify(title, { lower: true, strict: true });

        // Check if slug already exists
        const existing = await Collection.findOne({ slug });
        if (existing) {
            return res.status(400).json({ error: 'Collection with this title already exists' });
        }

        const collection = new Collection({
            title,
            slug,
            description: description || '',
            poster: poster || '',
            backdrop: backdrop || '',
            order: order || 0,
            items: []
        });

        await collection.save();

        res.status(201).json({
            message: 'Collection created successfully',
            collection
        });
    } catch (error) {
        console.error('Error creating collection:', error);
        res.status(500).json({ error: 'Failed to create collection' });
    }
};

// ================= UPDATE COLLECTION =================
exports.updateCollection = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, poster, backdrop, order, isActive } = req.body;

        const collection = await Collection.findById(id);

        if (!collection) {
            return res.status(404).json({ error: 'Collection not found' });
        }

        // Update fields
        if (title) {
            collection.title = title;
            collection.slug = slugify(title, { lower: true, strict: true });
        }
        if (description !== undefined) collection.description = description;
        if (poster !== undefined) collection.poster = poster;
        if (backdrop !== undefined) collection.backdrop = backdrop;
        if (order !== undefined) collection.order = order;
        if (isActive !== undefined) collection.isActive = isActive;

        await collection.save();

        res.json({
            message: 'Collection updated successfully',
            collection
        });
    } catch (error) {
        console.error('Error updating collection:', error);
        res.status(500).json({ error: 'Failed to update collection' });
    }
};

// ================= DELETE COLLECTION =================
exports.deleteCollection = async (req, res) => {
    try {
        const { id } = req.params;

        const collection = await Collection.findByIdAndDelete(id);

        if (!collection) {
            return res.status(404).json({ error: 'Collection not found' });
        }

        res.json({
            message: 'Collection deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting collection:', error);
        res.status(500).json({ error: 'Failed to delete collection' });
    }
};

// ================= ADD ITEM TO COLLECTION =================
exports.addItemToCollection = async (req, res) => {
    try {
        const { id } = req.params;
        const { contentId, contentType } = req.body;

        if (!contentId || !contentType) {
            return res.status(400).json({ error: 'contentId and contentType are required' });
        }

        if (!['Movie', 'Series'].includes(contentType)) {
            return res.status(400).json({ error: 'Invalid contentType. Must be Movie or Series' });
        }

        const collection = await Collection.findById(id);

        if (!collection) {
            return res.status(404).json({ error: 'Collection not found' });
        }

        // Verify content exists
        let content = null;
        if (contentType === 'Movie') {
            content = await Movie.findById(contentId);
        } else {
            content = await Series.findById(contentId);
        }

        if (!content) {
            return res.status(404).json({ error: `${contentType} not found` });
        }

        // Check if already in collection
        const exists = collection.items.some(
            item => item.contentId.toString() === contentId && item.contentType === contentType
        );

        if (exists) {
            return res.status(400).json({ error: 'Item already in collection' });
        }

        // Add item
        collection.items.push({
            contentId,
            contentType,
            addedAt: new Date()
        });

        await collection.save();

        res.json({
            message: 'Item added to collection successfully',
            collection
        });
    } catch (error) {
        console.error('Error adding item to collection:', error);
        res.status(500).json({ error: 'Failed to add item to collection' });
    }
};

// ================= REMOVE ITEM FROM COLLECTION =================
exports.removeItemFromCollection = async (req, res) => {
    try {
        const { id, itemId } = req.params;

        const collection = await Collection.findById(id);

        if (!collection) {
            return res.status(404).json({ error: 'Collection not found' });
        }

        // Remove item
        collection.items = collection.items.filter(
            item => item._id.toString() !== itemId
        );

        await collection.save();

        res.json({
            message: 'Item removed from collection successfully',
            collection
        });
    } catch (error) {
        console.error('Error removing item from collection:', error);
        res.status(500).json({ error: 'Failed to remove item from collection' });
    }
};

// ================= BULK ADD ITEMS TO COLLECTION =================
exports.bulkAddItems = async (req, res) => {
    try {
        const { id } = req.params;

        // Handle both JSON object and stringified JSON
        let bodyData = req.body;
        if (typeof req.body === 'string') {
            try {
                bodyData = JSON.parse(req.body);
            } catch (e) {
                console.error('Failed to parse body string:', e);
                return res.status(400).json({ error: 'Invalid JSON in request body' });
            }
        }

        const { items } = bodyData;

        console.log('📦 Bulk Add Request:', {
            collectionId: id,
            bodyType: typeof req.body,
            bodyRaw: req.body,
            bodyParsed: bodyData,
            items: items,
            itemsType: typeof items,
            itemsIsArray: Array.isArray(items),
            itemsLength: Array.isArray(items) ? items.length : 'not array'
        });

        if (!items) {
            return res.status(400).json({ error: 'items field is required in request body' });
        }

        if (!Array.isArray(items)) {
            return res.status(400).json({ error: 'items must be an array', receivedType: typeof items });
        }

        if (items.length === 0) {
            return res.status(400).json({ error: 'items array cannot be empty' });
        }

        const collection = await Collection.findById(id);

        if (!collection) {
            return res.status(404).json({ error: 'Collection not found' });
        }

        let addedCount = 0;
        let skippedCount = 0;

        for (const item of items) {
            const { contentId, contentType } = item;

            console.log('🔍 Processing item:', { contentId, contentType });

            if (!contentId || !['Movie', 'Series'].includes(contentType)) {
                console.log('⚠️ Skipping invalid item:', item);
                skippedCount++;
                continue;
            }

            // Check if already exists
            const exists = collection.items.some(
                i => i.contentId.toString() === contentId && i.contentType === contentType
            );

            if (exists) {
                console.log('⏭️ Item already in collection:', contentId);
                skippedCount++;
                continue;
            }

            collection.items.push({
                contentId,
                contentType,
                addedAt: new Date()
            });
            addedCount++;
        }

        await collection.save();

        console.log('✅ Bulk add complete:', { addedCount, skippedCount, total: items.length });

        res.json({
            message: `${addedCount} items added to collection`,
            addedCount,
            skippedCount,
            collection
        });
    } catch (error) {
        console.error('❌ Error bulk adding items:', error);
        res.status(500).json({ error: 'Failed to bulk add items', details: error.message });
    }
};
