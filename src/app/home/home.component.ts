import { Component, OnInit } from '@angular/core';
import { CredentialsService } from '@app/auth';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  quote: string | undefined;
  isLoading = false;
  userType: string | 'admin' | 'company';
  collection: AngularFirestoreCollection;
  subscription: Subscription;
  companies: any[];

  constructor(private credentialsService: CredentialsService, private afs: AngularFirestore) {
    this.userType = this.credentialsService.credentials.type;
  }

  ngOnInit() {
    if (this.userType === 'company') {
      this.getMyCompanies();
    }
  }

  getMyCompanies() {
    this.collection = this.afs.collection('companies', (ref) =>
      ref.where('user', '==', this.credentialsService.credentials.uid).orderBy('nameStr', 'asc')
    );
    this.subscription = this.collection.snapshotChanges().subscribe((snap) => {
      this.companies = snap.map((element) => {
        const data: any = element.payload.doc.data();
        const id: string = element.payload.doc.id;
        return { id, ...data };
      });
    });
  }
}
