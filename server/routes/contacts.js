var express = require('express');
var router = express.Router();

const sequenceGenerator = require('./sequenceGenerator');
const Contact = require('../models/contact');
var express = require('express');
var router = express.Router();
module.exports = router;

// Method 1: Asynch Promise
// Uses asynchronous Promises with .then and .catch to handle the result and error
// of the find() operation. This approach is generally considered cleaner and more
// modern, allowing for easier management of asynchronous code flow. It also provides
// more detailed error handling for both the case where the contacts could not be found
// and general errors that may occur during the operation.
router.get('/', (req, res, next) => {
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

// Method 2: Callback Function
// uses a callback function as an argument to save(), with err and result as parameters
// A more traditional approach to handling asynchronous code is to use a callback function.
// router.get('/', (req, res, next) => {
//   // call the Contact model find() method to get all contacts in the collection
//   Contact.find()
//     .exec(function (err, contacts) {
//       if (err) {
//         return res.status(500).json({
//           title: 'An error occurred',
//           error: err
//         });
//       }
//       res.status(200).json({
//         message: 'Success',
//         obj: contacts
//       });
//     });
// });

// Method 1: Utilizes JavaScript Promises to handle asynchronous operations. After calling
// save() on the contact object, it chains .then() for success handling and .catch()
// for error handling. This approach is generally considered cleaner and more modern,
// allowing for easier management of asynchronous code flow.

router.post('/', (req, res, next) => {
  const maxContactId = sequenceGenerator.nextId("contacts");

  const contact = new Contact({
    id: maxContactId,
    name: req.body.name,
    description: req.body.description,
    url: req.body.url
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

// Method 2: Uses a callback function as an argument to save(), with err and result as parameters
// A more traditional approach to handling asynchronous code is to use a callback function.
// can lead to callback hell, where the code becomes difficult to read and maintain
// and to deeper nesting of callbacks. Avoid this by using promises or async/await.

// router.post('/', (req, res, next) => {
// // create a new Contact object and set the values of the properties
//   const maxContactId = sequenceGenerator.nextId("contacts");
//   const contact = new Contact({
//     id: maxContactId,
//     name: req.body.name,
//     description: req.body.description,
//     url: req.body.url
//   });
//   // call the Contact model save() method to save the new contact object to the collection
//   contact.save(function (err, result) {
//     // if there is an error, return an error message
//     if (err) {
//       return res.status(500).json({
//         title: 'An error occurred',
//         error: err
//       });
//     }
//     // if the contact was saved successfully, return a success message
//     res.status(201).json({
//       message: 'Saved contact',
//       obj: result
//     });
//   });
// });

// Method 1: : This method updates a single contact identified by id
// passed as a URL parameter (/:id). It first finds the contact using
// Contact.findOne({ id: req.params.id }), updates its properties
// (name, description, url) with the values received in the request
// body, and then uses Contact.updateOne() to apply these changes
// to the database.

// The first method provides detailed error handling for both the case
// where the contact could not be found (Contact not found.) and general
// errors that may occur during the update process. The second method only
// catches and handles errors that occur while retrieving contacts from
// the database.

// router.put('/:id', (req, res, next) => {
//   Contact.findOne({ id: req.params.id })
//     .then(contact => {
//       contact.name = req.body.name;
//       contact.description = req.body.description;
//       contact.url = req.body.url;

//       Contact.updateOne({ id: req.params.id }, contact)
//         .then(result => {
//           res.status(204).json({
//             message: 'Contact updated successfully'
//           })
//         })
//         .catch(error => {
//            res.status(500).json({
//            message: 'An error occurred',
//            error: error
//          });
//         });
//     })
//     .catch(error => {
//       res.status(500).json({
//         message: 'Contact not found.',
//         error: { contact: 'Contact not found'}
//       });
//     });
// });

// Method 2: this method retrieves all contacts in the collection using Contact.find(),
// updates the url property of each contact based on a pattern involving the contact's
// id, and saves each contact back to the database. This method essentially performs
// a bulk update operation where a specific property of all contacts is recalculated
// and updated.

// The first method is more efficient for updating a single contact, as it directly
// targets a contact by its id. The second method might be less efficient, especially
// for large collections, since it loads all contacts into memory, updates them, and
// then saves them back to the database.

// router.put('/', (req, res, next) => {
//   // call the Contact model find() method to get all contacts in the collection
//   Contact.find()
//     .exec(function (err, contacts) {
//       if (err) {
//         return res.status(500).json({
//           title: 'An error occurred',
//           error: err
//         });
//       }
//       // if the contact was found, set the values of the properties to the values in the request
//       for (var i = 0; i < contacts.length; i++) {
//         contacts[i].url = req.protocol + '://' + req.get('host') + '/contacts/' + contacts[i].id + '/view';
//         contacts[i].save();
//       }
//       // return a success message
//       res.status(200).json({
//         message: 'URLs updated',
//         obj: contacts
//       });
//     });
// });

// Method 3: This method uses the async/await pattern to handle asynchronous operations,
// combined with .findOneAndUpdate(). This approach is generally considered cleaner and
// more modern, allowing for easier management of asynchronous code flow. It also provides
// a more concise and readable way to handle asynchronous operations and error handling.
// It is more idiomatic and follows the common pattern for updating contacts in MongoDB
// with Mongoose. It is more consistent with the other CRUD operations, which typically
// use methods like .findOneAndUpdate(), .findOneAndReplace(), and .findOneAndDelete() to
// perform the operation in a single step. It is more expressive and clearly communicates
// the intent to find and update the contact in a single operation. It is more flexible
// and allows for additional options and features provided by the .findOneAndUpdate() method,
// such as the ability to return the updated contact or to specify additional query options.
// It is more maintainable and easier to modify because it encapsulates the entire operation
// in a single method call, making it easier to change or extend the behavior in the future.
// It is more consistent with the Mongoose API and the MongoDB Node.js driver, which provide
// similar methods for performing the operation in a single step. It is more aligned with the
// best practices and common patterns for working with MongoDB and Mongoose, which emphasize
// the use of atomic operations and single-step operations for CRUD operations.

// Atomicity: It ensures the operation is atomic within MongoDB, which means the contact
// is found and updated in a single step, reducing the risk of the contact being altered between
// separate find and update operations.

// Performance: Since it reduces the operation to a single query, it can improve performance
// by decreasing the round-trip time to the database.

// Simplicity: The code becomes more concise and easier to maintain, as you're handling the
// find and update logic in a single step.

// Built-in Handling of Non-existence: With findOneAndUpdate(), if no contact matches the
// query, you can immediately handle this case without needing an additional check to see if the
// contact exists.

// Return Value: findOneAndUpdate() can return the contact as it was before the update or after
// the update (based on the new option), providing flexibility depending on your needs.

// Switching to findOneAndUpdate for updates where you don't need to perform complex logic between
// finding and updating a contact is generally recommended for the reasons outlined above.

router.put('/:id', (req, res, next) => {
  const update = {
    name: req.body.name,
    description: req.body.description,
    url: req.body.url,
  };

  Contact.findOneAndUpdate({ id: req.params.id }, update, { new: true, useFindAndModify: false })
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

// - findOneAndUpdate is used with the { new: true } option, though since we're adhering to the practice
// of returning a 204 No Content for updates, the updated contact is not actually sent back in the
// response. If you wanted to return the updated contact, you could remove { new: true } or set it
// accordingly and adjust the response status and payload.
// - The response status code 204 is explicitly used after a successful update, reaffirming that the
// update was successful but no content is being returned.
// - A check is added to handle the case where the contact to update is not found, returning a 404 Not
// Found status code, which is more semantically appropriate than 500 Internal Server Error for this
// scenario.


// Method 1: The first function uses Contact.deleteOne({ id: req.params.id })
// directly after finding the contact with Contact.findOne({ id: req.params.id }).
// This approach first checks if the contact exists and then proceeds to delete it.
// However, it doesn't use the contact found by findOne directly in the deletion
// process; instead, it calls deleteOne again with the same condition.

// The first function returns a 204 No Content status upon successful deletion,
// which is semantically correct for DELETE operations where no content is being returned.

// The first function primarily uses Promises (then and catch) for asynchronous operation
// handling, which can lead to cleaner and more readable code, especially for complex
// chains of asynchronous operations.

// The first function does not explicitly check if the contact was actually found before
// attempting deletion. It assumes the contact exists if no error was thrown by findOne,
// and only provides an error response if the contact is not found due to an error in the
// catch block.

// router.delete("/:id", (req, res, next) => {
//   Contact.findOne({ id: req.params.id })
//     .then(contact => {
//       Contact.deleteOne({ id: req.params.id })
//         .then(result => {
//           res.status(204).json({
//             message: "Contact deleted successfully"
//           });
//         })
//         .catch(error => {
//            res.status(500).json({
//            message: 'An error occurred',
//            error: error
//          });
//         })
//     })
//     .catch(error => {
//       res.status(500).json({
//         message: 'Contact not found.',
//         error: { contact: 'Contact not found'}
//       });
//     });
// });

// Method 2: The second function uses Contact.findOneAndDelete({ id: req.params.id })
// The second function finds the contact using Contact.findOne({ id: req.params.id },
// function (err, contact) {...}), and if the contact is found, it calls the remove
// method on the found contact instance (contact.remove(function (err, result) {...})).
// This approach operates directly on the contact instance that was retrieved.

// The second function returns a 200 OK status and includes the result of the removal
// in the response. This approach might be useful if you want to confirm to the client
// what was deleted but is less common for RESTful DELETE operations where typically no
// content is returned.

// The second function uses callbacks for handling the asynchronous database operations.
// This can lead to more nested code (sometimes referred to as "callback hell"), especially
// as the complexity of operations increases, but it remains a common pattern, especially
// in older codebases or among developers more comfortable with this style.

// The second function explicitly checks if the contact exists (if (!contact) {...}) after
// the findOne operation and returns a specific error message if the contact is not found,
// which can provide clearer feedback to the client.

// router.delete('/:id', (req, res, next) => {
//   // find the contact by id
//   Contact.findOne({ id: req.params.id }, function (err, contact) {
//     // if there is an error, return an error message
//     if (err) {
//       return res.status(500).json({
//         title: 'An error occurred',
//         error: err
//       });
//     }
//     // if the contact is not found, return an error message
//     if (!contact) {
//       return res.status(500).json({
//         title: 'No Contact Found!',
//         error: { contact: 'Contact not found' }
//       });
//     }
//     // call the Contact model remove() method to remove the contact object from the collection
//     contact.remove(function (err, result) {
//       // if there is an error, return an error message
//       if (err) {
//         return res.status(500).json({
//           title: 'An error occurred',
//           error: err
//         });
//       }
//       // if the contact was removed successfully, return a success message
//       res.status(200).json({
//         message: 'Removed contact',
//         obj: result
//       });
//     });
//   });
// });

// Method 3: combination of async/await, try/catch to handle asynchronous operations
// and error handling. This approach is generally considered cleaner and more modern,
// combined with findOne() and then remove() to delete the contact.
// router.delete('/:id', (req, res, next) => {
//   Contact.findOne({ id: req.params.id }).exec()
//     .then(contact => {
//       if (!contact) {
//         throw new Error('Contact not found');
//       }
//       return contact.remove(); // Assuming remove() returns a promise
//     })
//     .then(result => {
//       res.status(204).json({
//         message: 'Removed contact',
//         obj: result
//       });
//     })
//     .catch(error => {
//       res.status(500).json({
//         title: 'An error occurred',
//         error: error.message || error
//       });
//     });
// });

// Method 4: Uses async/await to handle asynchronous operations and error handling,
// combined with .findOneAndDelete().Using .findOneAndDelete() instead of a combination
// of .findOne() followed by .remove() is indeed a more efficient and concise way to handle
// deletion in MongoDB with Mongoose. This method combines finding the contact and deleting
// it in a single operation, which has several advantages:
// - It is more efficient because it only requires one database operation instead of two.
// - It is more concise and easier to read and understand.
// - It is less error-prone because it reduces the potential for errors in handling the
//   contact instance and the removal operation.
// - It is more idiomatic and follows the common pattern for deletion in MongoDB with Mongoose.
// - It is more consistent with the other CRUD operations, which typically use methods like
//   .findOneAndUpdate(), .findOneAndReplace(), and .findOneAndDelete() to perform the
//   operation in a single step.
// - It is more expressive and clearly communicates the intent to find and delete the contact
//   in a single operation.
// - It is more flexible and allows for additional options and features provided by the
//   .findOneAndDelete() method, such as the ability to return the deleted contact or to
//   specify additional query options.
// - It is more maintainable and easier to modify because it encapsulates the entire operation
//   in a single method call, making it easier to change or extend the behavior in the future.
// - It is more consistent with the Mongoose API and the MongoDB Node.js driver, which provide
//   similar methods for performing the operation in a single step.
// - It is more aligned with the best practices and common patterns for working with MongoDB
//   and Mongoose, which emphasize the use of atomic operations and single-step operations
//   for CRUD operations.
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
  const update = {
    name: req.body.name,
    url: req.body.url,
    children: req.body.children,
  };

  Contact.findOneAndUpdate({ id: req.params.id }, update, { new: true, useFindAndModify: false })
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

