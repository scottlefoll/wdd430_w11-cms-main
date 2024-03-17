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

// var Sequence = require('../models/sequence');

// var maxDocumentId;
// var maxMessageId;
// var maxContactId;
// var sequenceId = null;

// function SequenceGenerator() {
//   Sequence.find()
//     .then(result => {
//       // Assuming 'result' is an array, find the first sequence
//       const sequence = result[0];
//       if (sequence) {
//         sequenceId = sequence._id;
//         maxDocumentId = sequence.maxDocumentId;
//         maxMessageId = sequence.maxMessageId;
//         maxContactId = sequence.maxContactId;
//       } else {
//         console.log('No sequence found. Initialize your database with a sequence document.');
//       }
//     })
//     .catch(err => {
//       // Log the error instead of attempting to send an HTTP response
//       console.error('Error fetching sequence:', err);
//     });
// }

// SequenceGenerator.prototype.nextId = function(collectionType) {
//   var updateObject = {};
//   var nextId;

//   switch (collectionType) {
//     case 'documents':
//       maxDocumentId++;
//       updateObject = {maxDocumentId: maxDocumentId};
//       nextId = maxDocumentId;
//       break;
//     case 'messages':
//       maxMessageId++;
//       updateObject = {maxMessageId: maxMessageId};
//       nextId = maxMessageId;
//       break;
//     case 'contacts':
//       maxContactId++;
//       updateObject = {maxContactId: maxContactId};
//       nextId = maxContactId;
//       break;
//     default:
//       return -1;
//   }

//   Sequence.updateOne({_id: sequenceId}, {$set: updateObject})
//     .catch(err => {
//       console.log("nextId error = " + err);
//     });

//   return nextId;
// }

// module.exports = new SequenceGenerator();


