const sequenceGenerator = require('./sequenceGenerator');
const Document = require('../models/document');
var express = require('express');
var router = express.Router();
module.exports = router;

// Method 1: Async Promise
router.get('/', (req, res, next) => {
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

// Method 2: callback function
// router.get('/', (req, res, next) => {
//   // call the Document model find() method to get all documents in the collection
//   Document.find()
//     .exec(function (err, documents) {
//       if (err) {
//         return res.status(500).json({
//           title: 'An error occurred',
//           error: err
//         });
//       }
//       res.status(200).json({
//         message: 'Success',
//         obj: documents
//       });
//     });
// });


// Method 1: Utilizes JavaScript Promises to handle asynchronous operations. After calling
// save() on the document object, it chains .then() for success handling and .catch()
// for error handling. This approach is generally considered cleaner and more modern,
// allowing for easier management of asynchronous code flow.

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

// Method 2: Uses a callback function as an argument to save(), with err and result as parameters
// A more traditional approach to handling asynchronous code is to use a callback function.
// can lead to callback hell, where the code becomes difficult to read and maintain
// and to deeper nesting of callbacks. Avoid this by using promises or async/await.

// router.post('/', (req, res, next) => {
// // create a new Document object and set the values of the properties
//   const maxDocumentId = sequenceGenerator.nextId("documents");
//   const document = new Document({
//     id: maxDocumentId,
//     name: req.body.name,
//     description: req.body.description,
//     url: req.body.url
//   });
//   // call the Document model save() method to save the new document object to the collection
//   document.save(function (err, result) {
//     // if there is an error, return an error message
//     if (err) {
//       return res.status(500).json({
//         title: 'An error occurred',
//         error: err
//       });
//     }
//     // if the document was saved successfully, return a success message
//     res.status(201).json({
//       message: 'Saved document',
//       obj: result
//     });
//   });
// });

// Method 1: : This method updates a single document identified by id
// passed as a URL parameter (/:id). It first finds the document using
// Document.findOne({ id: req.params.id }), updates its properties
// (name, description, url) with the values received in the request
// body, and then uses Document.updateOne() to apply these changes
// to the database.

// The first method provides detailed error handling for both the case
// where the document could not be found (Document not found.) and general
// errors that may occur during the update process. The second method only
// catches and handles errors that occur while retrieving documents from
// the database.

// router.put('/:id', (req, res, next) => {
//   Document.findOne({ id: req.params.id })
//     .then(document => {
//       document.name = req.body.name;
//       document.description = req.body.description;
//       document.url = req.body.url;

//       Document.updateOne({ id: req.params.id }, document)
//         .then(result => {
//           res.status(204).json({
//             message: 'Document updated successfully'
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
//         message: 'Document not found.',
//         error: { document: 'Document not found'}
//       });
//     });
// });

// Method 2: this method retrieves all documents in the collection using Document.find(),
// updates the url property of each document based on a pattern involving the document's
// id, and saves each document back to the database. This method essentially performs
// a bulk update operation where a specific property of all documents is recalculated
// and updated.

// The first method is more efficient for updating a single document, as it directly
// targets a document by its id. The second method might be less efficient, especially
// for large collections, since it loads all documents into memory, updates them, and
// then saves them back to the database.

// router.put('/', (req, res, next) => {
//   // call the Document model find() method to get all documents in the collection
//   Document.find()
//     .exec(function (err, documents) {
//       if (err) {
//         return res.status(500).json({
//           title: 'An error occurred',
//           error: err
//         });
//       }
//       // if the document was found, set the values of the properties to the values in the request
//       for (var i = 0; i < documents.length; i++) {
//         documents[i].url = req.protocol + '://' + req.get('host') + '/documents/' + documents[i].id + '/view';
//         documents[i].save();
//       }
//       // return a success message
//       res.status(200).json({
//         message: 'URLs updated',
//         obj: documents
//       });
//     });
// });

// Method 3: This method uses the async/await pattern to handle asynchronous operations,
// combined with .findOneAndUpdate(). This approach is generally considered cleaner and
// more modern, allowing for easier management of asynchronous code flow. It also provides
// a more concise and readable way to handle asynchronous operations and error handling.
// It is more idiomatic and follows the common pattern for updating documents in MongoDB
// with Mongoose. It is more consistent with the other CRUD operations, which typically
// use methods like .findOneAndUpdate(), .findOneAndReplace(), and .findOneAndDelete() to
// perform the operation in a single step. It is more expressive and clearly communicates
// the intent to find and update the document in a single operation. It is more flexible
// and allows for additional options and features provided by the .findOneAndUpdate() method,
// such as the ability to return the updated document or to specify additional query options.
// It is more maintainable and easier to modify because it encapsulates the entire operation
// in a single method call, making it easier to change or extend the behavior in the future.
// It is more consistent with the Mongoose API and the MongoDB Node.js driver, which provide
// similar methods for performing the operation in a single step. It is more aligned with the
// best practices and common patterns for working with MongoDB and Mongoose, which emphasize
// the use of atomic operations and single-step operations for CRUD operations.

// Atomicity: It ensures the operation is atomic within MongoDB, which means the document
// is found and updated in a single step, reducing the risk of the document being altered between
// separate find and update operations.

// Performance: Since it reduces the operation to a single query, it can improve performance
// by decreasing the round-trip time to the database.

// Simplicity: The code becomes more concise and easier to maintain, as you're handling the
// find and update logic in a single step.

// Built-in Handling of Non-existence: With findOneAndUpdate(), if no document matches the
// query, you can immediately handle this case without needing an additional check to see if the
// document exists.

// Return Value: findOneAndUpdate() can return the document as it was before the update or after
// the update (based on the new option), providing flexibility depending on your needs.

// Switching to findOneAndUpdate for updates where you don't need to perform complex logic between
// finding and updating a document is generally recommended for the reasons outlined above.

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

// - findOneAndUpdate is used with the { new: true } option, though since we're adhering to the practice
// of returning a 204 No Content for updates, the updated document is not actually sent back in the
// response. If you wanted to return the updated document, you could remove { new: true } or set it
// accordingly and adjust the response status and payload.
// - The response status code 204 is explicitly used after a successful update, reaffirming that the
// update was successful but no content is being returned.
// - A check is added to handle the case where the document to update is not found, returning a 404 Not
// Found status code, which is more semantically appropriate than 500 Internal Server Error for this
// scenario.


// Method 1: The first function uses Document.deleteOne({ id: req.params.id })
// directly after finding the document with Document.findOne({ id: req.params.id }).
// This approach first checks if the document exists and then proceeds to delete it.
// However, it doesn't use the document found by findOne directly in the deletion
// process; instead, it calls deleteOne again with the same condition.

// The first function returns a 204 No Content status upon successful deletion,
// which is semantically correct for DELETE operations where no content is being returned.

// The first function primarily uses Promises (then and catch) for asynchronous operation
// handling, which can lead to cleaner and more readable code, especially for complex
// chains of asynchronous operations.

// The first function does not explicitly check if the document was actually found before
// attempting deletion. It assumes the document exists if no error was thrown by findOne,
// and only provides an error response if the document is not found due to an error in the
// catch block.

// router.delete("/:id", (req, res, next) => {
//   Document.findOne({ id: req.params.id })
//     .then(document => {
//       Document.deleteOne({ id: req.params.id })
//         .then(result => {
//           res.status(204).json({
//             message: "Document deleted successfully"
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
//         message: 'Document not found.',
//         error: { document: 'Document not found'}
//       });
//     });
// });

// Method 2: The second function uses Document.findOneAndDelete({ id: req.params.id })
// The second function finds the document using Document.findOne({ id: req.params.id },
// function (err, document) {...}), and if the document is found, it calls the remove
// method on the found document instance (document.remove(function (err, result) {...})).
// This approach operates directly on the document instance that was retrieved.

// The second function returns a 200 OK status and includes the result of the removal
// in the response. This approach might be useful if you want to confirm to the client
// what was deleted but is less common for RESTful DELETE operations where typically no
// content is returned.

// The second function uses callbacks for handling the asynchronous database operations.
// This can lead to more nested code (sometimes referred to as "callback hell"), especially
// as the complexity of operations increases, but it remains a common pattern, especially
// in older codebases or among developers more comfortable with this style.

// The second function explicitly checks if the document exists (if (!document) {...}) after
// the findOne operation and returns a specific error message if the document is not found,
// which can provide clearer feedback to the client.

// router.delete('/:id', (req, res, next) => {
//   // find the document by id
//   Document.findOne({ id: req.params.id }, function (err, document) {
//     // if there is an error, return an error message
//     if (err) {
//       return res.status(500).json({
//         title: 'An error occurred',
//         error: err
//       });
//     }
//     // if the document is not found, return an error message
//     if (!document) {
//       return res.status(500).json({
//         title: 'No Document Found!',
//         error: { document: 'Document not found' }
//       });
//     }
//     // call the Document model remove() method to remove the document object from the collection
//     document.remove(function (err, result) {
//       // if there is an error, return an error message
//       if (err) {
//         return res.status(500).json({
//           title: 'An error occurred',
//           error: err
//         });
//       }
//       // if the document was removed successfully, return a success message
//       res.status(200).json({
//         message: 'Removed document',
//         obj: result
//       });
//     });
//   });
// });

// Method 3: combination of async/await, try/catch to handle asynchronous operations
// and error handling. This approach is generally considered cleaner and more modern,
// combined with findOne() and then remove() to delete the document.
// router.delete('/:id', (req, res, next) => {
//   Document.findOne({ id: req.params.id }).exec()
//     .then(document => {
//       if (!document) {
//         throw new Error('Document not found');
//       }
//       return document.remove(); // Assuming remove() returns a promise
//     })
//     .then(result => {
//       res.status(204).json({
//         message: 'Removed document',
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
// deletion in MongoDB with Mongoose. This method combines finding the document and deleting
// it in a single operation, which has several advantages:
// - It is more efficient because it only requires one database operation instead of two.
// - It is more concise and easier to read and understand.
// - It is less error-prone because it reduces the potential for errors in handling the
//   document instance and the removal operation.
// - It is more idiomatic and follows the common pattern for deletion in MongoDB with Mongoose.
// - It is more consistent with the other CRUD operations, which typically use methods like
//   .findOneAndUpdate(), .findOneAndReplace(), and .findOneAndDelete() to perform the
//   operation in a single step.
// - It is more expressive and clearly communicates the intent to find and delete the document
//   in a single operation.
// - It is more flexible and allows for additional options and features provided by the
//   .findOneAndDelete() method, such as the ability to return the deleted document or to
//   specify additional query options.
// - It is more maintainable and easier to modify because it encapsulates the entire operation
//   in a single method call, making it easier to change or extend the behavior in the future.
// - It is more consistent with the Mongoose API and the MongoDB Node.js driver, which provide
//   similar methods for performing the operation in a single step.
// - It is more aligned with the best practices and common patterns for working with MongoDB
//   and Mongoose, which emphasize the use of atomic operations and single-step operations
//   for CRUD operations.
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
