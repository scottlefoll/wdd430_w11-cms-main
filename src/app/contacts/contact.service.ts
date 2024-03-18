import { EventEmitter, Injectable } from "@angular/core";
import { Subject, Observable } from "rxjs";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { catchError, tap } from "rxjs";

import { Contact } from "./contact.model";
import { MessageService } from "../messages/message.service";
import { environment } from '../../environments/environment';
import { get } from "mongoose";

@Injectable({
  providedIn: 'root'
})

export class ContactService{
  contactSelectedEvent = new EventEmitter<Contact>();
  contactChangedEvent = new EventEmitter<Contact[]>();
  contactListChangedEvent = new Subject<Contact[]>();
  private editMode: boolean = false;
  private addMode: boolean = false;
  private maxContactId: number;
  private contactsLoaded: boolean = false;
  contacts: Contact[] = [];

  // Inject the HttpClient object into the DocumentService class through dependency injection.
  // The HttpClient object will be used to send HTTP requests to the server.
  constructor(private http: HttpClient, private messageService: MessageService) {}

  addContact(contact: Contact){
    if(!contact){
      return;
    }

    // make sure id of the new Document is empty
    contact.id = '';
    this.maxContactId = this.getMaxId();
    contact.id = String(this.maxContactId + 1);
    const headers = new HttpHeaders({'Content-Type': 'application/json'});

    // add to database
    this.http.post<{message: string, contact: Contact}>(`${environment.apiUrl}/contacts`, contact, {headers: headers})
      .subscribe(
        (responseData) => {
          // this.getContacts(); // Fetch the updated contacts list from the server
          // add new contact to to local contacts array
          this.contacts.push(responseData.contact);
          this.sortAndSend();
        }
      );
  }

  getContacts(forceReload: boolean = false) {
    if (!this.contactsLoaded || forceReload) {
      this.http.get<{contacts: Contact[]}>(`${environment.apiUrl}/contacts`)
        .subscribe(
          (response) => {
            this.contacts.length = 0;
            this.contacts.push(...response.contacts);
            this.maxContactId = this.getMaxId();
            this.sortAndSend();
            this.contactsLoaded = true;
          },
          (error: any) => {
            console.error(error);
          }
        );
      } else {
        // Contacts already loaded, emit the current state
        this.sortAndSend();
      }
  }

  getContact(id: string): Contact{
    if (!this.contacts) {
      this.getContacts();
    }
    for(let contact of this.contacts){
      if(contact.id === id){
        return contact;
      }
    }
    return null;
  }

  getName(id: string): string {
    if (!this.contacts) {
      this.getContacts();
    }
    for(let contact of this.contacts){
      if(contact.id === id){
        return contact.name;
      }
    }
    return null;
  }

  getEditMode(): boolean {
    return this.editMode;
  }

  setEditMode(value: boolean): void {
    this.editMode = value;
  }

  getAddMode(): boolean {
    return this.addMode;
  }

  setAddMode(value: boolean): void {
    this.addMode = value;
  }

  updateContact(originalContact: Contact, updatedContact: Contact){
    if(!originalContact || !updatedContact){
      console.error('Contact not found - update unsuccessful!');
      alert('Contact not found - update unsuccessfull!');
      return;
    }

    const pos = this.contacts.indexOf(originalContact);

    if(pos < 0){
      alert('Contact not found - update unsuccessfull!');
      console.error('Contact not found - update unsuccessful!');
      return;
    }

    // Initialize originalContact.group as an empty array if it's null or undefined
    originalContact.group = originalContact.group || [];
    updatedContact.id = originalContact.id;
    const headers = new HttpHeaders({'Content-Type': 'application/json'});

    // Update the database
    this.http.put(`${environment.apiUrl}/contacts/${originalContact.id}`, updatedContact, {headers: headers})
      .subscribe(
        (response) => {
          // this.getContacts(); // Fetch the updated contacts list from the server
          this.contacts[pos] = updatedContact;
          this.sortAndSend();
        }
      );
  }

  deleteContact(contact: Contact) {
    if (!contact) {
      alert('Contact not found - deletion unsuccessfull!');
      console.error('Contact not found - deletion unsuccessful!');
      return;
    }
    const pos = this.contacts.indexOf(contact);
    if (pos < 0) {
      alert('Contact not found - deletion unsuccessfull!');
      console.error('Contact not found - deletion unsuccessful!');
      return;
    }
    this.messageService.deleteMessages(contact.id);

    // delete from database
    this.http.delete(`${environment.apiUrl}/contacts/${contact.id}`)
      .subscribe(
        (response) => {
          // this.getContacts(); // Fetch the updated contacts list from the server
          this.contacts.splice(pos, 1);
          this.sortAndSend();
        }
      );
  }

  sortAndSend() {
    this.contacts.sort((a, b) => a.name.localeCompare(b.name));
    this.contactListChangedEvent.next(this.contacts.slice());
  }

  getMaxId(): number {
    let maxId = 0;
    for (let contact of this.contacts) {
      let currentId = parseInt(contact.id);
      if (currentId > maxId) {
        maxId = currentId;
      }
    }
    return maxId;
  }

}


