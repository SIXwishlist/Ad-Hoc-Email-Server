import {Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {Subscription} from "rxjs/Subscription";
import {ApiService} from "../api.service";
import {Observable} from "rxjs/Observable";
import {EmailInfo} from "../model/email-info-model";
import {EmailDetails} from "../model/email-details-model";

enum SortBy {
  Timestamp, Sender, Subject
}

@Component({
  selector: 'app-account-view-page',
  templateUrl: './account-view-page.component.html',
  styleUrls: ['./account-view-page.component.css']
})


export class AccountViewPageComponent implements OnInit, OnDestroy {

  paramsSub: Subscription;
  account: string;
  emails: Array<EmailInfo>;
  selectedEmail: EmailInfo;
  readEmails: Array<string> = [];
  @Output() onAccountDetermined: EventEmitter<string> = new EventEmitter();


  constructor(private apiService: ApiService, private route: ActivatedRoute) {

  }

  ngOnInit() {
    this.paramsSub = this.route.params.subscribe(params => {
      this.account = params['account'];
      this.onAccountDetermined.emit(this.account);
      this.getAccountEmails();
    });
  }

  ngOnDestroy(): void {
    this.paramsSub.unsubscribe();
  }

  getAccountEmails(): any{
    this.readEmails = JSON.parse(localStorage.getItem(this.account + '_readEmails'));
    this.apiService.listAccountsEmails(this.account).subscribe(emails => {
      this.emails = emails;
      this.sortEmails(SortBy.Timestamp, true);
    });
  }

  selectEmail(clickedEmail:EmailInfo) {
    if(clickedEmail) {
      this.selectedEmail = clickedEmail;
      this.readEmails.push(clickedEmail.timestamp);
      localStorage.setItem(this.account + '_readEmails', JSON.stringify(this.readEmails));
      for(let e of this.emails) {
        e.timestamp == this.selectedEmail.timestamp ? e.isSelected = true : e.isSelected = false;
      }

    }
  }

  sortEmails(sortBy: SortBy, reverse: boolean) {

    this.emails.sort((a,b) => {
      if(reverse)
        return Number(b.timestamp) - Number(a.timestamp);
      return Number(a.timestamp) - Number(b.timestamp);
      });
  }

  deleteFile() {
    this.apiService.deleteEmail(this.account, this.selectedEmail.timestamp).subscribe(
      result => {
        this.getAccountEmails();
        this.selectedEmail = null;
      },
      err => {
        console.log('error!!!!', err); //TODO popup message
      }
    );
  }

}
