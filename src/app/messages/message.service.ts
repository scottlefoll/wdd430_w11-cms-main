import { EventEmitter, Injectable } from "@angular/core";
import { Subject, of, forkJoin } from "rxjs";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { catchError } from 'rxjs/operators';

import { Message } from "./message.model";
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class MessageService{
  messageSelectedEvent = new EventEmitter<Message>();
  messageChangedEvent = new EventEmitter<Message[]>();
  messageListChangedEvent = new Subject<Message[]>();
  private editMode: boolean = false;
  private addMode: boolean = false;
  maxMessageId: number;
  messages: Message[] = [];

  constructor(private http: HttpClient) {}

  addMessage(updatedMessage: Message) {
    if (!updatedMessage) {
      return;
    }

    this.maxMessageId = this.getMaxId();
    updatedMessage.id = String(this.maxMessageId + 1);
    const headers = new HttpHeaders({'Content-Type': 'application/json'});

    // add to database
    this.http.post<{message: string, updatedMessage: Message}>(`${environment.apiUrl}/messages`, updatedMessage, {headers: headers})
      .subscribe(
        (responseData) => {
          // add new contact to to local contacts array
          this.messages.push(updatedMessage);
          this.sortAndSend();
        }
      );
  }

  getMessages() {
    this.http.get<{messages: Message[]}>(`${environment.apiUrl}/messages`)
      .subscribe(
        (response) => {
          this.messages = [...response.messages];
          this.maxMessageId = this.getMaxId();
          this.sortAndSend();
        },
        (error: any) => {
          console.error(error);
        }
      );
  }

  getMessage(id: string): Message{
    for(let message of this.messages){
      if(message.id === id){
        return message;
      }
    }
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

  updateMessage(originalMessage: Message, updatedMessage: Message){
    if(!originalMessage || !updatedMessage){
      console.error('Message not found - update unsuccessful!');
      alert('Message not found - update unsuccessfull!');
      return;
    }

    // const foundMessage = this.messages.find(doc => doc.id === originalMessage.id);
    const pos = this.messages.findIndex(d => d.id === originalMessage.id);

    if (pos < 0) {
      console.error('Message not found - update unsuccessful!');
      alert('Message not found - update unsuccessfull!');
      return;
    }

    // set the id of the new Document to the id of the old Document
    updatedMessage.id = originalMessage.id;
    const headers = new HttpHeaders({'Content-Type': 'application/json'});

    // update database
    this.http.put(`${environment.apiUrl}/messages/${originalMessage.id}`, updatedMessage, {headers: headers})
      .subscribe(
        (response) => {
          this.messages[pos] = updatedMessage;
          this.sortAndSend();
        }
      );
  }

  deleteMessage(message: Message) {
    if (!message) {
      console.error('Message not found - deletion unsuccessful!');
      alert('Message not found - deletion unsuccessfull!');
      return;
    }
    const pos = this.messages.indexOf(message);
    if (pos < 0) {
      console.error('Message not found - deletion unsuccessful!');
      alert('Message not found - deletion unsuccessfull!');
      return;
    }

    // delete from database
    this.http.delete(`${environment.apiUrl}/messsages/${message.id}`)
      .subscribe(
        (response) => {
          this.messages.splice(pos, 1);
          this.sortAndSend();
        }
      );
  }

  deleteMessages(senderId: string) {
    console.log("Deleting messages from sender: ", senderId);
    console.log("Initial messages list:", this.messages);

    // Collect observables for all delete requests
    const deleteRequests = this.messages
      .filter(message => message.sender === senderId)
      .map(message => {
        console.log(`Preparing to delete message with ID: ${message.id} from sender: ${senderId}`);
        return this.http.delete(`${environment.apiUrl}/messages/${message.id}`).pipe(
          catchError(error => {
            console.error('Error deleting message with ID:', message.id, error);
            return of(null); // Handle error but allow other requests to continue
          })
        );
      });

    // Execute all delete requests and wait for them to complete
    forkJoin(deleteRequests).subscribe(results => {
      console.log("Delete requests completed. Results:", results);

      // Calculate and log which messages were supposed to be deleted
      const messagesToDelete = this.messages.filter(message => message.sender === senderId).map(m => m.id);
      console.log("Messages IDs expected to delete:", messagesToDelete);

      // Filter out successfully deleted messages from the local state
      this.messages = this.messages.filter(message => message.sender !== senderId);

      console.log("Updated messages list after deletion:", this.messages);
      this.sortAndSend();
    });
  }

  sortAndSend() {
    this.messages.sort((a, b) => a.id.localeCompare(b.id));
    this.messageListChangedEvent.next(this.messages.slice());
  }

  getMaxId(): number {
    let maxId = 0;
    for (let message of this.messages) {
      let currentId = parseInt(message.id);
      if (currentId > maxId) {
        maxId = currentId;
      }
    }
    return maxId;
  }


}


