import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MessageModel } from '../models/message.model';
import { RasaModel } from '../models/rasa.model';
import { WebService, UserStatus } from './web.service';
import { CartService } from './basket.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, NgIf, HttpClientModule, NgFor, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'interakcijaProjekat';
  year = new Date().getFullYear()

  webService = WebService.getInstance()

  waitingForResponse = false
  botThinkingPlaceholder = 'Thinking...'
  isChatVisible = false
  greeted = false
  userMessage: string = ''
  messages: MessageModel[] = []

  // ViewChild to access the chat-body element directly
  @ViewChild('chatBody', { static: false }) chatBody: ElementRef | undefined;


  constructor(private router: Router, private cartService: CartService) {
  }

  ngOnInit() {
    this.logUserStatus();
  }

  logUserStatus() {
    const status: UserStatus = this.webService.getUserStatus();
    console.log('Trenutni status korisnika je:', status);
  }

  get profileOrLoginLink(): string {
    return this.webService.isLoggedIn() ? '/profile' : '/login';
  }

  goToProfileOrLogin() {
    if (this.webService.isLoggedIn()) {
      this.router.navigate(['/profile']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  logout(): void {
    this.webService.logout();
    this.router.navigate(['/']);
  }

  ngAfterViewChecked(): void {

    if (this.chatBody) {
      this.chatBody.nativeElement.scrollTop = this.chatBody.nativeElement.scrollHeight;
    }
  }

  pushMessage(message: MessageModel) {
    if (message.type == 'bot' && message.text == this.botThinkingPlaceholder)
      this.waitingForResponse = true

    if (message.type == 'bot' && message.text != this.botThinkingPlaceholder) {

      for (let m of this.messages) {
        if (m.type == 'bot' && m.text == this.botThinkingPlaceholder) {
          m.text = message.text
          this.waitingForResponse = false
          return
        }
      }
    }

    this.messages.push(message);

    localStorage.setItem('messages', JSON.stringify(this.messages));
  }

  toggleChat() {
    this.isChatVisible = !this.isChatVisible;

    if (this.isChatVisible && !this.greeted) {
      this.pushMessage({
        type: 'bot',
        text: 'Zdravo! Kako mogu da ti pomognem?'
      });
      this.greeted = true;
    }
  }

  sendMessage() {
    if (this.waitingForResponse) return;

    if (this.userMessage.trim()) {
      const trimmedInput = this.userMessage;
      this.userMessage = '';

      this.pushMessage({ type: 'user', text: trimmedInput });
      this.pushMessage({ type: 'bot', text: this.botThinkingPlaceholder });

      this.webService.sendRasaMessage(trimmedInput).subscribe(
        (rsp: RasaModel[]) => {
          console.log('Rasa response:', rsp);

          if (rsp.length === 0) {
            this.pushMessage({
              type: 'bot',
              text: 'Sorry I did not understand your question.'
            });
            return;
          }

          rsp.map(msg => {
            if (msg.image) {
              return `<img src="${msg.image}" width="200">`;
            }
            if (msg.attachment) {
              let html = '';
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
          }).forEach(msg => {
            this.pushMessage({
              type: 'bot',
              text: msg!
            });
          });


          rsp.forEach(msg => {
            if (msg.text) {
              const regex = /Ljubimac sa ID (\d+) je dodat u tvoju korpu\./;
              const match = msg.text.match(regex);

              if (match) {
                const petId = parseInt(match[1]);
                console.log('Prepoznat ID iz poruke:', petId);

                this.webService.getPetById(petId).subscribe(pet => {
                  if (pet) {
                    this.cartService.addToCart(pet);
                    console.log(`Ljubimac sa ID ${petId} dodat u CartService.`);
                  } else {
                    console.warn(`Ljubimac sa ID ${petId} nije pronađen.`);
                  }
                });
              }
            }
          });
        },
        (err: HttpErrorResponse) => {
          console.log('Rasa error:', err);
          this.pushMessage({
            type: 'bot',
            text: 'Sorry, I am not available at the moment.'
          });
        }
      );
    }
  }

}

