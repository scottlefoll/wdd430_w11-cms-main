var express = require('express');
var router = express.Router();

const sequenceGenerator = require('./sequenceGenerator');
const Contact = require('../models/contact');

router.get('/', (req, res, next) => {
  console.log('get contacts');
  Contact.find()
    .populate('group')
    .then(contacts => {
      res.status(200).json({
          message: 'Contacts fetched successfully!',
          contacts: contacts
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
  const maxContactId = sequenceGenerator.nextId("contacts");

  const contact = new Contact({
    id: req.body.id,
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    imageUrl: req.body.imageUrl,
    group: req.body.group
  });

  contact.save()
    .then(createdContact => {
      res.status(201).json({
        message: 'Contact added successfully',
        contact: createdContact
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
  Contact.findOneAndUpdate({ id: req.params.id }, req.body, { new: true })
    .then(updatedContact => {
      if (!updatedContact) {
        return res.status(404).json({
          message: 'Contact not found',
        });
      }
      res.status(204).json({
        message: 'Contact updated successfully'
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
  Contact.findOneAndDelete({ id: req.params.id })
    .then(result => {
      if (!result) {
        return res.status(500).json({
          message: 'Contact not found',
        });
      }
      res.status(204).json({
        message: 'Removed contact',
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

  Contact.findOneAndUpdate({ id: req.params.id }, req.body, { new: true, useFindAndModify: false })
    .then(updatedContact => {
      if (!updatedContact) {
        return res.status(404).json({
          title: 'No Contact Found!',
          error: { contact: 'Contact not found' }
        });
      }
      res.status(200).json({
        message: 'Updated contact',
        obj: updatedContact
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

