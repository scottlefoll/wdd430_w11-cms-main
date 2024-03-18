import { EventEmitter, Injectable } from "@angular/core";
import { Subject, of } from "rxjs";
import { HttpClient, HttpHeaders } from "@angular/common/http";

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

    updatedMessage.id = '';
    this.maxMessageId = this.getMaxId();
    updatedMessage.id = String(this.maxMessageId + 1);
    const headers = new HttpHeaders({'Content-Type': 'application/json'});

    // add to database
    this.http.post<{message: string, updatedMessage: Message}>(`${environment.localUrl}/messages`, updatedMessage, {headers: headers})
      .subscribe(
        (responseData) => {
          // add new contact to to local contacts array
          this.messages.push(responseData.updatedMessage);
          this.sortAndSend();
        }
      );
  }

  getMessages() {
    this.http.get<{messages: Message[]}>(`${environment.localUrl}/messages`)
      .subscribe(
        (response) => {
          this.messages = [...response.messages];
          this.maxMessageId = this.getMaxId();
          console.log("getMessages: ", this.messages);
          // Log each message and its sender
          this.messages.forEach(message => {
            console.log("Message:", message, "Sender:", message.sender);
          });
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
    this.http.put(`${environment.localUrl}/messages/${originalMessage.id}`, updatedMessage, {headers: headers})
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
    this.http.delete(`${environment.localUrl}/contacts/${message.id}`)
      .subscribe(
        (response) => {
          this.messages.splice(pos, 1);
          this.sortAndSend();
        }
      );
  }

  deleteMessages(senderId: string) {
    for (let i = this.messages.length - 1; i >= 0; i--) {
      if (this.messages[i].sender === senderId) {
        // delete from database
        this.http.delete(`${environment.localUrl}/contacts/${this.messages[i].id}`)
        this.messages.splice(i, 1);
      }
        this.sortAndSend();
    }
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


