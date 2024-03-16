var express = require('express');
var router = express.Router();

const sequenceGenerator = require('./sequenceGenerator');
const Message = require('../models/message');
var express = require('express');
var router = express.Router();

// Method 1: Async Promise
router.get('/', (req, res, next) => {
  console.log('get messages');
  Message.find()
    .then(messages => {
      res.status(200).json({
          message: 'Messages fetched successfully!',
          messages: messages
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
  const maxMessageId = sequenceGenerator.nextId("messages");

  const message = new Message({
    id: maxMessageId,
    name: req.body.name,
    description: req.body.description,
    url: req.body.url
  });

  message.save()
    .then(createdMessage => {
      res.status(201).json({
        message: 'Message added successfully',
        message: createdMessage
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

  Message.findOneAndUpdate({ id: req.params.id }, update, { new: true, useFindAndModify: false })
    .then(updatedMessage => {
      if (!updatedMessage) {
        return res.status(404).json({
          message: 'Message not found',
        });
      }
      res.status(204).json({
        message: 'Message updated successfully'
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
  Message.findOneAndDelete({ id: req.params.id })
    .then(result => {
      if (!result) {
        return res.status(500).json({
          message: 'Message not found',
        });
      }
      res.status(204).json({
        message: 'Removed message',
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

  Message.findOneAndUpdate({ id: req.params.id }, update, { new: true, useFindAndModify: false })
    .then(updatedMessage => {
      if (!updatedMessage) {
        return res.status(404).json({
          title: 'No Message Found!',
          error: { message: 'Message not found' }
        });
      }
      res.status(200).json({
        message: 'Updated message',
        obj: updatedMessage
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

