const sequenceGenerator = require('./sequenceGenerator');
const Document = require('../models/document');
var express = require('express');
var router = express.Router();
module.exports = router;

// Method 1: Async Promise
router.get('/', (req, res, next) => {
  console.log('GET /documents');
  Document.find()
    .then(documents => {
      res.status(200).json({
          message: 'Documents fetched successfully!',
          documents: documents
        });
    })
    .catch(error => {
      res.status(500).json({
        message: 'An error occurred',
        error: error
      });
    });
});

router.post('/', (req, res, next) => {
  const maxDocumentId = sequenceGenerator.nextId("documents");

  const document = new Document({
    id: maxDocumentId,
    name: req.body.name,
    description: req.body.description,
    url: req.body.url
  });

  document.save()
    .then(createdDocument => {
      res.status(201).json({
        message: 'Document added successfully',
        document: createdDocument
      });
    })
    .catch(error => {
       res.status(500).json({
          message: 'An error occurred',
          error: error
        });
    });
});

router.put('/:id', (req, res, next) => {
  const update = {
    name: req.body.name,
    description: req.body.description,
    url: req.body.url,
  };

  Document.findOneAndUpdate({ id: req.params.id }, update, { new: true, useFindAndModify: false })
    .then(updatedDocument => {
      if (!updatedDocument) {
        return res.status(404).json({
          message: 'Document not found',
        });
      }
      res.status(204).json({
        message: 'Document updated successfully'
      });
    })
    .catch(error => {
      res.status(500).json({
        message: 'An error occurred',
        error: error
      });
    });
});

router.delete('/:id', (req, res, next) => {
  Document.findOneAndDelete({ id: req.params.id })
    .then(result => {
      if (!result) {
        return res.status(500).json({
          message: 'Document not found',
        });
      }
      res.status(204).json({
        message: 'Removed document',
        obj: result
      });
    })
    .catch(error => {
      res.status(500).json({
        title: 'An error occurred',
        error: error.message || error
      });
    });
});

router.patch('/:id', (req, res, next) => {
  const update = {
    name: req.body.name,
    url: req.body.url,
    children: req.body.children,
  };

  Document.findOneAndUpdate({ id: req.params.id }, update, { new: true, useFindAndModify: false })
    .then(updatedDocument => {
      if (!updatedDocument) {
        return res.status(404).json({
          title: 'No Document Found!',
          error: { document: 'Document not found' }
        });
      }
      res.status(200).json({
        message: 'Updated document',
        obj: updatedDocument
      });
    })
    .catch(error => {
      res.status(500).json({
        title: 'An error occurred',
        error: error
      });
    });
});

module.exports = router;
