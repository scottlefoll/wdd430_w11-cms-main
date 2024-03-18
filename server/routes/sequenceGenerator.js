const Sequence = require('../models/sequence');

class SequenceGenerator {
  constructor() {
    this.initialized = this.initialize();
  }

  async initialize() {
    let sequence = await Sequence.findOne();

    // If the sequence document does not exist, create it.
    if (!sequence) {
      sequence = await Sequence.create({
        maxDocumentId: '100',
        maxMessageId: '100',
        maxContactId: '101',
      });
      console.log('Sequence document initialized.');
    }

    // Store sequence IDs for later use.
    this.maxDocumentId = parseInt(sequence.maxDocumentId, 10);
    this.maxMessageId = parseInt(sequence.maxMessageId, 10);
    this.maxContactId = parseInt(sequence.maxContactId, 10);
  }

  async nextId(collectionType) {
    await this.initialized; // Ensure initialization is complete before proceeding.

    let updateField = '';
    switch (collectionType) {
      case 'documents':
        this.maxDocumentId++;
        updateField = 'maxDocumentId';
        break;
      case 'messages':
        this.maxMessageId++;
        updateField = 'maxMessageId';
        break;
      case 'contacts':
        this.maxContactId++;
        updateField = 'maxContactId';
        break;
      default:
        throw new Error('Invalid collection type for nextId');
    }

    const updateObject = {};
    updateObject[updateField] = this[updateField].toString();

    await Sequence.updateOne({}, { $set: updateObject });

    return this[updateField];
  }
}

module.exports = new SequenceGenerator();
