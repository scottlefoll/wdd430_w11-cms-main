import { EventEmitter, Injectable } from "@angular/core";
import { Subject, of } from "rxjs";
import { HttpClient, HttpHeaders } from "@angular/common/http";

import { Document } from "./document.model";
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class DocumentService{
  documentSelectedEvent = new EventEmitter<Document>();
  documentChangedEvent = new EventEmitter<Document[]>();
  documentListChangedEvent = new Subject<Document[]>();
  private editMode: boolean = false;
  private addMode: boolean = false;
  maxDocumentId: number;
  documents: Document[] = [];

  constructor(private http: HttpClient) {}

  addDocument(document: Document){
    if(!document){
      return;
    }

    document.id = '';
    this.maxDocumentId = this.getMaxId();
    document.id = String(this.maxDocumentId + 1);
    const headers = new HttpHeaders({'Content-Type': 'application/json'});

    // add to database
    this.http.post<{message: string, document: Document}>(`${environment.api2Url}/documents`, document, {headers: headers})
      .subscribe(
        (responseData) => {
          // add new contact to to local contacts array
          this.documents.push(responseData.document);
          this.sortAndSend();
        }
      );
  }

  getDocuments() {
    this.http.get<{documents: Document[]}>(`${environment.api2Url}/documents`)
      .subscribe(
        (response) => {
          this.documents = [...response.documents];
          this.maxDocumentId = this.getMaxId();
          this.sortAndSend();
        },
        (error: any) => {
          console.error(error);
        }
      );
  }

  getDocument(id: string): Document{
    for(let document of this.documents){
      if(document.id === id){
        return document;
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

  updateDocument(originalDocument: Document, updatedDocument: Document) {
    if (!originalDocument || !updatedDocument) {
      console.error('Message not found - update unsuccessful!');
      alert('Message not found - update unsuccessfull!');
      return;
    }

    const pos = this.documents.findIndex(d => d.id === originalDocument.id);

    if (pos < 0) {
      console.error('Document not found - update unsuccessful!');
      alert('Document not found - update unsuccessfull!');
      return;
    }

    updatedDocument.id = originalDocument.id;
    const headers = new HttpHeaders({'Content-Type': 'application/json'});

    // update database
    this.http.put(`${environment.api2Url}/documents/${originalDocument.id}`, updatedDocument, {headers: headers})
      .subscribe(
        (response) => {
          this.documents[pos] = updatedDocument;
          this.sortAndSend();
        }
      );
  }

  deleteDocument(document: Document) {
    if (!document) {
      console.error('Document not found - update unsuccessful!');
      alert('Document not found - deletion unsuccessfull!');
      return;
    }
    const pos = this.documents.indexOf(document);
    if (pos < 0) {
      console.error('Document not found - update unsuccessful!');
      alert('Document not found - deletion unsuccessfull!');
      return;
    }
    this.documents.splice(pos, 1);
    this.sortAndSend();
  }

  sortAndSend() {
    this.documents.sort((a, b) => a.name.localeCompare(b.name));
    this.documentListChangedEvent.next(this.documents.slice());
  }

  getMaxId(): number {
    let maxId = 0;
    for (let document of this.documents) {
      let currentId = parseInt(document.id);
      if (currentId > maxId) {
        maxId = currentId;
      }
    }
    return maxId;
  }

}
