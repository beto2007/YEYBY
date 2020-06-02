import { Component, OnInit } from '@angular/core';
import { CredentialsService } from '@app/auth';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  quote: string | undefined;
  isLoading = false;
  isAdmin: boolean = false;

  constructor(private credentialsService: CredentialsService) {
    this.isAdmin =
      this.credentialsService &&
      this.credentialsService.credentials &&
      this.credentialsService.credentials.type &&
      this.credentialsService.credentials.type === 'admin'
        ? true
        : false;
  }

  ngOnInit() {}
}
