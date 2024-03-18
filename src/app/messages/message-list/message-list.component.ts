import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router} from '@angular/router';
import { Subscription } from 'rxjs';

import { Message } from '../message.model';
import { MessageItemComponent } from '../message-item/message-item.component';
import { MessageService } from '../message.service';
import { ContactService } from '../../contacts/contact.service';

// declare a message property to store the form values
message: Message;

@Component({
  selector: 'cms-message-list',
  templateUrl: './message-list.component.html',
  styleUrls: ['./message-list.component.css']
})
export class MessageListComponent implements OnInit {
  messages: Message[] = [];
  message: string;
  subscription: Subscription;

  constructor(private messageService: MessageService,
              private contactService: ContactService,
              private router: Router,
              private route: ActivatedRoute) { }

  ngOnInit() {
    this.messageService.getMessages();
    this.contactService.getContacts();
    this.messageService.messageChangedEvent
      .subscribe(
      (messages: Message[]) => {
        this.messages = messages;
      }
    );

    this.subscription = this.messageService.messageListChangedEvent
    .subscribe(
      (messagesList: Message[]) => {
        this.messages = messagesList;
      }
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  onNewDocument(){
    this.router.navigate(['new'], {relativeTo: this.route});
  }

  isEditMode(): boolean {
    return this.messageService.getEditMode();
  }

  isAddMode(): boolean {
    return this.messageService.getEditMode();
  }

}
