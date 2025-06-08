import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { AuthService, UserStatus } from './auth.service';
import { HttpClient, HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { SafePipe } from './safe.pipe';
import { FormsModule } from '@angular/forms';
import { MessageModel } from '../models/message.model';
import { RasaModel } from '../models/rasa.model';
import { WebService } from './web.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink,NgIf,HttpClientModule,SafePipe,NgFor,FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'interakcijaProjekat';
  year = new Date().getFullYear()

  webService = WebService.getInstance()

  waitingForResponse = false
  botThinkingPlaceholder = 'Thinking...'
  isChatVisible = false
  userMessage: string = ''
  messages: MessageModel[] = []

  // ViewChild to access the chat-body element directly
  @ViewChild('chatBody', { static: false }) chatBody: ElementRef | undefined;

 public authService: AuthService

  constructor( private router: Router) {
    this.authService =AuthService.getInstance()
  }

  ngOnInit() {
    this.logUserStatus();
  }

  logUserStatus() {
    const status: UserStatus = this.authService.getUserStatus();
    console.log('Trenutni status korisnika je:', status);
  }

  get profileOrLoginLink(): string {
    return this.authService.isLoggedIn() ? '/profile' : '/login';
  }

  goToProfileOrLogin() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/profile']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  ngAfterViewChecked(): void {
    // Scroll to bottom after view has been updated
    if (this.chatBody) {
      this.chatBody.nativeElement.scrollTop = this.chatBody.nativeElement.scrollHeight;
    }
  }

  toggleChat() {
    this.isChatVisible = !this.isChatVisible;
  }

  pushMessage(message: MessageModel) {
    if (message.type == 'bot' && message.text == this.botThinkingPlaceholder)
      this.waitingForResponse = true

    if (message.type == 'bot' && message.text != this.botThinkingPlaceholder) {
      // Try to find the thinking placeholder message
      for (let m of this.messages) {
        if (m.type == 'bot' && m.text == this.botThinkingPlaceholder) {
          m.text = message.text
          this.waitingForResponse = false
          return
        }
      }
    }

    this.messages.push(message);
    // Save messages in local storage
    localStorage.setItem('messages', JSON.stringify(this.messages));
  }

   
  sendMessage() {
    // wating for response, user can't send new messages
    if (this.waitingForResponse) return

    if (this.userMessage.trim()) {
      const trimmedInput = this.userMessage;
      // Reset user input
      this.userMessage = '';

      this.pushMessage({ type: 'user', text: trimmedInput });
      this.pushMessage({ type: 'bot', text: this.botThinkingPlaceholder })
      this.webService.sendRasaMessage(trimmedInput)
        .subscribe((rsp: RasaModel[]) => {
          console.log('Rasa response:', rsp);
          if (rsp.length == 0) {
            this.pushMessage({
              type: 'bot',
              text: 'Sorry I did not understand your question.'
            });
            return;
          }

          rsp.map(msg => {
            // Handle bot message (including images, flight cards, etc.)
            if (msg.image) {
              return `<img src="${msg.image}" width="200">`;
            }
            if (msg.attachment) {
              let html = '';
              //promeni imena funkcija da prikazuje slike tvojih zivotinja
              for (const item of msg.attachment) {
                html += `
                  <div class="card card-chat">
                
                    <img src="${this.webService.getPetImg(item)}" class="card-img-top" alt="${item.name}">
                    <div class="card-body">
                      <h3 class="card-title">${item.name}</h3>
                       <p class="card-text">Cena: ${item.price} RSD</p>
                    </div>
                    <div class="card-body">
                      <a class="btn btn-primary" href="/pet/${item.id}">
                        <i class="fa-solid fa-up-right-from-square"></i> Details
                      </a>
                      <a class="btn btn-success ms-1" href="/all">
                        <i class="fa-solid fa-magnifying-glass"></i> Browse All
                      </a>
                    </div>
                  </div>
                `;
              }
              return html;
            }
            return msg.text;
          })
            .forEach(msg => {
              this.pushMessage({
                type: 'bot',
                text: msg!
              });
            });
        },
          (err: HttpErrorResponse) => {
             console.log('Rasa error:', err);
            this.pushMessage({
              type: 'bot',
              text: 'Sorry, I am not available at the moment.'
            });
          });
    }
  }
}

