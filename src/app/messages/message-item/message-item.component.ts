import { Component, Input, OnInit } from '@angular/core';
import { Message } from '../message.model';
// import { MessageService } from '../message.service';
import { ContactService } from '../../contacts/contact.service';
import { Contact } from '../../contacts/contact.model';

@Component({
  selector: 'cms-message-item',
  templateUrl: './message-item.component.html',
  styleUrls: ['./message-item.component.css']
})
export class MessageItemComponent {
  @Input() message: Message;
  senderName: string;
  constructor(private contactService: ContactService) { }

  ngOnInit() {
    this.senderName = this.contactService.getName(this.message.sender);
  }

}
